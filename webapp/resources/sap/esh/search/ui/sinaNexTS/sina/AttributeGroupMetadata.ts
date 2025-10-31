/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { AttributeType } from "./AttributeType";
import {
    AttributeMetadataBase,
    AttributeMetadataBaseJSON,
    AttributeMetadataBaseOptions,
} from "./AttributeMetadataBase";
import { AttributeGroupMembership } from "./AttributeGroupMembership";
import { Sina } from "./Sina";
import { AttributeMetadata } from "./AttributeMetadata";
import type { AttributeMetadataJSON } from "./AttributeMetadata";

export interface GroupAttributeMetadataJSON extends AttributeMetadataBaseJSON {
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
export interface AttributeGroupMetadataOptions extends AttributeMetadataBaseOptions {
    label?: string;
    isSortable?: boolean;
    template?: string;
    attributes: Array<AttributeGroupMembership>;
    type: AttributeType.Group;
    displayAttributes?: Array<string>;
}
export class AttributeGroupMetadata extends AttributeMetadataBase {
    // _meta: {
    //     properties: {
    //         type: { // overwrite
    //             required: false,
    //             default: AttributeType.Group
    //         },
    //         label: { // overwrite
    //             required: false
    //         },
    //         isSortable: { // overwrite
    //             required: false,
    //             default: false
    //         },
    //         template: {
    //             required: false
    //         },
    //         attributes: { // array of AttributeGroupMembership instances
    //             required: true,
    //             default: function () {
    //                 return [];
    //             }
    //         }
    //         displayAttributes{ // array of attibutes to be displayed
    //             required: false,
    //             default: function () {
    //                 return [];
    //             }
    //         }
    //     }
    // }

    type: AttributeType = AttributeType.Group;
    label: string;
    isSortable = false;
    template: string;
    attributes: Array<AttributeGroupMembership> = [];
    displayAttributes: Array<string> = [];

    constructor(properties: AttributeGroupMetadataOptions) {
        super(properties);
        this.id = properties.id ?? this.id;
        this.usage = properties.usage ?? this.usage;
        this.label = properties.label ?? this.label;
        this.isSortable = properties.isSortable ?? this.isSortable;
        this.template = properties.template ?? this.template;
        this.attributes = properties.attributes ?? this.attributes;
        this.displayAttributes = properties.displayAttributes ?? this.displayAttributes;
    }

    toJson(): GroupAttributeMetadataJSON {
        const json = {
            id: this.id,
            label: this.label,
            type: this.type,
            displayOrder: this?.displayOrder,
            isSortable: this?.isSortable,
            usage: this?.usage,
            groups: [],
            template: this?.template || "",
            attributes: [],
            displayAttributes: this?.displayAttributes || [],
        };

        // push attributes
        const attributeMembers = this.attributes || [];

        if (attributeMembers.length === 0) {
            return json;
        }

        for (const member of attributeMembers) {
            json.attributes.push({
                attribute: {
                    id: member.attribute.id,
                },
                group: {
                    id: member.group.id,
                },
                nameInGroup: member.nameInGroup,
            });
        }

        // push groups
        const groupMembers = this.groups || [];

        if (groupMembers.length === 0) {
            return json;
        }

        for (const member of groupMembers) {
            json.groups.push({
                attribute: {
                    id: member.attribute.id,
                },
                group: {
                    id: member.group.id,
                },
                nameInGroup: member.nameInGroup,
            });
        }

        return json;
    }

    static fromJson(
        groupAttributeJson: GroupAttributeMetadataJSON,
        attributeJsonArray: Array<AttributeMetadataBaseJSON>,
        attributeMetadataMap: Record<string, AttributeMetadataBase>, // attribute metadata map buffer, may not be compete
        sina: Sina
    ): AttributeGroupMetadata {
        // group attribute metadata
        const groupAttributeMetadata = sina._createAttributeGroupMetadata({
            id: groupAttributeJson.id,
            label: groupAttributeJson.label,
            type: AttributeType.Group,
            template: groupAttributeJson.template,
            attributes: [],
            displayAttributes: groupAttributeJson.displayAttributes || [],
            usage: groupAttributeJson.usage,
        });

        // child attribute loop
        for (const childAttribute of groupAttributeJson.attributes) {
            let childAttributeMetadata = attributeMetadataMap[childAttribute.attribute.id];

            if (childAttributeMetadata) {
                // 1. child attribute is dejsonified
                // do nothing
            } else {
                // 2. child attribute is NOT dejsonified
                // get full json data by child attribute
                const childAttributeJson = groupAttributeMetadata.getAttributeJsonById(
                    attributeJsonArray,
                    childAttribute.attribute.id
                );

                if (childAttributeJson.type !== AttributeType.Group) {
                    // 2.1 child attribute is single attribute
                    // create single attribute metadata
                    childAttributeMetadata = AttributeMetadata.fromJson(
                        childAttributeJson as AttributeMetadataJSON,
                        sina
                    );
                } else {
                    // 2.2 child attribute is group attribute
                    // create group attribute metadata
                    childAttributeMetadata = AttributeGroupMetadata.fromJson(
                        childAttributeJson as AttributeGroupMetadata,
                        attributeJsonArray,
                        attributeMetadataMap,
                        sina
                    );
                }
                // set attribute metadata map buffer
                attributeMetadataMap[childAttributeMetadata.id] = childAttributeMetadata;
            }

            // push membership
            groupAttributeMetadata.pushMembership(
                groupAttributeMetadata,
                childAttributeMetadata,
                childAttribute.nameInGroup
            );
        }

        return groupAttributeMetadata;
    }

    private getAttributeJsonById(
        attributeJsonArray: Array<AttributeMetadataBaseJSON>,
        id: string
    ): AttributeMetadataBaseJSON {
        const attributeJson = attributeJsonArray.find((attribute) => attribute.id === id);
        return attributeJson || undefined;
    }

    private pushMembership(
        groupAttributeMetadata: AttributeGroupMetadata,
        childAttributeMetadata: AttributeMetadataBase,
        nameInGroup: string
    ): void {
        // create membership
        const childAttributeGroupMembership = this.sina._createAttributeGroupMembership({
            group: groupAttributeMetadata,
            attribute: childAttributeMetadata,
            nameInGroup: nameInGroup,
        });
        // push membership to group attribute metadata
        groupAttributeMetadata.attributes.push(childAttributeGroupMembership);

        // push membership to child attribute metadata
        if (childAttributeMetadata.type === AttributeType.Group) {
            childAttributeMetadata.groups.push(childAttributeGroupMembership);
        }
    }
}
