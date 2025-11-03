declare module "sap/esh/search/ui/sinaNexTS/core/lang" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    global {
        interface Document {
            documentMode: string;
        }
    }
    global {
        interface Navigator {
            browserLanguage: string;
        }
    }
    global {
        interface Window {
            chrome: {
                webstore?: unknown;
            };
            InstallTrigger: unknown;
            StyleMedia: unknown;
        }
    }
    function getLanguagePreferences(): Array<LanguagePreference>;
    interface LanguagePreference {
        Language: string;
        Country: string;
    }
    function _getLanguageCountryObject(l: string): LanguagePreference;
}
//# sourceMappingURL=lang.d.ts.map