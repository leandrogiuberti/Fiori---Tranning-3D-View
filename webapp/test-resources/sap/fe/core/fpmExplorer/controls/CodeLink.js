/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/base/ClassSupport", "sap/ui/core/Element"], function (ClassSupport, UI5Element) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6;
  var _exports = {};
  var property = ClassSupport.property;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _initializerDefineProperty(e, i, r, l) { r && Object.defineProperty(e, i, { enumerable: r.enumerable, configurable: r.configurable, writable: r.writable, value: r.initializer ? r.initializer.call(l) : void 0 }); }
  function _inheritsLoose(t, o) { t.prototype = Object.create(o.prototype), t.prototype.constructor = t, _setPrototypeOf(t, o); }
  function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
  function _applyDecoratedDescriptor(i, e, r, n, l) { var a = {}; return Object.keys(n).forEach(function (i) { a[i] = n[i]; }), a.enumerable = !!a.enumerable, a.configurable = !!a.configurable, ("value" in a || a.initializer) && (a.writable = !0), a = r.slice().reverse().reduce(function (r, n) { return n(i, e, r) || r; }, a), l && void 0 !== a.initializer && (a.value = a.initializer ? a.initializer.call(l) : void 0, a.initializer = void 0), void 0 === a.initializer ? (Object.defineProperty(i, e, a), null) : a; }
  function _initializerWarningHelper(r, e) { throw Error("Decorating class property failed. Please ensure that transform-class-properties is enabled and runs after the decorators transform."); }
  let CodeLink = (_dec = defineUI5Class("sap.fe.core.fpmExplorer.controls.CodeLink"), _dec2 = property({
    type: "string"
  }), _dec3 = property({
    type: "string",
    defaultValue: "cds"
  }), _dec4 = property({
    type: "string"
  }), _dec5 = property({
    type: "string"
  }), _dec6 = property({
    type: "boolean",
    defaultValue: true
  }), _dec7 = property({
    type: "string"
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_UI5Element) {
    function CodeLink() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _UI5Element.call(this, ...args) || this;
      // The link to the file name to be read.
      _initializerDefineProperty(_this, "file", _descriptor, _this);
      // The type of the file. Default is "cds". You can also use "xml", "manifest", "ts", "view" or "rap".
      _initializerDefineProperty(_this, "codeType", _descriptor2, _this);
      // The start of the code to be read. If not given, the full code is read.
      _initializerDefineProperty(_this, "start", _descriptor3, _this);
      // The end of the code to be read. If no start is given, this is ignored. Can be either a code snippet or number of lines after the start.
      _initializerDefineProperty(_this, "end", _descriptor4, _this);
      // If xml is used and only start is given, the full tag is read.
      _initializerDefineProperty(_this, "fullTag", _descriptor5, _this);
      // The name also shown in the code editor, to be able to switch tabs. If not given, determined by the file name.
      _initializerDefineProperty(_this, "fileName", _descriptor6, _this);
      return _this;
    }
    _exports = CodeLink;
    _inheritsLoose(CodeLink, _UI5Element);
    return CodeLink;
  }(UI5Element), _descriptor = _applyDecoratedDescriptor(_class2.prototype, "file", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "codeType", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "start", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "end", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "fullTag", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "fileName", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _class2)) || _class);
  _exports = CodeLink;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDb2RlTGluayIsIl9kZWMiLCJkZWZpbmVVSTVDbGFzcyIsIl9kZWMyIiwicHJvcGVydHkiLCJ0eXBlIiwiX2RlYzMiLCJkZWZhdWx0VmFsdWUiLCJfZGVjNCIsIl9kZWM1IiwiX2RlYzYiLCJfZGVjNyIsIl9jbGFzcyIsIl9jbGFzczIiLCJfVUk1RWxlbWVudCIsIl90aGlzIiwiX2xlbiIsImFyZ3VtZW50cyIsImxlbmd0aCIsImFyZ3MiLCJBcnJheSIsIl9rZXkiLCJjYWxsIiwiX2luaXRpYWxpemVyRGVmaW5lUHJvcGVydHkiLCJfZGVzY3JpcHRvciIsIl9kZXNjcmlwdG9yMiIsIl9kZXNjcmlwdG9yMyIsIl9kZXNjcmlwdG9yNCIsIl9kZXNjcmlwdG9yNSIsIl9kZXNjcmlwdG9yNiIsIl9leHBvcnRzIiwiX2luaGVyaXRzTG9vc2UiLCJVSTVFbGVtZW50IiwiX2FwcGx5RGVjb3JhdGVkRGVzY3JpcHRvciIsInByb3RvdHlwZSIsImNvbmZpZ3VyYWJsZSIsImVudW1lcmFibGUiLCJ3cml0YWJsZSIsImluaXRpYWxpemVyIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJDb2RlTGluay50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBkZWZpbmVVSTVDbGFzcywgcHJvcGVydHkgfSBmcm9tIFwic2FwL2ZlL2Jhc2UvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgVUk1RWxlbWVudCBmcm9tIFwic2FwL3VpL2NvcmUvRWxlbWVudFwiO1xuXG50eXBlIENvZGVUeXBlID0gXCJjZHNcIiB8IFwieG1sXCIgfCBcInJhcFwiIHwgXCJtYW5pZmVzdFwiIHwgXCJ0c1wiIHwgXCJ2aWV3XCI7XG5cbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS5jb3JlLmZwbUV4cGxvcmVyLmNvbnRyb2xzLkNvZGVMaW5rXCIpXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb2RlTGluayBleHRlbmRzIFVJNUVsZW1lbnQge1xuXHQvLyBUaGUgbGluayB0byB0aGUgZmlsZSBuYW1lIHRvIGJlIHJlYWQuXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0ZmlsZSE6IHN0cmluZztcblxuXHQvLyBUaGUgdHlwZSBvZiB0aGUgZmlsZS4gRGVmYXVsdCBpcyBcImNkc1wiLiBZb3UgY2FuIGFsc28gdXNlIFwieG1sXCIsIFwibWFuaWZlc3RcIiwgXCJ0c1wiLCBcInZpZXdcIiBvciBcInJhcFwiLlxuXHRAcHJvcGVydHkoeyB0eXBlOiBcInN0cmluZ1wiLCBkZWZhdWx0VmFsdWU6IFwiY2RzXCIgfSlcblx0Y29kZVR5cGUhOiBDb2RlVHlwZTtcblxuXHQvLyBUaGUgc3RhcnQgb2YgdGhlIGNvZGUgdG8gYmUgcmVhZC4gSWYgbm90IGdpdmVuLCB0aGUgZnVsbCBjb2RlIGlzIHJlYWQuXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0c3RhcnQ/OiBzdHJpbmc7XG5cblx0Ly8gVGhlIGVuZCBvZiB0aGUgY29kZSB0byBiZSByZWFkLiBJZiBubyBzdGFydCBpcyBnaXZlbiwgdGhpcyBpcyBpZ25vcmVkLiBDYW4gYmUgZWl0aGVyIGEgY29kZSBzbmlwcGV0IG9yIG51bWJlciBvZiBsaW5lcyBhZnRlciB0aGUgc3RhcnQuXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0ZW5kPzogc3RyaW5nO1xuXG5cdC8vIElmIHhtbCBpcyB1c2VkIGFuZCBvbmx5IHN0YXJ0IGlzIGdpdmVuLCB0aGUgZnVsbCB0YWcgaXMgcmVhZC5cblx0QHByb3BlcnR5KHsgdHlwZTogXCJib29sZWFuXCIsIGRlZmF1bHRWYWx1ZTogdHJ1ZSB9KVxuXHRmdWxsVGFnPzogc3RyaW5nO1xuXG5cdC8vIFRoZSBuYW1lIGFsc28gc2hvd24gaW4gdGhlIGNvZGUgZWRpdG9yLCB0byBiZSBhYmxlIHRvIHN3aXRjaCB0YWJzLiBJZiBub3QgZ2l2ZW4sIGRldGVybWluZWQgYnkgdGhlIGZpbGUgbmFtZS5cblx0QHByb3BlcnR5KHsgdHlwZTogXCJzdHJpbmdcIiB9KVxu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