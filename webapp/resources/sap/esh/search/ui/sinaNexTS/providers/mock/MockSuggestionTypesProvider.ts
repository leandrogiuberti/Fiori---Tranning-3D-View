/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { Capabilities } from "../../sina/Capabilities";
import { SuggestionQuery } from "../../sina/SuggestionQuery";
import { SuggestionResultSet } from "../../sina/SuggestionResultSet";
import { AbstractProviderConfiguration } from "../AbstractProvider";
import { Provider as Sample2Provider } from "../sample2/Provider";

// SuggestionTypeNameInSearchbox copied from SuggestionTypes
export type SuggestionTypeNameInSearchbox = "bo" | "history" | "dataSource" | "ai";

export class MockSuggestionTypesProvider extends Sample2Provider {
    readonly id = "mock_suggestiontypes";

    aiSuggestionConfig: { count: number; timeout: number } = {
        count: 0,
        timeout: 0,
    };

    override async initAsync(
        properties: AbstractProviderConfiguration
    ): Promise<{ capabilities: Capabilities }> {
        let returnVal = await super.initAsync(properties);

        // take over returnValue, but add nlq capabilities
        returnVal = {
            ...returnVal,
            capabilities: new Capabilities({
                ...returnVal?.capabilities,
                nlq: true,
                nlqEnabledInfoOnDataSource: true,
            }),
        };
        return returnVal;
    }
    // Overwrite suggestion logic from mock/SuggestionTypes
    override async executeSuggestionQuery(query: SuggestionQuery): Promise<SuggestionResultSet> {
        // searchTerm:3:2000ms history:1:10000ms dataSource:5:12000ms searchTermAndDataSource:5:12000ms
        // ignore 'ms' for now
        // TODO add icons (to some? configurable?)

        // parse and split search term
        const searchTerm = query.getSearchTerm();
        const suggestionCfgsFromSearchTerm: Record<
            SuggestionTypeNameInSearchbox,
            { count: number; timeout: number }
        > = searchTerm
            .split(/ +/g) // split by space
            .map((term) => term.trim().split(":"))
            // type, count, timeout: // on clashes last definition wins
            .reduce(
                (acc, [type, countStr, timeoutStr]) => ({
                    ...acc,
                    [type]: {
                        count: parseInt(countStr, 10) || 0,
                        timeout: parseInt(timeoutStr, 10) || 0,
                    },
                }),
                {} as Record<SuggestionTypeNameInSearchbox, { count: number; timeout: number }>
            );

        // for ai suggestions as these are sent only with empty-searchTerm adding SearchTermAI:x:y configuration just
        // changes the configuration state here, so that upon next empty searchTerm the AI suggestions are added
        if (suggestionCfgsFromSearchTerm["ai"]) {
            // update ai-state from searchTerm
            this.aiSuggestionConfig = suggestionCfgsFromSearchTerm["ai"];
            console.log(`AI suggestion updated: ${JSON.stringify(this.aiSuggestionConfig)}`);
        }

        // combine searchterm & AI suggestion
        const suggestionCfgs = {
            ...{ ai: this.aiSuggestionConfig },
            ...suggestionCfgsFromSearchTerm,
        };

        // create individual configurations for all suggestion items
        const suggestionItemCfgs: Array<{
            type: SuggestionTypeNameInSearchbox;
            searchTerm: string;
            dataSource: string;
        }> = [];

        // figure out what is requested, possibly multiple are possible
        const dataSource = query.getDataSource().id;
        const queryTypes = (query.types || []) as string[];
        const queryCalculationModes = (query.calculationModes || []) as string[];
        const isRequested: Record<SuggestionTypeNameInSearchbox, boolean> = {
            dataSource:
                queryTypes.includes("DataSource") && //
                !queryCalculationModes.includes("History"),
            bo:
                (queryTypes.includes("SearchTerm") || //
                    queryTypes.includes("SearchTermAndDataSource")) &&
                !queryCalculationModes.includes("History"),
            history: queryCalculationModes.includes("History"),
            ai:
                queryTypes.includes("SearchTermAI") && //
                queryCalculationModes.includes("Data"),
        };

        let maxTimeout = 0;
        // go through configurations and check if current request is asking for it, if yes, create suggestion items
        for (const [type, { count, timeout }] of Object.entries(suggestionCfgs)) {
            if (!isRequested[type] || count <= 0) {
                // skip if not requested
                continue;
            }
            for (let i = 0; i < count; i++) {
                suggestionItemCfgs.push({
                    //
                    type: type as SuggestionTypeNameInSearchbox,
                    searchTerm: `${type} ${i + 1}/${count} <b>${type?.toUpperCase() + " " + (i + 1)}</b> of ${count}`,
                    dataSource,
                });
            }
            maxTimeout = Math.max(maxTimeout, timeout);
        }

        const items = suggestionItemCfgs
            .map((cfg) => this._createSuggestion(cfg)) //
            .filter((_) => _); // remove undefined

        console.log(`SuggestionTypes: suggestion (${query.types} - ${query.calculationModes})`);
        console.dir(items);

        // wait for timeout, simulate backend
        if (maxTimeout > 0) {
            await new Promise((resolve) => setTimeout(resolve, maxTimeout));
        }

        return this.sina._createSuggestionResultSet({
            title: "Suggestions",
            query,
            items,
        });
    }

    //configurations: { [name: string]: string[] } = {
    //    default: ["emptyDataSource"],
    //};

    _createSuggestion(cfg: {
        type: SuggestionTypeNameInSearchbox;
        searchTerm?: string;
        label?: string;
        dataSource?: string;
    }) {
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
                        searchTerm,
                    }),
                });
            // case "searchTerm":
            case "bo":
                return this.sina._createSearchTermSuggestion({
                    searchTerm,
                    label,
                    calculationMode: this.sina.SuggestionCalculationMode.Data,
                    filter: this.sina.createFilter({
                        dataSource,
                        searchTerm,
                    }),
                });
            case "ai":
                return this.sina._createSearchTermAISuggestion({
                    searchTerm,
                    label,
                    calculationMode: this.sina.SuggestionCalculationMode.Data,
                    filter: this.sina.createFilter({
                        dataSource,
                        searchTerm,
                    }),
                });
            case "dataSource":
                return this.sina._createDataSourceSuggestion({
                    calculationMode: this.sina.SuggestionCalculationMode.Data,
                    dataSource,
                    label,
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
