/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
export enum FacetTypeUI {
    // 'extends' sina FacetType
    // - for rendering of types 'data source' and 'attributes', see `SearchFacetGeneric`    Chart = "Chart",
    DataSource = "DataSource",
    Hierarchy = "Hierarchy",
    // ===================================================
    Attribute = "Attribute",
    QuickSelectDataSource = "QuickSelectDataSource",
    HierarchyStatic = "HierarchyStatic",
}

/* spread operator not yet supported by Typescript (eslint error)
  import { FacetType } from "../../../sinaNexTS/sina/FacetType";
  export enum FacetTypeUI = {
    ...FacetType,
    Attribute = "Attribute",
    QuickSelectDataSource = "QuickSelectDataSource",
    HierarchyStatic = "HierarchyStatic",
} */
