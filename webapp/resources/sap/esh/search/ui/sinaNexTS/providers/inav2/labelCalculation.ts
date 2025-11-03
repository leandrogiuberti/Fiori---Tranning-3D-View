/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { LabelCalculator } from "../../core/LabelCalculator";

const splitId = function (id) {
    // CER002~EPM_PD_DEMO~
    if (id[6] !== "~") {
        return {
            system: "__DUMMY",
            client: "__DUMMY",
        };
    }
    return {
        system: id.slice(0, 3),
        client: id.slice(3, 6),
    };
};

export function createLabelCalculator() {
    return new LabelCalculator({
        key: function (dataSource) {
            const splittedId = splitId(dataSource.id);
            return [dataSource.labelPlural, splittedId.system, splittedId.client];
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
