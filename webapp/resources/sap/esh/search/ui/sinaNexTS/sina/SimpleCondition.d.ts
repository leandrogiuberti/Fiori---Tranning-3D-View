declare module "sap/esh/search/ui/sinaNexTS/sina/SimpleCondition" {
    import { ComparisonOperator } from "sap/esh/search/ui/sinaNexTS/sina/ComparisonOperator";
    import { Condition, ConditionProperties } from "sap/esh/search/ui/sinaNexTS/sina/Condition";
    import { ConditionType } from "sap/esh/search/ui/sinaNexTS/sina/ConditionType";
    import type { Sina } from "sap/esh/search/ui/sinaNexTS/sina/Sina";
    import { Value } from "sap/esh/search/ui/sinaNexTS/sina/types";
    interface SimpleConditionJSON {
        type: ConditionType;
        operator: ComparisonOperator;
        value: unknown | Date | number | {
            type: string;
            value: string;
        };
        valueLabel: string;
        attribute: string;
        attributeLabel: string;
        userDefined?: boolean;
        dynamic?: boolean;
    }
    function isSimpleCondition(condition: unknown): condition is SimpleCondition;
    interface SimpleConditionProperties extends ConditionProperties {
        operator?: ComparisonOperator;
        attribute: string;
        userDefined?: boolean | null;
        isDynamicValue?: boolean;
        value: Value;
    }
    class SimpleCondition extends Condition {
        type: ConditionType;
        operator: ComparisonOperator;
        attribute: string;
        isDynamicValue: boolean;
        value: Value;
        constructor(properties: SimpleConditionProperties);
        setSina(sina: Sina): void;
        clone(): SimpleCondition;
        equals(other: SimpleCondition): boolean;
        containsAttribute(attribute: string): boolean;
        _collectAttributes(attributeMap: {
            [attributeId: string]: boolean;
        }): void;
        getFirstAttribute(): string;
        _collectFilterConditions(attribute: string, filterConditions: SimpleCondition[]): void;
        removeAttributeConditions(attribute: string): {
            deleted: false;
            attribute: "";
            value: "";
        };
        toJson(): SimpleConditionJSON;
        static fromString(simpleConditionString: string): SimpleCondition;
        toString(): string;
    }
}
//# sourceMappingURL=SimpleCondition.d.ts.map