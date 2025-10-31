/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { FacetResultSet, FacetResultSetOptions } from "./FacetResultSet";
import { HierarchyNode } from "./HierarchyNode";
import { HierarchyQuery } from "./HierarchyQuery";
import { FacetType } from "./FacetType";

export interface HierarchyResultSetOptions extends FacetResultSetOptions {
    node: HierarchyNode;
}

export class HierarchyResultSet extends FacetResultSet {
    type: FacetType = FacetType.Hierarchy;
    declare query: HierarchyQuery;
    node: HierarchyNode;
    constructor(properties: HierarchyResultSetOptions) {
        super(properties);
        this.node = properties.node;
    }
}
