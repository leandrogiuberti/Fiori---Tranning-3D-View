/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define([], function () {
  "use strict";

  class SearchResultSetItemMemory {
    items = {};
    reset() {
      this.items = {};
    }
    getItem(key) {
      let item = this.items[key];
      if (!item) {
        item = {};
        this.items[key] = item;
      }
      return item;
    }
    setExpanded(key, expanded) {
      const item = this.getItem(key);
      item.expanded = expanded;
    }
    getExpanded(key) {
      return this.getItem(key).expanded;
    }
  }
  return SearchResultSetItemMemory;
});
//# sourceMappingURL=SearchResultItemMemory-dbg.js.map
