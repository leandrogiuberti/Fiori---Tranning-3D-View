declare module "sap/esh/search/ui/sinaNexTS/sina/DataSource" {
    import { SinaObject, SinaObjectProperties } from "sap/esh/search/ui/sinaNexTS/sina/SinaObject";
    import { DataSourceSubType, DataSourceType } from "sap/esh/search/ui/sinaNexTS/sina/DataSourceType";
    import { AttributeMetadata, AttributeMetadataJSON } from "sap/esh/search/ui/sinaNexTS/sina/AttributeMetadata";
    import { AttributeGroupMetadata, GroupAttributeMetadataJSON } from "sap/esh/search/ui/sinaNexTS/sina/AttributeGroupMetadata";
    import { HierarchyDisplayType } from "sap/esh/search/ui/sinaNexTS/sina/HierarchyDisplayType";
    import { System } from "sap/esh/search/ui/sinaNexTS/sina/System";
    import { AttributeMetadataBase } from "sap/esh/search/ui/sinaNexTS/sina/AttributeMetadataBase";
    import { Sina } from "sap/esh/search/ui/sinaNexTS/sina/Sina";
    import { NavigationTarget } from "sap/esh/search/ui/sinaNexTS/sina/NavigationTarget";
    enum DataSourceJSONType {
        DataSourceJSON = "DataSourceJSON",// URL json
        DataSourceAndAttributesJSON = "DataSourceAndAttributesJSON"
    }
    interface DataSourceJSON extends SinaObjectProperties {
        type: DataSourceType;
        id: string;
        label: string;
        labelPlural?: string;
    }
    interface DataSourceAndAttributesJSON extends DataSourceJSON {
        type: DataSourceType;
        id: string;
        label: string;
        labelPlural?: string;
        attributes: Array<AttributeMetadataJSON | GroupAttributeMetadataJSON>;
        defaultNavigationTarget?: NavigationTarget;
        navigationTargets?: Array<NavigationTarget>;
    }
    interface DataSourceProperties extends SinaObjectProperties {
        type: DataSourceType;
        id: string;
        label: string;
        labelPlural?: string;
        annotations?: Record<string, object>;
        subType?: DataSourceSubType;
        icon?: string;
        hidden?: boolean;
        usage?: {
            appSearch: boolean | Record<string, never>;
        } | Record<string, never>;
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
    class DataSource extends SinaObject {
        annotations?: Record<string, object>;
        type: DataSourceType;
        subType: DataSourceSubType;
        id: string;
        label: string;
        labelPlural?: string;
        icon: string;
        hidden?: boolean;
        usage?: {
            appSearch: boolean | Record<string, never>;
        } | Record<string, never>;
        attributesMetadata?: Array<AttributeMetadataBase>;
        attributeMetadataMap?: Record<string, AttributeMetadataBase>;
        attributeGroupsMetadata?: Array<AttributeGroupMetadata>;
        attributeGroupMetadataMap?: Record<string, AttributeGroupMetadata>;
        isHierarchyDataSource?: boolean;
        hierarchyName?: string;
        hierarchyDisplayType?: HierarchyDisplayType;
        hierarchyAttribute?: string;
        nlq?: boolean;
        _hierarchyDataSource?: DataSource;
        system?: System;
        _hierarchyAttributeGroupMetadata: AttributeGroupMetadata | AttributeMetadata;
        _staticHierarchyAttributeMetadata: AttributeMetadata;
        defaultNavigationTarget?: NavigationTarget;
        navigationTargets?: Array<NavigationTarget>;
        static getAllDataSource(): DataSource;
        constructor(properties: DataSourceProperties);
        _configure(): void;
        createAttributeMetadataMap(attributesMetadata?: Array<AttributeMetadataBase>): Record<string, AttributeMetadataBase>;
        getAttributeMetadata(attributeId: string): AttributeMetadataBase;
        getAttributeGroupMetadata(attributeId: string): AttributeGroupMetadata;
        getCommonAttributeMetadata(attributeId: string): AttributeMetadataBase;
        getHierarchyDataSource(): DataSource;
        getStaticHierarchyAttributeMetadata(): AttributeMetadata;
        _getStaticHierarchyAttributeForDisplay(): AttributeMetadataBase;
        toString(): string;
        toJson(JsonType?: DataSourceJSONType): DataSourceJSON | DataSourceAndAttributesJSON;
        static fromJson(json: DataSourceJSON | DataSourceAndAttributesJSON, sina: Sina): DataSource;
        private dejsonifyAttributes;
        private dejsonifyAttribute;
    }
}
//# sourceMappingURL=DataSource.d.ts.map