declare module "sap/esh/search/ui/SearchCompositeControl" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import ErrorHandler from "sap/esh/search/ui/error/ErrorHandler";
    import SearchFieldGroup from "sap/esh/search/ui/controls/searchfieldgroup/SearchFieldGroup";
    import SearchModel from "sap/esh/search/ui/SearchModel";
    import SearchLayoutResponsive from "sap/esh/search/ui/controls/SearchLayoutResponsive";
    import SearchResultContainer from "sap/esh/search/ui/controls/resultview/SearchResultContainer";
    import SearchResultTable from "sap/esh/search/ui/controls/resultview/SearchResultTable";
    import SearchResultList from "sap/esh/search/ui/controls/resultview/SearchResultList";
    import SearchResultGrid from "sap/esh/search/ui/controls/resultview/SearchResultGrid";
    import SearchSpreadsheet from "sap/esh/search/ui/controls/SearchSpreadsheet";
    import { SearchFocusHandler } from "sap/esh/search/ui/SearchHelper";
    import SearchFilterBar from "sap/esh/search/ui/controls/SearchFilterBar";
    import SearchNlqExplainBar from "sap/esh/search/ui/controls/SearchNlqExplainBar";
    import Control from "sap/ui/core/Control";
    import InvisibleText from "sap/ui/core/InvisibleText";
    import VerticalLayout from "sap/ui/layout/VerticalLayout";
    import SegmentedButton from "sap/m/SegmentedButton";
    import Bar from "sap/m/Bar";
    import IconTabBar from "sap/m/IconTabBar";
    import OverflowToolbar from "sap/m/OverflowToolbar";
    import CustomListItem from "sap/m/CustomListItem";
    import FlexBox from "sap/m/FlexBox";
    import ViewSettingsDialog from "sap/m/ViewSettingsDialog";
    import MessagePopover from "sap/m/MessagePopover";
    import VBox from "sap/m/VBox";
    import { ComplexCondition } from "sap/esh/search/ui/sinaNexTS/sina/ComplexCondition";
    import { Filter } from "sap/esh/search/ui/sinaNexTS/sina/Filter";
    import SearchConfigurationSettings from "sap/esh/search/ui/SearchConfigurationSettings";
    import DragDropBase from "sap/ui/core/dnd/DragDropBase";
    import { NavigationTarget } from "sap/esh/search/ui/sinaNexTS/sina/NavigationTarget";
    import { Value } from "sap/esh/search/ui/sinaNexTS/sina/types";
    import { DataSource } from "sap/esh/search/ui/sinaNexTS/sina/DataSource";
    import { ResultSet } from "sap/esh/search/ui/ResultSetApi";
    import EventConsumer from "sap/esh/search/ui/eventlogging/EventConsumer";
    import SearchCompositeControlDragDropConfig from "sap/esh/search/ui/SearchCompositeControlDragDropConfig";
    import PublicSearchModel from "sap/esh/search/ui/PublicSearchModel";
    import Model from "sap/ui/model/Model";
    import ToolbarAssembler from "sap/esh/search/ui/compositecontrol/ToolbarAssembler";
    import ResultViewsAssembler from "sap/esh/search/ui/compositecontrol/ResultViewsAssembler";
    import SearchConfiguration from "sap/esh/search/ui/SearchConfiguration";
    import SearchSelectionBar from "sap/esh/search/ui/controls/SearchSelectionBar";
    import SearchResultPanel from "sap/esh/search/ui/controls/resultview/SearchResultPanel";
    import { PublicSina } from "sap/esh/search/ui/sinaNexTS/sina/PublicSina";
    import { Condition } from "sap/esh/search/ui/sinaNexTS/sina/Condition";
    import OverflowToolbarToggleButton from "sap/m/OverflowToolbarToggleButton";
    import { SelectionMode } from "sap/esh/search/ui/SelectionMode";
    /**
     * Search control (input for search terms, suggestions, facets, result list views "list", "table", "grid")
     *
     */
    /**
     * Constructs a new <code>SearchCompositeControl</code> to interact with SAP Enterprise Search Services.
     *
     * @param {string} [sId] ID for the new control, generated automatically if no ID is given
     * @param {object} [mSettings] Initial settings for the new control
     *
     * @class
     *
     * This is the SAPUI5 composite control by the Enterprise Search Team which helps to make full use of the Enterprise Search Engine
     * features built into ABAP and HANA.
     * It includes a search input box including a suggestion dropdown, a result view which can have different visualisation, including tiles, list and table, filtering facets and more.
     * This control is ready to use with an enterprise search backend service but also allows deep extension to match requirements of adopting applications.
     *
     * @extends sap.ui.core.Control
     *
     * @author SAP SE
     * @version 1.141.1
     *
     * @see https://help.sap.com/viewer/691cb949c1034198800afde3e5be6570/2.0.05/en-US/ce86ef2fd97610149eaaaa0244ca4d36.html
     * @see https://help.sap.com/viewer/6522d0462aeb4909a79c3462b090ec51/1709%20002/en-US
     *
     *
     * @constructor
     * @public
     * @alias sap.esh.search.ui.SearchCompositeControl
     * @since 1.93.0
     * @name sap.esh.search.ui.SearchCompositeControl
     *
     */
    /**
     * @namespace sap.esh.search.ui
     */
    export default class SearchCompositeControl extends VerticalLayout {
        static readonly metadata: {
            library: string;
            dnd: {
                draggable: boolean;
                droppable: boolean;
            };
            properties: {
                /**
                 * An additional CSS class to add to this control
                 * @since 1.93.0
                 */
                cssClass: {
                    type: string;
                };
                /**
                 * Defines the initial search term for the search input.
                 * @since 1.93.0
                 */
                searchTerm: {
                    type: string;
                    group: string;
                    defaultValue: string;
                };
                /**
                 * Defines if the search composite control will send a search request directly after loading, using given search term, data source and filter root condition settings.
                 * @since 1.93.0
                 */
                searchOnStart: {
                    type: string;
                    group: string;
                    defaultValue: boolean;
                };
                /**
                 * Defines the filter root condition of a filter tree which shall be applied to the search request.
                 * This control only allows filter trees which have a the following structure:
                 * complex condition (root level)
                 *      \
                 *  complex condition (attribute level)
                 *        \
                 *      simple condition (attribute value level)
                 * Filter root conditions which do not follow this structure won't be accepted and an error will be thrown.
                 * Please see the below for a more in-depth example.
                 *
                 * @since 1.98.0
                 * @example A simple use case for filter conditions
                 * sap.ui.require(
                 *       [
                 *          // Adjust the path to the .js files accordingly!
                 *          "sap/esh/search/ui/sinaNexTS/sina/LogicalOperator",
                 *          "sap/esh/search/ui/sinaNexTS/sina/ComparisonOperator",
                 *          "sap/esh/search/ui/sinaNexTS/sina/ComplexCondition",
                 *          "sap/esh/search/ui/sinaNexTS/sina/SimpleCondition",
                 *      ], function (
                 *          LogicalOperatorModule,
                 *          ComparisonOperatorModule,
                 *          ComplexConditionModule,
                 *          SimpleConditionModule
                 *      ) {
                 *          ("use strict");
                 *
                 *          // Root condition must always be of type ComplexCondition!
                 *          const rootCondition = new ComplexConditionModule.ComplexCondition({
                 *              operator: LogicalOperatorModule.LogicalOperator.And,
                 *          });
                 *
                 *          // Conditions of root condition must always be of type ComplexCondition!
                 *          // Create one of those for each attribute.
                 *          // This condition will hold all values for attribute 'FOLKLORIST':
                 *          const complexChildCondition = new ComplexConditionModule.ComplexCondition({
                 *              operator: LogicalOperatorModule.LogicalOperator.Or,
                 *          });
                 *
                 *          // Conditions of complexChildCondition have to be simple conditions!
                 *          // This filter specfies the value of the attributes.
                 *          // The result is an attribute filter like 'FOLKLORIST' = 'Douglas Milford':
                 *          const simpleGrandChildCondition = new SimpleConditionModule.SimpleCondition({
                 *              operator: ComparisonOperatorModule.ComparisonOperator.Eq, // results should be equal to the filter value
                 *              attribute: "FOLKLORIST", // example: name of the attribute
                 *              value: "Douglas Milford", // example: value of the filter
                 *          });
                 *          complexChildCondition.addCondition(simpleGrandChildCondition); // Add the conditions to the condition tree
                 *          rootCondition.addCondition(complexChildCondition);
                 *
                 *          // The filter tree now looks like this:
                 *          //                                   rootCondition
                 *          //                                  /      And    \
                 *          //                   complexChildCondition
                 *          //                   /        Or
                 *          //        simpleGrandChildCondition ('FOLKLORIST' Eq 'Douglas Milford')
                 *          // Additional complex child conditions would be linked by an "And" operator, additional simple attribute
                 *          // filter conditions will be linked by an "Or":
                 *
                 *          // If you would like to apply an additional filter to the 'FOLKLORIST' attribute you can do that, too:
                 *          const simpleGrandChildCondition2 = new SimpleConditionModule.SimpleCondition({
                 *              operator: ComparisonOperatorModule.ComparisonOperator.Eq, // results should be equal to the filter value
                 *              attribute: "FOLKLORIST", // example: name of the attribute
                 *              value: "Cynthia MacDonald", // example: value of the filter
                 *          });
                 *
                 *          complexChildCondition.addCondition(simpleGrandChildCondition2);
                 *
                 *          // The filter tree now looks like this:
                 *          //                                   rootCondition
                 *          //                                  /      And
                 *          //                          complexChildCondition
                 *          //                         /         Or          \
                 *          // simpleGrandChildCondition               simpleGrandChildCondition2
                 *
                 *          // create a new search ui:
                 *          const searchUI = new SearchCompositeControl({
                 *              filterRootCondition: rootCondition,
                 *          });
                 *
                 *          // or if it already exists:
                 *          // const searchUI = Element.getElementById("eshCompGenId_0");
                 *          // searchUI.setFilterRootCondition(rootCondition);
                 *  });
                 */
                filterRootCondition: {
                    type: string;
                    group: string;
                };
                /**
                 * Configuration for the Enterprise Search Client API.
                 * @since 1.93.0
                 */
                sinaConfiguration: {
                    type: string;
                    group: string;
                };
                /**
                 * The id of the data source in which it will search right after initialization.
                 * @since 1.98.0
                 */
                dataSource: {
                    type: string;
                    group: string;
                };
                /**
                 * Data source id which is set when the UI is loaded and cannot be changed at run time.
                 * The following UI parts will be hidden:
                 * - data source select (dropdown)
                 * - data source tab bar
                 * - data source facet (facet panel)
                 * - data source name/link on result list (header section of item)
                 * @since 1.121.0
                 */
                exclusiveDataSource: {
                    type: string;
                    group: string;
                };
                /**
                 * Defines selectable search result view types.
                 * The value can be set/get in attach event "searchFinished".
                 * Case 1: Search in Apps: result is displayed in a mandatory view type <code>["appSearchResult"]</code>, and it is not switchable.
                 * Case 2: Search in All or other Category: result is switchable between different view types.
                 * Possible values for the array items are <code>"searchResultList"</code> and <code>"searchResultGrid"</code>.
                 * Case 3, Search in Business Object: result is switchable between different view types.
                 * Possible values for the array items are <code>"searchResultList"</code>, <code>"searchResultTable"</code> and <code>"searchResultGrid"</code>.
                 * Note: The value of <code>resultViewTypes</code> and <code>resultViewType</code> must be compatible to each other.
                 *
                 * After the result view type has been changed, the event 'resultViewTypeChanged' is fired.
                 *
                 * @since 1.98.0
                 */
                resultViewTypes: {
                    type: string;
                    group: string;
                    defaultValue: string[];
                };
                /**
                 * Defines active search result view type.
                 * The value can be set/get in attach event "searchFinished", and it must be contained in resultViewTypes.
                 * Case 1, Search in Apps: result is displayed in a mandatory view type <code>"appSearchResult"</code>.
                 * Case 2.1, Search in All or other Category (configuration.isUshell !== true): result is switchable between different view types.
                 * Possible value is <code>"searchResultList"</code>, or <code>"searchResultGrid"</code>.
                 * Case 2.2, Search in All or other Category (configuration.isUshell === true): result is displayed in a mandatory view type <code>"searchResultList"</code>.
                 * Case 3, Search in Business Object: result is switchable between different view types.
                 * Possible value is <code>"searchResultList"</code>, <code>"searchResultTable"</code> or <code>"searchResultGrid"</code>.
                 * Note: The value of <code>resultViewTypes</code> and <code>resultViewType</code> must be compatible to each other.
                 *
                 * After the result view type has been changed, the event 'resultViewTypeChanged' is fired.
                 *
                 * @since 1.98.0
                 */
                resultViewType: {
                    type: string;
                    group: string;
                    defaultValue: string;
                };
                /**
                 * Defines a pair of search result view settings.
                 * The value is an object of properties <code>resultViewTypes</code> and <code>resultViewType</code>.
                 * An example: <code>{resultViewTypes: ["searchResultList", "searchResultTable"], resultViewType: "searchResultList"}</code>
                 * Find more detail in the definition of each child property.
                 * The value can be set/get in attached event "searchFinished".
                 * Function <code>setResultViewSettings</code> prevents incompatibility of sequential execution of functions <code>setResultViewTypes</code> and <code>setResultViewType</code>.
                 * Note: The value of <code>resultViewTypes</code> and <code>resultViewType</code> must be compatible to each other.
                 *
                 * After the result view type has been changed, the event 'resultViewTypeChanged' is fired.
                 *
                 * @since 1.100.0
                 */
                resultViewSettings: {
                    settings: {
                        resultViewTypes: string;
                        resultViewType: string;
                    };
                    group: string;
                    defaultValue: {
                        resultViewTypes: string[];
                        resultViewType: string;
                    };
                };
                /**
                 * The result views are displayed in a master-detail mode.
                 * The event showResultDetail is fired whenever the detail button/indicator is clicked.
                 *
                 * @public
                 * @since 1.140.0
                 * @param {boolean} [resultviewMasterDetailMode=false] If true, master detail mode is enabled for result view items.
                 *
                 */
                resultviewMasterDetailMode: {
                    type: string;
                    group: string;
                    defaultValue: boolean;
                };
                /**
                 * Function callback for formatting the datasource tabstrips in the top toolbar.
                 * To the callback function a list of datasources is passed. The callback functions return a modified list of datasources
                 * to be displayed in the tabstrips.
                 *
                 * @since 1.103.0
                 */
                tabStripsFormatter: {
                    type: string;
                    group: string;
                };
                /**
                 * Activates the folder mode. Precondition for folder mode is
                 * 1) Search model:
                 * In the search model for the current datasource a hierarchy attribute (representing the folders) is defined
                 * 1.1) the hierarchy attribute is annotated with displayType=TREE and for the hierarchy there is a helper
                 * connector representing the hierarchy or
                 * 1.2) the current datasource is the helper datasource representing the folder hierarchy. The hierarchy attribute
                 * is annotated with displayType=FLAT
                 * 2) Search query:
                 * The folder mode is only active in case the search query has an empty search term and no filter conditions
                 * (except the hierarchy attribute) are set.
                 *
                 * In folder mode and in case a folder filter is set the result view only shows direct children of a folder.
                 * In contrast the counts in the facets are calculated by counting direct and not direct children.
                 * In case the folder mode is not active the UI uses the search mode: The result list shows direct and
                 * not direct children of a folder.
                 * * @since 1.106.0
                 */
                folderMode: {
                    type: string;
                    group: string;
                    defaultValue: boolean;
                };
                /**
                 *  In case folderMode is set to true this boolean indicates whether for the initial search the folder mode is enabled.
                 *  @since 1.114.0
                 */
                folderModeForInitialSearch: {
                    type: string;
                    group: string;
                    defaultValue: boolean;
                };
                /**
                 * In case folder mode is active:
                 * Automatically switch result view type to list in search mode and to table in folder mode.
                 * @since 1.106.0
                 */
                autoAdjustResultViewTypeInFolderMode: {
                    type: string;
                    group: string;
                    defaultValue: boolean;
                };
                /**
                 * Enables the query language for the hana_odata provider.
                 * With query language it is possible for the end user to enter complex search
                 * queries with logical operators.
                 * @since 1.107.0
                 */
                enableQueryLanguage: {
                    type: string;
                    group: string;
                    defaultValue: boolean;
                };
                /**
                 * Relevant for SAP partners and SAP, the "Application Component" you expect customers to create incidents.
                 * @since 1.108.0
                 */
                applicationComponent: {
                    type: string;
                    group: string;
                    defaultValue: string;
                };
                /**
                 * Display a splitter bar to resize the left hand panel, containing all facets and filter criteria.
                 * @since 1.108.0
                 */
                facetPanelResizable: {
                    type: string;
                    group: string;
                    defaultValue: boolean;
                };
                /**
                 * Default size (percent) of the left hand panel, containing all facets and filter criteria. If "facetPanelResizable" is true, the width of the facet panel can be changed by the user.
                 * @since 1.108.0
                 */
                facetPanelWidthInPercent: {
                    type: string;
                    group: string;
                    defaultValue: number;
                };
                /**
                 * Whenever a search has no results, a 'No Results Screen' is displayed. You can provide a custom control to be more specific and add some hints, links, buttons or other content.
                 * @since 1.94.0
                 */
                getCustomNoResultScreen: {
                    type: string;
                    group: string;
                };
                /**
                 * A callback which returns customized "label" for placeholder text of search box in case there is no search term.
                 * The placeholder text (en) will be "Search In: <customPlaceholderLabel>".
                 */
                getSearchInputPlaceholderLabel: {
                    type: string;
                    group: string;
                };
                /**
                 * Location of the search input box. The search input can be placed on the top of the control (SearchCompositeControl) or as part of the search bar
                 * By default the location is at the top, values are "Top" and "Searchbar".
                 * @since 1.140.0
                 * @experimental Since 1.140.0 this feature is experimental and the API may change.
                 */
                searchInputLocation: {
                    type: string;
                    group: string;
                    defaultValue: string;
                };
                /**
                 * Shall the window title be overwritten by this control?
                 * If true, the control will set the current search condition as window title.
                 * If false, it will not set or update the window title.
                 * @since 1.93.0
                 */
                overwriteBrowserTitle: {
                    type: string;
                    group: string;
                };
                /**
                 * Data source id which is set when the UI is loaded or filter is reset.
                 * If dataSource is also set, dataSource will be used during UI load and this
                 * parameter will used only after filter is reset. When setting 'exclusiveDataSource' to 'true', do not set this parameter (will be ignored).
                 * @since 1.93.0
                 */
                defaultDataSource: {
                    type: string;
                    group: string;
                };
                /**
                 * The layout is optimized for object selection / value help (narrow view w/o facet panel).
                 * @since 1.111.0
                 */
                optimizeForValueHelp: {
                    type: string;
                    group: string;
                };
                /**
                 * Callback for filtering the datasources displayed in the datasource dropdown listbox.
                 * The callback gets a list of datsources and returns the filtered list of datasources.
                 * @since 1.112.0
                 */
                filterDataSources: {
                    type: string;
                    group: string;
                };
                /**
                 * Controls whether the facet functionality is available or not.
                 * @since 1.132.0
                 */
                facets: {
                    type: string;
                    group: string;
                    defaultValue: boolean;
                };
                /**
                 * A boolean which indicates whether the facet panel is initially openend or closed.
                 * This affects only the initial state of the facet panel.
                 * This initial state of the facet panel can be overwritten by the user, depending
                 * on the user's personalization settings.
                 * @since 1.113.0
                 */
                facetVisibility: {
                    type: string;
                    group: string;
                    defaultValue: boolean;
                };
                /**
                 * Location of the button to show/hide facet panel. The button (filter icon) can be placed on the left (begin) or on the right (end) of the search bar.
                 * By default the button's location is at the beginning (left), values are "Begin" and "End".
                 * The property is not evaluated if facet panel is disabled, see property 'facets'.
                 * @since 1.140.0
                 * @experimental Since 1.140.0 this feature is experimental and the API may change.
                 */
                facetToggleButtonLocation: {
                    type: string;
                    group: string;
                    defaultValue: string;
                };
                /**
                 * A boolean for enabling chart visualizations (pie chart / bar chart facets).
                 * If set to true, facets can be viewed as a pie or bar chart (this cannot be deactivated at runtime).
                 * @since 1.140.0
                 */
                enableCharts: {
                    type: string;
                    group: string;
                    defaultValue: boolean;
                };
                /**
                 * A boolean for enabling (business) object suggestions.
                 * @since 1.113.0
                 */
                boSuggestions: {
                    type: string;
                    group: string;
                    defaultValue: boolean;
                };
                /**
                 * When set to true the facet panel is displayed also in case there are no search results.
                 * @since 1.113.0
                 * @deprecated As of version 1.134.0, this setting is ignored and the visibility of the facet panel is controlled by the end user.
                 */
                displayFacetPanelInCaseOfNoResults: {
                    type: string;
                    group: string;
                    defaultValue: boolean;
                };
                /**
                 * A boolean indicating that the search state is written to the URL.
                 * @since 1.113.0
                 */
                updateUrl: {
                    type: string;
                    group: string;
                    defaultValue: boolean;
                };
                /**
                 * A callback for rendering the search URL. The callback gets a list of url encoded parameters and returns the URL string.
                 * Typically you need to register this callback in case of 'updateUrl = true'.
                 * @since 1.113.0
                 * @example
                 * <code>
                 * const renderSearchUrl = function (properties){
                    return (
                        "#Action-search&/top=" +
                        properties.top +
                        (properties.orderby ? "&orderBy=" + properties.orderby : "") +
                        (properties.sortorder ? "&sortOrder=" + properties.sortorder : "") +
                        "&filter=" +
                        properties.filter
                    );
                  };
                  </code>
                 */
                renderSearchUrl: {
                    type: string;
                    group: string;
                };
                /**
                 * A callback for checking whether a URL is a search-relevant URL. The callback receives a URL and returns 'true' in case the URL is a search-relevant URL.
                 * Typically you need to register this callback in case of 'updateUrl = true'.
                 * @since 1.113.0
                 * @example
                 * <code>
                 * const isSearchUrl =function (url) {
                      return url.indexOf("#Action-search") === 0;
                   };
                   </code>
                 */
                isSearchUrl: {
                    type: string;
                    group: string;
                };
                /**
                 * A callback for parsing URL parameters. The callback receices URL parameters and returns modified URL parameters.
                 * This is an optional callback. In case you set 'updateUrl = true' typcically this callback is not needed.
                 * @since 1.113.0
                 */
                parseSearchUrlParameters: {
                    type: string;
                    group: string;
                };
                /**
                 * A list of data sources to be displayed in the facet panel in the section "Collection".
                 * @since 1.113.0
                 */
                quickSelectDataSources: {
                    type: string;
                    group: string;
                };
                /**
                 * A callback which is called whenever the selection of result view items changes.
                 * @since 1.113.0
                 * @deprecated As of version 1.137.0, this setting is ignored, subscribe to event 'selectionChange'.
                 */
                selectionChange: {
                    type: string;
                    group: string;
                };
                /**
                 * An asynchronues callback which is called after the initialization of the search composite control.
                 * @since 1.113.0
                 */
                initAsync: {
                    type: string;
                    group: string;
                };
                /**
                 * Enables the multiselection mode of search result items.
                 * A checkbox is provided for each result item if the value is set to 'true'.
                 * @public
                 * @since 1.96.0
                 * @deprecated As of version 1.141.0, use 'resultviewSelectionMode' instead.
                 */
                enableMultiSelectionResultItems: {
                    type: string;
                    group: string;
                    defaultValue: boolean;
                };
                /**
                 * To select result view items, enable multi-selection or single-selection mode. Shows checkboxes ('MultipleItems') or enables item press ('OneItem'). Values of configuration parameter `resultviewSelectionMode` are 'None', 'OneItem' and 'MultipleItems'.
                 * To show a button for switching selection mode on/off, see 'showSelectionToggleButton'.
                 * A checkbox is provided for each result item if the value is true.
                 * The setting is related to `resultviewMasterDetailMode` (master-detail mode). The event `showResultDetail` is fired whenever the detail button is clicked.
                 * @public
                 * @since 1.141.0
                 * @param {"None" | "SingleSelect" | "MultiSelect"} selectionMode The mode to control checkboxes of result view items.
                 */
                resultviewSelectionMode: {
                    type: string;
                    group: string;
                    defaultValue: string;
                    values: {
                        name: string;
                        key: string;
                    }[];
                };
                /**
                 * Enables the selection toggle button in the search result list.
                 * The button is displayed on the top of search result view and allows to toggle the selection of all result items.
                 * The button is only displayed if the property 'resultviewSelectionMode' is not set to 'None'.
                 * @public
                 * @since 1.140.0
                 * @param {boolean} [showSelectionToggleButton=false] If true, shows a toggle button to show/hide selection indicators (checkboxes).
                 */
                showSelectionToggleButton: {
                    type: string;
                    group: string;
                    defaultValue: boolean;
                };
                /**
                 * The maximum count of search result items displayed on a page after a search.
                 * By clicking 'Show More' button, another page of result items of the same count (if available) will be displayed.
                 * @since 1.96.0
                 */
                pageSize: {
                    type: string;
                    group: string;
                    defaultValue: number;
                };
                /**
                 * Callback for formatting the filter string to be displayed on the filter bar (for closed facet panel).
                 * @since 1.120
                 */
                formatFilterBarText: {
                    type: string;
                    group: string;
                };
                /**
                 * Callback for checking whether the filter bar is visible.
                 * @since 1.120
                 */
                isFilterBarVisible: {
                    type: string;
                    group: string;
                };
                /**
                 * Adds a callback function which is called whenever there is a user or a technical event.
                 * A user event is an event which is triggered by the user interaction with the UI, such as clicking.
                 * A technical event is an event which is triggered by the internal events or events which can also
                 * be triggered by API.
                 * @since 1.120
                 * @example
                 * <pre><code>
                 * const logEventConsumer = {
                 *     label: "my log event consumer",
                 *     logEvent: (event) => {
                 *         console.log("user event happened: " + event.type)
                 *     }
                 *     logTechnicalEvent: (event) => {
                 *         console.log("technical event happened: " + event.type)
                 *     }
                 * }
                 * mySearchCompositeControl.addEventConsumer(logEventConsumer);
                 * </code></pre>
                 */
                eventConsumers: {
                    singularName: string;
                    multiple: boolean;
                    group: string;
                };
                /**
                 * Limit for length of searchterm.
                 */
                searchTermLengthLimit: {
                    type: string;
                    group: string;
                    defaultValue: number;
                };
                /**
                 * Prevents too many ajax requests in a short time.
                 */
                limitAjaxRequests: {
                    type: string;
                    group: string;
                    defaultValue: boolean;
                };
            };
            aggregations: {
                /**
                 * Control instances which are part of this composite control.
                 * @private
                 */
                content: {
                    singularName: string;
                    multiple: boolean;
                };
            };
            events: {
                /**
                 * Event is fired when search is started.
                 * @since 1.121
                 */
                searchStarted: {};
                /**
                 * Event is fired when search is finished.
                 * @since 1.121
                 */
                searchFinished: {};
                /**
                 * Event is fired when selection on result view (list, table or grid) has changed.
                 * @since 1.142
                 */
                /**
                 * Event is fired when selection on result view (list, table or grid) has changed.
                 * @since 1.121
                 * Will be deprecated as of version 1.142.0, use 'resultViewSelectionChanged' instead. The new event comes with more details about selected/deselected items.
                 */
                selectionChanged: {};
                /**
                 * Event is fired after result view type got changed (list, table or grid).
                 * @since 1.124
                 */
                resultViewTypeChanged: {};
                /**
                 * Event is fired after result view detail button is pressed (list, table or grid).
                 * To use this event, set the property 'resultviewMasterDetailMode' to 'true'.
                 * @since 1.140.0
                 */
                showResultDetail: {};
            };
        };
        errorHandler: ErrorHandler;
        oSearchCompositeControlDragDropConfig: SearchCompositeControlDragDropConfig;
        searchContainer: SearchLayoutResponsive;
        oSearchFieldGroup: SearchFieldGroup;
        oFilterBar: SearchFilterBar;
        oNlqExplainBar: SearchNlqExplainBar;
        oSearchBar: OverflowToolbar;
        oFilterButton: OverflowToolbarToggleButton;
        oSelectionButton: OverflowToolbarToggleButton;
        oDataSourceTabBar: IconTabBar;
        oGenericItemsToolbar: OverflowToolbar;
        resultViewSwitch: SegmentedButton;
        oSearchResultContainer: SearchResultContainer;
        oSearchResultPanel: SearchResultPanel;
        resultView: Array<Control>;
        countBreadcrumbsHiddenElement: InvisibleText;
        showMoreFooter: FlexBox;
        sortDialog: ViewSettingsDialog;
        oContextBar: Bar;
        oContextBarContainer: VerticalLayout;
        oSearchCountBreadcrumbs: Control;
        oSearchSelectionBar: SearchSelectionBar;
        noResultScreen: VBox;
        noResultScreenFolder: VBox;
        searchResultTable: SearchResultTable;
        searchResultList: SearchResultList;
        appResultListItem: CustomListItem;
        searchResultGrid: SearchResultGrid;
        searchSpreadsheet: SearchSpreadsheet;
        appSearchResult: VerticalLayout;
        oAppView: Control;
        oFooter: OverflowToolbar;
        oErrorPopover: MessagePopover;
        oFocusHandler: SearchFocusHandler;
        model: SearchModel;
        toolbarAssembler: ToolbarAssembler;
        resultViewsAssembler: ResultViewsAssembler;
        private static eshCompCounter;
        private subscribeDone_SearchStarted;
        private subscribeDone_SearchFinished;
        private subscribeDone_SelectionChanged;
        private subscribeDone_ResultViewTypeChanged;
        private subscribeDone_ShowResultDetail;
        private _cssClass;
        private _oLogger;
        private initSearchPromise;
        private _onHashChangedHandler;
        private isHashChangedAttached;
        constructor(sId?: string, settings?: Partial<SearchConfigurationSettings>);
        getPublicSina(): PublicSina;
        getModel(sName?: string): Model;
        setModel(oModel: Model, sName?: string): this;
        private setModelInternal;
        private browserHasValidSearchUrl;
        private initSearch;
        private static getUI5ControlSettings;
        private static unifyInputParameters;
        exit(): void;
        static renderer: {
            apiVersion: number;
        };
        createContent(): void;
        createSearchFieldGroup(): SearchFieldGroup;
        createWebCompSearchFieldGroup(): SearchFieldGroup;
        createClassicSearchFieldGroup(): SearchFieldGroup;
        onAfterRendering(): void;
        isShowMoreFooterVisible(): boolean;
        assignDragDropConfig(): void;
        addDragDropConfig(oDragDropConfig: DragDropBase): this;
        insertDragDropConfig(oDragDropConfig: DragDropBase, iIndex: number): this;
        indexOfDragDropConfig(oDragDropConfig: DragDropBase): number;
        getDragDropConfig(): Array<DragDropBase>;
        removeDragDropConfig(vDragDropConfig: DragDropBase | string | number): DragDropBase;
        removeAllDragDropConfig(): Array<DragDropBase>;
        destroyDragDropConfig(): this;
        onAllSearchStarted(): void;
        onAllSearchFinished(): void;
        onSelectionChanged(): void;
        onResultViewTypeChanged(): void;
        onShowResultDetail(): void;
        createSearchPage(idPrefix: string): void;
        private createNoResultScreen;
        createSearchContainer(idPrefix: string): SearchLayoutResponsive;
        isSearchFieldGroupLocatedInsideSearchComposite(currentControlDomRef?: HTMLElement | ParentNode): boolean;
        adjustSearchbarCustomGenericButtonWidth(): void;
        _resizeHandler(): void;
        convertPixelToRem(pxValue: number): number;
        createFooter(idPrefix: string): OverflowToolbar;
        chooseNoResultScreen(): void;
        openSortDialog(): void;
        openShowMoreDialog(dimension?: string): void;
        /**
         * Parse the browser URL, update properties and trigger search call (if needed)
         * @public
         * @this sap.esh.search.ui.SearchCompositeControl
         * @since 1.122.0
         * @returns this
         */
        parseURL(): SearchCompositeControl;
        /**
         * Get the public part of the search model (JSON)
         * In general the model is read-only but a few properties can be modified.
         * Modifiable properties (i.e. consumtion via two-way binding):
         *  - 'results[i].data.selected'
         * For binding use model 'publicSearchModel' (i.e. "publicSearchModel>results/...")
         * @public
         * @this sap.esh.search.ui.SearchCompositeControl
         * @since 1.122.0
         * @returns {object} A JSON model containing public artefacts of internal search model
         */
        getPublicSearchModel(): PublicSearchModel;
        /**
         * Get activation status of master detail mode
         * @public
         * @this sap.esh.search.ui.SearchCompositeControl
         * @since 1.141.0
         * @returns {boolean} The activation status of master detail mode
         */
        getResultviewMasterDetailMode(): boolean;
        /**
         * Set activation status of master detail mode
         * @public
         * @this sap.esh.search.ui.SearchCompositeControl
         * @since 1.141.0
         * @returns this
         */
        setResultviewMasterDetailMode(bMasterDetailMode: boolean): SearchCompositeControl;
        /**
         * Get result view selection mode ('None', 'OneItem', 'MultipleItems')
         * @public
         * @this sap.esh.search.ui.SearchCompositeControl
         * @since 1.141.0
         * @returns {string} The result view selection mode
         */
        getResultviewSelectionMode(): boolean;
        /**
         * Set result view selection mode ('None', 'OneItem', 'MultipleItems')
         * @public
         * @this sap.esh.search.ui.SearchCompositeControl
         * @since 1.141.0
         * @returns this
         */
        setResultviewSelectionMode(selectionMode: SelectionMode): SearchCompositeControl;
        /**
         * Get the internal search model (JSON)
         * In general the internal search model shall not be accessed by consumers of SearchCompositeControl
         * The preferred consumption of search model data is to use public search model 'publicSearchModel' (i.e. "publicSearchModel>results/..."), also see function getPublicSearchModel
         * @public
         * @this sap.esh.search.ui.SearchCompositeControl
         * @since 1.122.0
         * @returns {object} A JSON model containing public artefacts of internal search model
         */
        getModelInternal(sName?: string): Model;
        /**
         * Gets the set of result items
         * @public
         * @this sap.esh.search.ui.SearchCompositeControl
         * @since 1.114.0
         * @returns {object} The result set containg 'items'.
         */
        getSearchResultSet(): ResultSet;
        /**
         * Gets search result view types
         * @public
         * @this sap.esh.search.ui.SearchCompositeControl
         * @since 1.98.0
         * @returns {string[]} The array of active search result view types.
         */
        getResultViewTypes(): Array<string>;
        /**
         * Sets search result view types
         * @public
         * @this sap.esh.search.ui.SearchCompositeControl
         * @since 1.98.0
         * @param {string[]} resultViewTypes The array of active search result view types.
         * @example
         * setResultViewTypes(["searchResultList", "searchResultTable"])
         * @returns this
         */
        setResultViewTypes(resultViewTypes: Array<string>): SearchCompositeControl;
        /**
         * Gets search result view type
         * @public
         * @this sap.esh.search.ui.SearchCompositeControl
         * @since 1.98.0
         * @returns {"appSearchResult" | "searchResultList" | "searchResultTable" | "searchResultGrid" | "" | string} The active search result view type.
         */
        getResultViewType(): string;
        /**
         * Sets search result view type
         * @public
         * @this sap.esh.search.ui.SearchCompositeControl
         * @since 1.98.0
         * @param {"appSearchResult" | "searchResultList" | "searchResultTable" | "searchResultGrid"} resultViewType The active search result view type.
         * @example
         * setResultViewType("searchResultList")
         * @returns this
         */
        setResultViewType(resultViewType: string): SearchCompositeControl;
        /**
         * Gets search result view type settings
         * @public
         * @this sap.esh.search.ui.SearchCompositeControl
         * @since 1.100.0
         * @returns {object} The object of resultViewTypes and resultViewType.
         */
        getResultViewSettings(): {
            resultViewTypes: Array<string>;
            resultViewType: string;
        };
        /**
         * Sets search result view type settings
         * @public
         * @this sap.esh.search.ui.SearchCompositeControl
         * @since 1.100.0
         * @param {object} settings The object of resultViewTypes and resultViewType.
         * @example
         * setResultViewSettings({resultViewTypes: ["searchResultList", "searchResultTable"], resultViewType: "searchResultList"})
         * @returns this
         */
        setResultViewSettings(resultlViewSettings: {
            resultViewTypes: Array<string>;
            resultViewType: string;
        }): SearchCompositeControl;
        getControllerName(): string;
        /**
         * Gets the additional CSS class which was applied to this control
         * @public
         * @since 1.98.0
         * @this sap.esh.search.ui.SearchCompositeControl
         * @returns {string} The additional CSS class which was applied to this control
         */
        getCssClass(): string;
        /**
         * Adds an additional CSS class to this control
         * @public
         * @since 1.98.0
         * @this sap.esh.search.ui.SearchCompositeControl
         * @param {string} cssClass The new CSS class
         * @returns this
         */
        setCssClass(cssClass: string): SearchCompositeControl;
        /**
         * Gets the id of the active data source which is selected in the data source drop down list.
         * @public
         * @this sap.esh.search.ui.SearchCompositeControl
         * @since 1.98.0
         * @returns {string} The id of currently selected data source.
         */
        getDataSource(): string;
        /**
         * Sets the id of the active data source which is selected in the data source drop down list.
         * @public
         * @since 1.98.0
         * @this sap.esh.search.ui.SearchCompositeControl
         * @param {string} dataSource The id of the new to be selected data source
         * @param {boolean} [fireQuery=true] If true, fires a search query right away. Set to false for batch updates.
         * @param {boolean} [resetTop=true] If true, top will be reset to the default number of visible results.
         */
        setDataSource(dataSourceId: string, fireQuery: boolean, resetTop: boolean): SearchCompositeControl;
        /**
         * Resets the active data source which is selected in the data source drop down list to its default (see 'defaultDataSource'/'exclusiveDataSource').
         * @public
         * @since 1.124.0
         * @this sap.esh.search.ui.SearchCompositeControl
         * @memberof sap.esh.search.ui.SearchCompositeControl.prototype
         * @param {boolean} [fireQuery=true] If true, fires a search query right away. Set to 'false' for batch updates.
         * @returns {this}
         */
        resetDataSource(fireQuery?: boolean): Promise<SearchCompositeControl | void>;
        /**
         * Invalidate the search cache and optionally fire a new search.
         * Also see functions 'retriggerSearch' and 'invalidateSearchResultCache'.
         * @public
         * @since 1.124.0
         * @this sap.esh.search.ui.SearchCompositeControl
         * @memberof sap.esh.search.ui.SearchCompositeControl.prototype
         * @param {boolean} [invalidateQuery=false] Indicates wether the search query should be resetted. Set to 'true' to reset the query.
         * @param {boolean} [fireQuery=true] Indicates wether the search query should be sent to the search service or not. Set to 'false', to prevent auto-update of search results.
         * @returns {Promise<true | void>} Returns 'true' if the search query was fired, otherwise 'void'.
         */
        search(invalidateQuery?: boolean, fireQuery?: boolean): Promise<true | void>;
        /**
         * Resets the UI / search results (reset search query and fire a new search).
         * @public
         * @since 1.125.0
         * @this sap.esh.search.ui.SearchCompositeControl
         * @memberof sap.esh.search.ui.SearchCompositeControl.prototype
         * @returns {Promise<void>}
         */
        resetSearch(): Promise<void>;
        /**
         * Fire a new search (includes invalidation of search cache).
         * To invalidate the search cache w/o triggering a new search, use function 'invalidateSearchResultCache' instead.
         * @public
         * @since 1.124.0
         * @this sap.esh.search.ui.SearchCompositeControl
         * @memberof sap.esh.search.ui.SearchCompositeControl.prototype
         * @returns {Promise<void>}
         */
        retriggerSearch(): Promise<void>;
        /**
         * Invalidate the search cache.
         * To trigger a search in addition, use function 'retriggerSearch' instead.
         * @public
         * @since 1.124.0
         * @this sap.esh.search.ui.SearchCompositeControl
         * @memberof sap.esh.search.ui.SearchCompositeControl.prototype
         * @returns {Promise<void>}
         */
        invalidateSearchResultCache(): Promise<void>;
        /**
         * Gets the search term which is displayed in the search box.
         * @public
         * @since 1.98.0
         * @this sap.esh.search.ui.SearchCompositeControl
         * @returns {string} The search term
         */
        getSearchTerm(): string;
        /**
         * Sets the search term which is displayed in the search box.
         * @public
         * @since 1.98.0
         * @this sap.esh.search.ui.SearchCompositeControl
         * @param {string} searchTerm Sets the new search term
         * @param {boolean} [fireQuery=true] Indicates wether the search query should be sent to the search service or not.
         * Not sending it could be useful for batch updates, for example if the data source shall also be changed.
         * This way, the search service will not have to deal with outdated queries which will improve overall performance.
         * @returns this
         */
        setSearchTerm(searchTerm: string, fireQuery: boolean): SearchCompositeControl;
        /**
         * Gets the settings.
         * @public
         * @since 1.125.0
         * @this sap.esh.search.ui.SearchCompositeControl
         * @returns {object} The settings (search configuration)
         */
        getConfig(): SearchConfiguration;
        /**
         * Gets the filter containing all attribute filters currently set and functions to manipulate the filter.
         * @public
         * @since 1.124.0
         * @this sap.esh.search.ui.SearchCompositeControl
         * @returns {object} The filter
         */
        getFilter(): Filter;
        /**
         * Gets the filter root condition which contains all attribute filters currently set.
         * @public
         * @since 1.98.0
         * @this sap.esh.search.ui.SearchCompositeControl
         * @returns {object} The filter root condition
         */
        getFilterRootCondition(): ComplexCondition;
        /**
         * Update hierarchy facet
         * Updates the one and only (static) hierarchy facet (tree control on facet panel).
         * If no hierarchy facet exists, nothing will happen.
         * @public
         * @since 1.126.0
         * @this sap.esh.search.ui.SearchCompositeControl
         * @memberof sap.esh.search.ui.SearchCompositeControl.prototype
         * @returns {Promise<void>}
         */
        updateStaticHierarchyFacet(): Promise<void>;
        /**
         * Recalculate the placeholder text of search input field. If implemented, this will also call function 'getSearchInputPlaceholderLabel' to get the label for the placeholder text.
         * @public
         * @since 1.136.0
         * @returns void
         */
        recalculateSearchInputPlaceholder(): void;
        /**
         * Sets the filter root condition for the search query.
         *
         * The filter root condition can contain multiple attribute filter which are then combined using AND or OR operators.
         * For a more comprehensive explanation and examples, see the description of the filterRootCondition property of this control.
         *
         * @public
         * @since 1.98.0
         * @this sap.esh.search.ui.SearchCompositeControl
         * @param {object} filterRootCondition Sets the new filter root condition.
         * @param {boolean} [fireQuery=true] Indicates wether the search query should be sent to the search service or not.
         * Not sending it could be useful for batch updates, for example if the data source shall also be changed.
         * This way, the search service will not have to deal with outdated queries which will improve overall performance.
         * @returns this
         */
        setFilterRootCondition(filterRootCondition: ComplexCondition, fireQuery: boolean): SearchCompositeControl;
        /**
         * Assembles a search URL.
         *
         * Use this method for the creation of links to the search UI.
         *
         * @public
         * @since 1.103.0
         * @this sap.esh.search.ui.SearchCompositeControl
         * @param {number} top Number of search results to be displayed.
         * @param {object} filter A sina filter object storing the searchterm, datasource  and the filter conditions.
         * @param {boolean} encodeFilter A boolean whether to encode the URL parameters or not.
         * @returns {string} search URL.
         * @deprecated Use createSearchNavigationTarget
         */
        renderSearchUrlFromParameters(top: number, filter: Filter, encodeFilter: boolean): string;
        /**
         * Create a NavigationTarget instance for filtering/search.
         *
         * Use this method for the creation a NavigationTarget instance with filter and label.
         *
         * @public
         * @since 1.114.0
         * @this sap.esh.search.ui.SearchCompositeControl
         * @param {object} filter A sina filter object storing the searchterm, datasource  and the filter conditions.
         * @param {string} label The label of the navigation target.
         * @returns {object} The NavigationTarget instance. If the configuration parameter updateUrl is true, it contains targetUrl, otherwise it contains targetFunction.
         */
        createSearchNavigationTarget(filter: Filter, label: string): NavigationTarget;
        /**
         * Create a NavigationTarget instance for hierarchy.
         *
         * Use this method for the creation a NavigationTarget instance by hierarchical node id value and its label.
         *
         * @public
         * @since 1.114.0
         * @this sap.esh.search.ui.SearchCompositeControl
         * @param {object} hierarchyNodeId The hiearchical node id value of the giving datasource or its helper hierarchical datasource.
         * @param {string} hierarchyNodeLabel The label of the hiearchical node id.
         * @param {object} dataSource The datasource instance.
         * @param {string} navigationTargetLabel The label of the NavigatonTarget instance.
         * @returns {object} The NavigationTarget instance. If the configuration parameter updateUrl is true, it contains targetUrl, otherwise it contains targetFunction.
         */
        createStaticHierarchySearchNavigationTarget(hierarchyNodeId: Value, hierarchyNodeLabel: string, dataSource: DataSource, navigationTargetLabel: string): NavigationTarget;
        /**
         * Adds a callback function which is called whenever there is a user triggered event.
         *
         * @public
         * @since 1.120.0
         * @this sap.esh.search.ui.SearchCompositeControl
         * @returns void
         * @callback eventConsumer This function will be called when the user triggered an UI event. As arguments this
         * function will receive the UI event along with details of the event.
         * @example A simple event consumer which could be passed to the addEventConsumer function
         * const logEventConsumer = {
         *     label: "my log event consumer",
         *     logEvent: (event) => {
         *         console.log("user event happened: " + event.type)
         *     }
         * }
         * mySearchCompositeControl.addEventConsumer(logEventConsumer);
         */
        addEventConsumer(eventConsumer: EventConsumer): void;
        /**
         * Returns all event consumers.
         *
         * @public
         * @since 1.120.0
         * @this sap.esh.search.ui.SearchCompositeControl
         * @returns {array} List containing all event consumers.
         */
        getEventConsumers(): Array<EventConsumer>;
        /**
         * Sets a list of event consumers.
         *
         * @public
         * @since 1.120.0
         * @this sap.esh.search.ui.SearchCompositeControl
         * @param {array} eventConsumers List containing all event consumers.
         * @returns {SearchCompositeControl}
         */
        setEventConsumers(eventConsumers: Array<EventConsumer>): SearchCompositeControl;
        /**
         * close old visible dialogs after new search starts
         *
         * List of ui elements: Result Sort Dialog, Result Table Personalization Dialog, Result Export Limitation Dialog, Result Share Action Sheet, Facet Show More Dialog, Result Save/Share Action Sheet.
         *
         * @public
         * @since 1.130.0
         * @this sap.esh.search.ui.SearchCompositeControl
         * @returns void
         */
        private closePopovers;
        /**
         * Get the status of initialization. In unsuccessful case, the corresponding error instance is returned either.
         *
         * @public
         * @since 1.132.0
         * @this sap.esh.search.ui.SearchCompositeControl
         * @memberof sap.esh.search.ui.SearchCompositeControl.prototype
         * @returns {object} Promise<{success: boolean;error?: Error;}> If success is true, the initialization was successful. If success is false, the error property contains the error instance for further handling.
         *
         * @example Check the initialization status and handle potential ESHNoBusinessObjectDatasourceError
         * const searchCompControl = new SearchCompositeControl(sId, searchConfig);
         * const status = await searchCompControl.getInitializationStatus();
         * if (
         *       status &&
         *       status.success === false &&
         *       status.error instanceof NoValidEnterpriseSearchAPIConfigurationFoundError &&
         *       status.error.previous instanceof ESHNoBusinessObjectDatasourceError
         * ) {
         *       console.error("Error creating SearchCompositeControl: ", status.error.previous.message);
         * }
         */
        getInitializationStatus(): Promise<{
            success: boolean;
            error?: Error;
        }>;
        /**
         * Retrieves a list of filter conditions from the root filter
         * that do not belong to the standard filter-by conditions.
         * These conditions often represent additional static or hierarchy-based filters
         * that are not meant to be displayed in the typical “filter-by” UI.
         *
         * This method is a convenience wrapper calling an internal engine-level function
         * (`getStaticHierarchyFilterConditions`) on the underlying `SearchModel`.
         *
         * @public
         * @since 1.133.0
         * @this sap.esh.search.ui.SearchCompositeControl
         * @returns {Condition[]} An array of filter conditions which are considered
         *                       "static hierarchy facet filter" conditions.
         */
        getStaticHierarachyFilters(): Condition[];
        /**
         * This method checks if the filter contains only static hierarchy facet filter conditions.
         *
         * @public
         * @since 1.136.0
         * @this sap.esh.search.ui.SearchCompositeControl
         * @returns {boolean} true if the filter contains only static hierarchy facet filter conditions,
         *                    false otherwise.
         */
        hasStaticHierarchyFacetFilterConditionOnly(): boolean;
        /**
         * Clears the object selection in the search results list,table or grid.
         * It is useful when you want to clear any user selections and start fresh.
         *
         * @public
         * @since 1.133.0
         * @this sap.esh.search.ui.SearchCompositeControl
         * @returns void
         */
        clearObjectSelection(): void;
    }
    let messagePopoverId: number;
}
//# sourceMappingURL=SearchCompositeControl.d.ts.map