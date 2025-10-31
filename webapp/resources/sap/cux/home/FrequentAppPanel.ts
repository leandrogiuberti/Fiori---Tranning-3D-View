/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */

import Log from "sap/base/Log";
import type { MetadataOptions } from "sap/ui/core/Element";
import EventBus from "sap/ui/core/EventBus";
import Container from "sap/ushell/Container";
import EventHub from "sap/ushell/EventHub";
import UserRecents from "sap/ushell/services/UserRecents";
import App from "./App";
import BaseAppPersPanel from "./BaseAppPersPanel";
import type { $BasePanelSettings } from "./BasePanel";
import Group from "./Group";
import { IActivity } from "./interface/AppsInterface";
import MenuItem from "./MenuItem";

/**
 *
 * Provides the class for managing frequent apps.
 *
 * @extends sap.cux.home.BaseAppPersPanel
 *
 * @author SAP SE
 * @version 0.0.1
 * @since 1.121.0
 *
 * @private
 * @ui5-restricted ux.eng.s4producthomes1
 *
 * @alias sap.cux.home.FrequentAppPanel
 */

export default class FrequentAppPanel extends BaseAppPersPanel {
	private oEventBus!: EventBus;
	static readonly metadata: MetadataOptions = {
		library: "sap.cux.home",
		defaultAggregation: "apps",
		aggregations: {
			/**
			 * Apps aggregation for Frequent apps
			 */
			apps: { type: "sap.cux.home.App", singularName: "app", multiple: true, visibility: "hidden" }
		}
	};

	/**
	 * Constructor for a new frequent app panel.
	 *
	 * @param {string} [id] ID for the new control, generated automatically if an ID is not provided
	 * @param {object} [settings] Initial settings for the new control
	 */
	public constructor(id?: string, settings?: $BasePanelSettings) {
		super(id, settings);
		this.setSupported(false);
	}

	public init() {
		super.init();
		this.setProperty("key", "frequentApps");
		this.setProperty("title", this._i18nBundle.getText("frequentlyUsedTab"));
		this.setProperty("tooltip", this._i18nBundle.getText("frequentlyUsedTabInfo"));
		this._attachUserActivityTracking();
		EventHub.on("userRecentsCleared").do(() => {
			void this.refresh();
		});

		this.oEventBus = EventBus.getInstance();
		this.oEventBus.subscribe(
			"appsChannel",
			"favAppColorChanged",
			(channelId?: string, eventId?: string, data?) => {
				const { item, color } = data as { item: App | Group; color: string };
				//update color of the app in most used apps
				this._applyUngroupedTileColor(item, color);
			},
			this
		);
	}

	/**
	 * Fetch frequent apps and set apps aggregation
	 * @private
	 */
	public async loadApps() {
		let frequentVisualizations = await this._getFrequentVisualizations();
		this.destroyAggregation("apps", true);
		frequentVisualizations = frequentVisualizations.map((visualization, index) => {
			return {
				...visualization,
				menuItems: this._getActions(visualization.addedInFavorites, index)
			};
		});
		//convert apps objects array to apps instances
		const frequentApps = this.generateApps(frequentVisualizations);
		this.setApps(frequentApps);
	}

	/**
	 * Returns list of frequent apps
	 * @private
	 * @returns {object[]} - Array of frequent apps.
	 */
	private async _getFrequentVisualizations() {
		try {
			const UserRecentsService = await Container.getServiceAsync<UserRecents>("UserRecents");
			const frequentActivities: IActivity[] = (await UserRecentsService?.getFrequentActivity()) || [];
			//convert activity to apps
			const frequentVisualizations = await this.convertActivitiesToVisualizations(frequentActivities);
			return frequentVisualizations;
		} catch (error) {
			Log.error(error as string);
			return [];
		}
	}

	/**
	 * Returns list of actions available for selected app
	 * @private
	 * @param {boolean} isAppAddedInFavorite - true if app is already present in favorite, false otherwise.
	 * @returns {sap.cux.home.MenuItem[]} - Array of list items.
	 */
	private _getActions(isAppAddedInFavorite: boolean = false, index?: number) {
		const action = [];
		if (!isAppAddedInFavorite) {
			action.push(
				new MenuItem(`${this.getKey()}--addToFavorites--${index}`, {
					title: this._i18nBundle.getText("addToFavorites"),
					icon: "sap-icon://add-favorite",
					press: (event) => {
						void this._addAppToFavorites(event);
					}
				})
			);
		}
		return action;
	}

	/**
	 * Generates illustrated message for frequent apps panel.
	 * @private
	 * @override
	 * @returns {sap.m.IllustratedMessage} Illustrated error message.
	 */
	protected generateIllustratedMessage() {
		const illustratedMessage = super.generateIllustratedMessage();
		//override the default description
		illustratedMessage.setDescription(this._i18nBundle.getText("noFreqAppsDescription"));
		return illustratedMessage;
	}
}
