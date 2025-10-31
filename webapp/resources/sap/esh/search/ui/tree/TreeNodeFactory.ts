/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import JSONModel from "sap/ui/model/json/JSONModel";
import { DummyBusyIndicator, IBusyIndicator } from "../BusyIndicator";
import TreeNode from "./TreeNode";
import TreeView from "./TreeView";
import { TreeCache } from "./TreeCache";

export interface TreeNodeFactoryProperties<T extends TreeNode, C extends new (...args: any[]) => T> {
    rootTreeNodePath: string;
    model: JSONModel;
    treeNodeConstructor: C;
    testMode?: boolean;
    busyIndicator: IBusyIndicator;
}

export abstract class BaseTreeNodeFactory {
    cache: TreeCache;
    rootTreeNodePath: string;
    testMode: boolean;
    constructor(rootTreeNodePath: string, testMode: boolean) {
        this.rootTreeNodePath = rootTreeNodePath;
        this.testMode = testMode;
        this.cache = new TreeCache();
    }
    abstract registerTreeNode(treeNode: TreeNode);
    abstract deRegisterTreeNode(treeNode: TreeNode);
    abstract registerTreeView(treeView: TreeView);
    abstract deRegisterTreeView(treeView: TreeView);
    abstract updateUI();
    abstract saveFocus();
    abstract restoreFocus();
    abstract getRootTreeNode(): TreeNode;
    abstract getTreeNode(id: string): TreeNode;
    abstract setBusy(isBusy: boolean);
}
export default class TreeNodeFactory<
    T extends TreeNode,
    C extends new (...args: any[]) => T,
> extends BaseTreeNodeFactory {
    model: JSONModel;
    treeNodeMap: { [internalId: string]: T } = {};
    rootTreeNode: T;
    treeViews: Array<TreeView> = [];
    treeNodeConstructor: C;
    busyIndicator: IBusyIndicator;
    constructor(props: TreeNodeFactoryProperties<T, C>) {
        super(props.rootTreeNodePath, props.testMode);
        this.rootTreeNodePath = props.rootTreeNodePath;
        this.model = props.model;
        this.treeNodeConstructor = props.treeNodeConstructor;
        this.busyIndicator = props.busyIndicator ?? new DummyBusyIndicator();
    }
    static create<T extends TreeNode, C extends new (...args: any[]) => T>(
        props: TreeNodeFactoryProperties<T, C>
    ): TreeNodeFactory<T, C> {
        const treeNodeFactory = new TreeNodeFactory<T, C>(props);
        return treeNodeFactory;
    }
    createRootTreeNode(...props: ConstructorParameters<C>): T {
        props[0].expandable = true;
        props[0].expanded = true;
        this.rootTreeNode = this.createTreeNode(...props);
        this.registerTreeNode(this.rootTreeNode);
        return this.rootTreeNode;
    }
    createTreeNode(...props: ConstructorParameters<C>): T {
        const treeNode = new this.treeNodeConstructor(...props);
        return treeNode;
    }
    registerTreeNode(treeNode: T) {
        if (this.treeNodeMap[treeNode.id]) {
            throw "duplicate tree id" + treeNode.id;
        }
        treeNode.setTreeNodeFactory(this);
        this.treeNodeMap[treeNode.id] = treeNode;
    }
    deRegisterTreeNode(treeNode: T) {
        treeNode.setTreeNodeFactory(null);
        delete this.treeNodeMap[treeNode.id];
    }
    getTreeNode(id: string): T {
        return this.treeNodeMap[id];
    }
    setRootTreeNodePath(rootTreeNodePath: string) {
        this.rootTreeNodePath = rootTreeNodePath;
    }
    updateUI() {
        this.model.setProperty(this.rootTreeNodePath, { childTreeNodes: [] });
        this.model.setProperty(this.rootTreeNodePath, this.rootTreeNode);
        for (const treeView of this.treeViews) {
            treeView.expandTreeNodes();
        }
    }
    saveFocus() {
        for (const treeView of this.treeViews) {
            treeView.saveFocus();
        }
    }
    restoreFocus() {
        for (const treeView of this.treeViews) {
            treeView.restoreFocus();
        }
    }
    setBusy(isBusy: boolean) {
        this.busyIndicator.setBusy(isBusy);
    }
    registerTreeView(treeView: TreeView) {
        this.treeViews.push(treeView);
    }
    deRegisterTreeView(treeView: TreeView) {
        const index = this.treeViews.indexOf(treeView);
        if (index >= 0) {
            this.treeViews.splice(index, 1);
        }
    }
    getRootTreeNode(): TreeNode {
        return this.rootTreeNode;
    }
    async updateRecursively(updateUI?: boolean) {
        try {
            this.setBusy(true);
            await this.rootTreeNode.updateRecursively();
            if (updateUI) {
                await this.updateUI();
            }
        } finally {
            this.setBusy(false);
        }
    }
    delete() {
        this.getRootTreeNode().delete();
    }
}
