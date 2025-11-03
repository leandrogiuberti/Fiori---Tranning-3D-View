/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
import encodeURLParameters from "sap/base/security/encodeURLParameters";
import type Component from "sap/ui/core/Component";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import V2OdataUtils from "sap/ui/model/odata/ODataUtils";
import V2ODataModel from "sap/ui/model/odata/v2/ODataModel";
import type Context from "sap/ui/model/odata/v4/Context";
import type V4ODataListBinding from "sap/ui/model/odata/v4/ODataListBinding";
import { default as V4ODataModel } from "sap/ui/model/odata/v4/ODataModel";
import V4ODataUtils from "sap/ui/model/odata/v4/ODataUtils";
import type { FreeStyleFetchOptions } from "../types/CommonTypes";
import { getPropertyReference } from "./v2/MetadataAnalyzer";
import { getPropertyReferenceKey, getSemanticKeys, Property } from "./v4/MetadataAnalyzer";

export type ODataModel = V2ODataModel | V4ODataModel;

export type EntitySetWithContext = {
	name: string;
	labelWithValue: string;
};

/**
 * Validates if context key follows this pattern /entitySet('12345')
 *
 * @param keys
 * @returns {boolean}
 */
export const isSingleKeyWithoutAssignment = (keys: string[]): boolean => keys.length === 1 && !keys[0].includes("=");

/**
 * Handles a single property in the context of OData.
 *
 * If there is only one property in the object context and it is not a semantic key,
 * then it is assumed to be a GUID. The function updates the context properties accordingly.
 *
 * @param propertyReferenceKey - An array of properties to reference.
 * @param contextProperties - An array of context properties to be updated.
 */
export const handleSingleProperty = function (propertyReferenceKey: Property[], contextProperties: string[]) {
	// If there is only one property in the object context, and it is not semantic key, then it is a guid
	const guidKey = propertyReferenceKey.find((property) => {
		return property.type === "Edm.Guid";
	})?.name;
	const guidValue = contextProperties[0];
	contextProperties[0] = guidKey
		? `${guidKey}=${V4ODataUtils.formatLiteral(guidValue, "Edm.Guid")}`
		: propertyReferenceKey.map((ref) => `${ref.name}=${guidValue}`).join(",");

	return contextProperties;
};

/**
 * Adds the "IsActiveEntity=true" property to the context properties if it is not already present.
 *
 * @param contextProperties - An array of context property strings.
 * @param propertyReferenceKey - An array of objects containing property name and type.
 * @returns The updated array of context property strings.
 */
const addIsActiveEntityProperty = function (contextProperties: string[], propertyReferenceKey: { name: string; type: string }[]) {
	const currentProperty = contextProperties.map((property: string) => property.split("=")[0]);

	propertyReferenceKey.forEach((element) => {
		if (!currentProperty.includes(element.name) && element.name === "IsActiveEntity") {
			contextProperties.push("IsActiveEntity=true");
		}
	});

	return contextProperties;
};

/**
 * Removes single quotes from the beginning and end of a string and decodes any URI-encoded characters.
 *
 * This function is typically used to process OData key values or other strings that are enclosed in single quotes
 * and may contain URI-encoded characters.
 *
 * @param {string} value - The string to be unquoted and decoded.
 * @returns {string} The unquoted and decoded string.
 *
 */
export function unquoteAndDecode(value: string): string {
	if (value.startsWith("'") && value.endsWith("'")) {
		value = decodeURIComponent(value.substring(1, value.length - 1));
	}
	return value;
}

/**
 * Creates an SAPUI5 `Filter` object from a given context path and semantic keys.
 *
 * This function parses the `contextPath` to extract key-value pairs, matches them with the provided `semanticKeys`,
 * and constructs a filter object. It supports both single-key and multi-key scenarios.
 *
 * @param {string} contextPath - The semantic or technical path containing key-value pairs.
 * @param {string[]} semanticKeys - An array of semantic keys to match with the key-value pairs in the context path.
 * @returns {Filter | null} An SAPUI5 `Filter` object if the keys match, or `null` if no valid filter can be created.
 *
 */
function createFilterFromPath(contextPath: string, semanticKeys: string[]): Filter | null {
	const keyValues = contextPath.substring(contextPath.indexOf("(") + 1, contextPath.length - 1).split(",");

	if (semanticKeys.length != keyValues.length) {
		return null;
	}

	const keyValuesMap = new Map<string, unknown>();
	let keyIndex = 0;
	keyValues.forEach(function (keyValue) {
		if (keyValue.indexOf("=") > -1) {
			const [key, value] = keyValue.split("=");
			keyValuesMap.set(key, unquoteAndDecode(value));
		} else {
			keyValuesMap.set(semanticKeys[keyIndex], unquoteAndDecode(keyValue));
		}
		keyIndex++;
	});

	const filters: Filter[] = [];

	semanticKeys.forEach((semanticKey) => {
		const semanticKeyValue = keyValuesMap.get(semanticKey);
		if (semanticKeyValue !== undefined) {
			filters.push(
				new Filter({
					path: semanticKey,
					operator: FilterOperator.EQ,
					value1: semanticKeyValue
				})
			);
		}
	});

	return filters.length ? new Filter(filters, true) : null;
}

/**
 * Retrieves a specific context from an OData model based on semantic keys, a context path, and reference keys.
 *
 * @param {string[]} semanticKeys - An array of semantic keys used to filter the context.
 * @param {string} contextPath - The context path to retrieve the context from.
 * @param {string[]} referenceKeys - An array of reference keys to include in the `$select` query.
 * @param {ODataModel} model - The OData model (V2 or V4) used to retrieve the context.
 * @returns {Promise<Context | null>} A promise that resolves to the retrieved context, or `null` if no context is found.
 */
async function getContextFromKeys(
	semanticKeys: string[],
	contextPath: string,
	referenceKeys: string[],
	model: ODataModel
): Promise<Context | null> {
	const metaModel = model.getMetaModel();

	if (!semanticKeys || semanticKeys.length === 0) {
		return null;
	}

	const filter = createFilterFromPath(contextPath, semanticKeys);

	if (filter === null) {
		return null;
	}

	const absolutePath = contextPath.startsWith("/") ? contextPath : `/${contextPath}`;
	const metaContext = metaModel.getMetaContext(absolutePath);
	const listBinding = model.bindList(metaContext?.getPath() ?? "", undefined, undefined, filter, {
		$select: referenceKeys.join(",")
	});
	const contexts = await (listBinding as V4ODataListBinding).requestContexts(0, 2);

	return contexts.length > 0 ? contexts[0] : null;
}

/**
 * Retrieves context properties for OData V4.
 *
 * @param model - The application model.
 * @param contextPath - The context path.
 * @returns A promise that resolves to an array of context properties.
 */
const getContextPropertiesForODataV4 = async function (model: V4ODataModel, contextPath: string) {
	const index = contextPath.indexOf("(");
	const entitySetName = contextPath.substring(0, index);
	const lastIndex = contextPath.indexOf(")");
	const propertyPath = contextPath.substring(index + 1, lastIndex);
	const propertyReferenceKey = getPropertyReferenceKey(model, entitySetName);
	const contextProperties = propertyPath.split(",");
	const semanticKeys = getSemanticKeys(model.getMetaModel(), entitySetName).map((key) => key.$PropertyPath);
	const referenceKeys = propertyReferenceKey.map((ref) => ref.name);

	if (semanticKeys.length) {
		const dataContext = await getContextFromKeys(semanticKeys, contextPath, referenceKeys, model);
		const dataContextPath = dataContext?.getPath();

		if (dataContextPath) {
			return propertyReferenceKey.map((key) => {
				const value = dataContext?.getProperty(key.name);
				return `${key.name}=${V4ODataUtils.formatLiteral(value, key.type)}`;
			});
		}
	}

	if (contextProperties.length === 1 && contextProperties[0].indexOf("=") === -1) {
		return handleSingleProperty(propertyReferenceKey, contextProperties);
	}

	return addIsActiveEntityProperty(contextProperties, propertyReferenceKey);
};

/**
 * Creates context parameters based on the given path, app model, and OData version.
 *
 * @param contextPath - The path to create context parameters for.
 * @param model - The application model.
 * @param oDataV4 - A boolean indicating if OData V4 is used.
 * @returns A promise that resolves to a string of context parameters.
 */
export const createContextParameter = async function (contextPath: string, model: V2ODataModel | V4ODataModel, oDataV4: boolean) {
	if (oDataV4) {
		const contextParameters = await getContextPropertiesForODataV4(model as V4ODataModel, contextPath);
		return contextParameters.join(",");
	}

	const index = contextPath.indexOf("(");
	const lastIndex = contextPath.indexOf(")");
	const propertyPath = contextPath.substring(index + 1, lastIndex);
	const contextProperties = propertyPath.split(",");

	if (isSingleKeyWithoutAssignment(contextProperties)) {
		const entitySetName = contextPath.substring(0, index);
		const propertyReferenceKey = getPropertyReference(model as V2ODataModel, entitySetName);
		return handleSingleProperty(propertyReferenceKey, contextProperties).join(",");
	}

	return propertyPath;
};

const fetchDataAsyncV4 = async function (url: string, path: string, queryParams: Record<string, string>) {
	const formattedUrl = url.endsWith("/") ? url : `${url}/`;
	queryParams.format = "json";
	const parameters = encodeURLParameters(queryParams);
	const sFormattedUrl = `${formattedUrl}${path}?${parameters}`;
	return fetchFileContent(sFormattedUrl, "json")
		.then((data) => data)
		.catch((err) => {
			throw new Error(err);
		});
};

const fetchDataAsyncV2 = async function (url: string, path: string, queryParams: Record<string, string>) {
	const oModel = new V2ODataModel(url);
	return new Promise(function (resolve, reject) {
		const fnSuccess = function (oData: object) {
			resolve(oData);
		};
		const fnFailure = function (oError: Error) {
			reject(oError);
		};
		oModel.read("/" + path, { success: fnSuccess, error: fnFailure, urlParameters: queryParams });
	});
};

/**
 * Helper function to fetch data from the given URL. This function is used to fetch data from the OData V4 service.
 *
 * @param url - The URL to fetch data from.
 * @param path - The path to fetch data for.
 * @param urlParameters - The URL parameters.
 * @returns A promise that resolves to the fetched data.
 */
export async function fetchDataAsync(url: string, path: string, urlParameters: Record<string, string> = {}, bODataV4?: boolean) {
	const queryParams: Record<string, string> = {};
	Object.keys(urlParameters).forEach((key) => {
		if (urlParameters[key].length) {
			queryParams[key] = urlParameters[key];
		}
	});

	if (bODataV4) {
		return fetchDataAsyncV4(url, path, queryParams);
	} else {
		return fetchDataAsyncV2(url, path, queryParams);
	}
}

/**
 * Checks if the given OData model is an OData V4 model.
 *
 * @param {ODataModel} oModel - The OData model to check.
 * @returns {boolean} `true` if the model is an OData V4 model, otherwise `false`.
 */
export function isODataV4Model(oModel: ODataModel): boolean {
	return (oModel && oModel.isA<V4ODataModel>("sap.ui.model.odata.v4.ODataModel")) || false;
}

/**
 * Creates an array of context URLs using the given data, entity context path, entity set, and application model.
 *
 * @param {Record<string, any>[]} data The data for entity set.
 * @param {string} entityContextPath The entity context path.
 * @param {string} entitySet The entitySet
 * @param {ODataModel} appModel The application model.
 * @returns {string[]} Array of context URLs.
 */
function createEntitySetWithContextUris(
	data: Record<string, any>[],
	entityContextPath: string,
	entitySet: string,
	appModel: ODataModel
): string[] {
	const bODataV4 = isODataV4Model(appModel);
	const entityKeyProperties = bODataV4
		? getPropertyReferenceKey(appModel as V4ODataModel, entitySet).map((property) => property.name)
		: getPropertyReference(appModel as V2ODataModel, entitySet).map((property) => property.name);

	const updatedDataValues = data.filter((item) => {
		return entityKeyProperties.every((property) => {
			return item[property] !== undefined && item[property] !== "";
		});
	});

	return updatedDataValues.map((parameters) => {
		let contextUri = entityContextPath;
		Object.entries(parameters).forEach(([key, value]) => {
			const parameterPlaceholder = `{{parameters.${key}}}`;
			if (contextUri.includes(parameterPlaceholder)) {
				contextUri = contextUri.replace(parameterPlaceholder, value);
			}
		});
		return entitySet && contextUri ? `${entitySet}(${contextUri})` : "";
	});
}

/**
 * fetches data from the OData service (V2 or V4) using the provided service URL and entity set to format the key properties of
 * the entity set as context parameters and constructs the context path.
 *
 * @param {string} serviceUrl - The base URL of the OData service.
 * @param {string} entitySet - The name of the entity set to fetch data for.
 * @param {ODataModel} appModel - The OData model (V2 or V4) used to interact with the service.
 * @returns {Promise<string>} A promise that resolves to the first entity set with its context URL as a string,
 *                            or an empty string if no data is available or an error occurs.
 */
export const getEntitySetWithContextURLs = async function (
	serviceUrl: string,
	entitySet: string,
	appModel: ODataModel
): Promise<EntitySetWithContext[]> {
	const bODataV4 = isODataV4Model(appModel);
	const entityKeyProperties = bODataV4
		? getPropertyReferenceKey(appModel as V4ODataModel, entitySet).map((property) => property.name)
		: getPropertyReference(appModel as V2ODataModel, entitySet).map((property) => property.name);
	const urlParameters = {
		$select: entityKeyProperties.join(",")
	};

	try {
		const data = await fetchDataAsync(serviceUrl, entitySet, urlParameters, bODataV4);
		const results = bODataV4 ? data.value : data.results;
		if (results.length > 0) {
			const entityContextPath = getContextPath(appModel, entitySet);
			const entitySetWithObjectContextUris = createEntitySetWithContextUris(results, entityContextPath, entitySet, appModel);
			return entitySetWithObjectContextUris.map((uri: string) => ({
				name: uri,
				labelWithValue: uri
			}));
		}
		return [];
	} catch (error) {
		return [];
	}
};

/**
 * Fetches the application manifest and retrieves the default entity set for the ObjectPage embed configuration in design mode.
 *
 * @returns {Promise<string>} A promise that resolves to the default entity set for the ObjectPage embed configuration,
 *                            or an empty string if not found.
 */
const getEntitySetForDesignMode = async function (): Promise<string> {
	try {
		const appManifest = await fetchFileContent("/manifest.json", "json");
		return appManifest["sap.cards.ap"]?.embeds?.ObjectPage?.default || "";
	} catch (error) {
		return "";
	}
};

/**
 * Retrieves the entity set with object context.
 *
 * @param {Component} rootComponent - The root component of the application.
 * @param {FreeStyleFetchOptions} fetchOptions - The FreeStyleFetchOptions including isDesignMode, entitySet and keyParameters.
 * @returns {Promise<string | undefined>} If Design mode then the url is formed using service, model and entitySet.
 * 										  In case of Run time entitySet and keyParameters will be used.
 */
export const getEntitySetWithObjectContext = async function (
	rootComponent: Component,
	fetchOptions: FreeStyleFetchOptions
): Promise<string> {
	const appModel = rootComponent.getModel() as ODataModel;
	const isDesignMode = fetchOptions.isDesignMode || false;
	const entitySet = isDesignMode ? await getEntitySetForDesignMode() : fetchOptions.entitySet;
	const bODataV4 = isODataV4Model(appModel);
	const serviceUrl = bODataV4
		? (appModel as V4ODataModel).getServiceUrl()
		: (appModel as unknown as { V2ODataModel: V2ODataModel; sServiceUrl: string }).sServiceUrl;

	if (entitySet && fetchOptions.keyParameters && !isDesignMode) {
		let entityContextPath = getContextPath(appModel, entitySet);
		const keyParameters = fetchOptions.keyParameters;

		Object.entries(keyParameters).forEach(([key, value]) => {
			const parameterPlaceholder = `{{parameters.${key}}}`;

			if (entityContextPath.includes(parameterPlaceholder)) {
				entityContextPath = entityContextPath.replace(parameterPlaceholder, value as string);
			}
		});

		return entityContextPath ? `${entitySet}(${entityContextPath})` : "";
	}

	if (serviceUrl && entitySet && appModel && isDesignMode) {
		const entitySetWithObjectContextList = await getEntitySetWithContextURLs(serviceUrl, entitySet, appModel);
		const entitySetWithObjectContext = entitySetWithObjectContextList?.length ? entitySetWithObjectContextList[0].name : "";
		return entitySetWithObjectContext;
	}
	return entitySet;
};

/**
 * Constructs a context path string by formatting the key properties of the given entity set
 * based on the OData model version (V2 or V4).
 *
 * @param {ODataModel} appModel - The OData model (V2 or V4) used to retrieve key properties.
 * @param {string} entitySet - The name of the entity set for which the context path is constructed.
 * @returns {string} A string representing the context path with formatted key properties.
 */
function getContextPath(appModel: V2ODataModel | V4ODataModel, entitySet: string): string {
	const contextParameters: string[] = [];
	const bODataV4 = appModel && appModel.isA<V4ODataModel>("sap.ui.model.odata.v4.ODataModel");

	if (bODataV4) {
		const keyProperties = getPropertyReferenceKey(appModel, entitySet);
		keyProperties.forEach((property) => {
			const parameter = V4ODataUtils.formatLiteral(`{{parameters.${property.name}}}`, property.type);
			contextParameters.push(`${property.name}=${parameter}`);
		});
	} else {
		const keyProperties = getPropertyReference(appModel, entitySet);
		keyProperties.forEach((property) => {
			const parameter = V2OdataUtils.formatValue(`{{parameters.${property.name}}}`, property.type, true);
			contextParameters.push(`${property.name}=${parameter}`);
		});
	}

	return contextParameters.join(",");
}

/**
 * Fetches the content of a file from the specified URL.
 *
 * @param {string} url - The URL of the file to fetch.
 * @param {string} [format] - Optional format specifier; if "json", parses the response as JSON, otherwise returns text.
 * @returns {Promise<any>} - A promise that resolves to the file content as a string or parsed JSON object.
 * @throws {Error} If the fetch fails or the response is not OK.
 */
export const fetchFileContent = async (url: string, format?: string): Promise<any> => {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Failed to fetch file from ${url}: ${response.status} ${response.statusText}`);
		}

		return format === "json" ? await response.json() : await response.text();
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : "Unknown error";
		throw new Error(`Error fetching file from ${url}: ${errorMessage}`);
	}
};
