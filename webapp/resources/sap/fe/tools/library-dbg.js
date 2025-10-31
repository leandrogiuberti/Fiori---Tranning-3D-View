/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/util/ObjectPath", "sap/fe/core/library", "sap/fe/tools/Inspector", "sap/fe/tools/ODataTracer", "sap/fe/tools/SupportPopup", "sap/fe/tools/XMLSerializer", "sap/ui/base/BindingParser", "sap/ui/core/Element", "sap/ui/core/Lib", "sap/ui/core/library", "sap/ui/model/json/JSONModel"], function (ObjectPath, _library, Inspector, ODataTracer, SupportPopup, XMLSerializer, BindingParser, UI5Element, Lib, _library2, JSONModel) {
  "use strict";

  var serializeControlAsXML = XMLSerializer.serializeControlAsXML;
  var openPopup = SupportPopup.openPopup;
  var addODataTrace = ODataTracer.addODataTrace;
  var toggleElementInspector = Inspector.toggleElementInspector;
  const thisLib = Lib.init({
    name: "sap.fe.tools",
    apiVersion: 2,
    dependencies: ["sap.ui.core", "sap.fe.core"],
    types: [],
    interfaces: [],
    controls: [],
    elements: [],
    // eslint-disable-next-line no-template-curly-in-string
    version: "1.141.1",
    noLibraryCSS: true
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  });
  ObjectPath.set("$fe", thisLib);
  thisLib.serializeXML = serializeControlAsXML;
  thisLib.byId = UI5Element.getElementById;
  thisLib.toggleElementInspector = toggleElementInspector;
  thisLib.storeAppComponent = function (appComponent) {
    thisLib.appComponent = appComponent;
  };
  thisLib.controlIndex = 0;
  thisLib.supportModel = new JSONModel({
    data: [],
    cachedSupportLinks: {},
    supportLinksStateText: "Select control to retrieve support links"
  });
  addODataTrace(thisLib);
  BindingParser._keepBindingStrings = true;
  openPopup();
  return thisLib;
}, false);
