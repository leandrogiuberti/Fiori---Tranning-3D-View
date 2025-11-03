/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/base/ClassSupport", "sap/fe/templates/ListReport/Component", "sap/m/library"], function (ClassSupport, ListReportComponent, library) {
  "use strict";

  var _dec, _class;
  var _exports = {};
  var OverflowToolbarPriority = library.OverflowToolbarPriority;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _inheritsLoose(t, o) { t.prototype = Object.create(o.prototype), t.prototype.constructor = t, _setPrototypeOf(t, o); }
  function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
  let Component = (_dec = defineUI5Class("sap.fe.ariba.ListReport.Component", {
    library: "sap.fe.ariba",
    manifest: "json"
  }), _dec(_class = /*#__PURE__*/function (_ListReportComponent) {
    function Component() {
      return _ListReportComponent.apply(this, arguments) || this;
    }
    _exports = Component;
    _inheritsLoose(Component, _ListReportComponent);
    var _proto = Component.prototype;
    _proto.init = function init() {
      // Default settings for Ariba List Report
      this.breadcrumbsHierarchyMode = this.breadcrumbsHierarchyMode ?? "fullNavigation";
      // FIORITECHP1-33762 Only for Ariba Usage, we set the share overflow priority to always overflow
      this.shareOverflowPriority = OverflowToolbarPriority.AlwaysOverflow;
      _ListReportComponent.prototype.init.call(this);
      // Additional initializations for Ariba List Report specific settings can be added here
    };
    _proto._getControllerName = function _getControllerName() {
      return "sap.fe.ariba.ListReport.ListReportController";
    };
    return Component;
  }(ListReportComponent)) || _class);
  _exports = Component;
  return _exports;
}, false);
//# sourceMappingURL=Component-dbg.js.map
