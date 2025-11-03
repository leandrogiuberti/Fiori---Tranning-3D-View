/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["../../sina/Capabilities", "../AbstractProvider", "./SearchEngine"], function (____sina_Capabilities, ___AbstractProvider, ___SearchEngine) {
  "use strict";

  // TODO:
  // - Show More dialog set manuel range -> JIRA https://jira.tools.sap/browse/HDBFIORISEARCH-2126
  // - create recursive datasource facet?
  // - ComparisonOperator not finished
  // - NO: title link -> NOT possible to implement through sina, but in UI
  // - NO: Object Suggestion No Link -> NOT possible to implement through sina, but in UI
  // - NO: AI suggestion (UIA user/pass in secret file)
  // - NO: additional whyfound
  /*
   * get the data source and attributes in JSON, input in browser debug console:
   * id = "eshCompGenId_0";
   * model = sap.ui.getCore().byId(id).getModelInternal();
   * model.getDataSource().toJson("DataSourceAndAttributesJSON");
   * Note: make sure "id" has same value as json file name!
  
   * get the result set in CSV, input in browser debug console:
   * id = "eshCompGenId_0";
   * model = sap.ui.getCore().byId(id).getModelInternal();
   * model.resultSet.toCSV();
   * Note: make sure csv file has same name as json file name!
  */
  const Capabilities = ____sina_Capabilities["Capabilities"];
  const AbstractProvider = ___AbstractProvider["AbstractProvider"];
  const SearchEngine = ___SearchEngine["SearchEngine"];
  class Provider extends AbstractProvider {
    id = "sample2"; // not readonly to allow overwriting in mock-providers

    // configurations now only contains datasource string arrays
    configurations = {
      default: ["bp", "employees", "products", "tlt", "purchaseOrders"],
      tlt: ["tlt"],
      emptyDataSource: ["emptyDataSource"]
    };
    constructor() {
      super();
      // initialize with default datasources
      this.searchEngine = new SearchEngine(this.sina, this.configurations["default"]);
    }
    async initAsync(properties) {
      this.sina = properties.sina ?? this.sina;

      // initialize configuration
      const configurationName = properties?.configuration ?? this._getConfigurationFromUrl();
      const dataSourceIds = this.configurations[configurationName] ?? this.configurations["default"];
      this.searchEngine = new SearchEngine(this.sina, dataSourceIds);
      await this.searchEngine.initAsync(this.sina);
      return {
        capabilities: new Capabilities({})
      };
    }
    _getConfigurationFromUrl() {
      // check url-parameter sample2Config
      let configName = undefined;
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location?.search);
        configName = urlParams?.get("sample2Configuration") || undefined;
      }
      return configName;
    }
    async executeSearchQuery(query) {
      return this.searchEngine.search(query);
    }
    async executeSuggestionQuery(query) {
      return this.searchEngine.suggestion(query);
      /*
      Suggestions of epm data:
       1. DataSource Suggestion: 
      Input: datasource: "All", input: "emp"
      Suggestion: "Search In" /n "Employees"
       2. SearchTerm Suggestion: 
      Input: datasource: "All", input: "328"
      Suggestion: "Search For" /n "3289", click it, trigger a search "All" and Searchterm "3289"
       3. History SearchTerm Suggestion: 
      Input: datasource: "All", input: "sall", search and add it to history
      Input: datasource: "All", input: "sal"
      Suggestion: "Search For" /n "sall"
       4. Object Suggestion: 
      Input: datasource: "All", input: "sally"
      Suggestion: "Employees" /n "Sally" photo and email
       5. SearchTermAI Suggestion:
      NOT implemented
       6. SearchTermAndDataSource Suggestion:
      NOT implemented
      */
    }
    async executeChartQuery(query) {
      return this.searchEngine.chart(query);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    executeHierarchyQuery(query) {
      throw new Error("Method not implemented.");
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.Provider = Provider;
  return __exports;
});
//# sourceMappingURL=Provider-dbg.js.map
