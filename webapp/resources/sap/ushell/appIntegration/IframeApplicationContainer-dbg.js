// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview The Application Container for iFrames.
 */
sap.ui.define([
    "sap/base/Log",
    "sap/base/util/uid",
    "sap/ui/Device",
    "sap/ui/thirdparty/URI",
    "sap/ushell/appIntegration/ApplicationContainer",
    "sap/ushell/appIntegration/IframeApplicationContainerRenderer",
    "sap/ushell/appIntegration/PostMessageManager",
    "sap/ushell/ApplicationType/UrlPostProcessing",
    "sap/ushell/ApplicationType/systemAlias",
    "sap/ushell/Config",
    "sap/ushell/Container",
    "sap/ushell/library", // css style dependency
    "sap/ushell/System",
    "sap/ushell/utils",
    "sap/ushell/utils/UriParameters"
], (
    Log,
    uid,
    Device,
    URI,
    ApplicationContainer,
    IframeApplicationContainerRenderer,
    PostMessageManager,
    UrlPostProcessing,
    systemAliasUtils,
    Config,
    Container,
    ushellLibrary,
    System,
    ushellUtils,
    UriParameters
) => {
    "use strict";

    const iValidIframeTimeout = 3500;

    /**
     * @alias sap.ushell.appIntegration.IframeApplicationContainer
     * @class
     *
     * @extends sap.ushell.appIntegration.ApplicationContainer
     *
     * @since 1.134.0
     * @private
     */ // eslint-disable-next-line max-len
    const IframeApplicationContainer = ApplicationContainer.extend("sap.ushell.appIntegration.IframeApplicationContainer", /** @lends sap.ushell.appIntegration.IframeApplicationContainer.prototype */ {
        metadata: {
            library: "sap.ushell",
            properties: {
                visible: { type: "boolean", defaultValue: true },
                globalDirtyStorageKey: { defaultValue: "", type: "string" },
                iframeUrl: { defaultValue: "", type: "string", visibility: "hidden" },
                iframePostAllParams: { defaultValue: false, type: "boolean" },
                iframeWithPost: { defaultValue: false, type: "boolean" },

                iframeIsValidSupport: { defaultValue: false, type: "boolean" },
                lastIframeIsValidTime: { defaultValue: 0, type: "int" }
            },
            interfaces: [
                "sap.ushell.renderer.INavContainerPage"
            ]
        },
        renderer: IframeApplicationContainerRenderer
    });

    IframeApplicationContainer.prototype.init = function () {
        ApplicationContainer.prototype.init.apply(this, arguments);

        this._aPendingRequestsWaitingForResponse = [];

        this.setProperty("lastIframeIsValidTime", Date.now(), true);

        const sDirtyStateStorageKey = `sap.ushell.Container.dirtyState.${uid()}`;
        this.setProperty("globalDirtyStorageKey", sDirtyStateStorageKey, true);
        localStorage.removeItem(this.getGlobalDirtyStorageKey()); // remove container from list of NWBC-containing containers; if this container was an NWBC container before

        this._fnStorageEventListener = this._handleStorageEvent.bind(this);
        addEventListener("storage", this._fnStorageEventListener);

        // be sure to remove entry from list of NWBC-containing containers when the window is closed
        this._fnPagehideEventListener = this.exit.bind(this);
        addEventListener("pagehide", this._fnPagehideEventListener);
    };

    IframeApplicationContainer.prototype.onBeforeRendering = function () {
        if (!this.getReadyForRendering()) {
            return;
        }

        this._attachLogoutEvent(); // todo: [FLPCOREANDUX-10024] might be always added
        this._initNWBCStorage();
        this._addRemoteSystemForUrl();
        this._calculateIframeUrl(); // todo: [FLPCOREANDUX-10024] check whether this can be async
        this._calculateIframeWithPost();

        // the post mechanism requires the iframeUrl without system alias
        if (!this.getProperty("iframeWithPost")) {
            const sIframeUrl = this.getProperty("iframeUrl");
            const sIframeUrlWithSystemAlias = systemAliasUtils.addSystemAlias(sIframeUrl, this);

            this.setProperty("iframeUrl", sIframeUrlWithSystemAlias, true);
        }
    };

    IframeApplicationContainer.prototype.onAfterRendering = async function () {
        if (!this.getReadyForRendering()) {
            return;
        }

        // after rendering, the iframe and its origin is available
        const MessageBroker = await Container.getServiceAsync("MessageBroker");
        const sTargetOrigin = this.getPostMessageTargetOrigin();
        MessageBroker.addAcceptedOrigin(sTargetOrigin);

        // iOS Safari ignores CSS width and height of the iframe. The iframe is as big as its contents.
        // Scrolling inside of a such an iframe is not possible. Scroll the parent container instead.
        if (Device.os.ios && this.$().prop("tagName") === "IFRAME") {
            this.$().parent().css("overflow", "auto"); // todo: [FLPCOREANDUX-10024] fix this
        }
    };

    /**
     * Implementation of sap.ushell.renderer.INavContainerPage interface.
     * @param {boolean} bVisible The new visibility state of the control.
     *
     * @since 1.135.0
     * @private
     */
    IframeApplicationContainer.prototype.setVisibility = function (bVisible) {
        this.setProperty("visible", bVisible, true);

        // set aria-hidden attribute directly on dom element,
        // as the control is not rerendered
        const oDomRef = this.getDomRef();
        if (oDomRef) {
            oDomRef.setAttribute("aria-hidden", !bVisible);
        }

        if (bVisible) {
            this.removeStyleClass("sapUShellApplicationContainerIframeHidden");
            this.removeStyleClass("sapUShellApplicationContainerIframeHiddenButActive");
            return;
        }

        // see sendRequest for explanation
        if (this._aPendingRequestsWaitingForResponse.length > 0) {
            this.addStyleClass("sapUShellApplicationContainerIframeHiddenButActive");
        } else {
            this.addStyleClass("sapUShellApplicationContainerIframeHidden");
        }
    };

    /**
     * Sets the current help id.
     * @param {string} sDataHelpId The new help id.
     * @returns {this} <code>this</code> to allow method chaining.
     *
     * @since 1.136.0
     * @private
     */
    IframeApplicationContainer.prototype.setDataHelpId = function (sDataHelpId) {
        ApplicationContainer.prototype.setDataHelpId.apply(this, arguments);

        // no action required if created via GET or not yet rendered
        if (!this.getDomRef() || !this.getIframeWithPost()) {
            return this;
        }

        const oIframe = this._getIframe();
        if (oIframe) {
            oIframe.setAttribute("data-help-id", `${sDataHelpId}-iframe`);
        }

        // the form is not updated, because it is only used once and its internals
        // still refer to the old id

        return this;
    };

    IframeApplicationContainer.prototype._attachLogoutEvent = function () {
        const sApplicationType = this.getApplicationType();
        if (ushellUtils.isApplicationTypeEmbeddedInIframe(sApplicationType)) {
            this._fnLogout = this._handleLogout.bind(this);
            Container.attachLogoutEvent(this._fnLogout);
        }
    };

    IframeApplicationContainer.prototype._initNWBCStorage = function () {
        const sApplicationType = this.getApplicationType();
        if (ushellUtils.isApplicationTypeEmbeddedInIframe(sApplicationType, true) || ushellUtils.isApplicationTypeEmbeddedInIframe(this.getFrameworkId())) {
            // add this container to list of NWBC-containing containers
            ushellUtils.localStorageSetItem(this.getGlobalDirtyStorageKey(), Container.DirtyState.INITIAL);
        }
    };

    IframeApplicationContainer.prototype._getDocumentUrl = function () {
        return document.URL;
    };

    IframeApplicationContainer.prototype._calculateIframeWithPost = function () {
        const oUrlParams = UriParameters.fromURL(this._getDocumentUrl());
        const sApplicationType = this.getApplicationType();

        const bPostEnabledByConfig = Config.last("/core/shell/enableOpenIframeWithPost") ?? true;
        const bPostDisabledByUrlParam = oUrlParams.get("sap-post") === "false";
        const bPostEnforcedByUrlParam = oUrlParams.get("sap-post") === "true";
        const bPostDisabledByResolution = this.getOpenWithPostByAppParam() === false;

        const bApplicableApplicationType = [
            "NWBC",
            "TR",
            "WDA",
            "WCF"
        ].includes(sApplicationType);

        let bEnablePost;
        if (bPostEnforcedByUrlParam) {
            bEnablePost = true;
        } else if (bPostDisabledByUrlParam) {
            bEnablePost = false;
        } else if (bPostDisabledByResolution) {
            bEnablePost = false;
        } else {
            bEnablePost = bPostEnabledByConfig && bApplicableApplicationType;
        }

        // preparations to open the iframe with POST (vs the default GET)
        if (bEnablePost && sApplicationType === "TR") {
            this.setProperty("iframePostAllParams", true, true);
        }

        this.setProperty("iframeWithPost", bEnablePost, true);
    };

    IframeApplicationContainer.prototype._calculateIframeUrl = function () {
        const sApplicationType = this.getApplicationType();

        let sIframeUrl = this.getUrl();
        // add classic ui flags
        sIframeUrl = UrlPostProcessing.processUrl(
            sIframeUrl,
            sApplicationType,
            false, // bForExplaceNavigation
            this
        );

        sIframeUrl = this._injectParametersFromDocumentUrl(sIframeUrl);

        this.setProperty("iframeUrl", sIframeUrl, true);
    };

    IframeApplicationContainer.prototype._injectParametersFromDocumentUrl = function (sIframeUrl) {
        // generic mechanism for allowing to pass parameters to the iframe URL
        const oUrlParams = UriParameters.fromURL(this._getDocumentUrl());
        if (!oUrlParams.has("sap-iframe-params")) {
            return sIframeUrl;
        }

        const sIframeParams = oUrlParams.get("sap-iframe-params") || "";
        const aParams = sIframeParams.split(",");

        const sTmpURI = new URI(sIframeUrl);
        aParams.forEach((sParam) => {
            if (sParam && oUrlParams.has(sParam)) {
                sTmpURI.addQuery(sParam, oUrlParams.get(sParam));
            }
        });
        sIframeUrl = sTmpURI.toString();

        return sIframeUrl;
    };

    /**
     * Creates a system object that describes the URL's server.
     * @param {string} sUrl
     *   the URL
     * @param {object}
     *   the system object with <code>alias</code>, <code>baseUrl</code> describing the URL's
     *   server and <code>client</code> the client from the request property
     *   <code>sap-client</code>.
     */
    IframeApplicationContainer.prototype._addRemoteSystemForUrl = function () {
        if (this._oSystem) {
            return;
        }

        const sUrl = this.getUrl();
        const oAnchor = document.createElement("a");
        const sClient = UriParameters.fromURL(sUrl).get("sap-client");

        oAnchor.href = sUrl;
        const sBase = `${oAnchor.protocol}//${oAnchor.host}`;

        this._oSystem = new System({
            alias: sClient ? `${sBase}?sap-client=${sClient}` : sBase,
            baseUrl: sBase,
            client: sClient || undefined,
            platform: "abap"
        });

        Container.addRemoteSystem(this._oSystem);
    };

    IframeApplicationContainer.prototype._handleStorageEvent = function (oEvent) {
        // only handle events for the current application
        if (oEvent.key !== this.getGlobalDirtyStorageKey()) {
            return;
        }

        if (oEvent.newValue !== Container.DirtyState.PENDING) {
            return;
        }

        const oTarget = this.getPostMessageTarget();
        if (!oTarget) {
            return;
        }

        Log.debug("getGlobalDirty() send pro54_getGlobalDirty ", null, "sap.ushell.appIntegration.ApplicationContainer");

        const sTargetOrigin = this.getPostMessageTargetOrigin();
        const sMessage = JSON.stringify({ action: "pro54_getGlobalDirty" });
        oTarget.postMessage(sMessage, sTargetOrigin);
    };

    IframeApplicationContainer.prototype._handleLogout = function (oEvent) {
        const oContentWindow = this.getPostMessageTarget();
        const sApplicationType = this.getApplicationType();

        if (oContentWindow && ushellUtils.isApplicationTypeEmbeddedInIframe(sApplicationType)) {
            const sTargetDomain = this.getPostMessageTargetOrigin();

            oContentWindow.postMessage(JSON.stringify(
                { action: "pro54_disableDirtyHandler" }
            ), sTargetDomain);
            // tell caller that at least one NWBC needs some time to receive a message
            oEvent.preventDefault();
        }
    };

    IframeApplicationContainer.prototype._getIframe = function () {
        const oIFrame = this.getDomRef();
        if (!oIFrame || oIFrame.tagName !== "IFRAME") {
            if (this.getIframeWithPost() === true && oIFrame && oIFrame.getAttribute && oIFrame.getAttribute("data-sap-ushell-iframe-app") === "true") {
                return document.getElementById(`${oIFrame.getAttribute("id")}-iframe`);
            }
            return null;
        }
        return oIFrame;
    };

    IframeApplicationContainer.prototype.getPostMessageTarget = function () {
        const oIframe = this._getIframe();
        return oIframe?.contentWindow;
    };

    IframeApplicationContainer.prototype.getPostMessageTargetOrigin = function () {
        let sIframeUrl;
        const oIFrame = this._getIframe();

        if (!oIFrame) {
            return "";
        }

        if (this.getIframeWithPost() === true) {
            const sFormId = `${oIFrame.getAttribute("id").replace("-iframe", "-form")}`;
            const oForm = document.getElementById(sFormId);
            sIframeUrl = oForm?.action;
        } else {
            sIframeUrl = oIFrame.src;
        }

        const oUri = new URI(sIframeUrl);
        const sTargetOrigin = `${oUri.protocol()}://${oUri.host()}`;
        return sTargetOrigin;
    };

    IframeApplicationContainer.prototype.isTrustedPostMessageSource = function (oMessage) {
        if (!oMessage) {
            return false;
        }

        // this checks whether the message is sent from the iframe itself
        if (oMessage.source && oMessage.source === this.getPostMessageTarget()) {
            return true;
        }

        // this checks whether the message is sent from the iframe's origin: e.g. a nested iframe
        if (oMessage.origin && oMessage.origin === this.getPostMessageTargetOrigin()) {
            return true;
        }

        return false;
    };

    /**
     * Sends a request to the iframe and awaits the response if required.
     * @param {string} sServiceRequest The service request
     * @param {any} oMessageBody The message body which should be sent. Needs to be serializable.
     * @param {boolean} [bWaitForResponse=false] Whether to wait for a response
     * @returns {Promise<any>} Resolves with the response of the iframe if <code>bWaitForResponse</code> is true.
     *
     * @since 1.134.0
     * @private
     */
    IframeApplicationContainer.prototype.sendRequest = async function (sServiceRequest, oMessageBody, bWaitForResponse = false) {
        if (!bWaitForResponse) {
            return PostMessageManager.sendRequestToApplication(
                sServiceRequest,
                oMessageBody,
                this,
                false
            );
        }

        /*
         * If the iframe is hidden, calls of setTimeout and setInterval are throttled within the iframe for certain browsers
         * (currently Chrome and Edge) if the iframe content comes from a different domain.
         * This can lead to a delayed app start as the following post message to create the app within the iFrame waits until the app is created.
         * Currently this is ONLY relevant for the UI5 app runtime when its UI5 bootstrap is NOT switched to async.
         * In this case UI5 uses many setTimeouts with a delay of 0 during component creation to simulate async behavior.
         */
        if (!this.getProperty("visible")) {
            this.addStyleClass("sapUShellApplicationContainerIframeHiddenButActive");
            this.removeStyleClass("sapUShellApplicationContainerIframeHidden");
        }

        const oPromise = PostMessageManager.sendRequestToApplication(
            sServiceRequest,
            oMessageBody,
            this,
            true
        );

        // for concurrent requests, we need to keep track of the promises
        this._aPendingRequestsWaitingForResponse.push(oPromise);
        const oResult = await oPromise;
        this._aPendingRequestsWaitingForResponse = this._aPendingRequestsWaitingForResponse.filter((oPendingRequest) => oPendingRequest !== oPromise);

        // only make the iframe unresponsive again if there are no more pending requests AND the iframe is still hidden
        if (this._aPendingRequestsWaitingForResponse.length === 0 && !this.getProperty("visible")) {
            this.addStyleClass("sapUShellApplicationContainerIframeHidden");
            this.removeStyleClass("sapUShellApplicationContainerIframeHiddenButActive");
        }

        return oResult;
    };

    IframeApplicationContainer.prototype.sendBeforeAppCloseEvent = async function () {
        const oEventData = this.getBeforeAppCloseEvent();
        if (oEventData?.enabled === true) {
            return this.sendRequest("sap.ushell.services.CrossApplicationNavigation.beforeAppCloseEvent", oEventData.params, true);
        }
    };

    /**
     * Checks if the iframe is valid and responsive.
     * @returns {boolean} Whether the iframe is valid.
     * @throws {Error} If the iframe is not valid.
     *
     * @since 1.141.0
     * @private
     */
    IframeApplicationContainer.prototype.isValid = function () {
        if (!this.getIframeIsValidSupport()) {
            return true;
        }

        const iLastValidTimeDelta = Date.now() - this.getLastIframeIsValidTime();
        const bIframeInvalid = iLastValidTimeDelta >= iValidIframeTimeout;
        const sReason = `iframe did not ping in the last '${iLastValidTimeDelta}' ms`;

        if (bIframeInvalid) {
            throw new Error(sReason);
        }

        return true;
    };

    IframeApplicationContainer.prototype.exit = function () {
        // remove container from list of NWBC-containing containers; if this container was an NWBC container before
        localStorage.removeItem(this.getGlobalDirtyStorageKey());

        if (this._fnStorageEventListener) {
            removeEventListener("storage", this._fnStorageEventListener);
        }

        if (this._fnPagehideEventListener) {
            removeEventListener("pagehide", this._fnPagehideEventListener);
        }

        if (this._fnLogout) {
            Container.detachLogoutEvent(this._fnLogout);
        }

        ApplicationContainer.prototype.exit.apply(this, arguments);
    };

    return IframeApplicationContainer;
});
