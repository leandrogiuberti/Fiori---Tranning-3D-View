// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.components.shell.SideNavigation.modules.MyHome
 */
sap.ui.define([
    "sap/tnt/NavigationListItem",
    "sap/ui/thirdparty/hasher",
    "sap/ushell/components/shell/SideNavigation/modules/MyHome",
    "sap/ushell/utils/UrlParsing"
], (
    NavigationListItem,
    hasher,
    MyHome,
    UrlParsing) => {
    "use strict";

    /* global QUnit, sinon */

    const sandbox = sinon.createSandbox({});

    QUnit.module("The 'constructor' function", {
        beforeEach: function () {
            this.oMyHome = new MyHome();
        },

        afterEach: function () {
            sandbox.restore();
            this.oMyHome = null;
        }
    });

    QUnit.test("Behaves as expected", function (assert) {
        // Act
        const oRootItem = this.oMyHome.oRootItem;
        // Assert
        assert.ok(this.oMyHome instanceof MyHome, "Creates new instance of MyHome");
        assert.ok(oRootItem instanceof NavigationListItem, "oRootItem is instance of NavigationListItem");

        assert.strictEqual(oRootItem.getProperty("icon"), "sap-icon://home", "oRootItem has the correct icon");
        assert.strictEqual(oRootItem.getProperty("href"), "#Shell-home", "oRootItem has the correct href");
        const aCustomData = oRootItem.getCustomData();
        assert.strictEqual(aCustomData?.length, 1, "There is one customData item");
        assert.strictEqual(aCustomData[0]?.getKey(), "help-id", "CustomData key is correct");
    });

    QUnit.module("The 'getRootItem' function", {
        beforeEach: function () {
            this.oMyHome = new MyHome({});
        },

        afterEach: function () {
            sandbox.restore();
            this.oMyHome = null;
        }
    });

    QUnit.test("Returns this.oItemReady", function (assert) {
        return this.oMyHome.getRootItem().then((getRootItemResult) => {
            // Assert
            assert.strictEqual(getRootItemResult, this.oMyHome.oRootItem, "this.oItemReady was returned");
        });
    });

    QUnit.module("The 'findSelectedKey' function", {
        beforeEach: function () {
            this.oMyHome = new MyHome({});
            sandbox.stub(hasher, "getHash");
            this.oURLParsingStub = sandbox.stub(UrlParsing, "parseShellHash");
        },

        afterEach: function () {
            sandbox.restore();
            this.oMyHome = null;
        }
    });

    QUnit.test("Returns the item key for #Shell-home", function (assert) {
        // Arrange
        this.oURLParsingStub.returns({semanticObject: "Shell", action: "home"});
        // Act

        return this.oMyHome.findSelectedKey().then(async (sSelectedKey) => {
            // Assert
            assert.strictEqual((await this.oMyHome.getRootItem()).getKey(), sSelectedKey, "Selected Key is correct");
        });
    });

    QUnit.test("Returns undefined for non-#Shell-home", function (assert) {
        // Arrange
        this.oURLParsingStub.returns({semanticObject: "FLPPage", action: "open"});
        // Act

        return this.oMyHome.findSelectedKey().then(async (sSelectedKey) => {
            // Assert
            assert.strictEqual(undefined, sSelectedKey, "Selected Key is correct");
        });
    });
});
