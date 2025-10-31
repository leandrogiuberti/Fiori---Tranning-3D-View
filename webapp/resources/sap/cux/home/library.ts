/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */

import DataType from "sap/ui/base/DataType";
import Lib from "sap/ui/core/Lib";
import "sap/ui/core/library";
import "sap/ui/integration/library";

/**
 * Root namespace for all the libraries related to Common User Experience.
 *
 * @namespace
 * @private
 * @ui5-restricted ux.eng.s4producthomes1
 * @since 1.121
 */
export const cuxNamespace = "sap.cux";

/**
 * This is an SAPUI5 library with controls specialized for common user experience.
 *
 * @namespace
 * @private
 * @ui5-restricted ux.eng.s4producthomes1
 * @since 1.121
 */
export const cuxHomeNamespace = "sap.cux.home";

const thisLib = Lib.init({
	apiVersion: 2,
	name: "sap.cux.home",
	version: "0.0.1",
	dependencies: ["sap.ui.core", "sap.m", "sap.ui.integration", "sap.insights"],
	types: ["sap.cux.home.OrientationType", "sap.cux.home.NewsType"],
	interfaces: [],
	controls: [
		"sap.cux.home.Layout",
		"sap.cux.home.ToDosContainer",
		"sap.cux.home.NewsAndPagesContainer",
		"sap.cux.home.AppsContainer",
		"sap.cux.home.InsightsContainer"
	],
	elements: [
		"sap.cux.home.MenuItem",
		"sap.cux.home.TaskPanel",
		"sap.cux.home.SituationPanel",
		"sap.cux.home.PagePanel",
		"sap.cux.home.NewsPanel",
		"sap.cux.home.FavAppPanel",
		"sap.cux.home.FrequentAppPanel",
		"sap.cux.home.RecentAppPanel",
		"sap.cux.home.RecommendedAppPanel",
		"sap.cux.home.TilesPanel",
		"sap.cux.home.CardsPanel"
	],
	noLibraryCSS: false,
	extensions: {
		flChangeHandlers: {
			"sap.cux.home.Layout": "sap/cux/home/flexibility/Layout",
			"sap.cux.home.BaseContainer": "sap/cux/home/flexibility/BaseContainer",
			"sap.cux.home.ToDosContainer": "sap/cux/home/flexibility/BaseContainer",
			"sap.cux.home.NewsAndPagesContainer": "sap/cux/home/flexibility/BaseContainer",
			"sap.cux.home.InsightsContainer": "sap/cux/home/flexibility/BaseContainer",
			"sap.cux.home.AppsContainer": "sap/cux/home/flexibility/BaseContainer"
		}
	}
}) as { [key: string]: unknown };

/**
 * Supported layout types for {@link sap.cux.home.BaseContainer}.
 *
 * @enum {string}
 * @private
 * @since 1.121
 */
export enum OrientationType {
	/**
	 * Panels are rendered side by side, for example To-Dos and Situaions, and Favorites, Recently Used and Frequently Used apps
	 *
	 * @public
	 */
	SideBySide = "SideBySide",

	/**
	 * Panels are rendered vertically, for example Insights Tiles and Insights Cards
	 *
	 * @public
	 */
	Vertical = "Vertical",

	/**
	 * Panels are rendered horizontally, for example Pages and News
	 *
	 * @public
	 */
	Horizontal = "Horizontal"
}
thisLib.OrientationType = OrientationType;
DataType.registerEnum("sap.cux.home.OrientationType", OrientationType);

/**
 * Supported News Types for {@link sap.cux.home.NewsPanel}.
 *
 * @enum {string}
 * @private
 * @ui5-restricted ux.eng.s4producthomes1
 * @since 1.121
 */
export enum NewsType {
	/**
	 * News is of type Url
	 * @private
	 * @ui5-restricted ux.eng.s4producthomes1
	 */
	NewsUrl = "newsUrl",

	/**
	 * News is of type custom news feed
	 *
	 * @private
	 * @ui5-restricted ux.eng.s4producthomes1
	 */
	Custom = "customFeed",

	/**
	 * News is of type default news feed
	 *
	 * @private
	 * @ui5-restricted ux.eng.s4producthomes1
	 */
	Default = "default",

	/**
	 * News is of type None
	 *
	 * @private
	 * @ui5-restricted ux.eng.s4producthomes1
	 */
	None = ""
}
thisLib.NewsType = NewsType;
DataType.registerEnum("sap.cux.home.NewsType", NewsType);

export default thisLib;
