/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { ResultSetItem } from "./ResultSetItem";
import { SinaObjectProperties } from "./SinaObject";

export interface FacetResultSetItemOptions extends SinaObjectProperties {
    dimensionValueFormatted: string;
    measureValue: number;
    measureValueFormatted: string;
}
export class FacetResultSetItem extends ResultSetItem {
    // _meta: {
    //     properties: {
    //         dimensionValueFormatted: {
    //             required: true
    //         },
    //         measureValue: {
    //             required: true
    //         },
    //         measureValueFormatted: {
    //             required: true
    //         }
    //     }
    // },

    dimensionValueFormatted: string;
    measureValue: number;
    measureValueFormatted: string;

    constructor(properties: FacetResultSetItemOptions) {
        super(properties);
        this.dimensionValueFormatted = properties.dimensionValueFormatted ?? this.dimensionValueFormatted;
        this.measureValue = properties.measureValue ?? this.measureValue;
        this.measureValueFormatted = properties.measureValueFormatted ?? this.measureValueFormatted;
    }

    toString(): string {
        return this.dimensionValueFormatted + ": " + this.measureValueFormatted;
    }
}
