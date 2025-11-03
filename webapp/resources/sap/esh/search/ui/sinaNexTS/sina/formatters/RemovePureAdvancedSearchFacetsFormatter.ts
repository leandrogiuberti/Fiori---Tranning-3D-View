/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import * as util from "../../core/util";
import { SearchResultSet } from "../SearchResultSet";
import { Formatter } from "./Formatter";

export class RemovePureAdvancedSearchFacetsFormatter extends Formatter {
    initAsync(): Promise<void> {
        return Promise.resolve();
    }

    format(resultSet: SearchResultSet): SearchResultSet {
        return util.removePureAdvancedSearchFacets(resultSet);
    }

    formatAsync(resultSet: SearchResultSet): Promise<SearchResultSet> {
        resultSet = util.removePureAdvancedSearchFacets(resultSet); //find emails phone nrs etc and augment attribute if required
        return Promise.resolve(resultSet);
    }
}
