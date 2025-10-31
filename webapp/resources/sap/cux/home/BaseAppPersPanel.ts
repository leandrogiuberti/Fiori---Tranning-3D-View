/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */

import GenericTile from "sap/m/GenericTile";
import Component from "sap/ui/core/Component";
import type { MetadataOptions } from "sap/ui/core/Element";
import EventBus from "sap/ui/core/EventBus";
import App from "./App";
import BaseAppPanel from "./BaseAppPanel";
import { $BaseAppPersPanelSettings } from "./BaseAppPersPanel";
import Group from "./Group";
import { IAppPersonalization, ICustomVisualization, IItemPersonalization } from "./interface/AppsInterface";
import { getPageManagerInstance } from "./utils/CommonUtils";
import { DEFAULT_APP_ICON, DEFAULT_BG_COLOR, FALLBACK_ICON, MYHOME_PAGE_ID } from "./utils/Constants";
import { getLeanURL } from "./utils/DataFormatUtils";
import PageManager from "./utils/PageManager";
import PersonalisationUtils from "./utils/PersonalisationUtils";
import UshellPersonalizer, { IPersonalizationData } from "./utils/UshellPersonalizer";

/**
 *
 * Provides the BaseAppPersPanel Class which is BaseAppPanel with personalisation.
 *
 * @extends sap.cux.home.BaseAppPanel
 *
 * @author SAP SE
 * @version 0.0.1
 * @since 1.121.0
 *
 * @abstract
 * @private
 *
 * @alias sap.cux.home.BaseAppPersPanel
 */
export default abstract class BaseAppPersPanel extends BaseAppPanel {
	private _pageManagerInstance!: PageManager;
	private _eventBus!: EventBus;
	private firstLoad = true;

	constructor(idOrSettings?: string | $BaseAppPersPanelSettings);
	constructor(id?: string, settings?: $BaseAppPersPanelSettings);
	constructor(id?: string, settings?: $BaseAppPersPanelSettings) {
		super(id, settings);
	}

	static readonly metadata: MetadataOptions = {
		library: "sap.cux.home",
		properties: {
			persContainerId: { type: "string", group: "Misc", defaultValue: "", visibility: "hidden" }
		}
	};

	public init() {
		super.init();
		this._eventBus = EventBus.getInstance();
		//apply personalization on page update
		this._eventBus.subscribe(
			"pageChannel",
			"pageUpdated",
			() => {
				void this.applyPersonalization(!this.firstLoad);
			},
			this
		);
	}

	/**
	 * Retrieves the personalizer instance.
	 * @returns {Promise<sap.cux.home.UshellPersonalizer>} A promise resolving to the personalizer instance.
	 * @throws {Error} Throws an error if no container ID is provided for personalization.
	 * @private
	 */
	private async _getPersonalizer() {
		const persContainerId = this._getPersContainerId();
		if (!persContainerId) {
			throw new Error("No Container ID Provided for personalisation!");
		}
		const personalizer = await UshellPersonalizer?.getInstance(
			persContainerId,
			PersonalisationUtils.getOwnerComponent(this) as Component
		);
		return personalizer;
	}

	/**
	 * Retrieves personalization data.
	 * @returns {Promise<IPersonalizationData>} A promise that resolves with the personalization data.
	 * @private
	 */
	protected async getPersonalization() {
		const personalizer = await this._getPersonalizer();
		const persData = await personalizer?.read();
		return persData || {};
	}

	/**
	 * Sets the personalization data.
	 * @param {IPersonalizationData} persData - The personalization data to set.
	 * @returns {Promise<void>} A promise that resolves when the personalization data is set.
	 * @private
	 */
	protected async setPersonalization(persData: IPersonalizationData) {
		const personalizer = await this._getPersonalizer();
		await personalizer.write(persData);
	}

	/**
	 * Returns array of personalized favorite apps
	 *
	 * @returns {Promise} resolves to return array of personalized favorite apps
	 */
	protected async _getAppPersonalization() {
		const personalization = await this.getPersonalization();
		return personalization?.favoriteApps || ([] as IAppPersonalization[]);
	}

	/**
	 * Sets the personalization data.
	 * @param {IAppPersonalization[]} appsPersonalization - Personalization data for favorite apps.
	 * @returns {Promise<void>} A promise that resolves when the personalization data is set.
	 * @private
	 */
	protected async setFavAppsPersonalization(appsPersonalization: IAppPersonalization[]): Promise<void> {
		let personalization = await this.getPersonalization();
		if (personalization) {
			personalization.favoriteApps = appsPersonalization;
			await this.setPersonalization(personalization);
		}
	}

	/**
	 * Applies personalization settings to the tiles.
	 * Retrieves tiles from the generated apps wrapper and applies personalization settings to each tile.
	 * Personalization settings include background color and icon customization.
	 * @param {boolean} [shouldReload=true] - A flag indicating whether to reload page visualizations.
	 * @private
	 * @async
	 */
	public async applyPersonalization(shouldReload: boolean = false) {
		let tiles = this.fetchTileVisualization();
		await this._applyTilesPersonalization(tiles, undefined, shouldReload);
		if (this.firstLoad) {
			this.firstLoad = false;
		}
	}

	/**
	 * Applies personalization settings to the provided tiles.
	 * @param {Array} tiles - An array of tiles to apply personalization settings to.
	 * @param {string} [groupId] - Optional group ID for filtering personalization settings.
	 * @param {boolean} [shouldReload=true] - A flag indicating whether to reload page visualizations.
	 * @returns {Promise<void>} A promise that resolves when personalization settings are applied to the tiles.
	 * @private
	 */
	protected async _applyTilesPersonalization(tiles: GenericTile[], groupId?: string, shouldReload = false) {
		const [personalizations, favPages] = await Promise.all([this._getAppPersonalization(), this._getFavPages()]);
		const favPageVisualizations = await this.appManagerInstance._getAllFavPageApps(favPages, shouldReload);
		const groups = (this.getAggregation("groups") || []) as Group[];
		const apps = groupId ? this._getGroup(groupId)?.getApps() || [] : this.getApps() || [];
		for (const tile of tiles) {
			const item = this._getItem(tile, groups, apps);
			const { color, icon } = this._getItemPersonalization(item, personalizations, favPageVisualizations, groupId);

			if (color) {
				item?.setProperty("bgColor", color, true);
				tile.setBackgroundColor(color);
			}

			if (icon) {
				item?.setProperty("icon", icon, true);
				tile.setTileIcon(icon);
			}
		}
	}

	/**
	 * Retrieves the corresponding App or Group object associated with the given tile.
	 * @param {GenericTile} tile - The tile for which to retrieve the corresponding item.
	 * @param {Group[]} groups - An array of Group objects.
	 * @param {App[]} apps - An array of App objects.
	 * @returns {App | Group | undefined} The corresponding App or Group object, or undefined if not found.
	 * @private
	 */
	private _getItem(tile: GenericTile, groups: Group[], apps: App[]): App | Group | undefined {
		const tileGroupId = tile.data("groupId") as string | undefined;
		if (tileGroupId) {
			return groups.find((oGroup) => oGroup.getGroupId() === tileGroupId);
		} else {
			return apps.find((oApp) => getLeanURL(oApp.getUrl()) === tile.getUrl());
		}
	}

	/**
	 * Retrieves the color and icon associated with the specified item based on personalizations.
	 * @param {App | Group | undefined} item - The App or Group object for which to retrieve personalization data.
	 * @param {IAppPersonalization[] | undefined} personalizations - An array of personalization objects.
	 * @param {ICustomVisualization[]} favPageVisualizations - An array of favorite page visualizations.
	 * @param {string | undefined} groupId - The ID of the group to which the item belongs.
	 * @returns {IItemPersonalization} An object containing the color and icon associated with the item.
	 * @private
	 */
	private _getItemPersonalization(
		item: App | Group | undefined,
		personalizations: IAppPersonalization[] | undefined,
		favPageVisualizations: ICustomVisualization[],
		groupId?: string
	): IItemPersonalization {
		let color: string = "";
		let icon: string = "";

		if (!item) return { color, icon };

		if (item instanceof Group) {
			const personalization = personalizations?.find(
				(personalization) => personalization.isSection && personalization.sectionId === item.getGroupId()
			);
			color = personalization?.BGColor as string;
		} else {
			const app = item;
			const appIds = [app.getUrl()];
			const oldAppId = app.data("oldAppId") as string | undefined;
			if (oldAppId) {
				appIds.push(oldAppId);
			}
			const vizId = app.getVizId();
			const personalization = groupId
				? personalizations?.find(
						(personalization) =>
							!personalization.isSection &&
							personalization.sectionId === groupId &&
							personalization.appId &&
							appIds.includes(personalization.appId)
					)
				: personalizations?.find((oPersonalization) =>
						this?.getMetadata().getName() === "sap.cux.home.FavAppPanel"
							? oPersonalization.isRecentlyAddedApp && oPersonalization.appId && appIds.includes(oPersonalization.appId)
							: oPersonalization.appId && appIds.includes(oPersonalization.appId)
					);
			const favPageVisualization = favPageVisualizations.find(
				(oVisualization) => oVisualization.vizId === vizId || (oVisualization.appId && appIds.includes(oVisualization.appId))
			);
			const colorInfo = personalization?.BGColor || favPageVisualization?.BGColor || DEFAULT_BG_COLOR().key;
			const panelName = this?.getMetadata().getName();
			color = typeof colorInfo === "object" ? colorInfo.key : colorInfo;
			icon =
				panelName === "sap.cux.home.FavAppPanel" || panelName === "sap.cux.home.SpacePanel"
					? this._getFavAppIcon(app, favPageVisualization?.icon)
					: this.getAppIcon();
		}

		return { color, icon };
	}

	/**
	 * Retrieves favorite pages.
	 * @returns {Promise<Array>} A promise that resolves with an array of favorite pages.
	 * @private
	 */
	private async _getFavPages() {
		const aFavPages = await this._getPageManagerInstance().getFavoritePages();
		return aFavPages.concat({
			pageId: MYHOME_PAGE_ID,
			BGColor: DEFAULT_BG_COLOR().key
		});
	}

	/**
	 * Returns default app icon.
	 * @returns {string} The icon URL for the app.
	 * @private
	 */
	protected getAppIcon(): string {
		return DEFAULT_APP_ICON;
	}

	/**
	 * Retrieves the icon for the specified app, prioritizing the favorite page icon if available.
	 * @param {sap.cux.home.App} app - The app object.
	 * @param {string} favPageIcon - The icon for the app from the favorite page.
	 * @returns {string} The icon URL for the app.
	 * @private
	 */
	private _getFavAppIcon(app?: App, favPageIcon?: string): string {
		return favPageIcon || app?.getIcon() || FALLBACK_ICON;
	}

	private _getPageManagerInstance() {
		this._pageManagerInstance = this._pageManagerInstance || getPageManagerInstance(this);
		return this._pageManagerInstance;
	}

	private _getPersContainerId(): string {
		let persContainerId = this.getProperty("persContainerId") as string;
		if (!persContainerId) {
			persContainerId = PersonalisationUtils.getPersContainerId(this);
		}
		return persContainerId;
	}
}
