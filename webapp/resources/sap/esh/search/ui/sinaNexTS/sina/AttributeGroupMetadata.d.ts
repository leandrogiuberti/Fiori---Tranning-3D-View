declare module "sap/esh/search/ui/sinaNexTS/sina/AttributeGroupMetadata" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { AttributeType } from "sap/esh/search/ui/sinaNexTS/sina/AttributeType";
    import { AttributeMetadataBase, AttributeMetadataBaseJSON, AttributeMetadataBaseOptions } from "./AttributeMetadataBase";
    import { AttributeGroupMembership } from "sap/esh/search/ui/sinaNexTS/sina/AttributeGroupMembership";
    import { Sina } from "sap/esh/search/ui/sinaNexTS/sina/Sina";
    interface GroupAttributeMetadataJSON extends AttributeMetadataBaseJSON {
        groups: unknown[];
        template: string;
        attributes: Array<{
            attribute: {
                id: string;
            };
            group: {
                id: string;
            };
            nameInGroup: string;
        }>;
        displayAttributes: string[];
    }
    interface AttributeGroupMetadataOptions extends AttributeMetadataBaseOptions {
        label?: string;
        isSortable?: boolean;
        template?: string;
        attributes: Array<AttributeGroupMembership>;
        type: AttributeType.Group;
        displayAttributes?: Array<string>;
    }
    class AttributeGroupMetadata extends AttributeMetadataBase {
        type: AttributeType;
        label: string;
        isSortable: boolean;
        template: string;
        attributes: Array<AttributeGroupMembership>;
        displayAttributes: Array<string>;
        constructor(properties: AttributeGroupMetadataOptions);
        toJson(): GroupAttributeMetadataJSON;
        static fromJson(groupAttributeJson: GroupAttributeMetadataJSON, attributeJsonArray: Array<AttributeMetadataBaseJSON>, attributeMetadataMap: Record<string, AttributeMetadataBase>, // attribute metadata map buffer, may not be compete
        sina: Sina): AttributeGroupMetadata;
        private getAttributeJsonById;
        private pushMembership;
    }
}
//# sourceMappingURL=AttributeGroupMetadata.d.ts.map