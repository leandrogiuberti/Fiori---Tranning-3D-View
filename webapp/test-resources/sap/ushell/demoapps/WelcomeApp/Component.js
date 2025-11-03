// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/theming/Parameters",
    "sap/ushell/Container"
], (UIComponent, JSONModel, ThemingParameters, Container) => {
    "use strict";

    function getIconURI (ico) { // the icon may be "none" or "url('xxxxx')", return null or xxxxx
        const match = /url[\s]*\('?"?([^'")]*)'?"?\)/.exec(ico);
        return match ? match[1] : null;
    }

    return UIComponent.extend("sap.ushell.demoapps.WelcomeApp.Component", {
        metadata: { manifest: "json" },

        init: function () {
            const oModel = new JSONModel();
            const sUserName = Container.getUser().getFullName();
            this.getThemeIcon().then((sThemeIcon) => {
                const sIcon = getIconURI(sThemeIcon) || `${sap.ui.require.toUrl("sap.ushell")}/themes/base/img/sap_55x27.png`;
                oModel.setProperty("/iconPath", sIcon);
            });

            oModel.setProperty("/userName", sUserName);

            // get spaces
            Container.getServiceAsync("Menu").then((oMenuService) => {
                oMenuService.getMenuEntries().then((aEntries) => {
                    function filter (elem) {
                        return elem.title !== "HOME";
                    }
                    oModel.setProperty("/spaces", aEntries.filter(filter));
                });
            });

            Promise.all([
                Container.getServiceAsync("UserRecents"),
                Container.getServiceAsync("CrossApplicationNavigation"),
                Container.getServiceasync("URLParsing")
            ]).then((aResults) => {
                const oUserRecentsSrv = aResults[0];
                const oCrossAppService = aResults[1];
                const oURLParsing = aResults[2];

                // normalizes data and get things like subtitle, icon and son on....
                function normalizeHistory (aActivity, iElems) {
                    function filter (elem) {
                        return elem.title != "Home of S4";
                    }
                    aActivity = aActivity.filter(filter);
                    aActivity = aActivity.slice(0, iElems);
                    return aActivity.map((elem) => {
                        return oCrossAppService.getLinks(oURLParsing.parseShellHash(elem.url));
                    });
                }

                // get recent data:
                oUserRecentsSrv.then((userRecents) => {
                    userRecents.getRecentActivity().then((aActivity) => {
                        Promise.all(normalizeHistory(aActivity, 8)).then((aActivities) => {
                            oModel.setProperty("/recents", aActivities.flat());
                        });
                    });
                    userRecents.getFrequentActivity().then((aActivity) => {
                        Promise.all(normalizeHistory(aActivity, 4)).then((aActivities) => {
                            oModel.setProperty("/frequents", aActivities.flat());
                        });
                    });
                });

                oCrossAppService.getLinks().then((oLinks) => {
                    oModel.setProperty("/allApps", oLinks);
                });
            });

            UIComponent.prototype.init.apply(this, arguments);
            this.setModel(oModel);
        },

        getThemeIcon: function () {
            return new Promise((resolve, reject) => {
                const oParameterMap = ThemingParameters.get({
                    name: "sapUiGlobalLogo",
                    callback: resolve
                });
                if (oParameterMap) {
                    resolve(oParameterMap);
                }
            });
        }
    });
});
