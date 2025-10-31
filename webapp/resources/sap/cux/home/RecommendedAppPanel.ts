/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
import Log from "sap/base/Log";
import GridContainer from "sap/f/GridContainer";
import GridContainerSettings from "sap/f/GridContainerSettings";
import Button from "sap/m/Button";
import Dialog from "sap/m/Dialog";
import GenericTile from "sap/m/GenericTile";
import IllustratedMessageSize from "sap/m/IllustratedMessageSize";
import IllustratedMessageType from "sap/m/IllustratedMessageType";
import { BackgroundDesign } from "sap/m/library";
import Link from "sap/m/Link";
import MessageStrip from "sap/m/MessageStrip";
import MessageToast from "sap/m/MessageToast";
import ScrollContainer from "sap/m/ScrollContainer";
import Text from "sap/m/Text";
import Title from "sap/m/Title";
import VBox from "sap/m/VBox";
import Event from "sap/ui/base/Event";
import type { MetadataOptions } from "sap/ui/core/Element";
import Element from "sap/ui/core/Element";
import EventBus from "sap/ui/core/EventBus";
import App from "./App";
import AppsContainer from "./AppsContainer";
import BaseAppPersPanel from "./BaseAppPersPanel";
import BaseContainer from "./BaseContainer";
import type { $BasePanelSettings } from "./BasePanel";
import MenuItem, { MenuItem$PressEvent } from "./MenuItem";
import { REPO_BASE_URL, SETTINGS_PANELS_KEYS } from "./utils/Constants";
import { DeviceType } from "./utils/Device";
import { addFESRId } from "./utils/FESRUtil";
import HttpHelper from "./utils/HttpHelper";

const CONSTANTS = {
	USER_PREFERENCE_SRVC_URL: `${REPO_BASE_URL}UserPreference`,
	KEY: "recommendedApps"
};

/**
 *
 * Provides the RecommendedAppPanel Class.
 *
 * @extends sap.cux.home.BaseAppPersPanel
 *
 * @author SAP SE
 * @version 0.0.1
 * @since 1.128.0
 *
 * @private
 * @ui5-restricted ux.eng.s4producthomes1
 *
 * @alias sap.cux.home.RecommendedAppPanel
 */
export default class RecommendedAppPanel extends BaseAppPersPanel {
	private _selectedApps: App[] = [];
	static readonly metadata: MetadataOptions = {
		library: "sap.cux.home",
		defaultAggregation: "apps",
		aggregations: {
			/**
			 * Apps aggregation for Recommended apps
			 */
			apps: { type: "sap.cux.home.App", singularName: "app", multiple: true, visibility: "hidden" }
		}
	};

	/**
	 * Constructor for a new Recommended Apps Panel.
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
		this.setProperty("key", CONSTANTS.KEY);
		this.setProperty("title", this._i18nBundle.getText("recommendedAppsTab"));
		this.setProperty("tooltip", this._i18nBundle.getText("recommendedAppsTab"));
		//subscribe to recommendation setting change event
		const eventBus = EventBus.getInstance();
		eventBus.subscribe("importChannel", "recommendationSettingChanged", (channelId?: string, eventId?: string, data?: object) => {
			const showRecommendation = (data as { showRecommendation: boolean }).showRecommendation;
			this.fireSupported({ isSupported: showRecommendation });
		});
		this._createAddToFavouritesMenuItem();
	}

	/**
	 * Creates and inserts the "Add to Favourites" menu item.
	 * @private
	 */
	private _createAddToFavouritesMenuItem(): void {
		const addToFavouritesMenuItem = new MenuItem(`${this.getId()}-addtofavouritesmenuitem`, {
			title: this._i18nBundle.getText("addToFavoritesRecommended"),
			icon: "sap-icon://add-favorite",
			press: this._openAddRecommendedDialog.bind(this),
			visible: false
		});
		addFESRId(addToFavouritesMenuItem, "addToFavouritesMenuItem");
		this.insertAggregation("menuItems", addToFavouritesMenuItem, 0);
	}

	/**
	 * Opens the dialog for adding recommended apps.
	 * @private
	 */
	private _openAddRecommendedDialog(): void {
		const dialogId = `${this.getId()}-addRecommendedDialog-appsPage`;
		const dialog = this._generateAddRecommendedDialog(dialogId);
		dialog.open();
	}

	/**
	 * Creates and returns the dialog for adding recommended apps.
	 * @private
	 * @param {string} dialogId - The unique ID for the dialog.
	 * @returns {sap.m.Dialog} - The generated dialog control.
	 */
	private _generateAddRecommendedDialog(dialogId: string): Dialog {
		if (!this._controlMap.get(dialogId)) {
			this._createAddRecommendedDialogControls(dialogId);
		}
		const appsWrapper = this._generateAppsScrollContainer()?.getContent()?.[0] as GridContainer;
		appsWrapper.destroyAggregation("items");
		this._selectedApps = [...this.getApps()];
		const tiles = this._selectedApps.map((app) => this._createAppTile(app));
		this._setAggregation(appsWrapper, tiles);
		this._updateSelectedAppCount();
		const dialog = this._controlMap.get(dialogId) as Dialog;
		return dialog;
	}

	/**
	 * Creates the controls for the dialog, including the title, subtitle, and buttons.
	 * @private
	 * @param {string} dialogId - The unique ID for the dialog.
	 */
	private _createAddRecommendedDialogControls(dialogId: string): void {
		this._selectedApps = [...this.getApps()];
		this._controlMap.set(
			`${dialogId}-mainTitle`,
			new Title({
				id: `${dialogId}-mainTitle`,
				text: this._i18nBundle.getText("addToFavoritesRecommended")
			})
		);
		this._controlMap.set(
			`${dialogId}-headerContainer-count`,
			new Text({
				id: `${dialogId}-headerContainer-count`
			})
		);
		this._controlMap.set(
			`${dialogId}-selectedAppsTitle`,
			new Title({
				id: `${dialogId}-selectedAppsTitle`,
				text: `${this._i18nBundle.getText("recommendedAppsTab")} (0 ${this._i18nBundle.getText("selected")})`,
				level: "H3"
			})
		);
		this._controlMap.set(
			`${dialogId}-subtitleText`,
			new Text({
				id: `${dialogId}-subtitleText`,
				text: this._i18nBundle.getText("selectAtLeastOneApp")
			})
		);
		const addButton = new Button({
			id: `${dialogId}-addBtn`,
			text: this._i18nBundle.getText("addButton"),
			type: "Emphasized",
			press: async () => {
				await this._addSelectedApps();
				this._closeAddRecommendedDialog(dialogId);
			},
			enabled: this._selectedApps.length > 0
		});
		const cancelButton = new Button({
			id: `${dialogId}-cancelBtn`,
			text: this._i18nBundle.getText("cancelBtn"),
			press: () => this._closeAddRecommendedDialog(dialogId)
		});
		const mainTitleText = (this._controlMap.get(`${dialogId}-mainTitle`) as Title).getText();
		this._controlMap.set(
			dialogId,
			new Dialog(dialogId, {
				title: mainTitleText,
				content: [
					new VBox({
						id: `${dialogId}-headerContainer`,
						items: [
							this._controlMap.get(`${dialogId}-selectedAppsTitle`) as Title,
							this._controlMap.get(`${dialogId}-subtitleText`) as Text
						],
						justifyContent: "Start",
						alignItems: "Start"
					}).addStyleClass("sapUiSmallMarginTop sapUiSmallMarginBeginEnd sapUiTinyMarginBottom"),
					this._generateAppsScrollContainer()
				],
				contentHeight: "25rem",
				contentWidth: "41.75rem",
				buttons: [addButton, cancelButton],
				escapeHandler: () => this._closeAddRecommendedDialog(dialogId)
			}).addStyleClass("sapCuxRecommendedAppsDialog sapContrastPlus")
		);
	}

	/**
	 * Creates and returns an app tile for the given app.
	 * @private
	 * @param {App} app - The app to create a tile for.
	 * @returns {sap.m.GenericTile} - The created app tile.
	 */
	private _createAppTile(app: App): GenericTile {
		const appCopy = app.clone();
		const appTile = (this.getParent() as AppsContainer)._getAppTile(appCopy);
		appTile.addStyleClass("sapCuxHighlightApp");
		appCopy._onPress = (e) => this._highlightApp(e, appCopy);
		return appTile;
	}

	/**
	 * Generates and returns the scroll container for the dialog's apps list.
	 * @private
	 * @returns {sap.m.ScrollContainer} - The scroll container for the apps.
	 */
	private _generateAppsScrollContainer(): ScrollContainer {
		const id = `${this.getId()}-addRecommendedDialog-appsPage-scrollContainer`;
		if (!this._controlMap.get(id)) {
			this._controlMap.set(
				`${id}-apps`,
				new GridContainer({
					id: `${id}-apps`,
					layout: new GridContainerSettings(`${id}-apps-containerSettings`, {
						columnSize: "19rem",
						gap: "0.5rem"
					})
				}).addStyleClass("sapCuxAppsGridContainerPadding")
			);
			this._controlMap.set(
				id,
				new ScrollContainer(id, {
					id,
					vertical: true,
					visible: true,
					height: "20rem",
					content: [this._controlMap.get(`${id}-apps`) as GridContainer]
				}).addStyleClass("sapUiSmallMarginBeginEnd sapUiTinyMarginTop")
			);
		}
		return this._controlMap.get(id) as ScrollContainer;
	}

	/**
	 * Updates the state of the "Add" button in the dialog based on the selected apps.
	 * @private
	 */
	private _updateAddButtonState() {
		const dialogId = `${this.getId()}-addRecommendedDialog-appsPage`;
		const addButton = Element.getElementById(`${dialogId}-addBtn`) as Button;
		if (addButton) {
			addButton.setEnabled(this._selectedApps.length > 0);
		}
	}

	/**
	 * Closes the dialog and resets the selected apps state.
	 * @private
	 * @param {string} dialogId - The unique ID of the dialog to close.
	 */
	private _closeAddRecommendedDialog(dialogId: string): void {
		this.toggleAppTileHighlight(true);
		const dialog = this._controlMap.get(dialogId) as Dialog;
		if (dialog) {
			dialog.close();
		}
		this._resetAddRecommendedDialog();
	}

	/**
	 * Toggles the highlight style for app tiles based on the selection state.
	 * @private
	 * @param {boolean} isAppSelected - Flag indicating whether to add or remove the style class.
	 */
	private toggleAppTileHighlight(isAppSelected: boolean): void {
		const appsScrollContainer = this._generateAppsScrollContainer();
		const appsWrapper = appsScrollContainer.getContent()[0] as GridContainer;
		if (appsWrapper) {
			appsWrapper.getItems().forEach((oTile) => {
				if (oTile) {
					if (isAppSelected) {
						oTile.addStyleClass("sapCuxHighlightApp");
					} else {
						if (oTile.hasStyleClass("sapCuxHighlightApp")) {
							oTile.removeStyleClass("sapCuxHighlightApp");
						}
					}
				}
			});
		}
	}

	/**
	 * Resets the selected apps and updates the UI.
	 * @private
	 */
	private _resetAddRecommendedDialog(): void {
		this._selectedApps = [...this.getApps()];
		this._updateSelectedAppCount();
		this._updateAddButtonState();
	}

	/**
	 * Adds the selected apps to the user's favorites.
	 * @private
	 * @returns {Promise<void>} - A promise that resolves when the apps have been added.
	 */
	private async _addSelectedApps(): Promise<void> {
		this.setBusy(true);
		try {
			for (const app of this._selectedApps) {
				const vizId = app.getVizId?.();
				if (vizId) {
					await this.appManagerInstance.addVisualization(vizId);
				}
			}

			await (this.getParent?.() as AppsContainer)._refreshAllPanels();
			const message = this._i18nBundle.getText("moveRecommendedMessage") as string;
			MessageToast.show(message);
		} catch (error) {
			Log.error(error as string);
		} finally {
			this.setBusy(false);
			this._selectedApps = [];
			this._closeAddRecommendedDialog(`${this.getId()}-addRecommendedDialog-appsPage`);
		}
	}

	/**
	 * Highlights or un-highlights the selected app based on the user's action.
	 * @private
	 * @param {Event} event - The event triggered by the user's action.
	 * @param {App} selectedApp - The selected app to highlight or un-highlight.
	 */
	private _highlightApp(event: Event, selectedApp: App): void {
		const oTile = event.getSource<GenericTile>();
		const bIsSelected = !oTile.hasStyleClass("sapCuxHighlightApp");
		this._selectedApps = this._selectedApps || [];
		if (bIsSelected) {
			this._selectedApps.push(selectedApp);
		} else {
			this._selectedApps.splice(
				this._selectedApps.findIndex((oApp) => selectedApp.getUrl() === oApp.getUrl()),
				1
			);
		}
		oTile.toggleStyleClass("sapCuxHighlightApp", bIsSelected);
		this._updateSelectedAppCount();
		this._updateAddButtonState();
	}

	/**
	 * Updates the count of selected apps displayed in the dialog.
	 * @private
	 */
	private _updateSelectedAppCount(): void {
		const dialogId = `${this.getId()}-addRecommendedDialog-appsPage`;
		const selectedAppsTitle = this._controlMap.get(`${dialogId}-selectedAppsTitle`) as Title;
		const selectedAppsCount = this._selectedApps.length;
		selectedAppsTitle.setText(
			`${this._i18nBundle.getText("recommendedAppsTab")} (${selectedAppsCount} ${this._i18nBundle.getText("selected")})`
		);
	}

	/**
	 * Overrides the wrapper for the apps panel to add message strip.
	 *
	 * @private
	 * @returns {sap.m.VBox} The apps panel wrapper.
	 */
	protected _generateWrapper() {
		const wrapperId = `${this.getId()}-recommendedPanelWrapper`;
		if (!this._controlMap.get(wrapperId)) {
			this._controlMap.set(
				wrapperId,
				new VBox(wrapperId, {
					items: [this._generateMessageStrip(), super._generateWrapper()],
					backgroundDesign: BackgroundDesign.Transparent
				})
			);
		}
		return this._controlMap.get(wrapperId) as VBox;
	}

	/**
	 * Fetch recommended apps and set apps aggregation
	 * @private
	 */
	public async loadApps() {
		if (this.getDeviceType() === DeviceType.Mobile) {
			return; // Do not load recommended apps on mobile devices
		}
		let recommendedVisualizations = await this.appManagerInstance.getRecommendedVisualizations(true);
		this.destroyAggregation("apps", true);
		recommendedVisualizations = recommendedVisualizations.map((visualization, index) => {
			return {
				...visualization,
				menuItems: this._getActions(index)
			};
		});
		//convert apps objects array to apps instances
		const apps = this.generateApps(recommendedVisualizations);
		let tiles: GenericTile[] = [];
		tiles = this.fetchTileVisualization(tiles);
		// calling prepareAppsBeforeLoad fn to filter out the recommended apps from deprecated ones.
		await this.prepareAppsBeforeLoad(apps, tiles);
		this.setApps(apps);
		const addToFavouritesMenuItem = Element.getElementById(`${this.getId()}-addtofavouritesmenuitem`) as MenuItem;
		if (addToFavouritesMenuItem) {
			addToFavouritesMenuItem.setVisible(apps.length > 0);
		}
	}

	/**
	 * Returns message strip for recommended tab
	 * @private
	 * @returns {sap.cux.home.MessageStrip} - Message strip control.
	 */
	private _generateMessageStrip() {
		const messageStripId = `${this.getId()}-messageStrip`;
		if (!this._controlMap.get(messageStripId)) {
			this._controlMap.set(
				messageStripId,
				new MessageStrip(messageStripId, {
					text: this._i18nBundle.getText("recommendationMessageStrip"),
					showIcon: true,
					showCloseButton: true,
					link: new Link(`${messageStripId}-settings`, {
						text: this._i18nBundle.getText("settings"),
						press: () => (this.getParent() as BaseContainer)?._getLayout()?.openSettingsDialog(SETTINGS_PANELS_KEYS.ADVANCED)
					}).addStyleClass("sapUiNoMargin")
				}).addStyleClass("sapUiNoMarginBegin sapUiTinyMarginBottom")
			);
		}
		return this._controlMap.get(messageStripId) as MessageStrip;
	}

	/**
	 * Returns list of actions available for selected app
	 * @private
	 * @returns {sap.cux.home.MenuItem[]} - Array of list items.
	 */
	private _getActions(index?: number): MenuItem[] {
		const addToFavoritesItem = new MenuItem(`${this.getKey()}--addToFavoritesItem--${index}`, {
			title: this._i18nBundle.getText("addToFavorites"),
			icon: "sap-icon://add-favorite",
			press: (event) => {
				void this._addAppToFavorites(event);
			}
		});
		addFESRId(addToFavoritesItem, "acceptRecommendation");
		const notRelevantItem = new MenuItem(`${this.getKey()}--notRelevantItem--${index}`, {
			title: this._i18nBundle.getText("notRelevantRecommendation"),
			icon: "sap-icon://decline",
			press: (event) => {
				void this._rejectRecommendation(event);
			}
		});
		addFESRId(notRelevantItem, "rejectRecommendation");
		const actions = [addToFavoritesItem, notRelevantItem];
		return actions;
	}

	/**
	 * Rejects the selected app as recommendation
	 * @private
	 * @param {sap.ui.base.MenuItem$PressEvent} event - Event object.
	 */
	private async _rejectRecommendation(event: MenuItem$PressEvent) {
		this.setBusy(true);
		try {
			const source = event.getSource<MenuItem>();
			const app = source.getParent() as App;
			const title = app.getTitle();
			const recommendedVisualizations = await this.appManagerInstance.getRecommendedVisualizations();
			const visualization = recommendedVisualizations.find((viz) => viz.url === app.getUrl());
			const fioriId = visualization?.fioriId;
			if (fioriId) {
				const rejectPayload = {
					AppId: fioriId,
					Decision: 1
				};
				await HttpHelper.Post(CONSTANTS.USER_PREFERENCE_SRVC_URL, rejectPayload);
				await this.refresh();
				const message = this._i18nBundle.getText("rejectRecommendationMsg", [title]) as string;
				MessageToast.show(message);
			}
		} catch (error) {
			Log.error(error as string);
		} finally {
			this.setBusy(false);
		}
	}

	/**
	 * Checks if recommendation is enabled based on recommendation feature toggle and user personalization.
	 * @private
	 * @returns {Boolean} - Returns true if recommendation is enabled otherwise false.
	 */
	private async _isRecommendationEnabled() {
		const personalisation = await this.getPersonalization();
		return personalisation?.showRecommendation ?? true;
	}

	/**
	 * Show recommendation tab if recommendation is enabled
	 * @private
	 */
	public async _enableRecommendationTab() {
		const isSupported = await this._isRecommendationEnabled();
		this.setSupported(isSupported);
		this.fireSupported({ isSupported });
	}

	/**
	 * Generates illustrated message for recommended apps panel.
	 * @private
	 * @override
	 * @returns {sap.m.IllustratedMessage} Illustrated error message.
	 */
	protected generateIllustratedMessage() {
		const illustratedMessage = super.generateIllustratedMessage();
		//overrride the default illustrated message, title, description and add additional content
		illustratedMessage.setIllustrationSize(IllustratedMessageSize.ExtraSmall);
		illustratedMessage.setIllustrationType(IllustratedMessageType.NoData);
		illustratedMessage.setTitle(this._i18nBundle.getText("noRecommendationsTitle"));
		illustratedMessage.setDescription(this._i18nBundle.getText("noRecommendationsDescription"));
		illustratedMessage.addAdditionalContent(
			new Button({
				text: this._i18nBundle.getText("settings"),
				tooltip: this._i18nBundle.getText("settings"),
				press: () => (this.getParent() as BaseContainer)?._getLayout()?.openSettingsDialog(SETTINGS_PANELS_KEYS.ADVANCED),
				type: "Emphasized"
			})
		);
		illustratedMessage.addStyleClass("sapUiTinyMarginTop");
		return illustratedMessage;
	}
}
