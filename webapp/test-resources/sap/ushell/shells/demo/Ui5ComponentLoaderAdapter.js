// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview The UI5 component loader adapter for the demo platform.
 *
 * @version 1.141.0
 */
sap.ui.define([
    "sap/base/util/ObjectPath",
    "sap/ushell/UI5ComponentType"
], (ObjectPath, UI5ComponentType) => {
    "use strict";

    /**
     * This demo adapter allows to modify every UI5 component property instantiated by FLP.
    */
    function Ui5ComponentLoaderAdapter () {
        /**
         * modifies any UI5 component property except component_data
         * if this is changed it will be overwritten
         * @param {object} oComponentProperties The component properties
         * @param {string} sUI5ComponentType Type used to define the type of loading a ui5component by FLP
         * @returns {Promise} A promise that resolves with the modified oComponentProperties
         */
        this.modifyComponentProperties = async function (oComponentProperties, sUI5ComponentType) {
            if (sUI5ComponentType === UI5ComponentType.Visualization) {
                if (oComponentProperties.componentData) {
                    delete oComponentProperties.componentData;
                }
                const oCustomManifest = ObjectPath.get(
                    [
                        "manifest",
                        "custom.namespace.of.tile"
                    ],
                    oComponentProperties
                ) || {};
                if (oCustomManifest.addImage) {
                    oCustomManifest.backgroundImageRelativeToComponent = "custom_tile_2.png";
                }
            }
            return oComponentProperties;
        };
    }
    return Ui5ComponentLoaderAdapter;
}, /* bExport */ true);
