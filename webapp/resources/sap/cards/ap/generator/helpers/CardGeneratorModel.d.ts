/// <reference types="openui5" />
declare module "sap/cards/ap/generator/helpers/CardGeneratorModel" {
    /*!
     * SAP UI development toolkit for HTML5 (SAPUI5)
     *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
     */
    import type ResourceBundle from "sap/base/i18n/ResourceBundle";
    import type Component from "sap/ui/core/Component";
    import type { CardManifest } from "sap/ui/integration/widgets/Card";
    import JSONModel from "sap/ui/model/json/JSONModel";
    import type { ArrangementOptions } from "sap/cards/ap/generator/app/controls/ArrangementsEditor";
    import { PropertyInfoMap } from "sap/cards/ap/generator/odata/ODataTypes";
    import { ActionStyles, AnnotationAction, ControlProperties } from "sap/cards/ap/generator/types/ActionTypes";
    import type { NavigationParameter, NavigationProperty, ObjectCardGroups, UnitOfMeasures } from "sap/cards/ap/generator/types/PropertyTypes";
    import { FormatterConfigurationMap } from "./Formatter";
    import { type ParsedManifest } from "./IntegrationCardHelper";
    type EntityType = {
        [key: string]: any;
    };
    type CriticalityOptions = {
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
    type MainIndicatorOptions = {
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
    type TrendOptions = {
        referenceValue: string;
        downDifference: string;
        upDifference: string;
        targetValue?: string;
        sourceProperty?: string;
    };
    type SideIndicatorOptions = {
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
    type TrendOrIndicatorOptions = {
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
    const UnitCollection: {
        Name: string;
        Value: string;
    }[];
    /**
     * Merges the default property formatters with the user provided property formatters
     *
     * @param {FormatterConfigurationMap} defaultPropertyFormatters The default property formatters
     * @param {FormatterConfigurationMap} userProvidedPropertyFormatters The user provided property formatters
     * @returns {FormatterConfigurationMap} The merged property formatters
     * @private
     *
     */
    function _mergePropertyFormatters(defaultPropertyFormatters?: FormatterConfigurationMap, userProvidedPropertyFormatters?: FormatterConfigurationMap): FormatterConfigurationMap;
    /**
     * Generates the card generator dialog model.
     *
     * @param {Component} appComponent - The root component of the application.
     * @param {CardManifest} [mCardManifest] - The card manifest object (optional).
     * @returns {Promise<JSONModel>} A promise that resolves to the card generator dialog model.
     */
    const getCardGeneratorDialogModel: (appComponent: Component, mCardManifest?: CardManifest) => Promise<JSONModel>;
    /**
     * Adds labels for properties and updates the unit of measures array.
     *
     * @param {PropertyInfoMap} properties - The map of properties to be updated with labels.
     * @param {Record<string, unknown>} data - The data record containing property values.
     * @param {Record<string, PropertyValue>} mData - The map to store updated property values.
     * @param {Array<object>} unitOfMeasures - The array of unit of measures to be updated.
     */
    function addLabelsForProperties(properties: PropertyInfoMap, data: Record<string, unknown>, mData: {
        [key: string]: PropertyValue;
    }, unitOfMeasures: Array<object>): void;
    /**
     * Gets the property formatters for the card generator dialog.
     * The property formatters are merged from the default property formatters and the navigational property formatters.
     *
     * @param {ResourceBundle} resourceBundle The resource bundle
     * @param {PropertyInfoMap} properties The properties
     * @param {NavigationParameter} navigationProperty The navigation property
     * @returns
     */
    function getPropertyFormatters(resourceBundle: ResourceBundle, properties: PropertyInfoMap, navigationProperty: NavigationParameter[]): FormatterConfigurationMap;
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
    function processParsedManifest(parsedManifest: ParsedManifest, navigationProperty: NavigationParameter[], path: string, mData: Record<string, PropertyValue>, mCardManifest: CardManifest): Promise<void>;
    /**
     * Retrieves the advanced formatting options for the card generator.
     *
     * @param {UnitOfMeasures[]} unitOfMeasures - The array of unit of measures.
     * @param {FormatterConfigurationMap} propertyValueFormatters - The map of property value formatters.
     * @param {ParsedManifest} [parsedManifest] - The parsed manifest object (optional).
     * @returns {Promise<AdvancedFormattingOptions>} A promise that resolves to the advanced formatting options.
     */
    function getAdvancedFormattingOptions(unitOfMeasures: UnitOfMeasures[], propertyValueFormatters: FormatterConfigurationMap, parsedManifest?: ParsedManifest, path?: string): Promise<AdvancedFormattingOptions>;
    /**
     * Retrieves the label with value for the main indicator's selected navigation property.
     *
     *
     * @param {Record<string, any>} selectedNavigationPropertyHeader - The selected navigation property header containing the properties.
     * @param {string} mainIndicatorNavigationSelectedKey - The key of the main indicator's selected navigation property.
     * @returns {string} The label with value of the selected navigation property, or an empty string if not found.
     */
    function getMainIndicatorSelectedNavigationProperty(selectedNavigationPropertyHeader: Record<string, any>, mainIndicatorNavigationSelectedKey: string): string;
    /**
     * Retrieves the label with value for the main indicator's status unit.
     *
     * @param {string} mainIndicatorStatusKey - The key of the main indicator's status property.
     * @param {PropertyInfoMap} propertiesWithNavigation - The map of properties with navigation.
     * @returns {string} The label with value of the main indicator's status unit, or an empty string if not found.
     */
    function getMainIndicatorStatusUnit(mainIndicatorStatusKey: string, propertiesWithNavigation: PropertyInfoMap): string;
}
//# sourceMappingURL=CardGeneratorModel.d.ts.map