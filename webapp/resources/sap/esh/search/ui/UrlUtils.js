/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["./error/ErrorHandler"],function(r){"use strict";function e(r){return r&&r.__esModule&&typeof r.default!=="undefined"?r.default:r}const n=e(r);function t(r,e,t,o,d){const s={top:e.toString(),filter:o?encodeURIComponent(JSON.stringify(t.toJson())):JSON.stringify(t.toJson())};if(r.config.FF_sortOrderInUrl&&d&&Object.keys(d).length>0){if(d.orderBy){s.orderby=encodeURIComponent(d.orderBy)}if(d.sortOrder){s.sortorder=d.sortOrder}}try{return r.config.renderSearchUrl(s)}catch(r){const e=n.getInstance();e.onError(r);return""}}var o={__esModule:true};o.renderUrlFromParameters=t;return o});
//# sourceMappingURL=UrlUtils.js.map