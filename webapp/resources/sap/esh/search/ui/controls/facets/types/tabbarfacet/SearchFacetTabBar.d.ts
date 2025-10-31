declare module "sap/esh/search/ui/controls/facets/types/tabbarfacet/SearchFacetTabBar" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import SearchFacetTabBarBase, { $SearchFacetTabBarBaseSettings } from "sap/esh/search/ui/controls/facets/types/tabbarfacet/SearchFacetTabBarBase";
    import { FacetTypeUI } from "sap/esh/search/ui/controls/facets/FacetTypeUI";
    /**
     * Attribute facet (list, pie chart, bar chart) - tab bar
     */
    /**
     * @namespace sap.esh.search.ui.controls
     */
    export default class SearchFacetTabBar extends SearchFacetTabBarBase {
        constructor(sId?: string, settings?: Partial<$SearchFacetTabBarBaseSettings>);
        switchFacetType(facetType: FacetTypeUI): void;
        getFacetType(): FacetTypeUI;
        attachSelectionChange(): any;
        static renderer: any;
    }
}
//# sourceMappingURL=SearchFacetTabBar.d.ts.map