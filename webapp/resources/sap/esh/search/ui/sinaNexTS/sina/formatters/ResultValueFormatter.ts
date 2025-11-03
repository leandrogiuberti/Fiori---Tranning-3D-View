/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
/* eslint-disable @typescript-eslint/no-this-alias */

import { Formatter } from "./Formatter";
import { AttributeType } from "../AttributeType";
import { Sina } from "../Sina";
import { stringifyValue } from "../../sina/util";
import { ResultSet } from "../ResultSet";
import { SearchResultSet } from "../SearchResultSet";
import { SearchResultSetItemAttributeGroup } from "../SearchResultSetItemAttributeGroup";
import { SearchResultSetItemAttributeBase } from "../SearchResultSetItemAttributeBase";
import { SearchResultSetItemAttribute } from "../SearchResultSetItemAttribute";
import { SearchResultSetItem } from "../SearchResultSetItem";
import { Log } from "../../core/Log";

export interface NumberFormat {
    getIntegerInstance(): IntergerInstance;
    getFloatInstance(): FloatInstance;
}

interface IntergerInstance {
    format(number): string;
}

interface FloatInstance {
    format(number): string;
}

export interface DateFormat {
    getDateTimeInstance(): DateTimeInstance;
    getDateInstance(object): DateInstance;
    getTimeInstance(object): TimeInstance;
}

interface DateTimeInstance {
    format(Date): string;
}

interface DateInstance {
    format(Date): string;
}

interface TimeInstance {
    format(Date): string;
}

export class ResultValueFormatter extends Formatter {
    sina: Sina;
    ui5NumberFormat?: NumberFormat;
    ui5DateFormat?: DateFormat;
    private log = new Log("ResultvalueFormatter");

    constructor(properties?: { ui5NumberFormat?: NumberFormat; ui5DateFormat?: DateFormat }) {
        super();
        this.ui5NumberFormat = properties?.ui5NumberFormat || undefined;
        this.ui5DateFormat = properties?.ui5DateFormat || undefined;
    }

    initAsync(): Promise<void> {
        return Promise.resolve();
    }

    format(resultSet: SearchResultSet): SearchResultSet {
        return this._formatItemsInUI5Form(resultSet);
    }

    formatAsync(resultSet: SearchResultSet): Promise<ResultSet> {
        resultSet = this._formatItemsInUI5Form(resultSet);
        return Promise.resolve(resultSet);
    }

    private _formatItemsInUI5Form(resultSet: SearchResultSet): SearchResultSet {
        const that = this;
        that.sina = resultSet.sina;
        resultSet.items.forEach(function (item) {
            that._formatItemInUI5Form(item);
        });
        return resultSet;
    }

    public _formatItemInUI5Form(item: SearchResultSetItem) {
        const that = this;
        that.sina = item.sina;
        if (
            that.sina.getDataSource(item.dataSource.id) === undefined ||
            that.sina.getDataSource(item.dataSource.id).attributeMetadataMap === undefined ||
            Object.keys(that.sina.getDataSource(item.dataSource.id).attributeMetadataMap).length === 0
        ) {
            return;
        }

        item.titleAttributes.forEach(function (attribute) {
            that.formatAttribute(attribute);
        });

        item.titleDescriptionAttributes.forEach(function (attribute) {
            that.formatAttribute(attribute);
        });

        item.detailAttributes.forEach(function (attribute) {
            that.formatAttribute(attribute);
        });

        // attributes are stored in following lists:
        // - item.titleAttributes (sub-set)
        // - item.titleDescriptionAttributes (sub-set)
        // - item.detailAttributes (sub-set)
        // - item.attributes (mother-set)
        // - item.attributesMap (mother-set)
        // Bug: some attributes are not pass-by-reference, format in one list, not effects others.
        // Example: additional whyfound attributes created by whyfoundprocessor
        // Workaround: format every list.

        item.attributes.forEach(function (attribute) {
            that.formatAttribute(attribute);
        });
    }

    // attribute could be single attribute or group attribute
    private formatAttribute(attribute: SearchResultSetItemAttributeBase): void {
        const that = this;

        // attribute "HASHIERARCHYNODECHILD" has undefined metadata
        if (attribute?.metadata?.type === undefined) {
            return;
        }

        if (attribute.metadata.type && attribute.metadata.type === AttributeType.Group) {
            // group attributes
            for (let i = 0; i < (attribute as SearchResultSetItemAttributeGroup).attributes.length; i++) {
                that.formatAttribute(
                    (attribute as SearchResultSetItemAttributeGroup).attributes[i].attribute
                );
            }
        } else {
            // single attribute
            that.formatSingleAttribute(attribute as SearchResultSetItemAttribute);
        }
    }

    private formatSingleAttribute(attribute: SearchResultSetItemAttribute): void {
        attribute.valueFormatted = this.formatValue(attribute);

        if (attribute.valueHighlighted === undefined || attribute.valueHighlighted?.length === 0) {
            attribute.valueHighlighted = attribute.valueFormatted;
            if (attribute.isHighlighted) {
                // add client-side highlighted value
                attribute.valueHighlighted = "<b>" + attribute.valueHighlighted + "</b>";
            }
        }
    }

    private formatValue(attribute: SearchResultSetItemAttribute): string {
        if (typeof attribute?.valueFormatted === "string") {
            return attribute.valueFormatted;
        }

        return this.formatValueByUI5(attribute);
    }

    private formatValueByUI5(attribute: SearchResultSetItemAttribute): string {
        try {
            let formattedValue = "";
            let date = undefined;
            switch (attribute.metadata.type) {
                case AttributeType.Integer:
                    formattedValue = this.ui5NumberFormat.getIntegerInstance().format(attribute.value);
                    break;

                case AttributeType.Double:
                    formattedValue = this.ui5NumberFormat.getFloatInstance().format(attribute.value);
                    break;

                case AttributeType.Timestamp:
                    // format: UTC date object -> time stamp string in time zone
                    formattedValue = "";

                    date = attribute.value;
                    if (date instanceof Date && !isNaN(date.getTime())) {
                        formattedValue = this.ui5DateFormat.getDateTimeInstance().format(date);
                    }

                    // attribute.value:                         formattedValue:
                    // null                                     -> ""
                    // undefined                                -> ""
                    // ""                                       -> ""
                    // new Date("2018-12-33T23:00:00.0000000Z") -> ""
                    // new Date("2018-03-22T23:00:00.0000000Z") -> "2018.03.23, 00:00:00"
                    // new Date("2018-03-22T23:00:00.000000Z")) -> "2018.03.23, 00:00:00"
                    // new Date("2018-03-22,23:00:00.000"))     -> "2018.03.22, 23:00:00"
                    // new Date("2018-03-2223:00:00.000000Z"))  -> ""
                    break;

                case AttributeType.Date:
                    // format: "YYYY/MM/DD" -> "DD.MM.YYYY" in UTC
                    formattedValue = "";

                    if (typeof attribute.value === "string") {
                        date = new Date(attribute.value.replace(/\//g, "-")); // "YYYY-MM-DD" is ISO 8601 format standard, "YYYY/MM/DD" NOT
                        // new Date("2018-12-31") = new Date("2018-12-31T00:00:00.0000000Z")
                        if (date instanceof Date && !isNaN(date.getTime())) {
                            formattedValue = this.ui5DateFormat.getDateInstance({ UTC: true }).format(date);
                        }
                    }

                    // attribute.value:                         formattedValue:
                    // null                                     -> ""
                    // undefined                                -> ""
                    // ""                                       -> ""
                    // "2018-02-22"                             -> "2018.02.22"
                    // "2018-02-2"                              -> "2018.02.01"
                    // "2018-02-42"                             -> ""
                    // "18-02-42"                               -> ""
                    break;

                case AttributeType.Time:
                    // format: "hh:mm:ss" -> "hh.mm.ss AM" in UTC
                    formattedValue = "";

                    if (typeof attribute.value === "string") {
                        date = new Date("1970-01-01T" + attribute.value + ".0000000Z");
                        if (date instanceof Date && !isNaN(date.getTime())) {
                            formattedValue = this.ui5DateFormat.getTimeInstance({ UTC: true }).format(date);
                        }
                    }

                    // attribute.value:                         formattedValue:
                    // null                                     -> ""
                    // undefined                                -> ""
                    // ""                                       -> ""
                    // "13:42:59"                               -> "13:42:59"
                    // "33:42:59"                               -> ""
                    break;

                default:
                    formattedValue = stringifyValue(attribute?.value);
            }
            return formattedValue;
        } catch (error) {
            this.log.warn("Error in formatting value: " + error);
            return stringifyValue(attribute?.value);
        }
    }

    private formatValueByPlainJS(attribute: SearchResultSetItemAttribute): string {
        return stringifyValue(attribute.value);
        // stringifyValue convert value to string by checking typeof, NOT metadata type
        // value could have different type from metadata type due to server mistake
    }
}
