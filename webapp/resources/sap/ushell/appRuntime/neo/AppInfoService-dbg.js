// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileoverview The NEO implementation of the AppInfoService.
 * @deprecated since 1.120
 */
sap.ui.define([
    "sap/ui/thirdparty/jquery",
    "sap/ui/thirdparty/URI",
    "sap/ui/model/resource/ResourceModel",
    "sap/m/Dialog",
    "sap/m/DialogType",
    "sap/m/Button",
    "sap/m/ButtonType",
    "sap/m/Text",
    "sap/ushell/Container",
    "sap/ui/core/library"
], (
    jQuery,
    URI,
    ResourceModel,
    Dialog,
    DialogType,
    Button,
    ButtonType,
    Text,
    Container,
    coreLibrary
) => {
    "use strict";

    // shortcut for sap.ui.core.ValueState
    const ValueState = coreLibrary.ValueState;

    const oUriParams = new URI().search(true);
    const sAppGatewayRoute = "/sap/fiori";
    const sAppIdParam = "sap-ui-app-id";
    const sBackendPrefix = "/sap/bc";
    const APP_VERSION_REGEX = /sv\/.+\/manifest/;
    let prefix;

    function fnAppInfoURL (appId) {
        // app info is served from app-index
        return `${sBackendPrefix}/ui2/app_index/ui5_app_info_json?id=${appId}`;
    }

    function buildAppInfoUrlFromStartupParams (sUrl) {
        const result = {};
        const ui5appruntimeUrl = sUrl || document.URL;
        const uri = new URI(ui5appruntimeUrl);
        const startupParam = uri.query(true)["sap-startup-params"];
        const decodedStartupParam = (new URI(`?${startupParam}`)).query(true);
        let appInfoUrl;
        Object.keys(decodedStartupParam).forEach((key) => {
            result[key.toLowerCase()] = decodedStartupParam[key];
        });
        if (result["sap-app-uri"] && result["sap-app-name"]) {
            const sapAppURI = (result["sap-app-uri"]).replace(/\/$/, "");
            const sapAppName = result["sap-app-name"];
            prefix = `${sAppGatewayRoute}/${sapAppName}/`;
            appInfoUrl = `${sAppGatewayRoute}/${sapAppName}${sapAppURI}`;
        }
        // fallback for webapp html apps
        if (appInfoUrl) {
            appInfoUrl = appInfoUrl.replace(".webapp", "/webapp");
        }
        return appInfoUrl;
    }

    function updateInterceptorPrefix (oFilterFactory, oCacheBusterFilter, appId) {
        if (prefix) {
            // registering the doorway mapping filter
            const oFilterManager = sap.ushell.cloudServices.interceptor.FilterManager.getInstance();
            const oDoorWayMappingFilter = oFilterFactory.getFilter("sap.ushell.cloudServices.interceptor.filter.DoorWayMappingFilter");
            if (!oFilterManager.isRegistered("sap.ushell.cloudServices.interceptor.filter.DoorWayMappingFilter")) {
                oFilterManager.register("sap.ushell.cloudServices.interceptor.filter.DoorWayMappingFilter");
            }
            // Update prefix
            oDoorWayMappingFilter.addAppToStack(appId, prefix);
            oCacheBusterFilter.addAppToStack(appId, prefix);
        }
    }

    function getAppInfo (appId, sUrl) {
        const oDeferred = new jQuery.Deferred();
        appId = appId || oUriParams[sAppIdParam];
        jQuery.ajax(fnAppInfoURL(appId))
            .then(async (appInfo) => {
                if (appInfo && !(Object.keys(appInfo).length === 0)) {
                    appInfo = (appId in appInfo) ? appInfo[appId] : appInfo;
                    // rewrite libs url
                    const libs = appInfo?.asyncHints?.libs || [];
                    libs.forEach((lib) => {
                        if (lib?.url?.final) {
                            lib.url.url = sAppGatewayRoute + lib.url.url;
                        }
                    });
                    // rewrite components url
                    const components = appInfo?.asyncHints?.components || [];
                    components.forEach((component) => {
                        if (component?.url?.final) {
                            component.url.url = sAppGatewayRoute + component.url.url;
                        }
                    });
                    // rewrite app url
                    if ("url" in appInfo) {
                        appInfo.url = sAppGatewayRoute + appInfo.url;
                        prefix = appInfo.url;
                    } else {
                        // apps that are not supported by appIndex
                        appInfo.url = buildAppInfoUrlFromStartupParams(sUrl);
                    }
                    // sap-app-uri or sap-app-name were not provided for appIndex unsupported apps.
                    if (!appInfo.url) {
                        if (!this.oErrorMessageDialog) {
                            const oI18nAppModel = new ResourceModel({
                                async: true,
                                bundleUrl: "/sap/fiori/appruntime/i18n/i18nApp.properties"
                            });
                            const oResourceBundle = await oI18nAppModel.getResourceBundle();
                            this.oErrorMessageDialog = new Dialog({
                                type: DialogType.Message,
                                title: oResourceBundle.getText("ERROR_DIALOG_TITLE"),
                                state: ValueState.Error,
                                content: new Text({ text: oResourceBundle.getText("MISSING_PARAMETERS_ERROR") }),
                                contentWidth: "30%",
                                beginButton: new Button({
                                    type: ButtonType.Emphasized,
                                    text: oResourceBundle.getText("OK_BUTTON"),
                                    press: async () => {
                                        this.oErrorMessageDialog.close();
                                        const oNavService = await Container.getServiceAsync("Navigation");
                                        oNavService.toExternal({
                                            target: {
                                                semanticObject: "Shell",
                                                action: "home"
                                            }
                                        });
                                    }
                                })
                            });
                        }
                        this.oErrorMessageDialog.open();
                        return oDeferred.reject(new Error("sap-app-uri & sap-app-name parameters were not provided"));
                    }
                    // Extract version from appIndex response for browser caching
                    let appVersion;
                    const oFilterFactory = sap.ushell.cloudServices.interceptor.FilterFactory.getInstance();
                    const oCacheBusterFilter = oFilterFactory.getFilter("sap.ushell.cloudServices.interceptor.filter.CacheBusterFilter");
                    if ("manifestUrl" in appInfo) {
                        if (APP_VERSION_REGEX.test(appInfo.manifestUrl)) {
                            const result = APP_VERSION_REGEX.exec(appInfo.manifestUrl);
                            const split = result[0].split("/");
                            appVersion = split[1];
                        }
                    }
                    if (appVersion) {
                        oCacheBusterFilter.setTimestamp(appVersion);
                    } else {
                        oCacheBusterFilter.setTimestamp();
                    }
                    updateInterceptorPrefix(oFilterFactory, oCacheBusterFilter, appId);
                    return oDeferred.resolve(appInfo);
                }
                return oDeferred.reject(new Error("AppInfo from AppIndex is empty"));
            })
            .fail(oDeferred.reject);
        return oDeferred.promise();
    }
    sap.ui.define(
        "appInfoService",
        [],
        () => ({ getAppInfo: getAppInfo })
    );
});
