/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/m/library","../converters/ManifestSettings"],function(r,e){"use strict";var i=e.ActionType;var t=r.OverflowToolbarPriority;const n={ensurePrimaryActionNeverOverflows(r){return r.map(r=>!this.isPrimaryAction(r)?r:{...r,priority:t.NeverOverflow})},isPrimaryAction(r){return r.type===i.Primary}};return n},false);
//# sourceMappingURL=ActionUtilities.js.map