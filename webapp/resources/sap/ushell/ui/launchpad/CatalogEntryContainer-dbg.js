// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/Log",
    "sap/ui/core/Control",
    // css style dependency
    "sap/ushell/library",
    "sap/ushell/resources",
    "sap/ushell/ui/launchpad/TileContainerUtils",
    "sap/ushell/Container"
], (
    Log,
    Control,
    ushellLibrary,
    resources,
    TileContainerUtils,
    Container
) => {
    "use strict";

    /**
     * @alias sap.ushell.ui.launchpad.CatalogEntryContainer
     * @class
     *
     * @extends sap.ui.core.Control
     *
     * @private
     */
    const CatalogEntryContainer = Control.extend("sap.ushell.ui.launchpad.CatalogEntryContainer", /** @lends sap.ushell.ui.launchpad.CatalogEntryContainer.prototype */{
        metadata: {
            library: "sap.ushell",
            properties: {
                header: { type: "string", group: "Appearance", defaultValue: null },
                catalogSearchTerm: { type: "string", group: "Appearance", defaultValue: null },
                catalogTagSelector: { type: "object", group: "Appearance", defaultValue: null }
            },
            aggregations: {
                appBoxesContainer: { type: "sap.ushell.ui.appfinder.AppBoxInternal", multiple: true },
                customTilesContainer: { type: "sap.ushell.ui.launchpad.Tile", multiple: true }
            }
        },
        renderer: {
            apiVersion: 2,
            render: function (rm, catalogEntryContainer) {
                // WRAPPER start
                rm.openStart("div", catalogEntryContainer);
                rm.attr("aria-labeledby", `${catalogEntryContainer.getId()}-title`);
                rm.attr("role", "group");
                rm.class("sapUshellTileContainer");
                rm.class("sapUshellCatalogTileContainer");
                rm.openEnd(); // div - tag

                // CONTENT start
                rm.openStart("div");
                rm.class("sapUshellTileContainerContent");
                rm.attr("tabindex", "-1");
                rm.openEnd(); // div - tag

                let sHeaders = catalogEntryContainer.getHeader();
                if (sHeaders) {
                    if (resources.i18n.hasText(sHeaders)) {
                        sHeaders = resources.i18n.getText(sHeaders);
                    }

                    // Title
                    rm.openStart("div");
                    rm.class("sapUshellTileContainerHeader");
                    rm.class("sapUshellCatalogTileContainerHeader");
                    rm.attr("id", `${catalogEntryContainer.getId()}-groupheader`);
                    rm.openEnd(); // div - tag

                    rm.openStart("div");
                    rm.class("sapUshellCatalogTileContainerHeaderInner");
                    rm.attr("id", `${catalogEntryContainer.getId()}-title`);
                    rm.openEnd(); // div - tag

                    rm.openStart("h2");
                    rm.class("sapUshellContainerTitle");
                    rm.class("sapUshellCatalogContainerTitle");
                    rm.attr("title", sHeaders);
                    rm.attr("aria-level", "2");
                    rm.openEnd(); // h2 - tag
                    rm.text(sHeaders);
                    rm.close("h2");

                    rm.close("div");

                    // Title END
                    rm.close("div");
                }

                const aAppBoxesContainers = catalogEntryContainer.getAppBoxesContainer();
                let iIndex;

                const aCustomTilesContainers = catalogEntryContainer.getCustomTilesContainer();

                if (aAppBoxesContainers.length > 0 || aCustomTilesContainers.length > 0) {
                    // INNER CONTENT start
                    rm.openStart("ul");
                    rm.class("sapUshellInner");
                    rm.openEnd(); // ul - tag

                    // Tiles rendering and checking if there is at least one visible Tile
                    for (iIndex = 0; iIndex < aAppBoxesContainers.length; iIndex++) {
                        rm.renderControl(aAppBoxesContainers[iIndex]);
                    }

                    // ============= Custom Tiles ==============

                    if (aAppBoxesContainers.length && aCustomTilesContainers.length) {
                        // break custom tiles into a new line
                        rm.voidStart("br");
                        rm.voidEnd();
                    }

                    for (iIndex = 0; iIndex < aCustomTilesContainers.length; iIndex++) {
                        rm.renderControl(aCustomTilesContainers[iIndex]);
                    }

                    // INNER CONTENT end
                    rm.close("ul");
                }

                // CONTENT end
                rm.close("div");

                // WRAPPER end
                rm.close("div");
            }
        }
    });

    CatalogEntryContainer.prototype.setAfterHandleElements = function (fnCallback) {
        this.onAfterHandleElements = fnCallback;
    };

    CatalogEntryContainer.prototype.onAfterUpdate = function (fnCallback) {
        this.fnCallback = fnCallback;
    };

    CatalogEntryContainer.prototype.updateAggregation = function (sReason) {
        Log.debug("Updating CatalogEntryContainer. Reason: ", sReason);
    };

    CatalogEntryContainer.prototype.addNewItem = function (elementToDisplay, sName) {
        // in case catalogStatus is full. and newItem added, it means that the user alreay see this catalog fully,
        // and most likly can see the next catalog.
        // in that can ignore the allocation and add the data to that catalog, this in to next page, this is data that is already displaied.
        if (this.catalogState[sName] !== "full" && this.getAllocatedUnits && !this.getAllocatedUnits()) {
            // this state indicates that this catalog is rendered parially due to units allocations,
            // we will need to complite the loading once we have more allocations.
            this.catalogState[sName] = "partial";
            return false;
        }

        // TO-DO do not forget Move it to the controller of the catalog as a callback.
        // This code should be in the controller of the view, TODO make a callback from the controller, very like the calculater
        // This code bind between the view and the tile, It is here to improve performance.
        if (sName === "customTilesContainer") {
            const elementToDisplaySrc = elementToDisplay.getObject && elementToDisplay.getObject().src;
            if (elementToDisplaySrc !== undefined) {
                let oContract;
                if (elementToDisplaySrc.Chip !== undefined && elementToDisplaySrc.Chip.getContract !== undefined) {
                    oContract = elementToDisplaySrc.Chip.getContract("preview");
                } else if (elementToDisplaySrc.getContract !== undefined) {
                    oContract = elementToDisplaySrc.getContract("preview");
                }
                if (oContract !== undefined) {
                    oContract.setEnabled(true);
                }
            }

            Container.getServiceAsync("FlpLaunchPage").then((oLaunchpageService) => {
                oLaunchpageService.getCatalogTileViewControl(elementToDisplay.getProperty("src")).done(
                    (catalogTileView) => {
                        elementToDisplay.getModel().setProperty(`${elementToDisplay.getPath()}/content`, [catalogTileView]);
                    }
                );
            });
        }

        const oNewCatalog = TileContainerUtils.createNewItem.bind(this)(elementToDisplay, sName);
        TileContainerUtils.addNewItem.bind(this)(oNewCatalog, sName);

        const aItems = (sName === "appBoxesContainer") ? this.getAppBoxesContainer() : this.getCustomTilesContainer();
        const sPath = elementToDisplay.getPath();
        this.indexingMaps[sName].onScreenPathIndexMap[sPath] = { aItemsRefrenceIndex: aItems.length - 1, isVisible: true };

        return true;
    };

    CatalogEntryContainer.prototype.getNumberResults = function (/* sReason */) {
        return {
            nAppboxes: this.nNumberOfVisibleElements.appBoxesContainer,
            nCustom: this.nNumberOfVisibleElements.customTilesContainer
        };
    };

    CatalogEntryContainer.prototype.handleElements = function (sReason) {
        const sName = sReason;
        const oBinding = this.mBindingInfos[sName].binding;
        const aBindingContexts = oBinding.getContexts();
        let aItems;

        if (!this.catalogState) {
            this.catalogState = {};
        }

        if (!this.catalogState[sReason]) {
            this.catalogState[sReason] = "start";
        }

        if (!this.indexingMaps) {
            this.indexingMaps = {};
        }

        if (!this.nNumberOfVisibleElements) {
            this.nNumberOfVisibleElements = [];
        }
        if (!this.nNumberOfVisibleElements.customTilesContainer) {
            this.nNumberOfVisibleElements.customTilesContainer = 0;
        }

        if (!this.nNumberOfVisibleElements.appBoxesContainer) {
            this.nNumberOfVisibleElements.appBoxesContainer = 0;
        }

        if (!this.filters) {
            this.filters = {};
        }

        aItems = (sName === "appBoxesContainer") ? this.getAppBoxesContainer() : this.getCustomTilesContainer();

        // index the on screen elements according to the path
        this.indexingMaps[sName] = TileContainerUtils.indexOnScreenElements(aItems, false);

        // search for the missing filtered elements
        const indexSearchMissingFilteredElem = TileContainerUtils.markVisibleOnScreenElementsSearchCatalog(
            aBindingContexts, this.indexingMaps[sName], true);

        // add the missing elements and check if there is a need for header.
        if (TileContainerUtils.createMissingElementsInOnScreenElementsSearchCatalog(
            this.indexingMaps[sName],
            aBindingContexts,
            indexSearchMissingFilteredElem,
            this.addNewItem.bind(this),
            aItems,
            this.filters[sName],
            sName,
            this.processFiltering.bind(this)
        )) {
            // this state indicates that we rendered all the available tiles for this catalog.
            if (this.getAllocatedUnits && this.getAllocatedUnits()) {
                this.catalogState[sReason] = "full";
            }
        }

        aItems = (sName === "appBoxesContainer") ? this.getAppBoxesContainer() : this.getCustomTilesContainer();

        // show/hide all the tiles
        const oShowHideReturnObject = TileContainerUtils.showHideTilesAndHeaders(this.indexingMaps[sName], aItems);

        this.nNumberOfVisibleElements[sName] = oShowHideReturnObject.nCountVisibleElements;

        if (this.fnCallback) {
            this.fnCallback(this);
        }

        if (this.onAfterHandleElements) {
            this.onAfterHandleElements(this);
        }
    };

    CatalogEntryContainer.prototype.processFiltering = function (entry, sName) {
        const sPath = entry.getPath();

        if (sName) {
            const indexEntry = this.indexingMaps[sName].onScreenPathIndexMap[sPath];
            if (indexEntry.isVisible && this.currElementVisible) {
                this.currElementVisible();
            }
        }
    };

    return CatalogEntryContainer;
});
