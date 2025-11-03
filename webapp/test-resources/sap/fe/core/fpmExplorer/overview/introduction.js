/**
 * Learn More button handler module for the SAP Fiori Elements introduction page.
 * Handles navigation functionality for Learn More buttons in different sections.
 */

/**
 * Navigation configuration for Learn More buttons.
 * Maps section types to their corresponding documentation URLs.
 */
const learnMoreConfig = {
	floorplans: "floorplans/floorplans",
	// floorplans: "../index.html#/topic/floorplanListReport/simpleListReport",
	customLayout: "controllerExtensions/customPage"
};

/**
 * Navigation configuration for fieldInput links.
 * Maps link types to their corresponding topic URLs.
 */
const buildingBlockConfig = {
	field: "buildingBlocks/fieldDefault",
	form: "buildingBlocks/formDefault",
	table: "buildingBlocks/tableDefault",
	filterbar: "buildingBlocks/filterBarDefault",
	chart: "buildingBlocks/chartDefault"
};

/**
 * Handles Learn More button click navigation.
 * Opens the target URL based on the button's data-section attribute.
 * @param event The click event from the Learn More button
 */
function handleLearnMoreClick(event) {
	const button = event.currentTarget;
	const sectionType = button.getAttribute("data-section");
	const targetUrl = learnMoreConfig[sectionType];

	if (targetUrl) {
		window.parent.postMessage({ type: "navigateToTopic", topic: targetUrl });
	}
}

/**
 * Handles fieldInput link click navigation.
 * Prevents default anchor behavior and uses postMessage for navigation.
 * @param event The click event from the fieldInput link
 */
function handlebuildingBlockClick(event) {
	event.preventDefault();

	const link = event.currentTarget;
	const linkType = link.getAttribute("data-link-type");
	const targetUrl = buildingBlockConfig[linkType];

	if (targetUrl) {
		window.parent.postMessage({ type: "navigateToTopic", topic: targetUrl });
	}
}

/**
 * Handles keyboard events for Learn More buttons to ensure accessibility.
 * Triggers navigation when Enter or Space key is pressed.
 * @param event The keyboard event from the Learn More button
 */
function handleLearnMoreKeydown(event) {
	if (event.key === "Enter" || event.key === " ") {
		event.preventDefault();
		handleLearnMoreClick(event);
	}
}

/**
 * Handles keyboard events for fieldInput links to ensure accessibility.
 * Triggers navigation when Enter key is pressed.
 * @param event The keyboard event from the fieldInput link
 */
function handlebuildingBlockKeydown(event) {
	if (event.key === "Enter") {
		event.preventDefault();
		handlebuildingBlockClick(event);
	}
}

/**
 * Initializes Learn More button functionality when DOM is loaded.
 * Sets up event listeners for click and keyboard interactions.
 */
function initializeLearnMoreButtons() {
	const learnMoreButtons = document.querySelectorAll(".learn-more-btn");

	learnMoreButtons.forEach(function (button) {
		button.addEventListener("click", handleLearnMoreClick);
		button.addEventListener("keydown", handleLearnMoreKeydown);
	});
}

/**
 * Initializes fieldInput link functionality when DOM is loaded.
 * Sets up event listeners for click and keyboard interactions.
 */
function initializebuildingBlocks() {
	const buildingBlocks = document.querySelectorAll("a[data-link-type]");

	buildingBlocks.forEach(function (link) {
		link.addEventListener("click", handlebuildingBlockClick);
		link.addEventListener("keydown", handlebuildingBlockKeydown);
	});
}

/**
 * Initialize all modules when DOM content is loaded.
 */
function initializeNavigation() {
	initializeLearnMoreButtons();
	initializebuildingBlocks();
}

/**
 * Initialize the module when DOM content is loaded.
 */
document.addEventListener("DOMContentLoaded", initializeNavigation);
