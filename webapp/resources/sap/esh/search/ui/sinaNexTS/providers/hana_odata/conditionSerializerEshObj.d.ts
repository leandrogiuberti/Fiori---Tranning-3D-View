declare module "sap/esh/search/ui/sinaNexTS/providers/hana_odata/conditionSerializerEshObj" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { DataSource } from "sap/esh/search/ui/sinaNexTS/sina/DataSource";
    import { Condition } from "sap/esh/search/ui/sinaNexTS/sina/Condition";
    import { ComparisonOperator } from "sap/esh/search/ui/sinaNexTS/sina/ComparisonOperator";
    import { LogicalOperator } from "sap/esh/search/ui/sinaNexTS/sina/LogicalOperator";
    import { ComplexCondition } from "sap/esh/search/ui/sinaNexTS/sina/ComplexCondition";
    import { SearchQueryComparisonOperator as EshObjSearchQueryComparisonOperator, SearchQueryLogicalOperator, IToStatement, Expression, Comparison } from "./eshObjects/src/index";
    import { SimpleCondition } from "sap/esh/search/ui/sinaNexTS/sina/SimpleCondition";
    class ConditionSerializer {
        dataSource: DataSource;
        constructor(dataSource: DataSource);
        convertSinaToOdataOperator(sinaOperator: ComparisonOperator): EshObjSearchQueryComparisonOperator;
        convertSinaToOdataLogicalOperator(sinaOperator: LogicalOperator): SearchQueryLogicalOperator;
        serializeComplexCondition(condition: ComplexCondition): IToStatement;
        serializeSimpleCondition(condition: SimpleCondition): Comparison;
        serializeBetweenCondition(condition: ComplexCondition): Expression;
        serialize(condition: Condition): IToStatement;
    }
    function serialize(dataSource: DataSource, condition: Condition): Expression;
}
//# sourceMappingURL=conditionSerializerEshObj.d.ts.map