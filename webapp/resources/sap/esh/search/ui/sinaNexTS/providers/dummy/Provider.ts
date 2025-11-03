/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { NotImplementedError } from "../../core/errors";
import { ChartResultSet } from "../../sina/ChartResultSet";
import { HierarchyQuery } from "../../sina/HierarchyQuery";
import { HierarchyResultSet } from "../../sina/HierarchyResultSet";
import { SearchResultSet } from "../../sina/SearchResultSet";
import { SuggestionResultSet } from "../../sina/SuggestionResultSet";
import { AbstractProvider } from "../AbstractProvider";

export class Provider extends AbstractProvider {
    executeSearchQuery(): Promise<SearchResultSet> {
        throw new NotImplementedError();
    }
    executeChartQuery(): Promise<ChartResultSet> {
        throw new NotImplementedError();
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    executeHierarchyQuery(query: HierarchyQuery): Promise<HierarchyResultSet> {
        throw new NotImplementedError();
    }
    async executeSuggestionQuery(): Promise<SuggestionResultSet> {
        throw new NotImplementedError();
    }
    id = "dummy";

    async initAsync(): Promise<void> {
        return Promise.resolve();
    }
}
