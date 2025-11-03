// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/Container",
    "sap/ushell/utils/WindowUtils",
    "sap/ushell/api/performance/Extension",
    "sap/ushell/api/performance/NavigationSource"
], (
    Container,
    WindowUtils,
    Extension,
    NavigationSource
) => {
    "use strict";

    /**
     * Helper class for performing navigation actions.
     */
    class NavigationHelper {
        /**
         * @private
         * @since 1.139.0
         */
        #oExtension;

        constructor () {
            this.#oExtension = new Extension();
        }

        /**
        * Performs navigation to the specified destination target using the Navigation service.
        *
        * @param {object} oTarget The destination target object containing the navigation details.
        * @returns {Promise} A promise that resolves when the navigation is completed.
        *
        * @private
        * @since 1.133.0
        */
        _performNavigation (oTarget) {
            this.#oExtension.addNavigationSource(NavigationSource.SideBar);
            return Container.getServiceAsync("Navigation").then((oNavigationService) => {
                const oParams = {};
                oTarget.parameters?.forEach((oParameter) => {
                    if (oParameter.name && oParameter.value) {
                        oParams[oParameter.name] = [oParameter.value];
                    }
                });

                oNavigationService.navigate({
                    target: {
                        semanticObject: oTarget.semanticObject,
                        action: oTarget.action,
                        shellHash: oTarget.shellHash
                    },
                    params: oParams
                });
            });
        }

        /**
             * Opens the provided URL in a new browser tab.
             *
             * @param {object} oTarget
             *  The destination target which is used to determine the URL which should be
             *  opened in a new browser tab
             *
             * @private
             * @since 1.133.0
             */
        _openURL (oTarget) {
            WindowUtils.openURL(oTarget.url, "_blank");
        }

        /**
        * Navigates to a specified destination based on its type, either by performing
        * in-browser navigation or opening a URL. Optionally closes a provided popover.
        *
        * @param {object} oDestinationIntent - The destination intent object containing navigation details.
        * @param {string} oDestinationIntent.type - The type of navigation ("IBN" for in-browser navigation or "URL").
        * @param {object} oDestinationIntent.target - The target destination or URL for navigation.
        * @param {sap.m.Popover} [oPopover] - An optional popover to close after navigation.
        *
        * @since 1.134.0
        */
        navigate (oDestinationIntent) {
            if (oDestinationIntent.type === "IBN") {
                this._performNavigation(oDestinationIntent.target);
            } else if (oDestinationIntent.type === "URL") {
                this._openURL(oDestinationIntent.target);
            }
        }
    }

    return NavigationHelper;
}, false);
