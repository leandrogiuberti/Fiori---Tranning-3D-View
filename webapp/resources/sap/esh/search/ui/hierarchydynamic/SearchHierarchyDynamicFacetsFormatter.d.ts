declare module "sap/esh/search/ui/hierarchydynamic/SearchHierarchyDynamicFacetsFormatter" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    /*!
     * The SearchHierarchyDynamicFacetsFormatter is called from the search model after each search.
     * The formatter assembles the dynamic facets from the sina search result.
     */
    import SearchModel from "sap/esh/search/ui/SearchModel";
    import SearchFacetDialogModel from "sap/esh/search/ui/SearchFacetDialogModel";
    import { DataSource } from "sap/esh/search/ui/sinaNexTS/sina/DataSource";
    import { FacetResultSet } from "sap/esh/search/ui/sinaNexTS/sina/FacetResultSet";
    import { SearchResultSet } from "sap/esh/search/ui/sinaNexTS/sina/SearchResultSet";
    import SearchHierarchyDynamicFacet from "sap/esh/search/ui/hierarchydynamic/SearchHierarchyDynamicFacet";
    export default class SearchHierarchyDynamicFacetsFormatter {
        testCounter: number;
        facetMap: {
            [key: string]: SearchHierarchyDynamicFacet;
        };
        facetFromMetadataMap: {
            [key: string]: SearchHierarchyDynamicFacet;
        };
        model: SearchModel;
        constructor(model: SearchModel);
        getFacetAttributes(resultSet: SearchResultSet): Array<any>;
        getFacetFromResultSet(resultSet: SearchResultSet, attributeId: string): FacetResultSet;
        getFacet(resultSet: SearchResultSet, searchModel: SearchModel, attributeId: string): Promise<SearchHierarchyDynamicFacet>;
        getFacets(resultSet: SearchResultSet, searchModel: SearchModel): any;
        destroy(): void;
        handleDataSourceChanged(): void;
        getFacetFromMetadata(attributeId: string, dataSource: DataSource, searchFacetDialogModel: SearchFacetDialogModel): SearchHierarchyDynamicFacet;
        getFacetsFromMetadata(dataSource: DataSource, searchFacetDialogModel: SearchFacetDialogModel): Array<SearchHierarchyDynamicFacet>;
    }
}
//# sourceMappingURL=SearchHierarchyDynamicFacetsFormatter.d.ts.map