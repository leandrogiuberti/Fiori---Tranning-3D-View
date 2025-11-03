/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["../../sina/i18n"],function(e){"use strict";const t=e["getText"];function n(e,n){if(!n){return{success:false,filterDescription:""}}n=n.filter(e=>e.ai);if(n.length===0){return{success:false,filterDescription:""}}const r=[];for(const i of n){if(!i.filter.natural_language){continue}if(n.length>1){const n=e.getDataSource(i.Name);r.push(t("nlqDataSourceAndFilterDescription",[n?n.label:i.Name,i.filter.natural_language]))}else{r.push(i.filter.natural_language)}}let i="";if(r.length>0){i="<code>"+r.join("<br/>")+"</code>"}return{success:true,filterDescription:i}}var r={__esModule:true};r.parseNlqInfo=n;return r});
//# sourceMappingURL=nlqParser.js.map