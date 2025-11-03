/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { FacetResultSetItem, FacetResultSetItemOptions } from "./FacetResultSetItem";
import { DataSource } from "./DataSource";

export interface DataSourceResultSetItemOptions extends FacetResultSetItemOptions {
    dataSource: DataSource;
}
export class DataSourceResultSetItem extends FacetResultSetItem {
    // _meta: {
    //     properties: {
    //         dataSource: {
    //             required: true
    //         }
    //     }
    // }
    dataSource: DataSource;

    constructor(properties: DataSourceResultSetItemOptions) {
        super(properties);
        this.dataSource = properties.dataSource ?? this.dataSource;
    }
}
