// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileoverview Save As Tile controller for the classical home page
 * @deprecated since 1.120
 */
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/base/Log",
    "sap/ushell/resources",
    "sap/ui/core/library",
    "sap/ui/thirdparty/hasher",
    "sap/ushell/Container"
], (
    Controller,
    Log,
    resources,
    coreLibrary,
    hasher,
    Container
) => {
    "use strict";

    // shortcut for sap.ui.core.ValueState
    const ValueState = coreLibrary.ValueState;

    return Controller.extend("sap.ushell.ui.footerbar.SaveAsTile", {
        onInit: function () {
            const oView = this.getView();

            oView.getTitleInput().attachLiveChange(function () {
                if (this.getValue() === "") {
                    this.setValueStateText(resources.i18n.getText("bookmarkTitleInputError"));
                    this.setValueState(ValueState.Error);
                } else {
                    this.setValueState(ValueState.None);
                }
            });
        },

        /**
         * Loads the list of possible targets offered for bookmark placement into the SaveAsTile view model:
         * e.g. personalized groups in launchpad homepage mode.
         *
         * @private
         *
         * @returns {Promise} Promise that resolves, once the possible targets have been loaded into the model.
         */
        loadPersonalizedGroups: function () {
            // Determine targets for bookmark placement
            return Container.getServiceAsync("LaunchPage")
                .then((LaunchPageService) => {
                    return new Promise((resolve, reject) => {
                        LaunchPageService.getGroupsForBookmarks()
                            .done(resolve)
                            .fail(reject);
                    });
                })
                .then((aBookmarkTargets) => {
                    // Store them into the groups model property
                    const oModel = this.getView().getModel();
                    oModel.setProperty("/groups", aBookmarkTargets);
                    oModel.setProperty("/groups/length", aBookmarkTargets.length);
                })
                .catch(() => {
                    Log.error("SaveAsTile controller: Unable to determine targets for bookmark placement.");
                });
        },

        getLocalizedText: function (sMsgId, aParams) {
            return aParams ? resources.i18n.getText(sMsgId, aParams) : resources.i18n.getText(sMsgId);
        },

        getBookmarkTileData: function () {
            const oView = this.getView();
            const oModel = oView.getModel();
            const oViewData = oView.getViewData();

            let selectedGroupData;
            if (oView.oGroupsSelect && oView.oGroupsSelect.getSelectedItem()) {
                selectedGroupData = oView.oGroupsSelect.getSelectedItem().getBindingContext().getObject();
            }

            let sURL;
            if (oViewData.customUrl) {
                if (typeof (oViewData.customUrl) === "function") {
                    sURL = oViewData.customUrl();
                } else {
                    // In case customURL will be provided (as a string) containing an hash part, it must be supplied non-encoded,
                    // or it will be resolved with duplicate encoding and can cause nav errors.
                    sURL = oViewData.customUrl;
                }
            } else {
                // In case a hash exists, hasher.setHash() is used for navigation. It also adds encoding.
                sURL = hasher.getHash() ? (`#${hasher.getHash()}`) : window.location.href;
            }

            const oData = {
                title: oModel.getProperty("/title") || "",
                subtitle: oModel.getProperty("/subtitle") || "",
                url: sURL,
                icon: oModel.getProperty("/icon") || "",
                info: oModel.getProperty("/info") || "",
                numberUnit: oModel.getProperty("/numberUnit") || "",
                serviceUrl: typeof (oViewData.serviceUrl) === "function" ? oViewData.serviceUrl() : oViewData.serviceUrl,
                dataSource: oModel.getProperty("/dataSource"),
                serviceRefreshInterval: oModel.getProperty("/serviceRefreshInterval"),
                group: selectedGroupData,
                keywords: oModel.getProperty("/keywords") || ""
            };

            oData.title = oData.title.substring(0, 256).trim();
            oData.subtitle = oData.subtitle.substring(0, 256).trim();
            oData.info = oData.info.substring(0, 256).trim();
            if (oData.serviceUrl === undefined) {
                delete oData.serviceUrl;
                delete oData.serviceRefreshInterval;
            }

            return oData;
        },

        onExit: function () {
            const oView = this.getView();
            const oTileView = oView.getTileView();
            oTileView.destroy();
        }
    });
});
