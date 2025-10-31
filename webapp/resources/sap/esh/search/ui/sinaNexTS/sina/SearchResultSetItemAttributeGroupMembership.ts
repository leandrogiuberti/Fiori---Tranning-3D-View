/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { SinaObject } from "./SinaObject";
import { Sina } from "./Sina";
import { SearchResultSetItemAttributeGroup } from "./SearchResultSetItemAttributeGroup";
import { SearchResultSetItemAttribute } from "./SearchResultSetItemAttribute";
import { AttributeGroupMembership } from "./AttributeGroupMembership";
import { SearchResultSetItemAttributeBase } from "./SearchResultSetItemAttributeBase";

export interface SearchResultSetItemAttributeGroupMembershipOptions {
    group: SearchResultSetItemAttributeGroup;
    attribute: SearchResultSetItemAttribute;
    metadata: AttributeGroupMembership;
    sina?: Sina;
}

export class SearchResultSetItemAttributeGroupMembership extends SinaObject {
    // _meta: {
    //     properties: {
    //         group: {
    //             required: true
    //         },
    //         attribute: {
    //             required: true
    //         },
    //         metadata: {
    //             required: true
    //         }
    //     }
    // }

    group: SearchResultSetItemAttributeGroup;
    attribute: SearchResultSetItemAttributeBase;
    metadata: AttributeGroupMembership;
    valueFormatted = ""; // TODO: superfluous?

    constructor(properties: SearchResultSetItemAttributeGroupMembershipOptions) {
        super(properties);
        this.group = properties.group ?? this.group;
        this.attribute = properties.attribute ?? this.attribute;
        this.metadata = properties.metadata ?? this.metadata;
    }
}
