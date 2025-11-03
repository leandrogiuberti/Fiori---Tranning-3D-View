declare module "sap/cards/ap/common/semanticCard/CardFactory" {
    /*!
     * SAP UI development toolkit for HTML5 (SAPUI5)
     *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
     */
    import type Component from "sap/ui/core/Component";
    import { BaseCard } from "sap/cards/ap/common/semanticCard/BaseCard";
    const enum GenerateSemanticCard {
        Always = "always",
        Lean = "lean"
    }
    type SemanticCardType = "integration" | "adaptive";
    interface SemanticCardFetchOptions {
        cardType?: SemanticCardType;
    }
    /**
     * Factory function to create appropriate semantic card instances.
     *
     * @param appComponent - The SAP UI5 application component
     * @param fetchOptions - Configuration options for card generation
     * @returns A BaseCard instance configured for the specified card type
     * @throws Error if appComponent is not provided or invalid cardType is specified
     *
     */
    const createSemanticCardFactory: (appComponent: Component, fetchOptions?: SemanticCardFetchOptions) => BaseCard;
}
//# sourceMappingURL=CardFactory.d.ts.map