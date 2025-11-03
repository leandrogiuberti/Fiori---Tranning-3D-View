/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["sap/esh/search/ui/appsearch/JsSearch"], function (JsSearch) {
  "use strict";

  const jsSearchFactory = {
    createJsSearch: function (options) {
      return new JsSearch(options);
    }
  };
  return jsSearchFactory;
});
//# sourceMappingURL=JsSearchFactory-dbg.js.map
