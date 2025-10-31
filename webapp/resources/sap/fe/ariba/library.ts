import Log from "sap/base/Log";
import type { AdditionalConfiguration } from "sap/fe/core/AppComponent";
import AppComponent from "sap/fe/core/AppComponent";
import "sap/fe/core/library";
import "sap/fe/templates/library";
import Library from "sap/ui/core/Lib";
import type { ManifestContent } from "sap/ui/core/Manifest";
/**
 * Library providing the official templates supported by SAP Fiori elements.
 * @namespace
 */
export const templatesNamespace = "sap.fe.ariba";

/**
 * @namespace
 */
export const templatesLRNamespace = "sap.fe.ariba.ListReport";

/**
 * @namespace
 */
export const templatesOPNamespace = "sap.fe.ariba.ObjectPage";

const thisLib = Library.init({
	name: "sap.fe.ariba",
	apiVersion: 2,
	dependencies: ["sap.ui.core", "sap.fe.core", "sap.fe.templates"],
	types: [],
	interfaces: [],
	controls: [],
	elements: [],
	// eslint-disable-next-line no-template-curly-in-string
	version: "${version}",
	noLibraryCSS: true
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
}) as any;

thisLib.onApplicationStarted = function (manifestContent: ManifestContent["sap.ui5"]): void {
	// Check if the manifest contains controller extensions for sap.fe.templates and uses ariba lib
	const hasAribaLib = manifestContent.dependencies?.libs?.["sap.fe.ariba"] !== undefined;
	if (hasAribaLib) {
		const controllerExtensionsConfig = manifestContent.extends?.extensions?.["sap.ui.controllerExtensions"] ?? {};
		const configKeys = Object.keys(controllerExtensionsConfig);
		if (configKeys.length > 0) {
			for (const configKey of configKeys) {
				if (configKey.startsWith("sap.fe.templates")) {
					Log.warning(
						`Controller extensions for "${configKey}" need to match the target library sap.fe.ariba and not sap.fe.templates ` +
							`This is automatically adjusted here but please make the changes in your manifest file to avoid this warning in the future.`
					);
					const newKey = configKey.replace("sap.fe.templates.", "sap.fe.ariba.");
					if (controllerExtensionsConfig[newKey] === undefined) {
						controllerExtensionsConfig[newKey] = controllerExtensionsConfig[configKey];
					}
				}
			}
		}
	}
};

/**
 * Register Ariba specific configuration handler
 */
AppComponent.registerConfigurationHandlers(async (additionalConfiguration: AdditionalConfiguration) => {
	additionalConfiguration["sap.fe.macros"] = additionalConfiguration["sap.fe.macros"] ?? {};
	additionalConfiguration["sap.fe.macros"].Status = {
		invertedDefaultValue: true,
		colorMap: {
			Negative: "Indication12",
			Critical: "Indication13",
			Positive: "Indication14",
			Information: "Indication15",
			Neutral: "Indication20"
		}
	};
	return Promise.resolve();
});

AppComponent.registerInitChecks(thisLib.onApplicationStarted);

export default thisLib;
