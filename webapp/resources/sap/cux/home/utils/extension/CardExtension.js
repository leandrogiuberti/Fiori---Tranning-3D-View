/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/m/library","sap/ui/core/library","sap/ui/integration/Extension"],function(r,e,t){"use strict";const a=e.ValueState;const s=r.ValueColor;const c=(r,e)=>{if(e==="state"){switch(String(r)){case"1":case"Error":return a.Error;case"2":case"Warning":return a.Warning;case"3":case"Success":return a.Success;default:return a.None}}if(e==="color"){switch(String(r)){case"1":case"Error":return s.Error;case"2":case"Critical":return s.Critical;case"3":case"Good":return s.Good;default:return s.Neutral}}};class i extends t{init(){t.prototype.setFormatters.apply(this,[{formatCriticality:c}])}}return i});
//# sourceMappingURL=CardExtension.js.map