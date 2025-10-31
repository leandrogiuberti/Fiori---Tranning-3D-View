declare module "sap/cards/ap/common/semanticCard/UI5Card" {
    import { BaseCard } from "sap/cards/ap/common/semanticCard/BaseCard";
    /**
     * UI5 Integration Card implementation for semantic card generation.
     * Generates cards compatible with SAP UI5 Integration Card format.
     */
    class UI5Card extends BaseCard {
        /**
         * Populates the card parameters with values from the application context.
         *
         * This method fetches key-value pairs representing context parameters using the ApplicationInfo helper.
         * It then assigns each value to the corresponding parameter in the provided card manifest.
         * Only parameters defined in the card manifest will be updated.
         *
         * @param {CardManifest} semanticCard - The card manifest object to update with context parameter values.
         * @returns {Promise<void>} A promise that resolves when all parameters have been populated.
         */
        private formContextParameters;
        /**
         * Generates a UI5 Integration Card with populated parameters.
         *
         * This method retrieves the application manifest, OData metadata, and annotations,
         * then generates a UI5 Integration Card using the semantic card generator. It populates
         * the card's parameters with values from the application context before returning the card.
         *
         * @returns {Promise<CardManifest>} A promise that resolves to the generated semantic card object.
         * @throws {Error} If card generation fails, an error with a descriptive message is thrown.
         */
        generateObjectCard(): Promise<any>;
    }
}
//# sourceMappingURL=UI5Card.d.ts.map