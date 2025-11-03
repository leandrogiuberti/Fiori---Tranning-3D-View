/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/base/BindingToolkit", "sap/fe/base/ClassSupport", "sap/fe/core/CommonUtils", "sap/fe/core/buildingBlocks/BuildingBlock", "sap/m/RadioButton", "sap/m/RadioButtonGroup", "sap/ui/core/CustomData", "sap/fe/base/jsx-runtime/jsx"], function (BindingToolkit, ClassSupport, CommonUtils, BuildingBlock, RadioButton, RadioButtonGroup, CustomData, _jsx) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11;
  var _exports = {};
  var property = ClassSupport.property;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var pathInModel = BindingToolkit.pathInModel;
  function _initializerDefineProperty(e, i, r, l) { r && Object.defineProperty(e, i, { enumerable: r.enumerable, configurable: r.configurable, writable: r.writable, value: r.initializer ? r.initializer.call(l) : void 0 }); }
  function _inheritsLoose(t, o) { t.prototype = Object.create(o.prototype), t.prototype.constructor = t, _setPrototypeOf(t, o); }
  function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
  function _applyDecoratedDescriptor(i, e, r, n, l) { var a = {}; return Object.keys(n).forEach(function (i) { a[i] = n[i]; }), a.enumerable = !!a.enumerable, a.configurable = !!a.configurable, ("value" in a || a.initializer) && (a.writable = !0), a = r.slice().reverse().reduce(function (r, n) { return n(i, e, r) || r; }, a), l && void 0 !== a.initializer && (a.value = a.initializer ? a.initializer.call(l) : void 0, a.initializer = void 0), void 0 === a.initializer ? (Object.defineProperty(i, e, a), null) : a; }
  function _initializerWarningHelper(r, e) { throw Error("Decorating class property failed. Please ensure that transform-class-properties is enabled and runs after the decorators transform."); }
  let RadioButtons = (_dec = defineUI5Class("sap.fe.macros.controls.RadioButtons"), _dec2 = property({
    type: "string"
  }), _dec3 = property({
    type: "string[]"
  }), _dec4 = property({
    type: "string"
  }), _dec5 = property({
    type: "any",
    defaultValue: null
  }), _dec6 = property({
    type: "string"
  }), _dec7 = property({
    type: "object",
    bindToState: true
  }), _dec8 = property({
    type: "any",
    isBindingInfo: true
  }), _dec9 = property({
    type: "any",
    isBindingInfo: true
  }), _dec10 = property({
    type: "boolean"
  }), _dec11 = property({
    type: "string"
  }), _dec12 = property({
    type: "string"
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlock) {
    function RadioButtons(properties, others) {
      var _this;
      _this = _BuildingBlock.call(this, properties, others) || this;
      _initializerDefineProperty(_this, "id", _descriptor, _this);
      _initializerDefineProperty(_this, "fieldGroupIds", _descriptor2, _this);
      _initializerDefineProperty(_this, "requiredExpression", _descriptor3, _this);
      // We use type 'raw' here because otherwise the binding will refuse to update the value, as it doesn't know how to convert from any to string
      // Setting it to raw make sure that no conversion is attempted which then works
      // Default value is set to null to allow having a radio button pointing to a `null` value
      _initializerDefineProperty(_this, "value", _descriptor4, _this);
      _initializerDefineProperty(_this, "fixedValuesPath", _descriptor5, _this);
      /**
       * An array of possible, fixed value list object
       * If this property is used, the fixedValuesPath property is ignored.
       */
      _initializerDefineProperty(_this, "possibleValues", _descriptor6, _this);
      _initializerDefineProperty(_this, "radioButtonTextProperty", _descriptor7, _this);
      _initializerDefineProperty(_this, "radioButtonKeyProperty", _descriptor8, _this);
      _initializerDefineProperty(_this, "horizontalLayout", _descriptor9, _this);
      _initializerDefineProperty(_this, "enabledExpression", _descriptor10, _this);
      _initializerDefineProperty(_this, "width", _descriptor11, _this);
      _this.content = _this.createContent();
      return _this;
    }

    /**
     * Event handler for the RadioButtonGroup's select event.
     * We need to parse from the radio button group index to the model value.
     * @param event
     */
    _exports = RadioButtons;
    _inheritsLoose(RadioButtons, _BuildingBlock);
    var _proto = RadioButtons.prototype;
    _proto.onRadioButtonSelect = function onRadioButtonSelect(event) {
      const radioButtonGroup = event.getSource();
      const selectedIndex = event.getParameter("selectedIndex");
      if (selectedIndex !== undefined) {
        const selectedRadioButtonKey = radioButtonGroup?.getButtons()[selectedIndex].getCustomData()[0].getValue();
        // Now we have the value => write it to the model!
        this.setProperty("value", selectedRadioButtonKey);
        CommonUtils.getTargetView(radioButtonGroup)?.getController()?._sideEffects?.handleFieldChange(event, true);
      }
    }

    /**
     * The value property type needs to be initially 'any' but has to be changed to 'raw' to avoid parsing errors.
     * @param name
     * @param bindingInfo
     * @returns This
     */;
    _proto.bindProperty = function bindProperty(name, bindingInfo) {
      if (name === "value" && !bindingInfo.formatter) {
        // not if a formatter is used, as this needs to be executed
        bindingInfo.targetType = "raw";
      }
      return _BuildingBlock.prototype.bindProperty.call(this, name, bindingInfo);
    }

    /**
     * This is being called when the model fetches the data from the backend or when we call it directly.
     * We need to parse from the model value to the radio button group index.
     * @param newValue
     */;
    _proto.setValue = function setValue(newValue) {
      this.value = newValue;
      if (this.content) {
        // Compute the new radio button index
        const radioButtons = this.content.getButtons();
        if (radioButtons.length != 0) {
          let radioButtonIndex = 0;
          for (const radioButton of radioButtons) {
            const keyCustomData = radioButton.getCustomData()[0].getBinding("value")?.getValue();
            if (keyCustomData === newValue) {
              this.content.setSelectedIndex(radioButtonIndex);
              return;
            }
            radioButtonIndex++;
          }
        }
        // If no value could be found or if the radio button aggregation was empty, which can happen due to
        // a very early call of setValue, set the selected to index to -1 which results in NO radio button to be selected.
        this.content.setSelectedIndex(-1);
      }
    }

    /**
     * The building block render function.
     * @returns The radio button group
     */;
    _proto.createContent = function createContent() {
      // Setting up the binding so that we can access $count for getting the number
      // of entries in the fixed value list and set this as number of radio button columns
      // in case horizontal layout is configured
      let buttonsBindingContext;
      if (this.possibleValues) {
        buttonsBindingContext = this.bindState("possibleValues");
        this.radioButtonTextProperty = pathInModel("text", "$componentState");
        this.radioButtonKeyProperty = pathInModel("key", "$componentState");
      } else {
        buttonsBindingContext = {
          path: `${this.fixedValuesPath}`,
          parameters: {
            $count: true
          },
          events: {
            dataReceived: ev => {
              const count = ev.getSource()?.getCount();
              if (count !== undefined && this.horizontalLayout) {
                radioButtonGroup.setColumns(count);
              }
              // Check if there is a value stored from the initialization but the radio
              // button selection has not yet been done and do this now
              if (this.value !== undefined && radioButtonGroup.getSelectedIndex() === -1) {
                this.setValue(this.value);
              }
            }
          }
        };
      }
      this.onRadioButtonSelect.bind(this);
      const radioButtonGroup = _jsx(RadioButtonGroup, {
        buttons: buttonsBindingContext,
        select: this.onRadioButtonSelect.bind(this),
        enabled: this.enabledExpression,
        fieldGroupIds: this.fieldGroupIds,
        ariaLabelledBy: this.ariaLabelledBy,
        width: this.width,
        columns: this.possibleValues?.length ?? 1,
        children: _jsx(RadioButton, {
          text: this.radioButtonTextProperty,
          customData: _jsx(CustomData, {
            value: this.radioButtonKeyProperty
          }, "key"),
          class: "sapUiSmallMarginEnd",
          tooltip: this.radioButtonTextProperty
        })
      });
      return radioButtonGroup;
    };
    return RadioButtons;
  }(BuildingBlock), _descriptor = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "fieldGroupIds", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "requiredExpression", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "value", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "fixedValuesPath", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "possibleValues", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "radioButtonTextProperty", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "radioButtonKeyProperty", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "horizontalLayout", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return false;
    }
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "enabledExpression", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "";
    }
  }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "width", [_dec12], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "100%";
    }
  }), _class2)) || _class);
  _exports = RadioButtons;
  return _exports;
}, false);
//# sourceMappingURL=RadioButtons-dbg.js.map
