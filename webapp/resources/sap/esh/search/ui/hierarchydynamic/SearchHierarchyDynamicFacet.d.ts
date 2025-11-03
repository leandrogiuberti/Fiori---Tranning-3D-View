declare module "sap/esh/search/ui/hierarchydynamic/SearchHierarchyDynamicFacet" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    /*!
     * The SearchHierarchyDynamicFacet class is used for the model representation of dynamic hierarchy facets.
     * * The corresponding UI control is SearchFacetHierarchyDynamic.
     */
    import SearchModel from "sap/esh/search/ui/SearchModel";
    import { ComplexCondition } from "sap/esh/search/ui/sinaNexTS/sina/ComplexCondition";
    import { Condition } from "sap/esh/search/ui/sinaNexTS/sina/Condition";
    import { DataSource } from "sap/esh/search/ui/sinaNexTS/sina/DataSource";
    import { Filter } from "sap/esh/search/ui/sinaNexTS/sina/Filter";
    import { HierarchyNode } from "sap/esh/search/ui/sinaNexTS/sina/HierarchyNode";
    import { HierarchyNodePath } from "sap/esh/search/ui/sinaNexTS/sina/HierarchyNodePath";
    import { HierarchyResultSet } from "sap/esh/search/ui/sinaNexTS/sina/HierarchyResultSet";
    import { SimpleCondition } from "sap/esh/search/ui/sinaNexTS/sina/SimpleCondition";
    import { Sina } from "sap/esh/search/ui/sinaNexTS/sina/Sina";
    import TreeNodeFactory from "sap/esh/search/ui/tree/TreeNodeFactory";
    import SearchHierarchyDynamicTreeNode from "sap/esh/search/ui/hierarchydynamic/SearchHierarchyDynamicTreeNode";
    import StructureTree from "sap/esh/search/ui/hierarchydynamic/StructureTree";
    type SetFilterCallback = (node: SearchHierarchyDynamicTreeNode, set: boolean, filterCondition: SimpleCondition) => void;
    interface SearchHierarchyDynamicFacetOptions {
        model: SearchModel;
        sina: Sina;
        dataSource: DataSource;
        attributeId: string;
        title: string;
        filter: Filter;
        modelPathPrefix: string;
        isShowMoreDialog?: boolean;
        handleSetFilter?: SetFilterCallback;
    }
    export default class SearchHierarchyDynamicFacet {
        static readonly rootNodeId = "$$ROOT$$";
        model: SearchModel;
        sina: Sina;
        dataSource: DataSource;
        attributeId: string;
        title: string;
        filter: Filter;
        modelPathPrefix: string;
        isShowMoreDialog: boolean;
        handleSetFilter: SetFilterCallback;
        filterCount?: number;
        dimension: string;
        facetType: string;
        facetIndex: number;
        structureTree: StructureTree;
        notDisplayedFilterConditions: Array<any>;
        treeNodeFactory: TreeNodeFactory<SearchHierarchyDynamicTreeNode, typeof SearchHierarchyDynamicTreeNode>;
        rootTreeNode: SearchHierarchyDynamicTreeNode;
        constructor(properties: SearchHierarchyDynamicFacetOptions);
        setFilter(filter: Filter): void;
        setHandleSetFilter(handleSetFilter: SetFilterCallback): void;
        setFacetIndex(index: number): void;
        updateStructureTree(sinaNode: HierarchyNode): void;
        activateFilters(): Promise<void>;
        updateFromResultSet(resultSet: HierarchyResultSet): Promise<void>;
        getComplexConditionOfFacet(): ComplexCondition;
        getFilterConditions(): Array<Condition>;
        mixinFilterNodes(): void;
        calculateFilterCount(): void;
        addMissingFilterNode(id: string): boolean;
        calculateCheckboxStatus(): void;
        calculateCheckboxStatusFromLeafNode(leafNode: SearchHierarchyDynamicTreeNode): void;
        handleModelUpdate(): void;
        delete(): void;
        updateNodesFromHierarchyNodePaths(hierarchyNodePaths: Array<HierarchyNodePath>): void;
    }
}
//# sourceMappingURL=SearchHierarchyDynamicFacet.d.ts.map