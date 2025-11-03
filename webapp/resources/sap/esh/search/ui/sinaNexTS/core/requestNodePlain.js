/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["./ajaxUtil"],function(e){"use strict";function t(e){return new Promise(function(t,a){sap.ui.require([e],function(a){if(!(a&&a.__esModule)){a=a===null||!(typeof a==="object"&&e.endsWith("/library"))?{default:a}:a;Object.defineProperty(a,"__esModule",{value:true})}t(a)},function(e){a(e)})})}const a=e["addEncodedUrlParameters"];async function s(e){const s=e.url.startsWith("https")?await t("node:https"):await t("node:http");const{Buffer:n}=await t("node:buffer");return new Promise(t=>{const r=a(e.url,e.parameters);const o=new URL(r);const d={rejectUnauthorized:false,hostname:o.hostname,path:o.pathname+o.search,port:o.port,method:e.method,headers:e.headers};if(e.data){d.headers["Content-Length"]=""+n.byteLength(e.data)}const u=s.request(d,e=>{let a="";e.on("data",e=>{a+=e});e.on("end",()=>{t({status:e.statusCode,statusText:e.statusMessage,data:a,headers:e.headers})})});u.on("error",e=>{t({status:0,statusText:""+e,data:"",headers:{}})});if(e.data){u.write(e.data)}u.end()})}var n={__esModule:true};n.requestNodePlain=s;return n});
//# sourceMappingURL=requestNodePlain.js.map