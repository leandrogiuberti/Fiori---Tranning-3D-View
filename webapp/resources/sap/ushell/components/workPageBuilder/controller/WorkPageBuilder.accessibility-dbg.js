// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @file WorkPageBuilder accessibility features
 * @version 1.141.0
 */

sap.ui.define([
    "sap/f/library"
], (sapFLibrary) => {
    "use strict";

    const NavigationDirection = sapFLibrary.NavigationDirection;

    function WorkPageBuilderAccessibility () {
        this._oFocusHistory = {
            oLastGrid: null,
            sLastDirection: null,
            iLastRow: null,
            iTargetRow: null
        };
        this._bInitialItemFocused = false;
    }

    /**
     * Handler for the "borderReached" event of the GridContainer.
     *
     * @param {sap.ui.base.Event} oEvent The original borderReached event of the GridContainer
     * @param {sap.ushell.components.workPageBuilder.controls.WorkPage} oWorkPage The WorkPage
     */
    WorkPageBuilderAccessibility.prototype._handleBorderReached = function (oEvent, oWorkPage) {
        const oCurrentFocusElement = this._getCurrentFocusElement();
        const oCurrentGrid = oEvent.getSource().getAggregation("_gridContainer");
        const sDirection = oEvent.getParameter("direction");
        const iRow = oEvent.getParameter("row");
        const iColumn = oEvent.getParameter("column");

        if (this._isOppositeDirection(sDirection) && this._oFocusHistory.oLastGrid && !this._oFocusHistory.oLastGrid.isDestroyed() && iRow === this._oFocusHistory.iTargetRow) {
            this._oFocusHistory.oLastGrid.focusItemByDirection(sDirection, this._oFocusHistory.iLastRow, iColumn);
            this._saveFocusHistory(oCurrentGrid, sDirection, iRow);
        } else {
            const oNextGrid = this._findNextGrid(oCurrentFocusElement, oWorkPage, sDirection);
            if (oNextGrid) {
                const iTargetElementRow = this._findSuitableRowInGrid(oNextGrid, oCurrentFocusElement, sDirection);
                oNextGrid.focusItemByDirection(sDirection, iTargetElementRow, iColumn);
                this._saveFocusHistory(oCurrentGrid, sDirection, iRow, iTargetElementRow);
            }
        }
    };

    /**
     * Determines if the direction is the opposite of the previous direction.
     *
     * @param {string} sDirection The direction in question
     * @returns {boolean} The result. True if the previous direction is the opposite of the current one, false if not. Also false if no history is available.
     */
    WorkPageBuilderAccessibility.prototype._isOppositeDirection = function (sDirection) {
        switch (this._oFocusHistory.sLastDirection) {
            case NavigationDirection.Right:
                return sDirection === NavigationDirection.Left;
            case NavigationDirection.Left:
                return sDirection === NavigationDirection.Right;
            case NavigationDirection.Up:
                return sDirection === NavigationDirection.Down;
            case NavigationDirection.Down:
                return sDirection === NavigationDirection.Up;
            default:
                return false;
        }
    };

    /**
     * <pre>
     * Calculates which GridContainer is the nearest relative to the currently focused GridContainer.
     * Note: This only considers the distance in the given direction. This can have unwanted effects which might need to be followed up on.
     * Example: Consider the following layout:
     * { GridContainer A } | { GridContainer B }
     * {            GridContainer C            }
     * If the focus shifts from "GridContainer C" upwards it might not land on the expected Grid. Currently it depends on the placement in the DOM and doesn't consider how much is overlapping.
     * </pre>
     *
     * @param {HTMLElement} oCurrentElement The currently focused Element
     * @param {sap.ushell.components.workPageBuilder.controls.WorkPage} oWorkPage The WorkPage
     * @param {string} sDirection The direction in which the focus should shift
     * @returns {sap.f.GridContainer|null} The GridContainer which should be focused next. null if none are available
     */
    WorkPageBuilderAccessibility.prototype._findNextGrid = function (oCurrentElement, oWorkPage, sDirection) {
        const aGrids = this._getAllGrids(oWorkPage);
        const aPotentialGrids = [];

        aGrids.forEach((oGrid) => {
            if (oGrid === oCurrentElement) {
                return;
            }

            const iDistance = this._getDistanceToElementInDirection(oCurrentElement, oGrid.getDomRef(), sDirection);
            if (iDistance) {
                aPotentialGrids.push({
                    oGrid: oGrid,
                    iDistance: iDistance
                });
            }
        });

        // Sort the potential grids we found by distance. First grid in the list will be the closest to the current grid
        const aSortedPotentialGrids = aPotentialGrids.sort((a, b) => {
            return a.iDistance - b.iDistance;
        });

        return aSortedPotentialGrids[0] ? aSortedPotentialGrids[0].oGrid : null;
    };

    /**
     * Finds all GridContainers on the WorkPage by iterating through all Rows, Columns and Cells.
     *
     * @param {sap.ushell.components.workPageBuilder.controls.WorkPage} oWorkPage The WorkPage
     * @returns {sap.f.GridContainer[]} A list of all GridContainers found on the WorkPage
     */
    WorkPageBuilderAccessibility.prototype._getAllGrids = function (oWorkPage) {
        const aRows = oWorkPage.getRows();
        const aGrids = [];

        aRows.forEach((oRow) => {
            const aColumns = oRow.getColumns();
            aColumns.forEach((oColumn) => {
                const aCells = oColumn.getCells();
                aCells.forEach((oCell) => {
                    // WorkPageCell.getGridContainer causes a refresh of the control for technical reasons. Therefor we avoid using it here
                    const oGridContainer = oCell.getAggregation("_gridContainer");
                    if (oGridContainer) {
                        aGrids.push(oGridContainer);
                    }
                });
            });
        });

        return aGrids;
    };

    /**
     * Tries to find an element in the target grid in the provided direction. If none is found the result defaults to 0
     *
     * @param {sap.f.GridContainer} oTargetGrid The grid which will be examined
     * @param {HTMLElement} oCurrentFocusElement The currently focused element
     * @param {string} sDirection The direction we want to look at
     * @returns {int} The row index which was found
     */
    WorkPageBuilderAccessibility.prototype._findSuitableRowInGrid = function (oTargetGrid, oCurrentFocusElement, sDirection) {
        const aGridMatrix = oTargetGrid.getNavigationMatrix();
        let oLastElement;

        const iResult = aGridMatrix.findIndex((aGridRow) => {
            return aGridRow.find((oElement) => {
                if (oElement === false || oElement === oLastElement) {
                    return false;
                }

                // An element can occupy multiple slots on the grid. To avoid calculating the distance for the same element many times we save a reference.
                oLastElement = oElement;

                if (this._getDistanceToElementInDirection(oCurrentFocusElement, oElement, sDirection) !== null) {
                    return true;
                }
            });
        });

        return iResult >= 0 ? iResult : 0;
    };

    /**
     * Calculates the distance between two GridContainers
     *
     * @param {HTMLElement} oCurrentElement The current element
     * @param {HTMLElement} oNextElement The element whose distance to the current one will be calculated
     * @param {string} sDirection The direction
     * @returns {int|null} Number representing the distance or null if target grid is not found in the provided direction
     */
    WorkPageBuilderAccessibility.prototype._getDistanceToElementInDirection = function (oCurrentElement, oNextElement, sDirection) {
        const oNextElementRect = oNextElement.getBoundingClientRect();
        const oCurrentElementRect = oCurrentElement.getBoundingClientRect();

        switch (sDirection) {
            case NavigationDirection.Right:
                if (oCurrentElementRect.right < oNextElementRect.left &&
                    oCurrentElementRect.bottom > oNextElementRect.top &&
                    oCurrentElementRect.top < oNextElementRect.bottom) {
                    return oNextElementRect.left - oCurrentElementRect.right;
                }
                break;
            case NavigationDirection.Left:
                if (oCurrentElementRect.left > oNextElementRect.right &&
                    oCurrentElementRect.bottom > oNextElementRect.top &&
                    oCurrentElementRect.top < oNextElementRect.bottom) {
                    return oCurrentElementRect.left - oNextElementRect.right;
                }
                break;
            case NavigationDirection.Down:
                if (oCurrentElementRect.bottom < oNextElementRect.top &&
                    oCurrentElementRect.left < oNextElementRect.right &&
                    oCurrentElementRect.right > oNextElementRect.left) {
                    return oNextElementRect.top - oCurrentElementRect.bottom;
                }
                break;
            case NavigationDirection.Up:
                if (oCurrentElementRect.top > oNextElementRect.bottom &&
                    oCurrentElementRect.left < oNextElementRect.right &&
                    oCurrentElementRect.right > oNextElementRect.left) {
                    return oCurrentElementRect.top - oNextElementRect.bottom;
                }
                break;
            default:
                break;
        }

        return null;
    };

    /**
     * Saves the previously focused grid
     *
     * @param {sap.f.GridContainer} oGrid The currently focused grid
     * @param {string} sDirection The direction where the next grid is located relative to the current one
     * @param {int} iRow The row of the currently focused element
     * @param {int} [iTargetRow] The row of the next target. Needed to decide if the history is still valid or the focus has changed in the meantime
     */
    WorkPageBuilderAccessibility.prototype._saveFocusHistory = function (oGrid, sDirection, iRow, iTargetRow) {
        this._oFocusHistory.oLastGrid = oGrid;
        this._oFocusHistory.sLastDirection = sDirection;
        this._oFocusHistory.iLastRow = iRow;
        this._oFocusHistory.iTargetRow = iTargetRow;
    };

    /**
     * Helper method to obtain the currently focused element.
     * Mainly needed to improve testability.
     *
     * @returns {HTMLElement} The currently focused element
     */
    WorkPageBuilderAccessibility.prototype._getCurrentFocusElement = function () {
        return document.activeElement;
    };

    /**
     * Focus the first item in the first grid container on the given work page.
     *
     * @param {sap.ui.core.Control} oWorkPage The current work page
     */
    WorkPageBuilderAccessibility.prototype.focusFirstItem = function (oWorkPage) {
        const aGrids = this._getAllGrids(oWorkPage);

        const oGridWithItems = aGrids.find((oGrid) => {
            return oGrid.getItems().length > 0;
        });

        if (oGridWithItems && !this._bInitialItemFocused) {
            this._bInitialItemFocused = true;
            /**
             * To prevent initial scrolling to the focused item, the UI5 focus methods cannot be used.
             * Instead we do the following:
             * 1. Get the dom element of the first item in the grid.
             * 2. Get the surrounding grid item wrapper dom element.
             * 3. Focus the grid item wrapper dom element with { preventScroll: true } argument.
             */
            const oFirstItem = oGridWithItems.getItems()[0];
            const oFirstItemDomRef = oFirstItem.getDomRef();
            if (oFirstItemDomRef) {
                const oFirstGridItemWrapper = oFirstItemDomRef.closest(".sapFGridContainerItemWrapper");

                if (oFirstGridItemWrapper) {
                    oFirstGridItemWrapper.focus({ preventScroll: true });
                }
            }
        }
    };

    return WorkPageBuilderAccessibility;
});
