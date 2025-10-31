/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { Condition } from "./Condition";
import { FacetResultSetItem, FacetResultSetItemOptions } from "./FacetResultSetItem";

export interface ChartResultSetItemOptions extends FacetResultSetItemOptions {
    filterCondition: Condition;
    icon?: string;
}
export class ChartResultSetItem extends FacetResultSetItem {
    // _meta: {
    //     properties: {
    //         filterCondition: {
    //             required: true
    //         }
    //     }
    // }

    filterCondition: Condition;
    icon: string;

    constructor(properties: ChartResultSetItemOptions) {
        super(properties);
        this.filterCondition = properties.filterCondition ?? this.filterCondition;
        this.icon = properties.icon;
    }
}
