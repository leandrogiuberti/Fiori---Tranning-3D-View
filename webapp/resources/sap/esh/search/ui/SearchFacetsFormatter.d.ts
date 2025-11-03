declare module "sap/esh/search/ui/SearchFacetsFormatter" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import ErrorHandler from "sap/esh/search/ui/error/ErrorHandler";
    import SearchHierarchyDynamicFacetsFormatter from "sap/esh/search/ui/hierarchydynamic/SearchHierarchyDynamicFacetsFormatter";
    import SearchHierarchyStaticFacetsFormatter from "sap/esh/search/ui/hierarchystatic/SearchHierarchyStaticFacetsFormatter";
    import Facet from "sap/esh/search/ui/Facet";
    import { DataSource } from "sap/esh/search/ui/sinaNexTS/sina/DataSource";
    import { SearchResultSet } from "sap/esh/search/ui/sinaNexTS/sina/SearchResultSet";
    import SearchFacetDialogModel from "sap/esh/search/ui/SearchFacetDialogModel";
    import { ChartResultSet } from "sap/esh/search/ui/sinaNexTS/sina/ChartResultSet";
    import SearchModel from "sap/esh/search/ui/SearchModel";
    interface TreeNode {
        expanded: boolean;
        type: string;
        label: string;
        icon: string;
        getDataSource: () => DataSource;
        dataSourceId: string;
        children: Array<TreeNode>;
        toggleExpand: () => void;
    }
    interface TreeNode {
        expanded: boolean;
        type: string;
        label: string;
        icon: string;
        getDataSource: () => DataSource;
        dataSourceId: string;
        children: Array<TreeNode>;
        toggleExpand: () => void;
    }
    export default class SearchFacetsFormatter {
        searchFacetDialogModel: SearchModel;
        errorHandler: ErrorHandler;
        hierarchyDynamicFacetsFormatter: SearchHierarchyDynamicFacetsFormatter;
        hierarchyStaticFacetsFormatter: SearchHierarchyStaticFacetsFormatter;
        treeQuickSelectDataSourceFacet: any;
        constructor(searchModel: SearchModel);
        private _getAncestorDataSources;
        private _getSiblingDataSources;
        private _getChildrenDataSources;
        getDataSourceFacetFromTree(searchModel: SearchModel): Facet;
        private _createFacetItemsFromConditionGroup;
        private _formatLabel;
        private getAttributeFacetsFromResultSet;
        addDataTypeToClientSideFacets(aClientSideFacets: any, searchModel: SearchModel): void;
        addQuickSelectDataSourceFacet(searchModel: SearchModel, facets: Array<any>): void;
        createListQuickSelectDataSourceFacet(searchModel: SearchModel): any;
        createTreeQuickSelectDataSourceFacet(searchModel: SearchModel): any;
        expandPathToSelectedDataSource(searchModel: SearchModel, rootNode: TreeNode): void;
        createTreeNodeQuickSelectDataSource(treeNodeProps: any): TreeNode;
        getFacets(oDataSource: DataSource, searchResultSet: SearchResultSet, searchModel: SearchModel): Promise<any>;
        setFacetIndex(facets: any): void;
        sortFacets(facets: Array<Facet>, searchModel: SearchModel): void;
        getDialogFacetsFromMetaData(dataSource: DataSource, searchFacetDialogModel: SearchFacetDialogModel): Array<any>;
        getAttributeDialogFacetsFromMetaData(oMetaData: DataSource, searchFacetDialogModel: SearchFacetDialogModel): Array<any>;
        getDialogFacetsFromChartQuery(resultSet: ChartResultSet, searchModel: SearchModel, dimension: string, filters?: Array<any>): Facet;
        hasDialogFacetsFromMetaData(searchModel: SearchModel): boolean;
        handleDataSourceChanged(): void;
        destroy(): void;
    }
}
//# sourceMappingURL=SearchFacetsFormatter.d.ts.map