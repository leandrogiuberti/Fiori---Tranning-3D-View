/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { Condition, ConditionProperties } from "./Condition";
import { ConditionType } from "./ConditionType";
import { LogicalOperator } from "./LogicalOperator";
import { isSimpleCondition, SimpleCondition, SimpleConditionJSON } from "./SimpleCondition";
import type { Sina } from "./Sina";
import { Value } from "./types";

export interface RemoveConditionResult {
    deleted: boolean;
    attribute: string;
    value: Value;
}
export interface ComplexConditionJSON {
    type: ConditionType;
    operator: LogicalOperator;
    conditions: Array<ComplexConditionJSON | SimpleConditionJSON>;
    valueLabel: string;
    attributeLabel: string;
    userDefined?: boolean;
}

export interface ComplexConditionProperties extends ConditionProperties {
    operator?: LogicalOperator;
    conditions?: Array<SimpleCondition | ComplexCondition>;
}

export function isComplexCondition(condition: unknown): condition is ComplexCondition {
    return condition instanceof ComplexCondition;
}

export class ComplexCondition extends Condition {
    // _meta: {
    //     properties: {
    //         operator: {
    //             required: false,
    //             default: function () {
    //                 return this.sina.LogicalOperator.And;
    //             }
    //         },
    //         conditions: {
    //             required: false,
    //             default: function () {
    //                 return [];
    //             }
    //         }
    //     }
    // },

    type: ConditionType = ConditionType.Complex;
    operator: LogicalOperator = LogicalOperator.And;
    conditions: Array<SimpleCondition | ComplexCondition> = [];

    constructor(properties: ComplexConditionProperties) {
        super(properties);
        this.operator = properties.operator ?? this.operator;
        this.conditions = properties.conditions ?? this.conditions;
    }

    setSina(sina: Sina) {
        this.sina = sina;
        for (const condition of this.conditions) {
            condition.setSina(sina);
        }
    }

    clone(): ComplexCondition {
        const clonedConditions: Array<SimpleCondition | ComplexCondition> = [];
        for (let i = 0; i < this.conditions.length; ++i) {
            clonedConditions.push(this.conditions[i].clone());
        }
        return new ComplexCondition({
            sina: this.sina,
            operator: this.operator,
            conditions: clonedConditions,
            valueLabel: this.valueLabel,
            attributeLabel: this.attributeLabel,
        });
    }

    equals(other: ComplexCondition): boolean {
        if (!(other instanceof ComplexCondition)) {
            return false;
        }
        if (this.operator !== other.operator) {
            return false;
        }
        if (this.conditions.length !== other.conditions.length) {
            return false;
        }
        const matchedOtherConditions = {};
        for (let i = 0; i < this.conditions.length; ++i) {
            const condition = this.conditions[i];
            let match = false;
            for (let j = 0; j < other.conditions.length; ++j) {
                if (matchedOtherConditions[j]) {
                    continue;
                }
                const otherCondition = other.conditions[j];
                if (isComplexCondition(condition) && isComplexCondition(otherCondition)) {
                    if (condition.equals(otherCondition)) {
                        match = true;
                        matchedOtherConditions[j] = true;
                        break;
                    }
                } else if (isSimpleCondition(condition) && isSimpleCondition(otherCondition)) {
                    if (condition.equals(otherCondition)) {
                        match = true;
                        matchedOtherConditions[j] = true;
                        break;
                    }
                }
            }
            if (!match) {
                return false;
            }
        }
        return true;
    }

    containsAttribute(attribute: string): boolean {
        for (const condition of this.conditions) {
            if (condition.containsAttribute(attribute)) {
                return true;
            }
        }
        return false;
    }

    _collectAttributes(attributeMap: { [attributeId: string]: boolean }): void {
        for (const condition of this.conditions) {
            condition._collectAttributes(attributeMap);
        }
    }
    addCondition(condition: SimpleCondition | ComplexCondition): void {
        if (!(condition instanceof Condition)) {
            condition = this.sina.createSimpleCondition(condition);
        }
        this.conditions.push(condition);
    }

    removeConditionAt(index: number): void {
        this.conditions.splice(index, 1);
    }

    hasFilters(): boolean {
        return this.conditions.length >= 1;
    }

    removeAttributeConditions(attribute: string): RemoveConditionResult {
        let result: RemoveConditionResult = {
            deleted: false,
            attribute: "",
            value: "",
        };
        for (let i = 0; i < this.conditions.length; ++i) {
            const subCondition = this.conditions[i];
            switch (subCondition.type) {
                case ConditionType.Complex:
                    result = (subCondition as ComplexCondition).removeAttributeConditions(attribute);
                    break;
                case ConditionType.Simple:
                    if ((subCondition as SimpleCondition).attribute === attribute) {
                        result = {
                            deleted: true,
                            attribute: (subCondition as SimpleCondition).attribute,
                            value: (subCondition as SimpleCondition).value,
                        };
                        this.removeConditionAt(i);
                        i--;
                    }
                    break;
            }
        }
        this.cleanup();
        return result;
    }

    getAttributeConditions(attribute: string): Condition[] {
        const results = [];

        const doGetAttributeConditions = function (condition, attributeName) {
            switch (condition.type) {
                case ConditionType.Complex:
                    for (let i = 0; i < condition.conditions.length; i++) {
                        doGetAttributeConditions(condition.conditions[i], attributeName);
                    }
                    break;
                case ConditionType.Simple:
                    if (condition.attribute === attributeName) {
                        results.push(condition);
                    }
                    break;
            }
        };

        doGetAttributeConditions(this, attribute);
        return results;
    }

    cleanup(): void {
        let removed = false;
        const doCleanup = function (condition) {
            for (let i = 0; i < condition.conditions.length; ++i) {
                const subCondition = condition.conditions[i];
                switch (subCondition.type) {
                    case ConditionType.Complex:
                        doCleanup(subCondition);
                        if (subCondition.conditions.length === 0) {
                            removed = true;
                            condition.removeConditionAt(i);
                            i--;
                        }
                        break;
                    case ConditionType.Simple:
                        break;
                }
            }
        };
        do {
            removed = false;
            doCleanup(this);
        } while (removed);
    }

    resetConditions(): void {
        this.conditions.splice(0, this.conditions.length);
    }

    getFirstAttribute(): string {
        if (this.conditions.length === 0) {
            return null;
        }
        // just use first condition
        if (this.conditions[0] instanceof ComplexCondition) {
            return (this.conditions[0] as ComplexCondition).getFirstAttribute();
        }
        if (this.conditions[0] instanceof SimpleCondition) {
            return (this.conditions[0] as SimpleCondition).getFirstAttribute();
        }
        throw new Error("Condition is neither simple nor complex");
    }

    _collectFilterConditions(attribute: string, filterConditions: SimpleCondition[]) {
        for (const condition of this.conditions) {
            condition._collectFilterConditions(attribute, filterConditions);
        }
    }

    private getAttribute(condition: Condition): string {
        if (condition instanceof SimpleCondition) {
            return condition.attribute;
        }

        for (let i = 0; i < (condition as ComplexCondition).conditions.length; ++i) {
            const attribute = this.getAttribute((condition as ComplexCondition).conditions[i]);
            if (attribute) {
                return attribute;
            }
        }
    }

    autoInsertCondition(condition: Condition): void {
        // identify complex condition which is responsible for the attribute -> matchCondition
        const attribute = this.getAttribute(condition);
        let matchCondition, currentCondition;
        for (let i = 0; i < this.conditions.length; ++i) {
            currentCondition = this.conditions[i];
            const currentAttribute = this.getAttribute(currentCondition);
            if (currentAttribute === attribute) {
                matchCondition = currentCondition;
                break;
            }
        }

        // if there is no matchCondition -> create
        if (!matchCondition) {
            if (this.sina) {
                matchCondition = this.sina.createComplexCondition({
                    operator: LogicalOperator.Or,
                });
            } else {
                matchCondition = new ComplexCondition({
                    operator: LogicalOperator.Or,
                });
            }
            this.addCondition(matchCondition);
        }

        // prevent duplicate conditions
        for (let j = 0; j < matchCondition.conditions.length; ++j) {
            currentCondition = matchCondition.conditions[j];
            if (currentCondition.equals(condition)) {
                return;
            }
        }

        // add condition
        matchCondition.addCondition(condition);
    }

    autoRemoveCondition(condition: Condition): void {
        // helper
        const removeCondition = function (complexCondition, condition) {
            for (let i = 0; i < complexCondition.conditions.length; ++i) {
                const subCondition = complexCondition.conditions[i];

                if (subCondition.equals(condition)) {
                    complexCondition.removeConditionAt(i);
                    i--;
                    continue;
                }

                if (subCondition instanceof ComplexCondition) {
                    removeCondition(subCondition, condition);
                    if (subCondition.conditions.length === 0) {
                        complexCondition.removeConditionAt(i);
                        i--;
                        continue;
                    }
                }
            }
        };

        // remove
        removeCondition(this, condition);
    }

    toJson(): ComplexConditionJSON {
        const result: ComplexConditionJSON = {
            type: ConditionType.Complex,
            operator: this.operator,
            conditions: [],
            valueLabel: this.valueLabel,
            attributeLabel: this.attributeLabel,
        };
        for (let i = 0; i < this.conditions.length; ++i) {
            const condition = this.conditions[i];
            if (condition instanceof ComplexCondition) {
                result.conditions.push((condition as ComplexCondition).toJson());
            }
            if (condition instanceof SimpleCondition) {
                result.conditions.push((condition as SimpleCondition).toJson());
            }
        }
        if (this.userDefined) {
            result.userDefined = true;
        }
        return result;
    }

    toString(): string {
        let result = this.operator + " (";
        for (let i = 0; i < this.conditions.length; ++i) {
            const condition = this.conditions[i];
            if (condition instanceof ComplexCondition) {
                result += (condition as ComplexCondition).toString();
            }
            if (condition instanceof SimpleCondition) {
                result += (condition as SimpleCondition).toString();
            }
            if (i < this.conditions.length - 1) {
                result += ", ";
            }
        }
        return result + ")";
    }

    static fromString(input: string): ComplexCondition {
        const operatorMatch = input.match(/^(\w+) \(/);
        if (!operatorMatch) {
            throw new Error("Invalid input string format");
        }

        const operator = operatorMatch[1] as LogicalOperator;
        const conditionsString = input.slice(operatorMatch[0].length, -1); // Remove operator and surrounding parentheses

        const conditions = conditionsString.split(/,\s*(?=(?:[^()]*\([^()]*\))*[^()]*$)/); // Split by commas not inside parentheses
        const parsedConditions: Array<SimpleCondition | ComplexCondition> = [];
        for (const condition of conditions) {
            const trimmedCondition = condition.trim();
            if (trimmedCondition) {
                parsedConditions.push(ComplexCondition.parseCondition(trimmedCondition));
            }
        }

        return new ComplexCondition({
            operator,
            conditions: parsedConditions,
        });
    }

    private static parseCondition(conditionString: string): SimpleCondition | ComplexCondition {
        const operatorMatch = conditionString.match(/^(\w+) \(/);
        if (operatorMatch) {
            return ComplexCondition.fromString(conditionString);
        } else {
            return SimpleCondition.fromString(conditionString);
        }
    }
}
