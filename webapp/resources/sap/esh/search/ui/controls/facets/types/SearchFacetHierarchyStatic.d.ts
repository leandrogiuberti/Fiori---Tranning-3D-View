declare module "sap/esh/search/ui/controls/facets/types/SearchFacetHierarchyStatic" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { $ListSettings } from "sap/m/List";
    import SearchFacetHierarchyStaticTreeItem from "sap/esh/search/ui/controls/facets/types/SearchFacetHierarchyStaticTreeItem";
    import Context from "sap/ui/model/Context";
    import VBox from "sap/m/VBox";
    /**
     * Hierarchy facet (static)
     *
     * The SearchFacetHierarchyStatic control is used for displaying static hierarchy facets.
     * Corresponding model objects:
     * - hierarchystatic/SearchHierarchyStaticFacet.js : facet with pointer to root hierarchy node
     * - hierarchystatic/SearchHierarchyStaticNode.js  : hierarchy node
     */
    /**
     * @namespace sap.esh.search.ui.controls
     */
    export default class SearchFacetHierarchyStatic extends VBox {
        constructor(sId?: string, options?: $ListSettings);
        createTreeItem(sId: string, oContext: Context): SearchFacetHierarchyStaticTreeItem;
        static renderer: {
            apiVersion: number;
        };
    }
}
//# sourceMappingURL=SearchFacetHierarchyStatic.d.ts.map