/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["../SuggestionType","./Formatter","./ResultValueFormatter"],function(t,e,r){"use strict";const o=t["SuggestionType"];const s=e["Formatter"];const u=r["ResultValueFormatter"];class n extends s{sina;resultValueFormatter;initAsync(){throw new Error("Method not implemented.")}constructor(t){super();this.resultValueFormatter=new u(t)}format(t){for(const e of t.items){if(e.type=o.Object){this.resultValueFormatter._formatItemInUI5Form(e.object)}}return t}formatAsync(t){t=this.format(t);return Promise.resolve(t)}}var a={__esModule:true};a.SuggestionResultValueFormatter=n;return a});
//# sourceMappingURL=SuggestionResultValueFormatter.js.map