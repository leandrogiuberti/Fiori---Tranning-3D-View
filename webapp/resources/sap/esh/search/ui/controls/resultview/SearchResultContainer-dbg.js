/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["sap/ui/layout/VerticalLayout"], function (VerticalLayout) {
  "use strict";

  /**
   * @namespace sap.esh.search.ui.controls
   */
  const SearchResultContainer = VerticalLayout.extend("sap.esh.search.ui.controls.SearchResultContainer", {
    renderer: {
      apiVersion: 2
    },
    constructor: function _constructor(sId) {
      VerticalLayout.prototype.constructor.call(this, sId);
      // define group for F6 handling
      this.data("sap-ui-fastnavgroup", "true", true /* write  into DOM */);
      this.addStyleClass("sapUshellSearchResultContainer"); // obsolete
      this.addStyleClass("sapElisaSearchResultContainer");
    },
    getNoResultScreen: function _getNoResultScreen() {
      return this.noResultScreen;
    },
    setNoResultScreen: function _setNoResultScreen(object) {
      this.removeContent(this.noResultScreen);
      this.noResultScreen = object;
      this.addContent(this.noResultScreen);
    }
  });
  return SearchResultContainer;
});
//# sourceMappingURL=SearchResultContainer-dbg.js.map
