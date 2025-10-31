/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define([],function(){"use strict";class e{items={};reset(){this.items={}}getItem(e){let t=this.items[e];if(!t){t={};this.items[e]=t}return t}setExpanded(e,t){const s=this.getItem(e);s.expanded=t}getExpanded(e){return this.getItem(e).expanded}}return e});
//# sourceMappingURL=SearchResultItemMemory.js.map