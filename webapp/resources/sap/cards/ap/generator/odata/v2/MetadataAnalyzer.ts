/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
import type ResourceBundle from "sap/base/i18n/ResourceBundle";
import type ODataMetaModel from "sap/ui/model/odata/ODataMetaModel";
import type { EntityContainer, EntitySet, EntityType } from "sap/ui/model/odata/ODataMetaModel";
import type ODataModel from "sap/ui/model/odata/v2/ODataModel";
import type { RequestQueryNavigationProperties, RequestQueryParametersV2 } from "../../helpers/Batch";
import type { NavigationParameter, NavigationParameters, Property } from "../../types/PropertyTypes";
import { checkForDateType } from "../../utils/CommonUtils";
import { PropertyInfo, PropertyInfoMap } from "../ODataTypes";

const Annotatations = {
	label: "com.sap.vocabularies.Common.v1.Label",
	isPotentiallySensitive: "com.sap.vocabularies.PersonalData.v1.IsPotentiallySensitive",
	isoCurrency: "Org.OData.Measures.V1.ISOCurrency",
	unit: "Org.OData.Measures.V1.Unit"
};

type EntityTypeLabelAnnotation = {
	String?: string;
};

interface EntityTypeWithAnnotations extends EntityType {
	"com.sap.vocabularies.Common.v1.Label"?: EntityTypeLabelAnnotation;
}

export function getNavigationPropertyInfoFromEntity(oModel: ODataModel, entitySet: string): NavigationParameter[] {
	const oMetaModel: ODataMetaModel = oModel.getMetaModel();
	const oResult: NavigationParameters = { parameters: [] };

	const oEntityType = getEntityTypeFromEntitySet(oMetaModel, entitySet);
	const aNavigationProperties = oEntityType?.navigationProperty || [];

	aNavigationProperties.forEach((oNavProperty: any) => {
		const navigationEntitySet = oMetaModel.getODataAssociationEnd(oEntityType as EntityType, oNavProperty.name);
		const navigationEntityType = navigationEntitySet?.type ? oMetaModel.getODataEntityType(navigationEntitySet?.type) : null;

		if ((navigationEntityType as EntityType)?.key) {
			const entityProperties = (navigationEntityType as EntityType)?.property?.filter(
				(property: any) => property.type !== "Edm.Time"
			);
			if ((entityProperties ?? []).length > 0) {
				const properties = mapProperties(entityProperties);
				const navigationParameter = {
					name: oNavProperty.name,
					properties: properties
				} as NavigationParameter;
				oResult.parameters.push(navigationParameter);
			}
		}
	});
	return oResult.parameters;
}

export function getPropertyInfoFromEntity(
	model: ODataModel,
	entitySet: string,
	withNavigation: boolean,
	resourceModel?: ResourceBundle
): PropertyInfoMap {
	const metaModel = model.getMetaModel();
	const entityType = getEntityTypeFromEntitySet(metaModel, entitySet) as EntityType;
	let properties = [];
	if (withNavigation) {
		const propertiesWithoutNav = (entityType?.property || [])
			.filter((property) => property.type !== "Edm.Time")
			.map((obj) => ({
				...obj,
				category: resourceModel?.getText("CRITICALITY_CONTROL_SELECT_PROP"),
				kind: "Property"
			}));
		const propertiesWithNav = (entityType?.navigationProperty || []).map((obj) => ({
			...obj,
			category: resourceModel?.getText("GENERATOR_CARD_SELECT_NAV_PROP"),
			kind: "NavigationProperty"
		}));
		properties = [...propertiesWithoutNav, ...propertiesWithNav];
	} else {
		properties = entityType?.property || [];
		properties = properties.filter((property) => property.type !== "Edm.Time");
		properties.forEach((property) => ((property as unknown as { kind: string }).kind = "Property"));
	}

	return properties
		.filter((property) => !isPropertySensitive(metaModel, entityType, property))
		.map((property) => mapPropertyInfo(property, withNavigation));
}

function getEntityTypeFromEntitySet(oMetaModel: ODataMetaModel, entitySet: string): EntityType | undefined {
	const entitySetInfo = oMetaModel.getODataEntitySet(entitySet) as EntitySet;
	return oMetaModel.getODataEntityType(entitySetInfo?.entityType) as EntityType | undefined;
}

function mapProperties(properties?: Property[]): Property[] | undefined {
	return properties?.map((property) => ({
		label: property?.["sap:label"] || property?.name,
		type: property.type,
		name: property?.name
	}));
}

function isPropertySensitive(oMetaModel: ODataMetaModel, oEntityType: EntityType, oProperty: any): boolean {
	const navigationEntitySet = oMetaModel.getODataAssociationEnd(oEntityType, oProperty.name);
	return oProperty[Annotatations.isPotentiallySensitive]?.Bool || navigationEntitySet?.multiplicity === "*";
}

function mapPropertyInfo(oProperty: any, withNavigation: boolean): PropertyInfo {
	const isDate: boolean = checkForDateType(oProperty.type);
	const ISOCurrency = oProperty && oProperty[Annotatations.isoCurrency];
	const unitOfMeasure = oProperty && oProperty[Annotatations.unit];
	let UOM: string = "";

	if (ISOCurrency) {
		UOM = ISOCurrency?.Path ? ISOCurrency?.Path : ISOCurrency?.String;
	} else if (unitOfMeasure) {
		UOM = unitOfMeasure?.Path ? unitOfMeasure?.Path : unitOfMeasure?.String;
	} else if (oProperty && oProperty["sap:unit"]) {
		UOM = oProperty && oProperty["sap:unit"];
	}

	return {
		label: oProperty["sap:label"] || oProperty?.name,
		type: oProperty.type,
		name: oProperty.name,
		...(withNavigation && { category: oProperty.category }),
		UOM,
		isDate,
		kind: oProperty.kind
	};
}

export function getLabelForEntitySet(oModel: ODataModel, entitySet: string) {
	const oMetaModel = oModel.getMetaModel();
	const entitySetInfo = oMetaModel.getODataEntitySet(entitySet) as EntitySet;
	const entityType = oMetaModel.getODataEntityType(entitySetInfo?.entityType) as EntityTypeWithAnnotations;
	const label = (entityType[Annotatations.label as keyof EntityTypeWithAnnotations] as EntityTypeLabelAnnotation)?.String;
	return label || entitySet;
}

export function getPropertyReference(oModel: ODataModel, entitySetName: string) {
	const metaModel = oModel.getMetaModel();
	const entitySet = metaModel.getODataEntitySet(entitySetName) as EntitySet;
	const entityDefinition = metaModel.getODataEntityType(entitySet.entityType) as EntityType;
	const propertyRef = entityDefinition.key.propertyRef.map((property) => property.name);
	const properties = getPropertyInfoFromEntity(oModel, entitySetName, false);

	return properties.filter((property) => propertyRef.includes(property?.name));
}

export function getMetaModelObjectForEntitySet(metaModel: ODataMetaModel, entitySetName: string): RequestQueryParametersV2 {
	const entitySet = metaModel.getODataEntitySet(entitySetName) as EntitySet;
	const entityType = metaModel.getODataEntityType(entitySet.entityType) as EntityType;
	const properties = entityType.property || [];
	const navigationProperties: RequestQueryNavigationProperties[] = [];

	entityType.navigationProperty?.forEach((navigationProperty) => {
		const propertyName = navigationProperty.name;
		const navigationEntitySet = metaModel.getODataAssociationEnd(entityType, propertyName);
		if (navigationEntitySet !== null) {
			const navigationEntityType = metaModel.getODataEntityType(navigationEntitySet.type) as EntityType;
			const navigationProperty = navigationEntityType.property || [];
			navigationProperties.push({
				name: propertyName,
				properties: navigationProperty
			});
		}
	});

	return {
		properties,
		navigationProperties,
		complexProperties: []
	};
}

export const getEntityNames = function (model: ODataModel) {
	const metaModel = model.getMetaModel();
	const entityContainer = metaModel.getODataEntityContainer();
	const entitySet = (entityContainer as EntityContainer)?.entitySet || [];
	return entitySet.map((entity) => entity.name);
};
