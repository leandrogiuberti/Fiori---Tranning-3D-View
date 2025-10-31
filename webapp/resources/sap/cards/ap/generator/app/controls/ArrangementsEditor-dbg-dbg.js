/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
"use strict";

sap.ui.define(["sap/m/Button", "sap/m/ComboBox", "sap/m/CustomListItem", "sap/m/HBox", "sap/m/List", "sap/m/Text", "sap/ui/core/Control", "sap/ui/core/Element", "sap/ui/core/ListItem", "sap/ui/core/library", "sap/ui/model/Sorter", "sap/ui/model/json/JSONModel", "../../config/TextArrangementOptions", "../../helpers/IntegrationCardHelper"], function (Button, ComboBox, CustomListItem, HBox, List, Text, Control, CoreElement, ListItem, sap_ui_core_library, Sorter, JSONModel, ____config_TextArrangementOptions, ____helpers_IntegrationCardHelper) {
  "use strict";

  const ValueState = sap_ui_core_library["ValueState"];
  const TEXTARRANGEMENT_OPTIONS = ____config_TextArrangementOptions["TEXTARRANGEMENT_OPTIONS"];
  const getPreviewItems = ____helpers_IntegrationCardHelper["getPreviewItems"];
  /**
   * @namespace sap.cards.ap.generator.app.controls
   */
  const ArrangementsEditor = Control.extend("sap.cards.ap.generator.app.controls.ArrangementsEditor", {
    renderer: {
      apiVersion: 2,
      render: function (rm, control) {
        rm.openStart("div", control);
        rm.openEnd();
        rm.renderControl(control._list);
        rm.renderControl(control._addButton);
        rm.close("div");
      }
    },
    metadata: {
      properties: {
        mode: "string",
        selectionKeys: {
          type: "object",
          defaultValue: {}
        },
        navigationSelectionKeys: {
          type: "object",
          defaultValue: {}
        },
        items: {
          type: "object",
          defaultValue: {}
        }
      },
      aggregations: {
        _list: {
          type: "sap.m.List",
          multiple: false,
          visibility: "hidden"
        }
      },
      events: {
        change: {
          parameters: {
            value: {
              type: "int"
            }
          }
        },
        selectionChange: {
          parameters: {
            value: {
              type: "int"
            }
          }
        }
      }
    },
    constructor: function _constructor(settings) {
      Control.prototype.constructor.call(this, settings);
    },
    /**
     * Initializes the ArrangementsEditor custom control
     *
     * This method sets up various controls and event handlers used by the methods in this control
     *
     * @returns {void}
     */
    init: function _init() {
      const that = this;
      this._list = new List({
        showNoData: false
      });
      this._propertyComboBox = new ComboBox({
        width: "100%",
        valueState: "{= ${valueState} }",
        valueStateText: "{= ${valueStateText} }",
        selectionChange: function (event) {
          that.handleComboBoxEvents(event, that, false, true);
        },
        change: function (event) {
          const source = event.getSource();
          const bindingContext = source.getBindingContext();
          const path = bindingContext?.getPath() || "";
          const model = that.getModel();
          const selectedItem = model.getProperty(path);
          const textArrangementChanged = true;
          that.fireEvent("change", {
            value: that.getItems(),
            selectedItem,
            textArrangementChanged
          });
        }
      });
      this._separatorColon = new Text({
        text: ":"
      }).addStyleClass("sapUiTinyMarginTop sapUiTinyMarginBeginEnd");
      this._idNavigationComboBox = new ComboBox({
        width: "100%",
        visible: "{= !!${isNavigationForId} }",
        valueState: "{= ${navigationValueState} }",
        valueStateText: "{= ${navigationValueStateText} }",
        change: function () {
          that.fireEvent("change", {
            value: that.getItems()
          });
        },
        selectionChange: function (event) {
          that.handleComboBoxEvents(event, that, true);
        }
      }).addStyleClass("sapUiTinyMarginBegin");
      this._uomComboBox = new ComboBox({
        width: "100%",
        change: function (event) {
          const source = event.getSource();
          const bindingContext = source.getBindingContext();
          const path = bindingContext?.getPath() || "";
          const model = that.getModel();
          const selectedItem = model.getProperty(path);
          that.fireEvent("change", {
            value: that.getItems(),
            selectedItem
          });
        },
        selectionChange: function (event) {
          that.handleComboBoxEvents(event, that);
        }
      });
      this._descriptionNavigationComboBox = new ComboBox({
        width: "100%",
        visible: "{= !!${isNavigationForDescription} }",
        change: function () {
          that.fireEvent("change", {
            value: that.getItems()
          });
        },
        selectionChange: function (event) {
          that.handleComboBoxEvents(event, that, true);
        }
      }).addStyleClass("sapUiTinyMarginBegin");
      this._separatorColonText = new Text({
        text: ":"
      }).addStyleClass("sapUiTinyMarginTop sapUiTinyMarginBeginEnd");
      this._textArrangementComboBox = new ComboBox({
        width: "100%",
        change: function () {
          that.fireEvent("change", {
            type: "text",
            value: that.getItems()
          });
        },
        selectionChange: function (event) {
          const controlId = event.getParameter("id");
          const control = CoreElement.getElementById(controlId);
          const selectedKey = control.getSelectedKey();
          const source = event.getSource();
          const bindingContext = source.getBindingContext();
          const path = bindingContext?.getPath() || "";
          const model = that.getModel();
          const group = model.getProperty(path);
          group.textArrangement = `${selectedKey}`;
          model.refresh();
        }
      });
      this._deleteButton = new Button({
        icon: "sap-icon://delete",
        type: "Transparent",
        press: this._onDeleteButtonClicked.bind(this)
      });
      this._addButton = new Button({
        icon: "sap-icon://add",
        type: "Transparent",
        press: this._onAddButtonClicked.bind(this)
      });
    },
    /**
     * Performs actions after ArrangementsEditor custom control has been rendered
     *
     * This method is called after the control has been rendered in the UI
     * It updates entity data and refreshes the internal model of the TextArrangementComboBox
     *
     * @returns {void}
     */
    onAfterRendering: function _onAfterRendering() {
      const entityData = JSON.parse(JSON.stringify(this.getSelectionKeys()));
      const name = this._setSelectionKeysMap.name ?? "";
      const label = this._setSelectionKeysMap.label;
      const textArrangement = this._setSelectionKeysMap.textArrangement ?? "";
      entityData.forEach(entity => {
        entity.name = entity[name];
        entity.label = entity[label];
        entity.textArrangement = entity[textArrangement];
      });
      const _textArrangementComboBoxModel = this._textArrangementComboBox.getModel("internal");
      const i18nModel = this.getModel("i18n");
      TEXTARRANGEMENT_OPTIONS.forEach(option => {
        option.label = i18nModel.getObject(option.label);
      });
      _textArrangementComboBoxModel.setData(TEXTARRANGEMENT_OPTIONS, true);
      _textArrangementComboBoxModel.refresh();
    },
    /**
     * Sets the selection keys
     *
     * This method forms the _setSelectionKeysMap from selectionKeys binding information,
     * and binds aggregation items for ComboBox controls, updates internal model of text arrangement ComboBox
     *
     * @param {Array<PropertyInfo>} selectionKeysArr - The array of selection keys
     * @returns {void}
     */
    setSelectionKeys: function _setSelectionKeys(selectionKeysArr) {
      const that = this;
      that.setAggregation("_list", that._list);
      this.setProperty("selectionKeys", selectionKeysArr);
      this.setProperty("navigationSelectionKeys", selectionKeysArr);
      this._setSelectionKeysMap = this.getBindingInfo("selectionKeys").parameters;
      const propertyBindingPath = this.getBindingPath("navigationSelectionKeys") || "";
      this._propertyComboBox.bindAggregation("items", {
        path: propertyBindingPath,
        sorter: [new Sorter("category", true, true), new Sorter("label", false)],
        length: 500,
        factory: function () {
          return new ListItem({
            key: "{" + that._setSelectionKeysMap.name + "}",
            text: "{" + that._setSelectionKeysMap.label + "}"
          });
        }
      });
      this._uomComboBox.bindAggregation("items", {
        path: propertyBindingPath,
        sorter: [new Sorter("category", true, true), new Sorter("label", false)],
        length: 500,
        factory: function () {
          return new ListItem({
            key: "{" + that._setSelectionKeysMap.name + "}",
            text: "{" + that._setSelectionKeysMap.label + "}"
          });
        }
      });
      that._idNavigationComboBox.bindAggregation("items", {
        path: "navigationalPropertiesForId/",
        sorter: new Sorter("label", false),
        length: 500,
        factory: function () {
          return new ListItem({
            key: "{name}",
            text: "{labelWithValue}"
          });
        }
      });
      that._descriptionNavigationComboBox.bindAggregation("items", {
        path: "navigationalPropertiesForDescription/",
        sorter: new Sorter("label", false),
        length: 500,
        factory: function () {
          return new ListItem({
            key: "{name}",
            text: "{labelWithValue}"
          });
        }
      });
      this._textArrangementComboBox.setModel(this._getTextArrangementModel(), "internal");
      this._textArrangementComboBox.bindAggregation("items", {
        path: "internal>/",
        factory: function () {
          return new ListItem({
            key: "{internal>name}",
            text: "{internal>label}"
          });
        }
      });
    },
    /**
     * Sets the items property with the selectionKeysArr provided
     * bind items for _list control using binding path of items,
     * creates a custom layout for each item using a HBox and arranging the content within the HBox according to the specified styles
     *
     * @param {Array<ArrangementOptions>} selectionKeysArr - The array of items to be set
     * @returns {void}
     */
    setItems: function _setItems(selectionKeysArr) {
      this.setProperty("items", selectionKeysArr, true);
      this._propertyComboBox.bindProperty("selectedKey", {
        path: "propertyKeyForId"
      });
      this._idNavigationComboBox.bindProperty("selectedKey", {
        path: "navigationKeyForId"
      });
      this._uomComboBox.bindProperty("selectedKey", {
        path: "propertyKeyForDescription"
      });
      this._descriptionNavigationComboBox.bindProperty("selectedKey", {
        path: "navigationKeyForDescription"
      });
      this._textArrangementComboBox.bindProperty("selectedKey", {
        path: "arrangementType"
      });
      const bindingPath = this.getBindingPath("items") ?? "";
      this._list.bindItems({
        path: bindingPath,
        template: new CustomListItem({
          content: [new HBox({
            renderType: "Bare",
            justifyContent: "SpaceAround",
            items: [this._propertyComboBox, this._idNavigationComboBox, this._separatorColon, this._uomComboBox, this.getMode() !== "uom" && this._separatorColonText, this.getMode() !== "uom" && this._descriptionNavigationComboBox, this.getMode() !== "uom" && this._separatorColonText, this.getMode() !== "uom" && this._textArrangementComboBox, this._deleteButton],
            width: "100%",
            alignItems: "Start",
            fitContainer: true
          })]
        })
      });
    },
    /**
     * Retrieves the internal model of the ArrangementsEditor control
     *
     * This method checks if the internal model exists. If not, it creates a new JSON model
     * and sets it as the internal model. It then returns the internal model
     *
     * @returns {sap.ui.model.Model} The internal model of the control
     */
    _getInternalModel: function _getInternalModel() {
      if (!this.getModel("internal")) {
        const model = new JSONModel({});
        this.setModel(model, "internal");
      }
      return this.getModel("internal");
    },
    /**
     * Retrieves the items from the model
     *
     * This method fetches the items from the model using the binding path for items
     *
     * @returns {Array<ArrangementOptions>} An array containing the items retrieved from the model
     */
    getItems: function _getItems() {
      const path = this.getBindingPath("items") || "";
      return this.getModel().getProperty(path);
    },
    getSelectedItem: function _getSelectedItem() {
      const path = this.getBindingPath("items") || "";
      return this.getModel().getProperty(path);
    },
    /**
     * Creates and returns a JSON model for text arrangement options
     *
     * This method creates a new JSON model using the provided text arrangement options and returns it.
     *
     * @returns {sap.ui.model.json.JSONModel} A JSON model containing text arrangement options
     */
    _getTextArrangementModel: function _getTextArrangementModel() {
      return new JSONModel(TEXTARRANGEMENT_OPTIONS);
    },
    /**
     * Handles the click event of the add button, adds a new item to the array and refreshes the model
     *
     * @returns {void}
     */
    _onAddButtonClicked: function _onAddButtonClicked() {
      const model = this.getModel();
      const path = this.getBindingPath("items") || "";
      if (model) {
        let boundData = model.getProperty(path);
        if (!boundData) {
          boundData = [];
        }
        boundData.push({});
        model.refresh();
      }
    },
    /**
     * Handles the click event of the delete button, removes item to be deleted, refreshes the model and fires a change event
     *
     * @param {Event} event - The event object representing the click event
     * @returns {void}
     */
    _onDeleteButtonClicked: function _onDeleteButtonClicked(event) {
      const source = event.getSource();
      const path = source.getBindingContext().getPath();
      const bindingPath = this.getBindingPath("items") || "";
      const model = this.getModel();
      const bindingPathProperty = model.getProperty(bindingPath);
      bindingPathProperty && bindingPathProperty.splice(path.slice(path.length - 1), 1);
      model.refresh();
      this.fireEvent("change", {
        value: this.getItems()
      });
    },
    handleComboBoxEvents: function _handleComboBoxEvents(event, editor, isNavigation = false, isTextArrangementID = false) {
      const controlId = event.getParameter("id");
      const control = CoreElement.getElementById(controlId);
      let selectedKey = control.getSelectedKey();
      const source = event.getSource();
      const bindingContext = source.getBindingContext();
      const path = bindingContext?.getPath() || "";
      const value = control.getValue();
      const model = editor.getModel();
      const group = model.getProperty(path);
      const i18nModel = editor.getModel("i18n");
      const navigationProperties = model.getProperty("/configuration/navigationProperty") || [];
      const isNavigationalProperty = this.hasNavigationProperty(navigationProperties, group.propertyKeyForDescription);
      // Determine the group name based on conditions
      group.name = this.getGroupName(group, isNavigation, isTextArrangementID);
      let navigationKey = "";
      if (group.navigationKeyForDescription) {
        navigationKey = `/${group.navigationKeyForDescription}`;
      }
      if (group.isNavigationForId) {
        selectedKey = group.name;
      }
      const groupVal = isNavigationalProperty ? `${group.propertyKeyForDescription}${navigationKey}` : group.propertyKeyForDescription;
      const isValidation = group.name === groupVal;
      // Update group value based on conditions
      if (!isValidation) {
        group.value = this.getGroupValue(group, isNavigation, isTextArrangementID, selectedKey, navigationProperties);
      }
      const previewItems = getPreviewItems(model);
      const isItemNotSelected = selectedKey !== groupVal && !previewItems.includes(group.name);
      this.updateControlState(control, value, selectedKey, isValidation, i18nModel, editor, isItemNotSelected);
      this.setValueStateForModel(model, i18nModel, selectedKey, bindingContext, editor, isItemNotSelected);
      model.refresh();
      return group;
    },
    getGroupName: function _getGroupName(group, isNavigation, isTextArrangementID) {
      if (isNavigation) {
        return group.navigationKeyForId ? `${group.propertyKeyForId}/${group.navigationKeyForId}` : `${group.propertyKeyForId}`;
      }
      if (isTextArrangementID) {
        return `${group.propertyKeyForId}`;
      }
      return group.navigationKeyForId ? `${group.propertyKeyForId}/${group.navigationKeyForId}` : `${group.propertyKeyForId}`;
    },
    getGroupValue: function _getGroupValue(group, isNavigation, isTextArrangementID, selectedKey, navigationProperties) {
      const {
        propertyKeyForId,
        propertyKeyForDescription,
        navigationKeyForDescription
      } = group;
      if (isNavigation) {
        return navigationKeyForDescription ? `${propertyKeyForDescription}/${navigationKeyForDescription}` : propertyKeyForDescription;
      }
      if (isTextArrangementID) {
        const isNavigationalProperty = this.hasNavigationProperty(navigationProperties, propertyKeyForId);
        if (navigationKeyForDescription) {
          return isNavigationalProperty ? `${propertyKeyForId}` : `${propertyKeyForDescription}/${navigationKeyForDescription}`;
        }
        return isNavigationalProperty ? propertyKeyForId : propertyKeyForDescription;
      }
      return propertyKeyForDescription || selectedKey;
    },
    updateControlState: function _updateControlState(control, value, selectedKey, isValidation, i18nModel, editor, isItemNotSelected) {
      if (!selectedKey && value) {
        control.setValueState(ValueState.Error);
        control.setValueStateText(i18nModel.getObject("INVALID_SELECTION"));
        editor.errorFlag = true;
      } else if (isValidation) {
        control.setValueState(ValueState.Error);
        control.setValueStateText(i18nModel.getObject("SAME_SELECTION"));
        editor.errorFlag = true;
      } else if (isItemNotSelected && value) {
        control.setValueState(ValueState.Information);
        control.setValueStateText(i18nModel.getObject("UNSELECTED_ITEM"));
        editor.errorFlag = false;
      } else {
        editor.errorFlag = false;
        control.setValueState(ValueState.None);
        control.setValueStateText("");
      }
    },
    hasNavigationProperty: function _hasNavigationProperty(navigationProperties, propertyToCheck) {
      return navigationProperties.length > 0 && navigationProperties.some(prop => prop.name === propertyToCheck);
    },
    /**
     * The function sets the ValueState of properties present in advanced formatting panel,
     * to ValueState.Information or ValueState.None on the basis of properties present in card preview.
     * @param {JSONModel} model - The JSON model containing the card configuration.
     * @param {ResourceModel} i18nModel - The resource model for localization.
     * @param {string} selectedKey - The selected key from the ComboBox.
     * @param {Context} bindingContext - The binding context of the ComboBox.
     * @param {ArrangementsEditor} editor - The ArrangementsEditor instance.
     * @param {boolean} isItemNotSelected - Flag indicating if the item is not present in the card preview.
     * @returns {void}
     */
    setValueStateForModel: function _setValueStateForModel(model, i18nModel, selectedKey, bindingContext, editor, isItemNotSelected) {
      const informativeMessage = i18nModel.getObject("UNSELECTED_ITEM");
      ["unitOfMeasures", "textArrangements"].forEach(property => {
        if (bindingContext?.getPath()?.includes(property)) {
          const formattingOptions = model.getProperty(`/configuration/advancedFormattingOptions/${property}`) ?? [];
          formattingOptions.forEach((item, index) => {
            let isNavigationalProperty = false;
            if (item.isNavigationForId && item.navigationKeyForId) {
              isNavigationalProperty = true;
            }
            if (!editor.errorFlag && isItemNotSelected && selectedKey === item.name) {
              if (item.valueState === ValueState.None || item.valueState === undefined) {
                model.setProperty(`/configuration/advancedFormattingOptions/${property}/${index}/valueState`, ValueState.Information);
                model.setProperty(`/configuration/advancedFormattingOptions/${property}/${index}/valueStateText`, informativeMessage);
              }
              if (isNavigationalProperty && (item.navigationValueState === ValueState.None || item.navigationValueState === undefined)) {
                model.setProperty(`/configuration/advancedFormattingOptions/${property}/${index}/navigationValueState`, ValueState.Information);
                model.setProperty(`/configuration/advancedFormattingOptions/${property}/${index}/navigationValueStateText`, informativeMessage);
              }
            } else if (!editor.errorFlag && !isItemNotSelected && selectedKey === item.name) {
              if (item.valueState === ValueState.Information) {
                model.setProperty(`/configuration/advancedFormattingOptions/${property}/${index}/valueState`, ValueState.None);
                model.setProperty(`/configuration/advancedFormattingOptions/${property}/${index}/valueStateText`, "");
              }
              if (isNavigationalProperty && item.navigationValueState === ValueState.Information) {
                model.setProperty(`/configuration/advancedFormattingOptions/${property}/${index}/navigationValueState`, ValueState.None);
                model.setProperty(`/configuration/advancedFormattingOptions/${property}/${index}/navigationValueStateText`, "");
              }
            }
          });
        }
      });
    }
  });
  return ArrangementsEditor;
});
//# sourceMappingURL=ArrangementsEditor-dbg-dbg.js.map
