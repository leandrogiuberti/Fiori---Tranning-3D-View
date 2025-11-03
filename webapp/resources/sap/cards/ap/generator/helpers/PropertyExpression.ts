/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
import Log from "sap/base/Log";
import BindingParser from "sap/ui/base/BindingParser";
import { CardManifest } from "sap/ui/integration/widgets/Card";
import JSONModel from "sap/ui/model/json/JSONModel";
import { ArrangementOptions } from "../app/controls/ArrangementsEditor";
import { getFormatterConfiguration } from "../config/FormatterOptions";
import { extractValueWithoutBooleanExprBinding, getDialogModel, hasBooleanBindingExpression } from "../utils/CommonUtils";
import type { FormatterConfiguration, FormatterConfigurationMap } from "./Formatter";
import { createFormatterExpression } from "./Formatter";

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
export function isExpression(propertyValue = ""): boolean {
	return propertyValue.startsWith("{");
}

/**
 * This function checks if the property value is an i18n expression
 *
 * @param {string} propertyValue
 * @returns {boolean}
 */
export function isI18nExpression(propertyValue = ""): boolean {
	return propertyValue.startsWith("{{") && propertyValue.endsWith("}}");
}

/**
 * The function checks if the property value has a formatter
 *
 * @param propertyValue
 * @returns
 */
export function hasFormatter(propertyValue = ""): boolean {
	return (
		propertyValue.startsWith("{=") &&
		propertyValue.endsWith("}") &&
		(propertyValue.includes("format.") || propertyValue.includes("extension.formatters."))
	);
}

/**
 * format the value based on the formatter configuration
 * @param {string} propertyName
 * @param {FormatterConfigurationMap} propertyValueFormatters
 * @returns
 */
function formatValue(propertyName: string, propertyValueFormatters: FormatterConfigurationMap = []) {
	const oMatchedFormatterDetail = propertyValueFormatters.find(function (oFormatterDetail: FormatterConfiguration) {
		return oFormatterDetail.property === propertyName || "{" + oFormatterDetail.property + "}" === propertyName;
	});

	if (oMatchedFormatterDetail) {
		return createFormatterExpression(oMatchedFormatterDetail);
	}
	return propertyName;
}

/**
 * Apply text arrangement, UOM and formatter to the property
 * @param {string} propertyName
 * @param {PropertyFormattingOptions} options
 * @returns {string}
 */
export function getArrangements(propertyName: string, options: PropertyFormattingOptions) {
	const model = getDialogModel() as JSONModel;
	const isPropertyBoolean = isBooleanProperty(model, propertyName);
	const { unitOfMeasures, textArrangements, propertyValueFormatters } = options;
	const propertyHasBinding = propertyName.startsWith("{");
	propertyName = propertyName.replace(/[{}]/g, "");

	const matchedUomObj = unitOfMeasures.find(function (arrangement: any) {
		return arrangement.name === propertyName;
	});
	let matchedUOMName = matchedUomObj?.value?.replace(/[{}]/g, "");
	const matchedArrangementObj = textArrangements.find((arrangement) => {
		if (arrangement.value && arrangement.textArrangement) {
			return arrangement.name === propertyName;
		}
	});
	let matchedArrangementName = matchedArrangementObj?.value?.replace(/[{}]/g, "");

	let propertyHasFormatter = false;
	let matchedUOMHasFormatter = false;
	let matchedArrangementHasFormatter = false;
	const property = propertyName;
	propertyName = propertyName && formatValue(propertyName, propertyValueFormatters);
	if (propertyName !== property) {
		propertyHasFormatter = true;
	}

	const matchedUOM = matchedUomObj && formatValue(matchedUOMName ?? "", propertyValueFormatters);
	if (matchedUOMName !== matchedUOM) {
		matchedUOMHasFormatter = true;
	}
	const matchedArrangement = matchedArrangementName && formatValue(matchedArrangementName, propertyValueFormatters);
	if (matchedArrangementName !== matchedArrangement) {
		matchedArrangementHasFormatter = true;
	}

	let updatedVal = "";
	const isArrangementBoolean = isBooleanProperty(model, matchedArrangementName ?? "");
	const isUoMBoolean = isBooleanProperty(model, matchedUOMName ?? "");

	if (matchedArrangementObj || (matchedUomObj && matchedUOMName)) {
		if (isPropertyBoolean) {
			propertyName = getExpressionBindingForBooleanTypes(propertyName).slice(1, -1);
		}
		if (isArrangementBoolean) {
			matchedArrangementName = getExpressionBindingForBooleanTypes(matchedArrangementName ?? "").slice(1, -1);
		}
		if (isUoMBoolean) {
			matchedUOMName = getExpressionBindingForBooleanTypes(matchedUOMName ?? "").slice(1, -1);
		}
	}

	if (matchedUomObj && matchedArrangementObj) {
		switch (matchedArrangementObj.textArrangement) {
			case "TextLast":
				updatedVal += propertyHasFormatter ? `{= ${propertyName}}` : `{${propertyName}}`;
				updatedVal += matchedUOMHasFormatter ? ` {= ${matchedUOM}}` : ` {${matchedUOMName}}`;
				updatedVal = getFormattedValue(updatedVal, propertyHasFormatter, matchedUOMHasFormatter, isUoMBoolean);
				updatedVal += matchedArrangementHasFormatter ? ` ({= ${matchedArrangement}})` : ` ({${matchedArrangementName}})`;
				break;
			case "TextFirst":
				updatedVal = matchedArrangementHasFormatter ? `{= ${matchedArrangement}} (` : `{${matchedArrangementName}} (`;
				updatedVal += propertyHasFormatter ? `{= ${propertyName}}` : `{${propertyName}}`;
				updatedVal += matchedUOMHasFormatter ? ` {= ${matchedUOM}}` : ` {${matchedUOMName}}`;
				const index = updatedVal.indexOf(" (");
				const formattedValue = getFormattedValue(
					updatedVal.slice(index + 2),
					propertyHasFormatter,
					matchedUOMHasFormatter,
					isUoMBoolean
				);
				updatedVal = updatedVal.slice(0, index + 2) + formattedValue;
				updatedVal += ")";
				break;
			case "TextSeparate":
				updatedVal += propertyHasFormatter ? `{= ${propertyName}}` : `{${propertyName}}`;
				updatedVal += matchedUOMHasFormatter ? ` {= ${matchedUOM}}` : ` {${matchedUOMName}}`;
				updatedVal = getFormattedValue(updatedVal, propertyHasFormatter, matchedUOMHasFormatter, isUoMBoolean);
				break;
			case "TextOnly":
				updatedVal += matchedArrangementHasFormatter ? `{= ${matchedArrangement}}` : `{${matchedArrangementName}}`;
				break;
			default:
				break;
		}
		return updatedVal;
	} else if (matchedUomObj && matchedUOMName) {
		updatedVal = propertyHasFormatter ? `{= ${propertyName}}` : `{${propertyName}}`;
		if (!matchedUOM?.startsWith("format.unit(")) {
			updatedVal += matchedUOMHasFormatter ? ` {= ${matchedUOM}}` : ` {${matchedUOMName}}`;
		}
		return getFormattedValue(updatedVal, propertyHasFormatter, matchedUOMHasFormatter, isUoMBoolean);
	} else if (matchedArrangementObj) {
		switch (matchedArrangementObj.textArrangement) {
			case "TextLast":
				updatedVal += propertyHasFormatter ? `{= ${propertyName}}` : `{${propertyName}}`;
				updatedVal += matchedArrangementHasFormatter ? ` ({= ${matchedArrangement}})` : ` ({${matchedArrangementName}})`;
				break;
			case "TextFirst":
				updatedVal = matchedArrangementHasFormatter ? `{= ${matchedArrangement}}` : `{${matchedArrangementName}}`;
				updatedVal += propertyHasFormatter ? ` ({= ${propertyName}})` : ` ({${propertyName}})`;
				break;
			case "TextSeparate":
				updatedVal += propertyHasFormatter ? `{= ${propertyName}}` : `{${propertyName}}`;
				break;
			case "TextOnly":
				updatedVal = matchedArrangementHasFormatter ? `{= ${matchedArrangement}}` : `{${matchedArrangementName}}`;
				break;
			default:
				break;
		}
		return updatedVal;
	}
	if (isPropertyBoolean) {
		return getExpressionBindingForBooleanTypes(propertyName);
	}

	return propertyHasBinding ? (propertyHasFormatter ? `{= ${propertyName}}` : `{${propertyName}}`) : propertyName;
}

/**
 * This function checks if the property is boolean type
 *
 * @param {JSONModel} model
 * @param {string} propertyName
 * @returns {boolean}
 */

function isBooleanProperty(model: JSONModel, propertyName: string) {
	const properties = model?.getProperty("/configuration/properties");
	propertyName = propertyName.replace(/[{}]/g, "");
	const getProperty = (properties, name: string) => {
		return properties?.find((property) => property.name === name);
	};
	const property = getProperty(properties, propertyName);
	if (property) {
		return property.type === "Edm.Boolean";
	}

	if (propertyName.includes("/")) {
		const propertyParts = propertyName.split("/");
		const selectedNavProperty = propertyParts[0];
		const selectedProperty = propertyParts[1];
		const navigationalProperties = model?.getProperty("/configuration/navigationProperty");
		const selectedNavPropertyObj = getProperty(navigationalProperties, selectedNavProperty);
		const propertiesOfNavProperty = selectedNavPropertyObj?.properties;

		if (propertiesOfNavProperty && Array.isArray(propertiesOfNavProperty)) {
			const selectedPropertyObj = getProperty(propertiesOfNavProperty, selectedProperty);
			return selectedPropertyObj.type === "Edm.Boolean";
		}
	}
	return false;
}

/**
 * This function returns the binding expression for boolean type
 *
 * @param {string} propertyName
 * @returns {string}
 */
export function getExpressionBindingForBooleanTypes(propertyName: string) {
	const expressionBinding = `{= \${${propertyName}} === true ? '{{parameters._yesText}}' : '{{parameters._noText}}'}`;
	return expressionBinding;
}

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

function getFormattedValue(updatedVal: string, propertyHasFormatter: boolean, matchedUOMHasFormatter: boolean, isUoMBoolean: boolean) {
	const parts = isUoMBoolean ? updatedVal.split(" {= ") : updatedVal.split(" ");
	let property = "",
		uom = "";
	if (parts.length === 2) {
		property = parts[0];
		uom = parts[1];
	}

	if (propertyHasFormatter) {
		const formatFloat = updatedVal.startsWith("{= format.float(");
		const formatUnit = updatedVal.startsWith("{= format.unit(");

		if ((formatFloat || formatUnit) && !matchedUOMHasFormatter) {
			const index = updatedVal.indexOf("} {");
			let part1 = updatedVal.slice(0, index + 1);
			let part2 = updatedVal.slice(index + 2);
			if (isUoMBoolean) {
				part2 = part2.slice(4, -1);
			}
			part1 = part1.replace("format.float(", "format.unit(");

			const parts = part1.split(", ");
			if (parts.length === 2) {
				return formatFloat ? part1.replace(", {", ", $" + part2 + ", {") : parts[0].concat(", $" + part2 + ")}");
			} else if (parts.length === 3) {
				return part2 ? parts[0].concat(", $" + part2 + ", ").concat(parts[2]) : part1;
			}
			return updatedVal;
		}
		return updatedVal;
	}

	if (isUoMBoolean) {
		return "{= format.unit($" + property + ", " + uom.slice(0, -1) + ")}";
	} else {
		return "{= format.unit($" + property + ", $" + uom + ")}";
	}
}

/**
 * Extracts the property path without unit of measure
 * 	 - The property is in the format {propertyPath} {uomPath}
 *
 * @param property
 * @returns {string}
 */
export function extractPathWithoutUOM(property: string) {
	return extractPathExpressionWithoutUOM(property).replace(/[{}]/g, ""); // Remove curly braces
}

/**
 * Extracts the property path expression without unit of measure
 * 	 - The property is in the format {propertyPath} {uomPath}
 *
 * @param property
 * @returns {string}
 */
export function extractPathExpressionWithoutUOM(property: string) {
	const hasUOM = property.includes("} {");
	return hasUOM ? property.substring(0, property.indexOf("} {") + 1) : property;
}

/**
 * Extracts parts of an expression
 *
 * @param expression
 * @returns {string[]}
 */
export function getExpressionParts(expression: string) {
	const startSymbols = ["{=", "{", "(", "${"];
	const endSymbols = ["}", ")"];
	const parts = [];
	let count = 0,
		part = "",
		skipNext = false;

	for (let i = 0; i < expression.length; i++) {
		if (skipNext) {
			skipNext = false;
			continue;
		}

		if (startSymbols.includes(expression[i])) {
			if (expression[i] === "{" && expression[i + 1] === "=") {
				part += "{=";
				skipNext = true;
			} else {
				part += expression[i];
			}
			count++;
		} else if (endSymbols.includes(expression[i])) {
			part += expression[i];
			count--;
		} else {
			part += expression[i];
		}

		if (count === 0) {
			if (part.trim().length !== 0) {
				parts.push(part);
			}

			part = "";
		}
	}
	return parts;
}

/**
 * Extracts the property path and formatter expression without text arrangement
 *
 * @param expression
 * @param mCardManifest
 *
 * @returns { propertyPath: string, formatterExpression: string[]}
 */
export function extractPropertyConfigurationWithoutTextArrangement(expression: string, mCardManifest: CardManifest) {
	const textArrangementOptions: Array<ArrangementOptions> = getTextArrangementFromCardManifest(mCardManifest);
	const parts = getExpressionParts(expression);
	let textArrangementIndex = -1;
	const propertyPaths: string[] = [];
	const formatterExpression: string[] = [];

	parts.forEach((part, index) => {
		const hasTextArrangement = part.trim().startsWith("(") && part.trim().endsWith(")");

		if (hasTextArrangement) {
			textArrangementIndex = index;
			const hasFormatterBinding = hasFormatter(part.slice(1, -1));

			if (hasFormatterBinding) {
				formatterExpression.push(part.slice(1, -1));
			}
			part = hasFormatterBinding ? parseFormatterExpression(part.slice(1, -1)).propertyPath : part.slice(1, -1);
			part = "({" + part + "})";
		} else if (hasFormatter(part)) {
			formatterExpression.push(part);
			part = "{" + parseFormatterExpression(part).propertyPath + "}";
		}
		propertyPaths.push(part);
	});

	if (textArrangementIndex > -1) {
		let remainingExpression = propertyPaths
			.slice(0, textArrangementIndex)
			.concat(propertyPaths.slice(textArrangementIndex + 1))
			.join(" ");
		const textArrangement = propertyPaths.slice(textArrangementIndex, textArrangementIndex + 1)[0];
		let textArrangementProperty = "";
		if (hasBooleanBindingExpression(textArrangement)) {
			textArrangementProperty = extractValueWithoutBooleanExprBinding(textArrangement);
		} else {
			textArrangementProperty = textArrangement.trim().replace(/[({})]/g, "");
		}
		const prop = textArrangementOptions.find((option) => textArrangementProperty === option.name);
		if (prop && prop.arrangementType === "TextFirst") {
			remainingExpression = remainingExpression.replace(prop.value, prop.name);
		}
		return {
			propertyPath: remainingExpression,
			formatterExpression
		};
	} else {
		const propertyPathWithoutUOM = extractPathWithoutUOM(expression);
		const matchedTextArrangement = textArrangementOptions.find((option) => propertyPathWithoutUOM === option.value);
		if (matchedTextArrangement && matchedTextArrangement.arrangementType === "TextOnly") {
			return {
				propertyPath: `{${matchedTextArrangement.name}}`,
				formatterExpression
			};
		}
	}

	return {
		propertyPath: expression,
		formatterExpression
	};
}

/**
 *  Resolves the property path with expression to simple property path
 * 	- If path is an expression, resolve the expression then return the path
 *  - If path is an expression with formatter, return the path after extracting the formatter
 * @param path
 * @param mCardManifest
 * @returns
 */
export function resolvePropertyPathFromExpression(path = "", mCardManifest: CardManifest) {
	let { propertyPath } = extractPropertyConfigurationWithoutTextArrangement(path, mCardManifest);
	const hasBinding = isExpression(path) || hasFormatter(path);

	if (hasBooleanBindingExpression(propertyPath)) {
		propertyPath = extractValueWithoutBooleanExprBinding(propertyPath);
	}

	if (isExpression(propertyPath) && !hasFormatter(propertyPath)) {
		propertyPath = extractPathWithoutUOM(propertyPath);
	}

	if (isExpression(propertyPath) && hasFormatter(propertyPath)) {
		const formatterExpression = extractPathExpressionWithoutUOM(propertyPath);
		const selectedFormatter = updateAndGetSelectedFormatters(formatterExpression);
		propertyPath = selectedFormatter.property || "";
	}

	return hasBinding ? `{${propertyPath}}` : propertyPath;
}

export function getTextArrangementFromCardManifest(mManifest: CardManifest) {
	const textArrangements = mManifest["sap.card"].configuration?.parameters?._propertyFormatting as object | undefined;

	if (!textArrangements) {
		return [];
	}

	const textArrangementOptions: Array<ArrangementOptions> = [];
	Object.keys(textArrangements).forEach((property) => {
		const arrangement = textArrangements[property].arrangements.text;
		const arrangementType = Object.keys(arrangement).find((key) => arrangement[key]) || "TextLast";
		let path = arrangement.path;
		let isNavigationForId = false;
		let isNavigationForDescription = false;
		let propertyKeyForId = "";
		let navigationKeyForId = "";
		let navigationKeyForDescription = "";
		if (property.includes("/")) {
			propertyKeyForId = property.split("/")[0];
			navigationKeyForId = property.split("/")[1];
			isNavigationForId = true;
		}
		if (path?.includes("/")) {
			path = arrangement.path.split("/")[0];
			navigationKeyForDescription = arrangement.path.split("/")[1];
			isNavigationForDescription = true;
		}
		textArrangementOptions.push({
			name: property,
			arrangementType,
			value: arrangement.path,
			propertyKeyForDescription: path,
			propertyKeyForId: property.includes("/") ? propertyKeyForId : property,
			textArrangement: arrangementType,
			isNavigationForId,
			isNavigationForDescription,
			navigationKeyForId,
			navigationKeyForDescription,
			navigationalPropertiesForDescription: [],
			navigationalPropertiesForId: []
		});
	});
	return textArrangementOptions;
}

/**
 * Parses the formatter expression and returns the formatter name, property path and parameters
 *
 * @param path
 * @returns
 */
export function parseFormatterExpression(path = ""): ParsedFormatterExpression {
	const formatterOptions = getFormatterConfiguration();
	const formatterName = path.split("{=")[1]?.split("(")[0]?.trim();

	if (!formatterName) {
		return {
			formatterName: "",
			propertyPath: "",
			parameters: []
		};
	}

	const selectedFormatter = formatterOptions.find((formatter) => formatter.formatterName === formatterName);
	const bindingInfo = BindingParser.complexParser(path);
	const propertyPath: string = bindingInfo?.parts[0].path;
	const propertyExpression = "${" + propertyPath + "}";
	const parameters: Array<FormatterConfigParameters> = [];

	let bindingPartial = path;
	bindingPartial = path.trim().replace("{=", "");
	bindingPartial = bindingPartial.substring(0, bindingPartial.lastIndexOf("}"));
	bindingPartial = bindingPartial.replace(`${formatterName}(`, "");
	bindingPartial = bindingPartial.substring(0, bindingPartial.lastIndexOf(")"));

	let parametersExpression = bindingPartial.replace(`${propertyExpression}`, "").trim();
	const hasParameters = parametersExpression.length > 0;

	if (hasParameters) {
		const formatterParameters = selectedFormatter?.parameters || [];
		for (const parameter of formatterParameters) {
			if (parameter.type === "object") {
				const startIndex = parametersExpression.indexOf("{");
				const endIndex = parametersExpression.indexOf("}");
				const options = parametersExpression.substring(startIndex, endIndex + 1);
				parametersExpression = parametersExpression.substring(endIndex + 1);
				try {
					parameters.push(JSON.parse(options) as JSONObject);
				} catch {
					Log.error("Error in parsing the formatter options");
				}
			}
			if (parameter.type === "string") {
				const startIndex = parametersExpression.indexOf(",");
				parametersExpression = parametersExpression.substring(startIndex + 1);
				let endIndex = parametersExpression.indexOf(",");
				let options;
				if (endIndex !== -1) {
					options = parametersExpression.substring(0, endIndex).trim();
				} else {
					endIndex = parametersExpression.indexOf("}");
					options = parametersExpression.substring(0, endIndex + 1).trim();
				}
				parametersExpression = parametersExpression.substring(endIndex + 1);
				parameters.push(options.replace(/['"]+/g, ""));
			}
		}
	}

	return {
		formatterName,
		propertyPath,
		parameters
	};
}

/**
 * Updates the selected formatter with received parameters and returns the updated formatter
 *
 * @param propertyPath
 * @returns
 */
export function updateAndGetSelectedFormatters(propertyPath: string): FormatterConfiguration {
	const formatterOptions = getFormatterConfiguration();
	const formatterConfig = parseFormatterExpression(propertyPath);
	const selectedFormatter = {
		...formatterOptions.find((options) => options.formatterName === formatterConfig.formatterName)
	} as FormatterConfiguration;
	selectedFormatter.property = formatterConfig.propertyPath;

	if (!selectedFormatter.parameters?.length) {
		return selectedFormatter;
	}

	const parametersLength = selectedFormatter.parameters.length;
	for (let i = 0; i < parametersLength; i++) {
		const formatterConfigParameters = formatterConfig.parameters;
		if (selectedFormatter.parameters[i].type === "object" && typeof formatterConfigParameters[i] === "object") {
			updatePropertiesForObjectType(selectedFormatter, formatterConfigParameters, i);
		}

		if (selectedFormatter.parameters[i].type === "string" && typeof formatterConfigParameters[i] === "string") {
			selectedFormatter.parameters[i].value = formatterConfigParameters[i];
		}
	}

	return selectedFormatter;
}

/**
 *  Updates the properties for the object type parameters
 *
 * @param selectedFormatter
 * @param formatterConfigParameters
 * @param index
 */
function updatePropertiesForObjectType(
	selectedFormatter: FormatterConfiguration,
	formatterConfigParameters: Array<FormatterConfigParameters>,
	index: number
) {
	const properties = selectedFormatter!.parameters![index].properties;

	properties?.forEach((property) => {
		if (property.type === "boolean") {
			property["selected"] = (formatterConfigParameters[index] as JSONObject)[property.name] as boolean;
		} else if (property.type === "enum") {
			property["selectedKey"] = (formatterConfigParameters[index] as JSONObject)[property.name] as string;
		} else {
			property["value"] =
				typeof formatterConfigParameters === "object"
					? ((formatterConfigParameters[index] as JSONObject)[property.name] as string)
					: formatterConfigParameters[index];
		}
	});
}
