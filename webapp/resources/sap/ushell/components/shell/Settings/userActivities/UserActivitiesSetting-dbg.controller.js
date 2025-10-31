// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/components/SharedComponentUtils",
    "sap/ushell/Config",
    "sap/base/Log",
    "sap/ushell/resources",
    "sap/ushell/Container"
], (
    Controller,
    JSONModel,
    SharedComponentUtils,
    Config,
    Log,
    resources,
    Container
) => {
    "use strict";

    return Controller.extend("sap.ushell.components.shell.Settings.userActivities.UserActivitiesSetting", {
        onInit: function () {
            const bTrackingEnabled = Config.last("/core/shell/model/enableTrackingActivity") !== undefined ?
                Config.last("/core/shell/model/enableTrackingActivity") :
                true;
            this.oModel = new JSONModel({checkboxIsChecked: bTrackingEnabled});
            this.getView().setModel(this.oModel);
            this.getView().setModel(resources.i18nModel, "i18n");
        },

        /**
         * Called when the "Cancel" button was pressed. Resets the changes.
         *
         * @private
         */
        onCancel: function () {
            const bTrackingEnabled = Config.last("/core/shell/model/enableTrackingActivity") !== undefined ?
                Config.last("/core/shell/model/enableTrackingActivity") :
                true;
            this.oModel.setProperty("/checkboxIsChecked", bTrackingEnabled);
        },

        /**
         * Called when the "Save" button is pressed. Saves the current settings in case they have changed.
         *
         * @returns {Promise<undefined>} A promise that resolves when the settings have changed successfully or when there were no changes made.
         * @private
         */
        onSave: function () {
            if (Config.last("/core/shell/model/enableTrackingActivity") !== this.oModel.getProperty("/checkboxIsChecked")) {
                return this._setTrackingToEnabled(this.oModel.getProperty("/checkboxIsChecked"));
            }
            return Promise.resolve();
        },

        /**
         * Enables or disables the tracking of user activities in the ushell.
         *
         * @param {boolean} enabled Whether to activate or de-activate it.
         * @returns {Promise<undefined>} A promise that resolves when the settings were changed succesfully.
         * @private
         */
        _setTrackingToEnabled: function (enabled) {
            return SharedComponentUtils.getPersonalizer("userActivitesTracking", Container.getRendererInternal("fiori2"))
                .then((oPersonalizer) => {
                    return oPersonalizer.setPersData(enabled);
                })
                .then(() => {
                    Config.emit("/core/shell/model/enableTrackingActivity", enabled);
                })
                .catch((oError) => {
                    // Log failure if occurs.
                    Log.error(
                        "Failed to save the user activities tracking in personalization", oError,
                        "sap.ushell.components.ushell.settings.userActivities.UserActivitiesSetting");
                    throw oError;
                });
        },

        /**
         * Called when the "Clear my history" button is pressed. Clears the user activity history.
         *
         * @private
         */
        onClearHistory: async function () {
            const oUserRecentsService = await Container.getServiceAsync("UserRecents");
            await oUserRecentsService.clearRecentActivities();

            return new Promise((resolve, reject) => {
                sap.ui.require(["sap/m/MessageToast"], (MessageToast) => {
                    MessageToast.show(resources.i18n.getText("historyCleared"));
                    resolve();
                }, reject);
            });
        }
    });
});
