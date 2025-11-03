declare module "sap/esh/search/ui/sinaNexTS/providers/inav2/suggestionParser" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { Sina } from "sap/esh/search/ui/sinaNexTS/sina/Sina";
    import { SuggestionCalculationMode } from "sap/esh/search/ui/sinaNexTS/sina/SuggestionCalculationMode";
    import { Provider } from "sap/esh/search/ui/sinaNexTS/providers/inav2/Provider";
    class SuggestionParser {
        provider: Provider;
        sina: Sina;
        constructor(provider: any);
        parseSuggestions(query: any, data: any): any[];
        parseDataSourceSuggestion(query: any, cell: any): import("sap/esh/search/ui/sinaNexTS/sina/DataSourceSuggestion").DataSourceSuggestion;
        parseSearchTermSuggestion(query: any, cell: any): import("sap/esh/search/ui/sinaNexTS/sina/SearchTermSuggestion").SearchTermSuggestion;
        parseSearchTermAndDataSourceSuggestion(query: any, cell: any): any;
        parseCalculationMode(scope: any): SuggestionCalculationMode;
    }
    function parse(provider: any, suggestionQuery: any, data: any): any[];
}
//# sourceMappingURL=suggestionParser.d.ts.map