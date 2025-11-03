/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.require(["sap/esh/search/ui/SearchCompositeControl","sap/esh/search/ui/sinaNexTS/core/errors"],async function(e,o){let r;const t={applicationComponent:"HAN-AS-INA-UI",resultviewSelectionMode:"MultipleItems",enableCharts:true,sinaConfiguration:{provider:"sample"}};r=new e(t);const n=await r.getInitializationStatus();if(n&&n.success===false&&n.error instanceof o.NoValidEnterpriseSearchAPIConfigurationFoundError&&n.error.previous instanceof o.ESHNoBusinessObjectDatasourceError){console.error("Error creating SearchCompositeControl: ",n.error.previous.message)}window.addEventListener("hashchange",function(){r.parseURL()},false);r.placeAt("content")});document.documentElement.style.overflowY="auto";document.documentElement.style.height="100%";
//# sourceMappingURL=SearchUI.js.map