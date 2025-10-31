/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define([],function(){"use strict";let e;function n(){if(e){return e}const n=typeof window!=="undefined"?window?.sap?.ushell?.["Container"]?.["getServiceAsync"]:null;if(n){e=n("CrossApplicationNavigation")}else{e=Promise.resolve(undefined)}return e}var i={__esModule:true};i.getNavigationService=n;return i});
//# sourceMappingURL=NavigationServiceFactory.js.map