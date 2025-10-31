/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import * as errors from "../core/errors";
import { SinaObject, SinaObjectProperties } from "./SinaObject";
import { DataSourceSubType, DataSourceType } from "./DataSourceType";
import { AttributeMetadata, AttributeMetadataJSON } from "./AttributeMetadata";
import { AttributeGroupMetadata, GroupAttributeMetadataJSON } from "./AttributeGroupMetadata";
import { DataSourceAttributeMetadataNotFoundError } from "../core/errors";
import { HierarchyDisplayType } from "./HierarchyDisplayType";
import { MatchingStrategy } from "./MatchingStrategy";
import { AttributeType } from "./AttributeType";
import { System } from "./System";
import { AttributeMetadataBase, AttributeMetadataBaseJSON } from "./AttributeMetadataBase";
import { Sina } from "./Sina";
import { NavigationTarget } from "./NavigationTarget";

export enum DataSourceJSONType {
    DataSourceJSON = "DataSourceJSON", // URL json
    DataSourceAndAttributesJSON = "DataSourceAndAttributesJSON", // sample2/data/...json
}

export interface DataSourceJSON extends SinaObjectProperties {
    type: DataSourceType;
    id: string;
    label: string;
    labelPlural?: string;
}
export interface DataSourceAndAttributesJSON extends DataSourceJSON {
    type: DataSourceType;
    id: string;
    label: string;
    labelPlural?: string;
    attributes: Array<AttributeMetadataJSON | GroupAttributeMetadataJSON>;
    defaultNavigationTarget?: NavigationTarget;
    navigationTargets?: Array<NavigationTarget>;
}
export interface DataSourceProperties extends SinaObjectProperties {
    type: DataSourceType;
    id: string;
    label: string;
    labelPlural?: string;

    annotations?: Record<string, object>;
    subType?: DataSourceSubType;
    icon?: string;
    hidden?: boolean;
    usage?: { appSearch: boolean | Record<string, never> } | Record<string, never>;
    attributesMetadata?: Array<AttributeMetadataBase>;
    attributeMetadataMap?: Record<string, AttributeMetadataBase>;
    attributeGroupsMetadata?: Array<AttributeGroupMetadata>;
    attributeGroupMetadataMap?: Record<string, AttributeGroupMetadata>;
    isHierarchyDataSource?: boolean;
    hierarchyName?: string;
    hierarchyDisplayType?: HierarchyDisplayType;
    hierarchyAttribute?: string;
    nlq?: boolean;
    defaultNavigationTarget?: NavigationTarget;
    navigationTargets?: Array<NavigationTarget>;
}

export class DataSource extends SinaObject {
    annotations?: Record<string, object>;
    type: DataSourceType;
    subType: DataSourceSubType;
    id: string;
    label: string;
    labelPlural?: string;
    icon: string;
    hidden? = false;
    usage?: { appSearch: boolean | Record<string, never> } | Record<string, never> = {};
    attributesMetadata?: Array<AttributeMetadataBase> = [];
    attributeMetadataMap?: Record<string, AttributeMetadataBase> = {};
    attributeGroupsMetadata?: Array<AttributeGroupMetadata> = [];
    attributeGroupMetadataMap?: Record<string, AttributeGroupMetadata> = {};
    isHierarchyDataSource?: boolean;
    hierarchyName?: string;
    hierarchyDisplayType?: HierarchyDisplayType; // TODO to be removed (consider DI use case)
    hierarchyAttribute?: string;
    nlq?: boolean = false;
    _hierarchyDataSource?: DataSource;
    system?: System;
    _hierarchyAttributeGroupMetadata: AttributeGroupMetadata | AttributeMetadata;
    _staticHierarchyAttributeMetadata: AttributeMetadata;
    defaultNavigationTarget?: NavigationTarget;
    navigationTargets?: Array<NavigationTarget>;

    static getAllDataSource(): DataSource {
        return new DataSource({
            id: "All",
            label: "All",
            type: DataSourceType.Category,
        });
    }

    constructor(properties: DataSourceProperties) {
        super({ sina: properties.sina });
        this.annotations = properties.annotations ?? this.annotations;
        this.type = properties.type ?? this.type;
        this.subType = properties.subType;
        this.id = properties.id ?? this.id;
        this.label = properties.label ?? this.label;
        this.labelPlural = properties.labelPlural ?? this.labelPlural;
        this.icon = properties.icon;
        this.hidden = properties.hidden ?? this.hidden;
        this.usage = properties.usage ?? this.usage;
        this.attributesMetadata = properties.attributesMetadata ?? this.attributesMetadata;
        this.attributeMetadataMap =
            properties.attributeMetadataMap ?? this.createAttributeMetadataMap(this.attributesMetadata);
        this.attributeGroupsMetadata = properties.attributeGroupsMetadata ?? this.attributeGroupsMetadata;
        this.attributeGroupMetadataMap =
            properties.attributeGroupMetadataMap ?? this.attributeGroupMetadataMap;
        this.isHierarchyDataSource = properties.isHierarchyDataSource;
        this.hierarchyName = properties.hierarchyName;
        this.hierarchyDisplayType = properties.hierarchyDisplayType;
        this.hierarchyAttribute = properties.hierarchyAttribute;
        this.nlq = properties.nlq ?? this.nlq;
        if (!this.labelPlural || this.labelPlural.length === 0) {
            this.labelPlural = this.label;
        }
        this.defaultNavigationTarget = properties.defaultNavigationTarget ?? undefined;
        this.navigationTargets = properties.navigationTargets ?? [];
        if (this.type === DataSourceType.BusinessObject && this.attributesMetadata.length === 0) {
            /*      throw new DataSourceAttributeMetadataNotFoundError(
                "Could not find metadata for attributes in data source " + this.id + ". "
            );*/
        }

        // filtered datasources reuse the metadata of the referred datasource
        // (instances of attributeMetadataMap identical)
        // therefore the following line is deactivated
        // this.attributeMetadataMap = this.createAttributeMetadataMap(this.attributesMetadata);
    }

    // equals(): boolean {
    //     throw new Error(
    //         "use === operator for comparison of datasources"
    //     );
    // }

    _configure(): void {
        // do not use
        // legacy: only called from inav2 provider
        const metadataFormatters = this.sina.metadataFormatters;
        if (!metadataFormatters) {
            return;
        }
        for (let i = 0; i < metadataFormatters.length; ++i) {
            const metadataFormatter = metadataFormatters[i];
            metadataFormatter.format({
                dataSources: [this],
            });
        }
    }

    createAttributeMetadataMap(
        attributesMetadata: Array<AttributeMetadataBase> = []
    ): Record<string, AttributeMetadataBase> {
        const map = {};
        for (let i = 0; i < attributesMetadata.length; ++i) {
            const attributeMetadata = attributesMetadata[i];
            map[attributeMetadata.id] = attributeMetadata;
        }
        return map;
    }

    getAttributeMetadata(attributeId: string): AttributeMetadataBase {
        if (this.id === "All") {
            return this.getCommonAttributeMetadata(attributeId); // for all we have only common attributes
        }
        // Fake metadata for transaction suggestions because transaction connector is not part
        // of the connector dropdown and as such is not part of the connector metadata response:
        if (
            this.id === "CD$ALL~ESH_TRANSACTION~" &&
            (attributeId === "TCDTEXT" || attributeId === "TCODE") &&
            !this.attributeMetadataMap[attributeId]
        ) {
            this.attributeMetadataMap[attributeId] = new AttributeMetadata({
                label: "label",
                isSortable: false,
                isKey: false,
                matchingStrategy: MatchingStrategy.Text,
                id: attributeId,
                usage: { Title: { displayOrder: 1 } },
                type: AttributeType.String,
            });
        }
        const attributeMetadata = this.attributeMetadataMap[attributeId];
        if (attributeMetadata) {
            return attributeMetadata;
        }
        throw new DataSourceAttributeMetadataNotFoundError(attributeId, this.id);
    }

    getAttributeGroupMetadata(attributeId: string): AttributeGroupMetadata {
        if (this.attributeGroupMetadataMap) {
            const attributeGroupMetadata = this.attributeMetadataMap[attributeId.toUpperCase()];
            if (attributeGroupMetadata && attributeGroupMetadata instanceof AttributeGroupMetadata) {
                return attributeGroupMetadata;
            }
        }
        throw new DataSourceAttributeMetadataNotFoundError(attributeId, this.id);
    }

    getCommonAttributeMetadata(attributeId: string): AttributeMetadataBase {
        for (const dataSource of this.sina.dataSources) {
            if (dataSource.type !== DataSourceType.BusinessObject) {
                continue;
            }
            const attributeMetadata = dataSource.attributeMetadataMap[attributeId];
            if (attributeMetadata) {
                return attributeMetadata;
            }
        }
        throw new DataSourceAttributeMetadataNotFoundError(attributeId, this.id);
    }

    getHierarchyDataSource(): DataSource {
        if (this._hierarchyDataSource instanceof DataSource) {
            return this._hierarchyDataSource;
        }

        for (let i = 0; i < this.attributesMetadata.length; ++i) {
            const attributeMetadata = this.attributesMetadata[i];
            if (!(attributeMetadata as AttributeMetadata).isHierarchy) {
                continue;
            }
            if (
                (attributeMetadata as AttributeMetadata).hierarchyDisplayType ===
                    HierarchyDisplayType.StaticHierarchyFacet ||
                (attributeMetadata as AttributeMetadata).hierarchyDisplayType ===
                    HierarchyDisplayType.HierarchyResultView
            ) {
                this._hierarchyDataSource = this.sina.getHierarchyDataSource(
                    (attributeMetadata as AttributeMetadata).hierarchyName
                );
                return this._hierarchyDataSource;
            }
        }
        return undefined;
    }

    getStaticHierarchyAttributeMetadata(): AttributeMetadata {
        if (this._staticHierarchyAttributeMetadata) {
            return this._staticHierarchyAttributeMetadata;
        }

        for (let i = 0; i < this.attributesMetadata.length; ++i) {
            const attributeMetadata = this.attributesMetadata[i];
            if (!(attributeMetadata as AttributeMetadata).isHierarchy) {
                continue;
            }
            if (
                (attributeMetadata as AttributeMetadata).hierarchyDisplayType ===
                HierarchyDisplayType.StaticHierarchyFacet
            ) {
                this._staticHierarchyAttributeMetadata = attributeMetadata as AttributeMetadata;
                return this._staticHierarchyAttributeMetadata;
            }
        }
        return undefined;
    }

    _getStaticHierarchyAttributeForDisplay(): AttributeMetadataBase {
        if (
            this._hierarchyAttributeGroupMetadata instanceof AttributeGroupMetadata ||
            this._hierarchyAttributeGroupMetadata instanceof AttributeMetadataBase
        ) {
            return this._hierarchyAttributeGroupMetadata;
        }

        // own hierarchy attribute or the one of its helper hierarchy datasource
        const hierarchyAttributeId =
            this.hierarchyAttribute || this.getHierarchyDataSource()?.hierarchyAttribute;
        if (!hierarchyAttributeId) {
            return undefined;
        }
        // Check attributeGroup led by hierarchy attribute and semantic type textelement. One level is enough, unnecessary to consider recursive case.
        for (let i = 0; i < this.attributeGroupsMetadata.length; i++) {
            const attributeGroupMeta: AttributeGroupMetadata = this.attributeGroupsMetadata[i];
            const parentAttribute = attributeGroupMeta._private?.parentAttribute as AttributeMetadata;
            if (
                parentAttribute instanceof AttributeMetadata &&
                parentAttribute.id === hierarchyAttributeId &&
                attributeGroupMeta._private?.isDescription === true
            ) {
                this._hierarchyAttributeGroupMetadata = attributeGroupMeta;
                return this._hierarchyAttributeGroupMetadata;
            }
        }

        // return single hierarchy attributeMetadata
        this._hierarchyAttributeGroupMetadata = this.attributeMetadataMap[this.hierarchyAttribute] as
            | AttributeGroupMetadata
            | AttributeMetadata;
        return this._hierarchyAttributeGroupMetadata;
    }

    toString(): string {
        return this.label;
    }

    // parse: sina data source -> json
    toJson(JsonType?: DataSourceJSONType): DataSourceJSON | DataSourceAndAttributesJSON {
        // 1. parse DataSourceJSON
        const json = {
            type: this.type,
            id: this.id,
            label: this.label,
            labelPlural: this.labelPlural || this.label,
        };

        if (JsonType === undefined || JsonType === DataSourceJSONType.DataSourceJSON) {
            return json as DataSourceJSON;
        }

        // 2. parse DataSourceAndAttributesJSON
        // example: sina data source -> sample2/data/...json
        console.log("===== Parse Json From DataSource: =====\n");

        (json as DataSourceAndAttributesJSON).attributes = [];

        for (const attributeMetadata of this.attributesMetadata as Array<
            AttributeMetadata | AttributeGroupMetadata
        >) {
            if (
                attributeMetadata instanceof AttributeGroupMetadata ||
                attributeMetadata instanceof AttributeMetadata
            ) {
                (json as DataSourceAndAttributesJSON).attributes.push(attributeMetadata.toJson());
            }
        }
        console.log(JSON.stringify(json));
        console.info("===== Info: make sure the same naming of {dataSource}.json and id:{dataSource}! =====");
        return json;
    }

    // parse: json -> sina data source
    static fromJson(json: DataSourceJSON | DataSourceAndAttributesJSON, sina: Sina): DataSource {
        // 1. parse DataSourceJSON
        if (!("attributes" in json)) {
            let dataSource = sina.getDataSource(json.id);
            if (dataSource) {
                return dataSource;
            }
            if (json.type !== DataSourceType.Category) {
                throw new errors.DataSourceInURLDoesNotExistError(json.id);
            }
            // TODO: code is not used in UI reload. remove this code
            // if dataSource is not found, should not create a new one without attributes
            dataSource = sina.createDataSource(json as DataSourceJSON);
            return dataSource;
        }

        // 2. parse DataSourceAndAttributesJSON
        const dataSource = sina.createDataSource({
            id: json.id,
            type: json.type,
            label: json.label,
            labelPlural: json.labelPlural || json.label,
            defaultNavigationTarget: json.defaultNavigationTarget || undefined,
            navigationTargets: json.navigationTargets || [],
        });

        // 3. set data source attribute metadata
        const attributeMetadataArray = dataSource.dejsonifyAttributes(json.attributes);

        attributeMetadataArray.forEach((attribute) => {
            dataSource.attributesMetadata.push(attribute);
            dataSource.attributeMetadataMap[attribute.id.toUpperCase()] = attribute;

            if (attribute instanceof AttributeGroupMetadata) {
                dataSource.attributeGroupsMetadata.push(attribute);
                dataSource.attributeGroupMetadataMap[attribute.id] = attribute;
            }
        });

        return dataSource;
    }

    private dejsonifyAttributes(
        attributeJsonArray: Array<AttributeMetadataBaseJSON>
    ): Array<AttributeMetadataBase> {
        const attributeMetadataMap = {} as Record<string, AttributeMetadataBase>;

        for (const attributeJson of attributeJsonArray) {
            // 1. parsed, single or group attribute
            if (attributeMetadataMap[attributeJson.id]) {
                // do nothing
                continue;
            }

            // 2. not parsed, single or group attribute
            const attributeMetadata = this.dejsonifyAttribute(
                // const attributeMetadata = AttributeMetadataBase.fromJson(
                attributeJson,
                attributeJsonArray,
                attributeMetadataMap,
                this.sina
            );
            attributeMetadataMap[attributeMetadata.id] = attributeMetadata;
        }

        return Object.values(attributeMetadataMap);
    }

    private dejsonifyAttribute(
        attributeJson: AttributeMetadataBaseJSON,
        attributeJsonArray: Array<AttributeMetadataBaseJSON>,
        attributeMetadataMap: Record<string, AttributeMetadataBase>,
        sina: Sina
    ): AttributeMetadataBase {
        // 1. single attribute
        if (attributeJson.type !== AttributeType.Group) {
            return AttributeMetadata.fromJson(attributeJson as AttributeMetadataJSON, sina);
        }

        // 2. group attribute
        return AttributeGroupMetadata.fromJson(
            attributeJson as GroupAttributeMetadataJSON,
            attributeJsonArray,
            attributeMetadataMap,
            sina
        );
    }
}
