// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ushell/components/tiles/utils",
    "sap/ushell/Config",
    "sap/ushell/utils/WindowUtils",
    "sap/m/library",
    "sap/ushell/library",
    "sap/ui/model/json/JSONModel",
    "sap/base/Log",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/utils/UrlParsing",
    "sap/ushell/EventHub",
    "sap/ushell/Container",
    "sap/ushell/utils/LaunchpadError"
], (
    Controller,
    tileUtils,
    Config,
    WindowUtils,
    mobileLibrary,
    ushellLibrary,
    JSONModel,
    Log,
    jQuery,
    UrlParsing,
    EventHub,
    Container,
    LaunchpadError
) => {
    "use strict";

    // shortcut for sap.m.GenericTileScope
    const GenericTileScope = mobileLibrary.GenericTileScope;

    // shortcut for sap.m.GenericTileMode
    const GenericTileMode = mobileLibrary.GenericTileMode;

    // shortcut for sap.ushell.AppType
    const AppType = ushellLibrary.AppType;

    /* global hasher */

    return Controller.extend("sap.ushell.components.tiles.applauncher.StaticTile", {
        _aDoables: [],

        onInit: function () {
            const oView = this.getView();
            const oViewData = oView.getViewData();
            const oTileApi = oViewData.chip; // instance specific CHIP API
            const oConfig = tileUtils.getAppLauncherConfig(oTileApi, oTileApi.configurationUi.isEnabled(), false);
            const that = this;
            let sNavigationTargetUrl = oConfig.navigation_target_url;
            let oHash;

            const sSystem = oTileApi.url.getApplicationSystem();
            if (sSystem) { // propagate system to target application
                // when the navigation url is hash we want to make sure system parameter is in the parameters part
                if (UrlParsing.isIntentUrl(sNavigationTargetUrl)) {
                    oHash = UrlParsing.parseShellHash(sNavigationTargetUrl);
                    if (!oHash.params) {
                        oHash.params = {};
                    }
                    oHash.params["sap-system"] = sSystem;
                    sNavigationTargetUrl = `#${UrlParsing.constructShellHash(oHash)}`;
                } else {
                    sNavigationTargetUrl += `${(sNavigationTargetUrl.indexOf("?") < 0) ? "?" : "&"}sap-system=${sSystem}`;
                }
            }
            this.navigationTargetUrl = sNavigationTargetUrl;

            const oModel = new JSONModel({
                sizeBehavior: Config.last("/core/home/sizeBehavior"),
                wrappingType: Config.last("/core/home/wrappingType"),
                config: oConfig,
                mode: oConfig.display_mode,
                nav: { navigation_target_url: (oTileApi.configurationUi && oTileApi.configurationUi.isEnabled() ? "" : sNavigationTargetUrl) },
                search: { display_highlight_terms: [] }
            });
            oView.setModel(oModel);
            // listen for changes of the size behavior, as the end user can change it in the settings (if enabled)
            this._aDoables.push(Config.on("/core/home/sizeBehavior").do((sSizeBehavior) => {
                oModel.setProperty("/sizeBehavior", sSizeBehavior);
            }));

            // implement types contact
            // default is Tile
            if (oTileApi.types) {
                oTileApi.types.attachSetType((sType) => {
                    if (that.tileType !== sType) {
                        if (sType === "link") {
                            oModel.setProperty("/mode", GenericTileMode.LineMode);
                        } else {
                            oModel.setProperty("/mode", oModel.getProperty("/config/display_mode"));
                        }
                        that.tileType = sType;
                    }
                });
            }

            if (!this.tileType) {
                this.tileType = "tile";
            }

            // implement search contract
            if (oTileApi.search) {
                // split and clean keyword string (may be comma + space delimited)
                const sKeywords = oView.getModel().getProperty("/config/display_search_keywords");
                const aKeywords = sKeywords
                    .split(/[, ]+/)
                    .filter((n) => { return n && n !== ""; });

                // add title and subtitle (if present) to keywords for better FLP searching
                if (oConfig.display_title_text && oConfig.display_title_text !== "" &&
                    aKeywords.indexOf(oConfig.display_title_text) === -1) {
                    aKeywords.push(oConfig.display_title_text);
                }
                if (oConfig.display_subtitle_text && oConfig.display_subtitle_text !== "" &&
                    aKeywords.indexOf(oConfig.display_subtitle_text) === -1) {
                    aKeywords.push(oConfig.display_subtitle_text);
                }
                if (oConfig.display_info_text && oConfig.display_info_text !== "" &&
                    aKeywords.indexOf(oConfig.display_info_text) === -1) {
                    aKeywords.push(oConfig.display_info_text);
                }

                // defined in search contract:
                oTileApi.search.setKeywords(aKeywords);
                oTileApi.search.attachHighlight(
                    (aHighlightWords) => {
                        oView.getModel().setProperty("/search/display_highlight_terms", aHighlightWords);
                    }
                );
            }

            // implement bag update handler
            if (oTileApi.bag && oTileApi.bag.attachBagsUpdated) {
                // is only called by the FLP for bookmark tiles which have been updated via bookmark service
                oTileApi.bag.attachBagsUpdated((aUpdatedBagIds) => {
                    if (aUpdatedBagIds.indexOf("tileProperties") > -1) {
                        tileUtils._updateTilePropertiesTexts(oView, oTileApi.bag.getBag("tileProperties"));
                    }
                });
            }

            // implement configuration update handler
            if (oTileApi.configuration && oTileApi.configuration.attachConfigurationUpdated) {
                // is only called by the FLP for bookmark tiles which have been updated via bookmark service
                oTileApi.configuration.attachConfigurationUpdated((aUpdatedConfigKeys) => {
                    if (aUpdatedConfigKeys.indexOf("tileConfiguration") > -1) {
                        tileUtils._updateTileConfiguration(oView, oTileApi.configuration.getParameterValueAsString("tileConfiguration"));
                    }
                });
            }

            // implement preview contract
            if (oTileApi.preview) {
                oTileApi.preview.setTargetUrl(sNavigationTargetUrl);
                oTileApi.preview.setPreviewIcon(oConfig.display_icon_url);
                oTileApi.preview.setPreviewTitle(oConfig.display_title_text);
                if (oTileApi.preview.setPreviewSubtitle && typeof oTileApi.preview.setPreviewSubtitle === "function") {
                    oTileApi.preview.setPreviewSubtitle(oConfig.display_subtitle_text);
                }
            }

            // implement configurationUi contract: setup configuration UI
            if (oTileApi.configurationUi.isEnabled()) {
                oTileApi.configurationUi.setAsyncUiProvider(() => {
                    return tileUtils.getConfigurationUi(oView, "sap.ushell.components.tiles.applauncher.Configuration")
                        .then((oConfigurationUi) => {
                            oTileApi.configurationUi.attachCancel(that.onCancelConfiguration.bind(null, oConfigurationUi));
                            oTileApi.configurationUi.attachSave(that.onSaveConfiguration.bind(null, oConfigurationUi));
                            return oConfigurationUi;
                        });
                });
                this.getView().getContent()[0].setTooltip(
                    tileUtils.getResourceBundle().getText("edit_configuration.tooltip")
                );
            }

            // attach the tile actions provider for the actions contract
            if (oTileApi.actions) {
                let aExtendedActions = [];
                const aActions = oConfig.actions;
                if (aActions) {
                    aExtendedActions = aActions.slice();
                }

                if (Config.last("/core/shell/enablePersonalization")) {
                    const sType = (oModel.getProperty("/mode") === GenericTileMode.LineMode) ? "link" : "tile";
                    const tileSettingsAction = tileUtils.getTileSettingsAction(oModel, this.onSaveRuntimeSettings.bind(this), sType);
                    aExtendedActions.push(tileSettingsAction);
                }

                oTileApi.actions.setActionsProvider(() => {
                    return aExtendedActions;
                });
            }
        },

        onExit: function () {
            this._aDoables.forEach((oDoable) => {
                oDoable.off();
            });
            this._aDoables = [];
        },

        // trigger to show the configuration UI if the tile is pressed in Admin mode
        onPress: function (oEvent) {
            const oStaticTileView = this.getView();
            const oViewData = oStaticTileView.getViewData();
            const oTileApi = oViewData.chip;
            const oTileConfig = oStaticTileView.getModel().getProperty("/config");
            // scope is property of generic tile. It's default value is "Display"
            if (oEvent.getSource().getScope && oEvent.getSource().getScope() === GenericTileScope.Display) {
                if (oTileApi.configurationUi.isEnabled()) {
                    oTileApi.configurationUi.display();
                } else if (this.navigationTargetUrl) {
                    EventHub.emit("UITracer.trace", {
                        reason: "LaunchApp",
                        source: "Tile",
                        data: {
                            targetUrl: this.navigationTargetUrl
                        }
                    });
                    if (this.navigationTargetUrl[0] === "#") {
                        hasher.setHash(this.navigationTargetUrl);
                    } else {
                        const bLogRecentActivity = Config.last("/core/shell/enableRecentActivity") && Config.last("/core/shell/enableRecentActivityLogging");
                        if (bLogRecentActivity) {
                            const oRecentEntry = {
                                title: oTileConfig.display_title_text,
                                appType: AppType.URL,
                                url: oTileConfig.navigation_target_url,
                                appId: oTileConfig.navigation_target_url
                            };
                            Container.getRendererInternal("fiori2").logRecentActivity(oRecentEntry);
                        }
                        WindowUtils.openURL(this.navigationTargetUrl, "_blank");
                    }
                }
            }
        },

        // tile settings action UI save handler
        onSaveRuntimeSettings: function (oSettingsView) {
            const oViewModel = oSettingsView.getModel();
            const oTileApi = this.getView().getViewData().chip;
            const oConfigToSave = this.getView().getModel().getProperty("/config");

            oConfigToSave.display_title_text = oViewModel.getProperty("/title") || "";
            oConfigToSave.display_subtitle_text = oViewModel.getProperty("/subtitle") || "";
            oConfigToSave.display_info_text = oViewModel.getProperty("/info") || "";
            oConfigToSave.display_search_keywords = oViewModel.getProperty("/keywords") || "";

            // use bag contract in order to store translatable properties
            const tilePropertiesBag = oTileApi.bag.getBag("tileProperties");
            tilePropertiesBag.setText("display_title_text", oConfigToSave.display_title_text);
            tilePropertiesBag.setText("display_subtitle_text", oConfigToSave.display_subtitle_text);
            tilePropertiesBag.setText("display_info_text", oConfigToSave.display_info_text);
            tilePropertiesBag.setText("display_search_keywords", oConfigToSave.display_search_keywords);

            // saving the relevant properties
            tilePropertiesBag.save(
                // success handler
                () => {
                    Log.debug("property bag 'tileProperties' saved successfully");

                    // update tile's model
                    this.getView().getModel().setProperty("/config/display_title_text", oConfigToSave.display_title_text);
                    this.getView().getModel().setProperty("/config/display_subtitle_text", oConfigToSave.display_subtitle_text);
                    this.getView().getModel().setProperty("/config/display_info_text", oConfigToSave.display_info_text);
                    this.getView().getModel().setProperty("/config/display_search_keywords", oConfigToSave.display_search_keywords);

                    // call to refresh model which (due to the binding) will refresh the tile
                    this.getView().getModel().refresh();
                },
                // fnFailure
                (mErrorMessages, mErrorInfo) => {
                    const sFirstFailedBag = Object.keys(mErrorMessages)[0];

                    const oError = new LaunchpadError(`Bag save failed: ${mErrorMessages[sFirstFailedBag]}`, {
                        info: mErrorInfo[sFirstFailedBag],
                        otherMessages: mErrorMessages,
                        otherInfo: mErrorInfo
                    });
                    Log.error("Bag save failed", oError, "sap.ushell.components.tiles.applauncher.StaticTile.controller");
                }
            );
        },

        // configuration save handler
        onSaveConfiguration: function (oConfigurationView) {
            // the deferred object required from the configurationUi contract
            const oDeferred = new jQuery.Deferred();
            const oModel = oConfigurationView.getModel();
            // tile model placed into configuration model by getConfigurationUi
            const oTileModel = oModel.getProperty("/tileModel");
            const oTileApi = oConfigurationView.getViewData().chip;
            const aTileNavigationActions = tileUtils.tileActionsRows2TileActionsArray(oModel.getProperty("/config/tile_actions_rows"));
            // get the configuration to save from the model
            const configToSave = {
                display_icon_url: oModel.getProperty("/config/display_icon_url"),
                navigation_use_semantic_object: oModel.getProperty("/config/navigation_use_semantic_object"),
                navigation_target_url: oModel.getProperty("/config/navigation_target_url"),
                navigation_semantic_object: (oModel.getProperty("/config/navigation_semantic_object") || "").trim(),
                navigation_semantic_action: (oModel.getProperty("/config/navigation_semantic_action") || "").trim(),
                navigation_semantic_parameters: (oModel.getProperty("/config/navigation_semantic_parameters") || "").trim(),
                display_search_keywords: oModel.getProperty("/config/display_search_keywords")
            };

            // if the input fields icon, semantic object and action are failing the input validations,
            // then through an error message requesting the user to enter/correct those fields
            let bReject = tileUtils.checkInputOnSaveConfig(oConfigurationView);
            if (!bReject) {
                bReject = tileUtils.checkTileActions(oConfigurationView);
            }
            if (bReject) {
                oDeferred.reject(new Error("mandatory_fields_missing"));
                return oDeferred.promise();
            }
            // overwrite target URL in case of semantic object navigation
            if (configToSave.navigation_use_semantic_object) {
                configToSave.navigation_target_url = tileUtils.getSemanticNavigationUrl(configToSave);
                oModel.setProperty("/config/navigation_target_url", configToSave.navigation_target_url);
            }

            // use bag in order to store translatable properties
            const tilePropertiesBag = oTileApi.bag.getBag("tileProperties");
            tilePropertiesBag.setText("display_title_text", oModel.getProperty("/config/display_title_text"));
            tilePropertiesBag.setText("display_subtitle_text", oModel.getProperty("/config/display_subtitle_text"));
            tilePropertiesBag.setText("display_info_text", oModel.getProperty("/config/display_info_text"));
            tilePropertiesBag.setText("display_search_keywords", configToSave.display_search_keywords);

            const tileNavigationActionsBag = oTileApi.bag.getBag("tileNavigationActions");
            // forward populating of tile navigation actions array into the bag, to Utils
            tileUtils.populateTileNavigationActionsBag(tileNavigationActionsBag, aTileNavigationActions);

            function logErrorAndReject (sErrorMessage, oErrorInfo) {
                Log.error(`property bag 'tileProperties' save failed: ${sErrorMessage}`, null, "sap.ushell.components.tiles.applauncher.StaticTile.controller");
                oDeferred.reject(new LaunchpadError(sErrorMessage, oErrorInfo));
            }

            // use configuration contract to write parameter values
            oTileApi.writeConfiguration.setParameterValues(
                { tileConfiguration: JSON.stringify(configToSave) },
                // success handler
                () => {
                    const oConfigurationConfig = tileUtils.getAppLauncherConfig(oTileApi, false, false);
                    const oTileConfig = tileUtils.getAppLauncherConfig(oTileApi, true, false);
                    // switching the model under the tile -> keep the tile model
                    const oModel = new JSONModel({
                        config: oConfigurationConfig,
                        // set empty target url in configuration mode
                        nav: { navigation_target_url: "" },
                        // keep tile model
                        tileModel: oTileModel
                    });
                    oConfigurationView.setModel(oModel);
                    // update tile model
                    oTileModel.setData({ config: oTileConfig, nav: { navigation_target_url: "" } }, false);

                    // update tile model
                    if (oTileApi.preview) {
                        oTileApi.preview.setTargetUrl(oConfigurationConfig.navigation_target_url);
                        oTileApi.preview.setPreviewIcon(oConfigurationConfig.display_icon_url);
                        oTileApi.preview.setPreviewTitle(oConfigurationConfig.display_title_text);
                        if (oTileApi.preview.setPreviewSubtitle && typeof oTileApi.preview.setPreviewSubtitle === "function") {
                            oTileApi.preview.setPreviewSubtitle(oConfigurationConfig.display_subtitle_text);
                        }
                    }
                    tilePropertiesBag.save(
                        // success handler
                        () => {
                            Log.debug("property bag 'tileProperties' saved successfully");
                            // update possibly changed values via contracts
                            if (oTileApi.title) {
                                oTileApi.title.setTitle(
                                    oConfigurationConfig.display_title_text,
                                    // success handler
                                    () => {
                                        oDeferred.resolve();
                                    },
                                    logErrorAndReject // error handler
                                );
                            } else {
                                oDeferred.resolve();
                            }
                        },
                        // fnFailure
                        (mErrorMessages, mErrorInfo) => {
                            const sFirstFailedBag = Object.keys(mErrorMessages)[0];

                            const oError = new LaunchpadError(`Bag save failed: ${mErrorMessages[sFirstFailedBag]}`, {
                                info: mErrorInfo[sFirstFailedBag],
                                otherMessages: mErrorMessages,
                                otherInfo: mErrorInfo
                            });
                            Log.error("Bag save failed", oError, "sap.ushell.components.tiles.applauncher.StaticTile.controller");
                            oDeferred.reject(oError);
                        }
                    );

                    tileNavigationActionsBag.save(
                        // success handler
                        () => {
                            Log.debug("property bag 'navigationProperties' saved successfully");
                        },
                        // fnFailure
                        (mErrorMessages, mErrorInfo) => {
                            const sFirstFailedBag = Object.keys(mErrorMessages)[0];

                            const oError = new LaunchpadError(`Bag save failed: ${mErrorMessages[sFirstFailedBag]}`, {
                                info: mErrorInfo[sFirstFailedBag],
                                otherMessages: mErrorMessages,
                                otherInfo: mErrorInfo
                            });
                            Log.error("Bag save failed", oError, "sap.ushell.components.tiles.applauncher.StaticTile.controller");
                            oDeferred.reject(oError);
                        }
                    );
                },
                logErrorAndReject // error handler
            );
            oConfigurationView.destroy();
            return oDeferred.promise();
        },

        // configuration cancel handler
        onCancelConfiguration: function (oConfigurationView) {
            // reload old configuration and display
            const oViewData = oConfigurationView.getViewData();
            const oModel = oConfigurationView.getModel();
            // tile model placed into configuration model by getConfigurationUi
            const oTileModel = oModel.getProperty("/tileModel");
            const oTileApi = oViewData.chip;
            const oCurrentConfig = tileUtils.getAppLauncherConfig(oTileApi, oTileApi.configurationUi.isEnabled(), false);

            oConfigurationView.getModel().setData({
                config: oCurrentConfig,
                // set empty target url in configuration mode
                nav: { navigation_target_url: "" },
                tileModel: oTileModel
            }, false);

            oConfigurationView.destroy();
        },

        formatters: {
            leanURL: WindowUtils.getLeanURL.bind(WindowUtils)
        }
    });
});
