declare module "sap/esh/search/ui/sinaNexTS/providers/hana_odata/eshObjects/src/definitions" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    /** Copyright 2019 SAP SE or an SAP affiliate company. All rights reserved. */
    const reservedCharacters: string[];
    const reservedWords: string[];
    function replaceAll(original: string, search: string, replacement: string): string;
    const escapeSingleQuote: (value: string) => string;
    const escapeDoubleQuoteAndBackslash: (value: string) => string;
    function escapeQuery(query: string): string;
    function escapeQueryWithCustomLength(query: string, length: number): string;
    function escapeQueryWithDefaultLength(query: string): string;
    function existValueInEnum(type: any, value: any): boolean;
    interface ISearchOptions {
        fuzzinessThreshold?: number;
        weight?: number;
        fuzzySearchOptions?: string;
    }
    interface IToStatement {
        readonly clazz: string;
        toStatement(): string;
    }
    interface IComparison {
        property: string | IToStatement;
        operator: (SearchQueryComparisonOperator | ComparisonOperator | NearOperator);
        value?: string | IToStatement;
        valueAsReservedWord?: boolean;
        searchOptions?: ISearchOptions;
    }
    interface IScopeComparison {
        values: string[];
    }
    interface ITerm {
        term: string;
        searchOptions?: ISearchOptions;
        isQuoted?: boolean;
        doEshEscaping?: boolean;
    }
    interface IPhrase {
        phrase: string;
        searchOptions?: ISearchOptions;
        doEshEscaping?: boolean;
    }
    enum NearOrdering {
        Ordered = "O",
        Unordered = "U"
    }
    interface INear {
        terms: string[] | IToStatement[];
        distance: number;
        ordering?: NearOrdering;
        searchOptions?: ISearchOptions;
    }
    interface IGroupBy {
        properties: string[];
        aggregateCountAlias?: string;
    }
    interface INearOperator {
        distance: number;
        ordering?: NearOrdering;
    }
    interface IHierarchyFacet {
        facetColumn: string;
        rootIds: (string | null)[];
        levels: number;
    }
    interface IListValues {
        values: string[];
    }
    class ListValues implements IToStatement {
        readonly clazz: string;
        values: (string | IToStatement)[];
        constructor(item: IListValues);
        toStatement(): string;
    }
    class NullValue implements IToStatement {
        readonly clazz: string;
        constructor();
        toStatement(): string;
    }
    class BooleanValue implements IToStatement {
        readonly clazz: string;
        value: Boolean;
        constructor(item: {
            value: Boolean;
        });
        toStatement(): string;
    }
    class NumberValue implements IToStatement {
        readonly clazz: string;
        value: Number | String;
        constructor(item: {
            value: Number | String;
        });
        toStatement(): string;
    }
    interface IStringValue {
        value: string;
        isQuoted?: boolean;
        isSingleQuoted?: boolean;
        withoutEnclosing?: boolean;
    }
    class StringValue implements IToStatement {
        readonly clazz: string;
        value: string;
        isQuoted?: boolean;
        isSingleQuoted?: boolean;
        withoutEnclosing?: boolean;
        constructor(item: IStringValue);
        toStatement(): string;
    }
    interface IViewParameter {
        param: string;
    }
    class ViewParameter implements IViewParameter {
        readonly clazz: string;
        param: string;
        constructor(item: IViewParameter);
        toStatement(): string;
    }
    class HierarchyFacet implements IToStatement {
        readonly clazz: string;
        facetColumn: string;
        rootIds: (string | null)[];
        levels: number;
        constructor(item: IHierarchyFacet);
        toStatement(): string;
    }
    class NearOperator implements IToStatement {
        readonly clazz: string;
        distance: number;
        ordering?: NearOrdering;
        constructor(item: INearOperator);
        toStatement(): string;
    }
    enum InListOperator {
        AND = "AND",
        OR = "OR"
    }
    interface IInList {
        operator: InListOperator;
        values: string[];
    }
    class InList implements IToStatement {
        readonly clazz: string;
        operator: InListOperator;
        values: string[];
        constructor(item: IInList);
        toStatement(): string;
    }
    interface ISpatialReferenceSystemsOperator {
        id?: number;
    }
    class SpatialReferenceSystemsOperatorBase implements IToStatement {
        readonly clazz: string;
        protected functionName: string;
        protected id?: null | number;
        constructor(functionName: string, id?: null | number);
        toStatement(): string;
    }
    class SpatialReferenceSystemsOperator implements IToStatement {
        readonly clazz: string;
        id?: number;
        constructor(item: ISpatialReferenceSystemsOperator);
        toStatement(): string;
    }
    class WithinOperator extends SpatialReferenceSystemsOperatorBase {
        constructor(item: ISpatialReferenceSystemsOperator);
    }
    class CoveredByOperator extends SpatialReferenceSystemsOperatorBase {
        constructor(item: ISpatialReferenceSystemsOperator);
    }
    class IntersectsOperator extends SpatialReferenceSystemsOperatorBase {
        constructor(item: ISpatialReferenceSystemsOperator);
    }
    interface IPoint {
        x: number;
        y: number;
    }
    const pointCoordinates: (item: IPoint) => string;
    class PointValues implements IToStatement {
        readonly clazz: string;
        point: IPoint;
        constructor(point: IPoint);
        toStatement(): string;
    }
    class MultiPointValues implements IToStatement {
        readonly clazz: string;
        points: IPoint[];
        constructor(points: IPoint[]);
        toStatement(): string;
    }
    class LineStringValues implements IToStatement {
        readonly clazz: string;
        protected points: IPoint[];
        constructor(points: IPoint[]);
        toStatement(): string;
        static toLineStringArray(points: IPoint[]): string;
    }
    class CircularStringValues extends LineStringValues {
        constructor(points: IPoint[]);
        toStatement(): string;
    }
    class MultiLineStringValues implements IToStatement {
        readonly clazz: string;
        protected lineStrings: IPoint[][];
        constructor(points: IPoint[][]);
        toStatement(): string;
    }
    class PolygonValues extends MultiLineStringValues {
        constructor(points: IPoint[][]);
        toStatement(): string;
        static toPolygonStringArray(polygon: IPoint[][]): string;
    }
    class MultiPolygonValues implements IToStatement {
        readonly clazz: string;
        polygons: IPoint[][][];
        constructor(polygons: IPoint[][][]);
        toStatement(): string;
    }
    class GeometryCollectionValues implements IToStatement {
        readonly clazz: string;
        geometryCollection: IToStatement[];
        constructor(geometryCollection: IToStatement[]);
        toStatement(): string;
    }
    interface IRangeValue {
        start: string | number;
        end: string | number;
        excludeStart?: boolean;
        excludeEnd?: boolean;
    }
    class RangeValues implements IToStatement {
        readonly clazz: string;
        start: string | number;
        end: string | number;
        excludeStart?: boolean;
        excludeEnd?: boolean;
        constructor(item: IRangeValue);
        toStatement(): string;
    }
    class Comparison implements IToStatement {
        readonly clazz: string;
        property: string | IToStatement;
        operator: (SearchQueryComparisonOperator | ComparisonOperator | NearOperator | SpatialReferenceSystemsOperator | WithinOperator | CoveredByOperator | IntersectsOperator);
        value?: string | IToStatement;
        valueAsReservedWord?: boolean;
        searchOptions?: ISearchOptions;
        constructor(item: IComparison);
        toStatement(): string;
    }
    class ScopeComparison implements IToStatement {
        readonly clazz: string;
        values: string[];
        constructor(item: IScopeComparison);
        toStatement(): string;
    }
    class Term implements IToStatement {
        readonly clazz: string;
        term: string;
        searchOptions?: ISearchOptions;
        isQuoted?: boolean;
        doEshEscaping?: boolean;
        constructor(item: ITerm);
        toStatement(): string;
    }
    const escapePhrase: (value: string) => string;
    class Phrase implements IToStatement {
        readonly clazz: string;
        phrase: string;
        searchOptions?: ISearchOptions;
        doEshEscaping?: boolean;
        constructor(item: IPhrase);
        toStatement(): string;
    }
    class Near implements IToStatement {
        readonly clazz: string;
        terms: string[] | IToStatement[];
        distance: number;
        ordering?: NearOrdering;
        searchOptions?: ISearchOptions;
        constructor(item: INear);
        toStatement(): string;
    }
    interface IProperty {
        property: string;
        prefixOperator?: SearchQueryPrefixOperator;
    }
    class Property implements IToStatement {
        readonly clazz: string;
        property: string;
        prefixOperator?: SearchQueryPrefixOperator;
        constructor(item: IProperty);
        toStatement(): string;
    }
    enum LogicalOperator {
        and = "and",
        or = "or",
        not = "not"
    }
    enum SearchQueryLogicalOperator {
        AND = "AND",
        TIGHT_AND = "",
        OR = "OR",
        NOT = "NOT",
        ROW = "ROW",
        AUTH = "AUTH",
        FILTER = "FILTER",
        FILTERWF = "FILTERWF",
        BOOST = "BOOST"
    }
    enum SearchQueryPrefixOperator {
        AND = "AND",
        OR = "OR",
        NOT = "NOT",
        AND_NOT = "AND NOT",
        OR_NOT = "OR NOT"
    }
    interface IExpression {
        operator?: (LogicalOperator | SearchQueryLogicalOperator);
        items: IToStatement[];
        searchOptions?: ISearchOptions;
    }
    function addFuzzySearchOptions(item: string, searchOptions?: ISearchOptions): string;
    class Expression implements IToStatement {
        readonly clazz: string;
        operator?: (LogicalOperator | SearchQueryLogicalOperator);
        items: IToStatement[];
        searchOptions?: ISearchOptions;
        constructor(item: IExpression);
        toStatement(): string;
    }
    enum SearchQueryComparisonOperator {
        Search = ":",
        EqualCaseInsensitive = ":EQ:",
        NotEqualCaseInsensitive = ":NE:",
        LessThanCaseInsensitive = ":LT:",
        LessThanOrEqualCaseInsensitive = ":LE:",
        GreaterThanCaseInsensitive = ":GT:",
        GreaterThanOrEqualCaseInsensitive = ":GE:",
        EqualCaseSensitive = ":EQ(S):",
        NotEqualCaseSensitive = ":NE(S):",
        LessThanCaseSensitive = ":LT(S):",
        LessThanOrEqualCaseSensitive = ":LE(S):",
        GreaterThanCaseSensitive = ":GT(S):",
        GreaterThanOrEqualCaseSensitive = ":GE(S):",
        IsNull = ":IS:NULL",
        BetweenCaseInsensitive = ":BT:",
        BetweenCaseSensitive = ":BT(S):",
        DescendantOf = ":DESCENDANT_OF:",
        ChildOf = ":CHILD_OF:"
    }
    enum ComparisonOperator {
        Equal = " eq ",
        NotEqual = " ne ",
        GreaterThan = " gt ",
        LessThan = " lt ",
        GreaterThanOrEqualTo = " ge ",
        LessThanOrEqualTo = " le ",
        Is = " is ",
        In = " in ",
        IsNot = " is not "
    }
    enum ESOrderType {
        Ascending = "ASC",
        Descending = "DESC"
    }
    interface IESOrdering {
        key: string;
        order?: ESOrderType;
    }
    interface IESSearchOptions {
        $top?: number;
        $skip?: number;
        $orderby?: IESOrdering[];
        query?: string;
        /**
         * This filter is used only for special search features like fuzzy,... For basic filtering please use 'oDataFilter' property
        */
        searchQueryFilter?: Expression;
        /**
         * This filter is used only for basic filtering. Please use 'searchQueryFilter' property for special search features like fuzzy,..
        */
        oDataFilter?: Expression;
        whyfound?: boolean;
        scope?: string;
        $select?: string[];
        $count?: boolean;
        facets?: string[];
        groupby?: IGroupBy;
        estimate?: boolean;
        facetlimit?: number;
        wherefound?: boolean;
        suggestTerm?: string;
        metadataCall?: boolean;
        metadataObjects?: IMetadataObjects;
        resourcePath?: string;
        $apply?: string | FilterFunction | CustomFunction;
        filteredgroupby?: boolean;
        facetroot?: HierarchyFacet[];
        eshParameters?: {
            [key: string]: string;
        };
        dynamicview?: DynamicView[];
        freeStyleText?: string;
        valuehierarchy?: string;
    }
    interface IMetadataObjects {
        format?: string;
        collectionReference?: string;
        entitySets?: string;
        contextEntitySet?: string;
        primitiveTyp?: string;
    }
    const SEARCH_DEFAULTS: {
        query: string;
        scope: string;
    };
    interface IEsearchRequestInterface {
        path: string;
        parameters: any;
    }
    interface IAlias {
        type: string;
        alias: string;
    }
    interface IPropertyAlias {
        path: string[];
        alias: string;
    }
    class PropertyAlias implements IPropertyAlias, IToStatement {
        readonly clazz: string;
        path: string[];
        alias: string;
        constructor(item: IPropertyAlias);
        toStatement(): string;
    }
    class Alias implements IAlias, IToStatement {
        readonly clazz: string;
        type: string;
        alias: string;
        constructor(item: IAlias);
        toStatement(): string;
    }
    interface IDynamicView {
        name: string;
        select: string[];
        aliases?: Alias[];
        properties: PropertyAlias[];
        paths: (string | string[])[][];
        conditions?: (Comparison | Expression)[];
    }
    class DynamicView implements IDynamicView, IToStatement {
        readonly clazz: string;
        name: string;
        select: string[];
        aliases?: Alias[];
        properties: PropertyAlias[];
        paths: (string | string[])[][];
        conditions?: (Comparison | Expression)[];
        constructor(item: IDynamicView);
        toStatement(): string;
    }
    interface ICustomFunction {
        name: string | string[];
        arguments?: {
            [key: string]: any;
        };
    }
    class CustomFunction implements ICustomFunction, IToStatement {
        readonly clazz: string;
        name: string | string[];
        arguments?: {
            [key: string]: any;
        };
        constructor(item: ICustomFunction);
        toStatement(): string;
    }
    interface IFilterFunction {
        customFunction: CustomFunction | Expression;
        oDataFilter?: Expression | Comparison;
    }
    class FilterFunction implements IFilterFunction, IToStatement {
        readonly clazz: string;
        customFunction: CustomFunction | Expression;
        oDataFilter?: Expression | Comparison;
        constructor(item: IFilterFunction);
        toStatement(): string;
    }
    const deserialize: (jsonO: any) => any;
}
//# sourceMappingURL=definitions.d.ts.map