// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.renderer.utils
 */
sap.ui.define([
    "sap/ui/core/EventBus",
    "sap/ushell/renderer/utils"
], (
    EventBus,
    RendererUtils
) => {
    "use strict";

    /* global QUnit */

    QUnit.test("test publishing public event", function (assert) {
        const done = assert.async();

        EventBus.getInstance().subscribe("sap.ushell.renderers.fiori2.Renderer", "testEvent", () => {
            assert.ok(true, "the event was thrown as expected");
            done();
        });
        RendererUtils.publishExternalEvent("testEvent");
    });
});
