declare module "sap/cards/ap/common/semanticCard/AdaptiveCard" {
    import { BaseCard } from "sap/cards/ap/common/semanticCard/BaseCard";
    /**
     * Adaptive Card implementation for semantic card generation.
     * Generates cards compatible with Microsoft Teams Adaptive Card format.
     */
    class AdaptiveCard extends BaseCard {
        /**
         * Replaces context parameter placeholders in the metadata context path with actual values.
         *
         * This method fetches key-value pairs representing context parameters using the ApplicationInfo helper.
         * It then replaces any placeholders in the form {{key}} within the provided metadataContextPath string
         * with their corresponding values.
         *
         * @param {string} metadataContextPath - The metadata context path containing parameter placeholders.
         * @returns {Promise<string>} A promise that resolves to the updated metadata context path with all placeholders replaced.
         */
        private getUpdatedMetadataContextPath;
        /**
         * Constructs a complete web URL by combining the current origin with the context path.
         *
         * @param {string} contextPath - The context path
         * @returns {string} Complete web URL combining origin and context path
         * @private
         */
        private getWebUrl;
        /**
         * Generates an Adaptive Card with populated context path parameters.
         *
         * This method retrieves the application manifest, OData metadata, and annotations,
         * then generates an Adaptive Card using the semantic card generator. It updates
         * the card's context path by replacing parameter placeholders with actual values.
         *
         * @returns A promise that resolves to the generated semantic card object.
         * @throws {Error} If card generation fails, an error with a descriptive message is thrown.
         */
        generateObjectCard(): Promise<any>;
    }
}
//# sourceMappingURL=AdaptiveCard.d.ts.map