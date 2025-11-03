// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.modules.NavigationMenu
 */
sap.ui.define([
    "sap/ushell/Config",
    "sap/ushell/modules/NavigationMenu"
], (
    Config,
    NavigationMenu
) => {
    "use strict";

    /* global QUnit, sinon */

    const sandbox = sinon.createSandbox({});

    QUnit.module("NavigationMenu APIs", {
        beforeEach: function () {
            this.oConfigEmitSpy = sandbox.spy(Config, "emit");
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("Set FixedNavigationListProvider", async function (assert) {
        const oConfig = {
            spaces: {
                personalization: {
                    enabled: true
                }
            },
            allApps: {
                enabled: true
            }
        };
        NavigationMenu.setFixedNavigationListProvider("sap.ushell.test.FixedNavigationListProvider", oConfig);
        assert.strictEqual(this.oConfigEmitSpy.callCount, 1, "Config.emit was called once");
        assert.strictEqual(Config.last("/core/sideNavigation/fixedNavigationListProvider/modulePath"), "sap.ushell.test.FixedNavigationListProvider", "Module path is set correctly");
        assert.strictEqual(Config.last("/core/sideNavigation/fixedNavigationListProvider/configuration"), JSON.stringify(oConfig), "Configuration is set correctly");
    });

    QUnit.test("Set NavigationListProvider", async function (assert) {
        const oConfig = {
            spaces: {
                enabled: true
            },
            recentActivity: {
                enabled: true
            },
            favorites: {
                enabled: true
            }
        };
        NavigationMenu.setNavigationListProvider("sap.ushell.test.NavigationListProvider", oConfig);
        assert.strictEqual(this.oConfigEmitSpy.callCount, 1, "Config.emit was called once");
        assert.strictEqual(Config.last("/core/sideNavigation/navigationListProvider/modulePath"), "sap.ushell.test.NavigationListProvider", "Module path is set correctly");
        assert.strictEqual(Config.last("/core/sideNavigation/navigationListProvider/configuration"), JSON.stringify(oConfig), "Configuration is set correctly");
    });

    QUnit.test("Set Mode - Docked", async function (assert) {
        NavigationMenu.setMode(NavigationMenu.NavigationMenuMode.Docked);
        assert.strictEqual(this.oConfigEmitSpy.callCount, 1, "Config.emit was called once");
        assert.strictEqual(Config.last("/core/sideNavigation/mode"), "Docked", "Mode is set correctly");
    });

    QUnit.test("Set Mode - Popover", async function (assert) {
        NavigationMenu.setMode(NavigationMenu.NavigationMenuMode.Popover);
        assert.strictEqual(this.oConfigEmitSpy.callCount, 1, "Config.emit was called once");
        assert.strictEqual(Config.last("/core/sideNavigation/mode"), "Popover", "Mode is set correctly");
    });

    QUnit.test("Set Mode - Invalid Mode", async function (assert) {
        assert.throws(() => {
            NavigationMenu.setMode("InvalidMode");
        }, new Error("Invalid mode: InvalidMode"), "Error thrown for invalid mode");
        assert.strictEqual(this.oConfigEmitSpy.callCount, 0, "Config.emit was not called");
    });
});
