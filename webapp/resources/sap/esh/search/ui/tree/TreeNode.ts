/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { createTmpData, deleteTmpData, getTmpData, TmpData } from "./tmpData";
import { BaseTreeNodeFactory } from "./TreeNodeFactory";

export interface TreeNodeProperties {
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
    childTreeNodes: Array<TreeNode> = [];
    tmpDataId: string; // TODO wrong naming
    constructor(props: TreeNodeProperties) {
        this.id = props.id;
        this.label = props.label;
        this.expanded = props.expanded ?? false;
        this.expandable = props.expandable ?? false;
        this.adjustPlaceholderChildTreeNode();
    }
    setTreeNodeFactory(treeNodeFactory: BaseTreeNodeFactory) {
        this.getData().treeNodeFactory = treeNodeFactory;
    }
    getTreeNodeFactory(): BaseTreeNodeFactory {
        return this.getData().treeNodeFactory;
    }
    hasPlaceholderTreeNode(): boolean {
        return this.childTreeNodes.find((treeNode: TreeNode) => treeNode.id === "dummy") !== undefined;
    }
    adjustPlaceholderChildTreeNode() {
        // TODO public/private
        if (this.expandable) {
            if (this.childTreeNodes.length === 0) {
                this.addPlaceholderTreeNode(); // TODO explanation
            }
        } else {
            if (this.hasPlaceholderTreeNode()) {
                this.removePlaceHolderChildTreeNode();
            }
        }
    }
    addPlaceholderTreeNode() {
        // TODO rename dummy -> placeholder
        if (this.hasPlaceholderTreeNode()) {
            return;
        }
        this.childTreeNodes.push({ id: "dummy" } as TreeNode);
    }
    removePlaceHolderChildTreeNode() {
        if (!this.hasPlaceholderTreeNode()) {
            return;
        }
        this.childTreeNodes.splice(0, 1);
    }
    getChildTreeNodeById(id: string): TreeNode {
        for (const childTreeNode of this.childTreeNodes) {
            if (childTreeNode.id === id) {
                return childTreeNode;
            }
        }
    }
    addChildTreeNode(treeNode: TreeNode) {
        this.expandable = true;
        this.removePlaceHolderChildTreeNode();
        this.childTreeNodes.push(treeNode);
        treeNode.getData().parentTreeNode = this;
        treeNode.register();
    }
    addChildTreeNodes(treeNodes: Array<TreeNode>) {
        for (const treeNode of treeNodes) {
            this.addChildTreeNode(treeNode);
        }
    }
    addChildTreeNodeAtIndex(treeNode: TreeNode, insertionIndex: number) {
        this.expandable = true;
        this.removePlaceHolderChildTreeNode();
        this.childTreeNodes.splice(insertionIndex, 0, treeNode);
        treeNode.getData().parentTreeNode = this;
        treeNode.register();
    }
    removeChildTreeNode(treeNode: TreeNode) {
        const index = this.childTreeNodes.indexOf(treeNode);
        if (index < 0) {
            return;
        }
        this.childTreeNodes.splice(index, 1);
        treeNode.getData().parentTreeNode = null;
        treeNode.deRegister();
        this.adjustPlaceholderChildTreeNode();
    }
    delete() {
        // delete children
        for (const childTreeNode of this.childTreeNodes.slice()) {
            if (childTreeNode.id === "dummy") {
                continue;
            }
            childTreeNode.delete();
        }
        // detach from parent (+unregister)
        const parentTreeNode = this.getData().parentTreeNode;
        if (parentTreeNode) {
            parentTreeNode.removeChildTreeNode(this);
        }
        if (this.tmpDataId) {
            deleteTmpData(this.tmpDataId);
        }
    }
    deleteChildTreeNodes() {
        for (const childTreeNode of this.childTreeNodes.slice()) {
            if (childTreeNode.id === "dummy") {
                continue;
            }
            childTreeNode.delete();
        }
    }
    register() {
        const parentTreeNode = this.getData().parentTreeNode;
        if (!parentTreeNode.getTreeNodeFactory()) {
            return; // parent node not registered -> registration at the moment not possible TODO explantion
        }
        parentTreeNode.getTreeNodeFactory().registerTreeNode(this);
        for (const childTreeNode of this.childTreeNodes) {
            if (childTreeNode.id === "dummy") {
                continue;
            }
            childTreeNode.register();
        }
    }
    deRegister() {
        if (!this.getTreeNodeFactory()) {
            return; // not registered -> nothing todo
        }
        this.getTreeNodeFactory().deRegisterTreeNode(this);
        for (const childTreeNode of this.childTreeNodes) {
            if (childTreeNode.id === "dummy") {
                continue;
            }
            childTreeNode.deRegister();
        }
    }
    /**
     * storage for private data TODO
     * @returns {object}
     */
    getData(): TmpData {
        if (!this.tmpDataId) {
            const tmpData = createTmpData();
            this.tmpDataId = tmpData.tmpDataId;
            return tmpData;
        }
        return getTmpData(this.tmpDataId);
    }

    async setExpanded(expanded: boolean, updateUI?: boolean) {
        this.expanded = expanded;
        if (this.getTreeNodeFactory().testMode) {
            return;
        }
        this.getTreeNodeFactory().saveFocus();
        if (this.expanded) {
            // expand
            try {
                this.deleteChildTreeNodes();
                this.getTreeNodeFactory().setBusy(true);
                const childTreeNodes = await this.fetchChildTreeNodes();
                if (childTreeNodes.length === 0) {
                    this.expanded = false;
                    this.setExpandable(false);
                } else {
                    this.addChildTreeNodes(childTreeNodes);
                }
            } finally {
                this.getTreeNodeFactory().setBusy(false);
            }
        } else {
            // collapse
            this.deleteChildTreeNodes();
        }
        if (updateUI) {
            this.getTreeNodeFactory().updateUI();
        }
        this.getTreeNodeFactory().restoreFocus();
    }

    async fetchChildTreeNodes(): Promise<Array<TreeNode>> {
        // check cache
        const treeNodeFactory = this.getTreeNodeFactory();
        let childTreeNodes: Array<TreeNode> = treeNodeFactory.cache.get(this.id) as Array<TreeNode>;
        if (childTreeNodes) {
            return childTreeNodes;
        }
        // ajax call
        childTreeNodes = await this.fetchChildTreeNodesImpl();
        // update cache
        treeNodeFactory.cache.set(this.id, childTreeNodes);
        return childTreeNodes;
    }

    fetchChildTreeNodesImpl(): Promise<Array<TreeNode>> {
        return Promise.resolve([]);
    }

    setExpandable(expandable: boolean) {
        this.expandable = expandable;
        this.adjustPlaceholderChildTreeNode();
    }

    async updateRecursively(): Promise<void> {
        const childTreeNodesFromServer = await this.fetchChildTreeNodes();
        this.updateChildren(childTreeNodesFromServer);
        for (const childTreeNode of this.childTreeNodes) {
            if (childTreeNode.id === "dummy") {
                continue;
            }
            if (!childTreeNode.expanded) {
                continue;
            }
            await childTreeNode.updateRecursively();
        }
    }

    updateChildren(childTreeNodesFromServer: Array<TreeNode>) {
        const selectNewChildTreeNode = (childTreeNodeFromServer) => {
            const oldTreeNode = this.getTreeNodeFactory().getTreeNode(childTreeNodeFromServer.id);
            if (oldTreeNode) {
                // reuse existing node
                oldTreeNode.getParentTreeNode().removeChildTreeNode(oldTreeNode);
                return oldTreeNode;
            } else {
                // use server node
                return childTreeNodeFromServer;
            }
        };

        if (childTreeNodesFromServer.length === 0) {
            this.deleteChildTreeNodes();
            this.expanded = false;
            this.setExpandable(false);
            return;
        }
        this.removePlaceHolderChildTreeNode();
        let childTreeNode: TreeNode;
        for (let i = 0; i < childTreeNodesFromServer.length; ++i) {
            const childTreeNodeFromServer = childTreeNodesFromServer[i];
            if (i <= this.childTreeNodes.length - 1) {
                // 1 node exists at position i
                childTreeNode = this.childTreeNodes[i];
                if (childTreeNode.id === childTreeNodeFromServer.id) {
                    // 1.1 correct node at position i -> nothing todo
                } else {
                    // 1.2 wrong node at position i -> add child node at position i
                    childTreeNode = selectNewChildTreeNode(childTreeNodeFromServer);
                    this.addChildTreeNodeAtIndex(childTreeNode, i);
                }
            } else {
                // 2 no node at position i -> add new node
                childTreeNode = selectNewChildTreeNode(childTreeNodeFromServer);
                this.addChildTreeNode(childTreeNode);
            }

            // update node properties
            //  childTreeNode.label = childTreeNodeFromServer.label;
            this.updateTreeNodeProperties(childTreeNode, childTreeNodeFromServer);
            Object.assign(childTreeNode.getData(), childTreeNodeFromServer.getData());
            if (childTreeNode.expandable !== childTreeNodeFromServer.expandable) {
                if (childTreeNodeFromServer.expandable) {
                    childTreeNode.setExpandable(true);
                } else {
                    childTreeNode.deleteChildTreeNodes();
                    childTreeNode.setExpandable(false);
                    childTreeNode.expanded = false;
                }
            }

            // if server node not used -> delete
            if (childTreeNode !== childTreeNodeFromServer) {
                childTreeNodeFromServer.delete();
            }
        }
        // delete superfluous nodes
        while (this.childTreeNodes.length > childTreeNodesFromServer.length) {
            childTreeNode = this.childTreeNodes[this.childTreeNodes.length - 1];
            if (childTreeNode.id === "dummy") {
                this.removePlaceHolderChildTreeNode();
            } else {
                childTreeNode.delete();
            }
        }
    }

    updateTreeNodeProperties(targetTreeNode: TreeNode, sourceTreeNode: TreeNode) {
        const excludeProperties = ["id", "expanded", "expandable", "childTreeNodes", "tmpDataId"];
        for (const propertyName in sourceTreeNode) {
            if (excludeProperties.indexOf(propertyName) >= 0) {
                continue;
            }
            const value = sourceTreeNode[propertyName];
            if (["number", "string", "boolean"].indexOf(typeof value) < 0) {
                continue;
            }
            targetTreeNode[propertyName] = value;
        }
    }

    visitChildNodesRecursively(callback): void {
        for (const childTreeNode of this.childTreeNodes) {
            if (childTreeNode.id === "dummy") {
                continue;
            }
            callback(childTreeNode);
            childTreeNode.visitChildNodesRecursively(callback);
        }
    }

    visitParentNodesRecursively(callback): void {
        const parentTreeNode = this.getParentTreeNode();
        if (parentTreeNode) {
            callback(parentTreeNode);
            parentTreeNode.visitParentNodesRecursively(callback);
        }
    }

    getParentTreeNode(): TreeNode {
        return this.getData().parentTreeNode;
    }

    isVisible(): boolean {
        const isExpanded = function (node: TreeNode) {
            if (!node.expanded) {
                return false;
            }
            const parentNode = node.getParentTreeNode();
            if (!parentNode) {
                return true;
            }
            return isExpanded(parentNode);
        };
        const parentNode = this.getParentTreeNode();
        if (!parentNode) {
            return true;
        }
        return isExpanded(parentNode);
    }

    hasChildNodes(): boolean {
        for (const childTreeNode of this.childTreeNodes) {
            if (childTreeNode.id === "dummy") {
                continue;
            }
            return true;
        }
        return false;
    }

    hasExpandedChildNode(): boolean {
        for (const childTreeNode of this.childTreeNodes) {
            if (childTreeNode.id === "dummy") {
                continue;
            }
            if (childTreeNode.expanded || childTreeNode.hasExpandedChildNode()) {
                return true;
            }
        }
        return false;
    }
}
