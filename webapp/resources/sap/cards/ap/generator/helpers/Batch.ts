/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
import type { CardManifest } from "sap/ui/integration/widgets/Card";
import type { PropertyInfo, PropertyInfoMap } from "../odata/ODataTypes";
import { Application, ODataModelVersion } from "../pages/Application";
import type { Property } from "../types/PropertyTypes";
import { getContentProperties, getHeaderProperties } from "../utils/IntegrationCardManifestParser";

export type QueryParameters = {
	properties: string[];
	navigationProperties: {
		name: string;
		properties: string[];
	}[];
};

export type RequestQueryNavigationProperties = {
	name: string;
	properties: Property[];
};

export type RequestQueryComplexProperties = {
	name: string;
	properties: Property[];
};

export type RequestQueryParametersV4 = {
	properties: PropertyInfo[];
	navigationProperties: RequestQueryNavigationProperties[];
	complexProperties: RequestQueryComplexProperties[];
};
export type RequestQueryParametersV2 = {
	properties: Property[];
	navigationProperties: RequestQueryNavigationProperties[];
	complexProperties: RequestQueryComplexProperties[];
};

/**
 * Updates the card manifest with select query parameters for header and content properties.
 *
 * @param {CardManifest} cardManifest - The card manifest object to be updated.
 */
export function updateManifestWithSelectQueryParams(cardManifest: CardManifest) {
	const headerSelectProperties = getHeaderProperties(cardManifest);
	const headerSelect = createUrlParameters(headerSelectProperties).$select;
	const headerSelectQuery = headerSelect && `$select=${headerSelect}`;
	const contentSelectProperties = getContentProperties(cardManifest);
	const contentSelect = createUrlParameters(contentSelectProperties).$select;
	const contentSelectQuery = contentSelect && `$select=${contentSelect}`;
	const configParameters = cardManifest["sap.card"].configuration?.parameters;

	if (!configParameters && cardManifest["sap.card"].configuration) {
		cardManifest["sap.card"].configuration.parameters = {
			_headerSelectQuery: {
				value: headerSelectQuery
			},
			_contentSelectQuery: {
				value: contentSelectQuery
			}
		};
		return;
	}

	if (headerSelectQuery && configParameters) {
		configParameters._headerSelectQuery = {
			value: headerSelectQuery
		};
	}
	if (contentSelectQuery && configParameters) {
		configParameters._contentSelectQuery = {
			value: contentSelectQuery
		};
	}
}

/**
 * Updates the card manifest with expand query parameters for header and content properties.
 *
 * @param {CardManifest} cardManifest - The card manifest object to be updated.
 */
export function updateManifestWithExpandQueryParams(cardManifest: CardManifest) {
	const headerProperties = getHeaderProperties(cardManifest);
	const headerExpand = createUrlParameters(headerProperties).$expand;
	const headerExpandQuery = headerExpand && `&$expand=${headerExpand}`;
	const contentProperties = getContentProperties(cardManifest);
	const contentExpand = createUrlParameters(contentProperties).$expand;
	const contentExpandQuery = contentExpand && `&$expand=${contentExpand}`;
	const configParameters = cardManifest["sap.card"].configuration?.parameters;

	if (!configParameters && cardManifest["sap.card"].configuration) {
		cardManifest["sap.card"].configuration.parameters = {
			_headerExpandQuery: {
				value: headerExpandQuery
			},
			_contentExpandQuery: {
				value: contentExpandQuery
			}
		};
		return;
	}

	if (headerExpandQuery && configParameters) {
		configParameters._headerExpandQuery = {
			value: headerExpandQuery
		};
	}
	if (contentExpandQuery && configParameters) {
		configParameters._contentExpandQuery = {
			value: contentExpandQuery
		};
	}
}

/*
 * Based on the odata model version(either v2 or v4) and the query parameters, this function creates the select and expand query parameters
 *
 * @param mParameters
 * @param odataModel
 * @returns
 */
export function createUrlParameters(queryParameters: QueryParameters) {
	const { odataModel } = Application.getInstance().fetchDetails();
	let selectQuery = queryParameters.properties.join(",");
	let expandQuery = "";

	if (odataModel === ODataModelVersion.V4) {
		queryParameters.navigationProperties.forEach((navProp) => {
			const selectQueryForNavigationProperty = navProp.properties.join(",");
			expandQuery += expandQuery.length ? "," : "";
			selectQuery += selectQuery.length ? "," : "";
			selectQuery += `${navProp.name}`;
			expandQuery += selectQueryForNavigationProperty.length
				? `${navProp.name}($select=${selectQueryForNavigationProperty})`
				: `${navProp.name}`;
		});
	}

	if (odataModel === ODataModelVersion.V2) {
		queryParameters.navigationProperties.forEach((navProp) => {
			selectQuery += selectQuery.length ? "," : "";
			expandQuery += expandQuery.length ? "," : "";
			selectQuery += navProp.properties.length
				? navProp.properties.map((property) => `${navProp.name}/${property}`)
				: `${navProp.name}`;
			expandQuery += `${navProp.name}`;
		});
	}

	return {
		$select: selectQuery,
		$expand: expandQuery
	};
}

/**
 * Creates URL parameters for the given properties.
 *
 * @param {PropertyInfoMap} properties - The map of properties to create URL parameters from.
 * @returns {Record<string, string>} The URL parameters object containing the $select query parameter.
 */
export function createURLParams(properties: PropertyInfoMap): Record<string, string> {
	const selectProperties = properties.map((property) => property.name);
	let urlParameters = {};
	if (selectProperties.length) {
		urlParameters = {
			$select: selectProperties.join(",")
		};
	}

	return urlParameters;
}
