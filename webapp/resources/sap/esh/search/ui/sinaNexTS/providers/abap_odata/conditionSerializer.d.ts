declare module "sap/esh/search/ui/sinaNexTS/providers/abap_odata/conditionSerializer" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { ComparisonOperator } from "sap/esh/search/ui/sinaNexTS/sina/ComparisonOperator";
    import { DataSource } from "sap/esh/search/ui/sinaNexTS/sina/DataSource";
    import { ComplexCondition } from "sap/esh/search/ui/sinaNexTS/sina/ComplexCondition";
    import { Condition } from "sap/esh/search/ui/sinaNexTS/sina/Condition";
    import { SimpleCondition } from "sap/esh/search/ui/sinaNexTS/sina/SimpleCondition";
    import { ABAPODataComparisonOperator } from "sap/esh/search/ui/sinaNexTS/providers/abap_odata/ComparisonOperator";
    import { LogicalOperator } from "sap/esh/search/ui/sinaNexTS/sina/LogicalOperator";
    interface SerializedBetweenCondition {
        ConditionAttribute: string;
        ConditionOperator: ABAPODataComparisonOperator.Bt;
        ConditionValue: string | number | boolean;
        ConditionValueHigh: string | number | boolean;
        SubFilters: Condition[];
    }
    interface SerializedSimpleCondition {
        ConditionAttribute: string;
        ConditionOperator: string;
        ConditionValue: string | number | boolean;
        SubFilters: Condition[];
    }
    interface SerializedComplexCondition {
        ActAsQueryPart: boolean;
        Id: number;
        OperatorType: string;
        SubFilters: Condition[];
    }
    class ConditionSerializer {
        dataSource: DataSource;
        constructor(dataSource: DataSource);
        convertSinaToOdataOperator(sinaOperator: ComparisonOperator | LogicalOperator): "AND" | "OR" | "EQ" | "LT" | "GT" | "LE" | "GE";
        serializeComplexCondition(condition: ComplexCondition): SerializedComplexCondition;
        serializeSimpleCondition(condition: SimpleCondition): SerializedSimpleCondition;
        serializeBetweenCondition(condition: ComplexCondition): SerializedBetweenCondition;
        serialize(condition: Condition): SerializedSimpleCondition | SerializedComplexCondition | SerializedBetweenCondition;
    }
    function serialize(dataSource: DataSource, condition: Condition): SerializedSimpleCondition | SerializedComplexCondition | SerializedBetweenCondition;
}
//# sourceMappingURL=conditionSerializer.d.ts.map