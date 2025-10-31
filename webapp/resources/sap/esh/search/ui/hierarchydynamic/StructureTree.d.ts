declare module "sap/esh/search/ui/hierarchydynamic/StructureTree" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    /*!
     * When manipulating the filter conditions (for instance changing the search term) hierarchy nodes may appear/disappear.
     * In case a filter is set for a disappeared hierarchy node we want to show the hierarchy node (without count) anyway.
     * The structure tree is always updated with hierarchy structure information from the server.
     * In case a node is not included in the server response the node may be taken from the structure tree.
     */
    import { HierarchyNode } from "sap/esh/search/ui/sinaNexTS/sina/HierarchyNode";
    import { HierarchyNodePath } from "sap/esh/search/ui/sinaNexTS/sina/HierarchyNodePath";
    interface StructureTreeNodeOptions {
        id: string;
        label: string;
        tree?: StructureTree;
    }
    class StructureTreeNode {
        id: string;
        label: string;
        tree: StructureTree;
        childNodes: Array<StructureTreeNode>;
        childNodeMap: {
            [key: string]: StructureTreeNode;
        };
        parentNode: StructureTreeNode;
        constructor(properties: StructureTreeNodeOptions);
        addChildNode(node: StructureTreeNode): void;
        update(sinaNode: HierarchyNode): void;
    }
    interface StructureTreeOptions {
        rootNode: {
            id: string;
            label: string;
        };
    }
    export default class StructureTree {
        node: StructureTreeNode;
        nodeMap: {
            [key: string]: StructureTreeNode;
        };
        constructor(options: StructureTreeOptions);
        createNode(properties: StructureTreeNodeOptions): StructureTreeNode;
        getNode(id: string): StructureTreeNode;
        update(sinaNode: HierarchyNode): void;
        updateFromHierarchyNodePath(hierarchyNodePath: HierarchyNodePath): void;
    }
}
//# sourceMappingURL=StructureTree.d.ts.map