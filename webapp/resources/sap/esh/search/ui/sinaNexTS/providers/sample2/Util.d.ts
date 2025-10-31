declare module "sap/esh/search/ui/sinaNexTS/providers/sample2/Util" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { AttributeType } from "sap/esh/search/ui/sinaNexTS/sina/AttributeType";
    import { ComparisonOperator } from "sap/esh/search/ui/sinaNexTS/sina/ComparisonOperator";
    import { Value as RawValue } from "sap/esh/search/ui/sinaNexTS/sina/types";
    function readFile(path: string): Promise<string>;
    function isValuePairMatched(value1: RawValue, value2: RawValue, operator: ComparisonOperator, caseSensitive?: boolean): boolean;
    function createRegExp(value: string, operator: ComparisonOperator, caseSensitive?: boolean): RegExp;
    function getMatchedStringValues(stringValues: string[], searchTerm: string, caseSensitive?: boolean): string[];
    function formatRawValue(stringValue: string, type: AttributeType): RawValue;
    function formatHighlightedValue(stringValue: string, searchTerm: string): string;
    function format10Power(value: number, isCeil?: boolean): number;
    function isStarString(value: string): boolean;
    function isEmptyString(value: string): boolean;
}
//# sourceMappingURL=Util.d.ts.map