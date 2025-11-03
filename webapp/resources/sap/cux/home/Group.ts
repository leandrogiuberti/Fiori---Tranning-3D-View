/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */

import type { MetadataOptions } from "sap/ui/core/Element";
import BaseApp from "./BaseApp";
import { $GroupSettings } from "./Group";

/**
 *
 * Class for managing apps group.
 *
 * @extends sap.cux.home.BaseApp
 *
 * @author SAP SE
 * @version 0.0.1
 * @since 1.121.0
 *
 * @private
 * @ui5-restricted ux.eng.s4producthomes1
 *
 * @alias sap.cux.home.Group
 */
export default class Group extends BaseApp {
	constructor(idOrSettings?: string | $GroupSettings);
	constructor(id?: string, settings?: $GroupSettings);
	/**
	 * Constructor for a new Group.
	 *
	 * @param {string} [id] ID for the new group, generated automatically if an ID is not provided
	 * @param {object} [settings] Initial settings for the new group
	 */
	public constructor(id?: string, settings?: $GroupSettings) {
		super(id, settings);
	}

	static readonly metadata: MetadataOptions = {
		library: "sap.cux.home",
		properties: {
			/**
			 * Number of apps, shown as folder badge
			 */
			number: { type: "string", group: "Misc", defaultValue: "" },
			/**
			 * Id of the group
			 */
			groupId: { type: "string", group: "Misc", defaultValue: "" },
			/**
			 * Id of the page associated with the group.
			 */
			pageId: { type: "string", group: "Misc", defaultValue: "" }
		},
		aggregations: {
			/**
			 * Apps aggregation for Groups
			 */
			apps: { type: "sap.cux.home.App", multiple: true, singularName: "app" }
		},
		events: {
			/**
			 * Fired when the control is pressed.
			 */
			press: {
				parameters: {
					/**
					 * ID of the group that was pressed.
					 */
					groupId: { type: "string" },
					/**
					 * ID of the page associated with the group that was pressed.
					 */
					pageId: { type: "string" }
				}
			}
		}
	};

	/**
	 * Handles the press event for a group.
	 * Retrieves the parent of the group and shows the group detail dialog.
	 * @private
	 */
	public _handlePress(): void {
		this.firePress({ groupId: this.getGroupId(), pageId: this.getPageId() });
	}
}
