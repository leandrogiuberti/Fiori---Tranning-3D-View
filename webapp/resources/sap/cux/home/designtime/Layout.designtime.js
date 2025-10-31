/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/core/Lib","../changeHandler/LayoutHandler"],function(e,n){"use strict";function t(e){return e&&e.__esModule&&typeof e.default!=="undefined"?e.default:e}const a=t(n);const i={actions:{remove:null,settings:{icon:"sap-icon://edit",name:e.getResourceBundleFor("sap.cux.home.i18n").getText("editCurrentPage"),isEnabled:true,handler:(e,n)=>a.loadPersonalizationDialog(e,n).then(e=>e)}}};return i});
//# sourceMappingURL=Layout.designtime.js.map