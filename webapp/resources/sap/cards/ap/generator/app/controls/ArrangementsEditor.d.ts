/// <reference types="openui5" />
/// <reference types="openui5" />
declare module "sap/cards/ap/generator/app/controls/ArrangementsEditor" {
    /*!
     * SAP UI development toolkit for HTML5 (SAPUI5)
     *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
     */
    import Button from "sap/m/Button";
    import ComboBox from "sap/m/ComboBox";
    import List from "sap/m/List";
    import Text from "sap/m/Text";
    import type Event from "sap/ui/base/Event";
    import Control, { $ControlSettings } from "sap/ui/core/Control";
    import type { MetadataOptions } from "sap/ui/core/Element";
    import RenderManager from "sap/ui/core/RenderManager";
    import { ValueState } from "sap/ui/core/library";
    import type Context from "sap/ui/model/Context";
    import type Model from "sap/ui/model/Model";
    import JSONModel from "sap/ui/model/json/JSONModel";
    import type ResourceModel from "sap/ui/model/resource/ResourceModel";
    import type { PropertyInfo } from "sap/cards/ap/generator/odata/ODataTypes";
    import type { NavigationParameter, Property } from "sap/cards/ap/generator/types/PropertyTypes";
    type ArrangementOptions = {
        name: string;
        value: string;
        propertyKeyForId?: string;
        propertyKeyForDescription: string;
        navigationKeyForId: string;
        navigationKeyForDescription: string;
        isNavigationForId: boolean;
        isNavigationForDescription: boolean;
        navigationalPropertiesForId: Property[];
        navigationalPropertiesForDescription: Property[];
        textArrangement?: string;
        arrangementType: string;
        valueState: ValueState;
        valueStateText: string;
        navigationValueState: ValueState;
        navigationValueStateText: string;
    };
    interface IArrangementsEditor {
        getMode(): string;
        getSelectionKeys(): object;
        getItems(): Array<ArrangementOptions>;
        _addButton: Button;
        _list: List;
    }
    interface ArrangementsEditorSettings extends $ControlSettings {
        mode: string;
        selectionKeys: object;
        navigationSelectionKeys: object;
        items: object;
        change?: (event: ArrangementsEditorChangeEvent) => void;
        selectionChange?: (event: ArrangementsEditorSelectionChangeEvent) => void;
    }
    interface ArrangementsEditorChangeEventParameters {
        value?: number;
    }
    interface ArrangementsEditorSelectionChangeEventParameters {
        value?: number;
    }
    type ArrangementsEditorChangeEvent = Event<ArrangementsEditorChangeEventParameters>;
    type ArrangementsEditorSelectionChangeEvent = Event<ArrangementsEditorSelectionChangeEventParameters>;
    type PropertyMap = {
        [key: string]: string;
    };
    type PropertyInfoMap = Array<PropertyMap>;
    /**
     * @namespace sap.cards.ap.generator.app.controls
     */
    export default class ArrangementsEditor extends Control {
        _list: List;
        _propertyComboBox: ComboBox;
        _idNavigationComboBox: ComboBox;
        _addButton: Button;
        _separatorColon: Text;
        _uomComboBox: ComboBox;
        _descriptionNavigationComboBox: ComboBox;
        _separatorColonText: Text;
        _textArrangementComboBox: ComboBox;
        _deleteButton: Button;
        errorFlag: boolean;
        _setSelectionKeysMap: PropertyInfo;
        static readonly metadata: MetadataOptions;
        constructor(settings: ArrangementsEditorSettings);
        static renderer: {
            apiVersion: number;
            render: (rm: RenderManager, control: IArrangementsEditor) => void;
        };
        /**
         * Initializes the ArrangementsEditor custom control
         *
         * This method sets up various controls and event handlers used by the methods in this control
         *
         * @returns {void}
         */
        init(): void;
        /**
         * Performs actions after ArrangementsEditor custom control has been rendered
         *
         * This method is called after the control has been rendered in the UI
         * It updates entity data and refreshes the internal model of the TextArrangementComboBox
         *
         * @returns {void}
         */
        onAfterRendering(): void;
        /**
         * Retrieves the internal model of the ArrangementsEditor control
         *
         * This method checks if the internal model exists. If not, it creates a new JSON model
         * and sets it as the internal model. It then returns the internal model
         *
         * @returns {sap.ui.model.Model} The internal model of the control
         */
        _getInternalModel(): Model;
        getSelectedItem(): Array<ArrangementOptions>;
        /**
         * Creates and returns a JSON model for text arrangement options
         *
         * This method creates a new JSON model using the provided text arrangement options and returns it.
         *
         * @returns {sap.ui.model.json.JSONModel} A JSON model containing text arrangement options
         */
        _getTextArrangementModel(): JSONModel;
        /**
         * Handles the click event of the add button, adds a new item to the array and refreshes the model
         *
         * @returns {void}
         */
        _onAddButtonClicked(): void;
        /**
         * Handles the click event of the delete button, removes item to be deleted, refreshes the model and fires a change event
         *
         * @param {Event} event - The event object representing the click event
         * @returns {void}
         */
        _onDeleteButtonClicked(event: Event): void;
        handleComboBoxEvents(event: Event, editor: ArrangementsEditor, isNavigation?: boolean, isTextArrangementID?: boolean): any;
        getGroupName(group: ArrangementOptions, isNavigation: boolean, isTextArrangementID: boolean): string;
        getGroupValue(group: ArrangementOptions, isNavigation: boolean, isTextArrangementID: boolean, selectedKey: string, navigationProperties: NavigationParameter[]): string;
        updateControlState(control: ComboBox, value: string, selectedKey: string, isValidation: boolean, i18nModel: ResourceModel, editor: ArrangementsEditor, isItemNotSelected: boolean): void;
        hasNavigationProperty(navigationProperties: NavigationParameter[], propertyToCheck: string): boolean;
        /**
         * The function sets the ValueState of properties present in advanced formatting panel,
         * to ValueState.Information or ValueState.None on the basis of properties present in card preview.
         * @param {JSONModel} model - The JSON model containing the card configuration.
         * @param {ResourceModel} i18nModel - The resource model for localization.
         * @param {string} selectedKey - The selected key from the ComboBox.
         * @param {Context} bindingContext - The binding context of the ComboBox.
         * @param {ArrangementsEditor} editor - The ArrangementsEditor instance.
         * @param {boolean} isItemNotSelected - Flag indicating if the item is not present in the card preview.
         * @returns {void}
         */
        setValueStateForModel(model: JSONModel, i18nModel: ResourceModel, selectedKey: string, bindingContext: Context, editor: ArrangementsEditor, isItemNotSelected: boolean): void;
    }
}
//# sourceMappingURL=ArrangementsEditor.d.ts.map