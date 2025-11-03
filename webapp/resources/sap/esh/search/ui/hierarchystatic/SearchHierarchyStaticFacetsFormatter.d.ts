declare module "sap/esh/search/ui/hierarchystatic/SearchHierarchyStaticFacetsFormatter" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    /*!
     * The SearchHierarchyStaticFacetsFormatter is called from the search model after each search.
     * The formatter assembles the static facets from the sina search result.
     */
    import SearchModel from "sap/esh/search/ui/SearchModel";
    import { SearchResultSet } from "sap/esh/search/ui/sinaNexTS/sina/SearchResultSet";
    import SearchHierarchyStaticFacet from "sap/esh/search/ui/hierarchystatic/SearchHierarchyStaticFacet";
    import { DataSource } from "sap/esh/search/ui/sinaNexTS/sina/DataSource";
    export default class SearchHierarchyStaticFacetsFormatter {
        model: SearchModel;
        facetMap: {
            [key: string]: SearchHierarchyStaticFacet;
        };
        constructor(model: SearchModel);
        getFacetAttributes(resultSet: SearchResultSet): Array<{
            attributeId: string;
            dataSource: DataSource;
        }>;
        getFacet(resultSet: SearchResultSet, model: SearchModel, facetAttribute: any): Promise<SearchHierarchyStaticFacet>;
        getFacets(resultSet: SearchResultSet): Promise<Array<SearchHierarchyStaticFacet>>;
        destroy(): void;
        handleDataSourceChanged(): void;
    }
}
//# sourceMappingURL=SearchHierarchyStaticFacetsFormatter.d.ts.map