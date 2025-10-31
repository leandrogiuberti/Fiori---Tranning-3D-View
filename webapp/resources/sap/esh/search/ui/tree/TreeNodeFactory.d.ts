declare module "sap/esh/search/ui/tree/TreeNodeFactory" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import JSONModel from "sap/ui/model/json/JSONModel";
    import { IBusyIndicator } from "sap/esh/search/ui/BusyIndicator";
    import TreeNode from "sap/esh/search/ui/tree/TreeNode";
    import TreeView from "sap/esh/search/ui/tree/TreeView";
    import { TreeCache } from "sap/esh/search/ui/tree/TreeCache";
    interface TreeNodeFactoryProperties<T extends TreeNode, C extends new (...args: any[]) => T> {
        rootTreeNodePath: string;
        model: JSONModel;
        treeNodeConstructor: C;
        testMode?: boolean;
        busyIndicator: IBusyIndicator;
    }
    abstract class BaseTreeNodeFactory {
        cache: TreeCache;
        rootTreeNodePath: string;
        testMode: boolean;
        constructor(rootTreeNodePath: string, testMode: boolean);
        abstract registerTreeNode(treeNode: TreeNode): any;
        abstract deRegisterTreeNode(treeNode: TreeNode): any;
        abstract registerTreeView(treeView: TreeView): any;
        abstract deRegisterTreeView(treeView: TreeView): any;
        abstract updateUI(): any;
        abstract saveFocus(): any;
        abstract restoreFocus(): any;
        abstract getRootTreeNode(): TreeNode;
        abstract getTreeNode(id: string): TreeNode;
        abstract setBusy(isBusy: boolean): any;
    }
    export default class TreeNodeFactory<T extends TreeNode, C extends new (...args: any[]) => T> extends BaseTreeNodeFactory {
        model: JSONModel;
        treeNodeMap: {
            [internalId: string]: T;
        };
        rootTreeNode: T;
        treeViews: Array<TreeView>;
        treeNodeConstructor: C;
        busyIndicator: IBusyIndicator;
        constructor(props: TreeNodeFactoryProperties<T, C>);
        static create<T extends TreeNode, C extends new (...args: any[]) => T>(props: TreeNodeFactoryProperties<T, C>): TreeNodeFactory<T, C>;
        createRootTreeNode(...props: ConstructorParameters<C>): T;
        createTreeNode(...props: ConstructorParameters<C>): T;
        registerTreeNode(treeNode: T): void;
        deRegisterTreeNode(treeNode: T): void;
        getTreeNode(id: string): T;
        setRootTreeNodePath(rootTreeNodePath: string): void;
        updateUI(): void;
        saveFocus(): void;
        restoreFocus(): void;
        setBusy(isBusy: boolean): void;
        registerTreeView(treeView: TreeView): void;
        deRegisterTreeView(treeView: TreeView): void;
        getRootTreeNode(): TreeNode;
        updateRecursively(updateUI?: boolean): Promise<void>;
        delete(): void;
    }
}
//# sourceMappingURL=TreeNodeFactory.d.ts.map