/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
import type Component from "sap/ui/core/Component";
import type V4ODataModel from "sap/ui/model/odata/v4/ODataModel";
import type { AppManifest } from "../helpers/ApplicationInfo";
import { fetchFileContent, isODataV4Model, type ODataModel } from "../odata/ODataUtils";

type AnnotatedODataModel = {
	aAnnotationURIs?: string[];
	aAnnotationUris?: string[];
};

/**
 * Base class for semantic card generation providing common functionality
 * for accessing application metadata, annotations, and OData service information.
 */
export abstract class BaseCard {
	protected readonly appComponent: Component;

	constructor(appComponent: Component) {
		this.appComponent = appComponent;
	}

	/**
	 * Abstract method to generate the semantic card object.
	 * Must be implemented by concrete card types.
	 */
	abstract generateObjectCard(): Promise<any>;

	/**
	 * Retrieves the application manifest with validation.
	 * @returns The application manifest
	 * @throws Error if manifest is not available
	 */
	protected getApplicationManifest(): AppManifest {
		return this.appComponent.getManifest() as AppManifest;
	}

	/**
	 * Retrieves OData service metadata as XML string.
	 * @returns Promise resolving to metadata XML string
	 * @throws Error if model is not available or metadata fetch fails
	 */
	protected async getMetadata(): Promise<string> {
		const appModel = this.appComponent.getModel();
		if (!appModel) {
			throw new Error("OData model is not available.");
		}

		const bODataV4 = isODataV4Model(appModel as ODataModel);
		const serviceUrl = bODataV4
			? (appModel as V4ODataModel).getServiceUrl()
			: (appModel as unknown as { sServiceUrl?: string }).sServiceUrl;

		if (!serviceUrl) {
			throw new Error("Service URL is not available from the model.");
		}

		try {
			const metadataUrl = serviceUrl?.endsWith("/") ? `${serviceUrl}$metadata` : `${serviceUrl}/$metadata`;
			const metadataFileContent = await fetchFileContent(metadataUrl);
			return metadataFileContent;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Unknown error";
			throw new Error(`Failed to fetch OData metadata: ${errorMessage}`);
		}
	}

	/**
	 * Retrieves annotation files from the OData model.
	 * @returns Promise resolving to array of annotation XML strings
	 * @throws Error if model is not available or annotation fetch fails
	 */
	protected async getAnnotations(): Promise<string[]> {
		const appModel = this.appComponent.getModel();
		if (!appModel) {
			throw new Error("OData model is not available.");
		}

		const bODataV4 = isODataV4Model(appModel as ODataModel);
		const annotations = [];
		const annotationURIs =
			(bODataV4
				? (appModel.getMetaModel() as unknown as AnnotatedODataModel)?.aAnnotationUris
				: (appModel as unknown as AnnotatedODataModel)?.aAnnotationURIs) ?? [];

		for (const uri of annotationURIs) {
			if (!uri || uri.trim().length === 0) {
				continue;
			}

			try {
				const annotation = await fetchFileContent(uri);
				annotations.push(annotation);
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : "Unknown error";
				throw new Error(`Failed to fetch annotation from ${uri}: ${errorMessage}`);
			}
		}

		return annotations;
	}
}
