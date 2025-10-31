// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview This module exposes a model containing the pages hierarchy to its clients.
 * @version 1.141.1
 */
sap.ui.define([
    "sap/base/Log",
    "sap/ushell/utils/RestrictedJSONModel",
    "sap/base/util/deepClone",
    "sap/base/util/extend",
    "sap/base/util/deepExtend",
    "sap/ushell/resources",
    "sap/ushell/utils",
    "sap/ushell/Config",
    "sap/ushell/Container",
    "sap/ushell/adapters/cdm/v3/utilsCdm",
    "sap/ushell/adapters/cdm/v3/_LaunchPage/readUtils",
    "sap/ushell/adapters/cdm/v3/_LaunchPage/readVisualizations",
    "sap/base/util/ObjectPath"
], (
    Log,
    RestrictedJSONModel,
    deepClone,
    extend,
    deepExtend,
    resources,
    ushellUtils,
    Config,
    Container,
    utilsCdm,
    readUtils,
    readVisualizations,
    ObjectPath
) => {
    "use strict";

    /**
     * @alias sap.ushell.services.Pages
     * @class
     * @classdesc The Unified Shell's Pages service.
     *
     * <b>Note:</b> To retrieve a valid instance of this service, it is necessary to call {@link sap.ushell.Container#getServiceAsync}.
     * <pre>
     *   sap.ui.require(["sap/ushell/Container"], async function (Container) {
     *     const Pages = await Container.getServiceAsync("Pages");
     *     // do something with the Pages service
     *   });
     * </pre>
     *
     * @hideconstructor
     *
     * @since 1.72.0
     * @private
     */
    function Pages () {
        this.COMPONENT_NAME = "sap.ushell.services.Pages";
        this._oCdmServicePromise = Container.getServiceAsync("CommonDataModel");
        this._oCSTRServicePromise = Container.getServiceAsync("ClientSideTargetResolution");
        this._oPagesModel = new RestrictedJSONModel({
            pages: []
        });
        this._bImplicitSaveEnabled = true;
        this._aPagesToBeSaved = [];
    }

    /**
     * Type for a page in the "pages and spaces" concept.
     * @typedef {object} sap.ushell.services.Pages.PageData
     * @property {string} id The ID of the page.
     * @property {string} title The title of the page.
     * @property {string} description The description of the page.
     * @property {sap.ushell.services.Pages.Section[]} sections The ID of the page.
     *
     * @since 1.120.0
     * @private
     * @ui5-restricted ux.eng.s4producthomes1
     */

    /**
     * Type for the section of a page.
     * @typedef {object} sap.ushell.services.Pages.Section
     * @property {string} id The ID of the section.
     * @property {string} title The title of the section.
     * @property {boolean} default Whether this is the default section.
     * @property {boolean} locked Whether the section is locked.
     * @property {boolean} preset Whether the section is preset.
     * @property {boolean} visible Whether the section is visible.
     * @property {sap.ushell.services.Pages.Visualization[]} visualizations The visualizations in the section.
     *
     * @since 1.120.0
     * @private
     * @ui5-restricted ux.eng.s4producthomes1
     */

    /**
     * Type for a visualization. Note: not all possible properties are maintained here.
     * @typedef {object} sap.ushell.services.Pages.Visualization
     * @property {string} [title] The title
     * @property {object} [target] The target in object format
     * @property {string} [subtitle] The subtitle
     * @property {string} [icon] The icon
     * @property {string} [info] The information text
     * @property {boolean} [isBookmark] Whether the visualization is bookmarked.
     * @property {string} [numberUnit] The numberUnit
     * @property {string} [indicatorDataSource] The indicator data source
     * @property {string} [displayFormatHint] The format in which the visualization is displayed
     * @property {string} [serviceUrl] The service URL from the indicator data source, if it exists.
     * @property {string} [serviceRefreshInterval] The service refresh interval from the indicator data source, if it exists.
     * @property {string} [vizType] The visualization type.
     * @property {object} [vizConfig] The visualization configuration.
     * @since 1.120.0
     * @private
     * @ui5-restricted ux.eng.s4producthomes1
     */

    /**
     * Generates a new id which is unique within a page for sections as well as for visualizations.
     *
     * @param {string} sPageId The ID of the page.
     * @returns {string} A pseudo-unique ID.
     *
     * @since 1.75.0
     * @private
     */
    Pages.prototype._generateId = function (sPageId) {
        const aIds = [];
        const oPage = this.getModel().getProperty(this.getPagePath(sPageId));

        oPage.sections.forEach((oSection) => {
            aIds.push(oSection.id);
            oSection.visualizations.forEach((oVisualization) => {
                aIds.push(oVisualization.id);
            });
        });

        return ushellUtils.generateUniqueId(aIds);
    };

    /**
     * Returns the model
     *
     * @returns {object} Read only model
     * @since 1.72.0
     *
     * @private
     */
    Pages.prototype.getModel = function () {
        return this._oPagesModel;
    };

    /**
     * Sets the default for implicit save after a personalization
     * @param {boolean} bEnable Whether to implicitly save
     *
     * @since 1.85.0
     * @private
     */
    Pages.prototype.enableImplicitSave = function (bEnable) {
        this._bImplicitSaveEnabled = bEnable;
    };

    /**
     * Calculates the index of a specific page in the model.
     *
     * @param {string} sPageId The ID of a page.
     * @returns {int|undefined} The index of the page within the model or "undefined" if the page is not in the model.
     *
     * @since 1.75.0
     * @private
     */
    Pages.prototype.getPageIndex = function (sPageId) {
        const aPages = this._oPagesModel.getProperty("/pages");
        for (let iPageIndex = 0; iPageIndex < aPages.length; ++iPageIndex) {
            if (aPages[iPageIndex].id === sPageId) {
                return iPageIndex;
            }
        }
        return undefined;
    };

    /**
     * Calculates the path to a specific page in the model.
     *
     * @param {string} sPageId The ID of a page.
     * @returns {string} Path to the page in the model or an empty string ("") if the page is not in the model.
     * @since 1.72.0
     *
     * @private
     */
    Pages.prototype.getPagePath = function (sPageId) {
        const iPageIndex = this.getPageIndex(sPageId);
        if (typeof iPageIndex === "undefined") {
            return "";
        }
        return `/pages/${iPageIndex}`;
    };

    /**
     * Loads a page into the model
     *
     * @param {string} sPageId id of the page
     * @returns {Promise<string>} Resolves with the path to the page in the model after the page is loaded.
     * @since 1.72.0
     *
     * @private
     */
    Pages.prototype.loadPage = async function (sPageId) {
        const sPagePath = this.getPagePath(sPageId);

        if (sPagePath) {
            return sPagePath;
        }

        ushellUtils.setPerformanceMark(["FLP-Pages-Service-loadPage-start[", sPageId, "]"].join(""));

        let oCdmService;
        try {
            oCdmService = await this._oCdmServicePromise;
        } catch (oError) {
            Log.error("Pages - loadPage: Couldn't resolve CDM Service.", oError, this.COMPONENT_NAME);
            throw oError;
        }

        try {
            const oPage = await oCdmService.getPage(sPageId);
            const oVisualizations = await oCdmService.getCachedVisualizations();
            const oApplications = await oCdmService.getApplications();
            const oVizTypes = await oCdmService.getCachedVizTypes();

            const oModelForPage = await this._getModelForPage(oPage, oVisualizations, oApplications, oVizTypes);

            const iPageCount = this._oPagesModel.getProperty("/pages/").length;
            const sNewPagePath = `/pages/${iPageCount}`;
            this._oPagesModel._setProperty(sNewPagePath, oModelForPage);
            ushellUtils.setPerformanceMark(["FLP-Pages-Service-loadPage-end[", sPageId, "]"].join(""));

            return sNewPagePath;
        } catch (oError) {
            Log.error("Pages - loadPage: Failed to gather site data.", oError, this.COMPONENT_NAME);
            throw oError;
        }
    };

    /**
     * Loads multiple pages into the model.
     * This causes the pages navContainer to instantiate controls for all the loaded pages.
     *
     * @param {string[]} aPageIds ids of the pages
     * @returns {Promise<object>} Resolves with the paths to pages in the model after the pages are loaded.
     * @since 1.103.0
     *
     * @private
     */
    Pages.prototype.loadPages = async function (aPageIds) {
        let oCdmService;
        try {
            oCdmService = await this._oCdmServicePromise;
        } catch (oError) {
            Log.error("Pages - loadPages: Couldn't resolve CDM Service.", oError, this.COMPONENT_NAME);
            throw oError;
        }

        // load and cache all the pages with a single request
        await oCdmService.getPages(aPageIds);

        const aPagePaths = await Promise.all(aPageIds.map((sPageId) => {
            // single access is ok here as the data has been loaded before
            return this.loadPage(sPageId);
        }));

        const oPagePaths = {};
        aPageIds.forEach((sPageId, i) => {
            oPagePaths[sPageId] = aPagePaths[i];
        });
        return oPagePaths;
    };

    /**
     * @typedef {object} VisualizationLocation The location of a visualization within a page section.
     * @property {int} pageId The ID of the page where the section is.
     * @property {int} sectionIndex The section index within that page.
     * @property {int[]} vizIndexes The visualization indexes within that section.
     */

    /**
     * Find every index of a visualization within the sections of a page.
     *
     * @param {string} sPageId The "pageId" of the page to be searched on.
     * @param {string} [sSectionId] The "sectionId" of the page to be searched on. The optional parameter.
     *                              If sectionId is set, search is executed within the given section. Otherwise, within all sections.
     * @param {string} [sVizId] The "vizId" of the visualization to look for.
     * @param {string} [sVizRefId] The "vizRefId" of the visualization to look for.
     *
     * @returns {Promise<VisualizationLocation[]>} An array of {@link VisualizationLocation}, retrieving every index of a visualization within a page.
     */
    Pages.prototype.findVisualization = async function (sPageId, sSectionId, sVizId, sVizRefId) {
        let oCdmService;
        try {
            oCdmService = await this._oCdmServicePromise;
        } catch (oError) {
            Log.error("Pages - findVisualization: Personalization cannot be saved: CDM Service cannot be retrieved.", oError, this.COMPONENT_NAME);
            throw oError;
        }

        try {
            const sPagePath = await this.loadPage(sPageId);
            await oCdmService.getCachedVisualizations();
            await oCdmService.getApplications();

            const aPageSections = this.getModel().getProperty(`${sPagePath}/sections`) || [];
            return aPageSections.reduce((accumulatorSections, section, sectionIndex) => {
                if (sSectionId && section.id !== sSectionId) {
                    return accumulatorSections;
                }
                const aVizIndexes = section.visualizations.reduce((accumulatorVisualizations, viz, vizIndex) => {
                    if (sVizId && viz.vizId === sVizId ||
                        sVizRefId && viz.id === sVizRefId) {
                        accumulatorVisualizations.push(vizIndex);
                    }
                    return accumulatorVisualizations;
                }, []);
                if (aVizIndexes.length) {
                    accumulatorSections.push({
                        pageId: sPageId,
                        sectionIndex: sectionIndex,
                        vizIndexes: aVizIndexes
                    });
                }
                return accumulatorSections;
            }, []);
        } catch (oError) {
            Log.error("Pages - findVisualization: Couldn't load page, get visualizations or applications.", oError, this.COMPONENT_NAME);
            throw oError;
        }
    };

    /**
     * Moves a visualization inside the model and updates the CDM site of the CDM service accordingly.
     *
     * @param {int} iPageIndex The index of the page containing the moved visualization.
     * @param {int} iSourceSectionIndex The index of the section from where the visualization is moved.
     * @param {int} iSourceVisualizationIndex The index of the moved visualization.
     * @param {int} iTargetSectionIndex The index of the section to which the visualization should be moved.
     * @param {int} iTargetVisualizationIndex The new index of the moved visualization. If -1 is passed, the visualization is moved to the last position.
     *
     * @returns {Promise<{visualizationIndex: int}>} Promise which resolves with an object containing the visualizationIndex after the personalization was saved.
     * @since 1.75.0
     *
     * @private
     */
    Pages.prototype.moveVisualization = async function (iPageIndex, iSourceSectionIndex, iSourceVisualizationIndex, iTargetSectionIndex, iTargetVisualizationIndex) {
        // Do nothing if visualization is moved on itself.
        if (iSourceSectionIndex === iTargetSectionIndex && iSourceVisualizationIndex === iTargetVisualizationIndex) {
            return Promise.resolve({
                visualizationIndex: iTargetVisualizationIndex
            });
        }

        this.setPersonalizationActive(true);
        const oPage = this._oPagesModel.getProperty(`/pages/${iPageIndex}`);
        const sPageId = oPage.id;
        const aSections = oPage.sections;
        const oSourceSection = aSections[iSourceSectionIndex];
        const oTargetSection = aSections[iTargetSectionIndex];
        const sSourceSectionId = oSourceSection.id;
        const sTargetSectionId = oTargetSection.id;
        const oMovedVisualization = oSourceSection.visualizations[iSourceVisualizationIndex];
        const sMovedVisualizationId = oMovedVisualization.id;

        // Update visualizations reference to enable recalculation of visualizations.length which enables hide of section
        oSourceSection.visualizations = oSourceSection.visualizations.concat([]);
        oTargetSection.visualizations = oTargetSection.visualizations.concat([]);

        // Remove the visualization from the source section
        oSourceSection.visualizations.splice(iSourceVisualizationIndex, 1);

        // Insert the visualization into the target section
        if (iTargetVisualizationIndex === -1) {
            iTargetVisualizationIndex = oTargetSection.visualizations.length;
        }
        oTargetSection.visualizations.splice(iTargetVisualizationIndex, 0, oMovedVisualization);

        let iPreviousVisualizationIndex;
        if (oTargetSection.visualizations[iTargetVisualizationIndex]) {
            iPreviousVisualizationIndex = iTargetVisualizationIndex - 1;
        } else {
            iPreviousVisualizationIndex = oTargetSection.visualizations.length - 2;
        }
        let sPreviousVisualizationId;
        if (oTargetSection.visualizations[iPreviousVisualizationIndex]) {
            sPreviousVisualizationId = oTargetSection.visualizations[iPreviousVisualizationIndex].id;
        }

        // If the default section becomes empty, delete it
        if (oSourceSection.default && !oSourceSection.visualizations.length) {
            aSections.splice(iSourceSectionIndex, 1);
        }

        this._oPagesModel.refresh();

        // Modify the personalized page in the CDM 3.1 site
        let oCdmPage;
        try {
            const oCdmService = await this._oCdmServicePromise;
            oCdmPage = await oCdmService.getPage(sPageId);
        } catch (oError) {
            this.setPersonalizationActive(false);
            Log.error("Pages - moveVisualization: Personalization cannot be saved: CDM Service or Page cannot be retrieved.", oError, this.COMPONENT_NAME);
            throw oError;
        }

        try {
            const oSourceSectionInPage = oCdmPage.payload.sections[sSourceSectionId];
            const aSourceVizOrder = oSourceSectionInPage.layout.vizOrder;
            const oSourceViz = oSourceSectionInPage.viz;

            const oTargetSectionInPage = oCdmPage.payload.sections[sTargetSectionId];
            const aTargetVizOrder = oTargetSectionInPage.layout.vizOrder;
            const oTargetViz = oTargetSectionInPage.viz;

            const oMovedVisualizationClone = deepClone(oSourceViz[sMovedVisualizationId]);

            const iSourceVizOrderIndex = aSourceVizOrder.indexOf(sMovedVisualizationId);
            aSourceVizOrder.splice(iSourceVizOrderIndex, 1);

            // It can happen that the vizOrder array contains visualization ids that are filtered out for the pages model.
            // Therefore, we need to determine the index in the vizOrder array: search for the index of the previous viz and increment by one.
            const iTargetVizOrderIndex = sPreviousVisualizationId ? aTargetVizOrder.indexOf(sPreviousVisualizationId) + 1 : 0;
            aTargetVizOrder.splice(iTargetVizOrderIndex, 0, sMovedVisualizationId);

            if (sSourceSectionId !== sTargetSectionId) {
                delete oSourceViz[sMovedVisualizationId];
                oTargetViz[sMovedVisualizationId] = oMovedVisualizationClone;
            }

            // If the default section becomes empty, delete it
            if (oSourceSectionInPage.default && !Object.keys(oSourceViz).length) {
                delete oCdmPage.payload.sections[sSourceSectionId]; // delete section from sections
                oCdmPage.payload.layout.sectionOrder.splice(iSourceSectionIndex, 1); // delete index from sectionOrder
            }

            await this._conditionalSavePersonalization(sPageId);

            return {
                visualizationIndex: iTargetVisualizationIndex
            };
        } catch (oError) {
            this.setPersonalizationActive(false);
            throw oError;
        }
    };

    /**
     * Deletes a visualization inside the model as well as inside the page of the CDM 3.1 site.
     *
     * @param {int} iPageIndex The index of the page containing the deleted visualization.
     * @param {int} iSourceSectionIndex The index of the section from where the visualization is deleted.
     * @param {int} iSourceVisualizationIndex The index of the deleted visualization.
     *
     * @returns {Promise} Promise which resolves after the personalization was saved.
     *
     * @since 1.75.0
     * @private
     */
    Pages.prototype.deleteVisualization = async function (iPageIndex, iSourceSectionIndex, iSourceVisualizationIndex) {
        const oPageModel = this._oPagesModel.getProperty(`/pages/${iPageIndex}`);
        const oSectionModel = oPageModel.sections[iSourceSectionIndex];

        // If the default section becomes empty, delete it
        if (oSectionModel.default && oSectionModel.visualizations.length < 2) {
            return this.deleteSection(iPageIndex, iSourceSectionIndex);
        }

        this.setPersonalizationActive(true);
        const aSourceSectionVisualizations = oSectionModel.visualizations;
        const oRemovedVisualization = aSourceSectionVisualizations[iSourceVisualizationIndex];
        aSourceSectionVisualizations.splice(iSourceVisualizationIndex, 1);
        this._oPagesModel.refresh();

        let oPage;
        try {
            const oCDMService = await this._oCdmServicePromise;
            oPage = await oCDMService.getPage(oPageModel.id);
        } catch (oError) {
            this.setPersonalizationActive(false);
            Log.error("Pages - deleteVisualization: Personalization cannot be saved: CDM Service or Page cannot be retrieved.", oError, this.COMPONENT_NAME);
            throw oError;
        }

        try {
            const aSectionVizOrder = oPage.payload.sections[oSectionModel.id].layout.vizOrder;
            const oVizRefs = oPage.payload.sections[oSectionModel.id].viz;
            const iRemovedVisualizationIndex = aSectionVizOrder.indexOf(oRemovedVisualization.id);
            delete oVizRefs[oRemovedVisualization.id];
            if (iRemovedVisualizationIndex > -1) {
                aSectionVizOrder.splice(iRemovedVisualizationIndex, 1);
            }
            return await this._conditionalSavePersonalization(oPage.identification.id);
        } catch (oError) {
            this.setPersonalizationActive(false);
            throw oError;
        }
    };

    /**
     * Returns the index of the section.
     *
     * @param {string} sPagePath The path of the page the section is on.
     * @param {string} sSectionId The id of the section that we want the index of.
     *
     * @returns {int} The index of the section with the given section id.
     *
     * @since 1.75.0
     *
     * @private
     */
    Pages.prototype._getSectionIndex = function (sPagePath, sSectionId) {
        const aSections = this.getModel().getProperty(`${sPagePath}/sections`) || [];

        for (let i = 0; i < aSections.length; i += 1) {
            if (aSections[i].id === sSectionId) {
                return i;
            }
        }
    };

    /**
     * Returns the visualization data for the given visualization id.
     *
     * @param {string} sPageId Id of the Page
     * @param {string} sVizId The visualization id of the visualization data that should be returned.
     * @param {object} oVisualizations A map of all visualization.
     * @param {object} [oAdditionalVizData] Additional visualization data that should overwrite the standard data.
     * @param {object} oApplications A map of all applications.
     * @param {object} oVizTypes The map of vizTypes
     * @param {object} oSystemContext The system context
     *
     * @returns {Promise<sap.ushell.services.Pages.Visualization>} Resolves with the visualization data for the given visualization id.
     *
     * @since 1.75.0
     *
     * @private
     */
    Pages.prototype._getVisualizationData = async function (sPageId, sVizId, oVisualizations, oAdditionalVizData, oApplications, oVizTypes, oSystemContext) {
        const oVisualizationReference = oAdditionalVizData || {
            vizId: sVizId
        };

        const oSite = {
            applications: oApplications,
            visualizations: oVisualizations,
            vizTypes: oVizTypes
        };
        const oVizData = await readUtils.getVizData(oSite, oVisualizationReference, oSystemContext);
        if (!oVizData.id) {
            oVizData.id = this._generateId(sPageId);
        }
        return oVizData;
    };

    /**
     * Adds a new visualization to the model and to the CDM 3.1 site.
     *
     * If no section ID is specified, the visualization is added to the 'Recently Added' section automatically.
     *
     * @param {string} sPageId The id of the page the visualization should be added to.
     * @param {string} [sSectionId] The id of the section the visualization should be added to.
     * @param {string} sVizId The id of the visualization to add.
     * @param {string} sDisplayFormatHint The form factor of the visualization to add.
     *
     * @returns {Promise} Promise which resolves after the personalization was saved.
     *
     * @since 1.75.0
     *
     * @protected
     */
    Pages.prototype.addVisualization = async function (sPageId, sSectionId, sVizId, sDisplayFormatHint) {
        let oCdmService;

        try {
            oCdmService = await this._oCdmServicePromise;
        } catch (oError) {
            Log.error("Pages - addVisualization: Personalization cannot be saved: CDM Service cannot be retrieved.", oError, this.COMPONENT_NAME);
            throw oError;
        }
        try {
            let aResult;
            try {
                aResult = await Promise.all([
                    this.loadPage(sPageId),
                    oCdmService.getVisualizations(),
                    oCdmService.getApplications(),
                    oCdmService.getVizTypes()
                ]);
            } catch (oError) {
                Log.error("Pages - addVisualization: Personalization cannot be saved: Failed to load page, get visualizations or get applications.", oError, this.COMPONENT_NAME);
                throw oError;
            }
            const [sPagePath, oVisualizations, oApplications, oVizTypes] = aResult;

            const iSectionIndex = this._getSectionIndex(sPagePath, sSectionId);
            const aSection = this.getModel().getProperty(`${sPagePath}/sections`) || [];
            const oVisualizationData = await this._getVisualizationData(sPageId, sVizId, oVisualizations, null, oApplications, oVizTypes);

            if (sDisplayFormatHint) { // save with the same displayFormatHint in case of copy (Add to My Home)
                oVisualizationData.displayFormatHint = sDisplayFormatHint;
            }

            // Find default section
            let iDefaultSectionIndex;
            for (let i = 0; i < aSection.length; i++) {
                if (aSection[i].default) {
                    iDefaultSectionIndex = i;
                }
            }

            // Add visualization to existing default section, update model & site, save personalization
            if (iSectionIndex !== undefined || iDefaultSectionIndex !== undefined) {
                this.setPersonalizationActive(true);
                const iSectionPathIndex = iSectionIndex !== undefined ? iSectionIndex : iDefaultSectionIndex || 0;
                const sVisualizationsPath = `${sPagePath}/sections/${iSectionPathIndex}/visualizations`;

                this.getModel().getProperty(sVisualizationsPath).push(oVisualizationData);
                this.getModel().refresh();

                let oPage;
                try {
                    oPage = await oCdmService.getPage(sPageId);
                } catch (oError) {
                    Log.error("Pages - addVisualization: Personalization cannot be saved: Failed to get page.", oError, this.COMPONENT_NAME);
                    throw oError;
                }

                const oSection = oPage.payload.sections[sSectionId || oPage.payload.layout.sectionOrder[0]];
                oSection.layout.vizOrder.push(oVisualizationData.id);
                oSection.viz[oVisualizationData.id] = {
                    id: oVisualizationData.id,
                    vizId: sVizId
                };
                if (sDisplayFormatHint) {
                    oSection.viz[oVisualizationData.id].displayFormatHint = sDisplayFormatHint;
                }

                return this._conditionalSavePersonalization(sPageId);
            }

            // Create a new default section together with the visualization if there is no default section yet
            const iPageIndex = parseInt(sPagePath.split("/")[2], 10);
            return await this.addSection(iPageIndex, 0, {
                title: resources.i18n.getText("DefaultSection.Title"),
                default: true,
                visualizations: [oVisualizationData]
            });
        } catch (oError) {
            this.setPersonalizationActive(false);
            throw oError;
        }
    };

    /**
     * Copies a visualization to another page.
     *
     * @param {string} sPageId The id of the page the visualization should be added to.
     * @param {string|null} [sSectionId] The id of the section the visualization should be added to. If null is given, the default section is used.
     * @param {sap.ushell.services.Pages.Visualization} oVizData An object containing the vizData from the model.
     * @returns {Promise} A promise resolving when the copy action was completed.
     *
     * @private
     * @since 1.94.0
     */
    Pages.prototype.copyVisualization = function (sPageId, sSectionId, oVizData) {
        const bIsBookmark = oVizData.isBookmark;

        if (!bIsBookmark) {
            return this.addVisualization(sPageId, sSectionId, oVizData.vizId, oVizData.displayFormatHint);
        }

        return this.addBookmarkToPage(sPageId, {
            title: oVizData.title,
            subtitle: oVizData.subtitle,
            url: oVizData.targetURL,
            icon: oVizData.icon,
            info: oVizData.info,
            serviceUrl: oVizData.indicatorDataSource ? oVizData.indicatorDataSource.path : "",
            serviceRefreshInterval: oVizData.indicatorDataSource ? oVizData.indicatorDataSource.refresh : "",
            numberUnit: oVizData.numberUnit,
            vizType: oVizData.vizType,
            vizConfig: oVizData.vizConfig
        }, sSectionId);
    };

    /**
     * Moves a section inside the model
     *
     * @param {int} iPageIndex The index of the page containing the moved section.
     * @param {int} iSourceSectionIndex The index of the moved section.
     * @param {int} iTargetSectionIndex The new index of the moved section.
     *
     * @returns {Promise} Promise which resolves after the personalization was saved.
     *
     * @since 1.75.0
     *
     * @private
     */
    Pages.prototype.moveSection = async function (iPageIndex, iSourceSectionIndex, iTargetSectionIndex) {
        if (iSourceSectionIndex === iTargetSectionIndex) {
            return Promise.resolve();
        }

        this.setPersonalizationActive(true);

        const sPageId = this._oPagesModel.getProperty(`/pages/${iPageIndex}/id`);
        const aSections = this._oPagesModel.getProperty(`/pages/${iPageIndex}/sections`);
        const oMovedSection = this._oPagesModel.getProperty(`/pages/${iPageIndex}/sections/${iSourceSectionIndex}`);
        const sMovedSectionId = oMovedSection.id;

        // Remove the section
        aSections.splice(iSourceSectionIndex, 1);

        // Updates indices because of removing sections
        if (iSourceSectionIndex < iTargetSectionIndex) {
            iTargetSectionIndex--;
        }

        // Insert the section
        aSections.splice(iTargetSectionIndex, 0, oMovedSection);

        this._oPagesModel.refresh();

        let oPage;
        try {
            const oCdmService = await this._oCdmServicePromise;
            oPage = await oCdmService.getPage(sPageId);
        } catch (oError) {
            this.setPersonalizationActive(false);
            Log.error("Pages - moveSection: Personalization cannot be saved: CDM Service or Page cannot be retrieved.", oError, this.COMPONENT_NAME);
            throw oError;
        }

        try {
            const aSectionOrder = oPage.payload.layout.sectionOrder;

            aSectionOrder.splice(aSectionOrder.indexOf(sMovedSectionId), 1);
            aSectionOrder.splice(iTargetSectionIndex, 0, sMovedSectionId);

            return await this._conditionalSavePersonalization(sPageId);
        } catch (oError) {
            this.setPersonalizationActive(false);
            throw oError;
        }
    };

    /**
     * Adds an empty section to the model
     *
     * @param {int} iPageIndex The index of the page to which the section is added
     * @param {int} iSectionIndex The index of the added section.
     * @param {object} [oSectionProperties] Properties of the added section.
     *
     * @returns {Promise} Promise which resolves after the personalization was saved.
     *
     * @since 1.75.0
     *
     * @private
     */
    Pages.prototype.addSection = async function (iPageIndex, iSectionIndex, oSectionProperties) {
        this.setPersonalizationActive(true);

        const oSectionReference = oSectionProperties || {};
        const aSections = this._oPagesModel.getProperty(`/pages/${iPageIndex}/sections`);
        const sPageId = this._oPagesModel.getProperty(`/pages/${iPageIndex}/id`);

        const oNewSection = {
            id: oSectionReference.id !== undefined ? oSectionReference.id : this._generateId(sPageId),
            title: oSectionReference.title !== undefined ? oSectionReference.title : "",
            visible: oSectionReference.visible !== undefined ? oSectionReference.visible : true,
            preset: oSectionReference.preset !== undefined ? oSectionReference.preset : false,
            locked: oSectionReference.locked !== undefined ? oSectionReference.locked : false,
            default: oSectionReference.default !== undefined ? oSectionReference.default : false,
            visualizations: oSectionReference.visualizations !== undefined ? oSectionReference.visualizations : []
        };

        aSections.splice(iSectionIndex, 0, oNewSection);

        this._oPagesModel.refresh();

        let oPage;
        try {
            const oCdmService = await this._oCdmServicePromise;
            oPage = await oCdmService.getPage(sPageId);
        } catch (oError) {
            this.setPersonalizationActive(false);
            Log.error("Pages - addSection: Personalization cannot be saved: CDM Service or Page cannot be retrieved.", oError, this.COMPONENT_NAME);
            throw oError;
        }

        try {
            const oSection = {
                id: oNewSection.id,
                title: oNewSection.title,
                visible: oNewSection.visible,
                preset: oNewSection.preset,
                locked: oNewSection.locked,
                default: oNewSection.default,
                layout: {
                    vizOrder: []
                },
                viz: {}
            };

            if (oNewSection.visualizations) {
                let oVizData;

                for (let i = 0; i < oNewSection.visualizations.length; i++) {
                    oVizData = oNewSection.visualizations[i];
                    oSection.layout.vizOrder.push(oVizData.id);
                    if (oVizData.isBookmark) {
                        oSection.viz[oVizData.id] = readUtils.getVizRef(oVizData);
                    } else {
                        oSection.viz[oVizData.id] = {
                            id: oVizData.id,
                            vizId: oVizData.vizId
                        };
                        if (oVizData.displayFormatHint) { // save with the same displayFormatHint in case of copy (Add to My Home)
                            oSection.viz[oVizData.id].displayFormatHint = oVizData.displayFormatHint;
                        }
                    }
                }
            }

            oPage.payload.layout.sectionOrder.splice(iSectionIndex, 0, oNewSection.id);
            oPage.payload.sections[oNewSection.id] = oSection;

            return await this._conditionalSavePersonalization(sPageId);
        } catch (oError) {
            this.setPersonalizationActive(false);
            throw oError;
        }
    };

    /**
     * Deletes a section out of the model.
     *
     * @param {int} iPageIndex The index of the page containing the deleted section.
     * @param {int} iSectionIndex The index of deleted section.
     *
     * @returns {Promise} Promise which resolves after the personalization was saved.
     *
     * @since 1.75.0
     *
     * @private
     */
    Pages.prototype.deleteSection = async function (iPageIndex, iSectionIndex) {
        this.setPersonalizationActive(true);

        const sPageId = this._oPagesModel.getProperty(`/pages/${iPageIndex}/id`);
        const aSections = this._oPagesModel.getProperty(`/pages/${iPageIndex}/sections`);
        const sSectionId = aSections[iSectionIndex].id;
        aSections.splice(iSectionIndex, 1);
        this._oPagesModel.refresh();

        let oPage;
        try {
            const oCdmService = await this._oCdmServicePromise;
            oPage = await oCdmService.getPage(sPageId);
        } catch (oError) {
            this.setPersonalizationActive(false);
            Log.error("Pages - deleteSection: Personalization cannot be saved: CDM Service or Page cannot be retrieved.", oError, this.COMPONENT_NAME);
            throw oError;
        }

        try {
            delete oPage.payload.sections[sSectionId];
            oPage.payload.layout.sectionOrder.splice(iSectionIndex, 1);
            return await this._conditionalSavePersonalization(sPageId);
        } catch (oError) {
            this.setPersonalizationActive(false);
            throw oError;
        }
    };

    /**
     * Sets the visibility of a section.
     *
     * @param {int} iPageIndex The index of the page containing the section.
     * @param {int} iSectionIndex The index of the section.
     * @param {boolean} bVisibility The new visibility value.
     *
     * @returns {Promise} Promise which resolves after the personalization was saved.
     *
     * @since 1.75.0
     *
     * @private
     */
    Pages.prototype.setSectionVisibility = async function (iPageIndex, iSectionIndex, bVisibility) {
        this.setPersonalizationActive(true);

        const sPageId = this._oPagesModel.getProperty(`/pages/${iPageIndex}/id`);
        const sSectionId = this._oPagesModel.getProperty(`/pages/${iPageIndex}/sections/${iSectionIndex}/id`);
        const oSection = this._oPagesModel.getProperty(`/pages/${iPageIndex}/sections/${iSectionIndex}`);

        if (oSection.visible === bVisibility) {
            return Promise.resolve();
        }

        oSection.visible = bVisibility;
        this._oPagesModel.refresh();

        let oPage;
        try {
            const oCdmService = await this._oCdmServicePromise;
            oPage = await oCdmService.getPage(sPageId);
        } catch (oError) {
            this.setPersonalizationActive(false);
            Log.error("Pages - setSectionVisibility: Personalization cannot be saved: CDM Service or Page cannot be retrieved.", oError, this.COMPONENT_NAME);
            throw oError;
        }

        try {
            oPage.payload.sections[sSectionId].visible = bVisibility;
            return await this._conditionalSavePersonalization(sPageId);
        } catch (oError) {
            this.setPersonalizationActive(false);
            throw oError;
        }
    };

    /**
     * Sets the title of a section.
     *
     * @param {int} iPageIndex The index of the page containing the section.
     * @param {int} iSectionIndex The index of the section.
     * @param {string} sNewTitle The new title value.
     *
     * @returns {Promise} Promise which resolves after the personalization was saved.
     *
     * @since 1.75.0
     * @private
     */
    Pages.prototype.renameSection = async function (iPageIndex, iSectionIndex, sNewTitle) {
        this.setPersonalizationActive(true);

        const oPageModel = this._oPagesModel.getProperty(`/pages/${iPageIndex}`);
        const oSectionModel = oPageModel.sections[iSectionIndex];
        oSectionModel.title = sNewTitle;
        this._oPagesModel.refresh();

        let oPage;
        try {
            const oCDMService = await this._oCdmServicePromise;
            oPage = await oCDMService.getPage(oPageModel.id);
        } catch (oError) {
            this.setPersonalizationActive(false);
            Log.error("Pages - renameSection: Personalization cannot be saved: CDM Service or Page cannot be retrieved.", oError, this.COMPONENT_NAME);
            throw oError;
        }

        try {
            oPage.payload.sections[oSectionModel.id].title = sNewTitle;
            return await this._conditionalSavePersonalization(oPage.identification.id);
        } catch (oError) {
            this.setPersonalizationActive(false);
            throw oError;
        }
    };

    /**
     * Resets a section in the pages model as well as inside the page of the CDM 3.1 site.
     *
     * @param {int} iPageIndex The index of the page containing the section.
     * @param {int} iSectionIndex The index of the section.
     *
     * @returns {Promise} Promise which resolves after the personalization was saved.
     *
     * @since 1.75.0
     *
     * @private
     */
    Pages.prototype.resetSection = async function (iPageIndex, iSectionIndex) {
        this.setPersonalizationActive(true);

        const sPageId = this._oPagesModel.getProperty(`/pages/${iPageIndex}/id`);
        const sSectionId = this._oPagesModel.getProperty(`/pages/${iPageIndex}/sections/${iSectionIndex}/id`);

        let oVisualizations;
        let oApplications;
        let oCdmPage;
        let oOriginalCdmPage;
        let oVizTypes;
        try {
            const oCdmService = await this._oCdmServicePromise;
            oVisualizations = await oCdmService.getCachedVisualizations();
            oApplications = await oCdmService.getApplications();
            oCdmPage = await oCdmService.getPage(sPageId);
            oOriginalCdmPage = await oCdmService.getOriginalPage(sPageId);
            oVizTypes = await oCdmService.getCachedVizTypes();
        } catch (oError) {
            this.setPersonalizationActive(false);
            Log.error("Pages - resetSection: Personalization cannot be saved: Failed to gather data from CDM Service.", oError, this.COMPONENT_NAME);
            throw oError;
        }

        try {
            const oOriginalPageModel = await this._getModelForPage(oOriginalCdmPage, oVisualizations, oApplications, oVizTypes);
            const oOriginalSectionModel = deepClone(oOriginalPageModel.sections.find((section) => {
                return section.id === sSectionId;
            }), 20);

            const aOriginalVizIds = oOriginalSectionModel.visualizations.map((oVisualization) => {
                return oVisualization.id;
            });

            // the following loop ensures unique ids for viz references within a page according to adr-1011
            const oCurrentPageModel = this._oPagesModel.getProperty(`/pages/${iPageIndex}`);
            oCurrentPageModel.sections.forEach((oCurrentSectionModel) => {
                // Check in other sections if there is any visualization having a same id as in the reset section, if yes, generate a new id for this visualization.
                if (oOriginalSectionModel.id !== oCurrentSectionModel.id) {
                    oCurrentSectionModel.visualizations.forEach((oVisualization) => {
                        if (aOriginalVizIds.indexOf(oVisualization.id) !== -1) {
                            const sNewId = this._generateId(sPageId);

                            const oVizRef = deepClone(oCdmPage.payload.sections[oCurrentSectionModel.id].viz[oVisualization.id]);
                            delete oCdmPage.payload.sections[oCurrentSectionModel.id].viz[oVisualization.id];
                            const iVizOrderIndex = oCdmPage.payload.sections[oCurrentSectionModel.id].layout.vizOrder.indexOf(oVizRef.id);

                            oVizRef.id = sNewId;
                            oCdmPage.payload.sections[oCurrentSectionModel.id].viz[sNewId] = oVizRef;
                            oCdmPage.payload.sections[oCurrentSectionModel.id].layout.vizOrder[iVizOrderIndex] = sNewId;

                            oVisualization.id = sNewId;
                        }
                    });
                }
            });

            this._oPagesModel._setProperty(`/pages/${iPageIndex}/sections/${iSectionIndex}`, oOriginalSectionModel);

            // Reset the CDM3.1 Site
            oCdmPage.payload.sections[oOriginalSectionModel.id] = oOriginalCdmPage.payload.sections[oOriginalSectionModel.id];
            return await this._conditionalSavePersonalization(oCdmPage.identification.id);
        } catch (oError) {
            this.setPersonalizationActive(false);
            throw oError;
        }
    };

    /**
     * Resets a page in the model as well as inside the CDM 3.1 site.
     *
     * @param {int} iPageIndex The index of the page.
     *
     * @returns {Promise} Promise which resolves after the personalization was saved.
     *
     * @since 1.75.0
     *
     * @private
     */
    Pages.prototype.resetPage = async function (iPageIndex) {
        this.setPersonalizationActive(true);

        const sPageId = this._oPagesModel.getProperty(`/pages/${iPageIndex}/id`);

        let oVisualizations;
        let oApplications;
        let oCdmPage;
        let oOriginalCdmPage;
        let oVizTypes;
        try {
            const oCdmService = await this._oCdmServicePromise;
            oVisualizations = await oCdmService.getCachedVisualizations();
            oApplications = await oCdmService.getApplications();
            oCdmPage = await oCdmService.getPage(sPageId);
            oOriginalCdmPage = await oCdmService.getOriginalPage(sPageId);
            oVizTypes = await oCdmService.getCachedVizTypes();
        } catch (oError) {
            this.setPersonalizationActive(false);
            Log.error("Pages - resetPage: Personalization cannot be saved: Failed to gather data from CDM Service.", oError, this.COMPONENT_NAME);
            throw oError;
        }

        try {
            const oOriginalPageModel = await this._getModelForPage(oOriginalCdmPage, oVisualizations, oApplications, oVizTypes);
            this._oPagesModel._setProperty(`/pages/${iPageIndex}`, oOriginalPageModel);

            // Reset the CDM3.1 Site
            oCdmPage.payload = deepClone(oOriginalCdmPage.payload);
            return await this._conditionalSavePersonalization(oCdmPage.identification.id);
        } catch (oError) {
            this.setPersonalizationActive(false);
            throw oError;
        }
    };

    /**
     * Handles the personalization state.
     * If set to true, initializes the model data used for personalization if it was not done already
     * If set to false, deletes the pending personalization changes by copying the original model
     *
     * @since 1.76.0
     *
     * @param {boolean} bState The new personalization state
     *
     * @private
     */
    Pages.prototype.setPersonalizationActive = function (bState) {
        if (!this._bDirtyState && bState === true) {
            this._bDirtyState = true;
            this._oCopiedModelData = deepClone(this._oPagesModel.getProperty("/"), 20);
        } else if (this._bDirtyState && bState === false) {
            this._oPagesModel._setData(this._oCopiedModelData);
            this._bDirtyState = false;
        }
    };

    /**
     * Saves the personalization and resets the dirty state.
     * In case no page id was provided and if {@link #enableImplicitSave} was set to false, all unsaved modified pages are saved.
     * @param {string} [sPageId] the id of the page which should be saved
     *
     * @returns {Promise} Promise which resolves after the personalization was saved.
     * @see #enableImplicitSave()
     *
     * @since 1.74.0
     * @private
     */
    Pages.prototype.savePersonalization = async function (sPageId) {
        let aPages;
        if (!sPageId) {
            aPages = deepClone(this._aPagesToBeSaved);
        } else {
            aPages = [sPageId];
        }

        try {
            const oCdmService = await this._oCdmServicePromise;
            await Promise.all(aPages.map((sPage) => {
                // Remove page from list because the current state will be saved
                const iIndex = this._aPagesToBeSaved.indexOf(sPage);
                this._aPagesToBeSaved.splice(iIndex, 1);

                return new Promise((resolve, reject) => {
                    oCdmService.save(sPage).then(resolve).catch(reject);
                }).catch((oError) => {
                    // Add page back to list because it wasn't saved
                    if (this._aPagesToBeSaved.indexOf(sPage) === -1) {
                        this._aPagesToBeSaved.push(sPage);
                    }
                    throw oError;
                });
            }));

            this._bDirtyState = false;
        } catch (oError) {
            Log.error("Pages - savePersonalization: Personalization cannot be saved: CDM Service cannot be retrieved or the save process encountered an error.", oError, this.COMPONENT_NAME);
            throw oError;
        }
    };

    /**
     * Saves the personalization depending on the default of the implicit save
     * @param {string} sPageId the id of the page which should be saved
     *
     * @returns {Promise} Promise which resolves after the personalization was saved.
     *
     * @since 1.85.0
     * @private
     */
    Pages.prototype._conditionalSavePersonalization = function (sPageId) {
        if (this._bImplicitSaveEnabled) {
            return this.savePersonalization(sPageId);
        }

        // remember page ID for later save
        if (this._aPagesToBeSaved.indexOf(sPageId) === -1) {
            this._aPagesToBeSaved.push(sPageId);
        }

        // save disabled, so don't do anything!
        return Promise.resolve();
    };

    /**
     * Returns an object which conforms to the JSON Model structure which is used by the
     * consumers of the Pages service to bind UI5 controls.
     *
     * @param {object} page A CDM 3.1 page
     * @param {object} visualizations All the visualizations of the CDM site
     * @param {object} applications All the applications of the CDM site
     * @param {object} vizTypes All the vizTypes of the CDM site
     * @param {string} [sContentProviderId] The contentProviderId or undefined outside the cFLP
     *
     * @returns {Promise<sap.ushell.services.Pages.PageData>} A promise that resolves to an object which represents the page inside the Pages Service JSON Model
     *
     * @since 1.75.0
     * @private
     */
    Pages.prototype._getModelForPage = async function (page, visualizations, applications, vizTypes) {
        const oPage = {
            id: (page && page.identification && page.identification.id) || "",
            title: (page && page.identification && page.identification.title) || "",
            description: "",
            sections: []
        };
        ushellUtils.setPerformanceMark(["FLP-Pages-Service-getModelForPage-start[", oPage.id, "]"].join(""));

        const oCSTRService = await this._oCSTRServicePromise;
        const bEnableHiddenGroup = Config.last("/core/catalog/enableHideGroups");

        for (const sSectionId of page.payload.layout.sectionOrder) {
            const oCDMPageSection = page.payload.sections[sSectionId];
            const oSection = {
                id: oCDMPageSection.id || "",
                title: oCDMPageSection.default ? resources.i18n.getText("DefaultSection.Title") : oCDMPageSection.title || "",
                visualizations: [],
                visible: !bEnableHiddenGroup || (oCDMPageSection.visible !== undefined ? oCDMPageSection.visible : true),
                locked: oCDMPageSection.locked !== undefined ? oCDMPageSection.locked : false,
                preset: oCDMPageSection.preset !== undefined ? oCDMPageSection.preset : true,
                default: oCDMPageSection.default !== undefined ? oCDMPageSection.default : false
            };
            oPage.sections.push(oSection);

            for (const sVizRefId of oCDMPageSection.layout.vizOrder) {
                const oVisualizationReference = oCDMPageSection.viz[sVizRefId];
                const sVizId = oVisualizationReference.vizId;
                const oSystemContext = await oCSTRService.getSystemContext(oVisualizationReference.contentProviderId);
                const oVizData = await this._getVisualizationData(page.identification.id, sVizId, visualizations, oVisualizationReference, applications, vizTypes, oSystemContext);

                const bIntentIsSupported = await this._isIntentSupported(oVizData, oCSTRService);
                if (!bIntentIsSupported) {
                    Log.warning(`The visualization with title '${oVizData.title}' and ID '${oVizData.vizId}' is filtered out, because intent '${oVizData.targetURL}' is not supported.`,
                        null, this.COMPONENT_NAME);
                } else {
                    oSection.visualizations.push(oVizData);
                }
            }
        }

        ushellUtils.setPerformanceMark(["FLP-Pages-Service-getModelForPage-end[", oPage.id, "]"].join(""));
        return oPage;
    };

    /**
     * Removes visualizations from a section that do not have a supported indent.
     * Note that this only removes them from the pages model and not from the CDM model.
     *
     * @param {int} pageIndex The index of the page containing the section.
     * @param {int} sectionIndex The index of the section containing the visualizations.
     * @returns {Promise} Promise which resolves after all visualizations have been checked (and removed).
     *
     * @since 1.90.0
     * @private
     */
    Pages.prototype.removeUnsupportedVisualizations = async function (pageIndex, sectionIndex) {
        const oCSTRService = await this._oCSTRServicePromise;
        const aVisualizations = this.getModel().getProperty(`/pages/${pageIndex}/sections/${sectionIndex}/visualizations/`);

        const aPromises = [];

        for (let i = aVisualizations.length - 1; i >= 0; --i) {
            aPromises.push(this._isIntentSupported(aVisualizations[i], oCSTRService).then(((index, bIntentSupported) => {
                if (!bIntentSupported) {
                    aVisualizations.splice(index, 1);
                }
                return bIntentSupported;
            }).bind(this, i)));
        }

        const aResults = await Promise.all(aPromises);

        if (aResults.indexOf(false) !== -1) {
            this.getModel().refresh();
        }
    };

    /**
     * Checks whether a visualization can be resolved in the current context
     * @param {sap.ushell.services.Pages.Visualization} oVizData The vizData object which should be checked
     * @param {object} oCSTRService The resolved ClientSideTargetResolution service
     * @returns {Promise<boolean>} A Promise resolving a boolean indicating whether this visualization should be filtered out or not
     *
     * @since 1.78.0
     * @private
     */
    Pages.prototype._isIntentSupported = async function (oVizData, oCSTRService) {
        if (oVizData.target === undefined) {
            return false;
        }
        if (oVizData.target.type === "URL") {
            if (readVisualizations.isStandardVizType(oVizData.vizType)) {
                // Only check for the target url on standard viz types as custom tiles
                // should still be shown even if they have no target url (e.g News Tile).
                return Promise.resolve(!!oVizData.target.url);
            }
            return true;
        }

        try {
            const oSupported = await oCSTRService.isIntentSupported([oVizData.targetURL]);

            return oSupported[oVizData.targetURL].supported;
        } catch {
            return false;
        }
    };

    /**
     * Adds a new bookmark tile to the model and to the CDM 3.1 site.
     *
     * @param {string} pageId The id of the page to which the bookmark should be added.
     * @param {object} bookmark
     *   Bookmark parameters. In addition to title and URL, a bookmark might allow additional
     *   settings, such as an icon or a subtitle. Which settings are supported depends
     *   on the environment in which the application is running. Unsupported parameters will be ignored.
     * @param {string} bookmark.title
     *   The title of the bookmark.
     * @param {string} bookmark.url
     *   The URL of the bookmark. If the target application shall run in the Shell the URL has
     *   to be in the format <code>"#SO-Action~Context?P1=a&P2=x&/route?RPV=1"</code>.
     * @param {string} [bookmark.icon]
     *   The optional icon URL of the bookmark (e.g. <code>"sap-icon://home"</code>).
     * @param {string} [bookmark.info]
     *   The optional information text of the bookmark. This property is not relevant in the CDM context.
     * @param {string} [bookmark.subtitle]
     *   The optional subtitle of the bookmark.
     * @param {string} [bookmark.serviceUrl]
     *   The URL to a REST or OData service that provides some dynamic information for the bookmark.
     * @param {object} [oParameters.dataSource]
     *   Metadata for parameter serviceUrl. Mandatory to specify if parameter serviceURL contains semantic date ranges.
     *   This does not influence the data source of the app itself.
     * @param {string} [oParameters.dataSource.type]
     *   The type of the serviceURL's service. Only "OData" is supported.
     * @param {object} [oParameters.dataSource.settings.odataVersion]
     *   The OData version of parameter serviceURL. Valid values are "2.0" and "4.0".
     * @param {string} [bookmark.serviceRefreshInterval]
     *   The refresh interval for the <code>serviceUrl</code> in seconds.
     * @param {string} [bookmark.numberUnit]
     *   The unit for the number retrieved from <code>serviceUrl</code>.
     *   This property is not relevant in the CDM context.
     * @param {string} [bookmark.vizType]
     *   The vizType of the bookmark.
     *   This is only used for custom bookmarks.
     * @param {object} [bookmark.vizConfig]
     *   The vizConfig of the bookmark.
     *   This is only used for custom bookmarks.
     * @param {string} [sectionId] The id of the section to which the bookmark should be added.
     * @param {string} [sContentProviderId] The contentProviderId or undefined outside the cFLP
     *
     * @returns {Promise} Promise which resolves after the personalization was saved.
     *
     * @since 1.75.0
     *
     * @private
     */
    Pages.prototype.addBookmarkToPage = async function (pageId, bookmark, sectionId, sContentProviderId) {
        if (!pageId) {
            throw new Error("Pages - addBookmarkToPage: Adding bookmark tile failed: No page id is provided.");
        }

        const aVizTypeIds = readUtils.getBookmarkVizTypeIds(bookmark);

        this.setPersonalizationActive(true);

        // Ensure the target page is loaded
        const [oCdmService, oCSTRService] = await Promise.all([
            this._oCdmServicePromise,
            this._oCSTRServicePromise
        ]);
        const aVizTypesResult = await Promise.all(aVizTypeIds.map((sVizType) => {
            return oCdmService.getVizType(sVizType);
        }));
        const oVizTypesPage = {};
        aVizTypesResult.forEach((oVizType, iIndex) => {
            oVizTypesPage[aVizTypeIds[iIndex]] = oVizType;
            return oVizTypesPage;
        });

        let aResults;
        try {
            aResults = await Promise.all([
                this.loadPage(pageId),
                oVizTypesPage,
                oCSTRService.getSystemContext(sContentProviderId)
            ]);
        } catch (oError) {
            Log.error("Pages - addBookmarkToPage: Personalization cannot be saved: Could not load page.", oError, this.COMPONENT_NAME);
            throw oError;
        }
        const [pagePath, oVizTypes, oSystemContext] = aResults;
        // Create visualization data for the model
        const oVizRef = {
            id: this._generateId(pageId),
            vizType: bookmark.vizType,
            title: bookmark.title,
            subTitle: bookmark.subtitle,
            icon: bookmark.icon,
            info: bookmark.info,
            numberUnit: bookmark.numberUnit,
            target: utilsCdm.toTargetFromHash(bookmark.url),
            indicatorDataSource: {
                path: bookmark.serviceUrl,
                refresh: bookmark.serviceRefreshInterval
            },
            vizConfig: bookmark.vizConfig,
            isBookmark: true
        };

        if (bookmark.dataSource) {
            oVizRef.dataSource = {
                type: bookmark.dataSource.type,
                settings: {
                    odataVersion: ObjectPath.get(["dataSource", "settings", "odataVersion"], bookmark)
                }
            };
        }

        if (sContentProviderId) {
            oVizRef.contentProviderId = sContentProviderId;
        }

        const oVizData = await this._getVisualizationData(pageId, undefined, {}, oVizRef, {}, oVizTypes, oSystemContext);

        // Find page & section
        const iPageIndex = parseInt(/pages\/(\d+)/.exec(pagePath)[1], 10);
        const oPage = this._oPagesModel.getProperty(pagePath);

        let oSectionToAdd;
        if (sectionId) {
            oSectionToAdd = oPage.sections.find((section) => {
                return section.id === sectionId;
            });
            if (!oSectionToAdd) {
                Log.error("Pages - addBookmarkToPage: Adding bookmark tile failed: specified section was not found in the page.");
                throw new Error("Pages - addBookmarkToPage: Adding bookmark tile failed: specified section was not found in the page.");
            }
        } else {
            oSectionToAdd = oPage.sections.find((section) => {
                return section.default;
            });
            // Create a new default section together with the visualization if there is no default section yet
            if (!oSectionToAdd) {
                return this.addSection(iPageIndex, 0, {
                    title: resources.i18n.getText("DefaultSection.Title"),
                    default: true,
                    visualizations: [oVizData]
                });
            }
        }

        try {
            // Add visualization to existing default section, update model & site, save personalization
            oSectionToAdd.visualizations.push(oVizData);
            this._oPagesModel.refresh();
            let oCDMPage;
            try {
                oCDMPage = await oCdmService.getPage(pageId);
            } catch (oError) {
                Log.error("Pages - addBookmarkToPage: Personalization cannot be saved: CDM Service or Page cannot be retrieved.", oError, this.COMPONENT_NAME);
                throw oError;
            }
            const oSection = oCDMPage.payload.sections[oSectionToAdd.id];
            oSection.layout.vizOrder.push(oVizData.id);
            oSection.viz[oVizData.id] = readUtils.getVizRef(oVizData);

            // Save
            return await this._conditionalSavePersonalization(pageId);
        } catch (oError) {
            this.setPersonalizationActive(false);
            throw oError;
        }
    };

    /**
     * Calls the visitor function for every page in the CDM site.
     * Currently, the returned Promise does not wait for the visitorFunctions to finish asynchronous tasks!
     *
     * @param {function} fnVisitor The visitor function
     * @returns {Promise} A Promise that resolves once all the pages were visited
     *
     * @since 1.82.0
     * @private
     */
    Pages.prototype._visitPages = async function (fnVisitor) {
        const oCdmService = await this._oCdmServicePromise;
        const aPages = await oCdmService.getAllPages() || [];
        aPages.forEach((oPage) => {
            fnVisitor(oPage);
        });
    };

    /**
     * Calls the visitor function for every section in the CDM site.
     * Currently, the returned Promise does not wait for the visitorFunctions to finish asynchronous tasks!
     *
     * @param {function} fnVisitor The visitor function
     * @returns {Promise} A Promise that resolves once all the pages were visited
     *
     * @since 1.82.0
     * @private
     */
    Pages.prototype._visitSections = function (fnVisitor) {
        return this._visitPages((oPage) => {
            const oSections = oPage.payload && oPage.payload.sections || {};
            Object.keys(oSections).forEach((sKey) => {
                fnVisitor(oSections[sKey], oPage);
            });
        });
    };

    /**
     * Calls the visitor function for every vizReference in the CDM site.
     * Currently the returned Promise does not wait for the visitorFunctions to finish asynchronous tasks!
     *
     * @param {function} fnVisitor The visitor function
     * @returns {Promise} A Promise that resolves once all the pages were visited
     *
     * @since 1.82.0
     * @private
     */
    Pages.prototype._visitVizReferences = function (fnVisitor) {
        return this._visitSections((oSection, oPage) => {
            const oVizReferences = oSection.viz || {};
            Object.keys(oVizReferences).forEach((sKey) => {
                fnVisitor(oVizReferences[sKey], oSection, oPage);
            });
        });
    };

    /**
     * Returns the location of a bookmark in the CDM site, specified by page ID, section ID and vizRef ID.
     *
     * @param {object} oIdentifier
     *   An object which is used to find the bookmarks by matching the provided properties.
     * @param {string} oIdentifier.url
     *   The target URL of the bookmark
     * @param {string} [oIdentifier.vizType]
     *   The visualization type of the bookmark
     * @returns {Promise<object[]>} The promise resolves to an array of objects containing
     *     pageId, sectionId and vizRefId of the found bookmarks.
     *
     * @since 1.82.0
     * @private
     */
    Pages.prototype._findBookmarks = async function (oIdentifier) {
        // for bookmarks it is sufficient to check the vizReferences as the properties of interest
        // don't come from other CDM entities like app or visualization
        const aVizReferences = [];

        let oTarget = utilsCdm.toTargetFromHash(oIdentifier.url);
        oTarget = readUtils.harmonizeTarget(oTarget);
        await this._visitVizReferences((oVizReference, oSection, oPage) => {
            if (oVizReference.isBookmark &&
                oIdentifier.vizType === oVizReference.vizType &&
                (oVizReference.contentProviderId || "") === (oIdentifier.contentProviderId || "") &&
                utilsCdm.isSameTarget(oTarget, oVizReference.target)) {
                aVizReferences.push({
                    vizRefId: oVizReference.id,
                    sectionId: oSection.id,
                    pageId: oPage.identification.id
                });
            }
        });
        return aVizReferences;
    };

    /**
     * Count the bookmarks that match the given URL.
     *
     * @param {object} oIdentifier
     *   An object which is used to find the bookmarks by matching the provided properties.
     * @param {string} oIdentifier.url
     *   The target URL of the bookmark
     * @param {string} [oIdentifier.vizType]
     *   The visualization type of the bookmark
     * @returns {Promise<int>} A Promise that resolves to the number of bookmarks
     *
     * @since 1.82.0
     * @private
     */
    Pages.prototype.countBookmarks = async function (oIdentifier) {
        const aFoundBookmarks = await this._findBookmarks(oIdentifier);
        return aFoundBookmarks.length;
    };

    /**
     * Delete the bookmarks that match the given URL.
     *
     * @param {object} oIdentifier
     *   An object which is used to find the bookmarks by matching the provided properties.
     * @param {string} oIdentifier.url
     *   The target URL of the bookmark
     * @param {string} [oIdentifier.vizType]
     *   The visualization type of the bookmark
     * @param {string} [pageId] The id of the page from which the bookmark should be removed.
     * @param {string} [sectionId] The id of the sectionId in the specified page from which the bookmark should be removed.
     *
     * @returns {Promise<int>} A Promise that resolves to the number of deleted bookmarks
     *
     * @since 1.82.0
     * @private
     */
    Pages.prototype.deleteBookmarks = async function (oIdentifier, pageId, sectionId) {
        let iDeletionCounter = 0;
        const aVizReferencesToDelete = await this._findBookmarks(oIdentifier);
        // the deleteVisualization function is not mass capable so we make sure that the
        // calls are sequentialized so that there can be no race conditions
        await aVizReferencesToDelete.reduce((oDeleteChain, oIds) => {
            if (pageId && oIds.pageId !== pageId) {
                return oDeleteChain;
            }
            if (sectionId && oIds.sectionId !== sectionId) {
                return oDeleteChain;
            }
            return oDeleteChain
                .then(() => {
                    return this.findVisualization(oIds.pageId, oIds.sectionId, null, oIds.vizRefId);
                })
                .then((aLocation) => {
                    // the vizRef ID is unique on a page so there can be only one result
                    const oLocation = aLocation[0];
                    const iPageIndex = this.getPageIndex(oLocation.pageId);
                    return this.deleteVisualization(iPageIndex, oLocation.sectionIndex, oLocation.vizIndexes[0]);
                })
                .then(() => {
                    iDeletionCounter = iDeletionCounter + 1;
                })
                .catch(() => {
                    // as deleteVisualization is not mass capable it is not possible to implement an all or nothing
                    // error handling therefore only the number of successful deletions is returned
                });
        }, Promise.resolve());
        return iDeletionCounter;
    };

    /**
     * Update the bookmarks that match the given URL.
     *
     * @param {object} oIdentifier
     *   An object which is used to find the bookmarks by matching the provided properties.
     * @param {string} oIdentifier.url
     *   The target URL of the bookmark
     * @param {string} [oIdentifier.vizType]
     *   The visualization type of the bookmark
     * @param {object} oParameters The object of parameters to be changed
     *
     * @returns {Promise<int>} A Promise that resolves to the number of updated bookmarks
     *
     * @since 1.83.0
     * @private
     */
    Pages.prototype.updateBookmarks = async function (oIdentifier, oParameters) {
        if (!oIdentifier || !oIdentifier.url || typeof oIdentifier.url !== "string") {
            Log.error("Fail to update bookmark. No valid URL");
            throw new Error("Invalid URL provided");
        }
        if (!oParameters || typeof oParameters !== "object") {
            Log.error(`Fail to update bookmark. No valid parameters, URL is: ${oIdentifier.url}`);
            throw new Error("Missing parameters");
        }
        let iUpdateCounter = 0;
        const aResult = await Promise.all([
            this._findBookmarks(oIdentifier)
        ]);
        const aVizReferencesToUpdate = aResult[0];

        // the updateVisualization function is not mass capable so we make sure that the
        // calls are sequentialized so that there can be no race conditions
        await aVizReferencesToUpdate.reduce((oUpdateChain, oIds) => {
            return oUpdateChain
                .then(() => {
                    return this.findVisualization(oIds.pageId, oIds.sectionId, null, oIds.vizRefId);
                })
                .then((aLocation) => {
                    // the vizRef ID is unique on a page so there can be only one result
                    const oLocation = aLocation[0];
                    const iPageIndex = this.getPageIndex(oLocation.pageId);

                    // map the parameters of the bookmark service API to the properties of a visualization
                    const oVisualizationData = {
                        subtitle: oParameters.subtitle,
                        icon: oParameters.icon,
                        info: oParameters.info,
                        numberUnit: oParameters.numberUnit,
                        indicatorDataSource: {
                            path: oParameters.serviceUrl,
                            refresh: oParameters.serviceRefreshInterval
                        },
                        vizConfig: oParameters.vizConfig
                    };
                    // prevent that title and url can be cleared by setting them to "" as they are mandatory
                    if (oParameters.title) {
                        oVisualizationData.title = oParameters.title;
                    }
                    if (oParameters.url) {
                        oVisualizationData.target = readUtils.harmonizeTarget(utilsCdm.toTargetFromHash(oParameters.url));
                    }

                    return this.updateVisualization(iPageIndex, oLocation.sectionIndex, oLocation.vizIndexes[0], oVisualizationData);
                })
                .then(() => {
                    iUpdateCounter = iUpdateCounter + 1;
                })
                .catch(() => {
                    // as updateVisualization is not mass capable it is not possible to implement an all or nothing
                    // error handling therefore only the number of successful updates is returned
                });
        }, Promise.resolve());

        return iUpdateCounter;
    };

    /**
     * @typedef {object} VisualizationIdentifier The identifier of a visualization within a page section.
     * @property {string} pageId The ID of the page where the section is.
     * @property {string} sectionId The section index within that page.
     * @property {string} vizRefId The id of the visualization
     */

    /**
     * Updates the properties of a visualization
     * Properties that are not supplied are not updated.
     *
     * @param {int} iPageIndex The index of the page containing the updated visualization.
     * @param {int} iSourceSectionIndex The index of the section from where the visualization is updated.
     * @param {int} iSourceVisualizationIndex The index of the updated visualization.
     * @param {sap.ushell.services.Pages.Visualization} oVisualizationData The updated visualization properties
     *
     * @returns {Promise<VisualizationIdentifier>} The promise resolves when the visualization has been updated successfully.
     *
     * @since 1.83
     * @private
     */
    Pages.prototype.updateVisualization = async function (iPageIndex, iSourceSectionIndex, iSourceVisualizationIndex, oVisualizationData) {
        const oCdmService = await this._oCdmServicePromise;
        const [
            oVisualizations,
            oApplications,
            oVizTypes
        ] = await Promise.all([
            oCdmService.getCachedVisualizations(),
            oCdmService.getApplications(),
            oCdmService.getCachedVizTypes()
        ]);

        const oPageModel = this._oPagesModel.getProperty(`/pages/${iPageIndex}`);
        const oSectionModel = oPageModel.sections[iSourceSectionIndex];
        const aSourceSectionVisualizations = oSectionModel.visualizations;
        let oUpdatedVisualization = aSourceSectionVisualizations[iSourceVisualizationIndex];

        // for visualizations that are not bookmarks, only the changed properties must be saved in the vizReference
        // so that the data for unchanged properties can still get through from other CDM levels,
        // like visualization or application
        const oChangedProperties = {};

        this.setPersonalizationActive(true);

        if (this._isPropertyChanged(oUpdatedVisualization.title, oVisualizationData.title)) {
            oChangedProperties.title = oVisualizationData.title;
        }
        if (oVisualizationData.target && !utilsCdm.isSameTarget(oUpdatedVisualization.target, oVisualizationData.target)) {
            oChangedProperties.target = oVisualizationData.target;
        }
        if (this._isPropertyChanged(oUpdatedVisualization.subtitle, oVisualizationData.subtitle)) {
            oChangedProperties.subtitle = oVisualizationData.subtitle;
        }
        if (this._isPropertyChanged(oUpdatedVisualization.icon, oVisualizationData.icon)) {
            oChangedProperties.icon = oVisualizationData.icon;
        }
        if (this._isPropertyChanged(oUpdatedVisualization.info, oVisualizationData.info)) {
            oChangedProperties.info = oVisualizationData.info;
        }
        if (this._isPropertyChanged(oUpdatedVisualization.numberUnit, oVisualizationData.numberUnit)) {
            oChangedProperties.numberUnit = oVisualizationData.numberUnit;
        }
        if (this._isPropertyChanged(oUpdatedVisualization.displayFormatHint, oVisualizationData.displayFormatHint)) {
            oChangedProperties.displayFormatHint = oVisualizationData.displayFormatHint;
        }
        if (oVisualizationData.indicatorDataSource && oUpdatedVisualization.indicatorDataSource &&
            (this._isPropertyChanged(oUpdatedVisualization.indicatorDataSource.path, oVisualizationData.indicatorDataSource.path) ||
                this._isPropertyChanged(oUpdatedVisualization.indicatorDataSource.refresh, oVisualizationData.indicatorDataSource.refresh))) {
            // the properties of the indicator data source can be updated independently as this is required
            // by the bookmark service. however, they are saved together in the CDM vizRef
            oChangedProperties.indicatorDataSource = deepClone(oUpdatedVisualization.indicatorDataSource);
            extend(oChangedProperties.indicatorDataSource, oVisualizationData.indicatorDataSource);
        }
        if (oVisualizationData.vizConfig) {
            // merge the vizConfig so that the caller only has to provide the properties that shall be changed
            oUpdatedVisualization.vizConfig = deepExtend({}, oUpdatedVisualization.vizConfig, oVisualizationData.vizConfig);
            oChangedProperties.vizConfig = oUpdatedVisualization.vizConfig;
        }

        // update the changed properties in the visualization and
        // recreate the visualization to update properties that depend on the changed properties,
        // like the vizType or the _instantiationData
        extend(oUpdatedVisualization, oChangedProperties);
        const oVizRef = readUtils.getVizRef(oUpdatedVisualization);
        oUpdatedVisualization = await this._getVisualizationData(oPageModel.id, oVizRef.vizId, oVisualizations, oVizRef, oApplications, oVizTypes);
        aSourceSectionVisualizations[iSourceVisualizationIndex] = oUpdatedVisualization;

        this._oPagesModel.refresh();

        await this._updateVisualizationCDMData(oPageModel.id, oSectionModel.id, oUpdatedVisualization.id, oChangedProperties);
        return {
            pageId: oPageModel.id,
            sectionId: oSectionModel.id,
            vizRefId: oUpdatedVisualization.id
        };
    };

    /**
     * Updates the data of a CDM vizReference and saves the personalization.
     * The function adds all passed properties that are valid to the vizReference. Whether the property should be added has
     * to be decided by the caller. See also updateVisualization.
     *
     * @param {string} sPageId The page ID
     * @param {string} sSectionId The section ID
     * @param {string} sVizRefId The the vizReference ID
     * @param {sap.ushell.services.Pages.Visualization} oUpdatedVisualization The updated visualization properties
     *
     * @returns {Promise} The promise resolves when the personalization was saved successfully
     *
     * @since 1.83
     * @private
     */
    Pages.prototype._updateVisualizationCDMData = async function (sPageId, sSectionId, sVizRefId, oUpdatedVisualization) {
        let oPage;
        try {
            const oCDMService = await this._oCdmServicePromise;
            oPage = await oCDMService.getPage(sPageId);
        } catch (oError) {
            this.setPersonalizationActive(false);
            Log.error("Pages - updateVisualization: Personalization cannot be saved: CDM Service or Page cannot be retrieved.", oError, this.COMPONENT_NAME);
            throw oError;
        }

        try {
            const oVizRef = oPage.payload.sections[sSectionId].viz[sVizRefId];
            // This makes sure that only valid properties end up in the vizReference
            const oUpdatedVizRefProperties = readUtils.getVizRef(oUpdatedVisualization);
            oUpdatedVizRefProperties.vizConfig = oUpdatedVisualization.vizConfig;
            // Add only changed properties to the vizReference. See also updateVisualization.
            extend(oVizRef, oUpdatedVizRefProperties);

            return await this._conditionalSavePersonalization(oPage.identification.id);
        } catch (oError) {
            this.setPersonalizationActive(false);
            throw oError;
        }
    };

    /**
     * Checks if a property is supplied and if so if it has changed.
     *
     * @param {string} oldValue The the old value
     * @param {string} newValue The the new value
     *
     * @returns {boolean} Returns true if the value has changed
     *
     * @since 1.83
     * @private
     */
    Pages.prototype._isPropertyChanged = function (oldValue, newValue) {
        if ((newValue || newValue === "") &&
            oldValue !== newValue) {
            return true;
        }
        return false;
    };

    Pages.hasNoAdapter = true;
    return Pages;
}, /* export=*/ true);
