// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
sap.ui.define([
], (
) => {
    "use strict";

    /**
     * @alias sap.ushell.appRuntime.ui5.services.MessageBroker.Client
     * @class
     * @classdesc Data structure for managing client connections and subscriptions.
     * Collects connection calls to support the deprecated use case of providing the
     * callback only with the subscribe call.
     *
     * @since 1.141.0
     * @private
     */
    class Client {
        #sId; // for debugging
        #fnClientConnectionCallback;
        #mChannelSubscriptions = new Map();
        #aCollectedConnectionCalls = [];

        /**
         * @param {string} sClientId The id of a client.
         *
         * @since 1.141.0
         * @private
         */
        constructor (sClientId) {
            this.#sId = sClientId;
        }

        /**
         * Sets the client connection callback.
         * @param {sap.ushell.services.MessageBroker.ClientConnectionCallback} fnCallback The callback function to be called on client connection.
         *
         * @since 1.141.0
         * @private
         */
        setClientConnectionCallback (fnCallback) {
            this.#fnClientConnectionCallback = fnCallback;
        }

        /**
         * Subscribes to a channel.
         * @param {string} sChannelId The id of the channel to subscribe to.
         * @param {sap.ushell.services.MessageBroker.MessageCallback} fnMessageCallback The callback function to be called when a message is received on the channel.
         *
         * @since 1.141.0
         * @private
         */
        subscribe (sChannelId, fnMessageCallback) {
            this.#mChannelSubscriptions.set(sChannelId, fnMessageCallback);
        }

        /**
         * Unsubscribes from a channel.
         * @param {string} sChannelId The id of the channel to unsubscribe from.
         *
         * @since 1.141.0
         * @private
         */
        unsubscribe (sChannelId) {
            this.#mChannelSubscriptions.delete(sChannelId);
        }

        /**
         * Gets the message callback for a channel.
         * @param {string} sChannelId The id of the channel to get the callback for.
         * @returns {sap.ushell.services.MessageBroker.MessageCallback} The message callback for the channel, or undefined if not subscribed.
         *
         * @since 1.141.0
         * @private
         */
        getMessageCallback (sChannelId) {
            return this.#mChannelSubscriptions.get(sChannelId);
        }

        /**
         * Calls the client connection callback if it exists, otherwise collects the arguments for later use.
         * @param  {...any} args The arguments to pass to the callback.
         *
         * @since 1.141.0
         * @private
         */
        callClientConnectionCallback (...args) {
            if (!this.#fnClientConnectionCallback) {
                this.#aCollectedConnectionCalls.push(args);
                return;
            }

            this.#fnClientConnectionCallback(...args);
        }

        /**
         * Applies any previously collected client connection calls.
         *
         * @since 1.141.0
         * @private
         */
        applyPreviousConnectionCalls () {
            if (!this.#fnClientConnectionCallback) {
                return;
            }

            this.#aCollectedConnectionCalls.forEach((args) => {
                this.#fnClientConnectionCallback(...args);
            });
            this.#aCollectedConnectionCalls = [];
        }
    }

    return Client;
});
