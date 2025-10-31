// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @file This file contains the PostMessageManager class.
 * It handles the postMessage communication between the applications and the framework.
 */
sap.ui.define([
    "sap/base/Log",
    "sap/base/util/Deferred",
    "sap/base/util/isPlainObject",
    "sap/base/util/ObjectPath",
    "sap/base/util/uid"
], (
    Log,
    Deferred,
    isPlainObject,
    ObjectPath,
    uid
) => {
    "use strict";

    /**
     * @typedef {PostMessageRequest|PostMessageResponse} ParsedMessage
     */

    /**
     * @typedef {object} PostMessageRequest
     * @property {string} type the type of the message
     * @property {string} request_id the request id
     * @property {string} service the service name
     * @property {object} body the message body
     *
     * @since 1.134.0
     * @private
     */

    /**
     * @typedef {object} PostMessageResponse
     * @property {string} type the type of the message
     * @property {string} request_id the request id
     * @property {string} service the service name
     * @property {string} status the status of the response
     * @property {object} body the message body
     *
     * @since 1.134.0
     * @private
     */

    /**
     * @typedef {object} RequestHandlerOptions
     * @property {boolean} [provideApplicationContext=false] flag to indicate if the application context should be used.
     * @property {boolean} [allowInactive=false] flag to indicate if the request should be allowed from inactive applications.
     * @property {function(MessageEvent):Promise<boolean>} [isValidRequest] an async function to validate the request
     *
     * @see {@link sap.ushell.appIntegration.PostMessageManager#setRequestHandler}
     *
     * @since 1.134.0
     * @private
     */

    const oDefaultRequestHandlerOptions = {
        provideApplicationContext: false,
        allowInactive: false
    };

    /**
     * @typedef {object} DistributionPolicy
     * @property {boolean} [preventBroadcast=false] flag to indicate if the message should not be sent to all applications
     * @property {boolean} [onlyCurrentApplication=false] flag to indicate if the message should be sent only to the current application
     * @property {boolean} [ignoreCapabilities=false] flag to indicate if the capabilities should be ignored
     * @property {function(sap.ushell.appIntegration.ApplicationContainer):boolean} [isValidRequestTarget] a function to validate the request target
     *
     * @see {@link sap.ushell.appIntegration.PostMessageManager#setDistributionPolicy}
     * @see {@link sap.ushell.appIntegration.PostMessageManager#sendRequestToAllApplications}
     *
     * @since 1.134.0
     * @private
     */

    const oDefaultDistributionPolicy = {
        preventBroadcast: false,
        onlyCurrentApplication: false,
        ignoreCapabilities: false
    };

    /**
     * @typedef {object} PreprocessingResult
     * @property {MessageEvent} event the preprocessed message event
     * @property {ParsedMessage} message the preprocessed message
     */

    const DoNotReply = Symbol("DoNotReply");
    const oLogger = Log.getLogger("sap.ushell.appIntegration.PostMessageManager");

    /**
     * @alias sap.ushell.appIntegration.PostMessageManager
     * @namespace
     * @classdesc This class is used to manage postMessage communication between the applications and the framework.
     *
     * @since 1.134.0
     * @private
     */
    class PostMessageManager {
        #fnPostMessageEventHandler = () => {
            throw new Error("PostMessageManager is not initialized");
        };
        #fnGetCurrentApplication = () => {
            throw new Error("PostMessageManager is not initialized");
        };
        #fnGetAllApplications = () => {
            throw new Error("PostMessageManager is not initialized");
        };

        #bInitialized = false;
        #bDisabled = false;

        #aEventPreprocessor = [];
        #aResponseHandlers = [];
        #oRequestHandlers = {};
        #oDistributionPolicies = {};

        // Plugins might add more handlers. Therefore, we need to keep track of them.
        #bKeepMessagesForLaterProcessing = true;
        #aUnprocessedMessages = [];

        // Expose enums
        BuiltInResponses = {
            DoNotReply
        };

        init (oOptions = {}) {
            if (this.#bInitialized) {
                throw new Error("PostMessageManager is already initialized.");
            }

            const oConfig = ObjectPath.get("sap-ushell-config.services.PostMessage.config") || {};

            if (oConfig.enabled === false) {
                this.#bDisabled = true;
                this.#bInitialized = true;
                oLogger.warning("PostMessageAPI is disabled by configuration.");
                return;
            }

            const fnGetCurrentApplication = oOptions.getCurrentApplication || function () {};
            this.#fnGetCurrentApplication = fnGetCurrentApplication;

            const fnGetAllApplications = oOptions.getAllApplications || function () { return []; };
            this.#fnGetAllApplications = fnGetAllApplications;

            if (oOptions.skipReplay) {
                this.#bKeepMessagesForLaterProcessing = false;
            }

            this.#fnPostMessageEventHandler = this.#handlePostMessageEvent.bind(this);
            addEventListener("message", this.#fnPostMessageEventHandler);
            this.#bInitialized = true;
        }

        /**
         * Handles the postMessage event.
         *  - Parses the message from the event.
         *  - Preprocesses the event and message.
         *  - Run checks
         *  - actual message handling (response, request)
         * @param {MessageEvent} oMessageEvent The incoming message event.
         * @returns {Promise} A promise that resolves when the message is handled.
         *
         * @since 1.134.0
         * @private
         */
        async #handlePostMessageEvent (oMessageEvent) {
            let oMessage;
            try {
                oMessage = this.#parseMessage(oMessageEvent);
            } catch {
                oLogger.debug("Received Post Message with invalid JSON. Ignoring the message.", oMessageEvent.data);
                return;
            }

            const oPreprocessingResult = this.#preprocessMessageEvent(oMessageEvent, oMessage);
            oMessageEvent = oPreprocessingResult.event;
            oMessage = oPreprocessingResult.message;

            if (!oMessage.service) {
                oLogger.debug("Received Post Message without a service name. Ignoring the message.");
                return;
            }

            if (!["response", "request"].includes(oMessage.type)) {
                oLogger.warning(`Received Post Message with an invalid type: '${oMessage.type}'. Ignoring the message.`);
                return;
            }

            const oSourceWindow = oMessageEvent.source;
            const sSourceDomain = oMessageEvent.origin;
            oLogger.debug(`Received postMessage ${oMessage.service} (${oMessage.request_id}) from iframe with domain '${sSourceDomain}'`, JSON.stringify(oMessage, null, 2));

            if (!oMessage.request_id) {
                oLogger.debug("Received Post Message without a request_id. Message might be not handled correctly.");
            }

            // first check if the message is a response to a request
            if (oMessage.type === "response") {
                const bWasHandled = this.#handleResponseHandlers(oMessageEvent, oMessage);
                if (bWasHandled) {
                    oLogger.debug(`Response for ${oMessage.service} (${oMessage.request_id}) was handled by a response handler.`);
                }
                return;
            }

            // Handle the message as Request

            // Initialize the body. It can be undefined which is unexpected for the service request handlers.
            oMessage.body = oMessage.body || {};

            let oResponseMessageBody;
            let bSuccess = true;
            try {
                const vResult = await this.#handleServiceRequests(oMessage, oSourceWindow, sSourceDomain, oMessageEvent);
                oLogger.debug(`Service request for ${oMessage.service} (${oMessage.request_id}) was handled successfully.`);

                if (vResult === DoNotReply) {
                    oLogger.debug(`Service request for ${oMessage.service} (${oMessage.request_id}) was handled successfully, but no response is needed.`);
                    return;
                }

                oResponseMessageBody = { result: vResult };
            } catch (oError) {
                bSuccess = false;
                oLogger.error(`Service request for ${oMessage.service} (${oMessage.request_id}) failed.`, oError);
                // some services reject with a string instead of an Error object
                let sStack;
                let sMessage = oError.toString();
                if (oError instanceof Error) {
                    sMessage = oError.message;
                    sStack = oError.stack;
                }

                oResponseMessageBody = {
                    message: sMessage,
                    stack: sStack
                };
            }

            // always reply with the original service request
            const sServiceRequest = oMessage.originalMessage?.service || oMessage.service;

            return this.sendResponse(
                oMessage.request_id,
                sServiceRequest,
                oResponseMessageBody,
                bSuccess,
                oSourceWindow,
                sSourceDomain
            );
        }

        /**
         * Parses the message from the postMessage event.
         * @param {MessageEvent} oMessageEvent The incoming message event.
         * @returns {PostMessageResponse|PostMessageRequest} The parsed message from the postMessage event.
         *
         * @since 1.139.0
         * @private
         */
        #parseMessage (oMessageEvent) {
            let oMessage;
            // we support stringified JSON and plain objects
            if (typeof oMessageEvent.data === "string") {
                oMessage = JSON.parse(oMessageEvent.data);
            } else if (isPlainObject(oMessageEvent.data)) {
                oMessage = oMessageEvent.data;
            } else {
                // e.g. Error, transferable objects, ...
                throw new Error("Invalid message format");
            }

            return oMessage;
        }

        /**
         * Helper function for PostMessage handler which want to send a custom formatted response.
         * @param {MessageEvent} oMessageEvent The incoming message event.
         * @returns {string} The request id from the message event.
         *
         * @since 1.140.0
         * @private
         */
        getRequestId (oMessageEvent) {
            try {
                const oMessage = this.#parseMessage(oMessageEvent);
                return oMessage.request_id;
            } catch { /* fail silently */ }
        }

        /**
         * Preprocesses the message event and message.
         * The preprocessing might change the event.
         * However, a message is only changed once.
         *
         * @param {MessageEvent} oMessageEvent The incoming message event.
         * @param {ParsedMessage} oMessage The parsed message from the postMessage event.
         * @returns {{ event: MessageEvent, message: ParsedMessage }} The preprocessed message event and message.
         *
         * @since 1.134.0
         * @private
         */
        #preprocessMessageEvent (oMessageEvent, oMessage) {
            // Event properties are read-only, so we need to create a new event object if we want to change them.
            let oProcessingResult;
            this.#aEventPreprocessor.forEach((fnProcessor) => {
                if (oProcessingResult) {
                    return;
                }

                oProcessingResult = fnProcessor(oMessageEvent, oMessage);
            });

            return {
                event: oProcessingResult?.event || oMessageEvent,
                message: oProcessingResult?.message || oMessage
            };
        }

        /**
         * Handles the response handlers for the postMessage event.
         * @param {MessageEvent} oMessageEvent The incoming message event.
         * @param {PostMessageResponse} oMessage The parsed message from the postMessage event.
         * @returns {boolean} Whether the response was handled by a response handler.
         *
         * @since 1.134.0
         * @private
         */
        #handleResponseHandlers (oMessageEvent, oMessage) {
            let bWasHandled = false;
            this.#aResponseHandlers.forEach((fnResponseHandler) => {
                if (bWasHandled) {
                    return;
                }

                bWasHandled = fnResponseHandler(oMessageEvent, oMessage);
            });

            return bWasHandled;
        }

        /**
         * Handles the service requests.
         * Tries to apply the RequestHandlerOptions before calling the handler.
         * Calls the handler with the expected context and returns the result.
         *
         * @param {PostMessageRequest} oMessage The parsed message from the postMessage event.
         * @param {Window} oSourceWindow The source window of the postMessage event.
         * @param {string} sSourceDomain The origin of the postMessage event.
         * @param {MessageEvent} oMessageEvent The incoming message event.
         * @returns {Promise<any>} Resolves with the result of the service request handler.
         *
         * @since 1.134.0
         * @private
         */
        async #handleServiceRequests (oMessage, oSourceWindow, sSourceDomain, oMessageEvent) {
            const sServiceRequest = oMessage.service;
            const fnServiceRequestHandler = this.#getServiceRequestHandler(sServiceRequest);

            if (!fnServiceRequestHandler) {
                if (this.#bKeepMessagesForLaterProcessing) {
                    this.#aUnprocessedMessages.push(oMessageEvent);
                    return DoNotReply; // event will be answered later
                }
                await this.sendResponse(
                    oMessage.request_id,
                    sServiceRequest,
                    {
                        code: -1,
                        message: `Unknown service name: '${sServiceRequest}'`
                    },
                    false, // bSuccess
                    oSourceWindow,
                    sSourceDomain
                );
                return DoNotReply;
            }

            const oRequestHandlerOptions = this.#getServiceRequestHandlerOptions(sServiceRequest);
            if (typeof oRequestHandlerOptions?.isValidRequest === "function") {
                const bIsValidRequest = await oRequestHandlerOptions.isValidRequest(oMessageEvent);
                if (!bIsValidRequest) {
                    throw new Error(`Invalid request for service ${sServiceRequest}.`);
                }
            }

            if (oRequestHandlerOptions.provideApplicationContext) {
                const oApplicationContainer = this.#getApplicationContainerContext(oSourceWindow);
                if (!oApplicationContainer) {
                    throw new Error("Cannot find the related application for the service request.");
                }

                if (!oApplicationContainer.getActive() && !oRequestHandlerOptions?.allowInactive) {
                    throw new Error("Received Post Message from an inactive application.");
                }

                if (!oApplicationContainer.isTrustedPostMessageSource(oMessageEvent)) {
                    throw new Error("Received Post Message from an untrusted source.");
                }

                oLogger.debug(`Handling service request for ${sServiceRequest} (${oMessage.request_id}) with application context ${oApplicationContainer.getId()}.`);

                return fnServiceRequestHandler(oMessage.body, oApplicationContainer, oMessageEvent);
            }

            oLogger.debug(`Handling service request for ${sServiceRequest} (${oMessage.request_id}) without application context.`);

            return fnServiceRequestHandler(oMessage.body, oMessageEvent);
        }

        /**
         * Returns the request handler for the given service request.
         * @param {string} sServiceRequest The service request name.
         * @returns {function} The request handler function for the given service request.
         *
         * @since 1.134.0
         * @private
         */
        #getServiceRequestHandler (sServiceRequest) {
            return this.#oRequestHandlers[sServiceRequest]?.handler;
        }

        /**
         * Returns the options for the given service request handler.
         * @param {string} sServiceRequest The service request name.
         * @returns {RequestHandlerOptions} The options for the given service request handler.
         *
         * @since 1.134.0
         * @private
         */
        #getServiceRequestHandlerOptions (sServiceRequest) {
            return this.#oRequestHandlers[sServiceRequest]?.options;
        }

        /**
         * Retrieves the application container context for the given source window.
         *  1) tries to match by iframe reference
         *  2) falls back to the current application container
         * @param {Window} oSourceWindow The source window of the postMessage event.
         * @returns {sap.ushell.appIntegration.IframeApplicationContainer} The application container context for the given source window.
         *
         * @since 1.134.0
         * @private
         */
        #getApplicationContainerContext (oSourceWindow) {
            let oApplicationContainer;
            this.#fnGetAllApplications().forEach((oContainer) => {
                if (oApplicationContainer || !oContainer.isA("sap.ushell.appIntegration.IframeApplicationContainer")) {
                    return;
                }

                const oApplicationWindow = oContainer.getPostMessageTarget();
                if (oApplicationWindow === oSourceWindow) {
                    oApplicationContainer = oContainer;
                }
            });

            if (oApplicationContainer) {
                return oApplicationContainer;
            }

            oLogger.error("Cannot find the related application for the service request; using the current application as fallback. This fallback will be removed in future");

            const oCurrentApplicationContainer = this.#fnGetCurrentApplication();
            if (oCurrentApplicationContainer && oCurrentApplicationContainer.isA("sap.ushell.appIntegration.IframeApplicationContainer")) {
                return oCurrentApplicationContainer;
            }
        }

        /**
         * Adds a preprocessor function to the PostMessageManager.
         * Preprocessors are called before the message is handled.
         * They can modify the message event and the message itself and even  try to "fix" the message.
         * @param {function():PreprocessingResult|undefined} fnPreprocessor The preprocessor function.
         *
         * @since 1.134.0
         * @private
         */
        addEventPreprocessor (fnPreprocessor) {
            this.#aEventPreprocessor.push(fnPreprocessor);
        }

        /**
         * Sets a request handler for the given service request.
         * The options are mixed with the default options.
         * If a handler for the service request already exists, it will be overwritten.
         *
         * @param {string} sServiceRequest The service request name.
         * @param {function} fnHandler The handler function for the service request.
         * @param {RequestHandlerOptions} oOptions The options for the service request handler.
         *
         * @since 1.134.0
         * @private
         */
        setRequestHandler (sServiceRequest, fnHandler, oOptions = {}) {
            if (this.#oRequestHandlers[sServiceRequest]) {
                oLogger.error(`Request handler for service ${sServiceRequest} is already defined. Overwriting the existing handler.`);
            }

            this.#oRequestHandlers[sServiceRequest] = {
                handler: fnHandler,
                options: {
                    ...oDefaultRequestHandlerOptions,
                    ...oOptions
                }
            };
        }

        /**
         * Sends a request to the given iframe.
         * Constructs a message based on the provided parameters and sends it as a postMessage event.
         *
         * @param {string} sServiceRequest The service request name.
         * @param {any} oMessageBody The message body to send with the request.
         * @param {Window} oContentWindow The content window to send the request to.
         * @param {string} sTargetOrigin The target origin for the postMessage request.
         * @param {boolean} bWaitForResponse Whether to wait for a response from the service request.
         * @returns {Promise<any>} A promise that resolves with the response from the service request if bWaitForResponse is true, otherwise resolves immediately.
         *
         * @since 1.134.0
         * @private
         */
        async sendRequest (sServiceRequest, oMessageBody, oContentWindow, sTargetOrigin, bWaitForResponse) {
            if (this.#bDisabled) {
                throw new Error("PostMessageAPI is disabled by configuration.");
            }
            if (!this.#bInitialized) {
                throw new Error("PostMessageManager is not initialized.");
            }

            const sRequestId = uid();

            const oMessage = {
                type: "request",
                request_id: sRequestId,
                service: sServiceRequest,
                body: oMessageBody || {}
            };

            return this.#sendMessage(oMessage, oContentWindow, sTargetOrigin, bWaitForResponse);
        }

        /**
         * Sends a response to the given iframe.
         * Constructs a message based on the provided parameters and sends it as a postMessage event.
         *
         * @param {string} sRequestId The request ID of the service request to respond to.
         * @param {string} sServiceRequest The service request name to respond to.
         * @param {any} oMessageBody The message body to send with the response.
         * @param {boolean} bSuccess Whether the response is successful or not.
         * @param {Window} oContentWindow The content window to send the response to.
         * @param {string} sTargetOrigin The target origin for the postMessage response.
         * @returns {Promise} A promise that resolves when the response is sent.
         *
         * @since 1.134.0
         * @private
         */
        async sendResponse (sRequestId, sServiceRequest, oMessageBody, bSuccess, oContentWindow, sTargetOrigin) {
            if (this.#bDisabled) {
                throw new Error("PostMessageAPI is disabled by configuration.");
            }
            if (!this.#bInitialized) {
                throw new Error("PostMessageManager is not initialized.");
            }

            const oMessage = {
                type: "response",
                request_id: sRequestId,
                service: sServiceRequest,
                status: bSuccess ? "success" : "error",
                body: oMessageBody || {}
            };

            return this.#sendMessage(oMessage, oContentWindow, sTargetOrigin, false);
        }

        /**
         * Sends a message to the content window.
         * Adds the bWaitForResponse handling and actually sends the postMessage.
         * @param {ParsedMessage} oMessage The message to send.
         * @param {Window} oContentWindow The content window to send the message to.
         * @param {string} sTargetOrigin The target origin for the postMessage request.
         * @param {boolean} bWaitForResponse Whether to wait for a response from the service request.
         * @returns {Promise<any>} A promise that resolves with the response from the service request if bWaitForResponse is true, otherwise resolves immediately.
         *
         * @since 1.134.0
         * @private
         */
        async #sendMessage (oMessage, oContentWindow, sTargetOrigin, bWaitForResponse) {
            if (!oContentWindow) {
                throw new Error("No content window provided.");
            }

            const sRequestId = oMessage.request_id;

            let oResponsePromise = Promise.resolve();
            if (bWaitForResponse) {
                oLogger.debug(`Waiting for response on ${oMessage.service} (${oMessage.request_id}) from iframe with domain '${sTargetOrigin}'`);
                oResponsePromise = this.#waitForClientResponse(sRequestId, oContentWindow);
            }

            const sMessage = JSON.stringify(oMessage);
            oLogger.debug(`Sending post message on ${oMessage.service} (${oMessage.request_id}) to iframe with domain '${sTargetOrigin}'`, JSON.stringify(oMessage, null, 2));

            oContentWindow.postMessage(sMessage, sTargetOrigin);

            return oResponsePromise;
        }

        /**
         * Waits for a response from the client for the given request ID.
         * Adds a response handler to the list of response handlers.
         * The response handler will be executed when the expected response is received.
         * @param {string} sRequestId The request ID to wait for a response.
         * @param {Window} oExpectedContentWindow The expected content window to receive the response from.
         * @returns {Promise<any>} A promise that resolves with the response from the client.
         *
         * @since 1.134.0
         * @private
         */
        #waitForClientResponse (sRequestId, oExpectedContentWindow) {
            const oDeferred = new Deferred();
            const fnResponseHandler = this.#handleClientResponse.bind(this, oDeferred, sRequestId, oExpectedContentWindow);

            this.#aResponseHandlers.push(fnResponseHandler);

            return oDeferred.promise;
        }

        /**
         * Generic handler for client responses.
         * It is called on every response and has to match the request ID and content window.
         * @param {sap.base.util.Deferred} oDeferred The deferred object to resolve or reject based on the response.
         * @param {string} sRequestId The request ID to match the response against.
         * @param {Window} oExpectedContentWindow The expected content window to receive the response from.
         * @param {MessageEvent} oMessageEvent The incoming message event.
         * @param {PostMessageResponse} oMessage The parsed message from the postMessage event.
         * @returns {boolean} Whether the response was handled successfully.
         *
         * @since 1.134.0
         * @private
         */
        #handleClientResponse (oDeferred, sRequestId, oExpectedContentWindow, oMessageEvent, oMessage) {
            if (oExpectedContentWindow !== oMessageEvent.source) {
                return false;
            }

            // only handle messages that have the expected request_id
            if (oMessage?.request_id !== sRequestId) {
                return false;
            }

            oLogger.debug(`Received response for ${oMessage.service} (${oMessage.request_id}) from iframe with domain '${oMessageEvent.origin}'`);

            if (oMessage.status === "success") {
                oDeferred.resolve(oMessage.body);
            } else {
                let oError;
                if (oMessage.body?.message) {
                    oError = new Error(oMessage.body.message);
                } else {
                    oError = new Error("Unknown error");
                }

                if (oMessage.body?.stack) {
                    oError.stack = oMessage.body.stack;
                }
                oDeferred.reject(oError);
            }

            return true;
        }

        /**
         * Sends a request to the specified application container.
         * Applies the distribution policy for the service request and checks if the application container is a valid target.
         *
         * @param {string} sServiceRequest The service request name to send the request to.
         * @param {any} oMessageBody The message body to send with the request.
         * @param {sap.ushell.appIntegration.IframeApplicationContainer} oApplicationContainer The application container to send the request to.
         * @param {boolean} bWaitForResponse Whether to wait for a response from the service request.
         * @returns {Promise<any>} A promise that resolves with the response from the service request.
         *
         * @since 1.139.0
         * @private
         */
        async sendRequestToApplication (sServiceRequest, oMessageBody, oApplicationContainer, bWaitForResponse) {
            if (this.#bDisabled) {
                throw new Error("PostMessageAPI is disabled by configuration.");
            }
            if (!this.#bInitialized) {
                throw new Error("PostMessageManager is not initialized.");
            }

            const oDistributionPolicy = this.#getDistributionPolicy(sServiceRequest);

            if (oDistributionPolicy.onlyCurrentApplication) {
                const oCurrentApplicationContainer = this.#fnGetCurrentApplication();
                if (oApplicationContainer !== oCurrentApplicationContainer) {
                    throw new Error("Application is not the current application.");
                }
            }

            const bMatchesCapabilities = oDistributionPolicy.ignoreCapabilities || oApplicationContainer.supportsCapabilities([sServiceRequest]);
            if (!bMatchesCapabilities) {
                throw new Error(`Application does not support the service request: ${sServiceRequest}`);
            }

            if (typeof oDistributionPolicy?.isValidRequestTarget === "function") {
                const bIsValidRequestTarget = oDistributionPolicy.isValidRequestTarget(oApplicationContainer);
                if (!bIsValidRequestTarget) {
                    throw new Error("Application is not a valid request target.");
                }
            }

            return this.sendRequest(
                sServiceRequest,
                oMessageBody,
                oApplicationContainer.getPostMessageTarget(),
                oApplicationContainer.getPostMessageTargetOrigin(),
                bWaitForResponse
            );
        }

        /**
         * Sends a request to all applications that match the distribution policy for the given service request.
         *
         * @param {string} sServiceRequest The service request name to send the request to.
         * @param {any} oMessageBody The message body to send with the request.
         * @param {boolean} bWaitForResponse Whether to wait for a response from the service request.
         * @returns {Promise<any[]>} A promise that resolves with an array of responses from the service request.
         *
         * @since 1.134.0
         * @private
         */
        async sendRequestToAllApplications (sServiceRequest, oMessageBody, bWaitForResponse) {
            if (this.#bDisabled) {
                throw new Error("PostMessageAPI is disabled by configuration.");
            }
            if (!this.#bInitialized) {
                throw new Error("PostMessageManager is not initialized.");
            }

            const oDistributionPolicy = this.#getDistributionPolicy(sServiceRequest);

            if (oDistributionPolicy.preventBroadcast) {
                throw new Error(`Cannot send request to all applications for service request: ${sServiceRequest}. The distribution policy prevents broadcasting.`);
            }

            const aRelevantContainers = [];
            if (oDistributionPolicy.onlyCurrentApplication) {
                const oCurrentApplicationContainer = this.#fnGetCurrentApplication();
                if (!oCurrentApplicationContainer) {
                    return []; // might be undefined
                }

                aRelevantContainers.push(oCurrentApplicationContainer);
            } else {
                this.#fnGetAllApplications().forEach((oContainer) => {
                    aRelevantContainers.push(oContainer);
                });
            }

            const aFilteredContainers = aRelevantContainers
                .filter((oContainer) => {
                    if (!oContainer.isA("sap.ushell.appIntegration.IframeApplicationContainer")) {
                        return false;
                    }

                    const bMatchesCapabilities = oDistributionPolicy.ignoreCapabilities || oContainer.supportsCapabilities([sServiceRequest]);
                    if (!bMatchesCapabilities) {
                        return false;
                    }

                    if (typeof oDistributionPolicy?.isValidRequestTarget === "function") {
                        const bIsValidRequestTarget = oDistributionPolicy.isValidRequestTarget(oContainer);
                        return bIsValidRequestTarget;
                    }

                    return true;
                });

            const aPromises = aFilteredContainers.map((oContainer) => {
                return this.sendRequest(
                    sServiceRequest,
                    oMessageBody,
                    oContainer.getPostMessageTarget(),
                    oContainer.getPostMessageTargetOrigin(),
                    bWaitForResponse
                );
            });

            return Promise.allSettled(aPromises).then((aResults) => {
                const aErrors = aResults
                    .filter((oResult) => oResult.status === "rejected")
                    .map((oResult) => oResult.reason);

                if (aErrors.length > 0) {
                    throw new Error(`Some requests failed: ${aErrors.map((oError) => oError.message).join(", ")}`);
                }

                // all requests were successful, return the results
                return aResults.map((oResult) => {
                    return oResult.value;
                });
            });
        }

        /**
         * Returns the distribution policy for the given service request.
         * @param {string} sServiceRequest The service request name to get the distribution policy for.
         * @returns {DistributionPolicy} The distribution policy for the given service request.
         *
         * @since 1.134.0
         * @private
         */
        #getDistributionPolicy (sServiceRequest) {
            return this.#oDistributionPolicies[sServiceRequest] || oDefaultDistributionPolicy;
        }

        /**
         * Sets the distribution policy for the given service request.
         * If a policy for the service request already exists, it will be overwritten.
         * @param {string} sServiceRequest The service request name to set the distribution policy for.
         * @param {DistributionPolicy} oPolicy The distribution policy to set for the service request.
         *
         * @since 1.134.0
         * @private
         */
        setDistributionPolicy (sServiceRequest, oPolicy) {
            if (this.#oDistributionPolicies[sServiceRequest]) {
                oLogger.error(`Distribution policy for service ${sServiceRequest} is already defined. Overwriting the existing policy.`);
            }

            this.#oDistributionPolicies[sServiceRequest] = {
                ...oDefaultDistributionPolicy,
                ...oPolicy
            };
        }

        /**
         * Replays all stored messages that were not processed yet.
         * This is useful for plugins that were added after the messages were received.
         * It will process all messages that were stored while the PostMessageManager was not initialized.
         *
         * @since 1.134.0
         * @private
         */
        replayStoredMessages () {
            this.#bKeepMessagesForLaterProcessing = false;
            this.#aUnprocessedMessages.forEach((oMessageEvent) => {
                this.#handlePostMessageEvent(oMessageEvent);
            });
            this.#aUnprocessedMessages = [];
        }

        /**
         * For testing only
         */
        reset () {
            removeEventListener("message", this.#fnPostMessageEventHandler);
            this.#fnPostMessageEventHandler = () => {
                throw new Error("PostMessageManager is not initialized");
            };
            this.#fnGetCurrentApplication = () => {
                throw new Error("PostMessageManager is not initialized");
            };
            this.#fnGetAllApplications = () => {
                throw new Error("PostMessageManager is not initialized");
            };

            this.#bInitialized = false;
            this.#bDisabled = false;

            this.#aEventPreprocessor = [];
            this.#oRequestHandlers = {};
            this.#aResponseHandlers = [];
            this.#oDistributionPolicies = {};

            this.#bKeepMessagesForLaterProcessing = true;
            this.#aUnprocessedMessages = [];
        }
    }

    return new PostMessageManager();
});
