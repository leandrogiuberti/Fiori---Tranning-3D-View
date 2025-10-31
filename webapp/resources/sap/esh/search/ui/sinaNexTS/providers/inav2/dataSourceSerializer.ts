/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { DataSource } from "../../sina/DataSource";

export function serialize(dataSource: DataSource) {
    // handle all ds
    if (dataSource.id === "All" && dataSource.type === dataSource.sina.DataSourceType.Category) {
        return {
            ObjectName: "$$ALL$$",
            PackageName: "ABAP",
            SchemaName: "",
            Type: "Category",
        };
    }

    // convert sina type to ina type
    let type;
    switch (dataSource.type) {
        case dataSource.sina.DataSourceType.Category:
            type = "Category";
            break;
        case dataSource.sina.DataSourceType.BusinessObject:
            type = "Connector";
            break;
    }

    // assemble ina ds
    return {
        ObjectName: dataSource.id,
        PackageName: "ABAP",
        SchemaName: "",
        Type: type,
    };
}
