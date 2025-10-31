/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { AttributeMetadata } from "../../../sina/AttributeMetadata";
import { Sina } from "../../../sina/Sina";
import { NavigationTargetGenerator } from "./NavigationTargetGenerator";

export class NavigationTargetTemplate {
    sina: Sina;
    navigationTargetGenerator: NavigationTargetGenerator;
    label: string;
    sourceObjectType: unknown;
    targetObjectType: string;
    conditions: any;
    _condition: any;

    constructor(properties) {
        this.sina = properties.sina;
        this.navigationTargetGenerator = properties.navigationTargetGenerator;
        this.label = properties.label;
        this.sourceObjectType = properties.sourceObjectType;
        this.targetObjectType = properties.targetObjectType;
        this.conditions = properties.conditions;
    }

    generate(data) {
        const dataSource = this.sina.getDataSource(this.targetObjectType);
        const filter = this.sina.createFilter({
            dataSource: dataSource,
            searchTerm: "*",
        });
        for (let i = 0; i < this.conditions.length; ++i) {
            const condition = this.conditions[i];
            const filterCondition = this.sina.createSimpleCondition({
                attribute: condition.targetPropertyName,
                attributeLabel: (
                    dataSource.getAttributeMetadata(condition.targetPropertyName) as AttributeMetadata
                ).label,
                operator: this.sina.ComparisonOperator.Eq,
                value: data[condition.sourcePropertyName].value,
                valueLabel: data[condition.sourcePropertyName].valueFormatted,
            });
            filter.autoInsertCondition(filterCondition);
        }
        return this.sina.createNavigationTarget({
            text: this.label,
            targetUrl:
                this.navigationTargetGenerator.urlPrefix +
                encodeURIComponent(JSON.stringify(filter.toJson())),
        });
    }
}
