/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["./requestNodePlain","./requestBrowser","./core","./Log"],function(a,e,t,s){"use strict";const r=a["requestNodePlain"];const n=e["requestBrowser"];const o=t["isBrowserEnv"];const d=s["Log"];async function c(a){let e;if(o()){e=await n(a)}else{e=await r(a)}try{delete e.dataJSON;e.dataJSON=JSON.parse(e.data)}catch(a){const t=new d("ajax");t.warn("Could not parse response data as JSON: "+e?.data+" ("+a+")")}return e}function u(a,e,t){const s=e.data;for(const s of t){e=s(a,e)}if(e.data!==s){try{delete e.dataJSON;e.dataJSON=JSON.parse(e.data)}catch(a){const t=new d("ajax");t.warn("Could not parse response data as JSON: "+e?.data+" ("+a+")")}}return e}var i={__esModule:true};i.request=c;i.applyResponseFormattersAndUpdateJSON=u;return i});
//# sourceMappingURL=ajax.js.map