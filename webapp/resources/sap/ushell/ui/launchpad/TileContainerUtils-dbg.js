// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview This file contains miscellaneous utility functions.
 * they are for exclusive use within the unified shell unless otherwise noted
 */
sap.ui.define([
    "sap/base/util/uid"
], (uid) => {
    "use strict";

    // ensure that sap.ushell exists
    const TileContainerUtils = {};

    /**
     * Tells whether the given value is an array.
     *
     * @param {object} o
     *   any value
     * @returns {boolean}
     *   <code>true</code> if and only if the given value is an array
     * @private
     * @since 1.34.0
     */

    TileContainerUtils.showHideTilesAndHeaders = function (indexingMaps, onScreenItems) {
        let scrPathKey;
        let realItem;
        let entry;
        // number of elements displayed.
        let nCountVisibleElements = 0;
        // number of elements that were visible and we have change to hidden.
        let nCountFilteredElement = 0;

        for (scrPathKey in indexingMaps.onScreenPathIndexMap) {
            if (indexingMaps.onScreenPathIndexMap.hasOwnProperty(scrPathKey)) {
                entry = indexingMaps.onScreenPathIndexMap[scrPathKey];
                realItem = onScreenItems[entry.aItemsRefrenceIndex];

                // count element is visible and we filter it, we will use in to reallocate units for the pagination.
                if (realItem.getVisible() && !entry.isVisible) {
                    nCountFilteredElement++;
                }
                realItem.setVisible(entry.isVisible);

                if (entry.isVisible) {
                    nCountVisibleElements++;
                }
            }
        }

        return {
            nCountVisibleElements: nCountVisibleElements,
            nCountFilteredElement: nCountFilteredElement
        };
    };

    TileContainerUtils.applyFilterOnItem = function (elementsToDisplay, filters, processFiltering, sName) {
        let filter;

        for (filter in filters) {
            if (filters.hasOwnProperty(filter)) {
                filters[filter](elementsToDisplay);
            }
        }
        if (processFiltering) {
            processFiltering(elementsToDisplay, sName);
        }
    };

    TileContainerUtils.createNewItem = function (elementToDisplay, sName) {
        const oBindingInfo = this.mBindingInfos[sName];
        const fnFactory = oBindingInfo.factory;
        const addNewItem = function (oContext) {
            const sId = `${this.getId()}-${uid()}`;
            const oClone = fnFactory(sId, oContext);
            oClone.setBindingContext(oContext, oBindingInfo.model);
            return oClone;
        }.bind(this);

        return addNewItem(elementToDisplay);
    };

    TileContainerUtils.addNewItem = function (oClone, sName) {
        const oAggregationInfo = this.getMetadata().getJSONKeys()[sName];

        this[oAggregationInfo._sMutator](oClone);

        return true;
    };

    TileContainerUtils.createMissingElementsInOnScreenElements = function (indexingMaps, elementsToDisplay, indexSearchMissingFilteredElem, fnaddNewItem, aItems, filters, sName) {
        let path;
        let j;
        const elementsToDisplayLength = elementsToDisplay.length;

        for (j = indexSearchMissingFilteredElem; j < elementsToDisplayLength; j++) {
            path = elementsToDisplay[j].getPath();
            // is aBindingContexts[j] not displayed
            if (!indexingMaps.onScreenPathIndexMap[path]) {
                // if add new item did not successed stop the createion, this is used when we do not have any more allocated unites.
                // indexing can be done in the ad new item function.
                if (fnaddNewItem(elementsToDisplay[j], sName) === false) {
                    // return indication the we have not successfully added all the elements, this is because we do not have allocated units.
                    return false;
                }

                // update indexing
                TileContainerUtils.applyFilterOnItem(elementsToDisplay[j], filters);
            } else {
                // order problem needs to refresh.
                throw new Error("Order problem needs to refresh");
            }
        }

        return true;
    };

    TileContainerUtils.createMissingElementsInOnScreenElementsSearchCatalog =
        function (indexingMaps, elementsToDisplay, indexSearchMissingFilteredElem, fnAddNewItem, aItems, filters, sName, processFiltering) {
            let path;
            let j;
            const elementsToDisplayLength = elementsToDisplay.length;

            // This function is different from createMissingElementsInOnScreenElements mainly because now the order of the tiles can be inserted to the map
            for (j = 0; j < elementsToDisplayLength; j++) {
                path = elementsToDisplay[j].getPath();
                // is aBindingContexts[j] not displayed
                if (!indexingMaps.onScreenPathIndexMap[path]) {
                    // if add new item did not successed stop the createion, this is used when we do not have any more allocated unites.
                    // indexing can be done in the ad new item function.
                    if (fnAddNewItem(elementsToDisplay[j], sName) === false) {
                        // return indication the we have not successfully added all the elements, this is because we do not have allocated units.
                        return false;
                    }

                    // update indexing
                }

                TileContainerUtils.applyFilterOnItem(elementsToDisplay[j], filters, processFiltering, sName);
            }

            return true;
        };

    TileContainerUtils.applyFilterOnAllItems = function (oBindingInfo, filters, processFiltering) {
        let iBindingContextIndex;

        const oBinding = oBindingInfo.binding;

        if (!oBinding) {
            return;
        }
        const aBindingContexts = oBinding.getContexts();

        for (iBindingContextIndex = 0; iBindingContextIndex < aBindingContexts.length; iBindingContextIndex++) {
            // invoke all filters with that element
            TileContainerUtils.applyFilterOnItem(aBindingContexts[iBindingContextIndex], filters, processFiltering);
        }
    };

    TileContainerUtils.validateOrder = function (aBindingContexts, aItems, indexSearchMissingFilteredElem) {
        let lastDomPath; let firstFltrPath; let pathIndex;
        let aLastDomPathParts; let aFirstFltrPathParts; let nPartsIndex;
        let sLastDomPathFrag; let sFirstFltrPathFrag;

        if (aBindingContexts[indexSearchMissingFilteredElem] && aItems.length > 0) {
            lastDomPath = aItems[aItems.length - 1].getBindingContext().getPath();
            firstFltrPath = aBindingContexts[indexSearchMissingFilteredElem].getPath();

            aLastDomPathParts = lastDomPath.split("/");
            aFirstFltrPathParts = firstFltrPath.split("/");

            for (nPartsIndex = 0; nPartsIndex < aLastDomPathParts.length && nPartsIndex < aFirstFltrPathParts.length; nPartsIndex++) {
                // check numbers.
                sLastDomPathFrag = aLastDomPathParts[nPartsIndex];
                sFirstFltrPathFrag = aFirstFltrPathParts[nPartsIndex];

                if (parseInt(sLastDomPathFrag, 10) && parseInt(sFirstFltrPathFrag, 10)) {
                    // number compare as number
                    if (parseInt(sLastDomPathFrag, 10) > parseInt(sFirstFltrPathFrag, 10)) {
                        return false;
                    } else if (parseInt(sLastDomPathFrag, 10) < parseInt(sFirstFltrPathFrag, 10)) {
                        return true;
                    }
                } else {
                    // strings comparison.
                    for (pathIndex = 0; pathIndex < sFirstFltrPathFrag.length && pathIndex < sLastDomPathFrag.length; pathIndex++) {
                        if (sLastDomPathFrag[pathIndex].charCodeAt() > sFirstFltrPathFrag[pathIndex].charCodeAt()) {
                            return false;
                        } else if (sLastDomPathFrag[pathIndex].charCodeAt() < sFirstFltrPathFrag[pathIndex].charCodeAt()) {
                            return true;
                        }
                    }
                }
            }
        }

        return true;
    };

    TileContainerUtils.markVisibleOnScreenElements = function (elementsToDisplay, indexingMaps, bUpdateVisibility) {
        let indexSearchMissingFilteredElem = 0;
        let path;
        const elementsToDisplayLength = elementsToDisplay.length;

        for (indexSearchMissingFilteredElem = 0; indexSearchMissingFilteredElem < elementsToDisplayLength; indexSearchMissingFilteredElem++) {
            path = elementsToDisplay[indexSearchMissingFilteredElem].getPath();
            // is aBindingContexts[j] not displayed
            if (indexingMaps.onScreenPathIndexMap[path]) {
                // entry exists and should be display.
                if (bUpdateVisibility) {
                    indexingMaps.onScreenPathIndexMap[path].isVisible = true;
                }
            } else {
                return indexSearchMissingFilteredElem;
            }
        }

        return indexSearchMissingFilteredElem;
    };

    TileContainerUtils.markVisibleOnScreenElementsSearchCatalog = function (elementsToDisplay, indexingMaps, bUpdateVisibility) {
        let indexSearchMissingFilteredElem = 0;
        let path;
        const elementsToDisplayLength = elementsToDisplay.length;

        for (indexSearchMissingFilteredElem = 0; indexSearchMissingFilteredElem < elementsToDisplayLength; indexSearchMissingFilteredElem++) {
            path = elementsToDisplay[indexSearchMissingFilteredElem].getPath();
            // is aBindingContexts[j] not displayed
            if (indexingMaps.onScreenPathIndexMap[path]) {
                // entry exists and should be display.
                if (bUpdateVisibility) {
                    indexingMaps.onScreenPathIndexMap[path].isVisible = true;
                }
            }
        }

        return indexSearchMissingFilteredElem;
    };

    TileContainerUtils.indexOnScreenElements = function (onScreenItems, bIsVisible) {
        let path;
        let indexOnScreen;
        const indexingMaps = { onScreenPathIndexMap: {} };
        const onScreenItemsLength = onScreenItems.length;
        let curOnScreenItem;
        let bVisibility = true;

        if (bIsVisible === false) {
            bVisibility = false;
        }

        for (indexOnScreen = 0; indexOnScreen < onScreenItemsLength; indexOnScreen++) {
            curOnScreenItem = onScreenItems[indexOnScreen];
            if (curOnScreenItem.getBindingContext()) {
                path = curOnScreenItem.getBindingContext().getPath();
                if (!indexingMaps.onScreenPathIndexMap[path]) {
                    indexingMaps.onScreenPathIndexMap[path] = { aItemsRefrenceIndex: indexOnScreen, isVisible: bVisibility };
                }
            }
        }

        return indexingMaps;
    };

    return TileContainerUtils;
}, /* bExport= */ true);
