declare module "sap/esh/search/ui/sinaNexTS/sina/SearchResultSetItemAttributeBase" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { SinaObject, SinaObjectProperties } from "sap/esh/search/ui/sinaNexTS/sina/SinaObject";
    import { AttributeMetadataBase } from "sap/esh/search/ui/sinaNexTS/sina/AttributeMetadataBase";
    import { Sina } from "sap/esh/search/ui/sinaNexTS/sina/Sina";
    import { SearchResultSetItemAttribute } from "sap/esh/search/ui/sinaNexTS/sina/SearchResultSetItemAttribute";
    import { SearchResultSetItemAttributeGroupMembership } from "sap/esh/search/ui/sinaNexTS/sina/SearchResultSetItemAttributeGroupMembership";
    import { SearchResultSetItem } from "sap/esh/search/ui/sinaNexTS/sina/SearchResultSetItem";
    interface SearchResultSetItemAttributeBaseOptions extends SinaObjectProperties {
        id: string;
        label?: string;
        metadata: AttributeMetadataBase;
        groups?: Array<SearchResultSetItemAttributeGroupMembership>;
        sina?: Sina;
        parent?: SearchResultSetItem;
    }
    abstract class SearchResultSetItemAttributeBase extends SinaObject {
        id: string;
        label?: string;
        metadata: AttributeMetadataBase;
        groups: Array<SearchResultSetItemAttributeGroupMembership>;
        parent?: SearchResultSetItem;
        constructor(properties: SearchResultSetItemAttributeBaseOptions);
        toString(): string;
        abstract getSubAttributes(): Array<SearchResultSetItemAttribute>;
    }
}
//# sourceMappingURL=SearchResultSetItemAttributeBase.d.ts.map