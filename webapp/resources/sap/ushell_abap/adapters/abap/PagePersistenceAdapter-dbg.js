// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview PagePersistenceAdapter for the ABAP platform.
 * @version 1.141.1
 */
sap.ui.define([
    "sap/base/i18n/Localization",
    "sap/base/util/ObjectPath",
    "sap/ushell/utils/HttpClient",
    "sap/ushell/resources",
    "sap/ushell/utils/chipsUtils",
    "sap/ushell/Container",
    "sap/ushell/utils/LaunchpadError"
], (
    Localization,
    ObjectPath,
    HttpClient,
    ushellResources,
    chipsUtils,
    Container,
    LaunchpadError
) => {
    "use strict";

    /**
     * Gets the service url from window["sap-ushell-config"].services.PagePersistence.
     *
     * If the metadata updates because there is a change in the backend, then the metadataString and the metadata JSON string must be updated.
     *
     * @returns {string} the service url.
     */
    function getServiceUrl () {
        const oServiceConfig = (window["sap-ushell-config"].services && window["sap-ushell-config"].services.PagePersistence) || {};
        return (ObjectPath.get("config.serviceUrl", oServiceConfig.adapter) || "").replace(/\/?$/, "/");
    }

    /**
     * Constructs a new instance of the PagePersistenceAdapter for the ABAP platform
     *
     * @class
     * @experimental Since 1.67.0
     * @private
     */
    function PagePersistenceAdapter () {
        this.S_COMPONENT_NAME = "sap.ushell_abap.adapters.abap.PagePersistenceAdapter";
    }

    /**
     * Returns a page
     *
     * @param {string} pageId The page ID
     * @returns {Promise<object>} Resolves to a page
     *
     * @experimental Since 1.67.0
     * @private
     */
    PagePersistenceAdapter.prototype.getPage = function (pageId) {
        return Promise.all([
            this._readPage(pageId),
            Container.getServiceAsync("URLParsing")
        ])
            .then((aResults) => {
                const oPageData = aResults[0];
                const URLParsing = aResults[1];

                return this._convertODataToReferenceData(oPageData, URLParsing);
            })
            .catch(this._rejectWithError.bind(this));
    };

    /**
     * Returns array of pages
     *
     * @param {string[]} aPageId The array of page ID
     * @returns {Promise<object[]>} Resolves to array of pages
     *
     * @experimental Since 1.75.0
     * @private
     */
    PagePersistenceAdapter.prototype.getPages = function (aPageId) {
        return Promise.all([
            this._readPages(aPageId),
            Container.getServiceAsync("URLParsing")
        ])
            .then((aResults) => {
                const aPagesResults = aResults[0].results;
                const URLParsing = aResults[1];

                return aPagesResults.map((oPageData) => {
                    return this._convertODataToReferenceData(oPageData, URLParsing);
                });
            })
            .catch(this._rejectWithError.bind(this));
    };

    /**
     * Reads a page from the server
     *
     * @param {string} pageId The page ID
     * @returns {Promise<object>} Resolves to a page in the OData format
     *
     * @experimental Since 1.67.0
     * @private
     */
    PagePersistenceAdapter.prototype._readPage = function (pageId) {
        return new Promise((resolve, reject) => {
            const oHeaders = {
                "Cache-Control": "no-cache, no-store, must-revalidate",
                Pragma: "no-cache",
                Expires: "0",
                "Accept-Language": Localization.getLanguage() || "",
                Accept: "application/json, text/plain"
            };
            const sSAPLogonLanguage = Container.getUser().getLanguage();
            if (sSAPLogonLanguage) {
                oHeaders["sap-language"] = sSAPLogonLanguage;
            }

            const sLogonSystem = Container.getLogonSystem();
            const sSapClient = sLogonSystem ? sLogonSystem.getClient() : "";
            if (sSapClient) {
                oHeaders["sap-client"] = sSapClient;
            }

            const sBaseUrl = getServiceUrl();
            const oHttpClient = new HttpClient(sBaseUrl, {
                headers: oHeaders
            });

            const sRequestUrl = `${sBaseUrl}pageSet('${encodeURIComponent(pageId)}')`
                + "?$expand=sections/viz,vizReferences/chipBags/properties,tileTypes/vizOptions/displayFormats/supported";
            oHttpClient.get(sRequestUrl).then((result) => {
                resolve(JSON.parse(result.responseText).d);
            }).catch(reject);
        });
    };

    /**
     * Reads pages from the server
     *
     * @param {string[]} aPageId The array of page ID
     * @returns {Promise<object[]>} Resolves to a array of page in the OData format
     *
     * @experimental Since 1.75.0
     * @private
     */
    PagePersistenceAdapter.prototype._readPages = function (aPageId) {
        return new Promise((resolve, reject) => {
            const oHeaders = {
                "Cache-Control": "no-cache, no-store, must-revalidate",
                Pragma: "no-cache",
                Expires: "0",
                "Accept-Language": Localization.getLanguage() || "",
                Accept: "application/json, text/plain",
                "content-type": "multipart/mixed; boundary=batch_bd56-ff53-571c"
            };
            const sSAPLogonLanguage = Container.getUser().getLanguage();
            if (sSAPLogonLanguage) {
                oHeaders["sap-language"] = sSAPLogonLanguage;
            }

            const sLogonSystem = Container.getLogonSystem();
            const sSapClient = sLogonSystem ? sLogonSystem.getClient() : "";
            if (sSapClient) {
                oHeaders["sap-client"] = sSapClient;
            }

            const sReq1 = `pageSet?$expand=${
                encodeURIComponent("sections/viz,vizReferences/chipBags/properties,tileTypes/vizOptions/displayFormats/supported")
            }&$filter=`;

            const sfilters = aPageId.length ? `id eq '${aPageId.join("' or id eq '")}'` : "";

            const sBaseUrl = getServiceUrl();
            const sRequestUrl = `${sBaseUrl}$batch`;
            const oHttpClient = new HttpClient(sBaseUrl, {
                headers: oHeaders
            });

            const sData = this._createBatchData(sReq1 + encodeURIComponent(sfilters).replace(/[!'()*]/g, escape));

            oHttpClient.post(sRequestUrl, { data: sData }).then((result) => {
                const oResponseData = this._retrieveBatchData(result);
                resolve(oResponseData);
            }).catch(reject);
        });
    };

    /**
   * Creates the batch request data
   *
   * @param {string[]} sPageRequest The PageSet Request
   * @returns {Promise<object[]>} Resolves to a array of page in the OData format
   *
   * @experimental Since 1.105.0
   * @private
   */
    PagePersistenceAdapter.prototype._createBatchData = function (sPageRequest) {
        const sSAPLogonLanguage = Container.getUser().getLanguage();
        const sSapClient = Container.getLogonSystem() ? Container.getLogonSystem().getClient() : "";

        const aData = ["--batch_bd56-ff53-571c",
            "Content-Type: application/http",
            "Content-Transfer-Encoding: binary",
            "",
            `GET ${sPageRequest} HTTP/1.1`,
            "sap-cancel-on-close: true",
            `sap-language: ${sSAPLogonLanguage || ""}`,
            `sap-client: ${sSapClient || ""}`,
            "sap-contextid-accept: header",
            "Accept: application/json",
            `Accept-Language: ${sSAPLogonLanguage || ""}`,
            "DataServiceVersion: 2.0",
            "MaxDataServiceVersion: 2.0",
            "X-Requested-With: XMLHttpRequest",
            "",
            "",
            "",
            "--batch_bd56-ff53-571c--"];

        return aData.join("\r\n");
    };

    /**
     * Retrives the data from the bach response
     *
     * @param {string[]} sPageBatchResponse The PageSet Request
     * @returns {Promise<object[]>} Resolves to a array of page in the OData format
     *
     * @experimental Since 1.75.0
     * @private
     */

    PagePersistenceAdapter.prototype._retrieveBatchData = function (sPageBatchResponse) {
        const lines = sPageBatchResponse.responseText.split("\r\n");
        let data = [];
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith("{")) {
                data = lines[i];
            }
        }
        return JSON.parse(data).d;
    };

    /**
     * Converts a reference page from the OData format to the FLP internal format.
     *
     * @param {object} page The page in the OData format.
     * @param {object} URLParsing The URLParsing service.
     * @returns {object}
     *  An object containing the page, visualizations & vizTypes which where extracted from the pageSet OData response object.
     *
     * @since 1.90.0
     * @private
     */
    PagePersistenceAdapter.prototype._convertODataToReferenceData = function (page, URLParsing) {
        const oUnstableVisualizations = {};
        const oData = {
            page: {
                id: page.id,
                title: page.title,
                description: page.description,
                createdBy: page.createdBy,
                createdByFullname: page.createdByFullname || page.createdBy,
                modifiedBy: page.modifiedBy,
                modifiedByFullname: page.modifiedByFullname || page.modifiedBy,
                sections: page.sections.results.map((oSection) => {
                    return {
                        id: oSection.id,
                        sectionIndex: oSection.sectionIndex,
                        title: oSection.title,
                        viz: oSection.viz.results.map((oViz) => {
                            return {
                                catalogTileId: oViz.catalogTileId,
                                id: oViz.id,
                                itemIndex: oViz.itemIndex,
                                targetMappingId: oViz.targetMappingId,
                                vizId: oViz.catalogTileIdStable,
                                inboundPermanentKey: oViz.targetMappingIdStable,
                                displayFormatHint: oViz.displayFormatHint
                            };
                        }).sort((firstViz, secondViz) => {
                            return firstViz.itemIndex - secondViz.itemIndex;
                        })
                    };
                }).sort((firstSection, secondSection) => {
                    return firstSection.sectionIndex - secondSection.sectionIndex;
                })
            },
            // mapping from vizReference to visualization
            visualizations: page.vizReferences.results.reduce((oVisualizations, oVisualizationData) => {
                const oSimplifiedChip = this._getSimplifiedChip(oVisualizationData);
                const oVisualization = {
                    vizId: oVisualizationData.catalogTileIdStable,
                    vizType: oVisualizationData.tileType,
                    title: oVisualizationData.title,
                    subTitle: oVisualizationData.subTitle,
                    icon: oVisualizationData.iconUrl,
                    info: chipsUtils.getInfoFromSimplifiedChip(oSimplifiedChip),
                    keywords: chipsUtils.getKeywordsFromSimplifiedChip(oSimplifiedChip),
                    size: chipsUtils.getTileSizeFromSimplifiedChip(oSimplifiedChip),
                    indicatorDataSource: chipsUtils.getIndicatorDataSourceFromSimplifiedChip(oSimplifiedChip),
                    url: chipsUtils.getTargetUrlFromSimplifiedChip(oSimplifiedChip, URLParsing),
                    numberUnit: chipsUtils.getNumberUnitFromSimplifiedChip(oSimplifiedChip),
                    isCustomTile: chipsUtils.isCustomTileFromSimplifiedChip(oSimplifiedChip),
                    _instantiationData: {
                        platform: "ABAP",
                        simplifiedChipFormat: true,
                        chip: oSimplifiedChip
                    }
                };

                oVisualizations[oVisualizationData.catalogTileIdStable] = oVisualization;

                if (oVisualizationData.fromPersonalization && oVisualizationData.id !== oVisualizationData.catalogTileIdStable) {
                    oUnstableVisualizations[oVisualizationData.id] = oVisualization;
                }

                return oVisualizations;
            }, {}),
            // mapping from tileTypes to vizTypes
            vizTypes: page.tileTypes.results.reduce((oVizTypes, oVizType) => {
                const oDisplayFormats = oVizType.vizOptions.displayFormats;
                const sVizTypeId = oVizType.id;

                oVizTypes[sVizTypeId] = {
                    id: sVizTypeId,
                    url: oVizType.url,
                    vizOptions: {
                        displayFormats: {
                            supported: oDisplayFormats.supported.results.map((oDisplayFormat) => {
                                return oDisplayFormat.id;
                            }),
                            default: oDisplayFormats.preferred
                        }
                    }
                };
                return oVizTypes;
            }, {})
        };

        oData.unstableVisualizations = Object.keys(oUnstableVisualizations).length > 0 ? oUnstableVisualizations : null;

        return oData;
    };

    /**
     * Extracts the data from a visualization to create a simplified chip from it
     *
     * @param {object} oVisualization The visualization to create the chip from
     * @returns {object}
     *  A simplified version of the sap.ushell_abap.pbServices.ui2.ChipInstance.
     *  The object structure of the simplified chip model can be viewed in the "simplifiedChipModel.md" document in the FLP core-concepts GitHub repository.
     *
     * @since 1.90.0
     *
     * @private
     */
    PagePersistenceAdapter.prototype._getSimplifiedChip = function (oVisualization) {
        const oBags = {};
        let oConfiguration;
        try {
            oConfiguration = JSON.parse(oVisualization.configuration);
        } catch {
            oConfiguration = {};
        }

        oVisualization.chipBags.results.forEach((oBag) => {
            oBags[oBag.id] = {
                texts: {},
                properties: {}
            };

            oBag.properties.results.forEach((oProperty) => {
                if (oProperty.translatable) {
                    oBags[oBag.id].texts[oProperty.id] = oProperty.value;
                } else {
                    oBags[oBag.id].properties[oProperty.id] = oProperty.value;
                }
            });
        });

        return {
            chipId: oVisualization.tileType,
            configuration: oConfiguration,
            bags: oBags
        };
    };

    /**
     * @param {Error} oError The error object
     * @returns {Promise<object>} A rejected promise containing the error
     *
     * @experimental Since 1.67.0
     * @private
     */
    PagePersistenceAdapter.prototype._rejectWithError = async function (oError) {
        throw new LaunchpadError(
            oError.message,
            {
                component: this.S_COMPONENT_NAME,
                description: ushellResources.i18n.getText("PagePersistenceAdapter.CannotLoadPage"),
                detail: oError
            },
            oError
        );
    };

    return PagePersistenceAdapter;
});
