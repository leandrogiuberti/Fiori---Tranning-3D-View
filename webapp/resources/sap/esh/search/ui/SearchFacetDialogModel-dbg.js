/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["./i18n", "sap/m/MessageBox", "./SearchModel", "sap/ui/core/library", "./hierarchydynamic/SearchHierarchyDynamicFacet", "./SearchFacetDialogHelperDynamicHierarchy"], function (__i18n, MessageBox, __SearchModel, sap_ui_core_library, __SearchHierarchyDynamicFacet, ___SearchFacetDialogHelperDynamicHierarchy) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const i18n = _interopRequireDefault(__i18n);
  const SearchModel = _interopRequireDefault(__SearchModel);
  const TextDirection = sap_ui_core_library["TextDirection"];
  const SearchHierarchyDynamicFacet = _interopRequireDefault(__SearchHierarchyDynamicFacet);
  const createFilterFacetItemForDynamicHierarchy = ___SearchFacetDialogHelperDynamicHierarchy["createFilterFacetItemForDynamicHierarchy"];
  class SearchFacetDialogModel extends SearchModel {
    aFilters;
    chartQuery;
    searchModel;
    constructor(settings) {
      super({
        searchModel: settings.searchModel,
        configuration: settings.searchModel.config
      });
      this.searchModel = settings.searchModel;
      this.aFilters = [];
    }
    prepareFacetList() {
      const metaData = this.getDataSource();
      this.setProperty("/facetDialog", this.oFacetFormatter.getDialogFacetsFromMetaData(metaData, this));
      this.initialFillFiltersForDynamicHierarchyFacets();
    }
    initialFillFiltersForDynamicHierarchyFacets() {
      const filter = this.getProperty("/uiFilter");
      const facets = this.getProperty("/facetDialog");
      for (const facet of facets) {
        if (!(facet instanceof SearchHierarchyDynamicFacet)) {
          continue;
        }
        const conditions = filter.rootCondition.getAttributeConditions(facet.attributeId);
        for (const condition of conditions) {
          const simpleCondition = condition;
          const facetItem = createFilterFacetItemForDynamicHierarchy(facet, simpleCondition);
          this.aFilters.push(facetItem);
        }
      }
    }

    // properties: sAttribute, sBindingPath
    facetDialogSingleCall(properties) {
      this.chartQuery.dimension = properties.sAttribute;
      this.chartQuery.top = properties.sAttributeLimit;
      this.chartQuery.setNlq(this.searchModel.isNlqActive());
      return this.chartQuery.getResultSetAsync().then(resultSet => {
        let oFacet;
        if (properties.bInitialFilters) {
          oFacet = this.oFacetFormatter.getDialogFacetsFromChartQuery(resultSet, this, this.chartQuery.dimension);
        } else {
          oFacet = this.oFacetFormatter.getDialogFacetsFromChartQuery(resultSet, this, this.chartQuery.dimension, this.aFilters);
        }
        this.setProperty(properties.sBindingPath + "/items", oFacet.items);
        this.setProperty(properties.sBindingPath + "/items", oFacet.items);
        if (typeof resultSet?.facetTotalCount === "number") {
          this.setProperty(properties.sBindingPath + "/facetTotalCount", resultSet.facetTotalCount);
        }
      }, error => {
        const errorTitle = i18n.getText("searchError");
        const errorText = error.message;
        MessageBox.error(errorText, {
          title: errorTitle,
          actions: MessageBox.Action.OK,
          onClose: null,
          styleClass: "sapUshellSearchMessageBox",
          // selector for closePopovers
          initialFocus: null,
          textDirection: TextDirection.Inherit
        });
      });
    }
    resetChartQueryFilterConditions() {
      if (this.chartQuery) {
        this.chartQuery.resetConditions();
      }
      // add static hierachy facets
      const nonFilterByConditions = this.getStaticHierarchyFilterConditions();
      if (nonFilterByConditions.length > 0) {
        for (const nonFilterByCondition of nonFilterByConditions) {
          this.chartQuery.autoInsertCondition(nonFilterByCondition);
        }
      }
    }
    hasFilterCondition(filterCondition) {
      for (let i = 0; i < this.aFilters.length; i++) {
        if (this.aFilters[i].filterCondition.equals && this.aFilters[i].filterCondition.equals(filterCondition)) {
          return true;
        }
      }
      return false;
    }
    hasFilter(item) {
      const filterCondition = item.filterCondition;
      return this.hasFilterCondition(filterCondition);
    }
    addFilter(item) {
      if (!this.hasFilter(item)) {
        this.aFilters.push(item);
      }
    }
    removeFilter(item) {
      const filterCondition = item.filterCondition;
      for (let i = 0; i < this.aFilters.length; i++) {
        if (this.aFilters[i].filterCondition.equals && this.aFilters[i].filterCondition.equals(filterCondition)) {
          this.aFilters.splice(i, 1);
          return;
        }
      }
    }
    changeFilterAdvaced(item, bAdvanced) {
      const filterCondition = item.filterCondition;
      for (let i = 0; i < this.aFilters.length; i++) {
        if (this.aFilters[i].filterCondition.equals && this.aFilters[i].filterCondition.equals(filterCondition)) {
          this.aFilters[i].advanced = bAdvanced;
          return;
        }
      }
    }
    addFilterCondition(filterCondition) {
      this.chartQuery.filter.autoInsertCondition(filterCondition);
    }

    // determinate the attribute list data type
    getAttributeDataType(facet) {
      switch (facet.dataType) {
        case "Integer":
          return "integer";
        case "Double":
          return "number";
        case "Timestamp":
          return "timestamp";
        case "Date":
          return "date";
        case "String":
          if (facet.matchingStrategy === this.sinaNext.MatchingStrategy.Text) {
            return "text";
          }
          return "string";
        default:
          return "string";
      }
    }
    destroy() {
      super.destroy();
      this.oFacetFormatter.destroy();
    }
  }
  return SearchFacetDialogModel;
});
//# sourceMappingURL=SearchFacetDialogModel-dbg.js.map
