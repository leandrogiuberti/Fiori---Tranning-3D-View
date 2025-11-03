// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.components.shell.SearchCEPNew.Component
 */
sap.ui.define([
    "sap/ui/core/Element",
    "sap/ui/model/json/JSONModel",
    "sap/ui/thirdparty/hasher",
    "sap/ushell/api/performance/Extension",
    "sap/ushell/components/shell/SearchCEPNew/Component",
    "sap/ushell/components/shell/SearchCEPNew/SearchProviders/SearchProvider",
    "sap/ushell/Container",
    "sap/ushell/gen/ui5/webcomponents-fiori/dist/ShellBarSearch",
    "sap/ushell/gen/ui5/webcomponents-fiori/dist/SearchItemGroup",
    "sap/ushell/EventHub"
], (
    Element,
    JSONModel,
    hasher,
    Extension,
    SearchCEPNew,
    SearchProvider,
    Container,
    ShellBarSearch,
    SearchItemGroup,
    EventHub
) => {
    "use strict";

    /* global QUnit, sinon */

    const sandbox = sinon.createSandbox({});

    const aProviders = [{
        id: "RecentSearchesList",
        entryType: "app",
        title: "Recent Searches",
        titleVisible: false,
        minQueryLength: 0,
        maxQueryLength: 0,
        defaultItemCount: 2,
        maxItemCount: 50,
        priority: 0,
        name: "RecentSearchesList",
        execSearch: () => {}
    }, {
        id: "AppsList",
        entryType: "app",
        title: "Applications",
        showNoData: true,
        titleVisible: false,
        highlightResult: true,
        highlightSearchStringPart: true,
        minQueryLength: 1,
        maxQueryLength: 100,
        defaultItemCount: 6,
        maxItemCount: 50,
        priority: 0,
        name: "AppsList",
        execSearch: () => {}
    }, {
        id: "FrequentlyUsedAppsList",
        entryType: "product",
        title: "Frequently Used Apps",
        titleVisible: true,
        minQueryLength: 0,
        maxQueryLength: 0,
        defaultItemCount: 6,
        maxItemCount: 50,
        priority: 1,
        name: "FrequentlyUsedAppsList",
        execSearch: () => {}
    }, {
        id: "ProductsList",
        entryType: "app",
        title: "Products",
        titleVisible: true,
        minQueryLength: 0,
        maxQueryLength: 0,
        defaultItemCount: 6,
        maxItemCount: 50,
        priority: 2,
        name: "ProductsList",
        execSearch: () => {}
    }, {
        id: "ExternalSearchAppsList",
        entryType: "app",
        title: "Search Within",
        titleVisible: true,
        minQueryLength: 1,
        maxQueryLength: 100,
        defaultItemCount: 4,
        maxItemCount: 50,
        priority: 2,
        name: "ExternalSearchAppsList",
        execSearch: () => {}
    }, {
        id: "ExternalSearchProvider",
        entryType: "product",
        title: "Your travel assistant",
        titleVisible: true,
        minQueryLength: 1,
        maxQueryLength: 100,
        defaultItemCount: 4,
        maxItemCount: 50,
        priority: 101,
        name: "ExternalSearchProvider",
        execSearch: () => { }
    }];

    QUnit.module("Component Initialization", {
        beforeEach: async function () {
            this.oRegisterDefaultSearchProviderStub = sandbox.stub();
            this.oSearchCEPServiceStub = sandbox.stub(Container, "getServiceAsync").resolves({
                registerDefaultSearchProvider: this.oRegisterDefaultSearchProviderStub
            });
            this.oGetResourceBundleStub = sandbox.stub().returns({
                getText: sandbox.stub()
            });
            this.oGetModelStub = sandbox.stub(SearchCEPNew.prototype, "getModel").withArgs("i18n").returns({
                getResourceBundle: this.oGetResourceBundleStub
            });
            this.oGetPlatformStub = sandbox.stub(Container, "getFLPPlatform");
            this.oSetSearchFieldStub = sandbox.stub();
            this.oIsLargeStateStub = sandbox.stub().returns(true);
            this.oShellHeaderStub = sandbox.stub(Element, "getElementById").withArgs("shell-header").returns({
                setSearch: this.oSetSearchFieldStub,
                isLargeState: this.oIsLargeStateStub,
                isExtraLargeState: sandbox.stub()
            });
            this.oInitSearchFieldSpy = sandbox.spy(SearchCEPNew.prototype, "_initSearchField");
            this.oRegisterDefaultProvidersSpy = sandbox.spy(SearchCEPNew.prototype, "_registerDefaultProviders");
            this.oRegisterHandleHashChangeSpy = sandbox.spy(SearchCEPNew.prototype, "_registerHandleHashChange");
            this.oFetchSuggestionsStub = sandbox.stub(SearchCEPNew.prototype, "_fetchSuggestions");
            this.oToggleSearchInputFieldStub = sandbox.stub(SearchCEPNew.prototype, "_toggleSearchFieldInput");
            this.oDoStub = sandbox.stub();
            sandbox.stub(EventHub, "on").withArgs("updateExtProviderLists").returns({
                do: this.oDoStub
            });
            this.oSearchFieldSetModelSpy = sandbox.spy(ShellBarSearch.prototype, "setModel");
            this.oSearchFieldBindAggregationSpy = sandbox.spy(ShellBarSearch.prototype, "bindAggregation");
            this.oAttachSearchEventHandlersStub = sandbox.stub(SearchCEPNew.prototype, "_attachSearchEventHandlers");
            this.oGetDefaultProvidersSpy = sandbox.spy(SearchProvider, "getDefaultProviders");
            this.oHasherAddSpy = sandbox.spy(hasher.changed, "add");
            this.oResetSearchStateStub = sandbox.stub(SearchCEPNew.prototype, "_resetSearchState");
            this.oComponent = await new SearchCEPNew();
        },
        afterEach: function () {
            this.oComponent._oSearchField.destroy();
            sandbox.restore();
        }
    });

    QUnit.test("_init - Creates the CEP Search component", function (assert) {
        // Assert
        assert.ok(this.oSearchCEPServiceStub.calledOnce, "SearchCEP service was created");
        assert.ok(this.oComponent._oResultModel instanceof JSONModel, "JSONModel was created");
        assert.ok(this.oGetResourceBundleStub.calledOnce, "i18n getResourceBundle was called");
        assert.ok(this.oGetPlatformStub.calledOnce, "FLP platform was retrieved");
        assert.ok(this.oShellHeaderStub.calledOnce, "Shell header was accessed");
        assert.ok(this.oInitSearchFieldSpy.calledOnce, "_initSearchField was called");
        assert.ok(this.oRegisterDefaultProvidersSpy.calledOnce, "_registerDefaultProviders was called");
        assert.ok(this.oRegisterHandleHashChangeSpy.calledOnce, "_registerHandleHashChange was called");
        assert.ok(this.oFetchSuggestionsStub.calledOnce, "_fetchSuggestions was called when search field is initially expanded");
        assert.ok(this.oToggleSearchInputFieldStub.calledWith(true), "_toggleSearchFieldInput was called when search field is initially expanded");
        assert.ok(this.oDoStub.calledOnce, "EventHub do was called");
        assert.ok(this.oComponent._oExtension instanceof Extension, "_oExtension was created");
    });

    QUnit.test("_initSearchField - Creates the ShellBarSearch web component", function (assert) {
        // Assert
        assert.ok(this.oComponent._oSearchField instanceof ShellBarSearch, "_oSearchField is instance of ShellBarSearch");
        assert.ok(this.oComponent._oSearchField.getAutoOpen(), "_oSearchField autoOpen prop is true");
        assert.strictEqual(this.oComponent._oSearchField.getId(), "newCEPShellBarSearch", "_oSearchField has correct id");
        assert.ok(this.oSearchFieldSetModelSpy.calledWith(this.oComponent._oResultModel, "searchResults"), "_oSearchField.setModel was called with correct parameters");
        assert.ok(this.oSearchFieldBindAggregationSpy.calledWith("items"), "_oSearchField.bingAggregation was called and correctly bind items aggregation");
        assert.ok(this.oSetSearchFieldStub.calledWith(this.oComponent._oSearchField), "Search field was set on the shell header");
        assert.ok(this.oAttachSearchEventHandlersStub.calledOnce, "_attachSearchEventHandlers was called");
    });

    QUnit.test("_searchItemGroupFactory - Creates SearchItemGroup", function (assert) {
        // Arrange
        const sId = "recentSearchesGroup";
        const sHeaderText = "Recent Searches";
        const sItemsBindingPath = "/results/0/";
        const oGroupContext = {
            getProperty: sandbox.stub().withArgs("headerText").returns(sHeaderText),
            getPath: sandbox.stub().returns(sItemsBindingPath)
        };
        // Act
        const oGroup = this.oComponent._searchItemGroupFactory(sId, oGroupContext);
        // Assert
        assert.ok(oGroup instanceof SearchItemGroup, "_searchItemGroupFactory creates Recent Searches group instance of SearchItemGroup");
        assert.strictEqual(oGroup.getId(), sId, "Group has correct id");
        assert.strictEqual(oGroup.getProperty("headerText"), sHeaderText, "Group has correct headerText");
        assert.strictEqual(oGroup.getBindingInfo("items").model, "searchResults", "Group has correct aggregation model for items");
        assert.strictEqual(oGroup.getBindingInfo("items").path, `${sItemsBindingPath}/items`, "Group has correct binding path for items");
    });

    QUnit.test("_registerDefaultProviders - SearchCEP service registers default providers", function (assert) {
        // Assert
        assert.ok(this.oGetDefaultProvidersSpy.calledWith(this.oComponent._oI18nModel), "SearchProvider.getDefaultProviders called with correct param");
        assert.ok(this.oRegisterDefaultSearchProviderStub.callCount === 5, "_oSearchCEPService.registerDefaultSearchProvider called for each default provider");
    });

    QUnit.test("_registerHandleHashChange - Reset search state and fetch results", async function (assert) {
        // Arrange
        const fnCallback = this.oHasherAddSpy.firstCall.args[0];
        // Act
        await fnCallback("NotResultPageURL");
        // Assert
        assert.ok(this.oHasherAddSpy.calledOnce, "hasher.changed.add was called");
        assert.ok(this.oFetchSuggestionsStub.calledTwice, "_fetchSuggestions was called again");
        assert.ok(this.oResetSearchStateStub.calledWith(true), "_resetSearchState called with correct parameter");
    });

    QUnit.module("Search Related Methods", {
        beforeEach: async function () {
            this.oProviderExecSearchStub = sandbox.stub();
            this.aProvidersExecSearchStub = aProviders.map((oProvider) => ({
                ...oProvider,
                execSearch: this.oProviderExecSearchStub
            }));
            this.oGetSearchProvidersPriorityArrayStub = sandbox.stub().resolves(this.aProvidersExecSearchStub);
            this.oSearchCEPServiceStub = sandbox.stub(Container, "getServiceAsync").resolves({
                getSearchProvidersPriorityArray: this.oGetSearchProvidersPriorityArrayStub,
                registerDefaultSearchProvider: sandbox.stub()
            });
            this.oAddSearchActivityStub = sandbox.stub();
            this.oSearchCEPServiceStub.withArgs("UserRecents").resolves({
                addSearchActivity: this.oAddSearchActivityStub
            });
            sandbox.stub(Container, "getFLPPlatform");
            this.oShellModelSetPropertyStub = sandbox.stub();
            sandbox.stub(Element, "getElementById").withArgs("shell-header").returns({
                setSearch: sandbox.stub(),
                isLargeState: sandbox.stub(),
                isExtraLargeState: sandbox.stub(),
                getComponentInstance: sandbox.stub().returns({
                    getModel: sandbox.stub().returns({
                        setProperty: this.oShellModelSetPropertyStub
                    })
                })
            });
            this.oComponent = await new SearchCEPNew();
            this.oRefreshSearchActionButton = sandbox.stub(this.oComponent, "_refreshSearchActionButton");
            this.oUpdateSearchMessageArea = sandbox.stub(this.oComponent, "_updateSearchMessageArea");
            this.oUpdateIllustratedMessage = sandbox.stub(this.oComponent, "_updateIllustratedMessage");
        },
        afterEach: function () {
            this.oComponent._oSearchField.destroy();
            sandbox.restore();
        }
    });

    QUnit.test("_attachSearchEventHandlers - Attach search and input change event handlers", function (assert) {
        // Arrange
        const oAttachSearchStub = sandbox.stub(this.oComponent._oSearchField, "attachSearch");
        const oAttachInputStub = sandbox.stub(this.oComponent._oSearchField, "attachInput");
        // Act
        this.oComponent._attachSearchEventHandlers();
        // Assert
        assert.ok(oAttachSearchStub.calledWith(this.oComponent._fnBoundOnSearch), "_oSearchField.attachSearch called with correct bound callback");
        assert.ok(oAttachInputStub.calledWith(this.oComponent._fnBoundOnInputChange), "_oSearchField.attachInput called with correct bound callback");
    });

    QUnit.test("_detachSearchEventHandlers - Detach search and input change event handlers", function (assert) {
        // Arrange
        const oDetachSearchStub = sandbox.stub(this.oComponent._oSearchField, "detachSearch");
        const oDetachInputStub = sandbox.stub(this.oComponent._oSearchField, "detachInput");
        // Act
        this.oComponent._detachSearchEventHandlers();
        // Assert
        assert.ok(oDetachSearchStub.calledWith(this.oComponent._fnBoundOnSearch), "_oSearchField.detachSearch called with correct bound callback");
        assert.ok(oDetachInputStub.calledWith(this.oComponent._fnBoundOnInputChange), "_oSearchField.detachInput called with correct bound callback");
    });

    QUnit.test("_onInputChange - Fetch suggest results with user search term", async function (assert) {
        // Arrange
        const done = assert.async();
        const sQuery = "Search query";
        const oFetchSuggestionsStub = sandbox.stub(this.oComponent, "_fetchSuggestions");
        sandbox.stub(this.oComponent._oSearchField, "getValue").returns(sQuery);
        // Act
        this.oComponent._onInputChange();
        // Assert
        setTimeout(() => {
            assert.ok(oFetchSuggestionsStub.calledWith(sQuery), "_fetchSuggestions was called with correct parameter");
            done();
        }, 150);
    });

    QUnit.test("_fetchSuggestions - Fetch search providers and update search results", async function (assert) {
        // Arrange
        const oUpdateResultsStub = sandbox.stub(this.oComponent, "_updateSearchResults");
        const aSearchResults = [[{ icon: "sap-icon://history", text: "Recent Search" }], []];
        const sQuery = "Search query";
        sandbox.stub(Promise, "all").resolves(aSearchResults);
        // Act
        await this.oComponent._fetchSuggestions(sQuery);
        // Assert
        assert.ok(this.oGetSearchProvidersPriorityArrayStub.calledOnce, "Search providers were fetched");
        assert.ok(this.oProviderExecSearchStub.callCount === 3, "oProvider.execSearch called for providers with required search term only");
        assert.ok(this.oProviderExecSearchStub.calledWith(sQuery), "oProvider.execSearch called with correct query");
        assert.ok(oUpdateResultsStub.calledWith(aSearchResults, this.aProvidersExecSearchStub), "_updateSearchResults was called with correct parameters");
        // Act
        await this.oComponent._fetchSuggestions();
        // Assert
        assert.ok(this.oProviderExecSearchStub.callCount === 6, "oProvider.execSearch called for search providers which don't require search term");
        assert.ok(this.oProviderExecSearchStub.calledWith(), "oProvider.execSearch called with correct query");
    });

    QUnit.test("_getResultsFormatted and _updateSearchResults - Format search results and update the result model", function (assert) {
        // Arrange
        const aSearchResults = [
            [{ text: "Recent Searches" }],
            [{ text: "Application" }],
            [{ text: "Frequently Used Applications" }],
            [{ text: "Products" }],
            [{ text: "Search Within" }],
            [{ text: "External Search Providers" }]
        ];
        // Act
        this.oComponent._updateSearchResults(aSearchResults, aProviders);
        // Assert
        const aUpdatedResults = this.oComponent._oResultModel.getProperty("/results");
        assert.ok(this.oRefreshSearchActionButton.calledWith(true), "_refreshSearchActionButton was called with correct parameters");
        assert.ok(this.oUpdateSearchMessageArea.calledWith(true, true), "_updateSearchMessageArea  was called with correct parameters");
        assert.ok(this.oUpdateIllustratedMessage.calledWith(true, true), "_updateIllustratedMessage  was called with correct parameters");
        // _getResultsFormatted test
        assert.strictEqual(aUpdatedResults.length, 6, "Results array has correct length");
        assert.strictEqual(aUpdatedResults[0].id, aProviders[0].id, "Results has correct id");
        assert.strictEqual(aUpdatedResults[0].headerText, aProviders[0].title, "Results has correct headerText");
        assert.deepEqual(aUpdatedResults[0].items, aSearchResults[0], "Result has correct items");
    });

    QUnit.test("_updateSearchResults - When no search results are available we show the respective Illustrated Message", function (assert) {
        // Arrange
        const aSearchResults = [[], [], [], [], [], []];
        // Act
        this.oComponent._updateSearchResults(aSearchResults, aProviders);
        // Assert
        assert.ok(this.oRefreshSearchActionButton.calledWith(false), "_refreshSearchActionButton was called with correct parameters which results in Action Button being hidden");
        assert.ok(this.oUpdateSearchMessageArea.calledWith(false, false), "_updateSearchMessageArea was called with correct parameters which results in Search Message being hidden");
        assert.ok(this.oUpdateIllustratedMessage.calledWith(false, false), "_updateIllustratedMessage was called with correct parameters which results in Illustrated Message being shown");
    });

    QUnit.test("_updateSearchResults - When applications are available suggest list is shown", function (assert) {
        // Arrange
        const aSearchResults = [[], [{ text: "Application" }], [], [], [], []];
        // Act
        this.oComponent._updateSearchResults(aSearchResults, aProviders);
        // Assert
        assert.ok(this.oRefreshSearchActionButton.calledWith(true), "_refreshSearchActionButton was called with correct parameters which results in Action Button being shown");
        assert.ok(this.oUpdateSearchMessageArea.calledWith(true, false), "_updateSearchMessageArea was called with correct parameters which results in Search Message being hidden");
        assert.ok(this.oUpdateIllustratedMessage.calledWith(true, false), "_updateIllustratedMessage was called with correct parameters which results in Illustrated Message being hidden");
    });

    QUnit.test("_updateSearchResults - When no applications are available but other search results are (External search providers) we show the Message Area", function (assert) {
        // Arrange
        const aSearchResults = [[], [], [], [], [], [{ text: "External Search Providers" }]];
        // Act
        this.oComponent._updateSearchResults(aSearchResults, aProviders);
        // Assert
        assert.ok(this.oRefreshSearchActionButton.calledWith(false), "_refreshSearchActionButton was called with correct parameters which results in Action Button being hidden");
        assert.ok(this.oUpdateSearchMessageArea.calledWith(false, true), "_updateSearchMessageArea was called with correct parameters which results in Search Message being shown");
        assert.ok(this.oUpdateIllustratedMessage.calledWith(false, true), "_updateIllustratedMessage was called with correct parameters which results in Illustrated Message being hidden");
    });

    QUnit.test("_toggleSearchFieldInput - Toggle ShellBar '/searchField/show' model property", function (assert) {
        // Arrange
        const bExpand = true;
        // Act
        this.oComponent._toggleSearchFieldInput(bExpand);
        // Assert
        assert.ok(this.oShellModelSetPropertyStub.calledWith("/searchField/show", bExpand), "_toggleSearchFieldInput called with correct parameters");
    });

    QUnit.test("_saveSearchTerm - Save the search term to the UserRecents service", async function (assert) {
        // Arrange
        const sTerm = "Search query";
        // Act
        await this.oComponent._saveSearchTerm(sTerm);
        // Assert
        assert.ok(this.oAddSearchActivityStub.calledWith({ sTerm }), "UserRecents.addSearchActivity called with correct parameter");
    });

    QUnit.test("_saveSearchTerm - Return early if no search term is passed", async function (assert) {
        // Act
        await this.oComponent._saveSearchTerm();
        // Assert
        assert.ok(this.oAddSearchActivityStub.notCalled, "UserRecents.addSearchActivity not called");
    });

    QUnit.module("Search Event Cases", {
        beforeEach: async function () {
            this.oEventGetParameterStub = sandbox.stub();
            this.oEventPreventDefaultStub = sandbox.stub();
            this.oEvent = {
                preventDefault: this.oEventPreventDefaultStub,
                getParameter: this.oEventGetParameterStub
            };
            sandbox.stub(Container, "getServiceAsync").withArgs("SearchCEP").resolves({
                getSearchProvidersPriorityArray: sandbox.stub(),
                registerDefaultSearchProvider: sandbox.stub()
            });
            sandbox.stub(Container, "getFLPPlatform");
            sandbox.stub(Element, "getElementById").withArgs("shell-header").returns({
                setSearch: sandbox.stub(),
                isLargeState: sandbox.stub(),
                isExtraLargeState: sandbox.stub()
            });
            this.oFetchSuggestionsStub = sandbox.stub(SearchCEPNew.prototype, "_fetchSuggestions");
            this.oSaveSearchTermStub = sandbox.stub(SearchCEPNew.prototype, "_saveSearchTerm");
            this.oToggleSearchFieldInputStub = sandbox.stub(SearchCEPNew.prototype, "_toggleSearchFieldInput");
            this.oNavigateToResultPage = sandbox.stub(SearchCEPNew.prototype, "_navigateToResultPage");
            this.oResetSearchState = sandbox.stub(SearchCEPNew.prototype, "_resetSearchState");
            this.oNavigateToApp = sandbox.stub(SearchCEPNew.prototype, "_navigateToApp");
            this.oComponent = await new SearchCEPNew();
        },
        afterEach: function () {
            this.oComponent._oSearchField.destroy();
            sandbox.restore();
        }
    });

    QUnit.test("_onSearch - Fetch suggestions when recent search was selected", async function (assert) {
        // Arrange
        const selectedItemContext = {
            text: "Recent Search",
            icon: "sap-icon://history"
        };
        this.oEventGetParameterStub.returns({
            getBindingContext: sandbox.stub().returns({
                getObject: sandbox.stub().returns(selectedItemContext)
            }),
            getParent: sandbox.stub().returns({
                getHeaderText: sandbox.stub().returns("Recent Searches")
            })
        });
        const oSearchFieldSetValueStub = sandbox.stub(this.oComponent._oSearchField, "setValue");
        // Act
        await this.oComponent._onSearch(this.oEvent);
        // Assert
        assert.ok(this.oSaveSearchTermStub.calledWith(""), "_saveSearchTerm was called with correct parameter");
        assert.ok(this.oEventPreventDefaultStub.calledOnce, "oEvent.preventDefault was called");
        assert.ok(oSearchFieldSetValueStub.calledWith(selectedItemContext.text), "_oSearchField.setValue was called with correct parameter");
        assert.ok(this.oFetchSuggestionsStub.calledWith(selectedItemContext.text), "_fetchSuggestions was called with correct parameter");
        assert.ok(this.oToggleSearchFieldInputStub.calledWith(true), "_toggleSearchFieldInput was called with correct parameter");
    });

    QUnit.test("_onSearch - Navigate to Enterprise Search result page", async function (assert) {
        // Arrange
        const sQuery = "Search Query";
        const selectedItemContext = {
            text: "Enterprise Search",
            icon: "sap-icon://search",
            isEnterpriseSearch: true
        };
        this.oEventGetParameterStub.returns({
            getBindingContext: sandbox.stub().returns({
                getObject: sandbox.stub().returns(selectedItemContext)
            }),
            getParent: sandbox.stub().returns({
                getHeaderText: sandbox.stub()
            })
        });
        // Act
        this.oComponent._oSearchField.setValue(sQuery);
        await this.oComponent._onSearch(this.oEvent);
        // Assert
        assert.ok(this.oSaveSearchTermStub.calledWith(sQuery), "_saveSearchTerm was called with correct parameter");
        assert.ok(this.oEventPreventDefaultStub.calledOnce, "oEvent.preventDefault was called");
        assert.ok(this.oNavigateToResultPage.calledWith(sQuery, true), "_navigateToResultPage was called with correct parameters");
        assert.ok(this.oResetSearchState.calledWith(), "_resetSearchState was called without parameter");
    });

    QUnit.test("_onSearch - Navigate to selected application", async function (assert) {
        // Arrange
        const sQuery = "Search Query";
        const selectedItemContext = {
            text: "Application",
            icon: "sap-icon://application"
        };
        this.oEventGetParameterStub.returns({
            getBindingContext: sandbox.stub().returns({
                getObject: sandbox.stub().returns(selectedItemContext)
            }),
            getParent: sandbox.stub().returns({
                getHeaderText: sandbox.stub()
            })
        });
        this.oComponent._oSearchField.setValue(sQuery);
        // Act
        await this.oComponent._onSearch(this.oEvent);
        // Assert
        assert.ok(this.oSaveSearchTermStub.calledWith(sQuery), "_saveSearchTerm was called with correct parameter");
        assert.ok(this.oNavigateToApp.calledWith(selectedItemContext, sQuery), "_navigateToApp was called with correct parameters");
        assert.ok(this.oFetchSuggestionsStub.calledWith(), "_fetchSuggestions was called without parameter");
        assert.ok(this.oToggleSearchFieldInputStub.calledWith(false), "_toggleSearchFieldInput was called with correct parameter");
    });

    QUnit.test("_onSearch - Navigate to result page", async function (assert) {
        // Arrange
        const sQuery = "Search Query";
        this.oEventGetParameterStub.returns({
            getBindingContext: sandbox.stub().returns({
                getObject: sandbox.stub().returns(null)
            }),
            getParent: sandbox.stub().returns({
                getHeaderText: sandbox.stub()
            })
        });
        this.oComponent._oSearchField.setValue(sQuery);
        // Act
        await this.oComponent._onSearch(this.oEvent);
        // Assert
        assert.ok(this.oSaveSearchTermStub.calledWith(sQuery), "_saveSearchTerm was called with correct parameter");
        assert.ok(this.oNavigateToResultPage.calledWith(sQuery), "_navigateToResultPage was called with correct parameters");
        assert.ok(this.oResetSearchState.calledWith(), "_resetSearchState was called without parameter");
    });

    QUnit.test("_onSearch - Open first application for SAP Start scenario", async function (assert) {
        // Arrange
        const sQuery = "Search Query";
        const aResults = {
            results: [{}, { headerText: "Applications", id: "AppList", items: [{ title: "App1" }, { title: "App2" }] }]
        };
        this.oEventGetParameterStub.returns({
            getBindingContext: sandbox.stub().returns({
                getObject: sandbox.stub().returns(null)
            }),
            getParent: sandbox.stub().returns({
                getHeaderText: sandbox.stub()
            })
        });
        sandbox.stub(this.oComponent._oResultModel, "getData").returns(aResults);
        this.oComponent._oSearchField.setValue(sQuery);
        this.oComponent._bIsMyHome = true;
        // Act
        await this.oComponent._onSearch(this.oEvent);
        // Assert
        assert.ok(this.oSaveSearchTermStub.calledWith(sQuery), "_saveSearchTerm was called with correct parameter");
        assert.ok(this.oNavigateToApp.calledWith(aResults.results[1].items[0], sQuery), "_navigateToApp was called with correct parameters");
        assert.ok(this.oResetSearchState.calledWith(), "_resetSearchState was called without parameter");
    });

    QUnit.test("_onSearch - Fetch suggestions initially", async function (assert) {
        // Arrange
        this.oEventGetParameterStub.returns(undefined);
        this.oComponent._oSearchField.setOpen(true);
        const oSearchFieldSetOpenStub = sandbox.stub(this.oComponent._oSearchField, "setOpen");
        // Act
        await this.oComponent._onSearch(this.oEvent);
        // Assert
        assert.ok(this.oEventGetParameterStub.calledWith("item"), "Event.getParameter was called with correct parameter");
        assert.ok(this.oFetchSuggestionsStub.calledOnce, "_fetchSuggestions was called");
        assert.ok(oSearchFieldSetOpenStub.calledWith(false), "suggest list was closed if was open");
    });

    QUnit.module("Navigate To App", {
        beforeEach: async function () {
            this.oNavStub = sandbox.stub();
            sandbox.stub(Container, "getServiceAsync").withArgs("SearchCEP").resolves({
                navigate: this.oNavStub,
                registerDefaultSearchProvider: sandbox.stub()
            });
            sandbox.stub(Container, "getFLPPlatform");
            sandbox.stub(Element, "getElementById").withArgs("shell-header").returns({
                setSearch: sandbox.stub(),
                isLargeState: sandbox.stub(),
                isExtraLargeState: sandbox.stub()
            });
            this.oComponent = await new SearchCEPNew();
        },
        afterEach: function () {
            this.oComponent._oSearchField.destroy();
            sandbox.restore();
        }
    });

    QUnit.test("_navigateToApp - Navigate to app intent", async function (assert) {
        // Arrange
        const oAppContext = {
            fioriAppId: "",
            title: "App Extension Sample",
            longDescription: "",
            icon: "sap-icon://puzzle",
            label: "App Extension Sample",
            contentProviderLabel: "local",
            url: "#Action-toAppExtensionSample?sap-ui-app-id-hint=sap.ushell.demo.AppExtensionSample",
            text: "App Extension Sample"
        };
        const sSearchString = "App Ext";
        // Act
        await this.oComponent._navigateToApp(oAppContext, sSearchString);
        // Assert
        assert.ok(this.oNavStub.calledOnce, "Navigation was triggered once");
        assert.ok(this.oNavStub.calledWith(oAppContext, sSearchString), "_oSearchCEPService.navigate was called with correct parameters");
    });

    QUnit.test("_navigateToApp - Navigation not triggered because of missing application", async function (assert) {
        const sSearchString = "App Ext";
        // Act
        await this.oComponent._navigateToApp(undefined, sSearchString);
        // Assert
        assert.ok(this.oNavStub.notCalled, "_oSearchCEPService.navigate was not called");
    });

    QUnit.module("Navigate To Result Page", {
        beforeEach: async function () {
            const oGetServiceStub = sandbox.stub(Container, "getServiceAsync");
            oGetServiceStub.withArgs("SearchCEP").resolves({
                registerDefaultSearchProvider: sandbox.stub()
            });
            this.oNavigationServiceNavigateStub = sandbox.stub();
            oGetServiceStub.withArgs("Navigation").resolves({
                navigate: this.oNavigationServiceNavigateStub
            });
            sandbox.stub(Container, "getFLPPlatform");
            sandbox.stub(Element, "getElementById").withArgs("shell-header").returns({
                setSearch: sandbox.stub(),
                isLargeState: sandbox.stub(),
                isExtraLargeState: sandbox.stub()
            });

            this.oComponent = await new SearchCEPNew();
        },
        afterEach: function () {
            this.oComponent._oSearchField.destroy();
            sandbox.restore();
        }
    });

    QUnit.test("_navigateToResultPage - Navigate to CEP result page for given search term", async function (assert) {
        // Arrange
        const sSearchString = "CEP Search";
        // Act
        await this.oComponent._navigateToResultPage(sSearchString, false);
        // Assert
        assert.ok(this.oNavigationServiceNavigateStub.calledOnce, "NavigationService navigation was called once");
        assert.ok(this.oNavigationServiceNavigateStub.calledWith({
            target: {
                shellHash: `#WorkZoneSearchResult-display?searchTerm=${sSearchString}&category=app`
            }
        }), "NavigationService navigation was called with correct target for CEP Search");
    });

    QUnit.test("_navigateToResultPage - Navigate to Enterprise Search result page for given search term", async function (assert) {
        // Arrange
        const sSearchString = "Enterprise Search";
        // Act
        await this.oComponent._navigateToResultPage(sSearchString, true);
        // Assert
        assert.ok(this.oNavigationServiceNavigateStub.calledOnce, "NavigationService navigation was called once");
        const shellHash = `#Action-search&/top=20&filter={"dataSource":{"type":"Category","id":"All","label":"All","labelPlural":"All"},"searchTerm":"${sSearchString}",`
            + "\"rootCondition\":{\"type\":\"Complex\",\"operator\":\"And\",\"conditions\":[]}}";
        assert.ok(this.oNavigationServiceNavigateStub.calledWith({
            target: {
                shellHash
            }
        }), "NavigationService navigation was called with correct target for Enterprise Search");
    });

    QUnit.module("State Management", {
        beforeEach: async function () {
            sandbox.stub(Container, "getServiceAsync").withArgs("SearchCEP").resolves({
                registerDefaultSearchProvider: sandbox.stub()
            });
            sandbox.stub(Container, "getFLPPlatform");
            sandbox.stub(Element, "getElementById").withArgs("shell-header").returns({
                setSearch: sandbox.stub(),
                isLargeState: sandbox.stub(),
                isExtraLargeState: sandbox.stub()
            });
            this.oComponent = await new SearchCEPNew();
        },
        afterEach: function () {
            this.oComponent._oSearchField.destroy();
            sandbox.restore();
        }
    });

    QUnit.test("_resetSearchState - Clear the search field value and close the suggest list", async function (assert) {
        // Arrange
        this.oComponent._oSearchField.setValue("Test Search");
        this.oComponent._oSearchField.setOpen(true);
        this.oSetOpenStub = sandbox.stub(this.oComponent._oSearchField, "setOpen");
        // Act
        await this.oComponent._resetSearchState(true);

        // Assert
        assert.strictEqual(this.oComponent._oSearchField.getValue(), "", "Search field value was reset");
        assert.ok(this.oSetOpenStub.calledWith(false), "Search field was closed");
    });

    QUnit.test("_resetSearchState - Does not clear search field value or call _oSearchField.setOpen", async function (assert) {
        // Arrange
        const sQuery = "Test Search";
        this.oComponent._oSearchField.setValue(sQuery);
        this.oComponent._oSearchField.setOpen(false);
        this.oSetOpenStub = sandbox.stub(this.oComponent._oSearchField, "setOpen");
        // Act
        await this.oComponent._resetSearchState(false);
        // Assert
        assert.strictEqual(this.oComponent._oSearchField.getValue(), sQuery, "Search field value was not reset");
        assert.ok(this.oSetOpenStub.notCalled, "_oSearchField.setOpen was not called");
    });

    QUnit.module("Action Button", {
        beforeEach: async function () {
            sandbox.stub(Container, "getServiceAsync").withArgs("SearchCEP").resolves({
                registerDefaultSearchProvider: sandbox.stub()
            });
            sandbox.stub(Container, "getFLPPlatform");
            this.oElementGetElementByIdStub = sandbox.stub(Element, "getElementById");
            this.oElementGetElementByIdStub.withArgs("shell-header").returns({
                setSearch: sandbox.stub(),
                isLargeState: sandbox.stub(),
                isExtraLargeState: sandbox.stub()
            });
            this.oActionButtonDestroyStub = sandbox.stub();
            this.sButtonId = "showAllSearchResultsBtn";
            this.oComponent = await new SearchCEPNew();
        },
        afterEach: function () {
            this.oComponent._oSearchField.destroy();
            sandbox.restore();
        }
    });

    QUnit.test("_refreshSearchActionButton - Hide Action Button for SAP Start", async function (assert) {
        // Arrange
        this.oComponent._bIsMyHome = true;
        // Act
        await this.oComponent._refreshSearchActionButton(true);
        // Assert
        assert.ok(this.oElementGetElementByIdStub.calledOnce, "Element.getElementById not called because of early exist");
    });

    QUnit.test("_refreshSearchActionButton - Action Button is destroyed and created again on search", async function (assert) {
        // Arrange
        this.oElementGetElementByIdStub.withArgs(this.sButtonId).returns({
            destroy: this.oActionButtonDestroyStub
        });
        this.oComponent._oSearchField.setValue("Some Value");
        this.oComponent._oSearchField.setOpen(true);
        const oSearchFieldAddActionStub = sandbox.stub(this.oComponent._oSearchField, "addAction");
        // Act
        await this.oComponent._refreshSearchActionButton(true);
        // Assert
        const oButton = oSearchFieldAddActionStub.firstCall.args[0];
        assert.ok(this.oActionButtonDestroyStub.calledOnce, "oActionButton.destroy was called");
        assert.ok(oSearchFieldAddActionStub.calledOnce, "_oSearchField.addAction was called");
        assert.strictEqual(oButton.getId(), this.sButtonId, "Action Button has correct id");
        assert.strictEqual(oButton.getProperty("text"), "Show All Search Results", "Action Button has correct text");
    });

    QUnit.test("_refreshSearchActionButton - Action Button is not available and should not be displayed after search", async function (assert) {
        // Arrange
        this.oElementGetElementByIdStub.withArgs(this.sButtonId).returns(undefined);
        this.oComponent._oSearchField.setValue("Some value");
        this.oComponent._oSearchField.setOpen(true);
        const oSearchFieldAddActionStub = sandbox.stub(this.oComponent._oSearchField, "addAction");
        // Act
        await this.oComponent._refreshSearchActionButton(false);
        // Assert
        assert.ok(this.oActionButtonDestroyStub.notCalled, "oActionButton.destroy was not called");
        assert.ok(oSearchFieldAddActionStub.notCalled, "_oSearchField.addAction was not called");
    });

    QUnit.module("Search Message Area", {
        beforeEach: async function () {
            sandbox.stub(Container, "getServiceAsync").withArgs("SearchCEP").resolves({
                registerDefaultSearchProvider: sandbox.stub()
            });
            sandbox.stub(Container, "getFLPPlatform");
            this.oElementGetElementByIdStub = sandbox.stub(Element, "getElementById");
            this.oElementGetElementByIdStub.withArgs("shell-header").returns({
                setSearch: sandbox.stub(),
                isLargeState: sandbox.stub(),
                isExtraLargeState: sandbox.stub()
            });
            this.oSearchMessageAreaDestroyStub = sandbox.stub();
            this.sSearchMessageAreaId = "searchMessageArea";
            this.oComponent = await new SearchCEPNew();
        },
        afterEach: function () {
            this.oComponent._oSearchField.destroy();
            sandbox.restore();
        }
    });

    QUnit.test("_updateSearchMessageArea - Search Message is destroyed and created again when results are available but no applications are present", async function (assert) {
        // Arrange
        this.oElementGetElementByIdStub.withArgs(this.sSearchMessageAreaId).returns({
            destroy: this.oSearchMessageAreaDestroyStub
        });
        this.oComponent._oSearchField.setValue("Some Value");
        const oSearchFieldAddMessageAreaStub = sandbox.stub(this.oComponent._oSearchField, "addMessageArea");
        // Act
        await this.oComponent._updateSearchMessageArea(false, true);
        // Assert
        const oSearchMessageArea = oSearchFieldAddMessageAreaStub.firstCall.args[0];
        assert.ok(this.oSearchMessageAreaDestroyStub.calledOnce, "oSearchMessageArea.destroy was called");
        assert.ok(oSearchFieldAddMessageAreaStub.calledOnce, "_oSearchField.addMessageArea was called");
        assert.strictEqual(oSearchMessageArea.getId(), this.sSearchMessageAreaId, "Search Message Area has correct id");
        assert.strictEqual(oSearchMessageArea.getProperty("text"), "Oh, there are no results", "Search Message Area has correct text");
        assert.strictEqual(oSearchMessageArea.getProperty("description"), "You can try the following", "Search Message Area has correct description");
    });

    QUnit.test("_updateSearchMessageArea - Search Message is not available and should not be displayed after search", async function (assert) {
        // Arrange
        this.oElementGetElementByIdStub.withArgs(this.sSearchMessageAreaId).returns(undefined);
        this.oComponent._oSearchField.setValue("Some Value");
        const oSearchFieldAddMessageAreaStub = sandbox.stub(this.oComponent._oSearchField, "addMessageArea");
        // Act
        await this.oComponent._updateSearchMessageArea(false, false);
        // Assert
        assert.ok(this.oSearchMessageAreaDestroyStub.notCalled, "oSearchMessageArea.destroy was not called");
        assert.ok(oSearchFieldAddMessageAreaStub.notCalled, "_oSearchField.addMessageArea was not called when bHasAnyOtherSearchResult=false");

        // Act
        await this.oComponent._updateSearchMessageArea(true, true);
        // Assert
        assert.ok(oSearchFieldAddMessageAreaStub.notCalled, "_oSearchField.addMessageArea was not called when bHasApplications=true");

        // Arrange
        this.oComponent._oSearchField.setValue("");
        // Act
        await this.oComponent._updateSearchMessageArea(false, true);
        // Assert
        assert.ok(oSearchFieldAddMessageAreaStub.notCalled, "_oSearchField.addMessageArea was not called when _oSearchField.getValue=''");
    });

    QUnit.module("Illustrated Message", {
        beforeEach: async function () {
            this.sIllustratedMessageId = "searchIllustratedMessage";
            const oIllustratedMsg = Element.getElementById(this.sIllustratedMessageId);

            if (oIllustratedMsg) {
                oIllustratedMsg.destroy();
            }

            sandbox.stub(Container, "getServiceAsync").withArgs("SearchCEP").resolves({
                registerDefaultSearchProvider: sandbox.stub()
            });
            sandbox.stub(Container, "getFLPPlatform");
            this.oElementGetElementByIdStub = sandbox.stub(Element, "getElementById");
            this.oElementGetElementByIdStub.withArgs("shell-header").returns({
                setSearch: sandbox.stub(),
                isLargeState: sandbox.stub(),
                isExtraLargeState: sandbox.stub()
            });
            this.oIllustratedMessageDestroyStub = sandbox.stub();
            this.oComponent = await new SearchCEPNew();
        },
        afterEach: function () {
            this.oComponent._oSearchField.destroy();
            sandbox.restore();
        }
    });

    QUnit.test("_updateIllustratedMessage - Illustrated Message is not available and should be displayed on initial search field open because of no results", async function (assert) {
        // Arrange
        this.oElementGetElementByIdStub.withArgs(this.sIllustratedMessageId).returns(undefined);
        this.oComponent._oSearchField.setValue("");
        const oIllustrationMessageStub = sandbox.stub(this.oComponent._oSearchField, "addIllustration");
        const oResultModelSetPropertyStub = sandbox.stub(this.oComponent._oResultModel, "setProperty");
        // Act
        await this.oComponent._updateIllustratedMessage(false, false);
        // Assert
        const oIllustrationMessage = oIllustrationMessageStub.firstCall.args[0];
        assert.ok(oResultModelSetPropertyStub.calledWith("/results", []), "_oResultModel.setProperty called with correct parameters");
        assert.ok(this.oIllustratedMessageDestroyStub.notCalled, "oIllustrationMessage.destroy was not called");
        assert.ok(oIllustrationMessageStub.calledOnce, "_oSearchField.addIllustration was called");
        assert.strictEqual(oIllustrationMessage.getId(), this.sIllustratedMessageId, "Illustration Message has correct id");
        assert.strictEqual(oIllustrationMessage.getProperty("titleText"), undefined, "Illustration Message has default titleText");
        assert.strictEqual(oIllustrationMessage.getProperty("subtitleText"), undefined, "Illustration Message has default subtitleText");
    });

    QUnit.test("_updateIllustratedMessage - Illustrated Message is destroyed and created again after searching because of no results", async function (assert) {
        // Arrange
        this.oElementGetElementByIdStub.withArgs(this.sIllustratedMessageId).returns({
            destroy: this.oIllustratedMessageDestroyStub
        });
        this.oComponent._oSearchField.setValue("Some Value");
        const oIllustrationMessageStub = sandbox.stub(this.oComponent._oSearchField, "addIllustration");
        const oResultModelSetPropertyStub = sandbox.stub(this.oComponent._oResultModel, "setProperty");
        // Act
        await this.oComponent._updateIllustratedMessage(false, false);
        // Assert
        const oIllustrationMessage = oIllustrationMessageStub.firstCall.args[0];
        assert.ok(oResultModelSetPropertyStub.calledWith("/results", []), "_oResultModel.setProperty called with correct parameters");
        assert.ok(this.oIllustratedMessageDestroyStub.calledOnce, "oIllustrationMessage.destroy was called");
        assert.ok(oIllustrationMessageStub.calledOnce, "_oSearchField.addIllustration was called");
        assert.strictEqual(oIllustrationMessage.getId(), this.sIllustratedMessageId, "Illustration Message has correct id");
        assert.strictEqual(oIllustrationMessage.getProperty("titleText"), "We couldn't find a match", "Illustration Message has correct titleText");
        assert.strictEqual(oIllustrationMessage.getProperty("subtitleText"), "Try searching for something else", "Illustration Message has default subtitleText");
    });

    QUnit.test("_updateIllustratedMessage - Illustrated Message is not shown because we have search results", async function (assert) {
        // Arrange
        this.oElementGetElementByIdStub.withArgs(this.sIllustratedMessageId).returns({
            destroy: this.oIllustratedMessageDestroyStub
        });
        this.oComponent._oSearchField.setValue("Some Value");
        const oIllustrationMessageStub = sandbox.stub(this.oComponent._oSearchField, "addIllustration");
        const oResultModelSetPropertyStub = sandbox.stub(this.oComponent._oResultModel, "setProperty");
        // Act
        await this.oComponent._updateIllustratedMessage(true, false);
        // Assert
        assert.ok(oResultModelSetPropertyStub.notCalled, "_oResultModel.setProperty was not called bHasApplications=true");
        assert.ok(oIllustrationMessageStub.notCalled, "_oSearchField.addIllustration was not called because bHasApplications=true");

        // Act
        await this.oComponent._updateIllustratedMessage(false, true);
        // Assert
        assert.ok(oResultModelSetPropertyStub.notCalled, "_oResultModel.setProperty was not called bHasAnyOtherSearchResult=true");
        assert.ok(oIllustrationMessageStub.notCalled, "_oSearchField.addIllustration was not called because bHasAnyOtherSearchResult=true");
    });
});
