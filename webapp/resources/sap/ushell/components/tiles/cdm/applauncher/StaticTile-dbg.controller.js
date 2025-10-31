// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/library",
    "sap/ui/core/mvc/Controller",
    "sap/ushell/Config",
    "sap/ushell/utils/WindowUtils",
    "sap/ui/model/json/JSONModel",
    "sap/m/library",
    "sap/base/Log",
    "sap/ushell/utils/UrlParsing",
    "sap/ushell/EventHub",
    "sap/ushell/Container",
    "sap/ushell/navigation/NavigationState"
], (
    ushellLibrary,
    Controller,
    Config,
    WindowUtils,
    JSONModel,
    mobileLibrary,
    Log,
    UrlParsing,
    EventHub,
    Container,
    NavigationState
) => {
    "use strict";

    // shortcut for sap.m.GenericTileScope
    const GenericTileScope = mobileLibrary.GenericTileScope;

    // shortcut for sap.m.GenericTileMode
    const GenericTileMode = mobileLibrary.GenericTileMode;

    // shortcut for sap.ushell.DisplayFormat
    const DisplayFormat = ushellLibrary.DisplayFormat;

    // shortcut for sap.ushell.AppType
    const AppType = ushellLibrary.AppType;

    /* global hasher */

    return Controller.extend("sap.ushell.components.tiles.cdm.applauncher.StaticTile", {
        _aDoables: [],

        _getConfiguration: function () {
            const oConfig = this.getView().getViewData();
            oConfig.properties.configSizeBehavior = Config.last("/core/home/sizeBehavior");
            oConfig.properties.wrappingType = Config.last("/core/home/wrappingType");
            return oConfig;
        },

        onInit: function () {
            const oView = this.getView();
            const oModel = new JSONModel();
            oModel.setData(this._getConfiguration());

            // set model, add content
            oView.setModel(oModel);
            // listen for changes of the size behavior, as the end user can change it in the settings (if enabled)
            this._aDoables.push(Config.on("/core/home/sizeBehavior").do((sSizeBehavior) => {
                oModel.setProperty("/properties/configSizeBehavior", sSizeBehavior);
            }));

            const oViewData = this.getView().getViewData();
            const oViewDataProperties = oViewData.properties;

            oViewDataProperties.mode = oViewDataProperties.mode || (oViewDataProperties.icon ? "ContentMode" : "HeaderMode");

            if (oViewDataProperties.displayFormat === DisplayFormat.Compact &&
                oViewDataProperties.title && oViewDataProperties.targetURL) {
                oModel.setProperty("/properties/mode", GenericTileMode.LineMode);
            }

            switch (oViewDataProperties.displayFormat) {
                case DisplayFormat.Flat:
                    oModel.setProperty("/properties/frameType", "OneByHalf");
                    break;
                case DisplayFormat.FlatWide:
                    oModel.setProperty("/properties/frameType", "TwoByHalf");
                    break;
                case DisplayFormat.StandardWide:
                    oModel.setProperty("/properties/frameType", "TwoByOne");
                    break;
                default: {
                    oModel.setProperty("/properties/frameType", "OneByOne");
                }
            }

            const bProviderInfoEnabled = Config.last("/core/contentProviders/providerInfo/enabled");
            const bShowProviderInfoInSystemInfo = Config.last("/core/contentProviders/providerInfo/showContentProviderInfoOnVisualizations");

            oModel.setProperty("/properties/showContentProviderInfoInTooltip", bProviderInfoEnabled);
            oModel.setProperty("/properties/showContentProviderInfoOnVisualizations", bProviderInfoEnabled && bShowProviderInfoInSystemInfo);

            if (bProviderInfoEnabled) {
                // listen for changes of the "showContentProviderInfoOnVisualizations" config,
                // as the end user can change it in the settings (if enabled)
                this._aDoables.push(Config.on("/core/contentProviders/providerInfo/showContentProviderInfoOnVisualizations")
                    .do((bShowContentProviderInfoOnVisualizations) => {
                        oModel.setProperty("/properties/showContentProviderInfoOnVisualizations", bShowContentProviderInfoOnVisualizations);
                    })
                );
            }
        },

        onExit: function () {
            this._aDoables.forEach((oDoable) => {
                oDoable.off();
            });
            this._aDoables = [];
        },

        /**
         * Sets the scope property to the model according to the value of "editable".
         *
         * @param {boolean} editable Indicating if edit mode should be active.
         */
        editModeHandler: function (editable) {
            const sScope = editable ? GenericTileScope.ActionMore : GenericTileScope.Display;
            this.getView().getModel().setProperty("/properties/scope", sScope);
        },

        /**
         * Sets the sizeBehavior to the model.
         *
         * @param {sap.m.TileSizeBehavior} sSizeBehavior The sizeBehavior.
         * @since 1.116.0
         */
        sizeBehaviorHandler: function (sSizeBehavior) {
            this.getView().getModel().setProperty("/properties/customSizeBehavior", sSizeBehavior);
        },

        // trigger to show the configuration UI if the tile is pressed in Admin mode
        onPress: function (oEvent) {
            /**
             * The keydown event handler directly calls the press event of the GenericTile.
             * Therefore we need to check here if a navigation is already running instead of in the VizInstance.
             */
            if (NavigationState.isNavigationRunning()) {
                return;
            }

            const oTileConfig = this.getView().getViewData().properties;

            if (oEvent.getSource().getScope && oEvent.getSource().getScope() === GenericTileScope.Display) {
                const sTargetURL = this._createTargetUrl();
                if (!sTargetURL) {
                    return;
                }
                EventHub.emit("UITracer.trace", {
                    reason: "LaunchApp",
                    source: "Tile",
                    data: {
                        targetUrl: sTargetURL
                    }
                });
                if (sTargetURL[0] === "#") {
                    hasher.setHash(sTargetURL);
                } else {
                    // add the URL to recent activity log
                    const bLogRecentActivity = Config.last("/core/shell/enableRecentActivity") && Config.last("/core/shell/enableRecentActivityLogging");
                    if (bLogRecentActivity) {
                        const oRecentEntry = {
                            title: oTileConfig.title,
                            appType: AppType.URL,
                            url: oTileConfig.targetURL,
                            appId: oTileConfig.targetURL
                        };
                        Container.getRendererInternal("fiori2").logRecentActivity(oRecentEntry);
                    }
                    WindowUtils.openURL(sTargetURL, "_blank");
                }
            }
        },

        updatePropertiesHandler: function (oNewProperties) {
            const oTile = this.getView().getContent()[0];
            const oTileContent = oTile.getTileContent()[0];

            if (typeof oNewProperties.title !== "undefined") {
                oTile.setHeader(oNewProperties.title);
            }
            if (typeof oNewProperties.subtitle !== "undefined") {
                oTile.setSubheader(oNewProperties.subtitle);
            }
            if (typeof oNewProperties.icon !== "undefined") {
                oTileContent.getContent().setSrc(oNewProperties.icon);
            }
            if (typeof oNewProperties.info !== "undefined") {
                oTileContent.setFooter(oNewProperties.info);
            }
        },

        _createTargetUrl: function () {
            let sTargetURL = this.getView().getViewData().properties.targetURL;
            const sSystem = this.getView().getViewData().configuration["sap-system"];
            let oHash;

            if (sTargetURL && sSystem) {
                // when the navigation url is hash we want to make sure system parameter is in the parameters part
                if (UrlParsing.isIntentUrl(sTargetURL)) {
                    oHash = UrlParsing.parseShellHash(sTargetURL);
                    if (!oHash.params) {
                        oHash.params = {};
                    }
                    oHash.params["sap-system"] = sSystem;
                    sTargetURL = `#${UrlParsing.constructShellHash(oHash)}`;
                } else {
                    sTargetURL += `${(sTargetURL.indexOf("?") < 0) ? "?" : "&"}sap-system=${sSystem}`;
                }
            }
            return sTargetURL;
        },

        // Return lean url for the <a> tag of the Generic Tile
        _getLeanUrl: function () {
            return WindowUtils.getLeanURL(this._createTargetUrl());
        },

        _getTileContent: function (sId, oBindingContext) {
            const aParts = oBindingContext.getPath().split("/");
            aParts.pop();
            const oBindingObject = oBindingContext.getProperty(aParts.join("/"));
            if (oBindingObject !== this.oLastBindingObject || this.oTileContent && this.oTileContent.bIsDestroyed) {
                this.oLastBindingObject = oBindingObject;
                this.oTileContent = this.getView().byId(oBindingObject.icon ? "imageTileContent" : "standardTileContent").clone();
            }
            return this.oTileContent;
        },

        _getCurrentProperties: function () {
            const oTile = this.getView().getContent()[0];
            const oTileContent = oTile.getTileContent()[0];
            const sizeBehavior = Config.last("/core/home/sizeBehavior");

            return {
                title: oTile.getHeader(),
                subtitle: oTile.getSubheader(),
                info: oTileContent.getFooter(),
                icon: oTileContent.getContent().getSrc(),
                mode: oTile.getMode(),
                configSizeBehavior: sizeBehavior
            };
        }
    });
}, /* bExport= */ true);
