/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { HierarchyNode } from "./HierarchyNode";
import { SinaObject, SinaObjectProperties } from "./SinaObject";

export interface HierarchyNodePathProperties extends SinaObjectProperties {
    name: string;
    path: Array<HierarchyNode>;
}
export class HierarchyNodePath extends SinaObject {
    name: string;
    path: Array<HierarchyNode>;
    constructor(properties: HierarchyNodePathProperties) {
        super(properties);
        this.name = properties.name;
        this.path = properties.path;
    }
}
