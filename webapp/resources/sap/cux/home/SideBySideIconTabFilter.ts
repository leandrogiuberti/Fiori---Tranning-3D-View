/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */

import IconTabFilter from "sap/m/IconTabFilter";
import { MetadataOptions } from "sap/ui/base/ManagedObject";
import Control from "sap/ui/core/Control";
import UI5Element from "sap/ui/core/Element";
import BasePanel from "./BasePanel";
import { $SideBySideIconTabFilterSettings } from "./SideBySideIconTabFilter";

/**
 *
 * Custom IconTabFilter for SideBySide orientation in the BaseContainer.
 *
 * @extends sap.m.IconTabFilter
 *
 * @author SAP SE
 * @version 0.0.1
 * @since 1.139.0
 *
 * @private
 *
 * @alias sap.cux.home.SideBySideIconTabFilter
 */
export default class SideBySideIconTabFilter extends IconTabFilter {
	constructor(id?: string | $SideBySideIconTabFilterSettings);
	constructor(id?: string, settings?: $SideBySideIconTabFilterSettings);
	/**
	 * Constructor for a new SideBySideIconTabFilter.
	 *
	 * @param {string} [id] ID for the new element, generated automatically if an ID is not provided
	 * @param {object} [settings] Initial settings for the new control
	 */
	public constructor(id?: string, settings?: $SideBySideIconTabFilterSettings) {
		super(id, settings);
	}

	static readonly renderer = "sap.m.IconTabFilterRenderer";
	static readonly metadata: MetadataOptions = {
		library: "sap.cux.home",
		associations: {
			panel: { type: "sap.cux.home.BasePanel", multiple: false, singularName: "panel" }
		}
	};

	/**
	 * Sets the associated panel for this tab filter and updates the key and text properties
	 * based on the panel's key and title.
	 *
	 * @param {BasePanel} panel - The panel to associate with this tab filter.
	 * @returns {this} This to allow method chaining.
	 */
	public setPanel(panel: BasePanel): this {
		this.setProperty("key", panel.getProperty("key"), true);
		this.setProperty("text", panel.getProperty("title"), true);
		this.setTooltip(panel.getProperty("tooltip") as string);
		this.setAssociation("panel", panel);
		return this;
	}

	/**
	 * Returns the content controls from the associated panel.
	 *
	 * @public
	 * @override
	 * @returns {Control[]} An array of controls contained in the associated panel, or an empty array if no panel is associated.
	 */
	public getContent(): Control[] {
		const panel = UI5Element.getElementById(this.getPanel()) as BasePanel;
		return panel?.getContent() || [];
	}

	/**
	 * Adds a control to the content aggregation of the associated panel.
	 *
	 * @public
	 * @override
	 * @param {Control} content - The control to add to the panel's content.
	 * @returns {this} The instance of SideBySideIconTabFilter, to allow method chaining.
	 */
	public addContent(content: Control): this {
		const panel = UI5Element.getElementById(this.getPanel()) as BasePanel;
		panel?.addContent(content);
		return this;
	}
}
