/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
import Component from "sap/ui/core/Component";
import { CardManifest } from "sap/ui/integration/widgets/Card";
import V2ODataModel from "sap/ui/model/odata/v2/ODataModel";
import V4ODataModel from "sap/ui/model/odata/v4/ODataModel";
import type { ArrangementOptions } from "../app/controls/ArrangementsEditor";
import type { PropertyInfo } from "../odata/ODataTypes";
import { fetchDataAsync, getNavigationPropertyInfoFromEntity } from "../odata/ODataUtils";
import { Application, ODataModelVersion } from "../pages/Application";
import type { GroupItem, NavigationParameter, Property } from "../types/PropertyTypes";
import { QueryParameters, createUrlParameters } from "./Batch";
import { formatPropertyDropdownValues } from "./Formatter";
import { resolvePropertyPathFromExpression } from "./PropertyExpression";

type Model = V2ODataModel | V4ODataModel;

/**
 * Fetches the navigation properties with label for a single Navigation property
 * @param rootComponent
 * @param navigationProperty - Name of the navigation property
 * @param path
 */
export async function getNavigationPropertiesWithLabel(rootComponent: Component, navigationProperty: string, path: string) {
	const model = rootComponent.getModel() as Model;
	const { entitySet, serviceUrl, odataModel } = Application.getInstance().fetchDetails();
	const bODataV4 = odataModel === ODataModelVersion.V4;
	const navigationPropertyInfo = getNavigationPropertyInfoFromEntity(model, entitySet);
	const selectedNavigationProperty = navigationPropertyInfo.find((property) => property.name === navigationProperty);

	if (!selectedNavigationProperty) {
		return {
			propertiesWithLabel: [],
			navigationPropertyData: {}
		};
	}

	const properties = selectedNavigationProperty.properties || [];
	const queryParams: QueryParameters = {
		properties: [],
		navigationProperties: [
			{
				name: selectedNavigationProperty.name,
				properties: []
			}
		]
	};

	const data = await fetchDataAsync(serviceUrl, path, bODataV4, createUrlParameters(queryParams));

	if (data[selectedNavigationProperty.name] !== undefined && data[selectedNavigationProperty.name] !== null) {
		properties.forEach((property) => {
			const name = data[selectedNavigationProperty.name] as Record<string, unknown>;
			if (name[property.name] !== undefined && name[property.name] !== null) {
				const propertyValue = name[property.name] as string;
				property.labelWithValue = formatPropertyDropdownValues(property as PropertyInfo, propertyValue);
			} else {
				property.labelWithValue = `${property.label} (<empty>)`;
			}
		});
	}

	return {
		propertiesWithLabel: properties,
		navigationPropertyData: data
	};
}

/**
 * Updates the navigation properties with the provided labels.
 *
 * @param {NavigationParameter[]} navigationProperties - The array of navigation parameters to be updated.
 * @param {string} navigationEntityName - The name of the navigation entity to be updated.
 * @param {Property[]} propertiesWithLabel - The array of properties with labels to update the navigation entity with.
 */
export function updateNavigationPropertiesWithLabel(
	navigationProperties: NavigationParameter[],
	navigationEntityName: string,
	propertiesWithLabel: Property[]
) {
	const navigationProperty = navigationProperties.find((property) => property.name === navigationEntityName);
	if (!navigationProperty) {
		return;
	}

	navigationProperty.properties = [...propertiesWithLabel];
}

export const getNavigationPropertyInfo = async function (
	textArrangement: ArrangementOptions,
	navigationProperty: NavigationParameter[],
	path: string
) {
	const { rootComponent } = Application.getInstance().fetchDetails();
	const navigationPropertyInfo = [];
	if (textArrangement.isNavigationForDescription) {
		const navigationEntitySet = textArrangement.propertyKeyForDescription;
		const { propertiesWithLabel, navigationPropertyData } = await getNavigationPropertiesWithLabel(
			rootComponent,
			navigationEntitySet,
			path
		);
		textArrangement.navigationalPropertiesForDescription = propertiesWithLabel;
		updateNavigationPropertiesWithLabel(navigationProperty, navigationEntitySet, textArrangement.navigationalPropertiesForDescription);
		const navigationPropertyInfoForDesc = {
			navigationEntitySet,
			navigationPropertyData
		};
		navigationPropertyInfo.push(navigationPropertyInfoForDesc);
	}
	if (textArrangement.isNavigationForId) {
		const navigationEntitySet = textArrangement.propertyKeyForId as string;
		const { propertiesWithLabel, navigationPropertyData } = await getNavigationPropertiesWithLabel(
			rootComponent,
			navigationEntitySet,
			path
		);
		textArrangement.navigationalPropertiesForId = propertiesWithLabel;
		updateNavigationPropertiesWithLabel(navigationProperty, navigationEntitySet, textArrangement.navigationalPropertiesForId);
		const navigationPropertyInfoForId = {
			navigationEntitySet,
			navigationPropertyData
		};
		navigationPropertyInfo.push(navigationPropertyInfoForId);
	}
	return navigationPropertyInfo;
};

export const getNavigationPropertyInfoGroups = async function (
	item: GroupItem,
	navigationProperty: NavigationParameter[],
	path: string,
	cardManifest: Record<string, unknown>
) {
	const { rootComponent } = Application.getInstance().fetchDetails();

	const propertyPath = resolvePropertyPathFromExpression(item.value, cardManifest as CardManifest);
	if (propertyPath?.includes("/")) {
		const [navigationEntitySet, property] = propertyPath.replace(/[{}]/g, "").split("/");
		const { propertiesWithLabel, navigationPropertyData } = await getNavigationPropertiesWithLabel(
			rootComponent,
			navigationEntitySet,
			path
		);
		item.navigationalProperties = propertiesWithLabel;
		item.isNavigationEnabled = true;
		item.isEnabled = true;
		item.navigationProperty = property;

		if (item.navigationalProperties) {
			updateNavigationPropertiesWithLabel(navigationProperty, navigationEntitySet, item.navigationalProperties);
		}

		return {
			navigationEntitySet,
			navigationPropertyData
		};
	}
};
