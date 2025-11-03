/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */

import ResourceBundle from "sap/base/i18n/ResourceBundle";
import Dialog from "sap/m/Dialog";
import type { MetadataOptions } from "sap/ui/core/Element";
import Lib from "sap/ui/core/Lib";
import { $BaseSettingsDialogSettings } from "./BaseSettingsDialog";
import BaseSettingsPanel from "./BaseSettingsPanel";

/**
 *
 * Abstract base class for custom settings dialog for {@link sap.cux.home.BaseLayout}.
 *
 * @extends Dialog
 *
 * @author SAP SE
 * @version 0.0.1
 * @since 1.121
 *
 * @abstract
 * @private
 * @ui5-restricted ux.eng.s4producthomes1
 *
 * @alias sap.cux.home.BaseSettingsDialog
 */
export default abstract class BaseSettingsDialog extends Dialog {
	protected _i18nBundle!: ResourceBundle;
	private _panelCache!: BaseSettingsPanel[];

	constructor(id?: string | $BaseSettingsDialogSettings);
	constructor(id?: string, settings?: $BaseSettingsDialogSettings);
	/**
	 * Constructor for a new Base Settings Dialog.
	 *
	 * @param {string} [id] ID for the new control, generated automatically if an ID is not provided
	 * @param {object} [settings] Initial settings for the new control
	 */
	public constructor(id?: string, settings?: $BaseSettingsDialogSettings) {
		super(id, settings);
	}

	static readonly metadata: MetadataOptions = {
		library: "sap.cux.home",
		properties: {
			/**
			 * The selectedkey of the settings dialog
			 */
			selectedKey: { type: "string", group: "Misc", defaultValue: "", visibility: "hidden" },
			/**
			 * Additional context of the settings dialog
			 */
			context: { type: "object", group: "Misc", defaultValue: {}, visibility: "hidden" }
		},
		defaultAggregation: "panels",
		aggregations: {
			/**
			 * Contains the panels aggregation and should be of type BaseSettingsPanel.
			 */
			panels: { type: "sap.cux.home.BaseSettingsPanel", singularName: "panel", multiple: true }
		}
	};

	static renderer = {
		apiVersion: 2
	};

	/**
	 * Init lifecycle method
	 *
	 * @public
	 * @override
	 */
	public init(): void {
		super.init();
		this._i18nBundle = Lib.getResourceBundleFor("sap.cux.home.i18n") as ResourceBundle;

		//setup page
		this._panelCache = [];
		this.addStyleClass("sapContrastPlus");
	}

	/**
	 * Returns all the panels in the dialog.
	 * Overridden to return cached panels.
	 *
	 * @public
	 * @override
	 * @returns {BaseSettingsPanel[]} panel array
	 */
	public getPanels(): BaseSettingsPanel[] {
		return this._panelCache.slice();
	}

	/**
	 * Adds a new panel at the end of the available panels.
	 * Overridden to update cached panels.
	 *
	 * @public
	 * @override
	 * @returns {BaseSettingsDialog} the dialog for chaining
	 */
	addPanel(panel: BaseSettingsPanel): BaseSettingsDialog {
		this._panelCache.push(panel);
		this.addAggregation("panels", panel);
		return this;
	}

	/**
	 * Adds a new panel to the 'panels' aggregation at the index.
	 * Overridden to update cached panels.
	 *
	 * @public
	 * @override
	 * @param {BaseSettingsPanel} panel The panel to insert.
	 * @param {number} index The index at which to insert the panel.
	 * @returns {BaseSettingsDialog} Returns 'this' to allow method chaining.
	 */
	insertPanel(panel: BaseSettingsPanel, index: number): BaseSettingsDialog {
		this._panelCache.splice(index, 0, panel);
		this.insertAggregation("panels", panel, index);
		return this;
	}

	/**
	 * Removes a panel from the dialog and updates the cache.
	 *
	 * @public
	 * @param {BaseSettingsPanel} panel - The panel to remove.
	 * @returns {BaseSettingsPanel} The removed panel.
	 */
	removePanel(panel: BaseSettingsPanel): BaseSettingsPanel {
		this._panelCache.splice(this._panelCache.indexOf(panel), 1);
		return this.removeAggregation("panels", panel) as BaseSettingsPanel;
	}

	/**
	 * Removes all panels from the dialog, clears the internal panel cache.
	 * Overridden to update cached panels.
	 *
	 * @public
	 * @override
	 * @returns {BaseSettingsPanel[]} An empty array representing the removed panels.
	 */
	removeAllPanels(): BaseSettingsPanel[] {
		this._panelCache = [];
		this.removeAllAggregation("panels");
		return this.getPanels();
	}
}
