/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define([],function(){"use strict";function e(e){return new Promise(function(t,o){sap.ui.require([e],function(o){if(!(o&&o.__esModule)){o=o===null||!(typeof o==="object"&&e.endsWith("/library"))?{default:o}:o;Object.defineProperty(o,"__esModule",{value:true})}t(o)},function(e){o(e)})})}const t="sap/ushell/gen/ui5/webcomponents-fiori/dist/SearchScope";const o="sap/ushell/gen/ui5/webcomponents-fiori/dist/SearchItem";const n="sap/ushell/gen/ui5/webcomponents-fiori/dist/SearchItemGroup";const i="sap/ushell/gen/ui5/webcomponents-fiori/dist/SearchItemShowMore";async function s(){const s=await e(t);const u=await e(o);const r=await e(n);const a=await e(i);return{SearchScope:s.default,SearchItem:u.default,SearchItemGroup:r.default,SearchItemShowMore:a.default}}var u={__esModule:true};u.loadUShellWebComps=s;return u});
//# sourceMappingURL=UShellWebCompLoader.js.map