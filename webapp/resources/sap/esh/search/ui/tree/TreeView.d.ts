declare module "sap/esh/search/ui/tree/TreeView" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import Tree, { $TreeSettings, Tree$ToggleOpenStateEvent } from "sap/m/Tree";
    import TreeNode from "sap/esh/search/ui/tree/TreeNode";
    import { BaseTreeNodeFactory } from "sap/esh/search/ui/tree/TreeNodeFactory";
    interface $TreeViewSettings extends $TreeSettings {
        treeNodeFactory: BaseTreeNodeFactory | string;
    }
    /**
     * @namespace sap.esh.search.ui.tree.TreeView
     */
    export default class TreeView extends Tree {
        focusTreeNodeId: string;
        static readonly metadata: {
            properties: {
                treeNodeFactory: {
                    type: string;
                };
            };
        };
        constructor(sId?: string, options?: $TreeViewSettings);
        saveFocus(): void;
        restoreFocus(): Promise<void>;
        setTreeNodeFactory(treeNodeFactory: BaseTreeNodeFactory): void;
        getTreeNodeFactory(): BaseTreeNodeFactory;
        destroy(bSuppressInvalidate: any): void;
        handleToggleOpenState(event: Tree$ToggleOpenStateEvent): void;
        expandTreeNodes(): void;
        expandTreeNodeRecursively(treeNode: TreeNode): void;
        doExpand(treeNode: TreeNode): void;
        static renderer: {
            apiVersion: number;
        };
    }
}
//# sourceMappingURL=TreeView.d.ts.map