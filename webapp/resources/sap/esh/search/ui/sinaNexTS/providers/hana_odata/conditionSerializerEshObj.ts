/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { DataSource } from "../../sina/DataSource";
import { Condition } from "../../sina/Condition";
import { ComparisonOperator } from "../../sina/ComparisonOperator";
import { LogicalOperator } from "../../sina/LogicalOperator";
import { ComplexCondition } from "../../sina/ComplexCondition";
import { AttributeType } from "../../sina/AttributeType";
import * as typeConverter from "./typeConverter";
import {
    SearchQueryComparisonOperator as EshObjSearchQueryComparisonOperator,
    ComparisonOperator as EshObjComparisonOperator,
    NullValue as EshObjNullValue,
    SearchQueryLogicalOperator,
    IToStatement,
    Expression,
    Comparison,
    Phrase,
    // RangeValues,
    StringValue,
} from "./eshObjects/src/index";
import { SimpleCondition } from "../../sina/SimpleCondition";
// import * as eshObjectsQL from "./eshObjects/src/index";
import { UnknownComparisonOperatorError, UnknownLogicalOperatorError } from "../../core/errors";
import { AttributeMetadata } from "../../sina/AttributeMetadata";
import { NullValue } from "../../sina/NullValue";

export class ConditionSerializer {
    dataSource: DataSource;

    constructor(dataSource: DataSource) {
        this.dataSource = dataSource;
    }

    convertSinaToOdataOperator(sinaOperator: ComparisonOperator): EshObjSearchQueryComparisonOperator {
        switch (sinaOperator) {
            case ComparisonOperator.Search:
                return EshObjSearchQueryComparisonOperator.Search;
            case ComparisonOperator.Eq:
                return EshObjSearchQueryComparisonOperator.EqualCaseSensitive;
            case ComparisonOperator.Ne:
                return EshObjSearchQueryComparisonOperator.NotEqualCaseSensitive;
            case ComparisonOperator.Lt:
                return EshObjSearchQueryComparisonOperator.LessThanCaseInsensitive;
            case ComparisonOperator.Gt:
                return EshObjSearchQueryComparisonOperator.GreaterThanCaseInsensitive;
            case ComparisonOperator.Le:
                return EshObjSearchQueryComparisonOperator.LessThanOrEqualCaseInsensitive;
            case ComparisonOperator.Ge:
                return EshObjSearchQueryComparisonOperator.GreaterThanOrEqualCaseInsensitive;
            case ComparisonOperator.Co: // Contains only
                return EshObjSearchQueryComparisonOperator.EqualCaseInsensitive;
            case ComparisonOperator.Bw: // Begin with
                return EshObjSearchQueryComparisonOperator.EqualCaseInsensitive;
            case ComparisonOperator.Ew: // End with
                return EshObjSearchQueryComparisonOperator.EqualCaseInsensitive;
            case ComparisonOperator.DescendantOf:
                return EshObjSearchQueryComparisonOperator.DescendantOf;
            case ComparisonOperator.ChildOf:
                return EshObjSearchQueryComparisonOperator.ChildOf;
            default:
                throw new UnknownComparisonOperatorError(sinaOperator);
        }
    }

    convertSinaToOdataLogicalOperator(sinaOperator: LogicalOperator): SearchQueryLogicalOperator {
        switch (sinaOperator) {
            case LogicalOperator.And:
                return SearchQueryLogicalOperator.AND;
            case LogicalOperator.Or:
                return SearchQueryLogicalOperator.OR;
            case LogicalOperator.Not:
                return SearchQueryLogicalOperator.NOT;
            case LogicalOperator.Row:
                return SearchQueryLogicalOperator.ROW;
            default:
                throw new UnknownLogicalOperatorError(sinaOperator);
        }
    }

    serializeComplexCondition(condition: ComplexCondition): IToStatement {
        const result = new Expression({
            operator: this.convertSinaToOdataLogicalOperator(condition.operator),
            items: [],
        });
        const subConditions = condition.conditions;
        for (let i = 0; i < subConditions.length; ++i) {
            const subCondition = subConditions[i] as Condition;
            result.items.push(this.serialize(subCondition));
        }

        return result;
    }

    serializeSimpleCondition(condition: SimpleCondition): Comparison {
        // special handling for null value
        if (condition.value instanceof NullValue && condition.operator === ComparisonOperator.Eq) {
            return new Comparison({
                property: condition.attribute,
                operator: EshObjComparisonOperator.Is,
                value: new EshObjNullValue(),
            });
        }

        let type = AttributeType.String;
        let metadata: AttributeMetadata;
        if (this.dataSource instanceof DataSource) {
            metadata = this.dataSource.getAttributeMetadata(condition.attribute) as AttributeMetadata;
            if (metadata && metadata.type) {
                type = metadata.type;
            }
        }
        const conditionValue = typeConverter.sina2Odata(type, condition.value, {
            operator: condition.operator,
        });

        const conditionOperator = this.convertSinaToOdataOperator(condition.operator);

        return new Comparison({
            property: condition.attribute,
            operator: conditionOperator,
            value: new Phrase({ phrase: conditionValue }),
        });
    }

    serializeBetweenCondition(condition: ComplexCondition): Expression {
        const lowCondition = condition.conditions[0] as SimpleCondition;
        const highCondition = condition.conditions[1] as SimpleCondition;
        let type = AttributeType.String;
        if (this.dataSource instanceof DataSource) {
            const metadata = this.dataSource.getAttributeMetadata(lowCondition.attribute);
            type = metadata.type || AttributeType.String;
        }

        const lowValue = typeConverter.sina2Odata(type, lowCondition.value, {
            operator: lowCondition.operator,
        });
        const highValue = typeConverter.sina2Odata(type, highCondition.value, {
            operator: highCondition.operator,
        });

        return new Expression({
            operator: SearchQueryLogicalOperator.AND,
            items: [
                new Comparison({
                    property: lowCondition.attribute,
                    operator: EshObjSearchQueryComparisonOperator.GreaterThanOrEqualCaseInsensitive,
                    value: new StringValue({
                        value: lowValue,
                        isQuoted: true,
                    }),
                }),
                new Comparison({
                    property: lowCondition.attribute,
                    operator: EshObjSearchQueryComparisonOperator.LessThanOrEqualCaseInsensitive,
                    value: new StringValue({
                        value: highValue,
                        isQuoted: true,
                    }),
                }),
            ],
        });

        // return new Comparison({
        //     property: lowCondition.attribute,
        //     operator: EshObjComparisonOperator.BetweenCaseInsensitive,
        //     value: new RangeValues({
        //         start: lowValue, // currently only support simple types of string and number, will be improved
        //         end: highValue,
        //     }),
        // });
    }

    serialize(condition: Condition): IToStatement {
        if (condition instanceof ComplexCondition) {
            if (
                condition.operator === LogicalOperator.And &&
                condition.conditions.length > 1 &&
                // TODO: Enum
                condition.conditions[0] &&
                (condition.conditions[0].operator === ComparisonOperator.Ge ||
                    condition.conditions[0].operator === ComparisonOperator.Gt ||
                    condition.conditions[0].operator === ComparisonOperator.Le ||
                    condition.conditions[0].operator === ComparisonOperator.Lt)
            ) {
                return this.serializeBetweenCondition(condition as ComplexCondition);
            }
            return this.serializeComplexCondition(condition as ComplexCondition);
        }
        return this.serializeSimpleCondition(condition as SimpleCondition);
    }
}

export function serialize(dataSource: DataSource, condition: Condition): Expression {
    const serializer = new ConditionSerializer(dataSource);
    let result = serializer.serialize(condition);
    if (result instanceof Comparison) {
        result = new Expression({
            operator: SearchQueryLogicalOperator.TIGHT_AND,
            items: [result],
        });
    }
    return result as Expression;
}
