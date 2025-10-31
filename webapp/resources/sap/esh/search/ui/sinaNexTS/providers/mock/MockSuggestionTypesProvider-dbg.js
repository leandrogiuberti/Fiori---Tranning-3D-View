/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["../../sina/Capabilities", "../sample2/Provider"], function (____sina_Capabilities, ___sample2_Provider) {
  "use strict";

  const Capabilities = ____sina_Capabilities["Capabilities"];
  const Sample2Provider = ___sample2_Provider["Provider"]; // SuggestionTypeNameInSearchbox copied from SuggestionTypes
  class MockSuggestionTypesProvider extends Sample2Provider {
    id = "mock_suggestiontypes";
    aiSuggestionConfig = {
      count: 0,
      timeout: 0
    };
    async initAsync(properties) {
      let returnVal = await super.initAsync(properties);

      // take over returnValue, but add nlq capabilities
      returnVal = {
        ...returnVal,
        capabilities: new Capabilities({
          ...returnVal?.capabilities,
          nlq: true,
          nlqEnabledInfoOnDataSource: true
        })
      };
      return returnVal;
    }
    // Overwrite suggestion logic from mock/SuggestionTypes
    async executeSuggestionQuery(query) {
      // searchTerm:3:2000ms history:1:10000ms dataSource:5:12000ms searchTermAndDataSource:5:12000ms
      // ignore 'ms' for now
      // TODO add icons (to some? configurable?)

      // parse and split search term
      const searchTerm = query.getSearchTerm();
      const suggestionCfgsFromSearchTerm = searchTerm.split(/ +/g) // split by space
      .map(term => term.trim().split(":"))
      // type, count, timeout: // on clashes last definition wins
      .reduce((acc, [type, countStr, timeoutStr]) => ({
        ...acc,
        [type]: {
          count: parseInt(countStr, 10) || 0,
          timeout: parseInt(timeoutStr, 10) || 0
        }
      }), {});

      // for ai suggestions as these are sent only with empty-searchTerm adding SearchTermAI:x:y configuration just
      // changes the configuration state here, so that upon next empty searchTerm the AI suggestions are added
      if (suggestionCfgsFromSearchTerm["ai"]) {
        // update ai-state from searchTerm
        this.aiSuggestionConfig = suggestionCfgsFromSearchTerm["ai"];
        console.log(`AI suggestion updated: ${JSON.stringify(this.aiSuggestionConfig)}`);
      }

      // combine searchterm & AI suggestion
      const suggestionCfgs = {
        ...{
          ai: this.aiSuggestionConfig
        },
        ...suggestionCfgsFromSearchTerm
      };

      // create individual configurations for all suggestion items
      const suggestionItemCfgs = [];

      // figure out what is requested, possibly multiple are possible
      const dataSource = query.getDataSource().id;
      const queryTypes = query.types || [];
      const queryCalculationModes = query.calculationModes || [];
      const isRequested = {
        dataSource: queryTypes.includes("DataSource") &&
        //
        !queryCalculationModes.includes("History"),
        bo: (queryTypes.includes("SearchTerm") ||
        //
        queryTypes.includes("SearchTermAndDataSource")) && !queryCalculationModes.includes("History"),
        history: queryCalculationModes.includes("History"),
        ai: queryTypes.includes("SearchTermAI") &&
        //
        queryCalculationModes.includes("Data")
      };
      let maxTimeout = 0;
      // go through configurations and check if current request is asking for it, if yes, create suggestion items
      for (const [type, {
        count,
        timeout
      }] of Object.entries(suggestionCfgs)) {
        if (!isRequested[type] || count <= 0) {
          // skip if not requested
          continue;
        }
        for (let i = 0; i < count; i++) {
          suggestionItemCfgs.push({
            //
            type: type,
            searchTerm: `${type} ${i + 1}/${count} <b>${type?.toUpperCase() + " " + (i + 1)}</b> of ${count}`,
            dataSource
          });
        }
        maxTimeout = Math.max(maxTimeout, timeout);
      }
      const items = suggestionItemCfgs.map(cfg => this._createSuggestion(cfg)) //
      .filter(_ => _); // remove undefined

      console.log(`SuggestionTypes: suggestion (${query.types} - ${query.calculationModes})`);
      console.dir(items);

      // wait for timeout, simulate backend
      if (maxTimeout > 0) {
        await new Promise(resolve => setTimeout(resolve, maxTimeout));
      }
      return this.sina._createSuggestionResultSet({
        title: "Suggestions",
        query,
        items
      });
    }

    //configurations: { [name: string]: string[] } = {
    //    default: ["emptyDataSource"],
    //};

    _createSuggestion(cfg) {
      // create suggestions based on config array
      const searchTerm = cfg.searchTerm ?? "";
      const label = cfg.label ?? searchTerm;
      const dataSource = cfg.dataSource ? this.sina.getDataSource(cfg.dataSource) : undefined;
      switch (cfg.type) {
        case "history":
          return this.sina._createSearchTermSuggestion({
            searchTerm,
            label,
            calculationMode: this.sina.SuggestionCalculationMode.History,
            filter: this.sina.createFilter({
              dataSource,
              searchTerm
            })
          });
        // case "searchTerm":
        case "bo":
          return this.sina._createSearchTermSuggestion({
            searchTerm,
            label,
            calculationMode: this.sina.SuggestionCalculationMode.Data,
            filter: this.sina.createFilter({
              dataSource,
              searchTerm
            })
          });
        case "ai":
          return this.sina._createSearchTermAISuggestion({
            searchTerm,
            label,
            calculationMode: this.sina.SuggestionCalculationMode.Data,
            filter: this.sina.createFilter({
              dataSource,
              searchTerm
            })
          });
        case "dataSource":
          return this.sina._createDataSourceSuggestion({
            calculationMode: this.sina.SuggestionCalculationMode.Data,
            dataSource,
            label
          });
        // case "searchTermAndDataSource":
        //     return this.sina._createSearchTermAndDataSourceSuggestion({
        //         searchTerm,
        //         dataSource,
        //         label,
        //         calculationMode: this.sina.SuggestionCalculationMode.Data,
        //         filter: this.sina.createFilter({
        //             dataSource,
        //             searchTerm,
        //         }),
        //     });
        default:
          return undefined;
      }
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.MockSuggestionTypesProvider = MockSuggestionTypesProvider;
  return __exports;
});
//# sourceMappingURL=MockSuggestionTypesProvider-dbg.js.map
