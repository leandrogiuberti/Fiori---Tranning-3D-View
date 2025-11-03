declare module "sap/esh/search/ui/tree/TreeNode" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { TmpData } from "sap/esh/search/ui/tree/tmpData";
    import { BaseTreeNodeFactory } from "sap/esh/search/ui/tree/TreeNodeFactory";
    interface TreeNodeProperties {
        id: string;
        label: string;
        expanded?: boolean;
        expandable?: boolean;
    }
    export default class TreeNode {
        id: string;
        label: string;
        expanded: boolean;
        expandable: boolean;
        childTreeNodes: Array<TreeNode>;
        tmpDataId: string;
        constructor(props: TreeNodeProperties);
        setTreeNodeFactory(treeNodeFactory: BaseTreeNodeFactory): void;
        getTreeNodeFactory(): BaseTreeNodeFactory;
        hasPlaceholderTreeNode(): boolean;
        adjustPlaceholderChildTreeNode(): void;
        addPlaceholderTreeNode(): void;
        removePlaceHolderChildTreeNode(): void;
        getChildTreeNodeById(id: string): TreeNode;
        addChildTreeNode(treeNode: TreeNode): void;
        addChildTreeNodes(treeNodes: Array<TreeNode>): void;
        addChildTreeNodeAtIndex(treeNode: TreeNode, insertionIndex: number): void;
        removeChildTreeNode(treeNode: TreeNode): void;
        delete(): void;
        deleteChildTreeNodes(): void;
        register(): void;
        deRegister(): void;
        /**
         * storage for private data TODO
         * @returns {object}
         */
        getData(): TmpData;
        setExpanded(expanded: boolean, updateUI?: boolean): Promise<void>;
        fetchChildTreeNodes(): Promise<Array<TreeNode>>;
        fetchChildTreeNodesImpl(): Promise<Array<TreeNode>>;
        setExpandable(expandable: boolean): void;
        updateRecursively(): Promise<void>;
        updateChildren(childTreeNodesFromServer: Array<TreeNode>): void;
        updateTreeNodeProperties(targetTreeNode: TreeNode, sourceTreeNode: TreeNode): void;
        visitChildNodesRecursively(callback: any): void;
        visitParentNodesRecursively(callback: any): void;
        getParentTreeNode(): TreeNode;
        isVisible(): boolean;
        hasChildNodes(): boolean;
        hasExpandedChildNode(): boolean;
    }
}
//# sourceMappingURL=TreeNode.d.ts.map