// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
/**
 * @fileOverview Search CEP Component for the SAP Fiori Launchpad based on UI5 Web Component ShellBarSearch.
 * @since 1.140.0
 **/
sap.ui.define([
    "sap/ui/core/Element",
    "sap/ui/core/Component",
    "sap/base/Log",
    "sap/ushell/resources",
    "sap/ushell/Container",
    "sap/ushell/EventHub",
    "sap/ushell/components/shell/SearchCEPNew/SearchProviders/SearchProvider",
    "sap/ushell/gen/ui5/webcomponents-fiori/dist/IllustratedMessage",
    "sap/ushell/gen/ui5/webcomponents-fiori/dist/ShellBarSearch",
    "sap/ushell/gen/ui5/webcomponents-fiori/dist/SearchItem",
    "sap/ushell/gen/ui5/webcomponents-fiori/dist/SearchItemGroup",
    "sap/ushell/gen/ui5/webcomponents-fiori/dist/SearchMessageArea",
    "sap/ushell/gen/ui5/webcomponents/dist/Button",
    "sap/ui/model/json/JSONModel",
    "sap/ui/thirdparty/hasher",
    "sap/ushell/api/performance/Extension",
    "sap/ushell/utils",
    "sap/ushell/api/performance/NavigationSource"
], (
    Element,
    Component,
    Log,
    resources,
    Container,
    EventHub,
    SearchProvider,
    IllustratedMessage,
    ShellBarSearch,
    SearchItem,
    SearchItemGroup,
    SearchMessageArea,
    Button,
    JSONModel,
    hasher,
    Extension,
    ushellUtils,
    NavigationSource
) => {
    "use strict";

    /**
     * @name sap.ushell.components.shell.SearchCEPNew
     * @alias sap.ushell.components.shell.SearchCEPNew.Component
     * @description
     * This namespace contains the SearchCEPNew component for the SAP Fiori Launchpad.
     * It provides a new search experience with enhanced features and improved performance.
     * It is designed to replace the legacy search component and is optimized for the latest UI5
     * standards and best practices.
     */
    return Component.extend("sap.ushell.components.shell.SearchCEPNew.Component", {
        metadata: {
            manifest: "json",
            library: ["sap.ushell", "sap.ushell.components.shell"]
        },

        searchProviderMap: {
            RecentSearchesList: "recentSearches",
            AppsList: "applications",
            // evaluate whether to change to FrequentlyUsedItemsList (including products)
            FrequentlyUsedAppsList: "frequentApplications",
            ProductsList: "products",
            ExternalSearchAppsList: "externalSearchApplications"
        },

        iGroupMaxItemCount: 10,

        init: function () {
            this._init();
        },

        /**
         * Initializes the component, sets up the search field, and registers default providers.
         * @private
         */
        _init: async function () {
            this._oSearchCEPService = await Container.getServiceAsync("SearchCEP");
            this._oResultModel = new JSONModel({});
            this._oI18nModel = await this.getModel("i18n").getResourceBundle();
            this._bIsMyHome = Container.getFLPPlatform(true) === "MYHOME";
            this._oShellHeader = Element.getElementById("shell-header");
            this._initSearchField();
            this._registerDefaultProviders();
            this._registerHandleHashChange();

            if (this._oShellHeader.isLargeState() || this._oShellHeader.isExtraLargeState()) {
                this._fetchSuggestions();
                this._toggleSearchFieldInput(true);
            }

            this._aDoables = [];
            this._aDoables.push(EventHub.on("updateExtProviderLists").do(this._updateExtProviderLists.bind(this)));
            this._oExtension = new Extension();
        },

        /**
         * Initializes the search field and binds the result model and actions.
         * @private
         */
        _initSearchField: function () {
            try {
                this._oSearchField = new ShellBarSearch({
                    id: "newCEPShellBarSearch",
                    placeholder: resources.i18n.getText("searchAppTitle"),
                    autoOpen: true,
                    showClearIcon: true
                });
                this._oSearchField.setModel(this._oResultModel, "searchResults");
                this._oSearchField.bindAggregation("items", {
                    path: "searchResults>/results",
                    factory: this._searchItemGroupFactory.bind(this)
                });

                this._attachSearchEventHandlers();
                this._oShellHeader.setSearch(this._oSearchField);
            } catch (oError) {
                Log.error("Failed to create CEP search field content", oError);
            }
        },

        /**
         * Attach all relevant event handlers to the search field
         * @private
         */
        _attachSearchEventHandlers: function () {
            this._fnBoundOnSearch = this._onSearch.bind(this);
            this._fnBoundOnInputChange = this._onInputChange.bind(this);
            this._oSearchField.attachSearch(this._fnBoundOnSearch);
            this._oSearchField.attachInput(this._fnBoundOnInputChange);
        },

        /**
         * Detach all attached event handlers to the search field
         * @private
         */
        _detachSearchEventHandlers: function () {
            this._oSearchField.detachSearch(this._fnBoundOnSearch);
            this._oSearchField.detachInput(this._fnBoundOnInputChange);
        },

        /**
         * Factory for creating search item groups for the search field.
         * @param {string} sId The ID for the search item group.
         * @param {object} oGroupContext The context for the group, containing header text and items.
         * @private
         * @returns {SearchItemGroup} The created search item group.
         * */
        _searchItemGroupFactory: function (sId, oGroupContext) {
            const oGroup = new SearchItemGroup({
                id: sId,
                headerText: oGroupContext.getProperty("headerText"),
                items: {
                    path: `searchResults>${oGroupContext.getPath()}/items`,
                    model: "searchResults",
                    length: this.iGroupMaxItemCount,
                    template: new SearchItem({
                        text: "{searchResults>text}",
                        icon: "{searchResults>icon}",
                        description: "{searchResults>contentProviderLabel}",
                        deletable: false
                    })
                }
            });
            return oGroup;
        },

        /**
         * Registers default search providers with the SearchCEP service.
         * @private
         * */
        _registerDefaultProviders: async function () {
            Object.values(SearchProvider.getDefaultProviders(this._oI18nModel)).forEach(async (oProvider) => {
                await this._oSearchCEPService.registerDefaultSearchProvider(oProvider);
            });
        },

        /**
         * Debounced handler for input changes in the search field. Waits for 100ms before fetching suggestions.
         * @private
         */
        _onInputChange: function () {
            clearTimeout(this._suggestionTimeout);
            this._suggestionTimeout = setTimeout(() => {
                this._fetchSuggestions(this._oSearchField.getValue());
            }, 100);
        },

        /**
         * Fetches suggestions from all registered search providers and updates the model.
         * @param {string} [sQuery] The search query string.
         * @private
         */
        _fetchSuggestions: async function (sQuery) {
            try {
                const aProviders = await this._oSearchCEPService.getSearchProvidersPriorityArray();
                const aProviderSearchPromises = aProviders.map((oProvider) => {
                    const iQueryLength = (sQuery || "").trim().length;

                    if (iQueryLength >= oProvider.minQueryLength && iQueryLength <= oProvider.maxQueryLength) {
                        return oProvider.execSearch(sQuery, this.searchProviderMap[oProvider.id]);
                    }

                    return Promise.resolve([]);
                });
                const aSearchResults = await Promise.all(aProviderSearchPromises);
                this._updateSearchResults(aSearchResults, aProviders);
            } catch (oError) {
                Log.error("Error fetching search suggestions", oError);
            }
        },

        /**
         * Updates the search results in the model and only updates if the results have changed.
         * @param {Array<object>} aSearchResults Array of arrays with search results per provider.
         * @param {Array<object>} aProviders Array of provider objects.
         * @private
         */
        _updateSearchResults: function (aSearchResults, aProviders) {
            const aAllResultsFormatted = this._getResultsFormatted(aSearchResults, aProviders);
            this._oResultModel.setProperty("/allResults", aAllResultsFormatted);
            const iResultCount = this._getResultCount(aAllResultsFormatted);
            this._oResultModel.setProperty("/resultCount", iResultCount);
            const aDisplayResults = this._limitResults(aAllResultsFormatted);
            this._oResultModel.setProperty("/results", aDisplayResults);
            const bHasApplications = aDisplayResults?.[1]?.items?.length > 0; // Applications
            const bHasAnyOtherSearchResult = aDisplayResults.some((group, idx) => idx !== 1 && group?.items?.length > 0);
            this._refreshSearchActionButton(bHasApplications);
            this._updateSearchMessageArea(bHasApplications, bHasAnyOtherSearchResult);
            this._updateIllustratedMessage(bHasApplications, bHasAnyOtherSearchResult);
        },

        /**
         * Formats the search results into a structure suitable for the search field.
         * @param {Array<Array>} aSearchResults Array of arrays with search results per provider.
         * @param {Array<object>} aProviders Array of provider objects.
         * @returns {Array<object>} Formatted search results.
         * @private
         */
        _getResultsFormatted: function (aSearchResults, aProviders) {
            return aSearchResults.map((aGroupResult, idx) => ({
                id: aProviders[idx].id,
                headerText: aProviders[idx].title,
                items: aGroupResult
            }));
        },

        /**
         * Gets the count of all search results.
         * @param {Array<object>} aAllResults Array of all formatted search results.
         * @returns {int} Count of all search results.
         * @private
         */
        _getResultCount: function (aAllResults) {
            const aCountRelevantProviders = ["AppsList", "ProductsList"];
            return aAllResults.reduce((iCount, oGroup) => {
                return iCount + (oGroup?.items && aCountRelevantProviders.includes(oGroup.id) ? oGroup.items.length : 0);
            }, 0);
        },

        /**
         * Limits the number of items in each search result group to a maximum of 4 or the configured maximum item count.
         * @param {Array<object>} aAllResults Array of all formatted search results.
         * @returns {Array<object>} Array of search result groups with limited items.
         * @private
         */
        _limitResults: function (aAllResults) {
            const iEmptyResults = aAllResults.filter((result) => !result || result.items.length === 0).length;

            return aAllResults.map((oGroup) => {
                const aSearchResultsLimited = (oGroup.items && oGroup.items.length > 4 && iEmptyResults < 3)
                    ? oGroup.items.slice(0, 4)
                    : oGroup.items.slice(0, this.iGroupMaxItemCount);

                if (aSearchResultsLimited.length > 0) {
                    return { ...oGroup, items: aSearchResultsLimited };
                }
            });
        },

        /**
         * Updates the external provider lists and triggers suggestions if needed.
         * @private
         */
        _updateExtProviderLists: async function () {
            const aExtProviders = await this._oSearchCEPService.getExternalSearchProvidersPriorityArray();
            aExtProviders.forEach((oProvider) => {
                const oGroup = new SearchItemGroup({
                    headerText: oProvider.title
                });
                this._oSearchField.addItem(oGroup);
            });
            if (aExtProviders.length > 0 && this._oSearchField.getOpen()) {
                this._fetchSuggestions(this._oSearchField.getValue());
            }
        },

        /**
         * Handles the search event, determines navigation target, and saves the search term.
         * @param {object} oEvent The search event object.
         * @private
         */
        _onSearch: async function (oEvent) {
            const oItem = oEvent.getParameter("item");

            const oSearchContext = {
                searchFieldValue: this._oSearchField.getValue ? this._oSearchField.getValue() : this._oSearchField.getParent().getValue(),
                selectedItemContext: oItem?.getBindingContext ? oItem.getBindingContext("searchResults").getObject() : null
            };

            // Case 1: If an item is selected, save the search term and navigate to the app or add a recent search term to the search field.
            if (oSearchContext?.selectedItemContext !== null) {
                this._saveSearchTerm(oSearchContext.searchFieldValue);
                if (oItem.getParent().getHeaderText() === this._oI18nModel.getText("recentSearches")) {
                    oEvent.preventDefault();
                    this._oSearchField.setValue(oSearchContext.selectedItemContext.text);
                    this._fetchSuggestions(oSearchContext.selectedItemContext.text);
                    this._toggleSearchFieldInput(true);
                } else if (oSearchContext.selectedItemContext.isEnterpriseSearch) {
                    oEvent.preventDefault();
                    this._navigateToResultPage(oSearchContext.searchFieldValue, true);
                    this._resetSearchState();
                } else if (oSearchContext.selectedItemContext) {
                    this._navigateToApp(oSearchContext.selectedItemContext, oSearchContext.searchFieldValue);
                    this._fetchSuggestions();
                    this._toggleSearchFieldInput(false);
                }
                // Case 2: If no item is selected, but an input has been made, save the search term and navigate to the results page.
            } else if (oSearchContext.searchFieldValue !== "" && typeof oSearchContext.searchFieldValue === "string") {
                this._saveSearchTerm(oSearchContext.searchFieldValue);
                if (this._bIsMyHome) {
                    // For SAP Start navigate directly to the first application in the suggest list
                    const aResults = this._oResultModel.getData()?.results;
                    oSearchContext.selectedItemContext = aResults?.[1]?.items?.[0];
                    this._navigateToApp(oSearchContext.selectedItemContext, oSearchContext.searchFieldValue);
                } else {
                    this._navigateToResultPage(oSearchContext.searchFieldValue);
                }
                this._resetSearchState();
                // Case 3: If no item is selected and no input has been made, reset the search state.
            } else {
                this._fetchSuggestions();
                // In case search event is fired with no item inside the event we close the suggest list if it's open
                // Cases:
                //  1. after arrow key navigation in the suggest list, item appears selected and search icon is pressed
                //  2. after item deletion in the suggest list, the first group name gets auto selected
                //  3. after a group name is being selected
                if (this._oSearchField.getOpen()) {
                    this._oSearchField.setOpen(false);
                }
            }
        },

        /**
         * Saves the search term to the UserRecents service.
         * @param {string} sTerm The search term to save.
         * @private
         */
        _saveSearchTerm: async function (sTerm) {
            if (!sTerm) {
                return;
            }

            const UserRecents = await Container.getServiceAsync("UserRecents");
            await UserRecents.addSearchActivity({ sTerm });
        },

        /**
         * Navigates to the selected app using the SearchCEP service.
         * @param {object} oResult The selected search result item.
         * @param {string} sSearchTerm The search term.
         * @private
         */
        _navigateToApp: function (oResult, sSearchTerm) {
            if (!oResult) {
                return;
            }

            this._oExtension.addNavigationSource(NavigationSource.SearchCEP);
            this._oSearchCEPService.navigate(oResult, sSearchTerm);
        },

        /**
         * Navigates to the search results page with the given search term.
         * @param {string} sTerm The search term.
         * @param {boolean} [bShowAll] Whether to show all results.
         * @private
         */
        _navigateToResultPage: async function (sTerm, bShowAll) {
            let sHash = `#WorkZoneSearchResult-display?searchTerm=${sTerm}&category=app`;

            if (bShowAll) {
                sHash = `#Action-search&/top=20&filter={"dataSource":{"type":"Category","id":"All","label":"All","labelPlural":"All"},"searchTerm":"${sTerm}",`
                    + "\"rootCondition\":{\"type\":\"Complex\",\"operator\":\"And\",\"conditions\":[]}}";
            }

            const oNavigationService = await Container.getServiceAsync("Navigation");
            await oNavigationService.navigate({
                target: {
                    shellHash: sHash
                }
            });
        },

        /**
         * Refreshes the search action button in the shell bar based on the current search state.
         * @param {boolean} bHasApplications Whether we have applications
         * @private
         */
        _refreshSearchActionButton: function (bHasApplications) {
            if (this._bIsMyHome) {
                return;
            }

            const oActionButton = Element.getElementById("showAllSearchResultsBtn");
            if (oActionButton) {
                oActionButton.destroy();
            }

            if (this._oSearchField.getValue() !== "" && this._oSearchField.getOpen() && bHasApplications) {
                this._oSearchField.addAction(new Button({
                    id: "showAllSearchResultsBtn",
                    text: this._oI18nModel.getText("showAllSearchResults"),
                    click: this._fnBoundOnSearch,
                    design: "Transparent"
                }));
            }
        },

        /**
         * Updates the search message area
         * @param {boolean} bHasApplications Whether we have applications
         * @param {boolean} bHasAnyOtherSearchResult Whether we have any other search result besides applications
         * @private
         */
        _updateSearchMessageArea: function (bHasApplications, bHasAnyOtherSearchResult) {
            const oSearchMessageArea = Element.getElementById("searchMessageArea");

            if (oSearchMessageArea) {
                oSearchMessageArea.destroy();
            }

            if (this._oSearchField.getValue() !== "" && !bHasApplications && bHasAnyOtherSearchResult) {
                this._oSearchField.addMessageArea(new SearchMessageArea({
                    id: "searchMessageArea",
                    text: this._oI18nModel.getText("noSearchResults"),
                    description: this._oI18nModel.getText("tryTheFollowing")
                }));
            }
        },

        /**
         * Updates the search illustrated message
         * @param {boolean} bHasApplications Whether we have applications
         * @param {boolean} bHasAnyOtherSearchResult Whether we have any other search result besides applications
         * @private
         */
        _updateIllustratedMessage: function (bHasApplications, bHasAnyOtherSearchResult) {
            const oSearchIllustratedMessage = Element.getElementById("searchIllustratedMessage");

            if (oSearchIllustratedMessage) {
                oSearchIllustratedMessage.destroy();
            }

            if (this._oSearchField.getValue() === "" && !bHasAnyOtherSearchResult) {
                // Reset results to empty array so IllustratedMessage shows even if array contains only undefined values
                this._oResultModel.setProperty("/results", []);
                this._oSearchField.addIllustration(new IllustratedMessage({
                    id: "searchIllustratedMessage"
                }));
            }

            if (this._oSearchField.getValue() !== "" && !bHasApplications && !bHasAnyOtherSearchResult) {
                this._oResultModel.setProperty("/results", []);
                this._oSearchField.addIllustration(new IllustratedMessage({
                    id: "searchIllustratedMessage",
                    titleText: this._oI18nModel.getText("noSearchMatch"),
                    subtitleText: this._oI18nModel.getText("searchSomethingElse")
                }));
            }
        },

        /**
         * Clears the search field value if needed and closes the suggest list if it's open
         * @param {boolean} [bResetValue] Whether to reset the search field value
         * @private
         */
        _resetSearchState: async function (bResetValue) {
            // Use timeout in order to close the suggest list properly when search is invoked for same search term twice in a row.
            await ushellUtils.awaitTimeout(100);

            if (this._oSearchField.getValue() !== "" && bResetValue) {
                this._oSearchField.setValue("");
            }
            if (this._oSearchField.getOpen()) {
                this._oSearchField.setOpen(false);
            }
        },

        /**
         * Clears search value and fetches all search results when navigation is not to search result page
         * E.g navigating back, clicking on home button, _navigateToApp call, appFinder open etc.
         * @private
         */
        _registerHandleHashChange: function () {
            hasher.changed.add(async (sNewHash) => {
                if (sNewHash !== "" && !(/WorkZoneSearchResult-display|Action-search/.test(sNewHash))) {
                    await this._resetSearchState(true);
                    this._fetchSuggestions();
                }
            });
        },

        /**
         * Toggles the search input field
         * @param {boolean} bExpand Whether to expand the search input
         * @private
         */
        _toggleSearchFieldInput: function (bExpand) {
            const oShellHeaderModel = this._oShellHeader.getComponentInstance().getModel();
            oShellHeaderModel.setProperty("/searchField/show", bExpand);
        },

        /**
         * Destroys the component, cleaning up resources.
         * @private
         */
        exit: function () {
            this._detachSearchEventHandlers();
            this._oSearchField.destroy();
            this._aDoables.forEach((oDoable) => {
                oDoable.off();
            });
            this._aDoables = [];
            Component.prototype.exit.apply(this, arguments);
        }
    });
});
