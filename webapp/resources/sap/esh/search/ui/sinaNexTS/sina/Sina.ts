/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import * as core from "../core/core";
import * as errors from "../core/errors";
import * as util from "../core/util";
import { AttributeType } from "./AttributeType";
import { AttributeFormatType } from "./AttributeFormatType";
import { AttributeGroupTextArrangement } from "./AttributeGroupTextArrangement";
import { DataSourceSubType, DataSourceType } from "./DataSourceType";
import { MatchingStrategy } from "./MatchingStrategy";
import { LogicalOperator } from "./LogicalOperator";
import { ComparisonOperator } from "./ComparisonOperator";
import { FacetType } from "./FacetType";
import { SuggestionCalculationMode } from "./SuggestionCalculationMode";
import { SuggestionType } from "./SuggestionType";
import { SortOrder } from "./SortOrder";
import { ConditionType } from "./ConditionType";
import {
    CDSAnnotationsParser,
    CDSAnnotationsParserOptions,
} from "../providers/tools/cds/CDSAnnotationsParser";
import {
    NavigationTargetGenerator as SorsNavigationTargetGenerator,
    NavigationTargetGeneratorOptions,
} from "../providers/tools/sors/NavigationTargetGenerator";
import { SearchResultSet, SearchResultSetOptions } from "./SearchResultSet";
import { SearchResultSetItem, SearchResultSetItemOptions } from "./SearchResultSetItem";
import {
    SearchResultSetItemAttribute,
    SearchResultSetItemAttributeOptions,
} from "./SearchResultSetItemAttribute";
import { ObjectSuggestion, ObjectSuggestionOptions } from "./ObjectSuggestion";
import { SearchQuery, SearchQueryOptions } from "./SearchQuery";
import { ChartQuery, ChartQueryOptions } from "./ChartQuery";
import { SuggestionQuery, SuggestionQueryOptions } from "./SuggestionQuery";
import { DataSourceQuery, DataSourceQueryOptions } from "./DataSourceQuery";
import { Filter, FilterOptions } from "./Filter";
import { ComplexCondition, ComplexConditionJSON, ComplexConditionProperties } from "./ComplexCondition";
import { SimpleCondition, SimpleConditionJSON, SimpleConditionProperties } from "./SimpleCondition";
import { AttributeMetadata, AttributeMetadataOptions } from "./AttributeMetadata";
import { AttributeGroupMetadata, AttributeGroupMetadataOptions } from "./AttributeGroupMetadata";
import { AttributeGroupMembership, AttributeGroupMembershipOptions } from "./AttributeGroupMembership";
import {
    SearchResultSetItemAttributeGroup,
    SearchResultSetItemAttributeGroupOptions,
} from "./SearchResultSetItemAttributeGroup";
import {
    SearchResultSetItemAttributeGroupMembership,
    SearchResultSetItemAttributeGroupMembershipOptions,
} from "./SearchResultSetItemAttributeGroupMembership";
import { SearchTermSuggestion, SearchTermSuggestionOptions } from "./SearchTermSuggestion";
import {
    SearchTermAndDataSourceSuggestion,
    SearchTermAndDataSourceSuggestionOptions,
} from "./SearchTermAndDataSourceSuggestion";
import { DataSourceSuggestion, DataSourceSuggestionOptions } from "./DataSourceSuggestion";
import { SuggestionResultSet, SuggestionResultSetOptions } from "./SuggestionResultSet";
import { ChartResultSet, ChartResultSetOptions } from "./ChartResultSet";
import { DataSourceResultSet, DataSourceResultSetOptions } from "./DataSourceResultSet";
import { ChartResultSetItem, ChartResultSetItemOptions } from "./ChartResultSetItem";
import { DataSourceResultSetItem, DataSourceResultSetItemOptions } from "./DataSourceResultSetItem";
import { Capabilities, CapabilitiesOptions } from "./Capabilities";
import { Configuration, ConfigurationOptions } from "./Configuration";
import { NavigationTarget, NavigationTargetJson, NavigationTargetOptions } from "./NavigationTarget";
import { ChartResultSetFormatter, Formatter } from "./formatters/Formatter";
import { DataSource, DataSourceJSON, DataSourceAndAttributesJSON, DataSourceProperties } from "./DataSource";
import { UserCategoryDataSource } from "./UserCategoryDataSource";
import { ItemPostParser, ItemPostParserOptions } from "../providers/tools/ItemPostParser";
import {
    SuvNavTargetResolver,
    SuvNavTargetResolverOptions,
} from "../providers/tools/fiori/SuvNavTargetResolver";
import {
    FioriIntentsResolver,
    FioriIntentsResolverOptions,
} from "../providers/tools/fiori/FioriIntentsResolver";
import { ResultValueFormatter } from "./formatters/ResultValueFormatter";
import { NavtargetsInResultSetFormatter } from "./formatters/NavtargetsInResultSetFormatter";
import { HierarchyResultSetFormatter } from "./formatters/HierarchyResultSetFormatter";
import { SinaObject, SinaObjectProperties } from "./SinaObject";
import { AbstractProvider, AbstractProviderConfiguration } from "../providers/AbstractProvider";
import { FilteredDataSource, FilteredDataSourceProperties } from "./FilteredDataSource";
import { Provider as InAV2Provider } from "../providers/inav2/Provider";
import { Provider as ABAPODataProvider } from "../providers/abap_odata/Provider";
import { SinaConfiguration } from "./SinaConfiguration";
import { Condition } from "./Condition";
import { HierarchyQuery, HierarchyQueryOptions } from "./HierarchyQuery";
import { HierarchyNode, HierarchyNodeProperties } from "./HierarchyNode";
import { HierarchyResultSet, HierarchyResultSetOptions } from "./HierarchyResultSet";
import * as inav2TypeConverter from "../providers/inav2/typeConverter";
import { HierarchyNodePath, HierarchyNodePathProperties } from "./HierarchyNodePath";
import { HierarchyDisplayType } from "./HierarchyDisplayType";
import { Value } from "./types";
import { SuggestionResultValueFormatter } from "./formatters/SuggestionResultValueFormatter";
import { ESHNoBusinessObjectDatasourceError } from "../core/errors";
import { SearchTermAISuggestion } from "./SearchTermAISuggestion";
import { PublicSina } from "./PublicSina";

/**
 * The Enterprise Search Client API.
 */
export class Sina {
    errorList: Array<Error> = [];
    inav2TypeConverter: typeof inav2TypeConverter;
    provider: AbstractProvider;
    createSearchNavigationTarget: (filter: Filter, label: string) => NavigationTarget;
    createSearchQuery: (properties?: SearchQueryOptions) => SearchQuery;
    createChartQuery: (properties: ChartQueryOptions) => ChartQuery;
    createHierarchyQuery: (properties: HierarchyQueryOptions) => HierarchyQuery;
    createSuggestionQuery: (properties?: SuggestionQueryOptions) => SuggestionQuery;
    createDataSourceQuery: (properties: DataSourceQueryOptions) => DataSourceQuery;
    createFilter: (properties?: FilterOptions) => Filter;
    createComplexCondition: (properties?: ComplexConditionProperties) => ComplexCondition;
    createSimpleCondition: (properties: SimpleConditionProperties) => SimpleCondition;
    createHierarchyNode: (properties: HierarchyNodeProperties) => HierarchyNode;
    createHierarchyNodePath: (properties: HierarchyNodePathProperties) => HierarchyNodePath;
    _createAttributeMetadata: (properties: AttributeMetadataOptions) => AttributeMetadata;
    _createAttributeGroupMetadata: (properties: AttributeGroupMetadataOptions) => AttributeGroupMetadata;
    _createAttributeGroupMembership: (
        properties: AttributeGroupMembershipOptions
    ) => AttributeGroupMembership;
    _createSearchResultSetItemAttribute: (
        properties: SearchResultSetItemAttributeOptions
    ) => SearchResultSetItemAttribute;
    _createSearchResultSetItemAttributeGroup: (
        properties: SearchResultSetItemAttributeGroupOptions
    ) => SearchResultSetItemAttributeGroup;
    _createSearchResultSetItemAttributeGroupMembership: (
        properties: SearchResultSetItemAttributeGroupMembershipOptions
    ) => SearchResultSetItemAttributeGroupMembership;
    _createSearchResultSetItem: (properties: SearchResultSetItemOptions) => SearchResultSetItem;
    _createSearchResultSet: (properties: SearchResultSetOptions) => SearchResultSet;
    _createSearchTermSuggestion: (properties: SearchTermSuggestionOptions) => SearchTermSuggestion;
    _createSearchTermAISuggestion: (properties: SearchTermSuggestionOptions) => SearchTermAISuggestion;
    _createSearchTermAndDataSourceSuggestion: (
        properties: SearchTermAndDataSourceSuggestionOptions
    ) => SearchTermAndDataSourceSuggestion;
    _createDataSourceSuggestion: (properties: DataSourceSuggestionOptions) => DataSourceSuggestion;
    _createObjectSuggestion: (properties: ObjectSuggestionOptions) => ObjectSuggestion;
    _createSuggestionResultSet: (properties: SuggestionResultSetOptions) => SuggestionResultSet;
    _createChartResultSet: (properties: ChartResultSetOptions) => ChartResultSet;
    _createHierarchyResultSet: (properties: HierarchyResultSetOptions) => HierarchyResultSet;
    _createChartResultSetItem: (properties: ChartResultSetItemOptions) => ChartResultSetItem;
    _createDataSourceResultSetItem: (properties: DataSourceResultSetItemOptions) => DataSourceResultSetItem;
    _createCapabilities: (properties?: CapabilitiesOptions) => Capabilities;
    _createConfiguration: (properties: ConfigurationOptions) => Configuration;
    _createNavigationTarget: (properties: NavigationTargetOptions) => NavigationTarget;
    createNavigationTarget: (properties: NavigationTargetOptions) => NavigationTarget;
    _createSorsNavigationTargetGenerator: (
        properties: NavigationTargetGeneratorOptions
    ) => SorsNavigationTargetGenerator;
    _createFioriIntentsResolver: (properties?: FioriIntentsResolverOptions) => FioriIntentsResolver;
    _createCDSAnnotationsParser: (properties: CDSAnnotationsParserOptions) => CDSAnnotationsParser;
    _createItemPostParser: (properties: ItemPostParserOptions) => ItemPostParser;
    _createSuvNavTargetResolver: (properties?: SuvNavTargetResolverOptions) => SuvNavTargetResolver;
    searchResultSetFormatters: Formatter[];
    suggestionResultSetFormatters: Formatter[];
    chartResultSetFormatters: ChartResultSetFormatter[];
    metadataFormatters: Formatter[];
    dataSources: DataSource[];
    dataSourceMap: { [key: string]: DataSource };
    allDataSource: DataSource;
    DataSourceType: typeof DataSourceType;
    HierarchyDisplayType: typeof HierarchyDisplayType;
    DataSourceSubType: typeof DataSourceSubType;
    isDummyProvider: boolean;
    configurationPromise: Promise<Configuration>;
    capabilities: Capabilities;
    core: typeof core;
    errors: typeof errors;
    util: typeof util;
    SortOrder: typeof SortOrder;
    ComparisonOperator: typeof ComparisonOperator;
    LogicalOperator: typeof LogicalOperator;
    AttributeGroupTextArrangement: typeof AttributeGroupTextArrangement;
    AttributeType: typeof AttributeType;
    AttributeFormatType: typeof AttributeFormatType;
    FacetType: typeof FacetType;
    SuggestionType: typeof SuggestionType;
    ConditionType: typeof ConditionType;
    SuggestionCalculationMode: typeof SuggestionCalculationMode;
    MatchingStrategy: typeof MatchingStrategy;
    configuration: SinaConfiguration;
    publicSina: PublicSina;

    constructor(provider: AbstractProvider) {
        this.core = core; // convenience: expose core lib
        this.errors = errors; // convenience: expose core lib
        this.util = util; // convenience: expose util lib
        this.inav2TypeConverter = inav2TypeConverter; // do not use except for inav2 compatability
        this.provider = provider;
        this.createSearchQuery = this.createSinaObjectFactory(SearchQuery);
        this.createChartQuery = this.createSinaObjectFactory(ChartQuery);
        this.createHierarchyQuery = this.createSinaObjectFactory(HierarchyQuery);
        this.createSuggestionQuery = this.createSinaObjectFactory(SuggestionQuery);
        this.createDataSourceQuery = this.createSinaObjectFactory(DataSourceQuery);
        this.createFilter = this.createSinaObjectFactory(Filter);
        this.createComplexCondition = this.createSinaObjectFactory(ComplexCondition);
        this.createSimpleCondition = this.createSinaObjectFactory(SimpleCondition);
        this.createHierarchyNode = this.createSinaObjectFactory(HierarchyNode);
        this.createHierarchyNodePath = this.createSinaObjectFactory(HierarchyNodePath);
        this._createAttributeMetadata = this.createSinaObjectFactory(AttributeMetadata);
        this._createAttributeGroupMetadata = this.createSinaObjectFactory(AttributeGroupMetadata);
        this._createAttributeGroupMembership = this.createSinaObjectFactory(AttributeGroupMembership);
        this._createSearchResultSetItemAttribute = this.createSinaObjectFactory(SearchResultSetItemAttribute);
        this._createSearchResultSetItemAttributeGroup = this.createSinaObjectFactory(
            SearchResultSetItemAttributeGroup
        );
        this._createSearchResultSetItemAttributeGroupMembership = this.createSinaObjectFactory(
            SearchResultSetItemAttributeGroupMembership
        );
        this._createSearchResultSetItem = this.createSinaObjectFactory(SearchResultSetItem);
        this._createSearchResultSet = this.createSinaObjectFactory(SearchResultSet);
        this._createSearchTermSuggestion = this.createSinaObjectFactory(SearchTermSuggestion);
        this._createSearchTermAISuggestion = this.createSinaObjectFactory(SearchTermAISuggestion);
        this._createSearchTermAndDataSourceSuggestion = this.createSinaObjectFactory(
            SearchTermAndDataSourceSuggestion
        );
        this._createDataSourceSuggestion = this.createSinaObjectFactory(DataSourceSuggestion);
        this._createObjectSuggestion = this.createSinaObjectFactory(ObjectSuggestion);
        this._createSuggestionResultSet = this.createSinaObjectFactory(SuggestionResultSet);
        this._createChartResultSet = this.createSinaObjectFactory(ChartResultSet);
        this._createHierarchyResultSet = this.createSinaObjectFactory(HierarchyResultSet);
        this._createChartResultSetItem = this.createSinaObjectFactory(ChartResultSetItem);
        this._createDataSourceResultSetItem = this.createSinaObjectFactory(DataSourceResultSetItem);
        this._createCapabilities = this.createSinaObjectFactory(Capabilities);
        this._createConfiguration = this.createSinaObjectFactory(Configuration);
        this._createNavigationTarget = this.createSinaObjectFactory(NavigationTarget); // deprecated
        this.createNavigationTarget = this.createSinaObjectFactory(NavigationTarget);
        this._createSorsNavigationTargetGenerator = this.createSinaObjectFactory(
            SorsNavigationTargetGenerator
        );
        this._createFioriIntentsResolver = this.createSinaObjectFactory(FioriIntentsResolver);
        this._createCDSAnnotationsParser = this.createSinaObjectFactory(CDSAnnotationsParser);
        this._createItemPostParser = this.createSinaObjectFactory(ItemPostParser);
        this._createSuvNavTargetResolver = this.createSinaObjectFactory(SuvNavTargetResolver);
        this.searchResultSetFormatters = [];
        this.suggestionResultSetFormatters = [];
        this.chartResultSetFormatters = [];
        this.metadataFormatters = [];
        this.dataSources = [];
        this.dataSourceMap = {};
        this.allDataSource = this.createDataSource({
            id: "All",
            label: "All",
            type: DataSourceType.Category,
        });
        this.DataSourceType = DataSourceType;
        this.DataSourceSubType = DataSourceSubType;
        this.HierarchyDisplayType = HierarchyDisplayType;
        this.AttributeGroupTextArrangement = AttributeGroupTextArrangement;
        this.AttributeType = AttributeType;
        this.AttributeFormatType = AttributeFormatType;
        this.FacetType = FacetType;
        this.SuggestionType = SuggestionType;
        this.ConditionType = ConditionType;
        this.SuggestionCalculationMode = SuggestionCalculationMode;
        this.SortOrder = SortOrder;
        this.MatchingStrategy = MatchingStrategy;
        this.ComparisonOperator = ComparisonOperator;
        this.LogicalOperator = LogicalOperator;
    }

    public getPublicSina(): PublicSina {
        if (this.publicSina) {
            return this.publicSina;
        }
        this.publicSina = new PublicSina(this);
        return this.publicSina;
    }

    public hasErrors(): boolean {
        return this.errorList.length > 0;
    }

    public getErrors(): Array<Error> {
        return this.errorList;
    }

    public addError(error: Error) {
        this.errorList.push(error);
    }

    public addErrors(errors: Array<Error>) {
        this.errorList.push(...errors);
    }

    private initInternalSearchResultSetFormatters(configuration: SinaConfiguration): void {
        this.searchResultSetFormatters.push(new NavtargetsInResultSetFormatter());
        // this.searchResultSetFormatters.push(new RemovePureAdvancedSearchFacetsFormatter());
        this.searchResultSetFormatters.push(
            new ResultValueFormatter({
                ui5NumberFormat: configuration.NumberFormat,
                ui5DateFormat: configuration.DateFormat,
            })
        );
        this.searchResultSetFormatters.push(new HierarchyResultSetFormatter());
    }
    private initInternalSuggestionResultValueFormatter(configuration: SinaConfiguration): void {
        this.suggestionResultSetFormatters.push(
            new SuggestionResultValueFormatter({
                ui5NumberFormat: configuration.NumberFormat,
                ui5DateFormat: configuration.DateFormat,
            })
        );
    }

    async initAsync(configuration: SinaConfiguration): Promise<void> {
        this.configuration = configuration;
        this.isDummyProvider = configuration.provider.indexOf("dummy") > -1;
        this.provider.label = configuration.label;

        this.initInternalSearchResultSetFormatters(configuration);
        this.initInternalSuggestionResultValueFormatter(configuration);

        // init custom formatters shall after the registration of the internal formatters
        try {
            await this.initCustomFormattersAsync(configuration);
        } catch (err) {
            throw new errors.SinaConfigurationError("_evaluateConfigurationAsync", err);
        }

        configuration.sina = this;
        let initializationResult = await this.provider.initAsync(
            configuration as AbstractProviderConfiguration
        );
        initializationResult = initializationResult || {
            capabilities: null,
        };
        this.capabilities = initializationResult.capabilities || this._createCapabilities({ sina: this });

        // run meta data formatters
        // shall after the registration of the custom meta data formatter(initCustomFormattersAsync)
        try {
            await this._formatMetadataAsync();
        } catch (err) {
            throw new errors.SinaConfigurationError("metadataformatter(s)->formatAsync", err);
        }
        // initialization
        if (configuration.initAsync) {
            try {
                await configuration.initAsync(this);
            } catch (err) {
                throw new errors.SinaConfigurationError("configuration->initAsync", err);
            }
        }
        if (this.getBusinessObjectDataSources().length === 0 && !this.isDummyProvider) {
            throw new ESHNoBusinessObjectDatasourceError();
        }
    }

    private _formatMetadataAsync(): Promise<void> {
        return core.executeSequentialAsync(
            this.metadataFormatters,
            function (this: Sina, formatter: Formatter) {
                return formatter.formatAsync({
                    dataSources: this.dataSources,
                });
            }.bind(this)
        );
    }

    private async initCustomFormattersAsync(configuration: SinaConfiguration): Promise<void[]> {
        const promises = [];

        // search result set formatters
        if (configuration.searchResultSetFormatters) {
            for (let i = 0; i < configuration.searchResultSetFormatters.length; ++i) {
                const searchResultSetFormatter = configuration.searchResultSetFormatters[i];
                this.searchResultSetFormatters.push(searchResultSetFormatter);
                if (searchResultSetFormatter.initAsync) {
                    promises.push(searchResultSetFormatter.initAsync());
                }
            }
        }

        // suggestion result set formatters
        if (configuration.suggestionResultSetFormatters) {
            for (let i = 0; i < configuration.suggestionResultSetFormatters.length; ++i) {
                const suggestionResultSetFormatter = configuration.suggestionResultSetFormatters[i];
                this.suggestionResultSetFormatters.push(suggestionResultSetFormatter);
                if (suggestionResultSetFormatter.initAsync) {
                    promises.push(suggestionResultSetFormatter.initAsync());
                }
            }
        }

        // chart result set formatters
        if (configuration.chartResultSetFormatters) {
            for (let i = 0; i < configuration.chartResultSetFormatters.length; ++i) {
                const chartResultSetFormatter = configuration.chartResultSetFormatters[i];
                this.chartResultSetFormatters.push(chartResultSetFormatter);
                if (chartResultSetFormatter.initAsync) {
                    promises.push(chartResultSetFormatter.initAsync());
                }
            }
        }

        // metadata formatters
        if (configuration.metadataFormatters) {
            for (let j = 0; j < configuration.metadataFormatters.length; ++j) {
                const metadataFormatter = configuration.metadataFormatters[j];
                this.metadataFormatters.push(metadataFormatter);
                if (metadataFormatter.initAsync) {
                    promises.push(metadataFormatter.initAsync());
                }
            }
        }

        return Promise.all(promises);
    }

    async loadMetadata(dataSource: DataSource): Promise<void> {
        // do not use
        // only for compatability inav2
        if (this.provider instanceof InAV2Provider) {
            if (this.provider.loadMetadata) {
                return this.provider.loadMetadata(dataSource);
            }
        }
        return Promise.resolve();
    }

    createDataSourceMap(dataSources: Array<DataSource>): { [id: string]: DataSource } {
        const map = {};
        for (let i = 0; i < dataSources.length; ++i) {
            const dataSource = dataSources[i];
            map[dataSource.id] = dataSource;
        }
        return map;
    }

    private createSinaObjectFactory<T extends SinaObject>(
        Clazz: new (properties: SinaObjectProperties) => T
    ): (properties?: SinaObjectProperties) => T {
        return function (properties) {
            properties = properties ?? { sina: this };
            properties.sina = this;
            try {
                return new Clazz(properties);
            } finally {
                delete properties.sina;
            }
        };
    }

    _createDataSourceResultSet(properties: DataSourceResultSetOptions): DataSourceResultSet {
        const filteredItems = this.removeHierarchyDataSources(
            properties.items as Array<DataSourceResultSetItem>,
            (item: DataSourceResultSetItem) => item.dataSource
        );
        properties.items = filteredItems;
        const dataSourceResultSet = new DataSourceResultSet(properties);
        dataSourceResultSet.sina = this;
        return dataSourceResultSet;
    }

    isNeededCache: Record<string, boolean> = {};
    removeHierarchyDataSources<T>(list: Array<T>, getDataSource: (T) => DataSource): Array<T> {
        const isNeeded = (dataSourceToBeChecked: DataSource): boolean => {
            const cache = this.isNeededCache[dataSourceToBeChecked.id];
            if (typeof cache !== "undefined") {
                return cache;
            }
            for (const dataSource of this.dataSources) {
                for (const attributeMetaData of dataSource.attributesMetadata) {
                    if (
                        (attributeMetaData as AttributeMetadata).hierarchyName ===
                            dataSourceToBeChecked.hierarchyName &&
                        (attributeMetaData as AttributeMetadata).hierarchyDisplayType ===
                            HierarchyDisplayType.HierarchyResultView
                    ) {
                        this.isNeededCache[dataSourceToBeChecked.id] = true;
                        return true;
                    }
                }
            }
            this.isNeededCache[dataSourceToBeChecked.id] = false;
            return false;
        };
        for (let i = 0; i < list.length; i++) {
            const element = list[i];
            const dataSource = getDataSource(element);
            if (!dataSource.isHierarchyDataSource) {
                continue;
            }
            if (!isNeeded(dataSource)) {
                list.splice(i, 1);
                i--;
            }
        }
        return list;
    }

    createDataSource(properties: DataSourceProperties | FilteredDataSourceProperties): DataSource {
        properties.sina = this;
        let dataSource;
        switch (properties.type) {
            case DataSourceType.BusinessObject:
                switch (properties.subType) {
                    case DataSourceSubType.Filtered:
                        dataSource = new FilteredDataSource(properties as FilteredDataSourceProperties);
                        break;
                    default:
                        dataSource = new DataSource(properties);
                }
                break;
            case DataSourceType.UserCategory:
                dataSource = new UserCategoryDataSource(properties);
                break;
            default:
                dataSource = new DataSource(properties);
        }
        if (this.dataSourceMap[dataSource.id]) {
            throw new errors.CanNotCreateAlreadyExistingDataSourceError(dataSource.id);
        }
        this._addDataSource(dataSource);
        return dataSource;
    }

    /**
     *
     * @deprecated Use sina.createDataSource() instead
     */
    _createDataSource(properties: DataSourceProperties): DataSource {
        return this.createDataSource(properties);
    }

    private _addDataSource(dataSource: DataSource): void {
        if (
            dataSource.type === DataSourceType.BusinessObject &&
            dataSource.subType === DataSourceSubType.Filtered
        ) {
            // 1 filtered datasources
            let insertIndex = -1;
            for (let i = this.dataSources.length - 1; i >= 1; --i) {
                const checkDataSource = this.dataSources[i];
                if (
                    checkDataSource.type === DataSourceType.BusinessObject &&
                    checkDataSource.subType === DataSourceSubType.Filtered
                ) {
                    insertIndex = i;
                    break;
                }
            }
            if (insertIndex >= 0) {
                this.dataSources.splice(insertIndex + 1, 0, dataSource);
            } else {
                this.dataSources.push(dataSource);
            }
        } else {
            // 2 other datasources
            this.dataSources.push(dataSource);
        }
        this.dataSourceMap[dataSource.id] = dataSource;
    }

    getAllDataSource(): DataSource {
        return this.allDataSource;
    }

    getBusinessObjectDataSources(): DataSource[] {
        const result = [];
        for (let i = 0; i < this.dataSources.length; ++i) {
            const dataSource = this.dataSources[i];
            if (
                !dataSource.hidden &&
                dataSource.type === DataSourceType.BusinessObject &&
                dataSource.subType !== DataSourceSubType.Filtered
            ) {
                result.push(dataSource);
            }
        }
        return this.removeHierarchyDataSources(result, (dataSource: DataSource) => dataSource);
    }

    getDataSource(id: string): DataSource {
        return this.dataSourceMap[id];
    }

    async getConfigurationAsync(properties: { forceReload?: boolean } = {}): Promise<Configuration> {
        if (this.provider instanceof InAV2Provider || this.provider instanceof ABAPODataProvider) {
            if (this.configurationPromise && !properties.forceReload) {
                return this.configurationPromise;
            }
            this.configurationPromise = this.provider.getConfigurationAsync();
            return this.configurationPromise;
        }
        return Promise.resolve(
            this._createConfiguration({
                personalizedSearch: false,
                isPersonalizedSearchEditable: false,
            })
        );
    }

    logUserEvent(event: unknown): void {
        this.provider.logUserEvent(event);
    }

    getDebugInfo(): string {
        return this.provider.getDebugInfo();
    }

    dataSourceFromJson(json: DataSourceJSON | DataSourceAndAttributesJSON): DataSource {
        return DataSource.fromJson(json, this);
    }

    parseSimpleConditionFromJson(json: SimpleConditionJSON): SimpleCondition {
        let value;
        if (core.isObject(json.value)) {
            value = util.dateFromJson(json.value);
        } else {
            value = json.value;
        }
        // Following should satisfy no-unneeded-ternary eslint rule:
        let userDefined;
        if (json.userDefined) {
            userDefined = true;
        } else {
            userDefined = false;
        }
        let isDynamicValue;
        if (json.dynamic) {
            isDynamicValue = true;
        } else {
            isDynamicValue = false;
        }
        return this.createSimpleCondition({
            operator: json.operator,
            attribute: json.attribute,
            value: value,
            attributeLabel: json.attributeLabel,
            valueLabel: json.valueLabel,
            userDefined: userDefined,
            isDynamicValue: isDynamicValue,
        });
    }

    parseComplexConditionFromJson(json: ComplexConditionJSON): ComplexCondition {
        const conditions = [];
        for (let i = 0; i < json.conditions.length; ++i) {
            const conditionJson = json.conditions[i];
            conditions.push(this.parseConditionFromJson(conditionJson));
        }
        // Following should satisfy no-unneeded-ternary eslint rule:
        let userDefined;
        if (json.userDefined) {
            userDefined = true;
        } else {
            userDefined = false;
        }
        return this.createComplexCondition({
            operator: json.operator,
            conditions: conditions,
            attributeLabel: json.attributeLabel,
            valueLabel: json.valueLabel,
            userDefined: userDefined,
        });
    }

    parseConditionFromJson(json: SimpleConditionJSON | ComplexConditionJSON): Condition {
        switch (json.type) {
            case ConditionType.Simple:
                return this.parseSimpleConditionFromJson(json as SimpleConditionJSON);
            case ConditionType.Complex:
                return this.parseComplexConditionFromJson(json as ComplexConditionJSON);
            default:
                throw new errors.UnknownConditionTypeError(json.type);
        }
    }

    parseFilterFromJson(json: {
        searchTerm: string;
        rootCondition: ComplexConditionJSON;
        dataSource: DataSource;
    }): Filter {
        const rootCondition = this.parseConditionFromJson(json.rootCondition);
        if (rootCondition instanceof ComplexCondition) {
            return this.createFilter({
                searchTerm: json?.searchTerm,
                rootCondition,
                dataSource: this.dataSourceFromJson(json.dataSource),
            });
        } else {
            throw new errors.OnlyComplexConditionAllowedError();
        }
    }

    parseNavigationTargetFromJson(json: NavigationTargetJson) {
        return this.createNavigationTarget(json);
    }

    // Assemble hiearchy down navigation link as title navigation
    createStaticHierarchySearchNavigationTarget(
        hierarchyNodeId: Value,
        hierarchyNodeLabel: string,
        dataSource: DataSource,
        navigationTargetLabel: string,
        hierarchyNodeAttributeName?: string
    ): NavigationTarget {
        if (!hierarchyNodeAttributeName) {
            hierarchyNodeAttributeName = dataSource.hierarchyAttribute;
            if (!hierarchyNodeAttributeName) {
                const helperHierarchyDataource = dataSource.getHierarchyDataSource();
                if (helperHierarchyDataource && helperHierarchyDataource.hierarchyAttribute) {
                    hierarchyNodeAttributeName = helperHierarchyDataource.hierarchyAttribute;
                } else {
                    return null;
                }
            }
        }

        const filter = new Filter({
            dataSource: dataSource,
            searchTerm: "", //navigation mode, ignore content in search input box
            sina: this,
        });

        // DescendantOf $$ROOT$$ === search for all without any filter condition
        if (hierarchyNodeId !== "$$ROOT$$") {
            // Set operator as DescendantOf and let Sina SearchQuery _executeSearchQuery decide the final operator/operators
            const childrenCondition = new SimpleCondition({
                attribute: hierarchyNodeAttributeName,
                operator: ComparisonOperator.DescendantOf,
                value: hierarchyNodeId,
                valueLabel: hierarchyNodeLabel,
            });
            filter.autoInsertCondition(childrenCondition);
        }

        return this.createSearchNavigationTarget(filter, navigationTargetLabel || "Children Folders");
    }

    getHierarchyDataSource(hierarchyName: string): DataSource {
        const dataSources = this.dataSources;
        for (let i = 0; i < dataSources.length; ++i) {
            const dataSource = dataSources[i];
            if (dataSource.type !== this.DataSourceType.BusinessObject) {
                continue;
            }
            if (!dataSource.isHierarchyDataSource) {
                continue;
            }
            if (hierarchyName === dataSource.hierarchyName) {
                return dataSource;
            }
        }
    }
}
