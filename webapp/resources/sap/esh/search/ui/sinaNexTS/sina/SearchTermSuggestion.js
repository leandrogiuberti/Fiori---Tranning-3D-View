/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["./Suggestion","./SuggestionType"],function(e,s){"use strict";const t=e["Suggestion"];const i=s["SuggestionType"];class r extends t{type=i.SearchTerm;searchTerm;filter;childSuggestions=[];constructor(e){super(e);this.searchTerm=e.searchTerm??this.searchTerm;this.filter=e.filter??this.filter;this.childSuggestions=e.childSuggestions??this.childSuggestions}}var g={__esModule:true};g.SearchTermSuggestion=r;return g});
//# sourceMappingURL=SearchTermSuggestion.js.map