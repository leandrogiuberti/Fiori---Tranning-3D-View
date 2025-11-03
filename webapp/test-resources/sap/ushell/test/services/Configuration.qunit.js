// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.services.Configuration
 */
sap.ui.define([
    "sap/ushell/services/Configuration",
    "sap/ushell/Config",
    "sap/ushell/test/utils"
], (Configuration, Config, testUtils) => {
    "use strict";

    /* global QUnit, sinon */

    QUnit.module("sap.ushell.services.Configuration");

    QUnit.test("attachSizeBehaviorUpdate delivers initial value", function (assert) {
        const fnDone = assert.async();
        const oService = new Configuration();
        const oCallback = sinon.spy();
        const oDoable = oService.attachSizeBehaviorUpdate(oCallback);
        Config.once("/core/home/sizeBehavior").do(() => {
            assert.ok(oCallback.calledOnce);
            assert.ok(oCallback.calledWith("Responsive"));
            oDoable.detach();
            fnDone();
        });
    });

    QUnit.test("attachSizeBehaviorUpdate calls callback", function (assert) {
        const fnDone = assert.async();
        const oService = new Configuration();
        const oCallback = sinon.spy();
        const oDoable = oService.attachSizeBehaviorUpdate(oCallback);
        Config.emit("/core/home/sizeBehavior", "Small");
        Config.once("/core/home/sizeBehavior").do(() => {
            assert.ok(oCallback.calledTwice);
            assert.equal("Small", oCallback.secondCall.args[0]);
            oDoable.detach();
            fnDone();
        });
    });

    QUnit.test("attachSizeBehaviorUpdate return detach object that detaches", function (assert) {
        const fnDone = assert.async();
        const oService = new Configuration();
        const oCallback = sinon.spy();
        const oDoable = oService.attachSizeBehaviorUpdate(oCallback);

        oDoable.detach();
        Config.emit("/core/home/sizeBehavior", "Responsive");
        Config.once("/core/home/sizeBehavior").do(() => {
            assert.ok(oCallback.calledOnce);
            fnDone();
        });
    });
});
