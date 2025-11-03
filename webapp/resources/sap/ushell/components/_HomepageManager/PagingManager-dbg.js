// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileoverview The appfinder's paging manager.
 */
sap.ui.define([
    "sap/ui/base/Object",
    "sap/ui/Device",
    "sap/ushell/Config"
], (BaseObject, Device, Config) => {
    "use strict";

    const TILE_MARGIN = 7; // one side, both vertical and horizontal, see themes/base/Tile.less

    const PagingManager = BaseObject.extend("sap.ushell.components._HomepageManager.PagingManager", {
        metadata: {
            publicMethods: [
                "setElementClass",
                "GetGroupHeight",
                "setContainerSize",
                "getNumberOfAllocatedElements",
                "moveToNextPage",
                "getTileHeight"
            ]
        },

        constructor: function (sId, mSettings) {
            this.currentPageIndex = 0;
            this.containerHeight = mSettings.containerHeight || 0;
            this.containerWidth = mSettings.containerWidth || 0;
            this.supportedElements = mSettings.supportedElements || "";
            this.tileHeight = 0;
            this.tileSize = {
                sapUshellTile: { width: 100, height: 100 },
                sapUshellLinkTile: { width: 40, height: 20 },
                default: { width: 40, height: 20 }
            };
        },

        getTileHeight: function () {
            return this.tileHeight;
        },

        setElementClass: function (sClassName) {
            this.supportedElements = sClassName;
        },

        /**
         * Return a tile height depend on the size behavior
         * @param {boolean} bIsSmallSizeBehavior is small size behavior
         * @returns {int} the height of a tile in px
         */
        _getTileHeight: function (bIsSmallSizeBehavior) {
            return bIsSmallSizeBehavior ? 148 : 176;
        },

        /**
         * Return a tile width depend on the size behavior
         * @param {boolean} bIsLongTile is a tile long
         * @param {boolean} bIsSmallSizeBehavior is small size behavior
         * @returns {int} the width of a tile in px
         */
        _getTileWidth: function (bIsLongTile, bIsSmallSizeBehavior) {
            if (bIsLongTile) {
                return bIsSmallSizeBehavior ? 304 : 360;
            }
            return bIsSmallSizeBehavior ? 148 : 176;
        },

        /*
         * Returns group height as fraction of the vertical viewport height
         */
        getGroupHeight: function (oGroup, bFirstGroup, bEnablePersonalization) {
            // Implemented:
            // - respect group.isgroupvisible
            // - respect tile.long
            // - respect incomplete rows
            // - respect tile.isTileIntentSupported
            // - first group does not have a title
            // - small tiles

            // This function has to be extended to take into account:
            // - Variable tile sizes
            // - invisible tiles
            // - invisible groups

            if (!oGroup || oGroup.isGroupVisible === false) {
                return 0;
            }

            const aTiles = oGroup.tiles;
            const aLinks = oGroup.links;
            const bIsSmallSizeBehavior = Device.system.phone || Config.last("/core/home/sizeBehavior") === "Small";
            const iWidthNormalTile = this._getTileWidth(false, bIsSmallSizeBehavior);
            const iWidthLongTile = this._getTileWidth(true, bIsSmallSizeBehavior);
            const groupHeaderHeight = 48; // 3rem
            const groupContainerPadding = 8; // 0.5rem
            const iAvailableWidth = this.containerWidth - groupContainerPadding;

            let iRowLength = 0;
            let iRowNumber = 1;
            let tileWidth;
            let i;

            const someTilesAreVisible = aTiles.some((tile) => {
                return !!tile && tile.isTileIntentSupported !== false;
            });
            if (!someTilesAreVisible) {
                if (oGroup.isGroupLocked || oGroup.isDefaultGroup || !bEnablePersonalization || Device.system.phone) {
                    // don't show empty lock group or default group
                    // Additionally for the mobile or when personalisation is disabled, the title is hidden
                    return 0;
                }
                return (groupHeaderHeight + groupContainerPadding) / this.containerHeight; // There is only header for groups without tiles.
            }
            // initial minimal height of an empty group
            let iHeight = groupContainerPadding;
            // the topmost group does not have a header
            if (!bFirstGroup) {
                iHeight += groupHeaderHeight;
            }
            // Link tiles have no minimal width and the number of link rows cannot be easily
            // calculated. Add a minimum hight of a single row link area that is 44px both on desktop and phone
            // (44px - compact mode and 58px - cozy mode)
            if (aLinks && aLinks.length) {
                iHeight += 44;
            }

            let tile;
            for (i = 0; i < aTiles.length; i++) {
                if (iHeight > this.containerHeight) {
                    break; // the group is definitely bigger than the available space, exit
                }
                tile = aTiles[i];
                if (!tile || tile.isTileIntentSupported === false) { // tile is not rendered
                    continue;
                }
                tileWidth = tile.long ? iWidthLongTile : iWidthNormalTile;
                if (iRowLength > 0) {
                    iRowLength += TILE_MARGIN;
                }
                iRowLength += tileWidth;
                if (iRowLength > iAvailableWidth) {
                    iRowNumber += 1;
                    iRowLength = tileWidth;
                }
            }

            // Empty groups render the "plus" tile - always add the hight of the first row
            iHeight += (this._getTileHeight(bIsSmallSizeBehavior) + TILE_MARGIN) * iRowNumber;

            return iHeight / this.containerHeight;
        },

        setContainerSize: function (nHeight, nWidth) {
            const totalNumberAllocatedTiles = this.getNumberOfAllocatedElements();
            this.containerHeight = nHeight;
            this.containerWidth = nWidth;
            this._changePageSize(totalNumberAllocatedTiles);
        },

        getNumberOfAllocatedElements: function () {
            return this._calcElementsPerPage() * this.currentPageIndex;
        },

        _changePageSize: function (totlaNumberAllocateedTiles) {
            this.currentPageIndex = Math.ceil(totlaNumberAllocateedTiles / this._calcElementsPerPage());
        },

        moveToNextPage: function () {
            this.currentPageIndex++;
        },

        resetCurrentPageIndex: function () {
            this.currentPageIndex = 0;
        },

        getSizeofSupportedElementInUnits: function (tileType) {
            return this.supportedElements[tileType].sizeInBaseUnits;
        },

        _calcElementMatrix: function (className) {
            const oElement = document.createElement("div");
            oElement.classList.add(className);
            document.body.appendChild(oElement);
            const elementHeight = oElement.clientHeight;
            const elementWidth = oElement.clientWidth;
            let result;

            // can be that styles was not loaded before calculation
            if (elementHeight < 20 || elementWidth < 40) {
                result = this.tileSize[className] || this.tileSize.default;
            } else {
                result = { width: elementWidth, height: elementHeight };
            }
            this.tileHeight = elementHeight;
            oElement.remove();

            return result;
        },

        _calcElementsPerPage: function () {
            let supportedElementKey;
            let baseUnitSize;
            let supportedElement;
            let matrix;
            let mat;

            for (supportedElementKey in this.supportedElements) {
                supportedElement = this.supportedElements[supportedElementKey];
                matrix = this._calcElementMatrix(supportedElement.className);
                supportedElement.matrix = matrix;
                if (baseUnitSize) {
                    baseUnitSize.width = baseUnitSize.width > matrix.width ? matrix.width : baseUnitSize.width;
                    baseUnitSize.height = baseUnitSize.height > matrix.height ? matrix.height : baseUnitSize.height;
                } else {
                    baseUnitSize = { width: matrix.width, height: matrix.height };
                }
            }

            // calculate sizeofSupportedelEmentInUnits
            for (supportedElementKey in this.supportedElements) {
                supportedElement = this.supportedElements[supportedElementKey];
                mat = supportedElement.matrix;
                supportedElement.sizeInBaseUnits = Math.round(mat.width / baseUnitSize.width * mat.height / baseUnitSize.height);
            }

            // calc number of units can feet in a page.
            const elementsPerColumn = Math.round(this.containerWidth / baseUnitSize.width);
            const elementsPerRow = Math.round(this.containerHeight / baseUnitSize.height);

            if (!elementsPerRow || !elementsPerColumn || elementsPerColumn === Infinity || elementsPerRow === Infinity || elementsPerColumn === 0 || elementsPerRow === 0) {
                return 10;
            }
            return elementsPerRow * elementsPerColumn;
        }
    });

    return PagingManager;
});
