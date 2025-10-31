/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
import Container from "sap/ushell/Container";
import EventHub from "sap/ushell/EventHub";
import AppLifeCycle from "sap/ushell/services/AppLifeCycle";
import utils from "sap/ushell/utils";
import BaseContainer from "../BaseContainer";
import Layout from "../Layout";

type ElementInfo = {
	name: keyof typeof UIElements;
	startMarked: boolean;
	endMarked: boolean;
	control?: Layout | BaseContainer;
};

const layoutElement = "sap.cux.home.Layout";
const homePageLoadStartMarker = "FLP-TTI-Homepage-Custom-Start";
const homePageLoadEndMarker = "FLP-TTI-Homepage-Custom";
let setupTracking = false;

/**
 * An object representing the UI elements and their corresponding marker names.
 *
 */
export const UIElements = {
	"sap.cux.home.AppsContainer": "Apps",
	"sap.cux.home.InsightsContainer": "Insights",
	"sap.cux.home.NewsAndPagesContainer": "News",
	"sap.cux.home.ToDosContainer": "ToDos",
	[layoutElement]: "Layout"
};

let availableElements: ElementInfo[] = Object.keys(UIElements).map((elementName) => ({
	name: elementName as keyof typeof UIElements,
	startMarked: false,
	endMarked: false
}));

/**
 * Checks if the current application is the home app.
 *
 * @returns {Promise<boolean>} - A promise that resolves to true if the current application is the home app, otherwise false.
 */
async function isHomeApp(): Promise<boolean> {
	const container = await Container.getServiceAsync<AppLifeCycle>("AppLifeCycle");
	return container.getCurrentApplication()?.homePage as boolean;
}

/**
 * Records the start of the homepage load.
 *
 * @returns {Promise<void>} - A promise that resolves when the start of the homepage load is recorded.
 */
async function markHomePageStart(): Promise<void> {
	if (await isHomeApp()) {
		recordElementLoadStart(layoutElement, homePageLoadStartMarker);
	}
}

/**
 * Records the end of the homepage load.
 *
 * @returns {Promise<void>} - A promise that resolves when the end of the homepage load is recorded.
 */
async function markHomePageEnd(): Promise<void> {
	if (await isHomeApp()) {
		recordElementLoadEnd(layoutElement, homePageLoadEndMarker);
		EventHub.emit("CustomHomeRendered");
	}
}

/**
 * Finds the UI element information by container name.
 *
 * @param {keyof typeof UIElements} containerName - The name of the container.
 * @returns {ElementInfo | undefined} - The element information if found, otherwise undefined.
 */
function findUIElement(containerName: keyof typeof UIElements): ElementInfo | undefined {
	return availableElements.find((heroElement) => heroElement.name === containerName);
}

/**
 * Sets a performance mark with the given name.
 *
 * @param {string} markName - The name of the performance mark.
 */
function setPerformanceMark(markName: string): void {
	utils.setPerformanceMark(markName, {
		bUseUniqueMark: true,
		bUseLastMark: true
	});
}

/**
 * Records the load of an element.
 *
 * @param {keyof typeof UIElements} containerName - The name of the container.
 * @param {string} [customMarkName] - The custom mark name.
 * @param {boolean} [isStartMaker] - Indicates if it is a start marker.
 */
function recordElementLoad(containerName: keyof typeof UIElements, customMarkName?: string, isStartMaker?: boolean): void {
	const element = findUIElement(containerName);
	const marker = isStartMaker ? "Start" : "End";
	const controlFlag = isStartMaker ? "startMarked" : "endMarked";

	if (element && !element[controlFlag] && element.control?.getVisible()) {
		element[controlFlag] = true;
		setPerformanceMark(customMarkName || `FLP-Homepage-Section-${marker}[${UIElements[containerName]}]`);
	}
}

/**
 * Sets up performance tracking for the given layout.
 *
 * @param {Layout} layout - The layout object containing the UI elements.
 */
export async function setupPerformanceTracking(layout: Layout): Promise<void> {
	if (!layout || setupTracking) return;

	const containers = layout.getItems();
	containers.forEach((container) => {
		container.getContent().forEach((panel) => {
			panel.attachEventOnce("loaded", async () => {
				const containerName = container.getMetadata().getName();
				const heroElement = availableElements.filter((availableElement) => availableElement.control?.getVisible())[0].name;

				// If the hero element is loaded, mark the end of the homepage load
				if (containerName === heroElement) {
					await markHomePageEnd();
				}
			});
		});
	});

	const visibleElements = availableElements.filter((availableElement) => {
		availableElement.control =
			availableElement.name === layoutElement
				? layout
				: containers.find((container) => container.getMetadata().getName() === availableElement.name);
		return availableElement.control?.getVisible();
	});

	// record homepage start
	setupTracking = true;
	await markHomePageStart();

	// record homepage end in case of no visible elements except layout
	if (visibleElements.length === 1) {
		await markHomePageEnd();
	}
}

/**
 * Records the start of the element load.
 *
 * @param {keyof typeof UIElements} containerName - The name of the container.
 * @param {string} [customMarkName] - The custom mark name.
 */
export function recordElementLoadStart(containerName: keyof typeof UIElements, customMarkName?: string): void {
	recordElementLoad(containerName, customMarkName, true);
}

/**
 * Records the end of the element load.
 *
 * @param {keyof typeof UIElements} containerName - The name of the container.
 * @param {string} [customMarkName] - The custom mark name.
 */
export function recordElementLoadEnd(containerName: keyof typeof UIElements, customMarkName?: string): void {
	recordElementLoad(containerName, customMarkName, false);
}
