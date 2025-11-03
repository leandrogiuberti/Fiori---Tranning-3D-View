/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["./ResultSetItem"],function(e){"use strict";const t=e["ResultSetItem"];class a extends t{dimensionValueFormatted;measureValue;measureValueFormatted;constructor(e){super(e);this.dimensionValueFormatted=e.dimensionValueFormatted??this.dimensionValueFormatted;this.measureValue=e.measureValue??this.measureValue;this.measureValueFormatted=e.measureValueFormatted??this.measureValueFormatted}toString(){return this.dimensionValueFormatted+": "+this.measureValueFormatted}}var s={__esModule:true};s.FacetResultSetItem=a;return s});
//# sourceMappingURL=FacetResultSetItem.js.map