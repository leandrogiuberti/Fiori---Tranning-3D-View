/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define(
[
"sap/sac/df/firefly/ff1030.kernel.impl"
],
function(oFF)
{
"use strict";
/// <summary>Initializer for static constants.</summary>
oFF.KernelNativeModule = function()
{
       oFF.DfModule.call(this);
    this._ff_c = "KernelNativeModule";
};
oFF.KernelNativeModule.prototype = new oFF.DfModule();
oFF.KernelNativeModule.s_module = null;

oFF.KernelNativeModule.getInstance = function()
{
       var oNativeModule = oFF.KernelNativeModule;

    if (oNativeModule.s_module === null)
    {
        if ( oFF.KernelImplModule.getInstance() === null)
        {
            throw new Error("Initialization Exception");
        }

		oNativeModule.s_module = oFF.DfModule.startExt(new oFF.KernelNativeModule());

        if(oFF.isXs()){
            oFF.RpcFunctionInaServerFactory.staticSetup();
        }
        if(!oFF.isXs() && !oFF.isUi5()){
            oFF.NativeModuleLoader.staticSetup();
		}

        oFF.publicApi = {};
        oFF.publicApi.xversion = oFF.XVersion.V186_DISP_HIERARCHY_FIX_IN_FILTER;
        oFF.publicApi.syncType = oFF.SyncType.NON_BLOCKING;
        oFF.publicApi.hasPersistentState = false;
        oFF.publicApi.setup = oFF.KernelNativeModule.setupPublicApi;

        oFF.DfModule.stopExt(oNativeModule.s_module);
    }

    return oNativeModule.s_module;
};

oFF.KernelNativeModule.prototype.getName = function()
{
	return "ff1040.kernel.native";
};

oFF.KernelNativeModule.setupPublicApi = function () {
   
    const kernel = oFF.Kernel.getInstance();
    if (kernel == null) {
        var kernelBoot = oFF.KernelBoot.createByName("PublicApi");
        kernelBoot.setXVersion(oFF.publicApi.xversion);
        kernelBoot.setDefaultSyncType(oFF.publicApi.syncType);
        kernelBoot.setHasPersistentState(oFF.publicApi.hasPersistentState);

        kernelBoot.runFull().onThen(prgs => {
            console.log("Public API loaded");
        });
    } else {
        var runner = oFF.ProgramRunner.createRunner(kernel.getProcess(), "PublicApi");
        runner.runProgram().onThen(prg => {
            console.log("Public API loaded");
        });
    }

};

oFF.KernelNativeModule.getInstance();


return oFF;
} );