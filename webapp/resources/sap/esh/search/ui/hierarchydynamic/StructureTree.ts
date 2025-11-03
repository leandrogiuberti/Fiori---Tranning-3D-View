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

import { HierarchyNode } from "../sinaNexTS/sina/HierarchyNode";
import { HierarchyNodePath } from "../sinaNexTS/sina/HierarchyNodePath";

export interface StructureTreeNodeOptions {
    id: string;
    label: string;
    tree?: StructureTree;
}
export class StructureTreeNode {
    id: string;
    label: string;
    tree: StructureTree;
    childNodes: Array<StructureTreeNode>;
    childNodeMap: { [key: string]: StructureTreeNode };
    parentNode: StructureTreeNode;

    constructor(properties: StructureTreeNodeOptions) {
        this.id = properties.id;
        this.label = properties.label;
        this.tree = properties.tree;
        this.childNodes = [];
        this.childNodeMap = {};
        this.parentNode = null;
    }

    addChildNode(node: StructureTreeNode) {
        this.childNodes.push(node);
        this.childNodeMap[node.id] = node;
        node.parentNode = this;
    }

    update(sinaNode: HierarchyNode) {
        for (let i = 0; i < sinaNode.childNodes.length; ++i) {
            const sinaChildNode = sinaNode.childNodes[i];
            let childNode = this.childNodeMap[sinaChildNode.id];
            if (!childNode) {
                childNode = this.tree.createNode({ id: sinaChildNode.id, label: sinaChildNode.label });
                this.addChildNode(childNode);
            }
            childNode.update(sinaChildNode);
        }
    }
}

export interface StructureTreeOptions {
    rootNode: { id: string; label: string };
}
export default class StructureTree {
    node: StructureTreeNode;
    nodeMap: { [key: string]: StructureTreeNode };

    constructor(options: StructureTreeOptions) {
        this.nodeMap = {};
        this.node = this.createNode(options.rootNode);
    }

    createNode(properties: StructureTreeNodeOptions): StructureTreeNode {
        properties.tree = this;
        const node = new StructureTreeNode(properties);
        this.nodeMap[properties.id] = node;
        return node;
    }

    getNode(id: string): StructureTreeNode {
        return this.nodeMap[id];
    }

    update(sinaNode: HierarchyNode): void {
        const node = this.nodeMap[sinaNode.id];
        if (!node) {
            throw new Error(`structure tree update failed, node does not exist: ${sinaNode?.id}`);
        }
        node.update(sinaNode);
    }

    updateFromHierarchyNodePath(hierarchyNodePath: HierarchyNodePath) {
        let parentNode: StructureTreeNode;
        for (const hierarchyNode of hierarchyNodePath.path) {
            let node = this.getNode(hierarchyNode.id);
            if (!node) {
                node = this.createNode({
                    id: hierarchyNode.id,
                    label: hierarchyNode.label || hierarchyNode.id,
                });
                if (!parentNode) {
                    throw "program error, parent node not set";
                }
                parentNode.addChildNode(node);
            }
            parentNode = node;
        }
    }
}
