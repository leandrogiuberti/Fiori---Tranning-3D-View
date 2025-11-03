// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview The SupportTicket adapter for the local platform.
 *
 * @version 1.141.0
 */
sap.ui.define([
], () => {
    "use strict";

    function SupportTicketAdapter (oSystem, sParameter, oAdapterConfiguration) {
        this.createTicket = function (oSupportObject) {
            const sTicketId = "1234567";
            return Promise.resolve(sTicketId);
        };
    }

    return SupportTicketAdapter;
});
