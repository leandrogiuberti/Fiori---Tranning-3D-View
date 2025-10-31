/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
import { CardType, TargetCardType, generateAppCard } from "@sap-ux/semantic-card-generator";
import { ApplicationInfo } from "../helpers/ApplicationInfo";
import { BaseCard } from "./BaseCard";

/**
 * Adaptive Card implementation for semantic card generation.
 * Generates cards compatible with Microsoft Teams Adaptive Card format.
 */
export class AdaptiveCard extends BaseCard {
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
	private async getUpdatedMetadataContextPath(metadataContextPath: string): Promise<string> {
		const { contextParametersKeyValue } = await ApplicationInfo.getInstance(this.appComponent).fetchDetails();

		contextParametersKeyValue.forEach(({ key, value }) => {
			const parameterPlaceholder = `{{${key}}}`;
			if (metadataContextPath.includes(parameterPlaceholder)) {
				metadataContextPath = metadataContextPath.replace(parameterPlaceholder, value);
			}
		});
		return metadataContextPath;
	}

	/**
	 * Constructs a complete web URL by combining the current origin with the context path.
	 *
	 * @param {string} contextPath - The context path
	 * @returns {string} Complete web URL combining origin and context path
	 * @private
	 */
	private getWebUrl(contextPath: string): string {
		const url = new URL(window.location?.href);
		return `${url.origin}${contextPath}`;
	}

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
	async generateObjectCard() {
		try {
			const applicationManifest = this.getApplicationManifest();
			const metadata = await this.getMetadata();
			const annotations = await this.getAnnotations();

			const semanticCard = generateAppCard(applicationManifest, metadata, annotations, {
				target: TargetCardType.AdaptiveCard,
				cardType: CardType.Object
			});

			const updatedContextPath = await this.getUpdatedMetadataContextPath(semanticCard.metadata.context.path);
			semanticCard.metadata.context.path = updatedContextPath;
			semanticCard.metadata.webUrl = this.getWebUrl(updatedContextPath);

			return semanticCard;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Unknown error";
			throw new Error(`Failed to generate Adaptive semantic card: ${errorMessage}`);
		}
	}
}
