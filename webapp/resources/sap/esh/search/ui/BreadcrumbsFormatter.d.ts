declare module "sap/esh/search/ui/BreadcrumbsFormatter" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import SearchModel from "sap/esh/search/ui/SearchModel";
    import { HierarchyNode } from "sap/esh/search/ui/sinaNexTS/sina/HierarchyNode";
    import { HierarchyNodePath } from "sap/esh/search/ui/sinaNexTS/sina/HierarchyNodePath";
    import { SearchResultSet } from "sap/esh/search/ui/sinaNexTS/sina/SearchResultSet";
    class Formatter {
        model: SearchModel;
        constructor(model: SearchModel);
        formatNodePaths(searchResultSet: SearchResultSet): Array<HierarchyNode>;
        formatHierarchyAttribute(searchResultSet: SearchResultSet): string;
        _selectNodePath(searchResultSet: SearchResultSet): HierarchyNodePath;
    }
}
//# sourceMappingURL=BreadcrumbsFormatter.d.ts.map