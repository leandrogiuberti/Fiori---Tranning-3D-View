/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
import Formatting from "sap/base/i18n/Formatting";
import Log from "sap/base/Log";
import encodeURL from "sap/base/security/encodeURL";
import formatMessage from "sap/base/strings/formatMessage";
import deepExtend from "sap/base/util/deepExtend";
import BaseObject from "sap/ui/base/Object";
import CoreLib from "sap/ui/core/library";
import ODataMetaModel, { AssociationEnd, NavigationProperty, Property } from "sap/ui/model/odata/ODataMetaModel";
import {
	IAppInfoData,
	IAppManifest,
	ICardActionParameters,
	ICardManifest,
	IColumnData,
	IEntitySet,
	IEntityType,
	ILineItem,
	ILineItemContext,
	ILineItemContextValue,
	ILineItemDetails,
	ILrSettings,
	IManifestCardData,
	IPageType,
	IPresentationVariant,
	IRequestData,
	ISapApp,
	ISapCard,
	ISapCardConfig,
	ISapUI5App,
	ITableSettings,
	IUIVisualizations,
	IVariantSetting,
	IVersionInfo,
	PageRecord,
	UIAnnotations,
	UIAnnotationValue
} from "../interface/CardsInterface";
import { TABLE_TYPES } from "./Constants";
import { sortCollectionByImportance } from "./DataFormatUtils";

const COLUMN_LENGTH = 3;
const ValueState = CoreLib.ValueState;

interface VariantInfo {
	lineItem?: ILineItem[] | string;
	presentationVariant?: IPresentationVariant;
	qualifierPath?: string;
	PresentationVariant?: IPresentationVariant;
	Visualizations?: IUIVisualizations[];
}

interface NonChartDetail {
	firstAvailableKey: string | null;
	sEntitySet: string;
	oVariant: IVariantSetting;
}

interface SelectExpand {
	select: string[];
	expand: string[];
}

type SelectExpandDetail = {
	select?: string;
	expand?: string;
};

type RequestAtleastFieldType = { String?: string | undefined; PropertyPath?: string | undefined };
interface ParameterisedEntity {
	entitySetName?: string | null;
	parameters: Array<object | string>;
	navPropertyName: string | null;
}

interface ColumnObjectData extends Partial<IColumnData> {
	leadingProperty?: string;
	additionalProperty?: string;
	navigationProperty?: string;
	columnKey?: string;
	[key: string]: unknown;
}

interface NavigationPropertiesMap {
	[entitySetName: string]: {
		[navigationPropertyName: string]: NavigationProperty;
	};
}

interface ExtendedLineItemContextValue extends ILineItemContextValue {
	Path: string;
	Apply: {
		Name: string;
		Parameters: {
			[key: string]: string;
		}[];
	};
}

enum FieldAnnotationsType {
	DataField = "com.sap.vocabularies.UI.v1.DataField",
	Importance = "com.sap.vocabularies.UI.v1.Importance",
	DataFieldWithNavigationPath = "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath",
	DataFieldWithIntentBasedNavigation = "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation",
	DataFieldForIntentBasedNavigation = "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation",
	Chart = "@com.sap.vocabularies.UI.v1.Chart",
	FieldGroup = "@com.sap.vocabularies.UI.v1.FieldGroup",
	DataPoint = "@com.sap.vocabularies.UI.v1.DataPoint",
	Contact = "@com.sap.vocabularies.Communication.v1.Contact",
	DataFieldForAction = "com.sap.vocabularies.UI.v1.DataFieldForAction",
	DataFieldForAnnotation = "com.sap.vocabularies.UI.v1.DataFieldForAnnotation",
	DataFieldWithUrl = "com.sap.vocabularies.UI.v1.DataFieldWithUrl",
	CriticalityRepresentationTypeWithoutIcon = "com.sap.vocabularies.UI.v1.CriticalityRepresentationType/WithoutIcon",
	FieldControlHiddenType = "com.sap.vocabularies.Common.v1.FieldControlType/Hidden"
}

export enum FieldTypes {
	DataFieldWithNavigationPath = "DataFieldWithNavigationPath",
	DataFieldWithIntentBasedNavigation = "DataFieldWithIntentBasedNavigation",
	DataFieldForIntentBasedNavigation = "DataFieldForIntentBasedNavigation",
	DataFieldForAction = "DataFieldForAction",
	DataFieldForAnnotation = "DataFieldForAnnotation"
}

type Attribute = { value: string; path: string; type: string };
type SelectionProperties = Array<string | { PropertyPath?: string; String?: string }>;

export default class RecommendedCardUtil extends BaseObject {
	static Instance: RecommendedCardUtil;

	static getInstance() {
		if (!RecommendedCardUtil.Instance) {
			RecommendedCardUtil.Instance = new RecommendedCardUtil();
		}
		return RecommendedCardUtil.Instance;
	}

	/**
	 * @param {object} metaModel - metamodel object
	 * @param {object} originalManifest - manifest of original app
	 * @param {string} leadingEntitySet - main entitySet of the application as in manifest
	 * @returns {object} - returns the lineItem details for the application based on manifest, annotations and metadata
	 * @private
	 */
	public getLineItemDetails(
		metaModel: ODataMetaModel,
		originalManifest: IAppManifest,
		leadingEntitySet: string
	): ILineItemDetails | undefined {
		const leadingEntitySetDetails = metaModel.getODataEntitySet(leadingEntitySet) as IEntitySet;
		const variantInfo = this.getLineItemFromVariant(metaModel, leadingEntitySetDetails.entityType);
		const lineItemDefault = variantInfo.lineItem;
		const pages = originalManifest["sap.ui.generic.app"]?.pages;
		const lrSettings = this.getSettingsForPage(pages);

		//if there is no quickVariantSelectionX setting in manifest, then return default line item details
		if (!lrSettings.quickVariantSelectionX) {
			return this.createDefaultLineItemDetails(metaModel, variantInfo, lrSettings, leadingEntitySet, lineItemDefault);
		}

		// if there is a variant settings then find the first non-smart chart variant
		const oVariants = lrSettings.quickVariantSelectionX.variants || {};
		const { firstAvailableKey, sEntitySet, oVariant } = this.findFirstNonSmartChartVariant(metaModel, oVariants, leadingEntitySet);
		if (oVariant.isSmartChart) {
			return this.createDefaultLineItemDetails(metaModel, variantInfo, lrSettings, leadingEntitySet, lineItemDefault);
		}
		delete lrSettings.requestAtLeastFields;

		const defaultTableSettings = this.getNormalizedTableSettings(metaModel, lrSettings, leadingEntitySet);
		const entitySet = metaModel?.getODataEntitySet(sEntitySet) as IEntitySet;
		const quickVariantInfo = this.getLineItemFromVariant(metaModel, entitySet.entityType, oVariant.annotationPath?.split("#")[1]);
		const lineItem = quickVariantInfo.lineItem;
		const presentationVariant = quickVariantInfo.presentationVariant;

		lrSettings.requestAtLeastFields = presentationVariant?.RequestAtLeast?.length
			? presentationVariant.RequestAtLeast
			: this._getRequestAtLeastFields(presentationVariant!);

		oVariant.tableSettings = this.getNormalizedTableSettings(
			metaModel,
			{ ...oVariant, tableSettings: oVariant.tableSettings || defaultTableSettings },
			sEntitySet
		);

		this.validateResponsiveTable(lrSettings, oVariant, firstAvailableKey);

		delete lrSettings.tableSettings;
		lrSettings.isResponsiveTable = lrSettings.isResponsiveTable === undefined || lrSettings.isResponsiveTable;

		const lineItemDetail: ILineItemDetails = {
			quickVariant: oVariant,
			lrSettings: lrSettings,
			lineItem: lineItem,
			entitySet: sEntitySet,
			headerInfo: oVariant?.tableSettings?.headerInfo || ""
		};
		return lineItem
			? lineItemDetail
			: this.createDefaultLineItemDetails(metaModel, variantInfo, lrSettings, leadingEntitySet, lineItemDefault);
	}

	/**
	 * Finds the first non-smart chart variant from the provided variants.
	 *
	 * This method iterates through the given variants to identify the first variant that is not a smart chart.
	 * It also determines the associated entity set and updates the variant's metadata to indicate whether it is a smart chart.
	 *
	 * @param {ODataMetaModel} metaModel - The OData meta model containing metadata about entities and annotations.
	 * @param {Record<string, IVariantSetting>} oVariants - A record of variants, where each key represents a variant and its associated metadata.
	 * @param {string} leadingEntitySet - The name of the leading entity set for the application.
	 * @returns {NonChartDetail}
}
	 * An object containing:
	 * - `firstAvailableKey`: The key of the first non-smart chart variant, or `null` if none is found.
	 * - `sEntitySet`: The entity set associated with the first non-smart chart variant.
	 * - `oVariant`: The metadata of the first non-smart chart variant.
	 * @private
	 */
	private findFirstNonSmartChartVariant(
		metaModel: ODataMetaModel,
		oVariants: Record<string, IVariantSetting>,
		leadingEntitySet: string
	): NonChartDetail {
		let firstAvailableKey: string | null = null;
		let sEntitySet = leadingEntitySet;
		let oVariant: IVariantSetting = {};

		for (const sKey in oVariants) {
			if (!Object.prototype.hasOwnProperty.call(oVariants, sKey)) continue;

			oVariant = oVariants[sKey];
			sEntitySet = oVariant.entitySet || leadingEntitySet;
			const oEntitySet = metaModel.getODataEntitySet(sEntitySet);

			if (oEntitySet) {
				oVariant.isSmartChart = this.checkIfSmartChart(metaModel, sEntitySet, oVariant);
				if (!oVariant.isSmartChart) {
					firstAvailableKey = sKey;
					break;
				}
			} else {
				oVariant.isSmartChart = true;
			}
		}
		return { firstAvailableKey, sEntitySet, oVariant };
	}

	/**
	 * Validates the responsive table type for a given variant and updates the List Report (LR) settings.
	 *
	 * @param {ILrSettings} lrSettings - The settings object for the List Report, including table settings and configurations.
	 * @param {IVariantSetting} oVariant - The variant object containing table settings and metadata.
	 * @param {string | null} firstAvailableKey - The key of the first available variant, used for logging errors.
	 * @returns {void}
	 * @private
	 */
	private validateResponsiveTable(lrSettings: ILrSettings, oVariant: IVariantSetting, firstAvailableKey: string | null): void {
		const isResponsive = oVariant.tableSettings?.type === TABLE_TYPES.RESPONSIVE;
		if (lrSettings.isResponsiveTable === undefined) {
			lrSettings.isResponsiveTable = isResponsive;
		} else if (lrSettings.isResponsiveTable !== isResponsive) {
			Log.error(`Variant with key ${firstAvailableKey} resulted in invalid Table Type combination.`);
		}
	}

	/**
	 *
	 * This method generates the default configuration for line item details, including table settings,
	 * responsive table type, and request-at-least fields based on the provided metadata, variant information,
	 * and settings.
	 *
	 * @param {ODataMetaModel} metaModel - The OData meta model containing metadata about entities and annotations.
	 * @param {VariantInfo} variantInfo - The variant information containing presentation variant and line item details.
	 * @param {ILrSettings} lrSettings - The settings object for the List Report, including table settings and other configurations.
	 * @param {string} leadingEntitySet - The name of the leading entity set for the application.
	 * @param {ILineItem[] | string | undefined} lineItemDefault - The default line item details, which can be an array of line items, a string, or undefined.
	 * @returns {ILineItemDetails} The default line item details object, including quick variant, settings, line item, entity set, and header info.
	 * @private
	 */
	private createDefaultLineItemDetails(
		metaModel: ODataMetaModel,
		variantInfo: VariantInfo,
		lrSettings: ILrSettings,
		leadingEntitySet: string,
		lineItemDefault?: ILineItem[] | string
	): ILineItemDetails {
		lrSettings.tableSettings = this.getNormalizedTableSettings(metaModel, lrSettings, leadingEntitySet);
		lrSettings.isResponsiveTable = lrSettings.tableSettings.type === TABLE_TYPES.RESPONSIVE;
		if (variantInfo?.presentationVariant?.RequestAtLeast?.length) {
			lrSettings.requestAtLeastFields = variantInfo.presentationVariant.RequestAtLeast;
		}
		return {
			quickVariant: {},
			lrSettings: lrSettings,
			lineItem: lineItemDefault,
			entitySet: leadingEntitySet,
			headerInfo: lrSettings?.tableSettings?.headerInfo || ""
		};
	}

	/**
	 * @param {object} oMetaModel - metamodel object
	 * @param {string} entityType - entity type of the application
	 * @param {string} qualifier - qualifier of the variant
	 * @returns {object} - returns the lineItem, presentationVariant, qualifierPath from the variant for the application based on manifest, annotations and metadata
	 * @private
	 */
	private getLineItemFromVariant(oMetaModel: ODataMetaModel, entityType: string, qualifier?: string): VariantInfo {
		const oSelectionPresentationVariant = this.getAnnotation<IPresentationVariant>(
			oMetaModel,
			entityType,
			UIAnnotations.UISelectionPresentationVariant,
			qualifier
		);

		let oPresentationVariant;
		if (oSelectionPresentationVariant?.PresentationVariant) {
			oPresentationVariant = this.getPresentationVariant(oMetaModel, entityType, oSelectionPresentationVariant.PresentationVariant);
		} else {
			oPresentationVariant = this.getAnnotation<IPresentationVariant>(
				oMetaModel,
				entityType,
				UIAnnotations.UIPresentationVariant,
				qualifier
			);
		}

		const oDetails = oPresentationVariant ? this.getLineItem(oMetaModel, entityType, oPresentationVariant) : null;
		const lineItem = oDetails?.lineItem || this.getAnnotation<ILineItem[]>(oMetaModel, entityType, UIAnnotations.UILineItem, "");

		return {
			presentationVariant: oPresentationVariant,
			lineItem: lineItem,
			qualifierPath: oDetails?.annotationPath || ""
		};
	}

	// get the annotation , sAnnotation from the entityType, sEntityType
	private getAnnotation<T extends IPresentationVariant | ILineItem[]>(
		metaModel: ODataMetaModel,
		entityType: string,
		annotation: UIAnnotations,
		qualifierName?: string
	): T | undefined {
		const fullAnnotation = `${annotation}${qualifierName ? `#${qualifierName}` : ""}`;
		const entityTypeData = metaModel.getODataEntityType(entityType) as IEntityType;
		return entityTypeData?.[fullAnnotation] as T | undefined;
	}

	/**
	 * This method determines the presentation variant based on the provided selection presentation variant.
	 * If the presentation variant is defined via a `Path`, it resolves the path to retrieve the corresponding object
	 * from the OData meta model. If the presentation variant is defined inline (i.e., without a `Path`), it directly
	 * returns the inline object.
	 *
	 * @param {ODataMetaModel} metaModel - The OData meta model containing metadata about entities and annotations.
	 * @param {string} entityTypeData - The entity type for which the presentation variant is to be retrieved.
	 * @param {IPresentationVariant} selectionPresentationVariant -
	 * The selection presentation variant object, which may contain a `Path` or an inline `PresentationVariant`.
	 * @returns {IPresentationVariant} The resolved presentation variant object.
	 * @private
	 */
	private getPresentationVariant(
		metaModel: ODataMetaModel,
		entityTypeData: string,
		selectionPresentationVariant: IPresentationVariant
	): IPresentationVariant {
		// PresentationVariant must be defined (according to vocabulary) either via "Path" or inline (i.e. Path is not defined).
		// For compatibility, just ignore if not provided (leading to fallback to use LineItem without qualifier)
		const presentationVariant = selectionPresentationVariant?.PresentationVariant;

		if (presentationVariant?.Path) {
			return this.getObject<IPresentationVariant>(metaModel, entityTypeData, presentationVariant.Path);
		}
		return presentationVariant!;
	}

	/**
	 * Retrieves the line item annotation details for a given entity type and presentation variant.
	 *
	 * This method searches for the `com.sap.vocabularies.UI.v1.LineItem` annotation within the visualizations
	 * of the provided presentation variant. If found, it returns the line item details, including the annotation path
	 * and qualifier.
	 *
	 * @param {ODataMetaModel} metaModel - The OData meta model containing metadata about the entity type.
	 * @param {string} entityTypeData - The entity type for which the line item annotation is to be retrieved.
	 * @param {IPresentationVariant} presentationVariantData - The presentation variant containing visualizations.
	 * @returns { IUIVisualizations | IUIVisualizations[] | null}
	 * - An object containing the line item details, annotation path, and qualifier if the annotation is found.
	 * - An array of UI annotations if applicable.
	 * - `null` if no valid line item annotation is found.
	 * @private
	 */
	private getLineItem(
		metaModel: ODataMetaModel,
		entityTypeData: string,
		presentationVariantData: IPresentationVariant
	): IUIVisualizations | null {
		// Visualizations must be defined (according to vocabulary)
		// however, this is not given at least in all demokit apps (presentationVariant consisting only of sortOrder)
		let visualizationData = presentationVariantData.Visualizations?.find(function (oVis) {
			return oVis.AnnotationPath?.includes(UIAnnotations.UILineItem);
		});

		return visualizationData
			? {
					lineItem: this.getObject<ILineItem[]>(metaModel, entityTypeData, visualizationData.AnnotationPath!),
					annotationPath: visualizationData.AnnotationPath!,
					sQualifier: visualizationData.AnnotationPath?.split("#")[1]
				}
			: null;
	}

	/**
	 * Extracts relevant column paths for `$select` and `$expand` OData query options.
	 *
	 * This method processes the provided column definitions to extract paths for the `$select` and `$expand` query options.
	 * It ensures that paths are unique and properly formatted for OData requests.
	 *
	 * @param {Array<Record<string,unknown>>} columns - An array of column definitions.
	 * Each column definition may include properties like `leadingProperty`, `additionalProperty`, and `navigationProperty`.
	 * @returns {SelectExpand} An object containing two arrays:
	 * - `select`: An array of unique paths for the `$select` query option.
	 * - `expand`: An array of unique paths for the `$expand` query option.
	 * @private
	 */
	private _getRelevantColumnPaths(columns: ColumnObjectData[]): SelectExpand {
		columns = Array.isArray(columns) ? columns : [];
		const selectSet = new Set<string>();
		const expandSet = new Set<string>();
		columns.forEach((oColumnData) => {
			if (oColumnData) {
				const sPath = oColumnData["leadingProperty"];
				const sAdditionalPath = oColumnData["additionalProperty"];
				const sExpandPath = oColumnData["navigationProperty"];
				if (sPath) {
					selectSet.add(sPath);
				}
				this.extractPathAndInsertToSet(sAdditionalPath!, selectSet);
				this.extractPathAndInsertToSet(sExpandPath!, expandSet);
			}
		});
		return {
			select: Array.from(selectSet),
			expand: Array.from(expandSet)
		};
	}

	/**
	 * Extracts and inserts unique paths into the provided array.
	 *
	 * This method splits the given path string by commas, iterates through the resulting paths,
	 * and adds each unique path to the provided array. Duplicate paths are ignored.
	 *
	 * @param {string} sPath - A comma-separated string of paths to be processed.
	 * @param {Set<string>}  - The array to which unique paths will be added.
	 * @private
	 */
	private extractPathAndInsertToSet(sPath: string, pathSet: Set<string>) {
		sPath?.split(",").forEach((path) => {
			if (path) {
				pathSet.add(path);
				// currently not doing transitive dependencies
			}
		});
	}

	/**
	 * Expands navigation properties for the given entity set and selected properties.
	 *
	 * This method processes the provided `selects` array to identify navigation properties
	 * that need to be expanded. If a navigation property is found, it is added to the `expands` array.
	 *
	 * @param {string} entitySetName - The name of the entity set being processed.
	 * @param {string[]} selects - An array of selected property paths to be checked for navigation properties.
	 * @param {string[]} expands - An array to which navigation properties requiring expansion will be added.
	 * @param {ODataMetaModel} metaModel - The OData meta model containing metadata about entities and properties.
	 * @private
	 */
	private extractAndExpandNavigationProperty(entitySetName: string, selects: string[], expands: string[], metaModel: ODataMetaModel) {
		const mNavigationProperties = {};

		// check if any expand is necessary
		for (const sPath of selects) {
			let iPos = sPath.lastIndexOf("/");
			let sNavigation;
			if (iPos < 0) {
				// sPath contains no '/' but still could be a navigationProperty
				if (!this.getNavigationProperty(entitySetName, sPath, metaModel, mNavigationProperties)) {
					continue; //not a navproperty hence continue to next iteration
				}
				sNavigation = sPath;
			} else {
				sNavigation = sPath.substring(0, iPos);
			}
			if (!expands.includes(sNavigation)) {
				expands.push(sNavigation);
			}
		}
	}

	//get the navigation property details for the given property from entityset, sEntitySet
	private getNavigationProperty(
		entitySetName: string,
		navProperty: string,
		metaModel: ODataMetaModel,
		mNavigationProperties: NavigationPropertiesMap
	) {
		let mMyNavigationProperties = mNavigationProperties?.[entitySetName];

		// If navigation properties not already fetched, then fetch them
		if (!mMyNavigationProperties) {
			mMyNavigationProperties = {};
			mNavigationProperties[entitySetName] = mMyNavigationProperties;

			const oEntitySet = metaModel.getODataEntitySet(entitySetName) as IEntitySet;
			if (oEntitySet) {
				const oEntityType = metaModel.getODataEntityType(oEntitySet.entityType) as IEntityType;
				if (oEntityType) {
					const aNavigationProperty = oEntityType.navigationProperty || [];
					aNavigationProperty.forEach((oNavigationProperty) => {
						const navName = oNavigationProperty.name;
						mMyNavigationProperties[navName] = oNavigationProperty;
					});
				}
			}
		}

		return mMyNavigationProperties?.[navProperty] || undefined;
	}

	// add all necessary fields to the select array
	private _addNecessaryFields(aSelects: string[], oInfo: ILineItemDetails, oMetaModel: ODataMetaModel) {
		let oEntitySet = oMetaModel.getODataEntitySet(oInfo.entitySet) as IEntitySet;
		let oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType) as IEntityType;
		let aProperties: string[] = [];

		if (aSelects.length > 0) {
			if (oInfo.lineItem && typeof oInfo.lineItem !== "string") {
				oInfo.lineItem.forEach((lineItem) => {
					if (
						lineItem.RecordType === FieldAnnotationsType.DataFieldWithIntentBasedNavigation ||
						lineItem.RecordType === FieldAnnotationsType.DataFieldWithNavigationPath
					) {
						const aDataFieldsWithNavigation = this.getDataFieldsWithNavigation(lineItem, oMetaModel, oEntityType);
						if (aDataFieldsWithNavigation?.length) {
							aProperties = aProperties.concat(aDataFieldsWithNavigation);
						}
					}
				});
			}
			//add the fieldcontrol path of the properties
			this.getFieldControlsPath(aSelects, oMetaModel, oEntityType, aProperties);
		}

		aProperties.forEach((property) => {
			this.ensureSelectionProperty(property, aSelects);
		});
	}

	/**
	 * Collects the paths for field controls based on the selected properties.
	 * This function iterates over the given selection of properties, aSelects, retrieves the corresponding
	 * property metadata from the OData model, and if a field control annotation exists for a property,
	 * it adds the path of this field control to the provided array of properties.
	 * @param {string[]} selects - An array of property names to be checked for field control paths.
	 * @param {object} metaModel - The OData meta model instance used to retrieve property metadata.
	 * @param {object} entityType - The entity type from the OData model that contains the properties.
	 * @param {string[]} aProperties - An array to which the field control paths will be added.
	 * @private
	 */
	private getFieldControlsPath(selects: string[], metaModel: ODataMetaModel, entityType: IEntityType, aProperties: string[]) {
		selects.forEach((sSelect) => {
			if (sSelect) {
				//needed for activating field control for DataField Annotation & when using the setting to add new columns
				let oProperty = (metaModel.getODataProperty(entityType, sSelect) as UIAnnotationValue) || {};
				if (UIAnnotations.CommonFieldControl in oProperty) {
					let oFieldControl = oProperty[UIAnnotations.CommonFieldControl];
					if (oFieldControl?.Path) {
						aProperties.push(oFieldControl.Path);
					}
				}
			}
		});
	}

	/**
	 * Handling for DataFieldWithNavigationPath and DataFieldWithIntentBasedNavigation
	 * @param {object} lineItem - LineItem object
	 * @param {object} metaModel - OData metamodel
	 * @param {object} entityType - EntityType object
	 * @returns {Array} - Array of properties to be selected in case field type is DataFieldWithNavigationPath or DataFieldWithIntentBasedNavigation
	 * @private
	 */
	private getDataFieldsWithNavigation(lineItem: ILineItem, metaModel: ODataMetaModel, entityType: IEntityType): string[] {
		const requestFields = [];

		// Handle Value.Path
		const valuePath = lineItem.Value?.Path;
		if (valuePath) {
			const lineItemProperty = metaModel.getODataProperty(entityType, valuePath) as UIAnnotationValue;
			const textAnnotation = lineItemProperty?.[UIAnnotations.CommonText]?.Path;
			const sapTextAnnotation = lineItemProperty?.["sap:text"];

			requestFields.push(sapTextAnnotation || textAnnotation || valuePath);
		}

		// Handle SemanticObject.Path
		if (lineItem.SemanticObject?.Path) {
			requestFields.push(lineItem.SemanticObject.Path);
		}

		// Handle Action.Path
		if (lineItem.Action?.Path) {
			requestFields.push(lineItem.Action.Path);
		}

		return requestFields;
	}

	// Section: Parameter Handling
	private getParameters(
		oInfo: ILineItemDetails,
		metaModel: ODataMetaModel,
		entitySet: string,
		oSelectExpand: SelectExpand
	): SelectExpandDetail {
		let aSelects = oSelectExpand.select || [];
		let aExpands = oSelectExpand.expand || [];

		let alwaysSelectField = oInfo?.lrSettings?.requestAtLeastFields || [];
		if (alwaysSelectField.length > 0) {
			aSelects = this._ensureSelectionProperties(aSelects, alwaysSelectField);
		}

		this._handleMandatorySelectionFields(entitySet, aSelects, metaModel);
		this._addNecessaryFields(aSelects, oInfo, metaModel);
		this.extractAndExpandNavigationProperty(entitySet, aSelects, aExpands, metaModel);

		return {
			expand: aExpands.join(",") || undefined,
			select: aSelects.join(",") || undefined
		};
	}

	/**
	 *
	 * @param {Array} aSelects , select parameters
	 * @param {SelectionProperties} alwaysSelectField, all the fields that are marked as requestAtLeastFields
	 * @returns {Array} aSelects, updated select parameters
	 * @private
	 */

	private _ensureSelectionProperties(aSelects: string[], alwaysSelectField: SelectionProperties): string[] {
		for (const item of alwaysSelectField) {
			if (typeof item === "object" && item?.PropertyPath && !aSelects.includes(item.PropertyPath)) {
				aSelects.push(item.PropertyPath);
			}
		}

		return aSelects;
	}

	/**
	 * Handles the mandatory selection fields for the given entity set and properties.
	 *
	 * @param {object} entitySet - The entity set object.
	 * @param {array} aSelects - The array of properties.
	 * @returns {boolean} True if the entity set or properties have mandatory fields, false otherwise.
	 * @private
	 */
	private _handleMandatorySelectionFields(entitySet: string, aSelects: string[], oMetaModel: ODataMetaModel) {
		const oEntitySet = oMetaModel.getODataEntitySet(entitySet, false) as IEntitySet;
		const oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType, false) as IEntityType;

		oEntityType.key.propertyRef.forEach((field) => {
			this.ensureSelectionProperty(field.name, aSelects);
		});
	}

	// push the selection properties to the select array
	private ensureSelectionProperty(sProperty: string, aSelects: string[]) {
		sProperty?.split(",").forEach(function (sElement) {
			if (sElement && !aSelects.includes(sElement)) {
				aSelects.push(sElement);
			}
		});
	}

	/**
	 * Creates a card manifest for a recommended card.
	 *
	 * This method generates a new card manifest based on the provided input data, version information, and app manifest.
	 * It also processes the columns to set attributes or titles for the card content and handles row navigation suppression if required.
	 *
	 * @param {IManifestCardData} oInput - The input data for the card, including card title, subtitle, columns, and entity set.
	 * @param {IVersionInfo} oVersionInfo - The version information, including the version and build timestamp.
	 * @param {IAppManifest} manifest - The original app manifest.
	 * @param {boolean} [bSuppressRowNavigation] - Optional flag to suppress row navigation actions in the card content.
	 * @returns {ICardManifest} The generated card manifest object.
	 * @private
	 */
	public _createCardManifest(
		oInput: IManifestCardData,
		oVersionInfo: IVersionInfo,
		manifest: IAppManifest,
		bSuppressRowNavigation?: boolean
	): ICardManifest {
		let oUIManifest = manifest["sap.ui"];
		let oAppManifest = manifest["sap.app"];
		let attributeIndex = 0;

		if (oAppManifest?.["crossNavigation"]) {
			delete oAppManifest["crossNavigation"];
		}
		if (oAppManifest) {
			Object.assign(oAppManifest, {
				type: "card",
				id: `user.${oInput.id}.${Date.now()}`,
				title: oInput.cardTitle || "",
				subTitle: oInput.subTitle
			});
		}

		let oNewManifest: ICardManifest = {
			"sap.ui": oUIManifest,
			"sap.app": this.createManifestSapApp(oAppManifest!),
			"sap.card": this.createManifestSapCard(manifest, oInput),
			"sap.ui5": this.createSapui5()
		};
		const oContent = oNewManifest?.["sap.card"]?.content;

		oInput.columns.slice(0, COLUMN_LENGTH).forEach((column) => {
			const columnValue = this._getAttributeValue(column);
			if (column.identifier && oContent?.item) {
				// If column.identifier is true, set it as the title
				oContent.item.title = { value: columnValue, identifier: true };
			} else if (oContent?.item?.attributes) {
				// Otherwise, add it to the attributes
				oContent.item.attributes[attributeIndex] = {
					value: columnValue,
					visible: true,
					...(column.state && { state: column.state, showStateIcon: column.showStateIcon })
				};
				attributeIndex++;
			}
		});

		// if bSuppressRowNavigation true, remove content actions
		if (bSuppressRowNavigation && oContent?.item) {
			oContent.item.actions = [];
		}

		return {
			...oNewManifest,
			"sap.insights": {
				parentAppId: oInput.id,
				cardType: "RT",
				versions: {
					ui5: `${oVersionInfo.version}-${oVersionInfo.buildTimestamp}`
				},
				visible: true
			}
		};
	}

	/**
	 * Get Attribute Value
	 *
	 * @param {object} attributeData - column object
	 * @returns {string} returns attribute value
	 * @private
	 */
	private _getAttributeValue(attributeData: Attribute): string {
		let attributeValue = !attributeData.value.startsWith("{")
			? "{= extension.formatters.stringFormatter(${" + attributeData.path + "}) }"
			: attributeData.value;
		if (attributeData.type === "Edm.Date" || attributeData.type === "Edm.DateTime") {
			const oDateFormatOptions = JSON.stringify({ pattern: Formatting.getDatePattern("short") });
			attributeValue =
				"{=${" + attributeData.path + "}?format.dateTime(${" + attributeData.path + "}, " + oDateFormatOptions + ") : ''}";
		}

		return attributeValue;
	}

	//creates sap.app object structure for the card manifest of recommended card
	private createManifestSapApp(appManifest: ISapApp) {
		const manifestAppData = deepExtend({}, appManifest) as ISapApp;
		if (manifestAppData?.dataSources?.mainService) {
			manifestAppData.dataSources["filterService"] = manifestAppData.dataSources.mainService;
			if (manifestAppData.dataSources["filterService"]?.settings) {
				manifestAppData.dataSources["filterService"].settings["odataVersion"] = "2.0";
			}
		}

		return manifestAppData;
	}

	/**
	 * Creates the manifest's SAP card object, sap.card based on the input card details.
	 *
	 * @param {oIAppManifestbject} manifest - The original manifest object of the application.
	 * @param {IManifestCardData} oInput - The input object containing card details.
	 * @returns {ISapCard} The SAP card configuration object.
	 */
	private createManifestSapCard(manifest: IAppManifest, oInput: IManifestCardData): ISapCard {
		const datasource = manifest["sap.app"]?.dataSources;
		const sServiceUrl = datasource?.mainService?.uri;
		const entitySetName = oInput.entitySet;
		const sCountPath = "__count";
		const sText = {
			text: "{= ${" + sCountPath + "} === '0' ? '' : ${" + sCountPath + "} }"
		};

		let oCardConfig: ISapCard = {
			type: "List"
		};

		oCardConfig["configuration"] = this.createManifestSapCardConfig(sServiceUrl || "", entitySetName);
		oCardConfig["data"] = this.createManifestSapCardData(sServiceUrl || "", oInput.url);

		oCardConfig["header"] = {
			title: oInput.cardTitle,
			subTitle: "",
			actions: [],
			status: sText,
			data: {
				path: "/content/d"
			}
		};

		oCardConfig["extension"] = "module:sap/insights/CardExtension";
		oCardConfig["content"] = {
			data: {
				path: "/content/d/results"
			},
			maxItems: 5,
			item: {
				actions: [],
				attributesLayoutType: "OneColumn",
				attributes: []
			}
		};

		this.addCardActions(oCardConfig, oInput.semanticObject, oInput.action);
		return oCardConfig;
	}

	/**
	 * Sets the card actions for the given SAP card.
	 *
	 * @param {object} sapCard - The SAP card object to set the actions on.
	 * @param {string} semObj - The semantic object for the navigation target.
	 * @param {string} semanticAction - The semantic action for the navigation target.
	 */
	private addCardActions(sapCard: ISapCard, semObj: string, semanticAction: string) {
		let oHeaderParams: ICardActionParameters = {
			ibnTarget: {
				semanticObject: semObj,
				action: semanticAction
			},
			sensitiveProps: [],
			ibnParams: {}
		};

		let oHeaderParameterValue = [
			{
				type: "Navigation",
				parameters: "{= extension.formatters.getNavigationContext(${parameters>/headerState/value})}"
			}
		];

		let oContentParams = JSON.parse(JSON.stringify(oHeaderParams)) as ICardActionParameters;
		let oContentParameterValue = [
			{
				type: "Navigation",
				parameters: "{= extension.formatters.getNavigationContext(${parameters>/contentState/value}, ${})}"
			}
		];

		if (sapCard.configuration?.parameters) {
			sapCard.configuration.parameters.headerState = {
				value: JSON.stringify(oHeaderParams)
			};
			sapCard.configuration.parameters.contentState = {
				value: JSON.stringify(oContentParams)
			};
		}
		if (sapCard.header) {
			sapCard.header.actions = oHeaderParameterValue;
		}
		if (sapCard?.content?.item) {
			sapCard.content.item.actions = oContentParameterValue;
		}
	}

	/**
	 * Creates the manifest sap card configuration object.
	 *
	 * @param {string} sServiceUrl - The service URL to be used in the request.
	 * @param {string} entitySetName - The name of the entity set.
	 * @returns {object} The SAP card configuration object.
	 */
	private createManifestSapCardConfig(sServiceUrl: string, entitySetName: string): ISapCardConfig {
		const oCardConfiguration = {
			parameters: {
				_relevantODataFilters: {
					value: []
				},
				_relevantODataParameters: {
					value: []
				},
				_entitySet: {
					value: entitySetName
				},
				_urlSuffix: {
					value: "/Results"
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
							url: "{{destinations.service}}" + sServiceUrl,
							method: "HEAD",
							headers: {
								"X-CSRF-Token": "Fetch"
							}
						}
					}
				}
			}
		};

		return oCardConfiguration;
	}

	//create sap.ui5 object for the card manifest
	private createSapui5(): ISapUI5App {
		return {
			_version: "1.1.0",
			contentDensities: { compact: true, cozy: true },
			dependencies: {
				libs: {
					"sap.insights": {
						lazy: false
					}
				}
			}
		};
	}

	/**
	 * Creates the manifest data for an SAP card.
	 *
	 * @param {string} sServiceUrl - The service URL to be used in the request.
	 * @param {string} urlExpand - The URL to expand in the batch request.
	 * @returns {IRequestData} The SAP card data object containing the request configuration.
	 */
	private createManifestSapCardData(sServiceUrl: string, urlExpand: string): IRequestData {
		const oBatch = {
			content: {
				method: "GET",
				url: urlExpand,
				headers: {
					Accept: "application/json"
				}
			}
		};
		const oSapCardData: IRequestData = {
			request: {
				url: "{{destinations.service}}" + sServiceUrl + "/$batch",
				method: "POST",
				headers: {
					"X-CSRF-Token": "{{csrfTokens.token1}}"
				},
				batch: oBatch
			}
		};

		return oSapCardData;
	}

	/**
	 * This function returns card details required for the recommended card manifest
	 * based on app manifest and annotations
	 * @param {object} manifest - The original app manifest
	 * @param {object} oInfo - The object containing details of lineitem, entityset, settings etc
	 * @param {object} oParentApp - The parent app object
	 * @param {object} oMetaModel - The OData metamodel
	 * @returns {object} The card data object with title, subtitle, url, semanticObject, action, id and column details
	 * @private
	 */
	public _getManifestCardData(
		manifest: IAppManifest,
		oInfo: ILineItemDetails,
		oParentApp: IAppInfoData,
		oMetaModel: ODataMetaModel
	): IManifestCardData {
		const manifestApp = manifest["sap.app"];
		const dataSources = manifestApp?.dataSources;

		const mainServiceUri = dataSources?.mainService?.uri || "";

		const lineItem = oInfo.lineItem as ILineItem[];
		const entitySet = oInfo.entitySet;
		const oEntitySet = oMetaModel.getODataEntitySet(entitySet) as IEntitySet;
		const oEntityType = oMetaModel.getODataEntityType(oEntitySet?.entityType) as IEntityType;
		const serviceUrl = `${mainServiceUri.replace(/\/$/, "")}/${entitySet}`; // make '{mainServiceUri}/{entitySet}' format

		//get the column details for each of the lineitem columns
		const aColumns = lineItem
			?.map((oColumn) => this._getColumnDetail(entitySet, oMetaModel, oColumn))
			.filter((oItem) => oItem !== undefined);

		const oSelectExpand = this._getRelevantColumnPaths(aColumns);
		//get the complete select and expand parameters for url
		const mParameters = this.getParameters(oInfo, oMetaModel, entitySet, oSelectExpand);

		const urlSelectExpand = this.createCustomParams(mParameters);
		const finalUrl = urlSelectExpand
			? `${serviceUrl}?$top=5&skip=0&${urlSelectExpand}&$inlinecount=allpages`
			: `${serviceUrl}?$top=5&skip=0`;
		//sort  the column based on their importance and then slice the first 4 columns
		const aColumnSorted = (sortCollectionByImportance(aColumns) as IColumnData[])
			.map((column) => {
				return {
					path: column?.path,
					type: column?.type,
					value: column?.value,
					identifier: column?.identifier,
					state: column?.state,
					showStateIcon: column?.showStateIcon
				};
			})
			.slice(0, 4);
		return {
			cardTitle: manifest?.["sap.app"]?.title,
			subTitle: oEntityType[UIAnnotations.CommonLabel] ? `Top 5 ${oEntityType[UIAnnotations.CommonLabel].String}` : "",
			url: finalUrl,
			semanticObject: oParentApp?.semanticObject || "",
			action: oParentApp?.action || "",
			id: manifest?.["sap.app"]?.id,
			columns: aColumnSorted,
			entitySet: entitySet
		};
	}

	/**
	 * This function returns the column detail object for the given column's context
	 * @param {string} entitySet - - The entity set name
	 * @param {object} oMetaModel -  OData metamodel
	 * @param {object} lineItemContext - The line item column context object
	 * @returns {object} The column detail containing value, path, importance and type
	 * @private
	 */
	private _getColumnDetail(entitySet: string, oMetaModel: ODataMetaModel, lineItemContext: ILineItem) {
		let oProperty;
		let oEntitySet = oMetaModel.getODataEntitySet(entitySet) as IEntitySet;
		let oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType) as IEntityType;

		if (lineItemContext.Value?.Path) {
			oProperty = oMetaModel.getODataProperty(oEntityType, lineItemContext.Value.Path) as UIAnnotationValue;
			let oPropertyHidden = oProperty[UIAnnotations.UIHidden];

			// if oProperty not hidden and oLineitemContext not hidden then only consider the column else return undefined
			if (oPropertyHidden?.Bool === "true" || oPropertyHidden?.Bool === true) {
				return undefined;
			}
			//check if lineItemContext is hidden or no oProperty is found
			if (this.isPropertyHidden(lineItemContext) || !oProperty || Object.keys(oProperty).length === 0) {
				return undefined;
			}
		}

		let oP13NDetails = this.createP13N(oEntitySet, oProperty, lineItemContext, oMetaModel);
		oP13NDetails = oP13NDetails.replace(/\\/g, ""); // Remove the double backslashes
		let columnDataObject = oP13NDetails ? (JSON.parse(oP13NDetails) as ColumnObjectData) : {};

		if (!this.isSupportedColumn(columnDataObject, lineItemContext, oMetaModel, oEntitySet)) {
			return undefined;
		}
		if (oProperty) {
			columnDataObject = this.getColumnObjectDetails(columnDataObject, oProperty, oEntityType, lineItemContext);
			if (lineItemContext?.[FieldAnnotationsType.Importance] !== undefined) {
				const importance = lineItemContext[FieldAnnotationsType.Importance];
				columnDataObject.importance = importance;
			}
		}

		return columnDataObject;
	}

	/**
	 * Retrieves the column object details based on the provided property and entity type.
	 *
	 * @param {object} columnDataObject - The column information object to be populated.
	 * @param {object} propertyDetails - The property object containing metadata about the column.
	 * @param {object} entityType - The entity type object containing metadata about the entity.
	 * @param {object} dataField - The data field object containing the lineitem column context object
	 * @returns {object} The populated column information object.
	 * @private
	 */
	private getColumnObjectDetails(
		columnDataObject: ColumnObjectData,
		propertyDetails: UIAnnotationValue,
		entityType: IEntityType,
		dataField: ILineItemContext
	) {
		let sColumnKeyDescription = propertyDetails[UIAnnotations.CommonText]?.Path || "";
		sColumnKeyDescription = "{" + sColumnKeyDescription + "}";
		let sColumnValue = propertyDetails.name ? "{" + propertyDetails.name + "}" : "";
		let sNavigation = "";
		const aSemKeyAnnotation = entityType[UIAnnotations.CommonSemanticKey];
		const bIsPropertySemanticKey =
			!!aSemKeyAnnotation &&
			aSemKeyAnnotation.some(function (oAnnotation) {
				return oAnnotation.PropertyPath === propertyDetails.name;
			});
		let bIsCriticality: boolean = false;
		let criticalityAnnotation = undefined;

		if ((dataField?.Criticality && dataField?.Value?.Path) === propertyDetails.name) {
			criticalityAnnotation = dataField;
			bIsCriticality = true;
		}

		if (propertyDetails[UIAnnotations.MeasuresISOCurrency]?.Path) {
			sColumnValue = sColumnValue.concat(" " + "{" + sNavigation + propertyDetails[UIAnnotations.MeasuresISOCurrency]?.Path + "}");
		}
		if (propertyDetails[UIAnnotations.MeasuresUnit]?.Path) {
			sColumnValue = sColumnValue.concat(" " + "{" + sNavigation + propertyDetails[UIAnnotations.MeasuresUnit]?.Path + "}");
		}
		if (propertyDetails[UIAnnotations.CommonText]?.Path) {
			let sTextArragement = propertyDetails[UIAnnotations.CommonText]?.[UIAnnotations.UITextArrangement];
			if (!sTextArragement) {
				sTextArragement = entityType[UIAnnotations.UITextArrangement];
			}
			this._setColumnTextValue(sTextArragement, columnDataObject, sColumnKeyDescription, sColumnValue);
		} else {
			columnDataObject["value"] = sColumnValue;
			if (bIsPropertySemanticKey) {
				columnDataObject["identifier"] = bIsPropertySemanticKey;
			}
		}
		if (bIsCriticality) {
			columnDataObject["state"] = this.buildExpressionForCriticalityColor(criticalityAnnotation);
			columnDataObject["showStateIcon"] =
				criticalityAnnotation?.CriticalityRepresentation?.EnumMember !==
					FieldAnnotationsType.CriticalityRepresentationTypeWithoutIcon || true;
		}
		columnDataObject["path"] = propertyDetails[UIAnnotations.CommonText]?.Path || propertyDetails.name;
		columnDataObject["type"] = propertyDetails.type;
		return columnDataObject;
	}

	/**
	 * Build expression for the criticality annotation, kept same as the one used in LROP
	 * @param {object} criticalityAnnotation - The criticality annotation object
	 * @returns {string} The expression for the criticality color
	 * @private
	 */
	private buildExpressionForCriticalityColor(criticalityAnnotation?: ILineItemContext) {
		let sFormatCriticalityExpression: CoreLib.ValueState | string = ValueState.None;
		let sExpressionTemplate;
		let oCriticalityProperty = criticalityAnnotation?.Criticality;
		enum CriticalityType {
			Negative = "com.sap.vocabularies.UI.v1.CriticalityType/Negative",
			Critical = "com.sap.vocabularies.UI.v1.CriticalityType/Critical",
			Positive = "com.sap.vocabularies.UI.v1.CriticalityType/Positive"
		}
		if (oCriticalityProperty) {
			sExpressionTemplate =
				"'{'= ({0} === ''" +
				CriticalityType.Negative +
				"'') || ({0} === ''1'') || ({0} === 1) ? ''" +
				ValueState.Error +
				"'' : " +
				"({0} === ''" +
				CriticalityType.Critical +
				"'') || ({0} === ''2'') || ({0} === 2) ? ''" +
				ValueState.Warning +
				"'' : " +
				"({0} === ''" +
				CriticalityType.Positive +
				"'') || ({0} === ''3'') || ({0} === 3) ? ''" +
				ValueState.Success +
				"'' : " +
				"''" +
				ValueState.None +
				"'' '}'";
			if (oCriticalityProperty?.Path) {
				const sCriticalitySimplePath = "${" + oCriticalityProperty.Path + "}";
				sFormatCriticalityExpression = formatMessage(sExpressionTemplate, [sCriticalitySimplePath]);
			} else if (oCriticalityProperty?.EnumMember) {
				const sCriticality = "'" + oCriticalityProperty.EnumMember + "'";
				sFormatCriticalityExpression = formatMessage(sExpressionTemplate, [sCriticality]);
			} else {
				Log.warning("Case not supported, returning the default sap.ui.core.ValueState.None");
			}
		} else {
			// Any other cases are not valid, the default value of 'None' will be returned
			Log.warning("Case not supported, returning the default sap.ui.core.ValueState.None");
		}

		return sFormatCriticalityExpression;
	}

	/**
	 * Sets display text format of column
	 *
	 * @private
	 * @param {{EnumMember: string} | undefined} sTextArragement - sTextArragement object
	 * @param { ColumnObjectData} columnDataObject - Object containing column details
	 * @param {string} sColumnKeyDescription - Description field to include in text value
	 * @param {string} sColumnValue - The value to include in Text value
	 */
	private _setColumnTextValue(
		sTextArragement: { EnumMember: string } | undefined,
		columnDataObject: ColumnObjectData,
		sColumnKeyDescription: string,
		sColumnValue: string
	) {
		enum TextArrangementType {
			TextOnly = "TextOnly",
			TextLast = "TextLast",
			TextSeparate = "TextSeparate"
		}
		const sTextArrangementType = sTextArragement?.EnumMember?.split("/")[1];
		let valueExpr;

		switch (sTextArrangementType) {
			case TextArrangementType.TextOnly:
				valueExpr = `{= $${sColumnKeyDescription} === '' ? '' : $${sColumnKeyDescription} }`;
				break;

			case TextArrangementType.TextLast:
				valueExpr =
					`{= $${sColumnValue} === '' ? '' : $${sColumnValue} }` +
					`{= $${sColumnKeyDescription} === '' ? '' : ' (' + ($${sColumnKeyDescription}) + ')' }`;
				break;

			case TextArrangementType.TextSeparate:
				valueExpr = `{= $${sColumnValue} === '' ? '' : $${sColumnValue} }`;
				break;

			default:
				valueExpr =
					`{= $${sColumnKeyDescription} === '' ? '' : $${sColumnKeyDescription} }` +
					`{= $${sColumnValue} === '' ? '' : ' (' + ($${sColumnValue}) + ')' }`;
				break;
		}
		columnDataObject["value"] = valueExpr;
	}

	// get requestAtlLeastFields from PresentationVariant
	private _getRequestAtLeastFields(presentationVariant: IPresentationVariant): string[] | RequestAtleastFieldType[] | [] {
		return presentationVariant && Array.isArray(presentationVariant.requestAtLeastFields)
			? presentationVariant.requestAtLeastFields
			: [];
	}

	/**
	 * Creates a query string with custom parameters for OData requests.
	 *
	 * This method generates a query string containing `$expand` and `$select` parameters
	 * based on the provided input object. The values are URL-encoded to ensure proper formatting.
	 *
	 * @param {object} mParameters - An object containing the parameters for the query string.
	 * @param {string | undefined} mParameters.expand - The value for the `$expand` parameter, if any.
	 * @param {string | undefined} mParameters.select - The value for the `$select` parameter, if any.
	 * @returns {string} A query string containing the `$expand` and `$select` parameters, joined by `&`.
	 * @private
	 */
	private createCustomParams(mParameters: SelectExpandDetail): string {
		const aCustomParams = [];
		if (mParameters?.expand) {
			aCustomParams.push("$expand=" + encodeURL(mParameters["expand"]));
		}
		if (mParameters?.select) {
			aCustomParams.push("$select=" + encodeURL(mParameters["select"]));
		}
		return aCustomParams.join("&");
	}

	/**
	 * Retrieves an object from the OData meta model based on the given entity type and path.
	 *
	 * This method resolves the provided path to an absolute path if it is relative, using the entity type as the base.
	 * It then retrieves the corresponding object from the meta model. Any "@" characters in the path are removed
	 * to match the meta model's structure.
	 *
	 * @param {ODataMetaModel} metaModel - The OData meta model containing metadata about entities and annotations.
	 * @param {string} entityTypeName - The entity type used as the base for resolving relative paths.
	 * @param {string} path - The path to the object in the meta model. Can be relative or absolute.
	 * @returns {IPresentationVariant | ILineItem[]} The object retrieved from the meta model, which can be a presentation variant or an array of nested objects.
	 * @private
	 */
	private getObject<T extends IPresentationVariant | ILineItem[]>(metaModel: ODataMetaModel, entityTypeName: string, path: string): T {
		if (path[0] !== "/") {
			// relative path - add path of annotation target, i.e. EntityType
			path = (metaModel.getODataEntityType(entityTypeName, true) as string) + "/" + path; //*****check this */
		}
		// assumption: absolute paths in annotations are equal to corresponding paths in metaModel
		// any "@" are removed in the metaModel
		return metaModel.getObject(path.replace(/@/g, "")) as T;
	}

	/**
	 * Check If Page is List Report
	 *
	 * @param {object} page - page object
	 * @returns {boolean} returns boolean
	 * @private
	 */
	public _isListReport(page?: IPageType): boolean {
		return page?.component?.name === "sap.suite.ui.generic.template.ListReport";
	}

	/**
	 * @param {IPageType[] | PageRecord} pages - pages object from manifest
	 * @returns {ILrSettings} - returns the settings object for the ListReport
	 */
	private getSettingsForPage(pages: IPageType[] | undefined | PageRecord): ILrSettings {
		if (!pages) {
			return {};
		}

		let lrSettings: ILrSettings = {};

		// Handling array and object structure in LR V2 manifest
		if (Array.isArray(pages) && this._isListReport(pages[0])) {
			const listPage = pages[0];
			if (listPage?.component) {
				const component = listPage.component;
				lrSettings = component?.settings || {};
				lrSettings.bSupressCardRowNavigation = this.shouldSuppressCardRowNavigation(listPage);
			}
		} else if (Object.keys(pages).length) {
			const sListKey = Object.keys(pages).find((key) => this._isListReport((pages as PageRecord)[key] as IPageType));
			if (sListKey) {
				const listPage = (pages as PageRecord)[sListKey] as IPageType;

				if (listPage?.component) {
					const component = listPage.component;
					lrSettings = (component?.settings ?? {}) as ILrSettings;
					lrSettings.bSupressCardRowNavigation = this.shouldSuppressCardRowNavigation(listPage);
				}
			}
		}

		return lrSettings;
	}

	/**
	 * Determines whether card row navigation should be suppressed for the card
	 *
	 * @param {IPageType} page - The ListReport page object from the manifest.
	 * @returns {boolean} True if card row navigation should be suppressed
	 */
	private shouldSuppressCardRowNavigation(listPage: IPageType): boolean {
		// LR only app or if external navigation from OP
		if (listPage.pages) {
			// If pages is an array, handle based on its length and navigation property
			if (Array.isArray(listPage.pages)) {
				if (listPage.pages.length === 0 || listPage.pages[0]?.navigation) {
					return true;
				}
			} else {
				// If pages is an object, check if the object keys have navigation
				const keys = Object.keys(listPage.pages);
				if (keys.length === 0 || (keys.length && (listPage.pages[keys[0]] as IPageType)?.navigation)) {
					return true;
				}
			}
		} else {
			//if no list pages return true
			return true;
		}

		// Check for Quick variant selection X in settings
		if (listPage?.component?.settings?.quickVariantSelectionX) {
			return true;
		}

		return false;
	}

	/**
	 * @param {object} metaModel - metamodel object
	 * @param {ILrSettings} ILrSettings - settings object from the manifest
	 * @param {string} entitySetName - entity set of the application
	 * @returns {object} - returns the normalized table settings
	 * @private
	 */
	private getNormalizedTableSettings(
		metaModel: ODataMetaModel,
		lRVariantSettings: ILrSettings | IVariantSetting,
		entitySetName: string
	): ITableSettings {
		const settings = deepExtend({}, lRVariantSettings) as ILrSettings;

		// 1. map boolean settings gridTable and treeTable to tableType
		if (settings && !settings.tableType) {
			if (settings.gridTable) {
				settings.tableType = TABLE_TYPES.GRID;
			} else if (settings.treeTable) {
				settings.tableType = TABLE_TYPES.TREE;
			}
		}

		// 2. map flat settings to structured ones
		settings.tableSettings = settings.tableSettings || {};
		settings.tableSettings.type = settings.tableSettings.type || settings.tableType;

		const entitySet = metaModel.getODataEntitySet(entitySetName) as IEntitySet;
		const entityTypeData = metaModel.getODataEntityType(entitySet.entityType) as IEntityType;

		// 3. determine type
		if (
			settings.tableSettings.type !== TABLE_TYPES.STANDARD_LIST &&
			settings.tableSettings.type !== TABLE_TYPES.OBJECT_LIST &&
			entitySetName
		) {
			settings.tableSettings.type =
				settings.tableSettings.type ||
				(entityTypeData[UIAnnotations.SapSemantics] === "aggregate" ? TABLE_TYPES.ANALYTICAL : TABLE_TYPES.RESPONSIVE);
			if (settings.tableSettings.type === TABLE_TYPES.ANALYTICAL && !(entityTypeData[UIAnnotations.SapSemantics] === "aggregate")) {
				settings.tableSettings.type = TABLE_TYPES.GRID;
			}
		}

		if (entityTypeData[UIAnnotations.UIHeaderInfo]) {
			settings.tableSettings.headerInfo = entityTypeData[UIAnnotations.UIHeaderInfo];
		}

		// 4. remove deprecated settings (to avoid new code to rely on them)
		delete settings.gridTable;
		delete settings.treeTable;
		delete settings.tableType;

		return settings.tableSettings;
	}

	/**
	 * @param {object} metaModel - metamodel object
	 * @param {string} entitySetName - entity set of the application
	 * @param {object} tabItem - details of the variant tab
	 * @returns {boolean} - returns true if the variant is a smart chart
	 */
	private checkIfSmartChart(metaModel: ODataMetaModel, entitySetName: string, tabItem: IVariantSetting): boolean {
		let entitySetData = metaModel.getODataEntitySet(entitySetName) as IEntitySet;
		let entityTypeData = metaModel.getODataEntityType(entitySetData.entityType) as IEntityType;
		let annotationName, annotationPath, variantData;
		annotationPath = tabItem.annotationPath;
		//variantData = !!annotationPath && (entityTypeData[annotationPath] as VariantInfo);
		variantData = annotationPath ? (entityTypeData[annotationPath] as VariantInfo) : undefined;

		if (variantData?.PresentationVariant) {
			// oVariant is SelectionPresentationVariant
			if (variantData.PresentationVariant.Visualizations) {
				annotationName = variantData.PresentationVariant.Visualizations[0].AnnotationPath;
			} else if (variantData.PresentationVariant.Path) {
				let sPresentationVariantPath = variantData.PresentationVariant.Path.split("@")[1];
				let oPresentationVariantAnnotation =
					sPresentationVariantPath && (entityTypeData[sPresentationVariantPath] as IPresentationVariant);
				annotationName = oPresentationVariantAnnotation ? oPresentationVariantAnnotation?.Visualizations?.[0].AnnotationPath : "";
			}
		} else if (variantData?.Visualizations) {
			// oVariant is PresentationVariant
			annotationName = variantData.Visualizations[0].AnnotationPath;
		}

		return !!((annotationName ?? "").indexOf(UIAnnotations.UIChart) > -1);
	}

	/**
	 * function returns true if the passed entityset / properties have mandatory properties
	 *
	 * @param {EntitySet} entitySetData - Entity set
	 * @param {Array} propertiesSet - Additional Properties
	 * @returns {boolean} returns boolean
	 * @private
	 */
	public hasMandatoryProperties(entitySetData?: IEntitySet, propertiesSet?: Property[]): boolean {
		// if entityset has required properties in filter restrictions return true
		if (entitySetData?.["Org.OData.Capabilities.V1.FilterRestrictions"]?.["RequiredProperties"]?.length) {
			return true;
		} else if (propertiesSet?.length) {
			// iterate through all properties and return true if any property is mandatory or sap:rquired-in-filter is true
			return propertiesSet.some((propertyDetail: Record<string, string> | Property) => {
				return (
					Object.keys(propertyDetail).length &&
					((propertyDetail as UIAnnotationValue)["sap:parameter"] === "mandatory" ||
						(propertyDetail as UIAnnotationValue)["sap:required-in-filter"] === "true")
				);
			});
		}

		return false;
	}

	/**
	 * Check if sEntitySet has association with parameterised entityset and if it has give parametersised entityset parameters
	 * @param {object} metaModel OData MetaModel
	 * @param {string} entitySetName of the EntitySet which has Parameter Entityset in association.
	 * @param {boolean} infoParamsRequired If the full info of parameters is needed or only the name of params is needed.
	 * @return {ParameterisedEntity} Contains name of Parameter EntitySet, keys of Parameter EntitySet and Name of Navigation property.
	 * @private
	 */
	public _getParametersisedEntitySetParams(
		metaModel: ODataMetaModel,
		entitySetName: string,
		infoParamsRequired: boolean
	): ParameterisedEntity {
		if (!metaModel) {
			throw new Error("OData Model needs to be passed as an argument");
		}
		const oResult: ParameterisedEntity = { entitySetName: null, parameters: [], navPropertyName: null };
		const entitySetData = metaModel.getODataEntitySet(entitySetName) as IEntitySet;
		const entityTypeData = metaModel.getODataEntityType(entitySetData.entityType) as IEntityType;
		const aNavigationProperties = entityTypeData.navigationProperty;

		if (!aNavigationProperties) {
			return oResult;
		}

		// filter the parameter entityset for extracting it's key and it's entityset name
		aNavigationProperties.forEach(function (oNavProperty) {
			const oNavigationEntitySet = metaModel.getODataAssociationEnd(entityTypeData, oNavProperty.name);
			const oNavigationEntityType = oNavigationEntitySet && (metaModel.getODataEntityType(oNavigationEntitySet.type) as IEntityType);

			if (oNavigationEntityType?.[UIAnnotations.SapSemantics] !== "parameters" || !oNavigationEntityType.key) {
				return false;
			}

			oResult.entitySetName = metaModel.getODataAssociationSetEnd(entityTypeData, oNavProperty.name)?.entitySet;
			for (let value of oNavigationEntityType.key.propertyRef) {
				if (infoParamsRequired) {
					const navProp = oNavigationEntityType.property as Property[];
					for (let navProperty of navProp) {
						if (navProperty.name === value.name) {
							oResult.parameters.push(navProperty);
						}
					}
				} else {
					oResult.parameters.push(value.name);
				}
			}

			const aSubNavigationProperties = oNavigationEntityType.navigationProperty;
			// Parameter entityset must have association back to main entityset.
			const bBackAssociationPresent = aSubNavigationProperties?.some(function (oSubNavigationProperty) {
				const sSubNavigationEntityType = metaModel.getODataAssociationEnd(
					oNavigationEntityType,
					oSubNavigationProperty?.name
				)?.type;
				//if entityset.entitytype is same as subnavigation entitytype then it's a back association
				oResult.navPropertyName = sSubNavigationEntityType === entitySetData.entityType ? oSubNavigationProperty?.name : null;
				return oResult.navPropertyName;
			});

			return bBackAssociationPresent && oResult.navPropertyName && oResult.entitySetName;
		});
		return oResult;
	}

	/**
	 * This function check if a lineitem annotation column is visible or not
	 * @param {object} lineItemAnnotations - The column details object
	 * @returns {Boolean} The column visibility status {true/false}
	 * @private
	 */
	private isPropertyHidden(lineItemAnnotations: ILineItemContext): boolean {
		let oFieldControl = lineItemAnnotations[UIAnnotations.CommonFieldControl];
		let uiHidden = lineItemAnnotations[UIAnnotations.UIHidden];

		// Check for FieldControl Hidden
		if (oFieldControl?.EnumMember === FieldAnnotationsType.FieldControlHiddenType) {
			return true;
		}

		// Check for UI Hidden
		if (uiHidden) {
			if (Object.prototype.hasOwnProperty.call(uiHidden, "Bool")) {
				return uiHidden?.Bool === "true";
			} else if (Object.prototype.hasOwnProperty.call(uiHidden, "Path")) {
				return false;
			} else {
				return true; // <Annotation Term="UI.Hidden"/>
			}
		}

		return false;
	}

	/**
	 * Creates a P13N  string for a given entity set, property, and line item column.
	 *
	 * @param {Object} contextSet - The entity set object.
	 * @param {Object} contextProp - The property details from metadata.
	 * @param {Object} columnDataField - The line item column data field.
	 * @param {Object} metaModel - The metadata model object.
	 * @returns {string} The P13N string for the specified entity set and property.
	 * @private
	 */
	private createP13N(
		contextSet: IEntitySet,
		contextProp?: Property | UIAnnotationValue,
		columnDataField?: ILineItemContext,
		metaModel?: ODataMetaModel
	): string {
		let p13nDetails: string = "";
		let additionalProperties: string[] = [];
		let navigationPath: string = "";
		let recordType = columnDataField?.RecordType;
		let dataFieldValue = columnDataField?.Value as ExtendedLineItemContextValue;
		let valuePath: string = dataFieldValue?.Path || "";

		if (
			recordType === FieldAnnotationsType.DataField ||
			recordType === FieldAnnotationsType.DataFieldForAnnotation ||
			recordType === FieldAnnotationsType.DataFieldWithUrl
		) {
			if (valuePath) {
				let columnKey = this.createP13NColumnKey(columnDataField as ILineItemContext);
				p13nDetails = '\\{"columnKey":"' + columnKey + '", "leadingProperty":"' + valuePath;
				navigationPath = this.getNavigationPrefixPath(metaModel as ODataMetaModel, contextSet, valuePath);
			} else if (dataFieldValue?.Apply?.Name === "odata.concat") {
				dataFieldValue?.Apply?.Parameters.forEach(function (parameterDetails) {
					if (parameterDetails.Type === "Path") {
						if (!p13nDetails) {
							p13nDetails = '\\{"columnKey":"' + parameterDetails?.Value + '", "leadingProperty":"' + parameterDetails?.Value;
						} else {
							additionalProperties.push(parameterDetails.Value);
						}
					}
				});
			}
			// Append type information and additional properties
			p13nDetails += this.processAdditionalProperties(
				contextProp as UIAnnotationValue,
				columnDataField as ILineItemContext,
				navigationPath,
				additionalProperties
			);
			if (recordType === FieldAnnotationsType.DataFieldWithUrl && columnDataField?.Url) {
				this.processDataFieldWithUrl(columnDataField, additionalProperties);
			}
			if (p13nDetails && additionalProperties.length) {
				p13nDetails += '", "additionalProperty":"' + additionalProperties.join();
			}
			if (p13nDetails) {
				p13nDetails += '"\\}';
			}
		}
		return p13nDetails;
	}

	//process DataFieldUrl properties and add them to additionalProperties
	private processDataFieldWithUrl(columnDataField: ILineItemContext, additionalProperties: string[]): void {
		const oDataFieldUrl = columnDataField.Url;
		if (oDataFieldUrl?.Apply?.Parameters) {
			oDataFieldUrl.Apply.Parameters.forEach((oParameter) => {
				if (oParameter.Type === "LabeledElement" && oParameter.Value?.Path) {
					additionalProperties.push(oParameter.Value.Path);
				}
			});
		}
		if (oDataFieldUrl?.Path) {
			additionalProperties.push(oDataFieldUrl.Path);
		}
	}

	/**
	 * Creates a personalized column key based on the provided data field.
	 * @param {Object} oDataField - The data field object containing metadata for generating the column key.
	 * @returns {string} The generated column key based on the data field.
	 */
	private createP13NColumnKey(dataFieldColumn: ILineItemContext): string {
		let columnKeyName = "",
			fioriTemplatePrefix = "template",
			seperatorNotation = "::";
		let recordType = dataFieldColumn.RecordType;
		let dataFieldValue = dataFieldColumn?.Value;
		let dataFieldSemanticObject = dataFieldColumn.SemanticObject?.String || "";
		let dataFieldActionString = dataFieldColumn.Action?.String || "";
		let dataFieldPath = dataFieldValue?.Path || "";
		let annotationPath: string | undefined = "",
			isRelevantAnnotation = null;
		let buildKey = function (parts: string[]) {
			return fioriTemplatePrefix + seperatorNotation + parts.join(seperatorNotation);
		};

		switch (recordType) {
			case FieldAnnotationsType.DataField:
				columnKeyName = dataFieldPath;
				break;

			case FieldAnnotationsType.DataFieldWithIntentBasedNavigation:
				columnKeyName = buildKey([
					FieldTypes.DataFieldWithIntentBasedNavigation,
					dataFieldSemanticObject,
					dataFieldActionString,
					dataFieldPath
				]);
				break;

			case FieldAnnotationsType.DataFieldWithNavigationPath:
				columnKeyName = buildKey([FieldTypes.DataFieldWithNavigationPath, dataFieldPath]);
				break;

			case FieldAnnotationsType.DataFieldForIntentBasedNavigation:
				columnKeyName = buildKey([FieldTypes.DataFieldForIntentBasedNavigation, dataFieldSemanticObject, dataFieldActionString]);
				break;

			case FieldAnnotationsType.DataFieldForAction:
				columnKeyName = buildKey([FieldTypes.DataFieldForAction, dataFieldActionString]);
				break;

			case FieldAnnotationsType.DataFieldForAnnotation:
				annotationPath = dataFieldColumn.Target?.AnnotationPath;

				isRelevantAnnotation =
					annotationPath &&
					(annotationPath.indexOf(FieldAnnotationsType.Contact) >= 0 ||
						annotationPath.indexOf(FieldAnnotationsType.DataPoint) >= 0 ||
						annotationPath.indexOf(FieldAnnotationsType.FieldGroup) >= 0 ||
						annotationPath.indexOf(FieldAnnotationsType.Chart) >= 0);
				if (isRelevantAnnotation) {
					columnKeyName = buildKey([FieldTypes.DataFieldForAnnotation, annotationPath as string]);
					//since DataFieldForAnnotation can contain an @ and this is not working with SmartTable.prototype._addTablePersonalisationToToolbar, it is removed
					columnKeyName = columnKeyName.replace("@", "");
				}
				break;

			default:
				// Handle cases where the RecordType does not match any of the known types
				columnKeyName = "";
				break;
		}

		return columnKeyName;
	}

	/**
	 * Retrieves the navigation prefix path for a given entity type and value path.
	 *
	 * @param {object} oMetaModel - The meta model object.
	 * @param {object} oContextSet - The context set object containing the entity type.
	 * @param {string} sPath - The value path for which the navigation prefix is needed.
	 * @returns {string} The navigation prefix path.
	 */
	private getNavigationPrefixPath(oMetaModel: ODataMetaModel, oContextSet: IEntitySet, sPath: string): string {
		let sNavigation = "";
		if (oMetaModel) {
			let oEntityType = oMetaModel.getODataEntityType(oContextSet.entityType) as IEntityType;
			if (oEntityType) {
				sNavigation = this._getNavigationPrefix(oMetaModel, oEntityType, sPath);
				if (sNavigation) {
					sNavigation += "/";
				}
			}
		}

		return sNavigation;
	}

	/**
	 * Retrieves the navigation prefix for a given property within an entity type.
	 * @param {Object} metaModel - The metadata model object.
	 * @param {Object} entityTypeData - The entity type object.
	 * @param {string} propertyName - The property path for which the navigation prefix is to be determined.
	 * @returns {string} The navigation prefix for the specified property.
	 */
	private _getNavigationPrefix(metaModel: ODataMetaModel, entityTypeData: IEntityType, propertyName: string): string {
		let expandName = "";
		let propertyParts = propertyName.split("/");

		if (propertyParts.length > 1) {
			for (let i = 0; i < propertyParts.length - 1; i++) {
				let associationEndData = metaModel.getODataAssociationEnd(entityTypeData, propertyParts[i]);
				if (!associationEndData) {
					return expandName;
				}
				if (associationEndData) {
					entityTypeData = metaModel.getODataEntityType(associationEndData.type) as IEntityType;
					expandName += (expandName ? "/" : "") + propertyParts[i];
				}
			}
		}

		return expandName;
	}

	/**
	 * Processes additional properties for a given context property and data field.
	 *
	 * This method analyzes the provided context property and data field to extract additional properties
	 * such as criticality, text annotations, unit annotations, and field control paths. It also determines
	 * the type of the property (e.g., date, string) and appends this information to the P13N string.
	 *
	 * @param {UIAnnotationValue} oContextProp - The context property object containing metadata about the property.
	 * @param {ILineItemContext} oDataField - The data field object containing line item metadata.
	 * @param {string} sNavigationPath - The navigation path to be prefixed to certain properties.
	 * @param {string[]} aAdditionalProperties - An array to which additional property paths will be added.
	 * @returns {string} A P13N string containing additional property details such as type and unit.
	 * @private
	 */
	private processAdditionalProperties(
		oContextProp: UIAnnotationValue,
		oDataField: ILineItemContext,
		sNavigationPath: string,
		aAdditionalProperties: string[]
	): string {
		let additionalP13N = "";

		// Check for DateTime type with specific display format
		if (oContextProp?.type === "Edm.DateTime" && oContextProp?.["sap:display-format"] === "Date") {
			additionalP13N += '", "type":"date';
		} else if (oContextProp?.type === "Edm.String") {
			additionalP13N += '", "type":"string';
		}

		// Add Criticality property if available
		if (oDataField?.Criticality?.Path) {
			aAdditionalProperties.push(oDataField?.Criticality.Path);
		}
		let oContextCommonText = oContextProp?.[UIAnnotations.CommonText];

		// Add Text annotation property if available
		if (oContextCommonText?.Path) {
			aAdditionalProperties.push(sNavigationPath + oContextCommonText?.Path);
		}

		// Add Unit annotation property if available
		const oUnitAnnotation = oContextProp
			? oContextProp[UIAnnotations.MeasuresISOCurrency] || oContextProp[UIAnnotations.MeasuresUnit]
			: null;
		if (oUnitAnnotation?.Path) {
			aAdditionalProperties.push(oUnitAnnotation.Path);
			additionalP13N += '", "unit":"' + oUnitAnnotation.Path;
		}
		// Add FieldControl property if available
		if (oContextProp?.[UIAnnotations.CommonFieldControl]?.Path) {
			aAdditionalProperties.push(sNavigationPath + oContextProp[UIAnnotations.CommonFieldControl].Path);
		}

		return additionalP13N;
	}

	/**
	 * Determines whether a column is supported for card creation.
	 *
	 * This method checks conditions to determine if a column is eligible for inclusion in a card,
	 * conditions are kept similar to RT cards restrictions in V2 LR.
	 *
	 * @param {Record<string, string>} columnDataObject - The column data object containing metadata about the column.
	 * @param {ILineItemContext} dataFieldDetails - The data field object containing line item metadata.
	 * @param {ODataMetaModel} metaModel - The OData meta model containing metadata about entities and properties.
	 * @param {IEntitySet} entitySetData - The entity set to which the column belongs.
	 * @returns {boolean} `true` if the column is supported for card creation, otherwise `false`.
	 * @private
	 */
	private isSupportedColumn(
		columnDataObject: ColumnObjectData,
		dataFieldDetails: ILineItemContext,
		metaModel: ODataMetaModel,
		entitySetData: IEntitySet
	): boolean {
		let sRecordType = dataFieldDetails.RecordType;
		if (
			sRecordType === FieldAnnotationsType.DataFieldForAnnotation ||
			sRecordType === FieldAnnotationsType.DataFieldForAction ||
			sRecordType === FieldAnnotationsType.DataFieldForIntentBasedNavigation ||
			!columnDataObject
		) {
			return false;
		}
		let entityType = metaModel.getODataEntityType(entitySetData.entityType) as IEntityType;
		let propertyDetails = metaModel.getODataProperty(entityType, columnDataObject.leadingProperty!) as UIAnnotationValue;
		let columnKeyName = columnDataObject.columnKey;

		if (
			this.checkMultiplicityForDataFieldAssociation(metaModel, entitySetData, dataFieldDetails) ||
			(columnKeyName &&
				(columnKeyName.indexOf(FieldTypes.DataFieldForAnnotation) > -1 ||
					columnKeyName.indexOf(FieldTypes.DataFieldForAction) > -1 ||
					columnKeyName.indexOf(FieldTypes.DataFieldForIntentBasedNavigation) > -1 ||
					propertyDetails?.[UIAnnotations.UIIsImageURL]?.Bool === "true"))
		) {
			return false;
		}

		return true;
	}

	/**
	 * Checks the multiplicity of a data field's association in the OData model.
	 *
	 * This method verifies whether the association for a given data field has a multiplicity of `*` (many).
	 * It traverses the navigation path of the data field to determine the multiplicity of the associated entity.
	 *
	 * @param {ODataMetaModel} metaModel - The OData meta model containing entity and association metadata.
	 * @param {IEntitySet} entitySetData - The entity set to which the data field belongs.
	 * @param {ILineItemContext} dataFieldValue - The data field whose association multiplicity is to be checked.
	 * @returns {boolean} `true` if the association has a multiplicity of `*`, otherwise `false`.
	 * @private
	 */
	private checkMultiplicityForDataFieldAssociation(
		metaModel: ODataMetaModel,
		entitySetData: IEntitySet,
		dataFieldValue: ILineItemContext
	): boolean {
		if (dataFieldValue?.Value?.Path) {
			let dataFieldValuePath = dataFieldValue.Value.Path;
			let entityTypeData = metaModel && (metaModel.getODataEntityType(entitySetData.entityType) as IEntityType);
			let associationData: AssociationEnd | null | undefined;
			if (!(dataFieldValuePath.indexOf("/") > -1) || !entityTypeData) {
				return false;
			}
			while (dataFieldValuePath.indexOf("/") > -1) {
				//if complex path exists then check for multiplicity
				let navigationPropertyPath = dataFieldValuePath.split("/")[0];
				dataFieldValuePath = dataFieldValuePath.split("/").slice(1).join("/");
				entityTypeData = (metaModel.getODataEntityType((associationData as AssociationEnd)?.type) as IEntityType) || entityTypeData;
				associationData = metaModel.getODataAssociationEnd(entityTypeData, navigationPropertyPath) as AssociationEnd;
			}
			if (associationData && associationData.multiplicity === "*") {
				return true;
			}
		}
		return false;
	}
}
