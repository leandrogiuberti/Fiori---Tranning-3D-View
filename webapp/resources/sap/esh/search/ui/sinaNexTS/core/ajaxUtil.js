/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define([],function(){"use strict";function e(e){const n=[];for(const t in e){const o=e[t];n.push(encodeURIComponent(t)+"="+encodeURIComponent(o+""))}return n.join("&")}function n(n,t){if(!t){return n}const o=e(t);if(o.length>0){const e=n.indexOf("?");if(e>=0){n=n.slice(0,e)+"?"+o+"&"+n.slice(e+1)}else{n+="?"+o}}return n}function t(e){const n={};const t=e.split("\n");for(let e=0;e<t.length;++e){const o=t[e];const r=o.indexOf(":");if(r>=0){const e=o.slice(0,r).toLowerCase();const t=o.slice(r+1);n[e]=t.trim()}}return n}function o(e){for(const n in e){if(typeof e[n]!=="boolean"&&typeof e[n]!=="string"&&typeof e[n]!=="number"){return false}}return true}var r={__esModule:true};r.encodeUrlParameters=e;r.addEncodedUrlParameters=n;r.parseHeaders=t;r.isNumberStringBooleanRecord=o;return r});
//# sourceMappingURL=ajaxUtil.js.map