/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/base/ClassSupport", "sap/fe/templates/ObjectPage/Component", "sap/m/library"], function (ClassSupport, ObjectPageComponent, library) {
  "use strict";

  var _dec, _class;
  var _exports = {};
  var OverflowToolbarPriority = library.OverflowToolbarPriority;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _inheritsLoose(t, o) { t.prototype = Object.create(o.prototype), t.prototype.constructor = t, _setPrototypeOf(t, o); }
  function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
  let Component = (_dec = defineUI5Class("sap.fe.ariba.ObjectPage.Component", {
    library: "sap.fe.ariba",
    manifest: "json"
  }), _dec(_class = /*#__PURE__*/function (_ObjectPageComponent) {
    function Component() {
      return _ObjectPageComponent.apply(this, arguments) || this;
    }
    _exports = Component;
    _inheritsLoose(Component, _ObjectPageComponent);
    var _proto = Component.prototype;
    _proto.init = function init() {
      // Default settings for Ariba Object Page
      this.breadcrumbsHierarchyMode = this.breadcrumbsHierarchyMode ?? "fullNavigation";
      // FIORITECHP1-33762 Only for Ariba Usage, we set the share overflow priority to always overflow
      this.shareOverflowPriority = OverflowToolbarPriority.AlwaysOverflow;
      _ObjectPageComponent.prototype.init.call(this);
      // Additional initializations for Ariba ObjectPage specific settings can be added here
    };
    _proto._getControllerName = function _getControllerName() {
      return "sap.fe.ariba.ObjectPage.ObjectPageController";
    };
    return Component;
  }(ObjectPageComponent)) || _class);
  _exports = Component;
  return _exports;
}, false);
//# sourceMappingURL=Component-dbg.js.map
