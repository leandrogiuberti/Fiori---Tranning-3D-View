/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["../../core/util","./Formatter"],function(e,r){"use strict";const t=r["Formatter"];class a extends t{initAsync(){return Promise.resolve()}format(r){return e.removePureAdvancedSearchFacets(r)}formatAsync(r){r=e.removePureAdvancedSearchFacets(r);return Promise.resolve(r)}}var s={__esModule:true};s.RemovePureAdvancedSearchFacetsFormatter=a;return s});
//# sourceMappingURL=RemovePureAdvancedSearchFacetsFormatter.js.map