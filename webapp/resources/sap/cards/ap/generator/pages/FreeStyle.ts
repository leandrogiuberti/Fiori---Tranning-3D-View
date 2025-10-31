/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
import Log from "sap/base/Log";
import { AppType, getApplicationFloorplan } from "sap/cards/ap/common/helpers/ApplicationInfo";
import { getEntitySetWithContextURLs } from "sap/cards/ap/common/odata/ODataUtils";
import type { Model } from "sap/cards/ap/generator/odata/ODataTypes";
import { getEntityNames, getPropertyReference } from "sap/cards/ap/generator/odata/ODataUtils";
import type Component from "sap/ui/core/Component";
import JSONModel from "sap/ui/model/json/JSONModel";
import V2ODataModel from "sap/ui/model/odata/v2/ODataModel";
import V4ODataModel from "sap/ui/model/odata/v4/ODataModel";
import { Application } from "./Application";

export type ServiceDetails = {
	name: string;
	labelWithValue: string;
};

export type EntityDetails = {
	name: string;
	labelWithValue: string;
};

export type EntitySetWithContext = {
	name: string;
	labelWithValue: string;
};

/**
 * Class for Object Page Application Info
 * Extends Application
 * implements the abstract function of the parent class validateCardGeneration, getEntityRelatedInfo, createInstance
 */
export class FreeStyle extends Application {
	freeStyleDialogModel: JSONModel;

	/**
	 * Constructor for ObjectPage class
	 *
	 * @param rootComponent The root component of the application.
	 */
	constructor(rootComponent: Component) {
		super(rootComponent);
		Application.floorplan = "FreeStyle";
		const appComponent = this._rootComponent;
		const entitySetFromManifest = appComponent.getManifestEntry("/sap.cards.ap/embeds/ObjectPage/default");
		const serviceDetails = this.getServiceDetails();
		const entityDetails = this.getEntityDetails();
		const serviceURL = serviceDetails.length ? serviceDetails[0].name : "";

		this.freeStyleDialogModel = new JSONModel({
			isServiceDetailsView: true,
			serviceDetails: serviceDetails,
			currentService: serviceURL,
			entitySet: entitySetFromManifest ? entitySetFromManifest : "",
			entities: entityDetails,
			entitySetWithObjectContext: "",
			entitySetWithObjectContextList: [],
			isApplyServiceDetailsEnabled: false,
			isContextPathChanged: false,
			isEntityPathChanged: false
		});
	}

	/**
	 * Function to validate the card generation
	 *
	 * @returns boolean
	 */
	public validateCardGeneration(): boolean {
		const { serviceUrl } = this.fetchDetails();
		if (!serviceUrl) {
			return false;
		}

		return getApplicationFloorplan(this._rootComponent) === AppType.FreeStyle;
	}

	/**
	 * Function to get the entity related information i.e. eentitySet and entitySetWithObjectContext
	 *
	 * @returns object
	 */
	public getEntityRelatedInfo() {
		return {
			entitySet: this.freeStyleDialogModel.getProperty("/entitySet"),
			entitySetWithObjectContext: this.freeStyleDialogModel.getProperty("/entitySetWithObjectContext")
		};
	}

	/**
	 * Function to create instance of Application
	 *
	 * @param rootComponent The root component of the application
	 * @returns Application
	 */
	public static createInstance(rootComponent: Component): Application {
		if (!Application.instance) {
			Application.instance = new FreeStyle(rootComponent);
		}
		return Application.instance;
	}

	/**
	 * Retrieves service details from the application's manifest.
	 *
	 * This function iterates over the UI5 models and matches them with the data sources to extract the service URLs.
	 * It returns an array of service details, each containing the name and labelWithValue properties.
	 *
	 * @returns {ServiceDetails[]} An array of service details, each containing the name and labelWithValue properties.
	 */
	private getServiceDetails(): ServiceDetails[] {
		const appComponent = this._rootComponent;
		const dataSources = appComponent.getManifestEntry("/sap.app/dataSources");
		const ui5Models: Record<string, any>[] = appComponent.getManifestEntry("/sap.ui5/models");

		return Object.values(ui5Models)
			.map(({ dataSource }) => dataSources[dataSource]?.uri)
			.filter((uri): uri is string => uri !== undefined)
			.map((uri) => ({
				name: uri,
				labelWithValue: uri
			}));
	}

	/**
	 * Retrieves the entity details from the model.
	 *
	 * @returns {EntityDetails[]} An array of entity details, each containing the name and labelWithValue properties.
	 * @private
	 */
	private getEntityDetails(): EntityDetails[] {
		const model = this._rootComponent.getModel() as Model;
		const entityNames = getEntityNames(model);

		return entityNames
			.map((entityName) => {
				const propertyRef = getPropertyReference(model, entityName);
				return propertyRef.length > 0 ? { name: entityName, labelWithValue: entityName } : null;
			})
			.filter((entity): entity is EntityDetails => entity !== null);
	}

	/**
	 * Fetches data for a given entity set with context.
	 *
	 * @param {string} entitySetWithObjectContext - The entity set with context to fetch data for.
	 * @returns {Promise<void>} A promise that resolves when the data fetching is complete.
	 */
	async fetchDataForObjectContext(entitySetWithObjectContext: string): Promise<void> {
		const model = this._rootComponent.getModel() as Model;
		const sFormattedUrl = `/${entitySetWithObjectContext}`;

		if (model instanceof V2ODataModel) {
			await new Promise((resolve, reject) => {
				model.read(sFormattedUrl, {
					success: (oData: Record<string, any>[]) => {
						resolve(oData);
					},
					error: (oError: any) => {
						Log.error("Error fetching data for object context for OData V2 model");
						reject(oError);
					}
				});
			});
		} else if (model instanceof V4ODataModel) {
			try {
				const context = model.bindContext(sFormattedUrl);
				await context.requestObject();
			} catch (err) {
				Log.error("Error fetching data for object context for OData V4 model");
			}
		}
	}

	/**
	 * Updates the FreeStyle model with context information for the selected service and entity set.
	 *
	 * @returns {Promise<void>} A promise that resolves when the model update is complete.
	 */
	async updateObjectContextFreeStyleModel(): Promise<void> {
		const serviceUrl = this.freeStyleDialogModel.getProperty("/currentService");
		const entitySet = this.freeStyleDialogModel.getProperty("/entitySet");
		const model = this._rootComponent.getModel() as Model;

		if (serviceUrl && entitySet) {
			const entitySetWithObjectContextList = await getEntitySetWithContextURLs(serviceUrl, entitySet, model);
			const entitySetWithObjectContext = entitySetWithObjectContextList?.length ? entitySetWithObjectContextList[0].name : "";

			if (entitySetWithObjectContext) {
				await this.fetchDataForObjectContext(entitySetWithObjectContext);
				this.freeStyleDialogModel.setProperty("/entitySetWithObjectContext", entitySetWithObjectContext);
				this.freeStyleDialogModel.setProperty("/entitySetWithObjectContextList", entitySetWithObjectContextList);
				this.freeStyleDialogModel.setProperty("/isApplyServiceDetailsEnabled", true);
			}
		}
	}

	public getFreeStyleModelForDialog() {
		return this.freeStyleDialogModel;
	}
}
