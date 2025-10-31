/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["./Util", "../../sina/ComplexCondition", "../../sina/SimpleCondition"], function (___Util, ____sina_ComplexCondition, ____sina_SimpleCondition) {
  "use strict";

  const formatRawValue = ___Util["formatRawValue"];
  const getMatchedStringValues = ___Util["getMatchedStringValues"];
  const isValuePairMatched = ___Util["isValuePairMatched"];
  const readFile = ___Util["readFile"];
  const ComplexCondition = ____sina_ComplexCondition["ComplexCondition"];
  const SimpleCondition = ____sina_SimpleCondition["SimpleCondition"];
  class RecordService {
    sina;
    dataSourceIds = [];
    records = [];
    constructor(sina, dataSourceIds) {
      this.sina = sina;
      this.dataSourceIds = dataSourceIds;
    }
    async loadRecords() {
      if (this.records.length > 0) {
        return;
      }
      for (const dataSourceId of this.dataSourceIds) {
        const csv = await readFile(`/resources/sap/esh/search/ui/sinaNexTS/providers/sample2/data/${dataSourceId}.csv`);
        this.records.push(...this.parseCsv2RecordSet(dataSourceId, csv));
      }
    }
    parseCsv2RecordSet(dataSourceId, csv) {
      const parsedCsv = this.parseCsv2ArraySet(csv);
      const attributeIds = parsedCsv[0]; // header
      const records = [];
      for (let index = 1; index < parsedCsv.length; index++) {
        const values = parsedCsv[index];
        const valueMap = this.createAttributeValueMap(dataSourceId, attributeIds, values);
        const record = {
          id: `${dataSourceId}_${index}`,
          dataSourceId: dataSourceId,
          valueMap: valueMap,
          rawValues: Object.values(valueMap).map(value => value.rawValue),
          stringValues: Object.values(valueMap).map(value => value.stringValue)
        };
        records.push(record);
      }
      return records;
    }
    parseCsv2ArraySet(csv) {
      /* 
      input: '"FIRST_NAME","LAST_NAME", ...\n"Sally","Spring", ...\n"John","Doe", ...'
      output: [["FIRST_NAME", "LAST_NAME", ...], ["Sally", "Spring", ...], ["John", "Doe", ...]]
       */
      const rows = csv.split("\n").filter(l => l.trim() !== "").map(row => {
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
    createAttributeValueMap(dataSourceId, attributeIds, stringValues) {
      const valueMap = {};
      for (let i = 0; i < attributeIds.length; i++) {
        const attributeId = attributeIds[i];
        const sValue = stringValues[i];
        try {
          const type = this.sina.getDataSource(dataSourceId).getAttributeMetadata(attributeId).type;
          valueMap[attributeId] = {
            stringValue: sValue,
            rawValue: formatRawValue(sValue, type)
          };
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
          valueMap[attributeId] = {
            stringValue: sValue,
            rawValue: sValue
          };
        }
      }

      // insert default values for single attributes not present in CSV
      const attributesMetadata = this.sina.getDataSource(dataSourceId).attributesMetadata;
      for (const attributeMetadata of attributesMetadata) {
        if (valueMap[attributeMetadata.id] === undefined && attributeMetadata.type !== "Group") {
          valueMap[attributeMetadata.id] = {
            stringValue: "default attribute value",
            rawValue: formatRawValue("default attribute value", attributeMetadata.type) // formatRawValue is able to create default value of different types
          };
        }
      }
      return valueMap;
    }
    getRecordsByDataSourceId(dataSourceId, records) {
      let recordSet = [];
      if (records) {
        recordSet = records;
      } else {
        recordSet = this.records;
      }
      return recordSet.filter(record => record.dataSourceId === dataSourceId);
    }
    getResponse(query) {
      let results = [];
      const matchedRecords = [];
      const searchTerm = query.filter.searchTerm;
      const searchedDataSourceIds = query.filter.dataSource.id !== "All" ? [query.filter.dataSource.id] : this.dataSourceIds;
      for (const record of this.records) {
        if (searchedDataSourceIds.includes(record.dataSourceId) && getMatchedStringValues(record.stringValues, searchTerm).length > 0) {
          matchedRecords.push(record);
        }
      }
      if (query.filter.rootCondition instanceof ComplexCondition && query.filter.rootCondition.conditions.length > 0) {
        // Query has ComplexCondition
        results = this.getRecordsByConditions(matchedRecords, query.filter.rootCondition);
      } else if (query.filter.rootCondition instanceof SimpleCondition) {
        // Query has SimpleCondition
        results = this.getRecordsBySimpleCondition(matchedRecords, {
          attributeId: query.filter.rootCondition.attribute,
          rawValue: query.filter.rootCondition.value,
          operator: query.filter.rootCondition.operator
        });
      } else {
        // Query has no Condition
        results = matchedRecords;
      }
      return {
        results: results,
        resultsToDisplay: this.getDisplayedRecords(results, query),
        totalCount: results.length
      };
    }
    getRecordsByConditions(records, condition) {
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
          operator: condition.operator
        });
      }
    }
    getRecordsBySimpleCondition(records, condition) {
      try {
        return records.filter(record => {
          const attributeRawValue = record.valueMap[condition.attributeId].rawValue;
          return isValuePairMatched(attributeRawValue, condition.rawValue, condition.operator);
        });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        return [];
      }
    }
    intersectRecords(records1, records2) {
      return records1.filter(r1 => records2.some(r2 => r1.id === r2.id));
    }
    uniteRecords(records1, records2) {
      const record1Ids = new Set(records1.map(r1 => r1.id)); // Set of IDs for faster lookups
      return records1.concat(records2.filter(r2 => !record1Ids.has(r2.id)));
    }
    getDisplayedRecords(records, query) {
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
    sortRecords(records, attributeId, sort) {
      return records.sort((r1, r2) => {
        const v1 = r1.valueMap[attributeId].rawValue;
        const v2 = r2.valueMap[attributeId].rawValue;
        if (sort === "Descending") {
          if (typeof v1 === "string" && typeof v2 === "string") {
            return v2.localeCompare(v1);
          }
          if (typeof v1 === "number" && typeof v2 === "number") {
            return v2 - v1;
          }
          if (typeof v1 === "boolean" && typeof v2 === "boolean") {
            return v2.toString().localeCompare(v1.toString());
          }
          if (v1 instanceof Date && v2 instanceof Date) {
            return v2.getTime() / 1000 - v1.getTime() / 1000;
          }
          return 1;
        } else {
          if (typeof v1 === "string" && typeof v2 === "string") {
            return v1.localeCompare(v2);
          }
          if (typeof v1 === "number" && typeof v2 === "number") {
            return v1 - v2;
          }
          if (typeof v1 === "boolean" && typeof v2 === "boolean") {
            return v1.toString().localeCompare(v2.toString());
          }
          if (v1 instanceof Date && v2 instanceof Date) {
            return v1.getTime() / 1000 - v2.getTime() / 1000;
          }
          return 1;
        }
      });
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.RecordService = RecordService;
  return __exports;
});
//# sourceMappingURL=RecordService-dbg.js.map
