declare module "sap/cux/home/SituationPanel" {
    import { LoadState } from "sap/m/library";
    import Control from "sap/ui/core/Control";
    import Context from "sap/ui/model/Context";
    import type { $ToDoPanelSettings } from "sap/cux/home/ToDoPanel";
    import ToDoPanel from "sap/cux/home/ToDoPanel";
    import { InstanceAttribute } from "./utils/SituationUtils";
    interface Situation {
        SitnInstceKey: string;
        SitnInstceCreatedAtDateTime: string;
        SitnEngineType: string;
        _InstanceAttribute: InstanceAttribute[];
        _InstanceText: InstanceText;
        loadState?: LoadState;
    }
    interface InstanceText {
        SituationTitle: string;
        SituationText: string;
    }
    interface NavigationHelperError {
        _sErrorCode: string;
    }
    /**
     *
     * Panel class for managing and storing Situation cards.
     *
     * @extends ToDoPanel
     *
     * @author SAP SE
     * @version 0.0.1
     * @since 1.121
     *
     * @private
     * @ui5-restricted ux.eng.s4producthomes1
     *
     * @alias sap.cux.home.SituationPanel
     */
    export default class SituationPanel extends ToDoPanel {
        /**
         * Constructor for a new Situation Panel.
         *
         * @param {string} [id] ID for the new control, generated automatically if an ID is not provided
         * @param {object} [settings] Initial settings for the new control
         */
        constructor(id?: string, settings?: $ToDoPanelSettings);
        /**
         * Init lifecycle method
         *
         * @private
         * @override
         */
        init(): void;
        /**
         * Generates request URLs for fetching data based on the specified card count.
         * Overridden method to provide situation-specific URLs.
         *
         * @private
         * @override
         * @param {number} cardCount - The number of cards to retrieve.
         * @returns {string[]} An array of request URLs.
         */
        generateRequestUrls(cardCount: number): string[];
        /**
         * Generates a card template for situations.
         * Overridden method from To-Do panel to generate situation-specific card template.
         *
         * @private
         * @override
         * @param {string} id The ID for the template card.
         * @param {Context} context The context object.
         * @returns {Control} The generated card control template.
         */
        generateCardTemplate(id: string, context: Context): Control;
        /**
         * Handle the press event for a situation.
         *
         * @private
         * @param {Event} event - The event object.
         */
        private _onPressSituation;
        /**
         * Get the text for the "No Data" message.
         *
         * @private
         * @returns {string} The text for the "No Data" message.
         */
        getNoDataText(): string;
    }
}
//# sourceMappingURL=SituationPanel.d.ts.map