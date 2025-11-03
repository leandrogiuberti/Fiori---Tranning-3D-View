declare module "sap/esh/search/ui/sinaNexTS/sina/SearchResultSetItemAttributeGroupMembership" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { SinaObject } from "sap/esh/search/ui/sinaNexTS/sina/SinaObject";
    import { Sina } from "sap/esh/search/ui/sinaNexTS/sina/Sina";
    import { SearchResultSetItemAttributeGroup } from "sap/esh/search/ui/sinaNexTS/sina/SearchResultSetItemAttributeGroup";
    import { SearchResultSetItemAttribute } from "sap/esh/search/ui/sinaNexTS/sina/SearchResultSetItemAttribute";
    import { AttributeGroupMembership } from "sap/esh/search/ui/sinaNexTS/sina/AttributeGroupMembership";
    import { SearchResultSetItemAttributeBase } from "sap/esh/search/ui/sinaNexTS/sina/SearchResultSetItemAttributeBase";
    interface SearchResultSetItemAttributeGroupMembershipOptions {
        group: SearchResultSetItemAttributeGroup;
        attribute: SearchResultSetItemAttribute;
        metadata: AttributeGroupMembership;
        sina?: Sina;
    }
    class SearchResultSetItemAttributeGroupMembership extends SinaObject {
        group: SearchResultSetItemAttributeGroup;
        attribute: SearchResultSetItemAttributeBase;
        metadata: AttributeGroupMembership;
        valueFormatted: string;
        constructor(properties: SearchResultSetItemAttributeGroupMembershipOptions);
    }
}
//# sourceMappingURL=SearchResultSetItemAttributeGroupMembership.d.ts.map