declare module "sap/esh/search/ui/sinaNexTS/providers/hana_odata/FacetParser" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { HANAOdataSearchResponseResult, Provider } from "./Provider";
    import { Query } from "sap/esh/search/ui/sinaNexTS/sina/Query";
    import { SearchQuery } from "sap/esh/search/ui/sinaNexTS/sina/SearchQuery";
    import { ChartQuery } from "sap/esh/search/ui/sinaNexTS/sina/ChartQuery";
    import { Sina } from "sap/esh/search/ui/sinaNexTS/sina/Sina";
    import { Log } from "sap/esh/search/ui/sinaNexTS/core/Log";
    import { AttributeMetadata } from "sap/esh/search/ui/sinaNexTS/sina/AttributeMetadata";
    import { DataSourceResultSet } from "sap/esh/search/ui/sinaNexTS/sina/DataSourceResultSet";
    import { SuggestionQuery } from "sap/esh/search/ui/sinaNexTS/sina/SuggestionQuery";
    class FacetParser {
        log: Log;
        provider: Provider;
        sina: Sina;
        constructor(provider: Provider);
        parse(query: SearchQuery | SuggestionQuery | ChartQuery, data: HANAOdataSearchResponseResult): Promise<any[]>;
        parseDataSourceFacet(query: Query, facetData: any): Promise<import("sap/esh/search/ui/sinaNexTS/sina/ResultSet").ResultSet> | DataSourceResultSet;
        createAttributeFilterCondition(attributeId: any, metadata: any, cell: any): import("sap/esh/search/ui/sinaNexTS/sina/SimpleCondition").SimpleCondition | import("sap/esh/search/ui/sinaNexTS/sina/ComplexCondition").ComplexCondition;
        formatFacetValue(value: any /**metadata*/): any;
        parseFacetAttribute(query: SearchQuery | SuggestionQuery | ChartQuery, facetData: any): AttributeMetadata;
        private parseChartFacet;
    }
}
//# sourceMappingURL=FacetParser.d.ts.map