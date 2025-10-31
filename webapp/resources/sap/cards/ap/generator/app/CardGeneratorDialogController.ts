/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
import Log from "sap/base/Log";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import merge from "sap/base/util/merge";
import CompactFormatterSelection from "sap/cards/ap/generator/app/controls/CompactFormatterSelection";
import CriticalityEditor from "sap/cards/ap/generator/app/controls/CriticalityEditor";
import type { Model } from "sap/cards/ap/generator/odata/ODataTypes";
import * as ODataUtils from "sap/cards/ap/generator/odata/ODataUtils";
import type MenuBar from "sap/m/Bar";
import type ComboBox from "sap/m/ComboBox";
import type Dialog from "sap/m/Dialog";
import type Input from "sap/m/Input";
import MessageBox from "sap/m/MessageBox";
import MessageToast from "sap/m/MessageToast";
import type Popover from "sap/m/Popover";
import type ToggleButton from "sap/m/ToggleButton";
import Event from "sap/ui/base/Event";
import type Control from "sap/ui/core/Control";
import CoreElement from "sap/ui/core/Element";
import Fragment from "sap/ui/core/Fragment";
import Popup from "sap/ui/core/Popup";
import { ValueState } from "sap/ui/core/library";
import type Card from "sap/ui/integration/widgets/Card";
import type { CardManifest, ObjectContent } from "sap/ui/integration/widgets/Card";
import type Splitter from "sap/ui/layout/Splitter";
import JSONModel from "sap/ui/model/json/JSONModel";
import type ResourceModel from "sap/ui/model/resource/ResourceModel";
import jQuery from "sap/ui/thirdparty/jquery";
import type { Host } from "../config/PreviewOptions";
import { QueryParameters, createUrlParameters, updateManifestWithSelectQueryParams } from "../helpers/Batch";
import type { SideIndicatorOptions, TrendOptions, TrendOrIndicatorOptions } from "../helpers/CardGeneratorModel";
import { formatPropertyDropdownValues, type FormatterConfigurationMap } from "../helpers/Formatter";
import { createAndStoreGeneratedi18nKeys } from "../helpers/I18nHelper";
import {
	enhanceManifestWithConfigurationParameters,
	enhanceManifestWithInsights,
	getCurrentCardManifest,
	getPreviewItems,
	renderCardPreview,
	updateCardGroups
} from "../helpers/IntegrationCardHelper";
import { getArrangements, resolvePropertyPathFromExpression } from "../helpers/PropertyExpression";
import { transpileIntegrationCardToAdaptive } from "../helpers/Transpiler";
import { PropertyInfo, PropertyInfoMap, PropertyInfoType } from "../odata/ODataTypes";
import { Application } from "../pages/Application";
import type { GroupItem, NavigationParameter, NavigationalData, ObjectCardGroups, Property } from "../types/PropertyTypes";
import {
	checkForDateType,
	extractValueWithoutBooleanExprBinding,
	getCardGeneratorDialog,
	getDialogModel,
	hasBooleanBindingExpression,
	isBinding
} from "../utils/CommonUtils";
import { ArrangementOptions } from "./controls/ArrangementsEditor";
import * as cardActionHandlers from "./handlers/CardActions";
import * as freeStyleHandlers from "./handlers/FreeStyle";

type UnitOfMeasures = {
	propertyKeyForDescription: string;
	name: string;
	propertyKeyForId: string;
	value: string;
	valueState: ValueState;
	valueStateText: string;
	navigationValueState?: ValueState;
	navigationValueStateText?: string;
	isNavigationForId?: boolean;
	navigationKeyForId?: string;
};
type ValueFormatter = {
	property: string;
};
type Criticality = {
	criticality: string;
	name: string;
	activeCalculation: boolean;
	propertyKeyForId: string;
};

type EventParameters = {
	selectedItem: ArrangementOptions;
	textArrangementChanged: boolean;
};

const context: any = {};
const aPropsWithUoM: any = [];
const MAX_GROUPS = 5;
const MAX_GROUP_ITEMS = 5;

export const CardGeneratorDialogController = {
	initialize: function () {
		setDefaultCardPreview();
	},
	okPressed,
	cancelPressed: closeDialog,
	onAddClick,
	onGroupAddClick,
	onGroupDeleteClick,
	deleteGroup,
	onDeleteClick,
	onPropertySelection,
	updateContentNavigationSelection,
	onPropertyLabelChange,
	onTitleSelection,
	onSubTitleSelection,
	onGroupTitleChange,
	validateControl,
	onDrop,
	onHeaderUOMSelection,
	onStateIndicatorSelection,
	updateHeaderNavigationSelection,
	onHeightChange,
	onWidthChange,
	onResetPressed,
	onItemsActionsButtonPressed,
	onPreviewTypeChange,
	toggleAdvancedSetting,
	getTranslatedText,
	onPropertyFormatting,
	onFormatTypeSelection,
	onActionAddClick: cardActionHandlers.onActionAddClick,
	onAddedActionDelete: cardActionHandlers.onAddedActionDelete,
	onAddedActionStyleChange: cardActionHandlers.onAddedActionStyleChange,
	onAddedActionTitleChange: cardActionHandlers.onAddedActionTitleChange,
	loadActions: cardActionHandlers.loadActions,
	/* Methods exposed for testing */
	_setDefaultCardPreview: setDefaultCardPreview,
	_updateTrendForCardHeader: updateTrendForCardHeader,
	_updateSideIndicatorsForHeader: updateSideIndicatorsForHeader,
	_setAdvancedFormattingOptionsEnablement: setAdvancedFormattingOptionsEnablement,
	_updateHeaderArrangements: updateHeaderArrangements,
	_updateArrangements: updateArrangements,
	_updateCriticality: updateCriticality,
	_validateHeader: validateHeader,
	applyCriticality: applyCriticality,
	applyUoMFormatting: applyUoMFormatting,
	onTrendDelete: onTrendDelete,
	loadAdvancedFormattingConfigurationFragment: loadAdvancedFormattingConfigurationFragment,
	addLabelsForProperties: addLabelsForProperties,
	checkForNavigationProperty: checkForNavigationProperty,
	disableOrEnableUOMAndTrend: disableOrEnableUOMAndTrend,
	handleCriticalityAction: handleCriticalityAction,
	onEntitySetPathChange: freeStyleHandlers.onEntitySetPathChange,
	applyServiceDetails: freeStyleHandlers.applyServiceDetails,
	onServiceChange: freeStyleHandlers.onServiceChange,
	onContextPathChange: freeStyleHandlers.onContextPathChange,
	onBackButtonPress: freeStyleHandlers.onBackButtonPress,
	handleFormatterUomAction,
	onBeforeDialogClosed: onBeforeDialogClosed,
	setCriticalitySourceProperty: setCriticalitySourceProperty
};
export function getCriticality(propertyName: string, isCalcuationType?: boolean) {
	const model = getDialogModel() as JSONModel;
	const mainIndicatorCriticality = model?.getProperty("/configuration/mainIndicatorOptions/criticality");
	if (hasBooleanBindingExpression(propertyName)) {
		propertyName = extractValueWithoutBooleanExprBinding(propertyName);
	}
	const matchedCriticality = mainIndicatorCriticality?.find(
		(oCriticality: { name: string; criticality: string; propertyKeyForId: string }) => {
			const { name: criticalityName, propertyKeyForId } = oCriticality;
			return (
				criticalityName === propertyName ||
				propertyName === `{${criticalityName}}` ||
				propertyName === `{${criticalityName}/${propertyKeyForId}}`
			);
		}
	);
	if (matchedCriticality) {
		if (isBinding(matchedCriticality?.criticality)) {
			return "{= extension.formatters.formatCriticality($" + matchedCriticality?.criticality + ", 'color') }";
		}
		if (matchedCriticality?.activeCalculation || isCalcuationType) {
			const staticValues = {
				deviationLow: matchedCriticality?.deviationRangeLowValue,
				deviationHigh: matchedCriticality?.deviationRangeHighValue,
				toleranceLow: matchedCriticality?.toleranceRangeLowValue,
				toleranceHigh: matchedCriticality?.toleranceRangeHighValue,
				sImprovementDirection: matchedCriticality?.improvementDirection,
				oCriticalityConfigValues: { None: "Neutral", Negative: "Error", Critical: "Critical", Positive: "Good" }
			};
			return "{= extension.formatters.formatValueColor(${" + matchedCriticality?.name + "}," + JSON.stringify(staticValues) + ") }";
		}
		return matchedCriticality?.criticality;
	}
	return "None";
}

/**
 * This functions updates the enablement of the advanced formatting options based on the source property.
 * @param sourceProperty
 * @returns
 */
function setAdvancedFormattingOptionsEnablement(sourceProperty: string) {
	const oModel = getDialogModel() as JSONModel;
	const mainIndicatorProperty = oModel.getProperty("/configuration/mainIndicatorStatusKey");
	oModel.setProperty("/configuration/trendOptions/sourceProperty", mainIndicatorProperty);
	oModel.setProperty("/configuration/indicatorsValue/sourceProperty", mainIndicatorProperty);
	const properties = oModel.getProperty("/configuration/properties");
	const unitsOfMeasure = oModel.getProperty("/configuration/advancedFormattingOptions/unitOfMeasures") || [];
	const propertyValueFormatters = oModel.getProperty("/configuration/advancedFormattingOptions/propertyValueFormatters") || [];
	const mainIndicatorCriticality = oModel.getProperty("/configuration/mainIndicatorOptions/criticality") || [];
	const selectedTrendOptions = oModel.getProperty("/configuration/selectedTrendOptions") || [];
	const selectedIndicatorOptions = oModel.getProperty("/configuration/selectedIndicatorOptions") || [];
	const dataType = getPropertyDataType(sourceProperty, properties, oModel);
	const isDateType = checkForDateType(dataType);
	const isNumberType = ["Edm.Decimal", "Edm.Int16", "Edm.Int32", "Edm.Double"].indexOf(dataType) > -1;

	let isFormatterApplied = propertyValueFormatters.some(function (formatterDetail: ValueFormatter) {
		return formatterDetail.property === sourceProperty || "{" + formatterDetail.property + "}" === sourceProperty;
	});

	const formatterApplied = propertyValueFormatters.filter(function (formatterDetail: ValueFormatter) {
		return formatterDetail.property === sourceProperty || "{" + formatterDetail.property + "}" === sourceProperty;
	})[0];

	if (formatterApplied?.formatterName === "format.unit" && typeof formatterApplied?.parameters[1].properties[0].value !== "number") {
		isFormatterApplied = false;
	}

	const isUOMApplied = unitsOfMeasure.some(function (arrangementDetail: UnitOfMeasures) {
		return arrangementDetail.name === sourceProperty;
	});
	const isCriticalityApplied = mainIndicatorCriticality.some((indicatorCriticality: Criticality) => {
		const { name: indicatorCriticalityName, propertyKeyForId } = indicatorCriticality;
		return indicatorCriticalityName === sourceProperty || `${indicatorCriticalityName}/${propertyKeyForId}` === sourceProperty;
	});
	const isTrendApplied = selectedTrendOptions.some(function (trendDetail: TrendOptions) {
		return trendDetail.sourceProperty === sourceProperty && trendDetail.downDifference;
	});
	const isIndicatorsApplied = selectedIndicatorOptions.some(function (indicatorDetail: SideIndicatorOptions) {
		return indicatorDetail.sourceProperty === sourceProperty && indicatorDetail.targetUnit;
	});

	oModel.setProperty("/configuration/advancedFormattingOptions/isFormatterApplied", isFormatterApplied);
	oModel.setProperty("/configuration/advancedFormattingOptions/isFormatterEnabled", isDateType || isNumberType);
	oModel.setProperty("/configuration/advancedFormattingOptions/isUOMApplied", isUOMApplied);
	oModel.setProperty("/configuration/advancedFormattingOptions/isCriticalityApplied", isCriticalityApplied);
	oModel.setProperty("/configuration/advancedFormattingOptions/isTrendApplied", isTrendApplied);
	oModel.setProperty("/configuration/advancedFormattingOptions/isIndicatorsApplied", isIndicatorsApplied);

	const trendOptions = oModel.getProperty("/configuration/trendOptions") as TrendOptions;
	const indicatorsValue = oModel.getProperty("/configuration/indicatorsValue") as SideIndicatorOptions;

	if (trendOptions) {
		const { referenceValue, downDifference, upDifference } = trendOptions;
		if (referenceValue && downDifference && upDifference) {
			oModel.setProperty("/configuration/trendOptions/upDown", true);
		}
	}

	if (indicatorsValue) {
		const { targetValue, deviationValue, targetUnit, deviationUnit } = indicatorsValue;
		if (targetValue && deviationValue && targetUnit && deviationUnit) {
			oModel.setProperty("/configuration/indicatorsValue/targetDeviation", true);
		}
	}
}

function getPropertyDataType(sourceProperty: string, properties: Property[], model: JSONModel) {
	const navigationProperty = model.getProperty("/configuration/navigationProperty");
	if (sourceProperty.includes("/") && navigationProperty) {
		const [selectedProperty, navSelectedProperty] = sourceProperty.split("/");
		const selectedNavProperties = navigationProperty.find((prop: Property) => prop.name === selectedProperty);
		const propertiesSelected = selectedNavProperties?.properties.find((prop: Property) => prop.name === navSelectedProperty);
		return propertiesSelected?.type;
	}
	return properties.find((property: Property) => property.name === sourceProperty)?.type || "";
}

/**
 * Updates "sap.card.header" property of integration card manifest and triggers rendering of the card preview.
 *
 * @param oEvent
 * @param key
 * @param fnGetHeaderConfig
 */
function updateCardHeader(oEvent: Event, fnGetHeaderConfig: Function, key?: string) {
	const control = oEvent.getSource() as ComboBox;
	let selectedKey = control.getSelectedKey() || "";
	const newValue = (oEvent.getParameter as (param: string) => string)("newValue");
	let currentValue = selectedKey !== "" ? `{${selectedKey}}` : newValue;
	const oModel = getDialogModel() as JSONModel;

	if (key === "navSelection") {
		const navigationValue = oModel.getProperty("/configuration/navigationValue");
		currentValue = navigationValue ? `{${navigationValue}}` : "";
	}

	if (!selectedKey && key === "mainIndicator") {
		currentValue = "";
	}

	if (selectedKey !== "" || currentValue !== "") {
		control.setValueState(ValueState.None);
	}

	const sapCardHeader = fnGetHeaderConfig(currentValue);
	const currentManifest = getCurrentCardManifest();
	const oManifest = merge(currentManifest, sapCardHeader) as CardManifest;

	if (currentValue === "" && key === "mainIndicator") {
		delete oManifest["sap.card"].header.mainIndicator;
		delete oManifest["sap.card"].header.sideIndicators;
	}

	oModel.setProperty("/configuration/advancedFormattingOptions/sourceProperty", selectedKey);
	if (key === "navSelection") {
		selectedKey = oModel.getProperty("/configuration/mainIndicatorStatusKey");
	}
	setValueStateForAdvancedPanel(selectedKey);
	renderCardPreview(oManifest, getDialogModel() as JSONModel);
	transpileIntegrationCardToAdaptive(getDialogModel() as JSONModel);
}

/**
 * Handles the change event for card title selection.
 * @param oEvent
 */
function onTitleSelection(oEvent: Event) {
	const getHeaderConfiguration = (value: string) => {
		return {
			"sap.card": {
				header: {
					title: value
				}
			}
		};
	};
	validateControl(oEvent, "title");
	updateCardHeader(oEvent, getHeaderConfiguration);
}
/**
 * Validates the control(control's selected key) based on the provided event and control name.
 * @param {Event} oEvent The event triggered by the control.
 * @param {string} [controlName] The name of the control being validated.
 */
function validateControl(oEvent: Event, controlName?: string) {
	const control: ComboBox = oEvent.getSource();
	const selectedKey = control.getSelectedKey();
	const value: string = (oEvent.getParameter as (param: string) => string)("newValue");

	const oModel = getDialogModel() as JSONModel;
	const errorControls = oModel.getProperty("/configuration/errorControls");
	const resourceBundle = (getDialogModel("i18n") as ResourceModel)?.getResourceBundle() as ResourceBundle;

	/**
	 * Gets the key for the given control name.
	 * @param {string} name The name of the control.
	 * @returns {string} The key associated with the control name.
	 */
	const getKey = (name: string): string => {
		switch (name) {
			case "title":
				return resourceBundle?.getText("GENERATOR_CARD_TITLE") as string;
			case "stateIndicator":
				return resourceBundle?.getText("GENERATOR_MAIN_INDICATOR") as string;
			default:
				return resourceBundle?.getText("GENERATOR_GROUP_PROPERTY") as string;
		}
	};

	const controlErrorText = resourceBundle?.getText("GENERIC_ERR_MSG", [getKey(controlName ?? "")]);

	if (!selectedKey && !value && controlName === "title") {
		errorControls?.push(control);
		control.setValueStateText(controlErrorText);
	} else if (!selectedKey && value) {
		errorControls?.push(control);
		control.setValueState(ValueState.Error);
		control.setValueStateText(controlErrorText);
	} else {
		errorControls?.forEach((errorControl: ComboBox, index: number) => {
			if (control.getId() === errorControl.getId()) {
				errorControls.splice(index, 1);
			}
		});
		control.setValueState(ValueState.None);
	}
}

/**
 * Handles the change event for card subtitle selection.
 * @param oEvent
 */
function onSubTitleSelection(oEvent: Event) {
	const getHeaderConfiguration = (value: string) => {
		const oModel = getDialogModel() as JSONModel;
		return {
			"sap.card": {
				header: {
					subTitle: getArrangements(value, {
						unitOfMeasures: oModel.getProperty("/configuration/advancedFormattingOptions/unitOfMeasures"),
						textArrangements: oModel.getProperty("/configuration/advancedFormattingOptions/textArrangements"),
						propertyValueFormatters: oModel.getProperty("/configuration/advancedFormattingOptions/propertyValueFormatters")
					})
				}
			}
		};
	};
	updateCardHeader(oEvent, getHeaderConfiguration);
}

/**
 * Handles the change event for card header UOM selection.
 * @param oEvent
 */
function onHeaderUOMSelection(oEvent: Event) {
	const getHeaderConfiguration = (value: string) => {
		const oModel = getDialogModel() as JSONModel;
		return {
			"sap.card": {
				header: {
					unitOfMeasurement: getArrangements(value, {
						unitOfMeasures: oModel.getProperty("/configuration/advancedFormattingOptions/unitOfMeasures"),
						textArrangements: oModel.getProperty("/configuration/advancedFormattingOptions/textArrangements"),
						propertyValueFormatters: oModel.getProperty("/configuration/advancedFormattingOptions/propertyValueFormatters")
					})
				}
			}
		};
	};

	updateCardHeader(oEvent, getHeaderConfiguration);
}
function addLabelsForProperties(selectedNavigationProperty: NavigationalData, data: Record<string, unknown>) {
	if (
		selectedNavigationProperty.name &&
		data[selectedNavigationProperty.name] !== undefined &&
		data[selectedNavigationProperty.name] !== null
	) {
		const propVal = selectedNavigationProperty?.value as unknown as PropertyInfoMap;
		propVal?.forEach((ele: PropertyInfo) => {
			const name = data[selectedNavigationProperty.name] as Record<string, unknown>;
			if (name[ele.name] !== undefined && name[ele.name] !== null) {
				const propertyValue = name[ele.name] as string;
				const value = formatPropertyDropdownValues(ele, propertyValue);
				ele.labelWithValue = value;
			} else {
				ele.labelWithValue = `${ele.label} (<empty>)`;
			}
		});
	} else {
		selectedNavigationProperty.value = [];
	}
}

async function updateCardConfigurationData(selectedProperty: string, selectedNavigationProperty: NavigationalData) {
	const { entitySetWithObjectContext } = Application.getInstance().fetchDetails();
	const oModel = getDialogModel() as JSONModel;
	const { serviceUrl, oDataV4, $data } = oModel.getProperty("/configuration");
	const queryParameters: QueryParameters = {
		properties: [],
		navigationProperties: [
			{
				name: selectedProperty,
				properties: selectedNavigationProperty.value.map((property) => property.name) || []
			}
		]
	};
	const result = await ODataUtils.fetchDataAsync(serviceUrl, entitySetWithObjectContext, oDataV4, createUrlParameters(queryParameters));
	addLabelsForProperties(selectedNavigationProperty, result);
	$data[selectedProperty] = result[selectedProperty];
	oModel.setProperty("/configuration/$data", $data);
}

function updateHeaderNavigationSelection(oEvent: Event) {
	const oModel = getDialogModel() as JSONModel;
	const getHeaderConfiguration = (value: string) => ({
		"sap.card": {
			header: {
				mainIndicator: {
					state: getCriticality(value),
					number: getArrangements(value, {
						unitOfMeasures: oModel.getProperty("/configuration/advancedFormattingOptions/unitOfMeasures"),
						textArrangements: oModel.getProperty("/configuration/advancedFormattingOptions/textArrangements"),
						propertyValueFormatters: oModel.getProperty("/configuration/advancedFormattingOptions/propertyValueFormatters")
					})
				}
			}
		}
	});

	const control = oEvent.getSource() as ComboBox;
	const selectedKey = control.getSelectedKey();
	const mainIndicatorStatusKeyInitial = oModel.getProperty("/configuration/mainIndicatorStatusKeyInitial");
	const mainIndicatorStatusKey = oModel.getProperty("/configuration/mainIndicatorStatusKey");
	const sourcePropertyToSet = mainIndicatorStatusKeyInitial ?? mainIndicatorStatusKey;

	if (!mainIndicatorStatusKeyInitial) {
		oModel.setProperty("/configuration/mainIndicatorStatusKeyInitial", sourcePropertyToSet);
	} else {
		oModel.setProperty("/configuration/mainIndicatorStatusKey", sourcePropertyToSet);
	}
	const sourceProperty = oModel.getProperty("/configuration/mainIndicatorStatusKey");
	updateSelectedNavigation(selectedKey, sourceProperty, oModel, "header");
	oModel.setProperty("/configuration/navigationValue", `${sourcePropertyToSet}/${selectedKey}`);
	oModel.setProperty("/configuration/mainIndicatorNavigationSelectedKey", selectedKey);
	oModel.setProperty("/configuration/mainIndicatorStatusKey", `${sourceProperty}/${selectedKey}`);
	updateCardHeader(oEvent, getHeaderConfiguration, "navSelection");
}

/**
 * Handles the change event for card KPI value selection.
 * @param oEvent
 */
async function onStateIndicatorSelection(oEvent: Event) {
	const getHeaderConfiguration = (value: string) => {
		const oModel = getDialogModel() as JSONModel;
		return {
			"sap.card": {
				header: {
					mainIndicator: {
						state: getCriticality(value),
						number: getArrangements(value, {
							unitOfMeasures: oModel.getProperty("/configuration/advancedFormattingOptions/unitOfMeasures"),
							textArrangements: oModel.getProperty("/configuration/advancedFormattingOptions/textArrangements"),
							propertyValueFormatters: oModel.getProperty("/configuration/advancedFormattingOptions/propertyValueFormatters")
						})
					}
				}
			}
		};
	};
	const oModel = getDialogModel() as JSONModel;
	const control = oEvent.getSource() as ComboBox;
	const selectedKey = control.getSelectedKey();
	await updateSelectedNavigationProperty(selectedKey, true);
	const selectedNavigationPropertyHeader = oModel.getProperty("/configuration/selectedNavigationPropertyHeader");
	const selectedValue: string = (oEvent.getParameter as (param: string) => string)("newValue");
	validateControl(oEvent, "stateIndicator");
	const currentValue = selectedKey !== "" ? `{${selectedKey}}` : selectedValue;
	oModel.setProperty("/configuration/mainIndicatorNavigationSelectedValue", "");
	oModel.setProperty("/configuration/mainIndicatorStatusKeyInitial", selectedValue);
	oModel.setProperty("/configuration/mainIndicatorNavigationSelectedKey", "");

	const properties = oModel.getProperty("/configuration/properties");
	const dataType = properties.find((prop: Property) => prop.name === selectedKey)?.type || "";
	const isDateType = checkForDateType(dataType);
	const isNumberType = ["Edm.Decimal", "Edm.Int16", "Edm.Int32", "Edm.Double"].indexOf(dataType) > -1;
	oModel.setProperty("/configuration/mainIndicatorStatusKey", selectedKey);
	oModel.setProperty("/configuration/advancedFormattingOptions/isFormatterEnabled", isDateType || isNumberType);
	oModel.setProperty("/configuration/advancedFormattingOptions/textArrangementSourceProperty", currentValue);
	oModel.setProperty("/configuration/advancedFormattingOptions/textArrangementSelectedKey", selectedKey);

	if (oModel.getProperty("/configuration/trendOptions/sourceProperty") !== selectedKey) {
		oModel.setProperty("/configuration/trendOptions", {});
		oModel.setProperty("/configuration/indicatorsValue", {});
	}

	oModel.setProperty("/configuration/trendOptions/sourceProperty", selectedKey);
	oModel.setProperty("/configuration/indicatorsValue/sourceProperty", selectedKey);

	setValueStateForAdvancedPanel(selectedKey);
	updateTrendForCardHeader();
	updateSideIndicatorsForHeader();
	oModel.setProperty("/configuration/navigationValue", "");
	if (!selectedNavigationPropertyHeader?.value.length) {
		updateCardHeader(oEvent, getHeaderConfiguration, "mainIndicator");
	} else {
		updateCardHeader(oEvent, getHeaderConfiguration, "navSelection");
	}
}

/**
 * Retrieves the property type and selected value from the given model based on the selected property.
 *
 * @param {JSONModel} model - The JSON model containing configuration and data.
 * @param {string} selectedProperty - The property path to retrieve the type and value for.
 *                                     It can be a simple property or a navigation property (e.g., "propertyName" or "navigationProperty/propertyName").
 * @returns {{ propertyType: string | undefined, selectedValue: string }} - An object containing:
 *   - `propertyType`: The type of the selected property (if found).
 *   - `selectedValue`: The value of the selected property (if found).
 */
function getPropertyAndSelectedValue(model: JSONModel, selectedProperty: string) {
	let propertyType;
	let selectedValue;
	const navigationProperty = model.getProperty("/configuration/navigationProperty");
	const [selectProperty, navSelectedProperty] = selectedProperty.split("/");

	if (navSelectedProperty && navigationProperty) {
		const selectedNavProperties = navigationProperty.find((prop: Property) => prop.name === selectProperty);
		const propertiesSelected = selectedNavProperties?.properties.find((prop: Property) => prop.name === navSelectedProperty);
		propertyType = propertiesSelected?.type;
		selectedValue = model.getProperty("/configuration/$data")[selectProperty][navSelectedProperty];
	} else {
		propertyType = model.getProperty("/configuration/properties").find((prop: Property) => prop.name === selectedProperty)?.type;
		selectedValue = model.getProperty("/configuration/$data")[selectedProperty];
	}

	return { propertyType, selectedValue };
}

/**
 * Disables or enables the apply unit of measure based on the selected property.
 * @param {JSONModel} model - The JSON model containing the configuration.
 * @param {string} selectedProperty - The name of the selected property.
 */
function disableOrEnableUOMAndTrend(model: JSONModel, selectedProperty: string) {
	let typeSupported = true;
	const { propertyType, selectedValue } = getPropertyAndSelectedValue(model, selectedProperty);
	if (propertyType === "Edm.String") {
		typeSupported = !isNaN(Number(selectedValue));
	}
	const isDateType = checkForDateType(propertyType);
	const isUoMEnabled = !(propertyType === "Edm.Boolean" || propertyType === "Edm.Guid" || isDateType) && typeSupported;
	const isNumberType = ["Edm.Decimal", "Edm.Int16", "Edm.Int32", "Edm.Double"].indexOf(propertyType) > -1;
	model.setProperty("/configuration/advancedFormattingOptions/isUoMEnabled", isUoMEnabled);
	model.setProperty("/configuration/advancedFormattingOptions/isTrendEnabled", isNumberType);
}

function updateContentNavigationSelection(oEvent: Event) {
	const { rootComponent, entitySet } = Application.getInstance().fetchDetails();
	const control: ComboBox = oEvent.getSource();
	let selectedKey = control.getSelectedKey() || "";
	const oModel = getDialogModel() as JSONModel;
	const sPath = control?.getBindingContext()?.getPath() as string;
	const group: GroupItem = oModel.getProperty(sPath);
	const currentValue = `{${group.name}/${selectedKey}}`;
	group.value =
		selectedKey &&
		getArrangements(currentValue, {
			unitOfMeasures: oModel.getProperty("/configuration/advancedFormattingOptions/unitOfMeasures"),
			textArrangements: oModel.getProperty("/configuration/advancedFormattingOptions/textArrangements"),
			propertyValueFormatters: oModel.getProperty("/configuration/advancedFormattingOptions/propertyValueFormatters")
		});
	updateSelectedNavigation(selectedKey, group.name, oModel, "content");

	const navProperty = ODataUtils.getPropertyLabel(
		rootComponent.getModel() as Model,
		entitySet,
		group.name,
		PropertyInfoType.NavigationProperty
	) as NavigationParameter;
	const property = navProperty?.properties?.find((oProperty) => oProperty.name === selectedKey);
	const propertyLabel = property ? property.label : "";
	group.label = propertyLabel ? propertyLabel : "";

	oModel.refresh();
	updateCardGroups(oModel);
	selectedKey = `${group.name}/${selectedKey}`;
	setValueStateForAdvancedPanel(selectedKey);
	transpileIntegrationCardToAdaptive(getDialogModel() as JSONModel);
}

function updateSelectedNavigation(selectedKey: string, sourceProperty: string, oModel: JSONModel, source: string) {
	const selectedNavigation: NavigationParameter[] =
		source === "header"
			? oModel.getProperty("/configuration/selectedHeaderNavigation")
			: oModel.getProperty("/configuration/selectedContentNavigation");
	const existingIndex = selectedNavigation.findIndex((navItem) => navItem.name === sourceProperty);

	if (existingIndex !== -1) {
		const existingItem = selectedNavigation[existingIndex];
		const navValues = existingItem?.value?.includes(selectedKey) ? existingItem.value : [...existingItem.value, selectedKey];
		selectedNavigation[existingIndex] = { ...existingItem, value: navValues };
	} else {
		const name = sourceProperty;
		selectedNavigation.push({ name, value: [selectedKey] });
	}

	const propertyPath = source === "header" ? "/configuration/selectedHeaderNavigation" : "/configuration/selectedContentNavigation";
	oModel.setProperty(propertyPath, selectedNavigation);
}
async function updateSelectedNavigationProperty(selectedKey: string, isHeader: boolean) {
	const oModel = getDialogModel() as JSONModel;
	const navigationProperty: NavigationParameter[] = oModel.getProperty("/configuration/navigationProperty") || [];
	const selectedNavigationalProperties: NavigationalData[] = oModel.getProperty("/configuration/selectedNavigationalProperties") || [];
	const existingIndex = selectedNavigationalProperties.findIndex((navItem) => navItem.name === selectedKey);

	const selectedProperty = navigationProperty.find((prop) => prop.name === selectedKey);
	const selectedPropertyName = selectedProperty?.name || "";
	const selectedPropertyValues = selectedProperty?.properties || [];

	const data: NavigationalData = {
		name: selectedPropertyName,
		value: selectedPropertyValues
	};

	if (existingIndex === -1 && selectedProperty) {
		selectedNavigationalProperties.push(data);
	}
	oModel.setProperty("/configuration/selectedNavigationalProperties", selectedNavigationalProperties);
	if (isHeader) {
		oModel.setProperty("/configuration/selectedNavigationPropertyHeader", data);
	} else {
		oModel.setProperty("/configuration/selectedNavigationPropertiesContent", data);
	}

	if (selectedProperty) {
		await updateCardConfigurationData(selectedProperty.name, data);
	}
}

function getTranslatedText(sKey: string) {
	return getDialogModel("i18n").getObject(sKey);
}

function onAddClick(oEvent: Event) {
	const oModel = getDialogModel() as JSONModel;
	const comboBox: ComboBox = oEvent.getSource();
	const sPath = comboBox.getBindingContext()?.getPath();

	if (sPath) {
		const group = oModel.getProperty(sPath);
		if (!group.items) {
			group.items = [];
		}
		const nextItemNumber = oModel.getProperty(sPath).items.length;
		const newItem = {
			label: null,
			value: `{/items/${nextItemNumber}}`,
			isEnabled: false,
			isNavigationEnabled: false,
			navigationalProperties: []
		};
		oModel.getProperty(sPath).items.push(newItem);
		const iItemsAdded = oModel.getProperty(sPath).items.length;
		oModel.setProperty(sPath + "/enableAddMoreGroupItems", true);
		if (iItemsAdded === MAX_GROUP_ITEMS) {
			oModel.setProperty(sPath + "/enableAddMoreGroupItems", false);
		}
		oModel.setProperty("/configuration/isEdited", true);
		oModel.refresh();
	}
}

async function okPressed() {
	const { rootComponent, entitySet } = Application.getInstance().fetchDetails();

	const hasError = validateHeader();
	if (hasError) {
		return;
	}

	const oCard = CoreElement.getElementById("cardGeneratorDialog--cardPreview") as Card;
	const mManifest = oCard.getManifest() as CardManifest;

	await enhanceManifestWithInsights(mManifest, rootComponent);
	enhanceManifestWithConfigurationParameters(mManifest, getDialogModel() as JSONModel);
	createAndStoreGeneratedi18nKeys(mManifest);
	updateManifestWithSelectQueryParams(mManifest);

	delete mManifest["sap.card"].configuration?.parameters?.contextParameters;
	const payload = {
		floorplan: "ObjectPage",
		localPath: `cards/op/${entitySet}`,
		fileName: "manifest.json",
		manifests: [
			{
				type: "integration",
				manifest: mManifest,
				default: true,
				entitySet: entitySet
			}
		]
	};

	jQuery.ajax({
		type: "POST",
		url: "/cards/store",
		headers: {
			"Content-Type": "application/json"
		},
		data: JSON.stringify(payload),
		success: function () {
			MessageToast.show(getTranslatedText("CARD_SAVE_SUCCESS_MESSAGE"));
		},
		error: function (jqXHR, textStatus, errorThrown) {
			const errorMessage = `Unable to save the card: ${textStatus} - ${errorThrown} (Status: ${jqXHR.status} - ${jqXHR.statusText})`;
			Log.error(errorMessage);
			MessageBox.error(getTranslatedText("CARD_SAVE_ERROR_MESSAGE"));
		}
	});
	(getDialogModel() as JSONModel).setProperty("/configuration/isEdited", false);
	(getCardGeneratorDialog() as Dialog)?.close();
	toggleOffAdvancedPanel();
}

function validateHeader() {
	let hasError = false;
	const oModel = getDialogModel() as JSONModel;
	const errorControls = oModel.getProperty("/configuration/errorControls");
	errorControls?.forEach((ele: ComboBox) => {
		if (!ele.getValue() || ele.getValueState() == "Error") {
			ele.setValueState(ValueState.Error);
			hasError = true;
		}
	});
	return hasError;
}

function validateIndicatorsValues(buttonId: string) {
	const oModel = getDialogModel() as JSONModel;
	const indicatorsValue = oModel.getProperty("/configuration/indicatorsValue");
	let hasError = false;
	const { targetValue, deviationValue, targetUnit, deviationUnit } = indicatorsValue;

	if (!targetValue) {
		oModel.setProperty("/configuration/indicatorsValue/targetValueState", "Error");
		const targetInputId = buttonId + "--targetInputValue";
		setValueStateTextForControl(targetInputId, getTranslatedText("TARGET_VALUE_ERR_MSG"));
	}
	if (!deviationValue) {
		oModel.setProperty("/configuration/indicatorsValue/deviationValueState", "Error");
		const deviationInputId = buttonId + "--deviationInputValue";
		setValueStateTextForControl(deviationInputId, getTranslatedText("DEVIATION_VALUE_ERR_MSG"));
	}
	if (!targetUnit) {
		oModel.setProperty("/configuration/indicatorsValue/targetUnitValueState", "Error");
		const targetUnitInputId = buttonId + "--targetUnitInput";
		setValueStateTextForControl(targetUnitInputId, getTranslatedText("TARGET_UNIT_ERR_MSG"), true);
	}
	if (!deviationUnit) {
		oModel.setProperty("/configuration/indicatorsValue/deviationUnitValueState", "Error");
		const deviationUnitInputId = buttonId + "--deviationUnitInput";
		setValueStateTextForControl(deviationUnitInputId, getTranslatedText("DEVIATION_UNIT_ERR_MSG"), true);
	}
	if (!targetValue || !deviationValue || !targetUnit || !deviationUnit) {
		hasError = true;
	}
	return hasError;
}

function validateTrendValues(buttonId: string) {
	const oModel = getDialogModel() as JSONModel;
	const trendValues = oModel.getProperty("/configuration/trendOptions");
	let hasError = false;
	const { referenceValue, downDifference, upDifference } = trendValues;

	if (!referenceValue) {
		oModel.setProperty("/configuration/trendOptions/referenceValueState", "Error");
		const referenceInputId = buttonId + "--trendReferenceValueInput";
		setValueStateTextForControl(referenceInputId, getTranslatedText("REF_ERR_MSG"));
	}
	if (!downDifference) {
		oModel.setProperty("/configuration/trendOptions/downDifferenceValueState", "Error");
		const trendDownDifferenceInputId = buttonId + "--trendDownDifferenceInput";
		setValueStateTextForControl(trendDownDifferenceInputId, getTranslatedText("LOW_RANGE_ERR_MSG"));
	}
	if (!upDifference) {
		oModel.setProperty("/configuration/trendOptions/upDifferenceValueState", "Error");
		const trendUpDifferenceInputId = buttonId + "--trendUpDifferenceInput";
		setValueStateTextForControl(trendUpDifferenceInputId, getTranslatedText("HIGH_RANGE_ERR_MSG"));
	}
	if (!referenceValue || !downDifference || !upDifference) {
		hasError = true;
	}
	return hasError;
}

function setValueStateTextForControl(controlId: string, errorMessage: string, isSelectControl?: boolean) {
	const elementControl = CoreElement?.getElementById(controlId) as ComboBox;
	elementControl.key = errorMessage;
	const validateControl = isSelectControl
		? !elementControl?.getSelectedKey() || elementControl.getValueState() == "Error"
		: !elementControl?.getValue() || elementControl.getValueState() == "Error";
	if (validateControl) {
		const resourceBundle = (getDialogModel("i18n") as ResourceModel)?.getResourceBundle() as ResourceBundle;
		const validationText = resourceBundle?.getText("GENERIC_ERR_MSG", [elementControl?.key]);
		elementControl?.setValueStateText(validationText);
	}
}

function onGroupAddClick(oEvent: any) {
	const oModel = getDialogModel() as JSONModel;
	const iLength = oModel.getProperty("/configuration/groups").length;
	const currentDefaultValue = ((getDialogModel("i18n") as ResourceModel)?.getResourceBundle() as ResourceBundle)?.getText(
		"GENERATOR_DEFAULT_GROUP_NAME",
		[iLength + 1]
	);
	oModel.getProperty("/configuration/groups").push({
		title: currentDefaultValue,
		items: [
			{
				label: null,
				value: "{/items/0}",
				isEnabled: false,
				isNavigationEnabled: false,
				navigationalProperties: []
			}
		],
		newItem: {
			label: null,
			value: null,
			isEnabled: false,
			isNavigationEnabled: false,
			navigationalProperties: []
		}
	});
	const groupLength = oModel.getProperty("/configuration/groups").length;
	if (groupLength === MAX_GROUPS) {
		oModel.setProperty("/configuration/groupLimitReached", true);
	}
	oModel.setProperty("/configuration/isEdited", true);
	oModel.refresh();
	updateCardGroups(oModel);
	transpileIntegrationCardToAdaptive(getDialogModel() as JSONModel);
}

function deleteGroup(event: any) {
	const oModel = getDialogModel() as JSONModel;
	const sPath = event.getSource().getBindingContext().getPath();
	const groupIndex = sPath.split("/configuration/groups/")[1];
	oModel.getProperty("/configuration/groups").splice(groupIndex, 1);
	const groupLength = oModel.getProperty("/configuration/groups").length;
	if (groupLength < MAX_GROUPS) {
		oModel.setProperty("/configuration/groupLimitReached", false);
	}
	delete context._itemActionsMenu;
	oModel.setProperty("/configuration/isEdited", true);
	oModel.refresh();
	updateCardGroups(oModel);
	setValueStateForAdvancedPanel();
	transpileIntegrationCardToAdaptive(getDialogModel() as JSONModel);
}

function onGroupDeleteClick(event: any) {
	const resourceBundle = (getDialogModel("i18n") as ResourceModel)?.getResourceBundle() as ResourceBundle;
	const warningMessage = resourceBundle?.getText("GENERATOR_DELETE_GROUP_WARNING") || "";
	MessageBox.warning(warningMessage, {
		actions: [MessageBox.Action.DELETE, MessageBox.Action.CANCEL],
		emphasizedAction: MessageBox.Action.DELETE,
		onClose: function (action: string) {
			if (action === "DELETE") {
				deleteGroup(event);
			}
		}
	});
}

function onGroupTitleChange(oEvent: any) {
	const currentValue = oEvent.getParameters().newValue;
	const oModel = getDialogModel() as JSONModel;
	const sPath = oEvent.getSource().getBindingContext().getPath();
	const group = oModel.getProperty(sPath);
	group.title = currentValue;
	oModel.refresh();
	updateCardGroups(oModel);
	transpileIntegrationCardToAdaptive(getDialogModel() as JSONModel);
}

function onDeleteClick(oEvent: any) {
	const oModel = getDialogModel() as JSONModel;
	const sPath = oEvent.getSource().getBindingContext().getPath();
	const [groupIndex, itemIndex] = sPath.match(/(\d+)/g).map(function (sValue: string) {
		return Number(sValue);
	});
	oModel.getProperty("/configuration/groups/" + groupIndex).items.splice(itemIndex, 1);
	const iLength = oModel.getProperty("/configuration/groups/" + groupIndex).items.length;
	if (iLength < MAX_GROUP_ITEMS) {
		oModel.setProperty("/configuration/groups/" + groupIndex + "/enableAddMoreGroupItems", true);
	}
	context._itemActionsMenu?.destroy();
	delete context._itemActionsMenu;
	oModel.setProperty("/configuration/isEdited", true);
	oModel.refresh();
	updateCardGroups(oModel);
	setValueStateForAdvancedPanel();
	transpileIntegrationCardToAdaptive(getDialogModel() as JSONModel);
}

/**
 * Updates the sap.card.header.mainIndicator.trend property of the integration card manifest and triggers rendering of the card preview.
 */
function updateTrendForCardHeader() {
	const oModel = getDialogModel() as JSONModel;
	let trendOptions = oModel.getProperty("/configuration/trendOptions");
	const selectedTrendOptions = oModel.getProperty("/configuration/selectedTrendOptions");

	const sapCardHeader = {
		"sap.card": {
			header: {
				mainIndicator: {
					trend: "None"
				}
			}
		}
	};

	let selectedTrendOptionIndex = -1;
	selectedTrendOptions?.forEach((selectedTrendOption: any, index: number) => {
		if (selectedTrendOption.sourceProperty === trendOptions.sourceProperty) {
			selectedTrendOptionIndex = index;
			trendOptions = { ...selectedTrendOption, ...trendOptions };
			oModel.setProperty("/configuration/trendOptions", trendOptions);
		}
	});
	const { referenceValue, downDifference, upDifference, sourceProperty } = trendOptions;

	if (referenceValue && downDifference && upDifference && sourceProperty) {
		const newTrendValues = { referenceValue, downDifference, upDifference, sourceProperty };
		if (selectedTrendOptionIndex !== -1) {
			selectedTrendOptions[selectedTrendOptionIndex] = newTrendValues;
		} else {
			selectedTrendOptions.push(newTrendValues);
		}
		const staticValues = {
			referenceValue: Number(referenceValue),
			downDifference: Number(downDifference),
			upDifference: Number(upDifference)
		};
		sapCardHeader["sap.card"]["header"]["mainIndicator"]["trend"] = getTrendDirection(staticValues);
	}

	const currentManifest = getCurrentCardManifest();
	const oManifest = merge(currentManifest, sapCardHeader) as CardManifest;
	renderCardPreview(oManifest, getDialogModel() as JSONModel);
	transpileIntegrationCardToAdaptive(getDialogModel() as JSONModel);
}

/**
 * Updates the sap.card.header.sideIndicators property of the integration card manifest and triggers rendering of the card preview.
 */
function updateSideIndicatorsForHeader() {
	const oModel = getDialogModel() as JSONModel;
	let indicatorsValue = oModel.getProperty("/configuration/indicatorsValue");
	const selectedIndicatorOptions = oModel.getProperty("/configuration/selectedIndicatorOptions");

	let selectedIndicatorOptionIndex = -1;
	selectedIndicatorOptions?.forEach((selectedIndicatorOption: any, index: number) => {
		if (selectedIndicatorOption.sourceProperty === indicatorsValue.sourceProperty) {
			selectedIndicatorOptionIndex = index;
			indicatorsValue = { ...selectedIndicatorOption, ...indicatorsValue };
			oModel.setProperty("/configuration/indicatorsValue", indicatorsValue);
		}
	});

	let sapCardHeader = {
		"sap.card": {
			header: {
				sideIndicators: [
					{
						title: "",
						number: "",
						unit: ""
					},
					{
						title: "",
						number: "",
						unit: ""
					}
				]
			}
		}
	};
	const { targetValue, deviationValue, targetUnit, deviationUnit, sourceProperty } = indicatorsValue;
	if (targetValue && deviationValue && targetUnit && deviationUnit && sourceProperty) {
		const indicatorsValueToAdd = { targetValue, deviationValue, targetUnit, deviationUnit, sourceProperty };
		if (selectedIndicatorOptionIndex !== -1) {
			selectedIndicatorOptions[selectedIndicatorOptionIndex] = indicatorsValueToAdd;
		} else {
			selectedIndicatorOptions.push(indicatorsValueToAdd);
		}
		oModel.setProperty("/configuration/indicatorsValue/targetDeviation", targetValue);
		sapCardHeader = {
			"sap.card": {
				header: {
					sideIndicators: [
						{
							title: "Target",
							number: targetValue,
							unit: targetUnit
						},
						{
							title: "Deviation",
							number: deviationValue,
							unit: deviationUnit
						}
					]
				}
			}
		};
	}

	const currentManifest = getCurrentCardManifest();
	const oManifest = merge(currentManifest, sapCardHeader) as CardManifest;
	renderCardPreview(oManifest, getDialogModel() as JSONModel);
	oModel.refresh();
	transpileIntegrationCardToAdaptive(getDialogModel() as JSONModel);
}

/**
 * Get trend direction based on the static values.
 * @param staticValues
 * @returns
 */
function getTrendDirection(staticValues: object | undefined) {
	const oModel = getDialogModel() as JSONModel;
	const mainIndicatorKey = oModel.getProperty("/configuration/mainIndicatorStatusKey");
	const trendValues = oModel.getProperty("/configuration/trendOptions");
	const { referenceValue } = trendValues;

	if (mainIndicatorKey && staticValues) {
		oModel.setProperty("/configuration/trendOptions/upDown", referenceValue);
		return "{= extension.formatters.formatTrendIcon(${" + mainIndicatorKey + "}," + JSON.stringify(staticValues) + ") }";
	}
	return "None";
}

async function onPropertySelection(oEvent: Event) {
	const { rootComponent, entitySet } = Application.getInstance().fetchDetails();
	const control: ComboBox = oEvent.getSource();
	const selectedKey = control.getSelectedKey() || "";
	const newValue = (oEvent.getParameter as (param: string) => string)("newValue");

	const currentValue = selectedKey !== "" ? `{${selectedKey}}` : newValue;
	const oModel = getDialogModel() as JSONModel;
	validateControl(oEvent);
	await updateSelectedNavigationProperty(selectedKey, false);
	const selectedNavigationPropertiesContent = oModel.getProperty("/configuration/selectedNavigationPropertiesContent");

	oModel.setProperty("/configuration/advancedFormattingOptions/sourceProperty", selectedKey);
	const sPath = control?.getBindingContext()?.getPath() as string;
	const group = oModel.getProperty(sPath);

	if (!selectedNavigationPropertiesContent?.value?.length) {
		group.value =
			selectedKey &&
			getArrangements(currentValue, {
				unitOfMeasures: oModel.getProperty("/configuration/advancedFormattingOptions/unitOfMeasures"),
				textArrangements: oModel.getProperty("/configuration/advancedFormattingOptions/textArrangements"),
				propertyValueFormatters: oModel.getProperty("/configuration/advancedFormattingOptions/propertyValueFormatters")
			});
	} else {
		group.value = "";
		group.navigationProperty = "";
		group.navigationalProperties = selectedNavigationPropertiesContent?.value;
	}

	setValueStateForAdvancedPanel(selectedKey);

	const propertyLabel = ODataUtils.getPropertyLabel(rootComponent.getModel() as Model, entitySet, selectedKey, PropertyInfoType.Property);
	group.label = selectedNavigationPropertiesContent?.value?.length ? "" : propertyLabel;
	group.isNavigationEnabled = selectedNavigationPropertiesContent?.value?.length > 0;
	group.isEnabled = true;
	oModel.refresh();
	updateCardGroups(oModel);
	transpileIntegrationCardToAdaptive(getDialogModel() as JSONModel);
}

/**
 * This function sets the ValueState of properties present in advanced formatting panel,
 * to ValueState.Information or ValueState.None on the basis of properties present in card preview.
 * @param selectedKey - The selected key from the ComboBox.
 */
export function setValueStateForAdvancedPanel(selectedKey?: string) {
	const model = getDialogModel() as JSONModel;
	const resourceBundle = (getDialogModel("i18n") as ResourceModel)?.getResourceBundle() as ResourceBundle;
	const informativeMessage = resourceBundle?.getText("UNSELECTED_ITEM");
	const previewItems = getPreviewItems(model);
	const propertyPaths: Record<string, string> = {
		unitOfMeasures: "/configuration/advancedFormattingOptions/unitOfMeasures",
		textArrangements: "/configuration/advancedFormattingOptions/textArrangements",
		criticality: "/configuration/mainIndicatorOptions/criticality"
	};
	["unitOfMeasures", "textArrangements", "criticality"].forEach((property) => {
		const path = propertyPaths[property];
		const formattingOptions = model.getProperty(path) ?? [];
		formattingOptions.forEach((item: UnitOfMeasures, index: number) => {
			let itemName = item.name;
			let navigationalProperty: boolean = false;
			if (path === propertyPaths.criticality && item.isNavigationForId && item.navigationKeyForId !== "") {
				itemName = `${item.name}/${item.navigationKeyForId}`;
			}
			if (item.isNavigationForId && item.navigationKeyForId !== "") {
				navigationalProperty = true;
			}
			const isPropertyExists: boolean = previewItems.includes(itemName);
			if (!isPropertyExists && item.valueState !== ValueState.Information) {
				model.setProperty(`${path}/${index}/valueState`, ValueState.Information);
				model.setProperty(`${path}/${index}/valueStateText`, informativeMessage);
				if (navigationalProperty) {
					model.setProperty(`${path}/${index}/navigationValueState`, ValueState.Information);
					model.setProperty(`${path}/${index}/navigationValueStateText`, informativeMessage);
				}
			} else if (isPropertyExists && selectedKey && selectedKey === itemName && item.valueState === ValueState.Information) {
				model.setProperty(`${path}/${index}/valueState`, ValueState.None);
				model.setProperty(`${path}/${index}/valueStateText`, "");
				if (navigationalProperty) {
					model.setProperty(`${path}/${index}/navigationValueState`, ValueState.None);
					model.setProperty(`${path}/${index}/navigationValueStateText`, "");
				}
			}
		});
	});
}

function onPropertyLabelChange(oEvent: any) {
	const currentValue = oEvent.getParameters().newValue;
	const oModel = getDialogModel() as JSONModel;
	const sPath = oEvent.getSource().getBindingContext().getPath();
	const group = oModel.getProperty(sPath);
	group.label = currentValue;
	oModel.refresh();
	updateCardGroups(oModel);
	transpileIntegrationCardToAdaptive(getDialogModel() as JSONModel);
}
function onDrop(oEvent: any) {
	const oDragged = oEvent.getParameter("draggedControl"),
		oDropped = oEvent.getParameter("droppedControl"),
		sInsertPosition = oEvent.getParameter("dropPosition"),
		oModel = getDialogModel() as JSONModel,
		oDragPos = oDragged.getParent(),
		oDropPos = oDropped.getParent(),
		sDraggedPath = oDragPos.getBindingContext().getPath(),
		sDroppedPath = oDropPos.getBindingContext().getPath(),
		aDragItems = oModel.getProperty(sDraggedPath).items,
		aDropItems = oModel.getProperty(sDroppedPath).items,
		iDragPosition = oDragPos.indexOfItem(oDragged),
		iDropPosition = oDropPos.indexOfItem(oDropped);

	const oSelectedItem = aDragItems[iDragPosition];
	// insert the control in target aggregation, remove the item
	if (sInsertPosition === "Before" && aDropItems.length < MAX_GROUP_ITEMS) {
		aDragItems.splice(iDragPosition, 1);
		aDropItems.splice(iDropPosition, 0, oSelectedItem);
	} else if (sInsertPosition && aDropItems.length < MAX_GROUP_ITEMS) {
		aDragItems.splice(iDragPosition, 1);
		aDropItems.splice(iDropPosition + 1, 0, oSelectedItem);
	}
	if (aDragItems.length < MAX_GROUP_ITEMS) {
		oModel.setProperty(sDraggedPath + "/enableAddMoreGroupItems", true);
	}
	if (aDropItems.length === MAX_GROUP_ITEMS) {
		oModel.setProperty(sDroppedPath + "/enableAddMoreGroupItems", false);
	}
	oModel.refresh();
	updateCardGroups(oModel);
	transpileIntegrationCardToAdaptive(getDialogModel() as JSONModel);
}
function onResetPressed() {
	const oCard: any = CoreElement.getElementById("cardGeneratorDialog--cardPreview");
	oCard.setWidth();
	oCard.setHeight();
	(CoreElement.getElementById("cardGeneratorDialog--widthInput") as Input)?.setValue("");
	(CoreElement.getElementById("cardGeneratorDialog--heightInput") as Input)?.setValue("");
	oCard.refresh();
}
function onHeightChange(oEvent: any) {
	const oCard: any = CoreElement.getElementById("cardGeneratorDialog--cardPreview");
	const currentValue = Number(oEvent.getParameters().newValue);
	currentValue > 200 ? oCard.setHeight(currentValue + "px") : oCard.setHeight("232px");
	oCard.refresh();
}
function onWidthChange(oEvent: any) {
	const oCard: any = CoreElement.getElementById("cardGeneratorDialog--cardPreview");
	const currentValue = Number(oEvent.getParameters().newValue);
	currentValue > 200 ? oCard.setWidth(currentValue + "px") : oCard.setWidth("582px");
	oCard.refresh();
}

function closeDialog() {
	const oModel = getDialogModel() as JSONModel;
	if (oModel) {
		if (!oModel.getProperty("/configuration/isEdited")) {
			toggleOffAdvancedPanel();
		}
		const errorControls = oModel.getProperty("/configuration/errorControls");
		errorControls?.forEach((ele: ComboBox) => {
			ele.setValueState(ValueState.None);
		});
	}

	(getCardGeneratorDialog() as Dialog).close();
}

function setCriticalitySourceProperty(property: string) {
	const oModel = getDialogModel() as JSONModel;
	const mainIndicatorCriticality = oModel?.getProperty("/configuration/mainIndicatorOptions/criticality");
	let relavantCriticality;

	const relavantProperty = mainIndicatorCriticality?.filter((indicatorCriticality: Criticality) => {
		const { name: indicatorName, propertyKeyForId } = indicatorCriticality;
		return indicatorName === property || `${indicatorName}/${propertyKeyForId}` === property;
	});
	if (relavantProperty) {
		relavantCriticality = JSON.parse(JSON.stringify(relavantProperty));
	}
	if (relavantProperty?.length === 1) {
		relavantCriticality[0].hostCriticality = relavantProperty[0].criticality;
		delete relavantCriticality.criticality;
		oModel?.setProperty("/configuration/advancedFormattingOptions/sourceCriticalityProperty", relavantCriticality);
	} else {
		oModel?.setProperty("/configuration/advancedFormattingOptions/sourceCriticalityProperty", [{ name: property }]);
	}
}

function onFormatTypeSelection(oEvent: any, oSource: ComboBox) {
	const oModel = getDialogModel() as JSONModel;
	const sourceItem = oEvent.getParameter("item");
	const key = sourceItem.getKey();
	oModel.setProperty("/configuration/popoverContentType", key);
	const aUom = oModel.getProperty("/configuration/advancedFormattingOptions/unitOfMeasures");
	const sSourceUoMProperty = oModel.getProperty("/configuration/advancedFormattingOptions/sourceUoMProperty");
	if (aUom.length > 0) {
		const aSourceUom = aUom.filter((oProperty: any) => {
			return oProperty.name === sSourceUoMProperty;
		})[0];
		if (aSourceUom) {
			oModel.setProperty("/configuration/advancedFormattingOptions/targetProperty", aSourceUom.value);
		}
	}
	if (aPropsWithUoM.indexOf(sSourceUoMProperty) === -1) {
		oModel.setProperty("/configuration/advancedFormattingOptions/targetProperty", "");
	}
	onAdvancedFormattingConfigOpen(oEvent, oSource);
}

function onPropertyFormatting(oEvent: any) {
	const oSource = oEvent.getSource();
	const oModel = getDialogModel() as JSONModel;
	let property = oModel.getProperty("/configuration/mainIndicatorStatusKey");
	const navSelectedKey = oModel.getProperty("/configuration/mainIndicatorNavigationSelectedKey");
	if (navSelectedKey && !property.includes("/")) {
		property = `${property}/${navSelectedKey}`;
	}
	oModel.setProperty("/configuration/advancedFormattingOptions/targetFormatterProperty", property);
	oModel.setProperty("/configuration/advancedFormattingOptions/sourceUoMProperty", property);
	disableOrEnableUOMAndTrend(oModel, property);
	setCriticalitySourceProperty(property);
	setAdvancedFormattingOptionsEnablement(property);

	if (!context._advancedFormattingOptionsPopover) {
		Fragment.load({
			id: "advancedFormattingOptions",
			name: "sap.cards.ap.generator.app.fragments.configuration.AdvancedFormattingOptions",
			controller: {
				onFormatTypeSelection: function (oEvent: any) {
					CardGeneratorDialogController.onFormatTypeSelection(oEvent, oSource);
				}
			}
		})
			.then(function (oPopover: any) {
				context._advancedFormattingOptionsPopover = oPopover;
				oSource.addDependent(oPopover);
				return oPopover;
			})
			.then(function (oPopover) {
				const oContext = oSource.getBindingContext();
				oPopover.setBindingContext(oContext);
				oPopover.openBy(oSource);
			});
	} else {
		const oContext = oSource.getBindingContext();
		context._advancedFormattingOptionsPopover.setBindingContext(oContext);
		context._advancedFormattingOptionsPopover.openBy(oSource);
	}
}

function onAdvancedFormattingConfigOpen(oEvent: any, oSource: any) {
	const oModel = getDialogModel() as JSONModel;
	const oConfigurationController = {
		onPopoverClose: (oEvent: any) => {
			const source = oEvent.getSource();
			source?.destroy();
		},
		onPropertyFormatterChange: () => {
			updateArrangements();
			const buttonId = oSource?.getId();
			const oPopover = CoreElement.getElementById(buttonId + "--advanceFormattingPopover");
			(oPopover as Popover)?.close();
		},
		applyCriticality: () => applyCriticality(oEvent),
		applyUoMFormatting: () => applyUoMFormatting(),
		applyFormatting: () => {
			const buttonId = oSource?.getId();
			(CoreElement.getElementById(buttonId + "--headerFormatterEditor") as CompactFormatterSelection).applyFormatter();
			transpileIntegrationCardToAdaptive(getDialogModel() as JSONModel);
		},
		resetValueState(oEvent: any, isSelectControl?: boolean) {
			const control = oEvent.getSource();
			const currentValue = !isSelectControl ? oEvent.getParameters().newValue : control.getSelectedKey();
			if (currentValue !== "") {
				control.setValueState(ValueState.None);
			}
		},
		onDownDifferenceChange(oEvent: any) {
			oModel.setProperty("/configuration/trendOptions/downDifferenceValueState", "None");
			this.resetValueState(oEvent);
		},
		onUpDifferenceChange(oEvent: any) {
			oModel.setProperty("/configuration/trendOptions/upDifferenceValueState", "None");
			this.resetValueState(oEvent);
		},
		onReferenceValInputChange(oEvent: any) {
			oModel.setProperty("/configuration/trendOptions/referenceValueState", "None");
			this.resetValueState(oEvent);
		},
		onTargetValueChange(oEvent: any) {
			oModel.setProperty("/configuration/indicatorsValue/targetValueState", "None");
			this.resetValueState(oEvent);
		},
		onDeviationValueChange(oEvent: any) {
			oModel.setProperty("/configuration/indicatorsValue/deviationValueState", "None");
			this.resetValueState(oEvent);
		},
		onTargetUnitChange(oEvent: any) {
			oModel.setProperty("/configuration/indicatorsValue/targetUnitValueState", "None");
			this.resetValueState(oEvent, true);
		},
		onDeviationUnitChange(oEvent: any) {
			oModel.setProperty("/configuration/indicatorsValue/deviationUnitValueState", "None");
			this.resetValueState(oEvent, true);
		},
		applyIndicators: () => {
			const buttonId = oSource?.getId();
			const hasIndicatorsError = validateIndicatorsValues(buttonId);
			if (!hasIndicatorsError) {
				updateSideIndicatorsForHeader();
				context?._advancedFormattingConfigurationPopover?.close();
			}
		},
		applyTrendCalculation: () => {
			const buttonId = oSource?.getId();
			const hasTrendError = validateTrendValues(buttonId);
			if (!hasTrendError) {
				updateTrendForCardHeader();
				context?._advancedFormattingConfigurationPopover?.close();
			}
		},
		onDelete: () => {
			const oModel = getDialogModel() as JSONModel;
			const sourceUoMProperty: any = oModel?.getProperty("/configuration/advancedFormattingOptions/sourceUoMProperty");
			const iIndex = aPropsWithUoM?.indexOf(sourceUoMProperty);
			aPropsWithUoM?.splice(iIndex, 1);
			oModel?.setProperty("/configuration/advancedFormattingOptions/targetProperty", "");

			const itemsBindingPath: string = "/configuration/advancedFormattingOptions/unitOfMeasures",
				unitOfMeasures: any = oModel?.getProperty(itemsBindingPath);
			let relativeIndex: number = -1;
			const propertyValueFormatters = oModel.getProperty("/configuration/advancedFormattingOptions/propertyValueFormatters");
			const updatedPropertyValueFormatters = propertyValueFormatters.filter(
				(formatter: ValueFormatter) => formatter.property !== sourceUoMProperty
			);
			oModel.setProperty("/configuration/advancedFormattingOptions/propertyValueFormatters", updatedPropertyValueFormatters);
			oModel.setProperty("/configuration/isEdited", true);
			for (let i = 0; i < unitOfMeasures.length; i++) {
				if (unitOfMeasures[i]?.name === sourceUoMProperty) {
					relativeIndex = i;
				}
			}

			if (relativeIndex >= 0 && itemsBindingPath) {
				const sPath = itemsBindingPath + "/" + relativeIndex;
				unitOfMeasures?.splice(sPath.slice(sPath.length - 1), 1);
				updateArrangements();
				oModel?.refresh();
			}
			context?._advancedFormattingConfigurationPopover?.close();
		},
		onTrendDelete: () => onTrendDelete(),
		onIndicatorsDelete: () => {
			const oModel = getDialogModel() as JSONModel;
			const indicatorsValue = oModel.getProperty("/configuration/indicatorsValue");
			const selectedIndicatorValues = oModel.getProperty("/configuration/selectedIndicatorOptions");
			let iIndex: number = -1;
			selectedIndicatorValues?.forEach((trend: any, index: number) => {
				if (trend.sourceProperty === indicatorsValue.sourceProperty) {
					iIndex = index;
				}
			});
			if (iIndex !== -1) {
				selectedIndicatorValues.splice(iIndex, 1);
			}
			oModel.setProperty("/configuration/indicatorsValue", {});
			oModel.setProperty("/configuration/isEdited", true);
			updateSideIndicatorsForHeader();
			context?._advancedFormattingConfigurationPopover?.close();
		},
		onDeleteFormatter: () => {
			const buttonId = oSource?.getId();
			const oModel = getDialogModel() as JSONModel;
			oModel.setProperty("/configuration/isEdited", true);
			(CoreElement.getElementById(buttonId + "--headerFormatterEditor") as CompactFormatterSelection).deleteFormatter();
			transpileIntegrationCardToAdaptive(getDialogModel() as JSONModel);
		},
		onDeleteCriticality: (event: Event) => {
			const oModel = getDialogModel() as JSONModel;
			const buttonId = oSource?.getId();
			(CoreElement.getElementById(buttonId + "--headerCriticalityEditor") as CriticalityEditor).onDeleteButtonClicked(event);
			oModel.setProperty("/configuration/advancedFormattingOptions/selectedKeyCriticality", "");
			oModel.setProperty("/configuration/isEdited", true);
			updateCriticality(false);
			context?._advancedFormattingConfigurationPopover?.close();
		}
	};

	if (oEvent?.getParameter("item")?.getKey?.() === "uom") {
		oConfigurationController.applyUoMFormatting();
	}
	if (oEvent.getSource()?.getParent()?.close) {
		oEvent.getSource().getParent().close();
	}

	loadAdvancedFormattingConfigurationFragment(oSource, oConfigurationController);
}

function applyCriticality(oEvent: Event) {
	const oModel = getDialogModel() as JSONModel;
	const mainIndicatorCriticality = oModel?.getProperty("/configuration/mainIndicatorOptions/criticality");
	let sourceCriticalityProperty = oModel?.getProperty("/configuration/advancedFormattingOptions/sourceCriticalityProperty");

	sourceCriticalityProperty = sourceCriticalityProperty?.[0];
	const navProperites = oModel?.getProperty("/configuration/navigationProperty");
	const isNavEnabled = sourceCriticalityProperty?.name?.includes("/");

	if (isNavEnabled) {
		sourceCriticalityProperty.propertyKeyForId = sourceCriticalityProperty.name.split("/")[1];
		sourceCriticalityProperty.navigationKeyForId = sourceCriticalityProperty.name.split("/")[1];
		sourceCriticalityProperty.name = sourceCriticalityProperty.name.split("/")[0];
		sourceCriticalityProperty.isNavigationForId = true;
		const navSelectedProperies = navProperites?.filter((property: { name: string }) => {
			return property?.name === sourceCriticalityProperty?.name.split("/")[0];
		});
		sourceCriticalityProperty.navigationalPropertiesForId = navSelectedProperies[0]?.properties;
	}
	if (sourceCriticalityProperty?.hostCriticality !== sourceCriticalityProperty?.criticality) {
		sourceCriticalityProperty.criticality = sourceCriticalityProperty.hostCriticality;
	}

	const propertyExists: boolean = mainIndicatorCriticality?.some((indicatorCriticality: Property) => {
		const { name: indicatorName, propertyKeyForId } = indicatorCriticality;
		if (isNavEnabled) {
			return indicatorName === sourceCriticalityProperty?.name && propertyKeyForId === sourceCriticalityProperty?.propertyKeyForId;
		} else {
			return indicatorName === sourceCriticalityProperty?.name;
		}
	});

	if (!propertyExists && sourceCriticalityProperty) {
		delete sourceCriticalityProperty.hostCriticality;
		mainIndicatorCriticality?.push(sourceCriticalityProperty);
	} else {
		for (let i = 0; i < mainIndicatorCriticality.length; i++) {
			if (mainIndicatorCriticality[i]?.name === sourceCriticalityProperty?.name) {
				delete mainIndicatorCriticality[i];
				delete sourceCriticalityProperty.hostCriticality;
				mainIndicatorCriticality[i] = sourceCriticalityProperty;
			}
		}
	}
	oModel?.setProperty("/configuration/mainIndicatorOptions/criticality", mainIndicatorCriticality);
	updateCriticality((oEvent.getParameter as (param: string) => boolean)("isCalcuationType") || false);
	context?._advancedFormattingConfigurationPopover?.close();
}

function applyUoMFormatting() {
	const oModel = getDialogModel() as JSONModel;
	const unitOfMeasures = oModel?.getProperty("/configuration/advancedFormattingOptions/unitOfMeasures"),
		sourceProperty: string = oModel?.getProperty("/configuration/advancedFormattingOptions/sourceUoMProperty");
	let relavantProperty = unitOfMeasures?.filter((property: Property) => property?.name === sourceProperty),
		targetProperty: string = oModel?.getProperty("/configuration/advancedFormattingOptions/targetProperty");
	relavantProperty = relavantProperty?.[0];

	if (!targetProperty && relavantProperty) {
		oModel.setProperty("/configuration/advancedFormattingOptions/targetProperty", relavantProperty?.propertyKeyForDescription);
	}

	targetProperty = oModel?.getProperty("/configuration/advancedFormattingOptions/targetProperty");
	const proprtetyKeyFromSource = sourceProperty.includes("/") ? sourceProperty.split("/")[0] : sourceProperty;
	const navAllProperties = oModel.getProperty("/configuration/navigationProperty");
	let navPropertiesValues: object[] = [];
	if (sourceProperty.includes("/") && navAllProperties) {
		navPropertiesValues = getNavValues(navAllProperties, proprtetyKeyFromSource);
	}
	const oData = {
		propertyKeyForId: proprtetyKeyFromSource,
		name: sourceProperty,
		value: targetProperty,
		navigationalPropertiesForId: navPropertiesValues.length === 0 ? "" : navPropertiesValues,
		isNavigationForId: sourceProperty.includes("/") ? true : false,
		navigationKeyForId: sourceProperty.includes("/") ? sourceProperty.split("/")[1] : "",
		propertyKeyForDescription: targetProperty,
		isNavigationForDescription: false,
		navigationKeyForDescription: ""
	};
	let bMatchingProperty = false;
	unitOfMeasures.forEach((oUom: any) => {
		if (oUom.name === oData.name) {
			bMatchingProperty = true;
			oUom.propertyKeyForDescription = oData.value;
			oUom.value = oData.value;
		}
	});
	if (!bMatchingProperty && sourceProperty && targetProperty) {
		unitOfMeasures.push(oData);
	}
	oModel.setProperty("/configuration/advancedFormattingOptions/unitOfMeasures", unitOfMeasures);
	updateArrangements();
	for (let i = 0; i < unitOfMeasures.length; i++) {
		if (unitOfMeasures[i].value !== "" && aPropsWithUoM?.indexOf(unitOfMeasures[i]?.name) === -1) {
			aPropsWithUoM?.push(unitOfMeasures[i]?.name);
		}
	}
	context?._advancedFormattingConfigurationPopover?.close();
}

/**
 * Retrieves the properties of a navigation property that matches the given key.
 *
 * @param {Array<{ name: string; properties: Array<object> }>} navProperties - An array of navigation properties, each containing a name and a list of properties.
 * @param {string} propertyKeyFromSource - The key to match against the name of the navigation properties.
 * @returns {Array<object>} The properties of the matching navigation property, or an empty array if no match is found.
 */
function getNavValues(navProperties: [{ name: string; properties: Array<object> }], propertyKeyFromSource: string): Array<object> {
	for (const navProperty of navProperties) {
		if (propertyKeyFromSource === navProperty?.name) {
			return navProperty.properties;
		}
	}
	return [];
}

function onTrendDelete() {
	const oModel = getDialogModel() as JSONModel;
	const trendValues = oModel.getProperty("/configuration/trendOptions");
	const selectedTrendValues = oModel.getProperty("/configuration/selectedTrendOptions");
	let iIndex: number = -1;
	selectedTrendValues?.forEach((trend: TrendOrIndicatorOptions, index: number) => {
		if (trend.sourceProperty === trendValues.sourceProperty) {
			iIndex = index;
		}
	});
	if (iIndex !== -1) {
		selectedTrendValues.splice(iIndex, 1);
	}
	oModel.setProperty("/configuration/trendOptions", {});
	oModel.setProperty("/configuration/isEdited", true);
	updateTrendForCardHeader();
	context?._advancedFormattingConfigurationPopover?.close();
}

function loadAdvancedFormattingConfigurationFragment(oSource: any, oConfigurationController: object) {
	Fragment.load({
		id: oSource.getId(),
		name: "sap.cards.ap.generator.app.fragments.configuration.AdvancedFormattingConfiguration",
		controller: oConfigurationController
	})
		.then(function (oPopover: any) {
			context._advancedFormattingConfigurationPopover = oPopover;
			const oResourceBundle = (getDialogModel("i18n") as ResourceModel)?.getResourceBundle() as ResourceBundle;
			const mLabels = {
				uomText: oResourceBundle?.getText("SELECT_UOM_TEXT"),
				criticalityText: oResourceBundle?.getText("SELECT_CRITICALITY_TEXT"),
				formatterText: oResourceBundle?.getText("SELECT_FORMATTER_TEXT"),
				indicatorsText: oResourceBundle?.getText("SELECT_INDICATORS_TEXT"),
				trendCalculatorText: oResourceBundle?.getText("TREND_CALCULATION_TEXT")
			};
			oPopover.setModel(new JSONModel(mLabels), "i18nLabelText");
			oSource.addDependent(oPopover);
			return oPopover;
		})
		.then(function (oPopover) {
			const oContext = oSource.getBindingContext();
			oPopover.setBindingContext(oContext);
			oPopover.openBy(oSource);
			return oPopover;
		});
}

function onItemsActionsButtonPressed(oEvent: any) {
	const oModel = getDialogModel() as JSONModel;
	const sPath = oEvent?.getSource().getBindingContext().getPath();
	const sourcePropertyName = oModel?.getProperty(sPath)?.name;
	const navProperty = oModel?.getProperty(sPath)?.navigationProperty;
	const sourceProperty = navProperty ? sourcePropertyName + "/" + navProperty : sourcePropertyName;
	const oSource = oEvent.getSource();
	disableOrEnableUOMAndTrend(oModel, sourceProperty);
	setAdvancedFormattingOptionsEnablement(sourceProperty);
	const oController = {
		onNavigationActionSelect: (oEvent: any) => {
			const sId = oEvent.getParameter("item").getId();
			const oModel = getDialogModel() as JSONModel;
			if (sId === "formatter" || sId === "uom") {
				handleFormatterUomAction(sId, oEvent, oModel);
				onAdvancedFormattingConfigOpen(oEvent, oEvent.getSource().getParent());
			} else if (sId === "criticality") {
				const propertyToBeSet = handleCriticalityAction(sId, oEvent, oModel);
				setCriticalitySourceProperty(propertyToBeSet);
				onAdvancedFormattingConfigOpen(oEvent, oEvent.getSource().getParent());
			} else if (sId === "actions") {
				// do nothing
			} else {
				const sourceItem = oEvent.getParameter("item");
				const customData = sourceItem.getCustomData();
				const customAction = customData.filter((custom: any) => custom.getKey() === "action")[0];
				const actionType = customAction.getValue();
				const source = oEvent.getSource();
				const sPath = source.getBindingContext().getPath();
				const [groupIndex, itemIndex] = sPath.match(/(\d+)/g).map((sValue: any) => Number(sValue));
				const group = oModel.getProperty("/configuration/groups/" + groupIndex);
				const item = group.items[itemIndex];

				if (actionType === "add") {
					let value = "";
					const key = sourceItem.getId();

					switch (key) {
						case "url":
							value = `${item.value}`;
							break;
						case "email":
							value = `mailto: ${item.value}`;
							break;
						case "tel":
							value = `tel: ${item.value}`;
							break;
						default:
							break;
					}

					if (value === "") {
						return;
					}

					const actions = [
						{
							type: "Navigation",
							parameters: {
								url: value
							}
						}
					];

					item["hasActions"] = true;
					item["actionType"] = key;
					item["actions"] = actions;
				}

				if (actionType === "remove" && item.hasActions) {
					delete item.hasActions;
					delete item.actionType;
					delete item.actions;
				}
			}
			oModel.refresh();
			updateCardGroups(oModel);
			transpileIntegrationCardToAdaptive(getDialogModel() as JSONModel);
		}
	};
	if (!context._itemActionsMenu || context?._itemActionsMenu?.isDestroyed()) {
		Fragment.load({
			name: "sap.cards.ap.generator.app.fragments.configuration.ItemActions",
			controller: oController
		}).then(
			function (oMenu: any) {
				context._itemActionsMenu = oMenu;
				const oContext = oSource.getBindingContext();
				oMenu.setBindingContext(oContext);
				oSource.addDependent(oMenu);
				context._itemActionsMenu.open(false, oSource, Popup.Dock.BeginTop, Popup.Dock.BeginBottom, oSource);
			}.bind(oController)
		);
	} else {
		const oContext = oSource.getBindingContext();
		context._itemActionsMenu.setBindingContext(oContext);
		oSource.addDependent(context._itemActionsMenu);
		context._itemActionsMenu.open(false, oSource, Popup.Dock.BeginTop, Popup.Dock.BeginBottom, oSource);
	}
}

/**
 * Handles the formatter Unit of Measure (UoM) action by updating the model properties
 * based on the provided ID, event, and model.
 *
 * @param {string} id - The ID of the formatter UoM action.
 * @param event - The event object triggered by the action.
 * @param {JSONModel} model - The JSON model used to update the configuration properties.
 */
function handleFormatterUomAction(id: string, event: any, model: JSONModel) {
	model?.setProperty("/configuration/popoverContentType", id);
	const path = event.getSource().getBindingContext().getPath();
	const navProp = model.getProperty(path)?.navigationProperty;
	const propertyToBeSet = model.getProperty(path)?.name + (navProp ? "/" + navProp : "");
	model?.setProperty("/configuration/advancedFormattingOptions/targetFormatterProperty", propertyToBeSet);
	model?.setProperty("/configuration/advancedFormattingOptions/sourceUoMProperty", propertyToBeSet);
	const uom = model?.getProperty("/configuration/advancedFormattingOptions/unitOfMeasures");
	const sourceUoMProperty = model?.getProperty("/configuration/advancedFormattingOptions/sourceUoMProperty");
	if (uom.length > 0) {
		const sourceUom = uom.filter((property: { name: string }) => {
			return property.name === sourceUoMProperty;
		})[0];
		if (sourceUom) {
			model?.setProperty("/configuration/advancedFormattingOptions/targetProperty", sourceUom.value);
		}
	}
	if (aPropsWithUoM.length && aPropsWithUoM.indexOf(sourceUoMProperty) === -1) {
		model?.setProperty("/configuration/advancedFormattingOptions/targetProperty", "");
	}
}

/**
 * Handles the criticality action by updating the model properties and returning the derived property path.
 *
 * @param {string} id - The ID of the criticality action.
 * @param event - The event object triggered by the action.
 * @param {JSONModel} model - The JSON model used to update the configuration properties.
 *
 * @returns {string} - The derived property path combining the property name and navigation property.
 */
function handleCriticalityAction(id: string, event: any, model: JSONModel): string {
	model?.setProperty("/configuration/popoverContentType", id);
	const path = event.getSource().getBindingContext().getPath();
	const navProp = model?.getProperty(path)?.navigationProperty;
	let propertyToBeSet = model?.getProperty(path)?.name;
	if (navProp) {
		propertyToBeSet = `${propertyToBeSet}/${navProp}`;
	}
	return propertyToBeSet;
}

function onPreviewTypeChange(oEvent: any) {
	const selectedCardType = oEvent.getSource().getSelectedItem().getBindingContext("previewOptions").getProperty("type");
	const oCard: any = CoreElement.getElementById("cardGeneratorDialog--cardPreview");
	const oAdaptiveCardContainer: any = CoreElement.getElementById("cardGeneratorDialog--adaptiveCardPreviewContainer");
	const oCustomSize: any = CoreElement.getElementById("cardGeneratorDialog--custom-entry");
	oCard.setVisible(false);
	oAdaptiveCardContainer.setVisible(false);
	oCustomSize.setVisible(false);
	switch (selectedCardType) {
		case "adaptive":
			oAdaptiveCardContainer.setVisible(true);
			setTimeout(() => {
				transpileIntegrationCardToAdaptive(getDialogModel() as JSONModel);
			}, 0);
			break;
		case "custom":
			oCard.setVisible(true);
			oCustomSize.setVisible(true);
			break;
		case "integration":
			oCard.setVisible(true);
			oCard.setWidth(oEvent.getSource().getSelectedItem().getBindingContext("previewOptions").getProperty("width"));
			oCard.setHeight(oEvent.getSource().getSelectedItem().getBindingContext("previewOptions").getProperty("height"));
			break;
		default:
			oCard.setVisible(true);
			oCard.setWidth(oEvent.getSource().getSelectedItem().getBindingContext("previewOptions").getProperty("width"));
			oCard.setHeight(oEvent.getSource().getSelectedItem().getBindingContext("previewOptions").getProperty("height"));
			break;
	}
}

/**
 * Update the sap.card.header of the integration card manifest by appling latest text arrangements, unit of measurement and formatters and triggers rendering of the card preview.
 * - This method is triggered when text arrrangement, unit of measurement or formatters are changed.
 */
function updateHeaderArrangements() {
	const oModel = getDialogModel() as JSONModel;
	const currentManifest = getCurrentCardManifest();
	const header = currentManifest["sap.card"].header;
	const subtitle = resolvePropertyPathFromExpression(header.subTitle, currentManifest);
	const unitOfMeasurement = resolvePropertyPathFromExpression(header.unitOfMeasurement, currentManifest);
	const mainIndicatorValue =
		oModel.getProperty("/configuration/navigationValue") || oModel.getProperty("/configuration/mainIndicatorStatusKey");
	const aUnitOfMeasures = oModel.getProperty("/configuration/advancedFormattingOptions/unitOfMeasures");
	const aTextArrangements = oModel.getProperty("/configuration/advancedFormattingOptions/textArrangements");
	const aPropertyValueFormatters: FormatterConfigurationMap = oModel.getProperty(
		"/configuration/advancedFormattingOptions/propertyValueFormatters"
	);

	const sapCardHeader = {
		"sap.card": {
			header: {
				mainIndicator: {
					number:
						mainIndicatorValue &&
						getArrangements(`{${mainIndicatorValue}}`, {
							unitOfMeasures: aUnitOfMeasures,
							textArrangements: aTextArrangements,
							propertyValueFormatters: aPropertyValueFormatters
						})
				},
				subTitle: getArrangements(subtitle, {
					unitOfMeasures: aUnitOfMeasures,
					textArrangements: aTextArrangements,
					propertyValueFormatters: aPropertyValueFormatters
				}),
				unitOfMeasurement: getArrangements(unitOfMeasurement, {
					unitOfMeasures: aUnitOfMeasures,
					textArrangements: aTextArrangements,
					propertyValueFormatters: aPropertyValueFormatters
				})
			}
		}
	};
	oModel.setProperty("/configuration/isEdited", true);
	const oManifest = merge(currentManifest, sapCardHeader) as CardManifest;
	renderCardPreview(oManifest, getDialogModel() as JSONModel);
}

function updateArrangements() {
	const oModel = getDialogModel() as JSONModel;
	updateHeaderArrangements();
	const groups: ObjectCardGroups[] = oModel.getProperty("/configuration/groups");
	groups?.forEach(function (group) {
		group?.items?.forEach((groupItem) => {
			if (groupItem.name && groupItem.name !== "") {
				const groupItemValue = groupItem.isNavigationEnabled ? `${groupItem.name}/${groupItem.navigationProperty}` : groupItem.name;
				groupItem.value = getArrangements(`{${groupItemValue}}`, {
					unitOfMeasures: oModel.getProperty("/configuration/advancedFormattingOptions/unitOfMeasures"),
					textArrangements: oModel.getProperty("/configuration/advancedFormattingOptions/textArrangements"),
					propertyValueFormatters: oModel.getProperty("/configuration/advancedFormattingOptions/propertyValueFormatters")
				});
			}
		});
	});
	oModel.refresh();
	updateCardGroups(oModel);
	transpileIntegrationCardToAdaptive(getDialogModel() as JSONModel);
}

function updateCriticality(isCalcuationType: boolean) {
	const currentManifest = getCurrentCardManifest();
	const oModel = getDialogModel() as JSONModel;
	const mainIndicator = currentManifest["sap.card"].header.mainIndicator;
	const groups = (currentManifest["sap.card"].content as ObjectContent).groups;

	if (!mainIndicator && groups.length < 1) {
		return;
	}
	let oManifest;
	if (mainIndicator) {
		const mainIndicatorValue = resolvePropertyPathFromExpression(mainIndicator.number, currentManifest);
		const sapCardHeader = {
			"sap.card": {
				header: {
					mainIndicator: {
						state: getCriticality(mainIndicatorValue || mainIndicator.number, isCalcuationType)
					}
				}
			}
		};
		oManifest = merge(currentManifest, sapCardHeader) as CardManifest;
	} else {
		oManifest = currentManifest;
	}
	oModel.setProperty("/configuration/isEdited", true);
	renderCardPreview(oManifest, getDialogModel() as JSONModel);
	updateCardGroups(oModel);
	transpileIntegrationCardToAdaptive(getDialogModel() as JSONModel);
}

async function checkForNavigationProperty(event: Event, isTextArrangement?: boolean) {
	const selectedParameters = event.getParameters() as EventParameters;
	const selectedItem = selectedParameters.selectedItem;
	if (!selectedItem) return;
	const model = getDialogModel() as JSONModel;
	const navigationProperties: NavigationParameter[] = model.getProperty("/configuration/navigationProperty") || [];
	const selectedNavigationalProperties: NavigationalData[] = model.getProperty("/configuration/selectedNavigationalProperties") || [];

	const existingIndex = selectedNavigationalProperties.findIndex((navItem) => navItem.name === (selectedItem.value || selectedItem.name));
	const selectedProperty = navigationProperties.find((prop) => prop.name === (selectedItem.value || selectedItem.name));

	const { name: selectedPropertyName = "", properties: selectedPropertyValues = [] } = selectedProperty || {};

	const data: NavigationalData = { name: selectedPropertyName, value: selectedPropertyValues };

	if (existingIndex === -1 && selectedProperty) {
		selectedNavigationalProperties.push(data);
	}
	model.setProperty("/configuration/selectedNavigationalProperties", selectedNavigationalProperties);

	if (selectedProperty) {
		await updateCardConfigurationData(selectedProperty.name, data);
		if (selectedParameters.textArrangementChanged) {
			selectedItem.navigationalPropertiesForId = data.value;
			selectedItem.isNavigationForId = data.value.length > 0;
			selectedItem.navigationKeyForId = "";
		} else {
			selectedItem.navigationalPropertiesForDescription = data.value;
			if (isTextArrangement) {
				selectedItem.isNavigationForDescription = data.value.length > 0;
				selectedItem.navigationKeyForDescription = "";
			}
		}
		if (isTextArrangement) {
			selectedItem.value = ""; // to reset navigation combobox value in the card and dropdown.
		}
	} else {
		if (selectedParameters.textArrangementChanged) {
			selectedItem.isNavigationForId = false;
			selectedItem.navigationKeyForId = "";
		} else {
			selectedItem.isNavigationForDescription = false;
			selectedItem.navigationKeyForDescription = "";
		}
	}
}

export function toggleOffAdvancedPanel() {
	const dialog = CoreElement.getElementById("cardGeneratorDialog--cardGeneratorDialog") as Dialog;
	const toggleButton = (dialog.getCustomHeader() as MenuBar).getContentMiddle()[4] as ToggleButton;

	if (toggleButton.getPressed()) {
		toggleButton.setPressed(false);
		const toggleEvent = new Event("toggle", toggleButton, {});
		toggleAdvancedSetting(toggleEvent);
	}
}

async function toggleAdvancedSetting(toggleEvent: Event) {
	const toggleButton: ToggleButton = toggleEvent.getSource();
	toggleButton.setEnabled(false);

	const splitter = CoreElement.getElementById("cardGeneratorDialog--contentSplitter") as Splitter;
	const controller = {
		onCriticalityChange: async (criticalityChangeEvent: Event<{ isCalcuationType: boolean }>) => {
			await checkForNavigationProperty(criticalityChangeEvent, false);
			updateCriticality(criticalityChangeEvent.getParameter("isCalcuationType") || false);
		},
		onArrangementsChange: async (arrangementChangeEvent: Event) => {
			await checkForNavigationProperty(arrangementChangeEvent, true);
			updateArrangements();
			const dialogModel = getDialogModel() as JSONModel;
			const groups = dialogModel.getProperty("/configuration/groups");
			dialogModel.setProperty("/configuration/isEdited", true);
			for (let i = 0; i < groups?.[0].items.length; i++) {
				const item = groups[0].items[i];
				const uom = item.value.split(" ")[1] && item.value.split(" ")[1].slice(1, -1);

				if (uom !== "undefined" && uom !== undefined) {
					dialogModel.setProperty("/configuration/advancedFormattingOptions/targetProperty", uom);
				} else if (uom === undefined) {
					dialogModel.setProperty("/configuration/advancedFormattingOptions/targetProperty", "");
				}

				if (uom !== "undefined" && uom !== undefined && aPropsWithUoM?.indexOf(item?.name) === -1) {
					aPropsWithUoM.push(item?.name);
				}
			}
		},
		onPropertyFormatterChangeFromAdvancedSettings: function () {
			updateHeaderArrangements();
		}
	};

	await Fragment.load({
		name: "sap.cards.ap.generator.app.fragments.AdvancedSettings",
		controller: controller
	}).then(function (advancedSettings: Control | Control[]) {
		if (!toggleButton.getPressed()) {
			const lastContentArea = splitter.getContentAreas()[1]; // position 1 is the advance panel
			splitter.removeContentArea(lastContentArea);
		} else {
			splitter.insertContentArea(advancedSettings as Control, 1); // position 1 is the advance panel
		}
		toggleButton.setEnabled(true);
		setTimeout(() => {
			transpileIntegrationCardToAdaptive(getDialogModel() as JSONModel);
		}, 0);
	});
}

function setDefaultCardPreview() {
	const comboBox = CoreElement.getElementById("cardGeneratorDialog--preview-select") as ComboBox;
	if (comboBox) {
		const selectedKey = comboBox.getSelectedKey();
		if (selectedKey !== "int-default") {
			comboBox.setSelectedKey("int-default");
			const defaultIntegrationCard = CoreElement.getElementById("cardGeneratorDialog--cardPreview") as Card;
			const adaptiveCardContainer = CoreElement.getElementById("cardGeneratorDialog--adaptiveCardPreviewContainer") as Control;
			const customIntegrationCard = CoreElement.getElementById("cardGeneratorDialog--custom-entry") as Control;
			adaptiveCardContainer.setVisible(false);
			customIntegrationCard.setVisible(false);
			defaultIntegrationCard.setVisible(true);

			const previewHostsProperties = getDialogModel("previewOptions").getProperty("/hosts");
			const defaultPreviewOption = previewHostsProperties.find((option: Host) => option.key === "int-default");
			defaultIntegrationCard.setWidth(defaultPreviewOption.width);
			defaultIntegrationCard.setHeight(defaultPreviewOption.height);
		}
	}
}

function onBeforeDialogClosed(oEvent: object) {
	const oModel = getDialogModel() as JSONModel;
	const isDialogEdited = oModel?.getProperty("/configuration/isEdited");
	const resourceBundle = (getDialogModel("i18n") as ResourceModel)?.getResourceBundle() as ResourceBundle;
	const warningMessage = resourceBundle?.getText("GENERATOR_UNSAVED_CHANGE_WARNING") || "";
	if (isDialogEdited) {
		MessageBox.warning(warningMessage, {
			actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
			emphasizedAction: MessageBox.Action.OK,
			onClose: function (sAction: string) {
				if (sAction === "OK") {
					oModel.setProperty("/configuration/isEdited", false);
					toggleOffAdvancedPanel();
					closeDialog();
				}
			}
		});
		oEvent.preventDefault();
	}
}
