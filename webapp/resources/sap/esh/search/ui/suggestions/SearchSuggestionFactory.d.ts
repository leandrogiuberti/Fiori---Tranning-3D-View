declare module "sap/esh/search/ui/suggestions/SearchSuggestionFactory" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import SearchModel from "sap/esh/search/ui/SearchModel";
    import { SearchSuggestion } from "sap/esh/search/ui/suggestions/SuggestionType";
    function assembleLabel(searchModel: SearchModel): string;
    function hasFilter(searchModel: SearchModel): boolean;
    function createSearchSuggestionForCurrentSearch(searchModel: SearchModel): SearchSuggestion;
}
//# sourceMappingURL=SearchSuggestionFactory.d.ts.map