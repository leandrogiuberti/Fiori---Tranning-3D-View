/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
import type ResourceBundle from "sap/base/i18n/ResourceBundle";
import { getKeyParameters } from "sap/cards/ap/common/services/RetrieveCard";
import type Component from "sap/ui/core/Component";
import CoreLib from "sap/ui/core/Lib";
import { ValueState } from "sap/ui/core/library";
import type { CardManifest } from "sap/ui/integration/widgets/Card";
import JSONModel from "sap/ui/model/json/JSONModel";
import type V2ODataModel from "sap/ui/model/odata/v2/ODataModel";
import type V4ODataModel from "sap/ui/model/odata/v4/ODataModel";
import type ResourceModel from "sap/ui/model/resource/ResourceModel";
import type { ArrangementOptions } from "../app/controls/ArrangementsEditor";
import { createURLParams } from "../helpers/Batch";
import { PropertyInfoMap } from "../odata/ODataTypes";
import {
	createPathWithEntityContext,
	fetchDataAsync,
	getLabelForEntitySet,
	getNavigationPropertyInfoFromEntity,
	getPropertyInfoFromEntity
} from "../odata/ODataUtils";
import { Application, ODataModelVersion } from "../pages/Application";
import { ActionStyles, AnnotationAction, ControlProperties } from "../types/ActionTypes";
import type { NavigationParameter, NavigationProperty, ObjectCardGroups, UnitOfMeasures } from "../types/PropertyTypes";
import { getCardActionInfo } from "./FooterActions";
import {
	FormatterConfigurationMap,
	formatPropertyDropdownValues,
	getDefaultPropertyFormatterConfig,
	getDefaultPropertyFormatterConfigForNavProperties
} from "./Formatter";
import {
	getUpdatedUnitOfMeasures,
	parseCard,
	updateCriticalityForNavProperty,
	type CriticalityOptionsPanel,
	type ParsedManifest
} from "./IntegrationCardHelper";
import {
	getNavigationPropertiesWithLabel,
	getNavigationPropertyInfo,
	getNavigationPropertyInfoGroups,
	updateNavigationPropertiesWithLabel
} from "./NavigationProperty";

export type EntityType = {
	[key: string]: any;
};

export type CriticalityOptions = {
	activeCalculation: boolean;
	name: string;
	criticality: string;
	navigationKeyForId?: string;
	navigationKeyForDescription?: string;
	navigationProperty?: string;
	isNavigationForDescription?: boolean;
	isNavigationForId?: boolean;
	propertyKeyForId?: string;
	navigationalPropertiesForId?: Array<object>;
};

export type MainIndicatorOptions = {
	criticality: Array<CriticalityOptions>;
};

type AdvancedFormattingOptions = {
	unitOfMeasures: Array<UnitOfMeasures>;
	textArrangements: Array<ArrangementOptions>;
	propertyValueFormatters: Array<object>;
	sourceCriticalityProperty: Array<object>;
	targetFormatterProperty: string;
	sourceUoMProperty: string;
	selectedKeyCriticality: string;
	textArrangementSourceProperty: string;
};

export type TrendOptions = {
	referenceValue: string;
	downDifference: string;
	upDifference: string;
	targetValue?: string;
	sourceProperty?: string;
};
export type SideIndicatorOptions = {
	targetValue: string;
	targetUnit: string;
	deviationValue: string;
	deviationUnit: string;
	sourceProperty?: string;
};

type CardActions = {
	annotationActions: Array<AnnotationAction>;
	addedActions: ControlProperties[];
	bODataV4: boolean;
	styles: ActionStyles[];
	isAddActionEnabled: boolean;
	actionExists: boolean;
};

type PropertyValue = string | null | undefined;

export type TrendOrIndicatorOptions = {
	sourceProperty: string;
};

type KeyParameter = {
	key: string;
	formattedValue: string;
};

/**
 * Description for the interface CardGeneratorDialogConfiguration
 * @interface CardGeneratorDialogConfiguration
 * @property {string} title The title of the card
 * @property {string} subtitle The subtitle of the card
 * @property {string} headerUOM The header unit of measure
 * @property {MainIndicatorOptions} mainIndicatorOptions The main indicator options
 * @property {string} mainIndicatorStatusKey The main indicator status key
 * @property {string} navigationValue The navigation value
 * @property {string} mainIndicatorStatusUnit The main indicator status unit
 * @property {NavigationProperty[]} selectedNavigationalProperties The selected navigational properties
 * @property {string} mainIndicatorNavigationSelectedValue The main indicator navigation selected value
 * @property {string} mainIndicatorNavigationSelectedKey The main indicator navigation selected key
 * @property {string} entitySet The entity set
 * @property {PropertyInfoMap} propertiesWithNavigation The properties with navigation
 * @property {Array<ObjectCardGroups>} groups The groups of the card displayed on content
 * @property {Array<object>} properties The properties
 * @property {AdvancedFormattingOptions} advancedFormattingOptions The advanced formatting options
 * @property {Array<object>} selectedTrendOptions The selected trend options
 * @property {Array<object>} selectedIndicatorOptions The selected indicator options
 * @property {Array<object>} navigationProperty The navigation property
 * @property {Array<NavigationParameter>} selectedContentNavigation The selected content navigation
 * @property {Array<NavigationParameter>} selectedHeaderNavigation The selected header navigation
 * @property {NavigationProperty} selectedNavigationPropertyHeader The selected navigation property header
 * @property {TrendOptions} trendOptions The trend options
 * @property {SideIndicatorOptions} indicatorsValue The indicators value
 * @property {boolean} oDataV4 Flag to check if the OData version is V4
 * @property {string} serviceUrl The service URL
 * @property {object} $data Data used for adaptive card preview
 * @property {object} targetUnit The target unit
 * @property {object} deviationUnit The deviation unit
 * @property {Array<object>} errorControls The error controls
 * @property {CardActions} actions The card actions
 * @property {boolean} groupLimitReached Flag maintained to check if the group limit is reached
 * @property {Array<KeyParameter>} keyParameters The key parameters
 * @property {string} appIntent The app intent
 */
interface CardGeneratorDialogConfiguration {
	title: string;
	subtitle?: string;
	headerUOM?: string;
	mainIndicatorOptions?: MainIndicatorOptions;
	mainIndicatorStatusKey?: string;
	navigationValue: string;
	mainIndicatorStatusUnit?: string;
	selectedNavigationalProperties: NavigationProperty[];
	mainIndicatorNavigationSelectedValue?: string;
	mainIndicatorNavigationSelectedKey?: string;
	entitySet: string;
	propertiesWithNavigation: PropertyInfoMap;
	groups: Array<ObjectCardGroups>;
	properties: Array<object>;
	advancedFormattingOptions: AdvancedFormattingOptions;
	selectedTrendOptions: Array<TrendOptions>;
	selectedIndicatorOptions: Array<SideIndicatorOptions>;
	navigationProperty: Array<object>;
	selectedContentNavigation: Array<NavigationParameter>;
	selectedHeaderNavigation: Array<NavigationParameter>;
	selectedNavigationPropertyHeader: NavigationProperty;
	trendOptions: TrendOptions;
	indicatorsValue?: SideIndicatorOptions;
	oDataV4: boolean;
	serviceUrl: string;
	$data?: object;
	targetUnit?: object;
	deviationUnit?: object;
	errorControls: Array<object>;
	actions: CardActions;
	groupLimitReached: boolean;
	keyParameters: Array<KeyParameter>;
	appIntent: string;
	isEdited?: boolean;
}

interface CardGeneratorDialog {
	title: string;
	configuration: CardGeneratorDialogConfiguration;
}

const UnitCollection = [
	{
		Name: "K",
		Value: "K"
	},
	{
		Name: "%",
		Value: "%"
	}
];

/**
 * Merges the default property formatters with the user provided property formatters
 *
 * @param {FormatterConfigurationMap} defaultPropertyFormatters The default property formatters
 * @param {FormatterConfigurationMap} userProvidedPropertyFormatters The user provided property formatters
 * @returns {FormatterConfigurationMap} The merged property formatters
 * @private
 *
 */
export function _mergePropertyFormatters(
	defaultPropertyFormatters: FormatterConfigurationMap = [],
	userProvidedPropertyFormatters: FormatterConfigurationMap = []
): FormatterConfigurationMap {
	const mergedFormatters = [...userProvidedPropertyFormatters] as FormatterConfigurationMap;

	for (const propertyFormatter of defaultPropertyFormatters) {
		if (!mergedFormatters.find((formatter) => formatter.property === propertyFormatter.property)) {
			mergedFormatters.push({ ...propertyFormatter });
		}
	}

	return mergedFormatters;
}

/**
 * Generates the card generator dialog model.
 *
 * @param {Component} appComponent - The root component of the application.
 * @param {CardManifest} [mCardManifest] - The card manifest object (optional).
 * @returns {Promise<JSONModel>} A promise that resolves to the card generator dialog model.
 */
export const getCardGeneratorDialogModel = async (appComponent: Component, mCardManifest?: CardManifest) => {
	const applicationInstance = Application.getInstance();
	const applicationDetails = applicationInstance.fetchDetails();
	const resourceBundle = CoreLib.getResourceBundleFor("sap.cards.ap.generator.i18n");
	const sapApp = appComponent.getManifestEntry("sap.app");
	const appModel = appComponent.getModel();
	const cardTitle = sapApp.title;
	const cardSubtitle = sapApp.description;
	const { entitySetWithObjectContext, serviceUrl, semanticObject, action, odataModel } = applicationDetails;
	const entitySetName = applicationDetails.entitySet;
	const bODataV4 = odataModel === ODataModelVersion.V4;
	const entitySet = getLabelForEntitySet(bODataV4 ? (appModel as V4ODataModel) : (appModel as V2ODataModel), entitySetName);
	const properties = getPropertyInfoFromEntity(bODataV4 ? (appModel as V4ODataModel) : (appModel as V2ODataModel), entitySetName, false);
	const propertiesWithNavigation = getPropertyInfoFromEntity(
		bODataV4 ? (appModel as V4ODataModel) : (appModel as V2ODataModel),
		entitySetName,
		true,
		resourceBundle
	);
	const navigationProperty = getNavigationPropertyInfoFromEntity(
		bODataV4 ? (appModel as V4ODataModel) : (appModel as V2ODataModel),
		entitySetName
	);

	const urlParameters = createURLParams(properties);

	const path = await createPathWithEntityContext(
		entitySetWithObjectContext,
		bODataV4 ? (appModel as V4ODataModel) : (appModel as V2ODataModel),
		bODataV4
	);
	const data = await fetchDataAsync(serviceUrl, path, bODataV4, urlParameters);
	const unitOfMeasures: Array<UnitOfMeasures> = [];
	const mData: Record<string, PropertyValue> = {};
	// We are adding labels and values for properties
	addLabelsForProperties(properties, data, mData, unitOfMeasures);

	let propertyValueFormatters = getPropertyFormatters(resourceBundle, properties, navigationProperty);

	let parsedManifest;

	if (mCardManifest) {
		parsedManifest = parseCard(mCardManifest, appComponent.getModel("i18n") as ResourceModel, properties);
		await processParsedManifest(parsedManifest, navigationProperty, path, mData, mCardManifest);
	}

	propertyValueFormatters = _mergePropertyFormatters(propertyValueFormatters, parsedManifest?.formatterConfigurationFromCardManifest);
	addLabelsForProperties(propertiesWithNavigation, data, mData, unitOfMeasures);

	const parseManifestMainIndicatorOptions = parsedManifest?.mainIndicatorOptions;
	const mainIndicatorStatusKey = parseManifestMainIndicatorOptions?.mainIndicatorStatusKey || "";
	const trends = parseManifestMainIndicatorOptions?.trendOptions;
	const sideIndicators = parsedManifest?.sideIndicatorOptions;
	const mainIndicatorNavigationSelectedKey = parseManifestMainIndicatorOptions?.mainIndicatorNavigationSelectedKey || "";
	const selectedNavigationalProperties = [];
	const { propertiesWithLabel, navigationPropertyData } = await getNavigationPropertiesWithLabel(
		appComponent,
		mainIndicatorStatusKey,
		path
	);
	const selectedNavigationPropertyHeader = {
		name: mainIndicatorStatusKey,
		value: propertiesWithLabel
	};

	if (selectedNavigationPropertyHeader?.value) {
		updateNavigationPropertiesWithLabel(navigationProperty, mainIndicatorStatusKey, selectedNavigationPropertyHeader.value);
	}

	if (mainIndicatorStatusKey.length > 0 && (mData[mainIndicatorStatusKey] === null || mData[mainIndicatorStatusKey] === undefined)) {
		mData[mainIndicatorStatusKey] = navigationPropertyData[mainIndicatorStatusKey];
	}

	if (selectedNavigationPropertyHeader.name) {
		selectedNavigationalProperties.push(selectedNavigationPropertyHeader);
	}

	const mainIndicatorNavigationSelectedValue = getMainIndicatorSelectedNavigationProperty(
		selectedNavigationPropertyHeader,
		mainIndicatorNavigationSelectedKey
	);
	const advancedFormattingOptions = await getAdvancedFormattingOptions(unitOfMeasures, propertyValueFormatters, parsedManifest, path);
	const mainIndicatorStatusUnit = getMainIndicatorStatusUnit(mainIndicatorStatusKey, propertiesWithNavigation);
	const dialogModelData: CardGeneratorDialog = {
		title: `${entitySet}`,
		configuration: {
			title: parsedManifest?.title || cardTitle,
			subtitle: parsedManifest?.subtitle || cardSubtitle,
			headerUOM: parsedManifest?.headerUOM || "",
			mainIndicatorOptions: {
				criticality: (parseManifestMainIndicatorOptions?.criticalityOptions || []) as CriticalityOptions[]
			},
			advancedFormattingOptions: advancedFormattingOptions,
			trendOptions: trends as TrendOptions,
			indicatorsValue: sideIndicators,
			selectedTrendOptions: trends ? [trends] : [],
			selectedIndicatorOptions: sideIndicators ? [sideIndicators] : [],
			selectedNavigationPropertyHeader,
			selectedContentNavigation: [],
			selectedHeaderNavigation: [],
			navigationProperty,
			mainIndicatorNavigationSelectedValue,
			mainIndicatorStatusKey,
			navigationValue: parseManifestMainIndicatorOptions?.navigationValue || "",
			mainIndicatorNavigationSelectedKey,
			mainIndicatorStatusUnit,
			selectedNavigationalProperties,
			entitySet: entitySetName,
			oDataV4: bODataV4,
			serviceUrl: serviceUrl,
			properties: properties,
			propertiesWithNavigation: propertiesWithNavigation,
			groups: (parsedManifest?.groups as ObjectCardGroups[]) || [
				{
					title: resourceBundle?.getText("GENERATOR_DEFAULT_GROUP_NAME", [1]),
					items: [
						{
							label: "",
							value: "",
							isEnabled: false,
							name: "",
							navigationProperty: "",
							isNavigationEnabled: false
						}
					]
				}
			],
			$data: mData,
			targetUnit: UnitCollection,
			deviationUnit: UnitCollection,
			errorControls: [],
			actions: await getCardActionInfo(mData, appComponent.getModel("i18n") as ResourceModel, mCardManifest),
			groupLimitReached: false,
			keyParameters: await getKeyParameters(appComponent),
			appIntent: `${semanticObject}-${action}`,
			isEdited: false
		}
	};

	return new JSONModel(dialogModelData).attachPropertyChange(function () {
		dialogModelData.configuration.isEdited = true;
	});
};

/**
 * Adds labels for properties and updates the unit of measures array.
 *
 * @param {PropertyInfoMap} properties - The map of properties to be updated with labels.
 * @param {Record<string, unknown>} data - The data record containing property values.
 * @param {Record<string, PropertyValue>} mData - The map to store updated property values.
 * @param {Array<object>} unitOfMeasures - The array of unit of measures to be updated.
 */
export function addLabelsForProperties(
	properties: PropertyInfoMap,
	data: Record<string, unknown>,
	mData: {
		[key: string]: PropertyValue;
	},
	unitOfMeasures: Array<object>
) {
	const unitOfMeasuresMap = new Map((unitOfMeasures as UnitOfMeasures[]).map((uom) => [uom.name, uom]));

	properties.forEach((property) => {
		const propertyName = property.name;
		const propertyValue = data[propertyName];
		const propertyUOM = property.UOM;

		if (propertyName && propertyValue !== undefined && propertyValue !== null) {
			const value = formatPropertyDropdownValues(property, propertyValue as string);
			property.value = propertyValue as string;
			property.labelWithValue = value;

			if (propertyUOM && !unitOfMeasuresMap.has(propertyName)) {
				unitOfMeasures.push({
					propertyKeyForDescription: propertyUOM,
					name: propertyName,
					propertyKeyForId: propertyName,
					value: propertyUOM,
					valueState: ValueState.None,
					valueStateText: ""
				});
			}
			mData[propertyName] = propertyValue as string;
		} else {
			property.labelWithValue = property.category ? `${property.label}` : `${property.label} (<empty>)`;
		}
	});
}

/**
 * Gets the property formatters for the card generator dialog.
 * The property formatters are merged from the default property formatters and the navigational property formatters.
 *
 * @param {ResourceBundle} resourceBundle The resource bundle
 * @param {PropertyInfoMap} properties The properties
 * @param {NavigationParameter} navigationProperty The navigation property
 * @returns
 */
function getPropertyFormatters(resourceBundle: ResourceBundle, properties: PropertyInfoMap, navigationProperty: NavigationParameter[]) {
	const propertyValueFormatters = getDefaultPropertyFormatterConfig(resourceBundle, properties);
	const propertyValueFormattersForNavigationalProperties = getDefaultPropertyFormatterConfigForNavProperties(
		resourceBundle,
		navigationProperty as unknown as PropertyInfoMap
	);
	return _mergePropertyFormatters(propertyValueFormatters, propertyValueFormattersForNavigationalProperties);
}

/**
 *
 * Process the parsed manifest to get the navigation property information.
 *
 * @param {ParsedManifest} parsedManifest The parsed card manifest
 * @param {NavigationParameter} navigationProperty
 * @param {string} path
 * @param {Record<string, PropertyValue>} mData
 * @param {CardManifest} mCardManifest
 */
async function processParsedManifest(
	parsedManifest: ParsedManifest,
	navigationProperty: NavigationParameter[],
	path: string,
	mData: Record<string, PropertyValue>,
	mCardManifest: CardManifest
) {
	for (const textArrangement of parsedManifest.textArrangementsFromCardManifest) {
		const navigationPropInfo = await getNavigationPropertyInfo(textArrangement, navigationProperty, path);

		if (navigationPropInfo) {
			for (const navProperty of navigationPropInfo) {
				const { navigationEntitySet, navigationPropertyData } = navProperty;
				if (mData[navigationEntitySet] === null || mData[navigationEntitySet] === undefined) {
					mData[navigationEntitySet] = navigationPropertyData[navigationEntitySet];
				}
			}
		}
	}

	for (const group of parsedManifest.groups) {
		for (const item of (group as ObjectCardGroups).items) {
			const navigationPropertyInfoGroups = await getNavigationPropertyInfoGroups(item, navigationProperty, path, mCardManifest);

			if (navigationPropertyInfoGroups) {
				const { navigationEntitySet, navigationPropertyData } = navigationPropertyInfoGroups;
				if (mData[navigationEntitySet] === null || mData[navigationEntitySet] === undefined) {
					mData[navigationEntitySet] = navigationPropertyData[navigationEntitySet];
				}
			}
		}
	}
}

/**
 * Retrieves the advanced formatting options for the card generator.
 *
 * @param {UnitOfMeasures[]} unitOfMeasures - The array of unit of measures.
 * @param {FormatterConfigurationMap} propertyValueFormatters - The map of property value formatters.
 * @param {ParsedManifest} [parsedManifest] - The parsed manifest object (optional).
 * @returns {Promise<AdvancedFormattingOptions>} A promise that resolves to the advanced formatting options.
 */
async function getAdvancedFormattingOptions(
	unitOfMeasures: UnitOfMeasures[],
	propertyValueFormatters: FormatterConfigurationMap,
	parsedManifest?: ParsedManifest,
	path: string = ""
): Promise<AdvancedFormattingOptions> {
	const formatterConfigsWithUnit =
		parsedManifest?.formatterConfigurationFromCardManifest.filter(
			(formatterConfig) => formatterConfig.formatterName === "format.unit"
		) || [];
	const mainIndicatorOptions = parsedManifest?.mainIndicatorOptions;
	let mainIndicatorCriticalityOptions = (mainIndicatorOptions?.criticalityOptions || []) as CriticalityOptionsPanel;
	mainIndicatorCriticalityOptions = await updateCriticalityForNavProperty(mainIndicatorCriticalityOptions, path);
	const selectedKeyCriticality = mainIndicatorCriticalityOptions.length ? mainIndicatorCriticalityOptions[0]?.criticality : "";
	const mainIndicatorStatusKey = mainIndicatorOptions?.mainIndicatorStatusKey || "";
	return {
		unitOfMeasures:
			formatterConfigsWithUnit.length > 0
				? await getUpdatedUnitOfMeasures(unitOfMeasures, formatterConfigsWithUnit, path)
				: unitOfMeasures,
		textArrangements: parsedManifest?.textArrangementsFromCardManifest || [],
		propertyValueFormatters: propertyValueFormatters,
		sourceCriticalityProperty: [],
		targetFormatterProperty: "",
		sourceUoMProperty: mainIndicatorStatusKey,
		selectedKeyCriticality: selectedKeyCriticality,
		textArrangementSourceProperty: mainIndicatorStatusKey
	};
}

/**
 * Retrieves the label with value for the main indicator's selected navigation property.
 *
 *
 * @param {Record<string, any>} selectedNavigationPropertyHeader - The selected navigation property header containing the properties.
 * @param {string} mainIndicatorNavigationSelectedKey - The key of the main indicator's selected navigation property.
 * @returns {string} The label with value of the selected navigation property, or an empty string if not found.
 */
function getMainIndicatorSelectedNavigationProperty(
	selectedNavigationPropertyHeader: Record<string, any>,
	mainIndicatorNavigationSelectedKey: string
): string {
	return (
		selectedNavigationPropertyHeader.value.find(
			(value: { name: string; labelWithValue: string }) => value.name === mainIndicatorNavigationSelectedKey
		)?.labelWithValue || ""
	);
}

/**
 * Retrieves the label with value for the main indicator's status unit.
 *
 * @param {string} mainIndicatorStatusKey - The key of the main indicator's status property.
 * @param {PropertyInfoMap} propertiesWithNavigation - The map of properties with navigation.
 * @returns {string} The label with value of the main indicator's status unit, or an empty string if not found.
 */
function getMainIndicatorStatusUnit(mainIndicatorStatusKey: string, propertiesWithNavigation: PropertyInfoMap): string {
	return (
		(mainIndicatorStatusKey && propertiesWithNavigation.find((property) => property.name === mainIndicatorStatusKey)?.labelWithValue) ||
		""
	);
}
