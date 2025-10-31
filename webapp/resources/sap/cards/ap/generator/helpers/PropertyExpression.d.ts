/// <reference types="openui5" />
declare module "sap/cards/ap/generator/helpers/PropertyExpression" {
    import { CardManifest } from "sap/ui/integration/widgets/Card";
    import JSONModel from "sap/ui/model/json/JSONModel";
    import { ArrangementOptions } from "sap/cards/ap/generator/app/controls/ArrangementsEditor";
    import type { FormatterConfiguration, FormatterConfigurationMap } from "sap/cards/ap/generator/helpers/Formatter";
    type JSONObject = {
        [key: string]: string | boolean | number;
    };
    type FormatterConfigParameters = string | JSONObject;
    type ParsedFormatterExpression = {
        formatterName: string;
        propertyPath: string;
        parameters: Array<FormatterConfigParameters>;
    };
    type PropertyFormattingOptions = {
        unitOfMeasures: Array<{
            [key: string]: string;
        }>;
        textArrangements: ArrangementOptions[];
        propertyValueFormatters: FormatterConfigurationMap;
    };
    /**
     * This function checks if the property value is an expression
     *
     * @param {string} propertyValue
     * @returns {boolean}
     */
    function isExpression(propertyValue?: string): boolean;
    /**
     * This function checks if the property value is an i18n expression
     *
     * @param {string} propertyValue
     * @returns {boolean}
     */
    function isI18nExpression(propertyValue?: string): boolean;
    /**
     * The function checks if the property value has a formatter
     *
     * @param propertyValue
     * @returns
     */
    function hasFormatter(propertyValue?: string): boolean;
    /**
     * format the value based on the formatter configuration
     * @param {string} propertyName
     * @param {FormatterConfigurationMap} propertyValueFormatters
     * @returns
     */
    function formatValue(propertyName: string, propertyValueFormatters?: FormatterConfigurationMap): string;
    /**
     * Apply text arrangement, UOM and formatter to the property
     * @param {string} propertyName
     * @param {PropertyFormattingOptions} options
     * @returns {string}
     */
    function getArrangements(propertyName: string, options: PropertyFormattingOptions): string;
    /**
     * This function checks if the property is boolean type
     *
     * @param {JSONModel} model
     * @param {string} propertyName
     * @returns {boolean}
     */
    function isBooleanProperty(model: JSONModel, propertyName: string): boolean;
    /**
     * This function returns the binding expression for boolean type
     *
     * @param {string} propertyName
     * @returns {string}
     */
    function getExpressionBindingForBooleanTypes(propertyName: string): string;
    /**
     * Retrieves the formatted value based on the provided parameters.
     *
     * @param updatedVal - The updated value to be formatted.
     * @param propertyHasFormatter - A boolean indicating whether the property has a formatter.
     * @param matchedUOMHasFormatter - A boolean indicating whether the matched unit of measure has a formatter.
     * @param isUoMBoolean - A boolean indicating whether the Unit of Measure (UoM) is represented as a boolean expression.
     * @returns The formatted value as a binding string in the format '{= format.unit(${property}, ${uom})}'.
     *          1. When isUoMBoolean is true with formatter: '{= format.unit(${gross_amount}, ${Activation_ac} === true ? \'Yes\' : \'No\', {"decimals":1,"style":"long"})}'
     *          2. When isUoMBoolean is true without formatter: "{= format.unit(${LanguageForEdit}, ${HasDraftEntity} === true ? 'Yes' : 'No')}"
     */
    function getFormattedValue(updatedVal: string, propertyHasFormatter: boolean, matchedUOMHasFormatter: boolean, isUoMBoolean: boolean): string;
    /**
     * Extracts the property path without unit of measure
     * 	 - The property is in the format {propertyPath} {uomPath}
     *
     * @param property
     * @returns {string}
     */
    function extractPathWithoutUOM(property: string): string;
    /**
     * Extracts the property path expression without unit of measure
     * 	 - The property is in the format {propertyPath} {uomPath}
     *
     * @param property
     * @returns {string}
     */
    function extractPathExpressionWithoutUOM(property: string): string;
    /**
     * Extracts parts of an expression
     *
     * @param expression
     * @returns {string[]}
     */
    function getExpressionParts(expression: string): any[];
    /**
     * Extracts the property path and formatter expression without text arrangement
     *
     * @param expression
     * @param mCardManifest
     *
     * @returns { propertyPath: string, formatterExpression: string[]}
     */
    function extractPropertyConfigurationWithoutTextArrangement(expression: string, mCardManifest: CardManifest): {
        propertyPath: string;
        formatterExpression: string[];
    };
    /**
     *  Resolves the property path with expression to simple property path
     * 	- If path is an expression, resolve the expression then return the path
     *  - If path is an expression with formatter, return the path after extracting the formatter
     * @param path
     * @param mCardManifest
     * @returns
     */
    function resolvePropertyPathFromExpression(path: string, mCardManifest: CardManifest): string;
    function getTextArrangementFromCardManifest(mManifest: CardManifest): ArrangementOptions[];
    /**
     * Parses the formatter expression and returns the formatter name, property path and parameters
     *
     * @param path
     * @returns
     */
    function parseFormatterExpression(path?: string): ParsedFormatterExpression;
    /**
     * Updates the selected formatter with received parameters and returns the updated formatter
     *
     * @param propertyPath
     * @returns
     */
    function updateAndGetSelectedFormatters(propertyPath: string): FormatterConfiguration;
    /**
     *  Updates the properties for the object type parameters
     *
     * @param selectedFormatter
     * @param formatterConfigParameters
     * @param index
     */
    function updatePropertiesForObjectType(selectedFormatter: FormatterConfiguration, formatterConfigParameters: Array<FormatterConfigParameters>, index: number): void;
}
//# sourceMappingURL=PropertyExpression.d.ts.map