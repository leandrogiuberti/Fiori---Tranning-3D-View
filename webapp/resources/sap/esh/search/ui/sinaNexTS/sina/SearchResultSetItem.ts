/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { ResultSetItem } from "./ResultSetItem";
import { DataSource } from "./DataSource";
import { SearchResultSetItemAttribute } from "./SearchResultSetItemAttribute";
import { NavigationTarget } from "./NavigationTarget";
import { SinaObjectProperties } from "./SinaObject";
import { generateGuid } from "../core/core";
import { SearchResultSetItemAttributeBase } from "./SearchResultSetItemAttributeBase";
import { HierarchyNodePath } from "./HierarchyNodePath";
import { SearchResultSetItemAttributeGroup } from "./SearchResultSetItemAttributeGroup";
import { AttributeMetadata } from "./AttributeMetadata";

export interface SearchResultSetItemOptions extends SinaObjectProperties {
    dataSource: DataSource;
    attributes: Array<SearchResultSetItemAttribute>;
    titleAttributes: Array<SearchResultSetItemAttributeBase>;
    titleDescriptionAttributes?: Array<SearchResultSetItemAttribute>;
    detailAttributes: Array<SearchResultSetItemAttributeBase>;
    defaultNavigationTarget?: NavigationTarget;
    navigationTargets?: Array<NavigationTarget>;
    score?: number;
    hierarchyNodePaths?: Array<HierarchyNodePath>;
}
export class SearchResultSetItem extends ResultSetItem {
    // _meta: {
    //     properties: {
    //         dataSource: {
    //             required: true
    //         },
    //         titleAttributes: {
    //             required: true,
    //             aggregation: true
    //         },
    //         titleDescriptionAttributes: {
    //             required: false,
    //             aggregation: true
    //         },
    //         detailAttributes: {
    //             required: true,
    //             aggregation: true
    //         },
    //         defaultNavigationTarget: {
    //             required: false,
    //             aggregation: true
    //         },
    //         navigationTargets: {
    //             required: false,
    //             aggregation: true
    //         },
    //         score: {
    //             required: false,
    //             default: 0
    //         }
    //     }
    // },

    dataSource: DataSource;
    attributes: Array<SearchResultSetItemAttribute>;
    attributesMap: Record<string, SearchResultSetItemAttribute>;
    titleAttributes: Array<SearchResultSetItemAttributeBase>;
    titleDescriptionAttributes: Array<SearchResultSetItemAttribute | SearchResultSetItemAttributeGroup>;
    detailAttributes: Array<SearchResultSetItemAttributeBase>;
    defaultNavigationTarget: NavigationTarget;
    navigationTargets: Array<NavigationTarget>;
    score = 0;
    hierarchyNodePaths?: Array<HierarchyNodePath>;

    constructor(properties: SearchResultSetItemOptions) {
        super(properties);
        this.dataSource = properties.dataSource ?? this.dataSource;
        this.setAttributes(properties.attributes || []);
        this.setTitleAttributes(properties.titleAttributes);
        this.setTitleDescriptionAttributes(properties.titleDescriptionAttributes);
        this.setDetailAttributes(properties.detailAttributes);
        this.setDefaultNavigationTarget(properties.defaultNavigationTarget);
        this.setNavigationTargets(properties.navigationTargets || []);
        this.score = properties.score ?? this.score;
        this.hierarchyNodePaths = properties.hierarchyNodePaths ?? this.hierarchyNodePaths;
    }

    setDefaultNavigationTarget(navigationTarget: NavigationTarget) {
        if (!navigationTarget) {
            this.defaultNavigationTarget = undefined;
            return;
        }
        this.defaultNavigationTarget = navigationTarget;
        navigationTarget.parent = this;
    }

    setNavigationTargets(navigationTargets: Array<NavigationTarget>) {
        this.navigationTargets = [];
        if (!navigationTargets) {
            return;
        }
        for (const navigationTarget of navigationTargets) {
            this.addNavigationTarget(navigationTarget);
        }
    }

    addNavigationTarget(navigationTarget: NavigationTarget) {
        this.navigationTargets.push(navigationTarget);
        navigationTarget.parent = this;
    }

    setAttributes(attributes: Array<SearchResultSetItemAttribute>) {
        this.attributes = [];
        this.attributesMap = {};
        for (const attribute of attributes) {
            this.attributes.push(attribute);
            this.attributesMap[attribute.id] = attribute;
            attribute.parent = this;
        }
    }

    setTitleAttributes(titleAttributes: Array<SearchResultSetItemAttributeBase>): SearchResultSetItem {
        this.titleAttributes = [];
        if (!Array.isArray(titleAttributes) || titleAttributes.length < 1) {
            return this;
        }
        for (let i = 0; i < titleAttributes.length; i++) {
            const item = titleAttributes[i] as SearchResultSetItemAttributeBase;
            item.parent = this;
            this.titleAttributes.push(item);
        }
        return this;
    }

    setTitleDescriptionAttributes(
        titleDescriptionAttributes: Array<SearchResultSetItemAttribute>
    ): SearchResultSetItem {
        this.titleDescriptionAttributes = [];
        if (!Array.isArray(titleDescriptionAttributes) || titleDescriptionAttributes.length < 1) {
            return this;
        }
        for (let i = 0; i < titleDescriptionAttributes.length; i++) {
            const item = titleDescriptionAttributes[i] as SearchResultSetItemAttribute;
            item.parent = this;
            this.titleDescriptionAttributes.push(item);
        }
        return this;
    }

    setDetailAttributes(detailAttributes: Array<SearchResultSetItemAttributeBase>): SearchResultSetItem {
        this.detailAttributes = [];
        if (!Array.isArray(detailAttributes) || detailAttributes.length < 1) {
            return this;
        }
        for (let i = 0; i < detailAttributes.length; i++) {
            const item = detailAttributes[i] as SearchResultSetItemAttributeBase;
            item.parent = this;
            this.detailAttributes.push(item);
        }
        return this;
    }

    get key(): string {
        const parts = [];
        parts.push(this.dataSource.id);
        // Filter key single attributes and return their metadata.id
        const keyAttributeValues = this.attributes
            .filter(
                (attribute) =>
                    attribute.metadata instanceof AttributeMetadata && attribute.metadata.isKey === true
            )
            .map((attribute) => attribute.value);

        if (keyAttributeValues.length > 0 && keyAttributeValues.join("").length > 0) {
            parts.push(...keyAttributeValues);
        }

        // If no key attributes are defined, use the title attributes' values
        if (parts.length === 1) {
            const titleAttributeValues = [];
            for (const titleAttribute of this.titleAttributes) {
                const subTitleAttributes = titleAttribute.getSubAttributes();
                for (const subTitleAttribute of subTitleAttributes) {
                    titleAttributeValues.push(subTitleAttribute.value);
                }
            }
            if (titleAttributeValues.length > 0 && titleAttributeValues.join("").length > 0) {
                parts.push(...titleAttributeValues);
            }
        }

        // If no key, no title attributes are defined,
        // use the first 3 details attributes' values, if available
        if (parts.length === 1) {
            const detailAttributeValues = [];
            const maxDetailAttributes = Math.min(3, this.detailAttributes.length);
            for (let i = 0; i < maxDetailAttributes; i++) {
                const detailAttribute = this.detailAttributes[i];
                const subDetailAttributes = detailAttribute.getSubAttributes();
                for (const subDetailAttribute of subDetailAttributes) {
                    detailAttributeValues.push(subDetailAttribute.value);
                }
            }
            if (detailAttributeValues.length > 0 && detailAttributeValues.join("").length > 0) {
                parts.push(...detailAttributeValues);
            }
        }

        // no key, no title attributes, no first 3 details attributes -> use guid
        // this bottom of the barrel workaround works only inside same search session.
        // in cross search sessions scenario the key for same item will be different
        // the potential comparison of same item will fail without any hint for end users
        if (parts.length === 1) {
            parts.push(generateGuid());
        }
        return parts.join("-");
    }

    toString(): string {
        let i;
        const result = [];
        const title = [];
        for (i = 0; i < this.titleAttributes.length; ++i) {
            const titleAttribute = this.titleAttributes[i];
            title.push(titleAttribute.toString());
        }
        result.push(title.join(" "));
        for (i = 0; i < this.detailAttributes.length; ++i) {
            const detailAttribute = this.detailAttributes[i];
            result.push("  - " + detailAttribute.toString());
        }
        return result.join("\n");
    }
}
