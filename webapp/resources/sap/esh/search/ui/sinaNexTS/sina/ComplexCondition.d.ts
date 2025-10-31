declare module "sap/esh/search/ui/sinaNexTS/sina/ComplexCondition" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { Condition, ConditionProperties } from "sap/esh/search/ui/sinaNexTS/sina/Condition";
    import { ConditionType } from "sap/esh/search/ui/sinaNexTS/sina/ConditionType";
    import { LogicalOperator } from "sap/esh/search/ui/sinaNexTS/sina/LogicalOperator";
    import { SimpleCondition, SimpleConditionJSON } from "sap/esh/search/ui/sinaNexTS/sina/SimpleCondition";
    import type { Sina } from "sap/esh/search/ui/sinaNexTS/sina/Sina";
    import { Value } from "sap/esh/search/ui/sinaNexTS/sina/types";
    interface RemoveConditionResult {
        deleted: boolean;
        attribute: string;
        value: Value;
    }
    interface ComplexConditionJSON {
        type: ConditionType;
        operator: LogicalOperator;
        conditions: Array<ComplexConditionJSON | SimpleConditionJSON>;
        valueLabel: string;
        attributeLabel: string;
        userDefined?: boolean;
    }
    interface ComplexConditionProperties extends ConditionProperties {
        operator?: LogicalOperator;
        conditions?: Array<SimpleCondition | ComplexCondition>;
    }
    function isComplexCondition(condition: unknown): condition is ComplexCondition;
    class ComplexCondition extends Condition {
        type: ConditionType;
        operator: LogicalOperator;
        conditions: Array<SimpleCondition | ComplexCondition>;
        constructor(properties: ComplexConditionProperties);
        setSina(sina: Sina): void;
        clone(): ComplexCondition;
        equals(other: ComplexCondition): boolean;
        containsAttribute(attribute: string): boolean;
        _collectAttributes(attributeMap: {
            [attributeId: string]: boolean;
        }): void;
        addCondition(condition: SimpleCondition | ComplexCondition): void;
        removeConditionAt(index: number): void;
        hasFilters(): boolean;
        removeAttributeConditions(attribute: string): RemoveConditionResult;
        getAttributeConditions(attribute: string): Condition[];
        cleanup(): void;
        resetConditions(): void;
        getFirstAttribute(): string;
        _collectFilterConditions(attribute: string, filterConditions: SimpleCondition[]): void;
        private getAttribute;
        autoInsertCondition(condition: Condition): void;
        autoRemoveCondition(condition: Condition): void;
        toJson(): ComplexConditionJSON;
        toString(): string;
        static fromString(input: string): ComplexCondition;
        private static parseCondition;
    }
}
//# sourceMappingURL=ComplexCondition.d.ts.map