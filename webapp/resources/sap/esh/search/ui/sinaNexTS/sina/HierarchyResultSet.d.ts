declare module "sap/esh/search/ui/sinaNexTS/sina/HierarchyResultSet" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { FacetResultSet, FacetResultSetOptions } from "sap/esh/search/ui/sinaNexTS/sina/FacetResultSet";
    import { HierarchyNode } from "sap/esh/search/ui/sinaNexTS/sina/HierarchyNode";
    import { HierarchyQuery } from "sap/esh/search/ui/sinaNexTS/sina/HierarchyQuery";
    import { FacetType } from "sap/esh/search/ui/sinaNexTS/sina/FacetType";
    interface HierarchyResultSetOptions extends FacetResultSetOptions {
        node: HierarchyNode;
    }
    class HierarchyResultSet extends FacetResultSet {
        type: FacetType;
        query: HierarchyQuery;
        node: HierarchyNode;
        constructor(properties: HierarchyResultSetOptions);
    }
}
//# sourceMappingURL=HierarchyResultSet.d.ts.map