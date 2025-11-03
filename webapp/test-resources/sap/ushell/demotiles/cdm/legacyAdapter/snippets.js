// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

(function () {
    "use strict";

    /**
     * This code was part of the CDM LaunchPageAdapter POC and was used to fake the UI2 CHIP API for running
     * legacy tiles in the new CDM model.
     *
     * It was discussed (Stephan, Gerd, Heiko) to provide a productive adapter tile for the same reason but we
     * decided to skip it in order to avoid, that existing tiles will not get migrated.
     *
     * However, this file contains the code snippets in case such an adapter must be written in the future.
     */

    function CdmBag (sId, aProperties, aTexts) {
        this._id = sId;
        this._properties = aProperties || [];
        this._texts = aTexts || [];
    }

    CdmBag.prototype = {
        getId: function () {
            return this._id;
        },

        getProperty: function (sPropertyName, sDefaultValue) {
            let sValue;

            this._properties.forEach((item) => {
                if (item.id === sPropertyName) {
                    sValue = item.value;
                }
            });

            return sValue || sDefaultValue; // documented API: return
            // default value
        },

        getPropertyNames: function () {
            const aNames = [];

            this._properties.forEach((oItem) => {
                aNames.push(oItem.id);
            });

            return aNames;
        },

        getText: function (sTextName) {
            let sText;

            this._texts.forEach((item) => {
                if (item.id === sTextName) {
                    sText = item.value;
                }
            });

            return sText || sTextName; // documented API: return key
            // instead of undefined
        },

        getTextNames: function () {
            const aNames = [];

            this._texts.forEach((oItem) => {
                aNames.push(oItem.id);
            });

            return aNames;
        },

        getOwnPropertyNames: function () {
            return this.getPropertyNames(); // no inheritance ???
        },

        getOwnTextNames: function () {
            return this.getTextNames(); // no inheritance
        },

        reset: function (fnSuccess, fnError) {
            throw new Error("not implemented for CDM");
        },

        resetProperty: function (sPropertyName) {
            throw new Error("not implemented for CDM");
        },

        save: function (fnSuccess, fnError) {
            throw new Error("not implemented for CDM");
        },

        setProperty: function (sPropertyName, sValue) {
            let oItem;

            this._properties.forEach((item) => {
                if (item.id === sPropertyName) {
                    oItem = item;
                }
            });

            if (oItem) {
                oItem.value = sValue;
            } else {
                this._properties.push({
                    id: sPropertyName,
                    value: sValue
                });
            }

            return this;
        },

        setText: function (sTextName, sValue) {
            let oItem;

            this._properties.forEach((item) => {
                if (item.id === sTextName) {
                    oItem = item;
                }
            });

            if (oItem) {
                oItem.value = sValue;
            } else {
                this._properties.push({
                    id: sTextName,
                    value: sValue
                });
            }

            return this;
        },

        update: function (oBagData) {
            throw new Error("not implemented for CDM");
        }
    };

    function fakeUI2Contracts (oTile) { // eslint-disable-line no-unused-vars
        const sSemanticObject = oTile.target.semanticObject || "";
        const sAction = oTile.target.action || "";
        const sParameters = JSON.stringify(oTile.target.parameters) || ""; // TODO stringify is not correct
        const sUrl = `#${sSemanticObject}-${sAction}`;
        const oBagTileProperties = new CdmBag("tileProperties", [], [
            { id: "display_info_text", value: "info from UI2 bag" },
            { id: "display_title_text", value: "title from UI2 bag" },
            { id: "display_subtitle_text", value: "subtitle from UI2 bag" },
            { id: "display_search_keywords", value: "" }
        ]);
        const oBagTileNavigationActions = new CdmBag("tileNavigationActions", [
            { id: "display_icon_url", value: "sap-icon://Fiori4/F0648" },
            { id: "navigation_use_semantic_object", value: "true" },
            { id: "navigation_target_url", value: sUrl },
            { id: "navigation_semantic_object", value: sSemanticObject },
            { id: "navigation_semantic_action", value: sAction },
            { id: "navigation_semantic_parameters", value: sParameters }
        ], []);
        const oConfig = {
            tileConfiguration: JSON.stringify({
                display_icon_url: "sap-icon://Fiori4/F0648",
                display_info_text: "info from UI2 config",
                display_title_text: "title from UI2 config",
                display_subtitle_text: "subtitle from UI2 config",
                navigation_use_semantic_object: true,
                navigation_target_url: sUrl,
                navigation_semantic_object: sSemanticObject,
                navigation_semantic_action: sAction,
                navigation_semantic_parameters: sParameters,
                display_search_keywords: ""
            })
        };

        return {
            bag: {
                _bagTileProperties: oBagTileProperties,
                _bagTileNavigationActions: oBagTileNavigationActions,
                getBag: function (sBagId) {
                    if (sBagId === "tileProperties") {
                        return this._bagTileProperties;
                    }
                    if (sBagId === "tileNavigationActions") {
                        return this._bagTileNavigationActions;
                    }
                    throw new Error("bag not known");
                },
                getBagIds: function () {
                    return ["tileProperties"];
                },
                getOriginalLanguage: function () {
                    return "en"; // TODO
                }
            },
            configurationUi: {
                isEnabled: function () {
                    return false;
                }
            },
            configuration: {
                _config: oConfig,
                getParameterValueAsString: function (sParameterName) {
                    return this._config[sParameterName];
                }
            },
            url: {
                getApplicationSystem: function () {
                    // return undefined
                }
            }
        };
    }
}());
