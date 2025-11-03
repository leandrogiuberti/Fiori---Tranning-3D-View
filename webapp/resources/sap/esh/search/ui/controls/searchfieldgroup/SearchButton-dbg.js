/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["../../i18n", "sap/esh/search/ui/SearchHelper", "sap/m/Button", "sap/ui/core/IconPool"], function (__i18n, SearchHelper, Button, IconPool) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const i18n = _interopRequireDefault(__i18n);
  /**
   * @namespace sap.esh.search.ui.controls
   */
  const SearchButton = Button.extend("sap.esh.search.ui.controls.SearchButton", {
    renderer: {
      apiVersion: 2
    },
    constructor: function _constructor(sId, options) {
      Button.prototype.constructor.call(this, sId, options);
      this.setIcon(IconPool.getIconURI("search"));
      this.setTooltip(i18n.getText("search"));
      this.bindProperty("enabled", {
        parts: [{
          path: "/initializingObjSearch"
        }],
        formatter: function (initializingObjSearch) {
          return !SearchHelper.isSearchAppActive() || !initializingObjSearch;
        }
      });
      this.addStyleClass("searchBtn");
    }
  });
  return SearchButton;
});
//# sourceMappingURL=SearchButton-dbg.js.map
