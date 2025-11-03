/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["../../core/errors","../AbstractProvider"],function(e,r){"use strict";const t=e["NotImplementedError"];const n=r["AbstractProvider"];class o extends n{executeSearchQuery(){throw new t}executeChartQuery(){throw new t}executeHierarchyQuery(e){throw new t}async executeSuggestionQuery(){throw new t}id="dummy";async initAsync(){return Promise.resolve()}}var s={__esModule:true};s.Provider=o;return s});
//# sourceMappingURL=Provider.js.map