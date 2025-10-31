// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview handles the logo within the header.
 * @version 1.141.1
 */
sap.ui.define([
    "sap/base/i18n/Localization",
    "sap/base/Log",
    "sap/ui/core/Theming",
    "sap/ushell/Config",
    "sap/ushell/resources",
    "sap/ushell/state/StateManager",
    "sap/ushell/utils"
], (
    Localization,
    Log,
    Theming,
    Config,
    ushellResources,
    StateManager,
    ushellUtils
) => {
    "use strict";

    // shortcut for sap.ushell.state.StateManager.Operation
    const Operation = StateManager.Operation;

    const sSapLogo = sap.ui.require.toUrl("sap/ushell/themes/base/img/SAPLogo.svg");

    class HeaderLogo {
        #fnSetLogo = () => {
            throw new Error("Favicon is not initialized");
        };
        #bInitialized = false;
        #aDoables = [];

        init () {
            if (this.#bInitialized) {
                return;
            }

            this.#bInitialized = true;
            this.#fnSetLogo = this.#setLogo.bind(this);
            Theming.attachApplied(this.#fnSetLogo);
            this.#aDoables.push(Config.on("/core/companyLogo/url").do(this.#fnSetLogo));
            this.#aDoables.push(Config.on("/core/companyLogo/accessibleText").do(this.#fnSetLogo));
        }

        /**
         * Get the current logo URL.
         *
         * Logo priority:
         *  1) Custom Company logo URL defined in config
         *  2) Theme logo
         *  2a) if none: SAP logo
         *  2b) if it is invalid: empty string
         *  3) SAP logo
         *
         * @returns {string} Logo URL. It is possibly a base64 encoded string. If no logo exists, even an SAP Logo, an empty string is returned.
         * @since 1.137.0
         * @private
         */
        async #getLogo () {
            const sCustomCompanyLogoUrl = Config.last("/core/companyLogo/url");

            if (sCustomCompanyLogoUrl) {
                return sCustomCompanyLogoUrl;
            }

            const [sThemeLogo] = await ushellUtils.getThemingParameters(["sapUiGlobalLogo"]);

            if (sThemeLogo) {
                if (sThemeLogo === "none") {
                    return sSapLogo;
                }
                // check given logo URL: Is it valid?
                const aMatch = /url[\s]*\('?"?([^'")]*)'?"?\)/.exec(sThemeLogo);
                if (aMatch) {
                    return aMatch[1];
                }

                return "";
            }

            return sSapLogo;
        }

        /**
         * Returns the alt text for the logo image.
         * @param {string} sLogoUri The Uri of the logo image
         * @returns {string} Logo alt text
         *
         * @since 1.137.0
         * @private
         */
        #getLogoAltText (sLogoUri) {
            if (!sLogoUri) {
                return "";
            }

            if (sLogoUri === sSapLogo) {
                return ushellResources.i18n.getText("sapLogoText"); // "SAP Logo"
            }

            const sDefaultAltText = ushellResources.i18n.getText("SHELL_LOGO_TOOLTIP"); // "Company logo"

            let sAltText;
            const sConfigAltTexts = Config.last("/core/companyLogo/accessibleText");
            if (sConfigAltTexts) {
                try {
                    const oConfigAltTexts = JSON.parse(sConfigAltTexts);
                    if (oConfigAltTexts) {
                        const sCurrentLanguage = Localization.getLanguage();
                        // 1. Exact match
                        sAltText = oConfigAltTexts[sCurrentLanguage];
                        // 2. Current language: "en", custom language: "en-GB"
                        if (!sAltText) {
                            Object.keys(oConfigAltTexts).forEach((sKey) => {
                                if (sKey.startsWith(sCurrentLanguage)) {
                                    sAltText = oConfigAltTexts[sKey];
                                }
                            });
                        }
                        // 3. Current language: "en-GB", custom language: "en"
                        if (!sAltText) {
                            Object.keys(oConfigAltTexts).forEach((sKey) => {
                                if (sCurrentLanguage.startsWith(sKey)) {
                                    sAltText = oConfigAltTexts[sKey];
                                }
                            });
                        }
                        // 4. Default value
                        if (!sAltText) {
                            sAltText = oConfigAltTexts.default;
                        }
                    }
                } catch (oError) {
                    Log.warning(`Custom logo image ALT text is not a JSON string: '${sConfigAltTexts}'`, oError);
                    sAltText = sConfigAltTexts; // Still, a customer may provide a "[Company name] logo" instead of JSON
                }
            }
            return sAltText || sDefaultAltText;
        }

        /**
         * Updates the logo of the header in the state.
         * @returns {Promise} Resolves when the logo is updated.
         *
         * @since 1.137.0
         * @private
         */
        async #setLogo () {
            const sLogo = await this.#getLogo();
            const sAltText = this.#getLogoAltText(sLogo);

            StateManager.updateAllBaseStates("header.logo.src", Operation.Set, sLogo);
            StateManager.updateAllBaseStates("header.logo.alt", Operation.Set, sAltText);
        }

        /**
         * Resets this module.
         * ONLY for testing purposes.
         *
         * @since 1.137.0
         * @private
         */
        reset () {
            Theming.detachApplied(this.#fnSetLogo);
            this.#aDoables.forEach((oDoable) => oDoable.off());

            this.#fnSetLogo = () => {
                throw new Error("Favicon is not initialized");
            };
            this.#bInitialized = false;
            this.#aDoables = [];
        }
    }

    return new HeaderLogo();
});
