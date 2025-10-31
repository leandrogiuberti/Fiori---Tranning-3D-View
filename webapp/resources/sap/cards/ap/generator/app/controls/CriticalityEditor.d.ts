/// <reference types="openui5" />
/// <reference types="openui5" />
declare module "sap/cards/ap/generator/app/controls/CriticalityEditor" {
    /*!
     * SAP UI development toolkit for HTML5 (SAPUI5)
     *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
     */
    import Button from "sap/m/Button";
    import ComboBox from "sap/m/ComboBox";
    import List from "sap/m/List";
    import Text from "sap/m/Text";
    import VBox from "sap/m/VBox";
    import type Event from "sap/ui/base/Event";
    import Control, { $ControlSettings } from "sap/ui/core/Control";
    import type { MetadataOptions } from "sap/ui/core/Element";
    import RenderManager from "sap/ui/core/RenderManager";
    import { ValueState } from "sap/ui/core/library";
    import Filter from "sap/ui/model/Filter";
    import type Model from "sap/ui/model/Model";
    import JSONModel from "sap/ui/model/json/JSONModel";
    import type { NavigationParameter, Property } from "sap/cards/ap/generator/types/PropertyTypes";
    type CriticalityOptions = {
        name: string;
        value?: string;
        activeCalculation?: boolean;
        isNavigationForId?: boolean;
        navigationKeyForId?: string;
        propertyKeyForId?: string;
        criticality?: string;
        isNavigationForDescription?: boolean;
        navigationalPropertiesForId?: Property[];
        valueState: ValueState;
        valueStateText: string;
        navigationValueState?: ValueState;
        navigationValueStateText?: string;
    };
    type PropertyInfo = {
        label?: string;
        type?: string;
        name?: string;
        value?: string | number;
        category?: string;
    };
    export default interface ICriticalityEditor {
        addButton: Button;
        list: List;
        getType(): string;
        getSelectionKeys(): object;
        getItems(): Array<CriticalityOptions>;
    }
    interface CriticalitySettings extends $ControlSettings {
        type: string;
        selectionKeys: object;
        items: object;
        change?: (event: CriticalityEditorChangeEvent) => void;
        navigationSelectionKeys: object;
    }
    interface CriticalityEditorChangeEventParameters {
        value?: object;
        isCalcuationType?: boolean;
        selectedItem?: object;
    }
    interface SelectionKeyMap {
        name?: string;
        label?: string;
    }
    type CriticalityEditorChangeEvent = Event<CriticalityEditorChangeEventParameters>;
    /**
     * @namespace sap.cards.ap.generator.app.controls
     */
    export default class CriticalityEditor extends Control {
        list: List;
        addButton: Button;
        separatorColon: Text;
        deleteButton: Button;
        propertyComboBox: ComboBox;
        setSelectionKeysMap: SelectionKeyMap;
        propertyFilter: Filter;
        itemsMap: CriticalityOptions;
        criticalityComboBox: ComboBox;
        criticalityCalculator: VBox;
        criticalityComboBoxModel: ComboBox;
        staticCriticality: Array<PropertyInfo>;
        _idNavigationComboBox: ComboBox;
        static readonly metadata: MetadataOptions;
        constructor(settings: CriticalitySettings);
        static renderer: {
            apiVersion: number;
            render: (rm: RenderManager, control: ICriticalityEditor) => void;
        };
        /**
         * Initializes the CriticalityEditor custom control
         *
         * This method sets up various controls and event handlers used by the methods in this control
         *
         * @returns {void}
         */
        init(): void;
        /**
         * Performs actions after CriticalityEditor custom control has been rendered
         *
         * This method is called after the control has been rendered in the UI. It fetches the selection keys
         *
         * @returns {void}
         */
        onAfterRendering(): void;
        getCriticalityModel(): JSONModel;
        /**
         *
         * @param event Event object
         * @param editor CriticalityEditor instance
         * @param isNavigation boolean flag to check if the event is for navigation
         * @returns object
         */
        handleComboBoxEvents(event: Event, isNavigation?: boolean): any;
        /**
         * Retrieves the internal model of the CriticalityEditor control
         *
         * This method checks if the internal model exists. If not, it creates a new JSON model
         * and sets it as the internal model. It then returns the internal model
         *
         * @returns {sap.ui.model.Model} The internal model of the control
         */
        protected _getInternalModel(): Model;
        /**
         * Handles the click event of the add button, adds a new item to the array and refreshes the model
         *
         * @returns {void}
         */
        onAddButtonClicked(): void;
        /**
         * Handles the click event of the delete button, removes item to be deleted, refreshes the model and fires a change event
         *
         * @param {Event} event - The event object representing the click event
         * @returns {void}
         */
        onDeleteButtonClicked(event: Event): void;
        isPotentialCriticality(property: PropertyInfo): boolean;
        /**
         * Sets the static criticality data
         * This method fetches the criticality category and assigns it to the static criticality items.
         */
        setCriticalityModel(): void;
        /**
         * Checks if a specific property exists within the given navigation properties.
         *
         * @param {NavigationParameter[]} navigationProperties - An array of navigation parameters to search through.
         * @param {string} propertyToCheck - The name of the property to check for.
         * @returns {boolean} True if the property exists in the navigation properties, otherwise false.
         */
        hasNavigationProperty(navigationProperties: NavigationParameter[], propertyToCheck: string): boolean;
        /**
         * The function sets the ValueState of properties present in advanced formatting panel,
         * to ValueState.Information or ValueState.None on the basis of properties present in card preview.
         * @param {JSONModel} model - The JSON model containing the card configuration.
         * @param {string} selectedKey - The selected key from the ComboBox.
         * @param {boolean} isItemNotSelected - Flag indicating if the item is not present in the card preview.
         * @returns {void}
         */
        setValueStateForModel(model: JSONModel, selectedKey: string, isItemNotSelected: boolean): void;
    }
}
//# sourceMappingURL=CriticalityEditor.d.ts.map