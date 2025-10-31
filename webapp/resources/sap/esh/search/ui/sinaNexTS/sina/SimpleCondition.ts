/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import * as util from "../core/util";
import { ComparisonOperator } from "./ComparisonOperator";
import { Condition, ConditionProperties } from "./Condition";
import { ConditionType } from "./ConditionType";
import type { Sina } from "./Sina";
import { Value } from "./types";

export interface SimpleConditionJSON {
    type: ConditionType;
    operator: ComparisonOperator;
    value:
        | unknown
        | Date
        | number
        | {
              type: string;
              value: string;
          };
    valueLabel: string;
    attribute: string;
    attributeLabel: string;
    userDefined?: boolean;
    dynamic?: boolean;
}

export function isSimpleCondition(condition: unknown): condition is SimpleCondition {
    return condition instanceof SimpleCondition;
}

// _meta: {
//     properties: {
//         operator: {
//             required: false,
//             default: function () {
//                 return this.sina.ComparisonOperator.Eq;
//             }
//         },
//         attribute: {
//             required: true
//         },
//         value: {
//             required: true
//         }
//     }
// },
export interface SimpleConditionProperties extends ConditionProperties {
    operator?: ComparisonOperator;
    attribute: string;
    userDefined?: boolean | null;
    isDynamicValue?: boolean;
    value: Value;
}
export class SimpleCondition extends Condition {
    type: ConditionType = ConditionType.Simple;
    operator: ComparisonOperator = ComparisonOperator.Eq;
    attribute: string;
    isDynamicValue: boolean;
    value: Value;

    constructor(properties: SimpleConditionProperties) {
        super(properties);
        this.operator = properties.operator ?? this.operator;
        this.attribute = properties.attribute ?? this.attribute;
        this.userDefined = properties.userDefined ?? this.userDefined;
        this.isDynamicValue = properties.isDynamicValue ?? false;
        this.value = properties.value ?? this.value;
    }

    setSina(sina: Sina) {
        this.sina = sina;
    }

    clone(): SimpleCondition {
        return new SimpleCondition({
            operator: this.operator,
            attribute: this.attribute,
            attributeLabel: this.attributeLabel,
            value: this.value,
            valueLabel: this.valueLabel,
            userDefined: this.userDefined,
            isDynamicValue: this.isDynamicValue,
        });
    }

    equals(other: SimpleCondition): boolean {
        if (!(other instanceof SimpleCondition)) {
            return false;
        }
        if (this.attribute !== other.attribute || this.operator !== other.operator) {
            return false;
        }
        if (this.isDynamicValue !== other.isDynamicValue) {
            return false;
        }
        if (this.value instanceof Date && other.value instanceof Date) {
            return this.value.getTime() === other.value.getTime();
        }
        return this.value === other.value;
    }

    containsAttribute(attribute: string): boolean {
        return this.attribute === attribute;
    }

    _collectAttributes(attributeMap: { [attributeId: string]: boolean }): void {
        attributeMap[this.attribute] = true;
    }

    getFirstAttribute(): string {
        return this.attribute;
    }

    _collectFilterConditions(attribute: string, filterConditions: SimpleCondition[]) {
        if (this.attribute === attribute) {
            filterConditions.push(this);
        }
    }

    removeAttributeConditions(attribute: string): {
        deleted: false;
        attribute: "";
        value: "";
    } {
        if (this.attribute === attribute) {
            throw "program error";
        }
        return {
            deleted: false,
            attribute: "",
            value: "",
        };
    }

    toJson(): SimpleConditionJSON {
        let jsonValue;
        if (this.value instanceof Date) {
            jsonValue = util.dateToJson(this.value);
        } else {
            jsonValue = this.value;
        }
        const result: SimpleConditionJSON = {
            type: ConditionType.Simple,
            operator: this.operator,
            attribute: this.attribute,
            value: jsonValue,
            valueLabel: this.valueLabel,
            attributeLabel: this.attributeLabel,
        };
        if (this.userDefined) {
            result.userDefined = true;
        }
        if (this.isDynamicValue) {
            result.dynamic = this.isDynamicValue;
        }
        return result;
    }

    static fromString(simpleConditionString: string): SimpleCondition {
        const parts = simpleConditionString.split(" ");
        const attribute = parts.shift();
        const operator = ComparisonOperator[parts.shift() as keyof typeof ComparisonOperator];
        if (!operator) {
            throw new Error(
                `Invalid operator ${operator} in simple condition string: ${simpleConditionString}`
            );
        }
        let value = parts.join(" ").replace(/''/g, "'"); // Add escaped single quotes
        if (value.startsWith("'") && value.endsWith("'")) {
            // Remove surrounding single quotes
            value = value.slice(1, -1);
        }
        return new SimpleCondition({
            attribute,
            operator,
            value,
        });
    }

    toString(): string {
        const escapedValue = this.value.toString().replace(/'/g, "''");
        return `${this.attribute} ${this.operator} '${escapedValue}'`;
    }
}
