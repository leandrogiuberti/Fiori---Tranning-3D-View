/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define([],function(){"use strict";class t{data;active;constructor(){this.data={};this.active=false}activate(){this.active=true}deActivate(){this.clear();this.active=false}set(t,e){if(!this.active){return}this.data[t]=e}get(t){if(!this.active){return undefined}return this.data[t]}clear(){this.data={}}}var e={__esModule:true};e.TreeCache=t;return e});
//# sourceMappingURL=TreeCache.js.map