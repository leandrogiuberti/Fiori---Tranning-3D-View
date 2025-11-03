/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { Sina } from "../../sina/Sina";
import { Value as RawValue } from "../../sina/types";
import { formatRawValue, getMatchedStringValues, isValuePairMatched, readFile } from "./Util";
import { Query } from "../../sina/Query";
import { ComparisonOperator } from "../../sina/ComparisonOperator";
import { ComplexCondition } from "../../sina/ComplexCondition";
import { SimpleCondition } from "../../sina/SimpleCondition";

interface SimpleConditionData {
    attributeId: string;
    // stringValue: string;
    rawValue: RawValue; // may need for filtering
    operator: string;
}
export interface RecordResponse {
    results: Record[]; // total results
    resultsToDisplay: Record[]; // results with top, skip, sort
    totalCount: number;
}

export interface StringRawValuePair {
    stringValue: string;
    rawValue: RawValue;
}

export interface AttributeValueMap {
    [key: string]: StringRawValuePair;
}

export interface Record {
    id: string; // example 'purchaseOrders_1', used for intersect/unite records
    dataSourceId: string;
    valueMap: AttributeValueMap;
    rawValues: RawValue[];
    stringValues: string[];
}

export class RecordService {
    sina: Sina;
    dataSourceIds = [] as string[];
    records = [] as Record[];

    constructor(sina: Sina, dataSourceIds: string[]) {
        this.sina = sina;
        this.dataSourceIds = dataSourceIds;
    }

    async loadRecords(): Promise<void> {
        if (this.records.length > 0) {
            return;
        }

        for (const dataSourceId of this.dataSourceIds) {
            const csv = await readFile(
                `/resources/sap/esh/search/ui/sinaNexTS/providers/sample2/data/${dataSourceId}.csv`
            );
            this.records.push(...this.parseCsv2RecordSet(dataSourceId, csv));
        }
    }

    private parseCsv2RecordSet(dataSourceId: string, csv: string): Record[] {
        const parsedCsv = this.parseCsv2ArraySet(csv);
        const attributeIds = parsedCsv[0]; // header
        const records: Record[] = [];

        for (let index = 1; index < parsedCsv.length; index++) {
            const values = parsedCsv[index];
            const valueMap = this.createAttributeValueMap(dataSourceId, attributeIds, values);

            const record = {
                id: `${dataSourceId}_${index}`,
                dataSourceId: dataSourceId,
                valueMap: valueMap,
                rawValues: Object.values(valueMap).map((value) => value.rawValue),
                stringValues: Object.values(valueMap).map((value) => value.stringValue),
            } as Record;

            records.push(record);
        }
        return records;
    }

    private parseCsv2ArraySet(csv: string): string[][] {
        /* 
        input: '"FIRST_NAME","LAST_NAME", ...\n"Sally","Spring", ...\n"John","Doe", ...'
        output: [["FIRST_NAME", "LAST_NAME", ...], ["Sally", "Spring", ...], ["John", "Doe", ...]]
         */
        const rows = csv
            .split("\n")
            .filter((l) => l.trim() !== "")
            .map((row) => {
                const cells = [];
                let cell = "";
                let inQuotes = false;

                for (const char of row) {
                    if (char === '"') {
                        inQuotes = !inQuotes;
                    } else if (char === "," && !inQuotes) {
                        cells.push(cell);
                        cell = "";
                    } else {
                        cell += char;
                    }
                }

                cells.push(cell);
                return cells;
            });
        return rows;
    }

    private createAttributeValueMap(
        dataSourceId: string,
        attributeIds: string[],
        stringValues: string[]
    ): AttributeValueMap {
        const valueMap = {};

        for (let i = 0; i < attributeIds.length; i++) {
            const attributeId = attributeIds[i];
            const sValue = stringValues[i];
            try {
                const type = this.sina.getDataSource(dataSourceId).getAttributeMetadata(attributeId).type;
                valueMap[attributeId] = {
                    stringValue: sValue,
                    rawValue: formatRawValue(sValue, type),
                };
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (e) {
                valueMap[attributeId] = {
                    stringValue: sValue,
                    rawValue: sValue,
                };
            }
        }

        // insert default values for single attributes not present in CSV
        const attributesMetadata = this.sina.getDataSource(dataSourceId).attributesMetadata;
        for (const attributeMetadata of attributesMetadata) {
            if (valueMap[attributeMetadata.id] === undefined && attributeMetadata.type !== "Group") {
                valueMap[attributeMetadata.id] = {
                    stringValue: "default attribute value",
                    rawValue: formatRawValue("default attribute value", attributeMetadata.type), // formatRawValue is able to create default value of different types
                };
            }
        }

        return valueMap;
    }

    getRecordsByDataSourceId(dataSourceId: string, records?: Record[]): Record[] {
        let recordSet = [];
        if (records) {
            recordSet = records;
        } else {
            recordSet = this.records;
        }
        return recordSet.filter((record) => record.dataSourceId === dataSourceId);
    }

    getResponse(query: Query): RecordResponse {
        let results = [];
        const matchedRecords = [];
        const searchTerm = query.filter.searchTerm;
        const searchedDataSourceIds =
            query.filter.dataSource.id !== "All" ? [query.filter.dataSource.id] : this.dataSourceIds;

        for (const record of this.records) {
            if (
                searchedDataSourceIds.includes(record.dataSourceId) &&
                getMatchedStringValues(record.stringValues, searchTerm).length > 0
            ) {
                matchedRecords.push(record);
            }
        }

        if (
            query.filter.rootCondition instanceof ComplexCondition &&
            query.filter.rootCondition.conditions.length > 0
        ) {
            // Query has ComplexCondition
            results = this.getRecordsByConditions(matchedRecords, query.filter.rootCondition);
        } else if (query.filter.rootCondition instanceof SimpleCondition) {
            // Query has SimpleCondition
            results = this.getRecordsBySimpleCondition(matchedRecords, {
                attributeId: query.filter.rootCondition.attribute,
                rawValue: query.filter.rootCondition.value,
                operator: query.filter.rootCondition.operator,
            });
        } else {
            // Query has no Condition
            results = matchedRecords;
        }

        return {
            results: results,
            resultsToDisplay: this.getDisplayedRecords(results, query),
            totalCount: results.length,
        };
    }

    getRecordsByConditions(records: Record[], condition: SimpleCondition | ComplexCondition): Record[] {
        // recursive filter records by condition object
        // complex condition object has properties: type = "Complex", conditions (array of child conditions), and operator = "And" or "Or"
        // simple condition object has properties: type = "Simple", attribute (string), value (string), and operator = "Eq", "Gt", "Lt", etc.
        // if complex condition has operator "And", intersectRecords of getRecordsByConditions its child conditions
        // if complex condition has operator "Or", uniteRecords of getRecordsByConditions child conditions
        // if simple condition, getRecordsBySimpleCondition condition

        if (condition instanceof ComplexCondition) {
            let recordsCondition0 = this.getRecordsByConditions(records, condition.conditions[0]);

            for (let i = 1; i < condition.conditions.length; i++) {
                const recordsCondition1 = this.getRecordsByConditions(records, condition.conditions[i]);
                if (condition.operator === "And") {
                    recordsCondition0 = this.intersectRecords(recordsCondition0, recordsCondition1);
                } else if (condition.operator === "Or") {
                    recordsCondition0 = this.uniteRecords(recordsCondition0, recordsCondition1);
                }
            }

            return recordsCondition0;
        } else {
            return this.getRecordsBySimpleCondition(records, {
                attributeId: condition.attribute,
                rawValue: condition.value,
                operator: condition.operator,
            } as SimpleConditionData);
        }
    }

    private getRecordsBySimpleCondition(records: Record[], condition: SimpleConditionData): Record[] {
        try {
            return records.filter((record) => {
                const attributeRawValue = record.valueMap[condition.attributeId].rawValue;
                return isValuePairMatched(
                    attributeRawValue,
                    condition.rawValue,
                    condition.operator as ComparisonOperator
                );
            });
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
            return [];
        }
    }

    private intersectRecords(records1: Record[], records2: Record[]): Record[] {
        return records1.filter((r1) => records2.some((r2) => r1.id === r2.id));
    }

    private uniteRecords(records1: Record[], records2: Record[]): Record[] {
        const record1Ids = new Set(records1.map((r1) => r1.id)); // Set of IDs for faster lookups
        return records1.concat(records2.filter((r2) => !record1Ids.has(r2.id)));
    }

    private getDisplayedRecords(records: Record[], query: Query): Record[] {
        let recordsDisplayed = records;

        // order records
        const sortAttributeId = query?.sortOrder[0]?.id;
        const order = query?.sortOrder[0]?.order;
        if (sortAttributeId && order) {
            recordsDisplayed = this.sortRecords(recordsDisplayed, sortAttributeId, order);
        }

        // set top records
        if (query.top) {
            recordsDisplayed = recordsDisplayed.slice(0, query.top);
        }

        // set skip records
        if (query.skip) {
            recordsDisplayed = recordsDisplayed.slice(query.skip);
        }
        return recordsDisplayed;
    }

    sortRecords(records: Record[], attributeId: string, sort?: "Ascending" | "Descending"): Record[] {
        return records.sort((r1, r2) => {
            const v1 = r1.valueMap[attributeId].rawValue;
            const v2 = r2.valueMap[attributeId].rawValue;

            if (sort === "Descending") {
                if (typeof v1 === "string" && typeof v2 === "string") {
                    return (v2 as string).localeCompare(v1 as string);
                }
                if (typeof v1 === "number" && typeof v2 === "number") {
                    return (v2 as number) - (v1 as number);
                }
                if (typeof v1 === "boolean" && typeof v2 === "boolean") {
                    return (v2.toString() as string).localeCompare(v1.toString() as string);
                }
                if (v1 instanceof Date && v2 instanceof Date) {
                    return (v2 as Date).getTime() / 1000 - (v1 as Date).getTime() / 1000;
                }
                return 1;
            } else {
                if (typeof v1 === "string" && typeof v2 === "string") {
                    return (v1 as string).localeCompare(v2 as string);
                }
                if (typeof v1 === "number" && typeof v2 === "number") {
                    return (v1 as number) - (v2 as number);
                }
                if (typeof v1 === "boolean" && typeof v2 === "boolean") {
                    return (v1.toString() as string).localeCompare(v2.toString() as string);
                }
                if (v1 instanceof Date && v2 instanceof Date) {
                    return (v1 as Date).getTime() / 1000 - (v2 as Date).getTime() / 1000;
                }
                return 1;
            }
        });
    }
}
