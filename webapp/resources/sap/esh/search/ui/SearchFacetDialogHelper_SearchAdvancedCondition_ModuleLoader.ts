/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import SearchFacetDialogHelper from "sap/esh/search/ui/SearchFacetDialogHelper";
import SearchAdvancedCondition from "sap/esh/search/ui/controls/SearchAdvancedCondition";

/**
 * @namespace sap.esh.search.ui.controls
 */
export default class SearchFacetDialogHelper_SearchAdvancedCondition_ModuleLoader {
    constructor() {
        SearchFacetDialogHelper.injectSearchAdvancedCondition(SearchAdvancedCondition);
        SearchAdvancedCondition.injectSearchFacetDialogHelper(SearchFacetDialogHelper);
    }
}
