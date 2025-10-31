/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define([],function(){"use strict";function e(e){return new Promise(function(r,i){sap.ui.require([e],function(i){if(!(i&&i.__esModule)){i=i===null||!(typeof i==="object"&&e.endsWith("/library"))?{default:i}:i;Object.defineProperty(i,"__esModule",{value:true})}r(i)},function(e){i(e)})})}async function r(i){if(typeof i==="string"){i=i.trim();if(i.indexOf("/")>=0&&i.indexOf("Provider")<0&&i[0]!=="{"){i=await e(i);return await r(i)}if(i[0]!=="{"){i='{ "provider" : "'+i+'"}'}i=JSON.parse(i)}return i}var i=function(e){e["ABAP_ODATA"]="abap_odata";e["HANA_ODATA"]="hana_odata";e["INAV2"]="inav2";e["MULTI"]="multi";e["SAMPLE"]="sample";e["SAMPLE2"]="sample2";e["MOCK_SUGGESTIONTYPES"]="mock_suggestiontypes";e["MOCK_NLQRESULTS"]="mock_nlqresults";e["MOCK_DELETEANDREORDER"]="mock_deleteandreorder";e["DUMMY"]="dummy";return e}(i||{});var n={__esModule:true};n._normalizeConfiguration=r;n.AvailableProviders=i;return n});
//# sourceMappingURL=SinaConfiguration.js.map