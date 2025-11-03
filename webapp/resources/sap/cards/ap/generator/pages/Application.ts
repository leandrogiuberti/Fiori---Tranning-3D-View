/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
import Component from "sap/ui/core/Component";
import V2ODataModel from "sap/ui/model/odata/v2/ODataModel";
import V4ODataModel from "sap/ui/model/odata/v4/ODataModel";

type Model = V2ODataModel | V4ODataModel;

type ObjectPageApplication = {
	rootComponent: Component;
	floorPlan: string;
	odataModel: string;
	entitySet: string;
	serviceUrl: string;
	entitySetWithObjectContext: string;
	componentName: string;
	semanticObject: string;
	action: string;
	variantParameter: string | null;
	navigationURI: string | null;
};

export enum ODataModelVersion {
	V2 = "V2",
	V4 = "V4"
}

export type LibVersionInfo = {
	buildTimestamp: string;
	name: string;
	scmRevision: string;
	version: string;
};

/**
 * Abstract class for Application Info
 * Provides methods to validate card generation, retrieve entity-related information,
 * and fetch details about the application.
 * @abstract
 */
export abstract class Application {
	static instance: Application | null;
	_oDataModelVersion: ODataModelVersion;
	_rootComponent: Component;
	static floorplan: string;

	public abstract validateCardGeneration(): boolean;
	public abstract getEntityRelatedInfo(): { entitySet: string; entitySetWithObjectContext: string };

	/**
	 * Constructor for the class Application
	 * @param {Component} rootComponent - The root component of the application
	 */
	constructor(rootComponent: Component) {
		this._rootComponent = rootComponent;
		const model = rootComponent.getModel() as Model;
		this._oDataModelVersion = model.isA<V4ODataModel>("sap.ui.model.odata.v4.ODataModel") ? ODataModelVersion.V4 : ODataModelVersion.V2;
	}

	/**
	 * Returns the root component of the application
	 */
	getRootComponent() {
		return this._rootComponent;
	}

	/**
	 * Fetches details for the given application eg: Object Page, Freestyle
	 */
	fetchDetails(): ObjectPageApplication {
		const model = this._rootComponent.getModel();
		const bODataV4 = this._oDataModelVersion === ODataModelVersion.V4;
		const serviceUrl = bODataV4
			? (model as V4ODataModel).getServiceUrl()
			: (model as unknown as { V2ODataModel: V2ODataModel; sServiceUrl: string }).sServiceUrl;
		const hash = window.hasher.getHash();
		const sapApp = this._rootComponent.getManifestEntry("sap.app");
		const componentName = sapApp.id;
		const [hashPartial] = hash.split("&/");
		const navigationURI = Application.floorplan === "FreeStyle" ? hashPartial[1] : null;
		const [semanticObject, action] = hashPartial.includes("?") ? hashPartial.split("?")[0].split("-") : hashPartial.split("-");
		const { entitySet, entitySetWithObjectContext } = this.getEntityRelatedInfo();
		const searchParams = new URLSearchParams(hash.split("?")[1]);
		const variantParameter = searchParams.get("sap-appvar-id");

		return {
			rootComponent: this._rootComponent,
			floorPlan: Application.floorplan,
			odataModel: bODataV4 ? ODataModelVersion.V4 : ODataModelVersion.V2,
			entitySet,
			serviceUrl,
			entitySetWithObjectContext: entitySetWithObjectContext,
			componentName,
			semanticObject,
			action,
			variantParameter,
			navigationURI
		};
	}

	/**
	 * Gets the singleton instance of the Application class.
	 *
	 * @returns {Application} - The singleton instance of the Application class.
	 * @throws {Error} - Throws an error if the instance is not found.
	 */
	public static getInstance(): Application {
		if (Application.instance) {
			return Application.instance;
		}

		throw new Error("Application instance not found");
	}

	/**
	 * for testing purposes only
	 */
	_resetInstance() {
		Application.instance = null;
	}
}
