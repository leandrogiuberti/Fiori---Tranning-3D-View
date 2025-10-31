/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import * as util from "../../core/util";
import * as typeConverter from "./typeConverter";
import { Sina } from "../../sina/Sina";
import { Provider } from "../hana_odata/Provider";
import { SuvAttribute, SuvNavTargetResolver } from "../tools/fiori/SuvNavTargetResolver";
import { SearchResultSetItem } from "../../sina/SearchResultSetItem";
import { SearchQuery } from "../../sina/SearchQuery";
import { Log } from "../../core/Log";
import { SearchResultSetItemAttribute } from "../../sina/SearchResultSetItemAttribute";
import { AttributeMetadata } from "../../sina/AttributeMetadata";
import { WhyfoundProcessor } from "../tools/WhyfoundProcessor";
import { HierarchyNodePathParser } from "./HierarchyNodePathParser";
import { HANAOdataSearchResponseResult, HANAOdataSearchResponseResultItem } from "./Provider";
import { ODataValue } from "../../sina/odatatypes";

export class ItemParser {
    provider: Provider;
    sina: Sina;
    suvNavTargetResolver: SuvNavTargetResolver;
    log: Log = new Log("hana_odata item parser");
    hierarchyNodePathParser: HierarchyNodePathParser;

    constructor(provider: Provider) {
        this.provider = provider;
        this.sina = provider.sina;
        this.suvNavTargetResolver = this.sina._createSuvNavTargetResolver({
            sina: this.sina,
        });
        this.hierarchyNodePathParser = new HierarchyNodePathParser(this.sina);
    }

    public async parse(
        searchQuery: SearchQuery,
        data: HANAOdataSearchResponseResult
    ): Promise<Array<SearchResultSetItem>> {
        if (!data.value) {
            return Promise.resolve([]);
        }

        if (data.error) {
            this.log.warn("Server-side Warning: " + data.error.message);
        }

        const itemsData = data.value;
        const itemProms: Array<Promise<SearchResultSetItem>> = [];

        for (let i = 0; i < itemsData.length; ++i) {
            const itemData = itemsData[i] as HANAOdataSearchResponseResultItem;
            let itemProm: Promise<SearchResultSetItem>;
            try {
                itemProm = this.parseItem(itemData, searchQuery);
                itemProms.push(itemProm);
            } catch (e) {
                this.log.warn("Error occurred by parsing result item number " + i + ": " + e.message);
            }
        }
        return Promise.all(itemProms);
    }

    private async parseItem(
        itemData: HANAOdataSearchResponseResultItem,
        query: SearchQuery
    ): Promise<SearchResultSetItem> {
        const attributes: Array<SearchResultSetItemAttribute> = [];
        const titleAttributes: Array<SearchResultSetItemAttribute> = [];
        const detailAttributes: Array<SearchResultSetItemAttribute> = [];
        const titleDescriptionAttributes: Array<SearchResultSetItemAttribute> = [];
        const allAttributes: {
            [key: string]: SearchResultSetItemAttribute;
        } = {};
        const semanticObjectTypeAttributes = {};

        let entitySetName = itemData["@odata.context"] || "";
        const posOfSeparator = entitySetName.lastIndexOf("#");
        if (posOfSeparator > -1) {
            entitySetName = entitySetName.slice(posOfSeparator + 1);
        }
        const dataSource = this.sina.getDataSource(entitySetName) ?? query.getDataSource();

        let hierarchyNodePaths = undefined;
        if (itemData["@com.sap.vocabularies.Search.v1.ParentHierarchies"]) {
            const itemResponse = itemData["@com.sap.vocabularies.Search.v1.ParentHierarchies"];

            // {
            //     data: {
            //         "@com.sap.vocabularies.Search.v1.ParentHierarchies":
            //             itemData["@com.sap.vocabularies.Search.v1.ParentHierarchies"],
            //     },
            // };
            hierarchyNodePaths = this.hierarchyNodePathParser.parse(itemResponse, query);
        }

        const whyFounds = itemData["@com.sap.vocabularies.Search.v1.WhyFound"] || {};
        const hasHierarchyNodeChild = itemData["@com.sap.vocabularies.Search.v1.hasChildren"] || false;
        const hasHierarchyNodeChildAttribute = this.sina._createSearchResultSetItemAttribute({
            id: "HASHIERARCHYNODECHILD",
            label: "HASHIERARCHYNODECHILD",
            value: hasHierarchyNodeChild.toString(),
            valueFormatted: hasHierarchyNodeChild.toString(),
            valueHighlighted: hasHierarchyNodeChild.toString(),
            isHighlighted: false,
            metadata: undefined, // ToDo, fill 'metadata' or refactor to get rid of 'HASHIERARCHYNODECHILD'
            groups: [],
        });
        allAttributes[hasHierarchyNodeChildAttribute.id] = hasHierarchyNodeChildAttribute;
        attributes.push(hasHierarchyNodeChildAttribute);
        let metadata: AttributeMetadata;
        let semanticObjectType = "";

        const suvAttributes: { [key: string]: SuvAttribute } = {};
        let suvAttribute, suvAttributeName;
        const suvHighlightTerms = [];

        let fallbackDefaultNavigationTarget;
        const rankingScore = Number(itemData["@com.sap.vocabularies.Search.v1.Ranking"]);

        const whyFoundProcessor = new WhyfoundProcessor(this.sina);

        // parse attributes
        const itemDataStructured = this.preParseItem(itemData);

        for (const attributeName in itemDataStructured) {
            if (
                query.groupBy &&
                query.groupBy.aggregateCountAlias &&
                query.groupBy.aggregateCountAlias === attributeName
            ) {
                continue;
            }

            const structuredAttribute = itemDataStructured[attributeName];
            metadata = dataSource.getAttributeMetadata(attributeName) as AttributeMetadata;

            if (metadata.id == "LOC_4326") {
                // required to get maps to frontend // TODO: move to metadata parser
                metadata.usage.Detail.displayOrder = -1;
            }

            // Input:
            // value
            // highlighted
            // snippets

            // Output:
            // value            = input.value
            // valueFormatted   = TypeConverter(input.value)
            // valueHiglighted  =
            // multiline: true => input.highlighted | input.snippet | why found
            // multiline: false => input.snippet | input.highlighted | why found

            const attrValue = typeConverter.odata2Sina(metadata.type, structuredAttribute.value);

            const attrWhyFound = whyFoundProcessor.processRegularWhyFoundAttributes(
                attributeName,
                structuredAttribute,
                whyFounds,
                metadata
            );

            const attribute = this.sina._createSearchResultSetItemAttribute({
                id: metadata.id,
                label: metadata.label,
                value: attrValue,
                valueFormatted: undefined,
                valueHighlighted: attrWhyFound,
                isHighlighted: whyFoundProcessor.calIsHighlighted(attrWhyFound),
                metadata: metadata,
                groups: [],
            });

            // Add iconUrl if there is referred iconUrlAttributeName
            if (metadata.iconUrlAttributeName && itemDataStructured[metadata.iconUrlAttributeName]) {
                const iconUrlValue = itemDataStructured[metadata.iconUrlAttributeName];
                if (iconUrlValue) {
                    if (
                        typeof iconUrlValue === "object" &&
                        "value" in iconUrlValue &&
                        typeof iconUrlValue.value === "string" &&
                        iconUrlValue.value
                    ) {
                        attribute.iconUrl = iconUrlValue.value;
                    } else if (typeof iconUrlValue === "string") {
                        attribute.iconUrl = iconUrlValue;
                    }
                }
            }

            util.appendRemovingDuplicates(
                suvHighlightTerms,
                util.extractHighlightedTerms(attribute.valueHighlighted)
            );

            // deprecated as of 1.92 since fileviewer is also deprecated
            // if (metadata.suvUrlAttribute && metadata.suvMimeTypeAttribute) {
            //     suvUrlAttribute = allAttributes[metadata.suvUrlAttribute] || metadata.suvUrlAttribute.id;
            //     suvMimeTypeAttribute =
            //         allAttributes[metadata.suvMimeTypeAttribute] || metadata.suvMimeTypeAttribute.id;
            //     suvAttributes[metadata.id] = {
            //         suvThumbnailAttribute: attribute,
            //         suvTargetUrlAttribute: suvUrlAttribute,
            //         suvTargetMimeTypeAttribute: suvMimeTypeAttribute,
            //     };
            // }

            if (metadata.usage.Title) {
                titleAttributes.push(attribute);
            }
            if (metadata.usage.TitleDescription) {
                titleDescriptionAttributes.push(attribute);
            }
            if (metadata.usage.Detail) {
                detailAttributes.push(attribute);
            }
            attributes.push(attribute);
            if (metadata.usage.Navigation) {
                if (metadata.usage.Navigation.mainNavigation) {
                    fallbackDefaultNavigationTarget = this.sina.createNavigationTarget({
                        text: attribute.value,
                        targetUrl: attribute.value,
                        target: "_blank",
                    });
                }
            }

            allAttributes[attribute.id] = attribute;

            semanticObjectType =
                (dataSource.attributeMetadataMap[metadata.id]._private.semanticObjectType as string) || "";
            if (semanticObjectType.length > 0) {
                semanticObjectTypeAttributes[semanticObjectType] = attrValue;
            }
        }
        for (suvAttributeName in suvAttributes) {
            suvAttribute = suvAttributes[suvAttributeName];
            if (typeof suvAttribute.suvTargetUrlAttribute === "string") {
                suvAttribute.suvTargetUrlAttribute = allAttributes[suvAttribute.suvTargetUrlAttribute];
            }
            if (typeof suvAttribute.suvTargetMimeTypeAttribute === "string") {
                suvAttribute.suvTargetMimeTypeAttribute =
                    allAttributes[suvAttribute.suvTargetMimeTypeAttribute];
            }
            if (!(suvAttribute.suvTargetUrlAttribute || suvAttribute.suvTargetMimeTypeAttribute)) {
                delete suvAttributes[suvAttributeName];
            }
        }

        titleAttributes.sort(function (a1, a2) {
            return a1.metadata.usage.Title.displayOrder - a2.metadata.usage.Title.displayOrder;
        });

        detailAttributes.sort(function (a1, a2) {
            return a1.metadata.usage.Detail.displayOrder - a2.metadata.usage.Detail.displayOrder;
        });

        this.suvNavTargetResolver.resolveSuvNavTargets(dataSource, suvAttributes, suvHighlightTerms);

        const searchResultSetItem = this.sina._createSearchResultSetItem({
            dataSource: dataSource,
            attributes: attributes,
            titleAttributes: titleAttributes,
            titleDescriptionAttributes: titleDescriptionAttributes,
            detailAttributes: detailAttributes,
            defaultNavigationTarget: fallbackDefaultNavigationTarget,
            navigationTargets: [],
            score: rankingScore,
        });

        if (Array.isArray(hierarchyNodePaths) && hierarchyNodePaths.length > 0) {
            searchResultSetItem.hierarchyNodePaths = hierarchyNodePaths;
        }
        searchResultSetItem._private.allAttributesMap = allAttributes;
        searchResultSetItem._private.semanticObjectTypeAttributes = semanticObjectTypeAttributes;

        const itemPostParser = this.sina._createItemPostParser({
            searchResultSetItem: searchResultSetItem,
        });
        const postResultSetItem = await itemPostParser.postParseResultSetItem();

        return await whyFoundProcessor.processAdditionalWhyfoundAttributes(whyFounds, postResultSetItem);
    }

    private preParseItem(itemData: HANAOdataSearchResponseResultItem): Record<string, { value: ODataValue }> {
        const itemDataStructured = {};
        for (const originalPropertyName in itemData) {
            if (originalPropertyName[0] === "@" || originalPropertyName[0] === "_") {
                continue;
            }
            const value = itemData[originalPropertyName];
            const splitted = originalPropertyName.split("@");
            const propertyName = splitted[0];
            let substructure = itemDataStructured[propertyName];
            if (!substructure) {
                substructure = {};
                itemDataStructured[propertyName] = substructure;
            }
            if (splitted.length === 1) {
                substructure.value = value;
                continue;
            }
            if (splitted.length === 2) {
                substructure[splitted[1]] = value;
                continue;
            }
            throw "more than two @ in property name";
        }
        return itemDataStructured;
    }
}
