// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/EventBus",
    "sap/ushell/library",
    "sap/ui/core/mvc/Controller",
    "sap/ushell/components/tiles/utils",
    "sap/ushell/Config",
    "sap/ushell/utils/WindowUtils",
    "sap/m/library",
    "sap/ui/model/json/JSONModel",
    "sap/ui/thirdparty/jquery",
    "sap/base/Log",
    "sap/ushell/utils/DynamicTileRequest",
    "sap/ushell/utils/UrlParsing",
    "sap/ushell/utils",
    "sap/ushell/EventHub",
    "sap/ushell/Container",
    "sap/ushell/utils/LaunchpadError"
], (
    EventBus,
    ushellLibrary,
    Controller,
    tileUtils,
    Config,
    WindowUtils,
    mobileLibrary,
    JSONModel,
    jQuery,
    Log,
    DynamicTileRequest,
    UrlParsing,
    ushellUtils,
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

    const COMPONENT_NAME = "sap.ushell.components.tiles.applauncherdynamic.DynamicTile";

    return Controller.extend(COMPONENT_NAME, {
        _aDoables: [],

        // handle to control/cancel data.js OData.read()
        oDataRequest: null,

        sConfigNavigationTargetUrlOld: "",

        REFRESH_INTERVAL_MIN: 10,

        constructTargetUrlWithSapSystem: function (sNavigationTargetUrl, sSystem) {
            let oHash;

            if (sSystem) { // propagate system to target application
                // when the navigation url is hash we want to make sure system parameter is in the parameters part
                // BCP 1780450594
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
            return sNavigationTargetUrl;
        },

        onInit: function () {
            const that = this;
            const oView = this.getView();
            const oViewData = oView.getViewData();
            const oTileApi = oViewData.chip;
            const oConfig = tileUtils.getAppLauncherConfig(oTileApi, oTileApi.configurationUi.isEnabled(), false);
            const sNavigationTargetUrlInit = oConfig.navigation_target_url;
            const sSystem = oTileApi.url.getApplicationSystem();

            this.sConfigNavigationTargetUrlOld = oConfig.navigation_target_url;
            Log.setLevel(2, COMPONENT_NAME);

            this.bIsRequestCompleted = false;
            this.navigationTargetUrl = this.constructTargetUrlWithSapSystem(sNavigationTargetUrlInit, sSystem);

            const oModel = new JSONModel({
                sizeBehavior: Config.last("/core/home/sizeBehavior"),
                wrappingType: Config.last("/core/home/wrappingType"),
                config: oConfig,
                mode: oConfig.display_mode || GenericTileMode.ContentMode,
                data: tileUtils.getDataToDisplay(oConfig, {
                    number: ((oTileApi.preview && oTileApi.preview.isEnabled()) ? 1234 : "...")
                }),
                nav: { navigation_target_url: (oTileApi.configurationUi && oTileApi.configurationUi.isEnabled() ? "" : this.navigationTargetUrl) },
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
                            oModel.setProperty("/mode", oModel.getProperty("/config/display_mode") || GenericTileMode.ContentMode);
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
                    .filter((n, i) => { return n && n !== ""; });

                // add title, subtitle, info and number unit (if present) to keywords for better FLP searching
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
                // The Number Unit may not only be a currency but can also be something like "open leave requests"
                // which the user may want to search for.
                // Note: Number unit is the only not translatable property.
                if (oConfig.display_number_unit && oConfig.display_number_unit !== "" &&
                    aKeywords.indexOf(oConfig.display_number_unit) === -1) {
                    aKeywords.push(oConfig.display_number_unit);
                }

                // defined in search contract:
                oTileApi.search.setKeywords(aKeywords);
                oTileApi.search.attachHighlight(
                    (aHighlightWords) => {
                        // update model for highlighted search term
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
                oTileApi.preview.setTargetUrl(this.navigationTargetUrl);
                oTileApi.preview.setPreviewIcon(oConfig.display_icon_url);
                oTileApi.preview.setPreviewTitle(oConfig.display_title_text);
                if (oTileApi.preview.setPreviewSubtitle && typeof oTileApi.preview.setPreviewSubtitle === "function") {
                    oTileApi.preview.setPreviewSubtitle(oConfig.display_subtitle_text);
                }
            }

            // implement configurationUi contract: setup configuration UI
            if (oTileApi.configurationUi.isEnabled()) {
                oTileApi.configurationUi.setAsyncUiProvider(() => {
                    return tileUtils.getConfigurationUi(
                        oView,
                        "sap.ushell.components.tiles.applauncherdynamic.Configuration"
                    ).then((oConfigurationUi) => {
                        oTileApi.configurationUi.attachCancel(that.onCancelConfiguration.bind(null, oConfigurationUi));
                        oTileApi.configurationUi.attachSave(that.onSaveConfiguration.bind(null, oConfigurationUi));
                        return oConfigurationUi;
                    });
                });

                this.getView().getContent()[0].setTooltip(
                    tileUtils.getResourceBundle()
                        .getText("edit_configuration.tooltip")
                );
            } else if (!oTileApi.preview || !oTileApi.preview.isEnabled()) {
                if (!sSystem) {
                    Container.addRemoteSystemForServiceUrl(oConfig.service_url);
                } // else registration is skipped because registration has been done already
                // outside this controller (e.g. remote catalog registration)

                // start fetching data from backend service if not in preview or admin mode
                this.bNeedsRefresh = true;
                this.iNrOfTimerRunning = 0;
            }

            // implement refresh contract
            if (oTileApi.refresh) {
                oTileApi.refresh.attachRefresh(this.refreshHandler.bind(this));
            }

            // implement visible contract
            if (oTileApi.visible) {
                oTileApi.visible.attachVisible(this.visibleHandler.bind(this));
            }

            // attach the tile actions provider for the actions contract
            if (oTileApi.actions) {
                let aExtendedActions;
                const aActions = oConfig.actions;
                if (aActions) {
                    aExtendedActions = aActions.slice();
                } else {
                    aExtendedActions = [];
                }

                if (Config.last("/core/shell/enablePersonalization")) {
                    const sType = oModel.getProperty("/mode") === GenericTileMode.LineMode ? "link" : "tile";
                    const tileSettingsAction = tileUtils.getTileSettingsAction(oModel, this.onSaveRuntimeSettings.bind(this), sType);
                    aExtendedActions.push(tileSettingsAction);
                }

                oTileApi.actions.setActionsProvider(() => {
                    return aExtendedActions;
                });
            }
            EventBus.getInstance().subscribe("launchpad", "sessionTimeout", this._clearRequest, this);
        },

        // convenience function to stop browser's timeout and OData calls
        stopRequests: function () {
            if (this.oDataRequest) {
                // actual request abort
                if (this.oDataRequest.abort()) {
                    // We didn't finish the last refresh, so we need todo one as soon as the tile becomes visible again
                    this.bNeedsRefresh = true;
                }
            }
        },

        _clearRequest: function () {
            this.stopRequests();
            clearTimeout(this.timer);
        },

        // destroy handler stops requests
        onExit: function () {
            if (this.oDataRequest) {
                this._clearRequest();
                this.oDataRequest.destroy();
            }
            EventBus.getInstance().unsubscribe("launchpad", "sessionTimeout", this._clearRequest, this);
            this._aDoables.forEach((oDoable) => {
                oDoable.off();
            });
            this._aDoables = [];
        },

        // trigger to show the configuration UI if the tile is pressed in Admin mode
        onPress: function (oEvent) {
            const oView = this.getView();
            const oViewData = oView.getViewData();
            const oModel = oView.getModel();
            const sTargetUrl = oModel.getProperty("/nav/navigation_target_url");
            const oTileApi = oViewData.chip;
            const oTileConfig = oModel.getProperty("/config");

            // scope is property of generic tile. It's default value is "Display"
            if (oEvent.getSource().getScope && oEvent.getSource().getScope() === GenericTileScope.Display) {
                if (oTileApi.configurationUi.isEnabled()) {
                    oTileApi.configurationUi.display();
                } else if (sTargetUrl) {
                    EventHub.emit("UITracer.trace", {
                        reason: "LaunchApp",
                        source: "Tile",
                        data: {
                            targetUrl: sTargetUrl
                        }
                    });
                    if (sTargetUrl[0] === "#") {
                        hasher.setHash(sTargetUrl);
                    } else {
                        // add theURL to recent activity log
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

                        WindowUtils.openURL(sTargetUrl, "_blank");
                    }
                }
            }
        },

        // tile settings action UI save handler
        onSaveRuntimeSettings: function (oSettingsView) {
            const oView = this.getView();
            const oViewModel = oView.getModel();
            const oTileApi = oView.getViewData().chip;
            const oConfigToSave = oViewModel.getProperty("/config");
            const oSettingsViewModel = oSettingsView.getModel();

            oConfigToSave.display_title_text = oSettingsViewModel.getProperty("/title") || "";
            oConfigToSave.display_subtitle_text = oSettingsViewModel.getProperty("/subtitle") || "";
            oConfigToSave.display_info_text = oSettingsViewModel.getProperty("/info") || "";
            oConfigToSave.display_search_keywords = oSettingsViewModel.getProperty("/keywords") || "";

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

                    // update the local tile's config - saving changes on the Model
                    oViewModel.setProperty("/config", oConfigToSave);

                    // update tile's model for changes to appear immediately
                    // (and not wait for the refresh handler which happens every 10 seconds)
                    oViewModel.setProperty("/data/display_title_text", oConfigToSave.display_title_text);
                    oViewModel.setProperty("/data/display_subtitle_text", oConfigToSave.display_subtitle_text);
                    oViewModel.setProperty("/data/display_info_text", oConfigToSave.display_info_text);

                    // call to refresh model which (due to the binding) will refresh the tile
                    oViewModel.refresh();
                },
                // fnFailure
                (mErrorMessages, mErrorInfo) => {
                    const sFirstFailedBag = Object.keys(mErrorMessages)[0];

                    const oError = new LaunchpadError(`Bag save failed: ${mErrorMessages[sFirstFailedBag]}`, {
                        info: mErrorInfo[sFirstFailedBag],
                        otherMessages: mErrorMessages,
                        otherInfo: mErrorInfo
                    });
                    Log.error("Bag save failed", oError, COMPONENT_NAME);
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
                display_number_unit: oModel.getProperty("/config/display_number_unit"),
                service_url: oModel.getProperty("/config/service_url"),
                service_refresh_interval: oModel.getProperty("/config/service_refresh_interval"),
                navigation_use_semantic_object: oModel.getProperty("/config/navigation_use_semantic_object"),
                navigation_target_url: oModel.getProperty("/config/navigation_target_url"),
                navigation_semantic_object: (oModel.getProperty("/config/navigation_semantic_object") || "").trim(),
                navigation_semantic_action: (oModel.getProperty("/config/navigation_semantic_action") || "").trim(),
                navigation_semantic_parameters: (oModel.getProperty("/config/navigation_semantic_parameters") || "").trim(),
                display_search_keywords: oModel.getProperty("/config/display_search_keywords")
            };
            // If the input fields icon, semantic object and action are failing the input validations, then through an error message requesting the user to enter/correct those fields
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

            // use bag contract in order to store translatable properties
            const tilePropertiesBag = oTileApi.bag.getBag("tileProperties");
            tilePropertiesBag.setText("display_title_text", oModel.getProperty("/config/display_title_text"));
            tilePropertiesBag.setText("display_subtitle_text", oModel.getProperty("/config/display_subtitle_text"));
            tilePropertiesBag.setText("display_info_text", oModel.getProperty("/config/display_info_text"));
            tilePropertiesBag.setText("display_search_keywords", configToSave.display_search_keywords);

            const tileNavigationActionsBag = oTileApi.bag.getBag("tileNavigationActions");
            // forward populating of tile navigation actions array into the bag, to Utils
            tileUtils.populateTileNavigationActionsBag(tileNavigationActionsBag, aTileNavigationActions);

            function logErrorAndReject (sErrorMessage, oErrorInfo) {
                Log.error(`property bag 'tileProperties' save failed: ${sErrorMessage}`, null, COMPONENT_NAME);
                oDeferred.reject(new LaunchpadError(sErrorMessage, oErrorInfo));
            }

            // use configuration contract to write parameter values
            oTileApi.writeConfiguration.setParameterValues(
                { tileConfiguration: JSON.stringify(configToSave) },
                // success handler
                () => {
                    const oConfigurationConfig = tileUtils.getAppLauncherConfig(oTileApi, false, false);
                    // get tile config data in admin mode
                    const oTileConfig = tileUtils.getAppLauncherConfig(oTileApi, true, false);
                    // switching the model under the tile -> keep the tile model
                    const oModel = new JSONModel({
                        config: oConfigurationConfig,
                        // keep tile model
                        tileModel: oTileModel
                    });
                    oConfigurationView.setModel(oModel);

                    // update tile model
                    oTileModel.setData({ data: oTileConfig, nav: { navigation_target_url: "" } }, false);
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
                            Log.error("Bag save failed", oError, COMPONENT_NAME);
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
                            Log.error("Bag save failed", oError, COMPONENT_NAME);
                            oDeferred.reject(oError);
                        }
                    );
                },
                logErrorAndReject // error handler
            );

            return oDeferred.promise();
        },

        successHandlerFn: function (oResult) {
            const oView = this.getView();
            const oModel = oView.getModel();
            const oConfig = oModel.getProperty("/config");
            const sNavigationTargetUrl = oModel.getProperty("/config/navigation_target_url");
            let iRefreshInterval = oModel.getProperty("/config/service_refresh_interval");
            const sServiceUrl = oModel.getProperty("/config/service_url");
            const oViewData = oView.getViewData();
            const oTileApi = oViewData.chip;
            const sSystem = oTileApi.url.getApplicationSystem();

            if (oViewData.properties && oViewData.properties.info) {
                if (typeof oResult === "object") {
                    oResult.info = oViewData.properties.info;
                }
            }

            const oDataToDisplay = tileUtils.getDataToDisplay(oConfig, oResult);

            // set data to display
            oModel.setProperty("/data", oDataToDisplay);

            // Update this.navigationTargetUrl in case that oConfig.navigation_target_url was changed
            // BCP Incident: 1670570695
            if (this.sConfigNavigationTargetUrlOld !== sNavigationTargetUrl) {
                this.navigationTargetUrl = this.constructTargetUrlWithSapSystem(sNavigationTargetUrl, sSystem);
                this.sConfigNavigationTargetUrlOld = this.navigationTargetUrl;
            }

            // rewrite target URL
            oModel.setProperty("/nav/navigation_target_url", tileUtils.addParamsToUrl(
                this.navigationTargetUrl,
                oDataToDisplay
            ));

            if (iRefreshInterval > 0) {
                iRefreshInterval = Math.max(iRefreshInterval, this.REFRESH_INTERVAL_MIN);

                Log.info(`Wait ${iRefreshInterval} seconds before calling ${sServiceUrl} again`, null, COMPONENT_NAME);
                this.refeshAfterInterval(iRefreshInterval);
            }
        },

        // error handler
        errorHandlerFn: function (oMessage, bIsWarning) {
            const oView = this.getView();
            const oModel = oView.getModel();
            const sServiceUrl = oModel.getProperty("/config/service_url");
            let sMessage = oMessage && oMessage.message ? oMessage.message : oMessage;

            if (oMessage.statusText === "Abort" || oMessage.aborted === true) {
                Log.info(`Data request from service ${sServiceUrl} was aborted`, null, COMPONENT_NAME);
            } else {
                if (oMessage.response) {
                    sMessage += ` - ${oMessage.response.statusCode} ${
                        oMessage.response.statusText}`;
                }
                const fnLogFunction = bIsWarning ? Log.warning : Log.error;

                // Display error in English only
                fnLogFunction(`Failed to update data via service\n service URL: ${sServiceUrl}\n ${sMessage}`, null, COMPONENT_NAME);

                this._setTileIntoErrorState();
            }
        },

        _setTileIntoErrorState: function () {
            const oResourceBundle = tileUtils.getResourceBundle();
            const oModel = this.getView().getModel();
            const oConfig = oModel.getProperty("/config");

            oModel.setProperty("/data",
                tileUtils.getDataToDisplay(oConfig, {
                    number: "???",
                    info: oResourceBundle.getText("dynamic_data.error"),
                    infoState: "Critical"
                })
            );
        },

        // configuration cancel handler
        onCancelConfiguration: function (oConfigurationView/* , successHandler, errorHandle */) {
            // reload old configuration and display
            const oViewData = oConfigurationView.getViewData();
            const oModel = oConfigurationView.getModel();
            // tile model placed into configuration model by getConfigurationUi
            const oTileModel = oModel.getProperty("/tileModel");
            const oTileApi = oViewData.chip;
            const oCurrentConfig = tileUtils.getAppLauncherConfig(oTileApi, false, false);

            oModel.setData({ config: oCurrentConfig, tileModel: oTileModel }, false);
        },

        loadData: function () {
            const oView = this.getView();
            const oTileApi = oView.getViewData().chip;
            const oModel = oView.getModel();
            let sUrl = oModel.getProperty("/config/service_url");

            if (/;o=([;/?]|$)/.test(sUrl)) { // URL has placeholder segment parameter ;o=
                sUrl = oTileApi.url.addSystemToServiceUrl(sUrl);
            }

            if (!sUrl) {
                Log.error("No service URL given!", COMPONENT_NAME);
                this._setTileIntoErrorState();
                return;
            }

            // keep request until url changes
            if (!this.oDataRequest || this.oDataRequest.sUrl !== sUrl) {
                if (this.oDataRequest) {
                    this.oDataRequest.destroy();
                }
                this.sRequestUrl = sUrl;
                const oOptions = {
                    dataSource: oModel.getProperty("/config/data_source")
                };
                this.oDataRequest = new DynamicTileRequest(sUrl, this.successHandlerFn.bind(this), this.errorHandlerFn.bind(this), "", oOptions);
            } else if (this.oDataRequest) {
                this.oDataRequest.refresh();
            }
        },

        refreshTile: function () {
            const oView = this.getView();
            const oViewData = oView.getViewData();
            const isVisible = oViewData.chip.visible.isVisible();
            if (isVisible && this.bNeedsRefresh) {
                this.bNeedsRefresh = false;
                this.loadData();
            }
        },

        refeshAfterInterval: function (iRefreshInterval) {
            this.iNrOfTimerRunning++;
            this.timer = window.setTimeout(() => {
                this.iNrOfTimerRunning--;
                if (this.iNrOfTimerRunning === 0) {
                    this.bNeedsRefresh = true;
                    this.refreshTile();
                }
            }, ushellUtils.sanitizeTimeoutDelay(iRefreshInterval * 1000));
        },

        refreshHandler: function () {
            this.bNeedsRefresh = true;
            this.refreshTile();
        },

        visibleHandler: function (isVisible) {
            if (isVisible) {
                this.refreshTile();
            } else {
                this.stopRequests();
            }
        },

        formatters: {
            leanURL: WindowUtils.getLeanURL.bind(WindowUtils)
        }
    });
});
