// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview The app runtime wrapper for {@link sap.ushell.services.MessageBroker}.
 *
 * @version 1.141.1
 */
sap.ui.define([
    "sap/base/Log",
    "sap/ushell/appRuntime/ui5/AppCommunicationMgr",
    "sap/ushell/appRuntime/ui5/services/MessageBroker/Client",
    "sap/ushell/services/MessageBroker/ClientAlias",
    "sap/ushell/utils/CallbackQueue"
], (
    Log,
    AppCommunicationMgr,
    MessageBrokerClient,
    ClientAlias,
    CallbackQueue
) => {
    "use strict";

    /**
     * @alias sap.ushell.appRuntime.ui5.services.MessageBroker
     * @class
     * @classdesc The app runtime wrapper for {@link sap.ushell.services.MessageBroker}.
     *
     * @hideconstructor
     *
     * @private
     */
    function MessageBrokerProxy () {
        this._mClientData = new Map();
        this._oLogger = Log.getLogger("sap.ushell.services.MessageBroker");

        /*
         * We have to track changes in a queue because the underlying communication layer is asynchronous.
         * This ensures that the internal state is always consistent.
         * E.g.
         * When a client is connecting and subscribing and receives messages in the meantime.
         * The sender might be already informed and it should be legit to send a message.
         * But the appruntime wasn't informed yet.
         */
        this.oCallbackQueue = new CallbackQueue();
    }

    MessageBrokerProxy.prototype.connect = async function (sClientId, fnClientConnectionCallback) {
        return this.oCallbackQueue.push(async () => {
            if (typeof sClientId !== "string" || !sClientId.length) {
                throw new Error("Cannot connect client: Missing required parameter client id");
            }

            if (typeof fnClientConnectionCallback !== "function") {
                this._oLogger.error(`Missing required parameter 'fnClientConnectionCallback' for client '${sClientId}'! It has to be provided as part of the connect() call`);
            }

            const oClient = new MessageBrokerClient(sClientId);
            oClient.setClientConnectionCallback(fnClientConnectionCallback);

            await AppCommunicationMgr.postMessageToFLP("sap.ushell.services.MessageBroker", {
                channelId: "sap.ushell.MessageBroker",
                clientId: sClientId,
                messageName: "connect"
            });

            this._mClientData.set(sClientId, oClient);
        });
    };

    MessageBrokerProxy.prototype.disconnect = async function (sClientId) {
        return this.oCallbackQueue.push(async () => {
            if (typeof sClientId !== "string" || !sClientId.length) {
                throw new Error("Cannot disconnect client: Missing required parameter client id");
            }

            await AppCommunicationMgr.postMessageToFLP("sap.ushell.services.MessageBroker", {
                channelId: "sap.ushell.MessageBroker",
                clientId: sClientId,
                messageName: "disconnect"
            });

            this._mClientData.delete(sClientId);
        });
    };

    MessageBrokerProxy.prototype.subscribe = async function (sClientId, aSubscribedChannels, fnMessageCallback, fnClientConnectionCallback) {
        return this.oCallbackQueue.push(async () => {
            if (
                typeof sClientId !== "string"
                || !sClientId.length
                || !aSubscribedChannels.length
                || typeof fnMessageCallback !== "function"
            ) {
                throw new Error(`Cannot subscribe client '${sClientId}': Missing required parameter(s)`);
            }

            if (typeof fnClientConnectionCallback === "function") {
                // eslint-disable-next-line max-len
                this._oLogger.error(`The 'fnClientConnectionCallback' parameter was provided by client '${sClientId}'. This parameter is deprecated and should be provided as part of the connect() call`);
            }

            const oClient = this._mClientData.get(sClientId);

            if (!oClient) {
                throw new Error(`Cannot subscribe client '${sClientId}': Client is not connected`);
            }

            await AppCommunicationMgr.postMessageToFLP("sap.ushell.services.MessageBroker", {
                channelId: "sap.ushell.MessageBroker",
                clientId: sClientId,
                messageName: "subscribe",
                subscribedChannels: aSubscribedChannels
            });

            aSubscribedChannels.forEach((oChannel) => oClient.subscribe(oChannel.channelId, fnMessageCallback));

            if (fnClientConnectionCallback) {
                oClient.setClientConnectionCallback(fnClientConnectionCallback);
            }
        });
    };

    MessageBrokerProxy.prototype.unsubscribe = async function (sClientId, aUnsubscribedChannels) {
        return this.oCallbackQueue.push(async () => {
            if (
                typeof sClientId !== "string"
                || !sClientId.length
                || !Array.isArray(aUnsubscribedChannels)
                || !aUnsubscribedChannels.length
            ) {
                throw new Error(`Cannot unsubscribe client '${sClientId}': Missing required parameter(s)`);
            }

            const oClient = this._mClientData.get(sClientId);

            if (!oClient) {
                throw new Error(`Cannot subscribe client '${sClientId}': Client is not connected`);
            }

            await AppCommunicationMgr.postMessageToFLP("sap.ushell.services.MessageBroker", {
                channelId: "sap.ushell.MessageBroker",
                clientId: sClientId,
                messageName: "unsubscribe",
                subscribedChannels: aUnsubscribedChannels
            });

            aUnsubscribedChannels.forEach((oChannel) => oClient.subscribe(oChannel.channelId, undefined));
        });
    };

    MessageBrokerProxy.prototype.publish = async function (sChannelId, sClientId, sMessageId, sMessageName, vTargetClientIds, oData) {
        return this.oCallbackQueue.push(async () => {
            if (typeof sMessageName === "string" && (Array.isArray(vTargetClientIds) || vTargetClientIds === ClientAlias.AllClients)) {
                this._oLogger.error(`The parameter 'sMessageId' was provided by client '${sClientId}'. It is deprecated and should not be provided`);
            } else {
                // do remapping
                oData = vTargetClientIds;
                vTargetClientIds = sMessageName;
                sMessageName = sMessageId;
                sMessageId = undefined;
            }

            let aTargetClientIds;
            if (vTargetClientIds === ClientAlias.AllClients) {
                aTargetClientIds = [ClientAlias.AllClients];
            } else {
                aTargetClientIds = [...vTargetClientIds];
            }

            // do not await, because it does not respond!
            AppCommunicationMgr.postMessageToFLP("sap.ushell.services.MessageBroker", {
                clientId: sClientId,
                channelId: sChannelId,
                targetClientIds: aTargetClientIds,
                messageName: sMessageName,
                data: oData
            });
        });
    };

    MessageBrokerProxy.prototype.addAcceptedOrigin = function (sOrigin) {
        // should be empty in AppRuntime
    };

    MessageBrokerProxy.prototype.removeAcceptedOrigin = function (sOrigin) {
        // should be empty in AppRuntime
    };

    MessageBrokerProxy.prototype.getAcceptedOrigins = function () {
        // should be empty in AppRuntime
    };

    MessageBrokerProxy.prototype.getAcceptedOrigins = function () {
        // should be empty in AppRuntime
    };

    MessageBrokerProxy.prototype.handleMessage = async function (oBody) {
        return this.oCallbackQueue.push(async () => {
            const oClient = this._mClientData.get(oBody.targetClientId);

            if (!oClient) {
                throw new Error(`Client '${oBody.targetClientId}' is not connected`);
            }

            if (["clientSubscribed", "clientUnsubscribed"].includes(oBody.messageName)) {
                oClient.callClientConnectionCallback(
                    oBody.messageName,
                    oBody.clientId,
                    oBody.channels
                );
                return { _noresponse_: true };
            }

            const fnMessageCallback = oClient.getMessageCallback(oBody.channelId);
            if (!fnMessageCallback) {
                throw new Error(`Client '${oBody.clientId}' is not subscribed to channel '${oBody.channelId}'`);
            }

            fnMessageCallback(
                oBody.clientId,
                oBody.channelId,
                oBody.messageName,
                oBody.data
            );

            return { _noresponse_: true };
        });
    };

    MessageBrokerProxy.hasNoAdapter = true;

    return MessageBrokerProxy;
});
