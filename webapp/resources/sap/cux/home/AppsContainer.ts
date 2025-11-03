/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */

import Log from "sap/base/Log";
import GridContainer from "sap/f/GridContainer";
import GenericTile from "sap/m/GenericTile";
import HeaderContainer from "sap/m/HeaderContainer";
import IconTabBar, { IconTabBar$SelectEvent } from "sap/m/IconTabBar";
import IconTabFilter from "sap/m/IconTabFilter";
import Panel from "sap/m/Panel";
import VBox from "sap/m/VBox";
import { BackgroundDesign, FrameType, GenericTileMode, GenericTileScope, LoadState, TileSizeBehavior } from "sap/m/library";
import Event from "sap/ui/base/Event";
import type { MetadataOptions } from "sap/ui/core/Element";
import EventBus from "sap/ui/core/EventBus";
import Parameters from "sap/ui/core/theming/Parameters";
import S4MyHome from "sap/ushell/api/S4MyHome";
import App from "./App";
import { $AppsContainerSettings } from "./AppsContainer";
import BaseApp from "./BaseApp";
import BaseAppPanel, { BaseAppPanel$SupportedEvent } from "./BaseAppPanel";
import BaseAppPersPanel from "./BaseAppPersPanel";
import BaseContainer from "./BaseContainer";
import Group from "./Group";
import MenuItem from "./MenuItem";
import RecommendedAppPanel from "./RecommendedAppPanel";
import { ICustomVisualization } from "./interface/AppsInterface";
import { getLeanURL } from "./utils/DataFormatUtils";
import { calculateCardWidth, DeviceType, fetchElementProperties } from "./utils/Device";
import { getAppsPlaceholder } from "./utils/placeholder/AppsPlaceholder";

const getDefaultAppColor = () => {
	const sLegendName = "sapLegendColor9";
	return {
		key: sLegendName,
		value: Parameters.get({
			name: sLegendName
		}),
		assigned: false
	};
};

const CONSTANTS = {
	PLACEHOLDER_ITEMS_COUNT: 5,
	MIN_TILE_WIDTH: 304,
	MAX_TILE_WIDTH: 456
};

/**
 *
 * Container class for managing and storing apps.
 *
 * @extends BaseContainer
 *
 * @author SAP SE
 * @version 0.0.1
 * @since 1.121
 *
 * @private
 * @ui5-restricted ux.eng.s4producthomes1
 *
 * @alias sap.cux.home.AppsContainer
 */
export default class AppsContainer extends BaseContainer {
	private _isInitialRender = true;
	private _appSwitched!: boolean;
	static readonly renderer = {
		...BaseContainer.renderer,
		apiVersion: 2
	};
	static readonly metadata: MetadataOptions = {
		events: {
			/**
			 * Event is fired when apps are loaded.
			 */
			appsLoaded: {
				parameters: {
					apps: { type: "sap.cux.home.App[]" },
					tiles: { type: "sap.m.GenericTile[]" }
				}
			}
		}
	};

	constructor(idOrSettings?: string | $AppsContainerSettings);
	constructor(id?: string, settings?: $AppsContainerSettings);
	/**
	 * Constructor for a new app container.
	 *
	 * @param {string} [id] ID for the new control, generated automatically if an ID is not provided
	 * @param {object} [settings] Initial settings for the new control
	 */
	public constructor(id?: string, settings?: $AppsContainerSettings) {
		super(id, settings);
	}

	/**
	 * Init lifecycle method
	 *
	 * @private
	 * @override
	 */
	public init(): void {
		super.init();
		this.setProperty("title", this._i18nBundle?.getText("appsTitle"));
		// Subscribe to recommendation setting change event
		const eventBus = EventBus.getInstance();
		eventBus.subscribe("importChannel", "recommendationSettingChanged", (channelId?: string, eventId?: string, data?: object) => {
			const showRecommendation = (data as { showRecommendation: boolean }).showRecommendation;
			if (!showRecommendation) {
				const firstAppsPanel = this.getContent()?.[0];
				this.setProperty("selectedKey", firstAppsPanel?.getProperty("key"));
			}
		});

		// disable lazy load for apps container as it's the hero element
		this.setProperty("enableLazyLoad", false);
		this.addStyleClass("sapCuxAppsContainer");
		this.addCustomSetting("text", this._i18nBundle.getText("myAppMsg") as string);
		this._attachRouteChangeEvent();
	}

	/**
	 * Attaches an event handler to monitor route changes and manage application state accordingly.
	 * @private
	 *
	 * @returns {void}
	 */

	private _attachRouteChangeEvent(): void {
		const handleRouteChange = async (event: Event<{ isMyHomeRoute: boolean }>) => {
			const show = event.getParameter("isMyHomeRoute");
			if (show) {
				if (this._appSwitched) {
					this._appSwitched = false;
					this.showPersistedDialog();
					await this.load();
				}
			} else {
				this._setPanelsDirty();
				this._appSwitched = true;
			}
		};

		try {
			S4MyHome.attachRouteMatched({}, handleRouteChange, this);
		} catch (error) {
			Log.warning("Unable to attach route change handler", error instanceof Error ? error.message : String(error));
		}
	}

	/**
	 * onBeforeRendering lifecycle method
	 *
	 * @private
	 * @override
	 */
	public onBeforeRendering() {
		if (this._isInitialRender) {
			this._isInitialRender = false;
			this._attachPanelSupportedEvent();
		}

		this.adjustLayout();
		super.onBeforeRendering();
		this._removeUnsupportedPanels();
	}

	/**
	 * onAfterRendering lifecycle method
	 *
	 * @private
	 * @override
	 */
	public async onAfterRendering() {
		super.onAfterRendering();
		// activating the recommendation tab from appsContainer as personalization data in not available on init of panel.
		await this._activateRecommendationTabPanel();
	}

	/**
	 * Loads the AppsContainer section.
	 * Overrides the load method of the BaseContainer.
	 *
	 * @private
	 * @async
	 * @override
	 */
	public async load(): Promise<void> {
		const selectedPanels = this.getPanels();
		await Promise.all(selectedPanels.map((selectedPanel) => this._setApps(selectedPanel)));
	}

	/**
	 * Retrieves the relevant panels based on the device type.
	 *
	 * @private
	 * @returns {BaseAppPanel[]} An array of panels based on the device type.
	 */
	private getPanels(): BaseAppPanel[] {
		const isPhone = this.getDeviceType() === DeviceType.Mobile;
		return (isPhone ? this.getContent() : [this._getSelectedPanel()]) as BaseAppPanel[];
	}

	/**
	 * Triggers navigation actions for the currently relevant panels.
	 *
	 * @private
	 * @returns {void}
	 */

	private showPersistedDialog(): void {
		const selectedPanels = this.getPanels();
		for (const selectedPanel of selectedPanels) {
			selectedPanel.firePersistDialog();
		}
	}

	/**
	 * Set all panels dirty state to true, to refresh all panels
	 * @private
	 */
	private _setPanelsDirty(): void {
		const panels = this.getContent() as BaseAppPanel[];
		for (const panel of panels) {
			panel.setDesktopViewDirty(true);
			panel.setMobileViewDirty(true);
		}
	}

	/**
	 * Generate placeholer for the panel.
	 * @private
	 * @param {BaseAppPanel} panel - Panel for which placeholders has to be generated.
	 */
	private _generatePlaceholder(panel: BaseAppPanel): void {
		if (!panel.isLoaded()) {
			panel.destroyAggregation("apps", true);
			const placeholderApps = panel.generateApps(
				new Array(CONSTANTS.PLACEHOLDER_ITEMS_COUNT).fill({ status: "Loading" }) as ICustomVisualization[]
			);
			panel.setApps(placeholderApps);
			this._updatePanelContent(panel);
		}
	}

	/**
	 * Loads and sets the apps.
	 * @private
	 * @param {BaseAppPanel} panel - Panel for which apps has to be loaded.
	 * @returns {Promise<void>} resolves when apps are loaded.
	 */
	private async _setApps(panel: BaseAppPanel): Promise<void> {
		try {
			// only load the apps if panel is in dirty state
			if (panel.isDirty() && panel.isMobileDirty()) {
				this._generatePlaceholder(panel);
				await panel.loadApps?.();
				if (this.getDeviceType() === DeviceType.Mobile) {
					panel.setMobileViewDirty(false);
				} else {
					panel.setDesktopViewDirty(false);
				}
				panel.setLoaded(true);
				this._updatePanelContent(panel);

				if (panel instanceof BaseAppPersPanel) {
					// don't wait for personalization to complete
					void panel.applyPersonalization(true);
				}
				let tiles: GenericTile[] = [];
				let apps = panel.getApps();
				tiles = panel.fetchTileVisualization(tiles);
				this.fireEvent("appsLoaded", { apps, tiles });
			}

			// fire panel loaded event
			panel.fireEvent("loaded");
		} catch (error: unknown) {
			this.showErrorCard(panel);
			Log.error(`Error setting apps for panel: ${panel.getTitle()}`, error instanceof Error ? error.message : String(error));
		}
	}

	/**
	 * Updates the content of the panel by replacing existing items with new apps and groups.
	 * This method selects the appropriate wrapper based on the device type, and add apps/group or mobile cards to the wrapper.
	 *
	 * @param {BaseAppPanel} panel - The panel whose content needs to be updated.
	 * @returns {void}
	 * @private
	 */
	private _updatePanelContent(panel: BaseAppPanel): void {
		const apps = panel.getApps() || [];
		const groups = (panel.getAggregation("groups") || []) as Group[];
		const isPhone = this.getDeviceType() === DeviceType.Mobile;
		const wrapper = isPhone ? panel._generateMobileAppsWrapper() : panel._generateAppsWrapper();
		const aggregationName = isPhone ? "content" : "items";
		wrapper.destroyAggregation(aggregationName);
		let items = isPhone ? this._generateMobileCards([...groups, ...apps], panel.getId()) : this._generateTiles([...groups, ...apps]);
		this._addWrapperContent(wrapper, items, aggregationName);
		this._updatePanelContentVisibility(panel);
	}

	/**
	 * Updates the visibility of the panel's content based on the current state and device type.
	 * This method determines whether to display the apps or an error message based on the presence of apps and groups.
	 * It also adjusts the visibility of different containers depending on whether the device is a phone or not.
	 *
	 * @param {BaseAppPanel} panel - The panel whose content visibility needs to be updated.
	 * @returns {void}
	 * @private
	 */
	private _updatePanelContentVisibility(panel: BaseAppPanel): void {
		const apps = panel.getApps() || [];
		const groups = (panel.getAggregation("groups") || []) as Group[];
		const isPhone = this.getDeviceType() === DeviceType.Mobile;
		const appsWrapper = panel._generateDesktopAppsWrapper();
		const mobileAppsWrapper = panel._generateMobileAppsWrapper();
		const errorCard = panel._generateErrorMessage();
		const hasApps = [...apps, ...groups].length !== 0;
		appsWrapper.setVisible(hasApps && !isPhone);
		mobileAppsWrapper.setVisible(hasApps && isPhone);
		(mobileAppsWrapper.getParent() as VBox).setWidth(isPhone && hasApps ? "100%" : "auto");
		errorCard.setVisible(!hasApps);
	}

	/**
	 * Generates generic tile based on app.
	 * @private
	 * @param {sap.cux.home.App} app - App.
	 * @returns {sap.m.GenericTile}.
	 */
	public _getAppTile(app: App): GenericTile {
		const isPhone = this.getDeviceType() === DeviceType.Mobile;
		const actions = (app.getAggregation("menuItems") || []) as MenuItem[];
		const tileId = isPhone ? `${app.getId()}-mobile-tile` : `${app.getId()}-tile`;
		return new GenericTile(tileId, {
			scope: actions.length && !isPhone ? GenericTileScope.ActionMore : GenericTileScope.Display,
			state: app.getStatus() as LoadState,
			mode: GenericTileMode.IconMode,
			sizeBehavior: TileSizeBehavior.Small,
			header: app.getTitle(),
			backgroundColor: app.getBgColor() || getDefaultAppColor()?.key,
			tileIcon: app.getIcon(),
			url: getLeanURL(app.getUrl()),
			frameType: FrameType.TwoByHalf,
			renderOnThemeChange: true,
			dropAreaOffset: 4,
			subheader: app.getSubTitle(),
			press: (e) => app._onPress(e),
			width: isPhone ? "15rem" : "100%"
		}).addStyleClass("tileLayout sapMGTTwoByHalf");
	}

	/**
	 * Generates generic tile based on group.
	 * @private
	 * @param {sap.cux.home.Group} group - Group.
	 * @returns {sap.m.GenericTile}.
	 */
	private _getGroupTile(group: Group): GenericTile {
		const isPhone = this.getDeviceType() === DeviceType.Mobile;
		const actions = (group.getAggregation("menuItems") || []) as MenuItem[];
		const tileId = isPhone ? `${group.getId()}-mobile-tile` : `${group.getId()}-tile`;
		return new GenericTile(tileId, {
			scope: actions.length && !isPhone ? GenericTileScope.ActionMore : GenericTileScope.Display,
			state: group.getStatus() as LoadState,
			mode: GenericTileMode.IconMode,
			sizeBehavior: TileSizeBehavior.Small,
			header: group.getTitle(),
			backgroundColor: group.getBgColor() || getDefaultAppColor()?.key,
			tileIcon: group.getIcon(),
			frameType: FrameType.TwoByHalf,
			renderOnThemeChange: true,
			dropAreaOffset: 4,
			tileBadge: group.getNumber(),
			press: (e) => group._onPress(e),
			width: isPhone ? "15rem" : "100%"
		})
			.addStyleClass("tileLayout sapMGTTwoByHalf")
			.data("groupId", group.getGroupId()) as GenericTile;
	}

	/**
	 * Overridden method for selection of panel in the IconTabBar.
	 * Loads the apps in selected panel
	 * @private
	 * @returns {Promise<void>} resolves when apps are loaded on panel selection.
	 */
	protected async _onPanelSelect(event: IconTabBar$SelectEvent) {
		super._onPanelSelect(event);
		const selectedPanel = this._getSelectedPanel() as BaseAppPanel;
		await this._setApps(selectedPanel);
	}

	/**
	 * Refresh apps for all the panels.
	 * @private
	 * @returns {Promise<void>} resolves when all panels are set to dirty and apps for current panel are refreshed.
	 */
	public async _refreshAllPanels(): Promise<void> {
		//set all panels to dirty
		this._setPanelsDirty();
		//set apps for current section
		await this._setApps(this._getSelectedPanel() as BaseAppPanel);
	}

	/**
	 * Refresh apps for selected panel.
	 * @private
	 * @param {BaseAppPanel} panel - Panel that has be refreshed.
	 * @returns {Promise<void>} resolves when apps are refreshed.
	 */
	public async refreshPanel(panel: BaseAppPanel): Promise<void> {
		panel.setMobileViewDirty(true);
		panel.setDesktopViewDirty(true);
		await this._setApps(panel);
	}

	/**
	 * Toggles the visibility of the tab view based on the supported panels.
	 * @private
	 */
	private _toggleTabView() {
		if (this.getDeviceType() !== DeviceType.Mobile) {
			const panels = this.getContent() as BaseAppPanel[];
			const supportedPanels = panels.filter((panel) => panel.isSupported());
			const iconTabBarControl = this._getInnerControl() as IconTabBar;
			iconTabBarControl?.toggleStyleClass("sapUiITBHide", supportedPanels.length === 1);
		}
	}

	/**
	 * Handles the supported state of the current panel.
	 * If the panel is supported, it adds the panel to the content.
	 * If the panel is not supported, it removes the panel from the content.
	 * @param {BaseAppPanel} currentPanel - The panel to handle the supported state for.
	 * @private
	 */
	private _onPanelSupported(currentPanel: BaseAppPanel, event: BaseAppPanel$SupportedEvent) {
		const isSupported = event.getParameter("isSupported") as boolean;
		currentPanel.setSupported(isSupported);
		this._togglePanelVisibility(currentPanel, isSupported);
		this._toggleTabView();
	}

	/**
	 * Toggles the visibility of the panel.
	 * @param {BaseAppPanel} panel - The panel to toggle the visibility for.
	 * @param {boolean} isVisible - The visibility state of the panel.
	 * @private
	 */
	private _togglePanelVisibility(panel: BaseAppPanel, isVisible: boolean) {
		const iconTabBar = this._getInnerControl() as IconTabBar;
		const tabs = (iconTabBar?.getItems() as IconTabFilter[]) || [];
		const selectedTab = tabs.find((tab) => tab.getKey() === panel.getKey());
		selectedTab?.setVisible(isVisible);
	}

	/**
	 * Removes unsupported panels from the container.
	 * @private
	 */
	private _removeUnsupportedPanels() {
		const panels = this.getContent() as BaseAppPanel[];
		const unSupportedPanels = panels.filter((panel) => !panel.isSupported());
		for (const panel of unSupportedPanels) {
			this._togglePanelVisibility(panel, false);
		}
		this._toggleTabView();
	}

	/**
	 * Attaches an event handler to the "supported" event for each panel in the container.
	 * @private
	 */
	private _attachPanelSupportedEvent() {
		const panels = this.getContent() as BaseAppPanel[];
		for (const panel of panels) {
			if (!panel.hasListeners("supported")) {
				panel.attachSupported(this._onPanelSupported.bind(this, panel));
			}
		}
	}

	/**
	 * Calls the enable function to activate the recommendation tab for `RecommendedAppPanel`, unless the device is a mobile phone.
	 *
	 * @private
	 */
	private async _activateRecommendationTabPanel(): Promise<void> {
		const panels = this.getContent() as BaseAppPanel[];
		const isPhone = this.getDeviceType() === DeviceType.Mobile;
		const recommendedPanel = panels ? panels.find((panel) => panel instanceof RecommendedAppPanel) : null;
		if (recommendedPanel instanceof RecommendedAppPanel && !isPhone) {
			await recommendedPanel._enableRecommendationTab();
		} else {
			recommendedPanel?.setSupported(false);
		}
	}

	public setTileWidth(panel: BaseAppPanel): void {
		const minWidth = CONSTANTS.MIN_TILE_WIDTH; // in px
		const maxWidth = CONSTANTS.MAX_TILE_WIDTH; // in px

		const wrapper = panel._generateAppsWrapper()?.getDomRef() as Element;
		if (!wrapper) return;

		const domProperties = fetchElementProperties(wrapper, ["width", "padding-left", "padding-right", "margin-left", "margin-right"]);
		const availableWidth = Object.values(domProperties)
			.slice(1)
			.reduce((width, propertyValue) => width - propertyValue, domProperties["width"]);

		const apps = panel.getApps() || [];
		const groups = (panel.getAggregation("groups") || []) as Group[];
		const tileCount = apps.length + groups.length;

		if (tileCount === 0 || availableWidth <= 0) return;

		const cardLayoutConfig = {
			containerWidth: availableWidth,
			totalCards: tileCount,
			minWidth: minWidth,
			maxWidth: maxWidth,
			gap: 8,
			skipDeviceCheck: true
		};

		const clampedWidth = calculateCardWidth(cardLayoutConfig);

		panel.setProperty("tileWidth", clampedWidth);
		panel
			._generateAppsWrapper()
			.getLayout()
			.setProperty("columnSize", `${clampedWidth / 16}rem`);
	}

	/**
	 * Adjusts the layout and visibility based on the device type.
	 *
	 * This method adjusts the layout type and visibility of containers based on whether the device is a phone
	 * or not. It sets the container's layout property, toggles visibility of panels and their containers, and
	 * adjusts background design accordingly.
	 *
	 * @private
	 * @returns {void}
	 */
	public adjustLayout(): void {
		const isPhone = this.getDeviceType() === DeviceType.Mobile;
		const selectedPanel = this._getSelectedPanel() as BaseAppPanel;
		this.setTileWidth(selectedPanel);

		//hide actions if the device is a phone
		this.toggleActionButtons(!isPhone);

		const panels = this.getContent() as BaseAppPanel[];
		panels.forEach((panel) => {
			//if both the panels are dirty, then updated data will be loaded from onBeforeRendering, as layout change will trigger re-rendering
			//if both the panels are not dirty, i.e. doen't have any changes, then just toggle the visibility
			if (!panel.isDirty() && !panel.isMobileDirty()) {
				this._updatePanelContentVisibility(panel);
			} else if (panel.isDirty() !== panel.isMobileDirty()) {
				//if one of the panels is dirty i.e. have updated data and other is not, then re-create the inner controls
				if (isPhone) {
					panel.setMobileViewDirty(false);
				} else {
					panel.setDesktopViewDirty(false);
				}
				this._updatePanelContent(panel);
			}
		});

		//this is to handle scenario when unsupported propert is changed and then layout is changed.
		this._removeUnsupportedPanels();
	}

	/**
	 * Generates mobile card panel and add given apps/groups in the panel.
	 *
	 * @private
	 * @param {BaseApp[]} items - Apps/Groups for which card panels has to be generated.
	 * @param {string} currentPanelId - ID of the current panel.
	 * @returns {sap.m.Panel} The newly created mobile card panel.
	 */
	private _generateMobileCards(items: BaseApp[], currentPanelId?: string): Panel[] {
		const panels: Panel[] = [];
		for (let i = 0; i < items.length; i += 7) {
			const panelItems = items.slice(i, i + 7);
			const panel = new Panel(`${currentPanelId}--${i}`, {
				backgroundDesign: BackgroundDesign.Solid,
				height: "23.5rem",
				width: "17rem",
				content: this._generateTiles(panelItems)
			}).addStyleClass("sapUiMobileAppsCard appPanelBorder myAppMFBContent");
			panels.push(panel);
		}
		return panels;
	}

	/**
	 * Generates group/app generic tiles for given apps/groups.
	 *
	 * @private
	 * @param {BaseApp[]} items - Apps/Groups for which tiles has to be generated.
	 * @returns {sap.m.GenericTile[]} The generated tiles.
	 */
	private _generateTiles(items: BaseApp[]): GenericTile[] {
		return items.map((item) => (item instanceof Group ? this._getGroupTile(item) : this._getAppTile(item as App)));
	}

	/**
	 * Adds given items into the wrapper.
	 * @param {HeaderContainer | GridContainer} wrapper - wrapper for which items has to be added.
	 * @param {Panel[] | GenericTile[]} items - items to be added.
	 * @param {string} aggregationName - aggregation name to which items has to be added.
	 * @private
	 */
	private _addWrapperContent(wrapper: HeaderContainer | GridContainer, items: Panel[] | GenericTile[], aggregationName: string) {
		wrapper.destroyAggregation(aggregationName);
		items.forEach((item) => {
			wrapper.addAggregation(aggregationName, item);
		});
	}

	/**
	 * Displays an error card in the provided panel.
	 *
	 * @param panel - The panel in which the error card should be displayed.
	 */
	private showErrorCard(panel: BaseAppPanel): void {
		const errorCard = panel._generateErrorMessage();
		const appsWrapper = panel._generateDesktopAppsWrapper();
		const mobileAppsWrapper = panel._generateMobileAppsWrapper();
		appsWrapper?.setVisible(false);
		mobileAppsWrapper?.setVisible(false);
		errorCard?.setVisible(true);
	}

	/**
	 * Retrieves the generic placeholder content for the Apps container.
	 *
	 * @returns {string} The HTML string representing the Apps container's placeholder content.
	 */
	protected getGenericPlaceholderContent(): string {
		return getAppsPlaceholder();
	}
}
