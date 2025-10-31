// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
sap.ui.define(["sap/ushell/bootstrap/common/common.debug.mode"],e=>{"use strict";const s=new Promise(s=>{const t=`sap/ushell_abap/thirdparty/sap-xhrlib-esm${e.isDebug()?"-dbg":""}.js`;const r=sap.ui.require.toUrl(t);import(r).then(e=>{s(e.xhrlib)})});return{getLib:function(){return s}}});
//# sourceMappingURL=abap.xhrlogon.LibLoader.js.map