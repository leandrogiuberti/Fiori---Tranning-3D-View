/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import Component from "sap/ui/core/Component";
import { default as V2ODataModel } from "sap/ui/model/odata/v2/ODataModel";
import { default as V4ODataModel } from "sap/ui/model/odata/v4/ODataModel";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import { createContextParameter, getEntitySetWithObjectContext, unquoteAndDecode } from "../odata/ODataUtils";
import type { FreeStyleFetchOptions, ObjectPageFetchOptions } from "../types/CommonTypes";

export enum ODataModelVersion {
	V2 = "V2",
	V4 = "V4"
}

export enum AppType {
	FreeStyle = "FreeStyle",
	ObjectPage = "ObjectPage"
}

type ODataModel = V2ODataModel | V4ODataModel;

export type App = {
	appModel: ODataModel;
	odataModel: ODataModelVersion;
	entitySet: string;
	context: string;
	entitySetWithObjectContext: string;
	componentName: string;
	resourceBundle: ResourceBundle;
	semanticObject: string;
	action: string;
	appType: string;
	contextParameters: string;
	navigationURI: string | null;
	variantParameter: string | null;
	contextParametersKeyValue: Array<{ key: string; value: string }>;
};

type ResourceBundleWithURL = ResourceBundle & { oUrlInfo: { url: string } };

type ManifestContentSapCardsAP = {
	embeds: {
		ObjectPage?: {
			default: string;
			manifests: {
				[key: string]: Array<{
					localUri: string;
					hideActions: boolean;
				}>;
			};
		};
	};
};

export type AppManifest = {
	"sap.app": {
		id: string;
	};
	"sap.ui5": {};
	"sap.ui": {};
	"sap.fe"?: {};
	"sap.platform.abap"?: {
		uri: string;
	};
	"sap.cards.ap"?: ManifestContentSapCardsAP;
};

/**
 * Determines the application floorplan type based on the manifest entries of the provided app component.
 *
 * @param {Component} appComponent - The application component containing the manifest entries.
 * @returns {string} The floorplan type, either "ObjectPage" or "FreeStyle".
 */
export function getApplicationFloorplan(appComponent: Component): string {
	const isV2FioriElementsApp = appComponent.getManifestEntry("sap.ui.generic.app");

	if (isV2FioriElementsApp) {
		return AppType.ObjectPage;
	}

	const sapUI5Config = appComponent.getManifestEntry("sap.ui5");
	const appTargets = sapUI5Config?.routing?.targets;

	if (appTargets) {
		const appTargetKeys = Object.keys(appTargets);
		const fioriElementsApp = appTargetKeys.some((key) => {
			const target = appTargets[key];
			return target.name === "sap.fe.templates.ObjectPage" || target.name === "sap.fe.templates.ListReport";
		});

		return fioriElementsApp ? AppType.ObjectPage : AppType.FreeStyle;
	}

	return AppType.FreeStyle;
}

export class ApplicationInfo {
	static instance: ApplicationInfo | null;
	appInfo: App | null;
	_rootComponent: Component;

	constructor(rootComponent: Component) {
		this._rootComponent = rootComponent;
		this.appInfo = null;
	}

	public static getInstance(rootComponent: Component): ApplicationInfo {
		if (!ApplicationInfo.instance) {
			ApplicationInfo.instance = new ApplicationInfo(rootComponent);
		}
		return ApplicationInfo.instance;
	}

	public async fetchDetails(fetchOptions?: ObjectPageFetchOptions) {
		const appType = getApplicationFloorplan(this._rootComponent);
		// Reuse cached appInfo without re-parsing hash if possible
		if (this.appInfo !== null && ApplicationInfo.instance !== null) {
			const hash = window.hasher.getHash();
			const path =
				(appType === AppType.FreeStyle
					? await getEntitySetWithObjectContext(this._rootComponent, fetchOptions as FreeStyleFetchOptions)
					: hash.split("&/")[1]) || "";
			if (this.appInfo.entitySetWithObjectContext && path.includes(this.appInfo.entitySetWithObjectContext)) {
				return this.appInfo;
			}
		}

		const isDesignMode = fetchOptions?.isDesignMode || false;
		const componentName = (this._rootComponent.getManifest() as AppManifest)["sap.app"].id;
		const appModel = this._rootComponent.getModel() as ODataModel;
		const hash = window.hasher.getHash();
		const [hashPartial] = hash.split("&/");
		const [semanticObject, action] = hashPartial.includes("?") ? hashPartial.split("?")[0].split("-") : hashPartial.split("-");

		let path = hash.split("&/")[1] || "";
		const navigationURI = appType === AppType.FreeStyle ? path : null;
		path = path.includes("/") ? path.split("/")[0] : path;
		path = path.startsWith("/") ? path.slice(1) : path;
		path = path.includes("?") ? path.split("?")[0] : path;

		const searchParams = new URLSearchParams(hash.split("?")[1]);
		const variantParameter = searchParams.get("sap-appvar-id");
		const index = path.indexOf("(");
		const entitySetObjectPage = index > -1 ? path.substring(0, index) : path;
		const entitySet = appType === AppType.FreeStyle ? (fetchOptions as FreeStyleFetchOptions).entitySet : entitySetObjectPage;
		const context = index > -1 ? path.substring(index + 1, path.indexOf(")")) : "";
		const odataModel = appModel.isA<V4ODataModel>("sap.ui.model.odata.v4.ODataModel") ? ODataModelVersion.V4 : ODataModelVersion.V2;
		const i18nModel = (this._rootComponent.getModel("i18n") || this._rootComponent.getModel("@i18n")) as ResourceModel;
		const entitySetWithObjectContext =
			appType === AppType.FreeStyle
				? await getEntitySetWithObjectContext(this._rootComponent, fetchOptions as FreeStyleFetchOptions)
				: path;
		const isODataV4 = odataModel === ODataModelVersion.V4;
		const contextParameters = entitySetWithObjectContext
			? await createContextParameter(entitySetWithObjectContext, appModel, isODataV4)
			: "";
		let resourceBundle = await i18nModel.getResourceBundle();

		if (isDesignMode) {
			/* Refreshing or destroying the i18nModel does not fetch the latest values because of caching.
			For cache busting, we are appending a unique identifier to the i18nBundleUrl to fetch the latest i18n values everytime dialog is opened. */
			const i18nBundleUrl = (resourceBundle as ResourceBundleWithURL)?.oUrlInfo?.url;
			const timeStamp = Date.now();

			resourceBundle = await ResourceBundle.create({
				url: `${i18nBundleUrl}?v=${timeStamp}`,
				async: true
			});
		}

		this.appInfo = {
			odataModel,
			appModel,
			entitySet,
			entitySetWithObjectContext,
			context,
			componentName,
			resourceBundle,
			semanticObject,
			action,
			appType,
			contextParameters,
			navigationURI,
			variantParameter,
			contextParametersKeyValue: contextParameters.length ? this.getContextParametersKeyValue(contextParameters) : []
		};

		return this.appInfo;
	}

	/**
	 * Parses a context parameter string into an array of key-value objects.
	 *
	 * The context parameter string should be in the format: "key1=value1,key2=value2,...".
	 * Each value is decoded and unquoted using `unquoteAndDecode`.
	 *
	 * @param {string} contextParameters - The context parameter string to parse.
	 * @returns {Array<{ key: string; value: string }>} An array of objects with `key` and `value` properties.
	 */
	private getContextParametersKeyValue(contextParameters: string): Array<{ key: string; value: string }> {
		return contextParameters.split(",").map((param) => {
			const [key, value] = param.split("=");
			const cleanedValue = unquoteAndDecode(value);
			return { key: key.trim(), value: cleanedValue };
		});
	}

	/**
	 * for testing purposes only
	 */
	_resetInstance() {
		ApplicationInfo.instance = null;
	}
}
