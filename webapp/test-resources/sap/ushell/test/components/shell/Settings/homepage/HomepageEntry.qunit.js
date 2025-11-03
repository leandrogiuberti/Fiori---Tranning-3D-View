// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileoverview QUnit tests for sap.ushell.components.shell.Settings.homepage.HomepageEntry
 * @deprecated since 1.120
 */
sap.ui.define([
    "sap/base/Log",
    "sap/ushell/components/SharedComponentUtils",
    "sap/ushell/components/shell/Settings/homepage/HomepageEntry",
    "sap/ushell/Config",
    "sap/ushell/resources",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/Container"
], (Log, SharedComponentUtils, HomepageEntry, Config, resources, jQuery, Container) => {
    "use strict";

    /* global QUnit sinon */

    const sandbox = sinon.sandbox.create();

    QUnit.module("getEntry:");

    QUnit.test("Check if the correct entry settings are applied", function (assert) {
        // Act
        const oHomepageEntry = HomepageEntry.getEntry();

        // Assert
        assert.strictEqual(oHomepageEntry.entryHelpID, "homepageEntry", "entryHelpID is correct");
        assert.strictEqual(oHomepageEntry.title, resources.i18n.getText("FlpSettings_entry_title"), "title is correct");
        assert.strictEqual(oHomepageEntry.valueResult, null, "valueResult is null");
        assert.strictEqual(oHomepageEntry.contentResult, null, "contentResult is null");
        assert.strictEqual(oHomepageEntry.icon, "sap-icon://home", "icon is correct");
        assert.strictEqual(oHomepageEntry.provideEmptyWrapper, false, "provideEmptyWrapper is false");
        assert.strictEqual(oHomepageEntry.valueArgument, null, "valueArgument is null");
        assert.strictEqual(typeof oHomepageEntry.contentFunc, "function", "contentFunc is function");
        assert.strictEqual(typeof oHomepageEntry.onSave, "function", "onSave is function");
        assert.strictEqual(typeof oHomepageEntry.onCancel, "function", "onCancel is function");
    });

    QUnit.module("contentFunc:", {
        beforeEach: function () {
            this.oHomepageEntry = HomepageEntry.getEntry();
            this.oLogErrorSpy = sandbox.spy(Log, "error");
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("Check if the view is correct", function (assert) {
        // Arrange
        const oGetEffectiveHomepageSettingStub = sandbox.stub(SharedComponentUtils, "getEffectiveHomepageSetting").resolves(true);

        // Act
        return this.oHomepageEntry.contentFunc().then((oView) => {
            // Assert
            assert.ok(oView.byId("anchorBarLabel"), "The Label has the id \"anchorBarLabel\".");
            assert.ok(oView.byId("anchorBarLabel").hasStyleClass("sapUshellFlpSettingsLabel"), "The Label has the class \"sapUshellFlpSettingsLabel\".");
            assert.strictEqual(oView.byId("anchorBarLabel").getText(), resources.i18n.getText("AnchorBarLabel"), "The Label has the correct text.");
            assert.strictEqual(oView.byId("anchorBarDisplayMode").getSelectedIndex(), 0, "The RadioButtonGroup selectedIndex is 0.");

            const aButtons = oView.byId("anchorBarDisplayMode").getButtons();
            assert.strictEqual(aButtons.length, 2, "The RadioButtonGroup has exactly 2 controls in the buttons aggregation.");
            assert.ok(aButtons[0].isA("sap.m.RadioButton"), "The first control in the buttons aggregation is a RadioButton.");
            assert.strictEqual(aButtons[0].getId(), `${oView.getId()}--anchorBarScrollModeRBtn`, "The first RadioButton has the id \"anchorBarScrollModeRBtn\".");
            assert.strictEqual(aButtons[0].getText(), resources.i18n.getText("anchorBarScrollMode"), "The first RadioButton has the correct text.");
            assert.ok(aButtons[1].isA("sap.m.RadioButton"), "The second control in the buttons aggregation is a RadioButton.");
            assert.strictEqual(aButtons[1].getId(), `${oView.getId()}--anchorBarTabModeRBtn`, "The second RadioButton has the id \"anchorBarTabModeRBtn\".");
            assert.strictEqual(aButtons[1].getText(), resources.i18n.getText("anchorBarTabMode"), "The second RadioButton has the correct text.");

            assert.strictEqual(oView.byId("anchorBarDescription").getText(), resources.i18n.getText("homePageGroupDisplayDescriptionText"), "The first Text has the correct text.");
            assert.strictEqual(oView.byId("anchorBarDescription").getVisible(), true, "The first Text is visible.");
            assert.strictEqual(oView.byId("anchorBarDescriptionSecondParagraph").getText(), resources.i18n.getText("homePageGroupDisplayDescriptionText_secondParagraph"),
                "The second Text has the correct text.");
            assert.strictEqual(oView.byId("anchorBarDescriptionSecondParagraph").getVisible(), true, "The second Text is visible.");

            // Clean - up
            oView.destroy();
            oGetEffectiveHomepageSettingStub.restore();
        });
    });

    QUnit.test("Check that an error is put in the log, if the effectiveHomepageSetting is rejected.", function (assert) {
        // Arrange
        const oGetEffectiveHomepageSettingStub = sandbox.stub(SharedComponentUtils, "getEffectiveHomepageSetting").rejects(new Error("Failed intentionally"));

        // Act
        return this.oHomepageEntry.contentFunc().catch(() => {
            // Assert
            assert.strictEqual(this.oLogErrorSpy.callCount, 1, "An error was put in the Log.");

            // Clean - up
            oGetEffectiveHomepageSettingStub.restore();
        });
    });

    QUnit.module("onSave:", {
        beforeEach: function () {
            this.oHomepageEntry = HomepageEntry.getEntry();
            this.oLogWarningSpy = sandbox.spy(Log, "warning");
            this.oLogErrorSpy = sandbox.spy(Log, "error");
            this.oGetEffectiveHomepageSettingStub = sandbox.stub(SharedComponentUtils, "getEffectiveHomepageSetting").resolves(true);
            this.oSetPersDataStub = sandbox.stub().returns(jQuery.Deferred().resolve(true));
            this.oGetPersonalizer = sandbox.stub(SharedComponentUtils, "getPersonalizer").resolves({
                setPersData: this.oSetPersDataStub
            });
            sandbox.stub(Container, "getRendererInternal").returns({});
        },
        afterEach: function () {
            Config._reset();
            sandbox.restore();
        }
    });

    QUnit.test("Check that a warning is put into the Log if the view was not created yet", function (assert) {
        // Act
        return this.oHomepageEntry.onSave().then(() => {
            // Assert
            assert.strictEqual(this.oLogWarningSpy.callCount, 1, "Exactly one warning was written into the Log.");
        });
    });

    QUnit.test("Check that the setting stays changed if it was changed.", function (assert) {
        // Arrange
        Config.emit("/core/home/homePageGroupDisplay", "tabs");

        return this.oHomepageEntry.contentFunc().then((oView) => {
            oView.byId("anchorBarDisplayMode").setSelectedIndex(0);

            // Act
            this.oHomepageEntry.onSave().then(() => {
                // Assert
                assert.strictEqual(Config.last("/core/home/homePageGroupDisplay"), "scroll",
                    "The Config value homePageGroupDisplay is \"scroll\".");

                // Clean - up
                oView.destroy();
            });
        });
    });

    QUnit.test("Check that the setting stays changed if it was changed. (2)", function (assert) {
        // Arrange
        Config.emit("/core/home/homePageGroupDisplay", "scroll");

        return this.oHomepageEntry.contentFunc().then((oView) => {
            oView.byId("anchorBarDisplayMode").setSelectedIndex(1);

            // Act
            this.oHomepageEntry.onSave().then(() => {
                // Assert
                assert.strictEqual(Config.last("/core/home/homePageGroupDisplay"), "tabs",
                    "The Config value homePageGroupDisplay is \"tabs\".");

                // Clean - up
                oView.destroy();
            });
        });
    });

    QUnit.test("Check that an error is put into the log, if setting the persData fails.", function (assert) {
        // Arrange
        Config.emit("/core/home/homePageGroupDisplay", "scroll");
        this.oSetPersDataStub.returns(new jQuery.Deferred().reject(new Error("Failed intentionally")));

        return this.oHomepageEntry.contentFunc().then((oView) => {
            oView.byId("anchorBarDisplayMode").setSelectedIndex(1);

            // Act
            this.oHomepageEntry.onSave().catch(() => {
                // Assert
                assert.strictEqual(this.oLogErrorSpy.callCount, 1, "An error was put into the log.");

                // Clean - up
                oView.destroy();
            });
        });
    });

    QUnit.module("onCancel:", {
        beforeEach: function () {
            this.oHomepageEntry = HomepageEntry.getEntry();
            this.oLogWarningSpy = sandbox.spy(Log, "warning");
            this.oGetEffectiveHomepageSettingStub = sandbox.stub(SharedComponentUtils, "getEffectiveHomepageSetting").resolves(true);
        },
        afterEach: function () {
            Config._reset();
            sandbox.restore();
        }
    });

    QUnit.test("Check that a warning is put into the Log if the View was not created yet", function (assert) {
        // Act
        this.oHomepageEntry.onCancel();

        // Assert
        assert.strictEqual(this.oLogWarningSpy.callCount, 1, "Exactly one warning was written into the Log.");
    });
});
