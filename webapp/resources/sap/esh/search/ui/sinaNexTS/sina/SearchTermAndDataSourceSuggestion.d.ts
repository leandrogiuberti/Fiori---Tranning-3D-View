declare module "sap/esh/search/ui/sinaNexTS/sina/SearchTermAndDataSourceSuggestion" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { SearchTermSuggestion, SearchTermSuggestionOptions } from "sap/esh/search/ui/sinaNexTS/sina/SearchTermSuggestion";
    import { SuggestionType } from "sap/esh/search/ui/sinaNexTS/sina/SuggestionType";
    import { DataSource } from "sap/esh/search/ui/sinaNexTS/sina/DataSource";
    interface SearchTermAndDataSourceSuggestionOptions extends SearchTermSuggestionOptions {
        dataSource: DataSource;
    }
    class SearchTermAndDataSourceSuggestion extends SearchTermSuggestion {
        type: SuggestionType;
        dataSource: DataSource;
        constructor(properties: SearchTermAndDataSourceSuggestionOptions);
    }
}
//# sourceMappingURL=SearchTermAndDataSourceSuggestion.d.ts.map