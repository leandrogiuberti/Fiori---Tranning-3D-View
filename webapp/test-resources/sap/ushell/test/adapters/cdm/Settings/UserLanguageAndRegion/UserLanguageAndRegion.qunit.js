// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/Container",
    "sap/base/Log",
    "sap/ushell/adapters/cdm/Settings/UserLanguageAndRegion/UserLanguageAndRegionEntry",
    "sap/ushell/adapters/cdm/Settings/UserLanguageAndRegion/UserLanguageAndRegion.controller",
    "sap/ushell/resources",
    "sap/base/i18n/Localization",
    "sap/ui/core/LocaleData",
    "sap/ui/thirdparty/jquery"
], (
    Container,
    Log,
    UserLanguageAndRegionEntry,
    UserLanguageAndRegion,
    ushellResources,
    Localization,
    LocaleData,
    jQuery
) => {
    "use strict";

    /* global QUnit, sinon */
    const sandbox = sinon.createSandbox();

    let clock;

    QUnit.module("UserLanguageAndRegion", {
        beforeEach: function () {
            this.oController = new UserLanguageAndRegion();

            this.oUser = {
                getLanguage: sandbox.stub(),
                getLanguageText: sandbox.stub(),
                isLanguagePersonalized: sandbox.stub(),
                setLanguage: sandbox.spy(),
                resetChangedProperty: sandbox.spy(),
                bIsEnableSetLanguage: sandbox.stub()
            };

            this.oShellConfig = {
                enableSetLanguage: true
            };

            this.oView = {
                setBusy: sinon.spy(),
                setModel: sinon.stub(),
                byId: sinon.stub()
            };

            this.oUserInfoService = {
                getLanguageList: sandbox.stub()
            };

            const mockDate = new Date(2025, 1, 11, 12, 0, 0);
            clock = sinon.useFakeTimers(mockDate.getTime());

            sandbox.stub(LocaleData.prototype, "getDatePattern").returns("d MMM y");
            sandbox.stub(LocaleData.prototype, "getTimePattern").returns("HH:mm:ss");
            sandbox.stub(LocaleData.prototype, "getDecimalPattern").returns("#,##0.###");
            sandbox.stub(LocaleData.prototype, "getWeekendStart").returns(6);
            sandbox.stub(LocaleData.prototype, "getWeekendEnd").returns(0);
            sandbox.stub(LocaleData.prototype, "getDaysStandAlone").returns(["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]);
            sandbox.stub(Localization, "getTimezone").returns("Europe/London");
            sandbox.stub(Container, "getServiceAsync").resolves(this.oUserInfoService);
            sandbox.stub(Container, "getUser").returns(this.oUser);
            sandbox.stub(this.oController, "getView").returns(this.oView);
            sandbox.stub(Container, "getRendererInternal").returns({
                getShellConfig: sandbox.stub().returns(this.oShellConfig)
            });

            this.fnLogWarningSpy = sandbox.spy(Log, "warning");
            this.fnLogErrorSpy = sandbox.spy(Log, "error");

            this.oController.oView = this.oView;
        },

        afterEach: function () {
            sandbox.restore();
            clock.restore();
        }
    });

    QUnit.test("Check contract properties", function (assert) {
        const oContract = UserLanguageAndRegionEntry.getEntry();

        assert.equal(oContract.id, "language", "id is correct");
        assert.equal(oContract.entryHelpID, "language", "entryHelpID is correct");
        assert.equal(oContract.title, ushellResources.i18n.getText("languageAndRegionTit"), "title is correct");
        assert.equal(oContract.valueResult, null, "valueResult is null");
        assert.equal(oContract.contentResult, null, "contentResult is null");
        assert.equal(oContract.icon, "sap-icon://map", "icon is correct");

        assert.equal(typeof oContract.valueArgument, "function", "valueArgument is function");
        assert.equal(typeof oContract.contentFunc, "function", "contentFunc is function");
        assert.equal(typeof oContract.onSave, "function", "onSave is function");
        assert.equal(typeof oContract.onCancel, "function", "onCancel is function");
    });

    QUnit.test("valueArgument: return correct value for american english", function (assert) {
        this.oUser.getLanguageText.returns("English");
        const oContract = UserLanguageAndRegionEntry.getEntry();
        return oContract.valueArgument().then((sResult) => {
            const sExpectedResult = "English";
            assert.equal(sResult, sExpectedResult, "The correct value is returned");
        });
    });

    QUnit.test("valueArgument: return correct value for british english", function (assert) {
        this.oUser.getLanguageText.returns("English-British");
        const oContract = UserLanguageAndRegionEntry.getEntry();
        return oContract.valueArgument().then((sResult) => {
            const sExpectedResult = "English (British)";
            assert.equal(sResult, sExpectedResult, "The correct value is returned");
        });
    });

    QUnit.test("contentFunc: return a view with personalized language", function (assert) {
        const oExpectedModel = {
            languageList: [
                {
                    key: "default",
                    text: "Browser Language"
                },
                {
                    key: "en-GB",
                    text: "British English"
                },
                {
                    key: "de-DE",
                    text: "German (Germany)"
                }
            ],
            selectedLanguage: "en",
            selectedLanguageText: "English",
            selectedDateFormat: "11 Feb 2025",
            selectedTimeFormat: "24 h",
            selectedDecimalFormat: "1,000.2",
            selectedTimeZone: "Europe/London",
            isLanguagePersonalized: true,
            selectedWorkWeek: "Monday - Friday"
        };

        const oExpectedView = {
            id: "userLanguageAndRegion",
            viewName: "sap.ushell.adapters.cdm.Settings.UserLanguageAndRegion.UserLanguageAndRegion"
        };

        this.oUser.getLanguage.returns(oExpectedModel.selectedLanguage);
        this.oUser.getLanguageText.returns(oExpectedModel.selectedLanguageText);
        this.oUser.isLanguagePersonalized.returns(oExpectedModel.isLanguagePersonalized);
        this.oUserInfoService.getLanguageList.returns(new jQuery.Deferred().resolve(oExpectedModel.languageList).promise());

        const oContract = UserLanguageAndRegionEntry.getEntry();

        return oContract.contentFunc().then((oView) => {
            // Assert
            assert.ok(oView, "View was created");
            assert.equal(oView.getId(), oExpectedView.id, "view has correct id");
            assert.equal(oView.getViewName(), oExpectedView.viewName, "view has correct viewName");
            assert.deepEqual(oView.getModel().getData(), oExpectedModel, "The correct model is set");

            assert.ok(this.oUserInfoService.getLanguageList.calledOnce, "getLanguageList was called once");

            const aFormItems = oView.byId("languageForm").getContent();
            assert.equal(aFormItems.length, 14, "all content was added");
            assert.ok(aFormItems[0].isA("sap.m.Label"), "The first item is a label for the timezone");
            assert.ok(aFormItems[1].isA("sap.m.HBox"), "The second item is a hbox for the timezone value");

            const aHBoxItems = aFormItems[1].getItems();
            assert.ok(aHBoxItems[0].isA("sap.m.Text"), "The first item in the hbox is a text for the timezone value");
            assert.ok(aHBoxItems[1].isA("sap.ui.core.Icon"), "The second item in the hbox is an icon");

            assert.ok(aFormItems[2].isA("sap.m.Label"), "The third item is a label for the language when languageList is not available");
            assert.notOk(aFormItems[2].getVisible(), "The label for the language  is hidden when languageList is not available");
            assert.ok(aFormItems[3].isA("sap.m.Text"), "The fourth item is a text for the selected language when languageList is not available");
            assert.notOk(aFormItems[3].getVisible(), "The text for the language is hidden when languageList is not available ");
            assert.ok(aFormItems[4].isA("sap.m.Label"), "The fifth item is a label for the language selector when languageList is available");
            assert.ok(aFormItems[4].getVisible(), "The label for the language selector  is visible when languageList is available");
            assert.ok(aFormItems[5].isA("sap.m.ComboBox"), "The ComboBox control for Language selection when languageList is  available");
            assert.ok(aFormItems[5].getVisible(), "The ComboBox is visible  when languageList is  available");

            assert.ok(aFormItems[6].isA("sap.m.Label"), "The sixth item is a label for the date format");
            assert.ok(aFormItems[7].isA("sap.m.Text"), "The seventh item is a text for the date format");

            assert.ok(aFormItems[8].isA("sap.m.Label"), "The seventh item is a label for the time format");
            assert.ok(aFormItems[9].isA("sap.m.Text"), "The eighth item is a text for the time format");

            assert.ok(aFormItems[10].isA("sap.m.Label"), "The ninth item is a label for the decimal format");
            assert.ok(aFormItems[11].isA("sap.m.Text"), "The tenth item is a text for the decimal format");

            assert.ok(aFormItems[12].isA("sap.m.Label"), "The eleventh item is a label for the work week");
            assert.ok(aFormItems[13].isA("sap.m.Text"), "The twelfth item is a text for the work week");

            oView.destroy();
        });
    });

    QUnit.test("contentFunc: return a view without personalized language", function (assert) {
        const oExpectedModel = {
            languageList: [
                {
                    key: "default",
                    text: "Browser Language"
                },
                {
                    key: "en",
                    text: "English"
                },
                {
                    key: "de-DE",
                    text: "German (Germany)"
                }
            ],
            selectedLanguage: "default",
            selectedLanguageText: "English",
            selectedDateFormat: "11 Feb 2025",
            selectedTimeFormat: "24 h",
            selectedDecimalFormat: "1,000.2",
            selectedTimeZone: "Europe/London",
            isLanguagePersonalized: false,
            selectedWorkWeek: "Monday - Friday"
        };

        const oExpectedView = {
            id: "userLanguageAndRegion",
            viewName: "sap.ushell.adapters.cdm.Settings.UserLanguageAndRegion.UserLanguageAndRegion"
        };

        this.oUser.getLanguage.returns(oExpectedModel.selectedLanguage);
        this.oUser.getLanguageText.returns(oExpectedModel.selectedLanguageText);
        this.oUser.isLanguagePersonalized.returns(oExpectedModel.isLanguagePersonalized);
        this.oUserInfoService.getLanguageList.returns(new jQuery.Deferred().resolve(oExpectedModel.languageList).promise());

        const oContract = UserLanguageAndRegionEntry.getEntry();

        return oContract.contentFunc().then((oView) => {
            // Assert
            assert.ok(oView, "View was created");
            assert.equal(oView.getId(), oExpectedView.id, "view has correct id");
            assert.equal(oView.getViewName(), oExpectedView.viewName, "view has correct viewName");
            assert.deepEqual(oView.getModel().getData(), oExpectedModel, "The correct model is set");

            assert.ok(this.oUserInfoService.getLanguageList.calledOnce, "getLanguageList was called once");

            oView.destroy();
        });
    });

    QUnit.test("contentFunc: return a view without personalized language, but without default languange", function (assert) {
        const oExpectedModel = {
            languageList: [
                {
                    key: "en",
                    text: "English"
                },
                {
                    key: "de-DE",
                    text: "German (Germany)"
                }
            ],
            selectedLanguage: "en",
            selectedLanguageText: "English",
            selectedDateFormat: "11 Feb 2025",
            selectedTimeFormat: "24 h",
            selectedDecimalFormat: "1,000.2",
            selectedTimeZone: "Europe/London",
            isLanguagePersonalized: false,
            selectedWorkWeek: "Monday - Friday"
        };

        const oExpectedView = {
            id: "userLanguageAndRegion",
            viewName: "sap.ushell.adapters.cdm.Settings.UserLanguageAndRegion.UserLanguageAndRegion"
        };

        this.oUser.getLanguage.returns(oExpectedModel.selectedLanguage);
        this.oUser.getLanguageText.returns(oExpectedModel.selectedLanguageText);
        this.oUser.isLanguagePersonalized.returns(oExpectedModel.isLanguagePersonalized);
        this.oUserInfoService.getLanguageList.returns(new jQuery.Deferred().resolve(oExpectedModel.languageList).promise());

        const oContract = UserLanguageAndRegionEntry.getEntry();

        return oContract.contentFunc().then((oView) => {
            // Assert
            assert.ok(oView, "View was created");
            assert.equal(oView.getId(), oExpectedView.id, "view has correct id");
            assert.equal(oView.getViewName(), oExpectedView.viewName, "view has correct viewName");
            assert.deepEqual(oView.getModel().getData(), oExpectedModel, "The correct model is set");

            assert.ok(this.oUserInfoService.getLanguageList.calledOnce, "getLanguageList was called once");

            oView.destroy();
        });
    });

    QUnit.test("contentFunc: return a view but getLanguageList fails", function (assert) {
        const oExpectedModel = {
            languageList: null,
            selectedLanguage: "en",
            selectedLanguageText: "English",
            selectedDateFormat: "11 Feb 2025",
            selectedTimeFormat: "24 h",
            selectedDecimalFormat: "1,000.2",
            selectedTimeZone: "Europe/London",
            isLanguagePersonalized: true,
            selectedWorkWeek: "Monday - Friday"
        };

        const oExpectedView = {
            id: "userLanguageAndRegion",
            viewName: "sap.ushell.adapters.cdm.Settings.UserLanguageAndRegion.UserLanguageAndRegion"
        };

        this.oUser.getLanguage.returns(oExpectedModel.selectedLanguage);
        this.oUser.getLanguageText.returns(oExpectedModel.selectedLanguageText);
        this.oUser.isLanguagePersonalized.returns(oExpectedModel.isLanguagePersonalized);
        this.oUserInfoService.getLanguageList.returns(new jQuery.Deferred().reject(new Error("Failed intentionally")).promise());

        const oContract = UserLanguageAndRegionEntry.getEntry();

        return oContract.contentFunc().then((oView) => {
            // Assert
            assert.ok(oView, "View was created");
            assert.equal(oView.getId(), oExpectedView.id, "view has correct id");
            assert.equal(oView.getViewName(), oExpectedView.viewName, "view has correct viewName");
            assert.deepEqual(oView.getModel().getData(), oExpectedModel, "The correct model is set");

            assert.ok(this.oUserInfoService.getLanguageList.calledOnce, "getLanguageList was called once");
            assert.ok(this.fnLogErrorSpy.calledOnce, "log.error called once");
            oView.destroy();
        });
    });

    QUnit.test("onSave: resolve promise when view not created", function (assert) {
        // Arrange
        // Act
        const oContract = UserLanguageAndRegionEntry.getEntry();
        return oContract.onSave()
            .then(() => {
                // Assert
                assert.ok(this.fnLogWarningSpy.calledOnce, "the warning was logged");
            });
    });

    QUnit.test("onSave: resolve when no changes", function (assert) {
        // Arrange
        let oViewInstance;

        this.oUser.getLanguage.returns("en");
        this.oUser.getLanguageText.returns("English");
        this.oUser.isLanguagePersonalized.returns(true);
        this.oUserInfoService.getLanguageList.returns(
            new jQuery.Deferred().resolve([
                {
                    key: "en",
                    text: "English"
                },
                {
                    key: "de-DE",
                    text: "German (Germany)"
                }
            ]).promise()
        );
        const fnUpdateUserPreferences = sandbox.stub();
        // Act
        const oContract = UserLanguageAndRegionEntry.getEntry();
        return oContract.contentFunc().then((oView) => {
            oViewInstance = oView;
            return oContract.onSave(fnUpdateUserPreferences);
        })
            .then((oResult) => {
                // Assert
                assert.ok(this.oUser.setLanguage.notCalled, "language should not be changed");
                assert.ok(fnUpdateUserPreferences.notCalled, "language should not be changed");
                assert.equal(oResult, undefined, "no result is returned: no FLP refresh, `user-context` cookie not to be cleared");
            })
            .finally(() => {
                oViewInstance.destroy();
            });
    });

    QUnit.test("onSave: resolve when there are changes", function (assert) {
        // Arrange
        let oViewInstance;
        this.oUser.getLanguage.returns("en");
        this.oUser.getLanguageText.returns("English");
        this.oUser.isLanguagePersonalized.returns(false);
        this.oUserInfoService.getLanguageList.returns(
            new jQuery.Deferred().resolve([
                {
                    key: "default",
                    text: "Browser Language"
                },
                {
                    key: "en-GB",
                    text: "English British"
                },
                {
                    key: "de-DE",
                    text: "German (Germany)"
                }
            ]).promise()
        );
        const fnUpdateUserPreferences = sandbox.stub().resolves();

        // Act
        const oContract = UserLanguageAndRegionEntry.getEntry();
        return oContract.contentFunc().then((oView) => {
            oViewInstance = oView;
            oView.getModel().setProperty("/selectedLanguage", "de-DE");
            return oContract.onSave(fnUpdateUserPreferences);
        })
            .then((oResult) => {
                // Assert
                assert.ok(this.oUser.setLanguage.calledOnce, "language should be changed");
                assert.ok(this.oUser.resetChangedProperty.callCount, 5, "all change properties shall be reset");
                assert.ok(fnUpdateUserPreferences.calledOnce, "language should be changed");
                assert.deepEqual(oResult, { refresh: true, clearSapUserContextCookie: true, obsoleteUrlParams: ["sap-language"] },
                    "FLP should be refreshed, `sap-usercontext` cookie to be cleared, `sap-language` URL parameter is obsolete");
            })
            .finally(() => {
                oViewInstance.destroy();
            });
    });

    QUnit.test("onSave: resolve when service fails", function (assert) {
        // Arrange
        let oViewInstance;
        this.oUser.getLanguage.returns("en");
        this.oUser.getLanguageText.returns("English");
        this.oUser.isLanguagePersonalized.returns(false);
        this.oUserInfoService.getLanguageList.returns(
            new jQuery.Deferred().resolve([
                {
                    key: "default",
                    text: "Browser Language"
                },
                {
                    key: "en-GB",
                    text: "English British"
                },
                {
                    key: "de-DE",
                    text: "German (Germany)"
                }
            ]).promise()
        );

        const fnUpdateUserPreferences = sandbox.stub().returns(Promise.reject(new Error("error")));

        // Act
        const oContract = UserLanguageAndRegionEntry.getEntry();
        return oContract.contentFunc().then((oView) => {
            oViewInstance = oView;
            oView.getModel().setProperty("/selectedLanguage", "de-DE");
            return oContract.onSave(fnUpdateUserPreferences);
        })
            .then((oResult) => {
                // Assert
                assert.ok(false, "The promise should be rejected123");
            })
            .catch((args) => {
                assert.ok(true, "The promise should be rejected456");
                assert.ok(this.oUser.setLanguage.called, 0, "setLanguage should not be called");
                assert.ok(this.oUser.resetChangedProperty.called, 1, "resetChangedProperty should be called");
                assert.ok(this.fnLogErrorSpy.calledOnce, "the error message should be logged");
            })
            .finally(() => {
                oViewInstance.destroy();
            });
    });

    QUnit.test("onCancel: resolve promise when view was not created", function (assert) {
        // Arrange
        // Act
        const oContract = UserLanguageAndRegionEntry.getEntry();
        oContract.onCancel();
        // Assert
        assert.ok(this.fnLogWarningSpy.calledOnce, "the warning was logged");
    });

    QUnit.test("onCancel: call the onCancel from controller", function (assert) {
        // Arrange
        this.oUser.getLanguage.returns("en");
        this.oUser.getLanguageText.returns("English");
        this.oUser.isLanguagePersonalized.returns(false);
        this.oUserInfoService.getLanguageList.returns(
            new jQuery.Deferred().resolve([
                {
                    key: "default",
                    text: "Browser Language"
                },
                {
                    key: "en-GB",
                    text: "English British"
                },
                {
                    key: "de-DE",
                    text: "German (Germany)"
                }
            ]).promise()
        );
        // Act
        const oContract = UserLanguageAndRegionEntry.getEntry();
        return oContract.contentFunc().then((oView) => {
            oView.getModel().setProperty("/selectedLanguage", "de-DE");
            oContract.onCancel();
            // Assert
            assert.equal(oView.getModel().getProperty("/selectedLanguage"), "default", "the language was reset");
            oView.destroy();
        });
    });

    QUnit.test("onCancel: call the onCancel from controller when no languages are loaded", function (assert) {
        // Arrange
        this.oUser.getLanguage.returns("en");
        this.oUser.getLanguageText.returns("English");
        this.oUser.isLanguagePersonalized.returns(false);
        this.oUserInfoService.getLanguageList.returns(
            new jQuery.Deferred().resolve(null).promise()
        );
        // Act
        const oContract = UserLanguageAndRegionEntry.getEntry();
        return oContract.contentFunc().then((oView) => {
            oContract.onCancel();
            // Assert
            assert.equal(oView.getModel().getProperty("/selectedLanguage"), "en", "the language was reset");
            oView.destroy();
        });
    });

    QUnit.test("_loadLanguagesList is called when enableSetLanguage is true", async function (assert) {
        const done = assert.async();

        const loadLanguagesListPromise = new Promise((resolvedLanguages) => resolvedLanguages);

        const loadLanguagesListStub = sandbox.stub(this.oController, "_loadLanguagesList").returns(loadLanguagesListPromise);

        //  Act
        await this.oController.onInit(); // this triggers _loadLanguagesList, but it hasn’t resolved yet

        //  Assert  after promise resolution
        assert.ok(loadLanguagesListStub.calledOnce, "_loadLanguagesList was called");

        done();
    });

    QUnit.test("_loadLanguagesList is NOT called when enableSetLanguage is false", async function (assert) {
        const done = assert.async();

        const loadLanguagesListStub = sandbox.stub(this.oController, "_loadLanguagesList");

        this.oShellConfig.enableSetLanguage = false;
        //  Act
        await this.oController.onInit(); // this triggers _loadLanguagesList, but it hasn’t resolved yet

        //  Assert  after promise resolution
        assert.strictEqual(loadLanguagesListStub.callCount, 0, "_loadLanguagesList should not be called");

        done();
    });
});
