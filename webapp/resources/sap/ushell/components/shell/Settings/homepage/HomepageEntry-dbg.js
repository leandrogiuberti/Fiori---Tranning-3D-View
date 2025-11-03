// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/Log",
    "sap/ui/core/mvc/XMLView",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/components/SharedComponentUtils",
    "sap/ushell/Config",
    "sap/ushell/resources",
    "sap/ushell/Container"
], (
    Log,
    XMLView,
    JSONModel,
    SharedComponentUtils,
    Config,
    resources,
    Container
) => {
    "use strict";

    const mDisplayModes = {
        scroll: 0,
        tabs: 1,

        getName: function (iValue) {
            return Object.keys(this)[iValue];
        }
    };

    return {
        getEntry: function () {
            let oViewInstance;

            return {
                id: "homepageEntry",
                entryHelpID: "homepageEntry",
                title: resources.i18n.getText("FlpSettings_entry_title"),
                valueResult: null,
                contentResult: null,
                icon: "sap-icon://home",
                valueArgument: null,
                contentFunc: function () {
                    let sDisplayMode;
                    return SharedComponentUtils.getEffectiveHomepageSetting("/core/home/homePageGroupDisplay", "/core/home/enableHomePageSettings")
                        .then((sDisplay) => {
                            sDisplayMode = sDisplay;
                            return XMLView.create({
                                id: "UserSettingsHomepageSettingsView",
                                viewName: "sap.ushell.components.shell.Settings.homepage.HomepageSetting"
                            });
                        })
                        .then((oView) => {
                            oViewInstance = oView;
                            oViewInstance.setModel(new JSONModel({
                                displayMode: mDisplayModes[sDisplayMode] || mDisplayModes.scroll,
                                personalisationEnabled: Config.last("/core/shell/enablePersonalization")
                            }));
                            oViewInstance.setModel(resources.i18nModel, "i18n");

                            return oViewInstance;
                        })
                        .catch((oError) => {
                            Log.error("Failed to get effective hompage setting.", oError,
                                "sap.ushell.components.ushell.settings.homepage.HomepageEntry");
                            throw oError;
                        });
                },
                onSave: function () {
                    if (oViewInstance) {
                        const iCurrentMode = oViewInstance.getModel().getProperty("/displayMode");
                        const sDisplay = mDisplayModes.getName(iCurrentMode);
                        const oRenderer = Container.getRendererInternal("fiori2");

                        // save anchor bar mode in personalization
                        return SharedComponentUtils.getPersonalizer("homePageGroupDisplay", oRenderer)
                            .then((oPersonalizer) => {
                                return oPersonalizer.setPersData(sDisplay);
                            })
                            .then(() => {
                                Config.emit("/core/home/homePageGroupDisplay", sDisplay);
                            })
                            .catch((oError) => {
                                // Log failure if occurs.
                                Log.error("Failed to save the anchor bar mode in personalization", oError,
                                    "sap.ushell.components.ushell.settings.homepage.HomepageEntry");
                                throw oError;
                            });
                    }
                    Log.warning("Save operation for user account settings was not executed, because the homepage view was not initialized");
                    return Promise.resolve();
                },
                onCancel: function () {
                    if (oViewInstance) {
                        return;
                    }
                    Log.warning("Cancel operation for user account settings was not executed, because the homepage view was not initialized");
                },
                provideEmptyWrapper: false
            };
        }
    };
});
