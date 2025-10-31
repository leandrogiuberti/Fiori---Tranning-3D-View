declare module "sap/esh/search/ui/sinaNexTS/sina/AttributeMetadataBase" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { SinaObject, SinaObjectProperties } from "sap/esh/search/ui/sinaNexTS/sina/SinaObject";
    import { AttributeGroupMembership } from "sap/esh/search/ui/sinaNexTS/sina/AttributeGroupMembership";
    import { AttributeUsageType } from "sap/esh/search/ui/sinaNexTS/sina/AttributeUsageType";
    import { AttributeType } from "sap/esh/search/ui/sinaNexTS/sina/AttributeType";
    import { AttributeSemanticsType } from "sap/esh/search/ui/sinaNexTS/sina/AttributeSemanticsType";
    import { AttributeFormatType } from "sap/esh/search/ui/sinaNexTS/sina/AttributeFormatType";
    interface AttributeMetadataBaseJSON {
        id: string;
        label: string;
        type: AttributeType;
        displayOrder?: number;
        isSortable?: boolean;
        usage?: unknown;
        format?: AttributeFormatType;
    }
    interface AttributeMetadataBaseOptions extends SinaObjectProperties {
        id: string;
        usage: AttributeUsageType;
        displayOrder?: number;
        groups?: Array<AttributeGroupMembership>;
        type: AttributeType;
        format?: AttributeFormatType;
    }
    abstract class AttributeMetadataBase extends SinaObject {
        id: string;
        usage: AttributeUsageType;
        displayOrder: number;
        groups: Array<AttributeGroupMembership>;
        type: AttributeType;
        format: AttributeFormatType;
        semantics: AttributeSemanticsType;
        constructor(properties: AttributeMetadataBaseOptions);
        abstract toJson(): AttributeMetadataBaseJSON;
    }
}
//# sourceMappingURL=AttributeMetadataBase.d.ts.map