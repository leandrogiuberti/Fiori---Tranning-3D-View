// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/util/deepEqual",
    "sap/ui/thirdparty/jquery",
    "sap/ui/base/Object",
    "sap/ushell/utils"
], (
    deepEqual,
    jQuery,
    BaseObject,
    ushellUtils
) => {
    "use strict";

    const USER_API_PREFIX = "user.postapi.";

    /**
     * @typedef {string} ServiceName The name of the service.
     * All service names must start with 'user.postapi.'.
     * Only SAP internal APIs are exempt from this rule.
     */

    /**
     * @typedef {string} ServiceInterface The interface of the service.
     * The interface is used to identify the specific functionality within the service.
     */

    /**
     * @typedef {object} OutCallDefinition Defines the outgoing call interface.
     * Needs to be defined otherwise those post messages might not be sent to applications.
     * @property {boolean} [isActiveOnly=true]
     * If true, the post message is sent to the current application. Any other inactive applications are ignored then.
     * @property {string[]} [distributionType=["all"]]
     * The distribution type of the post message.
     * The value "all" is transformed to <code>ignoreCapabilities=true</code>.
     * Any other value than "all" will cause errors.
     */

    /**
     * @typedef {object} InCallDefinition Defines the incoming call interface.
     * This is the interface that defines the handler in case applications are sending post messages to the plugin.
     * @property {function (): Promise<any>} [executeServiceCallFn]
     * The function to execute the service call.
     */

    /**
     * @typedef {object} ServiceDefinition
     * @property {Object<ServiceInterface, InCallDefinition>} [inCalls] - Contains the interfaces for incoming calls.
     * @property {Object<ServiceInterface, OutCallDefinition>} [outCalls] - Contains the interfaces for outgoing calls.
     */

    /**
     * @typedef {Object<ServiceName, ServiceDefinition>} CommunicationObject
     *
     * @example
     * {
     *   "user.postapi.myService": {
     *     inCalls: {
     *       "myInterface": {
     *         executeServiceCallFn: async function () {
     *           // Implementation of the service call
     *         }
     *       }
     *     },
     *     outCalls: {
     *       "myInterface": {
     *         isActiveOnly: true,
     *         distributionType: ["all"] // obsolete, should not be set
     *       }
     *     }
     *   }
     */

    /**
     * @alias sap.ushell.appIntegration.PostMessagePluginInterface
     * @class
     * @classdesc This class provides an interface independent of the runtime environment
     *
     * @private
     */
    const PostMessagePluginInterface = BaseObject.extend("sap.ushell.appIntegration.PostMessagePluginInterface", {
        metadata: {
            publicMethods: [
                "registerPostMessageAPIs",
                "createPostMessageResult",
                "postMessageToApp", // only available in the outer shell
                "postMessageToFlp" // only available in the inner shell
            ]
        }
    });

    /**
     * Initializes the PostMessagePluginInterface.
     * @param {function (): Promise<any>} fnSendPostMessage The function to send post messages.
     * @param {function (string, function)} fnSetRequestHandler The function to add communication objects.
     * @param {function} fnSetDistributionPolicy The function to set distribution policies.
     * @param {boolean} bRunsInOuterShell Indicates if the interface runs in the outer shell.
     */
    PostMessagePluginInterface.prototype.init = function (fnSendPostMessage, fnSetRequestHandler, fnSetDistributionPolicy, bRunsInOuterShell) {
        this._fnSendPostMessage = fnSendPostMessage;
        this._fnSetRequestHandler = fnSetRequestHandler;
        this._fnSetDistributionPolicy = fnSetDistributionPolicy;
        this._bRunsInOuterShell = bRunsInOuterShell;
    };

    /**
     * Overrides the getInterface method to return the interface object.
     *
     * Depending on the runtime environment, it either provides the postMessageToFlp or postMessageToApp method.
     * @returns {object} - The interface object containing the methods for post message communication.
     */
    PostMessagePluginInterface.prototype.getInterface = function () {
        const oInterface = BaseObject.prototype.getInterface.call(this);

        if (this._bRunsInOuterShell) {
            delete oInterface.postMessageToFlp;
        } else {
            delete oInterface.postMessageToApp;
        }

        return oInterface;
    };

    /**
     * Registers new post message APIs.
     *
     * @param {CommunicationObject} oNewCommunicationObject - The new communication object containing the APIs to register.
     * @param {boolean} [bSAPInternal=false] - If true, the APIs are considered as internal SAP APIs and do not require the prefix 'user.postapi.'.
     * @returns {{ status: string, desc: string }} - The result of the registration. <code>status</code> can be "success" or "error", and <code>desc</code> provides a description of the result.
     */
    PostMessagePluginInterface.prototype.registerPostMessageAPIs = function (oNewCommunicationObject, bSAPInternal = false) {
        const oResult = {
            status: "success",
            desc: ""
        };

        try {
            this._validateCommunicationObject(oNewCommunicationObject, bSAPInternal);

            this._fnAddCommunicationObject(oNewCommunicationObject);
        } catch (oError) {
            oResult.status = "error";
            oResult.desc = oError.message;
        }

        return oResult;
    };

    /**
     * Validates the communication object to ensure it contains the required structure and keys.
     * Throws an error if the validation fails.
     * @param {CommunicationObject} oCommunicationObject - The communication object to validate.
     * @param {boolean} bSAPInternal - Indicates if the APIs are internal SAP APIs.
     *
     * @private
     */
    PostMessagePluginInterface.prototype._validateCommunicationObject = function (oCommunicationObject, bSAPInternal) {
        /* eslint-disable padded-blocks */
        if (oCommunicationObject === undefined || Object.keys(oCommunicationObject).length <= 0) {
            throw new Error("No handler was found to register");
        }

        for (const [sService, oServiceDefinition] of Object.entries(oCommunicationObject)) {
            if (typeof sService !== "string") {
                throw new Error("oPostMessageAPIs should contain only string keys");
            }

            if (!bSAPInternal && !sService.startsWith(USER_API_PREFIX)) {
                throw new Error(`all user custom Message APIs must start with '${USER_API_PREFIX}'`);
            }

            for (const [sType, oTypeDefinition] of Object.entries(oServiceDefinition)) {
                if (!["inCalls", "outCalls"].includes(sType)) {
                    throw new Error("api should contain either 'inCalls' or 'outCalls'");
                }

                for (const [sInterface, oInterfaceDefinition] of Object.entries(oTypeDefinition)) {
                    if (sType === "inCalls") {
                        // executeServiceCallFn is required for inCalls
                        if (typeof oInterfaceDefinition.executeServiceCallFn !== "function") {
                            throw new Error(`executeServiceCallFn for '${sService}.${sInterface}' must be a function`);
                        }

                    } else if (sType === "outCalls") {
                        // distributionType should not be used at all
                        if (Object.hasOwn(oInterfaceDefinition, "distributionType")) {
                            if (!Array.isArray(oInterfaceDefinition.distributionType)) {
                                throw new Error(`distributionType for '${sService}.${sInterface}' must be an array. Remove it from the definition to apply the default.`);
                            }
                            if (!deepEqual(oInterfaceDefinition.distributionType, ["all"])) {
                                throw new Error(`distributionType for '${sService}.${sInterface}' must be 'all'. Remove it from the definition to apply the default.`);
                            }
                        }
                    }
                }
            }
        }
        /* eslint-enable padded-blocks */
    };

    /**
     * Adds a communication object to the plugin interface.
     * @param {CommunicationObject} oCommunicationObject - The communication object to add.
     *
     * @private
     */
    PostMessagePluginInterface.prototype._fnAddCommunicationObject = function (oCommunicationObject) {
        /* eslint-disable padded-blocks */
        for (const [sService, oServiceDefinition] of Object.entries(oCommunicationObject)) {
            for (const [sType, oTypeDefinition] of Object.entries(oServiceDefinition)) {
                for (const [sInterface, oInterfaceDefinition] of Object.entries(oTypeDefinition)) {
                    if (sType === "inCalls") {
                        this._fnSetRequestHandler(
                            `${sService}.${sInterface}`,
                            async (oMessageBody, oMessageEvent) => {
                                const oServiceParams = {
                                    oMessageData: JSON.parse(oMessageEvent.data),
                                    oMessage: oMessageEvent
                                };

                                return ushellUtils.promisify(oInterfaceDefinition.executeServiceCallFn(oServiceParams));
                            }
                        );

                    } else if (sType === "outCalls") {
                        // Defaults
                        const oDistributionPolicy = {
                            ignoreCapabilities: true,
                            onlyCurrentApplication: true
                        };

                        if (Object.hasOwn(oInterfaceDefinition, "isActiveOnly")) {
                            oDistributionPolicy.onlyCurrentApplication = !!oInterfaceDefinition.isActiveOnly;
                        }

                        this._fnSetDistributionPolicy(
                            `${sService}.${sInterface}`,
                            oDistributionPolicy
                        );
                    }
                }
            }
        }
        /* eslint-enable padded-blocks */
    };

    /**
     * Posts a message to the application.
     * @param {string} sServiceName - The name of the service.
     * @param {string} sInterface - The interface to call.
     * @param {any} oBody - The parameters to pass to the interface.
     * @returns {jQuery.Promise} - A promise that resolves with the result of the post message.
     */
    PostMessagePluginInterface.prototype.postMessageToApp = function (sServiceName, sInterface, oBody) {
        const oDeferred = new jQuery.Deferred();

        this._fnSendPostMessage(`${sServiceName}.${sInterface}`, oBody)
            .then((oResult) => {
                oDeferred.resolve(oResult);
            })
            .catch((oError) => {
                oDeferred.reject(oError);
            });

        return oDeferred.promise();
    };

    /**
     * Posts a message to the FLP.
     * @param {string} sServiceName - The name of the service.
     * @param {string} sInterface - The interface to call.
     * @param {any} oBody - The parameters to pass to the interface.
     * @returns {jQuery.Promise} - A promise that resolves with the result of the post message.
     */
    PostMessagePluginInterface.prototype.postMessageToFlp = function (sServiceName, sInterface, oBody) {
        const oDeferred = new jQuery.Deferred();

        this._fnSendPostMessage(`${sServiceName}.${sInterface}`, oBody)
            .then((oResult) => {
                oDeferred.resolve(oResult);
            })
            .catch((oError) => {
                oDeferred.reject(oError);
            });

        return oDeferred.promise();
    };

    /**
     * Sanitizes the result for the post message response.
     * @param {any} [oResult] - The result object.
     * @returns {jQuery.Promise} - A promise that resolves with the result object.
     */
    PostMessagePluginInterface.prototype.createPostMessageResult = function (oResult = {}) {
        return new jQuery.Deferred().resolve(oResult).promise();
    };

    return new PostMessagePluginInterface();
});
