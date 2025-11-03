/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { SinaObject, SinaObjectProperties } from "./SinaObject";
import { AttributeMetadataBase } from "./AttributeMetadataBase";
import { Sina } from "./Sina";
import { SearchResultSetItemAttribute } from "./SearchResultSetItemAttribute";
import { SearchResultSetItemAttributeGroupMembership } from "./SearchResultSetItemAttributeGroupMembership";
import { SearchResultSetItem } from "./SearchResultSetItem";

export interface SearchResultSetItemAttributeBaseOptions extends SinaObjectProperties {
    id: string;
    label?: string;
    metadata: AttributeMetadataBase;
    groups?: Array<SearchResultSetItemAttributeGroupMembership>;
    sina?: Sina;
    parent?: SearchResultSetItem;
}
export abstract class SearchResultSetItemAttributeBase extends SinaObject {
    // _meta: {
    //     properties: {
    //         id: {
    //             required: true
    //         },
    //         metadata: {
    //             required: true
    //         },
    //         groups: {
    //             required: false,
    //             defaul: function () {
    //                 return [];
    //             }
    //         }
    //     }
    // },

    id: string;
    label?: string;
    metadata: AttributeMetadataBase;
    groups: Array<SearchResultSetItemAttributeGroupMembership> = [];
    parent?: SearchResultSetItem;

    constructor(properties: SearchResultSetItemAttributeBaseOptions) {
        super(properties);
        this.id = properties.id;
        this.label = properties.label;
        this.metadata = properties.metadata;
        this.groups = properties.groups;
        this.parent = properties.parent;
    }

    toString(): string {
        return this.id;
    }

    abstract getSubAttributes(): Array<SearchResultSetItemAttribute>;
}
