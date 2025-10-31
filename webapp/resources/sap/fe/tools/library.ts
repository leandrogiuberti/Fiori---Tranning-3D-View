import ObjectPath from "sap/base/util/ObjectPath";
import type AppComponent from "sap/fe/core/AppComponent";
import "sap/fe/core/library";
import { toggleElementInspector } from "sap/fe/tools/Inspector";
import { addODataTrace } from "sap/fe/tools/ODataTracer";
import { openPopup } from "sap/fe/tools/SupportPopup";
import { serializeControlAsXML } from "sap/fe/tools/XMLSerializer";
import BindingParser from "sap/ui/base/BindingParser";
import UI5Element from "sap/ui/core/Element";
import Lib from "sap/ui/core/Lib";
import "sap/ui/core/library";
import JSONModel from "sap/ui/model/json/JSONModel";

const thisLib = Lib.init({
	name: "sap.fe.tools",
	apiVersion: 2,
	dependencies: ["sap.ui.core", "sap.fe.core"],
	types: [],
	interfaces: [],
	controls: [],
	elements: [],
	// eslint-disable-next-line no-template-curly-in-string
	version: "${version}",
	noLibraryCSS: true
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
}) as any;

ObjectPath.set("$fe", thisLib);
thisLib.serializeXML = serializeControlAsXML;
thisLib.byId = UI5Element.getElementById;
thisLib.toggleElementInspector = toggleElementInspector;
thisLib.storeAppComponent = function (appComponent: AppComponent): void {
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
export default thisLib;
