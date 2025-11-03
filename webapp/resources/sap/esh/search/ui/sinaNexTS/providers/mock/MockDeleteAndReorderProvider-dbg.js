/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["../sample2/Provider"], function (___sample2_Provider) {
  "use strict";

  const Sample2Provider = ___sample2_Provider["Provider"];
  class MockDeleteAndReorderProvider extends Sample2Provider {
    id = "mock_deleteandreorder";
    static searchCount = 0;

    // simple provider that routes queries to Sample2Provider
    //  - 1st search is unmodified
    // then for every search execution:
    //  - the item 1 and item 2 change order
    //  - item 3, then 4, then 5, ... are temporarily removed and added back on next search

    async executeSearchQuery(query) {
      MockDeleteAndReorderProvider.searchCount++;
      const resultSet = await super.executeSearchQuery(query);
      if (!resultSet) return resultSet;

      // delete only 1 item: item 3, then 4, then 5, ... (index 2, then 3, then 4, ...)
      const deleteIndex = 2 + MockDeleteAndReorderProvider.searchCount - 2;
      const items = resultSet.items.slice();
      if (MockDeleteAndReorderProvider.searchCount > 1 &&
      // do not delete on first search
      deleteIndex >= 2 &&
      // skip swapping items (indices 0 and 1)
      deleteIndex < items.length) {
        items.splice(deleteIndex, 1);
      }

      // for first two items, swap them every second searchCount
      if (items.length > 1 && MockDeleteAndReorderProvider.searchCount % 2 === 0) {
        [items[0], items[1]] = [items[1], items[0]];
      }
      return this.sina._createSearchResultSet({
        ...resultSet,
        items
      });
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.MockDeleteAndReorderProvider = MockDeleteAndReorderProvider;
  return __exports;
});
//# sourceMappingURL=MockDeleteAndReorderProvider-dbg.js.map
