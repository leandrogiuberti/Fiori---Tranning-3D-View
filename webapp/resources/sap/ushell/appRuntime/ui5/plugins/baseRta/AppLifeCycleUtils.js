/* !
 * Copyright (c) 2009-2025 SAP SE, All Rights Reserved
 */
sap.ui.define([],()=>{"use strict";const e={getAppLifeCycleService:function(){const t=e.getContainer();return t.getServiceAsync("AppLifeCycle").catch(e=>{const t=`Error getting AppLifeCycle service from ushell container: ${e}`;throw new Error(t)})},getContainer:function(){const e=sap.ui.require("sap/ushell/Container");if(!e){throw new Error("Illegal state: shell container not available; this component must be executed in a unified shell runtime context.")}return e},getCurrentRunningApplication:function(){return e.getAppLifeCycleService().then(e=>e.getCurrentApplication())}};return e});
//# sourceMappingURL=AppLifeCycleUtils.js.map