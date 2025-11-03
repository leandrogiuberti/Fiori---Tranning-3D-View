/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { SinaObject, SinaObjectProperties } from "./SinaObject";

export interface HierarchyNodeProperties extends SinaObjectProperties {
    id: string;
    label?: string;
    count?: number;
    hasChildren?: boolean;
    icon?: string;
    isFirst?: boolean;
    isLast?: boolean;
}

export class HierarchyNode extends SinaObject {
    id: string;
    label: string;
    count: number;
    hasChildren: boolean;
    icon?: string;
    isFirst?: boolean;
    isLast?: boolean;
    parentNode: HierarchyNode;
    childNodes: HierarchyNode[];
    childNodeMap: { [id: string]: HierarchyNode };
    constructor(properties: HierarchyNodeProperties) {
        super(properties);
        this.id = properties.id;
        this.label = properties.label;
        this.count = properties.count;
        this.hasChildren = properties.hasChildren;
        this.icon = properties.icon;
        this.isFirst = properties.isFirst;
        this.isLast = properties.isLast;
        this.parentNode = null;
        this.childNodes = [];
        this.childNodeMap = {};
    }
    equals(other: HierarchyNode): boolean {
        return this.id === other.id;
    }
    addChildNode(child: HierarchyNode): void {
        if (this.childNodeMap[child.id]) {
            return;
        }
        this.childNodes.push(child);
        this.childNodeMap[child.id] = child;
        child.parentNode = this;
    }
}
