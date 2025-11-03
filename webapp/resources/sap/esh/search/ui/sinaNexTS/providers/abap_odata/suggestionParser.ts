/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { DataSourceSuggestion } from "../../sina/DataSourceSuggestion";
import { SearchResultSetItem } from "../../sina/SearchResultSetItem";
import { SearchResultSetItemAttribute } from "../../sina/SearchResultSetItemAttribute";
import { SearchTermAndDataSourceSuggestion } from "../../sina/SearchTermAndDataSourceSuggestion";
import { SearchTermSuggestion } from "../../sina/SearchTermSuggestion";
import { Sina } from "../../sina/Sina";
import { SuggestionCalculationMode } from "../../sina/SuggestionCalculationMode";
import { SuggestionQuery } from "../../sina/SuggestionQuery";
import { ItemParser, ABAPOdataSearchResponse } from "./ItemParser";
import { Provider } from "./Provider";

export interface ICell {
    FromDataSource: string;
    FromDataSourceAttribute: string;
    SearchTerms: string;
    SearchTermsHighlighted: string;
    Type: string;
}

export interface ABAPOdataSuggestionResponse {
    d: {
        DataSources: { results: Array<unknown> };
        DetailLevel: number;
        Id: string;
        IncludeAttributeSuggestions: boolean;
        IncludeDataSourceSuggestions: boolean;
        IncludeHistorySuggestions: boolean;
        ObjectSuggestions: Record<string, unknown>;
        SuggestionInput: string;
        Suggestions: {
            results: Array<{
                FromDataSource: string;
                FromDataSourceAttribute: string;
                NumberOfObjects: number;
                Score: string;
                SearchTerms: string;
                SearchTermsHighlighted: string;
                Type: string;
            }>;
        };
    };
}

export class SuggestionParser {
    provider: Provider;
    sina: Sina;
    itemParser: ItemParser;

    constructor(provider: Provider, itemParser: ItemParser) {
        this.provider = provider;
        this.sina = provider.sina;
        this.itemParser = itemParser;
    }

    parseObjectSuggestions(query, data) {
        if (
            !data.d.ObjectSuggestions ||
            !data.d.ObjectSuggestions.SearchResults ||
            !data.d.ObjectSuggestions.SearchResults.results
        ) {
            return [];
        }
        const suggestionPromises = [];
        const objectSuggestions = data.d.ObjectSuggestions.SearchResults.results;
        for (let i = 0; i < objectSuggestions.length; ++i) {
            const objectSuggestion = objectSuggestions[i];
            suggestionPromises.push(this.parseObjectSuggestion(objectSuggestion));
        }
        return Promise.all(suggestionPromises);
    }

    private parseObjectSuggestion(objectSuggestion: ABAPOdataSearchResponse) {
        return this.itemParser.parseItem(objectSuggestion).then(
            function (object: SearchResultSetItem) {
                // fill highlighted value: actually it would be better to call
                // the search result set formatter like for a regular result
                // set
                this.fillValueHighlighted(object);

                const title = object.titleAttributes
                    .filter((attribute) => attribute instanceof SearchResultSetItemAttribute)
                    .map(function (attribute: SearchResultSetItemAttribute) {
                        return attribute.valueFormatted;
                    })
                    .join(" ");
                return this.sina._createObjectSuggestion({
                    calculationMode: SuggestionCalculationMode.Data,
                    label: title,
                    object: object,
                });
            }.bind(this)
        );
    }

    fillValueHighlighted(object): void {
        const doFillValueHighlighted = function (attributes) {
            if (!attributes) {
                return;
            }
            for (let i = 0; i < attributes.length; ++i) {
                const attribute = attributes[i];
                if (!attribute.valueHighlighted) {
                    attribute.valueHighlighted = attribute.valueFormatted;
                }
            }
        };
        doFillValueHighlighted(object.detailAttributes);
        doFillValueHighlighted(object.titleAttributes);
    }

    public parseRegularSuggestions(
        query: SuggestionQuery,
        data: ABAPOdataSuggestionResponse
    ): Array<SearchTermSuggestion | SearchTermAndDataSourceSuggestion | DataSourceSuggestion> {
        const suggestions: Array<
            SearchTermSuggestion | SearchTermAndDataSourceSuggestion | DataSourceSuggestion
        > = [];
        let suggestion;
        let parentSuggestion;
        const parentSuggestions = [];
        let cell: ICell;
        let parentCell: ICell;

        if (!data.d.Suggestions || !data.d.Suggestions.results) {
            return [];
        }

        const results = data.d.Suggestions.results;
        for (let i = 0; i < results.length; i++) {
            suggestion = null;
            cell = results[i];

            switch (cell.Type) {
                case "H":
                    suggestion = this.parseSearchTermSuggestion(query, cell);
                    break;
                case "A":
                    suggestion = this.parseSearchTermAndDataSourceSuggestion(query, cell);
                    // attach type and cell information
                    // suggestion.type = "A";
                    suggestion.cell = cell;
                    break;
                case "M":
                    suggestion = this.parseDataSourceSuggestion(query, cell);
                    break;
            }

            if (suggestion) {
                if (suggestion.type === this.sina.SuggestionType.SearchTermAndDataSource) {
                    // set parent sugestion
                    if (parentSuggestions[suggestion.searchTerm] === undefined) {
                        parentCell = this._getParentCell(suggestion.cell);
                        parentSuggestion = this.parseSearchTermSuggestion(query, parentCell);
                        parentSuggestions[suggestion.searchTerm] = parentSuggestion;
                    }
                    // remove type and cell information
                    delete suggestion.cell;
                    // attach children
                    parentSuggestions[suggestion.searchTerm].childSuggestions.push(suggestion);
                } else {
                    // push non-attribute suggestion
                    suggestions.push(suggestion);
                }
            }
        }

        // push attribute suggestion
        Object.keys(parentSuggestions).forEach(function (key) {
            suggestions.push(parentSuggestions[key]);
        });

        return suggestions;
    }

    parseDataSourceSuggestion(query: SuggestionQuery, cell: ICell): DataSourceSuggestion {
        const calculationMode = SuggestionCalculationMode.Data; // always data suggestion
        const dataSource = this.sina.getDataSource(cell.FromDataSource);
        if (!dataSource) {
            return null;
        }
        const filter = query.filter.clone();
        filter.setDataSource(dataSource);
        return this.sina._createDataSourceSuggestion({
            calculationMode: calculationMode,
            dataSource: dataSource,
            label: cell.SearchTermsHighlighted,
        });
    }

    parseSearchTermSuggestion(query: SuggestionQuery, cell: ICell): SearchTermSuggestion {
        const calculationMode = this.parseCalculationMode(cell.Type);
        const filter = query.filter.clone();
        filter.setSearchTerm(cell.SearchTerms);
        return this.sina._createSearchTermSuggestion({
            searchTerm: cell.SearchTerms,
            calculationMode: calculationMode,
            filter: filter,
            label: cell.SearchTermsHighlighted,
        });
    }

    parseSearchTermAndDataSourceSuggestion(
        query: SuggestionQuery,
        cell: ICell
    ): SearchTermAndDataSourceSuggestion {
        const calculationMode = this.parseCalculationMode(cell.Type);
        const filter = query.filter.clone();
        filter.setSearchTerm(cell.SearchTerms);
        const dataSource = this.sina.getDataSource(cell.FromDataSource);
        if (!dataSource) {
            return null;
        }
        filter.setDataSource(dataSource);
        return this.sina._createSearchTermAndDataSourceSuggestion({
            searchTerm: cell.SearchTerms,
            dataSource: dataSource,
            calculationMode: calculationMode,
            filter: filter,
            label: cell.SearchTermsHighlighted,
        });
    }

    parseCalculationMode(scope: string): SuggestionCalculationMode {
        switch (scope) {
            case "H":
                return SuggestionCalculationMode.History;
            case "A":
            case "M":
                return SuggestionCalculationMode.Data;
        }
    }

    private _getParentCell(cell: ICell): ICell {
        const parentCell = cell;
        parentCell.FromDataSource = "<All>";
        parentCell.FromDataSourceAttribute = "";
        parentCell.Type = "A";
        return parentCell;
    }
}
