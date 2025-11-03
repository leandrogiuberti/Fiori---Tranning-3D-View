declare module "sap/esh/search/ui/sinaNexTS/sina/Query" {
    import { SinaObject, SinaObjectProperties } from "sap/esh/search/ui/sinaNexTS/sina/SinaObject";
    import { Filter } from "sap/esh/search/ui/sinaNexTS/sina/Filter";
    import { ResultSet } from "sap/esh/search/ui/sinaNexTS/sina/ResultSet";
    import { DataSource } from "sap/esh/search/ui/sinaNexTS/sina/DataSource";
    import { Condition } from "sap/esh/search/ui/sinaNexTS/sina/Condition";
    import { ComplexCondition } from "sap/esh/search/ui/sinaNexTS/sina/ComplexCondition";
    import { SortOrder } from "sap/esh/search/ui/sinaNexTS/sina/SortOrder";
    interface QuerySortOrder {
        id: string;
        order: SortOrder;
    }
    interface QueryOptions extends SinaObjectProperties {
        label?: string;
        icon?: string;
        top?: number;
        skip?: number;
        nlq?: boolean;
        sortOrder?: Array<QuerySortOrder>;
        filter?: Filter;
        searchTerm?: string;
        dataSource?: DataSource;
        rootCondition?: Condition;
        suppressRefuseOutdatedResponsesDecorator?: boolean;
    }
    abstract class Query extends SinaObject {
        label: string;
        icon: string;
        filter: Filter;
        requestTimeout: boolean;
        sortOrder: Array<QuerySortOrder>;
        skip: number;
        top: number;
        nlq: boolean;
        private _lastQuery;
        private _resultSetPromise;
        constructor(properties: QueryOptions);
        setTop(top?: number): void;
        setSkip(skip?: number): void;
        setNlq(nlq: boolean): void;
        setSortOrder(sortOrder: Array<QuerySortOrder>): void;
        _execute(query: Query): Promise<ResultSet>;
        clone(): Query;
        equals(other: Query): boolean;
        abort(): void;
        getResultSetAsync(): Promise<ResultSet>;
        _genericFilteredQueryTransform(query: Query): Query;
        _formatResultSetAsync(resultSet: ResultSet): Promise<any>;
        _setResultSet(resultSet: ResultSet): Promise<ResultSet>;
        _createReadOnlyClone(): Query;
        resetResultSet(): void;
        getSearchTerm(): string;
        getDataSource(): DataSource;
        getRootCondition(): Condition;
        setSearchTerm(searchTerm: string): void;
        setDataSource(dataSource: DataSource): void;
        setRootCondition(rootCondition: ComplexCondition): void;
        resetConditions(): void;
        autoInsertCondition(condition: Condition): void;
        autoRemoveCondition(condition: Condition): void;
        setFilter(filter: Filter): void;
    }
}
//# sourceMappingURL=Query.d.ts.map