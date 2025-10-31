/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap */
sap.ui.define("sap/sac/df/model/internal/ConfigurationMapping", [
  "sap/sac/df/firefly/library"
], function (FF) {
  /**
     * Configuration properties mapping
     *
     * @enum {object}
     * @alias sap.sac.df.model.internal.FeatureConfigurationMapping
     * @ui5-experimental-since 1.129
     * @private
     */
  var ConfigurationMapping = {
    GroupDimensions: {
      Name: "GroupDimensions",
      FFName: FF.CoGlobalConfigurationUtils.GROUP_DIMENSIONS,
      Type: FF.PrElementType.BOOLEAN,
      FFDefaultValue: false,
      Program: FF.CoGlobalConfigurationUtils.CONFIGURATION_NAME
    },
    Calculations: {
      Name: "Calculations",
      FFName: FF.CoGlobalConfigurationUtils.CALCULATIONS,
      Type: FF.PrElementType.BOOLEAN,
      FFDefaultValue: false,
      Program: FF.CoGlobalConfigurationUtils.CONFIGURATION_NAME
    },
    Charts: {
      Name: "Charts",
      FFName: FF.CoGlobalConfigurationUtils.CHARTS,
      Type: FF.PrElementType.BOOLEAN,
      FFDefaultValue: false,
      Program: FF.CoGlobalConfigurationUtils.CONFIGURATION_NAME
    },
    Commenting: {
      Name: "Commenting",
      FFName: FF.AuAnalyticalTableViewPlugin.CONFIG_TABLE_RENDER_SHOW_COMMENT_ICONS,
      Type: FF.PrElementType.BOOLEAN,
      FFDefaultValue: false,
      Program: FF.AuAnalyticalTableViewPlugin.PLUGIN_NAME
    },
    StylingPanelItems: {
      Name: "StylingPanelItems",
      FFName: FF.AuStylingPanelDocumentPlugin.CONFIG_STYLING_ITEMS,
      Type: FF.PrElementType.LIST,
      FFDefaultValue: ["TablePropertiesViewPlugin", "NumberFormattingViewPlugin"],
      Program: FF.AuStylingPanelDocumentPlugin.PLUGIN_NAME
    },
    TableTemplates: {
      Name: "TableTemplates",
      FFName: FF.CoGlobalConfigurationUtils.EXTENDED_TABLE_TEMPLATES,
      Type: FF.PrElementType.LIST,
      FFDefaultValue: ["Default", "Basic", "Report"],
      Program: FF.CoGlobalConfigurationUtils.CONFIGURATION_NAME
    },
    TableTemplateSelection: {
      Name: "TableTemplateSelection",
      FFName: FF.CoGlobalConfigurationUtils.EXTENDED_TABLE_TEMPLATE_SELECTION,
      Type: FF.PrElementType.STRING,
      FFDefaultValue: "Default",
      Program: FF.CoGlobalConfigurationUtils.CONFIGURATION_NAME
    }
  };
  return ConfigurationMapping;
});
