// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ushell/ui/shell/ToolAreaItem",
    "sap/ui/qunit/utils/nextUIUpdate"
], (
    ToolAreaItem,
    nextUIUpdate
) => {
    "use strict";

    /* global QUnit */

    QUnit.module("Init Control", {
        beforeEach: function () {
            this.oToolAreaItem = new ToolAreaItem();
        },
        afterEach: function () {
            this.oToolAreaItem.destroy();
        }
    });

    QUnit.test("ToolArea tabindex is set", async function (assert) {
        // Act
        this.oToolAreaItem.placeAt("qunit-fixture");
        await nextUIUpdate();

        // Assert
        assert.ok(this.oToolAreaItem, "ToolAreaItem was created.");
        assert.equal(this.oToolAreaItem.getDomRef().getAttribute("tabindex"), "0", "Tabindex is set correctly.");
    });
});
