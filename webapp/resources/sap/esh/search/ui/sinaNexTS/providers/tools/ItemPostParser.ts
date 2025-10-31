/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { SinaObject, SinaObjectProperties } from "../../sina/SinaObject";
import { AttributeType } from "../../sina/AttributeType";
import { SearchResultSetItem } from "../../sina/SearchResultSetItem";
import { NavigationTarget } from "../../sina/NavigationTarget";
import { Provider as ABAPODataProvider } from "../abap_odata/Provider";
import { SearchResultSetItemAttributeGroup } from "../../sina/SearchResultSetItemAttributeGroup";
import { DataSource } from "../../sina/DataSource";

export interface ItemPostParserOptions extends SinaObjectProperties {
    searchResultSetItem: SearchResultSetItem;
}
export class ItemPostParser extends SinaObject {
    _searchResultSetItem: SearchResultSetItem;
    _dataSource: DataSource;
    _allAttributesMap: any;
    _intentsResolver: any;

    constructor(properties: ItemPostParserOptions) {
        super(properties);
        this._searchResultSetItem = properties.searchResultSetItem;
        this._dataSource = properties.searchResultSetItem.dataSource;
        this._allAttributesMap = properties.searchResultSetItem._private.allAttributesMap;

        this._intentsResolver = this.sina._createFioriIntentsResolver({
            sina: properties.sina,
        });
    }

    async postParseResultSetItem(): Promise<SearchResultSetItem> {
        const prom = this.enhanceResultSetItemWithNavigationTargets();
        // TODO: what about exceptions?
        this.enhanceResultSetItemWithGroups(); // can be done in parallel, if parallelization is possible
        return prom;
    }

    async enhanceResultSetItemWithNavigationTargets(): Promise<SearchResultSetItem> {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this;
        const semanticObjectType = that._dataSource._private.semanticObjectType;
        const semanticObjectTypeAttributes = that._searchResultSetItem._private.semanticObjectTypeAttributes;
        const systemId = that._dataSource.system?.id?.split(".")[0];
        const client = that._dataSource.system?.id?.split(".")[1];
        const intents = await that._intentsResolver.resolveIntents({
            semanticObjectType: semanticObjectType,
            semanticObjectTypeAttributes: semanticObjectTypeAttributes,
            systemId: systemId,
            client: client,
            fallbackDefaultNavigationTarget: that._searchResultSetItem.defaultNavigationTarget,
        });
        const defaultNavigationTarget = intents && intents.defaultNavigationTarget;
        const navigationTargets = intents && intents.navigationTargets;
        let navigationTargetForEnhancement: Array<NavigationTarget> = [];
        if (defaultNavigationTarget) {
            navigationTargetForEnhancement.push(defaultNavigationTarget);
            that._searchResultSetItem.setDefaultNavigationTarget(defaultNavigationTarget);
        }
        if (navigationTargets) {
            that._searchResultSetItem.setNavigationTargets(navigationTargets);
            navigationTargetForEnhancement = [...navigationTargetForEnhancement, ...navigationTargets];
        }
        this.enhanceNavigationTargetsWithContentProviderId(navigationTargetForEnhancement);
        return that._searchResultSetItem;
    }

    private enhanceNavigationTargetsWithContentProviderId(navigationTargets: Array<NavigationTarget>): void {
        if (!(this.sina.provider instanceof ABAPODataProvider)) {
            return;
        }
        if (!(this.sina.provider as ABAPODataProvider).contentProviderId) {
            return;
        }
        for (const navigationTarget of navigationTargets) {
            navigationTarget.targetUrl +=
                "&sap-app-origin-hint=" + (this.sina.provider as ABAPODataProvider).contentProviderId;
        }
    }

    enhanceResultSetItemWithGroups(): void {
        const attributesMetadata = this._searchResultSetItem.dataSource.attributesMetadata;
        for (let i = 0; i < attributesMetadata.length; i++) {
            const attributeMetadata = attributesMetadata[i];
            if (attributeMetadata.type === AttributeType.Group) {
                const group = this._addAttributeGroup(attributeMetadata);
                group.parent = this._searchResultSetItem;
                if (attributeMetadata.usage.Detail) {
                    this._searchResultSetItem.detailAttributes.push(group);
                }
                if (attributeMetadata.usage.Title) {
                    this._searchResultSetItem.titleAttributes.push(group);
                }
                if (attributeMetadata.usage.TitleDescription) {
                    this._searchResultSetItem.titleDescriptionAttributes.push(group);
                }
            }
        }
        this.sortAttributes();
    }

    sortAttributes(): void {
        const createSortFunction = function (attributeName) {
            return function (a1, a2) {
                // be careful to handle displayOrder === 0 correctly!
                const displayOrder1 =
                    a1.metadata.usage && a1.metadata.usage[attributeName]
                        ? a1.metadata.usage[attributeName].displayOrder
                        : undefined;
                const displayOrder2 =
                    a2.metadata.usage && a2.metadata.usage[attributeName]
                        ? a2.metadata.usage[attributeName].displayOrder
                        : undefined;
                if (displayOrder1 === undefined || displayOrder2 === undefined) {
                    if (displayOrder2 !== undefined) {
                        return 1;
                    }
                    return -1;
                }
                return displayOrder1 - displayOrder2;
            };
        };
        this._searchResultSetItem.titleAttributes.sort(createSortFunction("Title"));
        this._searchResultSetItem.titleDescriptionAttributes.sort(createSortFunction("TitleDescription"));
        this._searchResultSetItem.detailAttributes.sort(createSortFunction("Detail"));
    }

    _addAttributeGroup(attributeGroupMetadata): SearchResultSetItemAttributeGroup {
        const group = this.sina._createSearchResultSetItemAttributeGroup({
            id: attributeGroupMetadata.id,
            metadata: attributeGroupMetadata,
            label: attributeGroupMetadata.label,
            template: attributeGroupMetadata.template,
            attributes: [],
            groups: [],
            displayAttributes: attributeGroupMetadata.displayAttributes || [],
        });

        let parentAttributeMetadata, childAttributeMetadata;
        if (attributeGroupMetadata._private) {
            parentAttributeMetadata = attributeGroupMetadata._private.parentAttribute;
            childAttributeMetadata = attributeGroupMetadata._private.childAttribute;
        }

        for (let k = 0; k < attributeGroupMetadata.attributes.length; k++) {
            const attributeMembershipMetadata = attributeGroupMetadata.attributes[k];
            const attributeMetadata = attributeMembershipMetadata.attribute;
            let attributeOrGroup;
            if (attributeMetadata.type === AttributeType.Group) {
                // attributeOrGroup = this._addAttributeGroup(attributeMetadata, this._allAttributesMap);
                attributeOrGroup = this._addAttributeGroup(attributeMetadata);
            } else {
                attributeOrGroup = this._allAttributesMap[attributeMetadata.id];
            }
            if (attributeOrGroup) {
                const attributeGroupMembership = this.sina._createSearchResultSetItemAttributeGroupMembership(
                    {
                        group: group,
                        attribute: attributeOrGroup,
                        metadata: attributeMembershipMetadata,
                    }
                );
                group.attributes.push(attributeGroupMembership);
                attributeOrGroup.groups.push(attributeGroupMembership);
            }
            if (attributeMetadata == parentAttributeMetadata) {
                group._private.parentAttribute = attributeOrGroup;
            } else if (attributeMetadata == childAttributeMetadata) {
                group._private.childAttribute = attributeOrGroup;
            }
        }

        return group;
    }
}
