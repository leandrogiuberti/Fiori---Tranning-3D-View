//@ui5-bundle sap/ui/documentation/designtime/library-preload.designtime.js
/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.predefine("sap/ui/documentation/sdk/samples/Page.designtime", ["sap/m/designtime/Page.designtime"],function(t){"use strict";const n=function(t){return new window.URLSearchParams(window.location.search).get(t)},e=function(t){window.parent.postMessage(t,n("sap-ui-xx-dk-origin"))};return Object.assign({},t,{tool:{start:function(){e({type:"RTA_START",data:{msg:"RTA started"}})},stop:function(){e({type:"RTA_STOP",data:{msg:"RTA stopped"}})}}})});
//# sourceMappingURL=library-preload.designtime.js.map
