/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/base/ClassSupport", "sap/fe/core/buildingBlocks/BuildingBlock", "sap/sac/df/FilterBar", "sap/sac/df/utils/MetaPathHelper", "sap/fe/base/jsx-runtime/jsx"], function (ClassSupport, BuildingBlock, DFFilterBar, MetaPathHelper, _jsx) {
  "use strict";

  var _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2;
  var _exports = {};
  var property = ClassSupport.property;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _initializerDefineProperty(e, i, r, l) { r && Object.defineProperty(e, i, { enumerable: r.enumerable, configurable: r.configurable, writable: r.writable, value: r.initializer ? r.initializer.call(l) : void 0 }); }
  function _inheritsLoose(t, o) { t.prototype = Object.create(o.prototype), t.prototype.constructor = t, _setPrototypeOf(t, o); }
  function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
  function _applyDecoratedDescriptor(i, e, r, n, l) { var a = {}; return Object.keys(n).forEach(function (i) { a[i] = n[i]; }), a.enumerable = !!a.enumerable, a.configurable = !!a.configurable, ("value" in a || a.initializer) && (a.writable = !0), a = r.slice().reverse().reduce(function (r, n) { return n(i, e, r) || r; }, a), l && void 0 !== a.initializer && (a.value = a.initializer ? a.initializer.call(l) : void 0, a.initializer = void 0), void 0 === a.initializer ? (Object.defineProperty(i, e, a), null) : a; }
  function _initializerWarningHelper(r, e) { throw Error("Decorating class property failed. Please ensure that transform-class-properties is enabled and runs after the decorators transform."); }
  /**
   * Building block for creating a dragonfly filter bar
   * @ui5-experimental-since
   */
  let FilterBar = (_dec = defineUI5Class("sap.fe.ina.blocks.FilterBar"), _dec2 = property({
    type: "string",
    required: true
  }), _dec3 = property({
    type: "string",
    required: true
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlock) {
    function FilterBar(idOrSettings, settings) {
      var _this;
      _this = _BuildingBlock.call(this, idOrSettings, settings) || this;
      _initializerDefineProperty(_this, "id", _descriptor, _this);
      _initializerDefineProperty(_this, "metaPath", _descriptor2, _this);
      return _this;
    }
    _exports = FilterBar;
    _inheritsLoose(FilterBar, _BuildingBlock);
    var _proto = FilterBar.prototype;
    _proto.onMetadataAvailable = function onMetadataAvailable() {
      const pageDef = this._getOwner()?.preprocessorContext?.getDefinitionForPage();
      if (pageDef) {
        const _filterBarDefinition = pageDef.getFilterBarDefinition({});
        //console.table(filterBarDefinition.getFilterFields())
      }
      this.content = this.createContent();
    };
    _proto.createContent = function createContent() {
      this.id = this.id + "::FilterBar";
      const sMetaPath = "mdm>" + MetaPathHelper.PathTo.DataProviders + this.metaPath + MetaPathHelper.PathTo.Variables;
      return _jsx(DFFilterBar, {
        id: this.id,
        metaPath: sMetaPath
      });
    };
    return FilterBar;
  }(BuildingBlock), _descriptor = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "metaPath", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _class2)) || _class);
  _exports = FilterBar;
  return _exports;
}, false);
//# sourceMappingURL=FilterBar-dbg.js.map
