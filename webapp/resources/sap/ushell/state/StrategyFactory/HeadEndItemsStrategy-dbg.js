// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/Log",
    "sap/ui/core/Element",
    "sap/ushell/Config",
    "sap/ushell/api/NewExperience"
], (
    Log,
    Element,
    Config,
    NewExperience
) => {
    "use strict";

    const iMaxLength = 10;

    /**
     * @alias sap.ushell.state.StrategyFactory.HeadEndItemsStrategy
     * @namespace
     * @description Strategy for adding items to the head end item area.
     *
     * @since 1.127.0
     * @private
     */
    class HeadEndItemsStrategy {
        /**
         * Adds an item to the list.
         * Does not add the item:
         *  - if it is already in the list
         *  - if the control doesn't exist
         *  - if the max length would be exceeded
         * Applies a custom sorting.
         * @param {sap.ui.core.ID[]} aList The list.
         * @param {sap.ui.core.ID} sNewItem The item to add.
         *
         * @since 1.127.0
         * @private
         * @alias sap.ushell.state.StrategyFactory.HeadEndItemsStrategy#add
         */
        add (aList, sNewItem) {
            if (aList.includes(sNewItem)) {
                return;
            }
            if (!Element.getElementById(sNewItem)) {
                Log.warning(`Failed to find control with id '${sNewItem}'`);
                return;
            }
            if (this.#exceedsMaxLength([...aList, sNewItem])) {
                Log.error("The maximum number of head end items has been reached. The item could not be added.");
            } else {
                this.#addHeaderItems(aList, sNewItem);
            }
        }

        /**
         * Checks if the max length would be exceeded.
         * Reserved ids are not counted.
         * @param {sap.ui.core.ID} aList The list.
         * @returns {boolean} True if the max length would be exceeded, false otherwise.
         *
         * @since 1.127.0
         * @private
         */
        #exceedsMaxLength (aList) {
            // The ShellBar WebComponent does not have any limit for the content, compared to the ShellHeader.
            // Therefore we do not need to check for this anymore.
            if (Config.last("/core/shellBar/enabled")) {
                return false;
            }
            const aListWithoutDuplicates = [...new Set(aList)];
            const aReservedIds = [
                "endItemsOverflowBtn"
            ];

            const iCurrentLength = aListWithoutDuplicates.filter((sItem) => {
                return !aReservedIds.includes(sItem);
            }).length;

            return iCurrentLength > iMaxLength;
        }

        /**
         * Adds the item to the list.
         * Applies sorting based on a predefined scale.
         * @param {sap.ui.core.ID[]} aList The list.
         * @param {sap.ui.core.ID} sNewItem The item to add.
         *
         * @since 1.127.0
         * @private
         */
        #addHeaderItems (aList, sNewItem) {
            aList.push(sNewItem);

            /*
             * HeaderEndItems has the following order:
             * - shell app title (added to the header end items for the new ShellBar web component)
             * - shell bar spacer (added to the header end items for the new ShellBar web component)
             * - search
             * - Joule
             * - copilot
             * - custom items
             * - notification
             * - overflow button (before me area)
             * - UserActionsMenu
             * - product switch
             */

            /* eslint-disable quote-props */
            const oScale = {
                "shellAppTitle": -7,
                "shellBarSpacer": -4,
                "sf": -3,
                "sap.das.webclientplugin.s4.shellitem": -2, // Joule S4
                "sap.das.webclientplugin.workzone.shellitem": -2, // Joule work zone
                "copilotBtn": -1,
                // 0 custom items
                "NotificationsCountButton": 1,
                "endItemsOverflowBtn": 2,
                "userActionsMenuHeaderButton": 3,
                "productSwitchBtn": 4
            };

            oScale[NewExperience.getShellHeaderControl()?.getId()] = -5;
            oScale[NewExperience.getOverflowItemId()] = -6;

            /* eslint-enable quote-props */

            aList.sort((sItem1, sItem2) => {
                const iPriority1 = oScale[sItem1] || 0;
                const iPriority2 = oScale[sItem2] || 0;

                if (iPriority1 === iPriority2) {
                    return sItem1.localeCompare(sItem2);
                }

                return iPriority1 - iPriority2;
            });
        }
    }

    return new HeadEndItemsStrategy();
});
