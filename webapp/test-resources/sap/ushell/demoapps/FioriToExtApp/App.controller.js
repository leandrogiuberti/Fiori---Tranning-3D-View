// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/ui/thirdparty/hasher",
    "sap/ushell/Container"
], (
    Controller,
    History,
    UIComponent,
    JSONModel,
    hasher,
    Container
) => {
    "use strict";

    const sTarget = (window["sap-ushell-config"].ui5appruntime ? "FioriToExtAppTargetIsolated" : "FioriToExtAppTarget");
    let sXKey;
    let sIKey;
    let bUseBookmarkV2 = true;

    return Controller.extend("sap.ushell.demo.FioriToExtApp.App", {
        onInit: function () {
            const oData = {
                param1: "value1",
                param2: "value2",
                param3: "0",

                param_hrefForAppSpecificHash: "",
                param_isInitialNavigation: "",
                param_expandCompactHash: "",
                param_getDistinctSemanticObjects: "",
                param_getLinks: "",
                param_getPrimaryIntent: "",
                param_getSemanticObjectLinks: "",
                param_hrefForExternal: "",
                param_isIntentSupported: "",
                param_isNavigationSupported: "",

                param_addBookmark: "",
                param_getGroupsIdsForBookmarks: "",
                param_addBookmarkByGroupId: "",
                param_getFLPUrl: "",
                param_addCatalogTileToGroup: "",
                param_countBookmarks: "",
                param_deleteBookmarks: "",
                param_updateBookmarks: ""
            };
            let oModel;
            let oState;

            this.oBookmarkPromise = Container.getServiceAsync("BookmarkV2");
            Container.getServiceAsync("AppState").then((oService) => {
                oModel = new JSONModel(oData);
                this.getView().setModel(oModel);

                oState = oService.createEmptyAppState(undefined, false);
                oState.setData({ num: 1, str: "this is xapp-state string #1", date: new Date() });
                oState.save();
                sXKey = oState.getKey();
                oState = oService.createEmptyAppState(undefined, false);
                oState.setData({ num: 2, str: "this is iapp-state string #2", date: new Date() });
                oState.save();
                sIKey = oState.getKey();
            });

            this.getView().byId("txtDirection").setValue(History.getInstance().getDirection() || "undefined");
        },

        onSubmitToMain: function () {
            const param1Value = this.getView().getModel().getProperty("/param1");
            const param2Value = this.getView().getModel().getProperty("/param2");
            const param3Value = this.getView().getModel().getProperty("/param3");

            Container.getServiceAsync("CrossApplicationNavigation").then((oCrossApplicationNavigation) => {
                oCrossApplicationNavigation.toExternal({
                    target: {
                        semanticObject: sTarget,
                        action: "Action"
                    },
                    params: {
                        param1: param1Value,
                        param2: param2Value,
                        param3: param3Value,
                        "sap-xapp-state": sXKey,
                        "sap-iapp-state": sIKey
                    }
                });
            });
        },

        onSubmitToSecond: function () {
            const param1Value = this.getView().getModel().getProperty("/param1");
            const param2Value = this.getView().getModel().getProperty("/param2");
            const param3Value = this.getView().getModel().getProperty("/param3");

            Container.getServiceAsync("CrossApplicationNavigation").then((oCrossApplicationNavigation) => {
                oCrossApplicationNavigation.toExternal(

                    {
                        target: {
                            semanticObject: sTarget,
                            action: "Action"
                        },
                        params: {
                            param1: param1Value,
                            param2: param2Value,
                            param3: param3Value,
                            "sap-xapp-state": sXKey,
                            "sap-iapp-state": sIKey
                        },
                        appSpecificRoute: `&/Second/${param3Value}`
                    }
                );
            });
        },

        /**
         * @deprecated since 1.120
         */
        on_getGroupsIdsForBookmarks: function () {
            const that = this;

            this.oBookmarkPromise.then((oBookmarkService) => {
                oBookmarkService.getShellGroupIDs().then((result) => {
                    let actResult;
                    if (result) {
                        actResult = JSON.stringify(result);
                    } else {
                        actResult = "No result";
                    }
                    that.getView().getModel().setProperty("/param_getGroupsIdsForBookmarks", actResult);
                });
            });
        },

        on_getFLPUrl: function () {
            const that = this;
            let sHash;

            sHash = hasher.getHash().split("&/")[0];
            sHash += "&/param1=1234/param2=5678";
            hasher.replaceHash(sHash);

            setTimeout(() => {
                Container.getFLPUrl(true).then((result) => {
                    that.getView().getModel().setProperty("/param_getFLPUrl", result);
                });
            }, 50);
        },

        on_addBookmarkByGroupId: function () {
            const that = this;
            const oParameters = { title: "AddedById", url: "#FioriToExtAppTarget-Action" };
            const groupId = "group_0";

            this.oBookmarkPromise.then((oBookmarkService) => {
                oBookmarkService.addBookmarkByGroupId(oParameters, groupId).then((result) => {
                    let actResult;
                    if (result) {
                        actResult = JSON.stringify(result);
                    } else {
                        actResult = "No result";
                    }
                    that.getView().getModel().setProperty("/param_addBookmarkByGroupId", actResult);
                });
            });
        },

        on_addBookmark: function () {
            const that = this;
            const oParameters = { title: "AAA", url: "#FioriToExtAppTarget-Action" };

            // eslint-disable-next-line max-len
            const oGroup = JSON.parse('{"id":"group_0","title":"KPIs","isPreset":true,"isVisible":true,"isDefaultGroup":true,"isGroupLocked":false,"tiles":[{"id":"tile_01","title":"Test App","size":"1x1","tileType":"sap.ushell.ui.tile.DynamicTile","keywords":["profit","profit margin","sales"],"formFactor":"Desktop","chipId":"catalogTile_30","properties":{"title":"Test App","numberValue":24.8,"info":"","infoState":"Positive","numberFactor":"%","numberUnit":"NON ISOLATED","numberDigits":1,"numberState":"Positive","stateArrow":"Up","targetURL":"#AppNotIsolated-Action"}},{"id":"tile_02","title":"Test App","size":"1x1","tileType":"sap.ushell.ui.tile.DynamicTile","keywords":["profit","profit margin","sales"],"formFactor":"Desktop","chipId":"catalogTile_31","properties":{"title":"Test App","numberValue":24.8,"info":"","infoState":"Positive","numberFactor":"%","numberUnit":"ISOLATED","numberDigits":1,"numberState":"Positive","stateArrow":"Up","targetURL":"#Action-todefaultapp"}},{"id":"tile_03","title":"Letter Box","size":"1x1","tileType":"sap.ushell.ui.tile.DynamicTile","keywords":["profit","profit margin","sales"],"formFactor":"Desktop","chipId":"catalogTile_34","properties":{"title":"Letter Box","numberValue":100.8,"info":"","infoState":"Positive","numberFactor":"%","numberUnit":"ISOLATED","numberDigits":1,"numberState":"Positive","stateArrow":"Up","targetURL":"#Action-toLetterBoxing"}},{"id":"tile_04","title":"Letter Box","size":"1x1","tileType":"sap.ushell.ui.tile.DynamicTile","keywords":["profit","profit margin","sales"],"formFactor":"Desktop","chipId":"catalogTile_35","properties":{"title":"App Nav Sample","numberValue":44,"info":"","infoState":"Positive","numberFactor":"%","numberUnit":"ISOLATED","numberDigits":1,"numberState":"Positive","stateArrow":"Up","targetURL":"#Action-toappnavsample"}},{"id":"tile_08","title":"Test ToExternal App","size":"1x1","tileType":"sap.ushell.ui.tile.DynamicTile","keywords":["profit","profit margin","sales"],"formFactor":"Desktop","chipId":"catalogTile_30","properties":{"title":"Test ToExternal App","numberValue":24.8,"info":"","infoState":"Positive","numberFactor":"%","numberUnit":"NON ISOLATED","numberDigits":1,"numberState":"Positive","stateArrow":"Up","targetURL":"#FioriToExtApp-Action"}},{"id":"tile_09","title":"Test ToExternal App Target","size":"1x1","tileType":"sap.ushell.ui.tile.DynamicTile","keywords":["profit","profit margin","sales"],"formFactor":"Desktop","chipId":"catalogTile_30","properties":{"title":"Test ToExternal App Target","numberValue":24.8,"info":"","infoState":"Positive","numberFactor":"%","numberUnit":"NON ISOLATED","numberDigits":1,"numberState":"Positive","stateArrow":"Up","targetURL":"#FioriToExtAppTarget-Action"}},{"id":"tile_10","title":"Test UI5 To External App Isolated","size":"1x1","tileType":"sap.ushell.ui.tile.DynamicTile","keywords":["profit","profit margin","sales"],"formFactor":"Desktop","chipId":"catalogTile_30","properties":{"title":"Test UI5 Isolated App","numberValue":24.8,"info":"","infoState":"Positive","numberFactor":"%","numberUnit":"ISOLATED","numberDigits":1,"numberState":"Positive","stateArrow":"Up","targetURL":"#FioriToExtAppIsolated-Action"}},{"id":"tile_11","title":"Test UI5 To External App Isolated","size":"1x1","tileType":"sap.ushell.ui.tile.DynamicTile","keywords":["profit","profit margin","sales"],"formFactor":"Desktop","chipId":"catalogTile_30","properties":{"title":"Test UI5 Target Isolated App","numberValue":24.8,"info":"","infoState":"Positive","numberFactor":"%","numberUnit":"ISOLATED","numberDigits":1,"numberState":"Positive","stateArrow":"Up","targetURL":"#FioriToExtAppTargetIsolated-Action"}},{"id":"tile_12","title":"Bookmarks Isolated","size":"1x1","tileType":"sap.ushell.ui.tile.DynamicTile","keywords":["profit","profit margin","sales"],"formFactor":"Desktop","chipId":"catalogTile_12","properties":{"title":"Bookmarks Isolated","numberValue":24.8,"info":"","infoState":"Positive","numberFactor":"%","numberUnit":"ISOLATED","numberDigits":1,"numberState":"Positive","stateArrow":"Up","targetURL":"#BookmarksIsolated-Action"}},{"id":"tile_13","title":"State Isolated","size":"1x1","tileType":"sap.ushell.ui.tile.DynamicTile","keywords":["profit","profit margin","sales"],"formFactor":"Desktop","chipId":"catalogTile_13","properties":{"title":"State Isolated","numberValue":24.8,"info":"","infoState":"Positive","numberFactor":"%","numberUnit":"ISOLATED","numberDigits":1,"numberState":"Positive","stateArrow":"Up","targetURL":"#Action-toappcontextsample"}},{"title":"AAA","size":"1x1","chipId":"tile_010","tileType":"sap.ushell.ui.tile.StaticTile","id":"tile_010","isLinkPersonalizationSupported":true,"keywords":[],"properties":{"icon":"sap-icon://time-entry-request","title":"AAA","targetURL":"#FioriToExtAppTarget-Action"}},{"title":"AAA","size":"1x1","chipId":"tile_011","tileType":"sap.ushell.ui.tile.StaticTile","id":"tile_011","isLinkPersonalizationSupported":true,"keywords":[],"properties":{"icon":"sap-icon://time-entry-request","title":"AAA","targetURL":"#FioriToExtAppTarget-Action"}}]}');

            this.oBookmarkPromise.then((oBookmarkService) => {
                oBookmarkService.addBookmark(oParameters, oGroup).then((result) => {
                    let actResult;
                    if (result) {
                        actResult = JSON.stringify(result);
                    } else {
                        actResult = "No result";
                    }
                    that.getView().getModel().setProperty("/param_addBookmark", actResult);
                });
            });
        },

        on_addCatalogTileToGroup: function () {
            const that = this;
            const sCatalogTileId = "tile_01";
            const sGroupId = "test_catalog_00";
            const oCatalogData = {
                baseUrl: "/test/base/path",
                remoteId: "test_catalog_01"
            };

            this.oBookmarkPromise.then((oBookmarkService) => {
                oBookmarkService.addCatalogTileToGroup(sCatalogTileId, sGroupId, oCatalogData).then((result) => {
                    let actResult;
                    if (result) {
                        actResult = result;
                    } else {
                        actResult = "No result";
                    }
                    that.getView().getModel().setProperty("/param_addCatalogTileToGroup", actResult);
                });
            });
        },

        on_countBookmarks: function () {
            const that = this;
            const sUrl = "#FioriToExtAppTarget-Action";

            this.oBookmarkPromise.then((oBookmarkService) => {
                oBookmarkService.countBookmarks(sUrl).then((result) => {
                    let actResult;
                    if (result) {
                        actResult = result;
                    } else {
                        actResult = "No result";
                    }
                    that.getView().getModel().setProperty("/param_countBookmarks", actResult);
                });
            });
        },

        on_deleteBookmarks: function () {
            const that = this;
            const sUrl = "#FioriToExtAppTarget-Action";

            this.oBookmarkPromise.then((oBookmarkService) => {
                oBookmarkService.deleteBookmarks(sUrl).then((result) => {
                    let actResult;
                    if (result) {
                        actResult = result;
                    } else {
                        actResult = "No result";
                    }
                    that.getView().getModel().setProperty("/param_deleteBookmarks", actResult);
                });
            });
        },

        on_updateBookmarks: function () {
            const that = this;
            const sUrl = "#FioriToExtAppTarget-Action";
            const oParameters = {
                title: "BBB"
            };

            this.oBookmarkPromise.then((oBookmarkService) => {
                oBookmarkService.updateBookmarks(sUrl, oParameters).then((result) => {
                    let actResult;
                    if (result) {
                        actResult = result;
                    } else {
                        actResult = "No result";
                    }
                    that.getView().getModel().setProperty("/param_updateBookmarks", actResult);
                });
            });
        },

        on_backToPreviousApp: function () {
            Container.getServiceAsync("CrossApplicationNavigation").then((oCrossApplicationNavigation) => {
                oCrossApplicationNavigation.backToPreviousApp({});
            });
        },

        on_expandCompactHash: function () {
            const that = this;

            Container.getServiceAsync("CrossApplicationNavigation").then((oCrossApplicationNavigation) => {
                oCrossApplicationNavigation.expandCompactHash("#SO-action?AAA=444&sap-intent-param=&AAA=333&CCC=DDD").done((sExpandedHash) => {
                    that.getView().getModel().setProperty("/param_expandCompactHash", sExpandedHash);
                    // equal(sExpandedHash,"#SO-action?AAA=444&AAA=333&CCC=DDD", "expanded OK");
                });
            });
        },

        on_getDistinctSemanticObjects: function () {
            const that = this;
            Container.getServiceAsync("CrossApplicationNavigation").then((oCrossApplicationNavigation) => {
                oCrossApplicationNavigation.getDistinctSemanticObjects().done((result) => {
                    let actResult;
                    if (result) {
                        actResult = result;
                    } else {
                        actResult = "No result";
                    }
                    that.getView().getModel().setProperty("/param_getDistinctSemanticObjects", actResult);
                });
            });
        },

        on_getLinks: function () {
            const that = this;
            const params = {
                param1: "value1",
                param2: "value2",
                param3: 0
            };
            const oObject = {};
            Container.getServiceAsync("CrossApplicationNavigation").then((oCrossApplicationNavigation) => {
                oCrossApplicationNavigation.getLinks({
                    semanticObject: "FioriToExtAppTarget",
                    params: params,
                    paramsOptions: [],
                    ignoreFormFactor: true,
                    ui5Component: oObject
                }).done((result) => {
                    let actResult;
                    if (result) {
                        actResult = result[0].intent;
                    } else {
                        actResult = "No result";
                    }
                    that.getView().getModel().setProperty("/param_getLinks", actResult);
                });
            });
        },

        on_getPrimaryIntent: function () {
            const that = this;
            const SO = "FioriToExtAppTarget";
            const params = {
                param1: "value1",
                param2: "value2",
                param3: 0
            };

            Container.getServiceAsync("CrossApplicationNavigation").then((oCrossApplicationNavigation) => {
                oCrossApplicationNavigation.getPrimaryIntent(SO, params).done((result) => {
                    let actResult;
                    if (result) {
                        actResult = result.intent;
                    } else {
                        actResult = "No result";
                    }
                    that.getView().getModel().setProperty("/param_getPrimaryIntent", actResult);
                });
            });
        },

        on_getSemanticObjectLinks: function () {
            const that = this;
            const mParameters = {
                param1: "value1",
                param2: "value2",
                param3: 0
            };
            const sAppState = "ANAPSTATE";
            const oObject = {};

            Container.getServiceAsync("CrossApplicationNavigation").then((oCrossApplicationNavigation) => {
                oCrossApplicationNavigation.getSemanticObjectLinks(
                    "FioriToExtAppTarget", mParameters, true, oObject, sAppState).done((result) => {
                    let actResult;
                    if (result) {
                        actResult = result[0].intent;
                    } else {
                        actResult = "No result";
                    }
                    that.getView().getModel().setProperty("/param_getSemanticObjectLinks", actResult);
                });
            });
        },

        on_historyBack: function () {
            Container.getServiceAsync("CrossApplicationNavigation").then((oCrossApplicationNavigation) => {
                oCrossApplicationNavigation.historyBack({});
            });
        },

        on_hrefForAppSpecificHash: function () {
            const hash = "View1/";

            Container.getServiceAsync("CrossApplicationNavigation").then((oCrossApplicationNavigation) => {
                const res = oCrossApplicationNavigation.hrefForAppSpecificHash(hash);
                this.getView().getModel().setProperty("/param_hrefForAppSpecificHash", res);
            });
        },

        on_hrefForExternal: function () {
            const oComponent = new UIComponent();
            const oArgs = { target: { shellHash: "#" } };

            Container.getServiceAsync("CrossApplicationNavigation").then((oCrossApplicationNavigation) => {
                const res = oCrossApplicationNavigation.hrefForExternal(oArgs, oComponent, false);
                this.getView().getModel().setProperty("/param_hrefForExternal", res);
                // equal(oRes,"#","parameter not added!");
                // ok(oRes.indexOf("sap-ushell-enc-test=A%2520B%252520C") === -1," parameter added");
            });
        },

        on_isInitialNavigation: function () {
            Container.getServiceAsync("CrossApplicationNavigation").then((oCrossApplicationNavigation) => {
                const res = oCrossApplicationNavigation.isInitialNavigation();
                this.getView().getModel().setProperty("/param_isInitialNavigation", res);
            });
        },

        on_isIntentSupported: function () {
            const that = this;
            const oComponent = new UIComponent();
            const aIntents = ["#SO-act2?sap-system=CC2"];

            Container.getServiceAsync("CrossApplicationNavigation").then((oCrossApplicationNavigation) => {
                oCrossApplicationNavigation.isIntentSupported(aIntents, oComponent).done((result) => {
                    // that.getView().getModel().setProperty("/param_isIntentSupported", "promise resolved"); //result[0].description); //"promise resolved");
                    let actResult;
                    if (result) {
                        actResult = `${Object.keys(result)[0]} - ${result[Object.keys(result)[0]].supported}`;
                    } else {
                        actResult = "No result";
                    }
                    that.getView().getModel().setProperty("/param_isIntentSupported", actResult);
                });
            });
        },

        on_isNavigationSupported: function () {
            const that = this;
            const oComponent = new UIComponent();
            const aIntents = ["#SO-act2?sap-system=CC2"];

            Container.getServiceAsync("CrossApplicationNavigation").then((oCrossApplicationNavigation) => {
                oCrossApplicationNavigation.isNavigationSupported(aIntents, oComponent).done((result) => {
                    // that.getView().getModel().setProperty("/param_isNavigationSupported", "promise resolved"); //result[0].description); //"promise resolved");
                    let actResult;
                    if (result) {
                        actResult = result[0].supported;
                    } else {
                        actResult = "No result";
                    }
                    that.getView().getModel().setProperty("/param_isNavigationSupported", actResult);
                });
            });
        },

        onUseV2Service: function () {
            const oButton = this.getView().byId("useV2Service");
            if (bUseBookmarkV2) {
                oButton.setText("'Bookmark' Service is now used. Change to 'BookmarkV2'");
                this.oBookmarkPromise = Container.getServiceAsync("Bookmark");
            } else {
                oButton.setText("'BookmarkV2' Service is now used. Change to old 'Bookmark'");
                this.oBookmarkPromise = Container.getServiceAsync("BookmarkV2");
            }
            bUseBookmarkV2 = !bUseBookmarkV2;
        }
    });
}, /* bExport= */ false);
