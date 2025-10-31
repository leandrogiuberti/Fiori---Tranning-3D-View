/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["sap/ui/layout/VerticalLayout"],function(t){"use strict";const e=t.extend("sap.esh.search.ui.controls.SearchResultContainer",{renderer:{apiVersion:2},constructor:function e(s){t.prototype.constructor.call(this,s);this.data("sap-ui-fastnavgroup","true",true);this.addStyleClass("sapUshellSearchResultContainer");this.addStyleClass("sapElisaSearchResultContainer")},getNoResultScreen:function t(){return this.noResultScreen},setNoResultScreen:function t(e){this.removeContent(this.noResultScreen);this.noResultScreen=e;this.addContent(this.noResultScreen)}});return e});
//# sourceMappingURL=SearchResultContainer.js.map