declare module "sap/esh/search/ui/sinaNexTS/sina/AttributeGroupMembership" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { SinaObject, SinaObjectProperties } from "sap/esh/search/ui/sinaNexTS/sina/SinaObject";
    import { AttributeGroupMetadata } from "sap/esh/search/ui/sinaNexTS/sina/AttributeGroupMetadata";
    import { AttributeMetadataBase } from "sap/esh/search/ui/sinaNexTS/sina/AttributeMetadataBase";
    interface AttributeGroupMembershipOptions extends SinaObjectProperties {
        group: AttributeGroupMetadata;
        attribute: AttributeMetadataBase;
        nameInGroup: string;
    }
    class AttributeGroupMembership extends SinaObject {
        group: AttributeGroupMetadata;
        attribute: AttributeMetadataBase;
        nameInGroup: string;
        constructor(properties: AttributeGroupMembershipOptions);
    }
}
//# sourceMappingURL=AttributeGroupMembership.d.ts.map