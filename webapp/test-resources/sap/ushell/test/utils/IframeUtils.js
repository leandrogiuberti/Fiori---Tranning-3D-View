// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview This file contains miscellaneous test utility functions for iframes.
 */
sap.ui.define([
    "sap/base/util/Deferred",
    "sap/ushell/utils"
], (
    Deferred,
    ushellUtils
) => {
    "use strict";

    const iCheckInterval = 100;
    const iResolveCheckTimeout = 500;

    const IframeUtils = {};

    /**
     * Creates an iframe element with the given url.
     * @param {string} sUrl full path to the iframe
     * @param {boolean} [bDisableBundles=false] If set to <code>true</code>, the iframe will be created without the default UI5 preload bundles.
     * @returns {HTMLIFrameElement} the iframe.
     *
     * @since 1.131.0
     * @private
     */
    IframeUtils.createIframe = function (sUrl, bDisableBundles = false) {
        let sFullUrl = sap.ui.require.toUrl(sUrl);

        if (bDisableBundles) {
            // first ensure that the url is absolute
            const oMockIframe = document.createElement("iframe");
            oMockIframe.setAttribute("src", sFullUrl);
            sFullUrl = oMockIframe.src;
            oMockIframe.remove();

            // now we can add params
            const oUrl = new URL(sFullUrl, location.href);
            oUrl.searchParams.append("sap-ui-preload", "off");
            oUrl.searchParams.append("sap-ushell-xx-overwrite-config", "ushell/customPreload/enabled:false");
            sFullUrl = oUrl.href;
        }

        const oWrapper = document.createElement("div");
        oWrapper.innerHTML = `<iframe id="flp" src="${sFullUrl}" width="1000px" height="400px"></iframe>`;
        return oWrapper.children[0];
    };

    /**
     * Appends the iframe to the qunit fixture.
     * @param {HTMLIFrameElement} oIframe The iframe.
     *
     * @since 1.131.0
     * @private
     */
    IframeUtils.appendToQunitFixture = function (oIframe) {
        document.getElementById("qunit-fixture")?.appendChild(oIframe);
    };

    /**
     * Sets the hash on the provided iframe.
     * @param {HTMLIFrameElement} oIframe The iframe.
     * @param {string} sHash The hash to set.
     *
     * @since 1.131.0
     * @private
     */
    IframeUtils.setHash = function (oIframe, sHash) {
        oIframe.contentWindow.document.location.hash = sHash;
    };

    /**
     * Navigates the iframe to the previous page.
     * @param {HTMLIFrameElement} oIframe The iframe.
     *
     * @since 1.134.0
     * @private
     */
    IframeUtils.navigateBack = function (oIframe) {
        oIframe.contentWindow.history.back();
    };

    /**
     * Sets the ushell config on the provided iframe.
     * @param {HTMLIFrameElement} oIframe The iframe.
     * @param {object} oConfig The config to set.
     *
     * @since 1.131.0
     * @private
     */
    IframeUtils.setConfig = function (oIframe, oConfig) {
        oIframe.contentWindow["sap-ushell-config"] = oConfig;
    };

    /**
     * Gets the global object of the iframe.
     * @param {HTMLIFrameElement} oIframe The iframe.
     * @returns {Window} The global object of the iframe.
     *
     * @since 1.131.0
     * @private
     */
    IframeUtils.getGlobalThis = function (oIframe) {
        return oIframe.contentWindow;
    };

    /**
     * Requires requested module in the scope of the iframe.
     * @param {HTMLIFrameElement} oIframe The iframe.
     * @param {string} sModulePath The module path (e.g. "sap/ui/core/Element").
     * @returns {Promise<object>} The requested module.
     *
     * @since 1.131.0
     * @private
     */
    IframeUtils.requireAsync = function (oIframe, sModulePath) {
        return new Promise((resolve, reject) => {
            oIframe.contentWindow.sap.ui.require([sModulePath], resolve, reject);
        });
    };

    /**
     * Waits for the control with the given id to be loaded in the iframe.
     * The <code>sIframeSelector</code> parameter is optional and should be used
     * when the control is inside an inner iframe.
     * @param {HTMLIFrameElement} oIframe The iframe.
     * @param {string} sControlId The control id.
     * @param {string} [sIframeSelector] The selector of the inner iframe.
     * @returns {Promise<sap.ui.core.Control>} The control.
     *
     * @since 1.131.0
     * @private
     */
    IframeUtils.waitForControl = function (oIframe, sControlId, sIframeSelector) {
        const oDeferred = new Deferred();
        async function fnCheck () {
            let Element;
            if (sIframeSelector) {
                const oInnerIframe = oIframe.contentDocument.querySelector(sIframeSelector);
                if (oInnerIframe?.contentWindow) {
                    Element = await IframeUtils.requireAsync(oInnerIframe, "sap/ui/core/Element");
                } else if (oInnerIframe) { // regular dom node
                    Element = await IframeUtils.requireAsync(oIframe, "sap/ui/core/Element");
                }
            } else {
                Element = await IframeUtils.requireAsync(oIframe, "sap/ui/core/Element");
            }

            if (!Element) {
                console.log(`Did not sap/ui/core/Element. Waiting for '${sIframeSelector}' to be loaded...`);
                setTimeout(fnCheck, iCheckInterval);
                return;
            }

            const oControl = Element.getElementById(sControlId);
            if (oControl) {
                // Tests run unstable if we resolve immediately, so we wait a bit
                await ushellUtils.awaitTimeout(iResolveCheckTimeout);
                oDeferred.resolve(oControl);
            } else {
                console.log(`Did not find the target control. Waiting for '${sControlId}' to be loaded...`);
                setTimeout(fnCheck, iCheckInterval);
            }
        }
        fnCheck();
        return oDeferred.promise;
    };

    /**
     * Waits for the control with the given id to be loaded in the given application container.
     * The application container might be an iframe itself.
     * @param {HTMLIFrameElement} oIframe The iframe.
     * @param {string} sControlId The control id.
     * @param {string} sStorageAppId The id of the initial application created by the AppLifeCycle.
     * @returns {Promise<HTMLElement>} The dom node.
     *
     * @since 1.135.0
     * @private
     */
    IframeUtils.waitForControlInApplication = function (oIframe, sControlId, sStorageAppId) {
        return this.waitForControl(oIframe, sControlId, `[data-sap-ushell-initial-app-id="${sStorageAppId}"]`);
    };

    /**
     * Waits for the dom node with the given id to be loaded in the iframe.
     * The <code>sIframeSelector</code> parameter is optional and should be used
     * when the dom node is inside an inner iframe.
     * @param {HTMLIFrameElement} oIframe The iframe.
     * @param {string} sCssSelector The css selector.
     * @param {string} [sIframeSelector] The selector of the inner iframe.
     * @returns {Promise<HTMLElement>} The dom node.
     *
     * @since 1.131.0
     * @private
     */
    IframeUtils.waitForCssSelector = function (oIframe, sCssSelector, sIframeSelector) {
        const oDeferred = new Deferred();
        async function fnCheck () {
            let oTargetDom;
            if (sIframeSelector) {
                const oInnerIframe = oIframe.contentDocument.querySelector(sIframeSelector);
                if (oInnerIframe?.contentDocument) {
                    oTargetDom = oInnerIframe?.contentDocument;
                } else if (oInnerIframe) { // regular dom node
                    oTargetDom = oInnerIframe;
                }
            } else {
                oTargetDom = oIframe?.contentDocument;
            }

            if (!oTargetDom) {
                console.log(`Did not find the target dom. Waiting for '${sIframeSelector}' to be loaded...`);
                setTimeout(fnCheck, iCheckInterval);
                return;
            }

            const oNode = oTargetDom.querySelector(sCssSelector);
            if (oNode) {
                // Tests run unstable if we resolve immediately, so we wait a bit
                await ushellUtils.awaitTimeout(iResolveCheckTimeout);
                oDeferred.resolve(oNode);
            } else {
                console.log(`Did not find the target dom node. Waiting for '${sCssSelector}' to be loaded...`);
                setTimeout(fnCheck, iCheckInterval);
            }
        }
        fnCheck();
        return oDeferred.promise;
    };

    /**
     * Returns the dom node matching the given css selector in the given application container.
     * The application container might be an iframe itself.
     * @param {HTMLIFrameElement} oIframe The iframe.
     * @param {string} sCssSelector The css selector.
     * @param {string} sStorageAppId The id of the initial application created by the AppLifeCycle.
     * @returns {Promise<HTMLElement>} The dom node.
     *
     * @since 1.135.0
     * @private
     */
    IframeUtils.waitForCssSelectorInApplication = function (oIframe, sCssSelector, sStorageAppId) {
        return this.waitForCssSelector(oIframe, sCssSelector, `[data-sap-ushell-initial-app-id="${sStorageAppId}"]`);
    };

    /**
     * Gets the control with the given id from the iframe.
     * The <code>sIframeSelector</code> parameter is optional and should be used
     * when the control is inside an inner iframe.
     * @param {HTMLIFrameElement} oIframe The iframe.
     * @param {string} sCssSelector The css selector.
     * @param {string} [sIframeSelector] The selector of the inner iframe.
     * @returns {HTMLElement} The dom node.
     *
     * @since 1.131.0
     * @private
     */
    IframeUtils.getWithCssSelector = function (oIframe, sCssSelector, sIframeSelector) {
        let oTargetDom;
        if (sIframeSelector) {
            const oInnerIframe = oIframe.contentDocument.querySelector(sIframeSelector);
            if (oInnerIframe?.contentDocument) {
                oTargetDom = oInnerIframe?.contentDocument;
            } else if (oInnerIframe) { // regular dom node
                oTargetDom = oInnerIframe;
            }
        } else {
            oTargetDom = oIframe?.contentDocument;
        }

        if (!oTargetDom) {
            return;
        }

        const oNode = oTargetDom.querySelector(sCssSelector);
        return oNode;
    };

    /**
     * Returns the dom node matching the given css selector in the given application container.
     * The application container might be an iframe itself.
     * @param {HTMLIFrameElement} oIframe The iframe.
     * @param {string} sCssSelector The css selector.
     * @param {string} sStorageAppId The id of the initial application created by the AppLifeCycle.
     * @returns {HTMLElement} The dom node.
     *
     * @since 1.135.0
     * @private
     */
    IframeUtils.getWithCssSelectorInApplication = function (oIframe, sCssSelector, sStorageAppId) {
        return this.getWithCssSelector(oIframe, sCssSelector, `[data-sap-ushell-initial-app-id="${sStorageAppId}"]`);
    };

    /**
     * Returns the application container for the given iframe and application id.
     * The application container might be an iframe itself.
     * @param {HTMLIFrameElement} oIframe The iframe.
     * @param {string} sStorageAppId The id of the initial application created by the AppLifeCycle.
     * @returns {HTMLElement} The application container.
     *
     * @since 1.135.0
     * @private
     */
    IframeUtils.getApplicationContainer = function (oIframe, sStorageAppId) {
        return this.getWithCssSelector(oIframe, `[data-sap-ushell-initial-app-id="${sStorageAppId}"]`);
    };

    return IframeUtils;
});
