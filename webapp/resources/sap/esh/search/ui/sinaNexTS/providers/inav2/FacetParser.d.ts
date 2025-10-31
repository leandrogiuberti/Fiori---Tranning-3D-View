declare module "sap/esh/search/ui/sinaNexTS/providers/inav2/FacetParser" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { ChartResultSet } from "sap/esh/search/ui/sinaNexTS/sina/ChartResultSet";
    import { Sina } from "sap/esh/search/ui/sinaNexTS/sina/Sina";
    import { Provider } from "sap/esh/search/ui/sinaNexTS/providers/inav2/Provider";
    class FacetParser {
        provider: Provider;
        sina: Sina;
        constructor(provider: Provider);
        parse(query: any, data: any): any[] | Promise<any[]>;
        parseDataSourceFacet(query: any, facetData: any): any;
        createAttributeFilterCondition(attributeId: any, metadata: any, cell: any): import("sap/esh/search/ui/sinaNexTS/sina/SimpleCondition").SimpleCondition | import("sap/esh/search/ui/sinaNexTS/sina/ComplexCondition").ComplexCondition;
        parseChartFacet(query: any, facetData: any, facetTotalCount: number): ChartResultSet;
    }
}
//# sourceMappingURL=FacetParser.d.ts.map