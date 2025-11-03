declare module "sap/esh/search/ui/hierarchystatic/SearchHierarchyStaticFacet" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    /*!
     * The SearchHierarchyStaticFacet class is used for the model representation of static hierarchy facets.
     * The corresponding UI control is SearchFacetHierarchyStatic.
     */
    import SearchModel from "sap/esh/search/ui/SearchModel";
    import { ComplexCondition } from "sap/esh/search/ui/sinaNexTS/sina/ComplexCondition";
    import { DataSource } from "sap/esh/search/ui/sinaNexTS/sina/DataSource";
    import { Filter } from "sap/esh/search/ui/sinaNexTS/sina/Filter";
    import { HierarchyNodePath } from "sap/esh/search/ui/sinaNexTS/sina/HierarchyNodePath";
    import { SimpleCondition } from "sap/esh/search/ui/sinaNexTS/sina/SimpleCondition";
    import { Sina } from "sap/esh/search/ui/sinaNexTS/sina/Sina";
    import TreeNodeFactory from "sap/esh/search/ui/tree/TreeNodeFactory";
    import SearchHierarchyStaticTreeNode from "sap/esh/search/ui/hierarchystatic/SearchHierarchyStaticTreeNode";
    interface SearchHierarchyStaticFacetOptions {
        model: SearchModel;
        attributeId: string;
        dataSource: DataSource;
        filter: Filter;
        title: string;
    }
    export default class SearchHierarchyStaticFacet {
        static readonly rootNodeId = "$$ROOT$$";
        model: SearchModel;
        attributeId: string;
        dataSource: DataSource;
        filter: Filter;
        title: string;
        sina: Sina;
        facetType: string;
        facetIndex: number;
        position: number;
        treeNodeFactory: TreeNodeFactory<SearchHierarchyStaticTreeNode, typeof SearchHierarchyStaticTreeNode>;
        rootTreeNode: SearchHierarchyStaticTreeNode;
        constructor(properties: SearchHierarchyStaticFacetOptions);
        setFacetIndex(index: number): void;
        initAsync(): Promise<void>;
        activateFilters(): Promise<void>;
        updateTree(): Promise<void>;
        doUpdateTree(): Promise<void>;
        getComplexConditionOfFacet(): ComplexCondition;
        getFilterConditions(): Array<SimpleCondition>;
        mixinFilterNodes(): Promise<void>;
        handleModelUpdate(): void;
        delete(): void;
        autoExpandFirstFilterNode(): Promise<void>;
        updateNodesFromHierarchyNodePaths(hierarchyNodePaths: Array<HierarchyNodePath>): void;
    }
}
//# sourceMappingURL=SearchHierarchyStaticFacet.d.ts.map