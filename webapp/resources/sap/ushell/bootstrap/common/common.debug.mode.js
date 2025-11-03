// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
sap.ui.define(["./common.constants"],t=>{"use strict";let e;let u=/[?&]sap-ui-debug=(true|x|X)(&|$)/.test(window.location.search);if(!u){try{e=window.localStorage.getItem(t.uiDebugKey);u=!!e&&/^(true|x|X)$/.test(e)}catch{}}return{isDebug:function(){return u}}});
//# sourceMappingURL=common.debug.mode.js.map