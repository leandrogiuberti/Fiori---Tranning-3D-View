/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["../../core/AjaxClient","./ajaxErrorFactory","./ajaxErrorFactoryDeprecated","../../core/defaultAjaxErrorFactory"],function(r,e,t,a){"use strict";const o=r["AjaxClient"];const c=e["ajaxErrorFactory"];const n=t["deprecatedAjaxErrorFactory"];const s=a["createDefaultAjaxErrorFactory"];function u(r){const e={errorFactories:[c,n,s({allowedStatusCodes:[200,201,204,300]})],errorFormatters:[]};return new o(Object.assign(e,r))}var i={__esModule:true};i.createAjaxClient=u;return i});
//# sourceMappingURL=ajax.js.map