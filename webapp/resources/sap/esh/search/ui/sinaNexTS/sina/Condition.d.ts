declare module "sap/esh/search/ui/sinaNexTS/sina/Condition" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { SinaObject, SinaObjectProperties } from "sap/esh/search/ui/sinaNexTS/sina/SinaObject";
    import { ConditionType } from "sap/esh/search/ui/sinaNexTS/sina/ConditionType";
    import { ComparisonOperator } from "sap/esh/search/ui/sinaNexTS/sina/ComparisonOperator";
    import { LogicalOperator } from "sap/esh/search/ui/sinaNexTS/sina/LogicalOperator";
    import { SimpleCondition, SimpleConditionJSON } from "sap/esh/search/ui/sinaNexTS/sina/SimpleCondition";
    import type { Sina } from "sap/esh/search/ui/sinaNexTS/sina/Sina";
    import { ComplexConditionJSON } from "sap/esh/search/ui/sinaNexTS/sina/ComplexCondition";
    interface ConditionProperties extends SinaObjectProperties {
        attributeLabel?: string;
        valueLabel?: string;
        userDefined?: boolean | null;
    }
    abstract class Condition extends SinaObject {
        type: ConditionType;
        attributeLabel?: string;
        valueLabel?: string;
        userDefined?: boolean | null;
        operator: ComparisonOperator | LogicalOperator;
        constructor(properties: ConditionProperties);
        abstract setSina(sina: Sina): any;
        abstract clone(): Condition;
        abstract equals(other: Condition): boolean;
        abstract containsAttribute(attribute: string): boolean;
        abstract getFirstAttribute(): string;
        abstract _collectAttributes(attributeMap: {
            [attributeId: string]: boolean;
        }): void;
        getAttributes(): string[];
        abstract _collectFilterConditions(attribute: string, filterConditions: Array<SimpleCondition>): any;
        getConditionsByAttribute(attribute: string): Array<SimpleCondition>;
        abstract toJson(): ComplexConditionJSON | SimpleConditionJSON;
    }
}
//# sourceMappingURL=Condition.d.ts.map