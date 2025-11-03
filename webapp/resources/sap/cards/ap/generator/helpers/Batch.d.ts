declare module "sap/cards/ap/generator/helpers/Batch" {
    /*!
     * SAP UI development toolkit for HTML5 (SAPUI5)
     *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
     */
    import type { CardManifest } from "sap/ui/integration/widgets/Card";
    import type { PropertyInfo, PropertyInfoMap } from "sap/cards/ap/generator/odata/ODataTypes";
    import type { Property } from "sap/cards/ap/generator/types/PropertyTypes";
    type QueryParameters = {
        properties: string[];
        navigationProperties: {
            name: string;
            properties: string[];
        }[];
    };
    type RequestQueryNavigationProperties = {
        name: string;
        properties: Property[];
    };
    type RequestQueryComplexProperties = {
        name: string;
        properties: Property[];
    };
    type RequestQueryParametersV4 = {
        properties: PropertyInfo[];
        navigationProperties: RequestQueryNavigationProperties[];
        complexProperties: RequestQueryComplexProperties[];
    };
    type RequestQueryParametersV2 = {
        properties: Property[];
        navigationProperties: RequestQueryNavigationProperties[];
        complexProperties: RequestQueryComplexProperties[];
    };
    /**
     * Updates the card manifest with select query parameters for header and content properties.
     *
     * @param {CardManifest} cardManifest - The card manifest object to be updated.
     */
    function updateManifestWithSelectQueryParams(cardManifest: CardManifest): void;
    /**
     * Updates the card manifest with expand query parameters for header and content properties.
     *
     * @param {CardManifest} cardManifest - The card manifest object to be updated.
     */
    function updateManifestWithExpandQueryParams(cardManifest: CardManifest): void;
    function createUrlParameters(queryParameters: QueryParameters): {
        $select: string;
        $expand: string;
    };
    /**
     * Creates URL parameters for the given properties.
     *
     * @param {PropertyInfoMap} properties - The map of properties to create URL parameters from.
     * @returns {Record<string, string>} The URL parameters object containing the $select query parameter.
     */
    function createURLParams(properties: PropertyInfoMap): Record<string, string>;
}
//# sourceMappingURL=Batch.d.ts.map