/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { LabelCalculator } from "../../core/LabelCalculator";

export function createLabelCalculator(): LabelCalculator {
    return new LabelCalculator({
        key: function (dataSource) {
            return [dataSource.labelPlural, dataSource.system.id];
        },
        data: function (dataSource) {
            return {
                label: dataSource.label,
                labelPlural: dataSource.labelPlural,
            };
        },
        setLabel: function (dataSource, labels, data) {
            labels[0] = data.label;
            dataSource.label = labels.join(" ");
            labels[0] = data.labelPlural;
            dataSource.labelPlural = labels.join(" ");
        },
        setFallbackLabel: function (dataSource, data) {
            dataSource.label = data.labelPlural + " duplicate " + dataSource.id;
            dataSource.labelPlural = dataSource.label;
        },
    });
}
