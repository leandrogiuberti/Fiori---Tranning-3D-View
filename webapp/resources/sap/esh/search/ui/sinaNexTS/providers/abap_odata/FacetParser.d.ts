declare module "sap/esh/search/ui/sinaNexTS/providers/abap_odata/FacetParser" {
    import { ChartResultSet } from "sap/esh/search/ui/sinaNexTS/sina/ChartResultSet";
    import { Condition } from "sap/esh/search/ui/sinaNexTS/sina/Condition";
    import { DataSourceResultSet } from "sap/esh/search/ui/sinaNexTS/sina/DataSourceResultSet";
    import { Sina } from "sap/esh/search/ui/sinaNexTS/sina/Sina";
    import { Provider } from "sap/esh/search/ui/sinaNexTS/providers/abap_odata/Provider";
    class FacetParser {
        provider: Provider;
        sina: Sina;
        constructor(provider: Provider);
        parse(query: any, data: any): any[] | Promise<any[]>;
        prepareValueHelpFacet(query: any, data: any): void;
        parseDataSourceFacet(query: any, facetData: any): DataSourceResultSet;
        createAttributeFilterCondition(attributeId: string, metadata: any, cell: any): Condition;
        parseChartFacet(query: any, facetData: any, facetTotalCount: number): ChartResultSet;
    }
}
//# sourceMappingURL=FacetParser.d.ts.map