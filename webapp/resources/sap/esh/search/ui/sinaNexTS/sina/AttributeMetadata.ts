/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { AttributeFormatType } from "./AttributeFormatType";
import {
    AttributeMetadataBase,
    AttributeMetadataBaseJSON,
    AttributeMetadataBaseOptions,
} from "./AttributeMetadataBase";
import { AttributeSemanticsType } from "./AttributeSemanticsType";
import { HierarchyDisplayType } from "./HierarchyDisplayType";
import { MatchingStrategy } from "./MatchingStrategy";
import { AttributeUsageType } from "./AttributeUsageType";
import { Sina } from "./Sina";

export interface AttributeMetadataOptions extends AttributeMetadataBaseOptions {
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
export interface AttributeMetadataJSON extends AttributeMetadataBaseJSON {
    isKey: boolean;
    matchingStrategy: MatchingStrategy;
}

export class AttributeMetadata extends AttributeMetadataBase {
    // _meta: {
    //     properties: {
    //         type: {
    //             required: true
    //         },
    //         label: {
    //             required: true
    //         },
    //         isSortable: {
    //             required: true
    //         },
    //         format: {
    //             required: false
    //             // TODO: multiple: true?
    //         },
    //         isKey: { // TODO: replace/amend with keyAttribute in SearchResultSetItem
    //             required: true
    //         },
    //         semantics: {
    //             required: false
    //         },
    //         matchingStrategy: {
    //             required: true
    //         }
    //     }
    // }

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
    } = {
        semanticObjectType: "",
        temporaryUsage: {},
    };

    constructor(properties: AttributeMetadataOptions) {
        super(properties);
        this.label = properties.label ?? this.label;
        this.isSortable = properties.isSortable ?? this.isSortable;
        this.format = properties.format ?? this.format;
        this.isKey = properties.isKey ?? this.isKey;
        this.semantics = properties.semantics ?? this.semantics;
        this.matchingStrategy = properties.matchingStrategy ?? this.matchingStrategy;
        this.isHierarchy = properties.isHierarchy ?? false;
        this.hierarchyName = properties.hierarchyName;
        this.hierarchyDisplayType = properties.hierarchyDisplayType;
        this.iconUrlAttributeName = properties.iconUrlAttributeName;
    }

    toJson(): AttributeMetadataJSON {
        return {
            id: this.id,
            label: this.label,
            type: this.type,
            displayOrder: this?.displayOrder,
            isSortable: this?.isSortable,
            usage: this?.usage,
            isKey: this?.isKey,
            matchingStrategy: this?.matchingStrategy,
            format: this?.format,
        };
    }

    static fromJson(attributeJson: AttributeMetadataJSON, sina: Sina): AttributeMetadata {
        return sina._createAttributeMetadata({
            id: attributeJson.id,
            type: attributeJson.type,
            label: attributeJson.label,
            isSortable: attributeJson.isSortable,
            matchingStrategy: attributeJson.matchingStrategy,
            isKey: attributeJson.isKey,
            usage: attributeJson.usage,
            format: attributeJson.format,
        });
    }
}
