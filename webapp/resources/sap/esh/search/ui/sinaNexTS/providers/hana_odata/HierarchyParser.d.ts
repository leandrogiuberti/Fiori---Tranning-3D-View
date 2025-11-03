declare module "sap/esh/search/ui/sinaNexTS/providers/hana_odata/HierarchyParser" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { AttributeMetadata } from "sap/esh/search/ui/sinaNexTS/sina/AttributeMetadata";
    import { HierarchyResultSet } from "sap/esh/search/ui/sinaNexTS/sina/HierarchyResultSet";
    import { Query } from "sap/esh/search/ui/sinaNexTS/sina/Query";
    class HierarchyParser {
        parseHierarchyFacet(query: Query, attributeMetadata: AttributeMetadata, facetData: any): HierarchyResultSet;
    }
}
//# sourceMappingURL=HierarchyParser.d.ts.map