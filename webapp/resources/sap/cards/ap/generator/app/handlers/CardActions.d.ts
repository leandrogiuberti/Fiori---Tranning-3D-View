/// <reference types="openui5" />
/// <reference types="openui5" />
declare module "sap/cards/ap/generator/app/handlers/CardActions" {
    import type ComboBox from "sap/m/ComboBox";
    import type Event from "sap/ui/base/Event";
    import type { ControlProperties } from "sap/cards/ap/generator/types/ActionTypes";
    /**
     *
     * Handles the click event for adding a new action to the card.
     *
     */
    function onActionAddClick(): void;
    /**
     * Handles the delete event for removing an added action from the card.
     *
     * @param {Event} oEvent - The event object triggered by the delete action.
     */
    function onAddedActionDelete(oEvent: Event): void;
    /**
     * Validates the selected action in the ComboBox control.
     *
     * @param {ComboBox} control - The ComboBox control containing the selected action.
     * @returns {boolean} true if the selected action is valid, false otherwise.
     */
    function validateSelectedAction(control: ComboBox): boolean;
    /**
     * Updates the relative properties of an added action based on the annotation actions.
     *
     *
     * @param {ControlProperties} addedAction - The added action to be updated.
     * @param {string} path - The path in the model where the added action is stored.
     */
    function updateRelativeproperties(addedAction: ControlProperties, path: string): void;
    /**
     * Filters the available card actions in the ComboBox control based on the added actions.
     *
     * @param {ComboBox} comboBox - The ComboBox control containing the available actions.
     */
    function filterCardActions(comboBox: ComboBox): void;
    /**
     * Loads the available actions into the ComboBox control and sets up filtering.
     *
     * @param {Event} controlEvent - The event object triggered by the control action.
     */
    function loadActions(controlEvent: Event): void;
    /**
     * Handles the change event for the title of an added action in the ComboBox control.
     *
     * @param {Event} oEvent - The event object triggered by the title change action.
     */
    function onAddedActionTitleChange(oEvent: Event): Promise<void>;
    /**
     * Handles the change event for the style of an added action in the ComboBox control.
     *
     * @param {Event} oEvent - The event object triggered by the style change action.
     */
    function onAddedActionStyleChange(oEvent: Event): void;
    /**
     * Retrieves the translated text for the given key from the i18n model.
     *
     * @param {string} key - The key for which the translated text is to be retrieved.
     * @returns {string} The translated text corresponding to the provided key.
     */
    function getTranslatedText(key: string): string;
    export { filterCardActions, loadActions, onActionAddClick, onAddedActionDelete, onAddedActionStyleChange, onAddedActionTitleChange };
}
//# sourceMappingURL=CardActions.d.ts.map