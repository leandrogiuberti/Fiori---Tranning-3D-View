// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/adapters/local/SupportTicketAdapter"
], (SupportTicketAdapter) => {
    "use strict";

    /* global QUnit */

    QUnit.module("sap.ushell.adapters.local.SupportTicketAdapterTest", {
        beforeEach: function (assert) {
            this.oAdapter = new SupportTicketAdapter();
        },
        afterEach: function () {
        }
    });

    QUnit.test("createTicket returns resolved promise", function (assert) {
        const fnDone = assert.async();
        this.oAdapter.createTicket()
            .then((sTicketNumber) => {
                assert.ok(sTicketNumber, "the promise should be result with some value");
                fnDone();
            })
            .catch(() => {
                assert.ok("promise should be resolved");
                fnDone();
            });
    });
});
