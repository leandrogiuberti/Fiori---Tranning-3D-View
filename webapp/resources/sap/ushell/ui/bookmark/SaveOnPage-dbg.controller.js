// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ushell/resources",
    "sap/ui/thirdparty/hasher",
    "sap/ui/core/library"
], (
    Controller,
    resources,
    hasher,
    coreLibrary
) => {
    "use strict";

    // shortcut for sap.ui.core.ValueState
    const ValueState = coreLibrary.ValueState;

    return Controller.extend("sap.ushell.ui.bookmark.SaveOnPage", {

        /**
         * Initialize
         */
        onInit: function () {
            const oView = this.getView();
            oView.setModel(resources.i18nModel, "i18n");

            this.byId("bookmarkTitleInput").attachLiveChange(function () {
                if (this.getValue() === "") {
                    this.setValueStateText(resources.i18n.getText("bookmarkTitleInputError"));
                    this.setValueState(ValueState.Error);
                } else {
                    this.setValueState(ValueState.None);
                }
            });
            this.oContentNodeSelector = this.byId("SelectedNodesComboBox");
            this.oContentNodeSelector.attachSelectionChanged(function () {
                const aContentNodes = this.getSelectedContentNodes();

                if (Array.isArray(aContentNodes) && aContentNodes.length < 1) {
                    this.setValueStateText(resources.i18n.getText("bookmarkPageSelectError"));
                    this.setValueState(ValueState.Error);
                } else {
                    this.setValueState(ValueState.None);
                }
            });
            const oPreviewTileDynamic = this.byId("previewTileDynamic");
            oPreviewTileDynamic.addEventDelegate({
                onAfterRendering: function () {
                    oPreviewTileDynamic.getDomRef().removeAttribute("tabindex");
                }
            });
            const oPreviewTile = this.byId("previewTile");
            oPreviewTile.addEventDelegate({
                onAfterRendering: function () {
                    oPreviewTile.getDomRef().removeAttribute("tabindex");
                }
            });
        },

        /**
         * Removes the focus from the preview tile so that the keyboard navigation does not focus on the preview tile.
         *
         * @private
         * @since 1.78.0
         */
        removeFocusFromTile: function () {
            this.getView().getDomRef().querySelector(".sapMGT").removeAttribute("tabindex");
        },

        /**
         * @returns {object} Bookmark tile data
         *
         * @private
         * @since 1.78.0
         */
        getBookmarkTileData: function () {
            const oView = this.getView();
            const oModel = oView.getModel();
            const oViewData = oView.getViewData();
            let sURL;

            if (oViewData.customUrl) {
                if (typeof (oViewData.customUrl) === "function") {
                    sURL = oViewData.customUrl();
                } else {
                    sURL = oViewData.customUrl;
                }
            } else {
                sURL = hasher.getHash() ? (`#${hasher.getHash()}`) : window.location.href;
            }

            const oData = {
                title: oModel.getProperty("/title"),
                subtitle: oModel.getProperty("/subtitle"),
                url: sURL,
                icon: oModel.getProperty("/icon"),
                info: oModel.getProperty("/info"),
                numberUnit: oModel.getProperty("/numberUnit"),
                serviceUrl: typeof (oViewData.serviceUrl) === "function" ? oViewData.serviceUrl() : oViewData.serviceUrl,
                dataSource: oModel.getProperty("/dataSource"),
                serviceRefreshInterval: oModel.getProperty("/serviceRefreshInterval"),
                contentNodes: this.oContentNodeSelector.getSelectedContentNodes(),
                keywords: oModel.getProperty("/keywords")
            };

            const aPropertiesToBeTrimmed = [
                "title",
                "subtitle",
                "info"
            ];
            aPropertiesToBeTrimmed.forEach((sProp) => {
                oData[sProp] = (
                    oData[sProp] || ""
                ).substring(0, 256).trim();
            });

            return oData;
        },
        onValueHelpEndButtonPressed: function () {
            if (this.oContentNodeSelector && this.oContentNodeSelector.fireSelectionChanged) {
                this.oContentNodeSelector.fireSelectionChanged();
            }
        }
    });
});
