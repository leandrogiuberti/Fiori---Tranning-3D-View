/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { SinaObject, SinaObjectProperties } from "./SinaObject";
import { AttributeGroupMembership } from "./AttributeGroupMembership";
import { AttributeUsageType } from "./AttributeUsageType";
import { AttributeType } from "./AttributeType";
import { AttributeSemanticsType } from "./AttributeSemanticsType";
import { AttributeFormatType } from "./AttributeFormatType";

export interface AttributeMetadataBaseJSON {
    id: string;
    label: string;
    type: AttributeType;
    displayOrder?: number;
    isSortable?: boolean;
    usage?: unknown;
    format?: AttributeFormatType;
}
export interface AttributeMetadataBaseOptions extends SinaObjectProperties {
    id: string;
    usage: AttributeUsageType;
    displayOrder?: number;
    groups?: Array<AttributeGroupMembership>;
    type: AttributeType;
    format?: AttributeFormatType;
}
export abstract class AttributeMetadataBase extends SinaObject {
    // _meta: {
    //     properties: {
    //         id: {
    //             required: true
    //         },
    //         usage: {
    //             required: true
    //         },
    //         displayOrder: {
    //             required: false
    //         },
    //         groups: { // array of AttributeGroupMembership instances
    //             required: false,
    //             default: function () {
    //                 return [];
    //             }
    //         }
    //     }
    // }

    id: string;
    usage: AttributeUsageType;
    displayOrder: number;
    groups: Array<AttributeGroupMembership> = [];
    type: AttributeType;
    format: AttributeFormatType;
    semantics: AttributeSemanticsType;

    constructor(properties: AttributeMetadataBaseOptions) {
        super(properties);
        this.id = properties.id ?? this.id;
        this.usage = properties.usage ?? this.usage;
        this.displayOrder = properties.displayOrder ?? this.displayOrder;
        this.groups = properties.groups ?? this.groups;
        this.type = properties.type;
        this.format = properties.format ?? this.format;
    }

    abstract toJson(): AttributeMetadataBaseJSON;

    // static fromJson ist implemented in following files:
    // 1. DataSource.ts (dejsonifyAttribute)
    // 2. AttributeMetadata.ts
    // 3. AttributeGroupMetadata.ts,
    // implemented not in base class, because of circular import dependency
}
