/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { DataSource } from "../../sina/DataSource";
import { UserCategoryDataSource } from "../../sina/UserCategoryDataSource";

export function serialize(dataSource: DataSource): {
    Id: string;
    Type: string;
}[] {
    // handle all ds
    if (dataSource === dataSource.sina.getAllDataSource()) {
        return [
            {
                Id: "<All>",
                Type: "Category",
            },
        ];
    }

    // convert sina type to abap_odata type
    let type;
    const aReturnValue = [];
    let userCategoryDataSource: UserCategoryDataSource;

    switch (dataSource.type) {
        case dataSource.sina.DataSourceType.Category:
            type = "Category";
            aReturnValue.push({
                Id: dataSource.id,
                Type: type,
            });
            break;
        case dataSource.sina.DataSourceType.BusinessObject:
            type = "View";
            aReturnValue.push({
                Id: dataSource.id,
                Type: type,
            });
            break;
        case dataSource.sina.DataSourceType.UserCategory:
            userCategoryDataSource = dataSource as UserCategoryDataSource;
            if (
                !userCategoryDataSource.subDataSources ||
                Array.isArray(userCategoryDataSource.subDataSources) === false
            ) {
                break;
            }

            for (const subDataSource of userCategoryDataSource.subDataSources) {
                switch (subDataSource.type) {
                    case subDataSource.sina.DataSourceType.Category:
                        type = "Category";
                        aReturnValue.push({
                            Id: subDataSource.id,
                            Type: type,
                        });
                        break;
                    case subDataSource.sina.DataSourceType.BusinessObject:
                        type = "View";
                        aReturnValue.push({
                            Id: subDataSource.id,
                            Type: type,
                        });
                        break;
                }
            }
    }
    return aReturnValue;
}
