/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { DataSource } from "./DataSource";
import { FacetQuery } from "./FacetQuery";
import { QueryOptions } from "./Query";

export interface DataSourceQueryOptions extends QueryOptions {
    dataSource: DataSource;
}

export class DataSourceQuery extends FacetQuery {
    dataSource: DataSource;

    constructor(properties: DataSourceQueryOptions) {
        super(properties);
        this.dataSource = properties.dataSource ?? this.dataSource;
    }
}
