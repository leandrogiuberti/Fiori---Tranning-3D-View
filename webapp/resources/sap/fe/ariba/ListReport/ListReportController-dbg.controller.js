/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/base/ClassSupport", "sap/fe/templates/ListReport/ListReportController.controller"], function (ClassSupport, BaseListReportController) {
  "use strict";

  var _dec, _class;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _inheritsLoose(t, o) { t.prototype = Object.create(o.prototype), t.prototype.constructor = t, _setPrototypeOf(t, o); }
  function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
  let ListReportController = (_dec = defineUI5Class("sap.fe.ariba.ListReport.ListReportController"), _dec(_class = /*#__PURE__*/function (_BaseListReportContro) {
    function ListReportController() {
      return _BaseListReportContro.apply(this, arguments) || this;
    }
    _inheritsLoose(ListReportController, _BaseListReportContro);
    var _proto = ListReportController.prototype;
    // Indicate that this is an extension of the base controller, this is used for the page controller to know those method need to be wrapped with the owner call
    _proto._isExtension = function _isExtension() {
      return true;
    };
    return ListReportController;
  }(BaseListReportController)) || _class);
  return ListReportController;
}, false);
//# sourceMappingURL=ListReportController-dbg.controller.js.map
