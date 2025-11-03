// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
/**
 * @fileOverview QUnit tests for sap.ushell.services.PluginManager.HeaderExtensions
 */
sap.ui.define([
    "sap/ushell/services/PluginManager/HeaderExtensions",
    "sap/ushell/EventHub"
], (HeaderExtensions, EventHub) => {
    "use strict";

    /* global QUnit sinon */

    QUnit.module("sap.ushell.services.PluginManager.HeaderExtensions", {
    });

    QUnit.test("HeaderExtensions: setHeaderCentralAreaElement", function (assert) {
        const oEmitStub = sinon.stub(EventHub, "emit");
        const oPayload = {
            id: "testId",
            currentState: false,
            states: undefined
        };

        HeaderExtensions.setHeaderCentralAreaElement(oPayload.id, oPayload.currentState);

        assert.ok(oEmitStub.calledOnce, "The EventHub event was emitted");
        assert.strictEqual(oEmitStub.firstCall.args[0], "setHeaderCentralAreaElement", "The event name is setHeaderCentralAreaElement");
        assert.deepEqual(oEmitStub.firstCall.args[1], oPayload, "The payload of the event is correct");

        oEmitStub.restore();
    });
});
