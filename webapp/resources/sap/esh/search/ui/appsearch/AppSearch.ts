/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import CatalogSearch from "./CatalogSearch";

export default class AppSearch {
    private catalogSearch: CatalogSearch;
    private searchProviders: Array<CatalogSearch>;

    constructor() {
        this.catalogSearch = new CatalogSearch();
        this.searchProviders = [this.catalogSearch]; // deactivate transaction search
    }

    prefetch(): void {
        for (let i = 0; i < this.searchProviders.length; i++) {
            const searchProvider = this.searchProviders[i];
            searchProvider.prefetch();
        }
    }

    async search(query: { searchTerm: string; top: number; skip: number }): Promise<{
        totalCount: number;
        tiles: Array<unknown>;
    }> {
        const queryPromises = [];
        for (let i = 0; i < this.searchProviders.length; i++) {
            const searchProvider = this.searchProviders[i];
            queryPromises.push(searchProvider.search(query));
        }
        return Promise.all(queryPromises).then(function (subResults) {
            const result = {
                totalCount: 0,
                tiles: [],
            };
            for (let i = 0; i < subResults.length; i++) {
                const subResult = subResults[i];
                result.totalCount += subResult.totalCount;
                result.tiles.push(...subResult.tiles);
            }
            return result;
        });
    }
}
