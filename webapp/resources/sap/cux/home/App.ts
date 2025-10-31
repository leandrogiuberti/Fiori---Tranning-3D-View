/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */

import Log from "sap/base/Log";
import GenericTile, { GenericTile$PressEvent } from "sap/m/GenericTile";
import mobileLibrary from "sap/m/library";
import Control from "sap/ui/core/Control";
import type { MetadataOptions } from "sap/ui/core/Element";
import Container from "sap/ushell/Container";
import SpaceContent from "sap/ushell/services/SpaceContent";
import { $AppSettings } from "./App";
import BaseApp from "./BaseApp";
import { ICustomVizInstance, ISectionAndVisualization } from "./interface/AppsInterface";
import AppManager from "./utils/AppManager";

/**
 *
 * App class for managing and storing Apps.
 *
 * @extends sap.cux.home.BaseApp
 *
 * @author SAP SE
 * @version 0.0.1
 * @since 1.121.0
 *
 * @private
 * @ui5-restricted ux.eng.s4producthomes1
 *
 * @alias sap.cux.home.App
 */
export default class App extends BaseApp {
	constructor(idOrSettings?: string | $AppSettings);
	constructor(id?: string, settings?: $AppSettings);
	/**
	 * Constructor for a new App.
	 *
	 * @param {string} [id] ID for the new app, generated automatically if an ID is not provided
	 * @param {object} [settings] Initial settings for the new app
	 */
	public constructor(id?: string, settings?: $AppSettings) {
		super(id, settings);
	}
	private appManagerInstance!: AppManager;
	static readonly metadata: MetadataOptions = {
		library: "sap.cux.home",
		properties: {
			/**
			 * Url of the app where the user navigates to on click
			 */
			url: { type: "string", group: "Misc", defaultValue: "" },
			/**
			 * VizId of the app. Used for enabling addition of apps to FavoriteApp panel
			 */
			vizId: { type: "string", group: "Misc", defaultValue: "" }
		}
	};
	private _getSSBRootControl(oSmartBusinessAppViz: ICustomVizInstance): Control | null {
		try {
			return oSmartBusinessAppViz.getContent().getComponentInstance().getRootControl() as Control | null;
		} catch (oError) {
			Log.error(oError instanceof Error ? oError.message : String(oError));
			return null;
		}
	}

	private _getInnerGenericTile(oControl: Control | null): GenericTile | null {
		if (!oControl) {
			return null;
		}

		const oControlMetadata = oControl.getMetadata();
		const oDefaultAggregationDefinition = oControlMetadata.getDefaultAggregation() as { name?: string } | null;
		const sDefaultAggregationName = oDefaultAggregationDefinition ? oDefaultAggregationDefinition?.name : "content";

		const aAggregationData = sDefaultAggregationName ? oControl.getAggregation(sDefaultAggregationName) : null;
		const oAggregationValue = Array.isArray(aAggregationData) ? aAggregationData[0] : aAggregationData;

		if (!oAggregationValue) {
			return null;
		}

		if (oAggregationValue instanceof GenericTile && oAggregationValue.getState() === mobileLibrary.LoadState.Loaded) {
			return oAggregationValue;
		}

		return this._getInnerGenericTile(oAggregationValue as Control);
	}

	/**
	 * Navigates to the clicked app
	 * @private
	 */
	private async _launchApp(event: GenericTile$PressEvent): Promise<void> {
		this.appManagerInstance = this.appManagerInstance || AppManager.getInstance();
		const tile = event.getSource();
		const favoriteApps: ISectionAndVisualization[] = await this.appManagerInstance.fetchFavVizs(false, true);
		const selectedApp = favoriteApps.find((app) => {
			const appUrl = app.url || "";
			return tile.getUrl().includes(appUrl);
		});
		const smartBusinessAppViz = selectedApp?.vizInstance;
		const isSmartBusinessTile = selectedApp?.isSmartBusinessTile;
		if (smartBusinessAppViz) {
			const ssbRootControl = this._getSSBRootControl(smartBusinessAppViz);
			const ssbGenericTile = isSmartBusinessTile && this._getInnerGenericTile(ssbRootControl);

			if (ssbGenericTile) {
				ssbGenericTile.firePress();
				return;
			}
		}
		// Fallback in case smartBusinessAppViz is undefined or ssbGenericTile is not present
		const spaceContentService = await Container.getServiceAsync<SpaceContent>("SpaceContent");
		await spaceContentService.launchTileTarget(this.getUrl(), this.getTitle());
	}

	/**
	 * App Press Handler
	 * @private
	 */
	public async _handlePress(event: GenericTile$PressEvent) {
		if (this.getUrl()) {
			await this._launchApp(event);
		}
	}
}
