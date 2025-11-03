// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview Qunit tests for the sap.ushell.performance.Extension module.
 */
sap.ui.define([
    "sap/ushell/api/performance/Extension",
    "sap/ushell/api/performance/NavigationSource"
], (
    Extension,
    NavigationSource
) => {
    "use strict";

    /* global QUnit */

    QUnit.module("sap.ushell.performance.Extension", {
        beforeEach: function () {
            this.oExtension = new Extension();
        }
    });

    QUnit.test("getNavigationSource - no navigation source", function (assert) {
        assert.notOk(this.oExtension.getNavigationSource(), "Returns falsy value when no navigation source is present");
    });

    QUnit.test("getNavigationSource - single navigation source", function (assert) {
        const oNavSource = { id: "SideBar", abbreviation: NavigationSource.SideBar };
        this.oExtension.addNavigationSource(oNavSource);
        assert.strictEqual(this.oExtension.getNavigationSource().abbreviation, NavigationSource.SideBar, "Returns the correct navigation source");
    });

    QUnit.test("getNavigationSource - multiple navigation sources", function (assert) {
        const oNavSource1 = {id: "SideBar", abbreviation: NavigationSource.SideBar};
        const oNavSource2 = { id: "AppFinder", abbreviation: NavigationSource.AppFinder };
        this.oExtension.addNavigationSource(oNavSource1);
        this.oExtension.addNavigationSource(oNavSource2);
        assert.strictEqual(this.oExtension.getNavigationSource().abbreviation, NavigationSource.AppFinder, "Returns the last added navigation source");
        assert.strictEqual(this.oExtension.getNavigationSource().abbreviation, NavigationSource.SideBar, "Returns the last added navigation source");
    });

    QUnit.test("addNavigationSource - adds a navigation source", function (assert) {
        const oNavSource = { id: "SideBar", abbreviation: NavigationSource.SideBar };
        this.oExtension.addNavigationSource(oNavSource);
        assert.strictEqual(this.oExtension.getNavigationSource().abbreviation, NavigationSource.SideBar, "navigation source is added to the stack");
        assert.strictEqual(this.oExtension.getNavigationSource(), undefined, "navigation source matches the input");
    });

    QUnit.test("addNavigationSource - invalid navigation source", function (assert) {
        const oInvalidNavSource = { id: "Invalid" };
        this.oExtension.addNavigationSource(oInvalidNavSource);
        assert.strictEqual(this.oExtension.getNavigationSource(), undefined, "Invalid navigation source is not added");
    });

    QUnit.test("addNavigationSource - string input", function (assert) {
        this.oExtension.addNavigationSource(NavigationSource.AppFinder);
        assert.strictEqual(this.oExtension.getNavigationSource().abbreviation, NavigationSource.AppFinder, "String input is correctly added as navigation source");
        assert.strictEqual(this.oExtension.getNavigationSource(), undefined, "String input matches the expected navigation source");
    });
});
