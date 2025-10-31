declare module "sap/esh/search/ui/sinaNexTS/sina/Sina" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import * as core from "sap/esh/search/ui/sinaNexTS/core/core";
    import * as errors from "sap/esh/search/ui/sinaNexTS/core/errors";
    import * as util from "sap/esh/search/ui/sinaNexTS/core/util";
    import { AttributeType } from "sap/esh/search/ui/sinaNexTS/sina/AttributeType";
    import { AttributeFormatType } from "sap/esh/search/ui/sinaNexTS/sina/AttributeFormatType";
    import { AttributeGroupTextArrangement } from "sap/esh/search/ui/sinaNexTS/sina/AttributeGroupTextArrangement";
    import { DataSourceSubType, DataSourceType } from "sap/esh/search/ui/sinaNexTS/sina/DataSourceType";
    import { MatchingStrategy } from "sap/esh/search/ui/sinaNexTS/sina/MatchingStrategy";
    import { LogicalOperator } from "sap/esh/search/ui/sinaNexTS/sina/LogicalOperator";
    import { ComparisonOperator } from "sap/esh/search/ui/sinaNexTS/sina/ComparisonOperator";
    import { FacetType } from "sap/esh/search/ui/sinaNexTS/sina/FacetType";
    import { SuggestionCalculationMode } from "sap/esh/search/ui/sinaNexTS/sina/SuggestionCalculationMode";
    import { SuggestionType } from "sap/esh/search/ui/sinaNexTS/sina/SuggestionType";
    import { SortOrder } from "sap/esh/search/ui/sinaNexTS/sina/SortOrder";
    import { ConditionType } from "sap/esh/search/ui/sinaNexTS/sina/ConditionType";
    import { CDSAnnotationsParser, CDSAnnotationsParserOptions } from "../providers/tools/cds/CDSAnnotationsParser";
    import { NavigationTargetGenerator as SorsNavigationTargetGenerator, NavigationTargetGeneratorOptions } from "../providers/tools/sors/NavigationTargetGenerator";
    import { SearchResultSet, SearchResultSetOptions } from "sap/esh/search/ui/sinaNexTS/sina/SearchResultSet";
    import { SearchResultSetItem, SearchResultSetItemOptions } from "sap/esh/search/ui/sinaNexTS/sina/SearchResultSetItem";
    import { SearchResultSetItemAttribute, SearchResultSetItemAttributeOptions } from "./SearchResultSetItemAttribute";
    import { ObjectSuggestion, ObjectSuggestionOptions } from "sap/esh/search/ui/sinaNexTS/sina/ObjectSuggestion";
    import { SearchQuery, SearchQueryOptions } from "sap/esh/search/ui/sinaNexTS/sina/SearchQuery";
    import { ChartQuery, ChartQueryOptions } from "sap/esh/search/ui/sinaNexTS/sina/ChartQuery";
    import { SuggestionQuery, SuggestionQueryOptions } from "sap/esh/search/ui/sinaNexTS/sina/SuggestionQuery";
    import { DataSourceQuery, DataSourceQueryOptions } from "sap/esh/search/ui/sinaNexTS/sina/DataSourceQuery";
    import { Filter, FilterOptions } from "sap/esh/search/ui/sinaNexTS/sina/Filter";
    import { ComplexCondition, ComplexConditionJSON, ComplexConditionProperties } from "sap/esh/search/ui/sinaNexTS/sina/ComplexCondition";
    import { SimpleCondition, SimpleConditionJSON, SimpleConditionProperties } from "sap/esh/search/ui/sinaNexTS/sina/SimpleCondition";
    import { AttributeMetadata, AttributeMetadataOptions } from "sap/esh/search/ui/sinaNexTS/sina/AttributeMetadata";
    import { AttributeGroupMetadata, AttributeGroupMetadataOptions } from "sap/esh/search/ui/sinaNexTS/sina/AttributeGroupMetadata";
    import { AttributeGroupMembership, AttributeGroupMembershipOptions } from "sap/esh/search/ui/sinaNexTS/sina/AttributeGroupMembership";
    import { SearchResultSetItemAttributeGroup, SearchResultSetItemAttributeGroupOptions } from "./SearchResultSetItemAttributeGroup";
    import { SearchResultSetItemAttributeGroupMembership, SearchResultSetItemAttributeGroupMembershipOptions } from "./SearchResultSetItemAttributeGroupMembership";
    import { SearchTermSuggestion, SearchTermSuggestionOptions } from "sap/esh/search/ui/sinaNexTS/sina/SearchTermSuggestion";
    import { SearchTermAndDataSourceSuggestion, SearchTermAndDataSourceSuggestionOptions } from "./SearchTermAndDataSourceSuggestion";
    import { DataSourceSuggestion, DataSourceSuggestionOptions } from "sap/esh/search/ui/sinaNexTS/sina/DataSourceSuggestion";
    import { SuggestionResultSet, SuggestionResultSetOptions } from "sap/esh/search/ui/sinaNexTS/sina/SuggestionResultSet";
    import { ChartResultSet, ChartResultSetOptions } from "sap/esh/search/ui/sinaNexTS/sina/ChartResultSet";
    import { DataSourceResultSet, DataSourceResultSetOptions } from "sap/esh/search/ui/sinaNexTS/sina/DataSourceResultSet";
    import { ChartResultSetItem, ChartResultSetItemOptions } from "sap/esh/search/ui/sinaNexTS/sina/ChartResultSetItem";
    import { DataSourceResultSetItem, DataSourceResultSetItemOptions } from "sap/esh/search/ui/sinaNexTS/sina/DataSourceResultSetItem";
    import { Capabilities, CapabilitiesOptions } from "sap/esh/search/ui/sinaNexTS/sina/Capabilities";
    import { Configuration, ConfigurationOptions } from "sap/esh/search/ui/sinaNexTS/sina/Configuration";
    import { NavigationTarget, NavigationTargetJson, NavigationTargetOptions } from "sap/esh/search/ui/sinaNexTS/sina/NavigationTarget";
    import { ChartResultSetFormatter, Formatter } from "sap/esh/search/ui/sinaNexTS/sina/formatters/Formatter";
    import { DataSource, DataSourceJSON, DataSourceAndAttributesJSON, DataSourceProperties } from "sap/esh/search/ui/sinaNexTS/sina/DataSource";
    import { ItemPostParser, ItemPostParserOptions } from "sap/esh/search/ui/sinaNexTS/providers/tools/ItemPostParser";
    import { SuvNavTargetResolver, SuvNavTargetResolverOptions } from "../providers/tools/fiori/SuvNavTargetResolver";
    import { FioriIntentsResolver, FioriIntentsResolverOptions } from "../providers/tools/fiori/FioriIntentsResolver";
    import { AbstractProvider } from "sap/esh/search/ui/sinaNexTS/providers/AbstractProvider";
    import { FilteredDataSourceProperties } from "sap/esh/search/ui/sinaNexTS/sina/FilteredDataSource";
    import { SinaConfiguration } from "sap/esh/search/ui/sinaNexTS/sina/SinaConfiguration";
    import { Condition } from "sap/esh/search/ui/sinaNexTS/sina/Condition";
    import { HierarchyQuery, HierarchyQueryOptions } from "sap/esh/search/ui/sinaNexTS/sina/HierarchyQuery";
    import { HierarchyNode, HierarchyNodeProperties } from "sap/esh/search/ui/sinaNexTS/sina/HierarchyNode";
    import { HierarchyResultSet, HierarchyResultSetOptions } from "sap/esh/search/ui/sinaNexTS/sina/HierarchyResultSet";
    import * as inav2TypeConverter from "sap/esh/search/ui/sinaNexTS/providers/inav2/typeConverter";
    import { HierarchyNodePath, HierarchyNodePathProperties } from "sap/esh/search/ui/sinaNexTS/sina/HierarchyNodePath";
    import { HierarchyDisplayType } from "sap/esh/search/ui/sinaNexTS/sina/HierarchyDisplayType";
    import { Value } from "sap/esh/search/ui/sinaNexTS/sina/types";
    import { SearchTermAISuggestion } from "sap/esh/search/ui/sinaNexTS/sina/SearchTermAISuggestion";
    import { PublicSina } from "sap/esh/search/ui/sinaNexTS/sina/PublicSina";
    /**
     * The Enterprise Search Client API.
     */
    class Sina {
        errorList: Array<Error>;
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
        _createAttributeGroupMembership: (properties: AttributeGroupMembershipOptions) => AttributeGroupMembership;
        _createSearchResultSetItemAttribute: (properties: SearchResultSetItemAttributeOptions) => SearchResultSetItemAttribute;
        _createSearchResultSetItemAttributeGroup: (properties: SearchResultSetItemAttributeGroupOptions) => SearchResultSetItemAttributeGroup;
        _createSearchResultSetItemAttributeGroupMembership: (properties: SearchResultSetItemAttributeGroupMembershipOptions) => SearchResultSetItemAttributeGroupMembership;
        _createSearchResultSetItem: (properties: SearchResultSetItemOptions) => SearchResultSetItem;
        _createSearchResultSet: (properties: SearchResultSetOptions) => SearchResultSet;
        _createSearchTermSuggestion: (properties: SearchTermSuggestionOptions) => SearchTermSuggestion;
        _createSearchTermAISuggestion: (properties: SearchTermSuggestionOptions) => SearchTermAISuggestion;
        _createSearchTermAndDataSourceSuggestion: (properties: SearchTermAndDataSourceSuggestionOptions) => SearchTermAndDataSourceSuggestion;
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
        _createSorsNavigationTargetGenerator: (properties: NavigationTargetGeneratorOptions) => SorsNavigationTargetGenerator;
        _createFioriIntentsResolver: (properties?: FioriIntentsResolverOptions) => FioriIntentsResolver;
        _createCDSAnnotationsParser: (properties: CDSAnnotationsParserOptions) => CDSAnnotationsParser;
        _createItemPostParser: (properties: ItemPostParserOptions) => ItemPostParser;
        _createSuvNavTargetResolver: (properties?: SuvNavTargetResolverOptions) => SuvNavTargetResolver;
        searchResultSetFormatters: Formatter[];
        suggestionResultSetFormatters: Formatter[];
        chartResultSetFormatters: ChartResultSetFormatter[];
        metadataFormatters: Formatter[];
        dataSources: DataSource[];
        dataSourceMap: {
            [key: string]: DataSource;
        };
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
        constructor(provider: AbstractProvider);
        getPublicSina(): PublicSina;
        hasErrors(): boolean;
        getErrors(): Array<Error>;
        addError(error: Error): void;
        addErrors(errors: Array<Error>): void;
        private initInternalSearchResultSetFormatters;
        private initInternalSuggestionResultValueFormatter;
        initAsync(configuration: SinaConfiguration): Promise<void>;
        private _formatMetadataAsync;
        private initCustomFormattersAsync;
        loadMetadata(dataSource: DataSource): Promise<void>;
        createDataSourceMap(dataSources: Array<DataSource>): {
            [id: string]: DataSource;
        };
        private createSinaObjectFactory;
        _createDataSourceResultSet(properties: DataSourceResultSetOptions): DataSourceResultSet;
        isNeededCache: Record<string, boolean>;
        removeHierarchyDataSources<T>(list: Array<T>, getDataSource: (T: any) => DataSource): Array<T>;
        createDataSource(properties: DataSourceProperties | FilteredDataSourceProperties): DataSource;
        /**
         *
         * @deprecated Use sina.createDataSource() instead
         */
        _createDataSource(properties: DataSourceProperties): DataSource;
        private _addDataSource;
        getAllDataSource(): DataSource;
        getBusinessObjectDataSources(): DataSource[];
        getDataSource(id: string): DataSource;
        getConfigurationAsync(properties?: {
            forceReload?: boolean;
        }): Promise<Configuration>;
        logUserEvent(event: unknown): void;
        getDebugInfo(): string;
        dataSourceFromJson(json: DataSourceJSON | DataSourceAndAttributesJSON): DataSource;
        parseSimpleConditionFromJson(json: SimpleConditionJSON): SimpleCondition;
        parseComplexConditionFromJson(json: ComplexConditionJSON): ComplexCondition;
        parseConditionFromJson(json: SimpleConditionJSON | ComplexConditionJSON): Condition;
        parseFilterFromJson(json: {
            searchTerm: string;
            rootCondition: ComplexConditionJSON;
            dataSource: DataSource;
        }): Filter;
        parseNavigationTargetFromJson(json: NavigationTargetJson): NavigationTarget;
        createStaticHierarchySearchNavigationTarget(hierarchyNodeId: Value, hierarchyNodeLabel: string, dataSource: DataSource, navigationTargetLabel: string, hierarchyNodeAttributeName?: string): NavigationTarget;
        getHierarchyDataSource(hierarchyName: string): DataSource;
    }
}
//# sourceMappingURL=Sina.d.ts.map