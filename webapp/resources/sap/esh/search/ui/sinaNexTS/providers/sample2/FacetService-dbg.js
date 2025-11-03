/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["../../sina/FacetType", "../../sina/AttributeType", "./Util"], function (____sina_FacetType, ____sina_AttributeType, ___Util) {
  "use strict";

  const FacetType = ____sina_FacetType["FacetType"];
  const AttributeType = ____sina_AttributeType["AttributeType"];
  const format10Power = ___Util["format10Power"];
  class FacetService {
    sina;
    dataSourceIds = [];
    constructor(sina, dataSourceIds, searchEngine) {
      this.searchEngine = searchEngine;
      this.sina = sina;
      this.dataSourceIds = dataSourceIds;
    }
    createFacetsByDataSourceId(dataSourceId, records) {
      if (records.length === 0) {
        return undefined;
      }
      if (dataSourceId === "All") {
        return this.createDataSourceFacetSet(records);
      } else {
        const attributes = this.sina.getDataSource(dataSourceId).attributesMetadata;
        const facetAttributes = attributes.filter(attribute => attribute.usage.Facet !== undefined);
        const facetAttributesSorted = facetAttributes.sort((a, b) => (a.usage.Facet.displayOrder || 0) - (b.usage.Facet.displayOrder || 0));
        return this.createAttributeFacetSet(records, facetAttributesSorted, 5);
      }
    }
    createDataSourceFacetSet(records) {
      const facetSet = {
        dataSourceId: "All",
        facets: []
      };
      const facet = {
        id: "DataSource",
        label: "Data Sources",
        type: FacetType.DataSource,
        position: 0,
        items: []
      };
      const dataSources = this.sina.dataSources.filter(ds => ds.type === "BusinessObject");
      const recordService = this.searchEngine.recordService;
      for (const ds of dataSources) {
        facet.items.push({
          description: ds.label,
          count: recordService.getRecordsByDataSourceId(ds.id, records).length,
          rawValueLow: ds.id,
          rawValueHigh: "",
          stringValueLow: ds.label,
          stringValueHigh: ""
          // type: "View",
        });
      }
      facetSet.facets.push(facet);
      return facetSet;
    }
    createAttributeFacetSet(records, facetAttributes, top) {
      if (records.length === 0) {
        return undefined;
      }
      const dataSourceId = records[0].dataSourceId;
      const facetSet = {
        dataSourceId: dataSourceId,
        facets: []
      };
      for (const attribute of facetAttributes ? facetAttributes : []) {
        const facet = this.createAttributeFacet(records, attribute, top);
        if (facet) {
          facetSet.facets.push(facet);
        }
      }
      return facetSet;
    }
    createAttributeFacet(records, attribute, top) {
      if (attribute.usage?.Facet === undefined && attribute.usage?.AdvancedSearch === undefined) {
        return undefined;
      }

      // facet attribute may not be found in results, facet items and counts are not available
      if (records[0]?.valueMap[attribute.id] === undefined) {
        return undefined;
      }
      const facet = {
        id: attribute.id,
        label: attribute.label,
        type: FacetType.Chart,
        position: attribute.usage?.Facet?.displayOrder || attribute.usage?.AdvancedSearch?.displayOrder || 0,
        items: [],
        facetTotalCount: 99999 // ToDo: Fill with total count of all facet items -> see getDataForPieChart of SearchFacetPieChart.ts
      };
      let itemsData = [];

      // create attribute facet according to attribute type
      switch (attribute.type) {
        case AttributeType.String:
          itemsData = this.getPointItemsData(records, attribute.id, top);
          for (const item of itemsData) {
            facet.items.push({
              description: item.lowStringValue,
              count: item.count,
              rawValueLow: item.lowRawValue,
              rawValueHigh: "",
              stringValueLow: item.lowStringValue,
              stringValueHigh: ""
              // type: "AttributeValue",
            });
          }
          break;
        case AttributeType.Double:
        case AttributeType.Integer:
          itemsData = this.getNumberRangeItemsData(records, attribute.id, top);
          for (const item of itemsData) {
            facet.items.push({
              description: item.lowStringValue + " ... " + item.highStringValue,
              count: item.count,
              rawValueLow: item.lowRawValue,
              rawValueHigh: item.highRawValue,
              stringValueLow: item.lowStringValue,
              stringValueHigh: item.highStringValue
              // type: "AttributeValue",
            });
          }
          break;
        case AttributeType.Timestamp:
        case AttributeType.Date:
        case AttributeType.Time:
          itemsData = this.getDateRangeItemsData(records, attribute.id, top);
          for (const item of itemsData) {
            facet.items.push({
              description: item.lowStringValue,
              count: item.count,
              rawValueLow: item.lowRawValue,
              rawValueHigh: item.highRawValue,
              stringValueLow: item.lowStringValue,
              stringValueHigh: item.highStringValue
              // type: "AttributeValue",
            });
          }
          break;
        default:
        // case AttributeType.ImageUrl
        // case AttributeType.ImageBlob
        // case AttributeType.GeoJson
        // case AttributeType.Group
        // case AttributeType.INAV2_SearchTerms
        // case AttributeType.INAV2_SuggestionTerms
        // do nothing
      }
      return facet.items.length > 0 ? facet : undefined;
    }
    getPointItemsData(records, attributeId, top) {
      const map = new Map();
      const facetItemsData = [];

      // 1. create hash map of attribute value and count
      for (const record of records) {
        const value = record?.valueMap[attributeId]?.stringValue;
        if (map.get(value) === undefined) {
          map.set(value, 1);
        } else {
          map.set(value, map.get(value) + 1);
        }
      }

      // 2. set facet items data
      for (const [value, count] of map) {
        if (count > 0) {
          facetItemsData.push({
            lowStringValue: value,
            lowRawValue: value,
            highStringValue: undefined,
            highRawValue: undefined,
            count: count
          });
        }
      }

      // 3. sort facet items data by count descending, and limit to top
      if (Number.isInteger(top) && top > 0) {
        return facetItemsData.sort((a, b) => b.count - a.count).slice(0, top);
      } else {
        return facetItemsData.sort((a, b) => b.count - a.count);
      }
    }
    getNumberRangeItemsData(records, attributeId, top) {
      const facetItemsData = [];
      const numberOfRanges = top || 100;

      // 1. sort records by attribute value, records with same attribute value following each other
      const sortedRecords = this.searchEngine.recordService.sortRecords(records, attributeId, "Ascending");

      // 2. get minimal and maximal attribute raw value, and range size
      const minValue = sortedRecords[0].valueMap[attributeId].rawValue;
      const maxValue = sortedRecords[sortedRecords.length - 1].valueMap[attributeId].rawValue;
      const min10Power = format10Power(minValue, false);
      const range = format10Power((maxValue - minValue) / numberOfRanges, true);

      // 3. calculate range items data
      for (let i = 0; i < numberOfRanges; i++) {
        const startValue = min10Power + i * range;
        const endValue = startValue + range; // last item end Value is max attribute value

        const rds = records.filter(record => {
          const value = record.valueMap[attributeId].rawValue;
          return value >= startValue && value < endValue;
        });
        if (rds.length > 0) {
          facetItemsData.push({
            lowStringValue: startValue.toFixed(2).toString(),
            lowRawValue: startValue,
            highStringValue: endValue.toFixed(2).toString(),
            highRawValue: endValue,
            count: rds.length
          });
        }
      }

      // 4. limit to top, don't sort by count
      if (Number.isInteger(top) && top > 0) {
        return facetItemsData.slice(0, top);
      } else {
        return facetItemsData;
      }
    }
    getDateRangeItemsData(records, attributeId, top) {
      const facetItemsData = [];

      // 1. define possible date ranges
      const now = new Date();
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      const futureStart = new Date(todayEnd.getTime() + 1);
      const last7DaysStart = new Date(new Date(todayEnd.getTime() - 6 * 24 * 60 * 60 * 1000).setHours(0, 0, 0, 0));
      const last30DaysStart = new Date(new Date(todayEnd.getTime() - 29 * 24 * 60 * 60 * 1000).setHours(0, 0, 0, 0));
      const thisYearStart = new Date(todayEnd.getFullYear(), 0, 1, 0, 0, 0, 0);
      const thisYearEnd = new Date(new Date(todayEnd.getFullYear() + 1, 0, 1).getTime() - 1);
      const lastYearStart = new Date(todayEnd.getFullYear() - 1, 0, 1, 0, 0, 0, 0);
      const lastYearEnd = new Date(new Date(todayEnd.getFullYear(), 0, 1).getTime() - 1);
      const last3YearStart = new Date(todayEnd.getFullYear() - 3, 0, 1, 0, 0, 0, 0);
      const last5YearStart = new Date(todayEnd.getFullYear() - 5, 0, 1, 0, 0, 0, 0);
      const ranges = [{
        label: "Future",
        startValue: futureStart,
        endValue: new Date(8.64e15)
      },
      // futurist date object
      {
        label: "Last 7 Days",
        startValue: last7DaysStart,
        endValue: todayEnd
      }, {
        label: "Last 30 Days",
        startValue: last30DaysStart,
        endValue: todayEnd
      }, {
        label: "This Year",
        startValue: thisYearStart,
        endValue: thisYearEnd
      }, {
        label: "Last Year",
        startValue: lastYearStart,
        endValue: lastYearEnd
      }, {
        label: "Last 3 Years",
        startValue: last3YearStart,
        endValue: todayEnd
      }, {
        label: "Last 5 Years",
        startValue: last5YearStart,
        endValue: todayEnd
      }, {
        label: "Older Than 5 Years",
        startValue: new Date(-8640000000000000),
        // earliest date object
        endValue: new Date(last5YearStart.getTime() - 1)
      }];

      // 2. calculate range items data
      for (let i = 0; i < ranges.length; i++) {
        const startValue = ranges[i].startValue;
        const endValue = ranges[i].endValue;

        // const rds = sortedRecords.filter((record) => {
        const rds = records.filter(record => {
          const value = record.valueMap[attributeId].rawValue;
          if (startValue != undefined) {
            return value >= startValue && value <= endValue;
          } else {
            return value <= endValue;
          }
        });
        if (rds.length > 0) {
          facetItemsData.push({
            lowStringValue: ranges[i].label,
            lowRawValue: startValue,
            highStringValue: undefined,
            highRawValue: endValue,
            count: rds.length
          });
        }
      }

      // 3. limit to top, Don't sort by count
      if (Number.isInteger(top) && top > 0) {
        return facetItemsData.slice(0, top);
      } else {
        return facetItemsData;
      }
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.FacetService = FacetService;
  return __exports;
});
//# sourceMappingURL=FacetService-dbg.js.map
