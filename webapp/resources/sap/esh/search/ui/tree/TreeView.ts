/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import Tree, { $TreeSettings, Tree$ToggleOpenStateEvent } from "sap/m/Tree";
import { delayedExecution } from "../SearchHelper";
import TreeNode from "./TreeNode";
import { BaseTreeNodeFactory } from "./TreeNodeFactory";
import { ListSeparators } from "sap/m/library";

interface $TreeViewSettings extends $TreeSettings {
    treeNodeFactory: BaseTreeNodeFactory | string;
}

/**
 * @namespace sap.esh.search.ui.tree.TreeView
 */
export default class TreeView extends Tree {
    focusTreeNodeId: string;
    static readonly metadata = {
        properties: {
            treeNodeFactory: {
                type: "object",
            },
        },
    };
    constructor(sId?: string, options?: $TreeViewSettings) {
        if (typeof sId === "object") {
            options = sId;
        }
        options.toggleOpenState = (event: Tree$ToggleOpenStateEvent) => {
            this.handleToggleOpenState(event);
        };
        super(sId, options);
        this.setShowSeparators(ListSeparators.None);
        this.expandTreeNodes = delayedExecution(this.expandTreeNodes, 200);
        this.setBusyIndicatorDelay(200);
    }

    saveFocus() {
        const domRef = this.getDomRef();
        if (!domRef) {
            this.focusTreeNodeId = undefined;
            return;
        }
        const childDomRefs = domRef.querySelectorAll(".sapMTreeItemBase");
        for (let i = 0; i < childDomRefs.length; ++i) {
            const childDomRef = childDomRefs.item(i);
            if (childDomRef === document.activeElement) {
                this.focusTreeNodeId = childDomRef.getAttribute("data-esh-tree-node-id");
                return;
            }
        }
        this.focusTreeNodeId = undefined;
    }

    async restoreFocus() {
        const isFocused = () => {
            return document.activeElement.getAttribute("data-esh-tree-node-id") === this.focusTreeNodeId;
        };
        const setFocus = () => {
            const items = this.getItems();
            for (const item of items) {
                if ((item.getBindingContext().getObject() as TreeNode).id === this.focusTreeNodeId) {
                    item.focus();
                    return;
                }
            }
        };
        const wait = (delay) =>
            new Promise(function (resolve) {
                setTimeout(resolve, delay);
            });
        for (let i = 0; i < 10; ++i) {
            await wait(200);
            if (isFocused()) {
                return;
            }
            setFocus();
        }
    }

    setTreeNodeFactory(treeNodeFactory: BaseTreeNodeFactory) {
        this.setProperty("treeNodeFactory", treeNodeFactory);
        if (treeNodeFactory) {
            treeNodeFactory.registerTreeView(this);
        }
    }

    getTreeNodeFactory(): BaseTreeNodeFactory {
        return this.getProperty("treeNodeFactory");
    }

    destroy(bSuppressInvalidate) {
        super.destroy(bSuppressInvalidate);
        this.getTreeNodeFactory().deRegisterTreeView(this);
    }

    handleToggleOpenState(event: Tree$ToggleOpenStateEvent) {
        const treeNode: TreeNode = (event.getParameter("itemContext") as any).getObject(); // TODO: remove any once ui5 type is implemented
        treeNode.setExpanded(event.getParameter("expanded"), true);
    }

    expandTreeNodes() {
        if (this.isDestroyed()) {
            return;
        }
        this.collapseAll();
        this.expandTreeNodeRecursively(this.getTreeNodeFactory().getRootTreeNode());
    }

    expandTreeNodeRecursively(treeNode: TreeNode): void {
        if (treeNode.expanded) {
            this.doExpand(treeNode);
        }
        for (const childTreeNode of treeNode.childTreeNodes) {
            if (childTreeNode.id === "dummy") {
                continue;
            }
            this.expandTreeNodeRecursively(childTreeNode);
        }
    }

    doExpand(treeNode: TreeNode): void {
        const items = this.getItems();
        for (let i = 0; i < items.length; ++i) {
            const item = items[i];
            const context = item.getBindingContext();
            if (!context) {
                continue;
            }
            const itemTreeNode = context.getObject();
            if (itemTreeNode === treeNode) {
                this.expand(i);
                return;
            }
        }
    }

    static renderer = {
        apiVersion: 2,
    };
}
