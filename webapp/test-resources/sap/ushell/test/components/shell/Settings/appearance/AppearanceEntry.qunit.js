// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ui/core/mvc/XMLView",
    "sap/base/Log",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/components/shell/Settings/appearance/AppearanceEntry",
    "sap/ushell/resources",
    "sap/ushell/Container"
], (XMLView, Log, jQuery, AppearanceEntry, resources, Container) => {
    "use strict";

    /* global QUnit sinon */

    const sandbox = sinon.sandbox.create();

    const THEME_LIST = [
        { id: "test_id", name: "Some theme" },
        { id: "user_theme", name: "User theme name" },
        { id: "sap_horizon", name: "SAP Horizon Morning" }
    ];

    QUnit.module("AppearanceEntry", {
        beforeEach: function () {
            this.fnXMLViewCreate = sandbox.stub(XMLView, "create");
            this.fnLogWarningSpy = sandbox.spy(Log, "warning");

            this.fngGetThemeList = sandbox.stub();
            this.fnGetUserTheme = sandbox.stub();

            sandbox.stub(Container, "getServiceAsync").resolves({
                getThemeList: this.fngGetThemeList
            });
            sandbox.stub(Container, "getUser").returns({
                getTheme: this.fnGetUserTheme
            });
        },
        afterEach: function () {
            this.fnXMLViewCreate.restore();
            this.fnLogWarningSpy.restore();
            sandbox.restore();
        }
    });

    QUnit.test("Check contract property", function (assert) {
        // Arrange

        // Act
        const oContract = AppearanceEntry.getEntry();

        // Assert
        assert.equal(oContract.id, "themes", "id is correct");
        assert.equal(oContract.entryHelpID, "themes", "entryHelpID is correct");
        assert.equal(oContract.title, resources.i18n.getText("Appearance"), "title is correct");
        assert.equal(oContract.valueResult, null, "valueResult is null");
        assert.equal(oContract.contentResult, null, "contentResult is null");
        assert.equal(oContract.icon, "sap-icon://palette", "icon is correct");
        assert.equal(oContract.provideEmptyWrapper, undefined, "provideEmptyWrapper is correct");
        assert.equal(typeof oContract.valueArgument, "function", "valueArgument is correct");
        assert.equal(typeof oContract.contentFunc, "function", "contentFunc is function");
        assert.equal(typeof oContract.onSave, "function", "onSave is function");
        assert.equal(typeof oContract.onCancel, "function", "onCancel is function");
    });

    QUnit.test("valueArgument: return empty string when getThemeList is rejected", function (assert) {
        // Arrange
        this.fngGetThemeList.returns((new jQuery.Deferred()).reject(new Error("Failed intentionally")));
        this.fnGetUserTheme.returns("user_theme");
        // Act
        const oContract = AppearanceEntry.getEntry();

        return oContract.valueArgument().then((sThemeName) => {
            // Assert
            assert.equal(sThemeName, "", "The empty string is reterned");
        });
    });

    QUnit.test("valueArgument: return the name of user theme and cache the theme list", function (assert) {
        // Arrange
        this.fngGetThemeList.returns((new jQuery.Deferred()).resolve({
            options: THEME_LIST
        }));
        this.fnGetUserTheme.returns("user_theme");
        // Act
        const oContract = AppearanceEntry.getEntry();
        return oContract.valueArgument().then((sThemeName) => {
            // Assert
            assert.equal(sThemeName, "User theme name", "The correct theme name is returned");
            return oContract.valueArgument();
        }).then((sThemeName) => {
            assert.equal(sThemeName, "User theme name", "The correct theme name is returned");
            assert.ok(this.fngGetThemeList.calledOnce, "getThemeList should be called once");
        });
    });

    QUnit.test("contentFunc: create Appearance view", function (assert) {
        // Arrange
        this.fngGetThemeList.returns((new jQuery.Deferred()).resolve({
            options: THEME_LIST
        }));
        this.fnXMLViewCreate.resolves({});
        const oExpectedView = {
            id: "userPrefThemeSelector",
            viewName: "sap.ushell.components.shell.Settings.appearance.Appearance",
            viewData: {
                themeList: THEME_LIST,
                themeSets: [],
                themeRoot: undefined
            }
        };
        // Act
        const oContract = AppearanceEntry.getEntry();
        return oContract.contentFunc().then((oView) => {
            // Assert
            assert.deepEqual(oView, {}, "The view was returned");
            assert.ok(this.fnXMLViewCreate.calledOnce, "create xml view was called");
            assert.deepEqual(this.fnXMLViewCreate.getCall(0).args, [oExpectedView], "The userAccountSetting was created");
        });
    });

    QUnit.test("onSave: resolve promise when view was not created", function (assert) {
        // Arrange
        // Act
        const oContract = AppearanceEntry.getEntry();
        return oContract.onSave().then(() => {
            // Assert
            assert.ok(this.fnLogWarningSpy.calledOnce, "the warning was logged");
        });
    });

    QUnit.test("onSave: call the onSave from controller", function (assert) {
        // Arrange
        const oController = {
            onSave: sinon.stub().resolves()
        };
        this.fnXMLViewCreate.resolves({
            getController: sinon.stub().returns(oController)
        });
        // Act
        const oContract = AppearanceEntry.getEntry();
        return oContract.contentFunc()
            .then(() => {
                return oContract.onSave();
            })
            .then(() => {
                // Assert
                assert.ok(oController.onSave.calledOnce, "onSave of the controller was called");
            });
    });

    QUnit.test("onCancel: resolve promise when view was not created", function (assert) {
        // Act
        const oContract = AppearanceEntry.getEntry();
        oContract.onCancel();
        // Assert
        assert.ok(this.fnLogWarningSpy.calledOnce, "the warning was logged");
    });

    QUnit.test("onCancel: call the onCancel from controller", function (assert) {
        // Arrange
        const oController = {
            onCancel: sinon.stub().resolves()
        };
        this.fnXMLViewCreate.resolves({
            getController: sinon.stub().returns(oController)
        });
        // Act
        const oContract = AppearanceEntry.getEntry();
        return oContract.contentFunc().then(() => {
            oContract.onCancel();
            // Assert
            assert.ok(oController.onCancel.calledOnce, "onCancel of the controller was called");
        });
    });
});
