/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import type SearchScope from "@ui5/webcomponents-fiori/dist/SearchScope";
import type SearchItem from "@ui5/webcomponents-fiori/dist/SearchItem";
import type SearchItemGroup from "@ui5/webcomponents-fiori/dist/SearchItemGroup";
import type SearchItemShowMore from "@ui5/webcomponents-fiori/dist/SearchItemShowMore";

const searchScopePath = "sap/ushell/gen/ui5/webcomponents-fiori/dist/SearchScope";
const searchItemPath = "sap/ushell/gen/ui5/webcomponents-fiori/dist/SearchItem";
const searchItemGroupPath = "sap/ushell/gen/ui5/webcomponents-fiori/dist/SearchItemGroup";
const searchItemShowMorePath = "sap/ushell/gen/ui5/webcomponents-fiori/dist/SearchItemShowMore";

export interface SearchWebComps {
    SearchScope: SearchScope;
    SearchItem: SearchItem;
    SearchItemGroup: SearchItemGroup;
    SearchItemShowMore: SearchItemShowMore;
}

export async function loadUShellWebComps(): Promise<SearchWebComps> {
    const UShellSearchScopeModule = await import(searchScopePath);
    const UShellSearchItemModule = await import(searchItemPath);
    const UShellSearchItemGroupModule = await import(searchItemGroupPath);
    const UShellSearchItemShowMoreModule = await import(searchItemShowMorePath);
    return {
        SearchScope: UShellSearchScopeModule.default,
        SearchItem: UShellSearchItemModule.default,
        SearchItemGroup: UShellSearchItemGroupModule.default,
        SearchItemShowMore: UShellSearchItemShowMoreModule.default,
    };
}
