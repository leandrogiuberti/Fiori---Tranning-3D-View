/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/performance/trace/FESRHelper"],function(e){"use strict";var t=function(e){e["PRESS"]="press";e["CHANGE"]="change";e["SELECT"]="select";return e}(t||{});const a=(e,t)=>{e?.data("fesr-id",t)};const n=e=>e.data("fesr-id");const r=(t,a,n)=>{if(n){e.setSemanticStepname(t,a,n)}};var s={__esModule:true};s.FESR_EVENTS=t;s.addFESRId=a;s.getFESRId=n;s.addFESRSemanticStepName=r;return s});
//# sourceMappingURL=FESRUtil.js.map