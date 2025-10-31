// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/Log",
    "sap/ui/core/mvc/View",
    "sap/ushell/resources",
    "sap/ushell/Config",
    "sap/ushell/utils",
    "sap/ushell/Container"
], (
    Log,
    View,
    resources,
    Config,
    utils,
    Container
) => {
    "use strict";

    function _getShowMyHome () {
        return Container.getServiceAsync("UserInfo").then((oUserInfo) => {
            const bShow = oUserInfo.getUser().getShowMyHome();
            return resources.i18n.getText(bShow ? "settingsMyHomeShown" : "settingsMyHomeHidden");
        });
    }

    // Show "My Home shown/hidden" subtitle only when both Spaces and MyHome are enabled
    function _getSubtitleCallback () {
        const bShowSubtitle = Config.last("/core/spaces/enabled") && Config.last("/core/spaces/myHome/enabled") && !Config.last("/core/homeApp/enabled");
        return bShowSubtitle ? _getShowMyHome : null;
    }

    return {
        isRelevant: function () {
            // enable spaces user setting
            if (Config.last("/core/spaces/configurable")) {
                return true;
            }

            if (Config.last("/core/spaces/enabled")) {
                // hide empty spaces pages user setting
                if (Config.last("/core/spaces/hideEmptySpaces/enabled")) {
                    return true;
                }

                // "Show My Home" checkbox
                const bMyHomeEnabled = Config.last("/core/spaces/myHome/enabled");
                const bHomeAppEnabled = Config.last("/core/homeApp/enabled");
                if (bMyHomeEnabled && !bHomeAppEnabled) { // Home App hides ushell My Home
                    return true;
                }
            }

            return false;
        },
        getEntry: function () {
            let oViewInstance;
            return {
                id: "spacesEntry",
                entryHelpID: "spaces",
                title: resources.i18n.getText("spaces"),
                valueResult: null,
                contentResult: null,
                icon: "sap-icon://home",
                valueArgument: _getSubtitleCallback(),
                contentFunc: function () {
                    return Promise.all([
                        Container.getServiceAsync("UserInfo"),
                        // ensure that the config was updated with the user setting
                        utils.getHideEmptySpacesEnabled()
                    ])
                        .then((aResults) => {
                            const oUserInfoService = aResults[0];
                            return View.create({
                                id: "UserSettingsSpacesSettingsView",
                                viewName: "sap.ushell.components.shell.Settings.spaces.SpacesSetting",
                                type: "XML",
                                viewData: {
                                    UserInfo: oUserInfoService
                                }
                            });
                        })
                        .then((oView) => {
                            oViewInstance = oView;
                            return oViewInstance;
                        });
                },
                onSave: function (fnUpdateUserPreferences) {
                    if (oViewInstance) {
                        return oViewInstance.getController().onSave(fnUpdateUserPreferences);
                    }
                    Log.warning("Save operation for user account settings was not executed, because the spaces view was not initialized");
                    return Promise.resolve();
                },
                onCancel: function () {
                    if (oViewInstance) {
                        oViewInstance.getController().onCancel();
                        return;
                    }
                    Log.warning("Cancel operation for user account settings was not executed, because the spaces view was not initialized");
                },
                provideEmptyWrapper: false,
                // for testing purpose
                _setViewInstance: function (oNewViewInstance) {
                    oViewInstance = oNewViewInstance;
                },
                _getViewInstance: function () {
                    return oViewInstance;
                }
            };
        }
    };
});
