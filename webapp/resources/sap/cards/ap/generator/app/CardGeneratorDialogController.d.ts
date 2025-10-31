/// <reference types="openui5" />
/// <reference types="openui5" />
declare module "sap/cards/ap/generator/app/CardGeneratorDialogController" {
    import type ComboBox from "sap/m/ComboBox";
    import Event from "sap/ui/base/Event";
    import { ValueState } from "sap/ui/core/library";
    import JSONModel from "sap/ui/model/json/JSONModel";
    import type { NavigationalData, Property } from "sap/cards/ap/generator/types/PropertyTypes";
    import { ArrangementOptions } from "sap/cards/ap/generator/app/controls/ArrangementsEditor";
    import * as cardActionHandlers from "sap/cards/ap/generator/app/handlers/CardActions";
    import * as freeStyleHandlers from "sap/cards/ap/generator/app/handlers/FreeStyle";
    type UnitOfMeasures = {
        propertyKeyForDescription: string;
        name: string;
        propertyKeyForId: string;
        value: string;
        valueState: ValueState;
        valueStateText: string;
        navigationValueState?: ValueState;
        navigationValueStateText?: string;
        isNavigationForId?: boolean;
        navigationKeyForId?: string;
    };
    type ValueFormatter = {
        property: string;
    };
    type Criticality = {
        criticality: string;
        name: string;
        activeCalculation: boolean;
        propertyKeyForId: string;
    };
    type EventParameters = {
        selectedItem: ArrangementOptions;
        textArrangementChanged: boolean;
    };
    const context: any;
    const aPropsWithUoM: any;
    const MAX_GROUPS = 5;
    const MAX_GROUP_ITEMS = 5;
    const CardGeneratorDialogController: {
        initialize: () => void;
        okPressed: typeof okPressed;
        cancelPressed: typeof closeDialog;
        onAddClick: typeof onAddClick;
        onGroupAddClick: typeof onGroupAddClick;
        onGroupDeleteClick: typeof onGroupDeleteClick;
        deleteGroup: typeof deleteGroup;
        onDeleteClick: typeof onDeleteClick;
        onPropertySelection: typeof onPropertySelection;
        updateContentNavigationSelection: typeof updateContentNavigationSelection;
        onPropertyLabelChange: typeof onPropertyLabelChange;
        onTitleSelection: typeof onTitleSelection;
        onSubTitleSelection: typeof onSubTitleSelection;
        onGroupTitleChange: typeof onGroupTitleChange;
        validateControl: typeof validateControl;
        onDrop: typeof onDrop;
        onHeaderUOMSelection: typeof onHeaderUOMSelection;
        onStateIndicatorSelection: typeof onStateIndicatorSelection;
        updateHeaderNavigationSelection: typeof updateHeaderNavigationSelection;
        onHeightChange: typeof onHeightChange;
        onWidthChange: typeof onWidthChange;
        onResetPressed: typeof onResetPressed;
        onItemsActionsButtonPressed: typeof onItemsActionsButtonPressed;
        onPreviewTypeChange: typeof onPreviewTypeChange;
        toggleAdvancedSetting: typeof toggleAdvancedSetting;
        getTranslatedText: typeof getTranslatedText;
        onPropertyFormatting: typeof onPropertyFormatting;
        onFormatTypeSelection: typeof onFormatTypeSelection;
        onActionAddClick: typeof cardActionHandlers.onActionAddClick;
        onAddedActionDelete: typeof cardActionHandlers.onAddedActionDelete;
        onAddedActionStyleChange: typeof cardActionHandlers.onAddedActionStyleChange;
        onAddedActionTitleChange: typeof cardActionHandlers.onAddedActionTitleChange;
        loadActions: typeof cardActionHandlers.loadActions;
        _setDefaultCardPreview: typeof setDefaultCardPreview;
        _updateTrendForCardHeader: typeof updateTrendForCardHeader;
        _updateSideIndicatorsForHeader: typeof updateSideIndicatorsForHeader;
        _setAdvancedFormattingOptionsEnablement: typeof setAdvancedFormattingOptionsEnablement;
        _updateHeaderArrangements: typeof updateHeaderArrangements;
        _updateArrangements: typeof updateArrangements;
        _updateCriticality: typeof updateCriticality;
        _validateHeader: typeof validateHeader;
        applyCriticality: typeof applyCriticality;
        applyUoMFormatting: typeof applyUoMFormatting;
        onTrendDelete: typeof onTrendDelete;
        loadAdvancedFormattingConfigurationFragment: typeof loadAdvancedFormattingConfigurationFragment;
        addLabelsForProperties: typeof addLabelsForProperties;
        checkForNavigationProperty: typeof checkForNavigationProperty;
        disableOrEnableUOMAndTrend: typeof disableOrEnableUOMAndTrend;
        handleCriticalityAction: typeof handleCriticalityAction;
        onEntitySetPathChange: typeof freeStyleHandlers.onEntitySetPathChange;
        applyServiceDetails: typeof freeStyleHandlers.applyServiceDetails;
        onServiceChange: typeof freeStyleHandlers.onServiceChange;
        onContextPathChange: typeof freeStyleHandlers.onContextPathChange;
        onBackButtonPress: typeof freeStyleHandlers.onBackButtonPress;
        handleFormatterUomAction: typeof handleFormatterUomAction;
        onBeforeDialogClosed: typeof onBeforeDialogClosed;
        setCriticalitySourceProperty: typeof setCriticalitySourceProperty;
    };
    function getCriticality(propertyName: string, isCalcuationType?: boolean): any;
    /**
     * This functions updates the enablement of the advanced formatting options based on the source property.
     * @param sourceProperty
     * @returns
     */
    function setAdvancedFormattingOptionsEnablement(sourceProperty: string): void;
    function getPropertyDataType(sourceProperty: string, properties: Property[], model: JSONModel): any;
    /**
     * Updates "sap.card.header" property of integration card manifest and triggers rendering of the card preview.
     *
     * @param oEvent
     * @param key
     * @param fnGetHeaderConfig
     */
    function updateCardHeader(oEvent: Event, fnGetHeaderConfig: Function, key?: string): void;
    /**
     * Handles the change event for card title selection.
     * @param oEvent
     */
    function onTitleSelection(oEvent: Event): void;
    /**
     * Validates the control(control's selected key) based on the provided event and control name.
     * @param {Event} oEvent The event triggered by the control.
     * @param {string} [controlName] The name of the control being validated.
     */
    function validateControl(oEvent: Event, controlName?: string): void;
    /**
     * Handles the change event for card subtitle selection.
     * @param oEvent
     */
    function onSubTitleSelection(oEvent: Event): void;
    /**
     * Handles the change event for card header UOM selection.
     * @param oEvent
     */
    function onHeaderUOMSelection(oEvent: Event): void;
    function addLabelsForProperties(selectedNavigationProperty: NavigationalData, data: Record<string, unknown>): void;
    function updateCardConfigurationData(selectedProperty: string, selectedNavigationProperty: NavigationalData): Promise<void>;
    function updateHeaderNavigationSelection(oEvent: Event): void;
    /**
     * Handles the change event for card KPI value selection.
     * @param oEvent
     */
    function onStateIndicatorSelection(oEvent: Event): Promise<void>;
    /**
     * Retrieves the property type and selected value from the given model based on the selected property.
     *
     * @param {JSONModel} model - The JSON model containing configuration and data.
     * @param {string} selectedProperty - The property path to retrieve the type and value for.
     *                                     It can be a simple property or a navigation property (e.g., "propertyName" or "navigationProperty/propertyName").
     * @returns {{ propertyType: string | undefined, selectedValue: string }} - An object containing:
     *   - `propertyType`: The type of the selected property (if found).
     *   - `selectedValue`: The value of the selected property (if found).
     */
    function getPropertyAndSelectedValue(model: JSONModel, selectedProperty: string): {
        propertyType: any;
        selectedValue: any;
    };
    /**
     * Disables or enables the apply unit of measure based on the selected property.
     * @param {JSONModel} model - The JSON model containing the configuration.
     * @param {string} selectedProperty - The name of the selected property.
     */
    function disableOrEnableUOMAndTrend(model: JSONModel, selectedProperty: string): void;
    function updateContentNavigationSelection(oEvent: Event): void;
    function updateSelectedNavigation(selectedKey: string, sourceProperty: string, oModel: JSONModel, source: string): void;
    function updateSelectedNavigationProperty(selectedKey: string, isHeader: boolean): Promise<void>;
    function getTranslatedText(sKey: string): any;
    function onAddClick(oEvent: Event): void;
    function okPressed(): Promise<void>;
    function validateHeader(): boolean;
    function validateIndicatorsValues(buttonId: string): boolean;
    function validateTrendValues(buttonId: string): boolean;
    function setValueStateTextForControl(controlId: string, errorMessage: string, isSelectControl?: boolean): void;
    function onGroupAddClick(oEvent: any): void;
    function deleteGroup(event: any): void;
    function onGroupDeleteClick(event: any): void;
    function onGroupTitleChange(oEvent: any): void;
    function onDeleteClick(oEvent: any): void;
    /**
     * Updates the sap.card.header.mainIndicator.trend property of the integration card manifest and triggers rendering of the card preview.
     */
    function updateTrendForCardHeader(): void;
    /**
     * Updates the sap.card.header.sideIndicators property of the integration card manifest and triggers rendering of the card preview.
     */
    function updateSideIndicatorsForHeader(): void;
    /**
     * Get trend direction based on the static values.
     * @param staticValues
     * @returns
     */
    function getTrendDirection(staticValues: object | undefined): string;
    function onPropertySelection(oEvent: Event): Promise<void>;
    /**
     * This function sets the ValueState of properties present in advanced formatting panel,
     * to ValueState.Information or ValueState.None on the basis of properties present in card preview.
     * @param selectedKey - The selected key from the ComboBox.
     */
    function setValueStateForAdvancedPanel(selectedKey?: string): void;
    function onPropertyLabelChange(oEvent: any): void;
    function onDrop(oEvent: any): void;
    function onResetPressed(): void;
    function onHeightChange(oEvent: any): void;
    function onWidthChange(oEvent: any): void;
    function closeDialog(): void;
    function setCriticalitySourceProperty(property: string): void;
    function onFormatTypeSelection(oEvent: any, oSource: ComboBox): void;
    function onPropertyFormatting(oEvent: any): void;
    function onAdvancedFormattingConfigOpen(oEvent: any, oSource: any): void;
    function applyCriticality(oEvent: Event): void;
    function applyUoMFormatting(): void;
    /**
     * Retrieves the properties of a navigation property that matches the given key.
     *
     * @param {Array<{ name: string; properties: Array<object> }>} navProperties - An array of navigation properties, each containing a name and a list of properties.
     * @param {string} propertyKeyFromSource - The key to match against the name of the navigation properties.
     * @returns {Array<object>} The properties of the matching navigation property, or an empty array if no match is found.
     */
    function getNavValues(navProperties: [{
        name: string;
        properties: Array<object>;
    }], propertyKeyFromSource: string): Array<object>;
    function onTrendDelete(): void;
    function loadAdvancedFormattingConfigurationFragment(oSource: any, oConfigurationController: object): void;
    function onItemsActionsButtonPressed(oEvent: any): void;
    /**
     * Handles the formatter Unit of Measure (UoM) action by updating the model properties
     * based on the provided ID, event, and model.
     *
     * @param {string} id - The ID of the formatter UoM action.
     * @param event - The event object triggered by the action.
     * @param {JSONModel} model - The JSON model used to update the configuration properties.
     */
    function handleFormatterUomAction(id: string, event: any, model: JSONModel): void;
    /**
     * Handles the criticality action by updating the model properties and returning the derived property path.
     *
     * @param {string} id - The ID of the criticality action.
     * @param event - The event object triggered by the action.
     * @param {JSONModel} model - The JSON model used to update the configuration properties.
     *
     * @returns {string} - The derived property path combining the property name and navigation property.
     */
    function handleCriticalityAction(id: string, event: any, model: JSONModel): string;
    function onPreviewTypeChange(oEvent: any): void;
    /**
     * Update the sap.card.header of the integration card manifest by appling latest text arrangements, unit of measurement and formatters and triggers rendering of the card preview.
     * - This method is triggered when text arrrangement, unit of measurement or formatters are changed.
     */
    function updateHeaderArrangements(): void;
    function updateArrangements(): void;
    function updateCriticality(isCalcuationType: boolean): void;
    function checkForNavigationProperty(event: Event, isTextArrangement?: boolean): Promise<void>;
    function toggleOffAdvancedPanel(): void;
    function toggleAdvancedSetting(toggleEvent: Event): Promise<void>;
    function setDefaultCardPreview(): void;
    function onBeforeDialogClosed(oEvent: object): void;
}
//# sourceMappingURL=CardGeneratorDialogController.d.ts.map