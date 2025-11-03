// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/util/Deferred",
    "sap/base/util/ObjectPath",
    "sap/base/Log",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/appIntegration/PostMessagePluginInterface",
    "sap/ushell/utils"
], (
    Deferred,
    ObjectPath,
    Log,
    jQuery,
    PostMessagePluginInterface,
    ushellUtils
) => {
    "use strict";

    const CURR_OBJ_ID = "sap.ushell.appRuntime.ui5.AppCommunicationMgr";

    const oPostMessageRequestHandler = {};
    const arrPostResultPromises = [];
    let iPostIDCount = 0;

    function AppCommunicationMgr () {
        this.init = async function (bInitIframeValidMsg) {
            this._fnHandleMessageEvent = this._handleMessageEvent.bind(this);
            addEventListener("message", this._fnHandleMessageEvent);

            if (bInitIframeValidMsg === true) {
                this._sendMessageToOuterShell("sap.ushell.appRuntime.iframeIsValid");
                setInterval(() => {
                    this._sendMessageToOuterShell("sap.ushell.appRuntime.iframeIsValid");
                }, 2500);
            }

            PostMessagePluginInterface.init(
                this._sendMessageToOuterShell.bind(this),
                this.setRequestHandler.bind(this),
                () => {}, // fnSetDistributionPolicy
                false // bRunsInOuterShell
            );
        };

        this.destroy = function () {
            removeEventListener("message", this._fnHandleMessageEvent);
        };

        this.setRequestHandler = function (sServiceRequest, fnHandler) {
            if (oPostMessageRequestHandler[sServiceRequest]) {
                Log.error(`Request handler for service ${sServiceRequest} is already defined. Overwriting the existing handler.`);
            }

            oPostMessageRequestHandler[sServiceRequest] = {
                handler: fnHandler
            };
        };

        this._handleMessageResponse = function (oMessageData) {
            if (oMessageData.request_id && arrPostResultPromises[oMessageData.request_id]) {
                const oResPromise = arrPostResultPromises[oMessageData.request_id];
                delete arrPostResultPromises[oMessageData.request_id];
                if (oMessageData.status === "success") {
                    oResPromise.resolve(oMessageData.body.result);
                } else {
                    let oError;
                    if (oMessageData?.body?.message) {
                        oError = new Error(oMessageData.body.message);
                    } else {
                        oError = new Error("Unknown error");
                    }

                    if (oMessageData?.body?.stack) {
                        oError.stack = oMessageData.body.stack;
                    }

                    oResPromise.reject(oError);
                }
            }
        };

        this._handleMessageRequest = async function (oMessageEvent, oMessageData) {
            const oPostMessageServiceConfig = ObjectPath.create("sap-ushell-config.services.PostMessage.config");
            let sService = oMessageData && oMessageData.service;
            let arrServiceNameParts;
            let sServiceName;
            let sServiceAction;

            Log.debug(`App Runtime received post message request from origin '${oMessageEvent.origin}': ${
                JSON.stringify(oMessageData)}`,
            null,
            CURR_OBJ_ID);

            if (!sService) {
                return;
            }

            if (oPostMessageServiceConfig && oPostMessageServiceConfig.enabled === false) {
                Log.warning(`App Runtime received message for ${sServiceName}, but this ` +
                    "feature is disabled. It can be enabled via launchpad configuration " +
                    "property 'services.PostMessage.config.enabled: true'",
                undefined,
                CURR_OBJ_ID);
                return;
            }

            if (!this._isTrustedPostMessageSource(oMessageEvent)) {
                Log.warning(`App Runtime received message from untrusted origin '${oMessageEvent.origin}': ${
                    JSON.stringify(oMessageEvent.data)}`,
                null,
                CURR_OBJ_ID);
                return;
            }

            if (sService === "sap.ushell.services.MessageBroker") {
                sService = sService.concat("._execute");
            }

            if (sService.indexOf(".") > 0) {
                arrServiceNameParts = sService.split(".");
                sServiceAction = arrServiceNameParts[arrServiceNameParts.length - 1];
                sServiceName = sService.substr(0, sService.length - sServiceAction.length - 1);
            } else {
                Log.warning(`App Runtime received message with invalid service name (${sService}) :${
                    JSON.stringify(oMessageEvent.data)}`,
                null,
                CURR_OBJ_ID);
                return;
            }

            try {
                const oRequestHandler = oPostMessageRequestHandler[`${sServiceName}.${sServiceAction}`];
                if (!oRequestHandler || !oRequestHandler.handler) {
                    Log.warning(
                        `App Runtime received message with unknown service name (${oMessageData.service}) :${JSON.stringify(oMessageEvent.data)}`,
                        null,
                        CURR_OBJ_ID
                    );
                    return;
                }

                try {
                    await ushellUtils.promisify(oRequestHandler.handler(oMessageData.body || {}, oMessageEvent))
                        .then((oResult) => {
                            // eslint-disable-next-line no-unneeded-ternary
                            const bNoPostmessageResponse = (oResult && oResult.hasOwnProperty("_noresponse_") ? true : false);
                            if (!bNoPostmessageResponse) {
                                this.sendResponseMessage(oMessageEvent, oMessageData, "success", { result: oResult });
                            }
                        });
                } catch (oError) {
                    let sStack;
                    let sMessage = oError.toString();
                    if (oError instanceof Error) {
                        sMessage = oError.message;
                        sStack = oError.stack;
                    }
                    this.sendResponseMessage(oMessageEvent, oMessageData, "error", { message: sMessage, stack: sStack });
                }
            } catch (oError) {
                Log.warning(
                    `Error in processing message: ${oError.message}) :${JSON.stringify(oMessageEvent.data)}`,
                    null,
                    CURR_OBJ_ID
                );
            }
        };

        this._getCFLPWindow = function () {
            return window.parent;
        };

        /**
         * Determine if the source of a received postMessage can be considered as trusted. We consider
         * the content window of the application container's iframe as trusted
         *
         * @param {object} oMessage
         *   the postMessage event object
         * @returns {boolean}
         *   true if source is considered to be trustworthy
         * @private
         */
        this._isTrustedPostMessageSource = function (oMessage) {
            let bTrusted = false;
            const oParent = this._getCFLPWindow();

            if (oParent) {
                bTrusted = (oMessage.source === oParent);
            }

            return bTrusted;
        };

        this.sendResponseMessage = function (oMessage, oMessageData, sStatus, oBody) {
            const sResponseData = JSON.stringify({
                type: "response",
                service: oMessageData.service,
                request_id: oMessageData.request_id,
                status: sStatus,
                body: oBody
            });

            Log.debug(`Sending post message response to origin ' ${oMessage.origin}': ${
                sResponseData}`,
            null,
            CURR_OBJ_ID);

            if (typeof oMessage.source !== "object" || oMessage.source === null) {
                Log.debug(`Cannot send response message to origin ' ${oMessage.origin}`,
                    "`source` member of request message is not an object",
                    CURR_OBJ_ID);

                return;
            }

            oMessage.source.postMessage(sResponseData, oMessage.origin);
        };

        this._getTargetWindow = function () {
            return window.parent;
        };

        this.postMessage = function (oMessage) {
            let msg;
            const target = this._getTargetWindow();

            if (oMessage) {
                try {
                    if (oMessage.type === "request" && !oMessage.request_id) {
                        oMessage.request_id = this.getId();
                    }
                    msg = JSON.stringify(oMessage);
                    target.postMessage(msg, "*");
                } catch (oError) {
                    Log.error(
                        `Message '${oMessage}' cannot be posted:`,
                        oError,
                        "sap.ui5Isolation.AppCommunicationMgr"
                    );
                }
            }
        };

        this._sendMessageToOuterShell = function (sServiceRequest, oBody, sRequestId, nTimeout, oDefaultVal) {
            const oDeferred = new Deferred();
            const oMsg = {
                type: "request",
                service: sServiceRequest,
                body: (oBody || {}),
                request_id: sRequestId
            };

            this.postMessage(oMsg);
            arrPostResultPromises[oMsg.request_id] = oDeferred;
            if (nTimeout) {
                setTimeout(() => {
                    oDeferred.resolve(oDefaultVal);
                }, nTimeout);
            }
            return oDeferred.promise;
        };

        /**
         * Sends a message to the outer shell.
         * @param {string} sServiceRequest the service to send the message for.
         * @param {object} oBody parameter object.
         * @param {string} sRequestId the request id.
         * @param {int} nTimeout the timeout.
         * @param {object} oDefaultVal the default value.
         * @returns {jQuery.Promise<any>} Resolves with the response from the outer shell.
         *
         * @private
         * @deprecated since 1.120
         */
        this.sendMessageToOuterShell = function (sServiceRequest, oBody, sRequestId, nTimeout, oDefaultVal) {
            const oDeferred = new jQuery.Deferred();
            this._sendMessageToOuterShell(sServiceRequest, oBody, sRequestId, nTimeout, oDefaultVal)
                .then(oDeferred.resolve.bind(oDeferred))
                .catch(oDeferred.reject.bind(oDeferred));
            return oDeferred.promise();
        };

        // for 2.0 - returns native Promise
        this.postMessageToFLP = function (sServiceRequest, oBody, sRequestId, nTimeout, oDefaultVal) {
            return this._sendMessageToOuterShell(sServiceRequest, oBody, sRequestId, nTimeout, oDefaultVal);
        };

        this.getId = function () {
            return `SAPUI5_APPRUNTIME_MSGID_${++iPostIDCount}`;
        };
    }

    AppCommunicationMgr.prototype._handleMessageEvent = function (oMessageEvent) {
        if (!oMessageEvent && !oMessageEvent?.data) {
            return;
        }

        let oMessageData = oMessageEvent.data;

        if (typeof oMessageData === "string") {
            // it's possible that the data attribute is passed as string (IE9)
            try {
                oMessageData = JSON.parse(oMessageEvent.data, this);
            } catch (oError) {
                // could be some message which is not meant for us, so we just log with debug level
                Log.debug(
                    `Message received from origin '${oMessageEvent.origin}' cannot be parsed:`,
                    oError,
                    CURR_OBJ_ID
                );
                return;
            }
        }

        if (oMessageData.type === "request") {
            return this._handleMessageRequest(oMessageEvent, oMessageData);
        } else if (oMessageData.type === "response") {
            return this._handleMessageResponse(oMessageData);
        }
    };

    return new AppCommunicationMgr();
});
