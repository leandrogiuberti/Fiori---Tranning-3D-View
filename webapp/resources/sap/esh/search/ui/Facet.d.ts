declare module "sap/esh/search/ui/Facet" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import FacetItem from "sap/esh/search/ui/FacetItem";
    import { FacetTypeUI } from "sap/esh/search/ui/controls/facets/FacetTypeUI";
    import { Condition } from "sap/esh/search/ui/sinaNexTS/sina/Condition";
    interface FacetOptions {
        title: string;
        facetType: FacetTypeUI;
        dimension: string;
        dataType: string;
        matchingStrategy: string;
        items: Array<FacetItem>;
        totalCount: number;
        visible: boolean;
    }
    export default class Facet {
        title: string;
        facetType: FacetTypeUI;
        dimension: string;
        dataType: string;
        matchingStrategy: string;
        items: Array<FacetItem>;
        totalCount: number;
        visible: boolean;
        position?: number;
        constructor(properties: Partial<FacetOptions>);
        /**
         * Checks if the facet has the given filter condition
         * @param   {object}  filterCondition the condition to check for in this facet
         * @returns {Boolean} true if the filtercondition was found in this facet
         */
        hasFilterCondition(filterCondition: Condition): boolean;
        /**
         * Checks if this facet has at least one filter condition
         * @returns {Boolean} true if it has at least one filter condition, false otherwise
         */
        hasFilterConditions(): boolean;
        removeItem(facetItem: FacetItem): Array<FacetItem>;
    }
}
//# sourceMappingURL=Facet.d.ts.map