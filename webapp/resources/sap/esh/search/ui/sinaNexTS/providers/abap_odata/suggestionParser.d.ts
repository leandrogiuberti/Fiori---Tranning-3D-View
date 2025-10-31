declare module "sap/esh/search/ui/sinaNexTS/providers/abap_odata/suggestionParser" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { DataSourceSuggestion } from "sap/esh/search/ui/sinaNexTS/sina/DataSourceSuggestion";
    import { SearchTermAndDataSourceSuggestion } from "sap/esh/search/ui/sinaNexTS/sina/SearchTermAndDataSourceSuggestion";
    import { SearchTermSuggestion } from "sap/esh/search/ui/sinaNexTS/sina/SearchTermSuggestion";
    import { Sina } from "sap/esh/search/ui/sinaNexTS/sina/Sina";
    import { SuggestionCalculationMode } from "sap/esh/search/ui/sinaNexTS/sina/SuggestionCalculationMode";
    import { SuggestionQuery } from "sap/esh/search/ui/sinaNexTS/sina/SuggestionQuery";
    import { ItemParser } from "sap/esh/search/ui/sinaNexTS/providers/abap_odata/ItemParser";
    import { Provider } from "sap/esh/search/ui/sinaNexTS/providers/abap_odata/Provider";
    interface ICell {
        FromDataSource: string;
        FromDataSourceAttribute: string;
        SearchTerms: string;
        SearchTermsHighlighted: string;
        Type: string;
    }
    interface ABAPOdataSuggestionResponse {
        d: {
            DataSources: {
                results: Array<unknown>;
            };
            DetailLevel: number;
            Id: string;
            IncludeAttributeSuggestions: boolean;
            IncludeDataSourceSuggestions: boolean;
            IncludeHistorySuggestions: boolean;
            ObjectSuggestions: Record<string, unknown>;
            SuggestionInput: string;
            Suggestions: {
                results: Array<{
                    FromDataSource: string;
                    FromDataSourceAttribute: string;
                    NumberOfObjects: number;
                    Score: string;
                    SearchTerms: string;
                    SearchTermsHighlighted: string;
                    Type: string;
                }>;
            };
        };
    }
    class SuggestionParser {
        provider: Provider;
        sina: Sina;
        itemParser: ItemParser;
        constructor(provider: Provider, itemParser: ItemParser);
        parseObjectSuggestions(query: any, data: any): any[] | Promise<any[]>;
        private parseObjectSuggestion;
        fillValueHighlighted(object: any): void;
        parseRegularSuggestions(query: SuggestionQuery, data: ABAPOdataSuggestionResponse): Array<SearchTermSuggestion | SearchTermAndDataSourceSuggestion | DataSourceSuggestion>;
        parseDataSourceSuggestion(query: SuggestionQuery, cell: ICell): DataSourceSuggestion;
        parseSearchTermSuggestion(query: SuggestionQuery, cell: ICell): SearchTermSuggestion;
        parseSearchTermAndDataSourceSuggestion(query: SuggestionQuery, cell: ICell): SearchTermAndDataSourceSuggestion;
        parseCalculationMode(scope: string): SuggestionCalculationMode;
        private _getParentCell;
    }
}
//# sourceMappingURL=suggestionParser.d.ts.map