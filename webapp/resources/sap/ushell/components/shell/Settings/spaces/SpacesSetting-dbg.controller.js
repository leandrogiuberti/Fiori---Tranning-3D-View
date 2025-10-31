// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/EventHub",
    "sap/ushell/Config",
    "sap/ushell/resources",
    "sap/ushell/utils",
    "sap/base/Log"
], (
    Controller,
    JSONModel,
    EventHub,
    Config,
    resources,
    ushellUtils,
    Log
) => {
    "use strict";

    return Controller.extend("sap.ushell.components.shell.Settings.spaces.SpacesSetting", {
        onInit: function () {
            const oViewData = this.getView().getViewData();
            this.oUserInfoService = oViewData.UserInfo;
            const oUser = this.oUserInfoService.getUser();

            const bSpacesEnabled = Config.last("/core/spaces/enabled");
            const bHomeAppEnabled = Config.last("/core/homeApp/enabled");
            const bMyHomeEnabled = Config.last("/core/spaces/myHome/enabled");

            const bShowMyHomeVisible = bSpacesEnabled && bMyHomeEnabled && !bHomeAppEnabled;
            const bShowMyHomeSelected = oUser.getShowMyHome();
            const sImportFlag = oUser.getImportBookmarksFlag();
            const bMyHomeImportVisible = sImportFlag !== "done" && sImportFlag !== "not_required";

            // If the FLP is in classic mode, do not show My Home and Import settigs - we do not know the values of other flags.
            const oViewModel = new JSONModel({
                spaces: {
                    visible: Config.last("/core/spaces/configurable"),
                    selected: bSpacesEnabled
                },
                hideEmptySpaces: {
                    visible: bSpacesEnabled && Config.last("/core/spaces/hideEmptySpaces/enabled"),
                    selected: Config.last("/core/spaces/hideEmptySpaces/userEnabled")
                },
                showMyHome: {
                    visible: bShowMyHomeVisible,
                    selected: bShowMyHomeSelected
                },
                showMyHomeImport: {
                    visible: bShowMyHomeVisible && bShowMyHomeSelected && bMyHomeImportVisible,
                    selected: sImportFlag === "pending"
                }
            });
            this.getView().setModel(oViewModel);
            this.getView().setModel(resources.i18nModel, "i18n");

            this.oImportBookmarksFlagListener = EventHub.on("importBookmarksFlag").do(this._setMyHomeImportSelected.bind(this));
        },

        _setMyHomeImportSelected: function (value) {
            const oViewModel = this.getView().getModel();
            oViewModel.setProperty("/showMyHomeImport/selected", value);
        },

        onExit: function () {
            this.oImportBookmarksFlagListener.off();
        },

        onSave: async function (fnUpdateUserPreferences) {
            let bRestart = false;
            let bUpdate = false;
            const aUpdatePromises = [];

            const oModel = this.getView().getModel();
            const oUserInfoService = this.oUserInfoService;
            const oUser = oUserInfoService.getUser();

            const bOldSpacesEnabled = Config.last("/core/spaces/enabled");
            const bNewSpacesEnabled = oModel.getProperty("/spaces/selected");

            const bOldHideEmptySpaces = Config.last("/core/spaces/hideEmptySpaces/userEnabled");
            const bNewHideEmptySpaces = oModel.getProperty("/hideEmptySpaces/selected");

            const bOldShowMyHome = oUser.getShowMyHome();
            const bNewShowMyHome = oModel.getProperty("/showMyHome/selected");

            const bOldShowImportMessage = oUser.getImportBookmarksFlag() === "pending";
            const bNewShowImportMessage = oModel.getProperty("/showMyHomeImport/selected");

            // Set and persist changed user preferences
            if (bOldSpacesEnabled !== bNewSpacesEnabled) {
                oUser.setChangedProperties({
                    propertyName: "spacesEnabled",
                    name: "SPACES_ENABLEMENT"
                }, bOldSpacesEnabled, bNewSpacesEnabled);
                bUpdate = true;
                bRestart = true;
            }
            if (bOldShowMyHome !== bNewShowMyHome) {
                oUser.setShowMyHome(bNewShowMyHome);
                bUpdate = true;
                bRestart = true;
            }
            if (bOldShowImportMessage !== bNewShowImportMessage) {
                const bImportFlag = bNewShowImportMessage ? "pending" : "dismissed";
                oUser.setImportBookmarksFlag(bImportFlag);
                bUpdate = true;

                if (!bRestart) { // do not need to react if the FLP is going to restart anyway
                    EventHub.emit("importBookmarksFlag", bNewShowImportMessage);
                }
            }

            if (bOldHideEmptySpaces !== bNewHideEmptySpaces) {
                const oHideEmptySpacesPromise = ushellUtils.setHideEmptySpacesEnabled(bNewHideEmptySpaces)
                    .catch((oError) => {
                        oModel.setProperty("/hideEmptySpaces/selected", bOldHideEmptySpaces);
                        throw oError;
                    });
                aUpdatePromises.push(oHideEmptySpacesPromise);
            }

            // Nothing to do if setting has not been changed
            if (!bUpdate && !aUpdatePromises.length) {
                return Promise.resolve();
            }
            Log.debug("[000] SpacesSetting.controller.save");
            if (bUpdate) {
                const oUserInfoPromise = new Promise((resolve, reject) => {
                    fnUpdateUserPreferences()
                        .then(() => {
                            oUser.resetChangedProperty("spacesEnabled");
                            oUser.resetChangedProperty("showMyHome");
                            oUser.resetChangedProperty("importBookmarks");
                            resolve();
                        })
                        .catch((oError) => {
                            const sErrorMessage = oError.message;
                            if (
                                !sErrorMessage.includes("SPACES_ENABLEMENT")
                                && !sErrorMessage.includes("MYHOME_ENABLEMENT")
                                && !sErrorMessage.includes("MYHOME_IMPORT_FROM_CLASSIC")
                            ) {
                                oUser.resetChangedProperty("spacesEnabled");
                                oUser.resetChangedProperty("showMyHome");
                                oUser.resetChangedProperty("importBookmarks");
                                resolve();
                            } else {
                                oModel.setProperty("/spaces/selected", bOldSpacesEnabled);
                                oModel.setProperty("/showMyHome/selected", bOldShowMyHome);

                                oUser.resetChangedProperty("spacesEnabled");
                                oUser.resetChangedProperty("showMyHome");
                                oUser.resetChangedProperty("importBookmarks");
                                reject(oError);
                            }
                        });
                });
                aUpdatePromises.push(oUserInfoPromise);
            }

            return Promise.all(aUpdatePromises)
                .then(() => {
                    return {
                        refresh: bRestart,
                        noHash: true // Inform Controller, about reloading without Hash, to ensure we are not trying to Start the "MyHome" space by accident
                    };
                });
        },

        onCancel: function () {
            const oModel = this.getView().getModel();
            oModel.setProperty("/spaces/selected", Config.last("/core/spaces/enabled"));
            oModel.setProperty("/showMyHome/selected", this.oUserInfoService.getUser().getShowMyHome());
            oModel.setProperty("/hideEmptySpaces/selected", Config.last("/core/spaces/hideEmptySpaces/userEnabled"));
        }
    });
});
