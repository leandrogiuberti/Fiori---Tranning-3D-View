declare module "sap/esh/search/ui/sinaNexTS/sina/ChartResultSetItem" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { Condition } from "sap/esh/search/ui/sinaNexTS/sina/Condition";
    import { FacetResultSetItem, FacetResultSetItemOptions } from "sap/esh/search/ui/sinaNexTS/sina/FacetResultSetItem";
    interface ChartResultSetItemOptions extends FacetResultSetItemOptions {
        filterCondition: Condition;
        icon?: string;
    }
    class ChartResultSetItem extends FacetResultSetItem {
        filterCondition: Condition;
        icon: string;
        constructor(properties: ChartResultSetItemOptions);
    }
}
//# sourceMappingURL=ChartResultSetItem.d.ts.map