// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/base/i18n/Localization",
    "sap/ui/core/Locale",
    "sap/ushell/components/cards/ManifestPropertyHelper",
    "sap/ushell/resources",
    "sap/ui/core/mvc/Controller",
    "sap/base/strings/formatMessage",
    "sap/ui/model/json/JSONModel",
    "sap/ui/thirdparty/jquery",
    "sap/base/Log",
    "sap/ushell/utils/LaunchpadError"
], (Localization, Locale, manifestPropertyHelper, resources, Controller, formatter, JSONModel, jQuery, Log, LaunchpadError) => {
    "use strict";

    return Controller.extend("sap.ushell.components.cards.Configuration", {
        formatter: formatter,
        onInit: function () {
            const oView = this.getView();
            const oViewData = oView.getViewData();
            const oChipInstance = oViewData.chipInstance;
            const sManifest = oChipInstance.configuration.getParameterValueAsString("cardManifest");
            let oManifest;

            if (sManifest) {
                oManifest = this._prepareManifest(sManifest, oChipInstance);
            }

            const oModel = new JSONModel({
                data: {
                    editorValue: JSON.stringify(oManifest, null, 4) || ""
                },
                config: {
                    originalLanguage: "",
                    sapLogonLanguage: "",
                    displayOriginalLanguageWarning: false,
                    manifestEditorEditable: true
                }
            });
            oView.setModel(oModel);
            oView.setModel(resources.i18nModel, "i18n");

            oView.setViewName("sap.ushell.components.cards.Configuration");

            oChipInstance.configurationUi.attachSave(this.onSaveConfiguration.bind(this));

            this._checkOriginalLanguage();
        },

        onSaveConfiguration: function () {
            const oDeferred = new jQuery.Deferred();
            const oModel = this.getView().getModel();
            const sManifest = oModel.getProperty("/data/editorValue");
            let oManifest;

            try {
                oManifest = JSON.parse(sManifest);
            } catch (oError) {
                Log.error(resources.i18n.getText("configuration.invalidJSONProvided"), oError, "card.Configuration.controller");
                oDeferred.reject(oError);
                return oDeferred;
            }

            const oExtractedCardData = manifestPropertyHelper.extractCardData(oManifest);

            this._saveManifestAndTileConfig(oExtractedCardData.manifest, oExtractedCardData.tileConfiguration)
                .then(this._saveTilePropertiesBag.bind(this, oExtractedCardData))
                .then(this._saveTitle.bind(this, oExtractedCardData.bagProperties.display_title_text))
                .then(this._updateTileModel.bind(this, oExtractedCardData))
                .then(oDeferred.resolve)
                .catch((oError) => {
                    Log.error("save failed", oError, "card.Configuration.controller");
                    oDeferred.reject(oError);
                });

            return oDeferred.promise();
        },

        /**
         * Saves the card's manifest and configuration via the CHIP API
         *
         * @param {object} manifest The card's manifest
         * @param {object} tileConfiguration The card's configuration
         * @returns {Promise} A promise that resolves when the data has been saved successfully
         * @private
         */
        _saveManifestAndTileConfig: function (manifest, tileConfiguration) {
            const oChipInstance = this.getView().getViewData().chipInstance;

            const oPromise = new Promise((resolve, reject) => {
                // use configuration contract to write parameter values
                oChipInstance.writeConfiguration.setParameterValues(
                    {
                        cardManifest: JSON.stringify(manifest),
                        // this has to be called tileConfiguration also for cards as the FLP expects
                        // to find the configuration under this name
                        tileConfiguration: tileConfiguration
                    },
                    resolve,
                    (sErrorMessage, oErrorInfo) => {
                        const oError = new LaunchpadError(
                            sErrorMessage,
                            {
                                error: sErrorMessage,
                                errorInfo: oErrorInfo
                            }
                        );
                        reject(oError);
                    }
                );
            });

            return oPromise;
        },

        /**
         * Saves the card's translatable properies in a property bag via the CHIP API
         *
         * @param {object} cardData The card's data
         * @returns {Promise} A promise that resolves when the data has been saved successfully
         * @private
         */
        _saveTilePropertiesBag: function (cardData) {
            const oChipInstance = this.getView().getViewData().chipInstance;
            const oTilePropertiesBag = oChipInstance.bag.getBag("tileProperties");
            this._fillCardBag(cardData, oTilePropertiesBag);

            const oPromise = new Promise((resolve, reject) => {
                oTilePropertiesBag.save(
                    resolve,
                    (mErrorMessages, mErrorInfo) => {
                        const sFirstFailedBag = Object.keys(mErrorMessages)[0];

                        reject(new LaunchpadError(`Bag save failed: ${mErrorMessages[sFirstFailedBag]}`, {
                            info: mErrorInfo[sFirstFailedBag],
                            otherMessages: mErrorMessages,
                            otherInfo: mErrorInfo
                        }));
                    }
                );
            });

            return oPromise;
        },

        /**
         * Saves the card's title via the CHIP API
         *
         * @param {string} title The card's title
         * @returns {Promise} A promise that resolves when the data has been saved successfully
         * @private
         */
        _saveTitle: function (title) {
            const oChipInstance = this.getView().getViewData().chipInstance;

            const oPromise = new Promise((resolve, reject) => {
                // the chip has a separate title property that is kept in sync with the title in the bags here
                if (oChipInstance.title) {
                    oChipInstance.title.setTitle(
                        title,
                        resolve,
                        (sErrorMessage, oErrorInfo) => {
                            const oEnhancedError = new LaunchpadError(
                                sErrorMessage,
                                {
                                    error: sErrorMessage,
                                    errorInfo: oErrorInfo
                                }
                            );
                            reject(oEnhancedError);
                        }
                    );
                } else {
                    resolve();
                }
            });

            return oPromise;
        },

        /**
         * Update the title and subtitle of the card tile' model
         *
         * @param {string} cardData The card data
         * @private
         */
        _updateTileModel: function (cardData) {
            const oTileModel = this.getView().getModel("tileModel");

            // update the tile model in order to show the current information on the previewed tile outside the configuration UI
            oTileModel.setProperty("/data/display_title_text", cardData.bagProperties.display_title_text);
            oTileModel.setProperty("/data/display_subtitle_text", cardData.bagProperties.display_subtitle_text);
        },

        /**
         * Fill the card's CHIP bag with texts extracted from the card's manifest
         *
         * @param {object} extractedData The card data extraced from the manifest
         * @param {object} tilePropertiesBag The card's properties bag
         *
         * @private
         */
        _fillCardBag: function (extractedData, tilePropertiesBag) {
            Object.keys(extractedData.bagProperties).forEach((sProperty) => {
                if (extractedData.bagProperties[sProperty]) {
                    tilePropertiesBag.setText(sProperty, extractedData.bagProperties[sProperty]);
                } else {
                    tilePropertiesBag.resetProperty(sProperty);
                }
            });
        },

        /**
         * Merges the card's bag properties into the card's manifest
         *
         * @param {string} manifest The card's raw manifest
         * @param {*} chipInstance The card's chip instance
         *
         * @returns {object} The merged data
         *
         * @private
         */
        _prepareManifest: function (manifest, chipInstance) {
            const oManifest = JSON.parse(manifest);
            const oCardData = manifestPropertyHelper.getCardData(chipInstance);

            return manifestPropertyHelper.mergeCardData(oManifest, oCardData);
        },

        /**
         * Checks wether the user is logged in in the original language of the card.
         * Displays a warning message and sets the manifest editor to read only if not.
         *
         * @private
         */
        _checkOriginalLanguage: function () {
            let oModel;
            let oLanguages;

            if (!this._isOriginalLanguage()) {
                oModel = this.getView().getModel();
                oLanguages = this._getLanguages();

                oModel.setProperty("/config/originalLanguage", oLanguages.originalLanguage.toUpperCase());
                oModel.setProperty("/config/sapLogonLanguage", oLanguages.logonLanguage.toUpperCase());
                oModel.setProperty("/config/displayOriginalLanguageWarning", true);
                oModel.setProperty("/config/manifestEditorEditable", false);
            }
        },

        /**
         * Checks wether the user is logged in in the original language of the card.
         *
         * @returns {boolean} Is it the original language?
         *
         * @private
         */
        _isOriginalLanguage: function () {
            const oLanguages = this._getLanguages();
            const sOriginalLanguage = oLanguages.originalLanguage.toLowerCase();
            const sSAPLogonLanguage = oLanguages.logonLanguage.toLowerCase();
            const sLanguage = oLanguages.ui5CoreLanguage.toLowerCase();

            return sOriginalLanguage === "" || sOriginalLanguage === sSAPLogonLanguage || sOriginalLanguage === sLanguage;
        },

        /**
         * Retrieves the original language of the card chip instance and the user's logon language
         *
         * @returns {object} Original and logon language
         *
         * @private
         */
        _getLanguages: function () {
            const chipInstance = this.oView.getViewData().chipInstance;

            return {
                originalLanguage: chipInstance.bag.getOriginalLanguage(),
                logonLanguage: new Locale(Localization.getLanguageTag()).getSAPLogonLanguage(),
                ui5CoreLanguage: Localization.getLanguage()
            };
        }
    });
});
