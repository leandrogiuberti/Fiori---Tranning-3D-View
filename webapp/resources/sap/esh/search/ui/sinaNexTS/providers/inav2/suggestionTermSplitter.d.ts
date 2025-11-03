declare module "sap/esh/search/ui/sinaNexTS/providers/inav2/suggestionTermSplitter" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { Sina } from "sap/esh/search/ui/sinaNexTS/sina/Sina";
    import { Provider } from "sap/esh/search/ui/sinaNexTS/providers/inav2/Provider";
    class SuggestionTermSplitter {
        provider: Provider;
        sina: Sina;
        constructor(provider: any);
        split(term: any): {
            searchTerm: any;
            suggestionTerm: any;
        };
        concatenate(splittedSuggestionTerm: any, suggestions: any): void;
        escapeRegExp(str: any): any;
    }
    function split(provider: any, term: any): {
        searchTerm: any;
        suggestionTerm: any;
    };
    function concatenate(provider: any, splittedTerm: any, suggestions: any): void;
}
//# sourceMappingURL=suggestionTermSplitter.d.ts.map