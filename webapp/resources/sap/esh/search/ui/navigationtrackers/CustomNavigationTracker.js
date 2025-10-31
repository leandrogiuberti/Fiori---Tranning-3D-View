/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["../error/errors"],function(e){"use strict";function n(e){return e&&e.__esModule&&typeof e.default!=="undefined"?e.default:e}const r=n(e);function t(e){return n=>{try{e.config.beforeNavigation(e)}catch(n){const t=new r.ConfigurationExitError("beforeNavigation",e.config.applicationComponent,n);throw t}}}var o={__esModule:true};o.generateCustomNavigationTracker=t;return o});
//# sourceMappingURL=CustomNavigationTracker.js.map