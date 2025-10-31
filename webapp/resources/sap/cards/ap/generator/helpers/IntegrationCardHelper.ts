/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
import { handleSingleProperty, isSingleKeyWithoutAssignment } from "sap/cards/ap/common/odata/ODataUtils";
import { getNavigationPropertiesWithLabel } from "sap/cards/ap/generator/helpers/NavigationProperty";
import { getPropertyReference } from "sap/cards/ap/generator/odata/v2/MetadataAnalyzer";
import { getPropertyReferenceKey } from "sap/cards/ap/generator/odata/v4/MetadataAnalyzer";
import VersionInfo from "sap/ui/VersionInfo";
import Component from "sap/ui/core/Component";
import CoreElement from "sap/ui/core/Element";
import Card, {
	CardConfigParameters,
	CardManifest,
	Group,
	GroupItems,
	ObjectContent,
	PropertyFormattingParameters
} from "sap/ui/integration/widgets/Card";
import type JSONModel from "sap/ui/model/json/JSONModel";
import V2OdataUtils from "sap/ui/model/odata/ODataUtils";
import { default as V2ODataModel } from "sap/ui/model/odata/v2/ODataModel";
import { default as V4ODataModel } from "sap/ui/model/odata/v4/ODataModel";
import V4ODataUtils from "sap/ui/model/odata/v4/ODataUtils";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import { ArrangementOptions } from "../app/controls/ArrangementsEditor";
import { PropertyInfoMap } from "../odata/ODataTypes";
import { getDataType, isODataV4Model } from "../odata/ODataUtils";
import { Application, LibVersionInfo, ODataModelVersion } from "../pages/Application";
import { ColorIndicator } from "../types/CommonTypes";
import type { UnitOfMeasures } from "../types/PropertyTypes";
import { extractValueWithoutBooleanExprBinding, getColorForGroup, hasBooleanBindingExpression } from "../utils/CommonUtils";
import { updateManifestWithExpandQueryParams, updateManifestWithSelectQueryParams } from "./Batch";
import type { CriticalityOptions, SideIndicatorOptions, TrendOptions } from "./CardGeneratorModel";
import type { FormatterConfiguration, FormatterConfigurationMap } from "./Formatter";
import { getYesAndNoTextValues, resolveI18nTextFromResourceModel } from "./I18nHelper";
import {
	extractPathExpressionWithoutUOM,
	extractPathWithoutUOM,
	extractPropertyConfigurationWithoutTextArrangement,
	getTextArrangementFromCardManifest,
	hasFormatter,
	isExpression,
	isI18nExpression,
	updateAndGetSelectedFormatters
} from "./PropertyExpression";

export type ParsedManifest = {
	title: string;
	subtitle: string;
	headerUOM: string;
	mainIndicatorOptions: {
		mainIndicatorStatusKey: string;
		criticalityOptions: Array<object>;
		mainIndicatorNavigationSelectedKey: string;
		navigationValue: string;
		trendOptions: TrendOptions;
	};
	sideIndicatorOptions: SideIndicatorOptions;
	groups: Array<object>;
	formatterConfigurationFromCardManifest: FormatterConfigurationMap;
	textArrangementsFromCardManifest: Array<ArrangementOptions>;
};

export type CriticalityOptionsPanel = CriticalityOptions[];

let manifest: CardManifest;
const formatterConfigurationFromCardManifest: FormatterConfigurationMap = [];

export function createInitialManifest(props: any) {
	const {
		title,
		subTitle,
		description,
		service,
		serviceModel,
		sapAppId,
		sapCoreVersionInfo,
		entitySetName,
		entitySetWithObjectContext,
		data
	} = props;
	const bODataV4 = isODataV4Model(serviceModel);
	if (!bODataV4) {
		formatDataForV2(entitySetWithObjectContext, data);
	}
	const dataPath = bODataV4 ? "/content/" : "/content/d/";
	const dataPathHeader = bODataV4 ? "/header/" : "/header/d/";
	const propertyReferenceKeys = bODataV4
		? getPropertyReferenceKey(serviceModel, entitySetName)
		: getPropertyReference(serviceModel, entitySetName);
	const entityKeyPropertiesParameters: Record<string, { type: string; value: string | boolean }> = {};

	const { yesText, noText } = getYesAndNoTextValues();
	propertyReferenceKeys.forEach((keyProp) => {
		if (keyProp.type === "Edm.Boolean" && typeof data[keyProp.name] === "string") {
			data[keyProp.name] = data[keyProp.name] === yesText;
		}
		entityKeyPropertiesParameters[keyProp.name] = {
			type: getDataType(keyProp.type),
			value: data[keyProp.name]
		};
	});

	const entityKeyProperties = propertyReferenceKeys.map((keyProp) => keyProp.name);

	manifest = {
		_version: "1.15.0",
		"sap.app": {
			id: `${sapAppId}.cards.op.${entitySetName}`,
			type: "card",
			i18n: "../../../i18n/i18n.properties",
			title: title,
			subTitle: subTitle,
			description: description,
			applicationVersion: {
				version: "1.0.0"
			}
		},
		"sap.ui": {
			technology: "UI5",
			icons: {
				icon: "sap-icon://switch-classes"
			}
		},
		"sap.card": {
			extension: "module:sap/cards/ap/common/extensions/BaseIntegrationCardExtension",
			type: "Object",
			configuration: {
				parameters: {
					...entityKeyPropertiesParameters,
					_contentSelectQuery: {
						value: entityKeyProperties?.length ? `$select=${entityKeyProperties.join(",")}` : ""
					},
					_headerSelectQuery: {
						value: entityKeyProperties?.length ? `$select=${entityKeyProperties.join(",")}` : ""
					},
					_contentExpandQuery: {
						value: ""
					},
					_headerExpandQuery: {
						value: ""
					},
					_entitySet: {
						type: "string",
						value: entitySetName
					},
					_yesText: {
						type: "string",
						value: yesText
					},
					_noText: {
						type: "string",
						value: noText
					}
				},
				destinations: {
					service: {
						name: "(default)",
						defaultUrl: "/"
					}
				},
				csrfTokens: {
					token1: {
						data: {
							request: {
								url: `{{destinations.service}}${service}`,
								method: "HEAD",
								headers: {
									"X-CSRF-Token": "Fetch"
								}
							}
						}
					}
				}
			},
			data: {
				request: {
					url: `{{destinations.service}}${service}/$batch`,
					method: "POST",
					headers: {
						"X-CSRF-Token": "{{csrfTokens.token1}}",
						"Accept-Language": "{{parameters.LOCALE}}"
					},
					batch: {
						header: {
							method: "GET",
							url: getHeaderBatchUrl(),
							headers: {
								Accept: "application/json",
								"Accept-Language": "{{parameters.LOCALE}}"
							},
							retryAfter: 30
						},
						content: {
							method: "GET",
							url: getContentBatchUrl(),
							headers: {
								Accept: "application/json",
								"Accept-Language": "{{parameters.LOCALE}}"
							}
						}
					}
				}
			},
			header: {
				data: {
					path: dataPathHeader
				},
				type: "Numeric",
				title: title,
				subTitle: subTitle,
				unitOfMeasurement: "",
				mainIndicator: {
					number: "",
					unit: ""
				}
			},
			content: {
				data: {
					path: dataPath
				},
				groups: []
			}
		},
		"sap.ui5": {
			_version: "1.1.0",
			contentDensities: {
				compact: true,
				cozy: true
			},
			dependencies: {
				libs: {
					"sap.insights": {
						lazy: false
					}
				}
			}
		},
		"sap.insights": {
			templateName: "ObjectPage",
			parentAppId: sapAppId,
			cardType: "LEAN_DT",
			versions: {
				ui5: sapCoreVersionInfo.version + "-" + sapCoreVersionInfo.buildTimestamp
			}
		}
	};
	return manifest;
}

function getObjectPageContext() {
	const { rootComponent, entitySet } = Application.getInstance().fetchDetails();
	const appModel = rootComponent.getModel() as V2ODataModel | V4ODataModel;
	const contextParameters: string[] = [];
	const bODataV4 = isODataV4Model(appModel);

	if (bODataV4) {
		const keyProperties = getPropertyReferenceKey(appModel as V4ODataModel, entitySet);
		keyProperties.forEach((property) => {
			const parameter = V4ODataUtils.formatLiteral(`{{parameters.${property.name}}}`, property.type);
			contextParameters.push(`${property.name}=${parameter}`);
		});
	} else {
		const keyProperties = getPropertyReference(appModel as V2ODataModel, entitySet);
		keyProperties.forEach((property) => {
			let parameter = "";
			if (property.type === "Edm.DateTimeOffset" || property.type === "Edm.DateTime") {
				const propertyType = property.type === "Edm.DateTimeOffset" ? "datetimeoffset" : "datetime";
				parameter = propertyType + `'{{parameters.${property.name}}}'`;
			} else {
				parameter = V2OdataUtils.formatValue(`{{parameters.${property.name}}}`, property.type, true);
			}
			contextParameters.push(`${property.name}=${parameter}`);
		});
	}

	return contextParameters.join(",");
}

function getHeaderBatchUrl() {
	return `{{parameters._entitySet}}(${getObjectPageContext()})?{{parameters._headerSelectQuery}}{{parameters._headerExpandQuery}}`;
}

function getContentBatchUrl() {
	return `{{parameters._entitySet}}(${getObjectPageContext()})?{{parameters._contentSelectQuery}}{{parameters._contentExpandQuery}}`;
}

export function getCurrentCardManifest(): CardManifest {
	return manifest || {};
}

/**
 * Render integration card preview
 *
 * @param {CardManifest} newManifest
 */
export function renderCardPreview(newManifest: CardManifest, oModel?: JSONModel) {
	manifest = { ...newManifest };
	updateManifestWithSelectQueryParams(manifest);
	oModel && updateManifestWithExpandQueryParams(manifest);
	const oCard = CoreElement.getElementById("cardGeneratorDialog--cardPreview") as Card;
	if (oCard) {
		oCard.setBaseUrl("./");
		oCard.setManifest(manifest);
		oCard.refresh();
	}
}

export function updateCardGroups(oModel: JSONModel) {
	const configurationGroups: Group[] = oModel.getProperty("/configuration/groups");
	const advancedPanelCriticallity = oModel?.getProperty("/configuration/mainIndicatorOptions/criticality");

	const groups = configurationGroups.map(function (configuration) {
		const items = configuration?.items
			?.filter(function (configurationItem) {
				return configurationItem.name;
			})
			.map((configurationItem) => {
				const matchedCriticallity = advancedPanelCriticallity?.filter((columnItem: CriticalityOptions) => {
					if (configurationItem?.navigationProperty) {
						return (
							`${columnItem.name}/${columnItem?.propertyKeyForId}` ===
							`${configurationItem.name}/${configurationItem.navigationProperty}`
						);
					}
					return columnItem.name === configurationItem.name;
				});
				let updatedColorState;
				if (matchedCriticallity?.[0]?.criticality) {
					const criticalityValue = matchedCriticallity[0]?.activeCalculation
						? matchedCriticallity[0]
						: matchedCriticallity[0]?.criticality;
					updatedColorState = getColorForGroup(criticalityValue);
				}
				const item: any = {
					label: configurationItem.label,
					value: configurationItem.value,
					name: configurationItem.name
				};
				if (updatedColorState) {
					item.state = updatedColorState;
					item.type = "Status";
					item.showStateIcon = true;
				}
				if (configurationItem.hasActions) {
					item["actions"] = configurationItem.actions;
					item["hasActions"] = configurationItem.hasActions;
					item["actionType"] = configurationItem.actionType;
				}
				return item;
			});
		return {
			title: configuration.title,
			items: items ? items : []
		};
	});
	(manifest["sap.card"].content as ObjectContent).groups = groups;
	renderCardPreview(manifest, oModel);
}

/**
 *  Resolves the card header properties from stored manifest
 *  - If path is a string, return the resolved i18n text
 * 	- If path is an expression, resolve the expression then return the labelWithValue of the property
 *  - If path is an expression with formatter, update the formatter configuration and return the labelWithValue of the property
 * @param path
 * @param resourceModel
 * @param properties
 * @returns
 */
export function resolvePropertyLabelFromExpression(path: string, resourceModel: ResourceModel, properties: PropertyInfoMap) {
	if (isI18nExpression(path)) {
		return resolveI18nTextFromResourceModel(path, resourceModel);
	}

	if (isExpression(path) && !hasFormatter(path)) {
		let propertyPath = "";
		if (hasBooleanBindingExpression(path)) {
			propertyPath = extractValueWithoutBooleanExprBinding(path);
		} else {
			propertyPath = extractPathWithoutUOM(path);
		}
		return properties.find((property) => property.name === propertyPath)?.labelWithValue ?? "";
	}

	if (isExpression(path) && hasFormatter(path)) {
		const formatterExpression = extractPathExpressionWithoutUOM(path);
		const selectedFormatter = updateAndGetSelectedFormatters(formatterExpression);
		handleFormatter(selectedFormatter);
		return properties.find((property) => property.name === selectedFormatter.property)?.labelWithValue ?? "";
	}

	return path;
}

/**
 * The function formats the data for OData V2 applications containing the key parameters of type datetimeoffset and guid.
 * @param entitySetWithObjectContext
 * @param data
 */
export function formatDataForV2(entitySetWithObjectContext: string, data: Record<string, any>) {
	const extractKeyValue = (keyValueStr: string): [string, any] => {
		const [rawKey, rawValue] = keyValueStr.split("=");

		if (rawValue === "true" || rawValue === "false") {
			return [rawKey, rawValue === "true"];
		}

		const cleanedValue = rawValue.replace(/guid|datetimeoffset|datetime|'*/g, "");
		return [rawKey, cleanedValue];
	};

	const updateDataWithProperties = (properties: string[]) => {
		for (const prop of properties) {
			const [key, value] = extractKeyValue(prop);
			data[key] = value;
		}
	};

	const startIndex = entitySetWithObjectContext.indexOf("(");
	const endIndex = entitySetWithObjectContext.indexOf(")");
	const keySegment = entitySetWithObjectContext.slice(startIndex + 1, endIndex);
	const keyProperties = keySegment.split(",");

	if (isSingleKeyWithoutAssignment(keyProperties)) {
		const entitySetName = entitySetWithObjectContext.split("(")[0];
		const appModel = Application.getInstance().getRootComponent().getModel();
		const keyReference = getPropertyReference(appModel as V2ODataModel, entitySetName);
		const resolvedKey = handleSingleProperty(keyReference, keyProperties).join(",");
		const [key, value] = extractKeyValue(resolvedKey);
		data[key] = value;
	} else {
		updateDataWithProperties(keyProperties);
	}
}

function getMainIndicator(mManifest: CardManifest) {
	const mainIndicator = mManifest["sap.card"].header.mainIndicator;
	let mainIndicatorKey = "";
	let trendOptions: TrendOptions = {
		referenceValue: "",
		downDifference: "",
		upDifference: ""
	};
	const criticalityOptions: CriticalityOptions[] = [];
	const groups = (mManifest["sap.card"].content as ObjectContent).groups;
	if (groups.length > 0) {
		updateCriticalityBasedOnGroups(mManifest, criticalityOptions);
	}

	if (!mainIndicator || !mainIndicator.number) {
		return {
			mainIndicatorStatusKey: "",
			mainIndicatorNavigationSelectedKey: "",
			criticalityOptions,
			navigationValue: "",
			trendOptions
		};
	}

	const { propertyPath, formatterExpression } = extractPropertyConfigurationWithoutTextArrangement(mainIndicator.number, mManifest);
	const state = mainIndicator.state;

	if (formatterExpression.length) {
		const formatterExpressions = formatterExpression.map(updateAndGetSelectedFormatters);
		formatterExpressions.forEach(handleFormatter);
	}

	if (isExpression(propertyPath) && !hasFormatter(propertyPath)) {
		if (hasBooleanBindingExpression(propertyPath)) {
			mainIndicatorKey = extractValueWithoutBooleanExprBinding(propertyPath);
		} else {
			mainIndicatorKey = extractPathWithoutUOM(propertyPath);
		}
	}
	if (mainIndicator.trend && mainIndicator.trend !== "None") {
		const trendValue = mainIndicator.trend;
		const regex = /"referenceValue":(\d+),"downDifference":(\d+),"upDifference":(\d+)/;
		const match = trendValue.match(regex);

		if (match) {
			trendOptions = {
				referenceValue: match[1] || "",
				downDifference: match[2] || "",
				upDifference: match[3] || ""
			};
		}
	}

	if (isExpression(propertyPath) && hasFormatter(propertyPath)) {
		const formatterExpression = extractPathExpressionWithoutUOM(propertyPath);
		const selectedFormatter = updateAndGetSelectedFormatters(formatterExpression);
		handleFormatter(selectedFormatter);
		mainIndicatorKey = selectedFormatter.property || "";
	}
	let criticalityConfig: CriticalityOptions = {
		criticality: "",
		name: "",
		activeCalculation: false
	};
	if (state && hasFormatter(state)) {
		const formatterExpression = extractPathExpressionWithoutUOM(state);
		const selectedFormatter = updateAndGetSelectedFormatters(formatterExpression);
		handleFormatter(selectedFormatter);
		criticalityConfig = {
			criticality: "{" + selectedFormatter.property + "}",
			name: mainIndicatorKey,
			activeCalculation: false
		};
	} else if (state && state !== "None") {
		criticalityConfig = {
			criticality: state,
			name: mainIndicatorKey,
			activeCalculation: false
		};
	}
	if (criticalityConfig.name.length) {
		updateCriticalityOptions(criticalityOptions, criticalityConfig);
	}

	let mainIndicatorNavigationSelectedKey = "";
	let mainIndicatorStatusKey = mainIndicatorKey;
	if (mainIndicatorKey.includes("/")) {
		mainIndicatorStatusKey = mainIndicatorKey.split("/")[0];
		mainIndicatorNavigationSelectedKey = mainIndicatorKey.split("/")[1];
	}
	return {
		mainIndicatorStatusKey,
		mainIndicatorNavigationSelectedKey,
		criticalityOptions,
		navigationValue: mainIndicatorKey,
		trendOptions
	};
}
/**
 * Updates the criticality options based on the groups in the provided CardManifest.
 * @param {CardManifest} mManifest - The card manifest containing the groups and their items.
 * @param {CriticalityOptions[]} criticalityOptions - An array of criticality options to be updated.
 */

function updateCriticalityBasedOnGroups(mManifest: CardManifest, criticalityOptions: CriticalityOptions[]) {
	const groups = (mManifest["sap.card"].content as ObjectContent).groups;
	groups.forEach((group) => {
		group.items.forEach((item) => {
			if (item.state) {
				const criticallityState = getCriticallityStateForGroup(item.state);
				const regex = /\/([^,}]+)/;
				const match = item.value.match(regex);
				let navProp;
				if (match) {
					navProp = match[1];
				}
				const criticalityConfig: CriticalityOptions = {
					criticality: criticallityState,
					name: navProp ? `${item.name}/${navProp}` : item.name,
					activeCalculation: false
				};
				updateCriticalityOptions(criticalityOptions, criticalityConfig);
			}
		});
	});
}

/**
 * Update the criticality options
 * @param criticalityOptions
 * @param criticalityConfig
 */
function updateCriticalityOptions(criticalityOptions: CriticalityOptions[], criticalityConfig: CriticalityOptions) {
	const itemExists = criticalityOptions.some((option) => option.name === criticalityConfig.name);
	if (!itemExists) {
		criticalityOptions.push(criticalityConfig);
	}
}

/**
 * Gets the criticality state for a group based on the provided state string.
 *
 * This function checks if the state has a formatter associated with it.
 * If so, it processes the formatter and returns its property in a specific format.
 * If the state corresponds to a known criticality state, it returns the corresponding
 * color indicator. If the state is not recognized, it defaults to the 'None' indicator.
 *
 * @param {string} state - The state string to evaluate for criticality.
 * @returns {string} - The criticality state as a string based on the ColorIndicator enum.
 *                    Possible return values include:
 *                    - ColorIndicator.Error
 *                    - ColorIndicator.Success
 *                    - ColorIndicator.None
 *                    - ColorIndicator.Warning
 */
export function getCriticallityStateForGroup(state: string) {
	if (state && hasFormatter(state)) {
		const formatterExpression = extractPathExpressionWithoutUOM(state);
		const selectedFormatter = updateAndGetSelectedFormatters(formatterExpression);
		handleFormatter(selectedFormatter);
		return "{" + selectedFormatter.property + "}";
	}

	if (state && state in ColorIndicator) {
		return ColorIndicator[state as keyof typeof ColorIndicator];
	}

	return ColorIndicator.None;
}

function getSideIndicators(mManifest: CardManifest): SideIndicatorOptions {
	const sideIndicators = mManifest["sap.card"].header.sideIndicators || [];

	if (sideIndicators.length === 0 || !sideIndicators[0].number) {
		return {
			targetValue: "",
			targetUnit: "",
			deviationValue: "",
			deviationUnit: ""
		};
	}

	const [targetIndicator = {}, deviationIndicator = {}] = sideIndicators;
	const { number: targetValue = "", unit: targetUnit = "" } = targetIndicator;

	const { number: deviationValue = "", unit: deviationUnit = "" } = deviationIndicator;

	return {
		targetValue,
		targetUnit,
		deviationValue,
		deviationUnit
	};
}

function handleFormatter(formatter: FormatterConfiguration) {
	if (
		formatterConfigurationFromCardManifest.length === 0 ||
		!formatterConfigurationFromCardManifest.find((f) => f.property === formatter.property)
	) {
		formatterConfigurationFromCardManifest.push({ ...formatter });
	}
}

function getGroupItemValue(value: string, mManifest: CardManifest) {
	const { formatterExpression } = extractPropertyConfigurationWithoutTextArrangement(value, mManifest);

	if (formatterExpression.length) {
		const formatterExpressions = formatterExpression.map(updateAndGetSelectedFormatters);
		formatterExpressions.forEach(handleFormatter);
	}

	return value;
}

function getCardGroups(mManifest: CardManifest, resourceModel: ResourceModel) {
	const groups = (mManifest["sap.card"].content as ObjectContent).groups;
	if (groups.length === 0) {
		return [];
	}
	return groups.map((group) => {
		return {
			title: resolveI18nTextFromResourceModel(group.title, resourceModel),
			items: group.items.map((item) => {
				const groupItem: GroupItems = {
					label: resolveI18nTextFromResourceModel(item.label, resourceModel),
					value: getGroupItemValue(item.value, mManifest),
					name: item.name,
					isEnabled: true,
					isNavigationEnabled: false
				};
				if (item.hasActions) {
					groupItem.actions = item.actions;
					groupItem.hasActions = item.hasActions;
					groupItem.actionType = item.actionType;
				}
				if (item.state) {
					groupItem.type = "Status";
					groupItem.state = item.state;
				}
				return groupItem;
			})
		};
	});
}

/**
 * This is a fix for cards which are generated without "sap.insights" manifest property or with cardType as "DT".
 *  - When the card is regenerated "sap.insight" property will be set/updated existing in the manifest.
 *
 * @param mCardManifest
 * @param rootComponent
 * @returns
 */
export async function enhanceManifestWithInsights(mCardManifest: CardManifest | undefined, rootComponent: Component) {
	if (!mCardManifest) {
		return;
	}
	const sapAppId = rootComponent.getManifestEntry("sap.app").id;
	const sapCoreVersionInfo = (await VersionInfo.load({
		library: "sap.ui.core"
	})) as LibVersionInfo;

	mCardManifest["sap.insights"] = {
		templateName: "ObjectPage",
		parentAppId: sapAppId,
		cardType: "LEAN_DT",
		versions: {
			ui5: sapCoreVersionInfo.version + "-" + sapCoreVersionInfo.buildTimestamp
		}
	};
}

/**
 * Enhance the card manifest configuration parameters with property formatting configuration
 * 	- add text arrangements properties
 *  - Updates the card manifest configuration parameters by adding "_yesText" and "_noText" parameters
 *    with predefined string values referencing i18n keys.
 *
 * @param {CardManifest} The card manifest object to be updated. It is expected to have
 *    "sap.card" property with a configuration containing parameters.
 * @param {JSONModel}
 */
export function enhanceManifestWithConfigurationParameters(mCardManifest: CardManifest, oDialogModel: JSONModel) {
	const sapCard = mCardManifest["sap.card"];
	const applicationInstance = Application.getInstance();
	const rootComponent = applicationInstance.getRootComponent();
	const appModel = rootComponent.getModel();
	const { odataModel, entitySet } = applicationInstance.fetchDetails();
	const keyProperties: string[] = [];

	if (odataModel === ODataModelVersion.V4) {
		getPropertyReferenceKey(appModel as V4ODataModel, entitySet).forEach((property) => keyProperties.push(property.name));
	} else {
		getPropertyReference(appModel as V2ODataModel, entitySet).forEach((property) => keyProperties.push(property.name));
	}

	if (!sapCard.configuration) {
		sapCard.configuration = {
			parameters: {}
		};
	}

	if (!sapCard.configuration?.parameters) {
		sapCard.configuration.parameters = {};
	}

	const configurationParameters = sapCard.configuration?.parameters as CardConfigParameters;
	configurationParameters["_propertyFormatting"] = {};
	const textArrangements = oDialogModel.getProperty("/configuration/advancedFormattingOptions/textArrangements") as ArrangementOptions[];
	const previewItems = getPreviewItems(oDialogModel);
	const propertyFormatting: PropertyFormattingParameters = {};
	textArrangements.forEach(({ name, arrangementType, value }) => {
		if (name && previewItems.includes(name) && arrangementType && value) {
			propertyFormatting[name] = {
				arrangements: {
					text: {
						[arrangementType]: true,
						path: value
					}
				}
			};
		}
	});
	if (Object.keys(propertyFormatting).length > 0) {
		configurationParameters["_propertyFormatting"] = propertyFormatting;
	}

	configurationParameters["_mandatoryODataParameters"] = {
		value: keyProperties
	};

	configurationParameters["_entitySet"] = {
		value: entitySet,
		type: "string"
	};

	keyProperties.forEach((keyProp) => {
		configurationParameters[keyProp] = {
			type: getDataType(keyProp),
			value: ""
		};
	});

	configurationParameters["_yesText"] = {
		type: "string",
		value: "{{CardGeneratorValue_Yes}}"
	};

	configurationParameters["_noText"] = {
		type: "string",
		value: "{{CardGeneratorValue_No}}"
	};
}

/**
 * Adds query parameters to the URLs in the manifest's batch request.
 *
 * @param {CardManifest} cardManifest - The card manifest.
 * @returns {CardManifest} A copy of the original card manifest with query parameters added to the URLs.
 */

export const addQueryParametersToManifest = (cardManifest?: CardManifest): CardManifest => {
	const cardManifestCopy = JSON.parse(JSON.stringify(cardManifest));
	const batchRequest = cardManifestCopy["sap.card"].data?.request?.batch;
	const selectQueryHeader = "?{{parameters._headerSelectQuery}}";
	const selectQueryContent = "?{{parameters._contentSelectQuery}}";
	const expandQueryHeader = "{{parameters._headerExpandQuery}}";
	const expandQueryContent = "{{parameters._contentExpandQuery}}";
	const headerUrl = batchRequest?.header?.url;
	const contentUrl = batchRequest?.content?.url;

	if (headerUrl?.indexOf(selectQueryHeader) === -1) {
		batchRequest.header.url = `${batchRequest.header.url}${selectQueryHeader}${expandQueryHeader}`;
	} else if (headerUrl?.indexOf(expandQueryHeader) === -1) {
		batchRequest.header.url = `${batchRequest.header.url}${expandQueryHeader}`;
	}
	if (contentUrl?.indexOf(selectQueryContent) === -1) {
		batchRequest.content.url = `${batchRequest.content.url}${selectQueryContent}${expandQueryContent}`;
	} else if (contentUrl?.indexOf(expandQueryContent) === -1) {
		batchRequest.content.url = `${batchRequest.content.url}${expandQueryContent}`;
	}

	const configParameters = cardManifestCopy["sap.card"].configuration?.parameters;
	configParameters._contentSelectQuery = configParameters?._contentSelectQuery ?? { value: "" };
	configParameters._headerSelectQuery = configParameters?._headerSelectQuery ?? { value: "" };
	configParameters._contentExpandQuery = configParameters?._contentExpandQuery ?? { value: "" };
	configParameters._headerExpandQuery = configParameters?._headerExpandQuery ?? { value: "" };

	return cardManifestCopy;
};

const updateConfigurationParametersWithKeyProperties = (cardManifest: CardManifest, data: Record<string, any>) => {
	const applicationInstance = Application.getInstance();
	const rootComponent = applicationInstance.getRootComponent();
	const appModel = rootComponent.getModel();
	const { odataModel, entitySet, entitySetWithObjectContext } = applicationInstance.fetchDetails();
	const bODataV4 = isODataV4Model(appModel);
	if (!bODataV4) {
		formatDataForV2(entitySetWithObjectContext, data);
	}
	const propertyReferenceKeys =
		odataModel === ODataModelVersion.V4
			? getPropertyReferenceKey(appModel as V4ODataModel, entitySet)
			: getPropertyReference(appModel as V2ODataModel, entitySet);

	const sapCard = cardManifest["sap.card"];
	if (!sapCard.configuration) {
		sapCard.configuration = {
			parameters: {}
		};
	}

	if (!sapCard.configuration?.parameters) {
		sapCard.configuration.parameters = {};
	}
	const configurationParameters = sapCard.configuration?.parameters as CardConfigParameters;

	configurationParameters["_entitySet"] = {
		value: entitySet,
		type: "string"
	};
	const { yesText, noText } = getYesAndNoTextValues();
	configurationParameters["_yesText"] = {
		type: "string",
		value: yesText
	};
	configurationParameters["_noText"] = {
		type: "string",
		value: noText
	};
	propertyReferenceKeys.forEach((keyProp) => {
		if (keyProp.type === "Edm.Boolean" && typeof data[keyProp.name] === "string") {
			data[keyProp.name] = data[keyProp.name] === yesText;
		}
		configurationParameters[keyProp.name] = {
			type: getDataType(keyProp.type),
			value: data[keyProp.name]
		};
	});
};

/**
 * Updates the data path of the card header in the provided card manifest by reference.
 *
 * @param {CardManifest} cardManifest - The card manifest object that contains the header data.
 */
function updateHeaderDataPath(cardManifest: CardManifest, isODataV4: boolean) {
	const headerData = cardManifest["sap.card"].header.data;
	const dataPathHeader = isODataV4 ? "/header/" : "/header/d/";

	if (headerData?.path) {
		headerData.path = dataPathHeader;
	}
}

/**
 * This method is used to perform updates on existing integration card manifest.
 * Updates will include adding,
 * 	- Query parameters to the URLs in the target manifest's batch request.
 * 	- sap.app.id to the manifest.
 * @param cardManifest
 */
export const updateExistingCardManifest = (data: Record<string, any>, cardManifest?: CardManifest): CardManifest | undefined => {
	if (!cardManifest) {
		return cardManifest;
	}

	cardManifest = addQueryParametersToManifest(cardManifest);
	const batch = cardManifest["sap.card"].data.request?.batch;

	if (batch !== undefined) {
		batch.header.url = getHeaderBatchUrl();
		batch.content.url = getContentBatchUrl();
	}
	const { componentName, odataModel, entitySet } = Application.getInstance().fetchDetails();
	cardManifest["sap.app"].id = `${componentName}.cards.op.${entitySet}`;
	cardManifest["sap.app"].i18n = cardManifest["sap.app"].i18n || "../../../i18n/i18n.properties";
	updateConfigurationParametersWithKeyProperties(cardManifest, data);
	const isODataV4 = odataModel === ODataModelVersion.V4;
	updateHeaderDataPath(cardManifest, isODataV4);
	return cardManifest;
};

/**
 * Parses the integration card manifest and extracts relevant information.
 *
 * @param {CardManifest} integrationCardManifest - The manifest of the integration card to be parsed.
 * @param {ResourceModel} resourceModel - The resource model used for localization.
 * @param {PropertyInfoMap} properties - The map of properties to resolve labels from expressions.
 * @returns {ParsedManifest} The parsed manifest containing title, subtitle, header unit of measurement, main indicator options, side indicator options, groups, formatter configuration, and text arrangements.
 */
export function parseCard(
	integrationCardManifest: CardManifest,
	resourceModel: ResourceModel,
	properties: PropertyInfoMap
): ParsedManifest {
	const title = integrationCardManifest["sap.card"].header.title ?? "";
	const subtitle = integrationCardManifest["sap.card"].header.subTitle ?? "";
	const uom = integrationCardManifest["sap.card"].header.unitOfMeasurement ?? "";
	formatterConfigurationFromCardManifest.splice(0, formatterConfigurationFromCardManifest.length);
	const textArrangementsFromCardManifest: Array<ArrangementOptions> = getTextArrangementFromCardManifest(integrationCardManifest);

	return {
		title: resolvePropertyLabelFromExpression(title, resourceModel, properties),
		subtitle: resolvePropertyLabelFromExpression(subtitle, resourceModel, properties),
		headerUOM: resolvePropertyLabelFromExpression(uom, resourceModel, properties),
		mainIndicatorOptions: getMainIndicator(integrationCardManifest),
		sideIndicatorOptions: getSideIndicators(integrationCardManifest),
		groups: getCardGroups(integrationCardManifest, resourceModel),
		formatterConfigurationFromCardManifest,
		textArrangementsFromCardManifest
	};
}

/**
 * Updates the unit of measures array with formatter configurations.
 *
 * @param {Array<UnitOfMeasures>} unitOfMeasures - The array of unit of measures to be updated.
 * @param {FormatterConfigurationMap} formatterConfigsWithUnit - The formatter configurations containing unit information.
 * @returns Promise {Array<UnitOfMeasures>} The updated array of unit of measures.
 */
export const getUpdatedUnitOfMeasures = async function (
	unitOfMeasures: Array<UnitOfMeasures>,
	formatterConfigsWithUnit: FormatterConfigurationMap,
	path: string
): Promise<Array<UnitOfMeasures>> {
	const updatedUnitOfMeasures = [...unitOfMeasures];
	for (const formatter of formatterConfigsWithUnit) {
		const matchingProperty = updatedUnitOfMeasures.find((unitConfig: UnitOfMeasures) => unitConfig.name === formatter.property);
		const formatterParameterValue = formatter.parameters?.[0].value;
		let value;
		if (hasBooleanBindingExpression(formatterParameterValue)) {
			value = extractValueWithoutBooleanExprBinding(formatterParameterValue);
		} else {
			value = formatterParameterValue?.replace(/\$\{/g, "");
			value = value?.replace(/\}/g, "");
		}
		const formatterProperty = formatter.property;

		if (matchingProperty && value) {
			const updatedProperty = { ...matchingProperty, propertyKeyForDescription: value, value: value };
			const index = updatedUnitOfMeasures.indexOf(matchingProperty);
			updatedUnitOfMeasures[index] = updatedProperty;
		} else if (value && formatterProperty) {
			await handleFormatterWithoutMatchingProperty(formatterProperty, value, updatedUnitOfMeasures, path);
		}
	}

	return updatedUnitOfMeasures;
};

/**
 * Updates the criticality options for navigation properties in the main indicator criticality options.
 *
 * @param {Array<CriticalityOptions>} mainIndicatorCriticalityOptions - The array of main indicator criticality options to be updated.
 * @param {string} path - The path used to fetch navigation properties with labels.
 * @returns {Promise<Array<CriticalityOptions>>} A promise that resolves to the updated array of main indicator criticality options.
 */
export const updateCriticalityForNavProperty = async function (mainIndicatorCriticalityOptions: CriticalityOptionsPanel, path: string) {
	for (const criticality of mainIndicatorCriticalityOptions) {
		if (criticality.name.includes("/")) {
			const [criticalityName, navProp] = criticality.name.split("/");
			try {
				const { propertiesWithLabel } = await getNavigationPropertiesWithLabel(
					Application.getInstance().fetchDetails().rootComponent,
					criticalityName,
					path
				);
				criticality.navigationKeyForId = navProp;
				criticality.navigationKeyForDescription = "";
				criticality.propertyKeyForId = navProp;
				criticality.isNavigationForId = true;
				criticality.isNavigationForDescription = false;
				criticality.name = criticalityName;
				criticality.navigationalPropertiesForId = propertiesWithLabel;
			} catch (error) {
				Error("Error fetching navigation properties:" + error);
			}
		}
	}
	return mainIndicatorCriticalityOptions;
};
/**
 * Handles the formatter property when there is no matching property.
 * Updates the `updatedUnitOfMeasures` array with the appropriate data based on the formatter property.
 *
 * @param {string} formatterProperty - The formatter property to process.
 * @param {string} value - The value associated with the formatter property.
 * @param {Array<UnitOfMeasures>} updatedUnitOfMeasures - The array to update with unit of measure data.
 * @param {string} path - The path used to fetch navigation properties.
 * @returns {Promise<Array<UnitOfMeasures>>} A promise that resolves to the updated array of unit of measures.
 */
export const handleFormatterWithoutMatchingProperty = async (
	formatterProperty: string,
	value: string,
	updatedUnitOfMeasures: Array<UnitOfMeasures>,
	path: string
) => {
	if (!formatterProperty) {
		return;
	}
	if (formatterProperty.includes("/")) {
		const [sourceProperty, navigationKeyForId] = formatterProperty.split("/");
		try {
			const { propertiesWithLabel } = await getNavigationPropertiesWithLabel(
				Application.getInstance().fetchDetails().rootComponent,
				sourceProperty,
				path
			);
			updatedUnitOfMeasures.push({
				propertyKeyForDescription: value,
				name: formatterProperty,
				propertyKeyForId: sourceProperty,
				value: value,
				isNavigationForId: true,
				navigationKeyForId: navigationKeyForId,
				isNavigationForDescription: false,
				navigationKeyForDescription: "",
				navigationalPropertiesForId: propertiesWithLabel
			});
		} catch (error) {
			Error("Error fetching navigation properties:" + error);
		}
	} else {
		updatedUnitOfMeasures.push({
			propertyKeyForDescription: value,
			name: formatterProperty,
			propertyKeyForId: formatterProperty,
			value: value
		});
	}
};
/**
 * Creates or updates the card manifest for the card generator.
 * Fetches application details, constructs the entity context path, and generates the card manifest.
 *
 * @param {Component} appComponent - The root component of the application.
 * @param {CardManifest} cardManifest - The initial card manifest.
 * @param {JSONModel} dialogModel - The dialog model containing configuration data.
 * @returns {Promise<CardManifest>} - A promise that resolves to the created or updated card manifest.
 * @throws {Error} - Throws an error if no model is found in the view.
 */
export const createCardManifest = async function (
	appComponent: Component,
	cardManifest: CardManifest,
	dialogModel: JSONModel
): Promise<CardManifest> {
	const sapApp = appComponent.getManifestEntry("sap.app");
	const { title, description: cardSubtitle, id } = sapApp;
	const oAppModel = appComponent.getModel();

	if (!oAppModel) {
		throw new Error("No model found in the view");
	}

	const applicationInstance = Application.getInstance();
	const sapCoreVersionInfo = await VersionInfo.load({
		library: "sap.ui.core"
	});
	const { serviceUrl, entitySet, entitySetWithObjectContext } = applicationInstance.fetchDetails();
	const entitySetName = entitySet;
	const integrationCardManifest =
		updateExistingCardManifest(dialogModel.getProperty("/configuration/$data"), cardManifest) ||
		createInitialManifest({
			title: title,
			subTitle: cardSubtitle,
			service: serviceUrl,
			serviceModel: oAppModel,
			sapAppId: id,
			sapCoreVersionInfo,
			entitySetName,
			entitySetWithObjectContext,
			data: dialogModel.getProperty("/configuration/$data")
		});

	return integrationCardManifest;
};

/**
 * This function checkks if a given property is a navigational property in the model.
 * @param {string} propertyName - Name of the property to check.
 * @param {JSONModel} model - The JSON model containing the card configuration.
 * @returns {boolean} - Returns true if the property is a navigational property, otherwise false.
 */
const isNavigationalProperty = function (propertyName: string, model: JSONModel): boolean {
	const navigationalProperties = model.getProperty("/configuration/navigationProperty") ?? [];
	for (const navigationalProperty of navigationalProperties) {
		if (navigationalProperty.name === propertyName) {
			return true;
		}
	}
	return false;
};

/**
 * This function returns the list of properties that are present in the card preview.
 * @param {JSONModel} model - The JSON model containing the card configuration.
 * @returns {string[]} - Array of property names present in the card preview.
 */
export const getPreviewItems = function (model: JSONModel) {
	const title = model.getProperty("/configuration/title");
	const subtitle = model.getProperty("/configuration/subtitle");
	const headerUOM = model.getProperty("/configuration/headerUOM");
	const properties = model.getProperty("/configuration/properties") ?? [];
	const mainIndicatorProperty = model.getProperty("/configuration/mainIndicatorStatusKey");
	const groups = model.getProperty("/configuration/groups") || [];
	const previewItems = groups.flatMap((group: { items: { name: string; isNavigationEnabled: boolean; navigationProperty: string }[] }) =>
		group.items.map((item) =>
			item.isNavigationEnabled && item.navigationProperty ? `${item.name}/${item.navigationProperty}` : item.name
		)
	);
	if (mainIndicatorProperty) {
		if (!mainIndicatorProperty.includes("/") && isNavigationalProperty(mainIndicatorProperty, model)) {
			const mainIndicatorNavigationSelectedKey = model.getProperty("/configuration/mainIndicatorNavigationSelectedKey");
			previewItems.push(`${mainIndicatorProperty}/${mainIndicatorNavigationSelectedKey}`);
		} else {
			previewItems.push(mainIndicatorProperty);
		}
	}
	[title, subtitle, headerUOM].forEach((item) => {
		properties.forEach((property: { labelWithValue: string; name: string }) => {
			if (property.labelWithValue === item) {
				previewItems.push(property.name);
			}
		});
	});
	return previewItems;
};
