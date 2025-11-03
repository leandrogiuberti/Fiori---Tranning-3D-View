// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/Device",
    "sap/ushell/Config",
    "sap/ushell/EventHub",
    "sap/base/Log",
    "sap/ui/core/Component",
    "sap/ushell/Container",
    "sap/ushell/utils"
], (
    Device,
    Config,
    EventHub,
    Log,
    Component,
    Container,
    ushellUtils
) => {
    "use strict";

    const oSharedComponentUtils = {
        PERS_KEY: "flp.settings.FlpSettings",
        bFlpSettingsAdded: false,

        /**
         * Toggles the UserActivityLog.
         */
        toggleUserActivityLog: function () {
            EventHub.join(
                EventHub.once("CoreResourcesComplementLoaded"), // sap/ushell/UserActivityLog is preloaded as part of core-ext
                Config.on("/core/extension/SupportTicket")
            ).do(async (oCoreExtResult, bConfigured) => {
                let UserActivityLog = sap.ui.require("sap/ushell/UserActivityLog");

                if (bConfigured && !UserActivityLog) {
                    // only load if required
                    UserActivityLog = (await ushellUtils.requireAsync(["sap/ushell/UserActivityLog"]))[0];
                }

                if (!UserActivityLog) {
                    return;
                }

                if (bConfigured) {
                    UserActivityLog.activate();
                } else {
                    UserActivityLog.deactivate();
                }
            });
        },

        /**
         * Registers component keys.
         */
        initializeAccessKeys: function () {
            if (Device.system.desktop) {
                sap.ui.require([
                    "sap/ushell/components/ComponentKeysHandler",
                    "sap/ushell/renderer/AccessKeysHandler"
                ], (ComponentKeysHandler, AccessKeysHandler) => {
                    ComponentKeysHandler.getInstance().then((ComponentKeysHandlerInstance) => {
                        AccessKeysHandler.registerAppKeysHandler(ComponentKeysHandlerInstance.handleFocusOnMe);
                    });
                });
            }
        },

        /**
         * Retrieves the value of the given config path from the personalization service.
         * If the "enableHomePageSettings" config is explicitly set to false, the value is taken from the FLP config.
         * The personalization item ID is extracted from the given config path.
         *
         * @param {string} sConfigPath The config path.
         * @param {string} [sConfigurablePath] The config path that enables/disables changing the "sConfigPath" config.
         * @returns {Promise<any>} Resolves to the effective config value.
         */
        getEffectiveHomepageSetting: function (sConfigPath, sConfigurablePath) {
            if (Config.last(sConfigurablePath) === false) {
                // change nothing if the config is not allowed to be changed; simply return current config value
                return Promise.resolve(Config.last(sConfigPath));
            }

            const sItemID = sConfigPath.split("/").pop();
            return this._getPersonalization(sItemID)
                .then((sValue) => {
                    if (typeof sValue === "undefined") {
                        // change nothing if the config does not yet exist in the personalization; simply return current config value
                        return Config.last(sConfigPath);
                    }
                    Config.emit(sConfigPath, sValue);
                    return sValue;
                })
                .catch(() => {
                    return Config.last(sConfigPath);
                });
        },

        /**
         * Retrieves the data of the given personalization item.
         *
         * @param {string} sItem The personalization item ID;
         * @returns {Promise<object>} Resolves to the requested config value.
         * @private
         */
        _getPersonalization: function (sItem) {
            return oSharedComponentUtils.getPersonalizer(sItem, Container.getRendererInternal("fiori2"))
                .then((oPersonalizer) => {
                    return oPersonalizer.getPersData();
                })
                .catch((oError) => {
                    Log.error(`Failed to load ${sItem} from the personalization`, oError, "sap.ushell.components.flp.settings.FlpSettings");
                    throw oError;
                });
        },

        /**
         * @param {string} sItem The personalization item ID.
         * @param {object} oComponent The component the personalization is to be retrieved for.
         * @returns {Promise<sap.ushell.services.PersonalizationV2.Personalizer>} Resolves to the personalization content of the given item.
         * @private
         */
        getPersonalizer: function (sItem, oComponent) {
            return Container.getServiceAsync("PersonalizationV2")
                .then((oPersonalizationService) => {
                    const oOwnerComponent = Component.getOwnerComponentFor(oComponent);
                    const oScope = {
                        keyCategory: oPersonalizationService.KeyCategory.FIXED_KEY,
                        writeFrequency: oPersonalizationService.WriteFrequency.LOW,
                        clientStorageAllowed: true
                    };
                    const oPersId = {
                        container: this.PERS_KEY,
                        item: sItem
                    };

                    return oPersonalizationService.getPersonalizer(oPersId, oScope, oOwnerComponent);
                });
        }
    };

    return oSharedComponentUtils;
});
