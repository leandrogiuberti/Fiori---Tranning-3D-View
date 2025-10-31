/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import * as util from "../../core/util";
import { ResultSet } from "../ResultSet";
import { SearchResultSet } from "../SearchResultSet";
import { Formatter } from "./Formatter";

export class NavtargetsInResultSetFormatter extends Formatter {
    initAsync(): Promise<void> {
        return Promise.resolve();
    }

    format(resultSet: ResultSet): ResultSet {
        return resultSet;
    }

    async formatAsync(resultSet: SearchResultSet): Promise<SearchResultSet> {
        resultSet = util.addPotentialNavTargets(resultSet); //find emails phone nrs etc and augment attribute if required
        return Promise.resolve(resultSet);
    }
}
