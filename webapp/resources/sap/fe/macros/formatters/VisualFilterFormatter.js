/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/util/ObjectPath"],function(t){"use strict";const e=function(t,e,r){e=e==="undefined"?"":e;r=r==="undefined"?"":r;const n=`${t}${r} ${e}`;const a=e?`${t}${e}`:"";const s=r?`${t}${r}`:a;return e&&r?n:s};e.__functionName="sap.fe.macros.formatters.VisualFilterFormatter#formatScaleAndUOM";const r=function(t){if(r.hasOwnProperty(t)){for(var e=arguments.length,n=new Array(e>1?e-1:0),a=1;a<e;a++){n[a-1]=arguments[a]}return r[t].apply(this,n)}else{return""}};r.formatScaleAndUOM=e;t.set("sap.fe.macros.formatters.VisualFilterFormatter",r);return r},false);
//# sourceMappingURL=VisualFilterFormatter.js.map