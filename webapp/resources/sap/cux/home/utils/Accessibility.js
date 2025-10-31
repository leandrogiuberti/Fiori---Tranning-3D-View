/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/core/InvisibleText"],function(e){"use strict";function t(t,n=""){if(t){return new e({id:t,text:n||""})}else{throw new Error("ID is required for InvisibleText.")}}function n(e,t,n){const i=e?._getLayout?.()??e;const r=i?.getAggregation("items");const s=r instanceof Array?r.find(e=>e.getMetadata()?.getName()===t):null;const o=s?.getAggregation("content");const a=o&&(o instanceof Array?o:[o])||[];return a.some(e=>e.getMetadata()?.getName()===n)}var i={__esModule:true};i.getInvisibleText=t;i.checkPanelExists=n;return i});
//# sourceMappingURL=Accessibility.js.map