/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["sap/ui/base/ManagedObject","sap/ui/core/Control"],function(e,n){"use strict";function r(n){return n instanceof e}function t(e){return e instanceof n}function o(e,n){if(e){if(r(e)){if(t(e)){n.renderControl(e)}}else{for(const r of e){if(t(r)){n.renderControl(r)}}}}}var i={__esModule:true};i.isManagedObject=r;i.isControl=t;i.typesafeRender=o;return i});
//# sourceMappingURL=TypeGuardForControls.js.map