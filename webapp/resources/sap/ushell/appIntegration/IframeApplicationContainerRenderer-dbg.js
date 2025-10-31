// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/Log",
    "sap/ui/core/Renderer",
    "sap/ui/core/RenderManager",
    "sap/ui/thirdparty/URI",
    "sap/ushell/appIntegration/ApplicationContainerRenderer",
    "sap/ushell/ApplicationType/systemAlias",
    "sap/ushell/Config",
    "sap/ushell/Container",
    "sap/ushell/resources",
    "sap/ushell/utils",
    "sap/ushell/utils/UriParameters"
], (
    Log,
    Renderer,
    RenderManager,
    URI,
    ApplicationContainerRenderer,
    systemAliasUtils,
    Config,
    Container,
    ushellResources,
    ushellUtils,
    UriParameters
) => {
    "use strict";

    let iIframeIdx = 0;

    const IframeApplicationContainerRenderer = Renderer.extend(ApplicationContainerRenderer);

    IframeApplicationContainerRenderer.render = function (oRenderManager, oContainer) {
        if (!oContainer.getReadyForRendering()) {
            ApplicationContainerRenderer.render(oRenderManager, oContainer);
            return;
        }

        if (this.waitForUI5Version(oContainer)) {
            return;
        }

        if (oContainer.getProperty("iframeWithPost")) {
            const sIframeUrl = oContainer.getProperty("iframeUrl");
            this._renderIframeWithPOST(oRenderManager, oContainer, sIframeUrl, ++iIframeIdx);
        } else {
            this._renderIframe(oRenderManager, oContainer);
        }

        // mark the rendering as complete, this will suppress any further invalidation
        oContainer.setRenderComplete(true);
    };

    IframeApplicationContainerRenderer._renderIframe = function (oRenderManager, oContainer) {
        const sIframeUrl = oContainer.getProperty("iframeUrl");

        oRenderManager.openStart("iframe", oContainer);
        oRenderManager.accessibilityState(oContainer);
        oRenderManager.attr("src", sIframeUrl);
        oRenderManager.attr("title", ushellResources.i18n.getText("AppilcationContainer.IframeTitle"));
        oRenderManager.attr("data-help-id", oContainer.getDataHelpId());
        oRenderManager.attr("data-sap-ushell-active", oContainer.getActive());
        oRenderManager.attr("data-sap-ushell-iframe-idx", ++iIframeIdx);
        oRenderManager.attr("data-sap-ushell-initial-app-id", oContainer.getInitialAppId());
        oRenderManager.attr("data-sap-ushell-current-app-id", oContainer.getCurrentAppId());
        oRenderManager.attr("data-sap-ushell-stateful-type", oContainer.getStatefulType());
        oRenderManager.attr("data-sap-ushell-framework-id", oContainer.getFrameworkId());
        oRenderManager.class("sapUShellApplicationContainer");
        oRenderManager.style("height", oContainer.getHeight());
        oRenderManager.style("width", oContainer.getWidth());

        if (Config.last("/core/shell/enableFeaturePolicyInIframes") === true) {
            oRenderManager.attr("allow", ushellUtils.getIframeFeaturePolicies());
        }

        oRenderManager.openEnd();
        oRenderManager.close("iframe");
    };

    IframeApplicationContainerRenderer._renderIframeWithPOST = function (oRenderManager, oContainer, sIframeUrl, iIframeIdx) {
        const sAdaptedIframeUrl = ushellUtils.filterOutParamsFromLegacyAppURL(sIframeUrl);

        // render the wrapper; we need to to do some async calculation and then rerender
        this._renderPostWrapper(oRenderManager, oContainer);

        this._getAdditionalDataForPost(oContainer, sAdaptedIframeUrl)
            .then(async (oFLPParams) => {
                // we are now running async and need to use a new RenderManager
                const oRenderManagerNew = new RenderManager();

                // When sending a POST request, we concatenate the string "-iframe" to the 'id' attribute of the <iframe> node.
                // The reason is that in POST request the IFRAME element is a child of a new 'div' element, that holds the
                // original id of the <iframe> node, and in order not to associate them with them with the same id we add this string.
                const sFormId = `${oContainer.getId()}-form`;
                const sIframeId = `${oContainer.getId()}-iframe`;

                const oUrls = this._calculatePostUrls(oContainer, sAdaptedIframeUrl);

                this._renderPostForm(
                    oRenderManagerNew,
                    oContainer,
                    sFormId,
                    sIframeId,
                    oFLPParams,
                    oUrls.form,
                    `${oContainer.getDataHelpId()}-form`,
                    oUrls.iframeWithoutSystemAlias
                );

                this._renderPostIframe(
                    oRenderManagerNew,
                    oContainer,
                    sIframeId,
                    oUrls.iframe,
                    oUrls.form,
                    `${oContainer.getDataHelpId()}-iframe`,
                    iIframeIdx
                );

                // now finally apply the changes
                oRenderManagerNew.flush(oContainer.getDomRef());
                oRenderManagerNew.destroy();

                await ushellUtils.awaitTimeout(0);

                return sFormId;
            })
            .then((sFormId) => {
                const oForm = document.getElementById(sFormId);
                if (oForm) {
                    oForm.submit();
                } else {
                    Log.error("Form element not found");
                }
            });
    };

    IframeApplicationContainerRenderer._renderPostWrapper = function (oRenderManager, oContainer) {
        // generate the <div> element that wraps the <form> and the <iframe>
        oRenderManager.openStart("div", oContainer);
        oRenderManager.attr("data-help-id", oContainer.getDataHelpId());
        oRenderManager.attr("data-sap-ushell-active", oContainer.getActive());
        oRenderManager.attr("data-sap-ushell-iframe-app", "true");
        oRenderManager.attr("data-sap-ushell-initial-app-id", oContainer.getInitialAppId());
        oRenderManager.attr("data-sap-ushell-current-app-id", oContainer.getCurrentAppId());
        oRenderManager.attr("data-sap-ushell-stateful-type", oContainer.getStatefulType());
        oRenderManager.attr("data-sap-ushell-framework-id", oContainer.getFrameworkId());
        oRenderManager.class("sapUShellApplicationContainer");
        oRenderManager.style("height", oContainer.getHeight());
        oRenderManager.style("width", oContainer.getWidth());
        oRenderManager.openEnd();
        oRenderManager.close("div");
    };

    IframeApplicationContainerRenderer._calculatePostUrls = function (oContainer, sUrl) {
        const oIframeUriParams = UriParameters.fromURL(sUrl);
        const sIframeWithoutSystemAlias = sUrl;
        const sIframeUrl = systemAliasUtils.addSystemAlias(sIframeWithoutSystemAlias, oContainer);
        let sFormAction = sUrl;

        if (oContainer.getIframePostAllParams()) {
            if (this._getPostParameters(oContainer, sIframeWithoutSystemAlias).length) {
                // trim url
                const sHint = oIframeUriParams.get("sap-iframe-hint");
                const sKeepAlive = oIframeUriParams.get("sap-keep-alive");
                const oNewURI = new URI(sUrl).query("");

                if (typeof sHint === "string") {
                    oNewURI.addSearch("sap-iframe-hint", sHint);
                }
                if (typeof sKeepAlive === "string") {
                    oNewURI.addSearch("sap-keep-alive", sKeepAlive);
                }

                sFormAction = oNewURI.toString();
            }
        }

        return {
            iframeWithoutSystemAlias: sIframeWithoutSystemAlias,
            iframe: sIframeUrl,
            form: sFormAction
        };
    };

    IframeApplicationContainerRenderer._getAdditionalDataForPost = async function (oContainer, sIframeUrl) {
        let aKeys = [];
        let aValues = [];

        const oAppStatesInfo = ushellUtils.getParamKeys(sIframeUrl);
        if (oAppStatesInfo.aAppStateNamesArray.length) {
            const Navigation = await Container.getServiceAsync("Navigation");
            try {
                const aDataArray = await Navigation.getAppStateData(oAppStatesInfo.aAppStateKeysArray);
                if (aDataArray) {
                    aKeys = [...oAppStatesInfo.aAppStateNamesArray];
                    aValues = [...aDataArray];
                }
            } catch {
                // fail silently
            }
        }

        aKeys.push("sap-flp-url");
        aValues.push(Container.getFLPUrl(true));

        aKeys.push("system-alias");
        aValues.push(oContainer.getSystemAlias());

        const oFLPParams = {};
        aKeys.forEach((item, index) => {
            if (aValues[index] || item === "system-alias") {
                oFLPParams[item] = aValues[index];
            }
        });

        return oFLPParams;
    };

    IframeApplicationContainerRenderer._renderPostForm = function (oRenderManager, oContainer, sFormId, sIframeId, oFLPParams, sFormAction, sFormHelpId, sUrlWithoutSystemAlias) {
        const sFLPParams = JSON.stringify(oFLPParams);

        oRenderManager.openStart("form");
        oRenderManager.attr("id", sFormId);
        oRenderManager.attr("method", "post");
        oRenderManager.attr("name", sFormId);
        oRenderManager.attr("target", sIframeId);
        oRenderManager.attr("action", sFormAction);
        oRenderManager.attr("data-help-id", sFormHelpId);
        oRenderManager.style("display", "none");
        oRenderManager.openEnd();

        oRenderManager.voidStart("input");
        oRenderManager.attr("name", "sap-flp-params");
        oRenderManager.attr("value", sFLPParams);
        oRenderManager.voidEnd();

        if (oContainer.getIframePostAllParams()) {
            const aParameters = this._getPostParameters(oContainer, sUrlWithoutSystemAlias);
            aParameters.forEach((oParam) => {
                oRenderManager.voidStart("input");
                oRenderManager.attr("name", oParam.key);
                oRenderManager.attr("value", oParam.value);
                oRenderManager.voidEnd();
            });
        }

        oRenderManager.close("form");
    };

    IframeApplicationContainerRenderer._renderPostIframe = function (oRenderManager, oContainer, sIframeId, sIframeUrl, sFormAction, sIframeHelpId, iIframeIdx) {
        oRenderManager.openStart("iframe", sIframeId);
        oRenderManager.attr("name", sIframeId);
        oRenderManager.accessibilityState(oContainer);
        oRenderManager.attr("sap-orig-src", sIframeUrl);
        oRenderManager.attr("title", ushellResources.i18n.getText("AppilcationContainer.IframeTitle"));
        oRenderManager.attr("data-help-id", sIframeHelpId);
        oRenderManager.attr("data-sap-ushell-iframe-idx", iIframeIdx);
        oRenderManager.class("sapUShellApplicationContainer");
        oRenderManager.style("height", oContainer.getHeight());
        oRenderManager.style("width", oContainer.getWidth());

        if (Config.last("/core/shell/enableFeaturePolicyInIframes")) {
            oRenderManager.attr("allow", ushellUtils.getIframeFeaturePolicies().replaceAll(";", ` ${new URI(sFormAction).origin()};`));
        }

        oRenderManager.openEnd();
        oRenderManager.close("iframe");
    };

    IframeApplicationContainerRenderer._getPostParameters = function (oContainer, sUrl) {
        const oIframeUriParams = UriParameters.fromURL(sUrl);

        const aResult = [];
        let sSapIframeHintVal = "";
        if (oIframeUriParams.has("sap-iframe-hint")) {
            sSapIframeHintVal = oIframeUriParams.get("sap-iframe-hint");
        }

        const oParams = oIframeUriParams.mParams;
        // Verify that it's a WD app (in local FLP or cFLP)
        if (oContainer.getApplicationType() === "TR" || sSapIframeHintVal === "GUI") {
            for (const sKey in oParams) {
                if (sKey === "sap-iframe-hint" || sKey === "sap-keep-alive") {
                    continue;
                }
                aResult.push({
                    key: sKey,
                    value: oParams[sKey][0]
                });
            }
        }

        return aResult;
    };

    return IframeApplicationContainerRenderer;
});
