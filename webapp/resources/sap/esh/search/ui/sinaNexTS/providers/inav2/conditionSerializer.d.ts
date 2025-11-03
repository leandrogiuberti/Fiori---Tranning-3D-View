declare module "sap/esh/search/ui/sinaNexTS/providers/inav2/conditionSerializer" {
    import { Condition } from "sap/esh/search/ui/sinaNexTS/sina/Condition";
    import { DataSource } from "sap/esh/search/ui/sinaNexTS/sina/DataSource";
    class ConditionSerializer {
        dataSource: DataSource;
        constructor(dataSource: DataSource);
        convertSinaToInaOperator(sinaOperator: any): "=" | "<" | ">" | "<=" | ">=";
        serializeComplexCondition(condition: any): {
            Selection: {
                Operator: {
                    Code: any;
                    SubSelections: any[];
                };
            };
        };
        serializeSimpleCondition(condition: any): {};
        serialize(condition: any): {};
    }
    function serialize(dataSource: DataSource, condition: Condition): {};
}
//# sourceMappingURL=conditionSerializer.d.ts.map