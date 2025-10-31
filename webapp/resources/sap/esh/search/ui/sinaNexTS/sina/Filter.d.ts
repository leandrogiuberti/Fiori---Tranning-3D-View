declare module "sap/esh/search/ui/sinaNexTS/sina/Filter" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { DataSource, DataSourceJSON } from "sap/esh/search/ui/sinaNexTS/sina/DataSource";
    import { SinaObject, SinaObjectProperties } from "sap/esh/search/ui/sinaNexTS/sina/SinaObject";
    import { SimpleConditionJSON } from "sap/esh/search/ui/sinaNexTS/sina/SimpleCondition";
    import { ComplexConditionJSON } from "sap/esh/search/ui/sinaNexTS/sina/ComplexCondition";
    import { Condition } from "sap/esh/search/ui/sinaNexTS/sina/Condition";
    interface FilterJSON {
        dataSource: DataSourceJSON;
        searchTerm: string;
        rootCondition: ComplexConditionJSON | SimpleConditionJSON;
    }
    interface FilterOptions extends SinaObjectProperties {
        dataSource?: DataSource;
        searchTerm?: string;
        rootCondition?: Condition;
    }
    class Filter extends SinaObject {
        dataSource: DataSource;
        searchTerm: string;
        rootCondition: Condition;
        constructor(properties: FilterOptions);
        setSearchTerm(searchTerm: string): void;
        setRootCondition(rootCondition: Condition): void;
        clone(): Filter;
        equals(other: Filter): boolean;
        _getAttribute(condition: Condition): string;
        setDataSource(dataSource: DataSource): void;
        resetConditions(): void;
        autoInsertCondition(condition: Condition): void;
        autoRemoveCondition(condition: Condition): void;
        isFolderMode(): boolean;
        getFolderAttribute(): string;
        toJson(): FilterJSON;
    }
}
//# sourceMappingURL=Filter.d.ts.map