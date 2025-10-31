/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define(
[
"sap/sac/df/firefly/ff1000.kernel.api"
],
function(oFF)
{
"use strict";

oFF.XProgramModuleMapping = {

	s_mapping:null,
	getModuleNameForProgram:function(programName)
	{
			let moduleName = oFF.XProgramModuleMapping.s_mapping.getByKey(programName);
		return oFF.isNull(moduleName) ? null : moduleName.getString();
	},
	registerProgramsForModule:function(moduleName, programNames)
	{
			let programNamesIterator = programNames.getIterator();
		while (programNamesIterator.hasNext())
		{
			oFF.XProgramModuleMapping.s_mapping.put(programNamesIterator.next(), oFF.XStringValue.create(moduleName));
		}
	},
	staticSetup:function()
	{
			oFF.XProgramModuleMapping.s_mapping = oFF.XHashMapByString.create();
	}
};

oFF.BatchRequestManagerFactory = function() {};
oFF.BatchRequestManagerFactory.prototype = new oFF.XObject();
oFF.BatchRequestManagerFactory.prototype._ff_c = "BatchRequestManagerFactory";

oFF.BatchRequestManagerFactory.s_factory = null;
oFF.BatchRequestManagerFactory.createBatchRequestManager = function(session)
{
	let factory = oFF.BatchRequestManagerFactory.s_factory;
	let newObject = null;
	if (oFF.notNull(factory))
	{
		newObject = factory.newBatchRequestManager(session);
	}
	return newObject;
};
oFF.BatchRequestManagerFactory.registerFactory = function(factory)
{
	oFF.BatchRequestManagerFactory.s_factory = factory;
};

oFF.KernelApiBaseModule = function() {};
oFF.KernelApiBaseModule.prototype = new oFF.DfModule();
oFF.KernelApiBaseModule.prototype._ff_c = "KernelApiBaseModule";

oFF.KernelApiBaseModule.s_module = null;
oFF.KernelApiBaseModule.getInstance = function()
{
	if (oFF.isNull(oFF.KernelApiBaseModule.s_module))
	{
		oFF.DfModule.checkInitialized(oFF.KernelApiModule.getInstance());
		oFF.KernelApiBaseModule.s_module = oFF.DfModule.startExt(new oFF.KernelApiBaseModule());
		oFF.XProgramModuleMapping.staticSetup();
		oFF.DfModule.stopExt(oFF.KernelApiBaseModule.s_module);
	}
	return oFF.KernelApiBaseModule.s_module;
};
oFF.KernelApiBaseModule.prototype.getName = function()
{
	return "ff1010.kernel.api.base";
};

oFF.KernelApiBaseModule.getInstance();

return oFF;
} );