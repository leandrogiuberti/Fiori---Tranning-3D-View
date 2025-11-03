// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ushell/NWBCInterface",
    "sap/ushell/EventHub",
    "sap/ushell/Config",
    "sap/ushell/appIntegration/KeepAliveApps"
], (
    NWBCInterface,
    EventHub,
    Config,
    KeepAliveApps
) => {
    "use strict";

    /* global QUnit, sinon */

    const sandbox = sinon.createSandbox({});

    QUnit.module("sap.ushell.NWBCInterface", {
        beforeEach: function (assert) {
        },

        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("Test notifyUserActivity", function (assert) {
        const done = assert.async();

        EventHub
            .on("nwbcUserIsActive")
            .do(() => {
                assert.ok(true, "event called");
                done();
            });

        NWBCInterface.notifyUserActivity();
    });

    QUnit.test("Test getSessionTimeoutMinutes", function (assert) {
        assert.strictEqual(NWBCInterface.getSessionTimeoutMinutes(), 0, "should be 0");

        sandbox.stub(Config, "last").callsFake((sPath) => {
            if (sPath === "/core/shell/sessionTimeoutIntervalInMinutes") {
                return 5;
            }
            return undefined;
        });

        assert.strictEqual(NWBCInterface.getSessionTimeoutMinutes(), 5, "should be 5");
    });

    QUnit.test("Test isAnyAppKeptAlive false", function (assert) {
        const done = assert.async();

        sandbox.stub(KeepAliveApps, "length").returns(0);
        NWBCInterface.isAnyAppKeptAlive().then((bExists) => {
            assert.strictEqual(bExists, false, "should be false");
            done();
        });
    });

    QUnit.test("Test isAnyAppKeptAlive true", function (assert) {
        const done = assert.async();

        sandbox.stub(KeepAliveApps, "length").returns(12);
        NWBCInterface.isAnyAppKeptAlive().then((bExists) => {
            assert.strictEqual(bExists, true, "should be true");
            done();
        });
    });
});
