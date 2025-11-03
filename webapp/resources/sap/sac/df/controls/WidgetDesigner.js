/*
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
sap.ui.define("sap/sac/df/controls/WidgetDesigner",["sap/sac/df/controls/MultiDimControlBase"],function(e){var t=e.extend("sap.sac.df.controls.WidgetDesigner",{metadata:{library:"sap.sac.df",properties:{metaPath:{type:"string"},widgetId:{type:"string"}}},init:function(){if(e.prototype.init){e.prototype.init.apply(this,arguments)}},renderer:e.getMetadata().getRenderer().render,getPluginConfigName:function(){return"WidgetDesigner"},_applyPropertiesToPlugin:function(){e.prototype._applyPropertiesToPlugin.apply(this)}});return t});
//# sourceMappingURL=WidgetDesigner.js.map