/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { FacetResultSet } from "./FacetResultSet";
import { Query, QueryOptions } from "./Query";
import { ResultSet } from "./ResultSet";

export class FacetQuery extends Query {
    constructor(readonly properties: QueryOptions) {
        super(properties);
    }

    clone(): FacetQuery {
        return new FacetQuery(this.properties);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _execute(query: FacetQuery): Promise<FacetResultSet> {
        return Promise.resolve(null);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _formatResultSetAsync(resultSet: ResultSet): Promise<void> {
        return Promise.resolve(null);
    }
}
