/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
import type Component from "sap/ui/core/Component";
import { AdaptiveCard } from "./AdaptiveCard";
import { BaseCard } from "./BaseCard";
import { UI5Card } from "./UI5Card";

export const enum GenerateSemanticCard {
	Always = "always",
	Lean = "lean"
}

export type SemanticCardType = "integration" | "adaptive";

export interface SemanticCardFetchOptions {
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
export const createSemanticCardFactory = function (appComponent: Component, fetchOptions: SemanticCardFetchOptions = {}): BaseCard {
	const { cardType = "integration" } = fetchOptions;

	switch (cardType) {
		case "integration":
			return new UI5Card(appComponent);
		case "adaptive":
			return new AdaptiveCard(appComponent);
		default:
			throw new Error(`Unsupported card type: ${String(cardType)}. Supported types: "integration", "adaptive"`);
	}
};
