/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */

import ResourceBundle from "sap/base/i18n/ResourceBundle";
import GridContainer from "sap/f/GridContainer";
import FlexBox from "sap/m/FlexBox";
import HeaderContainer from "sap/m/HeaderContainer";
import DragDropInfo from "sap/ui/core/dnd/DragDropInfo";
import { DropInfo$DropEvent } from "sap/ui/core/dnd/DropInfo";
import type { MetadataOptions } from "sap/ui/core/Element";
import Element from "sap/ui/core/Element";
import Lib from "sap/ui/core/Lib";
import { dnd } from "sap/ui/core/library";
import BaseContainer from "./BaseContainer";
import { $BasePanelSettings } from "./BasePanel";
import { DeviceType, calculateDeviceType } from "./utils/Device";
import { attachKeyboardHandler } from "./utils/DragDropUtils";

/**
 *
 * Abstract base class for all panels placed in {@link sap.cux.home.BaseContainer}.
 *
 * @extends sap.ui.core.Element
 *
 * @author SAP SE
 * @version 0.0.1
 * @since 1.121
 *
 * @abstract
 * @private
 * @ui5-restricted ux.eng.s4producthomes1
 *
 * @alias sap.cux.home.BasePanel
 */
export default abstract class BasePanel extends Element {
	protected _i18nBundle!: ResourceBundle;

	constructor(id?: string | $BasePanelSettings);
	constructor(id?: string, settings?: $BasePanelSettings);
	/**
	 * Constructor for a new Base Panel.
	 *
	 * @param {string} [id] ID for the new control, generated automatically if an ID is not provided
	 * @param {object} [settings] Initial settings for the new control
	 */
	public constructor(id?: string, settings?: $BasePanelSettings) {
		super(id, settings);
	}

	static readonly metadata: MetadataOptions = {
		library: "sap.cux.home",
		properties: {
			/**
			 * Title for the panel.
			 */
			title: { type: "string", group: "Misc", defaultValue: "" },
			/**
			 * Key for the panel.
			 */
			key: { type: "string", group: "Misc", defaultValue: "" },
			/**
			 * Specifies whether the panel should be visible.
			 */
			visible: { type: "boolean", group: "Misc", defaultValue: true },
			/**
			 * Tooltip for the panel.
			 */
			tooltip: { type: "string", group: "Misc", defaultValue: "", visibility: "hidden" },
			/**
			 * Specifies whether settings should be enabled for the panel.
			 */
			enableSettings: { type: "boolean", group: "Misc", visibility: "hidden" },
			/**
			 * Specifies whether key user settings should be enabled for the panel.
			 */
			enableKeyUserSettings: { type: "boolean", group: "Misc", visibility: "hidden", defaultValue: true },
			/**
			 * Indicates whether full screen is enabled for this control.
			 */
			enableFullScreen: { type: "boolean", group: "Misc", visibility: "hidden" },
			/**
			 * The name of the URL parameter used to expand the container into full-screen mode.
			 * This property specifies the parameter key expected in the URL query string
			 * to identify the container to be expanded.
			 */
			fullScreenName: { type: "string", group: "Misc", visibility: "hidden" }
		},
		defaultAggregation: "content",
		aggregations: {
			/**
			 * Specifies the content aggregation of the panel.
			 */
			content: { multiple: true, singularName: "content" },
			/**
			 * Specifies the actions to be shown within the panel.
			 */
			actionButtons: { type: "sap.m.Button", multiple: true, singularName: "actionButton" },
			/**
			 * Specifies the items that are shown within the dropdown menu of the panel.
			 */
			menuItems: { type: "sap.cux.home.MenuItem", multiple: true, singularName: "menuItem" }
		},
		events: {
			/**
			 * Event is fired before the container is expanded.
			 */
			onExpand: {},
			/**
			 * Event is fired after the panel is loaded.
			 */
			loaded: {}
		},
		associations: {
			fullScreenButton: { type: "sap.m.Button", multiple: false, singularName: "fullScreenButton", visibility: "hidden" }
		}
	};

	/**
	 * Init lifecycle method
	 *
	 * @private
	 * @override
	 */
	public init(): void {
		this._i18nBundle = Lib.getResourceBundleFor("sap.cux.home.i18n") as ResourceBundle;

		// set default key if not provided
		if (!this.getProperty("key")) {
			this.setProperty("key", this.getId());
		}
	}

	/**
	 * Updates the count information of IconTabFilter of IconTabBar inner control
	 * in case of SideBySide layout
	 *
	 * @private
	 * @param {string} count - updated count information
	 */
	public _setCount(count?: string): void {
		(this.getParent() as BaseContainer)?._setPanelCount(this, count);
	}

	/**
	 * Retrieves the device type for the current panel.
	 *
	 * @private
	 * @returns {DeviceType} - The device type of the parent container if it exists,
	 * otherwise calculates and returns the device type based on the current device width.
	 */
	protected getDeviceType(): DeviceType {
		const container = this.getParent() as BaseContainer;
		return container ? container.getDeviceType() : calculateDeviceType();
	}

	protected addDragDropConfigTo(
		container: GridContainer | FlexBox | HeaderContainer,
		dropHandler: (event: DropInfo$DropEvent) => void,
		keyboardHandler?: (event: KeyboardEvent) => void,
		dropPositionType: dnd.DropPosition = dnd.DropPosition.Between
	): void {
		container
			.addDragDropConfig(
				new DragDropInfo(`${container.getId()}--addDragDropConfig`, {
					sourceAggregation: "items",
					targetAggregation: "items",
					dropPosition: dropPositionType,
					dropLayout: dnd.DropLayout.Horizontal,
					drop: dropHandler
				})
			)
			.attachBrowserEvent("keydown", (event: KeyboardEvent) => {
				const disableNavigation = event.metaKey || event.ctrlKey;
				void attachKeyboardHandler(event, disableNavigation, (dragDropEvent: DropInfo$DropEvent) => {
					dropHandler(dragDropEvent);
				});
			});
		if (keyboardHandler) {
			container.attachBrowserEvent("keydown", keyboardHandler);
		}
	}
}
