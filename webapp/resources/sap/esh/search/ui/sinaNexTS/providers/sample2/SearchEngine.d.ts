declare module "sap/esh/search/ui/sinaNexTS/providers/sample2/SearchEngine" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { Sina } from "sap/esh/search/ui/sinaNexTS/sina/Sina";
    import { SearchQuery } from "sap/esh/search/ui/sinaNexTS/sina/SearchQuery";
    import { SearchResultSet } from "sap/esh/search/ui/sinaNexTS/sina/SearchResultSet";
    import { DataSourceService } from "sap/esh/search/ui/sinaNexTS/providers/sample2/DataSourceService";
    import { ChartQuery } from "sap/esh/search/ui/sinaNexTS/sina/ChartQuery";
    import { ChartResultSet } from "sap/esh/search/ui/sinaNexTS/sina/ChartResultSet";
    import { SuggestionQuery } from "sap/esh/search/ui/sinaNexTS/sina/SuggestionQuery";
    import { SuggestionResultSet } from "sap/esh/search/ui/sinaNexTS/sina/SuggestionResultSet";
    import { RecordService } from "sap/esh/search/ui/sinaNexTS/providers/sample2/RecordService";
    import { FacetService } from "sap/esh/search/ui/sinaNexTS/providers/sample2/FacetService";
    class SearchEngine {
        dataSourceService: DataSourceService;
        recordService: RecordService;
        facetService: FacetService;
        historySearchTerms: string[];
        sina: Sina;
        readonly dataSourceIds: string[];
        constructor(sina: Sina, dataSourceIds: string[]);
        initAsync(sina?: Sina): Promise<void>;
        loadData(): Promise<void>;
        search(query: SearchQuery): Promise<SearchResultSet>;
        private createSinaSearchResultSet;
        private createSinaSearchResultSetItem;
        private createSinaSearchResultSetItemSingleAttribute;
        private createSinaNavigationTarget;
        private createSinaFacets;
        private createSinaDataSourceFacet;
        private createSinaChartFacet;
        chart(query: ChartQuery): Promise<ChartResultSet>;
        private createSinaChartResultSetItems;
        suggestion(query: SuggestionQuery): Promise<SuggestionResultSet>;
        private createSinaDataSourceSuggestions;
        private createSinaSearchTermSuggestions;
        private createSinaObjectSuggestions;
    }
}
//# sourceMappingURL=SearchEngine.d.ts.map