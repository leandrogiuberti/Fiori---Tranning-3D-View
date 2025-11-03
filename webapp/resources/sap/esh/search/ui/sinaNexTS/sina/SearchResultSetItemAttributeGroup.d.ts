declare module "sap/esh/search/ui/sinaNexTS/sina/SearchResultSetItemAttributeGroup" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { SearchResultSetItemAttributeBase, SearchResultSetItemAttributeBaseOptions } from "./SearchResultSetItemAttributeBase";
    import { SearchResultSetItemAttributeGroupMembership } from "sap/esh/search/ui/sinaNexTS/sina/SearchResultSetItemAttributeGroupMembership";
    import { AttributeGroupMetadata } from "sap/esh/search/ui/sinaNexTS/sina/AttributeGroupMetadata";
    import { SearchResultSetItemAttribute } from "sap/esh/search/ui/sinaNexTS/sina/SearchResultSetItemAttribute";
    interface SearchResultSetItemAttributeGroupOptions extends SearchResultSetItemAttributeBaseOptions {
        id: string;
        metadata: AttributeGroupMetadata;
        template?: string;
        attributes: Array<SearchResultSetItemAttributeGroupMembership>;
        displayAttributes?: Array<string>;
    }
    class SearchResultSetItemAttributeGroup extends SearchResultSetItemAttributeBase {
        template: string;
        attributes: Array<SearchResultSetItemAttributeGroupMembership>;
        displayAttributes: Array<string>;
        constructor(properties: SearchResultSetItemAttributeGroupOptions);
        toString(): string;
        isAttributeDisplayed(attributeId: string): boolean;
        getSubAttributes(): Array<SearchResultSetItemAttribute>;
    }
}
//# sourceMappingURL=SearchResultSetItemAttributeGroup.d.ts.map