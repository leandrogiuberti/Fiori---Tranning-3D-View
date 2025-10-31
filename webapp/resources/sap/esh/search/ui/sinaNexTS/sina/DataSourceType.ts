/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
export enum DataSourceType {
    BusinessObject = "BusinessObject",
    Category = "Category",
    UserCategory = "UserCategory",
}

export enum DataSourceSubType {
    // datasources of type    = BusinessObject
    //                subType = Filtered
    // reference a BusinessObject datasource and adds filter condition
    Filtered = "Filtered",
}
