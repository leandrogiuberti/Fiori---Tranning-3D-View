/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["../../core/AjaxClient","../../core/defaultAjaxErrorFactory","./ajaxErrorFactory"],function(r,e,t){"use strict";const a=r["AjaxClient"];const c=e["createDefaultAjaxErrorFactory"];const o=t["ajaxErrorFactory"];function n(r){const e={csrf:true,csrfByPassCache:true,errorFactories:[o,c()]};return new a(Object.assign(e,r))}var s={__esModule:true};s.createAjaxClient=n;return s});
//# sourceMappingURL=ajax.js.map