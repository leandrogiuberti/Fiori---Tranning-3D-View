declare module "sap/esh/search/ui/SearchFacetDialogHelperDynamicHierarchy" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import FacetItem from "sap/esh/search/ui/FacetItem";
    import SearchHierarchyDynamicFacet from "sap/esh/search/ui/hierarchydynamic/SearchHierarchyDynamicFacet";
    import SearchFacetDialogModel from "sap/esh/search/ui/SearchFacetDialogModel";
    import { SimpleCondition } from "sap/esh/search/ui/sinaNexTS/sina/SimpleCondition";
    function updateDetailPageforDynamicHierarchy(model: SearchFacetDialogModel, dynamicHierarchyFacet: SearchHierarchyDynamicFacet, filters: Array<any>): Promise<void>;
    function createFilterFacetItemForDynamicHierarchy(facet: SearchHierarchyDynamicFacet, condition: SimpleCondition): FacetItem;
}
//# sourceMappingURL=SearchFacetDialogHelperDynamicHierarchy.d.ts.map