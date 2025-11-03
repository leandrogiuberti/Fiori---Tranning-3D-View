/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/base/ClassSupport", "sap/ui/core/Element"], function (ClassSupport, UI5Element) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4;
  var _exports = {};
  var property = ClassSupport.property;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var aggregation = ClassSupport.aggregation;
  function _initializerDefineProperty(e, i, r, l) { r && Object.defineProperty(e, i, { enumerable: r.enumerable, configurable: r.configurable, writable: r.writable, value: r.initializer ? r.initializer.call(l) : void 0 }); }
  function _inheritsLoose(t, o) { t.prototype = Object.create(o.prototype), t.prototype.constructor = t, _setPrototypeOf(t, o); }
  function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
  function _applyDecoratedDescriptor(i, e, r, n, l) { var a = {}; return Object.keys(n).forEach(function (i) { a[i] = n[i]; }), a.enumerable = !!a.enumerable, a.configurable = !!a.configurable, ("value" in a || a.initializer) && (a.writable = !0), a = r.slice().reverse().reduce(function (r, n) { return n(i, e, r) || r; }, a), l && void 0 !== a.initializer && (a.value = a.initializer ? a.initializer.call(l) : void 0, a.initializer = void 0), void 0 === a.initializer ? (Object.defineProperty(i, e, a), null) : a; }
  function _initializerWarningHelper(r, e) { throw Error("Decorating class property failed. Please ensure that transform-class-properties is enabled and runs after the decorators transform."); }
  let ImplementationStep = (_dec = defineUI5Class("sap.fe.core.fpmExplorer.controls.ImplementationStep"), _dec2 = property({
    type: "string"
  }), _dec3 = property({
    type: "string"
  }), _dec4 = aggregation({
    type: "sap.ui.core.Control"
  }), _dec5 = aggregation({
    type: "sap.ui.core.Control",
    isDefault: true
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_UI5Element) {
    function ImplementationStep() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _UI5Element.call(this, ...args) || this;
      // The title of the implementation step
      _initializerDefineProperty(_this, "title", _descriptor, _this);
      // The description of the implementation step
      _initializerDefineProperty(_this, "text", _descriptor2, _this);
      // As an alternative to the description text, we can use a control. Only use this if text is not enough
      _initializerDefineProperty(_this, "textContent", _descriptor3, _this);
      // Code Block showing the implementation of the step
      _initializerDefineProperty(_this, "implementation", _descriptor4, _this);
      return _this;
    }
    _exports = ImplementationStep;
    _inheritsLoose(ImplementationStep, _UI5Element);
    return ImplementationStep;
  }(UI5Element), _descriptor = _applyDecoratedDescriptor(_class2.prototype, "title", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "text", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "textContent", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "implementation", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _class2)) || _class);
  _exports = ImplementationStep;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJJbXBsZW1lbnRhdGlvblN0ZXAiLCJfZGVjIiwiZGVmaW5lVUk1Q2xhc3MiLCJfZGVjMiIsInByb3BlcnR5IiwidHlwZSIsIl9kZWMzIiwiX2RlYzQiLCJhZ2dyZWdhdGlvbiIsIl9kZWM1IiwiaXNEZWZhdWx0IiwiX2NsYXNzIiwiX2NsYXNzMiIsIl9VSTVFbGVtZW50IiwiX3RoaXMiLCJfbGVuIiwiYXJndW1lbnRzIiwibGVuZ3RoIiwiYXJncyIsIkFycmF5IiwiX2tleSIsImNhbGwiLCJfaW5pdGlhbGl6ZXJEZWZpbmVQcm9wZXJ0eSIsIl9kZXNjcmlwdG9yIiwiX2Rlc2NyaXB0b3IyIiwiX2Rlc2NyaXB0b3IzIiwiX2Rlc2NyaXB0b3I0IiwiX2V4cG9ydHMiLCJfaW5oZXJpdHNMb29zZSIsIlVJNUVsZW1lbnQiLCJfYXBwbHlEZWNvcmF0ZWREZXNjcmlwdG9yIiwicHJvdG90eXBlIiwiY29uZmlndXJhYmxlIiwiZW51bWVyYWJsZSIsIndyaXRhYmxlIiwiaW5pdGlhbGl6ZXIiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkltcGxlbWVudGF0aW9uU3RlcC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBhZ2dyZWdhdGlvbiwgZGVmaW5lVUk1Q2xhc3MsIHByb3BlcnR5IH0gZnJvbSBcInNhcC9mZS9iYXNlL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IHR5cGUgQ29udHJvbCBmcm9tIFwic2FwL3VpL2NvcmUvQ29udHJvbFwiO1xuaW1wb3J0IFVJNUVsZW1lbnQgZnJvbSBcInNhcC91aS9jb3JlL0VsZW1lbnRcIjtcblxuQGRlZmluZVVJNUNsYXNzKFwic2FwLmZlLmNvcmUuZnBtRXhwbG9yZXIuY29udHJvbHMuSW1wbGVtZW50YXRpb25TdGVwXCIpXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbXBsZW1lbnRhdGlvblN0ZXAgZXh0ZW5kcyBVSTVFbGVtZW50IHtcblx0Ly8gVGhlIHRpdGxlIG9mIHRoZSBpbXBsZW1lbnRhdGlvbiBzdGVwXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0dGl0bGU/OiBzdHJpbmc7XG5cblx0Ly8gVGhlIGRlc2NyaXB0aW9uIG9mIHRoZSBpbXBsZW1lbnRhdGlvbiBzdGVwXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0dGV4dD86IHN0cmluZztcblxuXHQvLyBBcyBhbiBhbHRlcm5hdGl2ZSB0byB0aGUgZGVzY3JpcHRpb24gdGV4dCwgd2UgY2FuIHVzZSBhIGNvbnRyb2wuIE9ubHkgdXNlIHRoaXMgaWYgdGV4dCBpcyBub3QgZW5vdWdoXG5cdEBhZ2dyZWdhdGlvbih7IHR5cGU6IFwic2FwLnVpLmNvcmUuQ29udHJvbFwiIH0pXG5cdHRleHRDb250ZW50PzogQ29udHJvbFtdO1xuXG5cdC8vIENvZGUgQmxvY2sgc2hvd2luZyB0aGUgaW1wbGVtZW50YXRpb24gb2YgdGhlIHN0ZXBcblx0QGFnZ3JlZ2F0aW9uKHsgdHlwZTogXCJzYXAudWkuY29yZS5Db250cm9sXCIsIGlzRGVmYXVsdDogdHJ1ZSB9KVxuXHRpbXBsZW1lbnRhdGlvbj86IENvbnRyb2xbXTtcbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7TUFLcUJBLGtCQUFrQixJQUFBQyxJQUFBLEdBRHRDQyxjQUFjLENBQUMscURBQXFELENBQUMsRUFBQUMsS0FBQSxHQUdwRUMsUUFBUSxDQUFDO0lBQUVDLElBQUksRUFBRTtFQUFTLENBQUMsQ0FBQyxFQUFBQyxLQUFBLEdBSTVCRixRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVMsQ0FBQyxDQUFDLEVBQUFFLEtBQUEsR0FJNUJDLFdBQVcsQ0FBQztJQUFFSCxJQUFJLEVBQUU7RUFBc0IsQ0FBQyxDQUFDLEVBQUFJLEtBQUEsR0FJNUNELFdBQVcsQ0FBQztJQUFFSCxJQUFJLEVBQUUscUJBQXFCO0lBQUVLLFNBQVMsRUFBRTtFQUFLLENBQUMsQ0FBQyxFQUFBVCxJQUFBLENBQUFVLE1BQUEsSUFBQUMsT0FBQSwwQkFBQUMsV0FBQTtJQUFBLFNBQUFiLG1CQUFBO01BQUEsSUFBQWMsS0FBQTtNQUFBLFNBQUFDLElBQUEsR0FBQUMsU0FBQSxDQUFBQyxNQUFBLEVBQUFDLElBQUEsT0FBQUMsS0FBQSxDQUFBSixJQUFBLEdBQUFLLElBQUEsTUFBQUEsSUFBQSxHQUFBTCxJQUFBLEVBQUFLLElBQUE7UUFBQUYsSUFBQSxDQUFBRSxJQUFBLElBQUFKLFNBQUEsQ0FBQUksSUFBQTtNQUFBO01BQUFOLEtBQUEsR0FBQUQsV0FBQSxDQUFBUSxJQUFBLFVBQUFILElBQUE7TUFiOUQ7TUFBQUksMEJBQUEsQ0FBQVIsS0FBQSxXQUFBUyxXQUFBLEVBQUFULEtBQUE7TUFJQTtNQUFBUSwwQkFBQSxDQUFBUixLQUFBLFVBQUFVLFlBQUEsRUFBQVYsS0FBQTtNQUlBO01BQUFRLDBCQUFBLENBQUFSLEtBQUEsaUJBQUFXLFlBQUEsRUFBQVgsS0FBQTtNQUlBO01BQUFRLDBCQUFBLENBQUFSLEtBQUEsb0JBQUFZLFlBQUEsRUFBQVosS0FBQTtNQUFBLE9BQUFBLEtBQUE7SUFBQTtJQUFBYSxRQUFBLEdBQUEzQixrQkFBQTtJQUFBNEIsY0FBQSxDQUFBNUIsa0JBQUEsRUFBQWEsV0FBQTtJQUFBLE9BQUFiLGtCQUFBO0VBQUEsRUFiK0M2QixVQUFVLEdBQUFOLFdBQUEsR0FBQU8seUJBQUEsQ0FBQWxCLE9BQUEsQ0FBQW1CLFNBQUEsWUFBQTVCLEtBQUE7SUFBQTZCLFlBQUE7SUFBQUMsVUFBQTtJQUFBQyxRQUFBO0lBQUFDLFdBQUE7RUFBQSxJQUFBWCxZQUFBLEdBQUFNLHlCQUFBLENBQUFsQixPQUFBLENBQUFtQixTQUFBLFdBQUF6QixLQUFBO0lBQUEwQixZQUFBO0lBQUFDLFVBQUE7SUFBQUMsUUFBQTtJQUFBQyxXQUFBO0VBQUEsSUFBQVYsWUFBQSxHQUFBSyx5QkFBQSxDQUFBbEIsT0FBQSxDQUFBbUIsU0FBQSxrQkFBQXhCLEtBQUE7SUFBQXlCLFlBQUE7SUFBQUMsVUFBQTtJQUFBQyxRQUFBO0lBQUFDLFdBQUE7RUFBQSxJQUFBVCxZQUFBLEdBQUFJLHlCQUFBLENBQUFsQixPQUFBLENBQUFtQixTQUFBLHFCQUFBdEIsS0FBQTtJQUFBdUIsWUFBQTtJQUFBQyxVQUFBO0lBQUFDLFFBQUE7SUFBQUMsV0FBQTtFQUFBLElBQUF2QixPQUFBLE1BQUFELE1BQUE7RUFBQWdCLFFBQUEsR0FBQTNCLGtCQUFBO0VBQUEsT0FBQTJCLFFBQUE7QUFBQSIsImlnbm9yZUxpc3QiOltdfQ==