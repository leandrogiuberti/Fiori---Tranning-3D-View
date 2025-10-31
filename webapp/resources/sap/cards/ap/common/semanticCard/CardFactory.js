/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
"use strict";sap.ui.define(["./AdaptiveCard","./UI5Card"],function(t,e){"use strict";const r=t["AdaptiveCard"];const a=e["UI5Card"];var n=function(t){t["Always"]="always";t["Lean"]="lean";return t}(n||{});const i=function(t,e={}){const{cardType:n="integration"}=e;switch(n){case"integration":return new a(t);case"adaptive":return new r(t);default:throw new Error(`Unsupported card type: ${String(n)}. Supported types: "integration", "adaptive"`)}};var c={__esModule:true};c.GenerateSemanticCard=n;c.createSemanticCardFactory=i;return c});
//# sourceMappingURL=CardFactory.js.map