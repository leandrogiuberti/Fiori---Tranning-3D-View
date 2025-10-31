/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
import Control from "sap/ui/core/Control";
import Context from "sap/ui/model/Context";
import { RequestOptions } from "./ToDoPanel";

/**
 * Common Interface for creating To-Do Panels displayed in the {@link sap.cux.home.ToDosContainer}.
 *
 * @author SAP SE
 * @version 0.0.1
 * @since 1.121
 *
 * @interface
 * @private
 * @ui5-restricted ux.eng.s4producthomes1
 *
 * @alias sap.cux.home.IToDoPanel
 */
export default interface IToDoPanel {
	/**
	 * Generate a default card template for the To Do Panel.
	 * An extended panel can have it's own template by overridding
	 * this method and providing a custom card template.
	 *
	 * @public
	 * @param {string} id The ID for the template.
	 * @param {object} context The context required for the template.
	 * @returns {object} The generated card template.
	 */
	generateCardTemplate(id: string, context: Context): Control;
	/**
	 * Provides custom request URLs specific to the To-Do Panel.
	 *
	 * @public
	 * @param {number} cardCount - The number of cards which will be displayed in the To-Do Panel.
	 * @returns {string[]} An array of request URLs.
	 */
	generateRequestUrls?(cardCount: number): string[];

	/**
	 * Handles the data received from a batch request.
	 * This hook can be used to process the data before it is displayed.
	 *
	 * @public
	 * @param {unknown[]} data - The data received from the request.
	 * @param {RequestOptions} [options] - Optional request options.
	 * @returns {Promise<void>} A promise that resolves when the data has been processed.
	 */
	onDataReceived?(data: unknown[], options?: RequestOptions): Promise<void>;

	/**
	 * Retrieves the text for the "No Data" message for the To-Do Panel.
	 *
	 * @public
	 * @returns {string} The text for the "No Data" message.
	 */
	getNoDataText?(): string;
}
