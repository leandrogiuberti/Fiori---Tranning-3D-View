/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { SearchQuery } from "../../sina/SearchQuery";
import { SearchResultSet } from "../../sina/SearchResultSet";
import { Provider as Sample2Provider } from "../sample2/Provider";

export class MockDeleteAndReorderProvider extends Sample2Provider {
    readonly id = "mock_deleteandreorder";
    static searchCount = 0;

    // simple provider that routes queries to Sample2Provider
    //  - 1st search is unmodified
    // then for every search execution:
    //  - the item 1 and item 2 change order
    //  - item 3, then 4, then 5, ... are temporarily removed and added back on next search

    override async executeSearchQuery(query: SearchQuery): Promise<SearchResultSet | undefined> {
        MockDeleteAndReorderProvider.searchCount++;
        const resultSet = await super.executeSearchQuery(query);
        if (!resultSet) return resultSet;

        // delete only 1 item: item 3, then 4, then 5, ... (index 2, then 3, then 4, ...)
        const deleteIndex = 2 + MockDeleteAndReorderProvider.searchCount - 2;
        const items = resultSet.items.slice();
        if (
            MockDeleteAndReorderProvider.searchCount > 1 && // do not delete on first search
            deleteIndex >= 2 && // skip swapping items (indices 0 and 1)
            deleteIndex < items.length
        ) {
            items.splice(deleteIndex, 1);
        }

        // for first two items, swap them every second searchCount
        if (items.length > 1 && MockDeleteAndReorderProvider.searchCount % 2 === 0) {
            [items[0], items[1]] = [items[1], items[0]];
        }

        return this.sina._createSearchResultSet({
            ...resultSet,
            items,
        });
    }
}
