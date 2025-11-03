declare module "sap/esh/search/ui/hierarchystatic/SearchHierarchyStaticTreeNode" {
    import { HierarchyNode } from "sap/esh/search/ui/sinaNexTS/sina/HierarchyNode";
    import TreeNode, { TreeNodeProperties } from "sap/esh/search/ui/tree/TreeNode";
    import SearchHierarchyStaticFacet from "sap/esh/search/ui/hierarchystatic/SearchHierarchyStaticFacet";
    interface SearchHierarchyStaticTreeNodeProperties extends TreeNodeProperties {
        icon?: string;
        facet: SearchHierarchyStaticFacet;
    }
    export default class SearchHierarchyStaticTreeNode extends TreeNode {
        hasFilter: boolean;
        icon: string;
        constructor(props: SearchHierarchyStaticTreeNodeProperties);
        setExpanded(expanded: boolean, updateUI?: boolean): Promise<void>;
        toggleFilter(): Promise<void>;
        setFilter(set: boolean): void;
        removeExistingFilters(): void;
        fetchChildTreeNodesImpl(): Promise<Array<SearchHierarchyStaticTreeNode>>;
        updateNodePath(path: Array<HierarchyNode>, index: number): void;
    }
}
//# sourceMappingURL=SearchHierarchyStaticTreeNode.d.ts.map