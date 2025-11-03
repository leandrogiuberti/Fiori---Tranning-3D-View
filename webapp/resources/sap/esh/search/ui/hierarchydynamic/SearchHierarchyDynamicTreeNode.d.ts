declare module "sap/esh/search/ui/hierarchydynamic/SearchHierarchyDynamicTreeNode" {
    import TreeNode, { TreeNodeProperties } from "sap/esh/search/ui/tree/TreeNode";
    import SearchHierarchyDynamicFacet from "sap/esh/search/ui/hierarchydynamic/SearchHierarchyDynamicFacet";
    interface SearchHierarchyDynamicTreeNodeProperties extends TreeNodeProperties {
        count: number;
        facet: SearchHierarchyDynamicFacet;
    }
    export default class SearchHierarchyDynamicTreeNode extends TreeNode {
        count: number;
        selected: boolean;
        partiallySelected: boolean;
        hasFilter: boolean;
        constructor(props: SearchHierarchyDynamicTreeNodeProperties);
        fetchChildTreeNodesImpl(): Promise<Array<SearchHierarchyDynamicTreeNode>>;
        setExpanded(expanded: boolean, updateUI?: boolean): Promise<void>;
        toggleFilter(): void;
        setFilter(set: boolean): void;
    }
}
//# sourceMappingURL=SearchHierarchyDynamicTreeNode.d.ts.map