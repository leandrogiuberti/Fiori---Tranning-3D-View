/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { SinaObject, SinaObjectProperties } from "./SinaObject";
import { AttributeGroupMetadata } from "./AttributeGroupMetadata";
import { AttributeMetadataBase } from "./AttributeMetadataBase";

export interface AttributeGroupMembershipOptions extends SinaObjectProperties {
    group: AttributeGroupMetadata;
    attribute: AttributeMetadataBase;
    nameInGroup: string;
}
export class AttributeGroupMembership extends SinaObject {
    // _meta: {
    //     properties: {
    //         group: {
    //             required: true
    //         },
    //         attribute: {
    //             required: true
    //         },
    //         nameInGroup: {
    //             required: true
    //         }
    //     }
    // }

    group: AttributeGroupMetadata;
    attribute: AttributeMetadataBase;
    nameInGroup: string;

    constructor(properties: AttributeGroupMembershipOptions) {
        super(properties);
        this.group = properties.group ?? this.group;
        this.attribute = properties.attribute ?? this.attribute;
        this.nameInGroup = properties.nameInGroup ?? this.nameInGroup;
    }
}
