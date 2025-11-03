/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
import Log from "sap/base/Log";
import Container from "sap/ushell/Container";
import Navigation, { Target } from "sap/ushell/services/Navigation";
import { FEATURE_TOGGLE_SRVC_URL, FEATURE_TOGGLES } from "./Constants";
import HttpHelper from "./HttpHelper";

interface FeatureToggle {
	key: FEATURE_TOGGLES;
	enabled: boolean;
}

interface FeatureToggleResponse {
	value: {
		ToggleId: FEATURE_TOGGLES;
		State: string;
	}[];
}

const featureToggles = new Map<FEATURE_TOGGLES, boolean>();

/**
 * Utility to check if a feature toggle is enabled.
 *
 * @param key The key of the feature toggle to check.
 * @returns Promise resolving to `true` if the feature toggle is enabled, `false` otherwise.
 */
export const isFeatureEnabled = async (key: FEATURE_TOGGLES): Promise<boolean> => {
	if (featureToggles.has(key)) {
		return featureToggles.get(key)!;
	}

	try {
		const unavailableToggles = Object.values(FEATURE_TOGGLES).filter((toggle) => !featureToggles.has(toggle));
		(await getFeatureToggles(unavailableToggles)).forEach((toggle) => featureToggles.set(toggle.key, toggle.enabled));
	} catch (error) {
		Log.error("Error fetching feature toggles", (error as Error).message);
		featureToggles.set(key, false);
	}

	return featureToggles.get(key) || false;
};

/**
 * Utility to fetch feature toggles from the server.
 *
 * @param keys An array of feature toggle keys to fetch.
 * @returns Promise resolving to an array of feature toggles.
 */
const getFeatureToggles = async (keys: FEATURE_TOGGLES[]): Promise<FeatureToggle[]> => {
	const filterExpression = `?$filter=(ToggleId eq '${keys.join("' or ToggleId eq '")}')`;
	const { value = [] } = (await HttpHelper.GetJSON(FEATURE_TOGGLE_SRVC_URL + filterExpression)) as FeatureToggleResponse;

	return keys.map((key) => ({
		key,
		enabled: value.some((toggle) => toggle.ToggleId === key && toggle.State.toUpperCase() === "X")
	}));
};

/**
 * Utility to check if a navigation target is supported when a feature toggle is enabled.
 *
 * @param featureToggleCheck A promise that resolves to true if the feature is enabled.
 * @param semanticObject Semantic object to be checked for navigation support.
 * @param action Action name for the semantic object.
 * @returns Promise resolving to `true` if navigation is supported and feature is enabled.
 */
export const isNavigationSupportedForFeature = async (featureToggle: FEATURE_TOGGLES, intent: Target): Promise<boolean> => {
	try {
		const isFeatureToggleEnabled = await isFeatureEnabled(featureToggle);
		if (!isFeatureToggleEnabled) {
			return false;
		}
		const navigationService = await Container.getServiceAsync<Navigation>("Navigation");
		const [{ supported }] = await navigationService.isNavigationSupported([intent]);

		return supported || false;
	} catch (error) {
		Log.warning(error instanceof Error ? error.message : String(error));
		return false;
	}
};
