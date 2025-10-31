// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/components/tiles/utils",
    "sap/ushell/components/cards/ManifestPropertyHelper",
    "sap/ushell/resources",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/mvc/XMLView",
    "sap/ushell/Container"
], (
    tileUtils,
    manifestPropertyHelper,
    resources,
    Controller,
    JSONModel,
    XMLView,
    Container
) => {
    "use strict";

    return Controller.extend("sap.ushell.components.cards.Card", {
        onInit: function () {
            const oView = this.getView();
            const oChipInstance = this.getView().getViewData().chip;
            const oTilePropertiesBag = oChipInstance.bag.getBag("tileProperties");

            const oCardData = manifestPropertyHelper.getTranslatablePropertiesFromBag(oTilePropertiesBag);

            const oModel = new JSONModel({
                data: oCardData
            });
            oView.setModel(oModel);
            oView.setModel(resources.i18nModel, "i18n");

            this._implementConfigurationUiContract(oChipInstance, oView);
            this._implementPreviewContract(oChipInstance, oCardData);
        },

        // trigger to show the configuration UI if the tile is pressed in Admin mode
        onPress: function () {
            const oView = this.getView();
            const oChipInstance = oView.getViewData().chip;
            const sCardTileConfiguration = oChipInstance.configuration.getParameterValueAsString("tileConfiguration");
            let oCardTileConfiguration;

            if (oChipInstance.configurationUi.isEnabled()) {
                oChipInstance.configurationUi.display();
            } else if (sCardTileConfiguration) {
                oCardTileConfiguration = JSON.parse(sCardTileConfiguration);

                Container.getServiceAsync("Navigation").then((oNavigation) => {
                    oNavigation.navigate({
                        target: {
                            semanticObject: oCardTileConfiguration.navigation_semantic_object,
                            action: oCardTileConfiguration.navigation_semantic_action
                        },
                        params: oCardTileConfiguration.navigation_semantic_parameters_as_object
                    });
                });
            }
        },

        /**
         * @param {object} chipInstance The card's chip instance
         * @param {object} cardData The card's translatable properties. Only title and subtitle are needed.
         *
         * @private
         */
        _implementPreviewContract: function (chipInstance, cardData) {
            if (chipInstance.preview) {
                chipInstance.preview.setPreviewTitle(cardData.display_title_text);
                if (chipInstance.preview.setPreviewSubtitle && typeof chipInstance.preview.setPreviewSubtitle === "function") {
                    chipInstance.preview.setPreviewSubtitle(cardData.display_subtitle_text);
                }
            }
        },

        /**
         * Adds the configuration view to the configuration contract and binds the tilemodel to it.
         *
         * @param {object} chipInstance The card's chip instance
         * @param {object} view The card's view
         *
         * @private
         */
        _implementConfigurationUiContract: function (chipInstance, view) {
            if (chipInstance.configurationUi && chipInstance.configurationUi.isEnabled()) {
                chipInstance.configurationUi.setUiProvider(() => {
                    const oConfigurationUi = this._getConfigurationUi(chipInstance);
                    oConfigurationUi.setModel(view.getModel(), "tileModel");
                    return oConfigurationUi;
                });

                view.getContent()[0].setTooltip(
                    tileUtils.getResourceBundle().getText("edit_configuration.tooltip")
                );
            }
        },

        /**
         * Builds a configuration UI for the card.
         *
         * @param {object} chipInstance The card's chip instance
         * @returns {object} The card's configuration view
         * @private
         */
        _getConfigurationUi: function (chipInstance) {
            const oConfigurationView = new XMLView({
                viewName: "sap.ushell.components.cards.Configuration",
                viewData: { chipInstance: chipInstance }
            });

            return oConfigurationView;
        }
    });
});
