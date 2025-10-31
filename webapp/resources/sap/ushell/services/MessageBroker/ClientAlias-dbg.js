// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
], (
) => {
    "use strict";

    /**
     * @alias sap.ushell.services.MessageBroker.ClientAlias
     * @enum {string}
     *
     * @since 1.110.0
     * @private
     * @ui5-restricted SAP internally public
     */
    const ClientAlias = {
        /**
         * Wildcard '*' which refers to all clients in a channel
         *
         * @since 1.110.0
         * @private
         * @ui5-restricted SAP internally public
         */
        AllClients: "*",

        /**
         * The FLP client
         *
         * @since 1.141.0
         * @private
         * @ui5-restricted SAP internally public
         */
        FLP: "FLP"
    };

    return ClientAlias;
});
