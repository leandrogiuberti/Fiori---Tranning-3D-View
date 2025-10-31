/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { Sina } from "../../sina/Sina";
import { SuggestionCalculationMode } from "../../sina/SuggestionCalculationMode";
import { Provider } from "./Provider";
import * as pivotTableParser from "./pivotTableParser";

class SuggestionParser {
    provider: Provider;
    sina: Sina;

    constructor(provider) {
        this.provider = provider;
        this.sina = provider.sina;
    }

    parseSuggestions(query, data) {
        data = pivotTableParser.parse(data);
        const suggestions = [];
        let suggestion;
        let parentSuggestion;

        for (let i = 0; i < data.cells.length; i++) {
            suggestion = null;
            const cell = data.cells[i];
            if (cell.$$Attribute$$ !== "$$AllAttributes$$") {
                continue;
            }
            switch (cell.$$Term$$.Scope) {
                case "SearchHistory":
                    if (cell.$$DataSource$$ === "$$AllDataSources$$") {
                        suggestion = this.parseSearchTermSuggestion(query, cell);
                    }
                    break;
                case "ObjectData":
                    if (cell.$$DataSource$$ === "$$AllDataSources$$") {
                        suggestion = this.parseSearchTermSuggestion(query, cell);
                        parentSuggestion = suggestion;
                    } else {
                        suggestion = this.parseSearchTermAndDataSourceSuggestion(query, cell);
                        if (
                            suggestion &&
                            suggestion.filter.dataSource !== parentSuggestion.filter.dataSource
                        ) {
                            parentSuggestion.childSuggestions.push(suggestion);
                        }
                        suggestion = null;
                    }
                    break;
                case "DataSources":
                    if (cell.$$DataSource$$ === "$$AllDataSources$$") {
                        suggestion = this.parseDataSourceSuggestion(query, cell);
                    }
                    break;
            }
            if (suggestion) {
                suggestions.push(suggestion);
            }
        }
        return suggestions;
    }

    parseDataSourceSuggestion(query, cell) {
        const dataSource = this.sina.getDataSource(cell.$$Term$$.Value);
        if (!dataSource) {
            return null;
        }
        const filter = query.filter.clone();
        filter.setDataSource(dataSource);
        return this.sina._createDataSourceSuggestion({
            calculationMode: SuggestionCalculationMode.Data,
            dataSource: dataSource,
            label: cell.$$Term$$.ValueFormatted,
        });
    }

    parseSearchTermSuggestion(query, cell) {
        const calculationMode = this.parseCalculationMode(cell.$$Term$$.Scope);
        const filter = query.filter.clone();
        filter.setSearchTerm(cell.$$Term$$.Value);
        return this.sina._createSearchTermSuggestion({
            searchTerm: cell.$$Term$$.Value,
            calculationMode: calculationMode,
            filter: filter,
            label: cell.$$Term$$.ValueFormatted,
        });
    }

    parseSearchTermAndDataSourceSuggestion(query, cell) {
        const calculationMode = this.parseCalculationMode(cell.$$Term$$.Scope);
        const filter = query.filter.clone();
        filter.setSearchTerm(cell.$$Term$$.Value);
        const dataSource = this.sina.getDataSource(cell.$$DataSource$$);
        if (!dataSource) {
            return null;
        }
        filter.setDataSource(dataSource);
        return this.sina._createSearchTermAndDataSourceSuggestion({
            searchTerm: cell.$$Term$$.Value,
            dataSource: dataSource,
            calculationMode: calculationMode,
            filter: filter,
            label: cell.$$Term$$.ValueFormatted,
        });
    }

    parseCalculationMode(scope) {
        switch (scope) {
            case "SearchHistory":
                return SuggestionCalculationMode.History;
            case "ObjectData":
                return SuggestionCalculationMode.Data;
        }
    }
}

export function parse(provider, suggestionQuery, data) {
    const suggestionParser = new SuggestionParser(provider);
    return suggestionParser.parseSuggestions(suggestionQuery, data);
}
