/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/m/Button", "sap/m/Column", "sap/m/ColumnListItem", "sap/m/FlexBox", "sap/m/HBox", "sap/m/MessageBox", "sap/m/MessageToast", "sap/m/ObjectIdentifier", "sap/m/ScrollContainer", "sap/m/SearchField", "sap/m/Switch", "sap/m/Table", "sap/m/Text", "sap/m/Title", "sap/m/VBox", "sap/ui/core/Element", "sap/ui/core/Icon", "./BaseSettingsPanel", "./TilesPanel", "./utils/Accessibility", "./utils/AppManager", "./utils/Constants", "./utils/DragDropUtils"], function (Log, Button, Column, ColumnListItem, FlexBox, HBox, MessageBox, MessageToast, ObjectIdentifier, ScrollContainer, SearchField, Switch, Table, Text, Title, VBox, UI5Element, Icon, __BaseSettingsPanel, ___TilesPanel, ___utils_Accessibility, __AppManager, ___utils_Constants, ___utils_DragDropUtils) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  function _catch(body, recover) {
    try {
      var result = body();
    } catch (e) {
      return recover(e);
    }
    if (result && result.then) {
      return result.then(void 0, recover);
    }
    return result;
  }
  const BaseSettingsPanel = _interopRequireDefault(__BaseSettingsPanel);
  function _finallyRethrows(body, finalizer) {
    try {
      var result = body();
    } catch (e) {
      return finalizer(true, e);
    }
    if (result && result.then) {
      return result.then(finalizer.bind(null, false), finalizer.bind(null, true));
    }
    return finalizer(false, result);
  }
  const DisplayFormat = ___TilesPanel["DisplayFormat"];
  const getInvisibleText = ___utils_Accessibility["getInvisibleText"];
  const AppManager = _interopRequireDefault(__AppManager);
  const MYHOME_PAGE_ID = ___utils_Constants["MYHOME_PAGE_ID"];
  const SETTINGS_PANELS_KEYS = ___utils_Constants["SETTINGS_PANELS_KEYS"];
  const focusDraggedItem = ___utils_DragDropUtils["focusDraggedItem"];
  /**
   *
   * Class for My Home Insights Tiles Settings Panel.
   *
   * @extends BaseSettingsPanel
   *
   * @author SAP SE
   * @version 0.0.1
   * @since 1.121
   * @private
   *
   * @alias sap.cux.home.InsightsTilesSettingsPanel
   */
  const InsightsTilesSettingsPanel = BaseSettingsPanel.extend("sap.cux.home.InsightsTilesSettingsPanel", {
    /**
     * Init lifecycle method
     *
     * @public
     * @override
     */
    init: function _init() {
      BaseSettingsPanel.prototype.init.call(this);
      this._controlMap = new Map();

      //setup panel
      this.setProperty("key", SETTINGS_PANELS_KEYS.INSIGHTS_TILES);
      this.setProperty("title", this._i18nBundle.getText("insightsTiles"));
      this.setProperty("icon", "sap-icon://manager-insight");

      //Fetch Data
      this.appManagerInstance = AppManager.getInstance();
      this._allInsightsApps = [];

      //setup Container & content Aggregation
      this._wrapperId = `${this.getId()}-tilesSettingsWrapper`;
      this._controlMap.set(this._wrapperId, new FlexBox(this._wrapperId, {
        alignItems: "Start",
        justifyContent: "Start",
        height: "100%",
        width: "100%",
        direction: "Column"
      }).addStyleClass("flexContainerCards"));
      this.addAggregation("content", this._controlMap.get(this._wrapperId));

      //setup content for the settings panel
      this._showMessageStrip();
      this._showToolbar();
      this._showTilesList();

      //fired every time on panel navigation
      this.attachPanelNavigated(() => {
        this._controlMap.get(`${this._wrapperId}--searchField`).setValue("");
        void this.appManagerInstance.fetchInsightApps(true, this._i18nBundle.getText("insights")).then(insightsApps => {
          this._allInsightsApps = insightsApps;
          this._controlMap.get(`${this._wrapperId}--title`).setText(`${this._i18nBundle.getText("insightsTilesTitle")} (${this._allInsightsApps.length})`);
          this._createTableRows(this._allInsightsApps);
        });
      });
    },
    /**
     * Add the Message Strip to the wrapper FlexBox.
     *
     * @private
     */
    _showMessageStrip: function _showMessageStrip() {
      const oMessageStripVBox = new VBox(`${this._wrapperId}--msgStripContainer`, {
        width: "calc(100% - 2rem)"
      }).addStyleClass("sapUiSmallMarginTop sapUiSmallMarginBegin");
      oMessageStripVBox.addItem(new Text(`${this._wrapperId}--msgStripText`, {
        text: this._i18nBundle.getText("insightAppsTabText")
      }));
      this._getWrapperFlexBox().addItem(oMessageStripVBox);
    },
    /**
     * Add the Header ToolBar to the wrapper FlexBox.
     *
     * @private
     */
    _showToolbar: function _showToolbar() {
      // To address an accessibility issue, we adjusted the font size via a custom class (`tilesFontChange`)
      // while retaining the semantic heading level as H3 to preserve hierarchy structure.
      // This ensures the title remains visually balanced without compromising screen reader navigation.
      this._controlMap.set(`${this._wrapperId}--title`, new Title(`${this._wrapperId}--title`, {
        text: `${this._i18nBundle.getText("insightsTilesTitle")} (${this._allInsightsApps.length})`,
        titleStyle: "H3",
        width: "100%"
      }).addStyleClass("tilesFontChange"));
      const oInvisibleTitleText = getInvisibleText(`${this.getId()}--TileTitleText`, this._i18nBundle.getText("insightsTiles"));
      this._controlMap.set(`${this._wrapperId}--searchField`, new SearchField(`${this._wrapperId}--pagesListSearch`, {
        liveChange: oEvent => this._onTilesSearch(oEvent),
        width: "100%",
        ariaLabelledBy: [oInvisibleTitleText.getId(), this._wrapperId + "--msgStripText", this._wrapperId + "--title"]
      }).addStyleClass("sapUiTinyMarginTop"));
      const titleContainer = new HBox(`${this._wrapperId}--titleContainer`, {
        alignItems: "Center",
        justifyContent: "SpaceBetween",
        width: "100%"
      });
      titleContainer.addItem(this._controlMap.get(`${this._wrapperId}--title`));
      titleContainer.addItem(oInvisibleTitleText);
      const toolbarContainer = new VBox(`${this._wrapperId}--toolbarContainer`, {
        width: "calc(100% - 2rem)",
        items: [titleContainer, this._controlMap.get(`${this._wrapperId}--searchField`)]
      }).addStyleClass("sapUiSmallMarginTop sapUiSmallMarginBegin");
      this._getWrapperFlexBox().addItem(toolbarContainer);
    },
    /**
     * Handles Search Field change
     * @private
     */
    _onTilesSearch: function _onTilesSearch(event) {
      const sSearchQuery = event.getSource().getValue().toLowerCase();
      const filteredTiles = this._allInsightsApps.filter(app => app.visualization?.title?.toLowerCase().includes(sSearchQuery));
      this._createTableRows(filteredTiles);
    },
    /**
     * Adds Tiles List Table to Wrapper FlexBox
     * @private
     */
    _showTilesList: function _showTilesList() {
      this._createTableWithContainer();
      this._createTableRows(this._allInsightsApps);
    },
    /**
     * Creates Table to Render Tiles List
     * @private
     */
    _createTableWithContainer: function _createTableWithContainer() {
      const table = new Table(`${this._wrapperId}-table`, {
        columns: [new Column(`${this._wrapperId}-table-dndIcon`, {
          hAlign: "Center",
          width: "6%"
        }), new Column(`${this._wrapperId}-table-title`, {
          width: "94%"
        })]
      }).addStyleClass("sapContrastPlus");
      const invisibleDragDropText = getInvisibleText(`${this._wrapperId}-dndAria`, this._i18nBundle.getText("keyPressAriaText"));
      this.addDragDropConfigTo(table, event => void this._handleTilesDrop(event));
      this._controlMap.set(`${this._wrapperId}-table`, table);
      const scrollContainer = new ScrollContainer(`${this._wrapperId}-scrollContainer`, {
        vertical: true,
        horizontal: false,
        height: "100%",
        width: "100%",
        content: [this._controlMap.get(`${this._wrapperId}-table`)]
      });
      const containerVBox = new VBox(`${this._wrapperId}-containerVBox`, {
        height: "100%",
        width: "100%",
        justifyContent: "Start",
        direction: "Column",
        items: [invisibleDragDropText, scrollContainer]
      });
      const containerFlexBox = new FlexBox(`${this._wrapperId}-containerFlexBox`, {
        alignItems: "Start",
        justifyContent: "Start",
        height: "100%",
        width: "calc(100% - 2rem)",
        direction: "Row",
        items: [containerVBox]
      }).addStyleClass("sapUiSmallMarginBegin sapUiSmallMarginTop flexContainerCards");
      this._getWrapperFlexBox().addItem(containerFlexBox);
    },
    /**
     * Handles Drag Drop of Tiles
     * @private
     */
    _handleTilesDrop: function _handleTilesDrop(oEvent) {
      try {
        const _this = this;
        function _temp2() {
          focusDraggedItem(table, iDropItemIndex);
        }
        const oDragItem = oEvent.getParameter?.("draggedControl") || oEvent.draggedControl,
          iDragItemIndex = oDragItem.getParent()?.indexOfItem(oDragItem),
          oDropItem = oEvent.getParameter?.("droppedControl") || oEvent.droppedControl,
          iDropItemIndex = oDragItem.getParent()?.indexOfItem(oDropItem),
          oDragItemPersConfig = oDragItem.data("persConfig"),
          oDropItemPersConfig = oDropItem.data("persConfig"),
          table = _this._controlMap.get(`${_this._wrapperId}-table`);
        const _temp = function () {
          if (iDragItemIndex !== iDropItemIndex) {
            _this._getWrapperFlexBox().setBusy(true);
            const moveConfigs = {
              pageId: MYHOME_PAGE_ID,
              sourceSectionIndex: oDragItemPersConfig.sectionIndex,
              sourceVisualizationIndex: oDragItemPersConfig.visualizationIndex,
              targetSectionIndex: oDropItemPersConfig.sectionIndex,
              targetVisualizationIndex: oDropItemPersConfig.visualizationIndex
            };
            return Promise.resolve(_this.appManagerInstance.moveVisualization(moveConfigs)).then(function () {
              return Promise.resolve(_this.appManagerInstance.fetchInsightApps(true, _this._i18nBundle.getText("insights"))).then(function (_this$appManagerInsta) {
                _this._allInsightsApps = _this$appManagerInsta;
                _this._createTableRows(_this._allInsightsApps);
                return Promise.resolve(_this._getTilePanel().refreshData()).then(function () {
                  _this._getWrapperFlexBox().setBusy(false);
                });
              });
            });
          }
        }();
        return Promise.resolve(_temp && _temp.then ? _temp.then(_temp2) : _temp2(_temp));
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Create Table Rows
     * @private
     */
    _createTableRows: function _createTableRows(insightsApps) {
      const table = this._controlMap.get(`${this._wrapperId}-table`);
      table.removeAllItems();
      let filteredTiles = insightsApps;
      const sSearchQuery = this._controlMap.get(`${this._wrapperId}--searchField`).getValue();
      if (sSearchQuery) {
        filteredTiles = this._allInsightsApps.filter(app => app.visualization?.title?.toLowerCase().includes(sSearchQuery));
      }
      filteredTiles.forEach((filteredTile, index) => {
        table.addItem(this._createColumnListItem(filteredTile, index));
      });
    },
    /**
     * Create ColumnListItem for each Insights App
     * @private
     */
    _createColumnListItem: function _createColumnListItem(insightsApp, index) {
      const id = `insightsTiles-${index}-listItem`;
      const existingControl = UI5Element.getElementById(id);
      if (existingControl) {
        existingControl.destroy();
      }
      // Create Column List Item
      const columnListItem = new ColumnListItem({
        id,
        type: "Inactive",
        ariaLabelledBy: [id, `${this._wrapperId}-dndAria`]
      }).addStyleClass("insightsListItem insightsListMargin manageSectionsTable");

      // Add first cell as Drag & Drop Icon
      columnListItem.addCell(new HBox(`${id}-DndHBox`, {
        items: [new Icon(`${id}-DndIcon`, {
          src: "sap-icon://BusinessSuiteInAppSymbols/icon-grip"
        }).addStyleClass("tilesDndIcon")]
      }));

      //Create Convert Switch
      const aSupportedDisplayFormats = insightsApp.visualization?.supportedDisplayFormats || "";
      let convertSwitchContainer;
      // if it is not static tile and standard/standardWide display format is supported, display convert switch
      if ((insightsApp.isCount || insightsApp.isSmartBusinessTile) && aSupportedDisplayFormats.length > 1 && aSupportedDisplayFormats.indexOf(DisplayFormat.Standard) > -1 && aSupportedDisplayFormats.indexOf(DisplayFormat.StandardWide) > -1) {
        convertSwitchContainer = new HBox({
          id: `${id}-convertSwitchContainer`,
          alignItems: "Center",
          items: [new Text({
            id: `${id}-switchAppSizeLabel`,
            text: this._i18nBundle.getText("wide"),
            wrapping: false
          }), new Switch({
            id: `${id}-convertSwitch`,
            // ariaLabelledBy="switchAppSizeLabel"
            state: insightsApp.visualization?.displayFormatHint !== DisplayFormat.Standard,
            change: () => void this._onConvertTilePress(insightsApp),
            customTextOn: " ",
            customTextOff: " ",
            tooltip: insightsApp.visualization?.displayFormatHint === DisplayFormat.Standard ? this._i18nBundle.getText("ConvertToWideTile") : this._i18nBundle.getText("ConvertToTile")
          })]
        });
      }
      const deleteBtn = new Button({
        id: `${id}-deleteAppBtn`,
        type: "Transparent",
        icon: "sap-icon://decline",
        press: () => this._onDeleteApp(insightsApp),
        tooltip: this._i18nBundle.getText("removeFromInsights")
      });
      const buttonsWrapper = new HBox({
        id: `${id}-buttonsWrapper`,
        alignItems: "Center"
      }).addStyleClass("sapUiSmallMarginEnd");
      if (convertSwitchContainer) {
        buttonsWrapper.addItem(convertSwitchContainer);
      }
      buttonsWrapper.addItem(deleteBtn);
      columnListItem.addCell(new HBox({
        id: `${id}-cell`,
        alignItems: "Center",
        justifyContent: "SpaceBetween",
        items: [new ObjectIdentifier({
          id: `${id}-cellItem`,
          title: insightsApp.visualization?.title,
          text: insightsApp.visualization?.subtitle,
          tooltip: insightsApp.visualization?.title
        }).addStyleClass("objectIdentifierMargin"), buttonsWrapper]
      }));
      columnListItem.data("persConfig", insightsApp.persConfig);
      return columnListItem;
    },
    /**
     * Handles Convert Tile
     * @private
     */
    _onConvertTilePress: function _onConvertTilePress(app) {
      try {
        const _this2 = this;
        const displayFormatHint = app.visualization?.displayFormatHint,
          updateConfigs = {
            pageId: MYHOME_PAGE_ID,
            sourceSectionIndex: app.persConfig?.sectionIndex,
            sourceVisualizationIndex: app.persConfig?.visualizationIndex,
            oVisualizationData: {
              displayFormatHint: displayFormatHint === DisplayFormat.Standard ? DisplayFormat.StandardWide : DisplayFormat.Standard
            }
          };
        _this2._getWrapperFlexBox().setBusy(true);
        return Promise.resolve(_this2.appManagerInstance.updateVisualizations(updateConfigs)).then(function () {
          return Promise.resolve(_this2._getTilePanel().refreshData()).then(function () {
            if (app.visualization) {
              app.visualization.displayFormatHint = updateConfigs.oVisualizationData.displayFormatHint;
            }
            _this2._getWrapperFlexBox().setBusy(false);
          });
        });
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Deletes Insights App
     * @private
     */
    _onDeleteApp: function _onDeleteApp(app) {
      MessageBox.show(this._i18nBundle.getText("remove_tile_confirmation_title", [app.title]), {
        id: "removeTileConfirmation",
        styleClass: "msgBoxWidth",
        icon: MessageBox.Icon.QUESTION,
        title: this._i18nBundle.getText("remove"),
        actions: [this._i18nBundle.getText("remove"), MessageBox.Action.CANCEL],
        emphasizedAction: this._i18nBundle.getText("remove"),
        onClose: action => this._handleDeleteApp(action, app)
      });
    },
    /**
     * Handle Delete App Confirmation Decision
     * @private
     */
    _handleDeleteApp: function _handleDeleteApp(action, app) {
      try {
        const _this3 = this;
        const _temp4 = function () {
          if (action === _this3._i18nBundle.getText("remove")) {
            _this3._getWrapperFlexBox().setBusy(true);
            const _temp3 = _finallyRethrows(function () {
              return _catch(function () {
                return Promise.resolve(_this3.appManagerInstance.removeVisualizations({
                  sectionId: app.persConfig?.sectionId,
                  vizIds: [app.visualization?.id]
                })).then(function () {
                  MessageToast.show(_this3._i18nBundle.getText("appRemovedInsights"));
                  return Promise.resolve(_this3.appManagerInstance.fetchInsightApps(true, _this3._i18nBundle.getText("insights"))).then(function (_this3$appManagerInst) {
                    _this3._allInsightsApps = _this3$appManagerInst;
                    _this3._controlMap.get(`${_this3._wrapperId}--title`).setText(`${_this3._i18nBundle.getText("insightsTilesTitle")} (${_this3._allInsightsApps.length})`);
                    _this3._createTableRows(_this3._allInsightsApps);
                    return Promise.resolve(_this3._getTilePanel().refreshData()).then(function () {});
                  });
                });
              }, function (err) {
                Log.error(err);
                MessageToast.show(_this3._i18nBundle.getText("unableToRemoveInsightsApp"));
              });
            }, function (_wasThrown, _result) {
              _this3._getWrapperFlexBox().setBusy(false);
              if (_wasThrown) throw _result;
              return _result;
            });
            if (_temp3 && _temp3.then) return _temp3.then(function () {});
          }
        }();
        return Promise.resolve(_temp4 && _temp4.then ? _temp4.then(function () {}) : void 0);
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Returns wrapper FlexBox
     * @private
     */
    _getWrapperFlexBox: function _getWrapperFlexBox() {
      return this._controlMap.get(this._wrapperId);
    },
    /**
     * Returns Tiles Panel
     * @private
     */
    _getTilePanel: function _getTilePanel() {
      return this._getPanel();
    }
  });
  return InsightsTilesSettingsPanel;
});
//# sourceMappingURL=InsightsTilesSettingsPanel-dbg.js.map
