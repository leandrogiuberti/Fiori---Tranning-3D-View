/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["./SearchShellHelper"], function (__SearchShellHelper) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const SearchShellHelper = _interopRequireDefault(__SearchShellHelper);
  class SearchShellLoader {
    constructor(opts) {
      this.initAsync(opts);
    }
    async initAsync(opts) {
      const searchField = await opts.getSearchField();
      SearchShellHelper.init(searchField);
    }
  }
  return SearchShellLoader;
});
//# sourceMappingURL=SearchShellLoader-dbg.js.map
