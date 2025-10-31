/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["../../core/Log"],function(r){"use strict";const t=r["Log"];async function e(r,e){async function a(r){let a;switch(r.name){case"ServerError":a=r;if(!a.response.dataJSON){throw r}try{const t=await e(a.response.dataJSON);t.addError(r);return t}catch(e){const a=new t("error handle util");a.warn("Error while parsing error response: "+e);throw r}default:throw r}}let n;try{n=await r()}catch(r){return await a(r)}return await e(n)}var a={__esModule:true};a.handleError=e;return a});
//# sourceMappingURL=util.js.map