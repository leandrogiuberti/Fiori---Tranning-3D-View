declare module "sap/esh/search/ui/SearchModel" {
    import ErrorHandler, { IUIMessage } from "sap/esh/search/ui/error/ErrorHandler";
    import JSONModel from "sap/ui/model/json/JSONModel";
    import { FormattedResultItem } from "sap/esh/search/ui/SearchResultFormatter";
    import { Tree as SearchTabStripsTree } from "sap/esh/search/ui/SearchTabStripsFormatter";
    import SearchResultTableFormatter, { Column } from "sap/esh/search/ui/SearchResultTableFormatter";
    import SearchFacetsFormatter from "sap/esh/search/ui/SearchFacetsFormatter";
    import SearchConfiguration from "sap/esh/search/ui/SearchConfiguration";
    import PersonalizationStorage from "sap/esh/search/ui/personalization/PersonalizationStorage";
    import EventLogger from "sap/esh/search/ui/eventlogging/EventLogger";
    import SearchUrlParser from "sap/esh/search/ui/SearchUrlParser";
    import UserCategoryManager from "sap/esh/search/ui/usercategories/UserCategoryManager";
    import RecentlyUsedStorage from "sap/esh/search/ui/RecentlyUsedStorage";
    import { DataSource } from "sap/esh/search/ui/sinaNexTS/sina/DataSource";
    import { Sina } from "sap/esh/search/ui/sinaNexTS/sina/Sina";
    import { SearchQuery } from "sap/esh/search/ui/sinaNexTS/sina/SearchQuery";
    import { ComplexCondition } from "sap/esh/search/ui/sinaNexTS/sina/ComplexCondition";
    import { QuerySortOrder } from "sap/esh/search/ui/sinaNexTS/sina/Query";
    import { SearchFocusHandler } from "sap/esh/search/ui/SearchHelper";
    import { ISearchTermHandler } from "sap/esh/search/ui/searchtermhandler/ISearchTermHandler";
    import Context from "sap/ui/model/Context";
    import MessageType from "sap/ui/core/message/MessageType";
    import { Condition } from "sap/esh/search/ui/sinaNexTS/sina/Condition";
    import SearchConfigurationSettings from "sap/esh/search/ui/SearchConfigurationSettings";
    interface EventSubscriber {
        eventId: string;
        callback: (eventId: string) => void;
        listener: unknown;
    }
    import { UserCategoryDataSource } from "sap/esh/search/ui/sinaNexTS/sina/UserCategoryDataSource";
    import { OrderBy, SearchNavigationTargetParameters, SearchQueryParameters } from "sap/esh/search/ui/SearchModelTypes";
    import SearchCompositeControl from "sap/esh/search/ui/SearchCompositeControl";
    import Control from "sap/ui/core/Control";
    import { BusyIndicator } from "sap/esh/search/ui/BusyIndicator";
    import { Filter } from "sap/esh/search/ui/sinaNexTS/sina/Filter";
    import { NavigationTarget } from "sap/esh/search/ui/sinaNexTS/sina/NavigationTarget";
    import PublicSearchModel from "sap/esh/search/ui/PublicSearchModel";
    import { SortOrder } from "sap/esh/search/ui/sinaNexTS/sina/SortOrder";
    import { FLPAppSuggestion } from "sap/esh/search/ui/suggestions/AppSuggestionProvider";
    interface $SearchModelSettings {
        configuration: Partial<SearchConfigurationSettings> | SearchConfiguration;
        searchModel: SearchModel;
    }
    /**
     * @namespace sap.esh.search.ui
     */
    export default class SearchModel extends JSONModel {
        config: SearchConfiguration;
        sinaNext?: Sina;
        publicSearchModel: PublicSearchModel;
        pageSize: number;
        boTopDefault: number;
        appTopDefault: number;
        allDataSource: DataSource;
        appDataSource: DataSource;
        favDataSource: UserCategoryDataSource;
        oFacetFormatter: SearchFacetsFormatter;
        searchUrlParser: SearchUrlParser;
        uShellVisualizationInstantiationService: any;
        dataSourceTree: SearchTabStripsTree;
        query: SearchQuery;
        focusHandler: SearchFocusHandler;
        recentlyUsedStorage: RecentlyUsedStorage;
        eventLogger: EventLogger;
        filterChanged: boolean;
        userCategoryManager: UserCategoryManager;
        searchTermHandlers: Array<ISearchTermHandler>;
        errorHandler: ErrorHandler;
        private _suggestionHandler;
        private _performanceLoggerSearchMethods;
        private _subscribers;
        private _initBusinessObjSearchProm;
        private _personalizationStorage;
        private _userCategoryManagerPromise;
        private _tabStripFormatter;
        private _breadcrumbsFormatter;
        private resultSet;
        private _tempDataSources;
        tableFormatter: SearchResultTableFormatter;
        private _searchApplicationsRefuseOutdatedReq;
        private static _searchModels;
        private initAsyncPromise;
        private logger;
        private searchResultSetItemMemory;
        private folderModeResultViewTypeCalculator;
        busyIndicator: BusyIndicator;
        dataSourceOfPreviousSearch: DataSource;
        private initializationStatus;
        private _selectedKeys;
        private selectKey;
        private deselectKey;
        private isKeySelected;
        resetKeyStore(): void;
        private forgetMissingSelections;
        static getModelSingleton(configuration: Partial<SearchConfigurationSettings>, id: string): SearchModel;
        constructor(settings: Partial<$SearchModelSettings>);
        getInitializationStatus(): Promise<{
            success: boolean;
            error?: Error;
        }>;
        initAsync(): Promise<void>;
        private createSina;
        /**
         *
         * @deprecated use initAsync() instead
         */
        initBusinessObjSearch(): Promise<void>;
        calculateDefaultDataSource(): DataSource;
        initFacetVisibility(): void;
        isBusinessObjSearchConfigured(): boolean;
        isBusinessObjSearchEnabled(): boolean;
        setProperty(sPath: string, oValue: unknown, oContext?: Context, bAsyncUpdate?: boolean): boolean;
        setPropertyInternal(sPath: string, oValue: unknown, oContext?: Context, bAsyncUpdate?: boolean, bUpdatePublicModel?: boolean): boolean;
        private shortenSearchTermByConfigLimit;
        private _calculateCountText;
        getSearchCompositeControlInstanceByChildControl(childControlInstance: Control): SearchCompositeControl;
        getPersonalizationStorageInstance(): PersonalizationStorage;
        setPersonalizationStorageInstance(personalizationStorage: PersonalizationStorage): void;
        getSearchBoxTerm(): string;
        setSearchBoxTerm(searchTerm: string, fireQuery?: boolean): void;
        getLastSearchTerm(): string;
        setFacetVisibility(visibility: boolean, fireQuery?: boolean): void;
        getFacetVisibility(): boolean;
        setResultviewSelectionVisibility(visibility: boolean): void;
        getResultviewSelectionVisibility(): boolean;
        getTop(): number;
        setTop(top: number, fireQuery?: boolean): void;
        resetTop(): void;
        getOrderBy(): OrderBy;
        setOrderBy(orderBy: OrderBy, fireQuery?: boolean): void;
        resetOrderBy(fireQuery?: boolean): void;
        updateSortableAttributesSelection(orderBy?: string): void;
        isEqualOrderBy(modelOrderBy: {
            orderBy: string;
            sortOrder: "DESC" | "ASC";
        }, queryOrderBy: Array<QuerySortOrder>): boolean;
        isMyFavoritesAvailable(): boolean;
        calculateIsNlqActive(): void;
        isNlqActive(): boolean;
        getDocumentTitle(): string;
        resetQuery(): void;
        resetSearchResultItemMemory(): void;
        createAllAndAppDataSource(): void;
        getUserCategoryManager(): Promise<UserCategoryManager>;
        loadDataSources(): void;
        resetDataSource(fireQuery?: boolean): void;
        isAllCategory(): boolean;
        isOtherCategory(): boolean;
        isAppCategory(): boolean;
        isUserCategory(): boolean;
        isBusinessObject(): boolean;
        isUserCategoryAppSearchOnlyWithoutBOs(): boolean;
        getDataSource(): DataSource;
        getDefaultDataSource(): DataSource;
        /**
         * @this sap.esh.search.ui.SearchModel
         * @param {string} dataSourceId
         * @param {boolean} [fireQuery]
         * @param {boolean} [resetTop]
         */
        setDataSourceById(dataSourceId: string, fireQuery?: boolean, resetTop?: boolean): void;
        setDataSource(dataSource: DataSource, fireQuery?: boolean, resetTop?: boolean): void;
        notifyFilterChanged(): void;
        getFilterRootCondition(): ComplexCondition;
        setFilterRootCondition(rootCondition: ComplexCondition, fireQuery?: boolean): void;
        addFilterCondition(filterCondition: any, fireQuery?: boolean): void;
        removeFilterCondition(filterCondition: any, fireQuery?: boolean): void;
        resetAllFilterConditions(fireQuery?: boolean): void;
        resetFilterByFilterConditions(fireQuery?: boolean): void;
        setFilter(filter: any): void;
        hasStaticHierarchyFacetFilterConditionOnly(): boolean;
        getStaticHierarchyFilterConditions(): Condition[];
        doSuggestion(): void;
        abortSuggestions(): void;
        fireSearchQuery(deserializationIn?: {
            deserialization?: boolean;
        }): Promise<true | void>;
        private doFireSearchQuery;
        ensureOneTimeDisplayForErrorMessages(): void;
        assembleSortOrder(): Array<{
            id: string;
            order: SortOrder;
        }>;
        getCalculateFacetsFlag(): boolean;
        appSearch(): Promise<true | void>;
        searchApplications(searchTerm: string, top: number, skip: number): Promise<{
            getElements: () => Array<FLPAppSuggestion>;
            totalResults: number;
            searchTerm: string;
        }>;
        private normalSearch;
        private _afterSearchPrepareResultList;
        restoreResultSetItemExpansion(items: Array<FormattedResultItem>): void;
        enableOrDisableMultiSelection(): void;
        updateMultiSelectionSelected(): void;
        calculatePlaceholder(): string;
        updateDataSourceList(newDataSource: DataSource): void;
        removeTempDataSources(): void;
        invalidateQuery(): void;
        private logSearchRequestAdvanced;
        autoStartApp(): void;
        isHomogenousResult(): boolean;
        getResultViewTypes(): Array<string>;
        setResultViewTypes(types: string[]): void;
        getResultViewType(): string;
        setResultViewType(type: string): void;
        calculateResultViewSwitchVisibility(settings?: {
            resultViewTypes: Array<string>;
            resultViewType: string;
        }): void;
        validateResultViewSettings(settings: {
            resultViewTypes: Array<string>;
            resultViewType: string;
        }): void;
        calculateSearchButtonStatus(): void;
        calculateResultList(): void;
        /**
         * push an error object to error array
         * @this sap.esh.search.ui.SearchModel
         * @param { type: MessageType; title: string; description: string } error Error object
         */
        pushUIMessage(error: {
            type: MessageType;
            title: string;
            description: string;
        }): void;
        /**
         * remove all adjacent duplicate messages (message and 'next' message are the same -> keep first message only)
         * @this sap.esh.search.ui.SearchModel
         * @param {any[]} error
         */
        removeAdjacentDuplicateMessages(errors: Array<IUIMessage>): any[];
        updateSearchURLSilently(deserialization: boolean): void;
        parseURL(): void;
        subscribe(eventId: string, callback: (eventId: string) => void, listener: unknown): void;
        unsubscribe(eventId: string, callback: (eventId: string) => void, listener: unknown): void;
        private assertInternalEvents;
        notifySubscribers(eventId: string): void;
        /**
         * Create a NavigationTarget instance.
         * Use this method for the creation a NavigationTarget instance by filter and label for it.
         */
        createSearchNavigationTarget(parameter: Filter | SearchNavigationTargetParameters, label?: string): NavigationTarget;
        createSearchNavigationTargetCurrentState(options?: {
            updateUrl?: boolean;
        }): NavigationTarget;
        parseSearchNavigationTarget(searchNavigationTarget: NavigationTarget): SearchQueryParameters;
        getTableColumns(isStorage: boolean): Array<Column>;
        private fetchTableColumns;
        private isTablePersoStateValid;
        setTableColumns(columns: Array<Column>, isStorage: boolean): void;
        saveTableColumns(columns: Array<Column>): void;
        getTableInitialColumns(): Array<Column>;
        private setTableData;
        private resetTableData;
    }
}
//# sourceMappingURL=SearchModel.d.ts.map