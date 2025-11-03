/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { DataSource } from "../../sina/DataSource";
import { DataSourceType } from "../../sina/DataSourceType";

export function serialize(dataSource: DataSource): { Id: string; Type: string } {
    // handle all ds
    if (dataSource === dataSource.sina.getAllDataSource()) {
        return {
            Id: "<All>",
            Type: "Category",
        };
    }

    // convert sina type to abap_odata type
    let type;
    switch (dataSource.type) {
        case DataSourceType.Category:
            type = "Category";
            break;
        case DataSourceType.BusinessObject:
            type = "View";
            break;
    }

    return {
        Id: dataSource.id,
        Type: type,
    };
}
