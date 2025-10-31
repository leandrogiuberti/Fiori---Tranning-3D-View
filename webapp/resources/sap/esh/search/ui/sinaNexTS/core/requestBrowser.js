/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["./ajaxUtil"],function(e){"use strict";const t=e["addEncodedUrlParameters"];const s=e["parseHeaders"];async function r(e){return new Promise(function(r){const a=new XMLHttpRequest;a.onreadystatechange=function(){if(a.readyState==4){r({data:a.responseText,headers:s(a.getAllResponseHeaders()),status:a.status,statusText:a.statusText});return}};const n=t(e.url,e.parameters);a.open(e.method,n,true);for(const t in e.headers){const s=e.headers[t];a.setRequestHeader(t,s)}a.send(e.data)})}var a={__esModule:true};a.requestBrowser=r;return a});
//# sourceMappingURL=requestBrowser.js.map