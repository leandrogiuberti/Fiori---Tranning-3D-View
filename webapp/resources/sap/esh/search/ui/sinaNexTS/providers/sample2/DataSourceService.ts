/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { Sina } from "../../sina/Sina";
import { DataSource } from "../../sina/DataSource";
import { SuggestionQuery } from "../../sina/SuggestionQuery";
import { getMatchedStringValues, readFile } from "./Util";
import { DataSourceType } from "../../sina/DataSourceType";

export interface DataSourceResponse {
    results: DataSource[]; // total results
    totalCount: number;
}

export class DataSourceService {
    sina: Sina;
    dataSourceIds = [] as string[];

    constructor(sina: Sina, dataSourceIds: string[]) {
        this.sina = sina;
        this.dataSourceIds = dataSourceIds;
    }

    async loadDataSources(): Promise<void> {
        // data sources have been loaded
        if (this.sina.dataSources.some((dataSource) => dataSource.type === DataSourceType.BusinessObject)) {
            return;
        }

        // data sources have not been loaded yet, load them from JSON files
        for (const dataSourceId of this.dataSourceIds) {
            const content = await readFile(
                `/resources/sap/esh/search/ui/sinaNexTS/providers/sample2/data/${dataSourceId}.json`
            );
            this.sina.dataSourceFromJson(JSON.parse(content));
        }
    }

    getDataSourceById(dataSourceId: string): DataSource {
        return this.sina.dataSources.find((dataSource) => dataSource.id === dataSourceId);
    }

    getResponse(query: SuggestionQuery): DataSourceResponse {
        const matchedDataSources = [];
        for (const dataSource of this.sina.dataSources) {
            if (
                getMatchedStringValues([dataSource.labelPlural, dataSource.label], query.filter.searchTerm)
                    .length > 0
            ) {
                matchedDataSources.push(dataSource);
            }
        }
        return { results: matchedDataSources, totalCount: matchedDataSources.length };
    }
}
