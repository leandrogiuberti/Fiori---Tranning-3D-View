/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/base/ClassSupport", "../controls/BuildingBlockObjectProperty"], function (ClassSupport, BuildingBlockObjectProperty) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10;
  var _exports = {};
  var property = ClassSupport.property;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _initializerDefineProperty(e, i, r, l) { r && Object.defineProperty(e, i, { enumerable: r.enumerable, configurable: r.configurable, writable: r.writable, value: r.initializer ? r.initializer.call(l) : void 0 }); }
  function _inheritsLoose(t, o) { t.prototype = Object.create(o.prototype), t.prototype.constructor = t, _setPrototypeOf(t, o); }
  function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
  function _applyDecoratedDescriptor(i, e, r, n, l) { var a = {}; return Object.keys(n).forEach(function (i) { a[i] = n[i]; }), a.enumerable = !!a.enumerable, a.configurable = !!a.configurable, ("value" in a || a.initializer) && (a.writable = !0), a = r.slice().reverse().reduce(function (r, n) { return n(i, e, r) || r; }, a), l && void 0 !== a.initializer && (a.value = a.initializer ? a.initializer.call(l) : void 0, a.initializer = void 0), void 0 === a.initializer ? (Object.defineProperty(i, e, a), null) : a; }
  function _initializerWarningHelper(r, e) { throw Error("Decorating class property failed. Please ensure that transform-class-properties is enabled and runs after the decorators transform."); }
  /**
   * Definition of the export settings applied to a column within the table.
   * @public
   */
  let ColumnExportSettings = (_dec = defineUI5Class("sap.fe.macros.table.ColumnExportSettings"), _dec2 = property({
    type: "string"
  }), _dec3 = property({
    type: "string"
  }), _dec4 = property({
    type: "boolean"
  }), _dec5 = property({
    type: "string"
  }), _dec6 = property({
    type: "string[]"
  }), _dec7 = property({
    type: "number"
  }), _dec8 = property({
    type: "string"
  }), _dec9 = property({
    type: "string"
  }), _dec10 = property({
    type: "string"
  }), _dec11 = property({
    type: "object"
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlockObjectP) {
    function ColumnExportSettings(settings) {
      var _this;
      _this = _BuildingBlockObjectP.call(this, settings) || this;
      /**
       * Determines the column header text.
       * @public
       */
      _initializerDefineProperty(_this, "label", _descriptor, _this);
      /**
       * Determines a formatting template that supports indexed placeholders within curly brackets.
       * @public
       */
      _initializerDefineProperty(_this, "template", _descriptor2, _this);
      /**
       * Determines if the content needs to be wrapped.
       * @public
       */
      _initializerDefineProperty(_this, "wrap", _descriptor3, _this);
      /**
       * Determines the data type of the field
       * @public
       */
      _initializerDefineProperty(_this, "type", _descriptor4, _this);
      /**
       * Determines the properties of the column.
       * @public
       */
      _initializerDefineProperty(_this, "property", _descriptor5, _this);
      /**
       * Determines the width of the column in characters
       * @public
       */
      _initializerDefineProperty(_this, "width", _descriptor6, _this);
      /**
       * Determines the alignment of the column of the cell contents.
       * Available options are:<br/>
       * - Left<br/>
       * - Right<br/>
       * - Center<br/>
       * - Begin<br/>
       * - End<br/>
       * <br/>
       * @public
       */
      _initializerDefineProperty(_this, "textAlign", _descriptor7, _this);
      /**
       * Determines the text associated to a Boolean type with 'true' as value.
       * @public
       */
      _initializerDefineProperty(_this, "trueValue", _descriptor8, _this);
      /**
       * Determines the text associated to a Boolean type with 'false' as value.
       * @public
       */
      _initializerDefineProperty(_this, "falseValue", _descriptor9, _this);
      /**
       * Determines the mapping object holding the values associated with a specific key.
       * Enumeration type must be used when valueMap is provided.
       * @public
       */
      _initializerDefineProperty(_this, "valueMap", _descriptor10, _this);
      return _this;
    }
    _exports = ColumnExportSettings;
    _inheritsLoose(ColumnExportSettings, _BuildingBlockObjectP);
    return ColumnExportSettings;
  }(BuildingBlockObjectProperty), _descriptor = _applyDecoratedDescriptor(_class2.prototype, "label", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "template", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "wrap", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "type", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "property", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "width", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "textAlign", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "trueValue", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "falseValue", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "valueMap", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _class2)) || _class);
  _exports = ColumnExportSettings;
  return _exports;
}, false);
//# sourceMappingURL=ColumnExportSettings-dbg.js.map
