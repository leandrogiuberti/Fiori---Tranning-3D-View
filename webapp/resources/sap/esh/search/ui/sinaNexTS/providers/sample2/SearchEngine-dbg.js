/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["../../sina/SearchQuery", "./DataSourceService", "../../sina/FacetType", "../../sina/SuggestionType", "./RecordService", "./FacetService", "./Util", "../../sina/ComparisonOperator", "../../sina/LogicalOperator"], function (____sina_SearchQuery, ___DataSourceService, ____sina_FacetType, ____sina_SuggestionType, ___RecordService, ___FacetService, ___Util, ____sina_ComparisonOperator, ____sina_LogicalOperator) {
  "use strict";

  const SearchQuery = ____sina_SearchQuery["SearchQuery"];
  const DataSourceService = ___DataSourceService["DataSourceService"];
  const FacetType = ____sina_FacetType["FacetType"];
  const SuggestionType = ____sina_SuggestionType["SuggestionType"];
  const RecordService = ___RecordService["RecordService"];
  const FacetService = ___FacetService["FacetService"];
  const getMatchedStringValues = ___Util["getMatchedStringValues"];
  const formatHighlightedValue = ___Util["formatHighlightedValue"];
  const isValuePairMatched = ___Util["isValuePairMatched"];
  const isStarString = ___Util["isStarString"];
  const ComparisonOperator = ____sina_ComparisonOperator["ComparisonOperator"];
  const LogicalOperator = ____sina_LogicalOperator["LogicalOperator"];
  class SearchEngine {
    dataSourceService;
    recordService;
    facetService;
    historySearchTerms = [];
    sina;
    dataSourceIds;
    constructor(sina, dataSourceIds) {
      this.sina = sina;
      this.dataSourceIds = dataSourceIds;
      // typically in constructor sina is undefined, so initialize it in initAsync
    }
    async initAsync(sina) {
      this.sina = sina ?? this.sina;
      this.dataSourceService = new DataSourceService(this.sina, this.dataSourceIds);
      this.recordService = new RecordService(this.sina, this.dataSourceIds);
      this.facetService = new FacetService(this.sina, this.dataSourceIds, this);
      await this.loadData();
    }
    async loadData() {
      await this.dataSourceService.loadDataSources();
      await this.recordService.loadRecords();
    }
    async search(query) {
      await this.recordService.loadRecords();

      // in memory search term history
      if (!isStarString(query.filter.searchTerm) && !this.historySearchTerms.includes(query.filter.searchTerm)) {
        this.historySearchTerms.push(query.filter.searchTerm);
      }
      const response = this.recordService.getResponse(query);
      return await this.createSinaSearchResultSet(query, response);
    }
    async createSinaSearchResultSet(query, response) {
      const searchResultSetItems = [];
      for (const record of response.resultsToDisplay) {
        searchResultSetItems.push(await this.createSinaSearchResultSetItem(query, record));
      }
      const facets = await this.createSinaFacets(query, response);
      return this.sina._createSearchResultSet({
        query: query,
        title: "Search Results",
        items: searchResultSetItems,
        facets: facets,
        totalCount: response.totalCount
      });
    }
    async createSinaSearchResultSetItem(query, record) {
      const attributes = [];
      const titleAttributes = [];
      const detailAttributes = [];

      // single attributes
      const attributesMetadata = this.dataSourceService.getDataSourceById(record.dataSourceId).attributesMetadata;
      attributesMetadata.forEach(attributeMetadata => {
        const resultSetItemAttribute = this.createSinaSearchResultSetItemSingleAttribute(attributeMetadata, record, query);
        if (resultSetItemAttribute !== undefined) {
          attributes.push(resultSetItemAttribute);
          if ("Title" in resultSetItemAttribute.metadata.usage) {
            titleAttributes.push(resultSetItemAttribute);
          }
          if ("Detail" in resultSetItemAttribute.metadata.usage) {
            detailAttributes.push(resultSetItemAttribute);
          }
        }
      });

      // group attributes -> postParseResultSetItem()

      // navigation target
      const defaultNavigationTarget = this.createSinaNavigationTarget(record);
      const searchResultSetItem = this.sina._createSearchResultSetItem({
        dataSource: this.sina.getDataSource(record.dataSourceId),
        attributes: attributes,
        titleAttributes: titleAttributes,
        detailAttributes: detailAttributes,
        defaultNavigationTarget: defaultNavigationTarget,
        navigationTargets: []
      });
      searchResultSetItem._private.allAttributesMap = attributes.reduce((map, attr) => {
        map[attr.id] = attr;
        return map;
      }, {}); // needed for postParseResultSetItem

      const itemPostParser = this.sina._createItemPostParser({
        searchResultSetItem: searchResultSetItem
      });
      return await itemPostParser.postParseResultSetItem();
    }
    createSinaSearchResultSetItemSingleAttribute(singleAttributeMetadata, record, query) {
      const sValue = record.valueMap[singleAttributeMetadata.id]?.stringValue;
      const rValue = record.valueMap[singleAttributeMetadata.id]?.rawValue;
      if (sValue === undefined) {
        return undefined;
      }
      const isHighlighted = isValuePairMatched(sValue, query.filter.searchTerm, ComparisonOperator.Co);
      const attribute = this.sina._createSearchResultSetItemAttribute({
        id: singleAttributeMetadata.id,
        label: singleAttributeMetadata.label,
        metadata: singleAttributeMetadata,
        value: rValue,
        valueFormatted: sValue,
        valueHighlighted: isHighlighted ? formatHighlightedValue(sValue, query.filter.searchTerm) : undefined,
        isHighlighted: isHighlighted,
        groups: []
      });
      return attribute;
    }
    createSinaNavigationTarget(record) {
      const ds = this.dataSourceService.getDataSourceById(record.dataSourceId);
      const template = ds.defaultNavigationTarget?.targetUrl || "";
      const urlPrefix = "https://sap.com?";
      const urlSuffix = template.replace(/{([^}]+)}/g, (match, attributeId) => record.valueMap[attributeId]?.stringValue || ""); // replace {AttributeId} by record attribute stringValue

      return this.sina.createNavigationTarget({
        text: ds.defaultNavigationTarget?.text,
        targetUrl: urlPrefix + urlSuffix,
        target: ds.defaultNavigationTarget?.target || "_self"
      });
    }
    async createSinaFacets(query, response) {
      const facetsSina = [];
      const facets = this.facetService.createFacetsByDataSourceId(query.filter.dataSource.id, response.results)?.facets;
      if (!facets) {
        return [];
      }
      for (let i = 0; i < facets.length; i++) {
        const facet = facets[i];
        if (facet.type === FacetType.DataSource) {
          facetsSina.push(this.createSinaDataSourceFacet(query, facet));
        } else {
          if (query.filter.dataSource.type === query.sina.DataSourceType.Category ||
          // ignore common attributes facets
          query.filter.dataSource.type === query.sina.DataSourceType.UserCategory // ignore attributes facets
          ) {
            continue;
          }
          facetsSina.push(this.createSinaChartFacet(query, facet));
        }
      }
      return Promise.all(facetsSina);
    }
    async createSinaDataSourceFacet(query, facet) {
      const dataSourceQuery = this.sina.createDataSourceQuery({
        dataSource: query.filter.dataSource,
        filter: query.filter.clone()
        // nlq: query.nlq,
      });
      const items = [];
      for (let i = 0; i < facet.items.length; i++) {
        const item = facet.items[i];
        // create filter (used when clicking on the item)
        let dataSource = this.sina.getDataSource(item.rawValueLow);
        if (!dataSource) {
          dataSource = this.sina.createDataSource({
            type: this.sina.DataSourceType.Category,
            id: item.rawValueLow,
            label: item.description
          });
        }
        items.push(this.sina._createDataSourceResultSetItem({
          dataSource: dataSource,
          dimensionValueFormatted: dataSource.labelPlural,
          measureValue: item.count,
          measureValueFormatted: item.count.toString()
        }));
      }
      const resultSet = this.sina._createDataSourceResultSet({
        title: query.filter.dataSource.label,
        items: items,
        query: dataSourceQuery,
        facetTotalCount: undefined
      });

      // init query with result set
      if (query instanceof SearchQuery) {
        dataSourceQuery._setResultSet(resultSet);
      }
      return Promise.resolve(resultSet);
    }
    createSinaChartFacet(query, facet) {
      const dataSource = this.sina.getDataSource(query.filter.dataSource.id);
      const attributeId = facet.id;
      const metadata = dataSource.getAttributeMetadata(attributeId);
      let chartQuery = query;
      if (query instanceof SearchQuery) {
        const filter = query.filter.clone();
        filter.setDataSource(dataSource); // relevant only for common attribute facets
        filter.setRootCondition(query.filter.rootCondition.clone()); // changing ds removes condition
        chartQuery = this.sina.createChartQuery({
          filter: filter,
          dimension: facet.id
          // nlq: query.nlq,
        });
      }
      const resultSet = this.sina._createChartResultSet({
        title: metadata.label,
        items: this.createSinaChartResultSetItems(query, facet),
        query: chartQuery,
        facetTotalCount: 99999 // ToDo: Fill with total count of all facet items -> see getDataForPieChart of SearchFacetPieChart.ts
      });

      // init query with result set
      if (query instanceof SearchQuery) {
        return chartQuery._setResultSet(resultSet);
      }
      return Promise.resolve(resultSet);
    }
    async chart(query) {
      await this.recordService.loadRecords();
      const dataSource = this.sina.getDataSource(query.filter.dataSource.id);
      const attributeId = query.dimension;
      const metadata = dataSource.getAttributeMetadata(attributeId);
      const response = this.recordService.getResponse(query);
      const facetSet = this.facetService.createAttributeFacetSet(response.results, [metadata], query.top);
      if (facetSet && facetSet.facets.length > 0) {
        return this.sina._createChartResultSet({
          title: metadata.label,
          items: this.createSinaChartResultSetItems(query, facetSet.facets[0]),
          query: query,
          facetTotalCount: 99999 // ToDo: Fill with total count of all facet items -> see getDataForPieChart of SearchFacetPieChart.ts
        });
      }
    }
    createSinaChartResultSetItems(query, facet) {
      // TODO:
      // Search = "Search",
      // Eq = "Eq",
      // Ne = "Ne", // not equal
      // Gt = "Gt",
      // Lt = "Lt",
      // Ge = "Ge",
      // Le = "Le",
      // Co = "Co", // Contains only
      // Bw = "Bw",
      // Ew = "Ew", // End with
      // ChildOf = "ChildOf",
      // DescendantOf = "DescendantOf",

      const items = [];
      for (let i = 0; i < facet.items.length; i++) {
        const item = facet.items[i];
        if (typeof item.rawValueHigh !== "string" && typeof item.rawValueLow !== "string") {
          // range facet item
          const conditions = [];
          conditions.push(this.sina.createSimpleCondition({
            attribute: facet.id,
            operator: ComparisonOperator.Ge,
            value: item.rawValueLow
            // isDynamicValue: isDynamicValueLow,
          }));
          conditions.push(this.sina.createSimpleCondition({
            attribute: facet.id,
            operator: ComparisonOperator.Le,
            value: item.rawValueHigh
            // isDynamicValue: isDynamicValueHigh,
          }));
          items.push(this.sina._createChartResultSetItem({
            filterCondition: this.sina.createComplexCondition({
              attributeLabel: facet.label,
              valueLabel: item.description,
              operator: LogicalOperator.And,
              conditions: conditions
            }),
            dimensionValueFormatted: item.description,
            measureValue: item.count,
            measureValueFormatted: item.stringValueLow
          }));
        } else {
          //single value facet item
          items.push(this.sina._createChartResultSetItem({
            filterCondition: this.sina.createSimpleCondition({
              attributeLabel: facet.label,
              attribute: facet.id,
              operator: ComparisonOperator.Eq,
              value: item.rawValueLow,
              valueLabel: item.description
              // value: isDynamicValue ? item.rawValueLow : typeConverter.odata2Sina(metadata.type, item.rawValueLow),
              // isDynamicValue: isDynamicValue,
            }),
            dimensionValueFormatted: item.description,
            measureValue: item.count,
            measureValueFormatted: item.stringValueLow
          }));
        }
      }
      return items;
    }
    async suggestion(query) {
      await this.recordService.loadRecords();
      let response;
      let suggestions = [];
      switch (query.types[0]) {
        case SuggestionType.DataSource:
          response = this.dataSourceService.getResponse(query);
          suggestions = await this.createSinaDataSourceSuggestions(query, response);
          break;
        case SuggestionType.SearchTerm:
          response = this.recordService.getResponse(query);
          suggestions = await this.createSinaSearchTermSuggestions(query, response);
          break;
        case SuggestionType.Object:
          response = this.recordService.getResponse(query);
          suggestions = await this.createSinaObjectSuggestions(query, response);
          break;
        default:
        // SuggestionType.SearchTermAI // not implemented
        // SearchTermAndDataSource // check back-end supporting
        // App Suggestions // create app suggestions without searchableContent service
      }
      return this.sina._createSuggestionResultSet({
        title: "Suggestions",
        query: query,
        items: suggestions
      });
    }
    async createSinaDataSourceSuggestions(query, response) {
      const suggestions = [];
      response.results.map(dataSource => {
        suggestions.push(this.sina._createDataSourceSuggestion({
          calculationMode: this.sina.SuggestionCalculationMode.Data,
          dataSource: dataSource,
          label: formatHighlightedValue(dataSource.labelPlural || dataSource.label, query.filter.searchTerm)
        }));
      });
      return suggestions;
    }
    async createSinaSearchTermSuggestions(query, response) {
      const suggestions = [];
      response.resultsToDisplay.forEach(record => {
        const filter = query.filter.clone();
        const dataSource = this.sina.getDataSource(record.dataSourceId);
        filter.setDataSource(dataSource);
        suggestions.push(this.sina._createSearchTermSuggestion({
          calculationMode: this.sina.SuggestionCalculationMode.Data,
          searchTerm: getMatchedStringValues(record.stringValues, query.filter.searchTerm)[0],
          filter: query.filter,
          label: formatHighlightedValue(getMatchedStringValues(record.stringValues, query.filter.searchTerm)[0], query.filter.searchTerm),
          childSuggestions: [this.sina._createSearchTermAndDataSourceSuggestion({
            calculationMode: this.sina.SuggestionCalculationMode.Data,
            searchTerm: getMatchedStringValues(record.stringValues, query.filter.searchTerm)[0],
            filter,
            dataSource,
            label: formatHighlightedValue(getMatchedStringValues(record.stringValues, query.filter.searchTerm)[0], query.filter.searchTerm)
          })]
        }));
      });

      // History Search Term Suggestions
      if (!isStarString(query.filter.searchTerm)) {
        getMatchedStringValues(this.historySearchTerms, query.filter.searchTerm).forEach(searchTerm => {
          suggestions.push(this.sina._createSearchTermSuggestion({
            calculationMode: this.sina.SuggestionCalculationMode.History,
            searchTerm: searchTerm,
            filter: query.filter,
            label: formatHighlightedValue(searchTerm, query.filter.searchTerm)
          }));
        });
      }
      return suggestions;
    }
    async createSinaObjectSuggestions(query, response) {
      const suggestions = [];
      for (const record of response.resultsToDisplay) {
        suggestions.push(this.sina._createObjectSuggestion({
          calculationMode: this.sina.SuggestionCalculationMode.Data,
          label: "",
          // ?
          // searchTerm: filter.searchTerm,
          // filter: filter,
          object: await this.createSinaSearchResultSetItem(query, record)
        }));
      }
      return suggestions;
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.SearchEngine = SearchEngine;
  return __exports;
});
//# sourceMappingURL=SearchEngine-dbg.js.map
