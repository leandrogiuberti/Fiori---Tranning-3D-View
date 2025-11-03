/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { ComparisonOperator } from "../../sina/ComparisonOperator";
import { DataSource } from "../../sina/DataSource";
import * as typeConverter from "./typeConverter";
import { ComplexCondition } from "../../sina/ComplexCondition";
import { Condition } from "../../sina/Condition";
import { SimpleCondition } from "../../sina/SimpleCondition";
import { InBetweenConditionInConsistent, UnknownComparisonOperatorError } from "../../core/errors";
import { ABAPODataComparisonOperator } from "./ComparisonOperator";
import { LogicalOperator } from "../../sina/LogicalOperator";

export interface SerializedBetweenCondition {
    ConditionAttribute: string;
    ConditionOperator: ABAPODataComparisonOperator.Bt;
    ConditionValue: string | number | boolean;
    ConditionValueHigh: string | number | boolean;
    SubFilters: Condition[];
}

export interface SerializedSimpleCondition {
    ConditionAttribute: string;
    ConditionOperator: string;
    ConditionValue: string | number | boolean;
    SubFilters: Condition[];
}

export interface SerializedComplexCondition {
    ActAsQueryPart: boolean;
    Id: number;
    OperatorType: string;
    SubFilters: Condition[];
}

class ConditionSerializer {
    dataSource: DataSource;

    constructor(dataSource: DataSource) {
        this.dataSource = dataSource;
    }

    convertSinaToOdataOperator(sinaOperator: ComparisonOperator | LogicalOperator) {
        switch (sinaOperator) {
            case ComparisonOperator.Eq:
                return "EQ";
            case ComparisonOperator.Lt:
                return "LT";
            case ComparisonOperator.Gt:
                return "GT";
            case ComparisonOperator.Le:
                return "LE";
            case ComparisonOperator.Ge:
                return "GE";
            case ComparisonOperator.Co:
                return "EQ";
            case ComparisonOperator.Bw:
                return "EQ";
            case ComparisonOperator.Ew:
                return "EQ";
            case LogicalOperator.And:
                return "AND";
            case LogicalOperator.Or:
                return "OR";
            default:
                throw new UnknownComparisonOperatorError(sinaOperator);
        }
    }

    serializeComplexCondition(condition: ComplexCondition): SerializedComplexCondition {
        const result = {
            ActAsQueryPart: false,
            Id: 1,
            OperatorType: this.convertSinaToOdataOperator(condition.operator),
            SubFilters: [],
        };

        const actAsQueryPartPath =
            "Schema[Namespace=ESH_SEARCH_SRV]>EntityType[Name=SearchFilter]>Property[Name=ActAsQueryPart]";
        if (condition.sina.provider.isQueryPropertySupported(actAsQueryPartPath)) {
            result.ActAsQueryPart = true;
        }

        const subConditions = condition.conditions;
        for (let i = 0; i < subConditions.length; ++i) {
            const subCondition = subConditions[i];
            result.SubFilters.push(this.serialize(subCondition));
        }
        return result;
    }

    serializeSimpleCondition(condition: SimpleCondition): SerializedSimpleCondition {
        const metadata = this.dataSource.getAttributeMetadata(condition.attribute);
        const type = metadata.type;
        const conditionObj = {
            ConditionAttribute: condition.attribute,
            ConditionOperator: this.convertSinaToOdataOperator(condition.operator),
            ConditionValue: condition.isDynamicValue
                ? condition.value
                : typeConverter.sina2Odata(type, condition.value, {
                      operator: condition.operator,
                  }),
            SubFilters: [],
        };

        return conditionObj;
    }

    serializeBetweenCondition(condition: ComplexCondition): SerializedBetweenCondition {
        let valueLow;
        let valueHigh;

        const rangeStartCondition = condition.conditions[0];
        const rangeEndCondition = condition.conditions[1];
        if (rangeStartCondition instanceof SimpleCondition && rangeEndCondition instanceof SimpleCondition) {
            const metadata = this.dataSource.getAttributeMetadata(rangeStartCondition.attribute);
            const type = metadata.type;

            if (rangeStartCondition.operator === ComparisonOperator.Ge) {
                valueLow = rangeStartCondition.value;
                valueHigh = rangeEndCondition.value;
            } else {
                valueLow = rangeEndCondition.value;
                valueHigh = rangeStartCondition.value;
            }
            const conditionObj = {
                ConditionAttribute: rangeStartCondition.attribute,
                ConditionOperator: ABAPODataComparisonOperator.Bt,
                ConditionValue: typeConverter.sina2Odata(type, valueLow),
                ConditionValueHigh: typeConverter.sina2Odata(type, valueHigh),
                SubFilters: [],
            };

            return conditionObj;
        }

        throw new InBetweenConditionInConsistent();
    }

    serialize(
        condition: Condition
    ): SerializedSimpleCondition | SerializedComplexCondition | SerializedBetweenCondition {
        if (condition instanceof ComplexCondition) {
            if (
                condition.operator === LogicalOperator.And &&
                condition.conditions[0] &&
                (condition.conditions[0].operator === ComparisonOperator.Ge ||
                    condition.conditions[0].operator === ComparisonOperator.Gt ||
                    condition.conditions[0].operator === ComparisonOperator.Le ||
                    condition.conditions[0].operator === ComparisonOperator.Lt)
            ) {
                if (condition.conditions.length === 1) {
                    // condition example: "" ... "100"
                    return this.serializeSimpleCondition(condition.conditions[0] as SimpleCondition);
                }
                // condition example: "10" ... "100"
                return this.serializeBetweenCondition(condition);
            }
            return this.serializeComplexCondition(condition);
        }
        // condition example: "USA"
        if (condition instanceof SimpleCondition) {
            return this.serializeSimpleCondition(condition);
        }
    }
}

export function serialize(
    dataSource: DataSource,
    condition: Condition
): SerializedSimpleCondition | SerializedComplexCondition | SerializedBetweenCondition {
    const serializer = new ConditionSerializer(dataSource);
    return serializer.serialize(condition);
}
