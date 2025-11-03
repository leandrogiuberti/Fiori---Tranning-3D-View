/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { DataSource, DataSourceProperties } from "./DataSource";

export interface UserCategoryDataSourceProperties extends DataSourceProperties {
    includeApps?: boolean;
    subDataSources?: Array<DataSource>;
    undefinedSubDataSourceIds?: Array<string>;
}
export class UserCategoryDataSource extends DataSource {
    includeApps? = false;
    subDataSources?: Array<DataSource> = [];
    undefinedSubDataSourceIds?: Array<string> = [];

    constructor(properties: UserCategoryDataSourceProperties) {
        super(properties as DataSourceProperties);
        this.includeApps = properties.includeApps;
        this.subDataSources = properties.subDataSources ?? this.subDataSources;
        this.undefinedSubDataSourceIds =
            properties.undefinedSubDataSourceIds ?? this.undefinedSubDataSourceIds;
    }

    // includeApps
    isIncludeApps(): boolean {
        return this.includeApps;
    }

    setIncludeApps(includeApps: boolean): void {
        this.includeApps = includeApps;
    }

    // subDataSource
    addSubDataSource(dataSource: DataSource): void {
        this.subDataSources.push(dataSource);
    }

    clearSubDataSources(): void {
        this.subDataSources = [];
    }
    getSubDataSources(): Array<DataSource> {
        return this.subDataSources;
    }
    hasSubDataSource(subDataSourceId: string): boolean {
        for (const subDataSource of this.subDataSources) {
            //  if (subDataSource) {
            if (subDataSource.id === subDataSourceId) {
                return true;
            }
            //   }
        }
        return false;
    }

    // undefinedSubDataSourceIds
    addUndefinedSubDataSourceId(id: string): void {
        this.undefinedSubDataSourceIds.push(id);
    }
    clearUndefinedSubDataSourceIds(): void {
        this.undefinedSubDataSourceIds = [];
    }
    getUndefinedSubDataSourceIds(): Array<string> {
        return this.undefinedSubDataSourceIds;
    }
}
