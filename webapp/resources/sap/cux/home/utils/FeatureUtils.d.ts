declare module "sap/cux/home/utils/FeatureUtils" {
    import { Target } from "sap/ushell/services/Navigation";
    import { FEATURE_TOGGLES } from "sap/cux/home/utils/Constants";
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
    const featureToggles: Map<FEATURE_TOGGLES, boolean>;
    /**
     * Utility to check if a feature toggle is enabled.
     *
     * @param key The key of the feature toggle to check.
     * @returns Promise resolving to `true` if the feature toggle is enabled, `false` otherwise.
     */
    const isFeatureEnabled: (key: FEATURE_TOGGLES) => Promise<boolean>;
    /**
     * Utility to fetch feature toggles from the server.
     *
     * @param keys An array of feature toggle keys to fetch.
     * @returns Promise resolving to an array of feature toggles.
     */
    const getFeatureToggles: (keys: FEATURE_TOGGLES[]) => Promise<FeatureToggle[]>;
    /**
     * Utility to check if a navigation target is supported when a feature toggle is enabled.
     *
     * @param featureToggleCheck A promise that resolves to true if the feature is enabled.
     * @param semanticObject Semantic object to be checked for navigation support.
     * @param action Action name for the semantic object.
     * @returns Promise resolving to `true` if navigation is supported and feature is enabled.
     */
    const isNavigationSupportedForFeature: (featureToggle: FEATURE_TOGGLES, intent: Target) => Promise<boolean>;
}
//# sourceMappingURL=FeatureUtils.d.ts.map