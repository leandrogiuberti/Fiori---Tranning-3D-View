// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/util/ObjectPath"
], (ObjectPath) => {
    "use strict";

    function extractThemeDataFromConfig (oUshellConfig) {
        const oContainerAdapterConfig = ObjectPath.get("services.Container.adapter.config", oUshellConfig);
        return {
            sDefaultTheme: ObjectPath.get("userProfile.defaults.theme", oContainerAdapterConfig),
            sPersonalizedTheme: ObjectPath.get("userProfilePersonalization.theme", oContainerAdapterConfig),
            oRangeTheme: ObjectPath.get("userProfile.metadata.ranges.theme", oContainerAdapterConfig)
        };
    }

    function getValidTheme (oUshellConfig) {
        const oThemeData = extractThemeDataFromConfig(oUshellConfig);
        const sPersonalizedTheme = oThemeData.sPersonalizedTheme;
        const oRangeTheme = oThemeData.oRangeTheme;
        const sDefaultTheme = oThemeData.sDefaultTheme;

        if (oThemeData.oRangeTheme) {
            // Range of themes contains boot theme
            if (Object.keys(oRangeTheme).indexOf(sPersonalizedTheme) > -1) {
                const oPersonalizedTheme = oRangeTheme[sPersonalizedTheme] || {};
                return { theme: sPersonalizedTheme, root: oPersonalizedTheme.themeRoot };
            }
            // return DefaultTheme
            const oDefaultTheme = oRangeTheme[sDefaultTheme] || {};
            return {
                theme: sDefaultTheme,
                root: oDefaultTheme.themeRoot
            };
        }
        // stay compatible
        const sAppliedTheme = sPersonalizedTheme || sDefaultTheme;
        return {
            theme: sAppliedTheme, root: ""
        };
    }

    return getValidTheme;
});
