/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { DataSourceResultSetItem } from "./DataSourceResultSetItem";
import { FacetResultSet } from "./FacetResultSet";
import { FacetType } from "./FacetType";
import { ResultSetOptions } from "./ResultSet";

export interface DataSourceResultSetOptions extends ResultSetOptions {
    facetTotalCount: number;
}

export class DataSourceResultSet extends FacetResultSet {
    type: FacetType = FacetType.DataSource;
    declare items: Array<DataSourceResultSetItem>;
}
