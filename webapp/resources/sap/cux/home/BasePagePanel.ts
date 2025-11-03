/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
import type { MetadataOptions } from "sap/ui/core/Element";
import { $BasePagePanelSettings } from "./BasePagePanel";
import BasePanel from "./BasePanel";

/**
 *
 * Base Panel class for managing and storing Pages.
 *
 * @extends sap.cux.home.BasePanel
 *
 * @author SAP SE
 * @version 0.0.1
 * @since 1.121
 *
 * @abstract
 * @private
 * @ui5-restricted ux.eng.s4producthomes1
 *
 * @alias sap.cux.home.BasePagePanel
 */
export default abstract class BasePagePanel extends BasePanel {
	constructor(idOrSettings?: string | $BasePagePanelSettings);
	constructor(id?: string, settings?: $BasePagePanelSettings);
	/**
	 * Constructor for a new Base Page Panel.
	 *
	 * @param {string} [id] ID for the new panel, generated automatically if an ID is not provided
	 * @param {object} [settings] Initial settings for the new panel
	 */
	public constructor(id?: string, settings?: $BasePagePanelSettings) {
		super(id, settings);
	}

	static readonly metadata: MetadataOptions = {
		library: "sap.cux.home",
		properties: {
			/**
			 * Title of the control.
			 */
			title: { type: "string", group: "Misc" },
			/**
			 * Unique key identifier for the control.
			 */
			key: { type: "string", group: "Misc" }
		},
		aggregations: {
			/**
			 * Specifies the content aggregation of the panel.
			 */
			content: { multiple: true, singularName: "content", visibility: "hidden" },
			/**
			 * Collection of pages that this panel manages.
			 */
			pages: { type: "sap.cux.home.Page", singularName: "page", multiple: true }
		}
	};
}
