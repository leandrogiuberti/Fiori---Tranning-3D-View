declare module "sap/esh/search/ui/controls/facets/types/SearchFacetQuickSelectDataSource" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { $ListSettings } from "sap/m/List";
    import StandardListItem from "sap/m/StandardListItem";
    import CustomListItem from "sap/m/CustomListItem";
    import SearchFacetHierarchyStaticTreeItem from "sap/esh/search/ui/controls/facets/types/SearchFacetHierarchyStaticTreeItem";
    import { DataSource } from "sap/esh/search/ui/sinaNexTS/sina/DataSource";
    import VBox from "sap/m/VBox";
    interface QuickSelectDataSource {
        dataSource: DataSource;
        type: "quickSelectDataSourceTreeNode";
        children: Array<{
            dataSource: DataSource;
        }>;
    }
    /**
     * Quick-select datasource facet
     */
    /**
     * @namespace sap.esh.search.ui.controls
     */
    export default class SearchFacetQuickSelectDataSource extends VBox {
        private tree;
        constructor(sId?: string, options?: Partial<$ListSettings>);
        handleSelectDataSource(dataSource: DataSource): void;
        createTree(): CustomListItem;
        expandTreeNodes(): void;
        expandTreeNodeRecursively(node: any, isRootNode?: boolean): void;
        doExpandTreeNode(node: any): void;
        createTreeItem(sId: string, oContext: any): SearchFacetHierarchyStaticTreeItem;
        createListItem(): StandardListItem;
        static renderer: {
            apiVersion: number;
        };
    }
}
//# sourceMappingURL=SearchFacetQuickSelectDataSource.d.ts.map