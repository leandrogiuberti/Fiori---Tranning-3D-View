// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/Log",
    "sap/m/library",
    "sap/m/MessageBox",
    "sap/m/GroupHeaderListItem",
    "sap/ui/core/Element",
    "sap/ui/core/UIComponent",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/Config",
    "sap/ushell/Container",
    "sap/ushell/library",
    "sap/ushell/resources"
], (
    Log,
    mobileLibrary,
    MessageBox,
    GroupHeaderListItem,
    Element,
    UIComponent,
    Filter,
    FilterOperator,
    JSONModel,
    Config,
    Container,
    ushellLibrary,
    resources
) => {
    "use strict";

    // shortcut for sap.m.ButtonType
    const ButtonType = mobileLibrary.ButtonType;

    // shortcut for sap.ushell.ContentNodeType
    const ContentNodeType = ushellLibrary.ContentNodeType;

    // visualizationOrganizer Component
    return UIComponent.extend("sap.ushell.components.visualizationOrganizer.Component", {
        metadata: {
            version: "1.141.1",
            library: "sap.ushell",
            dependencies: { libs: ["sap.m"] },
            properties: {
                pressed: { type: "boolean", group: "Misc", defaultValue: false }
            }
        },

        /**
         * Initializes the VisualizationOrganizer and requests the required data.
         */
        init: function () {
            UIComponent.prototype.init.apply(this, arguments); // call the init function of the parent

            this.aPersonalizablePages = []; // the list of all pages which can be personalized
            this.mVizIdInPages = new Map(); // a vizId map of sets of Pages (to check if a vizId is in a Page)
            this.stVizIdInSection = new Set(); // a set of every viz IDs in Section (used if AppFinder starts within section context)
        },

        /**
         * Requests the Spaces, Pages, and Visualizations data.
         * Populates the Maps and Sets to contain this data in a structured way.
         *
         * @returns {Promise<undefined>} A promise that resolves when the data request and processing is done.
         * @see _fillVizIdMaps
         */
        requestData: function () {
            const bOnlyHomePage = !Config.last("/core/shell/enablePersonalization") && Config.last("/core/spaces/myHome/enabled");
            const sMyHomePageId = Config.last("/core/spaces/myHome/myHomePageId");
            return Container.getServiceAsync("CommonDataModel")
                .then((oCommonDataModelService) => {
                    return oCommonDataModelService.getAllPages();
                })
                .then((aPages) => {
                    if (bOnlyHomePage) {
                        aPages = aPages.filter((oPage) => {
                            return oPage.identification.id === sMyHomePageId;
                        });
                    }
                    this.aPersonalizablePages = aPages.map((oPage) => {
                        return {
                            id: oPage.identification.id,
                            title: oPage.identification.title
                        };
                    });
                    this._fillVizIdMaps(aPages);
                    return this.aPersonalizablePages;
                });
        },

        /**
         * Collects the data from the given Pages and populates "mVizIdInPages".
         * This is used by {@link requestData}.
         *
         * @param {object[]} aPages The Pages to gather data from.
         * @see requestData
         */
        _fillVizIdMaps: function (aPages) {
            this.mVizIdInPages = new Map();
            aPages.forEach((oPage) => {
                Object.keys(oPage.payload.sections).forEach((sId) => {
                    Object.keys(oPage.payload.sections[sId].viz).forEach((vId) => {
                        const vizId = oPage.payload.sections[sId].viz[vId].vizId;
                        if (this.mVizIdInPages.has(vizId)) {
                            this.mVizIdInPages.get(vizId).add(oPage.identification.id);
                        } else {
                            this.mVizIdInPages.set(vizId, new Set([oPage.identification.id]));
                        }
                    });
                });
            });
        },

        /**
         * Check if a visualization is within any Page.
         *
         * @param {string} vizId The vizId of the visualization to check.
         * @param {boolean} [bSectionContext] The flag if AppFinder is started in section context
         * @returns {boolean} Whether the visualization is within some Page (true) or not (false).
         */
        isVizIdPresent: function (vizId, bSectionContext) {
            if (bSectionContext) {
                return this.stVizIdInSection.has(vizId);
            }
            const stPages = this.mVizIdInPages.get(vizId);
            return !!(stPages && stPages.size);
        },

        /**
         * @param {string} vizId The vizId of a visualization.
         * @param {boolean} [bSectionContext] The flag if AppFinder is started in section context
         * @returns {sap.ui.core.URI} The icon that should be used for that visualization "pin" button.
         * @see isVizIdPresent
         */
        formatPinButtonIcon: function (vizId, bSectionContext) {
            return (this.isVizIdPresent(decodeURIComponent(vizId), bSectionContext) ? "sap-icon://accept" : "sap-icon://add");
        },

        /**
         * @param {string} vizId The vizId of a visualization.
         * @param {boolean} [bSectionContext] The flag if AppFinder is started in section context
         * @returns {sap.m.ButtonType} The type that should be used for that visualization "pin" button.
         * @see isVizIdPresent
         */
        formatPinButtonType: function (vizId, bSectionContext) {
            return (this.isVizIdPresent(decodeURIComponent(vizId), bSectionContext) ? ButtonType.Emphasized : ButtonType.Default);
        },

        /**
         * @param {string} vizId The vizId of a visualization.
         * @param {object} [sectionContext] The section context the AppFinder is started in.
         * @returns {sap.m.ButtonType} The tooltip that should be used for that visualization "pin" button.
         * @see isVizIdPresent
         */
        formatPinButtonTooltip: function (vizId, sectionContext) {
            const bIsVizIdPresent = this.isVizIdPresent(decodeURIComponent(vizId), !!sectionContext);

            // No SectionContext
            if (!sectionContext && bIsVizIdPresent) {
                return resources.i18n.getText("EasyAccessMenu_PinButton_Toggled_Tooltip");
            }

            if (!sectionContext && !bIsVizIdPresent) {
                return resources.i18n.getText("EasyAccessMenu_PinButton_UnToggled_Tooltip");
            }

            // SectionContext with sectionID
            if (sectionContext.sectionID && bIsVizIdPresent) {
                return resources.i18n.getText("VisualizationOrganizer.Button.Tooltip.RemoveFromSection");
            }

            if (sectionContext.sectionID && !bIsVizIdPresent) {
                return resources.i18n.getText("VisualizationOrganizer.Button.Tooltip.AddToSection");
            }

            // SectionContext without sectionID
            if (!sectionContext.sectionID && bIsVizIdPresent) {
                return resources.i18n.getText("VisualizationOrganizer.Button.Tooltip.RemoveFromPage", [sectionContext.pageTitle]);
            }

            return resources.i18n.getText("VisualizationOrganizer.Button.Tooltip.AddToPage", [sectionContext.pageTitle]);
        },

        /**
         * @typedef {object} SectionContext Information about page and section if app finder if open in a section scope
         * @property {string} pageID The page ID where a visualization should be changed.
         * @property {string} pageTitle The page title where a visualization should be changed.
         * @property {string} sectionID The section ID where a visualization should be changed.
         * @property {string} sectionTitle The section title where a visualization should be changed.
         */

        /**
         * Collects event data from the given event and calls {@link toggle} with it.
         *
         * @param {sap.ui.base.Event} oEvent The event that raised the "onTilePinButtonClick" handler.
         * @param {SectionContext} [oSectionContext] The section context if the visualization is added to special section.
         * @returns {Promise<undefined>} A promise that resolves when the popover is toggled. Resolves instantly without toggling if the PinButton is busy.
         * @see toggle
         */
        onTilePinButtonClick: function (oEvent, oSectionContext) {
            const oSource = oEvent.getSource();
            const oTileData = oSource.getBindingContext().getProperty();

            if (oSource.getBusy()) {
                return Promise.resolve();
            }

            if (oSectionContext) {
                oSource.setBusy(true);
                return this._applyOrganizationChangeToSection(oSource, oTileData, oSectionContext)
                    .then(() => {
                        oSource.setBusy(false);
                    });
            }

            if (this.aPersonalizablePages.length === 1) {
                oSource.setBusy(true);
                return this._applyChangeToPage(oSource, oTileData, this.aPersonalizablePages[0])
                    .then(() => {
                        oSource.setBusy(false);
                    });
            }

            return this.toggle(oSource, oTileData);
        },

        /**
         * Method to open the visualizationOrganizer popover.
         *
         * @param {sap.ui.core.Control} oOpenBy The ui5 control, the popover should be opened by.
         * @param {object} oVizInfo The information of the visualization, that should be added.
         * @returns {Promise<undefined>} A promise that resolves when the popover opens.
         * @since 1.75.0
         * @protected
         */
        open: function (oOpenBy, oVizInfo) {
            let oPopover = Element.getElementById("sapUshellVisualizationOrganizerPopover");
            let oLoadPopover = Promise.resolve();

            if (!oPopover) {
                oLoadPopover = new Promise((resolve, reject) => {
                    sap.ui.require(["sap/ui/core/Fragment"], (Fragment) => {
                        Fragment.load({
                            name: "sap.ushell.components.visualizationOrganizer.VisualizationOrganizerPopover",
                            type: "XML",
                            controller: this
                        }).then(resolve).catch(reject);
                    });
                }).then((popover) => {
                    oPopover = popover;
                    oPopover.setModel(new JSONModel({ pages: [], searchTerm: "" }));
                    oPopover.setModel(resources.i18nModel, "i18n");
                });
            }

            return oLoadPopover.then(() => {
                this.oOpenBy = oOpenBy;
                this.sVisualizationId = decodeURIComponent(oVizInfo.id);
                this.sVisualizationTitle = oVizInfo.title;
                this.oVizInfo = oVizInfo;
                this.fnResetPopup = this._resetPopup.bind(this);
                oPopover.attachAfterClose(this.fnResetPopup);

                return Promise.all([
                    Container.getServiceAsync("Menu"),
                    Container.getServiceAsync("Pages")
                ]).then((aResults) => {
                    let oPageAssociation;
                    const oMenuService = aResults[0];
                    const oPagesService = aResults[1];
                    if (oVizInfo.isBookmark) {
                        oPageAssociation = oPagesService._findBookmarks({ url: oVizInfo.url })
                            .then((aAssociation) => {
                                const aPageIds = aAssociation.map((oFoundViz) => {
                                    return oFoundViz.pageId;
                                });
                                return Promise.resolve(new Set(aPageIds));
                            });
                    } else {
                        oPageAssociation = this.mVizIdInPages.get(this.sVisualizationId);
                    }

                    return Promise.all([
                        oMenuService.getContentNodes([ContentNodeType.Space, ContentNodeType.Page]),
                        oPageAssociation
                    ]);
                }).then((aResults) => {
                    let aContentNodes = aResults[0];
                    const oPageIds = aResults[1];

                    const bOnlyHomePage = !Config.last("/core/shell/enablePersonalization") && Config.last("/core/spaces/myHome/enabled");
                    const sMyHomeSpaceId = Config.last("/core/spaces/myHome/myHomeSpaceId");
                    const aPages = [];

                    aContentNodes = this._filterPersonalizableContentNodes(aContentNodes);

                    aContentNodes.forEach((oContentNode) => {
                        if (bOnlyHomePage && oContentNode.id !== sMyHomeSpaceId) {
                            // In case of disabled personalization and enabled home page we need to show only home page
                            return;
                        }
                        oContentNode.children.forEach((oChildNode) => {
                            if (!this._isPersonalizablePage(oChildNode.id)) {
                                // We cannot organize visualizations of unknown pages.
                                // So the page is disregarded.
                                return;
                            }
                            aPages.push({
                                id: oChildNode.id,
                                title: oChildNode.label,
                                space: oContentNode.label,
                                spaceId: oContentNode.id,
                                selected: oPageIds && oPageIds.has(oChildNode.id)
                            });
                        });
                    });

                    const oPopoverModel = oPopover.getModel();
                    oPopoverModel.setProperty("/pages", aPages);
                    oPopoverModel.setProperty("/pinnedPages", oPageIds);

                    this._updatePagesList();

                    oPopover.openBy(oOpenBy);
                });
            });
        },

        /**
         * This function assures that only traditional pages which can be personalized are returned.
         * In case a content node shall not be returned because of its type, this node and all of its children get removed from the result.
         * Parent nodes are returned even if they are not of the requested type.
         *
         * @param {ContentNode[]} [aContentNodes] Types of content nodes to be returned.
         *   Defaults to all content node types defined in `sap.ushell.ContentNodeType`.
         * @returns {Promise<ContentNode[]>} Resolves content nodes
         * @private
         * @since 1.107.0
         */
        _filterPersonalizableContentNodes: function (aContentNodes) {
            if (!Array.isArray(aContentNodes)) {
                return [];
            }
            return aContentNodes.reduce((aNodes, oContentNode) => {
                oContentNode.children = this._filterPersonalizableContentNodes(oContentNode.children);
                if (oContentNode.type === ContentNodeType.HomepageGroup || oContentNode.type === ContentNodeType.Space || (oContentNode.type === ContentNodeType.Page && oContentNode.isContainer)) {
                    aNodes.push(oContentNode);
                }
                return aNodes;
            }, []);
        },

        /**
         * Method to close the visualizationOrganizer popover.
         *
         * @since 1.75.0
         * @protected
         */
        cancel: function () {
            const oPopover = Element.getElementById("sapUshellVisualizationOrganizerPopover");
            const oChangedItems = this._retrieveChangedPageIds();

            if (oPopover && oChangedItems.deleteFromPageIds.length === 0 && oChangedItems.addToPageIds.length === 0) {
                oPopover.close();
            } else {
                MessageBox.show(
                    resources.i18n.getText("VisualizationOrganizer.MessageBox.Description"),
                    {
                        id: "sapUshellVisualizationOrganizerDiscardDialog",
                        title: resources.i18n.getText("VisualizationOrganizer.MessageBox.Title"),
                        actions: [resources.i18n.getText("VisualizationOrganizer.MessageBox.ActionDiscard"), MessageBox.Action.CANCEL],
                        emphasizedAction: resources.i18n.getText("VisualizationOrganizer.MessageBox.ActionDiscard"),
                        onClose: function (oAction) {
                            if (oAction === resources.i18n.getText("VisualizationOrganizer.MessageBox.ActionDiscard")) {
                                oPopover.close();
                            }
                        }
                    }
                );
            }
        },

        /**
         * Method to handle the toggling of pin button
         *
         * @param {sap.ui.core.Control} oOpenBy The ui5 control, the popover should be toggled by.
         * @param {object} oVizInfo The information of the visualization, that should be added.
         * @returns {Promise<undefined>} A promise that resolves when the popover is toggled.
         * @since 1.75.0
         * @protected
         */
        toggle: function (oOpenBy, oVizInfo) {
            const oPopover = Element.getElementById("sapUshellVisualizationOrganizerPopover");
            // To really make the visualizationOrganizer toggleable, we need to know the last openBy control.
            if (oPopover && oPopover.isOpen() && oPopover._oOpenBy && oPopover._oOpenBy.getId() === oOpenBy.getId()) {
                this.cancel();
                return Promise.resolve();
            }
            return this.open(oOpenBy, oVizInfo);
        },

        /**
         * Adds and removes visualizations to the specific section of the page and generates a MessageToast.
         *
         * @param {sap.ui.Control} oOpenBy The ui5 control, the popover should be toggled by.
         * @param {object} oVizInfo The information of the visualization, that should be added.
         * @param {SectionContext} oSectionContext The information used to check where a visualization is.
         * @returns {Promise<undefined>} A promise that resolves when the popover is toggled.
         * @since 1.76.0
         * @private
         */
        _applyOrganizationChangeToSection: function (oOpenBy, oVizInfo, oSectionContext) {
            return Container.getServiceAsync("Pages").then((oPageService) => {
                let oVizChangeChain;
                const sVizId = decodeURIComponent(oVizInfo.id);
                const sVisualizationTitle = oVizInfo.title;
                const sPageId = oSectionContext.pageID;
                const sSectionId = oSectionContext.sectionID;
                const sMessageToUser = this._getTextMsgSectionContext(oSectionContext, sVizId, sVisualizationTitle);

                if (this.stVizIdInSection.has(sVizId)) {
                    oVizChangeChain = oPageService.findVisualization(sPageId, sSectionId, sVizId).then((aVisualizationLocations) => {
                        if (aVisualizationLocations.length === 0) {
                            return Promise.resolve();
                        }
                        let oVizDeleteChain;
                        const iPageIndex = oPageService.getPageIndex(sPageId);

                        const aSortedVisualizationsPerSectionIndexes = aVisualizationLocations.sort((a, b) => {
                            return b.sectionIndex - a.sectionIndex;
                        });

                        aSortedVisualizationsPerSectionIndexes.forEach((oVisualizationLocation) => {
                            oVisualizationLocation.vizIndexes.sort((a, b) => {
                                return b - a;
                            });
                        });

                        aSortedVisualizationsPerSectionIndexes.forEach((oVisualizationLocation) => {
                            const iSectionIndex = oVisualizationLocation.sectionIndex;
                            oVisualizationLocation.vizIndexes.forEach((iVizIndex) => {
                                if (!oVizDeleteChain) {
                                    oVizDeleteChain = oPageService.deleteVisualization(iPageIndex, iSectionIndex, iVizIndex);
                                } else {
                                    oVizDeleteChain = oVizDeleteChain.then(() => {
                                        return oPageService.deleteVisualization(iPageIndex, iSectionIndex, iVizIndex);
                                    });
                                }
                            });
                        });
                        return oVizDeleteChain;
                    })
                        .then(() => {
                            this.stVizIdInSection.delete(sVizId);
                        });
                } else {
                    oVizChangeChain = oPageService.addVisualization(sPageId, sSectionId, sVizId).then(() => {
                        this.stVizIdInSection.add(sVizId);
                    });
                }
                return oVizChangeChain.then(() => {
                    oOpenBy.getBinding("icon")?.refresh(true);
                    oOpenBy.getBinding("type")?.refresh(true);
                    oOpenBy.getBinding("tooltip")?.refresh(true);

                    sap.ui.require(["sap/m/MessageToast"], (MessageToast) => {
                        MessageToast.show(sMessageToUser, { offset: "0 -50" });
                    });
                });
            });
        },

        /**
         * Determines what message should be displayed in the MessageToast when a tile is pinned or unpinned.
         *
         * @param {object} oSectionContext The information used to check where a visualization is.
         * @param {string} sVizId The "vizId" of the visualization
         * @param {string} sVisualizationTitle The visualization title
         * @returns {string} A string that contains the message when a tile is pinned or unpinned.
         * @since 1.108
         * @private
         */
        _getTextMsgSectionContext: function (oSectionContext, sVizId, sVisualizationTitle) {
            const sSectionId = oSectionContext.sectionID;
            const sSectionTitle = oSectionContext.sectionTitle;
            const sPageTitle = oSectionContext.pageTitle;

            // sectionID
            if (sSectionId && this.stVizIdInSection.has(sVizId)) {
                return resources.i18n.getText("VisualizationOrganizer.MessageToastSectionContextRemove", [sVisualizationTitle || sVizId, sSectionTitle, sPageTitle]);
            }

            if (sSectionId && !this.stVizIdInSection.has(sVizId)) {
                return resources.i18n.getText("VisualizationOrganizer.MessageToastSectionContextAdd", [sVisualizationTitle || sVizId, sSectionTitle, sPageTitle]);
            }

            // No sectionID
            if (!sSectionId && this.stVizIdInSection.has(sVizId)) {
                return resources.i18n.getText("VisualizationOrganizer.MessageToastPageRemove", [sVisualizationTitle || sVizId, sPageTitle]);
            }

            if (!sSectionId && !this.stVizIdInSection.has(sVizId)) {
                return resources.i18n.getText("VisualizationOrganizer.MessageToastPageAdd", [sVisualizationTitle || sVizId, sPageTitle]);
            }
        },

        /**
         * Adds and removes visualizations to the selected Spaces/Pages and generates a MessageToast.
         *
         * @param {sap.ui.base.Event} oEvent The before close event of the popup.
         * @returns {Promise<undefined>} A promise that resolves when the visualization organization is done.
         * @see _applyOrganizationChange
         * @since 1.75.0
         * @private
         */
        _organizeVisualizations: function () {
            const oChangedItems = this._retrieveChangedPageIds();
            if (this.oVizInfo.isBookmark) {
                return this._applyBookmarkOrganizationChange(oChangedItems, true);
            }
            return this._applyOrganizationChange(oChangedItems, true);
        },

        /**
         * @typedef {object} VisualizationChanges Collected changes done for a visualization in a "sapUshellVisualizationOrganizerPopover".
         * @property {string[]} addToPageIds The page ids of the pages the visualization should be added to.
         * @property {string[]} deleteFromPageIds The page ids of the pages the visualization should be deleted from.
         */

        /**
         * Applies the given visualization organization changes.
         * This is used by {@link _organizeVisualizations}.
         * When done, shows a {@link sap.m.MessageToast} informing the total number of organized visualizations.
         *
         * @param {VisualizationChanges} oVisualizationChanges The items representing where a visualization should be added and deleted.
         * @param {boolean} bShowMessage If true the MessageToast is shown
         * @returns {Promise<undefined>} A promise that resolves after every organization change.
         * @see _organizeVisualizations
         */
        _applyOrganizationChange: function (oVisualizationChanges, bShowMessage) {
            const iChangedVisualizations = (oVisualizationChanges.addToPageIds.length + oVisualizationChanges.deleteFromPageIds.length);
            if (!iChangedVisualizations) {
                return Promise.resolve();
            }
            const sVizId = this.sVisualizationId;
            const oOpenBy = this.oOpenBy;
            const stAlreadyRemovedFromPageId = new Set();
            let oPagesService;
            let oVizChangeChain = Container.getServiceAsync("Pages").then((PagesService) => {
                oPagesService = PagesService;
            });

            oVisualizationChanges.deleteFromPageIds.forEach((sPageId) => {
                if (!stAlreadyRemovedFromPageId.has(sPageId)) {
                    stAlreadyRemovedFromPageId.add(sPageId);
                    oVizChangeChain = oVizChangeChain.then(() => {
                        return oPagesService.findVisualization(sPageId, null, sVizId).then((aVizLocations) => {
                            const aPromises = [];

                            for (let iNrOfSections = aVizLocations.length - 1; iNrOfSections >= 0; iNrOfSections--) {
                                const oVizLocation = aVizLocations[iNrOfSections];
                                const iPageIndex = oPagesService.getPageIndex(oVizLocation.pageId);
                                for (let iNrOfViz = oVizLocation.vizIndexes.length - 1; iNrOfViz >= 0; iNrOfViz--) {
                                    const iVizIndex = oVizLocation.vizIndexes[iNrOfViz];
                                    aPromises.push(oPagesService.deleteVisualization(iPageIndex, oVizLocation.sectionIndex, iVizIndex));
                                }
                            }

                            return Promise.all(aPromises);
                        });
                    });
                }
                this.mVizIdInPages.get(sVizId).delete(sPageId);
            });

            oVisualizationChanges.addToPageIds.forEach((sPageId) => {
                oVizChangeChain = oVizChangeChain.then(() => {
                    return oPagesService.addVisualization(sPageId, null, sVizId);
                });
                if (this.mVizIdInPages.has(sVizId)) {
                    this.mVizIdInPages.get(sVizId).add(sPageId);
                } else {
                    this.mVizIdInPages.set(sVizId, new Set([sPageId]));
                }
            });

            return oVizChangeChain.then(() => {
                if (oOpenBy) {
                    oOpenBy.getBinding("icon")?.refresh(true);
                    oOpenBy.getBinding("type")?.refresh(true);
                    oOpenBy.getBinding("tooltip")?.refresh(true);
                }
                if (bShowMessage) {
                    sap.ui.require(["sap/m/MessageToast"], (MessageToast) => {
                        MessageToast.show(resources.i18n.getText("VisualizationOrganizer.MessageToast"));
                    });
                }
            });
        },

        /**
         * Resets the changes to the content of the popover.
         *
         * @param {sap.ui.base.Event} oEvent The after close event of the popup.
         * @since 1.75.0
         * @private
         */
        _resetPopup: function (oEvent) {
            const oPopover = Element.getElementById("sapUshellVisualizationOrganizerPopover");
            const oPagesList = Element.getElementById("sapUshellVisualizationOrganizerSpacesList");
            const oSearchField = Element.getElementById("sapUshellVisualizationOrganizerSearch");
            const oToggleButton = Element.getElementById("sapUshellVisualizationOrganizerSelectedPages");

            oPopover.detachAfterClose(this.fnResetPopup);

            oSearchField.setValue("");
            oToggleButton.setType(ButtonType.Default);

            oPagesList.getBinding("items").filter(null);
            oPagesList.removeSelections();

            delete this.fnResetPopup;
            delete this.sVisualizationId;
            delete this.sVisualizationTitle;
        },

        /**
         * Handles the List selectionChange event.
         * The selection should also change for all items with the same pageId.
         *
         * @param {sap.ui.base.Event} event The press event.
         * @since 1.82.0
         * @private
         */
        onSelectionChange: function (event) {
            const oSLI = event.getParameter("listItem");
            const bSelected = event.getParameter("selected");
            this._changeSelectionForAllPagesWithTheSamePageId(oSLI, bSelected);
        },

        /**
         * Change the selection of the given page item and all items that have the same pageId.
         *
         * @param {sap.m.StandardListItem} item The selected page item.
         * @param {boolean} [selected] Whether the items should be selected (or deselected);
         *   When this parameter is not given, selection will be toggled (deselected, if selected, and selected if deselected)
         * @since 1.82.0
         * @private
         */
        _changeSelectionForAllPagesWithTheSamePageId: function (item, selected) {
            const oModel = item.getModel();
            const oContext = item.getBindingContext();
            const sId = oContext.getProperty("id");
            const bSelect = (selected !== undefined) ? selected : !oContext.getProperty("selected");

            const aPages = oModel.getProperty("/pages");
            for (let index = 0; index < aPages.length; index++) {
                const oPage = aPages[index];
                if (oPage.id === sId) {
                    oPage.selected = bSelect;
                }
            }
            oModel.setProperty("/pages", aPages);
        },

        /**
         * Filters the list of Spaces.
         *
         * @param {sap.ui.base.Event} oEvent The search event.
         * @since 1.75.0
         * @private
         */
        _onSearch: function (oEvent) {
            const oSelectedPagesButton = Element.getElementById("sapUshellVisualizationOrganizerSelectedPages");
            let bPressed = this.getPressed();

            if (oEvent.sId === "press") {
                bPressed = !bPressed;
                this.setPressed(bPressed);
                oSelectedPagesButton.setPressed(bPressed);
            }
            this._updatePagesList();
        },

        _updatePagesList: function () {
            const oPagesList = Element.getElementById("sapUshellVisualizationOrganizerSpacesList");
            const oSearchField = Element.getElementById("sapUshellVisualizationOrganizerSearch");
            const oBinding = oPagesList.getBinding("items");
            const sSearchValue = oSearchField.getValue();
            const bToggleActive = this.getPressed();

            if (bToggleActive) {
                oBinding.filter(new Filter({
                    filters: [
                        new Filter({
                            filters: [
                                new Filter({
                                    path: "title",
                                    operator: FilterOperator.Contains,
                                    value1: sSearchValue
                                }),
                                new Filter({
                                    path: "selected",
                                    operator: FilterOperator.EQ,
                                    value1: bToggleActive
                                })
                            ],
                            and: true
                        }),
                        new Filter({
                            filters: [
                                new Filter({
                                    path: "space",
                                    operator: FilterOperator.Contains,
                                    value1: sSearchValue
                                }),
                                new Filter({
                                    path: "selected",
                                    operator: FilterOperator.EQ,
                                    value1: bToggleActive
                                })
                            ],
                            and: true
                        })
                    ],
                    and: false
                }));
            } else {
                oBinding.filter(new Filter({
                    filters: [
                        new Filter({
                            path: "title",
                            operator: FilterOperator.Contains,
                            value1: sSearchValue
                        }),
                        new Filter({
                            path: "space",
                            operator: FilterOperator.Contains,
                            value1: sSearchValue
                        })
                    ],
                    and: false
                }));
            }

            if (oBinding.getLength() === 0) { // Adjust empty list of pages message in case all pages are filtered out.
                oPagesList.setNoDataText(resources.i18n.getText(sSearchValue
                    ? "VisualizationOrganizer.PagesList.NoResultsText"
                    : "VisualizationOrganizer.PagesList.NoDataText"
                ));
            }
        },

        /**
         * @typedef {object} NavigationScopeFilter Information used to check where a visualization exists.
         * @property {set} pageID The page IDs where a visualization exists.
         * @property {set} sectionID The section IDs where a visualization exists.
         */

        /**
         * Requests the visualizations data for the given section of the given page and
         * updates the sets with new data or cleans the set if page or section are not found.
         *
         * @param {NavigationScopeFilter} oContext Navigation context. If there is no pageID or sectionID, promise resolves null.
         * @returns {Promise<SectionContext|null>} A promise that resolves when the data request and processing is done.
         * @see _fillVizIdMaps
         */
        loadSectionContext: function (oContext) {
            this.stVizIdInSection.clear();
            if (!oContext || !oContext.pageID) {
                return Promise.resolve(null);
            }

            return Container.getServiceAsync("Pages").then((oPageService) => {
                const sPageId = decodeURIComponent(oContext.pageID);
                const sSelectedSectionId = oContext.sectionID ? decodeURIComponent(oContext.sectionID) : "";

                return oPageService.loadPage(sPageId)
                    .then((sPagePath) => {
                        const oPage = oPageService.getModel().getProperty(sPagePath);
                        const oSectionContext = this._createSectionContext(oPage, sSelectedSectionId);

                        return oSectionContext;
                    })
                    .catch(() => {
                        Log.warning(`${sPageId} cannot be loaded. Please, check the id of the page.`);
                        return Promise.resolve(null);
                    });
            });
        },

        /**
         * Constructs and returns the section context object based on if the sectionID parameter is set or not in the URL
         *
         * @param {object} oPage The page object.
         * @param {string} sSelectedSectionId the sectionID URL Parameter.
         * @returns {SectionContext} the section context object
         * @since 1.108
         * @private
         */
        _createSectionContext: function (oPage, sSelectedSectionId) {
            const aPageSections = oPage.sections;
            let oSelectedSection;

            if (sSelectedSectionId) {
                // sectionID parameter is set in the URL
                oSelectedSection = aPageSections.find((oSection) => {
                    return oSection.id === sSelectedSectionId;
                });

                this._initVizIdsInSection(oSelectedSection);

                return {
                    pageID: oPage.id,
                    sectionID: sSelectedSectionId,
                    pageTitle: oPage.title,
                    sectionTitle: oSelectedSection.title
                };
            }

            // sectionID parameter is not set in the URL
            aPageSections.forEach((oSection) => {
                this._initVizIdsInSection(oSection);
            });

            return {
                pageID: oPage.id,
                sectionID: sSelectedSectionId,
                pageTitle: oPage.title
            };
        },

        /**
         * Add every VizIds contained in the Section into the Set stVizIdInSection
         *
         * @param {object} oSection The section object.
         * @since 1.108
         * @private
         */

        _initVizIdsInSection: function (oSection) {
            oSection.visualizations.forEach((oVisualization) => {
                this.stVizIdInSection.add(oVisualization.vizId);
            });
        },

        /**
         * Get the list of all personalizable pages
         *
         * @returns {pageInfo[]} the list of personalizable pages
         */
        getPersonalizablePages: function () {
            return this.aPersonalizablePages;
        },

        /**
         * Check whether a page is personalizable
         *
         * @param {string} sPageId The id of the page
         * @returns {boolean} Whether the page is personalizable
         * @since 1.105.0
         * @private
         */
        _isPersonalizablePage: function (sPageId) {
            const iIndex = this.aPersonalizablePages.findIndex((oPage) => {
                return oPage.id === sPageId;
            });
            return iIndex > -1;
        },

        _retrieveChangedPageIds: function () {
            const oPagesList = Element.getElementById("sapUshellVisualizationOrganizerSpacesList");
            const oSearchField = Element.getElementById("sapUshellVisualizationOrganizerSearch");
            const oPopoverModel = oPagesList.getModel();
            const stInitialPages = oPopoverModel.getProperty("/pinnedPages") || new Set();

            // reset the filter, as some selected items might be hidden
            oPagesList.getBinding("items").filter(null);

            // filter groupHeaderItems (spaces) out of the result.
            const aItems = oPagesList.getItems().filter((oItem) => {
                return oItem.isA("sap.m.StandardListItem");
            });

            // re-apply the filter
            oSearchField.fireSearch();

            // Map to prevent duplicates.
            const mAlreadyOrganizedPageIds = {};
            const aAddToPageIds = [];
            const aDeleteFromPageIds = [];

            aItems.forEach((oItem) => {
                const sItemId = oItem.getBindingContext().getProperty("id");

                if (!mAlreadyOrganizedPageIds[sItemId]) {
                    mAlreadyOrganizedPageIds[sItemId] = true;
                    if (oItem.getSelected() && !stInitialPages.has(sItemId)) {
                        aAddToPageIds.push(sItemId);
                    } else if (!oItem.getSelected() && stInitialPages.has(sItemId)) {
                        aDeleteFromPageIds.push(sItemId);
                    }
                }
            });

            return {
                addToPageIds: aAddToPageIds,
                deleteFromPageIds: aDeleteFromPageIds
            };
        },

        okay: function () {
            const oPopover = Element.getElementById("sapUshellVisualizationOrganizerPopover");
            // Prevent multiple add clicks
            if (oPopover.getBusy()) {
                return;
            }

            oPopover.setBusy(true);

            this._organizeVisualizations()
                .then(() => {
                    oPopover.setBusy(false);
                    oPopover.close();
                })
                .catch((oError) => {
                    Log.error("Could not save the selected pages on the VisualizationOrganizerPopover", oError);
                });
        },

        /**
         * Collects event data from the given event and calls {@link toggle} with it.
         *
         * @param {sap.ui.base.Event} oEvent The event that raised by click.
         * @param {SectionContext} [oSectionContext] The section context if the visualization is added to special section.
         * @returns {Promise<boolean>} A promise that resolves when the popover is closed.
         *   The promise resolves true if the pin button should be updated.
         *   Resolves instantly without toggling if the PinButton is busy.
         * @see toggle
         */
        onHierarchyAppsPinButtonClick: function (oEvent, oSectionContext) {
            const oSource = oEvent.getSource();
            const oAppInfo = oSource.getParent().getBinding("title").getContext().getObject();

            if (oSource.getBusy()) {
                return Promise.resolve(false);
            }

            oAppInfo.isBookmark = true;
            oAppInfo.title = oAppInfo.text;

            if (oSectionContext) {
                oSource.setBusy(true);
                return this._applyBookmarkTileChangeToSection(oAppInfo, oSectionContext)
                    .then(() => {
                        oSource.setBusy(false);
                        return Promise.resolve(true);
                    });
            }

            if (this.aPersonalizablePages.length === 1) {
                oSource.setBusy(true);
                return this._applyChangeToPage(oSource, oAppInfo, this.aPersonalizablePages[0])
                    .then(() => {
                        oSource.setBusy(false);
                        return Promise.resolve(true);
                    });
            }

            return new Promise((fnResolve) => {
                this.toggle(oSource, oAppInfo)
                    .then(() => {
                        const oPopover = Element.getElementById("sapUshellVisualizationOrganizerPopover");
                        if (oPopover && oPopover.isOpen()) {
                            oPopover.attachEventOnce("afterClose", () => {
                                // update pin button
                                fnResolve(true);
                            });
                        } else {
                            // close the dialog by click
                            fnResolve(false);
                        }
                    });
            });
        },

        /**
         * Applies the given visualization organization changes for bookmark viz.
         * This is used by {@link _organizeVisualizations}.
         * When done, shows a {@link sap.m.MessageToast} informing the total number of organized visualizations.
         *
         * @param {VisualizationChanges} oVisualizationChanges The items representing where a visualization should be added and deleted.
         * @param {boolean} bShowMessage If true the MessageToast is shown
         * @returns {Promise<undefined>} A promise that resolves after every organization change.
         * @see _organizeVisualizations
         */
        _applyBookmarkOrganizationChange: function (oVisualizationChanges, bShowMessage) {
            const iChangedVisualizations = (oVisualizationChanges.addToPageIds.length + oVisualizationChanges.deleteFromPageIds.length);
            if (!iChangedVisualizations) {
                return Promise.resolve();
            }
            const oVizInfo = this.oVizInfo;
            const stAlreadyRemovedFromPageId = new Set();
            let oBookmarkService;
            let oPagesService;
            let oVizChangeChain = Promise.all([
                Container.getServiceAsync("BookmarkV2"),
                Container.getServiceAsync("Pages")
            ]).then((aServices) => {
                oBookmarkService = aServices[0];
                oPagesService = aServices[1];
                return Promise.resolve();
            });

            // Bookmark service support only deletion of the bookmark tiles for all pages
            // and it is not possible to delete on the specific page.
            // For this reason we need to use Pages service directly.
            oVisualizationChanges.deleteFromPageIds.forEach((sPageId) => {
                if (!stAlreadyRemovedFromPageId.has(sPageId)) {
                    stAlreadyRemovedFromPageId.add(sPageId);
                    oVizChangeChain = oVizChangeChain.then(() => {
                        return oPagesService.deleteBookmarks({ url: oVizInfo.url }, sPageId);
                    });
                }
            });

            oVisualizationChanges.addToPageIds.forEach((sPageId) => {
                oVizChangeChain = oVizChangeChain.then(() => {
                    const oVisualization = {
                        url: oVizInfo.url,
                        title: oVizInfo.text,
                        subtitle: oVizInfo.subtitle,
                        icon: oVizInfo.icon
                    };
                    const oContainer = {
                        type: ushellLibrary.ContentNodeType.Page,
                        id: sPageId,
                        isContainer: true
                    };
                    return oBookmarkService.addBookmark(oVisualization, oContainer);
                });
            });

            return oVizChangeChain.then(() => {
                if (bShowMessage) {
                    sap.ui.require(["sap/m/MessageToast"], (MessageToast) => {
                        MessageToast.show(resources.i18n.getText("VisualizationOrganizer.MessageToast"));
                    });
                }
            });
        },

        /**
         * Adds and removes bookmark tiles to the specific section of the page and generates a MessageToast.
         *
         * @param {object} oVizInfo The information of the visualization, that should be added.
         * @param {SectionContext} oSectionContext The information used to check where a visualization is.
         * @returns {Promise<undefined>} A promise that resolves when the popover is toggled.
         * @since 1.84.1
         * @private
         */
        _applyBookmarkTileChangeToSection: function (oVizInfo, oSectionContext) {
            return Container.getServiceAsync("Pages").then((oPageService) => {
                let oVizChangeChain;
                let sMessageToUser;
                const sUrl = oVizInfo.url;
                const sVisualizationTitle = oVizInfo.title;
                const sPageId = oSectionContext.pageID;
                const sSectionId = oSectionContext.sectionID;

                if (oVizInfo.bookmarkCount > 0) {
                    sMessageToUser = resources.i18n.getText(
                        "VisualizationOrganizer.MessageToastSectionContextRemove",
                        [sVisualizationTitle, oSectionContext.sectionTitle, oSectionContext.pageTitle]
                    );
                    oVizChangeChain = oPageService.deleteBookmarks({ url: sUrl }, sPageId, sSectionId);
                } else {
                    const oVisualization = {
                        url: sUrl,
                        title: oVizInfo.text,
                        subtitle: oVizInfo.subtitle,
                        icon: oVizInfo.icon
                    };
                    sMessageToUser = resources.i18n.getText(
                        "VisualizationOrganizer.MessageToastSectionContextAdd",
                        [sVisualizationTitle, oSectionContext.sectionTitle, oSectionContext.pageTitle]
                    );
                    oVizChangeChain = oPageService.addBookmarkToPage(sPageId, oVisualization, sSectionId);
                }
                return oVizChangeChain.then(() => {
                    sap.ui.require(["sap/m/MessageToast"], (MessageToast) => {
                        MessageToast.show(sMessageToUser, { offset: "0 -50" });
                    });
                });
            });
        },

        /**
         * Calculate the bookmarkCount for the applications in User Menu and SAP Menu
         *
         * @param {object} aAppsData The information of the application, that should be added.
         * @param {SectionContext} oSectionContext The information used to check where a visualization is.
         * @returns {Promise<object>} A promise that resolves updated aAppsData with bookmarkCount.
         * @since 1.84.1
         * @private
         */
        updateBookmarkCount: function (aAppsData, oSectionContext) {
            return Container.getServiceAsync("Pages")
                .then((PagesService) => {
                    const aCountPromises = aAppsData.map((oAppData) => {
                        return PagesService._findBookmarks({ url: oAppData.url })
                            .then((aFoundBookmarks) => {
                                if (oSectionContext) {
                                    aFoundBookmarks = aFoundBookmarks.filter((oBookmark) => {
                                        return oSectionContext.pageID === oBookmark.pageId && oSectionContext.sectionID === oBookmark.sectionId;
                                    });
                                }
                                oAppData.bookmarkCount = aFoundBookmarks.length;
                                return oAppData;
                            });
                    });
                    return Promise.all(aCountPromises);
                });
        },

        /**
         * @param {int} bookmarkCount The count of existing bookmarks.
         * @param {object} [sectionContext] The section context the AppFinder is started in.
         * @returns {sap.m.ButtonType} The tooltip that should be used for that visualization "pin" button.
         * @see isVizIdPresent
         */
        formatBookmarkPinButtonTooltip: function (bookmarkCount, sectionContext) {
            let sText;

            if (sectionContext) {
                if (bookmarkCount > 0) {
                    sText = "VisualizationOrganizer.Button.Tooltip.RemoveFromSection";
                } else {
                    sText = "VisualizationOrganizer.Button.Tooltip.AddToSection";
                }
            } else if (bookmarkCount > 0) {
                sText = "EasyAccessMenu_PinButton_Toggled_Tooltip";
            } else {
                sText = "EasyAccessMenu_PinButton_UnToggled_Tooltip";
            }

            return resources.i18n.getText(sText);
        },

        /**
         * @typedef {object} PageInfo Information about a page.
         * @property {set} id The page id.
         * @property {set} title The page title.
         */

        /**
         * Adds or removes visualizations to the specific page and generates a MessageToast.
         *
         * @param {sap.ui.Control} oOpenBy The ui5 control, the popover should be toggled by.
         * @param {object} oVizInfo The information of the visualization, that should be added.
         * @param {PageInfo} oPage The information about the page.
         * @returns {Promise<undefined>} A promise that resolves when the popover is toggled.
         * @since 1.90.0
         * @private
         */
        _applyChangeToPage: function (oOpenBy, oVizInfo, oPage) {
            const sVisualizationId = decodeURIComponent(oVizInfo.id);
            const sVisualizationTitle = oVizInfo.title;
            const sPageId = oPage.id;
            const bIsVizIdPresented = oVizInfo.isBookmark ? oVizInfo.bookmarkCount > 0 : this.isVizIdPresent(sVisualizationId);
            const oVisualizationChanges = {
                addToPageIds: bIsVizIdPresented ? [] : [sPageId],
                deleteFromPageIds: bIsVizIdPresented ? [sPageId] : []
            };
            const sMessageToUser = resources.i18n.getText(
                bIsVizIdPresented ? "VisualizationOrganizer.MessageToastPageRemove" : "VisualizationOrganizer.MessageToastPageAdd",
                [sVisualizationTitle || sVisualizationId, oPage.title]
            );

            this.oVizInfo = oVizInfo;
            this.sVisualizationId = sVisualizationId;
            let oChangePromise;
            if (oVizInfo.isBookmark) {
                oChangePromise = this._applyBookmarkOrganizationChange(oVisualizationChanges, false);
            } else {
                oChangePromise = this._applyOrganizationChange(oVisualizationChanges, false);
            }

            return oChangePromise.then(() => {
                oOpenBy.getBinding("icon")?.refresh(true);
                oOpenBy.getBinding("type")?.refresh(true);
                oOpenBy.getBinding("tooltip")?.refresh(true);

                sap.ui.require(["sap/m/MessageToast"], (MessageToast) => {
                    MessageToast.show(sMessageToUser, { offset: "0 -50" });
                });
            });
        },

        /**
         * Grouper function to group pages by spaceTitle.
         * Since spaces can have the same title, the spaceId needs to be taken into account.
         *
         * @param {object} binding The binding object.
         * @returns {{key: string, title: string}} A map containing key and title.
         */
        groupBySpace: function (binding) {
            return {
                key: binding.getProperty("spaceId"),
                title: binding.getProperty("space")
            };
        },

        /**
         * Get a group header for each space.
         *
         * @param {{key: string, title: string}} spaceProperties A map containing key and title.
         * @returns {sap.m.GroupHeaderListItem} The group header list item.
         */
        getGroupHeader: function (spaceProperties) {
            return new GroupHeaderListItem({
                title: spaceProperties.title
            });
        },

        exit: function () {
            const oPopover = Element.getElementById("sapUshellVisualizationOrganizerPopover");
            if (oPopover) {
                oPopover.destroy();
            }
        }
    });
});
