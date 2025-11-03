// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/Container",
    "sap/base/Log",
    "sap/ushell/api/performance/Extension",
    "sap/ushell/api/performance/NavigationSource",
    "sap/ushell_abap/components/TCodeNavigation/TCodeNavigationError",
    "sap/ushell_abap/components/TCodeNavigation/MessageCode"
], (
    Container,
    Log,
    Extension,
    NavigationSource,
    TCodeNavigationError,
    MessageCode
) => {
    "use strict";

    /**
     * @alias sap.ushell_abap.components.TCodeNavigation.NavigationResult
     * @typedef {object}
     * @property {boolean} successful Indicates whether the navigation was successful. //TODO Remove as not needed due to resolved or rejected promise
     * @property {string} messagecode The message code associated with the navigation result.
     *
     * @since 1.140.0
     * @private
     * @ui5-restricted sap.esh.search.ui
     */

    /**
     * TCodeNavigation module for navigating by Transaction (TA) Code.
     * @alias sap.ushell_abap.components.TCodeNavigation
     * @namespace
     * @description This module provides functionality to navigate to an application intent based on a transaction code.
     * It checks if the provided transaction code matches any inbound's appInfo parameter `abap.transaction`.
     * If a match is found, it extracts the semantic object, action, and parameters from the inbound
     * and uses the Navigation service to perform the navigation.
     *
     * @hideconstructor
     *
     * @since 1.140.0
     * @private
     * @ui5-restricted sap.esh.search.ui
     */ // TODO add technical name of esearch component / team name
    class TCodeNavigation {
        // Performance extension for tracking navigation sources
        static #oExtension = new Extension("TCodeNavigation");

        // Expose MessageCode enum
        static MessageCode = MessageCode;

        /**
         * Navigates to an app intent if the given sTCode matches an inbound's appInfo parameter abap.transaction.
         * If a matching inbound is found, it extracts the semantic object, action, and parameters
         * and uses the Navigation service to perform the navigation.
         * @param {string} sTCode The transaction code to search for, can also be an App ID.
         * @param {boolean} bExplace Indicates whether to open the navigation in a new tab.
         * @returns {Promise<sap.ushell_abap.components.TCodeNavigation.NavigationResult>}
         * Resolves with a NavigationResult object containing a successful flag and a message code. Otherwise, it rejects with an error.
         * @throws {sap.ushell_abap.components.TCodeNavigation.TCodeNavigationError} E.g., if no matching inbound is found or if a mandatory parameter is missing.
         *
         * @since 1.140.0
         * @private
         * @ui5-restricted sap.esh.search.ui
         */
        static async navigateByTCode (sTCode, bExplace) {
            try {
                const NavDataProvider = await Container.getServiceAsync("NavigationDataProvider");
                const oNavigationData = await NavDataProvider.getNavigationData();

                const oValidInbound = this.#getValidInbound(oNavigationData, sTCode);

                if (oValidInbound) {
                    // Extract semantic object, action, and parameters from the matched inbound for navigation
                    const { semanticObject: sSemanticObject, action: sAction } = oValidInbound;
                    const oParams = {};
                    if (bExplace) {
                        oParams["sap-ushell-navmode"] = "explace";
                    }

                    // Log the navigation source for performance tracking
                    this.#oExtension.addNavigationSource(NavigationSource.SearchDirectLaunch);

                    const oNavService = await Container.getServiceAsync("Navigation");
                    await oNavService.navigate({
                        target: {
                            semanticObject: sSemanticObject,
                            action: sAction
                        },
                        params: oParams
                    });

                    return {
                        successful: true,
                        messagecode: MessageCode.NAV_SUCCESS
                    };
                }
                throw new TCodeNavigationError(
                    `No matching inbound found for transaction code: ${sTCode}`,
                    { code: MessageCode.NO_INBOUND_FOUND }
                );
            } catch (oError) {
                Log.error("Error during TCode navigation", oError);
                const oErrorResult = new TCodeNavigationError(
                    "Error during TCode navigation.",
                    {
                        successful: false,
                        code: oError.code
                    }
                );
                throw oErrorResult;
            }
        }

        /**
         * Finds the first inbound that matches the given transaction code and doesn't have mandatory parameters.
         * @param {object} oNavigationData The navigation data containing inbounds.
         * @param {string} sTCode The transaction code to match.
         * @returns {object|null} The matched inbound or null if no match is found.
         *
         * @since 1.140.0
         * @private
         */
        static #getValidInbound (oNavigationData, sTCode) {
            if (!oNavigationData?.inbounds) {
                Log.error("No navigation data found");
                return null;
            }

            // Find all inbounds with matching transaction code
            const aMatchedInbounds = oNavigationData.inbounds.filter((oInbound) =>
                oInbound.resolutionResult?.appInfo?.["abap.transaction"] === sTCode
            );
            if (aMatchedInbounds.length === 0) {
                return null;
            }

            // Return the first matched inbound where all mandatory parameters have default values
            const oValidInbound = aMatchedInbounds.find((oInbound) => {
                const oParams = oInbound.signature?.parameters;
                if (!oParams) {
                    return true; // No parameters, consider valid
                }
                // All required parameters must have a default value
                return Object.values(oParams).every((oValue) =>
                    !oValue.required || (oValue.defaultValue && oValue.defaultValue.value)
                );
            });

            if (!oValidInbound) {
                throw new TCodeNavigationError(
                    `Mandatory parameter is missing for transaction ${sTCode}`,
                    { code: MessageCode.NO_INBOUND_FOUND }
                );
            }

            return oValidInbound;
        }
    }

    return TCodeNavigation;
});
