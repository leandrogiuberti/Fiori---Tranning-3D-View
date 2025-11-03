/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */

/**
 *
 * @param paramName name of parameter
 * This method checks if the URL parameter is enabled.
 * @returns {boolean} True if the parameter is enabled, false otherwise.
 * @private
 */
import Component from "sap/ui/core/Component";
import BaseLayout from "../BaseLayout";
import BasePanel from "../BasePanel";
import { ICustomVisualization, ISectionAndVisualization } from "../interface/AppsInterface";
import PageManager from "./PageManager";
import PersonalisationUtils from "./PersonalisationUtils";

export function isURLParamEnabled(paramName: string): boolean {
	const urlParams = new URLSearchParams(window.location.search);
	return urlParams.get(paramName)?.toUpperCase() === "TRUE" || false;
}

export function getPageManagerInstance(control: BasePanel) {
	const container = control.getParent();
	const layout = container?.getParent();
	const layoutPersContainerId = layout instanceof BaseLayout ? (layout?.getProperty("persContainerId") as string) : "";
	const persContainerId = layoutPersContainerId || PersonalisationUtils.getPersContainerId(control);
	const pageManagerInstance = PageManager.getInstance(persContainerId, PersonalisationUtils.getOwnerComponent(control) as Component);
	return pageManagerInstance;
}

/**
 * Filters visualizations by removing static tiles (count or Smart Business tiles) unless dynamic tiles are requested.
 *
 * @param {ISectionAndVisualization[]} visualizations - The array of visualizations to filter.
 * @param {boolean} [filterDynamicTiles=false] - If true, only dynamic tiles are included; otherwise, static tiles are included.
 * @returns {ISectionAndVisualization[]} The filtered array of visualizations.
 */
export function filterVisualizations(
	visualizations: ISectionAndVisualization[],
	filterDynamicTiles: boolean = false
): (ISectionAndVisualization | ICustomVisualization)[] {
	return visualizations
		.filter((visualization) => {
			// Filter out static tiles
			if (!visualization.isSection && (visualization.isCount || visualization.isSmartBusinessTile)) {
				return filterDynamicTiles;
			} else if (visualization.isSection) {
				visualization.apps = filterVisualizations(visualization.apps || [], filterDynamicTiles);
				visualization.badge = visualization.apps.length.toString();
			}

			return !filterDynamicTiles;
		})
		.filter((visualization) => (visualization.isSection ? visualization.apps!.length > 0 : true));
}
