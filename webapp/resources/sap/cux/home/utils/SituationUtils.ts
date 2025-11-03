/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
import Formatting from "sap/base/i18n/Formatting";
import Log from "sap/base/Log";
import NavigationHandler from "sap/fe/navigation/NavigationHandler";
import SelectionVariant from "sap/fe/navigation/SelectionVariant";
import Component from "sap/ui/core/Component";
import DateFormat from "sap/ui/core/format/DateFormat";
import NumberFormat from "sap/ui/core/format/NumberFormat";
import ODataModel from "sap/ui/model/odata/v4/ODataModel";

export interface InstanceAttribute {
	SitnInstceKey: string;
	SitnInstceAttribName: string;
	SitnInstceAttribSource: string;
	SitnInstceAttribEntityType: string;
	_InstanceAttributeValue: InstanceAttributeValue[];
}

export interface InstanceAttributeValue {
	SitnInstceKey: string;
	SitnInstceAttribName: string;
	SitnInstceAttribSource: string;
	SitnInstceAttribValue: string;
}

export interface NavigationData {
	SitnInstanceID: string;
	SitnSemanticObject: string;
	SitnSemanticObjectAction: string;
	_NavigationParam: NavigationParam[];
}

interface NavigationParam {
	SituationNotifParamName: string;
	SituationNotifParameterVal: string;
}

let dateFormatter: DateFormat;
let decimalFormatter: NumberFormat;
let situationsModel!: ODataModel;

/**
 * Gets the date formatter instance using the medium date pattern.
 *
 * @returns {DateFormat} The date formatter instance.
 */
const _getDateFormatter = (): DateFormat => {
	if (!dateFormatter) {
		const datePattern = Formatting.getDatePattern("medium") || "dd/MM/yyyy";
		dateFormatter = DateFormat.getDateInstance({ pattern: datePattern });
	}

	return dateFormatter;
};

/**
 * Gets the number formatter instance using the settings retrieved from Configuration.
 *
 * @returns {NumberFormat} The number formatter instance.
 */
const _getNumberFormatter = (): NumberFormat => {
	if (!decimalFormatter) {
		decimalFormatter = NumberFormat.getFloatInstance({
			decimalSeparator: Formatting.getNumberSymbol("decimal") || ".",
			groupingSeparator: Formatting.getNumberSymbol("group") || ",",
			groupingEnabled: true
		});
	}

	return decimalFormatter;
};

/**
 * Compose the situation message by replacing placeholders with formatted parameter values.
 *
 * @private
 * @param {string} rawText - The raw text containing placeholders.
 * @param {InstanceAttribute[]} params - An array of parameters to replace in the text.
 * @returns {string} The composed text with replaced placeholders.
 */
export const getSituationMessage = (rawText: string, params: InstanceAttribute[] = []): string => {
	if (!rawText?.split) {
		return rawText;
	}

	let composedText = rawText.replaceAll("\n", " ");

	params.forEach((param) => {
		if (param.SitnInstceAttribName?.length > 0) {
			const attributeSource = `0${param.SitnInstceAttribSource}`;
			const paramName = `${attributeSource}.${param.SitnInstceAttribName}`;
			const matchedAttributes = param._InstanceAttributeValue.reduce(function (matchedAttributes, attribute) {
				if (
					attribute.SitnInstceAttribSource === param.SitnInstceAttribSource &&
					attribute.SitnInstceAttribName === param.SitnInstceAttribName
				) {
					matchedAttributes.push(attribute);
				}

				return matchedAttributes;
			}, [] as InstanceAttributeValue[]);

			const formattedValues: string[] = [];
			matchedAttributes.forEach((attributeMatched) => {
				let rawVal = attributeMatched?.SitnInstceAttribValue?.trim() || "";
				let formattedVal;

				switch (param.SitnInstceAttribEntityType) {
					case "Edm.DateTime":
						formattedVal = _getDateFormatter().format(_getDateFormatter().parse(rawVal));
						break;
					case "Edm.Decimal":
						// If the parameter string ends with a minus sign, move it to the first position
						if (rawVal.endsWith("-")) {
							rawVal = `-${rawVal.substring(0, rawVal.length - 1)}`;
						}
						formattedVal = _getNumberFormatter().format(Number(rawVal));
						break;
					default:
						formattedVal = rawVal;
				}

				formattedValues.push(formattedVal);
			});

			// Replace placeholders with formatted values
			composedText = composedText.split(`{${paramName}}`).join(formattedValues.join(", "));
		}
	});

	return composedText;
};

/**
 * Executes navigation based on provided data.
 *
 * @private
 * @param {NavigationData} oData - Data object containing navigation parameters.
 * @param {Component} ownerComponent - The owner component initiating the navigation.
 * @returns {Promise<void>} A promise that resolves or rejects based on the navigation result.
 */
export function executeNavigation(oData: NavigationData, ownerComponent: Component): Promise<void> {
	return new Promise((resolve, reject) => {
		//@ts-expect-error: params
		const navigationHandler = new NavigationHandler(ownerComponent);
		const oSelectionVariant = new SelectionVariant();
		oData._NavigationParam?.map(function (param) {
			if (param.SituationNotifParamName) {
				oSelectionVariant.addSelectOption(param.SituationNotifParamName, "I", "EQ", param.SituationNotifParameterVal);
			}
		});
		const sNavigationParameters = oSelectionVariant.toJSONString();
		navigationHandler.navigate(
			oData.SitnSemanticObject,
			oData.SitnSemanticObjectAction,
			sNavigationParameters,
			resolve,
			(error: unknown) => reject(error as Error)
		);
	});
}

/**
 * Fetches navigation target data based on the provided instance ID.
 *
 * @private
 * @async
 * @param {string} instanceId - The instance ID for which to fetch navigation data.
 * @param {string} situationEngineType - Situation Engine Type
 * @returns {Promise<NavigationData>} A promise that resolves with an object containing navigation data.
 */
export function fetchNavigationTargetData(instanceId: string, situationEngineType: string): Promise<NavigationData> | undefined {
	try {
		if (situationEngineType === "1") {
			const oContextBindingNavigation = _getSituationsModel().bindContext(`/Navigation/${instanceId}`, undefined, {
				$expand: { _NavigationParam: { $select: ["SituationNotifParamName", "SituationNotifParameterVal"] } },
				$select: ["SitnInstanceID", "SitnSemanticObject", "SitnSemanticObjectAction"]
			});
			return oContextBindingNavigation.requestObject();
		} else {
			return Promise.resolve({
				SitnInstanceID: instanceId,
				SitnSemanticObject: "SituationInstance",
				SitnSemanticObjectAction: "display",
				_NavigationParam: [
					{
						SituationNotifParamName: "ui-type",
						SituationNotifParameterVal: "extended"
					},
					{
						SituationNotifParamName: "SitnInstceKey",
						SituationNotifParameterVal: instanceId
					}
				]
			});
		}
	} catch (error: unknown) {
		Log.error(error instanceof Error ? error.message : "");
	}
}

/**
 * Retrieves the Situations model. If the model does not exist, it creates a new one.
 *
 * @private
 * @returns {ODataModel} The Situations model instance.
 */
function _getSituationsModel(): ODataModel {
	if (!situationsModel) {
		situationsModel = new ODataModel({
			serviceUrl: "/sap/opu/odata4/sap/a_sitn2mblinstce_v4/srvd/sap/a_sitn2mblinstce_srv/0002/"
		});
	}
	return situationsModel;
}
