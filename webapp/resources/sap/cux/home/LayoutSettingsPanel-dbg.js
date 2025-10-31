/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/m/Button", "sap/m/Column", "sap/m/ColumnListItem", "sap/m/HBox", "sap/m/MessageBox", "sap/m/ObjectIdentifier", "sap/m/Table", "sap/m/Text", "sap/m/ToggleButton", "sap/m/VBox", "sap/ui/core/Element", "sap/ui/core/Icon", "sap/ui/core/Lib", "sap/ui/model/json/JSONModel", "./BaseSettingsPanel", "./flexibility/Layout.flexibility", "./utils/Accessibility", "./utils/Constants", "./utils/DragDropUtils", "./utils/PersonalisationUtils"], function (Log, Button, Column, ColumnListItem, HBox, MessageBox, ObjectIdentifier, Table, Text, ToggleButton, VBox, Element, Icon, Lib, JSONModel, __BaseSettingsPanel, ___flexibility_Layoutflexibility, ___utils_Accessibility, ___utils_Constants, ___utils_DragDropUtils, __PersonalisationUtils) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const BaseSettingsPanel = _interopRequireDefault(__BaseSettingsPanel);
  const CHANGE_TYPES = ___flexibility_Layoutflexibility["CHANGE_TYPES"];
  const getInvisibleText = ___utils_Accessibility["getInvisibleText"];
  const SETTINGS_PANELS_KEYS = ___utils_Constants["SETTINGS_PANELS_KEYS"];
  const focusDraggedItem = ___utils_DragDropUtils["focusDraggedItem"];
  const PersonalisationUtils = _interopRequireDefault(__PersonalisationUtils);
  /**
   *
   * Class for My Home Layout Settings Panel.
   *
   * @extends BaseSettingsPanel
   *
   * @author SAP SE
   * @version 0.0.1
   * @since 1.121
   * @private
   *
   * @alias sap.cux.home.LayoutSettingsPanel
   */
  const LayoutSettingsPanel = BaseSettingsPanel.extend("sap.cux.home.LayoutSettingsPanel", {
    metadata: {
      library: "sap.cux.home"
    },
    constructor: function _constructor(id, settings) {
      BaseSettingsPanel.prototype.constructor.call(this, id, settings);
      this._isCollapseHandlerAttached = false;
    },
    /**
     * Init lifecycle method
     *
     * @public
     * @override
     */
    init: function _init() {
      BaseSettingsPanel.prototype.init.call(this);

      //setup panel
      this.setProperty("key", SETTINGS_PANELS_KEYS.LAYOUT);
      this.setProperty("title", this._i18nBundle.getText("layout"));
      this.setProperty("icon", "sap-icon://grid");
      this._resetActionButton = new Button({
        id: `${this.getId()}-layoutResetBtn`,
        text: this._i18nBundle.getText("resetButton"),
        press: () => this.resetMyhomeSettings()
      });
      // Add button to actionButtons aggregation
      this.addActionButton(this._resetActionButton);
      //setup layout content
      this.addAggregation("content", this._getContent());
      //fired every time on panel navigation
      this.attachPanelNavigated(() => void this._loadSections());
      this._manageSectionsChanges = [];
    },
    /**
     * Method to set visibility of the container sections
     * Toggle button pressed event handler
     *
     * @private
     */
    createShowHideChangeFile: function _createShowHideChangeFile(oControlEvent) {
      try {
        const _this = this;
        const toggle = oControlEvent.getSource();
        const bValue = !toggle.getPressed();
        const oContext = toggle.getBindingContext()?.getObject();
        oContext.visible = bValue;
        _this._getPanel().getSections().find(section => section.completeId === oContext.completeId).visible = bValue;
        const sChangeType = bValue ? CHANGE_TYPES.UNHIDE : CHANGE_TYPES.HIDE;
        const oWrapperItem = Element.getElementById(oContext.completeId);
        _this._manageSectionsChanges.push({
          selectorElement: oWrapperItem,
          changeSpecificData: {
            changeType: sChangeType
          }
        });
        // }
        return Promise.resolve(_this._saveManageSectionsDialog()).then(function () {
          setTimeout(() => oWrapperItem.adjustLayout());

          // switch to collapsed view if the container is in expanded view
          if (!bValue) {
            _this._switchToCollapsedViewIfRequired([oWrapperItem]);
          }
        });
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Switches the layout to collapsed view if the current container is in expanded view
     *
     * @private
     * @param {BaseContainer} container - container instance to check
     * @returns {void}
     */
    _switchToCollapsedViewIfRequired: function _switchToCollapsedViewIfRequired(containers) {
      const layout = this._getPanel();
      const isLayoutExpanded = layout.getProperty("expanded");
      const expandedContainer = containers.filter(container => layout._getCurrentExpandedElementName() === container.getProperty("fullScreenName"));
      if (isLayoutExpanded) {
        layout.toggleFullScreen(expandedContainer[0]._getSelectedPanel());
      }
    },
    /**
     * Method to load the sections
     *
     * @private
     */
    _loadSections: function _loadSections() {
      try {
        const _this2 = this;
        const layout = _this2._getPanel();
        return Promise.resolve(layout._calculateSectionsState()).then(function () {
          _this2._orderedSections = JSON.parse(JSON.stringify(layout.getSections()));
          // not a good way as there could be more than one insights container, discuss
          // attach collapse event handler to rearrange layout elements if required
          _this2._orderedSections.forEach(oSection => {
            if (oSection.sContainerType === "sap.cux.home.InsightsContainer" && !oSection.title) {
              oSection.title = String(_this2._i18nBundle?.getText("insights"));
            }
          });
          _this2._controlModel = new JSONModel(_this2._orderedSections);
          _this2._layoutTable.setModel(_this2._controlModel);
          _this2._layoutTable.bindItems({
            path: "/",
            factory: id => {
              if (!_this2._dndInvisibleText || _this2._dndInvisibleText.isDestroyed()) {
                _this2._dndInvisibleText = getInvisibleText(_this2.getId() + "--layoutDndText", _this2._i18nBundle.getText("keyPressAriaText"));
              }
              return new ColumnListItem(`${id}--columnListItem`, {
                type: "Inactive",
                cells: [new HBox(`${id}--columnListHBox`, {
                  alignItems: "Center",
                  items: [new Icon(`${id}--columnListIcon`, {
                    src: "sap-icon://vertical-grip"
                  }).addStyleClass("sapUiSmallMarginEnd"), new HBox(`${id}--columnListItemHBox`, {
                    justifyContent: "SpaceBetween",
                    alignItems: "Center",
                    width: "100%",
                    items: [new ObjectIdentifier(`${id}--columnListObjectIdentifier`, {
                      title: "{title}",
                      text: "{text}",
                      tooltip: "{title}"
                    }), new ToggleButton(`${id}--layoutSettingstoggleButton`, {
                      tooltip: "{= ${visible} ? '" + _this2._i18nBundle.getText("hideBtn") + "' : '" + _this2._i18nBundle.getText("showBtn") + "' }",
                      icon: "sap-icon://show",
                      type: "Emphasized",
                      enabled: "{= !${blocked}}",
                      press: event => {
                        void _this2.createShowHideChangeFile(event);
                      },
                      pressed: "{= !${visible}}",
                      ariaLabelledBy: ["selectLabel"]
                    }).addStyleClass("sapUiTinyMarginEnd sapUiTinyMarginTop")]
                  }), _this2._dndInvisibleText],
                  width: "100%"
                })],
                ariaLabelledBy: [_this2._dndInvisibleText.getId()]
              }).addStyleClass("insightsListItem insightsListMargin");
            }
          });
          if (!_this2._isCollapseHandlerAttached) {
            _this2._isCollapseHandlerAttached = true;
            layout.attachEvent("onCollapse", () => _this2._rearrangeLayoutIfRequired());
          }
        });
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Rearranges the layout elements if their order has changed.
     *
     * @private
     */
    _rearrangeLayoutIfRequired: function _rearrangeLayoutIfRequired() {
      const layout = this._getPanel();
      const currentLayoutElements = layout.getItems();
      if (Array.isArray(this._allLayoutElements) && currentLayoutElements.length === this._allLayoutElements.length) {
        const isOrderChanged = currentLayoutElements.some((element, index) => {
          return element.getId() !== this._allLayoutElements[index].getId();
        });
        if (isOrderChanged) {
          layout.removeAllItems();
          this._allLayoutElements.forEach(element => {
            layout.addItem(element);
          });
        }
      }
    },
    /**
     * Returns the content for the Layout Settings Panel.
     *
     * @private
     * @returns {VBox} The control containing the Layout Settings Panel content.
     */
    _getContent: function _getContent() {
      const oHeader = this._setHeaderIntro();
      const oTable = this.setLayoutTable();
      const oInvisibleText = getInvisibleText(this.getId() + "--titleText", this._i18nBundle.getText("layout"));
      const oContentVBox = new VBox(this.getId() + "--idNewsPageOuterVBoX", {
        alignItems: "Start",
        justifyContent: "SpaceBetween",
        renderType: "Bare",
        items: [oInvisibleText, oHeader, oTable]
      });
      [oInvisibleText, oHeader].forEach(control => {
        this._resetActionButton.addAriaLabelledBy(control.getId());
      });
      return oContentVBox;
    },
    /**
     * Returns the content for the Layout Settings Panel Header.
     *
     * @private
     * @returns {VBox} The control containing the Layout Settings Panel's Header content.
     */
    _setHeaderIntro: function _setHeaderIntro() {
      const oHeaderText = new Text(this.getId() + "--idCustLayoutText", {
        text: this._i18nBundle.getText("layoutIntroMsg")
      });
      const oHeaderVBox = new VBox(this.getId() + "--idLayoutIntroText", {
        backgroundDesign: "Solid",
        alignItems: "Start",
        justifyContent: "SpaceBetween",
        items: [oHeaderText],
        renderType: "Bare"
      }).addStyleClass("sapUiSmallMargin");
      return oHeaderVBox;
    },
    /**
     * Returns the content for the Layout Table.
     *
     * @private
     * @returns {sap.ui.core.Control} The control containing the Layout Settings Panel'sTable.
     */
    setLayoutTable: function _setLayoutTable() {
      if (!this._layoutTable) {
        this._layoutTable = new Table(this.getId() + "--idManageSectionsTable", {
          width: "calc(100% - 2rem)",
          items: [],
          columns: [new Column(this.getId() + "--idSectionTitleColumn", {
            width: "100%"
          })]
        }).addStyleClass("sapContrastPlus sapUiSmallMarginBeginEnd sapUiTinyMarginBottom");
        this.addDragDropConfigTo(this._layoutTable, event => void this.onDropManageSections(event));
      }
      return this._layoutTable;
    },
    /**
     * Function to save section changes of MyHomeSettingsDialog
     *
     * @private
     */
    _saveManageSectionsDialog: function _saveManageSectionsDialog() {
      try {
        const _this3 = this;
        return Promise.resolve(_this3._persistUserChanges({
          changes: _this3._manageSectionsChanges,
          appComponent: PersonalisationUtils.getOwnerComponent(_this3._getPanel())
        }).then(() => {
          const tableModel = _this3._layoutTable.getModel();
          tableModel.refresh();
          _this3._controlModel.refresh();
        }).finally(() => {
          _this3._manageSectionsChanges = [];
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Function to persist user changes
     *
     * @private
     */
    _persistUserChanges: function _persistUserChanges(mProperties) {
      return Lib.load({
        name: "sap.ui.fl"
      }).then(function () {
        return new Promise(function (resolve, reject) {
          sap.ui.require(["sap/ui/fl/write/api/ControlPersonalizationWriteAPI"], function (ControlPersonalizationWriteAPI) {
            ControlPersonalizationWriteAPI.add({
              changes: mProperties.changes,
              ignoreVariantManagement: true
            }).then(function (aGeneratedChanges) {
              return resolve(ControlPersonalizationWriteAPI.save({
                selector: {
                  appComponent: mProperties.appComponent
                },
                changes: aGeneratedChanges
              }));
            }).catch(function (oError) {
              if (oError instanceof Error) {
                Log.error("Unable to Save User Change: " + oError.message);
                return reject(oError);
              }
            });
          });
        });
      });
    },
    /**
     * Retrieves the actual index of a layout element by its ID.
     *
     * @private
     * @param {string} id - The ID of the layout element to find.
     * @returns {number} The index of the layout element.
     */
    _getActualIndex: function _getActualIndex(id) {
      const layout = this._getPanel();
      this._allLayoutElements = this._allLayoutElements || [...layout.getItems()];
      const isLayoutExpanded = layout.getProperty("expanded");
      const expandedElementConfig = layout._getCurrentExpandedElement();
      if (isLayoutExpanded && expandedElementConfig) {
        // add the expanded element if it isn't already in the list
        if (!this._allLayoutElements.some(element => element.getId() === expandedElementConfig.targetContainer.getId())) {
          this._allLayoutElements.splice(expandedElementConfig.index, 0, expandedElementConfig.targetContainer);
        }
      }
      return this._allLayoutElements.findIndex(element => element.getId() === id);
    },
    /**
     * Rearranges the layout elements by moving an element from the source index to the target index.
     *
     * @private
     * @param {number} sourceIndex - The index of the element to move.
     * @param {number} targetIndex - The index to move the element to.
     */
    _rearrangeLayoutElements: function _rearrangeLayoutElements(sourceIndex, targetIndex) {
      const container = this._allLayoutElements.splice(sourceIndex, 1)[0];
      this._allLayoutElements.splice(targetIndex, 0, container);

      //update the index of the expanded element if in expanded mode
      const layout = this._getPanel();
      const isLayoutExpanded = layout.getProperty("expanded");
      const expandedElementConfig = layout._getCurrentExpandedElement();
      if (isLayoutExpanded && expandedElementConfig) {
        const sourceElement = expandedElementConfig.sourceElements.values().next().value;
        layout.updateFullScreenElement(sourceElement, {
          index: this._allLayoutElements.indexOf(expandedElementConfig.targetContainer)
        });
      }
    },
    /**
     * Function to execute drag and drop among sections
     *
     * @private
     */
    onDropManageSections: function _onDropManageSections(oEvent) {
      try {
        const _this4 = this;
        function _temp2() {
          focusDraggedItem(_this4._layoutTable, iDropItemIndex);
        }
        const oWrapper = _this4._getPanel();
        const wrapperId = oWrapper.getId();
        const oDragItem = oEvent.getParameter?.("draggedControl") || oEvent.draggedControl;
        const iDragItemIndex = oDragItem.getParent()?.indexOfItem(oDragItem);
        const oDropItem = oEvent.getParameter?.("droppedControl") || oEvent.droppedControl;
        const iDropItemIndex = oDragItem.getParent()?.indexOfItem(oDropItem);
        const _temp = function () {
          if (iDragItemIndex !== iDropItemIndex) {
            const sectionOrder = _this4._orderedSections;
            const dragObject = oDragItem.getBindingContext()?.getObject();
            const dropObject = oDropItem.getBindingContext()?.getObject();
            const actualDragItemIndex = _this4._getActualIndex(dragObject.completeId);
            const actualDropItemIndex = _this4._getActualIndex(dropObject.completeId);
            _this4._rearrangeLayoutElements(actualDragItemIndex, actualDropItemIndex);
            sectionOrder.splice(iDragItemIndex, 1);
            sectionOrder.splice(iDropItemIndex, 0, dragObject);
            oWrapper.setSections(sectionOrder);
            _this4._manageSectionsChanges.push({
              selectorElement: oWrapper,
              changeSpecificData: {
                changeType: CHANGE_TYPES.MOVE,
                movedElements: [{
                  id: dragObject.completeId,
                  sourceIndex: actualDragItemIndex,
                  targetIndex: actualDropItemIndex
                }],
                source: {
                  id: wrapperId,
                  aggregation: "items"
                },
                target: {
                  id: wrapperId,
                  aggregation: "items"
                }
              }
            });
            return Promise.resolve(_this4._saveManageSectionsDialog()).then(function () {
              //switch to collapsed view if any of the containers is in expanded view
              const draggedContainer = Element.getElementById(dragObject.completeId);
              const droppedContainer = Element.getElementById(dropObject.completeId);
              _this4._switchToCollapsedViewIfRequired([draggedContainer, droppedContainer]);
            });
          }
        }();
        return Promise.resolve(_temp && _temp.then ? _temp.then(_temp2) : _temp2(_temp));
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Function to reset MyHome settings changes
     *
     * @private
     */
    resetMyhomeSettings: function _resetMyhomeSettings() {
      const _this5 = this;
      MessageBox.show(this._i18nBundle.getText("reset_cards_confirmation_msg"), {
        id: "resetCardsConfirmation",
        icon: MessageBox.Icon.QUESTION,
        title: this._i18nBundle.getText("reset_cards_confirmation_title"),
        actions: [this._i18nBundle.getText("reset_cards_button"), MessageBox.Action.CANCEL],
        onClose: function (oAction) {
          try {
            const _temp3 = function () {
              if (oAction === _this5._i18nBundle.getText("reset_cards_button")) {
                const aChangesForDeletion = [];
                for (let section of _this5._orderedSections) {
                  const element = Element.getElementById(section.completeId);
                  aChangesForDeletion.push(element);
                }
                // Revert Changes Related to DragnDrop
                aChangesForDeletion.push(_this5._getPanel());
                return Promise.resolve(Lib.load({
                  name: "sap.ui.fl"
                }).then(() => {
                  sap.ui.require(["sap/ui/fl/write/api/ControlPersonalizationWriteAPI"], ControlPersonalizationWriteAPI => {
                    void ControlPersonalizationWriteAPI.reset({
                      selectors: aChangesForDeletion,
                      changeTypes: [CHANGE_TYPES.MOVE, CHANGE_TYPES.UNHIDE, CHANGE_TYPES.HIDE]
                    }).finally(() => {
                      const layout = _this5._getPanel();
                      layout.resetSections();
                      layout.closeSettingsDialog();
                    });
                  });
                })).then(function () {});
              }
            }();
            return Promise.resolve(_temp3 && _temp3.then ? _temp3.then(function () {}) : void 0);
          } catch (e) {
            return Promise.reject(e);
          }
        }
      });
    }
  });
  return LayoutSettingsPanel;
});
//# sourceMappingURL=LayoutSettingsPanel-dbg.js.map
