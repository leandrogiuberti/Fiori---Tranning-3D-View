/*
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/* global sap */
sap.ui.define("sap/sac/df/Widget", [
  "sap/sac/df/controls/MultiDimControlBase",
  "sap/sac/df/firefly/library"
], function (MultiDimControlBase, FF) {
  /**
     * Constructor for a new <code>Widget</code> control.
     *
     * @class Widget A widget for displaying multidimensional data
     * @private
     * @extends sap.sac.df.controls.MultiDimControlBase
     *
     * @author SAP SE
     * @version 1.141.0
     *
     * @constructor
     * @private
     * @ui5-experimental-since 1.134
     * @alias sap.sac.df.Widget
     */
  var Widget = MultiDimControlBase.extend("sap.sac.df.Widget", /** @lends sap.sac.df.controls.MultiDimControlBase.prototype */ {
    metadata: {
      library: "sap.sac.df",
      properties: {
        /**
                     * Defines the relative path to the visualization of the corresponding data provider in the multidimensional model.
                     **/
        metaPath: {
          type: "string"
        },
        /** Title */
        title: {
          type: "string"
        },
        /** Set to true to display the charts legend. Set to false to hide. */
        showLegend: {
          type: "boolean",
          default: true
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
      return "Widget";
    },

    setShowLegend: function (bVisible) {
      this._getDataProvider()._FFDataProvider.getActions().getVisualizationActions().getActiveVisualizationDefinition().onThen(curViz => {
        curViz.getChartSetting().getChartStyle().getLegendStyle().setEnabled(bVisible);
        curViz.invalidateVisualizationContainer();
        let newEvent = this._getDataProvider()._FFDataProvider.getActions().getEventing().getEmitterForVisualizationChanges().newTypedEvent();
        newEvent.addChangedVisualizationName(curViz.getName());
        newEvent.queue();
        //this._notifyVizChanged(tmpChartDef);
      });
    },

    //##############-------- OVERRIDES -----------###############


    _applyPropertiesToPlugin: function () {
      MultiDimControlBase.prototype._applyPropertiesToPlugin.apply(this);
      const sVizName = this._getVisualizationName();
      if (this.oHorizonProgram && sVizName) {
        const oNotificationData = FF.XNotificationData.create();
        oNotificationData.putString(FF.AuAnalyticalChartViewPlugin.NOTIFY_DATA_VISUALIZATION_NAME, sVizName);
        this.oHorizonProgram.postNotificationWithName(FF.AuAnalyticalChartViewPlugin.NOTIFICATION_VISUALIZATION_NAME_SET, oNotificationData);
      }

      // Set title
      const oNotificationData2 = FF.XNotificationData.create();
      oNotificationData2.putString(FF.AuAnalyticalChartViewPlugin.NOTIFICATION_DATA_KEY_TITLE, this.getTitle());
      this.oHorizonProgram.postNotificationWithName(FF.AuAnalyticalChartViewPlugin.NOTIFICATION_SET_TITLE, oNotificationData2);

    }
  }
  );

  return Widget;
});
