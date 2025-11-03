/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
import { CardType, TargetCardType, generateAppCard } from "@sap-ux/semantic-card-generator";
import type { CardManifest } from "sap/ui/integration/widgets/Card";
import { ApplicationInfo } from "../helpers/ApplicationInfo";
import { BaseCard } from "./BaseCard";

/**
 * UI5 Integration Card implementation for semantic card generation.
 * Generates cards compatible with SAP UI5 Integration Card format.
 */
export class UI5Card extends BaseCard {
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
	private async formContextParameters(semanticCard: CardManifest): Promise<void> {
		const { contextParametersKeyValue } = await ApplicationInfo.getInstance(this.appComponent).fetchDetails();
		const cardParameters = semanticCard["sap.card"]?.configuration?.parameters as Record<string, { value?: unknown }>;

		contextParametersKeyValue.forEach(({ key, value }) => {
			if (cardParameters?.[key] !== undefined) {
				cardParameters[key].value = value;
			}
		});
	}

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
	async generateObjectCard() {
		try {
			const applicationManifest = this.getApplicationManifest();
			const metadata = await this.getMetadata();
			const annotations = await this.getAnnotations();

			const semanticCard = generateAppCard(applicationManifest, metadata, annotations, {
				target: TargetCardType.UI5IntegrationCard,
				cardType: CardType.Object,
				enableFooterActions: false
			});

			await this.formContextParameters(semanticCard);

			return semanticCard;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Unknown error";
			throw new Error(`Failed to generate UI5 semantic card: ${errorMessage}`);
		}
	}
}
