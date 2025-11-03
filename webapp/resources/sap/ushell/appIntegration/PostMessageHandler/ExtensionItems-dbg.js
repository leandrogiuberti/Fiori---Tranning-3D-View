// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
/**
 * @file This file contains the ExtensionItems class.
 */
sap.ui.define([
    "sap/base/Log",
    "sap/base/util/uid"
], (
    Log,
    uid
) => {
    "use strict";

    class ExtensionItems {
        #oItemMap = {};

        /**
         * Generates a unique ID for an item.
         * @returns {string} A unique ID.
         *
         * @see sap.ushell.services.Extension.Item
         * @see sap.ushell.services.FrameBoundExtension.Item
         *
         * @since 1.124.0
         * @private
         */
        generateItemId () {
            const sItemId = uid();
            if (Object.hasOwn(this.#oItemMap, sItemId)) {
                return this.generateItemId();
            }
            // reserve the item ID in the map to avoid duplicates
            this.#oItemMap[sItemId] = null;
            return sItemId;
        }

        /**
         * Stores the Item object by its ID.
         * @param {*} sItemId The ID of the item.
         * @param {object} oItem The item object.
         *
         * @see sap.ushell.services.Extension.Item
         * @see sap.ushell.services.FrameBoundExtension.Item
         *
         * @since 1.124.0
         * @private
         */
        storeItem (sItemId, oItem) {
            this.#oItemMap[sItemId] = oItem;
        }

        /**
         * Returns the Item object by its ID.
         * @param {string} sItemId The ID of the item.
         * @returns {object} The item object.
         *
         * @see sap.ushell.services.Extension.Item
         * @see sap.ushell.services.FrameBoundExtension.Item
         *
         * @since 1.124.0
         * @private
         */
        getItem (sItemId) {
            return this.#oItemMap[sItemId];
        }

        /**
         * Removes the Item object by its ID.
         * @param {string} sItemId The ID of the item.
         *
         * @see sap.ushell.services.Extension.Item
         * @see sap.ushell.services.FrameBoundExtension.Item
         *
         * @since 1.124.0
         * @private
         */
        removeItem (sItemId) {
            delete this.#oItemMap[sItemId];
        }

        /**
         * Visits each item by its ID and calls a callback function.
         * Ignores items that are not found.
         * @param {string[]} aIds The ids of the items to visit
         * @param {function} fnCallback The callback function to call for each item
         *
         * @since 1.125.0
         * @private
         */
        visitItems (aIds, fnCallback) {
            aIds.forEach((sId) => {
                const oItem = this.getItem(sId);
                if (oItem) {
                    fnCallback(oItem);
                } else {
                    Log.warning(`Item with id ${sId} not found`);
                }
            });
        }

        /**
         * Applies the visibility of an item.
         * Helper to apply the visibility of an item which is not based on the Extension service (e.g. Renderer).
         * @param {sap.ushell.services.Extension.Item|sap.ushell.services.FrameBoundExtension.Item} oItem The extension item.
         * @param {boolean} bVisible The visibility for the item.
         *
         * @since 1.125.0
         * @private
         */
        applyItemVisibility (oItem, bVisible) {
            if (bVisible) {
                oItem.showForCurrentApp();
            } else {
                oItem.hideForCurrentApp();
            }
        }
    }

    return ExtensionItems;
});
