/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { FacetQuery } from "./FacetQuery";
import { FacetResultSetItem } from "./FacetResultSetItem";
import { FacetType } from "./FacetType";
import { ResultSet, ResultSetOptions } from "./ResultSet";

export interface FacetResultSetOptions extends ResultSetOptions {
    facetTotalCount: number;
}

export class FacetResultSet extends ResultSet {
    declare items: Array<FacetResultSetItem>;
    declare query: FacetQuery;
    type: FacetType;
    facetTotalCount: number;

    constructor(properties: FacetResultSetOptions) {
        super(properties);
        this.facetTotalCount = properties.facetTotalCount ?? this.facetTotalCount;
    }
    toString(): string {
        const result = [];
        result.push("### Facet " + this.title);
        for (let i = 0; i < this.items.length; ++i) {
            const item = this.items[i];
            result.push("  - [ ] " + item.toString());
        }
        if (this.items.length === 0) {
            result.push("No attribute filters found");
        }
        return result.join("\n");
    }
}
