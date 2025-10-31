declare module "sap/esh/search/ui/sinaNexTS/sina/AttributeMetadata" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { AttributeFormatType } from "sap/esh/search/ui/sinaNexTS/sina/AttributeFormatType";
    import { AttributeMetadataBase, AttributeMetadataBaseJSON, AttributeMetadataBaseOptions } from "./AttributeMetadataBase";
    import { AttributeSemanticsType } from "sap/esh/search/ui/sinaNexTS/sina/AttributeSemanticsType";
    import { HierarchyDisplayType } from "sap/esh/search/ui/sinaNexTS/sina/HierarchyDisplayType";
    import { MatchingStrategy } from "sap/esh/search/ui/sinaNexTS/sina/MatchingStrategy";
    import { AttributeUsageType } from "sap/esh/search/ui/sinaNexTS/sina/AttributeUsageType";
    import { Sina } from "sap/esh/search/ui/sinaNexTS/sina/Sina";
    interface AttributeMetadataOptions extends AttributeMetadataBaseOptions {
        label: string;
        isSortable: boolean;
        format?: AttributeFormatType;
        isKey: boolean;
        semantics?: AttributeSemanticsType;
        matchingStrategy: MatchingStrategy;
        isHierarchy?: boolean;
        hierarchyName?: string;
        hierarchyDisplayType?: HierarchyDisplayType;
        iconUrlAttributeName?: string;
    }
    interface AttributeMetadataJSON extends AttributeMetadataBaseJSON {
        isKey: boolean;
        matchingStrategy: MatchingStrategy;
    }
    class AttributeMetadata extends AttributeMetadataBase {
        label: string;
        isSortable: boolean;
        isKey: boolean;
        matchingStrategy: MatchingStrategy;
        isHierarchy: boolean;
        hierarchyName: string;
        hierarchyDisplayType?: HierarchyDisplayType;
        iconUrlAttributeName?: string;
        _private: {
            semanticObjectType: string;
            temporaryUsage: AttributeUsageType;
            dynamic?: unknown;
        };
        constructor(properties: AttributeMetadataOptions);
        toJson(): AttributeMetadataJSON;
        static fromJson(attributeJson: AttributeMetadataJSON, sina: Sina): AttributeMetadata;
    }
}
//# sourceMappingURL=AttributeMetadata.d.ts.map