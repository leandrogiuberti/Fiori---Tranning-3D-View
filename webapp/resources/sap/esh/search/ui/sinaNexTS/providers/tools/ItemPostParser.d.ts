declare module "sap/esh/search/ui/sinaNexTS/providers/tools/ItemPostParser" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { SinaObject, SinaObjectProperties } from "sap/esh/search/ui/sinaNexTS/sina/SinaObject";
    import { SearchResultSetItem } from "sap/esh/search/ui/sinaNexTS/sina/SearchResultSetItem";
    import { SearchResultSetItemAttributeGroup } from "sap/esh/search/ui/sinaNexTS/sina/SearchResultSetItemAttributeGroup";
    import { DataSource } from "sap/esh/search/ui/sinaNexTS/sina/DataSource";
    interface ItemPostParserOptions extends SinaObjectProperties {
        searchResultSetItem: SearchResultSetItem;
    }
    class ItemPostParser extends SinaObject {
        _searchResultSetItem: SearchResultSetItem;
        _dataSource: DataSource;
        _allAttributesMap: any;
        _intentsResolver: any;
        constructor(properties: ItemPostParserOptions);
        postParseResultSetItem(): Promise<SearchResultSetItem>;
        enhanceResultSetItemWithNavigationTargets(): Promise<SearchResultSetItem>;
        private enhanceNavigationTargetsWithContentProviderId;
        enhanceResultSetItemWithGroups(): void;
        sortAttributes(): void;
        _addAttributeGroup(attributeGroupMetadata: any): SearchResultSetItemAttributeGroup;
    }
}
//# sourceMappingURL=ItemPostParser.d.ts.map