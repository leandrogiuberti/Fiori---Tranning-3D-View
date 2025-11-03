/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { SinaObject, SinaObjectProperties } from "./SinaObject";
import { ConditionType } from "./ConditionType";
import { ComparisonOperator } from "./ComparisonOperator";
import { LogicalOperator } from "./LogicalOperator";
import { SimpleCondition, SimpleConditionJSON } from "./SimpleCondition";
import type { Sina } from "./Sina";
import { ComplexConditionJSON } from "./ComplexCondition";

// _meta: {
//     properties: {
//         attributeLabel: {
//             required: false
//         },
//         valueLabel: {
//             required: false
//         },
//         userDefined: {
//             required: false
//         }
//     }
// }
export interface ConditionProperties extends SinaObjectProperties {
    attributeLabel?: string;
    valueLabel?: string;
    userDefined?: boolean | null;
}

export abstract class Condition extends SinaObject {
    type: ConditionType;
    attributeLabel?: string;
    valueLabel?: string;
    userDefined?: boolean | null;
    operator: ComparisonOperator | LogicalOperator;

    constructor(properties: ConditionProperties) {
        super({ sina: properties.sina });
        this.attributeLabel = properties.attributeLabel;
        this.valueLabel = properties.valueLabel;
        this.userDefined = properties.userDefined;
    }

    abstract setSina(sina: Sina);

    abstract clone(): Condition;

    abstract equals(other: Condition): boolean;

    abstract containsAttribute(attribute: string): boolean;

    abstract getFirstAttribute(): string;

    abstract _collectAttributes(attributeMap: { [attributeId: string]: boolean }): void;

    getAttributes(): string[] {
        const attributeMap = {};
        this._collectAttributes(attributeMap);
        return Object.keys(attributeMap);
    }

    abstract _collectFilterConditions(attribute: string, filterConditions: Array<SimpleCondition>);

    getConditionsByAttribute(attribute: string): Array<SimpleCondition> {
        const filterConditions = [];
        this._collectFilterConditions(attribute, filterConditions);
        return filterConditions;
    }

    abstract toJson(): ComplexConditionJSON | SimpleConditionJSON;
}
