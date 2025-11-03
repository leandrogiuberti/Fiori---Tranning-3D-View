// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
], (
) => {
    "use strict";

    /**
     * @alias sap.ushell.state.StrategyFactory.UserActionsStrategy
     * @namespace
     * @description Strategy for adding user actions to the list.
     *
     * @since 1.127.0
     * @private
     */
    class UserActionsStrategy {
        /**
         * Adds an item to the list.
         * Does not add the item if it is already in the list.
         * Applies a custom sorting.
         * @param {sap.ui.core.ID[]} aList The list.
         * @param {sap.ui.core.ID} sNewItem The item to add.
         *
         * @since 1.127.0
         * @private
         * @alias sap.ushell.state.StrategyFactory.UserActionsStrategy#add
         */
        add (aList, sNewItem) {
            if (aList.includes(sNewItem)) {
                return;
            }

            aList.push(sNewItem);

            /* eslint-disable quote-props */
            const oScale = {
                "userSettingsBtn": -7,
                "recentActivitiesBtn": -6,
                "frequentActivitiesBtn": -5,
                "openCatalogBtn": -4,
                "ActionModeBtn": -3,
                "EditModeBtn": -2,
                "ContactSupportBtn": -1,
                // 0 custom items
                "dataPrivacyBtn": 1,
                "aboutBtn": 2,
                "logoutBtn": 3
            };
            /* eslint-enable quote-props */

            aList.sort((sItem1, sItem2) => {
                const iPriority1 = oScale[sItem1] || 0;
                const iPriority2 = oScale[sItem2] || 0;

                return iPriority1 - iPriority2;
            });
        }
    }

    return new UserActionsStrategy();
});
