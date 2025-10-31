/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */

import Button from "sap/m/Button";
import GenericTile, { GenericTile$PressEvent } from "sap/m/GenericTile";
import List from "sap/m/List";
import Popover from "sap/m/Popover";
import StandardListItem from "sap/m/StandardListItem";
import { ListType } from "sap/m/library";
import type { MetadataOptions } from "sap/ui/core/Element";
import Element from "sap/ui/core/Element";
import { $BaseAppSettings } from "./BaseApp";
import MenuItem from "./MenuItem";
import { addFESRSemanticStepName, FESR_EVENTS, getFESRId } from "./utils/FESRUtil";

/**
 *
 * Base App class for managing and storing Apps.
 *
 * @extends sap.ui.core.Element
 *
 * @author SAP SE
 * @version 0.0.1
 * @since 1.121.0
 *
 * @abstract
 * @private
 * @ui5-restricted ux.eng.s4producthomes1
 *
 * @alias sap.cux.home.BaseApp
 */
export default abstract class BaseApp extends Element {
	constructor(idOrSettings?: string | $BaseAppSettings);
	constructor(id?: string, settings?: $BaseAppSettings);
	/**
	 * Constructor for a new Base App.
	 *
	 * @param {string} [id] ID for the new app, generated automatically if an ID is not provided
	 * @param {object} [settings] Initial settings for the new app
	 */
	public constructor(id?: string, settings?: $BaseAppSettings) {
		super(id, settings);
	}

	static readonly metadata: MetadataOptions = {
		library: "sap.cux.home",
		properties: {
			/**
			 * Title of the app
			 */
			title: { type: "string", group: "Misc", defaultValue: "" },
			/**
			 * Sub header of the app
			 */
			subTitle: { type: "string", group: "Misc", defaultValue: "" },
			/**
			 * Background color of the app
			 */
			bgColor: { type: "string", group: "Misc", defaultValue: "" },
			/**
			 * Icon of the app
			 */
			icon: { type: "string", group: "Misc", defaultValue: "" },
			/**
			 * Whether the app is in loaded or loading status
			 */
			status: { type: "string", group: "Misc", defaultValue: "Loaded" }
		},
		aggregations: {
			/**
			 * MenuItems aggregation of the app. These items will be shown in a popover on click of showMore
			 */
			menuItems: { type: "sap.cux.home.MenuItem", multiple: true, singularName: "menuItem", visibility: "hidden" }
		}
	};

	abstract _handlePress(event: GenericTile$PressEvent): void;

	/**
	 * Base App Press Handler
	 * @private
	 * @param {GenericTile$PressEvent} event - The event object.
	 */
	public _onPress(event: GenericTile$PressEvent): void {
		const sAction = event.getParameter("action") || "Press";
		if (sAction === "Press") {
			this._handlePress(event);
		} else if (sAction === "More") {
			this._loadActionsPopover(event);
		}
	}

	/**
	 * Loads Actions available for selected app tile in popover
	 * @private
	 * @param {GenericTile$PressEvent} event - The event object.
	 */
	public _loadActionsPopover(event: GenericTile$PressEvent) {
		const tile: GenericTile & { _oMoreIcon: Button } = event.getSource?.();
		const actions = this.getAggregation("menuItems") as MenuItem[];
		const oPopover = ActionsPopover.get(actions);
		//Add Border around current tile
		const onPopoverOpen = () => {
			tile.addStyleClass("sapThemeBrand-asOutlineColor");
		};
		const onPopoverClose = () => {
			tile.removeStyleClass("sapThemeBrand-asOutlineColor");
			oPopover.detachBeforeOpen(onPopoverOpen);
			oPopover.detachAfterClose(onPopoverClose);
		};
		oPopover.attachBeforeOpen(onPopoverOpen);
		oPopover.attachAfterClose(onPopoverClose);
		oPopover.openBy(tile._oMoreIcon);
	}
}

export class ActionsPopover {
	private static _popover: Popover;
	private static _actionsList: List;

	private constructor() {}

	static _closeActionsPopover() {
		ActionsPopover._popover.close();
	}

	// Method to get the singleton instance
	static get(actions?: MenuItem[]): Popover {
		if (!ActionsPopover._popover) {
			ActionsPopover._actionsList = new List({
				id: `appActionsList`
			});
			ActionsPopover._popover = new Popover(`appActionsPopover`, {
				showHeader: false,
				placement: "HorizontalPreferredRight",
				ariaLabelledBy: [`appActionsPopover`]
			})
				.addStyleClass("sapContrastPlus")
				.addContent(ActionsPopover._actionsList);
		}
		ActionsPopover._actionsList.destroyItems();
		actions?.forEach((action) => {
			const actionType = action.getType() as ListType;
			const oListItem = new StandardListItem(`${action.getId()}-index`, {
				icon: action.getIcon(),
				title: action.getTitle(),
				tooltip: action.getTitle(),
				type: actionType,
				visible: true,
				press: (oEvent) => {
					if (actionType !== ListType.Navigation) {
						ActionsPopover._closeActionsPopover();
					}
					action.firePress({ listItem: oEvent.getSource() });
				}
			});
			addFESRSemanticStepName(oListItem, FESR_EVENTS.PRESS, getFESRId(action));
			ActionsPopover._actionsList.addItem(oListItem);
		});
		return ActionsPopover._popover;
	}
}
