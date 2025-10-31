/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["sap/base/Log","sap/ui/core/Element"],function(e,t){"use strict";const a={isSearchFieldExpandedByDefault(){try{const e=t.getElementById("shell-header");if(!e||!e.isExtraLargeState){return false}const a=window.sap.ushell.Container.getRenderer("fiori2").getShellController();const r=a.getView();const n=(r.getViewData()?r.getViewData().config:{})||{};return n.openSearchAsDefault||e.isExtraLargeState()}catch(t){e.warning("Failed to determine default search field state",t);return false}}};return a});
//# sourceMappingURL=SearchShellHelperHorizonTheme.js.map