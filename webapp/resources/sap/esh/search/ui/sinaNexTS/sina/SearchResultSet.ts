/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { ResultSet, ResultSetOptions } from "./ResultSet";
import { SearchResultSetItem } from "./SearchResultSetItem";
import { FacetResultSet } from "./FacetResultSet";
import { HierarchyNodePath } from "./HierarchyNodePath";
import { NlqResult } from "./NlqResult";
import { AttributeType } from "./AttributeType";

export interface SearchResultSetOptions extends ResultSetOptions {
    facets?: Array<FacetResultSet>;
    totalCount: number;
    hierarchyNodePaths?: Array<HierarchyNodePath>;
    nlqResult?: NlqResult;
}
export class SearchResultSet extends ResultSet {
    // _meta: {
    //     properties: {
    //         facets: {
    //             required: false,
    //             default: function () {
    //                 return [];
    //             }
    //         },
    //         totalCount: {
    //             required: true
    //         },
    //     }
    // },
    facets: Array<FacetResultSet> = [];
    totalCount: number;
    nlqResult?: NlqResult;
    declare items: Array<SearchResultSetItem>;
    hierarchyNodePaths: Array<HierarchyNodePath> = [];

    constructor(properties: SearchResultSetOptions) {
        super(properties);
        this.facets = properties.facets ?? this.facets;
        this.totalCount = properties.totalCount ?? this.totalCount;
        this.hierarchyNodePaths = properties.hierarchyNodePaths ?? this.hierarchyNodePaths;
        this.nlqResult = properties.nlqResult;
    }

    toString(...args: Array<string>): string {
        const result = [];
        result.push(ResultSet.prototype.toString.apply(this, args));
        for (let i = 0; i < this.facets.length; ++i) {
            if (i === 0) {
                result.push("## Facets");
            }
            const facet = this.facets[i];
            result.push(facet.toString());
        }
        return result.join("\n");
    }

    // sina search result -> sample2/data/...csv in string
    toCSV(): string {
        console.log("===== Parse Result to CSV String: =====\n");
        if (this.items.length === 0) {
            console.log("");
            return "";
        }

        let csvTitle = "";
        for (const attribute of this.items[0].attributes) {
            csvTitle = csvTitle.concat('"' + attribute.id + '",');
        }
        csvTitle = csvTitle.slice(0, -1).concat("\n"); // remove last comma, add new line

        let csvBody = "";
        for (const item of this.items) {
            for (const attribute of item.attributes) {
                if (
                    attribute.metadata?.type === AttributeType.Double ||
                    attribute.metadata?.type === AttributeType.Integer
                ) {
                    csvBody = csvBody.concat('"' + attribute.value?.toString() + '",');
                } else {
                    csvBody = csvBody.concat('"' + attribute.valueFormatted + '",');
                }
            }
            csvBody = csvBody.slice(0, -1).concat("\n"); // remove last comma, add new line
        }
        csvBody = csvBody.slice(0, -1); // remove last new line

        console.log(csvTitle.concat(csvBody));
        return csvTitle.concat(csvBody);
    }
}
