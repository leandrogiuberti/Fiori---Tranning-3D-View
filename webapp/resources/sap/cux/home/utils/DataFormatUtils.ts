/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */

import { ValueColor } from "sap/m/library";
import UI5Element from "sap/ui/core/Element";
import DateFormat from "sap/ui/core/format/DateFormat";
import { BookmarkParameters } from "sap/ushell/services/BookmarkV2";
import { IVisualization } from "../interface/AppsInterface";
import { TaskPriority } from "./TaskUtils";

const oRelativeDateTimeFormatter = DateFormat.getDateTimeInstance({
	style: "medium",
	relative: true,
	relativeStyle: "short"
});

const oRelativeDateFormatter = DateFormat.getDateInstance({
	relative: true
});

export function toPriority(oTask: { criticality: ValueColor }) {
	switch (oTask.criticality) {
		case ValueColor.Error:
			return 1;
		case ValueColor.Critical:
			return 2;
		case ValueColor.Neutral:
			return 3;
		default:
			return 99;
	}
}

export function toTaskPriorityText(sPriority: TaskPriority) {
	switch (sPriority) {
		case TaskPriority.VERY_HIGH:
			return "veryHighPriority";
		case TaskPriority.HIGH:
			return "highPriority";
		case TaskPriority.MEDIUM:
			return "mediumPriority";
		case TaskPriority.LOW:
			return "lowPriority";
		default:
			return "nonePriority";
	}
}

/**
 * Formats a given date as a relative date and time string.
 *
 * @param {Date} oDate - The input date to format as a relative date and time string.
 * @returns {string} A string representing the input date in a relative date and time format.
 */
export function toRelativeDateTime(oDate: Date) {
	return oRelativeDateTimeFormatter.format(new Date(oDate));
}

/**
 * Converts a given date to a relative date string.
 *
 * @param {Date} iTimeStamp - The input timestamp to convert to a relative date string.
 * @returns {string} A relative date string with the first letter capitalized.
 */
export function toRelativeDate(iTimeStamp: Date) {
	const sRelativeDate = oRelativeDateFormatter.format(new Date(iTimeStamp));
	return sRelativeDate.charAt(0).toUpperCase() + sRelativeDate.slice(1);
}

export function createBookMarkData(oBookMark: IVisualization) {
	const finalBookMarkData = {
		title: oBookMark.title || "",
		url: oBookMark.targetURL,
		icon: oBookMark.icon,
		info: oBookMark.info,
		subtitle: oBookMark.subtitle,
		serviceUrl: oBookMark.indicatorDataSource && oBookMark.indicatorDataSource.path,
		numberUnit: oBookMark.numberUnit,
		vizType: oBookMark.vizType,
		vizConfig: oBookMark.vizConfig,
		dataSource: oBookMark.dataSource
	} as unknown as BookmarkParameters;
	return finalBookMarkData;
}

export function getImportance(oDataField: unknown) {
	let sImportance,
		iImportance = -1;
	if ((oDataField as { importance: { EnumMember: string } })["importance"]) {
		sImportance = (oDataField as { importance: { EnumMember: string } })["importance"].EnumMember;
		switch (sImportance) {
			case "com.sap.vocabularies.UI.v1.ImportanceType/High":
				iImportance = 1;
				break;
			case "com.sap.vocabularies.UI.v1.ImportanceType/Medium":
				iImportance = 2;
				break;
			case "com.sap.vocabularies.UI.v1.ImportanceType/Low":
				iImportance = 3;
				break;
			default:
				break;
		}
	} else {
		iImportance = 2; // default importance to be considered as Medium
	}
	return iImportance;
}

export function sortCollectionByImportance(aCollection: Array<unknown>) {
	return aCollection.sort((oFirstData, oSecondData) => {
		const iFirstDataImportance = getImportance(oFirstData);
		const iSecondDataImportance = getImportance(oSecondData);
		return iFirstDataImportance < iSecondDataImportance ? -1 : 1;
	});
}

export function getLeanURL(targetURL: string) {
	const url = targetURL;
	const constructFullUrl = function (query: string, url: string) {
		const fullURL = new URL(window.location.href);
		fullURL.search = query;
		fullURL.hash = url;
		return fullURL.toString();
	};

	// append appState only in the case when targetURL starts with "#"
	if ((url || "").charAt(0) !== "#") {
		return url;
	}

	let query = window.location.search;
	if (!query) {
		query = "?sap-ushell-config=lean";
	} else if (query.indexOf("sap-ushell-config=") >= -1) {
		// avoid duplicates: lean FLP opens a link again
		query += "&sap-ushell-config=lean";
	}

	return constructFullUrl(query, url);
}

/**
 * Destroys the element if it already exist with given ID
 *
 * @private
 * @param {string} id - ID of the element.
 */
export function recycleId(id: string) {
	const existingControl = UI5Element.getElementById(id);
	if (existingControl) {
		existingControl.destroy();
	}
	return id;
}
