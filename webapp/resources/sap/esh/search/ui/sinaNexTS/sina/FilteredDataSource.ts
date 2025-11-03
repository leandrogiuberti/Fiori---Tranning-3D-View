/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { ComplexCondition } from "./ComplexCondition";
import { DataSource, DataSourceProperties } from "./DataSource";
import { SimpleCondition } from "./SimpleCondition";

export interface FilteredDataSourceProperties extends DataSourceProperties {
    dataSource: DataSource;
    filterCondition: SimpleCondition | ComplexCondition;
}

export class FilteredDataSource extends DataSource {
    public dataSource: DataSource;
    public filterCondition: SimpleCondition | ComplexCondition;

    constructor(properties: FilteredDataSourceProperties) {
        properties.annotations = properties.annotations ?? properties.dataSource.annotations;
        properties.hidden = properties.hidden ?? properties.dataSource.hidden;
        properties.attributesMetadata =
            properties.attributesMetadata ?? properties.dataSource.attributesMetadata;
        properties.attributeMetadataMap =
            properties.attributeMetadataMap ?? properties.dataSource.attributeMetadataMap;
        properties.attributeGroupsMetadata =
            properties.attributeGroupsMetadata ?? properties.dataSource.attributeGroupsMetadata;
        properties.attributeGroupMetadataMap =
            properties.attributeGroupMetadataMap ?? properties.dataSource.attributeGroupMetadataMap;
        properties.isHierarchyDataSource =
            properties.isHierarchyDataSource ?? properties.dataSource.isHierarchyDataSource;
        properties.hierarchyName = properties.hierarchyName ?? properties.dataSource.hierarchyName;
        properties.hierarchyDisplayType =
            properties.hierarchyDisplayType ?? properties.dataSource.hierarchyDisplayType;
        properties.hierarchyAttribute =
            properties.hierarchyAttribute ?? properties.dataSource.hierarchyAttribute;
        super(properties);
        this.dataSource = properties.dataSource;
        this.filterCondition = properties.filterCondition;
    }
}
