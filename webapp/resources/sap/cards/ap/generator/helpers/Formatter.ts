/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
type SupportedPropertyTypes = "boolean" | "number" | "enum" | "string" | "object";
export type SingleFormatterProperty = {
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

export type SingleFormatterParameter = {
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

export type FormatterConfiguration = {
	property?: string;
	formatterName: string;
	displayName: string;
	parameters?: Array<SingleFormatterParameter>;
	type: string;
	visible: boolean;
};

export type FormatterConfigurationMap = Array<FormatterConfiguration>;

export type FormatterOption = string | boolean | number;
export type FormatterOptions = Record<string, FormatterOption>;

import ResourceBundle from "sap/base/i18n/ResourceBundle";
import { date, dateTime } from "sap/ui/integration/formatters/DateTimeFormatter";
import type { PropertyInfo, PropertyInfoMap } from "../odata/ODataTypes";
import { checkForDateType } from "../utils/CommonUtils";
import { getYesAndNoTextValues } from "./I18nHelper";

/**
 * Processes the formatter properties and adds them to the formatter options object.
 *
 * @param {SingleFormatterProperty[]} properties - The array of properties to process.
 * @param {FormatterOptions} formatterOptions - The object to which the processed property values will be added.
 */

export const formatPropertyDropdownValues = function (property: PropertyInfo, value: string) {
	const type = property.type;
	const { yesText, noText } = getYesAndNoTextValues();
	switch (type) {
		case "Edm.Boolean":
			value = value ? yesText : noText;
			break;
		case "Edm.Date":
		case "Edm.DateTime":
			value = date(value, { UTC: true });
			break;
		case "Edm.DateTimeOffset":
			value = dateTime(value, { UTC: true });
			break;
		case "Edm.DateTimeInterval":
		case "Edm.Time":
			break;
		case "Edm.String":
			if (value?.length === 0) {
				value = "<empty>";
			}
			break;
		case "Edm.Integer":
		case "Edm.Float":
			break;
		default:
			break;
	}
	return `${property.label} (${value})`;
};

/**
 * Processes the formatter properties and adds them to the formatter options object.
 *
 * @param {SingleFormatterProperty[]} properties - The array of properties to process.
 * @param {FormatterOptions} formatterOptions - The object to which the processed property values will be added.
 */
export function processProperties(properties: SingleFormatterProperty[], formatterOptions: FormatterOptions) {
	properties.forEach(function (property) {
		switch (property.type) {
			case "boolean":
				if (!property.selected) {
					property.selected = false;
				}
				formatterOptions[property.name] = property.selected;
				break;
			case "number":
				if (typeof property.value === "number") {
					formatterOptions[property.name] = parseFloat(property.value);
				}
				break;
			case "enum":
				if (property.selectedKey) {
					formatterOptions[property.name] = property.selectedKey;
				}
				break;
			default:
				formatterOptions[property.name] = property.value ?? "";
				break;
		}
	});
}

/**
 * Processes the formatter parameters and adds them to the formatter arguments array.
 *
 * @param {SingleFormatterParameter} parameters - The parameter object to process.
 * @param {FormatterOption[]} formatterArguments - The array to which the processed parameter values will be added.
 */
export function processParameters(parameters: SingleFormatterParameter, formatterArguments: FormatterOption[]) {
	switch (parameters.type) {
		case "boolean":
			if (!parameters.selected) {
				parameters.selected = false;
			}
			formatterArguments.push(parameters.selected);
			break;
		case "number":
			const parameterValue = parameters.value;
			if (parameterValue) {
				formatterArguments.push(parseFloat(parameterValue));
			}
			break;
		case "enum":
			formatterArguments.push(parameters.selectedKey as string);
			break;
		default:
			formatterArguments.push(parameters.value as string);
			break;
	}
}

/**
 * Formats the formatter arguments into a string suitable for a formatter expression.
 *
 *
 * @param {FormatterOption[]} formatterArguments - The array of formatter arguments to format.
 * @returns {string} The formatted arguments as a single string.
 */
function formatArguments(formatterArguments: FormatterOption[]): string {
	let content = formatterArguments[0] as string;

	for (let i = 1; i < formatterArguments.length; i++) {
		const formatter = formatterArguments[i];
		const bindingOrFormatterArray = ["{", "[", "$"];
		const hasBindingOrFormatter = bindingOrFormatterArray.some((item) => (formatter as string).startsWith(item));
		if (typeof formatter === "string" && !hasBindingOrFormatter) {
			content = content.concat(", '" + formatter + "' ");
		} else {
			content = content.concat(", " + formatter);
		}
	}

	return content;
}

/**
 * Creates a formatter expression based on the provided formatter configuration by processing the properties and parameters.
 *
 *
 * @param {FormatterConfiguration} formatterConfig - The configuration object for the formatter.
 * @returns {string} The generated formatter expression.
 */
export const createFormatterExpression = function (formatterConfig: FormatterConfiguration): string {
	const formatterArguments: FormatterOption[] = [];
	formatterArguments.push("${" + formatterConfig.property + "}");
	let content = formatterConfig.formatterName + "("; // dont close brackets here

	const formatterOptions: FormatterOptions = {};
	formatterConfig.parameters?.forEach(function (mParameters) {
		const properties = mParameters.properties;
		if (properties && properties.length > 0) {
			processProperties(properties, formatterOptions);
			if (JSON.stringify(formatterOptions) !== "{}") {
				formatterArguments.push(JSON.stringify(formatterOptions));
			}
		} else {
			processParameters(mParameters, formatterArguments);
		}
	});
	content = content.concat(formatArguments(formatterArguments));
	return content + ")";
};

/**
 * Generates the default property formatter configuration for date properties.
 *
 * @param {ResourceBundle} i18nModel - The internationalization model used for localization.
 * @param {PropertyInfoMap} properties - The map of property information.
 * @returns {FormatterConfigurationMap} - The configuration map for date formatters.
 */
export const getDefaultPropertyFormatterConfig = function (
	i18nModel: ResourceBundle,
	properties: PropertyInfoMap
): FormatterConfigurationMap {
	const dateFormatterConfig: FormatterConfigurationMap = [];
	for (const property of properties) {
		const isPropertyTypeDate = checkForDateType(property.type);
		if (property.name && isPropertyTypeDate) {
			const configData = getDateFormatterConfiguration(property.name, property.type, i18nModel) as FormatterConfiguration;
			dateFormatterConfig.push(configData);
		}
	}
	return dateFormatterConfig;
};

/**
 * Generates the default property formatter configuration for navigation properties.
 *
 * @param {ResourceBundle} i18nModel - The internationalization model used for localization.
 * @param {PropertyInfoMap} navProperties - The map of navigation properties.
 * @returns {FormatterConfigurationMap} The formatter configuration map for date properties.
 */
export const getDefaultPropertyFormatterConfigForNavProperties = function (
	i18nModel: ResourceBundle,
	navProperties: PropertyInfoMap
): FormatterConfigurationMap {
	const dateFormatterConfig: FormatterConfigurationMap = [];
	for (const navProperty of navProperties) {
		const properties = (navProperty.properties as PropertyInfoMap) || [];
		for (const property of properties) {
			const propertyName = navProperty.name + "/" + property.name;
			const isPropertyTypeDate = checkForDateType(property.type);
			if (propertyName && isPropertyTypeDate) {
				const configData = getDateFormatterConfiguration(propertyName, property.type, i18nModel) as FormatterConfiguration;
				dateFormatterConfig.push(configData);
			}
		}
	}
	return dateFormatterConfig;
};

/**
 * Generates configuration data for a given property based on its type.
 *
 * @param {string} propertyName - The name of the property.
 * @param {string} propertyType - The type of the property (e.g., "Edm.DateTimeOffset", "Edm.DateTime", "Edm.Date").
 * @param {ResourceBundle} i18nModel - The internationalization model used to get localized text.
 * @returns {FormatterConfiguration} The configuration data for the specified property.
 */
function getDateFormatterConfiguration(propertyName: string, propertyType: string, i18nModel: ResourceBundle) {
	if (propertyType === "Edm.DateTimeOffset") {
		const configData: FormatterConfiguration = {
			property: propertyName,
			formatterName: "format.dateTime",
			displayName: i18nModel.getText("FORMAT_DATETIME") ?? "",
			parameters: [
				{
					name: "options",
					displayName: "Options",
					type: "object",
					defaultValue: "",
					properties: [
						{
							name: "relative",
							displayName: i18nModel.getText("RELATIVE") ?? "",
							type: "boolean",
							defaultValue: false
						},
						{
							name: "UTC",
							displayName: i18nModel.getText("UTC") ?? "",
							type: "boolean",
							defaultValue: false,
							selected: true
						}
					]
				}
			],
			type: "Date",
			visible: true
		};
		return configData;
	} else if (propertyType === "Edm.DateTime" || propertyType === "Edm.Date") {
		const configData: FormatterConfiguration = {
			property: propertyName,
			formatterName: "format.date",
			displayName: i18nModel.getText("FORMAT_DATE") ?? "",
			parameters: [
				{
					name: "options",
					displayName: "Options",
					type: "object",
					defaultValue: "",
					properties: [
						{
							name: "UTC",
							displayName: i18nModel.getText("UTC") ?? "",
							type: "boolean",
							defaultValue: false,
							selected: true
						}
					]
				}
			],
			type: "Date",
			visible: true
		};
		return configData;
	}
}
