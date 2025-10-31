/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { ChartQuery } from "./ChartQuery";
import { ChartResultSetItem } from "./ChartResultSetItem";
import { FacetResultSet, FacetResultSetOptions } from "./FacetResultSet";
import { FacetType } from "./FacetType";

export type ChartResultSetOptions = FacetResultSetOptions;
export class ChartResultSet extends FacetResultSet {
    declare items: Array<ChartResultSetItem>;
    type: FacetType = FacetType.Chart;
    declare query: ChartQuery;
}
