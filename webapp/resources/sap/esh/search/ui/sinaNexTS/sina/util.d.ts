declare module "sap/esh/search/ui/sinaNexTS/sina/util" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { ComparisonOperator } from "sap/esh/search/ui/sinaNexTS/sina/ComparisonOperator";
    import { DataSource } from "sap/esh/search/ui/sinaNexTS/sina/DataSource";
    import { SearchResultSetItem } from "sap/esh/search/ui/sinaNexTS/sina/SearchResultSetItem";
    import { Sina } from "sap/esh/search/ui/sinaNexTS/sina/Sina";
    import { Value } from "sap/esh/search/ui/sinaNexTS/sina/types";
    function convertOperator2Wildcards(value: string, operator: ComparisonOperator): string;
    function getNavigationHierarchyDataSources(sina: Sina, hierarchyAttrId: string, hierarchyName: string, dataSource: DataSource): Array<DataSource>;
    function assembleTitle(result: SearchResultSetItem): string;
    function assembleHierarchyDecendantsNavigations(result: SearchResultSetItem, attrName: string, attrValue: Value, attrValueLabel: string, navigationDataSources: Array<DataSource>): void;
    function stringifyValue(value: unknown): string;
}
//# sourceMappingURL=util.d.ts.map