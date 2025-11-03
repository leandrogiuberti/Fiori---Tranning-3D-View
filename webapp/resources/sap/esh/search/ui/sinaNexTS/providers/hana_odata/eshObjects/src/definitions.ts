/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
/* eslint-disable max-classes-per-file */
/** Copyright 2019 SAP SE or an SAP affiliate company. All rights reserved. */


const reservedCharacters = ["\\", "-", "(", ")", "~", "^", "?", "\"", ":", "'", "[", "]"]; //add new elements at the end of the array
const reservedWords = ["AND", "OR", "NOT"];

function replaceAll(original: string, search: string, replacement: string): string {
  return original.split(search).join(replacement);
}

export const escapeSingleQuote = (value: string): string => {
  return value.replace(/'/g, "''");
}

export const escapeDoubleQuoteAndBackslash = (value: string): string => {
  return value.replace(/\\/g, "\\\\").replace(/"/g, "\\\"");
}


export function escapeQuery(query: string): string {
  let escapedQuery: string = query ? query.trim() : "";
  if (escapedQuery !== "") {
    for (const specialCharacter of reservedCharacters) {
      if (specialCharacter) {
        if (specialCharacter === "'") {
          escapedQuery = escapeSingleQuote(escapedQuery);
        } else {
          escapedQuery = replaceAll(escapedQuery, specialCharacter, "\\" + specialCharacter);
        }
      }
    }
    for (const specialWord of reservedWords) {
      if (escapedQuery === specialWord) {
        escapedQuery = "\"" + specialWord + "\"";
      }
      if (escapedQuery.startsWith(specialWord + " ")) {
        escapedQuery = "\"" + specialWord + "\" " + escapedQuery.substring(specialWord.length + 1);
      }
      if (escapedQuery.endsWith(" " + specialWord)) {
        escapedQuery = escapedQuery.substring(0, escapedQuery.length - (specialWord.length + 1)) + " \"" + specialWord + "\"";
      }
      //escapedQuery = replaceAll(escapedQuery, " " + specialWord + " ", " \"" + specialWord + "\" ");
      escapedQuery = escapedQuery.replace(new RegExp(` ${specialWord} `, 'g'), ` \"${specialWord}\" `);
    }
  }

  //if (escapedQuery === "") {
  //  escapedQuery = " ";
  //}
  return escapedQuery;
}

export function escapeQueryWithCustomLength(query: string, length: number): string {
  return escapeQuery(query).substring(0, length);
}

export function escapeQueryWithDefaultLength(query: string): string {
  return escapeQuery(query).substring(0, 1500);
}

export function existValueInEnum(type: any, value: any): boolean {
  return Object.keys(type).filter(k => isNaN(Number(k))).filter(k => type[k] === value).length > 0;
}
export interface ISearchOptions {
  fuzzinessThreshold?: number;
  weight?: number;
  fuzzySearchOptions?: string;
}

export interface IToStatement {
  readonly clazz: string;
  toStatement(): string;
}

export interface IComparison {
  property: string | IToStatement;
  operator: (SearchQueryComparisonOperator | ComparisonOperator | NearOperator);
  value?: string | IToStatement;
  valueAsReservedWord?: boolean;
  searchOptions?: ISearchOptions;
}

export interface IScopeComparison {
  values: string[];
}

export interface ITerm {
  term: string;
  searchOptions?: ISearchOptions;
  isQuoted?: boolean;
  doEshEscaping?: boolean;
}

export interface IPhrase {
  phrase: string;
  searchOptions?: ISearchOptions;
  doEshEscaping?: boolean;
}

export enum NearOrdering {
  Ordered = "O",
  Unordered = "U"
}
export interface INear {
  terms: string[] | IToStatement[];
  distance: number;
  ordering?: NearOrdering;
  searchOptions?: ISearchOptions;
}

export interface IGroupBy {
  properties: string[];
  aggregateCountAlias?: string;
}

export interface INearOperator {
  distance: number;
  ordering?: NearOrdering;
}

export interface IHierarchyFacet {
  facetColumn: string;
  rootIds: (string | null)[];
  levels: number;
}

export interface IListValues {
  values: string[];
}

export class ListValues implements IToStatement {
  readonly clazz = this.constructor.name;
  values: (string | IToStatement) [];

  constructor(item: IListValues) {
    this.values = item.values;
  }
  toStatement(): string {
    return `[${this.values.map((value) => typeof value === "string" ? "'" + escapeSingleQuote(value) + "'" : value.toStatement()).join(",")}]`;
  }
}

export class NullValue implements IToStatement {
  readonly clazz = this.constructor.name;
  constructor() {};
  toStatement(): string {
    return "null";
  }
}

export class BooleanValue implements IToStatement {
  readonly clazz = this.constructor.name;
  value: Boolean;
  constructor(item: {value: Boolean}) {
    this.value = item.value;
  };
  toStatement(): string {
    return this.value.toString();
  }
}

export class NumberValue implements IToStatement {
  readonly clazz = this.constructor.name;
  value: Number | String;
  constructor(item: {value: Number | String}) {
    this.value = item.value;
  };
  toStatement(): string {
    return String(this.value);
  }
}

export interface IStringValue {
  value: string;
  isQuoted?: boolean;
  isSingleQuoted?: boolean;
  withoutEnclosing?: boolean;
}
export class StringValue implements IToStatement {
  readonly clazz = this.constructor.name;
  
  value: string;
  isQuoted?: boolean;
  isSingleQuoted?: boolean;
  withoutEnclosing?: boolean;
  
  constructor(item: IStringValue) {
    this.value = item.value;
    this.isQuoted = item.isQuoted;
    this.isSingleQuoted = item.isSingleQuoted;
    this.withoutEnclosing = item.withoutEnclosing;
  };
  
  toStatement(): string {
    if (this.withoutEnclosing) {
      return String(Number.parseFloat(this.value));
    }
    if (this.isQuoted) {
      return `"${escapeDoubleQuoteAndBackslash(this.value)}"`;
    } 
    if (this.isSingleQuoted) {
      return `'${escapeSingleQuote(this.value)}'`;
    }
    return this.value;
  }

}


export interface IViewParameter {
  param: string;
}
export class ViewParameter implements IViewParameter {
  readonly clazz = this.constructor.name;
  param: string;

  constructor(item: IViewParameter) {
    this.param = item.param;
  }

  toStatement(): string {
    return `param "${escapeDoubleQuoteAndBackslash(this.param)}"`;
  }
}

export class HierarchyFacet implements IToStatement {
  readonly clazz = this.constructor.name;
  facetColumn: string;
  rootIds: (string | null)[];
  levels: number;

  constructor(item: IHierarchyFacet) {
    this.facetColumn = item.facetColumn;
    this.rootIds = item.rootIds;
    this.levels = item.levels;
  }
  toStatement(): string {
    return `(${this.facetColumn},(${this.rootIds.map(id => id ? "'" + id + "'" : "null").join(",")}),${this.levels})`;
  }
}
export class NearOperator implements IToStatement {
  readonly clazz = this.constructor.name;
  distance: number;
  ordering?: NearOrdering;

  constructor(item: INearOperator) {
    this.distance = item.distance;
    this.ordering = item.ordering;
  }
  toStatement(): string {
    return `:NEAR(${this.distance}${this.ordering ? "," + this.ordering : ""}):`;
  }
}

export enum InListOperator {
  AND = "AND",
  OR = "OR"
}

export interface IInList {
  operator: InListOperator;
  values: string[];
}

export class InList implements IToStatement {
  readonly clazz = this.constructor.name;
  operator: InListOperator;
  values: string[];

  constructor(item: IInList) {
    this.operator = item.operator;
    this.values = item.values;
  }
  toStatement(): string {
    return `${this.operator}(${this.values.join(" ")})`;
  }
}

interface ISpatialReferenceSystemsOperator {
  id?: number;
}

class SpatialReferenceSystemsOperatorBase implements IToStatement {
  readonly clazz = this.constructor.name;
  protected functionName: string;
  protected id?: null | number;

  constructor(functionName: string, id?: null | number) {
    this.functionName = functionName;
    this.id = id;
  }

  toStatement(): string {
    return `:${this.functionName}${this.id ? "(" + this.id + ")" : ""}:`;
  }
}
export class SpatialReferenceSystemsOperator implements IToStatement {
  readonly clazz = this.constructor.name;
  id?: number;

  constructor(item: ISpatialReferenceSystemsOperator) {
    this.id = item.id;
  }

  toStatement(): string {
    return `:${this.id ? "(" + this.id + "):" : ""}`;
  }
}

export class WithinOperator extends SpatialReferenceSystemsOperatorBase {
  constructor(item: ISpatialReferenceSystemsOperator) {
    super("WITHIN", item.id);
  }
}

export class CoveredByOperator extends SpatialReferenceSystemsOperatorBase {
  constructor(item: ISpatialReferenceSystemsOperator) {
    super("COVERED_BY", item.id);
  }
}

export class IntersectsOperator extends SpatialReferenceSystemsOperatorBase {
  constructor(item: ISpatialReferenceSystemsOperator) {
    super("INTERSECTS", item.id);
  }
}

interface IPoint {
  x: number;
  y: number;
}

const pointCoordinates = (item: IPoint): string => `${item.x} ${item.y}`;


export class PointValues implements IToStatement {
  readonly clazz = this.constructor.name;
  point: IPoint;

  constructor(point: IPoint) {
    this.point = point;
  }
  toStatement(): string {
    return `POINT(${pointCoordinates(this.point)})`;
  }
}

export class MultiPointValues implements IToStatement {
  readonly clazz = this.constructor.name;
  points: IPoint[];

  constructor(points: IPoint[]) {
    this.points = points;
  }
  toStatement(): string {
    return `MULTIPOINT(${this.points.map((point) => "(" + pointCoordinates(point) + ")").join(",")})`;
  }
}

export class LineStringValues implements IToStatement {
  readonly clazz = this.constructor.name;
  protected points: IPoint[];

  constructor(points: IPoint[]) {
    this.points = points;
  }

  toStatement(): string {
    return `LINESTRING${LineStringValues.toLineStringArray(this.points)}`;
  }

  static toLineStringArray(points: IPoint[]) {
    return `(${points.map((point) => pointCoordinates(point)).join(", ")})`;
  }
}

export class CircularStringValues extends LineStringValues {

  constructor(points: IPoint[]) {
    super(points);
  }

  toStatement(): string {
    return `CIRCULARSTRING${LineStringValues.toLineStringArray(this.points)}`;
  }
}

export class MultiLineStringValues implements IToStatement {
  readonly clazz = this.constructor.name;
  protected lineStrings: IPoint[][];

  constructor(points: IPoint[][]) {
    this.lineStrings = points;
  }
  toStatement(): string {
    return `MULTILINESTRING(${this.lineStrings.map((lineString) => LineStringValues.toLineStringArray(lineString)).join(", ")})`;
  }
}

export class PolygonValues extends MultiLineStringValues {

  constructor(points: IPoint[][]) {
    super(points);
  }

  toStatement(): string {
    return `POLYGON${PolygonValues.toPolygonStringArray(this.lineStrings)}`;
  }

  static toPolygonStringArray(polygon: IPoint[][]) {
    return `(${polygon.map((lineString) => LineStringValues.toLineStringArray(lineString)).join(", ")})`;
  }
}

export class MultiPolygonValues implements IToStatement {
  readonly clazz = this.constructor.name;
  polygons: IPoint[][][];

  constructor(polygons: IPoint[][][]) {
    this.polygons = polygons;
  }

  toStatement(): string {
    return `MULTIPOLYGON(${this.polygons.map((polygon) => PolygonValues.toPolygonStringArray(polygon)).join(", ")})`;
  }
}


export class GeometryCollectionValues implements IToStatement {
  readonly clazz = this.constructor.name;
  geometryCollection: IToStatement[];

  constructor(geometryCollection: IToStatement[]) {
    this.geometryCollection = geometryCollection;
  }

  toStatement(): string {
    return `GEOMETRYCOLLECTION(${this.geometryCollection.map((geometry) => geometry.toStatement()).join(", ")})`;
  }
}


export interface IRangeValue {
  start: string | number;
  end: string | number;
  excludeStart?: boolean;
  excludeEnd?: boolean;
}

export class RangeValues implements IToStatement {
  readonly clazz = this.constructor.name;
  start: string | number;
  end: string | number;
  excludeStart?: boolean;
  excludeEnd?: boolean;

  constructor(item: IRangeValue) {
    this.start = item.start;
    this.end = item.end;
    this.excludeStart = item.excludeStart;
    this.excludeEnd = item.excludeEnd;
  }
  toStatement(): string {
    return `${this.excludeStart ? "]" : "["}${escapeQuery(this.start.toString())} ${escapeQuery(this.end.toString())}${this.excludeEnd ? "[" : "]"}`;
  }
}

export class Comparison implements IToStatement {
  readonly clazz = this.constructor.name;
  property: string | IToStatement;
  operator: (SearchQueryComparisonOperator | ComparisonOperator | NearOperator | SpatialReferenceSystemsOperator | WithinOperator | CoveredByOperator | IntersectsOperator);
  value?: string | IToStatement;
  valueAsReservedWord?: boolean;
  searchOptions?: ISearchOptions;

  constructor(item: IComparison) {
    this.property = item.property;
    this.operator = item.operator;
    this.value = item.value;
    this.valueAsReservedWord = item.valueAsReservedWord;
    this.searchOptions = item.searchOptions;
  }

  public toStatement(): string {
    let escapeValueCharStart = "";
    let escapeValueCharEnd = "";
    /* 
    if (existValueInEnum(ComparisonOperator, this.operator)) {
      if (this.valueAsReservedWord) {
        escapeValueCharStart = "";
        escapeValueCharEnd = "";
      } else {
        escapeValueCharStart = "'";
        escapeValueCharEnd = "'";
      }
    } else if (this.operator === SearchQueryComparisonOperator.Fuzzy) {
      escapeValueCharStart = "(";
      escapeValueCharEnd = ")";
    } */
    let isODataComparison = false;
    if (existValueInEnum(ComparisonOperator, this.operator)) {
      isODataComparison = true;
      if (this.value && ((this.value instanceof NullValue) || (this.value instanceof BooleanValue) || (this.value instanceof NumberValue) || (this.value instanceof ListValues) || (this.value instanceof ViewParameter))) {
        this.valueAsReservedWord = true;
      }
      if (this.valueAsReservedWord) {
        escapeValueCharStart = "";
        escapeValueCharEnd = "";
      } else {
        escapeValueCharStart = "'";
        escapeValueCharEnd = "'";
      }
    }
    const propertyValues = typeof (this.property) === "string" ? this.property : this.property.toStatement();
    let valueQuery = "";
    if (this.value) {
      if (typeof (this.value) === "string") {
        if (isODataComparison) {
          valueQuery = escapeSingleQuote(this.value);
        } else {
          valueQuery = escapeQuery(this.value.toString());
        }
      } else {
        valueQuery = this.value.toStatement();
      }
      // valueQuery = typeof (this.value) === "string" ? escapeQuery(this.value.toString()) : this.value.toStatement();
    }
    const comparisonOperator = typeof (this.operator) === "string" ? this.operator : this.operator.toStatement();
    const comparisonStatement = propertyValues + comparisonOperator + escapeValueCharStart + valueQuery + escapeValueCharEnd;
    return addFuzzySearchOptions(comparisonStatement, this.searchOptions);
  }
}

export class ScopeComparison implements IToStatement {
  public readonly clazz = this.constructor.name;
  values: string[];

  constructor(item: IScopeComparison) {
    this.values = item.values;
  }

  public toStatement(): string {
    if (this.values.length === 0) {
      throw new Error("ScopeComparison values cannot be empty");
    }
    return this.values.length > 1 ? `SCOPE:(${this.values.join(" OR ")})` : `SCOPE:${this.values[0]}`;
  }
}
export class Term implements IToStatement {
  public readonly clazz = this.constructor.name;
  term: string;
  searchOptions?: ISearchOptions;
  isQuoted?: boolean;
  doEshEscaping?: boolean;

  constructor(item: ITerm) {
    this.term = item.term;
    this.searchOptions = item.searchOptions;
    this.isQuoted = item.isQuoted;
    if (typeof(item.doEshEscaping) != 'undefined' && item.doEshEscaping != null)
    {
      this.doEshEscaping = item.doEshEscaping;
    } else {
      this.doEshEscaping = true;
    }
  }

  public toStatement(): string {
    let finalTerm;
    if (this.doEshEscaping) {
      finalTerm = this.isQuoted ? '"' + escapePhrase(this.term) + '"' : escapeQuery(this.term);
    } else {
      finalTerm = this.isQuoted ? '"' + this.term + '"' : this.term;
    }
    return addFuzzySearchOptions(finalTerm, this.searchOptions);
  }
}

export const escapePhrase = (value: string): string => {
  let returnValue = value.replace(/\\/g, '\\\\');
  returnValue = returnValue.replace(/"/g, '\\"');
  // returnValue = returnValue.replace(/\*/g, '\\*'); // do not escape *
  returnValue = returnValue.replace(/\?/g, '\\?');
  returnValue = returnValue.replace(/\'/g, "''");
  return returnValue;
}

export class Phrase implements IToStatement {
  readonly clazz = this.constructor.name;
  phrase: string;
  searchOptions?: ISearchOptions;
  doEshEscaping?: boolean;

  constructor(item: IPhrase) {
    this.phrase = item.phrase;
    this.searchOptions = item.searchOptions;
    if (typeof(item.doEshEscaping) != 'undefined' && item.doEshEscaping != null)
    {
      this.doEshEscaping = item.doEshEscaping;
    } else {
      this.doEshEscaping = true;
    }
  }

  public toStatement(): string {
    let finalPhrase;
    if (this.doEshEscaping) {
      finalPhrase = escapePhrase(this.phrase);
    } else {
      finalPhrase = this.phrase;
    }
    // return addFuzzySearchOptions("\"" + replaceAll(this.phrase, '"', '\\"') + "\"", this.searchOptions);
    // return addFuzzySearchOptions("\"" + this.phrase.replace(/"/g, '\\"') + "\"", this.searchOptions);
    // return addFuzzySearchOptions("\"" + escapePhrase(this.phrase) + "\"", this.searchOptions);
    return addFuzzySearchOptions("\"" + finalPhrase + "\"", this.searchOptions);
  }
}


export class Near implements IToStatement {
  readonly clazz = this.constructor.name;
  terms: string[] | IToStatement[];
  distance: number;
  ordering?: NearOrdering;
  searchOptions?: ISearchOptions;

  constructor(item: INear) {
    this.terms = item.terms;
    this.distance = item.distance;
    this.ordering = item.ordering;
    this.searchOptions = item.searchOptions;
  }

  public toStatement(): string {
    const values: string[] = [];
    this.terms.forEach((value: string | IToStatement) => {
      values.push(typeof value === "string" ? value : value.toStatement())
    })
    const nearStatement = `NEAR(${this.distance}${this.ordering ? "," + this.ordering : ""}):(${values.join(" ")})`;
    return addFuzzySearchOptions(nearStatement, this.searchOptions);
  }
}

export interface IProperty {
  property: string;
  prefixOperator?: SearchQueryPrefixOperator;
}
export class Property implements IToStatement {
  readonly clazz = this.constructor.name;
  property: string;
  prefixOperator?: SearchQueryPrefixOperator;
  // searchOptions: ISearchOptions

  constructor(item: IProperty) {
    this.property = item.property;
    this.prefixOperator = item.prefixOperator;
  }

  public toStatement(): string {
    if (this.prefixOperator) {
      return this.prefixOperator + " " + this.property;
    }
    return this.property;
  }
}


export enum LogicalOperator {
  and = "and",
  or = "or",
  not = "not"
}

export enum SearchQueryLogicalOperator {
  AND = "AND",
  TIGHT_AND = "",
  OR = "OR",
  NOT = "NOT",
  ROW = "ROW",
  AUTH = "AUTH",
  FILTER = "FILTER",
  FILTERWF = "FILTERWF",
  BOOST = "BOOST",
}

export enum SearchQueryPrefixOperator {
  AND = "AND",
  OR = "OR",
  NOT = "NOT",
  AND_NOT = "AND NOT",
  OR_NOT = "OR NOT",
}
export interface IExpression {
  operator?: (LogicalOperator | SearchQueryLogicalOperator);
  items: IToStatement[];
  searchOptions?: ISearchOptions;
}

function addFuzzySearchOptions(item: string, searchOptions?: ISearchOptions): string {
  let returnStatement = item;
  if (searchOptions) {
    if (searchOptions.fuzzinessThreshold) {
      returnStatement = returnStatement + "~" + searchOptions.fuzzinessThreshold.toString();
    }
    if (searchOptions.fuzzySearchOptions) {
      if (!searchOptions.fuzzinessThreshold) {
        returnStatement = returnStatement + "~0.8";//default fuzzinessThreshold
      }
      returnStatement = returnStatement + "[" + searchOptions.fuzzySearchOptions + "]";
    }
    if (searchOptions.weight !== undefined) {
      returnStatement = `${returnStatement}^${searchOptions.weight}`;
    }
  }
  return returnStatement;

}

export class Expression implements IToStatement {
  public readonly clazz = this.constructor.name;
  operator?: (LogicalOperator | SearchQueryLogicalOperator);
  items: IToStatement[];
  searchOptions?: ISearchOptions;

  constructor(item: IExpression) {
    this.operator = item.operator;
    this.items = item.items;
    this.searchOptions = item.searchOptions;
  }

  toStatement(): string {
    let returnStatement = "";
    switch (this.operator) {
      case SearchQueryLogicalOperator.ROW:
      case SearchQueryLogicalOperator.AUTH:
      case SearchQueryLogicalOperator.FILTER:
      case SearchQueryLogicalOperator.FILTERWF:
      case SearchQueryLogicalOperator.BOOST:
        let operatorValue = this.items.map(i => i.toStatement()).join(" " + this.operator + " ");
        if (!operatorValue.startsWith("(")) {
          operatorValue = "(" + operatorValue + ")";
        }
        returnStatement = this.operator + ":" + operatorValue;
        break;
      case SearchQueryLogicalOperator.NOT:
        if (this.items.length > 1) {
          throw new Error("Invalid operator. NOT operator is allowed only on a single item.");
        }
        returnStatement = "(NOT " + this.items[0].toStatement() + ")";
        break;
      case LogicalOperator.not:
        if (this.items.length > 1) {
          throw new Error("Invalid operator. 'not' operator is allowed only on a single item.");
        }
        returnStatement = "not " + this.items[0].toStatement();
        break;
      default:
        if (!this.items || this.items.length == 0) {
          return ""; 
        } else if (this.items.length > 1) {
          const itemsScopes = this.items.filter(i => { return (i instanceof ScopeComparison) });
          if (itemsScopes.length > 0) {
            returnStatement = this.items.map(i => i.toStatement()).join(`${this.operator === "" ? " " : " " + this.operator + " "}`);
          } else {
            returnStatement = "(" + this.items.map(i => i.toStatement()).join(`${this.operator === "" ? " " : " " + this.operator + " "}`) + ")";
          }
        } else {
          returnStatement = this.items[0].toStatement();
        }
        break;
    }
    return addFuzzySearchOptions(returnStatement, this.searchOptions);
  }
}

export enum SearchQueryComparisonOperator {
  // eslint-disable-next-line no-shadow
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
  ChildOf = ":CHILD_OF:",
}

export enum ComparisonOperator {
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

export enum ESOrderType {
  Ascending = "ASC",
  Descending = "DESC",
}

export interface IESOrdering {
  key: string;
  order?: ESOrderType;
}

export interface IESSearchOptions {
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
    [key: string]: string
  },
  dynamicview?: DynamicView[],
  freeStyleText?: string;
  valuehierarchy?: string;
}

export interface IMetadataObjects{
  format?: string;
  collectionReference?: string;
  entitySets?: string;
  contextEntitySet?: string;
  primitiveTyp?: string;
}

export const SEARCH_DEFAULTS = {
  query: "",
  scope: "",
};

export interface IEsearchRequestInterface {
  path: string;
  parameters: any;
}

export interface IAlias {
  type: string,
  alias: string,
}

export interface IPropertyAlias {
  path: string[],
  alias: string,
}

export class PropertyAlias implements IPropertyAlias, IToStatement {
  readonly clazz = this.constructor.name;
  path: string[];
  alias: string;

  constructor(item: IPropertyAlias) {
    this.path = item.path;
    this.alias = item.alias;
  }

  toStatement(): string {
    return `${this.path.join(".")} ${this.alias}`;
    // return `${this.path.map((item)=> "\"" + escapeDoubleQuoteAndBackslash(item) + "\"").join(".")} ${this.alias}`;
  }
}
export class Alias implements IAlias, IToStatement {
  readonly clazz = this.constructor.name;
  type: string;
  alias: string;

  constructor(item: IAlias) {
    this.type = item.type;
    this.alias = item.alias;
  }

  toStatement(): string {
    return `${this.type} ${this.alias}`;
    // return `"${escapeDoubleQuoteAndBackslash(this.type)}" ${this.alias}`;
  }
}

export interface IDynamicView {
  name: string;
  select: string[];
  aliases?: Alias[];
  properties: PropertyAlias[];
  paths: (string | string[])[][];
  conditions?: (Comparison | Expression)[];
}

export class DynamicView implements IDynamicView, IToStatement {
  readonly clazz = this.constructor.name;
  name: string;
  select: string[];
  aliases?: Alias[];
  properties: PropertyAlias[];
  paths: (string | string[])[][];
  conditions?: (Comparison | Expression)[];

  constructor(item: IDynamicView) {
    this.name = item.name;
    this.select = item.select;
    this.aliases = item.aliases;
    this.properties = item.properties;
    this.paths = item.paths;
    this.conditions = item.conditions;
  }
  

  toStatement(): string {
    let returnValue: {[key: string]: string} = {
      name: this.name,
      select: this.select.join(", "),
    };
    let listOfAliases: string[] = [];
    if (this.aliases) {
      returnValue.aliases = this.aliases.map((alias) => {return alias.toStatement()}).join(", ");
      listOfAliases = this.aliases.map((item) => item.alias);
    }
    returnValue.properties = this.properties.map((property) => {return property.toStatement()}).join(", ");
    returnValue.paths = this.paths.map((paths) => {return paths.map((path) => { return (typeof(path) === 'string') ? path : path.join(".")} ).join('/')}).join(", ")
    if (this.conditions) {
      returnValue.conditions = this.conditions.map((condition) => { return condition.toStatement();}).join(", ")
    }
    return Object.keys(returnValue).map(key => {return `${key}: ${returnValue[key]}`}).join("; ")+";";
  }
}

export interface ICustomFunction {
  name: string | string[];
  arguments?: {
    [key: string]: any
  }
}
export class CustomFunction implements ICustomFunction, IToStatement {
  readonly clazz = this.constructor.name;
  name: string | string[];
  arguments?: {
    [key: string]: any
  }

  constructor(item: ICustomFunction) {
    this.name = item.name;
    this.arguments = item.arguments;
  }

  toStatement(): string {
    let argumentsValue = '';
    if (this.arguments) {
      argumentsValue = Object.keys(this.arguments).map((key) => {
        let singleArgumentValue = `${key}=`;
        if (this.arguments && typeof(this.arguments[key]) === 'string') {
          singleArgumentValue = `'${escapeSingleQuote(this.arguments[key])}'`;
        } else if (this.arguments && this.arguments[key] && typeof(this.arguments[key]) === 'object') {
          if (typeof(this.arguments[key].toStatement) === "function") { 
            if (this.arguments[key] instanceof CustomFunction || this.arguments[key] instanceof FilterFunction) {
              singleArgumentValue = this.arguments[key].toStatement();
            } else {
              if(this.arguments[key] instanceof NumberValue) {
                singleArgumentValue =  this.arguments[key].toStatement();
              } else {
                singleArgumentValue = `'${this.arguments[key].toStatement()}'`;
              }
            }
          } else if (Array.isArray(this.arguments[key])) {
            singleArgumentValue = "[" + this.arguments[key].map((element: any) => {
              if(element instanceof NumberValue) {
                return element.toStatement();
              } else if(typeof(element) === 'string') {
                return `'${escapeSingleQuote(element)}'`;
              } else {
                return String(element)
              }
            }).join(",") + "]";
          } else {
            throw new Error("Unexpected object: " + this.arguments[key])
          }
        }
        else {
          singleArgumentValue = String(this.arguments ? String(this.arguments[key]) : '');
        }
        
        return `${key}=${singleArgumentValue}`
      }).join(",")
    }
    return `${typeof(this.name) === "string" ? this.name : this.name.join(".")}(${argumentsValue})`;
  }
}

export interface IFilterFunction {
  customFunction: CustomFunction | Expression;
  oDataFilter?: Expression | Comparison;
}
export class FilterFunction implements IFilterFunction, IToStatement {
  readonly clazz = this.constructor.name;
  customFunction: CustomFunction | Expression;
  oDataFilter?: Expression | Comparison;

  constructor(item: IFilterFunction) {
    this.customFunction = item.customFunction;
    this.oDataFilter = item.oDataFilter;
  }
  
  toStatement(): string {
    let returnStatement ;
    if (this.customFunction instanceof Expression) {
      let expressionStatement = `Search.search(query='${this.customFunction.toStatement()}')`;
      if (this.oDataFilter) {
        expressionStatement += ` and ${this.oDataFilter.toStatement()}`
      }
      returnStatement = `filter(${expressionStatement})`;
    } else {
      returnStatement = `filter(${this.customFunction.toStatement()}`;
      if (this.oDataFilter) {
        returnStatement += ` and ${this.oDataFilter.toStatement()}`
      }
      returnStatement += ")";
    }
    return returnStatement;
  }
}



export const deserialize = (jsonO: any): any => {
  //const jsonO = JSON.parse(jsonStr);
  if (typeof jsonO === "object") {
    switch (jsonO.clazz) {
      case "Property":
        return new Property(jsonO);
      case "Near":
        jsonO.terms = jsonO.terms.map((item: string | IToStatement) => deserialize(item));
        return new Near(jsonO);
      case "Phrase":
        return new Phrase(jsonO);
      case "RangeValues":
        return new RangeValues(jsonO);
      case "GeometryCollectionValues":
        return new GeometryCollectionValues(jsonO.geometryCollection.map((item: any) => deserialize(item)));
      case "MultiPolygonValues":
        return new MultiPolygonValues(jsonO.polygons);
      case "MultiLineStringValues":
        return new MultiLineStringValues(jsonO.lineStrings);
      case "CircularStringValues":
        return new CircularStringValues(jsonO.points)
      case "LineStringValues":
        return new LineStringValues(jsonO.points);
      case "MultiPointValues":
        return new MultiPointValues(jsonO.points);
      case "PointValues":
        return new PointValues(jsonO.point);
      case "SpatialReferenceSystemsOperator":
        return new SpatialReferenceSystemsOperator(jsonO);
      case "SpatialReferenceSystemsOperatorBase":
        return new SpatialReferenceSystemsOperatorBase(jsonO);
      case "InList":
        return new InList(jsonO);
      case "NearOperator":
        return new NearOperator(jsonO);
      case "Term":
        return new Term(jsonO);
      case "HierarchyFacet":
        return new HierarchyFacet(jsonO);
      case "Comparison":
        const deserializedComparison = new Comparison(jsonO);
        if (typeof deserializedComparison.property === "object") {
          deserializedComparison.property = deserialize(deserializedComparison.property);
        }
        if (deserializedComparison.operator && typeof deserializedComparison.operator === "object") {
          deserializedComparison.operator = deserialize(deserializedComparison.operator);
        }
        if (deserializedComparison.value && typeof deserializedComparison.value === "object") {
          deserializedComparison.value = deserialize(deserializedComparison.value);
        }
        return deserializedComparison;
      case "ScopeComparison":
        return new ScopeComparison(jsonO);
      case "WithinOperator":
        return new WithinOperator(jsonO);
      case "PolygonValues":
        return new PolygonValues(jsonO.lineStrings);
      case "CoveredByOperator":
        return new CoveredByOperator(jsonO);
      case "IntersectsOperator":
        return new IntersectsOperator(jsonO);
      case "Expression":
        const returnExpression = new Expression(jsonO);
        returnExpression.items = returnExpression.items.map((item) => deserialize(item));
        return returnExpression;
      case "DynamicView":
        const returnDynamicView = new DynamicView(jsonO);
        returnDynamicView.properties = returnDynamicView.properties.map((property) => deserialize(property));
        if (returnDynamicView.aliases) {
          returnDynamicView.aliases = returnDynamicView.aliases.map((alias) => deserialize(alias));
        }
        if (returnDynamicView.conditions) {
          if (Array.isArray(returnDynamicView.conditions)) {
            returnDynamicView.conditions = returnDynamicView.conditions.map((condition) => deserialize(condition));
          } else {
            returnDynamicView.conditions = deserialize(returnDynamicView.conditions);
          }
        }
        return returnDynamicView;
      case "Alias":
        return new Alias(jsonO);
      case "PropertyAlias":
        return new PropertyAlias(jsonO);
      case "ListValues":
        const returnValue = new ListValues(jsonO)
        returnValue.values = returnValue.values.map(element => deserialize(element));
        return returnValue;
      case "ViewParameter":
        return new ViewParameter(jsonO);
      case "NullValue":
        return new NullValue();
      case "BooleanValue":
        return new BooleanValue(jsonO);
      case "NumberValue":
        return new NumberValue(jsonO);
      case "StringValue":
        return new StringValue(jsonO);
      case "CustomFunction":
          const returnCustomFunction: ICustomFunction = new CustomFunction(jsonO);
          if (returnCustomFunction.arguments) {
            Object.keys(returnCustomFunction.arguments).map((key) => {
              if (returnCustomFunction.arguments && typeof(returnCustomFunction.arguments[key]) === 'object' && typeof(returnCustomFunction.arguments[key].clazz) === "string") {
                if(["CustomFunction","FilterFunction"].includes(returnCustomFunction.arguments[key].clazz)) {
                  returnCustomFunction.arguments[key] = deserialize(returnCustomFunction.arguments[key])  
                } else {
                  throw new Error(`Invalid statement in: ${key} = ${returnCustomFunction.arguments[key]}`)
                }
              }
            })
          }
          return returnCustomFunction;
        case "FilterFunction":
            const returnFilterFunction: IFilterFunction = new FilterFunction(jsonO);
            returnFilterFunction.customFunction = deserialize(returnFilterFunction.customFunction);
            if (returnFilterFunction.oDataFilter) {
              returnFilterFunction.oDataFilter = deserialize(returnFilterFunction.oDataFilter)
            }
            return returnFilterFunction;
        default:
          throw new Error("not implemented: " + JSON.stringify(jsonO));
    }
  }
  return jsonO;
}