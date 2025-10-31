/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/FPMHelper"],function(t){"use strict";const e=async function(e,n,o){const r=n.split(".");const s=r.pop();const c=r.join("/");return t.loadModuleAndCallMethod(c,s,e,this.getBindingContext(),o||[])};e.__functionName="._formatters.FPMFormatter.bind($control)#customBooleanPropertyCheck";const n=function(t){if(n.hasOwnProperty(t)){for(var e=arguments.length,o=new Array(e>1?e-1:0),r=1;r<e;r++){o[r-1]=arguments[r]}return n[t].apply(this,o)}else{return""}};n.customBooleanPropertyCheck=e;return n},false);
//# sourceMappingURL=FPMFormatter.js.map