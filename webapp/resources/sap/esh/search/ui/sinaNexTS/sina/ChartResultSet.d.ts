declare module "sap/esh/search/ui/sinaNexTS/sina/ChartResultSet" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { ChartQuery } from "sap/esh/search/ui/sinaNexTS/sina/ChartQuery";
    import { ChartResultSetItem } from "sap/esh/search/ui/sinaNexTS/sina/ChartResultSetItem";
    import { FacetResultSet, FacetResultSetOptions } from "sap/esh/search/ui/sinaNexTS/sina/FacetResultSet";
    import { FacetType } from "sap/esh/search/ui/sinaNexTS/sina/FacetType";
    type ChartResultSetOptions = FacetResultSetOptions;
    class ChartResultSet extends FacetResultSet {
        items: Array<ChartResultSetItem>;
        type: FacetType;
        query: ChartQuery;
    }
}
//# sourceMappingURL=ChartResultSet.d.ts.map