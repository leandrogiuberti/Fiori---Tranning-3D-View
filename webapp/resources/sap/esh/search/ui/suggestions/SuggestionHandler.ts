/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import Log, { Logger } from "sap/base/Log";
import SearchModel from "sap/esh/search/ui/SearchModel";
import i18n from "../i18n";
import { Filter } from "../sinaNexTS/sina/Filter";
import { Sina } from "../sinaNexTS/sina/Sina";
import AppSuggestionProvider, { AppSuggestion } from "./AppSuggestionProvider";
import RecentlyUsedSuggestionProvider from "./RecentlyUsedSuggestionProvider";
import SinaSuggestionProvider from "./SinaSuggestionProvider";
import { SuggestionProvider } from "./SuggestionProvider";
import {
    Type as SuggestionType,
    SuggestionType as SuggestionTypeProperties,
    Suggestion,
    SuggestionHeader,
} from "./SuggestionType";
import TimeMerger from "./TimeMerger";
// import TransactionSuggestionProvider, { TransactionSuggestion } from "./TransactionSuggestionProvider";
import * as SearchHelper from "sap/esh/search/ui/SearchHelper";
import { UserEventType } from "../eventlogging/UserEvents";
import { AbortableFunction } from "sap/esh/search/ui/SearchHelper";
import SearchInput from "../controls/searchfieldgroup/SearchInput";
import ColumnListItem from "sap/m/ColumnListItem";
import Element from "sap/ui/core/Element";

export default class SuggestionHandler {
    private _oLogger: Logger;
    private model: SearchModel;
    private suggestionProviders: Array<SuggestionProvider>;
    private keyboardRelaxationTime: number;
    private readonly uiUpdateInterval = 500;
    private readonly uiClearOldSuggestionsTimeOut = 1000;
    private recentlyUsedSuggestionProvider: RecentlyUsedSuggestionProvider;
    private appSuggestionProvider: AppSuggestionProvider;
    private timeMerger: TimeMerger;
    private suggestionProvidersPromise?: Promise<Array<SuggestionProvider>>;
    private sinaNext: Sina;
    private firstInsertion?: boolean;
    private busyIndicator?: boolean;
    private performanceLoggerSuggestionMethods: string[];
    private clearSuggestionTimer?: number;
    private suggestionResultSetCounter: number;
    private suggestionHeaders: Record<number, boolean>;
    private generatedPositions: { maxPosition: number; position: Record<string, number> };
    private doSuggestionInternalDelayed: AbortableFunction<typeof this.doSuggestionInternal>;
    // public transactionSuggestionProvider: TransactionSuggestionProvider;

    // init
    // ===================================================================
    constructor(params: { model: SearchModel }) {
        // members
        this._oLogger = Log.getLogger("sap.esh.search.ui.suggestions.SuggestionHandler");
        this.model = params.model;
        this.suggestionProviders = [];

        // times
        this.keyboardRelaxationTime = this.model.config.suggestionKeyboardRelaxationTime;

        // recently used suggestion provider
        if (this.supportsRecentlyUsedSuggestions()) {
            this.recentlyUsedSuggestionProvider = new RecentlyUsedSuggestionProvider({
                model: this.model,
                suggestionHandler: this,
            });
        }

        // apps suggestion provider
        this.appSuggestionProvider = new AppSuggestionProvider({
            model: this.model,
            suggestionHandler: this,
        });

        // decorator for delayed suggestion execution, make delayed by default 400ms
        this.doSuggestionInternalDelayed = SearchHelper.delayedExecution(
            this.doSuggestionInternal.bind(this),
            this.keyboardRelaxationTime
        );

        // time merger for merging returning suggestions callbacks
        this.timeMerger = new TimeMerger();

        this.performanceLoggerSuggestionMethods = []; // performance logging: Remember all method names of (open) suggestion calls (needed for 'abortSuggestion -> leaveMethod')
    }

    private supportsRecentlyUsedSuggestions(): boolean {
        if (!this.model.config.bRecentSearches) return false;
        return true;
    }

    // private supportsTransactionSuggestions(): boolean {
    //     return false; // deactivate until S4 decides to activate it
    //     // if (window.sap["cf"]) return false; // no transaction suggestions in cFLP/multiprovider
    //     // if (!this.model.config.isUshell) return false; // transaction suggestions are only shown in ushell
    //     // if (
    //     //     this.model.sinaNext.provider.serverInfo &&
    //     //     this.model.sinaNext.provider.serverInfo.Services &&
    //     //     this.model.sinaNext.provider.serverInfo.Services.results &&
    //     //     this.model.sinaNext.provider.serverInfo.Services.results.length > 0
    //     // ) {
    //     //     for (const capability of this.model.sinaNext.provider.serverInfo.Services.results) {
    //     //         if (capability.Id === "TransactionSuggestions") return true;
    //     //     }
    //     // }
    //     // return false;
    // }

    // abort suggestions
    // ===================================================================
    public abortSuggestions(clearSuggestions?: boolean): void {
        if (clearSuggestions === undefined || clearSuggestions === true) {
            this.model.setProperty("/suggestions", []);
            this.model.setProperty("/isBusySuggestions", false);
            // console.log("xx sug clear");
        }
        if (this.clearSuggestionTimer) {
            clearTimeout(this.clearSuggestionTimer);
            this.clearSuggestionTimer = null;
        }
        this.doSuggestionInternalDelayed.abort(); // abort time delayed calls
        this.getSuggestionProviders().then((suggestionProviders: Array<SuggestionProvider>) => {
            for (let i = 0; i < suggestionProviders.length; ++i) {
                const suggestionProvider = suggestionProviders[i];
                suggestionProvider.abortSuggestions();
            }
            this.timeMerger.abort();

            for (const method of this.performanceLoggerSuggestionMethods) {
                this.model.config.performanceLogger?.leaveMethod({
                    name: method,
                });
            }
            this.performanceLoggerSuggestionMethods = [];
        });
    }

    // get suggestion providers dependend on server capabilities
    // ===================================================================
    private getSuggestionProviders(): Promise<Array<SuggestionProvider>> {
        // check cache
        if (this.suggestionProvidersPromise) {
            return this.suggestionProvidersPromise;
        }

        this.suggestionProvidersPromise = this.model.initAsync().then(() => {
            // link to sina
            this.sinaNext = this.model.sinaNext;

            // init list of suggestion providers (app suggestions are always available)
            const suggestionProviders = [];
            if (this.model.config.isUshell) {
                suggestionProviders.push(this.appSuggestionProvider);
            }

            if (this.supportsRecentlyUsedSuggestions()) {
                suggestionProviders.push(this.recentlyUsedSuggestionProvider);
            }

            // if no business obj search configured -> just use app suggestion provider
            if (!this.model.config.searchBusinessObjects) {
                return Promise.resolve(suggestionProviders);
            }

            // create sina suggestion providers
            suggestionProviders.push(...this.createSinaSuggestionProviders());

            // transactions suggestion provider
            // if (this.supportsTransactionSuggestions()) {
            //     this.transactionSuggestionProvider = new TransactionSuggestionProvider({
            //         model: this.model,
            //         suggestionHandler: this,
            //     });
            //     suggestionProviders.push(this.transactionSuggestionProvider);
            // }

            return Promise.resolve(suggestionProviders);
        });

        return this.suggestionProvidersPromise;
    }

    // create sina suggestion providers
    // ===================================================================
    private createSinaSuggestionProviders(): Array<SinaSuggestionProvider> {
        // provider configuration
        const providerConfigurations = [
            {
                suggestionTypes: [SuggestionType.SearchTermHistory],
            },
            {
                suggestionTypes: [SuggestionType.SearchTermData],
            },
            {
                suggestionTypes: [SuggestionType.DataSource],
            },
        ];
        if (this.model.config.boSuggestions) {
            providerConfigurations.push({
                suggestionTypes: [SuggestionType.Object],
            });
        }
        if (this.model.config.aiSuggestions) {
            // just evaluate config flag
            // user settings is checked in SinaSuggestionProvider and may change during runtime
            providerConfigurations.push({
                suggestionTypes: [SuggestionType.SearchTermAI],
            });
        }
        // create suggestion providers
        const suggestionProviders = [];
        for (let k = 0; k < providerConfigurations.length; ++k) {
            const providerConfiguration = providerConfigurations[k];
            suggestionProviders.push(
                new SinaSuggestionProvider({
                    model: this.model,
                    sinaNext: this.sinaNext,
                    suggestionTypes: providerConfiguration.suggestionTypes,
                    suggestionHandler: this,
                })
            );
        }

        return suggestionProviders;
    }

    // check if suggestions are visible
    // ===================================================================
    private isSuggestionPopupVisible(): boolean {
        // Get all elements with class searchSuggestion
        const suggestions = document.querySelectorAll(".searchSuggestion");
        // Check if any element is visible (has offsetParent)
        return Array.from(suggestions).some(
            (suggestion) => (suggestion as HTMLElement).offsetParent !== null
        );
    }

    // do suggestions
    // ===================================================================
    public doSuggestion(filter: Filter): void {
        if (
            filter?.searchTerm?.toLocaleLowerCase().indexOf("/o") === 0 ||
            filter?.searchTerm?.toLocaleLowerCase().indexOf("/n") === 0
        ) {
            this.abortSuggestions(true);
            // disable suggestions for tcodes
            return;
        }
        const clearSuggestions = filter?.searchTerm?.length === 0;
        // - clear suggestions only if search field was empty (ai suggestions, recent suggestions)
        // - for other suggestions types first for some time the old suggestions are displayed (see this.clearSuggestionTimer)
        this.abortSuggestions(clearSuggestions);
        this.doSuggestionInternalDelayed(filter); // time delayed
    }

    // auto select app suggestion
    // ===================================================================
    public autoSelectAppSuggestion(filter: Filter): Promise<AppSuggestion> {
        return this.appSuggestionProvider.getSuggestions(filter).then(function (suggestions) {
            return suggestions[0] as AppSuggestion;
        });
    }

    // public autoSelectTransactionSuggestion(key = ""): TransactionSuggestion | void {
    //     key = key.toUpperCase();
    //     return this.transactionSuggestionProvider?.transactionSuggestions.find((suggestion) => {
    //         return suggestion.key === key;
    //     });
    // }

    // do suggestion internal
    // ===================================================================
    private doSuggestionInternal(filter: Filter) {
        /* eslint no-loop-func:0 */

        this.firstInsertion = true;
        this.busyIndicator = false;
        this.model.setProperty("/isBusySuggestions", false);
        const suggestionTerm = this.model.getProperty("/uiFilter/searchTerm");

        // no suggestions for *
        if (suggestionTerm.trim() === "*") {
            this.insertSuggestions([], 0);
            return;
        }

        const method = `Suggestions for term ${suggestionTerm}`;
        this.performanceLoggerSuggestionMethods.push(method);
        this.model.config.performanceLogger?.enterMethod(
            { name: method },
            { isSearch: true, comments: `suggestion term: ${suggestionTerm}` }
        );

        // log suggestion request
        this.model.eventLogger.logEvent({
            type: UserEventType.SUGGESTION_REQUEST,
            suggestionTerm: this.model.getProperty("/uiFilter/searchTerm"),
            dataSourceKey: this.model.getProperty("/uiFilter/dataSource").id,
        });

        // get suggestion providers
        this.getSuggestionProviders()
            .then((suggestionProviders: Array<SuggestionProvider>) => {
                // get suggestion promises from all providers
                const promises: Array<Promise<Array<Suggestion>>> = [];
                let pending = suggestionProviders.length;
                for (let i = 0; i < suggestionProviders.length; ++i) {
                    const suggestionProvider = suggestionProviders[i];
                    promises.push(suggestionProvider.getSuggestions(filter));
                }

                // display empty suggestions list just with busy indicator
                if (this.isSuggestionPopupVisible()) {
                    // do this time delayed in order to avoid flickering
                    // otherwise we would have: old suggestions/busy indicator/new suggestions
                    if (this.clearSuggestionTimer) {
                        clearTimeout(this.clearSuggestionTimer);
                    }
                    this.clearSuggestionTimer = window.setTimeout(() => {
                        this.clearSuggestionTimer = null;
                        this.insertSuggestions([], pending);
                    }, this.uiClearOldSuggestionsTimeOut);
                } else {
                    // immediately display busy indicator
                    this.insertSuggestions([], pending);
                }

                // process suggestions using time merger
                // (merge returning suggestion callbacks happening within a time slot
                // in order to reduce number of UI updates)
                this.timeMerger.abort();
                this.timeMerger = new TimeMerger(promises, this.uiUpdateInterval);
                this.timeMerger.process((results: Array<Array<Suggestion>>) => {
                    pending -= results.length;
                    const suggestions: Array<Suggestion> = [];
                    for (let j = 0; j < results.length; ++j) {
                        const result = results[j];
                        if (result && result instanceof Error) {
                            this._oLogger.error(
                                "A suggestion provider reported an error while getting suggestions for term '" +
                                    filter.searchTerm +
                                    "'\n" +
                                    result.stack || result + ""
                            );
                            continue;
                        }
                        if (typeof result !== "object") {
                            this._oLogger.error(
                                "A suggestion provider returned a bad response " +
                                    filter.searchTerm +
                                    "'\n" +
                                    result
                            );
                            continue;
                        }
                        suggestions.push(...result);
                    }
                    if (pending > 0 && suggestions.length === 0) {
                        return; // empty result -> return and don't update (flicker) suggestions on UI
                    }
                    if (this.clearSuggestionTimer) {
                        clearTimeout(this.clearSuggestionTimer);
                        this.clearSuggestionTimer = null;
                    }
                    this.insertSuggestions(suggestions, pending);
                    if (pending === 0) {
                        for (const method of this.performanceLoggerSuggestionMethods) {
                            this.model.config.performanceLogger?.leaveMethod({
                                name: method,
                            });
                        }
                        this.performanceLoggerSuggestionMethods = [];
                    }
                });
            })
            .catch(() => {
                for (const method of this.performanceLoggerSuggestionMethods) {
                    this.model.config.performanceLogger?.leaveMethod({
                        name: method,
                    });
                }
                this.performanceLoggerSuggestionMethods = [];
            });
    }

    // generate suggestion header
    // ===================================================================
    private generateSuggestionHeader(insertSuggestion): SuggestionHeader {
        const header: Partial<SuggestionHeader> = {};
        switch (insertSuggestion.uiSuggestionType) {
            // case SuggestionType.Transaction:
            //     header.label = i18n.getText("label_transactions");
            //     break;
            case SuggestionType.App:
                header.label = i18n.getText("label_apps");
                break;
            case SuggestionType.DataSource:
                header.label = i18n.getText("searchIn");
                break;
            case SuggestionType.SearchTermData:
            case SuggestionType.SearchTermHistory:
                header.label = i18n.getText("searchFor");
                break;
            case SuggestionType.SearchTermAI:
                header.label = i18n.getText("searchTermAIHeader");
                header.helpLink = this.model.config.aiSuggestionsHeaderHelpLink;
                break;
            case SuggestionType.Object:
                header.label = insertSuggestion.dataSource.labelPlural; // default label
                header.dataSource = insertSuggestion.dataSource;
                break;
        }
        if (insertSuggestion.isRecentEntry) {
            header.label = i18n.getText("label_recently_used");
        }
        header.position = insertSuggestion.position;
        header.suggestionResultSetCounter = this.suggestionResultSetCounter;
        header.uiSuggestionType = SuggestionType.Header;
        header.uiSuggestionTypeOfSuggestionsInSection = insertSuggestion.uiSuggestionType;
        return header as SuggestionHeader;
    }

    // enable busy indicator suggestion (waiting for suggestions)
    // ===================================================================
    private enableBusyIndicator(suggestions, enabled: boolean) {
        if (enabled) {
            // enable -> add busy indicator suggestions
            suggestions.push({
                position: SuggestionTypeProperties.properties[SuggestionType.BusyIndicator].position,
                uiSuggestionType: SuggestionType.BusyIndicator,
            });
            return;
        }
        // disable -> remove busy indicator suggestion
        for (let i = 0; i < suggestions.length; ++i) {
            const suggestion = suggestions[i];
            if (suggestion.uiSuggestionType === SuggestionType.BusyIndicator) {
                suggestions.splice(i, 1);
                return;
            }
        }
    }

    // check for duplicate suggestion
    // ===================================================================
    checkDuplicate(
        suggestions: Array<Suggestion>,
        insertSuggestion: Suggestion
    ): {
        action: "append" | "replace" | "skip";
        index?: number; // only if action is replace
    } {
        const checkRelevancy = function (insertSuggestion: Suggestion): boolean {
            return (
                insertSuggestion.uiSuggestionType === SuggestionType.SearchTermHistory ||
                (insertSuggestion.uiSuggestionType === SuggestionType.SearchTermData &&
                    !insertSuggestion.dataSource)
            );
        };

        if (!checkRelevancy(insertSuggestion)) {
            return {
                action: "append",
            };
        }

        for (let i = 0; i < suggestions.length; ++i) {
            const suggestion = suggestions[i];
            if (!checkRelevancy(suggestion)) {
                continue;
            }
            if (insertSuggestion.searchTerm === suggestion.searchTerm) {
                if (
                    insertSuggestion.grouped &&
                    insertSuggestion.uiSuggestionType === SuggestionType.SearchTermData &&
                    suggestion.uiSuggestionType === SuggestionType.SearchTermHistory
                ) {
                    // for the top grouped suggestions: prefer data based suggestion
                    // over history based suggestions because
                    // - upper lower case of history and data based suggestions may differ
                    // - upper lower case should be identical for all grouped suggestions
                    return {
                        action: "replace",
                        index: i,
                    };
                }
                return {
                    action: "skip",
                };
            }
        }
        return {
            action: "append",
        };
    }

    // insert suggestions
    // ===================================================================
    private insertSuggestions(insertSuggestions, pending: number): void {
        // get suggestions from model
        let suggestions: Array<Suggestion> = this.model.getProperty("/suggestions").slice(); // copy list (updateSuggestions needs to access old list via data binding)

        // unsorted insert of suggestions
        suggestions = this.insertIntoSuggestionList(insertSuggestions, suggestions);

        // adjust busy indicator
        if (!this.busyIndicator && pending > 0) {
            if (!this.model.config.isWebCompSearchFieldGroupEnabled()) {
                this.enableBusyIndicator(suggestions, true);
            }
            this.busyIndicator = true;
            this.model.setProperty("/isBusySuggestions", true);
        }
        if (this.busyIndicator && pending === 0) {
            if (!this.model.config.isWebCompSearchFieldGroupEnabled()) {
                this.enableBusyIndicator(suggestions, false);
            }
            this.busyIndicator = false;
            this.model.setProperty("/isBusySuggestions", false);
        }

        // sort
        this.sortSuggestions(suggestions);

        // remove suggestions if over limit
        // (limit needs to be done here because history and search term suggestions are merged)
        this.limitSuggestions(suggestions);

        // set suggestions in model
        this.updateSuggestions(suggestions);
        //this.model.setProperty('/suggestions', suggestions);
    }

    // insert into suggestion list
    // ===================================================================
    private insertIntoSuggestionList(
        insertSuggestions: Array<Suggestion>,
        suggestions: Array<Suggestion>
    ): Array<Suggestion> {
        // do we need to replace?
        let flagReplace = false;
        if (this.firstInsertion) {
            this.firstInsertion = false;
            flagReplace = true;
        }

        // reset global fields
        if (flagReplace) {
            suggestions = [];
            this.suggestionHeaders = {};
            this.suggestionResultSetCounter = 0;
            this.generatedPositions = {
                maxPosition: SuggestionTypeProperties.properties[SuggestionType.Object].position,
                position: {},
            };
        }

        // increase result set counter (used for sorting)
        this.suggestionResultSetCounter += 1;

        // add sorting information to the suggestions
        for (let i = 0; i < insertSuggestions.length; ++i) {
            const insertSuggestion = insertSuggestions[i];

            // for object suggestions:
            // overwrite position by a generated position for grouping object suggestions by datasource
            // object suggestions from recent storage are not affected by this logic (they are displayed in the recent section)
            if (
                insertSuggestion.uiSuggestionType === SuggestionType.Object &&
                !insertSuggestion.isRecentEntry
            ) {
                let position = this.generatedPositions.position[insertSuggestion.dataSource.id];
                if (!position) {
                    this.generatedPositions.maxPosition += 1;
                    position = this.generatedPositions.maxPosition;
                    this.generatedPositions.position[insertSuggestion.dataSource.id] = position;
                }
                insertSuggestion.position = position;
            }

            // set fields used in sorting
            insertSuggestion.suggestionResultSetCounter = this.suggestionResultSetCounter;
            insertSuggestion.resultSetPosition = i;

            // additional duplicate check for search term suggestions
            const duplicateCheckResult = this.checkDuplicate(suggestions, insertSuggestion);
            switch (duplicateCheckResult.action) {
                case "append":
                    suggestions.push(insertSuggestion);
                    break;
                case "skip":
                    continue;
                case "replace":
                    //var toBeReplacedSuggestion = suggestions[duplicateCheckResult.index];
                    suggestions.splice(duplicateCheckResult.index, 1, insertSuggestion);
                    //insertSuggestion.suggestionResultSetCounter = toBeReplacedSuggestion.suggestionResultSetCounter;
                    //insertSuggestion.resultSetPosition = toBeReplacedSuggestion.resultSetPosition;
                    break;
            }

            if (this.isHeaderGenerationEnabled() && !this.suggestionHeaders[insertSuggestion.position]) {
                suggestions.push(this.generateSuggestionHeader(insertSuggestion));
                this.suggestionHeaders[insertSuggestion.position] = true;
            }
        }

        return suggestions;
    }

    // check whether we need to generate headers
    // ===================================================================
    private isHeaderGenerationEnabled(): boolean {
        // no headings for app datsource
        if (this.model.getDataSource() === this.model.appDataSource) {
            return false;
        }

        // no headings if bo suggestions are deactivated datasource is businessobject (connector)
        if (
            !this.model.config.boSuggestions &&
            this.model.getDataSource().type === this.sinaNext.DataSourceType.BusinessObject
        ) {
            return false;
        }

        return true;
    }

    // sort suggestions
    // ===================================================================
    private sortSuggestions(suggestions) {
        suggestions.sort(function (s1, s2) {
            // position is main sort field
            let cmp = s1.position - s2.position;
            if (cmp !== 0) {
                return cmp;
            }

            // headers are always on top of each section
            if (s1.uiSuggestionType === SuggestionType.Header) {
                return -1;
            }
            if (s2.uiSuggestionType === SuggestionType.Header) {
                return 1;
            }

            // special: grouped search term suggestions on top
            // grouped: the first search term suggestion with sub suggestions by datasource
            // for instance: sally in All
            //               sally in Employees
            //               sally in Customers
            if (s1.grouped && !s2.grouped) {
                return -1;
            }
            if (!s1.grouped && s2.grouped) {
                return 1;
            }

            // sort by result set
            cmp = s1.suggestionResultSetCounter - s2.suggestionResultSetCounter;
            if (cmp !== 0) {
                return cmp;
            }

            // sort by position in result set
            cmp = s1.resultSetPosition - s2.resultSetPosition;
            return cmp;
        });
    }

    // get suggestion limit
    // ===================================================================
    public getSuggestionLimit(uiSuggestionType: SuggestionType): number {
        const suggestionTypeData = SuggestionTypeProperties.properties[uiSuggestionType];
        if (typeof suggestionTypeData === "undefined") {
            return Infinity;
        }
        let limit;
        if (
            this.model.getDataSource() === this.model.sinaNext.allDataSource ||
            this.model.getDataSource() === this.model.favDataSource
        ) {
            limit = suggestionTypeData.limitDsAll;
        } else {
            limit = suggestionTypeData.limit;
        }
        return limit;
    }

    // limit suggestions
    // ===================================================================
    limitSuggestions(suggestions: Array<Suggestion>): void {
        const numberSuggestions = {};

        for (let i = 0; i < suggestions.length; ++i) {
            const suggestion = suggestions[i];
            let suggestionType = suggestion.uiSuggestionType;
            if (suggestionType === SuggestionType.SearchTermHistory) {
                suggestionType = SuggestionType.SearchTermData; // history and data suggestions are merged
            }
            const limit = this.getSuggestionLimit(suggestionType);
            let number = numberSuggestions[suggestionType];
            if (typeof number === "undefined") {
                number = 0;
                numberSuggestions[suggestionType] = number;
            }
            if (number >= limit) {
                suggestions.splice(i, 1);
                --i;
                continue;
            }
            numberSuggestions[suggestionType] = number + 1;
        }
    }

    // update suggestions with restore old selected suggestion
    // ===================================================================
    private updateSuggestions(suggestions: Array<Suggestion>): void {
        const searchFieldInShellId = "searchFieldInShell-input";
        let input = Element.getElementById(searchFieldInShellId) as unknown as SearchInput;
        if (!input) {
            input = this.model.getProperty("/inputHelp");
        }

        // get selected entry in old suggestion list
        let suggestionKey;
        if (!this.model.config.isWebCompSearchFieldGroupEnabled()) {
            const suggestionRows = input.getSuggestionRows() as unknown as ColumnListItem[];
            for (let i = 0; i < suggestionRows.length; ++i) {
                const suggestionRow = suggestionRows[i];
                const suggestion = suggestionRow.getBindingContext().getObject() as Suggestion;
                if (suggestionRow.getSelected()) {
                    suggestionKey = suggestion.key;
                }
            }
        }

        // update suggestions
        this.model.setProperty("/suggestions", suggestions);
        // console.log("xx sug update", suggestions);
        // console.log("suggestions:", suggestions);

        // restore selected entry (ugly time delayed logic)
        if (!this.model.config.isWebCompSearchFieldGroupEnabled()) {
            if (!suggestionKey) {
                return;
            }
            window.setTimeout(() => {
                const suggestionRows = input.getSuggestionRows() as unknown as ColumnListItem[];
                for (let j = 0; j < suggestionRows.length; ++j) {
                    const suggestionRow = suggestionRows[j];
                    const suggestion = suggestionRow.getBindingContext().getObject() as Suggestion;
                    if (suggestion.key === suggestionKey) {
                        input["_oSuggPopover"]._iPopupListSelectedIndex = j; // ugly
                        suggestionRow.setSelected(true);
                        suggestionRow.rerender();
                    }
                }
            }, 100);
        }
    }
}
