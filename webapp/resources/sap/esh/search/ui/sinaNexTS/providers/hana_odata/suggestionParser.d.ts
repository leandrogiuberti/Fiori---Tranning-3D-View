declare module "sap/esh/search/ui/sinaNexTS/providers/hana_odata/suggestionParser" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { HANAOdataSuggestionResponseResult, Provider } from "sap/esh/search/ui/sinaNexTS/providers/hana_odata/Provider";
    import { Sina } from "sap/esh/search/ui/sinaNexTS/sina/Sina";
    import { SuggestionQuery } from "sap/esh/search/ui/sinaNexTS/sina/SuggestionQuery";
    import { SearchTermSuggestion } from "sap/esh/search/ui/sinaNexTS/sina/SearchTermSuggestion";
    import { ObjectSuggestion } from "sap/esh/search/ui/sinaNexTS/sina/ObjectSuggestion";
    class SuggestionParser {
        provider: Provider;
        sina: Sina;
        constructor(provider: Provider);
        parse(query: SuggestionQuery, data: Array<HANAOdataSuggestionResponseResult>): Array<SearchTermSuggestion>;
        private parseDataSourceSuggestion;
        private parseSearchTermSuggestion;
        private parseSearchTermAndDataSourceSuggestion;
        parseObjectSuggestions(query: SuggestionQuery, searchItems: any): Array<ObjectSuggestion>;
        private fillValueHighlighted;
        private parseCalculationMode;
    }
}
//# sourceMappingURL=suggestionParser.d.ts.map