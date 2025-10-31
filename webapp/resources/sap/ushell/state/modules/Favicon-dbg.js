// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview handles favicon.
 * @version 1.141.1
 */
sap.ui.define([
    "sap/ui/core/Theming",
    "sap/ui/util/Mobile",
    "sap/ushell/Config",
    "sap/ushell/utils"
], (
    Theming,
    Mobile,
    Config,
    ushellUtils
) => {
    "use strict";

    class Favicon {
        #fnSetFavicon = () => {
            throw new Error("Favicon is not initialized");
        };
        #bInitialized = false;
        #aDoables = [];

        init () {
            if (this.#bInitialized) {
                return;
            }

            this.#bInitialized = true;
            this.#fnSetFavicon = this.#setFavicon.bind(this);
            Theming.attachApplied(this.#fnSetFavicon);
            this.#aDoables.push(Config.on("/core/shell/favIcon").do(this.#fnSetFavicon));
        }

        async #getFavicon () {
            let sFavicon;
            let bCustomFavicon = false;

            // custom theme favicon
            const [sThemingFavicon] = await ushellUtils.getThemingParameters(["sapUiShellFavicon"]);
            if (sThemingFavicon) {
                // url('path/to/favicon.ico') -> path/to/favicon.ico
                const aMatches = /url[\s]*\('?"?([^'")]*)'?"?\)/.exec(sThemingFavicon);
                if (aMatches) {
                    sFavicon = aMatches[1];
                    bCustomFavicon = true;
                } else if (sThemingFavicon !== "''" && sThemingFavicon !== "none") {
                    sFavicon = sThemingFavicon;
                }
            }

            // configuration favicon
            const sConfigFavicon = Config.last("/core/shell/favIcon");
            if (!sFavicon && sConfigFavicon) {
                sFavicon = sConfigFavicon;
                bCustomFavicon = true;
            }

            // default favicon
            if (!sFavicon) {
                const sSapUshellModulePath = sap.ui.require.toUrl("sap/ushell");
                sFavicon = `${sSapUshellModulePath}/themes/base/img/launchpad_favicon.ico`;
            }

            return {
                favicon: sFavicon,
                isCustomFavicon: bCustomFavicon
            };
        }

        async #setFavicon () {
            const { favicon, isCustomFavicon } = await this.#getFavicon();

            let oIconSet;
            if (isCustomFavicon) {
                oIconSet = {
                    phone: favicon,
                    "phone@2": favicon,
                    tablet: favicon,
                    "tablet@2": favicon,
                    favicon: favicon,
                    precomposed: false
                };
            } else {
                const sSapUshellModulePath = sap.ui.require.toUrl("sap/ushell");
                oIconSet = {
                    phone: `${sSapUshellModulePath}/themes/base/img/launchicons/phone-icon_120x120.png`,
                    "phone@2": `${sSapUshellModulePath}/themes/base/img/launchicons/phone-retina_180x180.png`,
                    tablet: `${sSapUshellModulePath}/themes/base/img/launchicons/tablet-icon_152x152.png`,
                    "tablet@2": `${sSapUshellModulePath}/themes/base/img/launchicons/tablet-retina_167x167.png`,
                    favicon: favicon,
                    precomposed: false
                };
            }

            Mobile.setIcons(oIconSet);
        }

        reset () {
            Theming.detachApplied(this.#fnSetFavicon);
            this.#aDoables.forEach((oDoable) => oDoable.off());

            this.#fnSetFavicon = () => {
                throw new Error("Favicon is not initialized");
            };
            this.#bInitialized = false;
            this.#aDoables = [];
        }
    }

    return new Favicon();
});
