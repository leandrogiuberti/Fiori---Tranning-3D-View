// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview This module contains the implementation of the message broker
 * @version 1.141.1
 */
sap.ui.define([
    "sap/base/Log",
    "sap/base/util/deepClone",
    "sap/ushell/services/MessageBroker/ClientAlias",
    "sap/ushell/services/MessageBroker/ClientConnectionMessage"
], (
    Log,
    deepClone,
    ClientAlias,
    ClientConnectionMessage
) => {
    "use strict";

    /**
     * @typedef {string} ClientId
     * The client id of the sender.
     *
     * @since 1.110.0
     * @private
     */

    /**
     * @typedef {string} ChannelId
     * The channel id.
     *
     * @since 1.110.0
     * @private
     */

    /**
     * @typedef {object} ClientChannelData
     * The internal representation of a client within a channel.
     * @property {ClientId} clientId The client id.
     * @property {sap.ushell.services.MessageBroker.MessageCallback} messageCallback
     * The callback function that is called when a message is published to the channel.
     *
     * @since 1.110.0
     * @private
     */

    /**
     * @typedef {object} ClientSubscriptionData
     * The internal representation of a client.
     * @property {ClientId} clientId The client id.
     * @property {sap.ushell.services.MessageBroker.Channel[]} channels The channels the client is subscribed to.
     * @property {sap.ushell.services.MessageBroker.ClientConnectionCallback} clientConnectionCallback
     * The callback function that is called when the client connects or disconnects.
     *
     * @since 1.110.0
     * @private
     */

    /**
     * @alias sap.ushell.services.MessageBroker.MessageBrokerEngine
     * @namespace
     * @description The Message Broker Engine is responsible for managing clients, channels, and messages.
     *
     * @since 1.110.0
     * @private
     */
    class MessageBrokerEngine {
        #bEnabled = true;
        #bSkipEmitInformAboutOtherClients = false;
        #oLogger = Log.getLogger("sap.ushell.services.MessageBroker");

        /**
         * @type {Set<string>} Set of accepted origins.
         */
        #sAcceptedOrigins = new Set();

        /**
         * @type {Set<ClientId>} Set of connected clients.
         */
        #sConnectedClients = new Set();

        /**
         * @type {Object<ClientId, ClientSubscriptionData>} Map of subscribed clients.
         */
        #oSubscribedClients = {};

        /**
         * @type {Object<ChannelId, ClientChannelData[]>} Map of clients per channel.
         * Key is the channel id, value is an array of clients subscribed to the channel.
         */
        #oClientsPerChannel = {};

        #aPendingTimeouts = [];

        constructor () {
            // add default origin
            this.addAcceptedOrigin(window.location.origin);
        }

        setEnabled (bVal) {
            this.#bEnabled = bVal;
        }

        /**
         * Connects the client to the message broker.
         * When the client connects, it will receive the information about all other clients that are already subscribed to channels.
         * Additionally, the client is informed about _any_ new subscription and unsubscription to a channel.
         * @param {ClientId} sClientId client id.
         * @param {sap.ushell.services.MessageBroker.ClientConnectionCallback} fnClientConnectionCallback
         * Callback function that is called whenever the client subscribes or unsubscribes to a channel.
         * @returns {Promise} Resolves once the client is connected.
         *
         * @since 1.110.0
         * @private
         */
        async connect (sClientId, fnClientConnectionCallback) {
            if (!this.#bEnabled) {
                throw new Error(`Cannot connect client '${sClientId}': MessageBroker is not enabled`);
            }

            if (typeof sClientId !== "string" || !sClientId.length) {
                throw new Error("Cannot connect client: Missing required parameter client id");
            }

            if (this.#sConnectedClients.has(sClientId)) {
                throw new Error(`Cannot connect client '${sClientId}': Client is already connected`);
            }

            if (
                typeof fnClientConnectionCallback !== "function"
            ) {
                this.#oLogger.error(`Missing required parameter 'fnClientConnectionCallback' for client '${sClientId}'! It has to be provided as part of the connect() call`);
            } else {
                // add client connection callback
                this.#oSubscribedClients[sClientId] = {
                    clientId: sClientId,
                    channels: [],
                    clientConnectionCallback: fnClientConnectionCallback
                };

                this.#aPendingTimeouts.push(setTimeout(() => {
                    this.#emitInformAboutOtherClients(sClientId);
                }, 0));
            }

            // add client initial entry to connected clients
            this.#sConnectedClients.add(sClientId);
        }

        /**
         * Emits information about all other clients to the specified client.
         * @param {ClientId} sClientId client id.
         *
         * @since 1.140.0
         * @private
         */
        #emitInformAboutOtherClients (sClientId) {
            // ONLY FOR TESTING!
            if (this.#bSkipEmitInformAboutOtherClients) {
                return;
            }

            const oClient = this.#oSubscribedClients[sClientId];
            if (!oClient) {
                // client is already disconnected
                return;
            }

            const aOtherSubscribedClients = Object.values(this.#oSubscribedClients).filter((oOtherClient) => {
                return oOtherClient.clientId !== sClientId;
            });

            if (aOtherSubscribedClients.length) {
                aOtherSubscribedClients.forEach((oOtherClient) => {
                    oClient.clientConnectionCallback(
                        ClientConnectionMessage.ClientSubscribed,
                        oOtherClient.clientId,
                        deepClone(oOtherClient.channels)
                    );
                });
            }
        }

        /**
         * Disconnects the client.
         * If the client was subscribed to channels, it will be unsubscribed from all channels.
         * @param {ClientId} sClientId client id.
         * @returns {Promise} Resolves once the client is disconnected.
         *
         * @since 1.110.0
         * @private
         */
        async disconnect (sClientId) {
            if (!this.#bEnabled) {
                throw new Error(`Cannot disconnect client '${sClientId}': MessageBroker is not enabled`);
            }

            if (typeof sClientId !== "string" || !sClientId.length) {
                throw new Error("Cannot disconnect client: Missing required parameter client id");
            }
            if (!this.#sConnectedClients.has(sClientId)) {
                throw new Error(`Cannot disconnect client '${sClientId}': Client is already disconnected`);
            }

            // === Update "channel data" ===
            for (const sChannelId in this.#oClientsPerChannel) {
                // find client and remove from the channel
                this.#oClientsPerChannel[sChannelId] = this.#oClientsPerChannel[sChannelId].filter((oClient) => {
                    return oClient.clientId !== sClientId;
                });
            }

            // === Update "subscribed clients" ===
            if (this.#oSubscribedClients[sClientId]?.channels.length) {
                // if client disconnects but is still subscribed
                this.#emitConnectionEvent(
                    ClientConnectionMessage.ClientUnsubscribed,
                    sClientId,
                    this.#oSubscribedClients[sClientId].channels
                );
            }
            // remove from subscribed clients
            delete this.#oSubscribedClients[sClientId];

            // remove from connected clients
            this.#sConnectedClients.delete(sClientId);
        }

        /**
         * Subscribe to a channel.
         * Before subscribing, the client must be connected.
         * Afterwards, the client receives messages for the subscribed channels.
         * @param {ClientId} sClientId client id.
         * @param {sap.ushell.services.MessageBroker.Channel[]} aSubscribedChannels array of channel-objects.
         * @param {sap.ushell.services.MessageBroker.MessageCallback} fnMessageCallback
         * Callback function that is called whenever a message is published to subscribed channels.
         * The message callback is overwritten on subsequent calls to subscribe.
         * Every channel can has its own message callback.
         * @param {sap.ushell.services.MessageBroker.ClientConnectionCallback} fnClientConnectionCallback
         * <b>DEPRECATED</b> Should be provided as part of {@link #connect}.
         * @returns {Promise} Resolves once the client is subscribed to the channels.
         *
         * @since 1.110.0
         * @private
         */
        async subscribe (sClientId, aSubscribedChannels, fnMessageCallback, fnClientConnectionCallback) {
            if (!this.#bEnabled) {
                throw new Error(`Cannot subscribe client '${sClientId}': MessageBroker is not enabled`);
            }

            if (
                typeof sClientId !== "string"
                || !sClientId.length
                || !aSubscribedChannels.length
                || typeof fnMessageCallback !== "function"
            ) {
                throw new Error(`Cannot subscribe client '${sClientId}': Missing required parameter(s)`);
            }

            if (
                typeof fnClientConnectionCallback === "function"
            ) {
                // eslint-disable-next-line max-len
                this.#oLogger.error(`The 'fnClientConnectionCallback' parameter was provided by client '${sClientId}'. This parameter is deprecated and should be provided as part of the connect() call`);
            }

            if (!this.#sConnectedClients.has(sClientId)) {
                throw new Error(`Cannot subscribe client '${sClientId}': Client is not connected`);
            }

            // === Update "channel data" ===
            for (const oChannel of aSubscribedChannels) {
                const sChannelId = oChannel.channelId;
                // add new channel
                if (!this.#oClientsPerChannel[sChannelId]) {
                    this.#oClientsPerChannel[sChannelId] = [];
                }

                const oClientChannelData = this.#oClientsPerChannel[sChannelId].find((oClient) => {
                    return oClient.clientId === sClientId;
                });

                // add new client
                if (!oClientChannelData) {
                    // add new client to the channel
                    this.#oClientsPerChannel[sChannelId].push({
                        clientId: sClientId,
                        messageCallback: fnMessageCallback
                    });
                } else {
                    oClientChannelData.messageCallback = fnMessageCallback;
                }
            }

            // === Update "subscribed clients" ===
            const oClientSubscriptionData = this.#oSubscribedClients[sClientId];
            if (!oClientSubscriptionData) { // this case is deprecated as all clients should be connected and provide the connection callback before
                // add to subscribed clients
                this.#oSubscribedClients[sClientId] = {
                    clientId: sClientId,
                    channels: deepClone(aSubscribedChannels),
                    clientConnectionCallback: fnClientConnectionCallback
                };

                // notify new client of other already subscribed clients
                this.#aPendingTimeouts.push(setTimeout(() => {
                    this.#emitInformAboutOtherClients(sClientId);
                }, 1000));
            } else {
                // if client is already subscribed to any channel
                for (const oChannel of aSubscribedChannels) {
                    const bAlreadySubscribed = oClientSubscriptionData.channels.some((oSubChannel) => {
                        return oSubChannel.channelId === oChannel.channelId;
                    });

                    if (!bAlreadySubscribed) {
                        // add new channel to the existing channels
                        oClientSubscriptionData.channels.push(oChannel);
                    }
                }
            }

            // notify other subscribed clients of new subscription
            if (Object.keys(this.#oSubscribedClients).length > 1) {
                this.#emitConnectionEvent(
                    ClientConnectionMessage.ClientSubscribed,
                    sClientId,
                    aSubscribedChannels
                );
            }
        }

        /**
         * Unsubscribes the client from the specified channels.
         * @param {ClientId} sClientId client id.
         * @param {sap.ushell.services.MessageBroker.Channel[]} aUnsubscribedChannels channels to unsubscribe from.
         * @returns {Promise} Resolves once the client is unsubscribed from the channels.
         *
         * @since 1.110.0
         * @private
         */
        async unsubscribe (sClientId, aUnsubscribedChannels) {
            if (!this.#bEnabled) {
                throw new Error(`Cannot unsubscribe client '${sClientId}': MessageBroker is not enabled`);
            }

            if (
                typeof sClientId !== "string"
                || !sClientId.length
                || !Array.isArray(aUnsubscribedChannels)
                || !aUnsubscribedChannels.length
            ) {
                throw new Error(`Cannot unsubscribe client '${sClientId}': Missing required parameter(s)`);
            }

            if (!this.#sConnectedClients.has(sClientId)) {
                throw new Error(`Cannot unsubscribe client '${sClientId}': Client is not connected`);
            }

            // === Update "channel data" ===
            for (const oChannel of aUnsubscribedChannels) {
                const sChannelId = oChannel.channelId;
                if (this.#oClientsPerChannel[sChannelId]) {
                    // find client and remove from the channel
                    this.#oClientsPerChannel[sChannelId] = this.#oClientsPerChannel[sChannelId].filter((oClient) => {
                        return oClient.clientId !== sClientId;
                    });
                } else {
                    // if channel does not exist
                    this.#oLogger.warning(`Cannot unsubscribe client '${sClientId}': Channel '${sChannelId}' is unknown`);
                }
            }

            // === Update "subscribed clients" ===
            this.#oSubscribedClients[sClientId].channels = this.#oSubscribedClients[sClientId].channels.filter((oChannel) => {
                const bFound = aUnsubscribedChannels.some((oChannelToRemove) => {
                    return oChannelToRemove.channelId === oChannel.channelId;
                });
                return !bFound;
            });

            this.#emitConnectionEvent(
                ClientConnectionMessage.ClientUnsubscribed,
                sClientId,
                aUnsubscribedChannels
            );
        }

        /**
         * Publishes a message to a channel.
         * All clients that are subscribed to the channel will receive the message.
         * The message is NOT sent to the client that published it.
         *
         * @param {ChannelId} sChannelId channel id.
         * @param {ClientId} sClientId The client id of the sender.
         * @param {string} sMessageId
         * <b>DEPRECATED</b> Should not be provided.
         * @param {string} sMessageName message name. Can be used to identify the message type or as a topic.
         * @param {string[]|sap.ushell.services.MessageBroker.ClientAlias.AllClients} vTargetClientIds
         * list of target client ids. Can include the wildcard "*" to send the message to all clients subscribed to the channel.
         * If the wildcard is used, the other client ids are ignored.
         * @param {object} oData additional data.
         * @returns {Promise} Resolves once the message is published successfully.
         *
         * @since 1.110.0
         * @private
         */
        async publish (sChannelId, sClientId, sMessageId, sMessageName, vTargetClientIds, oData) {
            if (!this.#bEnabled) {
                throw new Error(`Cannot publish message of client '${sClientId}': MessageBroker is not enabled`);
            }

            if (typeof sMessageName === "string" && (Array.isArray(vTargetClientIds) || vTargetClientIds === ClientAlias.AllClients)) {
                this.#oLogger.error(`The parameter 'sMessageId' was provided by client '${sClientId}'. It is deprecated and should not be provided`);
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

            // if client is not connected
            if (!this.#sConnectedClients.has(sClientId)) {
                throw new Error(`Cannot publish message '${sMessageName}' of client '${sClientId}': Client '${sClientId}' is not connected`);
            }

            // if channel does not exist
            if (!this.#oClientsPerChannel[sChannelId]) {
                throw new Error(`Cannot publish message '${sMessageName}' of client '${sClientId}': Channel '${sChannelId}' is unknown`);
            }

            const aSubscribedClients = this.#oClientsPerChannel[sChannelId];
            const oPublishingClient = aSubscribedClients.find((oSubClient) => {
                return oSubClient.clientId === sClientId;
            });

            // if client is not subscribed to the channel
            if (!oPublishingClient) {
                throw new Error(`Cannot publish message '${sMessageName}' of client '${sClientId}': Client is not subscribed to the provided channel '${sChannelId}'`);
            }

            const bUsesWildcard = aTargetClientIds.includes(ClientAlias.AllClients);

            let aTargetClients = [];
            if (bUsesWildcard) {
                aTargetClients = [...aSubscribedClients];
            } else {
                for (const sTargetClientId of aTargetClientIds) {
                    // check if target client exists
                    const oClientChannelData = aSubscribedClients.find((oClient) => {
                        return oClient.clientId === sTargetClientId;
                    });

                    if (oClientChannelData) {
                        aTargetClients.push(oClientChannelData);
                    }
                }
            }

            if (!bUsesWildcard && !aTargetClients.length) {
                throw new Error(`Cannot publish message '${sMessageName}' of client '${sClientId}': No target client(s) found in the provided channel '${sChannelId}'`);
            }

            this.#sendMessage(aTargetClients, sChannelId, sMessageName, sClientId, oData);
        }

        /**
         * Adds the iframe origin to the list of accepted origins.
         * The port is automatically added based on the protocol (HTTP/HTTPS).
         *
         * @param {string} sOrigin The iframe origin (e.g https://www.example.com:443)
         *
         * @since 1.110.0
         * @private
         */
        addAcceptedOrigin (sOrigin) {
            if (!this.#bEnabled) {
                return;
            }

            if (typeof sOrigin !== "string" || !sOrigin.length) {
                throw new Error("Missing required parameter");
            }

            this.#sAcceptedOrigins.add(sOrigin);
            const oUrl = new URL(sOrigin);

            if (oUrl.protocol === "https:" && oUrl.port === "") {
                // store the origin with and without port
                if (sOrigin.endsWith(":443")) {
                    this.#sAcceptedOrigins.add(sOrigin.substring(0, sOrigin.length - 4));
                } else {
                    this.#sAcceptedOrigins.add(`${sOrigin}:443`);
                }
            }
            if (oUrl.protocol === "http:" && oUrl.port === "") {
                // store the origin with and without port
                if (sOrigin.endsWith(":80")) {
                    this.#sAcceptedOrigins.add(sOrigin.substring(0, sOrigin.length - 3));
                } else {
                    this.#sAcceptedOrigins.add(`${sOrigin}:80`);
                }
            }
        }

        /**
         * Removes the iframe origin from the list of accepted origins.
         * Also removes the origin with or without port based on the protocol (HTTP/HTTPS).
         *
         * @param {string} sOrigin The iframe origin (e.g https://www.example.com:443)
         *
         * @since 1.110.0
         * @private
         */
        removeAcceptedOrigin (sOrigin) {
            if (!this.#bEnabled) {
                return;
            }

            if (typeof sOrigin !== "string" || !sOrigin.length) {
                throw new Error("Missing required parameter");
            }

            this.#sAcceptedOrigins.delete(sOrigin);
            const oUrl = new URL(sOrigin);

            if (oUrl.protocol === "https:" && oUrl.port === "") {
                // remove the origin with and without port
                if (sOrigin.endsWith(":443")) {
                    this.#sAcceptedOrigins.delete(sOrigin.substring(0, sOrigin.length - 4));
                } else {
                    this.#sAcceptedOrigins.delete(`${sOrigin}:443`);
                }
            }
            if (oUrl.protocol === "http:" && oUrl.port === "") {
                // remove the origin with and without port
                if (sOrigin.endsWith(":80")) {
                    this.#sAcceptedOrigins.delete(sOrigin.substring(0, sOrigin.length - 3));
                } else {
                    this.#sAcceptedOrigins.delete(`${sOrigin}:80`);
                }
            }
        }

        /**
         * Returns the current list of accepted origins.
         * @returns {string[]} The list of accepted origins.
         *
         * @since 1.110.0
         * @private
         */
        getAcceptedOrigins () {
            if (!this.#bEnabled) {
                return;
            }
            return Array.from(this.#sAcceptedOrigins.values());
        }

        /**
         * Returns the map of subscribed clients.
         * @returns {object} the result.
         *
         * @since 1.110.0
         * @private
         */
        getSubscribedClients () {
            if (!this.#bEnabled) {
                return;
            }
            return deepClone(this.#oClientsPerChannel);
        }

        /**
         * Calls the connection callback for all subscribed clients except the one who initiated the event.
         *
         * @param {sap.ushell.services.MessageBroker.ClientConnectionMessage} sMessageName The event to emit.
         * @param {ClientId} sClientId The client id of the sender.
         * @param {sap.ushell.services.MessageBroker.Channel[]} aChannels subscribed/unsubscribed channels of the client.
         *
         * @since 1.110.0
         * @private
         */
        #emitConnectionEvent (sMessageName, sClientId, aChannels) {
            for (const oClient of Object.values(this.#oSubscribedClients)) {
                // do not notify the same client who initiated the event
                if (oClient.clientId !== sClientId) {
                    oClient.clientConnectionCallback(sMessageName, sClientId, deepClone(aChannels));
                }
            }
        }

        /**
         * Calls the message callback for all target clients except the one who initiated the event.
         *
         * @param {ClientChannelData[]} aTargetClients target clients.
         * @param {ChannelId} sChannelId The channel id.
         * @param {string} sMessageName The message name.
         * @param {ClientId} sClientId The client id of the sender.
         * @param {object} oData Additional data.
         *
         * @since 1.110.0
         * @private
         */
        #sendMessage (aTargetClients, sChannelId, sMessageName, sClientId, oData) {
            for (const oClient of aTargetClients) {
                // do not send message to the same client who requested to send it
                if (oClient.clientId !== sClientId) {
                    oClient.messageCallback(sClientId, sChannelId, sMessageName, deepClone(oData));
                }
            }
        }

        /**
         * ONLY FOR TESTING!
         * Resets the Message Broker Engine.
         *
         * @since 1.140.0
         * @private
         */
        reset () {
            // Reset all internal states
            this.#bEnabled = true;
            this.#bSkipEmitInformAboutOtherClients = false;

            this.#sAcceptedOrigins.clear();
            this.#sConnectedClients.clear();
            this.#oSubscribedClients = {};
            this.#oClientsPerChannel = {};

            // Add default origin again
            this.addAcceptedOrigin(window.location.origin);

            this.#aPendingTimeouts.forEach((iTimeout) => {
                clearTimeout(iTimeout);
            });
            this.#aPendingTimeouts = [];
        }

        /**
         * ONLY FOR TESTING!
         * Skips the emit of the "inform about other clients" event.
         * This is useful for testing purposes to avoid sending messages to other clients.
         *
         * @since 1.140.0
         * @private
         */
        skipEmitInformAboutOtherClients () {
            this.#bSkipEmitInformAboutOtherClients = true;
        }
    }

    return new MessageBrokerEngine();
});
