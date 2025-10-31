// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/Log",
    "sap/base/i18n/Formatting",
    "sap/ui/core/Locale",
    "sap/ui/core/LocaleData",
    "sap/ui/core/format/DateFormat",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/performance/Measurement",
    "sap/ushell/Config",
    "sap/ushell/Container"
], (
    Log,
    Formatting,
    Locale,
    LocaleData,
    DateFormat,
    Controller,
    JSONModel,
    Measurement,
    Config,
    Container
) => {
    "use strict";

    return Controller.extend("sap.ushell.components.shell.Settings.userLanguageRegion.LanguageRegionSelector", {
        onInit: function () {
            this.oUserInfoServicePromise = Container.getServiceAsync("UserInfo");
            this.oUserInfoServicePromise
                .then((UserInfo) => {
                    this.oUser = Container.getUser();

                    const oLocale = new Locale(Formatting.getLanguageTag());
                    const oLocaleData = LocaleData.getInstance(oLocale);
                    let sDatePattern; let sTimePattern; let sTimeFormat; let sNumberFormat; let sCalendarWeekNumbering;

                    const bIsEnableSetLanguage = Container.getRendererInternal("fiori2").getShellConfig().enableSetLanguage || false;
                    const bIsLanguagePersonalized = this.oUser.isLanguagePersonalized();
                    const bIsEnableSetUserPreference = UserInfo.getUserSettingListEditSupported();// Check if adapter supports user setting editing

                    const aUserPreferenceAndLanguageSettingPromises = [];

                    // todo: ABAP specific code should be moved to ushell_abap
                    // Some preferences are managed by CUA (Central User Administration) and should not be set by the user in FLP settings
                    // The ABAP platform sets only 1 (read_only) and 3 (optional) to the related fields. For read_only fields, set editable to false.
                    // Note: CUA editState flags are available only on ABAP platform.
                    const _isEnabled = (sParameter) => this.oUser.getEditState(sParameter) !== 1;
                    const oCuaFlags = {
                        preferredLogonLanguage: _isEnabled("PREFERRED_LOGON_LANGUAGE"),
                        dateFormat: _isEnabled("DATE_FORMAT"),
                        timeFormat: _isEnabled("TIME_FORMAT"),
                        numberFormat: _isEnabled("NUMBER_FORMAT"),
                        timeZone: _isEnabled("TIME_ZONE")
                    };
                    oCuaFlags.showWarning = Object.values(oCuaFlags).some((bEnabled) => bEnabled === false);

                    if (bIsEnableSetUserPreference) {
                        sDatePattern = Formatting.getABAPDateFormat();
                        sTimeFormat = Formatting.getABAPTimeFormat();
                        sNumberFormat = this._getABAPNumberFormat();
                        sCalendarWeekNumbering = this.oUser.getCalendarWeekNumbering?.() || "Default";
                        aUserPreferenceAndLanguageSettingPromises.push(this._loadUserSettingList());
                    } else {
                        sDatePattern = oLocaleData.getDatePattern("medium");
                        sTimePattern = oLocaleData.getTimePattern("medium");
                        sTimeFormat = (sTimePattern.indexOf("H") === -1) ? "12h" : "24h";
                        sCalendarWeekNumbering = "Default";
                    }

                    const oModel = new JSONModel({
                        languageList: null,
                        DateFormatList: null,
                        TimeFormatList: null,
                        NumberFormatList: null,
                        TimeZoneList: null,
                        CalendarWeekNumberingList: null,
                        cuaFlags: oCuaFlags,
                        selectedLanguage: this.oUser.getLanguage(),
                        selectedLanguageText: this.oUser.getLanguageText(),
                        selectedDatePattern: sDatePattern,
                        selectedTimeFormat: sTimeFormat,
                        selectedNumberFormat: sNumberFormat,
                        selectedTimeZone: this.oUser.getTimeZone(),
                        selectedCalendarWeekNumbering: sCalendarWeekNumbering,
                        isSettingsLoaded: true,
                        isLanguagePersonalized: bIsLanguagePersonalized,
                        isEnableSetLanguage: bIsEnableSetLanguage,
                        isEnableUserProfileSetting: bIsEnableSetUserPreference,
                        isTimeZoneFromServerInUI5: Config.last("/core/ui5/timeZoneFromServerInUI5")
                    });
                    oModel.setSizeLimit(1000);

                    if (bIsEnableSetLanguage) {
                        aUserPreferenceAndLanguageSettingPromises.push(this._loadLanguagesList());
                    }
                    if (aUserPreferenceAndLanguageSettingPromises.length > 0) {
                        this.getView().setBusy(true);
                        return Promise.all(aUserPreferenceAndLanguageSettingPromises).then((aResults) => {
                            const oUserSettingList = bIsEnableSetUserPreference ? aResults[0] : null;
                            let aLanguageList = null;
                            if (bIsEnableSetLanguage) {
                                aLanguageList = aResults.length === 1 ? aResults[0] : aResults[1];
                            }

                            if (aLanguageList?.length > 1) {
                                oModel.setProperty("/languageList", aLanguageList);
                                const bHasDefault = aLanguageList.some((oLanguage) => {
                                    return oLanguage.key === "default";
                                });
                                if (!bIsLanguagePersonalized && bHasDefault) {
                                    oModel.setProperty("/selectedLanguage", "default");
                                }
                            }
                            if (oUserSettingList?.TIME_FORMAT?.length > 0) {
                                oModel.setProperty("/TimeFormatList", oUserSettingList.TIME_FORMAT);
                            }
                            if (oUserSettingList?.DATE_FORMAT?.length > 0) {
                                oModel.setProperty("/DateFormatList", oUserSettingList.DATE_FORMAT);
                            }
                            if (oUserSettingList?.TIME_ZONE?.length > 0) {
                                const oDateTimeWithTimezone = DateFormat.getDateTimeWithTimezoneInstance({showDate: false, showTime: false});
                                const aTimeZones = oUserSettingList.TIME_ZONE.map((timeZone) => {
                                    const sTimeZomeText = oDateTimeWithTimezone.format(null, timeZone.description) || timeZone.description;
                                    return {description: sTimeZomeText, value: timeZone.value};
                                });
                                oModel.setProperty("/TimeZoneList", aTimeZones);
                            }
                            if (oUserSettingList?.NUMBER_FORMAT?.length > 0) {
                                oModel.setProperty("/NumberFormatList", oUserSettingList.NUMBER_FORMAT);
                            }
                            if (oUserSettingList?.CALENDAR_WEEK_NUMBERING) {
                                const aCalendarWeekList = UserInfo.getCalendarWeekNumberingList()
                                    .map(/* updateSelectedNumbering */ (numbering) => {
                                        numbering.selected = numbering.value === oModel.getProperty("/selectedCalendarWeekNumbering");
                                        return numbering;
                                    });
                                oModel.setProperty(
                                    "/CalendarWeekNumberingList",
                                    aCalendarWeekList
                                );
                            }

                            this.oView.setModel(oModel);
                            this.getView().setBusy(false);
                        });
                    }
                    this.oView.setModel(oModel);
                });
        },

        /**
         * Load language via userInfoService API
         * @returns {Promise<object[]>} the language list from the platforms
         * @private
         */
        _loadLanguagesList: function () {
            Measurement.start("FLP:LanguageRegionSelector._getLanguagesList", "_getLanguagesList", "FLP");
            return this.oUserInfoServicePromise
                .then((UserInfo) => {
                    return new Promise((resolve) => {
                        Measurement.start("FLP:LanguageRegionSelector._getLanguagesList", "_getLanguagesList", "FLP");
                        UserInfo.getLanguageList()
                            .done((oData) => {
                                Measurement.end("FLP:LanguageRegionSelector._getLanguagesList");
                                resolve(oData);
                            })
                            .fail((error) => {
                                Measurement.end("FLP:LanguageRegionSelector._getLanguagesList");
                                Log.error("Failed to load language list.", error,
                                    "sap.ushell.components.ushell.settings.userLanguageRegion.LanguageRegionSelector.controller");
                                resolve(null);
                            });
                    });
                });
        },

        /**
         * Load User Profile settings List via userInfoService API
         * @returns {Promise} the Language List ,Date Format List,Time Format list and Time Zone List from the platforms
         * @private
         */
        _loadUserSettingList: function () {
            Measurement.start("FLP:LanguageRegionSelector._loadUserSettingList", "_loadUserSettingList", "FLP");
            return this.oUserInfoServicePromise
                .then((UserInfo) => {
                    return new Promise((resolve) => {
                        Measurement.start("FLP:LanguageRegionSelector._loadUserSettingList", "_loadUserSettingList", "FLP");
                        UserInfo.getUserSettingList()
                            .then((oData) => {
                                Measurement.end("FLP:LanguageRegionSelector._loadUserSettingList");
                                resolve(oData);
                            });
                    });
                });
        },

        _resetLanguage: function () {
            const oUserLanguage = this.oUser.getLanguage();
            const oModel = this.getView().getModel();
            const oModelData = oModel.getData();
            // if the user language isn't personalzied - need to return browser language in select
            const sSelectedLanguage = oModelData.isLanguagePersonalized ? oUserLanguage : "default";
            oModel.setProperty("/selectedLanguage", sSelectedLanguage);
            // Date and time format are taken from current language
            this._updateTextFields(oUserLanguage);
        },

        onCancel: function () {
            const oModel = this.getView().getModel();
            const oModelData = oModel.getData();
            const aLanguageList = oModelData.languageList;
            const isEnableSetLanguage = oModelData.isEnableSetLanguage;
            if (isEnableSetLanguage && aLanguageList) {
                this._resetLanguage();
            }
            if (oModelData.isEnableUserProfileSetting) {
                this._restoreUserSettingPreferenceValues();
            }
        },
        onSaveSuccess: function (oUser, bUpdateLanguage, sSelectedLanguage) {
            const oResolvedResult = {
                refresh: true
            };
            oUser.resetChangedProperty("dateFormat");
            oUser.resetChangedProperty("timeFormat");
            oUser.resetChangedProperty("numberFormat");
            oUser.resetChangedProperty("timeZone");
            oUser.resetChangedProperty("calendarWeekNumbering");
            if (bUpdateLanguage) {
                Log.debug("[000] onSaveSuccess: oUser.resetChangedPropertyLanguage:", "LanguageRegionSelector.controller");
                oUser.resetChangedProperty("language");
                oResolvedResult.obsoleteUrlParams = ["sap-language"];
                oResolvedResult.clearSapUserContextCookie = true; // Language related content in `sap-usercontext` cookie is invalid now.
            }
            return oResolvedResult; // refresh the page to apply changes.
        },

        /**
         * Event fired on the Save of the Language and Region Settings
         * @param {function} fnUpdateUserPreferences A function to update user preferences.
         * @returns {Promise<object>} oResolvedResult Promise that resolves with the save result containing urlParams and a refresh parameter
         *    and rejects with a message object.
         * @private
         */
        onSave: function (fnUpdateUserPreferences) {
            const oUser = this.oUser;
            const oModelData = this.getView().getModel().getData();
            const sSelectedLanguage = oModelData.selectedLanguage;
            const sOriginLanguage = oUser.getLanguage();
            const bLanguageChanged = sSelectedLanguage && sSelectedLanguage !== (oModelData.isLanguagePersonalized ? sOriginLanguage : "default");
            const bIsEnableSetUserProfileSetting = oModelData.isEnableUserProfileSetting;
            const bUpdateLanguage = oModelData.isEnableSetLanguage && oModelData.languageList && bLanguageChanged;
            let bUpdate = false;
            const aPropertyNames = [
                "DATE_FORMAT",
                "TIME_FORMAT",
                "NUMBER_FORMAT",
                "TIME_ZONE",
                "LANGUAGE",
                "CALENDAR_WEEK_NUMBERING"
            ];
            Log.debug("[000] LanguageRegionSelector:onSave:bUpdateLanguage, bIsEnableSetUserProfileSetting:", bUpdateLanguage, "LanguageRegionSelector.controller");
            if (bUpdateLanguage) {
                Log.debug("[000] LanguageRegionSelector:onSave:UserInfo: oUser.setLanguage:", sSelectedLanguage, "LanguageRegionSelector.controller");
                oUser.setLanguage(sSelectedLanguage);
            } else {
                this._resetLanguage();
            }

            if (bIsEnableSetUserProfileSetting) {
                if (Formatting.getABAPDateFormat() !== oModelData.selectedDatePattern) {
                    bUpdate = true;
                    oUser.setChangedProperties({
                        propertyName: "dateFormat",
                        name: "DATE_FORMAT"
                    }, Formatting.getABAPDateFormat(), oModelData.selectedDatePattern);
                }
                if (Formatting.getABAPTimeFormat() !== oModelData.selectedTimeFormat) {
                    bUpdate = true;
                    oUser.setChangedProperties({
                        propertyName: "timeFormat",
                        name: "TIME_FORMAT"
                    }, Formatting.getABAPTimeFormat(), oModelData.selectedTimeFormat);
                }

                if (this._getABAPNumberFormat() !== oModelData.selectedNumberFormat) {
                    bUpdate = true;
                    oUser.setChangedProperties({
                        propertyName: "numberFormat",
                        name: "NUMBER_FORMAT"
                    }, this._getABAPNumberFormat(), oModelData.selectedNumberFormat);
                }
                if (!oModelData.selectedTimeZone) { // Reset invalid time zone entry
                    this.getView().getModel().setProperty("/selectedTimeZone", this.oUser.getTimeZone());
                } else if (this.oUser.getTimeZone() !== oModelData.selectedTimeZone) {
                    bUpdate = true;
                    oUser.setChangedProperties({
                        propertyName: "timeZone",
                        name: "TIME_ZONE"
                    }, this.oUser.getTimeZone(), oModelData.selectedTimeZone);
                }
                if (Formatting.getCalendarWeekNumbering() !== oModelData.selectedCalendarWeekNumbering) {
                    bUpdate = true;
                    oUser.setChangedProperties({
                        propertyName: "calendarWeekNumbering",
                        name: "CALENDAR_WEEK_NUMBERING"
                    }, Formatting.getCalendarWeekNumbering(), oModelData.selectedCalendarWeekNumbering.trim());
                    Formatting.setCalendarWeekNumbering(oModelData.selectedCalendarWeekNumbering);
                }
            }
            if (bUpdateLanguage || bUpdate) {
                return fnUpdateUserPreferences()
                    .then(() => {
                        Log.debug("[000] onSave:fnUpdateUserPreferences", "LanguageRegionSelector.controller");
                        return this.onSaveSuccess(oUser, bUpdateLanguage, sSelectedLanguage);
                    })
                    // in case of failure - return to the original language
                    .catch((oError) => {
                        Log.debug("[000] onSave:catch:errorMessage", oError, "LanguageRegionSelector.controller");
                        const bSomeNamesInErrorMessage = aPropertyNames.some((sName) => {
                            return oError.message.includes(sName);
                        });
                        if (!bSomeNamesInErrorMessage) {
                            return this.onSaveSuccess(oUser, bUpdateLanguage, sSelectedLanguage);
                        }
                        if (bUpdateLanguage) {
                            oUser.setLanguage(sOriginLanguage);
                            oUser.resetChangedProperty("language");
                            this._updateTextFields(sOriginLanguage);
                        }
                        oUser.resetChangedProperty("dateFormat");
                        oUser.resetChangedProperty("timeFormat");
                        oUser.resetChangedProperty("numberFormat");
                        oUser.resetChangedProperty("timeZone");
                        oUser.resetChangedProperty("calendarWeekNumbering");

                        if (oModelData.isEnableUserProfileSetting) {
                            this._restoreUserSettingPreferenceValues();
                        }
                        Log.error("Failed to save Language and Region Settings", oError,
                            "sap.ushell.components.ushell.settings.userLanguageRegion.LanguageRegionSelector.controller");
                        throw oError;
                    });
            }
            return Promise.resolve();
        },
        /**
         * Restores the User settings Preference original values
         *
         * @private
         */
        _restoreUserSettingPreferenceValues: function () {
            const oModel = this.getView().getModel();
            oModel.setProperty("/selectedDatePattern", Formatting.getABAPDateFormat());
            oModel.setProperty("/selectedTimeFormat", Formatting.getABAPTimeFormat());
            oModel.setProperty("/selectedNumberFormat", this._getABAPNumberFormat());
            oModel.setProperty("/selectedTimeZone", this.oUser.getTimeZone());
            oModel.setProperty("/selectedCalendarWeekNumbering", Formatting.getCalendarWeekNumbering());
            // restore calendar week numbering
            const aCalendarWeekList = oModel.getProperty("/CalendarWeekNumberingList")
                .map(/* updateSelectedNumberingWithSavedValue */ (numbering) => {
                    numbering.selected = numbering.value === Formatting.getCalendarWeekNumbering();
                    return numbering;
                });
            oModel.setProperty(
                "/CalendarWeekNumberingList",
                aCalendarWeekList
            );
        },

        /**
         * This method call handle the change in the selection language
         * @param {string} oEvent control event
         * @private
         */
        _handleLanguageSelectChange: function (oEvent) {
            const sSelectedLanguage = oEvent.getSource().getSelectedKey();
            if (sSelectedLanguage) {
                this._updateTextFields(sSelectedLanguage);
            }
        },

        /**
         * Update Date and Time text fields
         * @param {string} language the newly selected language
         * @private
         */
        _updateTextFields: function (language) {
            let oLocale;

            if (language === this.oUser.getLanguage()) {
                oLocale = new Locale(Formatting.getLanguageTag());
            } else {
                oLocale = new Locale(language);
            }

            const oModel = this.getView().getModel();
            const oLocaleData = LocaleData.getInstance(oLocale);
            const sDatePattern = oLocaleData.getDatePattern("medium");
            const sTimePattern = oLocaleData.getTimePattern("medium");
            const sTimeFormat = (sTimePattern.indexOf("H") === -1) ? "12h" : "24h";
            if (!oModel.getData().isEnableUserProfileSetting) {
                oModel.setProperty("/selectedDatePattern", sDatePattern);
                oModel.setProperty("/selectedTimeFormat", sTimeFormat);
            }
        },

        /**
         * Returns the ABAP number format from the sap.base.i18n.Formatting.
         * ATTENTION: We store the legacy number format as a string with a space character (" ") in the core config, while
         * the key returned by the backend is an empty string (""). Therefore we must convert it to empty string to make
         * valid comparisons.
         *
         * @returns {string|undefined} The number format if it exists or undefined if not.
         * @private
         */
        _getABAPNumberFormat: function () {
            const sABAPNumberFormat = Formatting.getABAPNumberFormat();
            if (sABAPNumberFormat) {
                return sABAPNumberFormat.trim();
            }
        },

        /**
         * Handle Change event of RadioButton List for Calendar Week Handling and update model
         * @param {Event} oEvent the event data of the change handler
         * @since 1.118.0
         * @private
         */
        _handleCalendarWeekNumberingChange: function (oEvent) {
            const sSelectedItem = oEvent.getSource().getSelectedItem().getCustomData()[0].getValue();
            this.getView().getModel().setProperty("/selectedCalendarWeekNumbering", sSelectedItem);
        }
    });
});
