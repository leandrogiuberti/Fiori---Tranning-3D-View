/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { UnknownComparisonOperatorError } from "../../core/errors";
import { AttributeType } from "../../sina/AttributeType";
import { ComparisonOperator } from "../../sina/ComparisonOperator";
import { ComplexCondition } from "../../sina/ComplexCondition";
import { Condition } from "../../sina/Condition";
import { DataSource } from "../../sina/DataSource";
import * as typeConverter from "./typeConverter";

class ConditionSerializer {
    dataSource: DataSource;

    constructor(dataSource: DataSource) {
        this.dataSource = dataSource;
    }

    convertSinaToInaOperator(sinaOperator) {
        switch (sinaOperator) {
            case ComparisonOperator.Eq:
                return "=";
            case ComparisonOperator.Lt:
                return "<";
            case ComparisonOperator.Gt:
                return ">";
            case ComparisonOperator.Le:
                return "<=";
            case ComparisonOperator.Ge:
                return ">=";
            case ComparisonOperator.Co:
                return "=";
            case ComparisonOperator.Bw:
                return "=";
            case ComparisonOperator.Ew:
                return "=";
            default:
                throw new UnknownComparisonOperatorError(sinaOperator);
        }
    }

    serializeComplexCondition(condition) {
        const result = {
            Selection: {
                Operator: {
                    Code: condition.operator,
                    SubSelections: [],
                },
            },
        };
        const subConditions = condition.conditions;
        for (let i = 0; i < subConditions.length; ++i) {
            const subCondition = subConditions[i];
            result.Selection.Operator.SubSelections.push(this.serialize(subCondition));
        }
        return result;
    }

    serializeSimpleCondition(condition) {
        if (!condition.value) {
            return undefined;
        }

        // get type of attribute in condition
        const attributeId = condition.attribute;
        let type;
        if (attributeId.slice(0, 2) === "$$") {
            type = AttributeType.String;
        } else {
            const metadata = this.dataSource.getAttributeMetadata(attributeId);
            type = metadata.type;
        }

        // set operand
        let operand = "MemberOperand";
        if (attributeId === "$$SuggestionTerms$$" || attributeId === "$$SearchTerms$$") {
            operand = "SearchOperand";
        }

        // assemble condition
        const result = {};
        result[operand] = {
            AttributeName: attributeId,
            Comparison: this.convertSinaToInaOperator(condition.operator),
            Value: typeConverter.sina2Ina(type, condition.value, {
                operator: condition.operator,
            }),
        };
        return result;
    }

    serialize(condition) {
        if (condition instanceof ComplexCondition) {
            return this.serializeComplexCondition(condition);
        }
        return this.serializeSimpleCondition(condition);
    }
}

export function serialize(dataSource: DataSource, condition: Condition) {
    const serializer = new ConditionSerializer(dataSource);
    return serializer.serialize(condition);
}
