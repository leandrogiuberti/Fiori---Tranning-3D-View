declare module "sap/esh/search/ui/sinaNexTS/core/util" {
    import { SearchResultSet } from "sap/esh/search/ui/sinaNexTS/sina/SearchResultSet";
    import { SearchResultSetItemAttribute } from "sap/esh/search/ui/sinaNexTS/sina/SearchResultSetItemAttribute";
    import { SearchResultSetItemAttributeBase } from "sap/esh/search/ui/sinaNexTS/sina/SearchResultSetItemAttributeBase";
    import { SearchResultSetItemAttributeGroup } from "sap/esh/search/ui/sinaNexTS/sina/SearchResultSetItemAttributeGroup";
    function hasOwnProperty<X extends object, Y extends PropertyKey>(obj: X, prop: Y): obj is X & Record<Y, unknown>;
    function timeoutDecorator(originalFunction: any, timeout: number): (...args: any[]) => Promise<unknown>;
    function refuseOutdatedResponsesDecorator(originalFunction: any): {
        (...args: any[]): any;
        abort(): void;
    };
    function getUrlParameter(name: string, url?: string): null | string;
    function filterString(text: string, removeStrings: Array<string>): string;
    function generateTimestamp(): string;
    class DelayedConsumer {
        timeDelay: number;
        consumer: () => void;
        consumerContext: unknown;
        objects: Array<unknown>;
        constructor(properties: any);
        add(obj: any): void;
        consume(): void;
    }
    function dateToJson(date: Date): {
        type: string;
        value: string;
    };
    function dateFromJson(jsonDate: any): Date;
    function addPotentialNavTargets(resultSet: SearchResultSet): SearchResultSet;
    function addPotentialNavTargetsToAttribute(attribute: SearchResultSetItemAttributeBase): void;
    function addPotentialNavTargetsToAttributeGroup(attribute: SearchResultSetItemAttributeGroup): void;
    function addPotentialNavTargetsToAttributeSimple(attribute: SearchResultSetItemAttribute): void;
    function removePureAdvancedSearchFacets(resultSet: SearchResultSet): SearchResultSet;
    function isMapsAttribute(attribute: any, returnOnlyBool: boolean, i: number): boolean | unknown;
    function addGeoDataIfAvailable(itemData: any): any;
    function cacheDecorator(originalFunction: any): (id: any) => any;
    function escapeRegExp(str: string): string;
    function evaluateTemplate(template: string, obj: Record<string, string>): string;
    const extractRegExp: RegExp;
    function extractHighlightedTerms(text: string): Array<string>;
    function appendRemovingDuplicates(list1: any, list2: any): void;
    const reservedCharacters: string[];
    const reservedWords: string[];
    const reservedCharacters4FilterCondition: string[];
    function replaceAll(original: string, search: string, replacement: string): string;
    function escapeQuery(query: string): string;
    function escapeFilterCondition(query: string): string;
}
//# sourceMappingURL=util.d.ts.map