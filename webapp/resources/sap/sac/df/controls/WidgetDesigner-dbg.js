/*
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/* global sap */
sap.ui.define("sap/sac/df/controls/WidgetDesigner", [
  "sap/sac/df/controls/MultiDimControlBase"
], function (MultiDimControlBase) {
  /**
     * Constructor for a new <code>WidgetDesigner</code> control.
     *
     * @class WidgetDesigner A control to design widgets
     * @private
     * @ui5-experimental-since 1.134
     * @extends sap.sac.df.controls.MultiDimControlBase
     *
     * @author SAP SE
     * @version 1.141.0
     *
     * @constructor
     * @private
     * @alias sap.sac.df.controls.WidgetDesigner
     */
  var WidgetDesigner = MultiDimControlBase.extend(
    "sap.sac.df.controls.WidgetDesigner",
    /** @lends sap.sac.df.controls.MultiDimControlBase.prototype */ {
      metadata: {
        library: "sap.sac.df",
        properties: {
          /**
                     * Defines the relative path to the visualization of the corresponding data provider in the multidimensional model.
                     **/
          metaPath: {
            type: "string"
          },
          /**
                     * Defines the widget id.
                     **/
          widgetId: {
            type: "string"
          }
        }
      },

      //##############-------- CONTROL LIFECYCLE METHODS -----------###############

      init: function () {
        if (MultiDimControlBase.prototype.init) {
          MultiDimControlBase.prototype.init.apply(this, arguments);
        }
      },

      renderer: MultiDimControlBase.getMetadata().getRenderer().render,

      //##############-------- HELPER METHODS -----------###############

      getPluginConfigName: function () {
        return "WidgetDesigner";
      },

      //##############-------- OVERRIDES -----------###############

      _applyPropertiesToPlugin: function () {
        MultiDimControlBase.prototype._applyPropertiesToPlugin.apply(this);
      }
    }
  );

  return WidgetDesigner;
});
