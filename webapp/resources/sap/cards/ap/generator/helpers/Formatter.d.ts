/// <reference types="openui5" />
declare module "sap/cards/ap/generator/helpers/Formatter" {
    /*!
     * SAP UI development toolkit for HTML5 (SAPUI5)
     *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
     */
    type SupportedPropertyTypes = "boolean" | "number" | "enum" | "string" | "object";
    type SingleFormatterProperty = {
        name: string;
        displayName: string;
        type: SupportedPropertyTypes;
        defaultValue?: boolean | number | string;
        selected?: boolean;
        value?: string;
        selectedKey?: string;
        defaultSelectedKey?: string;
        bIsProperty?: boolean;
        options?: Array<{
            name: string;
            value: string;
        }>;
    };
    type SingleFormatterParameter = {
        name: string;
        displayName: string;
        type: SupportedPropertyTypes;
        defaultValue?: string;
        value?: string;
        selectedKey?: string;
        selected?: boolean;
        properties?: Array<SingleFormatterProperty>;
        defaultSelectedKey?: string;
        options?: Array<{
            name: string;
            value: string;
        }>;
    };
    type FormatterConfiguration = {
        property?: string;
        formatterName: string;
        displayName: string;
        parameters?: Array<SingleFormatterParameter>;
        type: string;
        visible: boolean;
    };
    type FormatterConfigurationMap = Array<FormatterConfiguration>;
    type FormatterOption = string | boolean | number;
    type FormatterOptions = Record<string, FormatterOption>;
    import ResourceBundle from "sap/base/i18n/ResourceBundle";
    import type { PropertyInfo, PropertyInfoMap } from "sap/cards/ap/generator/odata/ODataTypes";
    /**
     * Processes the formatter properties and adds them to the formatter options object.
     *
     * @param {SingleFormatterProperty[]} properties - The array of properties to process.
     * @param {FormatterOptions} formatterOptions - The object to which the processed property values will be added.
     */
    const formatPropertyDropdownValues: (property: PropertyInfo, value: string) => string;
    /**
     * Processes the formatter properties and adds them to the formatter options object.
     *
     * @param {SingleFormatterProperty[]} properties - The array of properties to process.
     * @param {FormatterOptions} formatterOptions - The object to which the processed property values will be added.
     */
    function processProperties(properties: SingleFormatterProperty[], formatterOptions: FormatterOptions): void;
    /**
     * Processes the formatter parameters and adds them to the formatter arguments array.
     *
     * @param {SingleFormatterParameter} parameters - The parameter object to process.
     * @param {FormatterOption[]} formatterArguments - The array to which the processed parameter values will be added.
     */
    function processParameters(parameters: SingleFormatterParameter, formatterArguments: FormatterOption[]): void;
    /**
     * Formats the formatter arguments into a string suitable for a formatter expression.
     *
     *
     * @param {FormatterOption[]} formatterArguments - The array of formatter arguments to format.
     * @returns {string} The formatted arguments as a single string.
     */
    function formatArguments(formatterArguments: FormatterOption[]): string;
    /**
     * Creates a formatter expression based on the provided formatter configuration by processing the properties and parameters.
     *
     *
     * @param {FormatterConfiguration} formatterConfig - The configuration object for the formatter.
     * @returns {string} The generated formatter expression.
     */
    const createFormatterExpression: (formatterConfig: FormatterConfiguration) => string;
    /**
     * Generates the default property formatter configuration for date properties.
     *
     * @param {ResourceBundle} i18nModel - The internationalization model used for localization.
     * @param {PropertyInfoMap} properties - The map of property information.
     * @returns {FormatterConfigurationMap} - The configuration map for date formatters.
     */
    const getDefaultPropertyFormatterConfig: (i18nModel: ResourceBundle, properties: PropertyInfoMap) => FormatterConfigurationMap;
    /**
     * Generates the default property formatter configuration for navigation properties.
     *
     * @param {ResourceBundle} i18nModel - The internationalization model used for localization.
     * @param {PropertyInfoMap} navProperties - The map of navigation properties.
     * @returns {FormatterConfigurationMap} The formatter configuration map for date properties.
     */
    const getDefaultPropertyFormatterConfigForNavProperties: (i18nModel: ResourceBundle, navProperties: PropertyInfoMap) => FormatterConfigurationMap;
    /**
     * Generates configuration data for a given property based on its type.
     *
     * @param {string} propertyName - The name of the property.
     * @param {string} propertyType - The type of the property (e.g., "Edm.DateTimeOffset", "Edm.DateTime", "Edm.Date").
     * @param {ResourceBundle} i18nModel - The internationalization model used to get localized text.
     * @returns {FormatterConfiguration} The configuration data for the specified property.
     */
    function getDateFormatterConfiguration(propertyName: string, propertyType: string, i18nModel: ResourceBundle): FormatterConfiguration;
}
//# sourceMappingURL=Formatter.d.ts.map