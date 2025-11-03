declare module "sap/esh/search/ui/controls/webcompsearchfieldgroup/UShellWebCompLoader" {
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
    interface SearchWebComps {
        SearchScope: SearchScope;
        SearchItem: SearchItem;
        SearchItemGroup: SearchItemGroup;
        SearchItemShowMore: SearchItemShowMore;
    }
    function loadUShellWebComps(): Promise<SearchWebComps>;
}
//# sourceMappingURL=UShellWebCompLoader.d.ts.map