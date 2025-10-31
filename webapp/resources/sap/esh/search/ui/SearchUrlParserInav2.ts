/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import SearchModel from "sap/esh/search/ui/SearchModel";
import MessageBox from "sap/m/MessageBox";
import errors from "./error/errors";
import i18n from "./i18n";
import { ComparisonOperator } from "./sinaNexTS/sina/ComparisonOperator";
import { ComplexCondition } from "./sinaNexTS/sina/ComplexCondition";
import { DataSource } from "./sinaNexTS/sina/DataSource";
import { LogicalOperator } from "./sinaNexTS/sina/LogicalOperator";
import { SimpleCondition } from "./sinaNexTS/sina/SimpleCondition";
import { Value } from "./sinaNexTS/sina/types";

interface INAV2ConditionJSON {
    label: string;
    attribute: string;
    attributeLabel: string;
    value: string;
    valueLabel: string;
}

interface SimpleConditionJSON extends INAV2ConditionJSON {
    operator: "=" | ">" | ">=" | "<" | "<=";
}

interface ComplexConditionJSON extends INAV2ConditionJSON {
    operator: LogicalOperator;
    conditions?: Array<INAV2ConditionJSON>;
}

interface Context {
    attribute?: string;
    dataSource: DataSource;
}

function isComplexConditionJSON(conditionJSON: unknown): conditionJSON is ComplexConditionJSON {
    if (conditionJSON && (conditionJSON as ComplexConditionJSON).conditions) {
        return true;
    }
    return false;
}

export default class SearchUrlParserInav2 {
    private model: SearchModel;

    constructor(properties: { model: SearchModel }) {
        this.model = properties.model;
    }

    public async parseUrlParameters(oParametersLowerCased: {
        searchterm?: string;
        top?: string;
        datasource?: string;
        filter?: string;
    }): Promise<void> {
        // top
        if (oParametersLowerCased.top) {
            const top = parseInt(oParametersLowerCased.top, 10);
            this.model.setTop(top, false);
        }

        // datasource
        let dataSource = this.model.sinaNext.allDataSource;
        if (oParametersLowerCased.datasource) {
            const dataSourceJson = JSON.parse(oParametersLowerCased.datasource);
            const dataSourceId = dataSourceJson.ObjectName.value;
            switch (dataSourceJson.Type) {
                case "Category":
                    if (dataSourceId === "$$ALL$$") {
                        dataSource = this.model.sinaNext.allDataSource;
                    } else {
                        dataSource = this.model.sinaNext.getDataSource(dataSourceId);
                        if (!dataSource) {
                            dataSource = this.model.sinaNext.createDataSource({
                                type: this.model.sinaNext.DataSourceType.Category,
                                id: dataSourceId,
                                label: dataSourceJson.label,
                                labelPlural: dataSourceJson.labelPlural,
                            });
                        }
                    }
                    break;
                case "BusinessObject":
                    dataSource = this.model.sinaNext.getDataSource(dataSourceId);
                    if (!dataSource) {
                        dataSource = this.model.sinaNext.allDataSource;
                        delete oParametersLowerCased.filter;
                        MessageBox.show(
                            i18n.getText("searchUrlParsingErrorLong") +
                                "\n(Unknow datasource " +
                                dataSourceId +
                                ")",
                            {
                                icon: MessageBox.Icon.ERROR,
                                title: i18n.getText("searchUrlParsingError"),
                                actions: [MessageBox.Action.OK],
                                styleClass: "sapUshellSearchMessageBox", // selector for closePopovers
                            }
                        );
                    }
                    break;
                default: {
                    const internalError = new Error("Unknown datasource type " + dataSourceJson.Type);
                    throw new errors.UnknownDataSourceType(internalError);
                }
            }
        }

        await this.model.sinaNext.loadMetadata(dataSource);

        // root condition
        const context = {
            dataSource: dataSource,
        };
        let rootCondition;
        if (oParametersLowerCased.filter) {
            try {
                const filterJson = JSON.parse(oParametersLowerCased.filter);
                rootCondition = this.parseCondition(context, filterJson);
            } catch (e) {
                // fallback-filter + send error message
                rootCondition = this.model.sinaNext.createComplexCondition();
                MessageBox.show(i18n.getText("searchUrlParsingErrorLong") + "\n(" + e.toString() + ")", {
                    icon: MessageBox.Icon.ERROR,
                    title: i18n.getText("searchUrlParsingError"),
                    actions: [MessageBox.Action.OK],
                    styleClass: "sapUshellSearchMessageBox", // selector for closePopovers
                });
            }
        } else {
            rootCondition = this.model.sinaNext.createComplexCondition();
        }

        // filter
        const filter = this.model.sinaNext.createFilter({
            dataSource: dataSource,
            searchTerm: oParametersLowerCased.searchterm,
            rootCondition: rootCondition,
        });
        this.model.setProperty("/uiFilter", filter);
        this.model.setDataSource(filter.dataSource, false); // explicitely updata datasource (for categories: update ds list in model)
    }

    private parseCondition(
        context: Context,
        conditionJson: INAV2ConditionJSON
    ): SimpleCondition | ComplexCondition {
        if (isComplexConditionJSON(conditionJson)) {
            return this.parseComplexCondition(context, conditionJson);
        }
        return this.parseSimpleCondition(context, conditionJson as SimpleConditionJSON);
    }

    private parseComplexCondition(context: Context, conditionJson: ComplexConditionJSON): ComplexCondition {
        const subConditions = [];
        for (let i = 0; i < conditionJson.conditions.length; ++i) {
            const subConditionJson = conditionJson.conditions[i];
            subConditions.push(this.parseCondition(context, subConditionJson));
        }
        return this.model.sinaNext.createComplexCondition({
            operator: conditionJson.operator,
            conditions: subConditions,
            valueLabel: conditionJson.label,
        });
    }

    private parseSimpleCondition(context: Context, conditionJson: SimpleConditionJSON): SimpleCondition {
        context.attribute = conditionJson.attribute;
        return this.model.sinaNext.createSimpleCondition({
            attribute: conditionJson.attribute,
            attributeLabel: conditionJson.attributeLabel,
            value: this.parseValue(context, conditionJson.value),
            valueLabel: conditionJson.valueLabel || conditionJson.label,
            operator: this.parseOperator(context, conditionJson.operator),
        });
    }

    private parseValue(context: Context, value): Value {
        const metadata = context.dataSource.getAttributeMetadata(context.attribute);
        return this.model.sinaNext.inav2TypeConverter.ina2Sina(metadata.type, value);
    }

    private parseOperator(context: unknown, operator: "=" | ">" | ">=" | "<" | "<="): ComparisonOperator {
        switch (operator) {
            case "=":
                return this.model.sinaNext.ComparisonOperator.Eq;
            case ">":
                return this.model.sinaNext.ComparisonOperator.Gt;
            case ">=":
                return this.model.sinaNext.ComparisonOperator.Ge;
            case "<":
                return this.model.sinaNext.ComparisonOperator.Lt;
            case "<=":
                return this.model.sinaNext.ComparisonOperator.Le;
            default:
                throw "Unknown operator " + operator;
        }
    }
}
