/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { SinaError } from "./errors";

class DuplicateException extends SinaError {
    node: Node;

    constructor(properties: { message?: string; node: Node }) {
        properties.message = properties.message ?? "Duplicate node";
        super({
            message: properties.message,
            name: "DuplicateException",
        });
        this.node = properties.node;
    }
}

/**
 * Creates unique labels for system data sources.
 * 
 * examples:
 * datasource     system client    --> calculated label
 * Purchase Order CER    002           Purchase Order
 * Sales Order    CER    002           Sales Order

 * datasource     system client    --> calculated label         include system to make label unique
 * Purchase Order CER    002           Purchase Order CER
 * Purchase Order CES    003           Purchase Order CES

 * datasource     system client    --> calculated label        include system and client to make label unique
 * Purchase Order CES    002           Purchase Order CES 002
 * Purchase Order CES    003           Purchase Order CES 003

 * datasource     system client    --> calculated label
 * Purchase Order CER    002           Purchase Order duplicate ...
 * Purchase Order CER    002           Purchase Order duplicate ...
 */
class Node {
    data: { label: string; labelPlural: string };
    obj: unknown;
    parent: Node;
    nodeId: string;
    labelCalculator: LabelCalculator;
    childMap: { [key: string]: Node };
    children: Array<Node>;

    constructor(parent: Node, nodeId: string, labelCalculator: LabelCalculator) {
        this.parent = parent;
        this.nodeId = nodeId;
        this.labelCalculator = labelCalculator;
        this.childMap = {};
        this.children = [];
    }

    insert(keyPath: Array<string>, obj: unknown) {
        // check for end of recursion
        if (keyPath.length === 0) {
            this.data = this.labelCalculator.options.data(obj);
            this.obj = obj;
            this.calculateLabel();
            return;
        }

        // insert recursively into tree
        const key = keyPath[0];
        let subNode = this.childMap[key];
        if (keyPath.length === 1 && subNode) {
            throw new DuplicateException({
                node: subNode,
            });
        }
        if (!subNode) {
            subNode = new Node(this, key, this.labelCalculator);
            this.childMap[key] = subNode;
            this.children.push(subNode);
            if (this.children.length === 2) {
                this.children[0].recalculateLabels();
                // whenever a node gets a sibling -> recalculate labels of node because due to
                // the sibling we need to add more keys to the label to make the label unique
            }
        }
        subNode.insert(keyPath.slice(1), obj);
    }

    recalculateLabels() {
        const leafs = [];
        this.collectLeafs(leafs);
        for (let i = 0; i < leafs.length; ++i) {
            leafs[i].calculateLabel();
        }
    }

    collectLeafs(leafs) {
        if (this.isLeaf()) {
            leafs.push(this);
            return;
        }
        for (let i = 0; i < this.children.length; ++i) {
            this.children[i].collectLeafs(leafs);
        }
    }

    isLeaf() {
        return this.children.length === 0;
    }

    hasSibling() {
        return this.parent && this.parent.children.length >= 2;
    }

    isChildOfRoot() {
        return this.parent && this.parent.nodeId === "__ROOT";
    }

    collectPath(keyPath: Array<string>, force?: boolean) {
        if (!this.parent) {
            return;
        }
        if (force || this.hasSibling() || this.isChildOfRoot()) {
            keyPath.push(this.nodeId);
            force = true;
        }
        if (this.parent) {
            this.parent.collectPath(keyPath, force);
        }
    }

    calculateLabel() {
        // collect keys = labels
        const keyPath = [];
        this.collectPath(keyPath);
        keyPath.reverse();

        // calculate label
        this.labelCalculator.options.setLabel(this.obj, keyPath, this.data);
    }
}

export class LabelCalculator {
    options: {
        data: (objToBeLabeled: unknown) => {
            label: string;
            labelPlural: string;
        };
        key: (objToBeLabeled: unknown) => Array<string>;
        setFallbackLabel: (objToBeLabeled, data) => void;
        setLabel: (objToBeLabeled, keyPath, data) => void;
    };
    rootNode: Node;

    constructor(options) {
        this.options = options;
        this.rootNode = new Node(null, "__ROOT", this);
    }

    calculateLabel(obj: unknown): void {
        const key = this.options.key(obj);
        try {
            // insert datasource into datasource tree
            // for the inserted datasource a unique label is calculated
            // for datasource in sibling tree branches the label is recalculated
            this.rootNode.insert(key, obj);
        } catch (e) {
            if (e.name === "DuplicateException") {
                this.options.setFallbackLabel(e.node.obj, e.node.data); // set fallback label for already existing node
                this.options.setFallbackLabel(obj, this.options.data(obj)); // and for duplicate node
                return;
            }
            throw e;
        }
    }
}
