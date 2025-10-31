/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/core/Lib"],function(n){"use strict";return{getResourceBundle:function(){if(!this.i18nBundle){this.i18nBundle=n.getResourceBundleFor("sap.insights")}return this.i18nBundle},getDataFromRawValue:function(n){var e=[];var t=[];var i=[];try{t=n.split("\r\n")}catch(n){throw new Error}t.forEach(function(n){if(n!==""){i.push(n)}});var r="";for(var u=1;u<i.length-1;u++){r=i[u].includes("Content-Type: ")?i[u].split("Content-Type: ")[1]:r;if(i[u+1].includes(i[0])){if(r==="application/json"){i[u]=JSON.parse(i[u]);e.push(i[u])}else{e.push(i[u])}}}return e}}});
//# sourceMappingURL=InsightsUtils.js.map