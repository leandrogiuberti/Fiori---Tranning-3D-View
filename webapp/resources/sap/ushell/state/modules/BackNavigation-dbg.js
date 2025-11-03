// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview handle all the current back navigation.
 * @version 1.141.0
 */
sap.ui.define([
    "sap/ui/core/library",
    "sap/ui/core/routing/History"
], (
    coreLibrary,
    Ui5History
) => {
    "use strict";

    // shortcut for sap.ui.core.routing.HistoryDirection
    const Ui5HistoryDirection = coreLibrary.routing.HistoryDirection;

    function BackNavigation () {
        // handle the history service
        let fnCustomBackNavigation;

        this.isBackNavigation = function () {
            return Ui5History.getInstance().getDirection() === Ui5HistoryDirection.Backwards;
        };

        this.navigateBack = async function () {
            if (fnCustomBackNavigation) {
                fnCustomBackNavigation();
                return;
            }

            window.history.back();
        };

        this.setNavigateBack = function (inFnBKImp) {
            fnCustomBackNavigation = inFnBKImp;
        };

        this.resetNavigateBack = function () {
            fnCustomBackNavigation = undefined;
        };

        this.restore = function (oInServices) {
            fnCustomBackNavigation = oInServices.fnCustomBackNavigation;
        };

        this.store = function (oServices) {
            oServices.fnCustomBackNavigation = fnCustomBackNavigation;
        };

        /**
         * ONLY FOR TESTING!
         * Resets the RelatedServices to its initial state.
         *
         * @since 1.132.0
         * @private
         */
        this.reset = function () {
            fnCustomBackNavigation = undefined;
        };
    }

    return new BackNavigation();
});
