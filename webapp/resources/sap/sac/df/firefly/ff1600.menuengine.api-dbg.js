/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define(
[
"sap/sac/df/firefly/ff0200.io"
],
function(oFF)
{
"use strict";

oFF.CmeActionType = function() {};
oFF.CmeActionType.prototype = new oFF.XConstantWithParent();
oFF.CmeActionType.prototype._ff_c = "CmeActionType";

oFF.CmeActionType.ABSTRACT = null;
oFF.CmeActionType.MULTI_SELECT = null;
oFF.CmeActionType.OPTION = null;
oFF.CmeActionType.SELECT = null;
oFF.CmeActionType.SIMPLE = null;
oFF.CmeActionType.SINGLE_SELECT = null;
oFF.CmeActionType.TOGGLE = null;
oFF.CmeActionType.TRIGGER = null;
oFF.CmeActionType.create = function(constant, parent)
{
	let actionType = new oFF.CmeActionType();
	actionType.setupExt(constant, parent);
	return actionType;
};
oFF.CmeActionType.staticSetup = function()
{
	oFF.CmeActionType.ABSTRACT = oFF.CmeActionType.create("Abstract", null);
	oFF.CmeActionType.SIMPLE = oFF.CmeActionType.create("Simple", oFF.CmeActionType.ABSTRACT);
	oFF.CmeActionType.TRIGGER = oFF.CmeActionType.create("Trigger", oFF.CmeActionType.SIMPLE);
	oFF.CmeActionType.TOGGLE = oFF.CmeActionType.create("Toggle", oFF.CmeActionType.SIMPLE);
	oFF.CmeActionType.OPTION = oFF.CmeActionType.create("Option", oFF.CmeActionType.SIMPLE);
	oFF.CmeActionType.SELECT = oFF.CmeActionType.create("Select", oFF.CmeActionType.ABSTRACT);
	oFF.CmeActionType.MULTI_SELECT = oFF.CmeActionType.create("MultiSelect", oFF.CmeActionType.SELECT);
	oFF.CmeActionType.SINGLE_SELECT = oFF.CmeActionType.create("SingleSelect", oFF.CmeActionType.SELECT);
};

oFF.MenuEngineApiModule = function() {};
oFF.MenuEngineApiModule.prototype = new oFF.DfModule();
oFF.MenuEngineApiModule.prototype._ff_c = "MenuEngineApiModule";

oFF.MenuEngineApiModule.s_module = null;
oFF.MenuEngineApiModule.getInstance = function()
{
	if (oFF.isNull(oFF.MenuEngineApiModule.s_module))
	{
		oFF.DfModule.checkInitialized(oFF.IoModule.getInstance());
		oFF.MenuEngineApiModule.s_module = oFF.DfModule.startExt(new oFF.MenuEngineApiModule());
		oFF.DfModule.stopExt(oFF.MenuEngineApiModule.s_module);
	}
	return oFF.MenuEngineApiModule.s_module;
};
oFF.MenuEngineApiModule.prototype.getName = function()
{
	return "ff1600.menuengine.api";
};

oFF.MenuEngineApiModule.getInstance();

return oFF;
} );