declare module "sap/esh/search/ui/SearchConfigurationSettings" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import Button from "sap/m/Button";
    import Control from "sap/ui/core/Control";
    import SearchResultGrid from "sap/esh/search/ui/controls/resultview/SearchResultGrid";
    import PerformanceLogger from "sap/esh/search/ui/performancelogging/PerformanceLogger";
    import { IKeyValueStore } from "sap/esh/search/ui/personalization/PersonalizationStorage";
    import { DataSourceConfiguration } from "sap/esh/search/ui/SearchConfigurationTypes";
    import SearchModel from "sap/esh/search/ui/SearchModel";
    import { DataSourcesFilterFunction, UrlParameters } from "sap/esh/search/ui/SearchModelTypes";
    import { ComplexCondition } from "sap/esh/search/ui/sinaNexTS/sina/ComplexCondition";
    import { Condition } from "sap/esh/search/ui/sinaNexTS/sina/Condition";
    import { DataSource } from "sap/esh/search/ui/sinaNexTS/sina/DataSource";
    import { FacetResultSet } from "sap/esh/search/ui/sinaNexTS/sina/FacetResultSet";
    import { Filter } from "sap/esh/search/ui/sinaNexTS/sina/Filter";
    import { SimpleCondition } from "sap/esh/search/ui/sinaNexTS/sina/SimpleCondition";
    import { SinaConfiguration } from "sap/esh/search/ui/sinaNexTS/sina/SinaConfiguration";
    import EventConsumer from "sap/esh/search/ui/eventlogging/EventConsumer";
    import { ErrorHandlingOptions } from "sap/esh/search/ui/error/ErrorHandler";
    import { ESHUIError } from "sap/esh/search/ui/error/errors";
    import { SelectionMode } from "sap/esh/search/ui/SelectionMode";
    export default class SearchConfigurationSettings {
        /**
         * Value of id property for the DOM node which will hold the search composite control.
         * Must be unique in the DOM.
         */
        id: string;
        /**
         * Relevant for SAP partners and SAP, the "Application Component" you expect customers to create incidents.
         * All SAP-stakeholders and partners, using the SearchCompositeControl, shall provide the "application component", so customer incidents are reaching the application's support team easily.
         * */
        applicationComponent: string;
        /**
         * Display a splitter bar to resize the left hand panel, containing all facets and filter criteria.
         */
        facetPanelResizable: boolean;
        /**
         * Default size (percent) of the left hand panel, containing all facets and filter criteria. If "facetPanelResizable" is true, the width of the facet panel can be changed by the user.
         */
        facetPanelWidthInPercent: number;
        /**
         * Whenever a search has no results, a 'No Results Page' is displayed. You can provide a custom page to be more specific or add some hints, links, buttons or other content.
         */
        getCustomNoResultScreen: (dataSource: DataSource, model: SearchModel) => Control;
        /**
         * A callback which returns customized "label" for placeholder text of search box, in case there is no search term.
         * The placeholder text (en) will be "Search In: <customPlaceholderLabel>".
         * Do not combine with property 'bPlaceHolderFixedValue'.
         */
        getSearchInputPlaceholderLabel: (filter: Filter) => string;
        /**
         * Location of the search input box. The search input can be placed on the top of the control (SearchCompositeControl) or as part of the search bar
         * By default the location is at the top, values are "Top" and "Searchbar".
         * @since 1.140.0
         * @experimental Since 1.140.0 this feature is experimental and the API may change.
         */
        searchInputLocation: string;
        /**
         * Defines if the search composite control will send a search request after loading for the given term, data source and filter root condition settings.
         */
        searchOnStart: boolean;
        /**
         * Search term which is set when the UI is loaded.
         */
        searchTerm: string;
        /**
         * Filter condition which is set when the UI is loaded
         */
        filterRootCondition: ComplexCondition;
        /**
         * Data source id which is set when the UI is loaded and cannot be changed at run time.
         * The following UI parts will be hidden:
         * - data source select (dropdown)
         * - data source tab bar
         * - data source facet (facet panel)
         * - data source name/link on result list (header section of item)
         */
        exclusiveDataSource: string;
        /**
         * Data source id which is set when the UI is loaded.
         * Used by data marketplace to create a parameterized search UI.
         */
        dataSource: string;
        /**
         * Data sources which is set when the UI is loaded.
         */
        dataSources: Array<DataSourceConfiguration>;
        /**
         * Storage backend to be used for UI configuration settings and application data.
         * Default is "auto" which means "flp" for ushell
         * and "browser" for everything else ("memory" will reset after each page load).
         * Applications can also implement the IKeyValueStore interface to use their own storage backend.
         */
        personalizationStorage: "auto" | "browser" | "flp" | "memory" | IKeyValueStore;
        /**
         * The layout is optimized for object selection / value help (narrow view w/o facet panel).
         */
        optimizeForValueHelp: boolean;
        /**
         * Shall the window title be overwritten by this control?
         * If true, the control will set the current search condition as window title.
         * If false, it will not set or update the window title.
         */
        overwriteBrowserTitle: boolean;
        /**
         * Data source id which is set when the UI is loaded or filter is reset.
         * Used by DSP, DSP Import Manager and Data Marketplace.
         * If dataSource is also set, dataSource will be used during UI load.
         */
        defaultDataSource: string;
        /**
         * Define the default search scope.
         * If true, set the default search scope as "Apps" instead of "All".
         * But the "All" is still in the first position of datasource dropdown listbox.
         * If false, the default search scope is "All".
         */
        defaultSearchScopeApps: boolean;
        /**
         * Decide the exists of search scope "All".
         * If true, the search scope "All" is removed from the datasource dropdown listbox.
         * If false, the search scope "All" is in the first position of datasource dropdown listbox.
         */
        searchScopeWithoutAll: boolean;
        /**
         * Controls whether the key store (selected items) is reset when a user clicks a SearchLink.
         * - If set to `true`, the key store (selection) is cleared upon navigation, so returning
         *   from the target page will have no item(s) selected anymore.
         * - If set to `false`, the existing selection remains preserved.
         */
        clearObjectSelectionOnSearchLinkClick: boolean;
        /**
         * Defines selectable search result view types (only for Search in single Business Object).
         * Its value is also settable in run time.
         * Find more detail in SearchCompositeControl.
         *
         * @since 1.98.0
         */
        resultViewTypes: Array<string>;
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
        resultviewMasterDetailMode: boolean;
        /**
         * Defines title column of search result table.
         * Datasource plural label is used if it is not defined or empty string.
         */
        titleColumnName: string;
        /**
         * Defines title column width of search result table.
         * The adptive width is used if it is not defined or empty string.
         */
        titleColumnWidth: string;
        /**
         * Define a custom grid view instead of default grid view implementation.
         * Used in DSP to show different custom grid view.
         */
        customGridView: () => SearchResultGrid;
        /**
         * Define a custom toolbar.
         * Used in DSP to show many buttons.
         */
        getCustomToolbar: () => Array<Control>;
        /**
         * Define the call function before the navigation clicked.
         */
        beforeNavigation: (model: SearchModel) => void;
        filterDataSources: DataSourcesFilterFunction;
        /**
         * Controls whether the facet functionality is available or not.
         */
        facets: boolean;
        /**
         * A boolean which indicates whether the facet panel is initially openend or closed.
         * This affects only the initial state of the facet panel.
         * When not setting facetVisibility the initial state of the facet panel typically is
         * taken from the user personalization storage.
         */
        facetVisibility: boolean;
        /**
         * Location of the button to show/hide facet panel. The button (filter icon) can be placed on the left (begin) or on the right (end) of the search bar.
         * By default the button's location is at the beginning (left), values are "Begin" and "End".
         * The property is not evaluated if facet panel is disabled, see property 'facets'.
         * @since 1.140.0
         * @experimental Since 1.140.0 this feature is experimental and the API may change.
         */
        facetToggleButtonLocation: string;
        /**
         * A boolean for enabling chart visualizations (pie chart / bar chart facets).
         * If set to true, facets can be viewed as a pie or bar chart (this cannot be deactivated at runtime).
         */
        enableCharts: boolean;
        /**
         * A boolean for enabling (business) object suggestions.
         */
        boSuggestions: boolean;
        /**
         * A boolean for enabling the folder mode. In folder mode the search ui in addition supports
         * folder navigation
         */
        folderMode: boolean;
        /**
         * In case folderMode is set to true this boolean indicates whether for the initial search the folder mode is enabled.
         */
        folderModeForInitialSearch: boolean;
        /**
         * A boolean for activating the automatic switching of the display mode. When activated the UI automatically switches
         * - to list display in search mode
         * - to table display in folder mode
         */
        autoAdjustResultViewTypeInFolderMode: boolean;
        /**
         * Configuration parameters for the sina search library.
         */
        sinaConfiguration: SinaConfiguration;
        /**
         * Enables the query language for the hana_odata provider.
         * With query language it is possible for the end user to enter complex search
         * queries with logical operators.
         */
        enableQueryLanguage: boolean;
        /**
         * A callback for formatting tab strips. The tabstrips are displayed on top of the
         * search result list. The callback receives a list of datasources and returns a
         * modified list of datasources.
         */
        tabStripsFormatter: (dataSources: Array<DataSource>) => Array<DataSource>;
        /**
         * A boolean indicating that the search state is written to the URL.
         */
        updateUrl: boolean;
        /**
         * A callback for rendering the search URL. The callback gets a list of url encoded parameters and returns the URL string.
         * Typically you need to register this callback in case updateUrl=true.
         */
        renderSearchUrl: (properties: UrlParameters) => string;
        /**
         * A callback for checking whether a URL is a search URL. The callback receives a URL and returns true in case the URL is a search URL.
         * Typically you need to register this callback in case updateUrl=true.
         */
        isSearchUrl: (url: string) => boolean;
        /**
         * A callback for parsing URL parameters. The callback receices URL parameters and returns modified URL parameters.
         * This is an optional callback. Also in case you set updateUrl=true typcically this callback is not needed.
         */
        parseSearchUrlParameters: (parameters: UrlParameters) => UrlParameters;
        /**
         * A list of datasources to be displayed in the facet panel in the collection area.
         */
        quickSelectDataSources: Array<{
            dataSource: DataSource;
            type: "quickSelectDataSourceTreeNode";
            children: Array<{
                dataSource: DataSource;
            }>;
        } | DataSource>;
        /**
         * A callback which is called after the initialization of the search composite control.
         */
        initAsync: (model: SearchModel) => Promise<void>;
        /**
         * To select result view items, enable multi-selection or single-selection mode. Shows checkboxes ('MultipleItems') or enables item press ('OneItem'). Values of configuration parameter `resultviewSelectionMode` are 'None', 'OneItem' and 'MultipleItems'.
         * To show a button for switching selection mode on/off, see 'showSelectionToggleButton'.
         * A checkbox is provided for each result item if the value is true.
         * The setting is related to `resultviewMasterDetailMode` (master-detail mode). The event `showResultDetail` is fired whenever the detail button is clicked.
         * @since 1.141.0
         */
        resultviewSelectionMode: SelectionMode;
        /**
         * Shows a button to show/hide checkboxes for selection of result view items.
         * See property "resultviewSelectionMode" regarding single/multi-selection settings.
         * @since 1.140.0
         */
        showSelectionToggleButton: boolean;
        /**
         * The maximal count of search result items displayed on a page after a search.
         * By clicking Show More button, another page of result items of the same count (if available) will be displayed.
         */
        pageSize: number;
        /**
         * Callback for formatting the filter string to be displayed in the filter bar (for closed facet panel).
         */
        formatFilterBarText: (attributeFilters: Array<{
            attributeName: string;
            attributeLabel: string;
            attributeFilterValueLabels: Array<string>;
        }>) => string;
        /**
         * Callback for checking whether the filter bar is visible.
         */
        isFilterBarVisible: (rootCondition: ComplexCondition) => boolean;
        /**
         * List of event consumers which are called whenever there is a user initiated event.
         */
        eventConsumers: Array<EventConsumer>;
        /**
         * Limit for length of searchterm.
         */
        searchTermLengthLimit: number;
        /**
         * Prevents too many ajax requests in a short time.
         */
        limitAjaxRequests: boolean;
        /**
         * The external error handler for handling ESHUIError instances.
         * Once this is set, the internal error handler will be replaced by this one.
         */
        onErrorHandler: (error: ESHUIError, options?: ErrorHandlingOptions) => void;
        /**
         * Performance logger: Records performance inspection items and prints them to console
         * - Mandatory properties:
         *   - "enterMethod", type function({ name: "..." },...}
         *   - "leaveMethod", type function({ name: "..." })
         */
        performanceLogger: PerformanceLogger;
        /**
         * Enable or disable feature "My Favorites" for cFLP
         * If true, in cFLP case, setting "Use Personalized Search Scope" is displayed in User Settings Dialog (Search)
         * (can be removed after a test phase)
         */
        userDefinedDatasourcesMulti: boolean;
        /**
         * Check interval for search field. This interval is used to check whether search field needs to be relocated/resized.
         */
        searchFieldCheckInterval: number;
        /**
         * Specially in DSP Repository Explorer.
         * Set as true, so that the items in search in area have only single selection.
         */
        searchInAreaOverwriteMode: boolean;
        /**
         * Specially in DSP Repository Explorer.
         * Method to reset the dataSource as Repository Explorer's All.
         */
        resetQuickSelectDataSourceAll: (model: SearchModel) => void;
        /**
         * FLP configuration parameter which enables/disables Enterprise Search (=search for
         * business objects) in FLP. In case Enterprise Search is deactivated the user can still search
         * for apps.
         */
        searchBusinessObjects: boolean;
        /**
         * Relaxation time before a suggestion request is sent to the server.
         */
        suggestionKeyboardRelaxationTime: number;
        /**
         * Minimum number of characters needed for sending attribute suggestion requests to the server.
         */
        suggestionStartingCharacters: number;
        /**
         * UI5 module load paths. Typically module load paths are configured by UI5 initilization.
         * Sometimes developers using the search composite UI cannot influence UI5 initialization instead they
         * can use this parameter.
         */
        modulePaths: Array<{
            moduleName: string;
            urlPrefix: string;
        }>;
        /**
         * Boolean indicating that the search ui is embedded in ushell (FLP)
         */
        isUshell: boolean;
        /**
         * Enable natural language queries
         */
        aiNlq: boolean;
        /**
         * Show the blue AI “explain” bar below the search toolbar.
         *
         * - When "true" (and `aiNlq` is also true) the bar is rendered and the former
         *   NLQ-explain button is suppressed.
         * - When "false" the UI falls back to the NLQ-explain button.
         *
         * Default: false
         */
        aiNlqExplainBar: boolean;
        /**
         * AI suggestions
         */
        aiSuggestions: boolean;
        /**
         * help likn
         */
        aiSuggestionsHeaderHelpLink: string;
        /**
         * Enable search result table personalization, such as column visibility, order, and width.
         */
        searchResultTablePersonalization: boolean;
        /**
         * Boolean when set to true the search term is reset when clicking on a datasource in the collection area.
         */
        bResetSearchTermOnQuickSelectDataSourceItemPress: boolean;
        /**
         * A callback which sets the result count text and icon for none-breadcrumbs case on result page.
         */
        setSearchInLabelIconBindings: (model: SearchModel, facets: Array<FacetResultSet>) => void;
        /**
         * A callback which returns the suitable list mode (sap.m.ListMode) for the attribute facet, e.g. SingleSelectMaster, MultiSelect.
         */
        getSearchInFacetListMode: (itemData: any | null | undefined) => void;
        /**
         * Set "Search In" placeholder text in search box to a fixed generic value "Search" without any parameter, in case there is no search term.
         * Do not combine with function 'getSearchInputPlaceholderLabel'.
         */
        bPlaceHolderFixedValue: boolean;
        /**
         * Set it as true if the oData meta data is in json format instead of default xml format.
         */
        metaDataJsonType: boolean;
        /**
         * Reload on URL change. When navigating away from the search UI (for instance to an object)
         * and then navigating back, the search UI is reloaded in case reloadOnUrlChange is set to true.
         */
        reloadOnUrlChange: boolean;
        /**
         * Enable or disable recent search feature. Recent searches will be saved inside personalizationStorage.
         */
        bRecentSearches: boolean;
        /**
         * Show the search bar for no-results page (see buttons 'Sort', 'Select Columns', 'Display as List', 'Display as Table', ...).
         */
        showSearchBarForNoResults: boolean;
        /**
         * Write sort order to URL
         */
        FF_sortOrderInUrl: boolean;
        /**
         * Display static hierarchy facet (normally only one per data source).
         */
        FF_staticHierarchyFacets: boolean;
        /**
         * Display dynamic hierarchy facet.
         */
        FF_dynamicHierarchyFacets: boolean;
        /**
         * Display breadcrumbs on result page if the preconditions are fulfilled.
         */
        FF_hierarchyBreadcrumbs: boolean;
        /**
         * Display dynamic hierarchy facet in Show More dialog.
         */
        FF_dynamicHierarchyFacetsInShowMore: boolean;
        /**
         * Enable or disable to resize search result table columns.
         */
        FF_resizeResultTableColumns: boolean;
        /**
         * Enable or disable to use web component based search input.
         */
        FF_useWebComponentsSearchInput: boolean;
        /**
         * Enable to show the search selection bar after number of selected items.
         */
        enableSearchSelectionBarStartingWith: number;
        /**
         * Adjust filter conditions. When filter conditions are changed, give a callback to adjust the conditions.
         */
        adjustFilters: (model: SearchModel, filterCondition?: Condition) => void;
        /** Enable transaction codes by typing /n or /o into the search input */
        FF_enableTCodes: boolean;
        displayFacetPanelInCaseOfNoResults: boolean;
        enableMultiSelectionResultItems: boolean;
        getSpaceFacetId: (dimension: string, sId: string) => string;
        getFirstSpaceCondition: (filter: Filter) => SimpleCondition;
        cleanUpSpaceFilters: (model: SearchModel, filterCondition?: Condition) => void;
        extendTableColumn: {
            assembleCell: (data: unknown) => unknown;
            bindingFunction: (bindingObject: unknown) => Button;
            column: {
                name: string;
                attributeId: string;
                width: string;
            };
        };
    }
    const sinaParameters: Array<string>;
    /**
     * Add deprecated parameters and the replacement of it here.
     * It will print a deprecation warning to the console using
     * UI5 assertions.
     */
    const deprecatedParameters: Record<string, {
        replacedBy?: string;
        replacementInfo?: string;
    }>;
    /**
     * Parameters which cannot be changed by URL
     */
    const urlForbiddenParameters: string[];
    const defaultSearchConfigurationSettings: SearchConfigurationSettings;
}
//# sourceMappingURL=SearchConfigurationSettings.d.ts.map