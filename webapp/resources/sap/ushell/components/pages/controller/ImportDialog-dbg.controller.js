// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @file Provides functionality for "sap/ushell/components/pages/view/ImportDialog.fragment.xml"
 */
sap.ui.define([
    "sap/base/Log",
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/components/pages/MyHomeImport",
    "sap/ushell/Config",
    "sap/ushell/library",
    "sap/ushell/resources",
    "sap/ushell/utils/WindowUtils",
    "sap/ushell/Container"
], (
    Log,
    Controller,
    Fragment,
    JSONModel,
    MyHomeImport,
    Config,
    ushellLibrary,
    resources,
    WindowUtils,
    Container
) => {
    "use strict";

    // shortcut for sap.ushell.DisplayFormat
    const DisplayFormat = ushellLibrary.DisplayFormat;

    const mCustomTypeMapping = {
        "X-SAP-UI2-CHIP:SSB_NUMERIC": "ssuite/smartbusiness/tiles/numeric",
        "X-SAP-UI2-CHIP:SSB_CONTRIBUTION": "ssuite/smartbusiness/tiles/contribution",
        "X-SAP-UI2-CHIP:SSB_TREND": "ssuite/smartbusiness/tiles/trend",
        "X-SAP-UI2-CHIP:SSB_DEVIATION": "ssuite/smartbusiness/tiles/deviation",
        "X-SAP-UI2-CHIP:SSB_COMPARISON": "ssuite/smartbusiness/tiles/comparison",
        "X-SAP-UI2-CHIP:SSB_BLANK": "ssuite/smartbusiness/tiles/blank",
        "X-SAP-UI2-CHIP:SSB_DUAL": "ssuite/smartbusiness/tiles/dual"
    };

    return Controller.extend("sap.ushell.components.pages.controller.ImportDialog", {

        /**
         * Opens the dialog
         * @returns {Promise<sap.m.Dialog>} A promise resolving to the dialog control.
         * @private
         */
        open: async function () {
            if (!this._oDialog) {
                this._oDialog = await Fragment.load({
                    name: "sap.ushell.components.pages.view.ImportDialog",
                    controller: this
                });
                this._oDialog.setModel(resources.i18nModel, "i18n");
                this._oDialog.setModel(new JSONModel({
                    busy: true,
                    groups: [],
                    PersonalizedGroups: []
                }));

                try {
                    // Get PageSet request and fill the model with its data
                    const aGroups = await MyHomeImport.getData();
                    this._oDialog.getModel().setData({
                        busy: false,
                        groups: aGroups,
                        PersonalizedGroups: aGroups.map((group) => ({
                            title: group.isDefault ? resources.i18n.getText("my_group") : group.title,
                            description: group.id,
                            selected: true
                        }))
                    });
                } catch (oError) {
                    const oMessageService = await Container.getServiceAsync("MessageInternal");
                    oMessageService.error(oError);
                }
            }

            this._oURLParsingService = await Container.getServiceAsync("URLParsing");
            this._oDialog.open();
            return this._oDialog;
        },

        /**
         * Closes the dialog.
         * @private
         */
        close: function () {
            if (this._oDialog) {
                this._oDialog.close();
            }
        },

        /**
         * Performs the import.
         *
         * @private
         */
        doImport: function () {
            const oModel = this._oDialog.getModel();
            const aSelectedGroupIds = [];
            oModel.getProperty("/PersonalizedGroups").forEach((group) => {
                if (group.selected) {
                    aSelectedGroupIds.push(group.description);
                }
            });
            const aGroups = this._prepareImport(aSelectedGroupIds);
            this._saveImport(aGroups);
        },

        /**
         * Moves the visualization at the given vizIndex from the default section ('Recently added') to the preset section ('My Apps').
         *
         * @param {sap.ushell.services.Pages} pagesService The Pages service instance.
         * @param {object} group The group to which the visualization is added.
         * @param {int} index the index of the section, the new visualization should be added to.
         * @param {int} iTargetVizIndex The target visualization index.
         * @param {boolean} defaultGroupImported Indicates if the default group has already been imported.
         * @returns {Promise} A promise resolving when the visualization has been moved.
         * @private
         */
        _moveVisualization: function (pagesService, group, index, iTargetVizIndex, defaultGroupImported) {
            const iTargetSectionIndex = this._getSectionIndex(pagesService, group, index, defaultGroupImported);
            const iDefaultSectionIndex = this._getDefaultSectionIndex(pagesService);
            const oDefaultSection = this._getDefaultSection(pagesService);
            let iSrcVizIndex = 0;
            if (oDefaultSection && oDefaultSection.visualizations && oDefaultSection.visualizations.length) {
                iSrcVizIndex = oDefaultSection.visualizations.length - 1;
            }
            return pagesService.moveVisualization(this.iPageIndex, iDefaultSectionIndex, iSrcVizIndex, iTargetSectionIndex, iTargetVizIndex);
        },

        /**
         * Updates the visualization at the given index. with the given tileData.
         *
         * @param {sap.ushell.services.Pages} pagesService The Pages service instance.
         * @param {object} group The group to which the visualization is added.
         * @param {object} tileData The tile data to update.
         * @param {int} index the index of the section, the new visualization should be added to.
         * @param {int} vizIndex The visualization index.
         * @param {boolean} defaultGroupImported Indicates if the default group has already been imported.
         * @returns {Promise} A promise resolving when the update is done.
         * @private
         */
        _updateVisualization: async function (pagesService, group, tileData, index, vizIndex, defaultGroupImported) {
            if (tileData.bUpdateNeeded) {
                const iSectionIndex = this._getSectionIndex(pagesService, group, index, defaultGroupImported);
                const oVisualizationData = this._filterNonSupportedProperties(tileData, [
                    "title",
                    "target",
                    "subtitle",
                    "icon",
                    "info",
                    "numberUnit",
                    "indicatorDataSource",
                    "displayFormatHint"
                ]);
                return pagesService.updateVisualization(this.iPageIndex, iSectionIndex, vizIndex, oVisualizationData);
            }
        },

        /**
         * Generates a new visualization.
         *
         * @param {object} group The group to which the visualization is added.
         * @param {object} tile contains important information on how the visualization should be created.
         * @param {int} vizIndex the index of the new visualization.
         * @param {int} index the index of the section, the new visualization should be added to.
         * @param {object} services Ushell services that are need to add the bookmarks and the visualizations.
         * @param {object} contentNode of the current page.
         * @param {boolean} defaultGroupImported Indicates if the default group has already been imported.
         *
         * @private
         */
        _addVisualization: function (group, tile, vizIndex, index, services, contentNode, defaultGroupImported) {
            let oBookmarkConfig;
            if (tile.isABookmark) {
                if (tile.isCustomBookmark) {
                    this.aPromiseChain.push(async () => {
                        oBookmarkConfig = this._filterNonSupportedProperties(tile, [
                            "title",
                            "url",
                            "subtitle",
                            "icon",
                            "info",
                            "vizConfig",
                            "loadManifest",
                            "chipConfig"
                        ]);
                        await services.bookmark.addCustomBookmark(tile.vizType, oBookmarkConfig, contentNode);
                        await this._moveVisualization(services.pages, group, index, vizIndex, defaultGroupImported);
                        return this._updateVisualization(services.pages, group, tile, index, vizIndex, defaultGroupImported);
                    });
                } else {
                    this.aPromiseChain.push(async () => {
                        oBookmarkConfig = this._filterNonSupportedProperties(tile, [
                            "title",
                            "url",
                            "icon",
                            "info",
                            "subtitle",
                            "serviceUrl",
                            "serviceRefreshInterval",
                            "numberUnit"
                        ]);
                        await services.bookmark.addBookmark(oBookmarkConfig, contentNode);
                        await this._moveVisualization(services.pages, group, index, vizIndex, defaultGroupImported);
                        return this._updateVisualization(services.pages, group, tile, index, vizIndex, defaultGroupImported);
                    });
                }
            } else {
                this.aPromiseChain.push(async () => {
                    const iSectionIndex = this._getSectionIndex(services.pages, group, index, defaultGroupImported);
                    const sSectionId = services.pages.getModel().getProperty(`/pages/${this.iPageIndex}/sections/${iSectionIndex}/id`);
                    await services.pages.addVisualization(this.sPageId, sSectionId, tile.vizId);
                    return this._updateVisualization(services.pages, group, tile, index, vizIndex, defaultGroupImported);
                });
            }
        },

        /**
         * Adds visualizations to the existing preset section ('My Apps').
         *
         * @param {object} group contains important information on how the section should be created.
         * @param {int} index the index of the current iteration.
         * @param {object} services Ushell services that are needed to add the sections and the visualizations.
         * @param {object} contentNode of the current page.
         * @param {boolean} defaultGroupImported Indicates if the default group has already been imported.
         *
         * @private
         *
         */
        _addToPresetSection: function (group, index, services, contentNode, defaultGroupImported) {
            const oPresetSection = this._getPresetSection(services.pages);
            const iExistingTilesLength = oPresetSection.visualizations.filter((viz) => {
                return viz.displayFormatHint !== DisplayFormat.Compact;
            }).length;
            const iExistingLinksLength = oPresetSection.visualizations.filter((viz) => {
                return viz.displayFormatHint === DisplayFormat.Compact;
            }).length;

            // Add Tiles
            for (let i = 0; i < group.tiles.length; ++i) {
                this._addVisualization(group, group.tiles[i], i + iExistingTilesLength, index, services, contentNode, defaultGroupImported);
            }
            // Add Links
            for (let j = 0; j < group.links.length; ++j) {
                this._addVisualization(group, group.links[j], j + iExistingLinksLength + iExistingTilesLength + group.tiles.length, index, services, contentNode, defaultGroupImported);
            }
        },

        /**
         * Generates a new section with all its visualizations.
         *
         * @param {object} group contains important information on how the section should be created.
         * @param {int} index the index of the current iteration.
         * @param {object} services Ushell services that are needed to add the sections and the visualizations.
         * @param {object} contentNode of the current page.
         * @param {boolean} defaultGroupImported Indicates if the default group has already been imported.
         *
         * @private
         *
         */
        _addSection: function (group, index, services, contentNode, defaultGroupImported) {
            this.aPromiseChain.push(() => {
                const iUpdatedSectionIndex = this._getSectionIndex(services.pages, group, index, defaultGroupImported);
                return services.pages.addSection(this.iPageIndex, iUpdatedSectionIndex, { title: group.title });
            });

            // Add Tiles
            for (let i = 0, len = group.tiles.length; i < len; ++i) {
                this._addVisualization(group, group.tiles[i], i, index, services, contentNode, defaultGroupImported);
            }
            // Add Links
            for (let j = 0, len2 = group.links.length; j < len2; ++j) {
                this._addVisualization(group, group.links[j], j + group.tiles.length, index, services, contentNode, defaultGroupImported);
            }
        },

        /**
         * Finds and returns the 'My Home' page contentNode
         * @param {sap.ushell.services.Bookmark} bookmarkService The Bookmark service instance.
         * @returns {Promise<sap.ushell.services.Bookmark.ContentNode>|null} The contentNode if found, else null.
         * @private
         */
        _getMyHomeContentNode: async function (bookmarkService) {
            const sSpaceId = Config.last("/core/spaces/myHome/myHomeSpaceId");

            const aContentNodes = await bookmarkService.getContentNodes();
            const oMyHomeSpace = aContentNodes.find((contentNode) => {
                return contentNode.id === sSpaceId;
            });

            if (!oMyHomeSpace) {
                return null;
            }

            return oMyHomeSpace.children.find((contentNode) => {
                return contentNode.id === this.sPageId;
            });
        },

        /**
         * Generates sections for each given groupId, from the classic homepage.
         *
         * @param {object[]} groups an array of groupIds from the classic homepage.
         * @returns {Promise<undefined>} when all calculations are completed.
         * @private
         */
        _saveImport: async function (groups) {
            this._oDialog.setBusy(true);

            this.sPageId = Config.last("/core/spaces/myHome/myHomePageId");

            // Initialize the promise chain
            this.aPromiseChain = [];

            const [
                oBookmarkService,
                oMessageService,
                oPagesService,
                oUserInfoService
            ] = await Promise.all([
                Container.getServiceAsync("BookmarkV2"),
                Container.getServiceAsync("MessageInternal"),
                Container.getServiceAsync("Pages"),
                Container.getServiceAsync("UserInfo")
            ]);
            try {
                // Needed for bookmark tiles
                const oMyHomeContentNode = await this._getMyHomeContentNode(oBookmarkService);

                this.iPageIndex = oPagesService.getPageIndex(this.sPageId);
                // Turn off implicit saving
                oPagesService.enableImplicitSave(false);
                this._performImportOperations(groups, {
                    bookmark: oBookmarkService,
                    message: oMessageService,
                    pages: oPagesService,
                    userInfo: oUserInfoService
                }, oMyHomeContentNode);

                // Sequentially execute the promise chain
                await this._executeSequentially(this.aPromiseChain);
                await this._savePersonalizations(oPagesService);

                // Send message toast
                oMessageService.info(resources.i18n.getText("MyHome.InitialPage.Message.ImportSuccessful"));

                // Set user import setting to "done"
                oUserInfoService.getUser().setImportBookmarksFlag("done");
                await oUserInfoService.updateUserPreferences();

                // This reload is required to display the personalizations
                WindowUtils.refreshBrowser();
            } catch (oError) {
                oMessageService.error(oError);
            } finally {
                this._oDialog.setBusy(false);
                this.close();
            }
        },

        /**
         * Save groups, tiles, links, and (custom) bookmarks.
         * The resulting promises are stored in the promise chain.
         *
         * @param {object[]} groups The array of groups to import.
         * @param {object} services A map of the service instances required.
         * @param {sap.ushell.services.Bookmark.ContentNode} myHomeContentNode The contentNode for the 'My Home' page.
         * @private
         */
        _performImportOperations: function (groups, services, myHomeContentNode) {
            let oGroup;
            let bDefaultGroupIsImported = false;

            for (let i = 0, len = groups.length; i < len; ++i) {
                oGroup = groups[i];
                if (oGroup.isDefault) {
                    this._addToPresetSection(oGroup, i, services, myHomeContentNode, bDefaultGroupIsImported);
                    bDefaultGroupIsImported = true;
                } else {
                    this._addSection(oGroup, i, services, myHomeContentNode, bDefaultGroupIsImported);
                }
            }
        },

        /**
         * Executes the given array of promises sequentially.
         * @param {Promise[]} aPromises The Array of promises.
         * @returns {Promise} A promise that resolves when the whole chain is resolved.
         * @private
         */
        _executeSequentially: function (aPromises) {
            return aPromises.reduce(async (chain, current) => {
                return chain
                    .then(() => {
                        return current();
                    })
                    .catch((oError) => {
                        Log.error("Failed to execute promise", oError);
                    });
            }, Promise.resolve());
        },
        /**
         * Determine the section index.
         * Default section already exists, in case default group is not imported the section index needs to skip the default section.
         * @param {sap.ushell.services.Pages} pagesService The Pages service instance.
         * @param {object} group The group.
         * @param {int} current The current index.
         * @param {boolean} defaultGroupImported Indicates if the default group has been imported.
         * @returns {int} The section index.
         * @private
         */
        _getSectionIndex: function (pagesService, group, current, defaultGroupImported) {
            const iOffset = this._getPresetSectionIndex(pagesService);
            if (!group.isDefault && !group.isLocked && !defaultGroupImported) {
                return iOffset + current + 1;
            }
            return iOffset + current;
        },
        /**
         * Determine the index of the 'My Home' preset section ('My Apps').
         * @param {sap.ushell.services.Pages} pagesService The Pages service instance.
         * @returns {int} The section index.
         * @private
         */
        _getPresetSectionIndex: function (pagesService) {
            const aSections = pagesService.getModel().getProperty(`/pages/${this.iPageIndex}/sections/`);
            return aSections.findIndex((section) => {
                return section.id === Config.last("/core/spaces/myHome/presetSectionId");
            });
        },

        /**
         * Determine the index of the 'My Home' default section ('Recently added apps').
         *
         * @param {sap.ushell.services.Pages} pagesService The Pages service instance.
         * @returns {int} The section index.
         * @private
         */
        _getDefaultSectionIndex: function (pagesService) {
            const aSections = pagesService.getModel().getProperty(`/pages/${this.iPageIndex}/sections/`);
            return aSections.findIndex((section) => {
                return section.default;
            });
        },

        /**
         * Returns the preset section of the 'My Home' page ('My Apps').
         * @param {sap.ushell.services.Pages} pagesService The Pages service instance.
         * @returns {object} The section object.
         * @private
         */
        _getPresetSection: function (pagesService) {
            const aSections = pagesService.getModel().getProperty(`/pages/${this.iPageIndex}/sections/`);
            return aSections.find((section) => {
                return section.id === Config.last("/core/spaces/myHome/presetSectionId");
            });
        },

        /**
         * Returns the default section of the 'My Home' page ('Recently Added Apps')
         * @param {sap.ushell.services.Pages} pagesService The Pages service instance.
         * @returns {object} The section object.
         * @private
         */
        _getDefaultSection: function (pagesService) {
            const aSections = pagesService.getModel().getProperty(`/pages/${this.iPageIndex}/sections/`);
            return aSections.find((section) => {
                return section.default;
            });
        },
        /**
         * Converts the chip instance into a visualization data object.
         * @param {object} oChipInstance chip instance that gets imported.
         * @returns {object} visualization data.
         *
         */
        _gatherVizDataObjectFromChipInstance: function (oChipInstance) {
            let oTileConfiguration;
            const oVizData = {
                vizId: oChipInstance.chipId,
                isABookmark: !!oChipInstance.configuration
            };

            // Use the referenceChipId/ stableId for the import
            const sReferenceChipId = oChipInstance.Chip && oChipInstance.Chip.referenceChipId;
            if (sReferenceChipId && sReferenceChipId !== "O") {
                oVizData.vizId = oChipInstance.Chip.referenceChipId;
            }

            if (oVizData.isABookmark) {
                oVizData.isCustomBookmark = [
                    "X-SAP-UI2-CHIP:/UI2/STATIC_APPLAUNCHER",
                    "X-SAP-UI2-CHIP:/UI2/DYNAMIC_APPLAUNCHER"
                ].indexOf(oChipInstance.chipId) === -1;

                oTileConfiguration = JSON.parse(JSON.parse(oChipInstance.configuration).tileConfiguration);
                oVizData.title = oTileConfiguration.display_title_text;
                oVizData.url = oTileConfiguration.navigation_target_url;
                oVizData.icon = oTileConfiguration.display_icon_url;
                oVizData.info = oTileConfiguration.display_info_text;
                oVizData.subtitle = oTileConfiguration.display_subtitle_text;
                oVizData.serviceUrl = oTileConfiguration.service_url;
                oVizData.serviceRefreshInterval = oTileConfiguration.service_refresh_interval;
                oVizData.numberUnit = oTileConfiguration.display_number_unit;
            }

            if (oVizData.isCustomBookmark) {
                // It is possible that the URL is not provided for some older custom bookmarks (e.g. SSB Tiles).
                // When the URL is not available, it is created dynamically if the TILE_PROPERTIES are available and
                // contains the semanticObject, semanticAction and evaluationId.
                if (oTileConfiguration.TILE_PROPERTIES) {
                    try {
                        const oTileProperties = JSON.parse(oTileConfiguration.TILE_PROPERTIES);
                        if (!oVizData.url && oTileProperties.semanticObject && oTileProperties.semanticAction) {
                            const oURLParsingParams = {};
                            if (oTileProperties.evaluationId) {
                                oURLParsingParams.EvaluationId = oTileProperties.evaluationId;
                            }
                            oVizData.url = `#${this._oURLParsingService.constructShellHash({
                                target: {
                                    semanticObject: oTileProperties.semanticObject,
                                    action: oTileProperties.semanticAction
                                },
                                params: oURLParsingParams
                            })}`;
                        }
                        if (oTileProperties.title) {
                            oVizData.title = oTileProperties.title;
                        }
                        if (oTileProperties.subtitle) {
                            oVizData.subtitle = oTileProperties.subtitle;
                        }
                    } catch (oError) {
                        Log.error(`Could not create URL for custom bookmark with title: ${oVizData.title}, Error Message: ${oError.message}`);
                    }
                }

                oVizData.vizConfig = {};
                oVizData.loadManifest = true;
                oVizData.vizType = mCustomTypeMapping[oChipInstance.chipId];
                oVizData.chipConfig = {
                    chipId: oChipInstance.chipId,
                    bags: {},
                    configuration: JSON.parse(oChipInstance.configuration)
                };
            }

            const aChipInstanceBags = oChipInstance.ChipInstanceBags.results;
            // if texts are personalized there are chip instance bags
            // else the pages service gets only the id in the api
            if (aChipInstanceBags.length) {
                oVizData.bUpdateNeeded = !oVizData.isABookmark;

                if (oVizData.isCustomBookmark) {
                    // Fill bags
                    aChipInstanceBags.forEach((oBag) => {
                        oVizData.chipConfig.bags[oBag.id] = {
                            properties: {},
                            texts: {}
                        };
                        oBag.ChipInstanceProperties.results.forEach((oProp) => {
                            if (oProp.translatable === "X") {
                                oVizData.chipConfig.bags[oBag.id].texts[oProp.name] = oProp.value;
                            } else {
                                oVizData.chipConfig.bags[oBag.id].properties[oProp.name] = oProp.value;
                            }
                        });
                    });
                }

                // Map tileProperties bags to text properties
                aChipInstanceBags
                    .filter((bag) => {
                        return bag.id === "tileProperties";
                    })
                    .forEach((oBagWithTextsForTile) => {
                        oBagWithTextsForTile.ChipInstanceProperties.results.forEach((oTextProperty) => {
                            switch (oTextProperty.name) {
                                case "display_title_text":
                                    oVizData.title = oTextProperty.value || oVizData.title; // no override with empty string
                                    break;
                                case "display_subtitle_text":
                                    oVizData.subtitle = oTextProperty.value || oVizData.subtitle; // no override with empty string
                                    break;
                                case "display_info_text":
                                    oVizData.info = oTextProperty.value || oVizData.info; // no override with empty string
                                    break;
                                case "display_search_keywords":
                                    oVizData.searchKeyword = oTextProperty.value;
                                    break;
                                default:
                                    break;
                            }
                        });
                    });

                // Required for custom tiles
                aChipInstanceBags
                    .filter((bag) => {
                        return bag.id === "sb_tileProperties";
                    })
                    .forEach((oBagWithTextsForTile) => {
                        oBagWithTextsForTile.ChipInstanceProperties.results.forEach((oTextProperty) => {
                            switch (oTextProperty.name) {
                                case "title":
                                    oVizData.title = oTextProperty.value;
                                    break;
                                case "description":
                                    oVizData.subtitle = oTextProperty.value;
                                    break;
                                default:
                                    break;
                            }
                        });
                    });
            }
            return oVizData;
        },

        /**
         * Saves the currently applied personalizations.
         *
         * @param {sap.ushell.services.Pages} pagesService The pages service instance.
         * @returns {Promise<undefined>} A promise resolving when the personalizations have been saved.
         * @private
         */
        _savePersonalizations: async function (pagesService) {
            pagesService.enableImplicitSave(true);
            await pagesService.savePersonalization(this.sPageId);
            pagesService.enableImplicitSave(false);
        },

        /**
         * Matches groups to the given array of group ids, by only providing the necessary information for section creation.
         *
         * @param {string[]} groupIds is an array of groupIds from the classic homepage.
         * @returns {object[]} an array of groupInformation objects that contain all necessary data.
         * @private
         */
        _prepareImport: function (groupIds) {
            const mGroups = {};
            const oModel = this._oDialog.getModel();
            const aModelGroups = oModel.getProperty("/groups");
            let mVizData;
            let oVizData;

            aModelGroups.forEach((oGroup) => {
                if (groupIds.indexOf(oGroup.id) === -1) {
                    return;
                }

                mVizData = {};
                oGroup.chips.forEach((oChipInstance) => {
                    oVizData = this._gatherVizDataObjectFromChipInstance(oChipInstance);
                    mVizData[oChipInstance.instanceId] = oVizData;
                });

                oGroup.tiles = [];
                oGroup.tileOrder.forEach((sTileId) => {
                    oVizData = mVizData[sTileId];
                    // Filters Tiles that have no reference chip
                    if (oVizData) {
                        delete mVizData[sTileId];
                        oGroup.tiles.push(oVizData);
                    }
                });
                oGroup.links = [];
                oGroup.linkOrder.forEach((sTileId) => {
                    oVizData = mVizData[sTileId];
                    // Filters Links that have no reference chip
                    if (oVizData) {
                        delete mVizData[sTileId];
                        oVizData.displayFormatHint = DisplayFormat.Compact;
                        oVizData.bUpdateNeeded = true;
                        oGroup.links.push(oVizData);
                    }
                });

                // Layout does not always contain all tiles in a group
                Object.keys(mVizData).forEach((sKey) => {
                    oGroup.tiles.push(mVizData[sKey]);
                });

                mGroups[oGroup.id] = oGroup;
            });

            const aGroups = [];
            let oGroup;

            groupIds.forEach((sGroupId) => {
                oGroup = mGroups[sGroupId];
                if (oGroup) {
                    aGroups.push(oGroup);
                }
            });

            return aGroups;
        },

        /**
         * Creates a shallow copy of the object which only contains supported keys
         * @param {object} oInput The input object
         * @param {string[]} aSupportedProperties a list of supported keys
         * @returns {object} An object which only contains supported properties
         *
         * @since 1.110
         * @private
         */
        _filterNonSupportedProperties: function (oInput, aSupportedProperties) {
            const oResult = {};
            Object.keys(oInput).forEach((sKey) => {
                if (aSupportedProperties.includes(sKey)) {
                    oResult[sKey] = oInput[sKey];
                }
            });
            return oResult;
        }
    });
});
