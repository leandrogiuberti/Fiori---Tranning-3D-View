/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */

import Log from "sap/base/Log";
import GridContainer from "sap/f/GridContainer";
import GridContainerItemLayoutData from "sap/f/GridContainerItemLayoutData";
import Button from "sap/m/Button";
import CustomListItem from "sap/m/CustomListItem";
import Dialog from "sap/m/Dialog";
import FlexBox from "sap/m/FlexBox";
import GenericTile from "sap/m/GenericTile";
import HBox from "sap/m/HBox";
import HeaderContainer from "sap/m/HeaderContainer";
import IllustratedMessage from "sap/m/IllustratedMessage";
import IllustratedMessageSize from "sap/m/IllustratedMessageSize";
import IllustratedMessageType from "sap/m/IllustratedMessageType";
import Label from "sap/m/Label";
import List from "sap/m/List";
import ObjectIdentifier from "sap/m/ObjectIdentifier";
import Title from "sap/m/Title";
import VBox from "sap/m/VBox";
import { ButtonType, LoadState } from "sap/m/library";
import Event from "sap/ui/base/Event";
import ManagedObject from "sap/ui/base/ManagedObject";
import Control from "sap/ui/core/Control";
import type { MetadataOptions } from "sap/ui/core/Element";
import UI5Element from "sap/ui/core/Element";
import EventBus from "sap/ui/core/EventBus";
import Icon from "sap/ui/core/Icon";
import Lib from "sap/ui/core/Lib";
import { DropInfo$DropEventParameters } from "sap/ui/core/dnd/DropInfo";
import Context from "sap/ui/model/Context";
import JSONModel from "sap/ui/model/json/JSONModel";
import Config from "sap/ushell/Config";
import Container from "sap/ushell/Container";
import S4MyHome from "sap/ushell/api/S4MyHome";
import Navigation from "sap/ushell/services/Navigation";
import VisualizationInstantiation from "sap/ushell/services/VisualizationInstantiation";
import BaseContainer from "./BaseContainer";
import BasePanel from "./BasePanel";
import InsightsContainer from "./InsightsContainer";
import MenuItem from "./MenuItem";
import { $TilesPanelSettings } from "./TilesPanel";
import { ICustomVisualization, ISectionAndVisualization, IVisualization } from "./interface/AppsInterface";
import { checkPanelExists } from "./utils/Accessibility";
import AppManager from "./utils/AppManager";
import { DEFAULT_BG_COLOR, END_USER_COLORS, MYHOME_PAGE_ID, MYINSIGHT_SECTION_ID, SETTINGS_PANELS_KEYS } from "./utils/Constants";
import { recycleId } from "./utils/DataFormatUtils";
import { DeviceType, fetchElementProperties } from "./utils/Device";
import { focusDraggedItem } from "./utils/DragDropUtils";
import { addFESRId, addFESRSemanticStepName, FESR_EVENTS } from "./utils/FESRUtil";
import { createShowMoreActionButton, createShowMoreMenuItem, getAssociatedFullScreenMenuItem, sortMenuItems } from "./utils/InsightsUtils";

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

const favAppPanelName: string = "sap.cux.home.FavAppPanel";
const appsConatinerlName: string = "sap.cux.home.AppsContainer";

const sortedMenuItems: (tilesMenuItems | string)[] = [
	tilesMenuItems.REFRESH,
	tilesMenuItems.ADD_APPS,
	tilesMenuItems.EDIT_TILES,
	"showMore",
	"settings"
];

const _showAddApps = () => {
	return (Config.last("/core/shell/enablePersonalization") || Config.last("/core/catalog/enabled")) as boolean;
};

const StandardTileWidth = 176;
const StandardWideTileWidth = 368;
const Gap = 16;

/**
 *
 * Tiles Panel class for managing and storing Insights Tiles.
 *
 * @extends sap.cux.home.BasePanel
 *
 * @author SAP SE
 * @version 0.0.1
 * @since 1.122.0
 *
 * @private
 * @ui5-restricted ux.eng.s4producthomes1
 *
 * @alias sap.cux.home.TilesPanel
 */

export default class TilesPanel extends BasePanel {
	constructor(idOrSettings?: string | $TilesPanelSettings);
	constructor(id?: string, settings?: $TilesPanelSettings);
	/**
	 * Constructor for a new Tiles Panel.
	 *
	 * @param {string} [id] ID for the new control, generated automatically if an ID is not provided
	 * @param {object} [settings] Initial settings for the new control
	 */
	public constructor(id?: string, settings?: $TilesPanelSettings) {
		super(id, settings);
	}
	private _oData!: Record<string, unknown>;
	private readonly _insightsSectionTitle: string = this._i18nBundle.getText("insights") as string;
	private readonly _addFromFavDialogId: string = `${this.getId()}-addFromFavDialog`;
	private appManagerInstance!: AppManager;
	private VizInstantiationService!: VisualizationInstantiation;
	private tilesContainer!: GridContainer;
	private tilesMobileContainer!: HeaderContainer;
	private _tilesWrapper!: VBox;
	private aInsightsApps: ICustomVisualization[] | GenericTile[] = [];
	private _controlModel!: JSONModel;
	public _controlMap!: Map<string, Control | Element | UI5Element>;
	private _containerMenuItems!: MenuItem[];
	private _containerActionButtons!: Button[];
	private oEventBus!: EventBus;
	private insightsContainer!: InsightsContainer;
	private _appSwitched!: boolean;
	private _headerVisible: boolean = false;
	static readonly metadata: MetadataOptions = {
		library: "sap.cux.home",
		properties: {
			/**
			 * Title for the tiles panel
			 */
			title: { type: "string", group: "Misc", defaultValue: "", visibility: "hidden" },
			/**
			 * Key for the tiles panel
			 */
			key: { type: "string", group: "Misc", defaultValue: "", visibility: "hidden" },
			/**
			 * The name of the URL parameter used to expand the container into full-screen mode.
			 */
			fullScreenName: { type: "string", group: "Misc", defaultValue: "SI1", visibility: "hidden" }
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
		this.setProperty("key", "tiles");
		this.setProperty("enableFullScreen", true);
		const refreshMenuItem = this._createRefreshMenuItem(tilesMenuItems.REFRESH, "tilesRefresh");
		const editTilesMenuItem = this._createEditTilesMenuItem(tilesMenuItems.EDIT_TILES, "manageTiles");

		const menuItems = [refreshMenuItem, editTilesMenuItem];
		menuItems.forEach((menuItem) => this.addAggregation("menuItems", menuItem));
		this._sortMenuItems(sortedMenuItems);

		const addTilesButton = this._createAddTilesButton(tilesActionButtons.ADD_TILES, "addTiles");

		const actionButtons = [addTilesButton];
		actionButtons.forEach((actionButton) => this.addAggregation("actionButtons", actionButton));

		this._createTilesFlexWrapper();
		Container.getServiceAsync<VisualizationInstantiation>("VisualizationInstantiation")
			.then((VizInstantiationService) => {
				this.VizInstantiationService = VizInstantiationService;
			})
			.catch((error) => {
				Log.error(error instanceof Error ? error.message : String(error));
			});

		this.oEventBus = EventBus.getInstance();
		// Subscribe to the event
		this.oEventBus.subscribe(
			"importChannel",
			"tilesImport",
			async (sChannelId?: string, sEventId?: string, oData?) => {
				await this.appManagerInstance.createInsightSection(this._i18nBundle.getText("insightsTiles") as string);
				await this._addSectionViz(oData as IVisualization[], MYINSIGHT_SECTION_ID);
				await this.refreshData();
				this._adjustLayout();
				this._importdone();
			},
			this
		);

		// Toggles the activity of tiles
		this._toggleTileActivity();
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
	 * Takes the visualizations and add it to the provided section id
	 * @param {IVisualization[]} aSectionViz - array of visualizations
	 * @param {string} sSectionId - section id where the visualizations to be added
	 * @returns {any}
	 */
	private _addSectionViz(aSectionViz: IVisualization[], sSectionId: string) {
		return aSectionViz.reduce((promiseChain, oViz) => {
			return promiseChain.then(() => {
				if (oViz.isBookmark) {
					return this.appManagerInstance.addBookMark(oViz);
				} else {
					return sSectionId
						? this.appManagerInstance.addVisualization(oViz.vizId, sSectionId)
						: this.appManagerInstance.addVisualization(oViz.vizId);
				}
			});
		}, Promise.resolve());
	}

	/**
	 * Handles the completion of the import process.
	 *
	 * @private
	 * @returns {void}
	 */
	private _importdone() {
		const stateData = { status: true };
		this.oEventBus.publish("importChannel", "tilesImported", stateData);
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
		this._controlModel.setProperty("/tiles", this.aInsightsApps, undefined, true);
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
			const container = this.getParent() as BaseContainer;
			this._showPlaceHolders();
			if (checkPanelExists(container, appsConatinerlName, favAppPanelName)) {
				const addFromFavAppMenuItem = this._createAddFromFavMenuItem(tilesMenuItems.ADD_APPS, "smartAppsDialog");
				this.addAggregation("menuItems", addFromFavAppMenuItem);
				this._sortMenuItems(sortedMenuItems);
			}
			return await this.refreshData();
		} catch (error) {
			console.error(error);
			this.fireHandleHidePanel();
		} finally {
			this.fireEvent("loaded");
		}
		return Promise.resolve();
	}

	/**
	 * Sorts the menu items based on the provided order.
	 *
	 * @private
	 * @param {string[]} menuItems - The order of the menu items.
	 */
	private _sortMenuItems(menuItems: string[]) {
		const panelMenuItems = this.getAggregation("menuItems") as MenuItem[];
		let sortedMenuItems = sortMenuItems(menuItems, panelMenuItems);
		this.removeAllAggregation("menuItems");
		sortedMenuItems?.forEach((menuItem) => this.addAggregation("menuItems", menuItem));
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
		this.aInsightsApps = await this.appManagerInstance.fetchInsightApps(true, this._insightsSectionTitle);
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
			this._getInsightsContainer()?.updatePanelsItemCount(this.aInsightsApps.length, panelName);
			if (this._headerVisible) {
				this.setProperty("title", `${this._i18nBundle?.getText("insightsTiles")} (${this.aInsightsApps.length})`);
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
				this._setDropAreaRectFunction(oVisualization as ManagedObject);
				return oVisualization as ManagedObject;
			}
		});
		this.addDragDropConfigTo(tilesContainer, (oEvent) => this._handleTilesDnd(oEvent));
	}

	/**
	 * Sets the drop area rectangle function for the given visualization.
	 *
	 * @private
	 * @param {ManagedObject} oVisualization - The visualization object to set the drop area rectangle function.
	 */
	private _setDropAreaRectFunction(oVisualization: ManagedObject) {
		const tilesDropAreaOffset = 8;
		const vizObj = oVisualization as { getDropAreaRect?: () => void };

		if (typeof vizObj.getDropAreaRect !== "function") {
			Object.defineProperty(oVisualization, "getDropAreaRect", {
				value: function (this: Control) {
					const domRef = this.getDomRef();
					if (!domRef) return null;
					const mDropRect = domRef.getBoundingClientRect();
					return {
						left: mDropRect.left - tilesDropAreaOffset,
						right: mDropRect.right + tilesDropAreaOffset,
						top: mDropRect.top,
						bottom: mDropRect.bottom,
						width: mDropRect.width,
						height: mDropRect.height
					};
				}
			});
		}
	}

	/**
	 * Handles the drag and drop of tiles.
	 *
	 * @private
	 * @param {Event<DropInfo$DropEventParameters>} oEvent - The drop event parameters.
	 */
	private _handleTilesDnd(oEvent: Event<DropInfo$DropEventParameters>) {
		const sInsertPosition = oEvent.getParameter?.("dropPosition"),
			oDragItem = oEvent?.getParameter?.("draggedControl") as Control,
			oDropItem = oEvent.getParameter("droppedControl") as Control,
			iDragItemIndex = (oDragItem.getParent() as FlexBox)?.indexOfItem(oDragItem);
		let iDropItemIndex = (oDragItem.getParent() as FlexBox)?.indexOfItem(oDropItem);

		if (sInsertPosition === "Before" && iDragItemIndex === iDropItemIndex - 1) {
			iDropItemIndex--;
		} else if (sInsertPosition === "After" && iDragItemIndex === iDropItemIndex + 1) {
			iDropItemIndex++;
		}

		if (iDragItemIndex !== iDropItemIndex) {
			void this._DragnDropTiles(iDragItemIndex, iDropItemIndex, sInsertPosition as string);
		}
	}

	/**
	 * Handles the drag and drop of tiles asynchronously.
	 *
	 * @private
	 * @param {number} iDragItemIndex - The index of the dragged item.
	 * @param {number} iDropItemIndex - The index of the dropped item.
	 * @param {string} sInsertPosition - The position to insert the item.
	 * @returns {Promise<void>} A promise that resolves when the drag and drop operation is complete.
	 */
	private async _DragnDropTiles(iDragItemIndex: number, iDropItemIndex: number, sInsertPosition: string) {
		if (sInsertPosition === "Before" && iDragItemIndex < iDropItemIndex) {
			iDropItemIndex--;
		} else if (sInsertPosition === "After" && iDragItemIndex > iDropItemIndex) {
			iDropItemIndex++;
		}
		const oDisplacedItem = this.aInsightsApps[iDropItemIndex] as ICustomVisualization,
			oItemMoved = this.aInsightsApps.splice(iDragItemIndex, 1)[0] as ICustomVisualization;
		this.aInsightsApps.splice(iDropItemIndex, 0, oItemMoved);
		const moveConfigs = {
			pageId: MYHOME_PAGE_ID,
			sourceSectionIndex: oItemMoved.persConfig?.sectionIndex as number,
			sourceVisualizationIndex: oItemMoved.persConfig?.visualizationIndex as number,
			targetSectionIndex: oDisplacedItem.persConfig?.sectionIndex as number,
			targetVisualizationIndex: oDisplacedItem.persConfig?.visualizationIndex as number
		};
		this._controlModel.setProperty("/tiles", this.aInsightsApps);
		await this.appManagerInstance.moveVisualization(moveConfigs);
		await this.refreshData(true);
		// Ensures focus on tile after Panel refresh during DnD.
		setTimeout(() => {
			focusDraggedItem(this.tilesContainer, iDropItemIndex);
		}, 0);
	}

	/**
	 * Handles the edit tiles event.
	 *
	 * @param {Event} event - The event object.
	 */
	private handleEditTiles(event: Event) {
		/* If called from Panel Header event.source() will return TilesPanel, if called from Insights Container event.source() will return InsightsContainer.
		_getLayout is available at Container Level*/
		let parent: ManagedObject = event.getSource<TilesPanel>().getParent() || this;
		if (parent instanceof TilesPanel) {
			parent = parent.getParent() as ManagedObject;
		}
		(parent as InsightsContainer)?._getLayout().openSettingsDialog(SETTINGS_PANELS_KEYS.INSIGHTS_TILES);
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
		this.setProperty("title", `${this._i18nBundle?.getText("insightsTiles")} (${this.aInsightsApps.length})`);
		this._toggleHeaderActions(true);
	}

	/**
	 * Closes the "Add from Favorites" dialog.
	 *
	 * @private
	 */
	private _closeAddFromFavDialog() {
		const list = this._controlMap.get(`${this._addFromFavDialogId}-list`) as List;
		list?.removeSelections();
		(this._controlMap.get(this._addFromFavDialogId) as Dialog)?.close();
	}

	/**
	 * Navigates to the App Finder with optional group Id.
	 * @async
	 * @private
	 */
	private async navigateToAppFinder() {
		const navigationService = await Container.getServiceAsync<Navigation>("Navigation");
		const navigationObject: { pageID: string; sectionID?: string } = {
			pageID: MYHOME_PAGE_ID,
			sectionID: MYINSIGHT_SECTION_ID
		};
		await navigationService.navigate({
			target: {
				shellHash: `Shell-appfinder?&/catalog/${JSON.stringify(navigationObject)}`
			}
		});
	}

	/**
	 * Retrieves the key of the legend color based on the provided color value.
	 * @param {string} color - The color value for which to retrieve the legend color key.
	 * @returns {string} The legend color key corresponding to the provided color value, or the default background color key if not found.
	 * @private
	 */
	private _getLegendColor(color: string) {
		return END_USER_COLORS().find((oColor) => oColor.value === color) || DEFAULT_BG_COLOR();
	}

	/**
	 * Handles the addition of tiles from favorite apps.
	 * @returns {Promise<void>} A Promise that resolves when the operation is complete.
	 * @private
	 */
	private async _handleAddFromFavApps() {
		const appsToAdd = await this._getFavToAdd();
		const dialog = this._generateAddFromFavAppsDialog();
		(this._controlMap.get(`${this._addFromFavDialogId}-errorMessage`) as IllustratedMessage)?.setVisible(appsToAdd.length === 0);
		this._generateAddFromFavAppsListItems(appsToAdd);
		dialog.open();
	}

	/**
	 * Retrieves the favorite visualizations to be added.
	 *
	 * @private
	 * @async
	 * @returns {Promise<ISectionAndVisualization[]>} A promise that resolves to an array of favorite visualizations to be added.
	 */
	private async _getFavToAdd(): Promise<ISectionAndVisualization[]> {
		const aFavApps: ISectionAndVisualization[] = await this.appManagerInstance.fetchFavVizs(false, true);
		const aDynamicApps = aFavApps.filter(function (oDynApp) {
			return oDynApp.isCount || oDynApp.isSmartBusinessTile;
		});

		const aFilteredFavApps = aDynamicApps.filter((oDynApp) => {
			const iAppIndex = this.aInsightsApps.findIndex(function (oInsightApps) {
				return (
					(!oDynApp.visualization?.isBookmark &&
						(oInsightApps as ICustomVisualization).visualization?.vizId === oDynApp.visualization?.vizId) ||
					(oDynApp.visualization?.isBookmark &&
						(oInsightApps as ICustomVisualization).visualization?.targetURL === oDynApp.visualization?.targetURL)
				);
			});
			return iAppIndex === -1;
		});

		return aFilteredFavApps;
	}

	/**
	 * Retrieves the selected Apps from the dialog.
	 * @returns {sap.m.ListItemBase[]} An array of selected Apps.
	 * @private
	 */
	private _getSelectedInsights() {
		const list = this._controlMap.get(`${this._addFromFavDialogId}-list`) as List;
		return list.getSelectedItems() || [];
	}

	/**
	 * Generates list items for the "Add from Favorites" dialog.
	 *
	 * @private
	 * @param {ISectionAndVisualization[]} appsToAdd - An array of favorite visualizations to be added.
	 */
	private _generateAddFromFavAppsListItems(appsToAdd: ISectionAndVisualization[]) {
		const id = this._addFromFavDialogId;
		const list = this._controlMap.get(`${id}-list`) as List;
		if (appsToAdd.length) {
			list.destroyItems();
			const listItems = appsToAdd.map(
				(app, index) =>
					new CustomListItem({
						id: `${id}-listItem-${index}`,
						content: [
							new HBox({
								id: `${id}-listItem-${index}-content`,
								alignItems: "Center",
								items: [
									new Icon({
										id: `${id}-listItem-${index}-content-icon`,
										src: app.icon,
										backgroundColor: this._getLegendColor(
											typeof app.BGColor === "object" ? app.BGColor.key : (app.BGColor ?? "")
										).value,
										color: "white",
										width: "2.25rem",
										height: "2.25rem",
										size: "1.25rem"
									}).addStyleClass("sapUiRoundedBorder sapUiTinyMargin"),
									new ObjectIdentifier({
										id: `${id}-listItem-${index}-content-identifier`,
										title: app.title,
										text: app.subtitle,
										tooltip: app.title
									}).addStyleClass("sapUiTinyMargin")
								]
							})
						]
					})
						.addStyleClass("sapUiContentPadding")
						.data("app", app) as CustomListItem
			);
			listItems.forEach((item) => list.addItem(item));
		}
		list?.setVisible(appsToAdd.length !== 0);
	}

	/**
	 * Generates the "Add from Favorites" dialog.
	 *
	 * @private
	 * @returns {Dialog} The generated dialog.
	 */
	private _generateAddFromFavAppsDialog(): Dialog {
		const id = this._addFromFavDialogId;
		const setAddBtnEnabled = () => {
			const selectedItems = this._getSelectedInsights();
			(this._controlMap.get(`${id}-addBtn`) as Button).setEnabled(selectedItems.length > 0);
		};
		if (!this._controlMap.get(id)) {
			const getAppFinderBtn = (id: string, btnType?: ButtonType) => {
				const appFinderBtn = new Button(id, {
					icon: "sap-icon://action",
					text: this._i18nBundle.getText("appFinderBtn"),
					press: () => {
						this._closeAddFromFavDialog();
						void this.navigateToAppFinder();
					},
					visible: _showAddApps(),
					type: btnType ?? ButtonType.Default
				});
				addFESRSemanticStepName(appFinderBtn, FESR_EVENTS.PRESS, "tilesAppFinder");
				return appFinderBtn;
			};
			this._controlMap.set(
				`${id}-list`,
				new List({
					id: `${id}-list`,
					mode: "MultiSelect",
					selectionChange: setAddBtnEnabled
				})
			);
			const addButton = new Button({
				id: `${id}-addBtn`,
				text: this._i18nBundle.getText("addBtn"),
				type: "Emphasized",
				press: () => {
					void this._addFromFavApps();
				},
				enabled: false
			});
			addFESRSemanticStepName(addButton, FESR_EVENTS.PRESS, "addSmartApps");
			this._controlMap.set(`${id}-addBtn`, addButton);
			this._controlMap.set(
				`${id}-errorMessage`,
				new IllustratedMessage({
					id: `${id}-errorMessage`,
					illustrationSize: IllustratedMessageSize.Small,
					illustrationType: IllustratedMessageType.AddDimensions,
					title: this._i18nBundle.getText("noAppsTitle"),
					description: this._i18nBundle.getText("tilesSectionNoDataDescription"),
					visible: true
				}).addStyleClass("sapUiLargeMarginTop")
			);
			const dialog = new Dialog(id, {
				title: this._i18nBundle.getText("addSmartApps"),
				content: [
					new Label({
						id: `${id}-label`,
						text: this._i18nBundle.getText("suggTileDialogLabel"),
						wrapping: true
					}).addStyleClass("sapMTitleAlign sapUiTinyMarginTopBottom sapUiSmallMarginBeginEnd"),
					new HBox({
						id: `${id}-textContainer`,
						justifyContent: "SpaceBetween",
						alignItems: "Center",
						items: [
							new Title({
								id: `${id}-text`,
								text: this._i18nBundle.getText("suggTileDialogTitle")
							}),
							getAppFinderBtn(`${id}-addAppsBtn`, ButtonType.Transparent)
						]
					}).addStyleClass("sapUiTinyMarginTop dialogHeader sapUiSmallMarginBeginEnd"),
					this._controlMap.get(`${id}-list`) as List,
					this._controlMap.get(`${id}-errorMessage`) as IllustratedMessage
				],
				contentWidth: "42.75rem",
				contentHeight: "32.5rem",
				endButton: new Button({
					id: `${id}-addFromFavDialogCloseBtn`,
					text: this._i18nBundle.getText("XBUT_CLOSE"),
					press: this._closeAddFromFavDialog.bind(this)
				}),
				escapeHandler: this._closeAddFromFavDialog.bind(this),
				buttons: [
					this._controlMap.get(`${id}-addBtn`) as Button,
					new Button({
						id: `${id}-cancelBtn`,
						text: this._i18nBundle.getText("cancelBtn"),
						press: this._closeAddFromFavDialog.bind(this)
					})
				]
			}).addStyleClass("sapContrastPlus sapCuxAddFromInsightsDialog");
			this.addDependent(dialog);
			this._controlMap.set(id, dialog);
		}
		setAddBtnEnabled();
		return this._controlMap.get(id) as Dialog;
	}

	/**
	 * Handles the addition of tiles from favorite apps.
	 *
	 * @private
	 * @async
	 * @returns {Promise<void>} A promise that resolves when the operation is complete.
	 */
	private async _addFromFavApps() {
		const dialog = this._controlMap.get(this._addFromFavDialogId) as Dialog;
		dialog.setBusy(true);
		const selectedItems = this._getSelectedInsights();
		const sections = await this.appManagerInstance._getSections();
		await selectedItems.reduce(async (promise, oApp) => {
			await promise;
			const app = oApp.data("app") as ISectionAndVisualization;
			const oMovingConfig = {
				pageId: MYHOME_PAGE_ID,
				sourceSectionIndex: app.persConfig?.sectionIndex as number,
				sourceVisualizationIndex: app.persConfig?.visualizationIndex as number,
				targetSectionIndex: this.appManagerInstance.insightsSectionIndex,
				targetVisualizationIndex: -1
			};

			/**
			 * If the app is a bookmark, we need to update the source and target section indices accordingly.
			 * This is because bookmarks are added to the "Recent Apps" section,
			 * which is always at the top of the list, and the insights section index is shifted by one.
			 */
			if (app.visualization?.isBookmark) {
				const recentAppSectionIndex = sections.findIndex((section) => section.default);

				if (recentAppSectionIndex === -1) {
					oMovingConfig.sourceSectionIndex = 0;
					oMovingConfig.sourceVisualizationIndex = 0;
					oMovingConfig.targetSectionIndex = this.appManagerInstance.insightsSectionIndex + 1;
				} else {
					oMovingConfig.sourceSectionIndex = recentAppSectionIndex;
					oMovingConfig.sourceVisualizationIndex = sections[recentAppSectionIndex]?.visualizations?.length || 0;
					oMovingConfig.targetSectionIndex = this.appManagerInstance.insightsSectionIndex;
				}
			}
			if (app.visualization?.displayFormatHint !== "standard" && app.visualization?.displayFormatHint !== "standardWide") {
				if (app.visualization?.supportedDisplayFormats === "standard") {
					app.visualization.displayFormatHint = "standard";
				} else if (app.visualization?.supportedDisplayFormats === "standardWide") {
					app.visualization.displayFormatHint = "standardWide";
				}
			}
			// Add Selected App to Insights Section
			if (!app.visualization?.vizId) {
				(app.visualization as IVisualization).vizId = app.visualization?.targetURL ?? "";
			}
			if (app.visualization?.isBookmark === true) {
				await this.appManagerInstance.addBookMark(app.visualization, oMovingConfig);
			} else {
				await this.appManagerInstance.addVisualization(app.visualization?.vizId as string, MYINSIGHT_SECTION_ID);
			}
		}, Promise.resolve());

		await this.refreshData();
		dialog.setBusy(false);
		dialog.close();
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
			const containerRefresh = this._createRefreshMenuItem(tilesContainerMenuItems.REFRESH, "containerTilesRefresh");
			const containerEditTiles = this._createEditTilesMenuItem(tilesContainerMenuItems.EDIT_TILES, "containerManageTiles");
			const containerShowMore = createShowMoreMenuItem(this, tilesContainerMenuItems.SHOW_MORE, "containerTilesShowMore");
			const container = this.getParent() as BaseContainer;
			this._controlMap.set(`${this.getId()}-${tilesContainerMenuItems.SHOW_MORE}`, containerShowMore);
			this._containerMenuItems = [containerRefresh, containerEditTiles, containerShowMore];
			if (checkPanelExists(container, appsConatinerlName, favAppPanelName)) {
				const containerAddFromFav = this._createAddFromFavMenuItem(tilesContainerMenuItems.ADD_APPS, "containerSmartAppsDialog");
				this._containerMenuItems.splice(1, 0, containerAddFromFav);
			}
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
			this._containerActionButtons.push(
				this._createAddTilesButton(tilesContainerActionButtons.ADD_TILES, "containerSmartAppsDialog")
			);

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
	 * Creates a refresh menu item.
	 *
	 * @private
	 * @param {string} id - The ID of the menu item.
	 * @param {string} [fesrId] - The FESR ID for the menu item.
	 * @returns {MenuItem} The created MenuItem instance.
	 */
	private _createRefreshMenuItem(id: string, fesrId?: string): MenuItem {
		const menuItem = new MenuItem(`${this.getId()}-${id}`, {
			title: this._i18nBundle.getText("refresh"),
			icon: "sap-icon://refresh",
			visible: false,
			press: () => void this.refreshData(true)
		});
		this._controlMap.set(`${this.getId()}-${id}`, menuItem);
		if (fesrId) {
			addFESRId(menuItem, fesrId);
		}

		return menuItem;
	}

	/**
	 * Creates an "Add from Favorites" menu item.
	 *
	 * @private
	 * @param {string} id - The ID of the menu item.
	 * @param {string} [fesrId] - The FESR ID for the menu item.
	 * @returns {MenuItem} The created MenuItem instance.
	 */
	private _createAddFromFavMenuItem(id: string, fesrId?: string): MenuItem {
		if (!this._controlMap.get(`${this.getId()}-${id}`)) {
			const menuItem = new MenuItem(`${this.getId()}-${id}`, {
				title: this._i18nBundle.getText("addSmartApps"),
				icon: "sap-icon://duplicate",
				visible: false,
				press: () => void this._handleAddFromFavApps()
			});
			this._controlMap.set(`${this.getId()}-${id}`, menuItem);
			if (fesrId) {
				addFESRId(menuItem, fesrId);
			}
		}
		return this._controlMap.get(`${this.getId()}-${id}`) as MenuItem;
	}

	/**
	 * Creates an "Edit Tiles" menu item.
	 *
	 * @private
	 * @param {string} id - The ID of the menu item.
	 * @param {string} [fesrId] - The FESR ID for the menu item.
	 * @returns {MenuItem} The created MenuItem instance.
	 */
	private _createEditTilesMenuItem(id: string, fesrId?: string): MenuItem {
		const menuItem = new MenuItem(`${this.getId()}-${id}`, {
			title: this._i18nBundle.getText("editLinkTiles"),
			icon: "sap-icon://edit",
			visible: false,
			press: (event: Event) => this.handleEditTiles(event)
		});
		this._controlMap.set(`${this.getId()}-${id}`, menuItem);
		if (fesrId) {
			addFESRId(menuItem, fesrId);
		}

		return menuItem;
	}

	/**
	 * Creates an "Add Tiles" button.
	 *
	 * @private
	 * @param {string} id - The ID of the button.
	 * @param {string} [fesrId] - The FESR ID for the button.
	 * @returns {Button} The created Button instance.
	 */
	private _createAddTilesButton(id: string, fesrId?: string): Button {
		const actionButton = new Button(`${this.getId()}-${id}`, {
			text: this._i18nBundle.getText("appFinderLink"),
			tooltip: this._i18nBundle.getText("appFinderLink"),
			press: async () => {
				const container = this._getInsightsContainer() as BaseContainer;
				if (checkPanelExists(container, appsConatinerlName, favAppPanelName)) {
					// Favorite App Panel is visible, proceed as usual
					void this._handleAddFromFavApps();
				} else {
					// Favorite App Panel is NOT visible, navigate to App Finder
					await this.navigateToAppFinder();
				}
			}
		});
		this._controlMap.set(`${this.getId()}-${id}`, actionButton);
		if (fesrId) {
			addFESRId(actionButton, fesrId);
		}

		return actionButton;
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
