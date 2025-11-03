/**
 * SAP Fiori Tools navigation handler module for the overview page.
 * Handles navigation functionality for tool images and documentation buttons.
 */

/**
 * Navigation configuration for SAP Fiori Tools images.
 * Maps tool types to their corresponding help documentation URLs.
 */
const toolsNavigationConfig = {
	"sap-fiori-generator":
		"https://help.sap.com/docs/SAP_FIORI_tools/17d50220bcd848aa854c9c182d65b699/db44d45051794d778f1dd50def0fa267.html",
	"application-modeler":
		"https://help.sap.com/docs/SAP_FIORI_tools/17d50220bcd848aa854c9c182d65b699/a9c004397af5461fbf765419fc1d606a.html",
	"guided-development":
		"https://help.sap.com/docs/SAP_FIORI_tools/17d50220bcd848aa854c9c182d65b699/0c9e518ecf704b2f80a2bed0eaca60ae.html",
	"service-modeler": "https://help.sap.com/docs/SAP_FIORI_tools/17d50220bcd848aa854c9c182d65b699/58784b52f2284532afe2ab161e0312c9.html",
	"xml-annotation-language-server":
		"https://help.sap.com/docs/SAP_FIORI_tools/17d50220bcd848aa854c9c182d65b699/c5d62cabf74943ac901e23671bf756fa.html",
	"guided-answers": "https://ga.support.sap.com/index.html#/tree/3046/actions/45995",
	"ui5-language-assistant": "https://marketplace.visualstudio.com/items?itemName=SAPOSS.vscode-ui5-language-assistant"
};

/**
 * Navigation configuration for external documentation links.
 * Maps button types to their corresponding external URLs.
 */
const documentationConfig = {
	helpPortal: "https://help.sap.com/docs/SAP_FIORI_tools"
};

/**
 * Handles tool image click navigation.
 * Prevents default anchor behavior and opens documentation in new tab.
 * @param event The click event from the tool image link
 */
function handleToolImageClick(event) {
	event.preventDefault();

	const link = event.currentTarget;
	const toolType = link.getAttribute("data-tool-type");
	const targetUrl = toolType ? toolsNavigationConfig[toolType] : undefined;

	if (targetUrl) {
		window.open(targetUrl, "_blank", "noopener,noreferrer");
	}
}

/**
 * Handles external navigation for documentation buttons.
 * Opens the target URL in a new browser tab.
 * @param event The click event from the documentation button
 */
function handleDocumentationNavigation(event) {
	const button = event.currentTarget;
	const targetUrl = button.getAttribute("data-url") ?? documentationConfig.helpPortal;

	if (targetUrl) {
		window.open(targetUrl, "_blank", "noopener,noreferrer");
	}
}

/**
 * Handles keyboard events for tool images to ensure accessibility.
 * Triggers navigation when Enter key is pressed.
 * @param event The keyboard event from the tool image link
 */
function handleToolImageKeydown(event) {
	if (event.key === "Enter") {
		event.preventDefault();
		handleToolImageClick(event);
	}
}

/**
 * Handles keyboard events for documentation buttons to ensure accessibility.
 * Triggers navigation when Enter or Space key is pressed.
 * @param event The keyboard event from the documentation button
 */
function handleDocumentationKeydown(event) {
	if (event.key === "Enter" || event.key === " ") {
		event.preventDefault();
		handleDocumentationNavigation(event);
	}
}

/**
 * Initializes tool image navigation functionality when DOM is loaded.
 * Sets up event listeners for click and keyboard interactions.
 */
function initializeToolImageNavigation() {
	const toolImages = document.querySelectorAll(".cardToolsImages[data-tool-type]");

	toolImages.forEach(function (toolImage) {
		toolImage.addEventListener("click", handleToolImageClick);
		toolImage.addEventListener("keydown", handleToolImageKeydown);
	});
}

/**
 * Initializes documentation button functionality when DOM is loaded.
 * Sets up event listeners for click and keyboard interactions.
 */
function initializeDocumentationButtons() {
	const documentationButtons = document.querySelectorAll(".visit-docu-btn");

	documentationButtons.forEach(function (button) {
		button.addEventListener("click", handleDocumentationNavigation);
		button.addEventListener("keydown", handleDocumentationKeydown);
	});
}

/**
 * Initialize all navigation modules when DOM content is loaded.
 */
function initializeFioriToolsNavigation() {
	initializeToolImageNavigation();
	initializeDocumentationButtons();
}

/**
 * Initialize the module when DOM content is loaded.
 */
document.addEventListener("DOMContentLoaded", initializeFioriToolsNavigation);
