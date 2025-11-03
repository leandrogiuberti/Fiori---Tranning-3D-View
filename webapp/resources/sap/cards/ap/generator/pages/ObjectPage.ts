/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
import Component from "sap/ui/core/Component";
import { Application } from "./Application";

/**
 * Class for Object Page Application Info
 * Extends Application
 * implements the abstract function of the parent class validateCardGeneration, getEntityRelatedInfo, createInstance
 */
export class ObjectPage extends Application {
	/**
	 * Constructor for ObjectPage class
	 *
	 * @param rootComponent The root component of the application.
	 */
	constructor(rootComponent: Component) {
		super(rootComponent);
		Application.floorplan = "ObjectPage";
	}

	/**
	 * Function to validate the card generation
	 *
	 * @returns boolean
	 */
	public validateCardGeneration(): boolean {
		const { serviceUrl, entitySet, entitySetWithObjectContext } = this.fetchDetails();
		if (!serviceUrl || !entitySet || !entitySetWithObjectContext) {
			return false;
		}

		if (entitySetWithObjectContext.indexOf("(") > -1) {
			const paramStart = entitySetWithObjectContext.indexOf("(");
			const paranEnd = entitySetWithObjectContext.indexOf(")");
			const sContext = entitySetWithObjectContext.substring(paramStart + 1, paranEnd);
			if (!sContext) {
				return false;
			}
		} else {
			return false;
		}

		return true;
	}

	/**
	 * Function to get the entity related information i.e. eentitySet and entitySetWithObjectContext
	 *
	 * @returns object
	 */
	public getEntityRelatedInfo() {
		const hash = window.hasher.getHash();
		let path = hash.split("&/")[1] || "";
		path = path.includes("/") ? path.split("/")[0] : path;

		if (path.startsWith("/")) {
			path = path.replace("/", "");
		}

		path = path.includes("?") ? path.split("?")[0] : path;

		const index = path.indexOf("(");
		const entitySet = path.substring(0, index);

		return {
			entitySet,
			entitySetWithObjectContext: path
		};
	}

	/**
	 * Function to create an instance of ObjectPage
	 *
	 * @param rootComponent The root component of the application.
	 * @returns Application
	 */
	public static createInstance(rootComponent: Component): Application {
		if (!Application.instance) {
			Application.instance = new ObjectPage(rootComponent);
		}
		return Application.instance;
	}
}
