/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
import Log from "sap/base/Log";
import Formatting from "sap/base/i18n/Formatting";
import { Priority } from "sap/m/library";
import Locale from "sap/ui/core/Locale";
import DateFormat from "sap/ui/core/format/DateFormat";
import { Response } from "../ToDoPanel";

interface UserInfo {
	Email?: string;
}

export enum TaskPriority {
	VERY_HIGH = "VERY_HIGH",
	HIGH = "HIGH",
	MEDIUM = "MEDIUM",
	LOW = "LOW"
}

const userInfo: Record<string, UserInfo> = {};

/**
 * Get the task URL for a given task.
 *
 * @private
 * @param {string} originId - The origin ID of the task.
 * @param {string} instanceId - The instance ID of the task.
 * @returns {string} The task URL.
 */
export function getTaskUrl(originId: string, instanceId: string, targetAppUrl: string): string {
	const taskInstanceURL = `?showAdditionalAttributes=true&/detail/${originId}/${instanceId}/TaskCollection(SAP__Origin='${originId}',InstanceID='${instanceId}')`;

	return targetAppUrl + taskInstanceURL;
}

/**
 * Fetches user details if required.
 *
 * @private
 * @param {string} originId - The origin ID.
 * @param {string} userId - The user ID.
 * @returns {Promise<UserInfo>} - A promise that resolves to the user information.
 */
export function fetchUserDetails(originId: string, userId: string): Promise<UserInfo> {
	if (Object.keys(userInfo).includes(userId)) {
		return Promise.resolve(userInfo[userId]);
	} else {
		return _fetchUserInfo(originId, userId);
	}
}

/**
 * Fetches user information for a specific user.
 *
 * @private
 * @param {string} originId - The origin ID.
 * @param {string} userId - The user ID.
 * @returns {Promise<UserInfo>} - A promise that resolves to the user information.
 */
async function _fetchUserInfo(originId: string, userId: string): Promise<UserInfo> {
	try {
		const response = await fetch(
			`/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/UserInfoCollection(SAP__Origin='${originId}',UniqueName='${userId}')?$format=json`
		);

		if (!response.ok) {
			throw new Error(`Failed to Fetch User Info for: ${userId}`);
		}

		const { d: data } = (await response.json()) as Response;
		userInfo[userId] = data as UserInfo;
		return userInfo[userId];
	} catch (error: unknown) {
		Log.error(error instanceof Error ? error.message : String(error));
		return {};
	}
}

/**
 * Check whether given dateString is of format YYYYMMDD and is a valid value for Date object.
 *
 * @param {string} dateString - The datestring to be checked for validity
 * @returns {Date} if its a valid date return the date else false
 * @private
 */
function _isValidDate(dateString: string): boolean {
	// Check if the input has the correct length
	if (dateString.length !== 8) {
		return false;
	}

	// Parse the date components
	const year = parseInt(dateString.slice(0, 4), 10);
	const month = parseInt(dateString.slice(4, 6), 10) - 1;
	const day = parseInt(dateString.slice(6), 10);

	// Create a Date object with the parsed components
	const date = new Date(year, month, day);

	// Check if the parsed date is valid
	return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day;
}

/**
 * Parses different time formats supplied from the back-ends. It returns UNIX time stamp in milliseconds.
 * If Time Format contains unexpected symbols or Format is not recognized NaN is returned.
 * Referenced from: cross.fnd.fiori.inbox.CustomAttributeComparator
 *
 * @param {string | number} time date format to be parsed. If int UNIX time stamp in milliseconds is assumed.
 * @returns {number} UNIX time stamp in milliseconds. (milliseconds that have elapsed since 00:00:00 UTC, Thursday, 1 January 1970)
 * @private
 */
function _getParsedTime(time: string | number): number {
	if (time == null || time === "00000000") {
		return NaN;
	}

	if (typeof time === "number") {
		return time;
	}

	// Check for various time formats
	const dateRegex = /\/(Date)\((\d+)\)\//;
	const yyyymmddRegex = /^\d{8}$/;
	const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|([+-])(\d{2}):(\d{2}))?$/;

	const dateMatch = time.match(dateRegex);
	if (dateMatch) {
		// Time Format "/Date(869080830000)/"
		return parseInt(dateMatch[2], 10);
	}

	if (yyyymmddRegex.test(time) && _isValidDate(time)) {
		// Time Format "YYYYMMDD" (Old TGW format)
		const parsedDate = DateFormat.getDateInstance().parse(time);
		return parsedDate instanceof Date ? parsedDate.getTime() : NaN;
	}

	const isoMatch = time.match(isoRegex);
	if (isoMatch) {
		// Time Format "2018-01-05T00:00:00" (BPM and TGW-cloud format, UTC)
		return new Date(time).getTime();
	}

	return NaN;
}

/**
 * Format a date string to a custom date and time format.
 *
 * @private
 * @param {string} dateStr - The date string to format.
 * @param {string} pattern - The pattern to be used for formatting the date.
 * @returns {string} The formatted date string.
 */
export function formatDate(dateStr: string, pattern: string = Formatting.getDatePattern("short") || "dd/MM/yyyy"): string {
	const locale = new Locale(Formatting.getLanguageTag().language);
	const dateFormat = DateFormat.getDateTimeInstance({ pattern }, locale);
	const value = _getParsedTime(dateStr);
	let formattedDate = "";

	if (!isNaN(value)) {
		formattedDate = dateFormat.format(new Date(value));
	}

	return formattedDate;
}

/**
 * Convert a priority string to a corresponding priority value.
 *
 * @private
 * @param {TaskPriority} priority - The task priority string.
 * @returns {string} The corresponding priority value.
 */
export function getPriority(priority: TaskPriority): Priority {
	if (priority === TaskPriority.VERY_HIGH) {
		return Priority.VeryHigh ? Priority.VeryHigh : Priority.None;
	} else if (priority === TaskPriority.HIGH) {
		return Priority.High;
	} else if (priority === TaskPriority.MEDIUM) {
		return Priority.Medium;
	} else if (priority === TaskPriority.LOW) {
		return Priority.Low;
	} else {
		return Priority.None;
	}
}
