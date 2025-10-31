/// <reference types="openui5" />
declare module "sap/cards/ap/common/odata/ODataUtils" {
    import type Component from "sap/ui/core/Component";
    import Filter from "sap/ui/model/Filter";
    import V2ODataModel from "sap/ui/model/odata/v2/ODataModel";
    import type Context from "sap/ui/model/odata/v4/Context";
    import { default as V4ODataModel } from "sap/ui/model/odata/v4/ODataModel";
    import type { FreeStyleFetchOptions } from "sap/cards/ap/common/types/CommonTypes";
    import { Property } from "sap/cards/ap/common/odata/v4/MetadataAnalyzer";
    type ODataModel = V2ODataModel | V4ODataModel;
    type EntitySetWithContext = {
        name: string;
        labelWithValue: string;
    };
    /**
     * Validates if context key follows this pattern /entitySet('12345')
     *
     * @param keys
     * @returns {boolean}
     */
    const isSingleKeyWithoutAssignment: (keys: string[]) => boolean;
    /**
     * Handles a single property in the context of OData.
     *
     * If there is only one property in the object context and it is not a semantic key,
     * then it is assumed to be a GUID. The function updates the context properties accordingly.
     *
     * @param propertyReferenceKey - An array of properties to reference.
     * @param contextProperties - An array of context properties to be updated.
     */
    const handleSingleProperty: (propertyReferenceKey: Property[], contextProperties: string[]) => string[];
    /**
     * Adds the "IsActiveEntity=true" property to the context properties if it is not already present.
     *
     * @param contextProperties - An array of context property strings.
     * @param propertyReferenceKey - An array of objects containing property name and type.
     * @returns The updated array of context property strings.
     */
    const addIsActiveEntityProperty: (contextProperties: string[], propertyReferenceKey: {
        name: string;
        type: string;
    }[]) => string[];
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
    function unquoteAndDecode(value: string): string;
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
    function createFilterFromPath(contextPath: string, semanticKeys: string[]): Filter | null;
    /**
     * Retrieves a specific context from an OData model based on semantic keys, a context path, and reference keys.
     *
     * @param {string[]} semanticKeys - An array of semantic keys used to filter the context.
     * @param {string} contextPath - The context path to retrieve the context from.
     * @param {string[]} referenceKeys - An array of reference keys to include in the `$select` query.
     * @param {ODataModel} model - The OData model (V2 or V4) used to retrieve the context.
     * @returns {Promise<Context | null>} A promise that resolves to the retrieved context, or `null` if no context is found.
     */
    function getContextFromKeys(semanticKeys: string[], contextPath: string, referenceKeys: string[], model: ODataModel): Promise<Context | null>;
    /**
     * Retrieves context properties for OData V4.
     *
     * @param model - The application model.
     * @param contextPath - The context path.
     * @returns A promise that resolves to an array of context properties.
     */
    const getContextPropertiesForODataV4: (model: V4ODataModel, contextPath: string) => Promise<string[]>;
    /**
     * Creates context parameters based on the given path, app model, and OData version.
     *
     * @param contextPath - The path to create context parameters for.
     * @param model - The application model.
     * @param oDataV4 - A boolean indicating if OData V4 is used.
     * @returns A promise that resolves to a string of context parameters.
     */
    const createContextParameter: (contextPath: string, model: V2ODataModel | V4ODataModel, oDataV4: boolean) => Promise<string>;
    const fetchDataAsyncV4: (url: string, path: string, queryParams: Record<string, string>) => Promise<any>;
    const fetchDataAsyncV2: (url: string, path: string, queryParams: Record<string, string>) => Promise<unknown>;
    /**
     * Helper function to fetch data from the given URL. This function is used to fetch data from the OData V4 service.
     *
     * @param url - The URL to fetch data from.
     * @param path - The path to fetch data for.
     * @param urlParameters - The URL parameters.
     * @returns A promise that resolves to the fetched data.
     */
    function fetchDataAsync(url: string, path: string, urlParameters?: Record<string, string>, bODataV4?: boolean): Promise<any>;
    /**
     * Checks if the given OData model is an OData V4 model.
     *
     * @param {ODataModel} oModel - The OData model to check.
     * @returns {boolean} `true` if the model is an OData V4 model, otherwise `false`.
     */
    function isODataV4Model(oModel: ODataModel): boolean;
    /**
     * Creates an array of context URLs using the given data, entity context path, entity set, and application model.
     *
     * @param {Record<string, any>[]} data The data for entity set.
     * @param {string} entityContextPath The entity context path.
     * @param {string} entitySet The entitySet
     * @param {ODataModel} appModel The application model.
     * @returns {string[]} Array of context URLs.
     */
    function createEntitySetWithContextUris(data: Record<string, any>[], entityContextPath: string, entitySet: string, appModel: ODataModel): string[];
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
    const getEntitySetWithContextURLs: (serviceUrl: string, entitySet: string, appModel: ODataModel) => Promise<EntitySetWithContext[]>;
    /**
     * Fetches the application manifest and retrieves the default entity set for the ObjectPage embed configuration in design mode.
     *
     * @returns {Promise<string>} A promise that resolves to the default entity set for the ObjectPage embed configuration,
     *                            or an empty string if not found.
     */
    const getEntitySetForDesignMode: () => Promise<string>;
    /**
     * Retrieves the entity set with object context.
     *
     * @param {Component} rootComponent - The root component of the application.
     * @param {FreeStyleFetchOptions} fetchOptions - The FreeStyleFetchOptions including isDesignMode, entitySet and keyParameters.
     * @returns {Promise<string | undefined>} If Design mode then the url is formed using service, model and entitySet.
     * 										  In case of Run time entitySet and keyParameters will be used.
     */
    const getEntitySetWithObjectContext: (rootComponent: Component, fetchOptions: FreeStyleFetchOptions) => Promise<string>;
    /**
     * Constructs a context path string by formatting the key properties of the given entity set
     * based on the OData model version (V2 or V4).
     *
     * @param {ODataModel} appModel - The OData model (V2 or V4) used to retrieve key properties.
     * @param {string} entitySet - The name of the entity set for which the context path is constructed.
     * @returns {string} A string representing the context path with formatted key properties.
     */
    function getContextPath(appModel: V2ODataModel | V4ODataModel, entitySet: string): string;
    /**
     * Fetches the content of a file from the specified URL.
     *
     * @param {string} url - The URL of the file to fetch.
     * @param {string} [format] - Optional format specifier; if "json", parses the response as JSON, otherwise returns text.
     * @returns {Promise<any>} - A promise that resolves to the file content as a string or parsed JSON object.
     * @throws {Error} If the fetch fails or the response is not OK.
     */
    const fetchFileContent: (url: string, format?: string) => Promise<any>;
}
//# sourceMappingURL=ODataUtils.d.ts.map