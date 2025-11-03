/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
sap.ui.define(["sap/sac/df/firefly/ff2165.space","sap/sac/df/firefly/ff5000.olap.dataprovider"],function(e){"use strict";e.OlapSpaceModule=function(){};e.OlapSpaceModule.prototype=new e.DfModule;e.OlapSpaceModule.prototype._ff_c="OlapSpaceModule";e.OlapSpaceModule.s_module=null;e.OlapSpaceModule.getInstance=function(){if(e.isNull(e.OlapSpaceModule.s_module)){e.DfModule.checkInitialized(e.SpaceModule.getInstance());e.DfModule.checkInitialized(e.OlapDataProviderModule.getInstance());e.OlapSpaceModule.s_module=e.DfModule.startExt(new e.OlapSpaceModule);e.DfModule.stopExt(e.OlapSpaceModule.s_module)}return e.OlapSpaceModule.s_module};e.OlapSpaceModule.prototype.getName=function(){return"ff5100.olap.space"};e.OlapSpaceModule.getInstance();return e});
//# sourceMappingURL=ff5100.olap.space.js.map