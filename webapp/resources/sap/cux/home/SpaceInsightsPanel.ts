/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */

import Log from "sap/base/Log";
import GridContainer from "sap/f/GridContainer";
import GridContainerItemLayoutData from "sap/f/GridContainerItemLayoutData";
import Button from "sap/m/Button";
import GenericTile from "sap/m/GenericTile";
import HeaderContainer from "sap/m/HeaderContainer";
import VBox from "sap/m/VBox";
import { LoadState } from "sap/m/library";
import Event from "sap/ui/base/Event";
import ManagedObject from "sap/ui/base/ManagedObject";
import Control from "sap/ui/core/Control";
import type { MetadataOptions } from "sap/ui/core/Element";
import UI5Element from "sap/ui/core/Element";
import Lib from "sap/ui/core/Lib";
import Context from "sap/ui/model/Context";
import JSONModel from "sap/ui/model/json/JSONModel";
import Container from "sap/ushell/Container";
import S4MyHome from "sap/ushell/api/S4MyHome";
import VisualizationInstantiation from "sap/ushell/services/VisualizationInstantiation";
import BasePanel from "./BasePanel";
import InsightsContainer from "./InsightsContainer";
import MenuItem from "./MenuItem";
import { $SpaceInsightsPanelSettings } from "./SpaceInsightsPanel";
import { ICustomVisualization, ISectionAndVisualization } from "./interface/AppsInterface";
import { ISpace } from "./interface/PageSpaceInterface";
import AppManager from "./utils/AppManager";
import { filterVisualizations, getPageManagerInstance } from "./utils/CommonUtils";
import { recycleId } from "./utils/DataFormatUtils";
import { DeviceType, fetchElementProperties } from "./utils/Device";
import { createShowMoreActionButton, createShowMoreMenuItem, getAssociatedFullScreenMenuItem } from "./utils/InsightsUtils";
import PageManager from "./utils/PageManager";

export enum tilesMenuItems {
	REFRESH = "tiles-refresh",
	ADD_APPS = "tiles-addSmartApps",
	EDIT_TILES = "tiles-editTiles"
}

export enum tilesContainerMenuItems {
	REFRESH = "container-tiles-refresh",
	ADD_APPS = "container-tiles-addSmartApps",
	EDIT_TILES = "container-tiles-editTiles",
	SHOW_MORE = "tilesContainerFullScreenMenuItem"
}

export enum tilesActionButtons {
	ADD_TILES = "tiles-addTilesButton"
}

export enum tilesContainerActionButtons {
	ADD_TILES = "container-tiles-addTilesButton",
	SHOW_MORE = "tilesContanerFullScreenActionButton"
}

export enum DisplayFormat {
	Standard = "standard",
	StandardWide = "standardWide"
}

const StandardTileWidth = 176;
const StandardWideTileWidth = 368;
const Gap = 16;

/**
 *
 * Tiles Panel class for managing and storing Space Insights Tiles.
 *
 * @extends sap.cux.home.BasePanel
 *
 * @author SAP SE
 * @version 0.0.1
 *
 * @private
 * @ui5-experimental-since 1.138.0
 * @ui5-restricted ux.eng.s4producthomes1
 *
 * @alias sap.cux.home.SpaceInsightsPanel
 */

export default class SpaceInsightsPanel extends BasePanel {
	constructor(idOrSettings?: string | $SpaceInsightsPanelSettings);
	constructor(id?: string, settings?: $SpaceInsightsPanelSettings);
	/**
	 * Constructor for a new Tiles Panel.
	 *
	 * @param {string} [id] ID for the new control, generated automatically if an ID is not provided
	 * @param {object} [settings] Initial settings for the new control
	 */
	public constructor(id?: string, settings?: $SpaceInsightsPanelSettings) {
		super(id, settings);
	}
	private _oData!: Record<string, unknown>;
	private appManagerInstance!: AppManager;
	private VizInstantiationService!: VisualizationInstantiation;
	private tilesContainer!: GridContainer;
	private tilesMobileContainer!: HeaderContainer;
	private _tilesWrapper!: VBox;
	private aInsightsApps!: ICustomVisualization[] | GenericTile[];
	private _controlModel!: JSONModel;
	public _controlMap!: Map<string, Control | Element | UI5Element>;
	private _containerMenuItems!: MenuItem[];
	private _containerActionButtons!: Button[];
	private insightsContainer!: InsightsContainer;
	private _appSwitched!: boolean;
	private _headerVisible: boolean = false;
	private pageManager!: PageManager;
	private allSpaces!: ISpace[];
	private spaceTitle!: string | undefined;
	static readonly metadata: MetadataOptions = {
		library: "sap.cux.home",
		properties: {
			/**
			 * Specifies the space whose apps should be loaded.
			 */
			spaceId: { type: "string", group: "Data", defaultValue: "" },
			/**
			 * Title for the tiles panel
			 */
			title: { type: "string", group: "Misc", defaultValue: "" },
			/**
			 * The name of the URL parameter used to expand the container into full-screen mode.
			 */
			fullScreenName: { type: "string", group: "Misc", defaultValue: "SI3", visibility: "hidden" }
		},
		defaultAggregation: "tiles",
		aggregations: {
			/**
			 * Specifies the content aggregation of the panel.
			 */
			content: { multiple: true, singularName: "content", visibility: "hidden" },
			/**
			 * Aggregation of tiles available within the tiles Panel
			 */
			tiles: { type: "sap.cux.home.App", multiple: true, singularName: "tile", visibility: "hidden" }
		},
		events: {
			handleHidePanel: {
				parameters: {}
			},
			handleUnhidePanel: {
				parameters: {}
			}
		}
	};

	/**
	 * Initializes the Tiles Panel.
	 *
	 * @private
	 * @override
	 */
	init() {
		super.init();
		this._controlMap = new Map();
		//Initialise Tiles Model
		this._oData = {
			tiles: [] as ICustomVisualization[],
			activateInsightsTiles: true,
			activateInsightsTilesOnPhone: false,
			activateInsightsTilesOnDesktop: false
		};
		this._controlModel = new JSONModel(this._oData);
		this.appManagerInstance = AppManager.getInstance();
		this.pageManager = getPageManagerInstance(this);
		this.setProperty("enableFullScreen", true);

		this._createTilesFlexWrapper();
		Container.getServiceAsync<VisualizationInstantiation>("VisualizationInstantiation")
			.then((VizInstantiationService) => {
				this.VizInstantiationService = VizInstantiationService;
			})
			.catch((error) => {
				Log.error(error instanceof Error ? error.message : String(error));
			});

		// Toggles the activity of tiles
		this._toggleTileActivity();
	}

	public setTitle(title: string) {
		if (!this.spaceTitle) this.spaceTitle = title;
		return this.setProperty("title", title);
	}

	public getTitle(): string {
		if (this.spaceTitle) return this.spaceTitle;
		return this.getProperty("title") as string;
	}

	/**
	 * Toggles the activity of tiles on route change.
	 *
	 * @private
	 * @returns {void}
	 */
	private _toggleTileActivity(): void {
		const toggleUserActions = async (event: Event<{ isMyHomeRoute: boolean }>) => {
			const show = event.getParameter("isMyHomeRoute");
			this._controlModel.setProperty("/activateInsightsTiles", show);
			if (show) {
				if (this._appSwitched) {
					await this.refreshData(true);
					this._appSwitched = false;
				}
			} else {
				this._appSwitched = true;
			}
		};

		try {
			S4MyHome.attachRouteMatched({}, toggleUserActions, this);
		} catch (error) {
			Log.warning(error instanceof Error ? error.message : String(error));
		}
	}

	/**
	 * Displays placeholder tiles while loading.
	 *
	 * @private
	 * @returns {void}
	 */
	private _showPlaceHolders() {
		const placeholderArray = new Array(this._calculatePlaceholderTileCount()).fill(LoadState.Loading) as LoadState[];
		this.aInsightsApps = placeholderArray.map((tileState: LoadState, index: number) => {
			return new GenericTile(recycleId(`${this.getId()}--placeHolderTile--${index}`), {
				sizeBehavior: "Responsive",
				state: tileState,
				frameType: "OneByOne",
				mode: "IconMode",
				visible: true,
				renderOnThemeChange: true,
				ariaRole: "listitem",
				dropAreaOffset: 8
			}).setLayoutData?.(
				new GridContainerItemLayoutData(recycleId(`${this.getId()}--placeHolderTileLayoutData--${index}`), {
					columns: 2
				})
			);
		});
		this._controlModel.setProperty("/tiles", this.aInsightsApps);
	}

	/**
	 * Clears the placeholder tiles.
	 *
	 * @private
	 * @returns {void}
	 */
	private _clearPlaceHolders() {
		this._controlModel.setProperty("/tiles", []);
	}

	/**
	 * Renders the panel.
	 *
	 * @private
	 * @returns {Promise<void>} A promise that resolves when the panel is rendered.
	 */
	public async renderPanel(): Promise<void> {
		try {
			return await this.refreshData();
		} catch (error) {
			console.error(error);
			this.fireHandleHidePanel();
		} finally {
			this.fireEvent("loaded");
		}
		return Promise.resolve();
	}

	private async fetchDynamicAppInSpace(): Promise<ICustomVisualization[]> {
		const spaceId = this.getProperty("spaceId") as string;
		this.allSpaces = this.allSpaces || (await this.pageManager.fetchAllAvailableSpaces());
		const space = this.allSpaces.find((space) => space.id === spaceId);

		if (!space || space.children.length === 0) return [];
		let allVisualizations: ISectionAndVisualization[] = [];

		if (space && space.children.length > 0) {
			for (const child of space.children) {
				const visualizations = await this.appManagerInstance.fetchFavVizs(true, true, child.id);
				allVisualizations.push(...visualizations);
			}
		}

		//Filter out dynamic tiles
		allVisualizations = filterVisualizations(allVisualizations, true);

		//filter out duplicate visualizations
		allVisualizations = this.appManagerInstance._filterDuplicateVizs(allVisualizations, false);

		return allVisualizations;
	}

	/**
	 * Refreshes the data in the panel.
	 *
	 * @private
	 * @param {boolean} [refreshTiles=false] - Whether to refresh the tiles.
	 * @returns {Promise<void>} A promise that resolves when the data is refreshed.
	 */
	public async refreshData(refreshTiles: boolean = false) {
		const panelName = this.getMetadata().getName();
		this.aInsightsApps = await this.fetchDynamicAppInSpace();
		const bIsSmartBusinessTilePresent = this.aInsightsApps.some((oApp) => oApp.isSmartBusinessTile);
		if (bIsSmartBusinessTilePresent) {
			await Lib.load({ name: "sap.cloudfnd.smartbusiness.lib.reusetiles" });
		}
		this._clearPlaceHolders();
		this._controlModel.setProperty("/tiles", this.aInsightsApps);
		if (this.aInsightsApps?.length) {
			this.fireHandleUnhidePanel();
			if (refreshTiles) {
				const isMobile = this.getDeviceType() === DeviceType.Mobile;
				const container = isMobile ? this.tilesMobileContainer : this.tilesContainer;
				const sDefaultAggreName = container.getMetadata().getDefaultAggregationName();
				const dynamicTiles = (container.getAggregation(sDefaultAggreName) as ManagedObject[]) || [];
				dynamicTiles.forEach((tiles) => (tiles as ICustomVisualization).refresh?.());
			}
			this._getInsightsContainer().updatePanelsItemCount(this.aInsightsApps.length, panelName);
			if (this._headerVisible) {
				this.setProperty("title", `${this.spaceTitle} (${this.aInsightsApps.length})`);
			}
		} else {
			this.fireHandleHidePanel();
		}
	}

	/**
	 * Generates the wrapper for the tiles container, if it doesn't already exist
	 *
	 * @private
	 * @override
	 * @returns {sap.m.VBox} The tiles Vbox wrapper.
	 */
	private _createTilesFlexWrapper() {
		if (!this._tilesWrapper) {
			this._tilesWrapper = new VBox(`${this.getId()}-tilesWrapper`, {
				renderType: "Bare",
				width: "100%",
				items: [this._createMobileFlexWrapper(), this._createWrapperFlexBox()]
			});
			this._showPlaceHolders();
			this._tilesWrapper.setModel(this._controlModel);
			this.addContent(this._tilesWrapper);
		}
	}

	/**
	 * Generates wrapper for displaying tiles in mobile mode.
	 * @private
	 * @returns {sap.m.HeaderContainer} The generated tiles wrapper.
	 */

	private _createMobileFlexWrapper(): HeaderContainer {
		// Check if the mobile container already exists
		if (!this.tilesMobileContainer) {
			// Create the HeaderContainer with required properties
			this.tilesMobileContainer = new HeaderContainer(`${this.getId()}-insightsTilesMobileContainer`, {
				scrollStep: 0,
				scrollStepByItem: 1,
				gridLayout: true,
				scrollTime: 1000,
				showDividers: false,
				visible: "{/isPhone}"
			}).addStyleClass("sectionMarginTopTilesInsight sapMHeaderContainerMarginBottom");

			// Attach aggregation to the container
			this._attachAggregationToContainer(this.tilesMobileContainer);
		}
		// Return the existing or newly created container
		return this.tilesMobileContainer;
	}

	/**
	 * Generates app wrapper (GridContainer) for displaying tiles.
	 * @private
	 * @returns {sap.m.GridContainer} The generated tiles wrapper.
	 */

	private _createWrapperFlexBox(): GridContainer {
		// Check if the tilesContainer already exists
		if (!this.tilesContainer) {
			// Create the GridContainer with required properties
			this.tilesContainer = new GridContainer(`${this.getId()}-insightsTilesContainer`, {
				visible: "{= !${/isPhone}}"
			}).addStyleClass("insightTiles sapUiSmallMarginTop sapUiSmallMarginBottom");
			// Attach aggregation to the container
			this._attachAggregationToContainer(this.tilesContainer);
		}
		// Return the existing or newly created container
		return this.tilesContainer;
	}

	/**
	 * Updates the activation flags for Insights Tiles based on the device type and viewport.
	 *
	 *
	 * @private
	 * @returns {void}
	 */
	private _updateTilesActivity(): void {
		// Activate Insights Tiles based on container in viewport
		const isPhoneScreen: boolean = this.getDeviceType() === DeviceType.Mobile;
		// Explicitly type the property being retrieved
		const bActivateInsightsTiles: boolean = Boolean(this._controlModel.getProperty("/activateInsightsTiles"));
		this._controlModel.setProperty("/activateInsightsTilesOnPhone", bActivateInsightsTiles && isPhoneScreen);
		this._controlModel.setProperty("/activateInsightsTilesOnDesktop", bActivateInsightsTiles && !isPhoneScreen);
	}
	/**
	 * Attaches necessary aggregations and configurations to the provided container.
	 *
	 * @private
	 * @param {GridContainer | HeaderContainer} tilesContainer - The container to which the aggregation and events are to be attached.
	 * @returns {void}
	 *
	 */
	private _attachAggregationToContainer(tilesContainer: GridContainer | HeaderContainer) {
		tilesContainer.setModel(this._controlModel);
		const sDefaultAggreName = tilesContainer.getMetadata().getDefaultAggregationName();
		const isPhoneScreen = this.getDeviceType() === DeviceType.Mobile;
		tilesContainer.bindAggregation(sDefaultAggreName, {
			path: "/tiles",
			factory: (id: string, context: Context): ManagedObject => {
				const oApp = context.getObject() as ICustomVisualization;
				if (oApp instanceof GenericTile) {
					return oApp;
				}
				const oVisualization = this.VizInstantiationService.instantiateVisualization(oApp.visualization) as ICustomVisualization;
				oVisualization.setLayoutData?.(
					new GridContainerItemLayoutData(`${this.getId()}-itemLayoutData-${id}`, {
						minRows: 2,
						columns: oVisualization.getDisplayFormat?.() === DisplayFormat.Standard ? 2 : 4
					})
				);
				oVisualization?.bindProperty?.(
					"active",
					isPhoneScreen ? "/activateInsightsTilesOnPhone" : "/activateInsightsTilesOnDesktop"
				);
				return oVisualization as ManagedObject;
			}
		});
	}

	/**
	 * Hides the header of the tiles panel.
	 * @private
	 */
	public handleHideHeader() {
		this._headerVisible = false;
		this.setProperty("title", "");
		this._toggleHeaderActions(false);
	}

	/**
	 * Adds the header to the tiles panel.
	 * @private
	 */
	public handleAddHeader() {
		this._headerVisible = true;
		this.setProperty("title", `${this.spaceTitle} (${this.aInsightsApps.length})`);
		this._toggleHeaderActions(true);
	}

	/**
	 * Calculates the number of visible tiles that can fit within the available width of the parent container.
	 *
	 * @private
	 * @param {ICustomVisualization[]} insightsApps - An array of custom visualizations to be displayed as tiles.
	 * @returns {number} - The number of visible tiles.
	 */
	private _calculateVisibleTileCount(insightsApps: ICustomVisualization[]): number {
		const layout = this._getInsightsContainer()?._getLayout();
		const layoutDomRef = layout?.getDomRef();
		const apps = insightsApps || [];
		let count = 0;

		if (layoutDomRef && apps.length) {
			const isHeaderVisible = layout.getProperty("showHeader") as boolean;
			const sectionNodeIndex = isHeaderVisible ? 1 : 0;
			const sectionDomRef = layoutDomRef.childNodes[sectionNodeIndex] as Element;
			const domProperties = fetchElementProperties(sectionDomRef, ["width", "padding-left", "padding-right"]);
			let availableWidth = domProperties.width - domProperties["padding-left"] - domProperties["padding-right"];
			const widthMap = {} as Record<DisplayFormat, number>;

			widthMap[DisplayFormat.Standard] = StandardTileWidth + Gap;
			widthMap[DisplayFormat.StandardWide] = StandardWideTileWidth + Gap;

			let nextTileWidth = widthMap[(apps[count].visualization?.displayFormatHint ?? DisplayFormat.Standard) as DisplayFormat];
			do {
				availableWidth -= nextTileWidth;
				++count;
				nextTileWidth = widthMap[(apps[count]?.visualization?.displayFormatHint ?? DisplayFormat.Standard) as DisplayFormat];
			} while (availableWidth > nextTileWidth);
		}

		return count || 1;
	}

	private _calculatePlaceholderTileCount(): number {
		const layoutDomRef = this._getInsightsContainer()?._getLayout()?.getDomRef();
		let count = 0;
		if (layoutDomRef) {
			const sectionDomRef = layoutDomRef.childNodes[0] as Element;
			const domProperties = fetchElementProperties(sectionDomRef, ["width", "padding-left", "padding-right"]);
			let availableWidth = domProperties.width - domProperties["padding-left"] - domProperties["padding-right"];
			const width = StandardTileWidth + Gap;

			count = Math.floor(availableWidth / width);
		}

		return count || 1;
	}

	/**
	 * Adjusts the layout of the tiles panel based on the current layout and device type.
	 *
	 * @private
	 * @override
	 */
	public _adjustLayout() {
		const layout = this._getInsightsContainer()?._getLayout();
		const isMobileDevice = this.getDeviceType() === DeviceType.Mobile;

		if (layout) {
			const visibleTileCount = isMobileDevice
				? this.aInsightsApps?.length
				: this._calculateVisibleTileCount(this.aInsightsApps as ICustomVisualization[]);
			const isElementExpanded = layout._getCurrentExpandedElementName() === this.getProperty("fullScreenName");
			this._controlModel.setProperty(
				"/tiles",
				isElementExpanded ? this.aInsightsApps : this.aInsightsApps?.slice(0, visibleTileCount)
			);
			this._controlModel.setProperty("/isPhone", isMobileDevice);
			this._updateTilesActivity();
			//Show/Hide Full Screen Button if panel header is visible otherwise update visibility of container Full Screen Button
			const showFullScreenButton = isElementExpanded || this.aInsightsApps.length > visibleTileCount;
			if (this._headerVisible) {
				if (!isMobileDevice) {
					(this.getAggregation("actionButtons") as Button[])?.forEach((actionButton) => {
						if (actionButton.getId().includes(tilesActionButtons.ADD_TILES)) {
							this._getInsightsContainer().toggleActionButton(actionButton, true);
						}
					});
				}
				this._getInsightsContainer()?.toggleFullScreenElements(this, showFullScreenButton);
			} else {
				const fullScreenButton = getAssociatedFullScreenMenuItem(this);
				const fullScreenText = fullScreenButton?.getTitle() ?? "";
				this._getInsightsContainer()?.updateMenuItem(
					this._controlMap.get(`${this.getId()}-${tilesContainerMenuItems.SHOW_MORE}`) as MenuItem,
					showFullScreenButton,
					fullScreenText
				);
				this._getInsightsContainer()?.updateActionButton(
					this._controlMap.get(`${this.getId()}-${tilesContainerActionButtons.SHOW_MORE}`) as Button,
					showFullScreenButton,
					fullScreenText
				);
			}
		}
	}

	/**
	 * Retrieves the InsightsContainer instance associated with this TilesPanel.
	 *
	 * @private
	 * @returns {InsightsContainer} The InsightsContainer instance.
	 */
	private _getInsightsContainer(): InsightsContainer {
		if (!this.insightsContainer) {
			this.insightsContainer = this.getParent() as InsightsContainer;
		}
		return this.insightsContainer;
	}

	/**
	 * Retrieves the menu items for the container.
	 *
	 * @private
	 * @returns {MenuItem[]} An array of MenuItem instances.
	 */
	public getContainerMenuItems(): MenuItem[] {
		if (!this._containerMenuItems) {
			const containerShowMore = createShowMoreMenuItem(this, tilesContainerMenuItems.SHOW_MORE, "containerTilesShowMore");
			this._controlMap.set(`${this.getId()}-${tilesContainerMenuItems.SHOW_MORE}`, containerShowMore);
			this._containerMenuItems = [containerShowMore];
		}
		return this._containerMenuItems;
	}

	/**
	 * Retrieves the action buttons for the container.
	 *
	 * @private
	 * @returns {Button[]} An array of Button instances.
	 */
	public getContainerActionButtons(): Button[] {
		if (!this._containerActionButtons) {
			this._containerActionButtons = [];

			const containerFullScreenActionButton = createShowMoreActionButton(
				this,
				tilesContainerActionButtons.SHOW_MORE,
				"containerTilesShowMore"
			);
			if (containerFullScreenActionButton) {
				this._controlMap.set(`${this.getId()}-${tilesContainerActionButtons.SHOW_MORE}`, containerFullScreenActionButton);
				this._containerActionButtons.push(containerFullScreenActionButton);
			}
		}
		return this._containerActionButtons;
	}

	/**
	 * Toggles the visibility of the header actions.
	 *
	 * @param {boolean} bShow - Whether to show or hide the header actions.
	 * @private
	 */
	private _toggleHeaderActions(bShow: boolean) {
		(this.getAggregation("menuItems") as MenuItem[])?.forEach((menuItem) => {
			this._getInsightsContainer()?.toggleMenuListItem(menuItem, bShow);
		});
		(this.getAggregation("actionButtons") as Button[])?.forEach((actionButton) =>
			this._getInsightsContainer()?.toggleActionButton(actionButton, bShow)
		);
	}
}
