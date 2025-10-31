/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import {
    SearchResultSetItemAttributeBase,
    SearchResultSetItemAttributeBaseOptions,
} from "./SearchResultSetItemAttributeBase";
import { SearchResultSetItemAttributeGroupMembership } from "./SearchResultSetItemAttributeGroupMembership";
import { AttributeGroupMetadata } from "./AttributeGroupMetadata";
import { SearchResultSetItemAttribute } from "./SearchResultSetItemAttribute";

export interface SearchResultSetItemAttributeGroupOptions extends SearchResultSetItemAttributeBaseOptions {
    id: string;
    metadata: AttributeGroupMetadata;
    template?: string;
    attributes: Array<SearchResultSetItemAttributeGroupMembership>;
    displayAttributes?: Array<string>;
}
export class SearchResultSetItemAttributeGroup extends SearchResultSetItemAttributeBase {
    // _meta: {
    //     properties: {
    //         template: {
    //             required: false
    //         },
    //         attributes: {
    //             required: true,
    //             default: function () {
    //                 return [];
    //             }
    //         }
    //         displayAttributes: {
    //             required: false,
    //             default: function () {
    //                 return [];
    //             }
    //         }
    //     }
    // }

    template: string;
    attributes: Array<SearchResultSetItemAttributeGroupMembership> = [];
    displayAttributes: Array<string> = [];

    constructor(properties: SearchResultSetItemAttributeGroupOptions) {
        super(properties);
        this.template = properties.template ?? this.template;
        this.attributes = properties.attributes ?? this.attributes;
        this.displayAttributes = properties.displayAttributes ?? this.displayAttributes;
    }

    toString(): string {
        let valueFormatted = "",
            pos = 0;
        let match;
        const regex = RegExp("{[a-z]+}", "gi");
        while ((match = regex.exec(this.template)) !== null) {
            valueFormatted += this.template.substring(pos, match.index);
            const attributeName = match[0].slice(1, -1);
            valueFormatted +=
                (this.attributes[attributeName] && this.attributes[attributeName].valueFormatted) || ""; // TODO: What if this.attributes[attributeName] is a group?
            pos = regex.lastIndex;
        }
        valueFormatted += this.template.substring(pos);
        return this.label + ": " + valueFormatted;
    }

    isAttributeDisplayed(attributeId: string): boolean {
        if (Array.isArray(this.displayAttributes)) {
            return this.displayAttributes.includes(attributeId);
        }
        return false;
    }

    getSubAttributes(): Array<SearchResultSetItemAttribute> {
        const attributes: Array<SearchResultSetItemAttribute> = [];
        for (const attributeMemberShip of this.attributes) {
            attributes.push(...attributeMemberShip.attribute.getSubAttributes());
        }
        return attributes;
    }
}
