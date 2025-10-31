// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview This module exposes API endpoints for Generic Communication
 * @version 1.141.1
 */
sap.ui.define([
    "sap/ushell/services/MessageBroker/ClientAlias",
    "sap/ushell/services/MessageBroker/ClientConnectionMessage",
    "sap/ushell/services/MessageBroker/MessageBrokerEngine",
    "sap/base/Log"
], (
    ClientAlias,
    ClientConnectionMessage,
    MessageBrokerEngine,
    Log
) => {
    "use strict";

    let oServiceConfig = {};

    /**
     * @typedef {object} sap.ushell.services.MessageBroker.Channel
     * @param {string} channelId channel id.
     *
     * @since 1.110.0
     * @private
     * @ui5-restricted SAP internally public
     */

    /**
     * @callback sap.ushell.services.MessageBroker.MessageCallback
     * The message callback function of clients that are subscribed to a channel.
     * It is called whenever a message is published to the channel.
     *
     * @param {string} sClientId The client id of the sender.
     * @param {string} sChannelId The channel id.
     * @param {string} sMessageName The message name.
     * @param {object} oData The data of the message.
     *
     * @since 1.110.0
     * @private
     * @ui5-restricted SAP internally public
     */

    /**
     * @callback sap.ushell.services.MessageBroker.ClientConnectionCallback
     * The client connection callback function of clients.
     * It is called initially when the client subscribes to a channel and
     * whenever a client subscribes, unsubscribes or disconnects.
     *
     * @param {sap.ushell.services.MessageBroker.ClientConnectionMessage} sMessageName The message name.
     * @param {string} sClientId The client id.
     * @param {sap.ushell.services.MessageBroker.Channel[]} aSubscribedChannels The channels the client is subscribed to.
     *
     * @since 1.110.0
     * @private
     * @ui5-restricted SAP internally public
     */

    /**
     * @alias sap.ushell.services.MessageBroker
     * @class
     * @classdesc The Unified Shell's MessageBroker service.
     *
     * <b>Note:</b> To retrieve a valid instance of this service, it is necessary to call {@link sap.ushell.Container#getServiceAsync}.
     * <pre>
     *   sap.ui.require(["sap/ushell/Container"], async function (Container) {
     *     const MessageBroker = await Container.getServiceAsync("MessageBroker");
     *     // do something with the MessageBroker service
     *   });
     * </pre>
     *
     * @hideconstructor
     *
     * @param {object} oContainerInterface the container interface, not in use.
     * @param {string} sParameters the parameter string, not in use.
     * @param {object} oServiceConfiguration the service configuration.
     *
     * @since 1.72.0
     * @private
     * @ui5-restricted SAP internally public
     */
    function MessageBroker (oContainerInterface, sParameters, oServiceConfiguration) {
        oServiceConfig = oServiceConfiguration?.config || {};
        MessageBrokerEngine.setEnabled(this.isEnabled());
        if (!this.isEnabled()) {
            Log.warning("FLP's message broker service is disabled by shell configuration");
            return;
        }
    }

    // Expose enums
    MessageBroker.prototype.ClientConnectionMessage = ClientConnectionMessage;
    MessageBroker.prototype.ClientAlias = ClientAlias;

    /**
     * Returns whether the service is enabled or not.
     * @returns {boolean} true if the service is enabled, false otherwise.
     *
     * @since 1.110.0
     * @private
     */
    MessageBroker.prototype.isEnabled = function () {
        return oServiceConfig.enabled ?? true;
    };

    /**
     * Connects the client to the message broker.
     * When the client connects, it will receive the information about all other clients that are already subscribed to channels.
     * Additionally, the client is informed about _any_ new subscription and unsubscription to a channel.
     * @param {string} sClientId client id.
     * @param {sap.ushell.services.MessageBroker.ClientConnectionCallback} fnClientConnectionCallback
     * Callback function that is called whenever the client subscribes or unsubscribes to a channel.
     * @returns {Promise} Resolves once the client is connected.
     *
     * @since 1.110.0
     * @private
     * @ui5-restricted SAP internally public
     */
    MessageBroker.prototype.connect = async function (sClientId, fnClientConnectionCallback) {
        await MessageBrokerEngine.connect(sClientId, fnClientConnectionCallback);
    };

    /**
     * Disconnects the client.
     * If the client was subscribed to channels, it will be unsubscribed from all channels.
     * @param {string} sClientId client id.
     * @returns {Promise} Resolves once the client is disconnected.
     *
     * @since 1.110.0
     * @private
     * @ui5-restricted SAP internally public
     */
    MessageBroker.prototype.disconnect = async function (sClientId) {
        await MessageBrokerEngine.disconnect(sClientId);
    };

    /**
     * Subscribe to a channel.
     * Before subscribing, the client must be connected.
     * Afterwards, the client receives messages for the subscribed channels.
     * @param {string} sClientId client id.
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
     * @ui5-restricted SAP internally public
     */
    MessageBroker.prototype.subscribe = async function (sClientId, aSubscribedChannels, fnMessageCallback, fnClientConnectionCallback) {
        await MessageBrokerEngine.subscribe(
            sClientId,
            aSubscribedChannels,
            fnMessageCallback,
            fnClientConnectionCallback
        );
    };

    /**
     * Unsubscribes the client from the specified channels.
     * @param {string} sClientId client id.
     * @param {sap.ushell.services.MessageBroker.Channel[]} aUnsubscribedChannels channels to unsubscribe from.
     * @returns {Promise} Resolves once the client is unsubscribed from the channels.
     *
     * @since 1.110.0
     * @private
     * @ui5-restricted SAP internally public
     */
    MessageBroker.prototype.unsubscribe = async function (sClientId, aUnsubscribedChannels) {
        await MessageBrokerEngine.unsubscribe(sClientId, aUnsubscribedChannels);
    };

    /**
     * Publishes a message to a channel.
     * All clients that are subscribed to the channel will receive the message.
     * The message is NOT sent to the client that published it.
     *
     * @param {string} sChannelId channel id.
     * @param {string} sClientId The client id of the sender.
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
     * @ui5-restricted SAP internally public
     */
    MessageBroker.prototype.publish = async function (sChannelId, sClientId, sMessageId, sMessageName, vTargetClientIds, oData) {
        await MessageBrokerEngine.publish(
            sChannelId,
            sClientId,
            sMessageId,
            sMessageName,
            vTargetClientIds,
            oData
        );
    };

    /**
     * Adds the iframe origin to the list of accepted origins.
     * The port is automatically added based on the protocol (HTTP/HTTPS).
     *
     * @param {string} sOrigin The iframe origin (e.g https://www.example.com:443)
     *
     * @since 1.110.0
     * @private
     * @ui5-restricted SAP internally public
     */
    MessageBroker.prototype.addAcceptedOrigin = function (sOrigin) {
        MessageBrokerEngine.addAcceptedOrigin(sOrigin);
    };

    /**
     * Removes the iframe origin from the list of accepted origins.
     * Also removes the origin with or without port based on the protocol (HTTP/HTTPS).
     *
     * @param {string} sOrigin The iframe origin (e.g https://www.example.com:443)
     *
     * @since 1.110.0
     * @private
     * @ui5-restricted SAP internally public
     */
    MessageBroker.prototype.removeAcceptedOrigin = function (sOrigin) {
        MessageBrokerEngine.removeAcceptedOrigin(sOrigin);
    };

    /**
     * Returns the current list of accepted origins.
     * @returns {string[]} The list of accepted origins.
     *
     * @since 1.110.0
     * @private
     * @ui5-restricted SAP internally public
     */
    MessageBroker.prototype.getAcceptedOrigins = function () {
        return MessageBrokerEngine.getAcceptedOrigins();
    };

    MessageBroker.hasNoAdapter = true;
    return MessageBroker;
});
