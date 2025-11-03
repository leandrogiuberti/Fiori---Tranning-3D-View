/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["sap/ushell/Container","../sinaNexTS/sina/System"],function(e,t){"use strict";const n=t["System"];class o{static fioriFrontendSystemInfo;static getSystem(){if(typeof o.fioriFrontendSystemInfo==="undefined"){o.fioriFrontendSystemInfo=new n({id:e.getLogonSystem().getName()+"."+e.getLogonSystem().getClient(),label:e.getLogonSystem().getName()+" "+e.getLogonSystem().getClient()})}return o.fioriFrontendSystemInfo}}return o});
//# sourceMappingURL=FrontendSystem.js.map