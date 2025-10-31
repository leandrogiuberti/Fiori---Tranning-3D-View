declare module "sap/cux/home/utils/AppManager" {
    import BaseObject from "sap/ui/base/Object";
    import ODataMetaModel from "sap/ui/model/odata/ODataMetaModel";
    import { AppData } from "sap/ushell/services/SearchableContent";
    import { ICustomVisualization, IParseSBParameters, ISection, ISectionAndVisualization, IVisualization } from "../interface/AppsInterface";
    import { IAppManifest, ICard, ICardDetails, ICardManifest } from "../interface/CardsInterface";
    import { IPage } from "sap/cux/home/interface/PageSpaceInterface";
    const CONSTANTS: {
        MUST_INCLUDE_RECOMMEDED_APPS: string[];
    };
    interface ICombinedManifestDetails {
        manifest: IValidManifest;
        metaModel: ODataMetaModel;
    }
    interface IValidManifest {
        url: string;
        manifest: IAppManifest;
    }
    interface IMoveConfig {
        sourceSectionIndex: number;
        sourceVisualizationIndex: number;
        targetSectionIndex: number;
        targetVisualizationIndex: number;
    }
    const _parseSBParameters: (oParam: object | string | undefined) => IParseSBParameters | undefined;
    const _getTileProperties: (vizConfigFLP?: IVisualization) => IParseSBParameters | undefined;
    const _getAppId: (vizConfigFLP: IVisualization | undefined) => string;
    const _getTargetUrl: (vizConfigFLP: IVisualization | undefined) => string;
    const _isSmartBusinessTile: (oVisualization: IVisualization) => boolean;
    const _getAppTitleSubTitle: (oApp: IVisualization, vizConfigFLP: IVisualization) => {
        title: string;
        subtitle: string;
    };
    /**
     * Link Duplicate Visualizations to a single visualization
     *
     * @param {object[]} aVizs - array of visualizations
     * @returns {object[]} arry of visualizations after linking duplicate visualizations
     * @private
     */
    const _linkDuplicateVizs: (aVizs: ICustomVisualization[]) => ICustomVisualization[];
    const _isGUIVisualization: (visualization: AppData) => boolean;
    const _isMustIncludeRecommendation: (recViz: ICustomVisualization) => boolean;
    const _isVisualizationAlreadyAdded: (visualization: ICustomVisualization, favoriteVisualizations: ICustomVisualization[]) => boolean;
    /**
     *
     * @class Provides the AppManager Class used for fetch and process user apps.
     *
     * @extends sap.ui.BaseObject
     *
     * @author SAP SE
     * @version 0.0.1
     * @since 1.121.0
     * @private
     *
     * @alias sap.cux.home.util.AppManager
     */
    export default class AppManager extends BaseObject {
        private aRequestQueue;
        private _oMoveAppsPromise;
        private bInsightsSectionPresent;
        insightsSectionIndex: number;
        static Instance: AppManager;
        private recommendedFioriIds;
        private versionInfo;
        private _RBManifestMap;
        private _recommendedVisualizations;
        private vizDataModified;
        private _oVizCacheData;
        private _favPageVisualizations;
        private componentData;
        private fioriAppData;
        private recommendedUtilInstance;
        private catalogAppData;
        private constructor();
        static getInstance(): AppManager;
        /**
         * Returns page load promise from the request queue if it exists, adds it to the queue if it doesn't
         *
         * @param {string} sPageId - page id
         * @param {boolean} bForceRefresh - force reload of data if true
         * @returns {Promise} - returns a promise which resolves with the requested page data
         * @private
         */
        private _fetchRequestFromQueue;
        /**
         * Returns all dynamic visualizations present in MyHome page
         *
         * @param {boolean} bForceRefresh - force reload of visualizations data
         * @returns {Promise} - resolves to array of all dynamic visualizations in MyHome page
         * @private
         */
        private _fetchDynamicVizs;
        /**
         * Returns all the sections that are available in the MyHome page
         *
         * @param {boolean} bForceRefresh - force reload of visualizations data
         * @returns {Promise} - resolves to array of all sections available in MyHome page
         * @private
         */
        _getSections(bForceRefresh?: boolean, pageId?: string): Promise<ISection[]>;
        /**
         * Models and returns all visualizations available in MyHome page
         *
         * @param {bool} bForceRefresh - force reload of visualizations data
         * @returns {Promise} - resolves to array of all apps available in MyHome page
         * @private
         */
        private _fetchPageVizs;
        /**
         * Copies all Dynamic visualizations to Insights section
         *
         * @returns {Promise} - resolves to void and copy all the visualizations
         * @private
         */
        private _copyDynamicVizs;
        /**
         * Returns a list of all favorite vizualizations in MyHome page
         *
         * @param {boolean} bForceRefresh - force reload of vizualizations data
         * @param {boolean} bPreventGrouping - prevent vizualizations grouping
         * @returns {Promise} - resolves to array of favourite vizualizations in MyHome page
         * @private
         */
        fetchFavVizs(bForceRefresh: boolean, bPreventGrouping?: boolean, pageId?: string): Promise<ISectionAndVisualization[]>;
        /**
         * Returns all vizualizations present in the Insights Section
         *
         * @param {boolean} bForceRefresh - force reload insights vizualizations data
         * @param {string} sSectionTitle - optional, title of insights section to be used while creating insights section
         * @returns {Promise} - resolves to an array with all vizualizations in Insights section
         */
        fetchInsightApps(bForceRefresh: boolean, sSectionTitle: string): Promise<ICustomVisualization[]>;
        /**
         * Add visualization to a particular section
         *
         * @param {string} visualizationId - The id of the visualization to add.
         * @param {string} sectionId - The id of the section the visualization should be added to (optional parameter)
         * @returns {Promise} resolves to void after adding app to a section
         * @private
         */
        addVisualization(visualizationId: string, sectionId?: string | undefined): Promise<void>;
        /**
         * @param {object} mProperties - map of properties
         * @param {string} mProperties.sectionId - section id from which visualizations should be removed
         * @param {object[]} mProperties.appIds - array of url of visualizations that has to be deleted
         * @param {boolean} mProperties.ignoreDuplicateApps - if true doesn't remove the duplicate apps, else removes the duplicate apps as well
         * @private
         * @returns {Promise} resolves after all visualizations are deleted
         */
        removeVisualizations({ sectionId, vizIds }: {
            sectionId: string;
            vizIds: string[];
        }): Promise<void>;
        /**
         * @param {object} mProperties - map of properties
         * @param {string} mProperties.pageId - page id from which visualizations should be updated
         * @param {object[]} mProperties.sourceSectionIndex - section index in which visualization that has to be updated
         * @param {boolean} mProperties.sourceVisualizationIndex - visualization index in the which should be updated
         * @param {boolean} mProperties.oVisualizationData - visualization data which will be updated for the vizualisation
         * @private
         * @returns {Promise} resolves to void
         */
        updateVisualizations({ pageId, sourceSectionIndex, sourceVisualizationIndex, oVisualizationData }: {
            pageId: string;
            sourceSectionIndex: number;
            sourceVisualizationIndex: number;
            oVisualizationData: {
                displayFormatHint: string;
            };
        }): Promise<any>;
        /**
         * Create Insight Section if not already present
         *
         * @param {string} sSectionTitle - optional, section title
         * @returns {Promise} - resolves to insight section created
         */
        createInsightSection(sSectionTitle: string): Promise<void>;
        /**
         * Adds a section
         *
         * @param {object} mProperties - map of properties
         * @param {string} mProperties.sectionIndex - section index
         * @param {object} mProperties.sectionProperties - section properties
         * @returns {Promise} resolves to void and creates the section
         * @private
         */
        addSection(mProperties: ISection): Promise<void>;
        /**
         * Returns visualizations for a given section
         * @param {string} sectionId - section id
         * @param {boolean} [forceRefresh=false] - force reload of data if true
         * @returns {Promise} resolves to array of visualizations
         * @private
         */
        getSectionVisualizations(sectionId?: string, forceRefresh?: boolean, pageId?: string): Promise<ICustomVisualization[]>;
        /**
         * Adds a bookmark.
         * @private
         * @param {Object} bookmark - The bookmark data object.
         * @returns {Promise<void>} - A Promise that resolves once the bookmark is added.
         */
        addBookMark(bookmark: IVisualization, moveConfig?: IMoveConfig): Promise<any>;
        /**
         * Retrieves the visualization with the specified appId within the specified section.
         * @param {string} appId - appId of the visualization for.
         * @param {string} sectionId - The ID of the section containing the visualization.
         * @param {boolean} [forceRefresh=false] - Whether to force a refresh of the section's cache.
         * @returns {Promise<object|null>} A promise that resolves with the visualization object if found, or null if not found.
         * @private
         */
        getVisualization(appId: string, sectionId?: string, forceRefresh?: boolean): Promise<ICustomVisualization>;
        /**
         * Moves a visualization from source section to target section.
         * @param {object} moveConfig - Configuration object containing details for moving the visualization.
         * @param {number} moveConfig.sourceSectionIndex - Index of the source section.
         * @param {number} moveConfig.sourceVisualizationIndex - Index of the visualization within the source section.
         * @param {number} moveConfig.targetSectionIndex - Index of the target section.
         * @param {number} moveConfig.targetVisualizationIndex - Index at which the visualization will be placed within the target section.
         * @returns {Promise<void>} A promise that resolves to void after the move operation.
         * @private
         */
        moveVisualization(moveConfig: {
            sourceSectionIndex: number;
            sourceVisualizationIndex: number;
            targetSectionIndex: number;
            targetVisualizationIndex: number;
        }): Promise<any>;
        /**
         * Filters out duplicate visualizations from a list of all visualizations
         *
         * @param {object[]} aVisibleFavoriteVizs - array containing list of all visualizations
         * @param {boolean} bReturnDuplicateVizs - flag when set to true, returns only the duplicate apps
         * @returns {object[]} filtered array of vizualisations
         * @private
         */
        _filterDuplicateVizs(aVisibleFavoriteVizs: ICustomVisualization[], bReturnDuplicateVizs: boolean): ICustomVisualization[];
        /**
         * Add Grouping Information to visualizations list, and return concatenated list.
         *
         * @param {object[]} aFavoriteVizs - list of all favorite visualizations
         * @returns {object[]} - concatenated list contaning grouping information as well
         * @private
         */
        private _addGroupInformation;
        /**
         * Move a section within a page
         *
         * @param {number} sourceSectionIndex - source index (previous index of the section in the page before move)
         * @param {number} targetSectionIndex - target index (desired index of the section in the page after move)
         * @returns {Promise} resolves to void  and moves the section to desired index within the page
         * @private
         */
        moveSection(sourceSectionIndex: number, targetSectionIndex: number): Promise<void>;
        /**
         * Checks if a specific URL parameter is enabled (set to "true").
         *
         * @param {string} param - The name of the URL parameter to check.
         * @returns {boolean} `true` if the URL parameter exists and is set to "true" (case-insensitive), otherwise `false`.
         */
        isURLParamEnabled(param: string): boolean;
        /**
         * Fetch Recommended Fiori IDs
         *
         * @returns {Promise} resolves to array of recommended fiori ids
         * @private
         */
        private _getRecommenedFioriIds;
        /**
         * Fetch Catalog Apps
         *
         * @returns {Promise} resolves to array of Catalog Apps
         * @private
         */
        _getCatalogApps(): Promise<AppData[]>;
        /**
         * Checks whether page settings contains addCardtoInsightsHidden
         * @param {object} page - page object
         * @returns {boolean} returns boolean
         * @private
         */
        private isAddCardToInsightsHidden;
        /**
         * check Valid Manifests
         *
         * @returns {boolean} returns boolean
         * @private
         */
        private _checkValidManifests;
        /**
         * Get OData Model
         *
         * @param {object} manifest - manifest object
         * @returns {ODataModelV2} returns OData Model
         * @private
         */
        private _getOdataModel;
        /**
         * Get Entity Set
         *
         * @param {object} manifest - manifest object
         * @returns {string} returns entity set
         * @private
         */
        private _getEntitySet;
        /**
         * Load I18n
         *
         * @param {object} manifest - manifest object
         * @param {string} manifestUrl - manifest url
         * @returns {object} returns resource bundle
         * @private
         */
        private loadI18n;
        /**
         * Get I18n Value Or Default String
         *
         * @param {string} sValue - value
         * @param {object} oResourceBundle - resource bundle object
         * @returns {string} returns string
         * @private
         */
        private getI18nValueOrDefaultString;
        /**
         * Retrieves a copy of the analytical card manifest.
         *
         *
         * @private
         * @returns {ICardManifest} A copy of the analytical card manifest.
         */
        _getAnalyticalCardManifest(): ICardManifest;
        /**
         * Processes the app manifest and generates a recommended card manifest if the app meets the required conditions.
         *
         * @param {ODataMetaModel} metaModel - The OData meta model containing metadata about entities and properties.
         * @param {IValidManifest} manifestObj - An object containing the app manifest and its URL.
         * @param {AppInfoData | undefined} parentApp - The parent app information, if available.
         * @param {IVersionInfo} versionInfo - The version and build timestamp of the app.
         * @returns {Promise<ICardManifest | undefined>} A promise that resolves to the generated card manifest if the app is eligible,
         * or `undefined` if the app does not meet the required conditions.
         * @private
         */
        private getProcessedManifest;
        /**
         * Fetches the OData meta models for a given list of valid manifests.
         * @param {IValidManifest[]} validManifests - An array of valid manifest objects
         * @returns {Promise<(ODataMetaModel | undefined)[]>} A promise that resolves to an array of OData meta models.
         * Each element corresponds to a manifest in the input array, and may be `undefined` if the meta model could not be fetched.
         * @private
         */
        private fetchMetaModels;
        /**
         * Combines the valid manifests with their corresponding OData meta models.
         * @param {IValidManifest[]} validManifests - An array of valid manifest objects
         * @param {ODataMetaModel[]} aMetaModel - An array of OData meta models
         * @returns {ICombinedManifestDetails[]} An array of objects containing the manifest and the corresponding meta model.
         * @private
         */
        private combineManifestsAndMetaModels;
        /**
         * Process the manifest and meta model to get the card manifest
         * @param {ICombinedManifestDetails[]} combinedDetails - An array of objects containing the manifest and the corresponding meta model.
         * @param {IAppInfoData[]} aCSTR - An array of app info data
         * @returns {Promise<(ICardManifest | undefined)[]>} A promise that resolves to an array of recommended card manifests.
         * @private
         */
        private processManifests;
        /**
         * Processes the app list to generate a list of Fiori IDs.
         *
         * If `aList` is not provided, it uses `aAppComponentIds` and `aComponent` to generate the list of Fiori IDs.
         * It matches the `semanticObject` and `action` of each component in `aAppComponentIds` with the entries in `aComponent`.
         * If a match is found, the corresponding `fioriId` is added to the list.
         *
         * @param {string[]} [aList] - An optional array of Fiori IDs to return directly.
         * @param {ICardDetails[]} [aAppComponentIds] - An array of app component details to process.
         * @param {IAppInfo} [aComponent] - A mapping of component IDs to their corresponding data entries.
         * @returns {string[]} - A list of Fiori IDs.
         */
        private processAppList;
        /**
         * Fetch Card Mainfest
         *
         * @param {string[]} aAppIds - array of app ids
         * @returns {Promise} resolves to array of card manifest
         * @private
         */
        _getCardManifest(aList?: string[], aAppComponentIds?: ICardDetails[]): Promise<ICardManifest[]>;
        /**
         * Fetch the app manifest for the given app ids
         * @param {string[]} appIdList - array of app ids
         * @param {AppInfo} fioriData - fiori data
         * @param {AppData[]} catalogData - catalog data
         * @returns {Promise} resolves to array of manifests
         * @private
         */
        private fetchManifests;
        /**
         * Remove Duplicate Cards
         *
         * @param {object[]} aCards - array of cards
         * @returns {object[]} returns array of cards
         * @private
         */
        private _removeDuplicateCards;
        /**
         * Fetch Recommended Cards
         *
         * @returns {Promise<ICard[] | []> } resolves to array of recommended cards
         * @private
         */
        getRecommenedCards(): Promise<ICard[] | []>;
        /**
         * Retrieves a list of recommended visualizations for the user.
         *
         * The final list is composed of up to 10 recommendations, with must-include visualizations prioritized.
         * If no recommended visualizations are available or if an error occurs, it returns an empty array.
         *
         * @private
         * @async
         * @param {boolean} [forceRefresh=false] - If `true`, forces a refresh of the recommended visualizations
         *                                         regardless of whether they are cached.
         * @returns {Promise<ICustomVisualization[]>} A promise that resolves to an array of recommended visualizations.
         *                                            The array is limited to 10 visualizations, including must-include recommendations.
         */
        getRecommendedVisualizations(forceRefresh?: boolean): Promise<ICustomVisualization[]>;
        /**
         * Asynchronously retrieves the list of inbound applications from the SAP Fiori client-side target resolution service.
         *
         * @private
         * @async
         * @returns {Promise<Array>} A promise that resolves to an array of inbound applications.
         *                            If an error occurs or the inbound applications are not available, it resolves to an empty array.
         */
        private _getInboundApps;
        /**
         * Retrieves Fiori app data and stores it in the `fioriAppData` and `componentData` properties.
         *
         * This method fetches inbound applications using the `_getInboundApps` method and processes them to extract
         * Fiori app IDs (`sap-fiori-id`) and their associated semantic data. It also maps UI5 component names to their
         * corresponding Fiori app IDs for later use.
         *
         * @returns {Promise<IAppInfo>} A promise that resolves to an object containing Fiori app data
         * @private
         */
        private getFioriAppData;
        /**
         * Retrieves visualizations based on a list of Fiori IDs.
         *
         * This function processes the given Fiori IDs to find associated visualizations. It does so by fetching
         * inbound applications and catalog apps, then matching the Fiori IDs to filter out and gather relevant visualizations.
         * The function distinguishes between GUI and non-GUI visualizations, prioritizing non-GUI visualizations if both types are found.
         * It also ensures that each visualization is unique based on its URL and title, avoiding duplicates.
         *
         * @private
         * @async
         * @param {string[]} fioriIds - An array of Fiori IDs to search for visualizations.
         * @returns {Promise<ICustomVisualization[]>} A promise that resolves to an array of unique visualizations associated with the provided Fiori IDs.
         */
        private _getVisualizationsByFioriIds;
        /**
         * Retrieves visualizations for all favorite pages based on the provided parameters.
         * @param {Array} pages - An array of favorite pages.
         * @param {boolean} shouldReload - A flag indicating whether to reload page visualizations.
         * @returns {Promise<ICustomVisualization[]>} A promise that resolves with an array of favorite page visualizations.
         * @private
         */
        _getAllFavPageApps(pages: IPage[], shouldReload?: boolean): Promise<ICustomVisualization[]>;
        /**
         * Loads visualizations for all specified pages.
         * @param {Array} pages - An array of pages.
         * @param {boolean} [shouldFetchDistinctApps=false] - A flag indicating whether to fetch distinct pages.
         * @returns {Promise<ICustomVisualization[]>} A promise that resolves with an array of page visualizations.
         * @private
         */
        private _loadAllPageVisualizations;
        /**
         * Fetches page data for the specified pages.
         * @param {Array} pages - An array of pages.
         * @param {boolean} forceRefresh - If true, forces a refresh of the page data.
         * @returns {Promise<IPage>} A promise that resolves to the fetched page data.
         * @private
         */
        private loadPages;
    }
}
//# sourceMappingURL=AppManager.d.ts.map