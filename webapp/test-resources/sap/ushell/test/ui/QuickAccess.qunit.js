// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for QuickAccess
 */
sap.ui.define([
    "sap/ui/thirdparty/jquery",
    "sap/ushell/Container",
    "sap/ushell/ui/QuickAccess",
    "sap/ushell/EventHub"
], (jQuery, Container, QuickAccess, EventHub) => {
    "use strict";

    /* global QUnit, sinon */
    const sandbox = sinon.createSandbox({});

    QUnit.module("QuickAccess functionality", {
        beforeEach: async function () {
            this.oIconTabBar = {
                setBusy: sandbox.spy()
            };
            this.oDialog = {
                getContent: () => {
                    return [this.oIconTabBar];
                },
                setContentHeight: sandbox.spy()
            };

            await Container.init("local");

            this.oGerServiceAsyncStub = sandbox.stub(Container, "getServiceAsync");
            this.oGerServiceAsyncStub.resolves({
                getRecentActivity: sandbox.stub().returns(new jQuery.Deferred().resolve([])),
                getFrequentActivity: sandbox.stub().returns(new jQuery.Deferred().resolve([]))
            });
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("Check that set busy is set during the updating the dialog", async function (assert) {
        // Arrange
        const oQuickAccess = QuickAccess._getQuickAccess();

        // Act
        await oQuickAccess._updateQuickAccessDialog(this.oDialog);

        // Assert
        assert.strictEqual(this.oIconTabBar.setBusy.callCount, 2, "setBusy called twice");
        assert.deepEqual(this.oIconTabBar.setBusy.firstCall.args, [ true ], "setBusy called as expected the first time");
        assert.deepEqual(this.oIconTabBar.setBusy.secondCall.args, [ false ], "setBusy called as expected the second time");
        assert.strictEqual(this.oDialog.setContentHeight.callCount, 1, "setContentHeight was called once");
        assert.deepEqual(this.oDialog.setContentHeight.firstCall.args, [ "18rem" ], "set minimal size for content height, because there is no items");
    });

    QUnit.test("fail case for getActivity is handle as empty array", async function (assert) {
        // Arrange
        const oQuickAccess = QuickAccess._getQuickAccess();

        this.oGerServiceAsyncStub.resolves({
            getRecentActivity: sandbox.stub().returns(new jQuery.Deferred().resolve([])),
            getFrequentActivity: sandbox.stub().returns(new jQuery.Deferred().resolve([{}, {}, {}, {}, {}]))
        });

        // Act
        await oQuickAccess._updateQuickAccessDialog(this.oDialog);

        // Assert
        assert.strictEqual(this.oDialog.setContentHeight.callCount, 1, "setContentHeight was called once");
        assert.deepEqual(this.oDialog.setContentHeight.firstCall.args, [ "24.75rem" ], "set minimal size for content height");
    });

    QUnit.test("set content height based on bigger list", async function (assert) {
        // Arrange
        const oQuickAccess = QuickAccess._getQuickAccess();

        this.oGerServiceAsyncStub.resolves({
            getRecentActivity: sandbox.stub().returns(new jQuery.Deferred().reject(new Error("error"))),
            getFrequentActivity: sandbox.stub().returns(new jQuery.Deferred().reject(new Error("error")))
        });

        // Act
        await oQuickAccess._updateQuickAccessDialog(this.oDialog);

        // Assert
        assert.strictEqual(this.oIconTabBar.setBusy.callCount, 2, "setBusy called twice");
        assert.deepEqual(this.oIconTabBar.setBusy.firstCall.args, [ true ], "setBusy called as expected the first time");
        assert.deepEqual(this.oIconTabBar.setBusy.secondCall.args, [ false ], "setBusy called as expected the second time");
        assert.strictEqual(this.oDialog.setContentHeight.callCount, 1, "setContentHeight was called once");
        assert.deepEqual(this.oDialog.setContentHeight.firstCall.args, [ "18rem" ], "set minimal size for content height, because there is no items");
    });

    QUnit.test("_setDialogContentHeight: set calculated size if height is in the range [18; 42]", function (assert) {
        // Arrange
        const oQuickAccess = QuickAccess._getQuickAccess();

        // Act
        oQuickAccess._setDialogContentHeight(this.oDialog, 5);

        // Assert
        assert.strictEqual(this.oDialog.setContentHeight.callCount, 1, "setContentHeight was called once");
        assert.deepEqual(this.oDialog.setContentHeight.firstCall.args, [ "24.75rem" ], "set minimal size for content height");
    });

    QUnit.test("_setDialogContentHeight: set max height if calculated height is > 42", function (assert) {
        // Arrange
        const oQuickAccess = QuickAccess._getQuickAccess();

        // Act
        oQuickAccess._setDialogContentHeight(this.oDialog, 15);

        // Assert
        assert.strictEqual(this.oDialog.setContentHeight.callCount, 1, "setContentHeight was called once");
        assert.deepEqual(this.oDialog.setContentHeight.firstCall.args, [ "42rem" ], "setContentHeight was called as expected");
    });

    QUnit.test("_setDialogContentHeight: set min height if calculated height is < 18", function (assert) {
        // Arrange
        const oQuickAccess = QuickAccess._getQuickAccess();

        // Act
        oQuickAccess._setDialogContentHeight(this.oDialog, 1);

        // Assert
        assert.strictEqual(this.oDialog.setContentHeight.callCount, 1, "setContentHeight was called once");
        assert.deepEqual(this.oDialog.setContentHeight.firstCall.args, [ "18rem" ], "setContentHeight was called as expected");
    });

    QUnit.test("_itemPress: should call addNavigationSource", function (assert) {
        // Arrange
        const oQuickAccess = QuickAccess._getQuickAccess();
        sandbox.stub(oQuickAccess, "_closeDialog");
        const oAddNavigationSourceStub = sandbox.stub(oQuickAccess.oExtension, "addNavigationSource");
        sandbox.stub(oQuickAccess.oModel, "getProperty").returns({
            url: "#fragment"
        });
        const oEvent = {
            reason: "LaunchApp",
            source: "Link",
            getParameter: sandbox.stub().returns({
                getBindingContextPath: () => "/recentActivities/0"
            })
        };
        sandbox.stub(EventHub, "emit");

        // Act
        oQuickAccess._itemPress(oEvent);

        // Assert
        assert.deepEqual(
            oAddNavigationSourceStub.args[0][0],
            "reUs",
            "addNavigationSource called with correct parameters"
        );
    });
});
