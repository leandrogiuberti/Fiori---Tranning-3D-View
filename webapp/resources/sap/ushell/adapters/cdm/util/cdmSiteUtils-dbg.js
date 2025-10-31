// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
/**
 * @fileOverview The file provides helper functions for PagesCommonDataModelAdapter.
 *
 * Creates CDM site entities with the provided data.
 * Only used on the ABAP platform and on local for testing.
 *
 * @version 1.141.1
 * @private
 */
sap.ui.define([
    "sap/ushell/adapters/cdm/util/AppForInbound",
    "sap/base/Log",
    "sap/ushell/adapters/cdm/v3/utilsCdm"
], (AppForInbound, Log, utilsCdm) => {
    "use strict";

    const cdmSiteUtils = {
        _VISUALIZATION_TYPES: {
            STATIC_TILE: "sap.ushell.StaticAppLauncher",
            DYNAMIC_TILE: "sap.ushell.DynamicAppLauncher"
        }
    };

    /**
     * Returns all available visualizations from the given visualization data.
     *
     * @param {object} visualizationData Visualization data as a hash map (@see sap.ushell.services.VisualizationDataProvider#getVisualizationData).
     * @returns {object} An object with all visualizations.
     *
     * @since 1.75.0
     * @private
     */
    cdmSiteUtils.getVisualizations = function (visualizationData) {
        const oVisualizations = {};

        Object.keys(visualizationData).forEach((vizKey) => {
            const oVisualizationData = visualizationData[vizKey];
            let sVizType;

            if (oVisualizationData.isCustomTile) {
                sVizType = oVisualizationData.vizType;
            } else if (oVisualizationData.vizType === "X-SAP-UI2-CHIP:/UI2/STATIC_APPLAUNCHER") {
                sVizType = this._VISUALIZATION_TYPES.STATIC_TILE;
            } else if (oVisualizationData.vizType === "X-SAP-UI2-CHIP:/UI2/DYNAMIC_APPLAUNCHER") {
                sVizType = this._VISUALIZATION_TYPES.DYNAMIC_TILE;
            } else {
                Log.warning(`Visualization with key '${vizKey}' has no known vizType and is not a custom tile. Using fall back instead.`);
                sVizType = this._VISUALIZATION_TYPES.STATIC_TILE;
            }

            const oVisualization = {
                vizType: sVizType,
                vizConfig: {
                    "sap.app": {
                        title: oVisualizationData.title,
                        subTitle: oVisualizationData.subTitle,
                        info: oVisualizationData.info,
                        tags: {
                            keywords: oVisualizationData.keywords
                        }
                    },
                    "sap.ui": {
                        icons: {
                            icon: oVisualizationData.icon
                        }
                    },
                    "sap.flp": {
                        tileSize: oVisualizationData.size,
                        indicatorDataSource: oVisualizationData.indicatorDataSource,
                        numberUnit: oVisualizationData.numberUnit,
                        target: utilsCdm.toTargetFromHash(oVisualizationData.url)
                    }
                }
            };

            // For non custom tiles the instantiationData is not set, so cdm tiles are used in the abap scenario.
            if (oVisualizationData.isCustomTile) {
                oVisualization.vizConfig["sap.flp"]._instantiationData = oVisualizationData._instantiationData;
            }

            oVisualizations[vizKey] = oVisualization;
        });

        return oVisualizations;
    };

    /**
     * Returns applications with the given navigation data.
     *
     * An empty object is returned for an app which cannot be created.
     *
     * @param {object} navigationData Navigation data as hash map.
     * @returns {objects} Dereferenced applications object.
     *
     * @since 1.75.0
     * @private
     */
    cdmSiteUtils.getApplications = function (navigationData) {
        return Object.keys(navigationData).reduce((oApplications, navigationDataId) => {
            const oInbound = navigationData[navigationDataId];
            const sInboundPermanentKey = oInbound.permanentKey || oInbound.id;

            // the navigation data ID becomes the application ID
            try {
                oApplications[sInboundPermanentKey] = AppForInbound.get(navigationDataId, oInbound);
            } catch (oError) {
                Log.error(`Unable to dereference app '${navigationDataId}' of CDM page.`);
                oApplications[navigationDataId] = {};
            }

            return oApplications;
        }, {});
    };

    /**
     * Returns built-in visualization types.
     *
     * Currently there is only the generic platform visualization type that indicates
     * that the visualization has to be created in a platform-dependent way.
     *
     * @param {object} oVizTypesData vizType data as a hash map.
     *
     * @returns {object} vizTypes
     *
     * @since 1.75.0
     * @private
     */
    cdmSiteUtils.getVizTypes = function (oVizTypesData) {
        return Object.keys(oVizTypesData)
            .reduce((oVizTypes, sVizKey) => {
                const sVizTypeId = oVizTypesData[sVizKey].id;
                if (!oVizTypes[sVizTypeId]) {
                    oVizTypes[sVizTypeId] = {
                        "sap.app": {
                            id: sVizTypeId,
                            type: "chipVizType"
                        },
                        "sap.flp": {
                            vizOptions: oVizTypesData[sVizKey].vizOptions,
                            tileSize: oVizTypesData[sVizKey].tileSize
                        }
                        // TODO: is there some url?
                    };
                }

                return oVizTypes;
            }, {});
    };

    return cdmSiteUtils;
});
