/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */

import Button from "sap/m/Button";
import FlexBox, { $FlexBoxSettings } from "sap/m/FlexBox";
import GenericTile from "sap/m/GenericTile";
import IllustratedMessage from "sap/m/IllustratedMessage";
import IllustratedMessageSize from "sap/m/IllustratedMessageSize";
import IllustratedMessageType from "sap/m/IllustratedMessageType";
import VBox from "sap/m/VBox";
import { LoadState } from "sap/m/library";
import Event from "sap/ui/base/Event";
import Component from "sap/ui/core/Component";
import Control from "sap/ui/core/Control";
import { MetadataOptions } from "sap/ui/core/Element";
import EventBus from "sap/ui/core/EventBus";
import { DropInfo$DropEventParameters } from "sap/ui/core/dnd/DropInfo";
import type { $BasePagePanelSettings } from "./BasePagePanel";
import BasePagePanel from "./BasePagePanel";
import MenuItem from "./MenuItem";
import NewsAndPagesContainer from "./NewsAndPagesContainer";
import Page from "./Page";
import { ISpacePagePersonalization } from "./interface/KeyUserInterface";
import { IPage } from "./interface/PageSpaceInterface";
import { getPageManagerInstance } from "./utils/CommonUtils";
import { PAGE_SELECTION_LIMIT, SETTINGS_PANELS_KEYS } from "./utils/Constants";
import { recycleId } from "./utils/DataFormatUtils";
import { DeviceType } from "./utils/Device";
import { attachKeyboardHandler, focusDraggedItem } from "./utils/DragDropUtils";
import { addFESRId, addFESRSemanticStepName } from "./utils/FESRUtil";
import PageManager from "./utils/PageManager";
import PersonalisationUtils from "./utils/PersonalisationUtils";
import UShellPersonalizer from "./utils/UshellPersonalizer";

const tileSizes = {
	Mobile: {
		maxWidth: 37.5,
		minWidth: 8
	},
	Tablet: {
		maxWidth: 60,
		minWidth: 10.625
	},
	Desktop: {
		maxWidth: 18.75,
		minWidth: 7
	},
	LargeDesktop: {
		maxWidth: 18.75,
		minWidth: 7
	},
	XLargeDesktop: {
		maxWidth: 18.75,
		minWidth: 7
	},
	smallTabletMinWidth: 8
};

const mobileOneTileLimit = 3;
const maxTileCOunt = 8;
const maxRowCount = 4;

/**
 *
 * CustomFlexBox extending FlexBox to enable drag & drop.
 *
 * @extends sap.m.FlexBox
 *
 * @author SAP SE
 * @version 0.0.1
 * @since 1.122
 * @private
 *
 * @alias sap.cux.home.CustomFlexBox
 */
class CustomFlexBox extends FlexBox {
	constructor(idOrSettings?: string | $FlexBoxSettings);
	constructor(id?: string, settings?: $FlexBoxSettings);
	constructor(id?: string, settings?: $FlexBoxSettings) {
		super(id, settings);
	}

	static readonly metadata: MetadataOptions = {
		library: "sap.cux.home",
		aggregations: {
			items: { type: "sap.ui.core.Control", multiple: true, singularName: "item", dnd: { draggable: true, droppable: true } }
		}
	};
	static renderer = {
		apiVersion: 2
	};
}

/**
 *
 * Panel class for managing and storing Pages.
 *
 * @extends sap.cux.home.BasePagePanel
 *
 * @author SAP SE
 * @version 0.0.1
 * @since 1.122
 *
 * @private
 * @ui5-restricted ux.eng.s4producthomes1
 *
 * @alias sap.cux.home.PagePanel
 */

export default class PagePanel extends BasePagePanel {
	static readonly metadata: MetadataOptions = {
		library: "sap.cux.home",
		properties: {
			/**
			 * Title for the page panel
			 */
			title: { type: "string", group: "Misc", visibility: "hidden" },
			/**
			 * Key for the page panel
			 */
			key: { type: "string", group: "Misc", visibility: "hidden" }
		},
		aggregations: {
			/**
			 * Aggregation of pages available within the page panel
			 */
			pages: { type: "sap.cux.home.Page", singularName: "page", multiple: true, visibility: "hidden" }
		}
	};
	private _oWrapperFlexBox!: CustomFlexBox;
	private _pageWrapper!: VBox;
	private oPagePromise!: Promise<IPage[]> | null;
	private pageManagerInstance!: PageManager;
	private aFavPages!: IPage[];
	private oInnerControls!: GenericTile[];
	private _oIllusMsg!: IllustratedMessage;
	private oWrapperNoPageVBox!: VBox;
	private oAddPageBtn!: Button;
	private oPersonalizer!: UShellPersonalizer;
	private oEventBus!: EventBus;

	/**
	 * Constructor for a new Page panel.
	 *
	 * @param {string} [id] ID for the new control, generated automatically if an ID is not provided
	 * @param {object} [settings] Initial settings for the new control
	 */
	public constructor(id?: string, settings?: $BasePagePanelSettings) {
		super(id, settings);
	}

	init() {
		super.init();

		this._oWrapperFlexBox = new CustomFlexBox(`${this.getId()}-pageWrapper`, {
			justifyContent: "Start",
			height: "100%",
			width: "100%",
			direction: "Row",
			renderType: "Bare",
			wrap: "Wrap",
			items: this.getPlaceholderPageTiles()
		}).addStyleClass("pagesFlexGap sapCuxPagesWrapper");

		if (this.getDeviceType() !== DeviceType.Mobile) {
			this._oWrapperFlexBox.addStyleClass("sapUiSmallMarginTop");
		}

		this._pageWrapper = new VBox(`${this.getId()}-pageContentWrapper`, { items: [this._oWrapperFlexBox] });
		this.addContent(this._pageWrapper);
		this.setProperty("title", this._i18nBundle.getText("pageTitle"));

		const menuItem = new MenuItem(`${this.getId()}-managePages`, {
			title: this._i18nBundle.getText("mngPage"),
			icon: "sap-icon://edit",
			press: () => this._handleEditPages()
		});
		this.addAggregation("menuItems", menuItem);
		addFESRId(menuItem, "managePages");
		this.oEventBus = EventBus.getInstance();
		// Subscribe to the event
		this.oEventBus.subscribe(
			"importChannel",
			"favPagesImport",
			async (sChannelId?: string, sEventId?: string, oData?) => {
				this.aFavPages = oData as IPage[];
				await this.writeFavPagesIntoPers(this.aFavPages);
				this._getInnerControls();
				this._importdone();
			},
			this
		);

		// Subscribe to page changes from pageManager
		this.oEventBus.subscribe(
			"pageChannel",
			"pageUpdated",
			() => {
				void this.getData(true);
			},
			this
		);
	}

	private _importdone() {
		const stateData = { status: true };
		this.oEventBus.publish("importChannel", "favPagesImported", stateData);
	}

	public async getData(forceUpdate: boolean = false) {
		if (this.oPagePromise === undefined || this.oPagePromise === null || forceUpdate) {
			this.oPagePromise = this._getPageManagerInstance().getFavoritePages();
			const aFavPages = await this.oPagePromise;
			this.aFavPages = aFavPages;
			this._getInnerControls();
			this.oPagePromise = null;
		}
		this.fireEvent("loaded");
		return this.oPagePromise;
	}

	/**
	 * Handles the edit page event.
	 * Opens the page dialog for managing page data.
	 * @param {Event} oEvent - The event object.
	 * @private
	 */
	private _handleEditPages() {
		const parent = this.getParent() as NewsAndPagesContainer;
		parent?._getLayout().openSettingsDialog(SETTINGS_PANELS_KEYS.PAGES);
	}

	/**
	 * returns an array of placeholder generic tiles for pages
	 * @private
	 */
	private getPlaceholderPageTiles(): GenericTile[] {
		const placeholderArray = new Array(PAGE_SELECTION_LIMIT).fill(LoadState.Loading) as LoadState[];
		const placeholderTiles = placeholderArray.map((tileState: LoadState, index) => {
			return new GenericTile(recycleId(`${this.getId()}--${index}`), {
				sizeBehavior: "Responsive",
				state: tileState,
				frameType: "OneByOne",
				mode: "IconMode",
				visible: true,
				renderOnThemeChange: true,
				ariaRole: "listitem",
				dropAreaOffset: 8
			}).addStyleClass("cuxPagesPlaceholder");
		});
		return placeholderTiles;
	}

	public attachResizeHandler(
		isNewsTileVisible: boolean,
		containerWidth: number,
		pagesContentWrapper: FlexBox
	): void {
		try {
			const favPagesCount = this.aFavPages?.length,
				deviceType = this.getDeviceType();

			let domRefClientWidth = containerWidth;
			if (
				(deviceType === DeviceType.Desktop || deviceType === DeviceType.LargeDesktop || deviceType === DeviceType.XLargeDesktop) &&
				isNewsTileVisible
			) {
				domRefClientWidth = containerWidth / 2;
			}

			if (!domRefClientWidth) {
				return;
			}

			let tileWidth,
				hBoxWidth: string,
				finalTilesWidth: string,
				wrapperWidth = domRefClientWidth / 16; // Divide by 16 to convert to rem,
			const gap = 1;
			pagesContentWrapper.setWidth("100%");

			if (favPagesCount > 0) {
				const pagesPerRow = this.calculatePagesPerRow(favPagesCount, isNewsTileVisible);
				if (pagesPerRow) {
					const maxTileWidth = tileSizes[deviceType].maxWidth;
					let minTileWidth = tileSizes[deviceType].minWidth;
					// when tablet viewport width is below 800px, 46rem(736px) is the container width and 2 rem is paddings
					if (deviceType === DeviceType.Tablet && containerWidth < 736) {
						minTileWidth = tileSizes.smallTabletMinWidth;
					}
					tileWidth = (wrapperWidth - (pagesPerRow - 1) * gap) / pagesPerRow;
					tileWidth = Math.min(tileWidth, maxTileWidth);
					tileWidth = Math.max(tileWidth, minTileWidth);
					finalTilesWidth = `${tileWidth}rem`;
					hBoxWidth = `${pagesPerRow * tileWidth + (pagesPerRow - 1) * gap}rem`;
				} else {
					finalTilesWidth = "auto";
					hBoxWidth = "100%";
				}

				this._setPropertyValues({ hBoxWidth: hBoxWidth, pagesTileWidth: finalTilesWidth });
				pagesContentWrapper.setWidth(hBoxWidth);
			}
		} catch (err) {
			if (err instanceof Error) {
				console.error(err.message);
			}
		}
	}

	public async getUserAvailablePages() {
		return await this._getPageManagerInstance().fetchAllAvailablePages();
	}

	private calculatePagesPerRow(favPagesCount: number, isNewsFeedVisible: boolean): number {
		let pagesPerRow = 0;
		const deviceType = this.getDeviceType();
		if (deviceType === DeviceType.Desktop || deviceType === DeviceType.LargeDesktop || deviceType === DeviceType.XLargeDesktop) {
			if (isNewsFeedVisible) {
				// halves the tiles in 2 rows
				pagesPerRow = Math.ceil(favPagesCount >= maxTileCOunt ? maxRowCount : favPagesCount / 2);
			} else {
				pagesPerRow = favPagesCount;
			}
		} else if (deviceType === DeviceType.Mobile) {
			// decides number of columns to either 1 or 2
			pagesPerRow = favPagesCount <= mobileOneTileLimit ? 1 : 2;
		} else if (deviceType === DeviceType.Tablet) {
			// upto 4 in a Row, otherwise halves the tiles in 2 rows
			pagesPerRow = favPagesCount <= maxRowCount ? favPagesCount : Math.ceil(favPagesCount / 2);
		}
		return pagesPerRow;
	}

	private _getInnerControls() {
		const myFavPage: Page[] = [];
		this.oInnerControls = [];
		const oParent = this.getParent() as NewsAndPagesContainer;
		if (this.aFavPages) {
			this.aFavPages.forEach((oPage: IPage, index: number) => {
				myFavPage.push(
					new Page(recycleId(`${this.getId()}-favPage-${index}`), {
						title: oPage.title,
						subTitle: oPage.title === oPage.spaceTitle ? "" : oPage.spaceTitle,
						icon: oPage.icon,
						bgColor: oPage.BGColor as string,
						pageId: oPage.pageId,
						spaceId: oPage.spaceId,
						spaceTitle: oPage.spaceTitle,
						url: "#Launchpad-openFLPPage?pageId=" + oPage.pageId + "&spaceId=" + oPage.spaceId
					})
				);
			});
			myFavPage.forEach((oFav: Page, index2: number) => {
				this.oInnerControls.push(
					new GenericTile(recycleId(`${oFav.getId()}--genericTile--${index2}`), {
						// width: "10rem",
						header: oFav.getTitle(),
						subheader: oFav.getSubTitle(),
						press: () => void oFav.onPageTilePress(oFav),
						sizeBehavior: "Responsive",
						state: "Loaded",
						frameType: "OneByOne",
						mode: "IconMode",
						backgroundColor: oFav.getBgColor(),
						tileIcon: oFav.getIcon(),
						visible: true,
						renderOnThemeChange: true,
						ariaRole: "listitem",
						dropAreaOffset: 8,
						url: oFav.getProperty("url") as string
					}).addStyleClass("sapCuxPageTile")
				);
				this.addAggregation("pages", oFav, true);
			});

			this._oWrapperFlexBox.setAlignItems(this.aFavPages.length == 1 ? "Start" : "Center");
			const dndConfigs = this._oWrapperFlexBox.getDragDropConfig();
			if (this.aFavPages.length) {
				oParent?.panelLoadedFn("Page", { loaded: true, count: this.aFavPages.length });
				this._setFavPagesContent();
				if (!dndConfigs?.length)
					this.addDragDropConfigTo(
						this._oWrapperFlexBox,
						(oEvent) => void this._handlePageDnd(oEvent),
						async (oEvent: KeyboardEvent) => {
							await attachKeyboardHandler(oEvent, true);
						}
					);
			} else {
				this._oWrapperFlexBox.removeAllDragDropConfig();
				dndConfigs.forEach((dndConfig) => {
					dndConfig.destroy();
				});
				oParent?.panelLoadedFn("Page", { loaded: true, count: 0 });
				this._setNoPageContent();
			}
		} else {
			oParent?.panelLoadedFn("Page", { loaded: false, count: 0 });
			this.removeAggregation("content", this._oWrapperFlexBox);
		}
	}

	private _setFavPagesContent() {
		this._oWrapperFlexBox.removeAllItems();
		this._oWrapperFlexBox.removeStyleClass("pagesFlexBox");
		this.oInnerControls.forEach((oTile: GenericTile) => {
			this._oWrapperFlexBox.addItem(oTile);
		});
	}

	private _createNoPageContent() {
		if (!this._oIllusMsg) {
			this._oIllusMsg = new IllustratedMessage(this.getId() + "--idNoPages", {
				illustrationSize: IllustratedMessageSize.Small,
				illustrationType: IllustratedMessageType.NoSavedItems,
				title: this._i18nBundle.getText("noDataPageTitle"),
				description: this._i18nBundle.getText("noPageDescription")
			}).addStyleClass("myHomeIllustratedMsg myHomeIllustratedMessageAlign");
			this.oAddPageBtn = new Button(this.getId() + "--idAddPageBtn", {
				text: this._i18nBundle.getText("addPage"),
				tooltip: this._i18nBundle.getText("addPage"),
				type: "Emphasized",
				press: () => this._handleEditPages()
			});
			addFESRSemanticStepName(this.oAddPageBtn, "press", "addPages");
		}
	}

	private _setNoPageContent() {
		if (!this.oWrapperNoPageVBox) {
			this.oWrapperNoPageVBox = new VBox(recycleId(`${this.getId()}--wrapperNoPageVBox`), {
				width: "100%",
				height: "17rem",
				backgroundDesign: "Solid",
				justifyContent: "Center"
			}).addStyleClass("sapUiRoundedBorder noCardsBorder");
			this._createNoPageContent();
			this._oIllusMsg.addAdditionalContent(this.oAddPageBtn);
			this.oWrapperNoPageVBox.addItem(this._oIllusMsg);
		}
		this._oWrapperFlexBox.removeAllItems();
		this._oWrapperFlexBox.addStyleClass("pagesFlexBox");
		this._oWrapperFlexBox.addItem(this.oWrapperNoPageVBox);
	}

	private _setPropertyValues(oVal: { hBoxWidth: string; pagesTileWidth: string }) {
		const propNames = Object.keys(oVal);
		propNames.forEach((sProperty: string) => {
			if (sProperty === "hBoxWidth") {
				this._oWrapperFlexBox.setProperty("width", oVal[sProperty]);
			} else if (sProperty === "pagesTileWidth" && this.oInnerControls.length) {
				this.oInnerControls.forEach(function (oTile) {
					oTile.setProperty("width", oVal[sProperty]);
				});
			}
		});
	}

	private async _handlePageDnd(oEvent: Event<DropInfo$DropEventParameters>) {
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
			await this._DragnDropPages(iDragItemIndex, iDropItemIndex, sInsertPosition as string);
		}
	}

	private async _DragnDropPages(iDragItemIndex: number, iDropItemIndex: number, sInsertPosition: string) {
		if (sInsertPosition === "Before" && iDragItemIndex < iDropItemIndex) {
			iDropItemIndex--;
		} else if (sInsertPosition === "After" && iDragItemIndex > iDropItemIndex) {
			iDropItemIndex++;
		}
		// take the moved item from dragIndex and add to dropindex
		const oItemMoved = this.aFavPages.splice(iDragItemIndex, 1)[0];
		this.aFavPages.splice(iDropItemIndex, 0, oItemMoved);
		this.updateTileOrder(iDragItemIndex, iDropItemIndex);

		await this.writeFavPagesIntoPers(this.aFavPages);
		focusDraggedItem(this._oWrapperFlexBox, iDropItemIndex);
	}

	/**
	 * Updates the tile order in the UI after a drag-and-drop action.
	 *
	 * Moves a tile from `dragIndex` to `dropIndex` in the internal array
	 * and re-renders the tile container to reflect the new order.
	 *
	 * @param {number} dragIndex - Index of the dragged tile.
	 * @param {number} dropIndex - Index to insert the dragged tile.
	 */
	private updateTileOrder(dragIndex: number, dropIndex: number) {
		const [draggedItem] = this.oInnerControls.splice(dragIndex, 1);
		this.oInnerControls.splice(dropIndex, 0, draggedItem);
		this._oWrapperFlexBox.removeAllItems();
		this.oInnerControls.forEach((oTile) => {
			this._oWrapperFlexBox.addItem(oTile);
		});
	}

	/**
	 * Writes the favourite pages data into personalizer
	 *
	 * @private
	 * @async
	 * @param {IPage[]} favPages
	 * @returns {*}
	 */
	private async writeFavPagesIntoPers(favPages: IPage[]) {
		if (this.oPersonalizer === undefined) {
			this.oPersonalizer = await UShellPersonalizer.getInstance(
				PersonalisationUtils.getPersContainerId(this),
				PersonalisationUtils.getOwnerComponent(this) as Component
			);
		}

		let oPersData = await this.oPersonalizer.read();
		if (!oPersData) oPersData = { favouritePages: [] };
		oPersData.favouritePages = favPages;
		await this.oPersonalizer.write(oPersData);
	}

	public applyColorPersonalizations(personalizations: Array<ISpacePagePersonalization>) {
		void this._getPageManagerInstance()?.applyColorPersonalizations(personalizations);
	}

	public applyIconPersonalizations(personalizations: Array<ISpacePagePersonalization>) {
		void this._getPageManagerInstance()?.applyIconPersonalizations(personalizations);
	}

	private _getPageManagerInstance() {
		this.pageManagerInstance = this.pageManagerInstance || getPageManagerInstance(this);
		return this.pageManagerInstance;
	}

	/**
	 * Returns the wrapper FlexBox for the page panel.
	 *
	 * @returns {sap.m.FlexBox} The FlexBox that wraps the pages.
	 * @private
	 */
	public getPageWrapper(): FlexBox {
		return this._oWrapperFlexBox;
	}
}
