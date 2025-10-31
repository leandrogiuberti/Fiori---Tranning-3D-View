/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import Button from "sap/m/Button";
import Control from "sap/ui/core/Control";
import SearchResultGrid from "./controls/resultview/SearchResultGrid";
import PerformanceLogger from "./performancelogging/PerformanceLogger";
import { IKeyValueStore } from "./personalization/PersonalizationStorage";
import { DataSourceConfiguration } from "./SearchConfigurationTypes";
import SearchModel from "./SearchModel";
import { DataSourcesFilterFunction, UrlParameters } from "./SearchModelTypes";
import { ComplexCondition } from "./sinaNexTS/sina/ComplexCondition";
import { Condition } from "./sinaNexTS/sina/Condition";
import { DataSource } from "./sinaNexTS/sina/DataSource";
import { FacetResultSet } from "./sinaNexTS/sina/FacetResultSet";
import { Filter } from "./sinaNexTS/sina/Filter";
import { SimpleCondition } from "./sinaNexTS/sina/SimpleCondition";
import { SinaConfiguration } from "./sinaNexTS/sina/SinaConfiguration";
import EventConsumer from "./eventlogging/EventConsumer";
import { ErrorHandlingOptions } from "./error/ErrorHandler";
import { ESHUIError } from "./error/errors";
import { SelectionMode } from "./SelectionMode";

/*
 * Search Result View Type Setting Paramaters Explaination:
 *                                                                                | In which case gettable and settable?
 * Files & Paramaters                         | Explain                           | Search in Apps         | Search in All / Category         | Search in Business Object
 * -----------------------------------------------------------------------------------------------------------------------------------------------------------------------
 * 1. SearchConfigurationSettings (Design Time External Settings)
 * 1.1. resultViewTypes                       | view types                        |                        |                                  | gettable, settable
 * 1.2. fallbackResultViewType (DSP using)    | fallback initial active view type |                        |                                  | gettable, settable
 * -----------------------------------------------------------------------------------------------------------------------------------------------------------------------
 * 2. SearchCompositeControl (Run Time External Settings)
 * 2.1. resultViewTypes                       | active view types                 | gettable, not settable | gettable, not settable in Ushell | gettable, settable
 * 2.2. resultViewType                        | active view type                  | gettable, not settable | gettable, not settable in Ushell | gettable, settable
 * -----------------------------------------------------------------------------------------------------------------------------------------------------------------------
 * 3. SearchModel (Internal Perperties)
 * 3.1. "/resultViewTypes"                    | active view types                 | internal               | internal                         | internal
 * 3.2. "/resultViewType"                     | active view type                  | internal               | internal                         | internal
 * -----------------------------------------------------------------------------------------------------------------------------------------------------------------------
 * 4. Storage (Internal Perperties)
 * 4.1. resultViewTypeForAllAndCategorySearch | last-used view type               | internal               | internal                         | internal
 * 4.2. resultViewTypeForBusinessObjectSearch | last-used view type               | internal               | internal                         | internal
 */

export default class SearchConfigurationSettings {
    // #region public
    // =========================================================
    /**
     * Value of id property for the DOM node which will hold the search composite control.
     * Must be unique in the DOM.
     */
    id = "";

    /**
     * Relevant for SAP partners and SAP, the "Application Component" you expect customers to create incidents.
     * All SAP-stakeholders and partners, using the SearchCompositeControl, shall provide the "application component", so customer incidents are reaching the application's support team easily.
     * */
    applicationComponent = "";

    /**
     * Display a splitter bar to resize the left hand panel, containing all facets and filter criteria.
     */
    facetPanelResizable = true;
    /**
     * Default size (percent) of the left hand panel, containing all facets and filter criteria. If "facetPanelResizable" is true, the width of the facet panel can be changed by the user.
     */
    facetPanelWidthInPercent = 25;

    /**
     * Whenever a search has no results, a 'No Results Page' is displayed. You can provide a custom page to be more specific or add some hints, links, buttons or other content.
     */
    getCustomNoResultScreen: (dataSource: DataSource, model: SearchModel) => Control = function (): Control {
        return null;
    };

    /**
     * A callback which returns customized "label" for placeholder text of search box, in case there is no search term.
     * The placeholder text (en) will be "Search In: <customPlaceholderLabel>".
     * Do not combine with property 'bPlaceHolderFixedValue'.
     */
    getSearchInputPlaceholderLabel: (filter: Filter) => string = null;

    /**
     * Location of the search input box. The search input can be placed on the top of the control (SearchCompositeControl) or as part of the search bar
     * By default the location is at the top, values are "Top" and "Searchbar".
     * @since 1.140.0
     * @experimental Since 1.140.0 this feature is experimental and the API may change.
     */
    searchInputLocation = "Top";

    /**
     * Defines if the search composite control will send a search request after loading for the given term, data source and filter root condition settings.
     */
    searchOnStart = true;

    /**
     * Search term which is set when the UI is loaded.
     */
    searchTerm: string;

    /**
     * Filter condition which is set when the UI is loaded
     */
    filterRootCondition: ComplexCondition = null;

    /**
     * Data source id which is set when the UI is loaded and cannot be changed at run time.
     * The following UI parts will be hidden:
     * - data source select (dropdown)
     * - data source tab bar
     * - data source facet (facet panel)
     * - data source name/link on result list (header section of item)
     */

    // Stakeholders using a single data source only:
    //  - SAP Datashere ('SEARCH_DESIGN')
    //  - SAC role UIs ('esh_ums_assignment'/'esh_ums_users').

    exclusiveDataSource = "";

    /**
     * Data source id which is set when the UI is loaded.
     * Used by data marketplace to create a parameterized search UI.
     */
    dataSource = ""; // Test ID: asdf

    /**
     * Data sources which is set when the UI is loaded.
     */
    dataSources: Array<DataSourceConfiguration> = [];

    /**
     * Storage backend to be used for UI configuration settings and application data.
     * Default is "auto" which means "flp" for ushell
     * and "browser" for everything else ("memory" will reset after each page load).
     * Applications can also implement the IKeyValueStore interface to use their own storage backend.
     */
    personalizationStorage: "auto" | "browser" | "flp" | "memory" | IKeyValueStore = "auto";

    /**
     * The layout is optimized for object selection / value help (narrow view w/o facet panel).
     */
    optimizeForValueHelp = false;

    /**
     * Shall the window title be overwritten by this control?
     * If true, the control will set the current search condition as window title.
     * If false, it will not set or update the window title.
     */
    overwriteBrowserTitle = true;

    /**
     * Data source id which is set when the UI is loaded or filter is reset.
     * Used by DSP, DSP Import Manager and Data Marketplace.
     * If dataSource is also set, dataSource will be used during UI load.
     */
    defaultDataSource = "";

    /**
     * Define the default search scope.
     * If true, set the default search scope as "Apps" instead of "All".
     * But the "All" is still in the first position of datasource dropdown listbox.
     * If false, the default search scope is "All".
     */
    defaultSearchScopeApps = false;

    /**
     * Decide the exists of search scope "All".
     * If true, the search scope "All" is removed from the datasource dropdown listbox.
     * If false, the search scope "All" is in the first position of datasource dropdown listbox.
     */
    searchScopeWithoutAll = false;

    /**
     * Controls whether the key store (selected items) is reset when a user clicks a SearchLink.
     * - If set to `true`, the key store (selection) is cleared upon navigation, so returning
     *   from the target page will have no item(s) selected anymore.
     * - If set to `false`, the existing selection remains preserved.
     */
    clearObjectSelectionOnSearchLinkClick = true;

    /**
     * Defines selectable search result view types (only for Search in single Business Object).
     * Its value is also settable in run time.
     * Find more detail in SearchCompositeControl.
     *
     * @since 1.98.0
     */
    resultViewTypes: Array<string> = ["searchResultList", "searchResultTable"];

    /**
     * Defines fallback search result view type (only for Search in single Business Object).
     * It is used when <code>resultViewType</code> is undefined, for example the search UI is initialized.
     * The first element of <code>resultViewTypes</code> is assigned if it is not defined.
     *
     * @since 1.98.0
     */
    fallbackResultViewType: string;

    /**
     * The result views are displayed in a master-detail mode. The event showResultDetail is fired whenever the detail button is clicked.
     * @since 1.140.0
     */
    resultviewMasterDetailMode = false;

    /**
     * Defines title column of search result table.
     * Datasource plural label is used if it is not defined or empty string.
     */
    titleColumnName = "";

    /**
     * Defines title column width of search result table.
     * The adptive width is used if it is not defined or empty string.
     */
    titleColumnWidth = ""; // TODO: refactoring initial column width, provide general column width configuration

    /**
     * Define a custom grid view instead of default grid view implementation.
     * Used in DSP to show different custom grid view.
     */
    customGridView: () => SearchResultGrid = null;

    /**
     * Define a custom toolbar.
     * Used in DSP to show many buttons.
     */
    getCustomToolbar: () => Array<Control> = () => [];

    /**
     * Define the call function before the navigation clicked.
     */
    beforeNavigation: (model: SearchModel) => void = () => {
        return;
    };

    /*
     * Callback for filtering the datasource displayed in the datasource dropdown listbox.
     * The callback gets a list of datsources and returns the filtered list of datasources.
     */
    filterDataSources: DataSourcesFilterFunction = function (
        dataSources: Array<DataSource>
    ): Array<DataSource> {
        return dataSources;
    };

    /**
     * Controls whether the facet functionality is available or not.
     */
    facets = true;

    /**
     * A boolean which indicates whether the facet panel is initially openend or closed.
     * This affects only the initial state of the facet panel.
     * When not setting facetVisibility the initial state of the facet panel typically is
     * taken from the user personalization storage.
     */
    facetVisibility = false;

    /**
     * Location of the button to show/hide facet panel. The button (filter icon) can be placed on the left (begin) or on the right (end) of the search bar.
     * By default the button's location is at the beginning (left), values are "Begin" and "End".
     * The property is not evaluated if facet panel is disabled, see property 'facets'.
     * @since 1.140.0
     * @experimental Since 1.140.0 this feature is experimental and the API may change.
     */
    facetToggleButtonLocation = "Begin";

    /**
     * A boolean for enabling chart visualizations (pie chart / bar chart facets).
     * If set to true, facets can be viewed as a pie or bar chart (this cannot be deactivated at runtime).
     */
    enableCharts = false;

    /**
     * A boolean for enabling (business) object suggestions.
     */
    boSuggestions = false;

    /**
     * A boolean for enabling the folder mode. In folder mode the search ui in addition supports
     * folder navigation
     */
    folderMode = false;

    /**
     * In case folderMode is set to true this boolean indicates whether for the initial search the folder mode is enabled.
     */
    folderModeForInitialSearch = false;

    /**
     * A boolean for activating the automatic switching of the display mode. When activated the UI automatically switches
     * - to list display in search mode
     * - to table display in folder mode
     */
    autoAdjustResultViewTypeInFolderMode = false;

    /**
     * Configuration parameters for the sina search library.
     */
    sinaConfiguration: SinaConfiguration = null;

    /**
     * Enables the query language for the hana_odata provider.
     * With query language it is possible for the end user to enter complex search
     * queries with logical operators.
     */
    enableQueryLanguage = false;

    /**
     * A callback for formatting tab strips. The tabstrips are displayed on top of the
     * search result list. The callback receives a list of datasources and returns a
     * modified list of datasources.
     */
    tabStripsFormatter: (dataSources: Array<DataSource>) => Array<DataSource> = (tabStrips) => tabStrips;

    /**
     * A boolean indicating that the search state is written to the URL.
     */
    updateUrl = true;

    /**
     * A callback for rendering the search URL. The callback gets a list of url encoded parameters and returns the URL string.
     * Typically you need to register this callback in case updateUrl=true.
     */
    renderSearchUrl = function (properties: UrlParameters): string {
        return (
            "#Action-search&/top=" +
            properties.top +
            (properties.orderby ? "&orderBy=" + properties.orderby : "") +
            (properties.sortorder ? "&sortOrder=" + properties.sortorder : "") +
            "&filter=" +
            properties.filter
        );
    };

    /**
     * A callback for checking whether a URL is a search URL. The callback receives a URL and returns true in case the URL is a search URL.
     * Typically you need to register this callback in case updateUrl=true.
     */
    isSearchUrl: (url: string) => boolean = function (url: string) {
        return url.indexOf("#Action-search") === 0;
    };

    /**
     * A callback for parsing URL parameters. The callback receices URL parameters and returns modified URL parameters.
     * This is an optional callback. Also in case you set updateUrl=true typcically this callback is not needed.
     */
    parseSearchUrlParameters: (parameters: UrlParameters) => UrlParameters = (parameters) => parameters;

    /**
     * A list of datasources to be displayed in the facet panel in the collection area.
     */
    quickSelectDataSources: Array<
        | {
              dataSource: DataSource;
              type: "quickSelectDataSourceTreeNode";
              children: Array<{ dataSource: DataSource }>;
          }
        | DataSource
    > = [];

    /**
     * A callback which is called after the initialization of the search composite control.
     */
    initAsync: (model: SearchModel) => Promise<void> = () => {
        return Promise.resolve();
    };

    /**
     * To select result view items, enable multi-selection or single-selection mode. Shows checkboxes ('MultipleItems') or enables item press ('OneItem'). Values of configuration parameter `resultviewSelectionMode` are 'None', 'OneItem' and 'MultipleItems'.
     * To show a button for switching selection mode on/off, see 'showSelectionToggleButton'.
     * A checkbox is provided for each result item if the value is true.
     * The setting is related to `resultviewMasterDetailMode` (master-detail mode). The event `showResultDetail` is fired whenever the detail button is clicked.
     * @since 1.141.0
     */
    resultviewSelectionMode = SelectionMode.None;

    /**
     * Shows a button to show/hide checkboxes for selection of result view items.
     * See property "resultviewSelectionMode" regarding single/multi-selection settings.
     * @since 1.140.0
     */
    showSelectionToggleButton = false;

    /**
     * The maximal count of search result items displayed on a page after a search.
     * By clicking Show More button, another page of result items of the same count (if available) will be displayed.
     */
    pageSize = 10;

    /**
     * Callback for formatting the filter string to be displayed in the filter bar (for closed facet panel).
     */
    formatFilterBarText: (
        attributeFilters: Array<{
            attributeName: string;
            attributeLabel: string;
            attributeFilterValueLabels: Array<string>;
        }>
    ) => string;

    /**
     * Callback for checking whether the filter bar is visible.
     */
    isFilterBarVisible: (rootCondition: ComplexCondition) => boolean;

    /**
     * List of event consumers which are called whenever there is a user initiated event.
     */
    eventConsumers: Array<EventConsumer> = [];

    /**
     * Limit for length of searchterm.
     */
    searchTermLengthLimit: number = 1000;

    /**
     * Prevents too many ajax requests in a short time.
     */
    limitAjaxRequests: boolean = true;

    /**
     * The external error handler for handling ESHUIError instances.
     * Once this is set, the internal error handler will be replaced by this one.
     */
    onErrorHandler: (error: ESHUIError, options?: ErrorHandlingOptions) => void = null;

    // #endregion

    // #region private
    // =========================================================

    /**
     * Performance logger: Records performance inspection items and prints them to console
     * - Mandatory properties:
     *   - "enterMethod", type function({ name: "..." },...}
     *   - "leaveMethod", type function({ name: "..." })
     */
    performanceLogger = new PerformanceLogger();

    /**
     * Enable or disable feature "My Favorites" for cFLP
     * If true, in cFLP case, setting "Use Personalized Search Scope" is displayed in User Settings Dialog (Search)
     * (can be removed after a test phase)
     */
    userDefinedDatasourcesMulti = true;

    /**
     * Check interval for search field. This interval is used to check whether search field needs to be relocated/resized.
     */
    searchFieldCheckInterval = 100;

    /**
     * Specially in DSP Repository Explorer.
     * Set as true, so that the items in search in area have only single selection.
     */
    searchInAreaOverwriteMode = false;

    /**
     * Specially in DSP Repository Explorer.
     * Method to reset the dataSource as Repository Explorer's All.
     */
    resetQuickSelectDataSourceAll: (model: SearchModel) => void = null;

    /**
     * FLP configuration parameter which enables/disables Enterprise Search (=search for
     * business objects) in FLP. In case Enterprise Search is deactivated the user can still search
     * for apps.
     */
    searchBusinessObjects = true;

    /**
     * Relaxation time before a suggestion request is sent to the server.
     */
    suggestionKeyboardRelaxationTime = 400;

    /**
     * Minimum number of characters needed for sending attribute suggestion requests to the server.
     */
    suggestionStartingCharacters = 3;

    /**
     * UI5 module load paths. Typically module load paths are configured by UI5 initilization.
     * Sometimes developers using the search composite UI cannot influence UI5 initialization instead they
     * can use this parameter.
     */
    modulePaths: Array<{ moduleName: string; urlPrefix: string }> = undefined;

    /**
     * Boolean indicating that the search ui is embedded in ushell (FLP)
     */
    isUshell = false;

    /**
     * Enable natural language queries
     */
    aiNlq = false;

    /**
     * Show the blue AI “explain” bar below the search toolbar.
     *
     * - When "true" (and `aiNlq` is also true) the bar is rendered and the former
     *   NLQ-explain button is suppressed.
     * - When "false" the UI falls back to the NLQ-explain button.
     *
     * Default: false
     */
    aiNlqExplainBar = false;

    /**
     * AI suggestions
     */
    aiSuggestions = false;

    /**
     * help likn
     */
    aiSuggestionsHeaderHelpLink: string;

    /**
     * Enable search result table personalization, such as column visibility, order, and width.
     */
    searchResultTablePersonalization: boolean = true;

    /**
     * Boolean when set to true the search term is reset when clicking on a datasource in the collection area.
     */
    bResetSearchTermOnQuickSelectDataSourceItemPress = false;

    /**
     * A callback which sets the result count text and icon for none-breadcrumbs case on result page.
     */
    setSearchInLabelIconBindings: (model: SearchModel, facets: Array<FacetResultSet>) => void = null;

    /**
     * A callback which returns the suitable list mode (sap.m.ListMode) for the attribute facet, e.g. SingleSelectMaster, MultiSelect.
     */
    getSearchInFacetListMode: (itemData: any | null | undefined) => void = null;

    /**
     * Set "Search In" placeholder text in search box to a fixed generic value "Search" without any parameter, in case there is no search term.
     * Do not combine with function 'getSearchInputPlaceholderLabel'.
     */
    bPlaceHolderFixedValue = false;

    /**
     * Set it as true if the oData meta data is in json format instead of default xml format.
     */
    metaDataJsonType = false;

    /**
     * Reload on URL change. When navigating away from the search UI (for instance to an object)
     * and then navigating back, the search UI is reloaded in case reloadOnUrlChange is set to true.
     */
    reloadOnUrlChange = true;

    // #endregion

    // #region feature flags
    // =========================================================
    /**
     * Enable or disable recent search feature. Recent searches will be saved inside personalizationStorage.
     */
    bRecentSearches = false;

    /**
     * Show the search bar for no-results page (see buttons 'Sort', 'Select Columns', 'Display as List', 'Display as Table', ...).
     */
    showSearchBarForNoResults = true;

    /**
     * Write sort order to URL
     */
    FF_sortOrderInUrl = true;

    /**
     * Display static hierarchy facet (normally only one per data source).
     */
    FF_staticHierarchyFacets = true;

    /**
     * Display dynamic hierarchy facet.
     */
    FF_dynamicHierarchyFacets = true;

    /**
     * Display breadcrumbs on result page if the preconditions are fulfilled.
     */
    FF_hierarchyBreadcrumbs = false;

    /**
     * Display dynamic hierarchy facet in Show More dialog.
     */
    FF_dynamicHierarchyFacetsInShowMore = true;

    /**
     * Enable or disable to resize search result table columns.
     */
    FF_resizeResultTableColumns = false;

    /**
     * Enable or disable to use web component based search input.
     */
    FF_useWebComponentsSearchInput = false;

    /**
     * Enable to show the search selection bar after number of selected items.
     */
    enableSearchSelectionBarStartingWith = 1;

    /**
     * Adjust filter conditions. When filter conditions are changed, give a callback to adjust the conditions.
     */
    adjustFilters: (model: SearchModel, filterCondition?: Condition) => void = null;

    /** Enable transaction codes by typing /n or /o into the search input */
    FF_enableTCodes = false;

    // #endregion

    // #region deprecated
    // =========================================================
    //
    // (1) Move deprecated parameters here. Even if you 'rename' a parameter, keep the old parameter here to prevent syntax errors for stakeholders using TS type files
    // (2) Add the parameter to 'deprecatedParameters' (array, at the end of this file). This will add warning (assertion) to console AND fill the replacement property while constructing the SearchCompositeControl instance
    //
    // Use cases
    //     - Delete:  Follow steps (1) and (2).
    //     - Rename:  Renaming a parameter is similar to deprecating the old one (see 'Delete') and creating a new one.
    //                The only difference is, we are taking over config value from old to new property (based on 'deprecatedParameters'), when constructing SearchCompositeControl instance
    //     - Replace: Replacing a config parameter by 'something else', you can fill in 'replacementInfo' (of 'deprecatedParameters') to describe details
    //
    // Always keep a deprecated ('deleted') parameter as a property of this class (region 'deprecated'), to prevent syntax errors (ts type checks)
    //
    displayFacetPanelInCaseOfNoResults: boolean = false;
    enableMultiSelectionResultItems = false;
    // DSP space ( ToDo: remove )
    getSpaceFacetId: (dimension: string, sId: string) => string = undefined; // obsolete since there is no space facet any longer (DSP, stakeholder coding clean-up)
    getFirstSpaceCondition: (filter: Filter) => SimpleCondition = null; // obsolete since there is no space facet any longer (DSP, stakeholder coding clean-up)
    cleanUpSpaceFilters: (model: SearchModel, filterCondition?: Condition) => void = null; // replaced by 'adjustFilters'
    extendTableColumn: {
        assembleCell: (data: unknown) => unknown;
        bindingFunction: (bindingObject: unknown) => Button;
        column: {
            name: string;
            attributeId: string;
            width: string;
        };
    } = null;

    // #endregion
}

// list of configuration parameters which are also known in sina
// (these parameters are automatically passed to sina via sinaConfiguration)
export const sinaParameters: Array<string> = [
    "FF_hierarchyBreadcrumbs",
    "folderMode",
    "folderModeForInitialSearch",
    "enableQueryLanguage",
    "updateUrl",
    "pageSize",
    "searchInAreaOverwriteMode",
    "limitAjaxRequests",
];

/**
 * Add deprecated parameters and the replacement of it here.
 * It will print a deprecation warning to the console using
 * UI5 assertions.
 */
export const deprecatedParameters: Record<string, { replacedBy?: string; replacementInfo?: string }> = {
    searchBarDoNotHideForNoResults: { replacedBy: "showSearchBarForNoResults" },
    browserTitleOverwritten: { replacedBy: "overwriteBrowserTitle" },
    combinedResultviewToolbar: {},
    layoutUseResponsiveSplitter: {
        replacedBy: "facetPanelResizable",
        replacementInfo:
            "Default value is 'true', set to 'false' to make splitterbar non-resizable. You can use 'facetPanelWidthInPercent' in addition (default value: 25).",
    },
    searchFilterBarShowWithFacets: {},
    bNoAppSearch: {},
    selectionChange: {
        replacementInfo:
            "Subscribe to event 'selectionChanged' of SearchCompositeControl. As of version 1.137.0, this setting is ignored.",
    },
    nlq: { replacedBy: "aiNlq" },
    displayFacetPanelInCaseOfNoResults: {
        replacementInfo:
            "Setting is ignored as of version 1.134.0. The facet panel visibility is controlled by user or personalization.",
    },
    getSpaceFacetId: {
        replacementInfo:
            "Setting is ignored as of version 1.136.0. There is no space facet any longer (DSP, stakeholder coding clean-up)",
    },
    getFirstSpaceCondition: {
        replacementInfo:
            "Setting is ignored as of version 1.136.0. There is no space facet any longer (DSP, stakeholder coding clean-up)",
    },
    cleanUpSpaceFilters: {
        replacedBy: "adjustFilters",
        replacementInfo: "Setting replaced as of version 1.136.0 (DSP, stakeholder coding clean-up)",
    },
    enableMultiSelectionResultItems: {
        replacedBy: "resultviewSelectionMode",
        replacementInfo:
            "Setting replaced as of version 1.141.0. The new property 'resultviewSelectionMode' supports single-select as well as multi-select ('None', 'OneItem', 'MultipleItems').\nFor master-detail scenarios, use in combination with 'resultviewMasterDetailMode'.\nTo show a button for switching selection mode on/off, see 'showSelectionToggleButton'.",
    },
    extendTableColumn: {
        replacementInfo:
            "Make use of formatters to add custom attributes (see config.sinaConfiguration, 'metadataFormatters' and 'searchResultSetFormatters').\nDeprecated as of version 1.141.",
    },
};

/**
 * Parameters which cannot be changed by URL
 */
export const urlForbiddenParameters = ["modulePaths"];

export const defaultSearchConfigurationSettings = new SearchConfigurationSettings();
