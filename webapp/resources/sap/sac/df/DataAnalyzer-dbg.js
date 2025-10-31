/*
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/* global sap */
sap.ui.define("sap/sac/df/DataAnalyzer", ["sap/sac/df/controls/MultiDimControlBase", "sap/sac/df/types/DataAnalyzerPanelName", "sap/sac/df/utils/ListHelper", "sap/sac/df/firefly/library"], function (MultiDimControlBase, DataAnalyzerPanelName, ListHelper, FF
) {
  /**
     * Constructor for a new <code>DataAnalyzer</code> control.
     *
     * @class DataAnalyzer A control to display multi-dimensional data
     * @public
     * @ui5-experimental-since 1.132
     * @extends sap.ui.core.Control
     *
     * @author SAP SE
     * @version 1.141.0
     *
     * @constructor
     * @alias sap.sac.df.DataAnalyzer
     */
  var DataAnalyzer = MultiDimControlBase.extend("sap.sac.df.DataAnalyzer", /** @lends sap.sac.df.controls.MultiDimControlBase.prototype */ {
    metadata: {
      library: "sap.sac.df",
      properties: {
        /**
                 * Defines the relative path to the data provider in the multidimensional model.
                 **/
        metaPath: {
          type: "string"
        },
        /**
                 * Selected panel item
                 **/
        selectedPanel: {
          type: "sap.sac.df.types.DataAnalyzerPanelName"
        },

        /**
                 * Show visualization type
                 * @restricted
                 **/
        showVisualizationType: {
          type: "boolean",
          default: false
        },
        /**
                 *  Show / hide title
                 */
        showTitle: {
          type: "boolean", defaultValue: false
        }, /**
                 *  Title
                 */
        title: {
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
      return "DataAnalyzer";
    },

    //##############-------- Firefly helpers -----------###############
    _runProgram: function () {
      let oRunProgramPromise = MultiDimControlBase.prototype._runProgram.apply(this);
      return oRunProgramPromise.then(() => {
        let oPair = new FF.XPair();
        oPair.setFirstObject(FF.PrString.createWithValue("UI5ContextMenuProvider"));
        oPair.setSecondObject(this._getDefaultContextMenuProvider());
        //TODO
        //deprecated: directly call dataApplication.getMenuManager().registerDynamicMenuActionsProvider(...);
        this.oHorizonProgram.executeAction(FF.AuMenuEngineCommandPlugin.PLUGIN_NAME, FF.AuMenuEngineCommandPlugin.REGISTER_DYNAMIC_MENU_ACTIONS_PROVIDER, oPair);
      });
    },

    _getDefaultContextMenuProvider: function () {
      return this._getMultiDimModel().getContextMenuProviderRegistry().getDefaultProvider();
    },

    //##############-------- OVERRIDES -----------###############
    _applyPropertiesToPlugin: function () {
      MultiDimControlBase.prototype._applyPropertiesToPlugin.apply(this);

      if (this.oHorizonProgram) {
        if (this._getMultiDimModel().getProperty("/Configuration/Charts")) {
          this.setShowVisualizationType(true);
        }
        //Set display type
        const oNotificationData1 = FF.XNotificationData.create();
        oNotificationData1.putBoolean(FF.AuOlapAxesBuilderViewPlugin.CONFIG_SHOW_DISPLAY_TYPE, this.getShowVisualizationType());
        this.oHorizonProgram.postNotificationWithName(FF.AuOlapAxesBuilderViewPlugin.NOTIFICATION_DISPLAY_TYPE_VISIBILITY_CHANGE, oNotificationData1);


        //Set selected panel
        /*
                                                                                                                        if (this.getSelectedPanel()) {
                                                                                                                          const oNotificationData2 = FF.XNotificationData.create();
                                                                                                                          oNotificationData2.putString(FF.HpSideNavigationDocumentPlugin.NOTIFICATION_DATA_PANEL_KEY, DataAnalyzerPanelName[this.getSelectedPanel()]);
                                                                                                                          oNotificationData2.putBoolean(FF.HpSideNavigationDocumentPlugin.NOTIFICATION_DATA_PANEL_VISIBILITY, true);
                                                                                                                          this.oHorizonProgram.postNotificationWithName(FF.HpSideNavigationDocumentPlugin.NOTIFICATION_CHANGE_PANEL_VISIBILITY, oNotificationData2);
                                                                                                                        }
                                                                                                 */
        //Set onPanelChange consumer
        const oNotificationData3 = FF.XNotificationData.create();
        oNotificationData3.putXObject(FF.HpSideNavigationDocumentPlugin.NOTIFICATION_DATA_CONSUMER, FF.XConsumerHolder.create(this._onPanelChange.bind(this)));
        this.oHorizonProgram.postNotificationWithName(FF.HpSideNavigationDocumentPlugin.NOTIFICATION_SET_PANEL_STATE_CHANGE_CONSUMER, oNotificationData3);


        // Show title
        const oNotificationData = FF.XNotificationData.create();
        oNotificationData.putBoolean(FF.AuAnalyticalTableViewPlugin.NOTIFICATION_DATA_KEY_SHOW_QUERY_DETAILS, this.getShowTitle());
        this.oHorizonProgram.postNotificationWithName(FF.AuAnalyticalTableViewPlugin.NOTIFICATION_SHOW_QUERY_DETAILS, oNotificationData);

        // Set title
        if (this.getTitle()) {
          const oNotificationData2 = FF.XNotificationData.create();
          oNotificationData2.putString(FF.AuVizRendererDocumentPlugin.NOTIFICATION_DATA_KEY_TITLE, this.getTitle());
          this.oHorizonProgram.postNotificationWithName(FF.AuVizRendererDocumentPlugin.NOTIFICATION_SET_TITLE, oNotificationData2);
        }

      }
    },

    _onPanelChange: function (oEvent) {
      const aPanels = ListHelper.arrayFromList(oEvent.getByKey(FF.HpSideNavigationDocumentPlugin.PANEL_STATE_OPEN_PANELS_KEY).getKeysAsReadOnlyList());
      if (aPanels && aPanels.length > 0) {
        const sPanel = aPanels[0];
        const bVisible = oEvent.getByKey(FF.HpSideNavigationDocumentPlugin.PANEL_STATE_OPEN_PANELS_KEY).getBooleanByKey(sPanel);
        if (bVisible) {
          const sPanelName = Object.keys(DataAnalyzerPanelName).find((key) => DataAnalyzerPanelName[key] === sPanel);
          if (sPanel) {
            this.setProperty("selectedPanel", sPanelName);
          }
        } else {
          this.setProperty("selectedPanel", null);
        }

      }
    }
  });

  return DataAnalyzer;
});
