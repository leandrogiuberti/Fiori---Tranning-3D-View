/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define(
[
"sap/sac/df/firefly/ff2165.space","sap/sac/df/firefly/ff5000.olap.dataprovider"
],
function(oFF)
{
"use strict";

oFF.OlapSpaceModule = function() {};
oFF.OlapSpaceModule.prototype = new oFF.DfModule();
oFF.OlapSpaceModule.prototype._ff_c = "OlapSpaceModule";

oFF.OlapSpaceModule.s_module = null;
oFF.OlapSpaceModule.getInstance = function()
{
	if (oFF.isNull(oFF.OlapSpaceModule.s_module))
	{
		oFF.DfModule.checkInitialized(oFF.SpaceModule.getInstance());
		oFF.DfModule.checkInitialized(oFF.OlapDataProviderModule.getInstance());
		oFF.OlapSpaceModule.s_module = oFF.DfModule.startExt(new oFF.OlapSpaceModule());
		oFF.DfModule.stopExt(oFF.OlapSpaceModule.s_module);
	}
	return oFF.OlapSpaceModule.s_module;
};
oFF.OlapSpaceModule.prototype.getName = function()
{
	return "ff5100.olap.space";
};

oFF.OlapSpaceModule.getInstance();

return oFF;
} );