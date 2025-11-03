/// <reference types="openui5" />
declare module "sap/cards/ap/generator/helpers/IntegrationCardHelper" {
    import Component from "sap/ui/core/Component";
    import { CardManifest } from "sap/ui/integration/widgets/Card";
    import type JSONModel from "sap/ui/model/json/JSONModel";
    import ResourceModel from "sap/ui/model/resource/ResourceModel";
    import { ArrangementOptions } from "sap/cards/ap/generator/app/controls/ArrangementsEditor";
    import { PropertyInfoMap } from "sap/cards/ap/generator/odata/ODataTypes";
    import type { UnitOfMeasures } from "sap/cards/ap/generator/types/PropertyTypes";
    import type { CriticalityOptions, SideIndicatorOptions, TrendOptions } from "sap/cards/ap/generator/helpers/CardGeneratorModel";
    import type { FormatterConfiguration, FormatterConfigurationMap } from "sap/cards/ap/generator/helpers/Formatter";
    type ParsedManifest = {
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
    type CriticalityOptionsPanel = CriticalityOptions[];
    let manifest: CardManifest;
    const formatterConfigurationFromCardManifest: FormatterConfigurationMap;
    function createInitialManifest(props: any): CardManifest;
    function getObjectPageContext(): string;
    function getHeaderBatchUrl(): string;
    function getContentBatchUrl(): string;
    function getCurrentCardManifest(): CardManifest;
    /**
     * Render integration card preview
     *
     * @param {CardManifest} newManifest
     */
    function renderCardPreview(newManifest: CardManifest, oModel?: JSONModel): void;
    function updateCardGroups(oModel: JSONModel): void;
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
    function resolvePropertyLabelFromExpression(path: string, resourceModel: ResourceModel, properties: PropertyInfoMap): any;
    /**
     * The function formats the data for OData V2 applications containing the key parameters of type datetimeoffset and guid.
     * @param entitySetWithObjectContext
     * @param data
     */
    function formatDataForV2(entitySetWithObjectContext: string, data: Record<string, any>): void;
    function getMainIndicator(mManifest: CardManifest): {
        mainIndicatorStatusKey: string;
        mainIndicatorNavigationSelectedKey: string;
        criticalityOptions: CriticalityOptions[];
        navigationValue: string;
        trendOptions: TrendOptions;
    };
    /**
     * Updates the criticality options based on the groups in the provided CardManifest.
     * @param {CardManifest} mManifest - The card manifest containing the groups and their items.
     * @param {CriticalityOptions[]} criticalityOptions - An array of criticality options to be updated.
     */
    function updateCriticalityBasedOnGroups(mManifest: CardManifest, criticalityOptions: CriticalityOptions[]): void;
    /**
     * Update the criticality options
     * @param criticalityOptions
     * @param criticalityConfig
     */
    function updateCriticalityOptions(criticalityOptions: CriticalityOptions[], criticalityConfig: CriticalityOptions): void;
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
    function getCriticallityStateForGroup(state: string): string;
    function getSideIndicators(mManifest: CardManifest): SideIndicatorOptions;
    function handleFormatter(formatter: FormatterConfiguration): void;
    function getGroupItemValue(value: string, mManifest: CardManifest): string;
    function getCardGroups(mManifest: CardManifest, resourceModel: ResourceModel): any;
    /**
     * This is a fix for cards which are generated without "sap.insights" manifest property or with cardType as "DT".
     *  - When the card is regenerated "sap.insight" property will be set/updated existing in the manifest.
     *
     * @param mCardManifest
     * @param rootComponent
     * @returns
     */
    function enhanceManifestWithInsights(mCardManifest: CardManifest | undefined, rootComponent: Component): Promise<void>;
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
    function enhanceManifestWithConfigurationParameters(mCardManifest: CardManifest, oDialogModel: JSONModel): void;
    /**
     * Adds query parameters to the URLs in the manifest's batch request.
     *
     * @param {CardManifest} cardManifest - The card manifest.
     * @returns {CardManifest} A copy of the original card manifest with query parameters added to the URLs.
     */
    const addQueryParametersToManifest: (cardManifest?: CardManifest) => CardManifest;
    const updateConfigurationParametersWithKeyProperties: (cardManifest: CardManifest, data: Record<string, any>) => void;
    /**
     * Updates the data path of the card header in the provided card manifest by reference.
     *
     * @param {CardManifest} cardManifest - The card manifest object that contains the header data.
     */
    function updateHeaderDataPath(cardManifest: CardManifest, isODataV4: boolean): void;
    /**
     * This method is used to perform updates on existing integration card manifest.
     * Updates will include adding,
     * 	- Query parameters to the URLs in the target manifest's batch request.
     * 	- sap.app.id to the manifest.
     * @param cardManifest
     */
    const updateExistingCardManifest: (data: Record<string, any>, cardManifest?: CardManifest) => CardManifest | undefined;
    /**
     * Parses the integration card manifest and extracts relevant information.
     *
     * @param {CardManifest} integrationCardManifest - The manifest of the integration card to be parsed.
     * @param {ResourceModel} resourceModel - The resource model used for localization.
     * @param {PropertyInfoMap} properties - The map of properties to resolve labels from expressions.
     * @returns {ParsedManifest} The parsed manifest containing title, subtitle, header unit of measurement, main indicator options, side indicator options, groups, formatter configuration, and text arrangements.
     */
    function parseCard(integrationCardManifest: CardManifest, resourceModel: ResourceModel, properties: PropertyInfoMap): ParsedManifest;
    /**
     * Updates the unit of measures array with formatter configurations.
     *
     * @param {Array<UnitOfMeasures>} unitOfMeasures - The array of unit of measures to be updated.
     * @param {FormatterConfigurationMap} formatterConfigsWithUnit - The formatter configurations containing unit information.
     * @returns Promise {Array<UnitOfMeasures>} The updated array of unit of measures.
     */
    const getUpdatedUnitOfMeasures: (unitOfMeasures: Array<UnitOfMeasures>, formatterConfigsWithUnit: FormatterConfigurationMap, path: string) => Promise<Array<UnitOfMeasures>>;
    /**
     * Updates the criticality options for navigation properties in the main indicator criticality options.
     *
     * @param {Array<CriticalityOptions>} mainIndicatorCriticalityOptions - The array of main indicator criticality options to be updated.
     * @param {string} path - The path used to fetch navigation properties with labels.
     * @returns {Promise<Array<CriticalityOptions>>} A promise that resolves to the updated array of main indicator criticality options.
     */
    const updateCriticalityForNavProperty: (mainIndicatorCriticalityOptions: CriticalityOptionsPanel, path: string) => Promise<CriticalityOptionsPanel>;
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
    const handleFormatterWithoutMatchingProperty: (formatterProperty: string, value: string, updatedUnitOfMeasures: Array<UnitOfMeasures>, path: string) => Promise<void>;
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
    const createCardManifest: (appComponent: Component, cardManifest: CardManifest, dialogModel: JSONModel) => Promise<CardManifest>;
    /**
     * This function checkks if a given property is a navigational property in the model.
     * @param {string} propertyName - Name of the property to check.
     * @param {JSONModel} model - The JSON model containing the card configuration.
     * @returns {boolean} - Returns true if the property is a navigational property, otherwise false.
     */
    const isNavigationalProperty: (propertyName: string, model: JSONModel) => boolean;
    /**
     * This function returns the list of properties that are present in the card preview.
     * @param {JSONModel} model - The JSON model containing the card configuration.
     * @returns {string[]} - Array of property names present in the card preview.
     */
    const getPreviewItems: (model: JSONModel) => any;
}
//# sourceMappingURL=IntegrationCardHelper.d.ts.map