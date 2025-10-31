// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @file Exposes a CommonDataModel-based site document in a platform-neutral format to it's clients
 * @version 1.141.1
 */
sap.ui.define([
    "sap/ushell/services/CommonDataModel/PersonalizationProcessor",
    "sap/ushell/services/CommonDataModel/vizTypeDefaults/VizTypeDefaults",
    "sap/base/util/ObjectPath",
    "sap/ui/thirdparty/jquery",
    "sap/base/util/isPlainObject",
    "sap/ushell/services/CommonDataModel/SiteConverter",
    "sap/base/util/isEmptyObject",
    "sap/base/util/deepClone",
    "sap/base/util/deepExtend",
    "sap/base/util/extend",
    "sap/base/util/Version",
    "sap/ushell/Config",
    "sap/base/util/values",
    "sap/ushell/library",
    "sap/ushell/utils",
    "sap/ushell/adapters/cdm/v3/_LaunchPage/readApplications",
    "sap/base/Log",
    "sap/ushell/Container"
], (
    PersonalizationProcessor,
    VizTypeDefaults,
    ObjectPath,
    jQuery,
    isPlainObject,
    SiteConverter,
    isEmptyObject,
    deepClone,
    deepExtend,
    extend,
    Version,
    Config,
    objectValues,
    ushellLibrary,
    ushellUtils,
    readApplications,
    Log,
    Container
) => {
    "use strict";

    // shortcut for sap.ushell.DisplayFormat
    const DisplayFormat = ushellLibrary.DisplayFormat;

    // shortcut for sap.ushell.ContentNodeType
    const ContentNodeType = ushellLibrary.ContentNodeType;

    const S_COMPONENT_NAME = "sap.ushell.services.CommonDataModel";

    /**
     * @alias sap.ushell.services.CommonDataModel
     * @class
     * @classdesc The Unified Shell's CommonDataModel service.
     * Exposes a CommonDataModel-based site document in a platform-neutral format to its clients.
     *
     * <b>Note:</b> To retrieve a valid instance of this service, it is necessary to call {@link sap.ushell.Container#getServiceAsync}.
     * <pre>
     *   sap.ui.require(["sap/ushell/Container"], async function (Container) {
     *     const ClientSideTargetResolution = await Container.getServiceAsync("ClientSideTargetResolution");
     *     // do something with the ClientSideTargetResolution service
     *   });
     * </pre>
     *
     * @param {object} oAdapter
     *   Adapter, provides an array of Inbounds
     * @param {object} oContainerInterface
     *   Not in use
     * @param {string} sParameters
     *   Parameter string, not in use
     * @param {object} oServiceConfiguration
     *   The service configuration not in use
     *
     * @hideconstructor
     *
     * @since 1.40.0
     * @private
     */
    function CommonDataModel (oAdapter, oContainerInterface, sParameters, oServiceConfiguration) {
        this._oAdapter = oAdapter;
        this._oPersonalizationProcessor = new PersonalizationProcessor();
        this._oSiteConverter = new SiteConverter();
        this._oSiteDeferred = new jQuery.Deferred();
        this._oOriginalSite = {};
        this._bPersonalizationLoadingFailed = false;

        // CDM 3.0
        this._oPersonalizedSiteForCDMVersion30 = {};
        this._bLoadPersonalizationForCDMVersion30Late = false;

        // CDM 3.1
        this._oPersonalizedPages = {};
        this._oPersonalizationDeltasForCDMVersion31 = {};
        this._mGetPagesPromises = {};

        this._pGetSiteFromAdapter = oAdapter.getSite()
            .then((oSite) => {
                this._oOriginalSite = deepExtend({}, oSite);

                const oCDMSiteVersion = new Version(oSite._version);
                // This check is for CDM versions < 3.1 as next to CDM 3.0 there could still be CDM 2.0 sites that require the same behavior
                if (oCDMSiteVersion.compareTo("3.1.0") < 0) {
                    // For the classic homepage load the personalization early
                    // but only if it is needed -> not for the direct app start
                    const bLoadPersonalizationForCDMVersion30Early = ushellUtils.isFlpHomeIntent();
                    if (bLoadPersonalizationForCDMVersion30Early) {
                        this._loadAndApplyPersonalizationForCDMVersion30(oSite);
                    } else {
                        this._bLoadPersonalizationForCDMVersion30Late = true;
                    }
                } else {
                    this._prepareSiteForCDMVersion31();
                }

                return oSite;
            })
            .fail((oError) => {
                this._oSiteDeferred.reject(oError);
                this._bLoadPersonalizationForCDMVersion30Late = false;
            });
    }

    /**
     * Loads the personalization for a CDM 3.0 site and applies the personalization.
     * This function does not return the personalized site, but resolves the site deferred with it.
     *
     * @param {object} oSite The CDM 3.0 site
     *
     * @private
     * @since 1.132.0
     */
    CommonDataModel.prototype._loadAndApplyPersonalizationForCDMVersion30 = async function (oSite) {
        try {
            const oPersonalization = await this._getPersonalization(oSite._version);
            this._oPersonalizedSiteForCDMVersion30 = await this._triggerMixinPersonalizationInSite(oSite, oPersonalization);
            this._oSiteDeferred.resolve(this._oPersonalizedSiteForCDMVersion30);
        } catch (oError) {
            this._oSiteDeferred.reject(oError);
        }
    };

    /**
     * Prepares the CDM 3.1 site with some consistency checks.
     *
     * @private
     * @since 1.132.0
     */
    CommonDataModel.prototype._prepareSiteForCDMVersion31 = function () {
        this._ensureStandardVizTypesPresent(this._oOriginalSite).then(() => {
            this._ensureProperDisplayFormats(this._oOriginalSite);
            // if the CDM site already contains all the pages, this is the complete site but without personalization
            // if the pages are retrieved from the adapter one by one this site doesn't contain the pages yet
            this._oSiteDeferred.resolve(this._oOriginalSite);
        });
    };

    /**
     * Applies the personalization to the page and stores it
     * @param {object} oPage The page without the personalization
     * @param {object} oPersonalization The personalization object of the CDM site
     * @returns {Promise<object>} Resolves with the personalized page
     *
     * @since 1.78.0
     * @private
     */
    CommonDataModel.prototype._applyPagePersonalization = function (oPage, oPersonalization) {
        const sPageId = oPage.identification.id;

        if (Object.keys(oPersonalization).length) {
            // BCP: 002075129400005034972020
            // Recover old personalization
            const oClassicPers = oPersonalization.classicHomePage;
            if (oClassicPers && oClassicPers.version === "3.1.0") {
                Object.keys(oClassicPers).forEach((sPage) => {
                    // only recover pages which were not further personalized
                    if (!oPersonalization[sPage]) {
                        oPersonalization[sPage] = oClassicPers[sPage];
                    }
                });
                delete oPersonalization.classicHomePage;
                oPersonalization._version = oPersonalization.version;
            }

            // Migrate classic homepage personalization to pages personalization
            const oVersion = new Version(oPersonalization._version || oPersonalization.version);
            if (oVersion.compareTo("3.1.0") < 0) {
                oPersonalization = {
                    classicHomePage: oPersonalization,
                    _version: "3.1.0",
                    version: "3.1.0"
                };
            }
        }
        this._oPersonalizationDeltasForCDMVersion31 = oPersonalization;

        // clone the page's personalization delta to make sure that it is not changed
        // this is important as the delta might not get extracted again before it is saved
        // which would save the changed delta
        const oPagePersonalization = deepClone(oPersonalization[sPageId], 20) || {};
        const oConvertedPage = this._oSiteConverter.convertTo("3.0.0", deepClone(oPage, 20));

        return this._triggerMixinPersonalizationInSite(oConvertedPage, oPagePersonalization).then((oPersonalizedSite) => {
            this._oPersonalizedPages[sPageId] = this._oSiteConverter.convertTo("3.1.0", deepClone(oPersonalizedSite, 20));
            return this._oPersonalizedPages[sPageId];
        });
    };

    /**
     * Executes the migration callback in case it is implemented on the adapter
     * and saves afterwards. The adapter implementation is required to migrate the
     * pages in place and resolve an array of pages which are required to be saved.
     * @param {object[]} aPages An array of cdm 3.1 pages
     *
     * @returns {Promise<object[]>} Resolves the migrated and saved pages
     *
     * @private
     * @since 1.98.0
     */
    CommonDataModel.prototype._migratePersonalizedPages = async function (aPages) {
        if (typeof this._oAdapter.migratePersonalizedPages !== "function") {
            return aPages;
        }

        const aPagesToSave = await this._oAdapter.migratePersonalizedPages(aPages);

        if (aPagesToSave.length) {
            await this.save(aPagesToSave);
        }

        return aPages;
    };

    /**
     * This function is used to trigger the mixing of the personalization into a site object and afterwards
     * checking the personalized site for errors.
     * @param {object} oSite CDM 3.0 site
     * @param {object} oPersonalization of an individual site object
     * @returns {Promise<object>} resolves when a valid personalized site was generated
     * @private
     * @since 1.76.0
     */
    CommonDataModel.prototype._triggerMixinPersonalizationInSite = async function (oSite, oPersonalization) {
        const oPersonalizedSite = await ushellUtils.promisify(this._oPersonalizationProcessor.mixinPersonalization(oSite, oPersonalization));

        // Apply the Null Object Pattern to prevent errors
        // e.g.: Avoid errors when accessing links when no links are present
        // See internal incident BCP: 1780350619
        this._ensureCompleteSite(oPersonalizedSite);
        this._ensureGroupsOrder(oPersonalizedSite);
        // add standard vizTypes, as otherwise they would needed to be added by an
        // admin in the design time tool manually on all platforms...
        await this._ensureStandardVizTypesPresent(oPersonalizedSite);
        this._ensureProperDisplayFormats(oPersonalizedSite);

        return oPersonalizedSite;
    };

    /**
     * TODO to be removed
     * @returns {jQuery.Deferred} resolves with the groups order.
     * @private
     */
    CommonDataModel.prototype.getHomepageGroups = function () {
        const oDeferred = new jQuery.Deferred();

        this.getSite().then((oSite) => {
            // the group order was not available in the very first ABAP CDM RT Site
            const aGroupsOrder = (oSite && oSite.site && oSite.site.payload && oSite.site.payload.groupsOrder)
                ? oSite.site.payload.groupsOrder : [];

            oDeferred.resolve(aGroupsOrder);
        });
        return oDeferred.promise();
    };

    /**
     * TODO to be removed
     * @returns {jQuery.Deferred} resolves with the groups.
     * @private
     */
    CommonDataModel.prototype.getGroups = function () {
        const oDeferred = new jQuery.Deferred();

        this.getSite().then((oSite) => {
            const aGroups = [];
            Object.keys(oSite.groups).forEach((sKey) => {
                aGroups.push(oSite.groups[sKey]);
            });
            oDeferred.resolve(aGroups);
        });
        return oDeferred.promise();
    };

    /**
     * TODO to be removed
     * @param {string} sId the id of the group.
     * @returns {jQuery.Deferred} resolves with a group or rejects with an error string.
     * @private
     */
    CommonDataModel.prototype.getGroup = function (sId) {
        const oDeferred = new jQuery.Deferred();
        this.getSite().then((oSite) => {
            const oGroup = oSite.groups[sId];
            if (oGroup) {
                oDeferred.resolve(oGroup);
            } else {
                oDeferred.reject(new Error(`Group ${sId} not found`));
            }
        });
        return oDeferred.promise();
    };

    /**
     * Returns the Common Data Model site with mixed in personalization.
     * The following sections are allowed to be changed:
     *   - site.payload.groupsOrder
     *   - groups
     * Everything else must not be changed.
     *
     * @returns {jQuery.Promise}
     *    resolves with the Common Data Model site
     * @private
     *
     * @see #save
     * @since 1.40.0
     */
    CommonDataModel.prototype.getSite = function () {
        // TODO JSDoc: tbd is it allowed to change "personalization" section?

        // The personalization gets only loaded here for CDM versions < 3.1.0
        // and if it was not loaded early
        if (this._bLoadPersonalizationForCDMVersion30Late) {
            this.getSiteWithoutPersonalization().then((oSite) => this._loadAndApplyPersonalizationForCDMVersion30(oSite));
            this._bLoadPersonalizationForCDMVersion30Late = false;
        }

        return this._oSiteDeferred.promise();
    };

    /**
     * Returns the Common Data Model site without mixed personalization.
     * In case of the deep link we don't need to load and apply personalization
     * to the origin site, because personalization is used only for homepage
     * @returns {jQuery.Promise}
     *    resolves with the Common Data Model site without personalization
     * @private
     *
     * @since 1.89.0
     */
    CommonDataModel.prototype.getSiteWithoutPersonalization = function () {
        return this._pGetSiteFromAdapter;
    };

    /**
     * Returns the Common Data Model site of a Page
     * @param {string} sPageId The Id of the page to return
     *
     * @returns {Promise<object>}
     *    Resolves with the Common Data Model site
     * @since 1.72.0
     *
     * @private
     *
     */
    CommonDataModel.prototype.getPage = async function (sPageId) {
        const bEnablePersonalization = Config.last("/core/shell/enablePersonalization");
        const bEnableMyHome = Config.last("/core/spaces/myHome/enabled");
        const sMyHomePageId = Config.last("/core/spaces/myHome/myHomePageId");

        await this._pGetSiteFromAdapter;
        // Allow multiple fetches without rebuilding the page
        // This enables multiple personalization actions with a single save
        if (this._oPersonalizedPages[sPageId]) {
            return this._oPersonalizedPages[sPageId];
        }

        if (bEnablePersonalization || (bEnableMyHome && sPageId === sMyHomePageId)) {
            let oPage;
            let oPersonalization;
            let oPersonalizedPage;
            try {
                oPage = await this._getPageFromAdapter(sPageId);
                oPersonalization = await this._getPersonalization(this._oOriginalSite._version);
            } catch (oError) {
                Log.error(`CommonDataModel Service: Cannot get page ${sPageId}`, oError);
                throw oError;
            }

            try {
                oPersonalizedPage = await this._applyPagePersonalization(oPage, oPersonalization);
            } catch (oError) {
                Log.error("CommonDataModel Service: Cannot mixin the personalization", oError);
                throw oError;
            }

            const aMigratedPages = await this._migratePersonalizedPages([oPersonalizedPage]);
            return aMigratedPages[0];
        }
        return this._getPageFromAdapter(sPageId);
    };

    /**
     * Returns a specific page and provides a fallback for a missing adapter method.
     * The function also extends the original CDM site with newly retrieved visualizations & vizTypes.
     *
     * @param {string} sPageId The id of the page
     * @returns {Promise<object>} The page
     *
     * @since 1.78.0
     * @private
     */
    CommonDataModel.prototype._getPageFromAdapter = async function (sPageId) {
        if (!this._oAdapter.getPage) {
            return deepClone(this._oOriginalSite.pages[sPageId], 20);
        }

        const oPage = await this._oAdapter.getPage(sPageId);
        const oVisualizations = await this.getCachedVisualizations();
        const oVizTypes = await this.getCachedVizTypes();

        this._oOriginalSite.pages[sPageId] = oPage;
        this._oOriginalSite.visualizations = oVisualizations;
        this._oOriginalSite.vizTypes = oVizTypes;
        return deepClone(oPage, 20);
    };

    /**
     * Returns a filtered array of pages, for a given array of pages
     * Only proper pages that are not undefined or falsy are returned.
     * @param {object[]} aPages Pages to be filtered
     * @returns {object[]} The filtered pages
     */
    CommonDataModel.prototype._filterForProperPages = function (aPages) {
        return aPages.filter((oPage) => {
            return !!oPage;
        });
    };

    /**
     * Returns the requested pages.
     *
     * @param {string[]} aPageIds The IDs of the requested pages
     * @returns {Promise<object[]>}
     *    The Promise resolves with an array of the requested pages.
     * @since 1.75.0
     *
     * @private
     */
    CommonDataModel.prototype.getPages = function (aPageIds) {
        const bEnablePersonalization = Config.last("/core/shell/enablePersonalization");
        const bEnableMyHome = Config.last("/core/spaces/myHome/enabled");
        const sMyHomePageId = Config.last("/core/spaces/myHome/myHomePageId");
        let pReturn;

        if (this._mGetPagesPromises[aPageIds.toString()]) {
            pReturn = this._mGetPagesPromises[aPageIds.toString()];
        } else {
            pReturn = Promise.resolve(this._pGetSiteFromAdapter).then(() => {
                if (bEnablePersonalization || bEnableMyHome) {
                    return Promise.all([
                        this._getPagesFromAdapter(aPageIds),
                        this._getPersonalization(this._oOriginalSite._version)
                    ])
                        .catch((oError) => {
                            Log.error("CommonDataModel Service: Cannot get pages", oError);
                            throw new Error("CommonDataModel Service: Cannot get pages");
                        })
                        .then((aResults) => {
                            const oPages = aResults[0];
                            const oPersonalization = aResults[1];
                            return Promise.all(Object.keys(oPages).map((sPageId) => {
                                // Allow multiple fetches without rebuilding the page
                                // This enables multiple personalization actions with a single save
                                if (this._oPersonalizedPages[sPageId]) {
                                    return Promise.resolve(this._oPersonalizedPages[sPageId]);
                                }
                                if (!bEnablePersonalization && sPageId !== sMyHomePageId) {
                                    return Promise.resolve(oPages[sPageId]);
                                }
                                return this._applyPagePersonalization(oPages[sPageId], oPersonalization)
                                    .catch((oError) => {
                                        Log.error("Personalization Processor: Cannot mixin the personalization.", oError);
                                        throw new Error("Personalization Processor: Cannot mixin the personalization.");
                                    });
                            }))
                                .then((aPersonalizedPages) => {
                                    return this._migratePersonalizedPages(aPersonalizedPages);
                                })
                                .then((aPages) => {
                                    return this._filterForProperPages(aPages);
                                });
                        });
                }
                return this._getPagesFromAdapter(aPageIds)
                    .then((oPages) => {
                        return this._filterForProperPages(objectValues(oPages));
                    });
            });
            // We are only caching per IDs as we do not expect several different calls with different IDs to happen.
            this._mGetPagesPromises[aPageIds.toString()] = pReturn;
        }
        return pReturn;
    };

    /**
     * Returns a list of specific pages and provides a fallback for a missing adapter method.
     * The function also extends the original CDM site with newly retrieved visualizations & vizTypes.
     *
     * @param {string[]} aPageIds The array of page ids
     * @returns {Promise<object[]>} The array of pages
     *
     * @since 1.78.0
     * @private
     */
    CommonDataModel.prototype._getPagesFromAdapter = async function (aPageIds) {
        if (!this._oAdapter.getPages) {
            const oPagesToReturn = {};
            for (const sPageId in this._oOriginalSite.pages) {
                if (aPageIds.includes(this._oOriginalSite.pages[sPageId].identification.id)) {
                    oPagesToReturn[sPageId] = this._oOriginalSite.pages[sPageId];
                }
            }
            return deepClone(oPagesToReturn, 20);
        }

        const oPages = await this._oAdapter.getPages(aPageIds);
        const oVisualizations = await this.getCachedVisualizations();
        const oVizTypes = await this.getCachedVizTypes();

        this._oOriginalSite.visualizations = oVisualizations;
        this._oOriginalSite.vizTypes = oVizTypes;

        Object.keys(oPages).forEach((sKey) => {
            this._oOriginalSite.pages[sKey] = oPages[sKey];
        });

        return deepClone(oPages, 20);
    };

    /**
     * Loads all pages
     * @param {object} [oFilter]
     *      Applies a filter before the pages are loaded.
     *      Currently no filter combinations are allowed.
     * @param {boolean} [oFilter.personalizedPages]
     *      When enabled a lookup to the personalization is done
     *      and only personalized pages are loaded.
     * @returns {Promise<object[]>} Resolves with an array of all loaded pages
     *
     * @since 1.77.0
     * @private
     */
    CommonDataModel.prototype.getAllPages = async function (oFilter) {
        if (oFilter && oFilter.personalizedPages) {
            return this._getAllPersonalizedPages();
        }
        const aPageIds = await this._getAssignedPageIds();
        return this.getPages(aPageIds);
    };

    /**
     * Resolves the ID list of the assigned pages
     * @returns {Promise<string[]>} Resolves the list of assigned pageIds
     *
     * @since 1.98.0
     * @private
     */
    CommonDataModel.prototype._getAssignedPageIds = async function () {
        const oMenuService = await Container.getServiceAsync("Menu");
        const aContentNodes = await oMenuService.getContentNodes();
        const aPageIds = [];
        aContentNodes.forEach((oContentNode) => {
            this._collectPageIds(oContentNode, aPageIds);
        });
        return aPageIds;
    };

    /**
     * Collects the page IDs referenced by a content node.
     * The result contains the page IDs of the content node's children.
     * @param {*} oContentNode Content node
     * @param {*} aPageIds Array with page IDs
     *
     * @since 1.105.0
     * @private
     */
    CommonDataModel.prototype._collectPageIds = function (oContentNode, aPageIds) {
        // Register ID once if content node is a page
        if (oContentNode.type === ContentNodeType.Page) {
            if (aPageIds.indexOf(oContentNode.id) === -1) {
                aPageIds.push(oContentNode.id);
            }
        }

        // Process children recursively
        if (oContentNode.children !== undefined) {
            oContentNode.children.forEach((contentNode) => {
                this._collectPageIds(contentNode, aPageIds);
            });
        }
    };

    /**
     * Loads all pages which have personalization
     * @returns {Promise<object[]>} Resolves the personalized pages
     *
     * @since 1.98.0
     * @private
     */
    CommonDataModel.prototype._getAllPersonalizedPages = async function () {
        await this._pGetSiteFromAdapter;
        const aAssignedPages = await this._getAssignedPageIds();
        const oPersonalization = await this._getPersonalization(this._oOriginalSite._version);
        const aPageIds = [];

        Object.keys(oPersonalization).forEach((sPageId) => {
            if (sPageId === "version" || sPageId === "_version") {
                return;
            }
            if (!aAssignedPages.includes(sPageId)) {
                return; // only load assigned pages
            }
            const oPagePersonalization = oPersonalization[sPageId];
            // _version might be there even after reverting personalization
            if (Object.keys(oPagePersonalization).length > 1) {
                aPageIds.push(sPageId);
            }
        });

        if (aPageIds.length > 0) {
            return this.getPages(aPageIds);
        }
        return [];
    };

    /**
     * Returns all applications of the Common Data Model.
     *
     * @returns {Promise<object>}
     *  A promise which resolves with all applications
     *  of the Common Data Model
     *
     * @private
     * @since 1.75.0
     */
    CommonDataModel.prototype.getApplications = function () {
        return new Promise((resolve, reject) => {
            this.getSite()
                .then((oSite) => {
                    const oApplications = oSite.applications;
                    if (oApplications) {
                        resolve(oApplications);
                    } else {
                        reject(new Error("CDM applications not found."));
                    }
                })
                .fail(reject);
        });
    };

    /**
     * Returns all vizTypes of the Common Data Model.
     * The method loads all of the available visualizations lazily from the backend
     * before returning them.
     *
     * @returns {Promise<object>}
     *  A promise which resolves with all vizTypes
     *  of the Common Data Model
     *
     * @private
     * @since 1.78.0
     */
    CommonDataModel.prototype.getVizTypes = async function () {
        if (typeof this._oAdapter.getVizTypes === "function") {
            const oSiteVizTypes = await this._getSiteProperty("vizTypes");
            const oAdapterVizTypes = await this._oAdapter.getVizTypes();

            return extend(oSiteVizTypes, oAdapterVizTypes);
        }

        // If the adapter doesn't implement #getVizTypes we can rely on the fact that the site
        // already has all of the required vizTypes. Therefore no lazy loading is needed and we return the cached vizTypes.
        return this.getCachedVizTypes();
    };

    /**
     * Returns all vizTypes of the Common Data Model which were
     * already loaded & cached internally in the CDM site.
     *
     * @returns {Promise<object>}
     *  A promise which resolves with all vizTypes
     *  of the Common Data Model
     *
     * @private
     * @since 1.89.0
     */
    CommonDataModel.prototype.getCachedVizTypes = async function () {
        let oCachedVizTypes;

        if (typeof this._oAdapter.getCachedVizTypes === "function") {
            oCachedVizTypes = await this._oAdapter.getCachedVizTypes();
        }

        const oSiteVizTypes = await this._getSiteProperty("vizTypes");

        return extend(oSiteVizTypes, oCachedVizTypes);
    };

    /**
     * Returns a single vizType of the Common Data Model.
     * The method loads it lazily from the backend before returning them.
     *
     * @param {string} sVizType the vizType
     * @returns {Promise<object>} A promise containing the single vizType.
     *
     * @private
     * @since 1.91.0
     */
    CommonDataModel.prototype.getVizType = async function (sVizType) {
        let oVizType;

        if (typeof this._oAdapter.getVizType === "function") {
            oVizType = await this._oAdapter.getVizType(sVizType);
        }

        const oSiteVizTypes = await this._getSiteProperty("vizTypes");

        if (oVizType) {
            oSiteVizTypes[sVizType] = oVizType;
        }

        return oSiteVizTypes[sVizType];
    };

    /**
     * Returns all visualizations of the Common Data Model.
     * The method loads all of the available visualizations lazily from the backend
     * before returning them.
     *
     * @returns {Promise<object>}
     *  A promise which resolves with all visualizations
     *  of the Common Data Model
     *
     * @private
     * @since 1.75.0
     */
    CommonDataModel.prototype.getVisualizations = async function () {
        if (typeof this._oAdapter.getVisualizations === "function") {
            const oSiteVisualizations = await this._getSiteProperty("visualizations");
            const oAdapterVisualizations = await this._oAdapter.getVisualizations();

            return extend(oSiteVisualizations, oAdapterVisualizations);
        }

        // If the adapter doesn't implement #getVisualizations we can rely on the fact that the site
        // already has all of the required vizTypes. Therefore no lazy loading is needed and we return the cached visualizations.
        return this.getCachedVisualizations();
    };

    /**
     * Returns all visualizations of the Common Data Model which were
     * already loaded & cached internally in the CDM site.
     *
     * @returns {Promise<object>}
     *  A promise which resolves with all visualizations
     *  of the Common Data Model
     *
     * @private
     * @since 1.89.0
     */
    CommonDataModel.prototype.getCachedVisualizations = async function () {
        let oCachedVisualizations;

        if (typeof this._oAdapter.getCachedVisualizations === "function") {
            oCachedVisualizations = await this._oAdapter.getCachedVisualizations();
        }

        const oSiteVisualizations = await this._getSiteProperty("visualizations");

        return extend(oSiteVisualizations, oCachedVisualizations);
    };

    /**
     * Returns the value located at the provided object path of the CDM site.
     * The value is returned asynchronously to make sure the site was loaded completely.
     *
     * @param {(string|string[])} vObjectPath Path as string where each name is separated by '.'. Can also be an array of names.
     * @returns {Promise} Returns the value located in the provided path. If the path does not exist completely the promise is rejected with an error message.
     *
     * @private
     * @since 1.89.0
     */
    CommonDataModel.prototype._getSiteProperty = function (vObjectPath) {
        return new Promise((resolve, reject) => {
            this.getSite()
                .then((oSite) => {
                    const vProperty = ObjectPath.get(vObjectPath, oSite);
                    if (vProperty) {
                        resolve(vProperty);
                    } else {
                        const sProperty = vObjectPath.toString();
                        reject(new Error(`CDM ${sProperty} not found.`));
                    }
                })
                .fail(reject);
        });
    };

    /**
     * Returns a given group from the original site.
     *
     * @param {string} sGroupId
     *  Group id
     * @returns {jQuery.Promise}
     *  Resolves with the respective group from the original site.
     *  In case the group is not existing in the original site,
     *  a respective error message is passed to the fail handler.
     * @private
     *
     * @since 1.42.0
     */
    CommonDataModel.prototype.getGroupFromOriginalSite = function (sGroupId) {
        const oDeferred = new jQuery.Deferred();

        if (typeof sGroupId === "string" &&
            this._oOriginalSite &&
            this._oOriginalSite.groups &&
            this._oOriginalSite.groups[sGroupId]) {
            oDeferred.resolve(deepExtend({}, this._oOriginalSite.groups[sGroupId]));
        } else {
            oDeferred.reject(new Error("Group does not exist in original site."));
        }

        return oDeferred.promise();
    };

    /**
     * Returns the page with the given id of the original site.
     *
     * @param {string} pageId The id of the page to be retrieved.
     *
     * @private
     * @returns {object} The page of the original site.
     *
     * @since 1.75.0
     */
    CommonDataModel.prototype.getOriginalPage = function (pageId) {
        return deepClone(this._oOriginalSite.pages[pageId], 20);
    };

    /**
     * Saves the personalization change together with the collected personalization
     * changes since the last FLP reload.
     *
     * @param {string | string[]} [pageId] The ID of the page or an array of pageIds. Needs to be provided for CDM 3.1.0
     * @returns {jQuery.Promise} Resolves once the save action was successful or rejects instead with an error message.
     * @private
     *
     * @see #getSite
     * @since 1.40.0
     */
    CommonDataModel.prototype.save = function (pageId) {
        const oDeferred = new jQuery.Deferred();

        if (this._bPersonalizationLoadingFailed) {
            // There is no way to recover from this except reloading the FLP as a more complex recovery logic
            // would be overkill for this rare case.
            const sErrorMessage = "Prior personalization loading failed, cancelling save to prevent data loss. Saving this personalization will only be possible after reloading the FLP again.";
            Log.error(sErrorMessage, null, S_COMPONENT_NAME);
            oDeferred.reject(new Error(sErrorMessage));
            return oDeferred.promise();
        }

        if (this._oOriginalSite._version === "3.1.0") {
            if (!pageId) {
                return oDeferred.reject(new Error("No page id was provided")).promise();
            }
            if (typeof pageId === "string") {
                pageId = [pageId];
            }

            this._saveCdmVersion31(pageId)
                .then(oDeferred.resolve)
                .catch(oDeferred.reject);
        } else {
            this._saveCdmVersion30()
                .then(oDeferred.resolve)
                .catch(oDeferred.reject);
        }

        return oDeferred.promise();
    };

    /**
     * Extracts and saves the personalization for a CDM 3.0 site
     * @returns {Promise} Resolves once the personalization was extracted and saved
     *
     * @private
     * @since 1.98.0
     */
    CommonDataModel.prototype._saveCdmVersion30 = function () {
        const oOriginalPage = this._oOriginalSite;
        const oPersonalizedPage = this._oPersonalizedSiteForCDMVersion30;

        return new Promise((resolve, reject) => {
            this._oPersonalizationProcessor.extractPersonalization(deepClone(oPersonalizedPage, 20), deepClone(oOriginalPage, 20))
                .done(resolve)
                .fail(reject);
        })
            .catch((oError) => {
                Log.error("Personalization Processor: Cannot extract personalization.", oError, S_COMPONENT_NAME);
                throw new Error("Personalization Processor: Cannot extract personalization.");
            })
            .then((oPersonalization) => {
                if (isEmptyObject(oPersonalization)) {
                    return Promise.resolve();
                }
                return this._setPersonalization(oPersonalization);
            });
    };

    /**
     * Extracts and saves the personalization for a CDM 3.1 site
     * @param {string[]} aPageIds The list of pages which should be saved
     * @returns {Promise} Resolves once the personalization was extracted and saved
     *
     * @private
     * @since 1.98.0
     */
    CommonDataModel.prototype._saveCdmVersion31 = function (aPageIds) {
        // Extract personalization deltas
        const aPersPromises = aPageIds.map((sPageId) => {
            const oOriginalPage = this._oSiteConverter.convertTo("3.0.0", this._oOriginalSite.pages[sPageId]);
            const oPersonalizedPage = this._oSiteConverter.convertTo("3.0.0", this._oPersonalizedPages[sPageId]);

            return new Promise((resolve, reject) => {
                this._oPersonalizationProcessor.extractPersonalization(deepClone(oPersonalizedPage, 20), deepClone(oOriginalPage, 20))
                    .done((oPersonalization) => {
                        resolve({
                            pageId: sPageId,
                            personalization: oPersonalization
                        });
                    })
                    .fail((oError) => {
                        Log.error(`Cannot extract personalization of page ${sPageId}:`, oError, S_COMPONENT_NAME);
                        resolve();
                    });
            });
        });

        // save personalization deltas to internal object
        return Promise.all(aPersPromises)
            .then((aPersonalizations) => {
                let bShouldSave = false;
                aPersonalizations.forEach((oDelta) => {
                    if (!oDelta) {
                        return;
                    }
                    if (!isEmptyObject(oDelta.personalization)) {
                        bShouldSave = true;
                        /*
                         * This is a problem based on the ADR which said ".version" but the CDM Adapter checks for "._version".
                         * Now we have to check for both version notations and make sure both have been written so personalization
                         * does not fail the version check.
                         */
                        if (this._oPersonalizationDeltasForCDMVersion31.version === undefined || this._oPersonalizationDeltasForCDMVersion31._version === undefined) {
                            this._oPersonalizationDeltasForCDMVersion31.version = this._oOriginalSite._version;
                            this._oPersonalizationDeltasForCDMVersion31._version = this._oOriginalSite._version;
                        }

                        this._oPersonalizationDeltasForCDMVersion31[oDelta.pageId] = oDelta.personalization;
                    }
                });

                // Save internal object to personalization
                if (bShouldSave) {
                    return this._setPersonalization(this._oPersonalizationDeltasForCDMVersion31);
                }
                return Promise.resolve();
            });
    };

    /**
     * Get the CDM personalization from the adapter.
     *
     * @param {string} sCDMVersion The CDM version
     * @returns {Promise<object>} The personalization for the given CDM version or an empty object if the personalization could not be loaded
     */
    CommonDataModel.prototype._getPersonalization = function (sCDMVersion) {
        return ushellUtils.promisify(this._oAdapter.getPersonalization(sCDMVersion))
            .catch((oError) => {
                Log.error("Could not get page personalization", oError, S_COMPONENT_NAME);
                // Do not prevent the page from loading if the personalization could not be loaded
                // but prevent saving the personalization to prevent data loss
                this._bPersonalizationLoadingFailed = true;
                return {};
            });
    };

    /**
     * Sets the personalization based on the provided delta and page id.
     * Also prevents multiple requests and instead queries a later delta to be persisted until the currently active request is finished.
     * Only the latest delta will be persisted in this manner. If more than one request is queried all promises will be resolved as soon as the latest delta is persisted
     *
     * @param {object} extractedPersonalization The personalization delta to be persisted
     * @param {string} pageId The page ID the personalization belongs to
     * @returns {Promise} A promise that wraps the Deferred of the CDM Adapter to save the personalization
     */
    CommonDataModel.prototype._setPersonalization = function (extractedPersonalization, pageId) {
        if (this._oPendingPersonalizationDeferred) {
            if (!this._oNextPersonalizationQuery) {
                this._oNextPersonalizationQuery = {
                    fnNextCall: null,
                    aPromiseResolvers: []
                };
            }
            return new Promise((resolve, reject) => {
                this._oNextPersonalizationQuery.fnNextCall = this._setPersonalization.bind(this, extractedPersonalization, pageId);
                this._oNextPersonalizationQuery.aPromiseResolvers.push({
                    resolve: resolve,
                    reject: reject
                });
            });
        }
        this._oPendingPersonalizationDeferred = this._oAdapter.setPersonalization(extractedPersonalization, pageId);
        return new Promise((resolve, reject) => {
            this._oPendingPersonalizationDeferred
                .then(resolve)
                .fail(reject)
                .always(() => {
                    delete this._oPendingPersonalizationDeferred;
                    if (this._oNextPersonalizationQuery) {
                        const oNextPersonalizationPromise = this._oNextPersonalizationQuery.fnNextCall();
                        this._cleanupPersonalizationQueuePromises(
                            oNextPersonalizationPromise,
                            this._oNextPersonalizationQuery.aPromiseResolvers
                        );
                        delete this._oNextPersonalizationQuery;
                    }
                });
        });
    };

    /**
     * Resolves or rejects the queried promises based on the result of the Adapters setPersonalization call
     *
     * @param {Promise} nextPersonalizationPromise The promise of the Adapter
     * @param {object[]} queuedPromises The pending promises that are waiting to be resolved or rejected
     */
    CommonDataModel.prototype._cleanupPersonalizationQueuePromises = function (nextPersonalizationPromise, queuedPromises) {
        queuedPromises.forEach((oPromise) => {
            nextPersonalizationPromise
                .then(oPromise.resolve)
                .catch(oPromise.reject);
        });
    };

    /**
     * Registers extension catalogs. The functionality was removed. The function is void.
     *
     * @deprecated
     * @private
     */
    CommonDataModel.prototype.registerContentProvider = function () {
        Log.error("CommonDataModel.registerContentProvider is obsolete and should not be used.");
    };

    /**
     * Applies the Null Object Pattern to make sure that all group payload properties are initialized with empty
     * arrays or objects.
     *
     * Example:
     * Some adapter functions might assume empty arrays which produces errors if the property is undefined instead.
     * To avoid these problems we just add empty properties where they are needed.
     *
     * @param {object} oPersonalizedSite
     *      Site with personalization. The groups get potentially modified.
     *
     * @private
     */
    CommonDataModel.prototype._ensureCompleteSite = function (oPersonalizedSite) {
        if (!oPersonalizedSite.groups) {
            return;
        }

        const oGroups = oPersonalizedSite.groups;

        Object.keys(oGroups).forEach((sKey) => {
            if (!oGroups[sKey]) {
                // Undefined group detected. Cleaning it up...
                delete oGroups[sKey];
            } else {
                if (!oGroups[sKey].payload) {
                    // We need a payload first
                    oGroups[sKey].payload = {};
                }

                // Links
                if (!oGroups[sKey].payload.links) {
                    oGroups[sKey].payload.links = [];
                }
                // Tiles
                if (!oGroups[sKey].payload.tiles) {
                    oGroups[sKey].payload.tiles = [];
                }
                // Groups
                if (!oGroups[sKey].payload.groups) {
                    oGroups[sKey].payload.groups = [];
                }
            }
        });
    };

    /**
     * Filters out groups from the groups order that are not available in the site.
     * This prevents that operations that rely on a consistent groups order work incorrectly,
     * like rearranging the groups on the homepage.
     *
     * @param {object} site
     *      Site with personalization. The groups order gets potentially modified.
     *
     * @private
     */
    CommonDataModel.prototype._ensureGroupsOrder = function (site) {
        const aGroupsOrder = ObjectPath.get("site.payload.groupsOrder", site);
        const oGroups = site.groups;
        let i = 0;

        if (!aGroupsOrder) {
            return;
        }

        // we could use Array.filter here but as there is nothing to do in the most cases we avoid copying the array
        while (i < aGroupsOrder.length) {
            const sGroupId = aGroupsOrder[i];
            if (!oGroups[sGroupId]) {
                aGroupsOrder.splice(i, 1);
            } else {
                i++;
            }
        }
    };

    /**
     * Gets all plugins of every category in the site.
     *
     * @param {object} [oPluginSetsCache] Cache to use for fetching plugin set.
     * This is useful for testing, if the value is undefined then an internal cache will be used.
     * To invalidate the internal cache, pass null as the value.
     *
     * @returns {jQuery.Promise}
     *  A promise which may resolve to the list of plugins on the site.
     *  In the case where the promise gets resolved, it resolves to an immutable
     *  reference.
     *
     * @since 1.48.0
     */
    CommonDataModel.prototype.getPlugins = (function () {
        function fnExtractPluginConfigFromInboundSignature (sPluginName, oSignatureInbounds) {
            const iNumInbounds = Object.keys(oSignatureInbounds).length;

            if (iNumInbounds === 0) {
                return {};
            }

            if (iNumInbounds > 1) {
                Log.warning(
                    `Multiple inbounds are defined for plugin '${sPluginName}'`,
                    "Plugin startup configuration will be determined using "
                    + "the first signature inbound with semanticObject:Shell and action:plugin for plugin.",
                    S_COMPONENT_NAME
                );
            }

            const oShellPluginSignatureInbounds = Object.values(oSignatureInbounds).find(
                (oInbound) => {
                    return (oInbound && oInbound.semanticObject === "Shell"
                        && oInbound.action === "plugin");
                }
            );

            if (oShellPluginSignatureInbounds === undefined) {
                Log.error(
                    `Cannot find inbound with semanticObject:Shell and action:plugin for plugin '${sPluginName}'`,
                    "plugin startup configuration cannot be determined correctly",
                    S_COMPONENT_NAME
                );
                return {};
            }

            const oSignatureParams = ObjectPath.get("signature.parameters", oShellPluginSignatureInbounds) || {};

            return Object.keys(oSignatureParams).reduce(
                (oResult, sNextParam) => {
                    const sDefaultValue = ObjectPath.get(`${sNextParam}.defaultValue.value`, oSignatureParams);

                    if (typeof sDefaultValue === "string") {
                        oResult[sNextParam] = sDefaultValue;
                    }

                    return oResult;
                },
                {} /* oResult */
            );
        }

        let oPluginSets;
        return function (oPluginSetsCache) {
            if (oPluginSetsCache !== undefined) {
                oPluginSets = oPluginSetsCache;
            }

            if (oPluginSets) {
                return jQuery.when(oPluginSets);
            }

            oPluginSets = {};

            return this.getSiteWithoutPersonalization()
                .then((oSite) => {
                    const oApplications = oSite.applications || {};

                    Object.keys(oApplications).filter(function (sAppName) {
                        return ObjectPath.get("type", this[sAppName]["sap.flp"]) === "plugin";
                    }, oApplications).forEach(function (sPluginName) {
                        const oPlugin = this[sPluginName];
                        let oComponentProperties = {};

                        if (!isPlainObject(oPlugin["sap.platform.runtime"])) {
                            Log.error(`Cannot find 'sap.platform.runtime' section for plugin '${sPluginName}'`,
                                "plugin might not be started correctly",
                                "sap.ushell.services.CommonDataModel");
                        } else if (!isPlainObject(oPlugin["sap.platform.runtime"].componentProperties)) {
                            Log.error(`Cannot find 'sap.platform.runtime/componentProperties' section for plugin '${sPluginName}'`,
                                "plugin might not be started correctly",
                                "sap.ushell.services.CommonDataModel");
                        } else {
                            oComponentProperties = oPlugin["sap.platform.runtime"].componentProperties;
                        }

                        oPluginSets[sPluginName] = {
                            url: oComponentProperties.url,
                            component: oPlugin["sap.ui5"].componentName
                        };

                        //
                        // define plugin configuration
                        //
                        const oSignatureInbounds = ObjectPath.get(
                            "crossNavigation.inbounds", oPlugin["sap.app"]
                        ) || {};

                        const oConfigFromInboundSignature = fnExtractPluginConfigFromInboundSignature(
                            sPluginName,
                            oSignatureInbounds
                        );

                        const oPluginConfig = extend(
                            oComponentProperties.config || {},
                            oConfigFromInboundSignature // has precedence
                        );

                        if (oPluginConfig) {
                            oPluginSets[sPluginName].config = oPluginConfig;
                        }

                        if (oComponentProperties.asyncHints) {
                            oPluginSets[sPluginName].asyncHints = oComponentProperties.asyncHints;
                        }

                        const oDeviceTypes = ObjectPath.get("deviceTypes", oPlugin["sap.ui"]);
                        if (oDeviceTypes) {
                            oPluginSets[sPluginName].deviceTypes = oDeviceTypes;
                        }
                    }, oApplications);

                    return ushellUtils.deepFreeze(oPluginSets);
                });
        };
    })();

    /**
     * Checks if each of the given display formats is a valid enum entry of {@link sap.ushell.DisplayFormat}.
     * Unsupported values are filtered out from the resulting list.
     *
     * @param {string[]} aDisplayFormats A list of display formats coming from a CDM site. May contain entries that are not part of {@link sap.ushell.DisplayFormat}.
     * @returns {sap.ushell.DisplayFormat[]} A list of supported display formats.
     * @private
     */
    CommonDataModel.prototype._mapDisplayFormats = function (aDisplayFormats) {
        const oDisplayFormatMap = {
            tile: DisplayFormat.Standard,
            standard: DisplayFormat.Standard,
            link: DisplayFormat.Compact,
            compact: DisplayFormat.Compact,
            flat: DisplayFormat.Flat,
            flatWide: DisplayFormat.FlatWide,
            tileWide: DisplayFormat.StandardWide,
            standardWide: DisplayFormat.StandardWide
        };

        const aSupportedFormats = Object.keys(oDisplayFormatMap).filter((sDisplayFormat) => {
            return aDisplayFormats.indexOf(sDisplayFormat) > -1;
        });

        return aSupportedFormats.map((sSupportedFormat) => {
            return oDisplayFormatMap[sSupportedFormat];
        });
    };

    /**
     * Ensures that the display formats of viz types, pages and groups are valid.
     *
     * @param {object} oSite
     *  The site. The the viz types, pages and groups get potentially modified.
     *
     * @private
     */
    CommonDataModel.prototype._ensureProperDisplayFormats = function (oSite) {
        if (oSite.vizTypes) {
            Object.keys(oSite.vizTypes).forEach((sKey) => {
                if (oSite.vizTypes[sKey]["sap.flp"] && oSite.vizTypes[sKey]["sap.flp"].vizOptions) {
                    const oVizType = oSite.vizTypes[sKey];
                    const aSupportedDisplayFormats = ObjectPath.get("vizOptions.displayFormats.supported", oVizType["sap.flp"]);
                    const sDefaultDisplayFormat = ObjectPath.get("vizOptions.displayFormats.default", oVizType["sap.flp"]);

                    if (aSupportedDisplayFormats) {
                        oSite.vizTypes[sKey]["sap.flp"].vizOptions.displayFormats.supported = this._mapDisplayFormats(aSupportedDisplayFormats);
                    }
                    if (sDefaultDisplayFormat) {
                        oSite.vizTypes[sKey]["sap.flp"].vizOptions.displayFormats.default = this._mapDisplayFormats([sDefaultDisplayFormat])[0];
                    }
                }
            });
        }

        if (oSite.hasOwnProperty("pages")) {
            Object.keys(oSite.pages).forEach((sKey) => {
                const oPage = oSite.pages[sKey];
                if (oPage.payload && oPage.payload.sections) {
                    const oSections = oPage.payload.sections;
                    Object.keys(oSections).forEach((sSectionKey) => {
                        const oSection = oSections[sSectionKey];
                        Object.keys(oSection.viz).forEach((sVizKey) => {
                            const oViz = oSection.viz[sVizKey];
                            if (oViz.displayFormatHint) {
                                const aMappedFormat = this._mapDisplayFormats([oViz.displayFormatHint])[0];
                                oViz.displayFormatHint = aMappedFormat || oViz.displayFormatHint;
                            }
                        });
                    });
                }
            });
        } else if (oSite.hasOwnProperty("groups")) {
            Object.keys(oSite.groups).forEach((sGroupKey) => {
                const oGroup = oSite.groups[sGroupKey];
                oGroup.payload.tiles.forEach((oTile) => {
                    if (oTile.displayFormatHint) {
                        const aMappedFormat = this._mapDisplayFormats([oTile.displayFormatHint])[0];
                        oTile.displayFormatHint = aMappedFormat || oTile.displayFormatHint;
                    }
                });
            });
        }
    };

    /**
     * Adds the standard visualization types if they are not already present in the site.
     *
     * @param {object} oSite
     *  The site. The the viz types get potentially modified.
     *
     * @private
     */
    CommonDataModel.prototype._ensureStandardVizTypesPresent = async function (oSite) {
        if (!(oSite._version && oSite._version.startsWith("3."))) {
            return;
        }

        if (!oSite.vizTypes) {
            oSite.vizTypes = {};
        }

        const oStandardVizTypes = await VizTypeDefaults.getAll();
        Object.keys(oStandardVizTypes).forEach((sKey) => {
            oSite.vizTypes[sKey] = oSite.vizTypes[sKey] || oStandardVizTypes[sKey];
        });
    };

    /**
     * Returns the menu entries for a menu
     * @param {string} sMenuKey key of a menu
     *
     * @returns {Promise<object[]>} A promise which resolves in an array of menu entries
     *
     * @private
     * @since 1.76.0
     */
    CommonDataModel.prototype.getMenuEntries = async function (sMenuKey) {
        const oSite = await this.getSite();
        const aMenuEntries = ObjectPath.get(`menus.${sMenuKey}.payload.menuEntries`, oSite);
        // return a copy of the menu so that the original site cannot get changed
        return deepClone(aMenuEntries) || [];
    };

    /**
     * Returns the id of all content providers.
     *
     * @returns {Promise<string[]>} A Promise resolving to an array containing the content provider ids
     *
     * @private
     * @since 1.80.0
     */
    CommonDataModel.prototype.getContentProviderIds = async function () {
        const oSite = await this.getSite();
        const aSystemAliases = Object.keys(oSite.systemAliases);
        const oContentProviderIds = {};

        objectValues(oSite.applications).forEach((oApplication) => {
            const sContentProviderId = readApplications.getContentProviderId(oApplication);

            if (aSystemAliases.includes(sContentProviderId)) {
                oContentProviderIds[sContentProviderId] = true;
            }
        });

        return Object.keys(oContentProviderIds);
    };

    CommonDataModel.hasNoAdapter = false;
    return CommonDataModel;
}, true /* bExport */);
