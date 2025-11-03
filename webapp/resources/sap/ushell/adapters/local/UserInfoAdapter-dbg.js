// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview The UserInfo adapter for the demo platform.
 * @version 1.141.0
 */
sap.ui.define([
    "sap/ui/thirdparty/jquery",
    "sap/base/util/ObjectPath",
    "sap/base/Log",
    "sap/ushell/Container"
], (jQuery, ObjectPath, Log, Container) => {
    "use strict";

    /**
     * This demo adapter reads its configuration from the demo config, where the target applications are defined.
     *
     * @param {object} oSystem system information, not in use.
     * @param {string} sParameter parameter string, not in use.
     * @param {object} oAdapterConfiguration the configuation of the adapter.
     */
    function UserInfoAdapter (oSystem, sParameter, oAdapterConfiguration) {
        let oUserThemeConfiguration;

        /**
         * Generates the theme configuration for the user based on the external configuration
         * provided in window['sap-ushell-config'].
         *
         * @param {object} oAdapterThemesConfiguration
         *     the configuration specified by the user externally
         *
         * @returns {object}
         *     the theme configuration array for getThemeList method
         *
         * @private
         */
        function generateThemeConfiguration (oAdapterThemesConfiguration) {
            const defaultConfig = [
                { id: "sap_horizon", name: "SAP Morning Horizon" },
                { id: "sap_horizon_dark", name: "SAP Evening Horizon" },
                { id: "sap_horizon_hcb", name: "SAP High Contrast Black (SAP Horizon)" },
                { id: "sap_horizon_hcw", name: "SAP High Contrast White (SAP Horizon)" },
                { id: "sap_fiori_3", name: "SAP Quartz Light" },
                { id: "sap_fiori_3_dark", name: "SAP Quartz Dark" },
                { id: "sap_fiori_3_hcb", name: "SAP Quartz High Contrast Black" },
                { id: "sap_fiori_3_hcw", name: "SAP Quartz High Contrast White" },
                { id: "theme1_id", name: "Custom Theme" }
            ];
            const externalConfig = ObjectPath.get("config.themes", oAdapterThemesConfiguration);

            return externalConfig === undefined ? defaultConfig : externalConfig;
        }

        this.updateUserPreferences = function (oUser) {
            const oDeferred = new jQuery.Deferred();

            Container.getServiceAsync("PersonalizationV2").then((oPersonalizationService) => {
                const oScope = {
                    keyCategory: oPersonalizationService.KeyCategory.FIXED_KEY,
                    writeFrequency: oPersonalizationService.WriteFrequency.LOW,
                    clientStorageAllowed: true
                };

                function setChangedPropertiesInContainer (oContainer, oUser) {
                    const aChangedProperties = oUser.getChangedProperties() || [];

                    aChangedProperties.forEach((oChange) => {
                        oContainer.setItemValue(oChange.propertyName, oChange.newValue);
                    });
                }

                oPersonalizationService.getContainer("sap.ushell.UserProfile", oScope, undefined)
                    .then((oContainer) => {
                        setChangedPropertiesInContainer(oContainer, oUser);
                        oContainer.save()
                            .then(() => {
                                oDeferred.resolve();
                            })
                            .catch((oError) => {
                                Log.error("Failed to update user preferences:", oError, "com.sap.ushell.adapters.local.UserInfo");
                                oDeferred.reject(oError);
                            });
                    })
                    .catch((oError) => {
                        Log.error("Failed to update user preferences:", oError, "com.sap.ushell.adapters.local.UserInfo");
                        oDeferred.reject(oError);
                    });
            });

            return oDeferred.promise();
        };

        this.getThemeList = function () {
            const oDeferred = new jQuery.Deferred();

            // make sure a configuration is available
            if (oUserThemeConfiguration === undefined) {
                oUserThemeConfiguration = generateThemeConfiguration(oAdapterConfiguration);
            }

            // we need to have at least one theme
            if (oUserThemeConfiguration.length === 0) {
                oDeferred.reject(new Error("no themes were configured"));
            } else {
                oDeferred.resolve({
                    options: oUserThemeConfiguration
                });
            }

            return oDeferred.promise();
        };

        this.getLanguageList = function () {
            const oDeferred = new jQuery.Deferred();
            oDeferred.resolve(
                [
                    {
                        text: "Browser Language",
                        key: "default"
                    },
                    {
                        text: "American English",
                        key: "en-US"
                    },
                    {
                        text: "British English",
                        key: "en-GB"
                    },
                    {
                        text: "English",
                        key: "en"
                    },
                    {
                        text: "German",
                        key: "de"
                    },
                    {
                        text: "Hebrew",
                        key: "he"
                    },
                    {
                        text: "Russian",
                        key: "ru"
                    }
                ]
            );

            return oDeferred.promise();
        };
    }

    return UserInfoAdapter;
}, /* bExport= */ false);
