// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
], (
) => {
    "use strict";

    /**
     * @alias sap.ushell.services.MessageBroker.ClientConnectionMessage
     * @enum {string}
     *
     * @since 1.110.0
     * @private
     * @ui5-restricted SAP internally public
     */
    const ClientConnectionMessage = {
        /**
         * Emitted when a client subscribes to a channel.
         *
         * @since 1.110.0
         * @private
         * @ui5-restricted SAP internally public
         */
        ClientSubscribed: "clientSubscribed",

        /**
         * Emitted when a client unsubscribes from a channel.
         *
         * @since 1.110.0
         * @private
         * @ui5-restricted SAP internally public
         */
        ClientUnsubscribed: "clientUnsubscribed"
    };

    return ClientConnectionMessage;
});
