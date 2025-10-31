/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */

import Button from "sap/m/Button";
import type { $BaseContainerSettings } from "./BaseContainer";
import BaseContainer from "./BaseContainer";
import BasePanel from "./BasePanel";
import CardsPanel, { cardsContainerActionButtons, cardsContainerMenuItems } from "./CardsPanel";
import ErrorPanel from "./ErrorPanel";
import MenuItem from "./MenuItem";
import SpaceInsightsPanel from "./SpaceInsightsPanel";
import TilesPanel, { tilesContainerActionButtons, tilesContainerMenuItems } from "./TilesPanel";
import { DeviceType } from "./utils/Device";
import { sortMenuItems } from "./utils/InsightsUtils";
import { getInsightsPlaceholder } from "./utils/placeholder/InsightsPlaceholder";

const tilesPanelName: string = "sap.cux.home.TilesPanel";
const cardsPanelName: string = "sap.cux.home.CardsPanel";
const spaceInsightsPanelName: string = "sap.cux.home.SpaceInsightsPanel";
const sortedMenuItems: (tilesContainerMenuItems | cardsContainerMenuItems | string)[] = [
	tilesContainerMenuItems.REFRESH,
	cardsContainerMenuItems.REFRESH,
	tilesContainerMenuItems.ADD_APPS,
	tilesContainerMenuItems.EDIT_TILES,
	cardsContainerMenuItems.EDIT_CARDS,
	cardsContainerMenuItems.AI_INSIGHT_CARD,
	tilesContainerMenuItems.SHOW_MORE,
	cardsContainerMenuItems.SHOW_MORE,
	"settings"
];

interface IpanelLoaded {
	[key: string]: { loaded: boolean | undefined; count: number };
}

interface IpanelContext {
	[key: string]: TilesPanel | CardsPanel;
}

/**
 *
 * Container class for managing and storing Insights Tiles and Insights Cards.
 *
 * @extends sap.cux.home.BaseContainer
 *
 * @author SAP SE
 * @version 0.0.1
 * @since 1.121
 *
 * @private
 * @ui5-restricted ux.eng.s4producthomes1
 *
 * @alias sap.cux.home.InsightsContainer
 */

export default class InsightsContainer extends BaseContainer {
	static readonly renderer = {
		...BaseContainer.renderer,
		apiVersion: 2
	};
	private _errorPanel!: ErrorPanel;
	private _isInitialRender: boolean = true;
	private panelLoaded!: IpanelLoaded;
	private panelContext!: IpanelContext;

	constructor(id?: string | $BaseContainerSettings);
	constructor(id?: string, settings?: $BaseContainerSettings);
	/**
	 * Constructor for a new Insights container.
	 *
	 * @param {string} [id] ID for the new control, generated automatically if an ID is not provided
	 * @param {object} [settings] Initial settings for the new control
	 */
	public constructor(id?: string, settings?: $BaseContainerSettings) {
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
		this.setProperty("title", this._i18nBundle?.getText("insights"));
		/* As Container Level default value for enableSettings is false,
			this needs to be added from container level.
			(default value cannot be true as News & Page Container header should be hidden)
		*/
		this.setProperty("enableSettings", true);
		this.setProperty("orientation", "Vertical");
		this.panelLoaded = {
			[tilesPanelName]: { loaded: undefined, count: 0 },
			[cardsPanelName]: { loaded: undefined, count: 0 },
			[spaceInsightsPanelName]: { loaded: undefined, count: 0 }
		};
		this.panelContext = {};
		this.setTooltip(String(this._i18nBundle.getText("insights")));
		this.addCustomSetting("title", this._i18nBundle.getText("insightLayoutSectionTitle") as string);
		this.setTooltip(String(this._i18nBundle.getText("insightLayoutSectionTitle")));
	}

	/**
	 * Loads the Insights section.
	 * Overrides the load method of the BaseContainer.
	 *
	 * @private
	 * @override
	 */
	public load() {
		if (this._isInitialRender) {
			const aContent = this.getContent();
			aContent.forEach((oContent) => {
				this.panelContext[oContent.getMetadata().getName()] = oContent as TilesPanel | CardsPanel;
				this.addCommonMenuItems((oContent as TilesPanel | CardsPanel).getContainerMenuItems?.());
				this.addCommonActionButtons((oContent as TilesPanel | CardsPanel).getContainerActionButtons?.());
			});

			this._addContainerHeader();

			// Render individual panels
			aContent.forEach((content) => {
				const panel = content as TilesPanel | CardsPanel;
				panel.handleHideHeader();
				panel.attachHandleHidePanel(() => this.handleHidePanel(panel));
				panel.attachHandleUnhidePanel(() => this.unhidePanelIfHidden(panel));
				void panel.renderPanel();
			});
			this._isInitialRender = false;
		}
	}

	/**
	 * Handles the hiding of a panel by removing its content, updating the panel load status,
	 * and managing the display of the container header and error panel.
	 *
	 * @param {BasePanel} panel - The panel to be hidden.
	 * @private
	 */
	public handleHidePanel(panel: BasePanel) {
		this.removeContent(panel);
		const panelName = panel.getMetadata().getName();
		this.handlePanelLoad(panelName, { loaded: false, count: 0 });
		const panels = this._getLoadedPanelNames() || [];
		const visibleOrPendingPanels = this.getVisibleOrPendingPanels() || [];
		const panelCount = panels?.length;
		this._addContainerHeader();
		// only show error panel if all panels loaded state is false
		if (
			visibleOrPendingPanels.length === 0 ||
			(visibleOrPendingPanels.length === 1 && visibleOrPendingPanels[0] === spaceInsightsPanelName)
		) {
			if (!this._errorPanel) {
				this._errorPanel = new ErrorPanel(`${this.getId()}-errorPanel`, {
					messageTitle: this._i18nBundle.getText("noAppsTitle"),
					messageDescription: this._i18nBundle.getText("noInsightsMsg")
				});
				this._errorPanel.getData();
			}
			this.addAggregation("content", this._errorPanel);
		} else if (panelCount === 1) {
			const panel = this.getContent()[0];
			if (panel && !(panel instanceof ErrorPanel)) {
				(panel as TilesPanel | CardsPanel)?.handleHideHeader();
			}
		}
	}

	/**
	 * Adds the container header based on the number of visible panels.
	 *
	 * @private
	 */
	private _addContainerHeader() {
		const panels: string[] = this._getLoadedPanelNames();
		let hiddenMenuItems: string[] = [];
		let hiddenActionButtons: string[] = [];
		this.setProperty("title", this._i18nBundle?.getText("insights"));
		if (panels.length === 0 || this.getContent()[0] instanceof ErrorPanel) {
			hiddenMenuItems = [
				tilesContainerMenuItems.REFRESH,
				cardsContainerMenuItems.REFRESH,
				tilesContainerMenuItems.SHOW_MORE,
				cardsContainerMenuItems.SHOW_MORE
			];
			this._hideMenuItems(hiddenMenuItems);
			hiddenActionButtons = [tilesContainerActionButtons.SHOW_MORE, cardsContainerActionButtons.SHOW_MORE];
			this._hideActionButtons(hiddenActionButtons);
		} else if (panels.length === 1) {
			const panelName = panels[0];
			this.setProperty("title", `${this._i18nBundle?.getText("insights")} (${this.panelLoaded[panelName].count || 0})`);
			if (this.panelContext[panels[0]] instanceof TilesPanel) {
				hiddenMenuItems = [cardsContainerMenuItems.REFRESH, cardsContainerMenuItems.SHOW_MORE];
				hiddenActionButtons = [cardsContainerActionButtons.SHOW_MORE];
			}
			if (this.panelContext[panels[0]] instanceof CardsPanel) {
				hiddenMenuItems = [tilesContainerMenuItems.REFRESH, tilesContainerMenuItems.SHOW_MORE];
				hiddenActionButtons = [tilesContainerActionButtons.SHOW_MORE];
			}
			if (this.panelContext[panels[0]] instanceof SpaceInsightsPanel) {
				this.setProperty("title", `${this.panelContext[panels[0]].getTitle()} (${this.panelLoaded[panelName].count || 0})`);
				hiddenMenuItems = [tilesContainerMenuItems.REFRESH, tilesContainerMenuItems.SHOW_MORE, "settings"];
				hiddenActionButtons = [tilesContainerActionButtons.SHOW_MORE];
			}
			this._hideMenuItems(hiddenMenuItems);
			this._hideActionButtons(hiddenActionButtons);
		}
	}

	/**
	 * Removes the container header.
	 *
	 * @private
	 */
	private _removeContainerHeader() {
		this.setProperty("title", "");
		(this.getAggregation("menuItems") as MenuItem[])?.forEach((menuItem) => this.toggleMenuListItem(menuItem, false));
		(this.getAggregation("actionButtons") as Button[])?.forEach((actionButton) => this.toggleActionButton(actionButton, false));
		const panels = this._getLoadedPanelNames();
		panels.forEach((panelName) => {
			this.panelContext[panelName]?.handleAddHeader?.();
		});
	}

	/**
	 * Hides the specified menu items.
	 *
	 * @private
	 * @param {string[]} hiddenMenuItems - The IDs of the menu items to hide.
	 */
	private _hideMenuItems(hiddenMenuItems: string[]) {
		const containerMenuItems = this.getAggregation("menuItems") as MenuItem[];
		containerMenuItems?.forEach((menuItem) => {
			const includedInHiddenItems = hiddenMenuItems.some((hiddenItem) => menuItem.getId().includes(hiddenItem));
			this.toggleMenuListItem(menuItem, !includedInHiddenItems);
		});
	}

	/**
	 * Hides the specified action buttons.
	 *
	 * @private
	 * @param {string[]} hiddenActionButtons - The IDs of the action buttons to hide.
	 */
	private _hideActionButtons(hiddenActionButtons: string[]) {
		const containerActionButtons = this.getAggregation("actionButtons") as Button[];
		containerActionButtons?.forEach((actionButton) => {
			const includedInHiddenItems = hiddenActionButtons.some((hiddenItem) => actionButton.getId().includes(hiddenItem));
			this.toggleActionButton(actionButton, !includedInHiddenItems);
		});
	}

	/**
	 * Updates the item count for the specified panel.
	 *
	 * @param {number} itemCount - The new item count.
	 * @param {string} panelName - The name of the panel.
	 */
	public updatePanelsItemCount(itemCount: number, panelName: string) {
		this.panelLoaded[panelName].count = itemCount;
		const panels = this._getLoadedPanelNames();
		// Container Title Will be displayed only in case of only one panel is present
		if (panels.length === 1) {
			const isSpaceInsightsPanel = this.panelContext[panels[0]] instanceof SpaceInsightsPanel;
			this.setProperty(
				"title",
				`${isSpaceInsightsPanel ? this.panelContext[panels[0]].getTitle() : this._i18nBundle?.getText("insights")} (${itemCount || 0})`
			);
		}
	}

	/**
	 * Unhides the specified panel if it is hidden.
	 *
	 * @param {TilesPanel | CardsPanel} panel - The panel to unhide.
	 */
	public unhidePanelIfHidden(panel: TilesPanel | CardsPanel) {
		const layout = this._getLayout();
		const panelExpandedName = layout._getCurrentExpandedElementName();

		if (this._errorPanel) {
			this.removeContent(this._errorPanel);
		}

		// Function to handle panel content insertion
		const processPanelVisibility = (panelName: string, insertContentFn: () => void) => {
			if (!panelExpandedName || panelExpandedName === panel.getProperty("fullScreenName")) {
				/**
                    loaded value can be false or undefined, false being hidden and undefined being loading
                    if the panel is hidden then only unhide it
                */
				if (this.panelLoaded[panelName].loaded === false) {
					insertContentFn();
					// Remove hidden class if applied
					panel.setVisible(true);
				}
				this.handlePanelLoad(panelName, { loaded: true, count: this.panelLoaded[panelName].count });
			} else {
				const listener = () => {
					insertContentFn();
					// Remove hidden class if applied
					panel.setVisible(true);
					layout.detachOnCollapse(listener); // Remove the listener after execution
				};
				this.handlePanelLoad(panelName, { loaded: true, count: this.panelLoaded[panelName].count });
				layout.attachOnCollapse(listener);
			}
		};

		// Handling TilesPanel
		if (panel instanceof TilesPanel && !this.panelLoaded[tilesPanelName].loaded) {
			processPanelVisibility(tilesPanelName, () => this.insertContent(this.panelContext[tilesPanelName], 0));
		}

		// Handling CardsPanel
		if (panel instanceof CardsPanel && !this.panelLoaded[cardsPanelName].loaded) {
			processPanelVisibility(cardsPanelName, () => this.addContent(this.panelContext[cardsPanelName]));
		}

		// Handling SpaceInsightsPanel
		if (panel instanceof SpaceInsightsPanel && !this.panelLoaded[spaceInsightsPanelName].loaded) {
			processPanelVisibility(spaceInsightsPanelName, () => this.addContent(this.panelContext[cardsPanelName]));
		}
	}

	/**
	 * Updates the container header based on the number of visible panels.
	 *
	 * @private
	 * @param {TilesPanel | CardsPanel} panel - The panel being managed.
	 */

	private _updateHeaderElements(panel: TilesPanel | CardsPanel) {
		const panels = this._getLoadedPanelNames();
		if (panels.length > 1) {
			this._removeContainerHeader();
		} else {
			this._addContainerHeader();
			panel.handleHideHeader();
		}
	}

	/**
	 * Adjusts the layout of the container.
	 *
	 * @private
	 * @override
	 */
	public adjustLayout() {
		//hide actions if the device is a phone
		if (this.getDeviceType() === DeviceType.Mobile) {
			this.toggleActionButtons(false);
		} else {
			const panels = this._getLoadedPanelNames();
			// Unhide the Add Tiles button if the device is not a phone and header is visible
			if (panels.length < 2) {
				(this.getAggregation("actionButtons") as Button[])?.forEach((actionButton) => {
					if (actionButton.getId().includes(tilesContainerActionButtons.ADD_TILES)) {
						this.toggleActionButton(actionButton, true);
					}
				});
			}
		}

		//adjust layout of all panels
		(this.getContent() as (TilesPanel | CardsPanel)[]).forEach((panel) => panel._adjustLayout?.());
	}

	/**
	 * Add common Menu Items for Insights Container from Panel
	 *
	 * @private
	 */
	public addCommonMenuItems(menuItems: MenuItem[] = []) {
		menuItems.forEach((menuItem) => this.addAggregation("menuItems", menuItem));
		// after adding menu items sort them based on the order
		this._sortMenuItems(sortedMenuItems);
	}

	/**
	 * Add common Action Buttons for Insights Container from Panel
	 *
	 * @private
	 */
	public addCommonActionButtons(actionButtons: Button[] = []) {
		actionButtons.forEach((actionButton) => this.addAggregation("actionButtons", actionButton));
	}

	/**
	 * Handles the loading of a panel.
	 *
	 * @param {string} panelName - The name of the panel.
	 * @param {object} oVal - The load status and count of the panel.
	 * @param {boolean} oVal.loaded - The load status of the panel.
	 * @param {number} oVal.count - The count of items in the panel.
	 */
	public handlePanelLoad(panelName: string, oVal: { loaded: boolean; count: number }) {
		if (this.panelLoaded[panelName].loaded !== oVal.loaded) {
			this.panelLoaded[panelName] = oVal;
			this._updateHeaderElements(this.panelContext[panelName]);
		}
		this.adjustLayout();
	}

	/**
	 * Updates the visibility and text of an action button.
	 *
	 * @param {Button} actionButton - The action button to update.
	 * @param {boolean} visibility - The visibility of the action button.
	 * @param {string} text - The text of the action button.
	 */
	public updateActionButton(actionButton: Button, visibility: boolean, text: string) {
		if (actionButton?.getVisible() !== visibility || actionButton?.getText() !== text) {
			this.toggleActionButton(actionButton, visibility);
			actionButton?.setText(text);
			this._updateContainerHeader(this);
		}
	}

	/**
	 * Updates the visibility and text of a menu item.
	 *
	 * @param {MenuItem} menuItem - The menu item to update.
	 * @param {boolean} visibility - The visibility of the menu item.
	 * @param {string} text - The text of the menu item.
	 */
	public updateMenuItem(menuItem: MenuItem, visibility: boolean, text: string) {
		if (menuItem?.getVisible() !== visibility || menuItem?.getTitle() !== text) {
			this.toggleMenuListItem(menuItem, visibility);
			menuItem?.setTitle(text);
			this._updateContainerHeader(this);
		}
	}

	/**
	 * Gets the names of the loaded panels.
	 *
	 * @private
	 * @returns {string[]} The names of the loaded panels.
	 */
	private _getLoadedPanelNames() {
		return Object.keys(this.panelLoaded).filter((panelName) => this.panelLoaded[panelName].loaded);
	}

	/**
	 * Returns the names of panels that are still loading or in loaded true state
	 *
	 * @private
	 * @private
	 */
	private getVisibleOrPendingPanels() {
		return Object.keys(this.panelLoaded).filter((panelName) => this.panelLoaded[panelName].loaded !== false);
	}
	/**
	 * Sorts the menu items based on the provided order.
	 *
	 * @private
	 * @param {string[]} menuItems - The order of the menu items.
	 */
	private _sortMenuItems(menuItems: string[]) {
		const containerMenuItems = this.getAggregation("menuItems") as MenuItem[];
		let sortedMenuItems = sortMenuItems(menuItems, containerMenuItems);
		this.removeAllAggregation("menuItems");
		sortedMenuItems?.forEach((menuItem) => this.addAggregation("menuItems", menuItem));
	}

	/**
	 * Retrieves the generic placeholder content for the Insights container.
	 *
	 * @returns {string} The HTML string representing the Insights container's placeholder content.
	 */
	protected getGenericPlaceholderContent(): string {
		return getInsightsPlaceholder();
	}

	/**
	 * Refreshes the data for a specific panel based on its key.
	 *
	 * @private
	 * @param {string} key - The key of the panel to refresh.
	 */
	public async refreshData(key: string) {
		const panel = Object.values(this.panelContext).find((panel) => panel.getKey() === key);
		await panel?.refreshData?.(true);
	}
}
