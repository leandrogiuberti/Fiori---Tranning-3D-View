/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define([], function () {
  "use strict";

  var FacetTypeUI = /*#__PURE__*/function (FacetTypeUI) {
    // 'extends' sina FacetType
    // - for rendering of types 'data source' and 'attributes', see `SearchFacetGeneric`    Chart = "Chart",
    FacetTypeUI["DataSource"] = "DataSource";
    FacetTypeUI["Hierarchy"] = "Hierarchy";
    // ===================================================
    FacetTypeUI["Attribute"] = "Attribute";
    FacetTypeUI["QuickSelectDataSource"] = "QuickSelectDataSource";
    FacetTypeUI["HierarchyStatic"] = "HierarchyStatic";
    return FacetTypeUI;
  }(FacetTypeUI || {});
  /* spread operator not yet supported by Typescript (eslint error)
    import { FacetType } from "../../../sinaNexTS/sina/FacetType";
    export enum FacetTypeUI = {
      ...FacetType,
      Attribute = "Attribute",
      QuickSelectDataSource = "QuickSelectDataSource",
      HierarchyStatic = "HierarchyStatic",
  } */
  var __exports = {
    __esModule: true
  };
  __exports.FacetTypeUI = FacetTypeUI;
  return __exports;
});
//# sourceMappingURL=FacetTypeUI-dbg.js.map
