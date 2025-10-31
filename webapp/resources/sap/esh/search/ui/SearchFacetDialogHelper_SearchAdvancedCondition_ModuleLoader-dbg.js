/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["sap/esh/search/ui/SearchFacetDialogHelper", "sap/esh/search/ui/controls/SearchAdvancedCondition"], function (SearchFacetDialogHelper, SearchAdvancedCondition) {
  "use strict";

  /**
   * @namespace sap.esh.search.ui.controls
   */
  class SearchFacetDialogHelper_SearchAdvancedCondition_ModuleLoader {
    constructor() {
      SearchFacetDialogHelper.injectSearchAdvancedCondition(SearchAdvancedCondition);
      SearchAdvancedCondition.injectSearchFacetDialogHelper(SearchFacetDialogHelper);
    }
  }
  return SearchFacetDialogHelper_SearchAdvancedCondition_ModuleLoader;
});
//# sourceMappingURL=SearchFacetDialogHelper_SearchAdvancedCondition_ModuleLoader-dbg.js.map
