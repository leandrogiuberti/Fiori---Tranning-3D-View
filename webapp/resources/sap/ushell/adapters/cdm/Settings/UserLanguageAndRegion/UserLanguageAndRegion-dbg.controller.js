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
    "sap/ushell/Container",
    "sap/ui/core/format/NumberFormat",
    "sap/base/i18n/Localization",
    "sap/ushell/resources"
], (
    Log,
    Formatting,
    Locale,
    LocaleData,
    DateFormat,
    Controller,
    JSONModel,
    Measurement,
    Container,
    NumberFormat,
    Localization,
    oResources
) => {
    "use strict";

    return Controller.extend("sap.ushell.adapters.cdm.Settings.UserLanguageAndRegion.UserLanguageAndRegion", {
        onInit: function () {
            this.oUser = Container.getUser();

            const oLocale = new Locale(Formatting.getLanguageTag());

            const bIsEnableSetLanguage = Container.getRendererInternal("fiori2").getShellConfig().enableSetLanguage || false;
            const bIsLanguagePersonalized = this.oUser.isLanguagePersonalized();

            const { sTimeFormat, sExampleDate, sDecimalFormat, sWorkWeek, sTimeZone } = this._getParsedLocaleProperties(oLocale);

            const oModel = new JSONModel({
                languageList: null,
                selectedLanguage: this.oUser.getLanguage(),
                selectedLanguageText: this.oUser.getLanguageText(),
                selectedDateFormat: sExampleDate,
                selectedTimeFormat: sTimeFormat,
                selectedDecimalFormat: sDecimalFormat,
                selectedTimeZone: sTimeZone,
                isLanguagePersonalized: bIsLanguagePersonalized,
                selectedWorkWeek: sWorkWeek
            });

            if (bIsEnableSetLanguage) {
                this.getView().setBusy(true);

                this._loadLanguagesList().then((aLanguageList) => {
                    if (aLanguageList?.length > 1) {
                        oModel.setProperty("/languageList", aLanguageList);

                        if (!bIsLanguagePersonalized) {
                            const bHasDefault = aLanguageList.some((oLanguage) => {
                                return oLanguage.key === "default";
                            });

                            if (bHasDefault) {
                                oModel.setProperty("/selectedLanguage", "default");
                            }
                        }
                    }

                    this.getView().setBusy(false);
                });
            }

            this.oView.setModel(oModel);
        },

        /**
         * Load language via userInfoService API
         * @returns {Promise<object[]>} the language list from the platforms
         * @private
         */
        _loadLanguagesList: function () {
            Measurement.start("FLP:UserLanguageAndRegion._getLanguagesList", "_getLanguagesList", "FLP");
            return Container.getServiceAsync("UserInfo")
                .then((UserInfo) => {
                    return new Promise((resolve) => {
                        Measurement.start("FLP:UserLanguageAndRegion._getLanguagesList", "_getLanguagesList", "FLP");
                        UserInfo.getLanguageList()
                            .done((oData) => {
                                Measurement.end("FLP:UserLanguageAndRegion._getLanguagesList");
                                resolve(oData);
                            })
                            .fail((error) => {
                                Measurement.end("FLP:UserLanguageAndRegion._getLanguagesList");
                                Log.error("Failed to load language list.", error,
                                    "sap.ushell.components.ushell.settings.UserLanguageAndRegion.UserLanguageAndRegion.controller");
                                resolve(null);
                            });
                    });
                });
        },

        /**
         * Sets language to the previously picked
         * @private
         */
        _resetLanguage: function () {
            const oUserLanguage = this.oUser.getLanguage();
            const oModel = this.getView().getModel();
            const oModelData = oModel.getData();
            // if the user language isn't personalzied - need to return browser language in select
            const sSelectedLanguage = oModelData.isLanguagePersonalized ? oUserLanguage : "default";
            oModel.setProperty("/selectedLanguage", sSelectedLanguage);
            // Date and time format are taken from current language
            this._updateTextFields(sSelectedLanguage);
        },

        onCancel: function () {
            const oModel = this.getView().getModel();
            const oModelData = oModel.getData();
            const aLanguageList = oModelData.languageList;

            if (aLanguageList && aLanguageList.length > 0) {
                this._resetLanguage();
            }
        },

        onSaveSuccess: function (oUser) {
            const oResolvedResult = {
                refresh: true
            };

            Log.debug("[000] onSaveSuccess: oUser.resetChangedPropertyLanguage:", "UserLanguageAndRegion.controller");
            oUser.resetChangedProperty("language");
            oResolvedResult.obsoleteUrlParams = ["sap-language"];
            oResolvedResult.clearSapUserContextCookie = true; // Language related content in `sap-usercontext` cookie is invalid now.

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
            const bUpdateLanguage = oModelData.languageList && oModelData.languageList.length > 0 && bLanguageChanged;

            Log.debug("[000] UserLanguageAndRegion:onSave:bUpdateLanguage:", bUpdateLanguage, "UserLanguageAndRegion.controller");
            if (bUpdateLanguage) {
                Log.debug("[000] UserLanguageAndRegion:onSave:UserInfo: oUser.setLanguage:", sSelectedLanguage, "UserLanguageAndRegion.controller");
                oUser.setLanguage(sSelectedLanguage);

                return fnUpdateUserPreferences()
                    .then(() => {
                        Log.debug("[000] onSave:fnUpdateUserPreferences", "UserLanguageAndRegion.controller");
                        return this.onSaveSuccess(oUser);
                    })
                    // in case of failure - return to the original language
                    .catch((oError) => {
                        Log.debug("[000] onSave:catch:errorMessage", oError, "UserLanguageAndRegion.controller");

                        oUser.setLanguage(sOriginLanguage);
                        oUser.resetChangedProperty("language");
                        this._updateTextFields(sOriginLanguage);

                        Log.error("Failed to save Language and Region Settings", oError,
                            "sap.ushell.adapters.cdm.Settings.cdmUserLanguageRegion.UserLanguageAndRegion.controller");
                        throw oError;
                    });
            }

            this._resetLanguage();
            return Promise.resolve();
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
            Formatting.setLanguageTag(language);
            const oLocale = new Locale(language);

            const { sTimeFormat, sExampleDate, sDecimalFormat, sWorkWeek, sTimeZone } = this._getParsedLocaleProperties(oLocale);
            const oModel = this.getView().getModel();

            oModel.setProperty("/selectedTimeFormat", sTimeFormat);
            oModel.setProperty("/selectedDateFormat", sExampleDate);
            oModel.setProperty("/selectedDecimalFormat", sDecimalFormat);
            oModel.setProperty("/selectedWorkWeek", sWorkWeek);
            oModel.setProperty("/selectedTimeZone", sTimeZone);
        },

        /**
         *
         * @param {sap.ui.core.Locale} oLocale the locale object
         * @returns {object} the parsed locale properties
         * @private
         */
        _getParsedLocaleProperties: function (oLocale) {
            const oLocaleData = LocaleData.getInstance(oLocale);
            const sDatePattern = oLocaleData.getDatePattern("medium");
            const sTimePattern = oLocaleData.getTimePattern("medium");

            const oDateFormat = DateFormat.getDateInstance({
                pattern: sDatePattern
            });

            const sDecimalPattern = oLocaleData.getDecimalPattern();

            const oNumberFormat = NumberFormat.getInstance({
                pattern: sDecimalPattern
            });

            const iStartingWeekend = oLocaleData.getWeekendStart();
            const iEndingWeekend = oLocaleData.getWeekendEnd();

            const aWorkWeekDays = oLocaleData.getDaysStandAlone("wide").filter((_, index) => {
                return index !== iStartingWeekend && index !== iEndingWeekend;
            });

            return {
                sTimeFormat: (sTimePattern.indexOf("H") === -1) ? oResources.i18n.getText("fld12h") : oResources.i18n.getText("fld24h"),
                sExampleDate: oDateFormat.format(new Date()),
                sDecimalFormat: oNumberFormat.format(1000.2),
                sWorkWeek: `${aWorkWeekDays[0]} - ${aWorkWeekDays[aWorkWeekDays.length - 1]}`,
                sTimeZone: Localization.getTimezone()
            };
        }
    });
});
