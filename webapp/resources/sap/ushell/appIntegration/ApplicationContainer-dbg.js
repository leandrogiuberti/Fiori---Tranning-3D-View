// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview The UI integration's SAPUI5 control which supports application embedding.
 * @version 1.141.1
 */
sap.ui.define([
    "sap/base/Log",
    "sap/ui/core/Control",
    "sap/ushell/appIntegration/ApplicationContainerRenderer",
    "sap/ushell/library", // css style dependency
    "sap/ushell/utils"
], (
    Log,
    Control,
    ApplicationContainerRenderer,
    ushellLibrary,
    ushellUtils
) => {
    "use strict";

    // shortcut for sap.ushell.appIntegration.contracts.StatefulType
    const StatefulType = ushellLibrary.appIntegration.contracts.StatefulType;

    // shortcut for sap.ushell.components.container.ApplicationType
    const ApplicationType = ushellLibrary.components.container.ApplicationType;

    /**
     * @alias sap.ushell.appIntegration.ApplicationContainer
     * Creates a new container control embedding the application with the given URL. The default
     * application type is "URL" and allows to embed web applications into an <code>IFRAME</code>.
     * By default, the container is visible and occupies the whole width and height of its parent.
     *
     * @class
     * @classdesc A container control capable of embedding a variety of application types.
     *
     * <b>Note:</b> The browser does not allow to move an <code>IFRAME</code> around in the DOM
     * while keeping its state. Thus every rerender of the control is blocked.
     *
     * @extends sap.ui.core.Control
     * @since 1.15.0
     */ // eslint-disable-next-line max-len
    const ApplicationContainer = Control.extend("sap.ushell.appIntegration.ApplicationContainer", /** @lends sap.ushell.appIntegration.ApplicationContainer.prototype */ {
        metadata: {
            library: "sap.ushell",
            properties: {
                visible: { type: "boolean", defaultValue: true },
                /**
                 * The container's height as a CSS size. This attribute is provided to the browser "as is"!
                 * <b>Note:</b> The HTML 4.01 specification allows pixels and percentages,
                 * but the HTML 5 specification allows pixels only!
                 */
                height: { defaultValue: "100%", type: "sap.ui.core.CSSSize" },
                /**
                 * The container's width as a CSS size. This attribute is provided to the browser "as is"!
                 * <b>Note:</b> The HTML 4.01 specification allows pixels and percentages,
                 * but the HTML 5 specification allows pixels only!
                 */
                width: { defaultValue: "100%", type: "sap.ui.core.CSSSize" },

                active: { defaultValue: true, type: "boolean" },
                initialAppId: { defaultValue: "", type: "string" },
                currentAppId: { defaultValue: "", type: "string" },
                currentAppUrl: { defaultValue: "", type: "string" },
                shellUIService: { type: "object" },
                statefulType: { defaultValue: StatefulType.NotSupported, type: "sap.ushell.appIntegration.contracts.StatefulType" },
                beforeAppCloseEvent: { type: "object" },
                isKeepAlive: { defaultValue: false, type: "boolean" },
                isFetchedFromCache: { defaultValue: false, type: "boolean" },
                capabilities: { defaultValue: {}, type: "object" },

                currentAppTargetResolution: { type: "object" },

                /**
                 * Whether the container is ready for rendering.
                 * Subclasses should prevent any preparation steps and the actual rendering if this
                 * property is set to <code>false</code>. The subclasses should render the container
                 * with the base renderer instead. This property should be set to <code>true</code
                 * by the AppLifeCycle whenever the container state is ready to be applied to the UI.
                 */
                readyForRendering: { defaultValue: false, type: "boolean" },

                /**
                 * Whether the container has been rendered completely.
                 * Subclasses should set this property once the actual rendering is done.
                 * It prevents the container from being invalidated.
                 */
                renderComplete: { defaultValue: false, type: "boolean" },

                // ==========================================
                // ========== ResolvedHashFragment ==========

                // appFrameworkId from app capabilities
                frameworkId: { defaultValue: "", type: "string" },

                /**
                 * The type of the embedded application.
                 */
                applicationType: { defaultValue: ApplicationType.URL, type: "sap.ushell.components.container.ApplicationType" },
                openWithPostByAppParam: { defaultValue: true, type: "boolean" },
                reservedParameters: { type: "object" },
                systemAlias: { defaultValue: "", type: "string" },
                targetNavigationMode: { defaultValue: "", type: "string" },
                /**
                 * The URL to the embedded application.
                 */
                url: { defaultValue: "", type: "string" },

                /**
                 * Specifies the data-help-id attribute of the container.
                 *
                 * This attribute is used by SAP Companion/ WalkMe to identify the
                 * application for the purpose of providing help content.
                 *
                 * Additionally, the data-help-id attribute is used by automated
                 * testing tools.
                 *
                 * The id is updated for each application that is loaded in the container.
                 * When the application is stored or destroyed, the id is removed.
                 *
                 * @since 1.136.0
                 */
                dataHelpId: { type: "string", defaultValue: "" }
            },
            interfaces: [
                "sap.ushell.renderer.INavContainerPage"
            ]
        },
        renderer: ApplicationContainerRenderer
    });

    // we have to cache the UI5 version first to have it available sync for the renderer
    ApplicationContainer.ui5version = null;
    ApplicationContainer.ui5versionPromise = ushellUtils.getUi5Version().then((sVersion) => {
        Log.debug(`Using ui5-version: ${sVersion}`, null, "sap.ushell.appIntegration.ApplicationContainer");
        ApplicationContainer.ui5version = sVersion;
    });

    ApplicationContainer.prototype.getUi5Version = function () {
        return ApplicationContainer.ui5version;
    };

    /**
     * Initialization of <code>ApplicationContainer</code> instance.
     */
    ApplicationContainer.prototype.init = function () {
        // set object default values again to prevent them from being "synced"
        this.setProperty("capabilities", {}, true);
    };

    ApplicationContainer.prototype.invalidate = function () {
        if (this.getRenderComplete()) {
            // always prevent re-rendering of application container once it's rendered
            return this;
        }

        return Control.prototype.invalidate.apply(this, arguments);
    };

    /**
     * Implementation of sap.ushell.renderer.INavContainerPage interface.
     * @param {boolean} bVisible The new visibility state of the control.
     *
     * @since 1.135.0
     * @private
     */
    ApplicationContainer.prototype.setVisibility = function (bVisible) {
        this.setProperty("visible", bVisible, true);

        if (bVisible) {
            this.removeStyleClass("sapUShellApplicationContainerHidden");
        } else {
            this.addStyleClass("sapUShellApplicationContainerHidden");
        }

        // set aria-hidden attribute directly on dom element,
        // as the control is not rerendered
        const oDomRef = this.getDomRef();
        if (oDomRef) {
            oDomRef.setAttribute("aria-hidden", !bVisible);
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
    ApplicationContainer.prototype.setDataHelpId = function (sDataHelpId) {
        this.setProperty("dataHelpId", sDataHelpId);

        const oDomRef = this.getDomRef();
        if (oDomRef) {
            oDomRef.setAttribute("data-help-id", sDataHelpId);
        }

        return this;
    };

    /**
     * Sets the active state of the application container.
     * @param {string} bActive The new active state.
     * @returns {this} <code>this</code> to allow method chaining.
     *
     * @since 1.135.0
     * @private
     */
    ApplicationContainer.prototype.setActive = function (bActive) {
        this.setProperty("active", bActive);

        const oDomRef = this.getDomRef();
        if (oDomRef) {
            oDomRef.setAttribute("data-sap-ushell-active", bActive);
        }

        return this;
    };

    /**
     * Sets the initial application id.
     * @param {string} sAppId The initial application id.
     * @returns {this} <code>this</code> to allow method chaining.
     *
     * @since 1.135.0
     * @private
     */
    ApplicationContainer.prototype.setInitialAppId = function (sAppId) {
        this.setProperty("initialAppId", sAppId);

        const oDomRef = this.getDomRef();
        if (oDomRef) {
            oDomRef.setAttribute("data-sap-ushell-initial-app-id", sAppId);
        }

        return this;
    };

    /**
     * Sets the current application id.
     * @param {string} sAppId The new application id.
     * @returns {this} <code>this</code> to allow method chaining.
     *
     * @since 1.135.0
     * @private
     */
    ApplicationContainer.prototype.setCurrentAppId = function (sAppId) {
        this.setProperty("currentAppId", sAppId);

        const oDomRef = this.getDomRef();
        if (oDomRef) {
            oDomRef.setAttribute("data-sap-ushell-current-app-id", sAppId);
        }

        return this;
    };

    /**
     * Sets the stateful type of the application container.
     * @param {sap.ushell.appIntegration.contracts.StatefulType} sNewStatefulType The new stateful type.
     * @returns {this} <code>this</code> to allow method chaining.
     *
     * @since 1.135.0
     * @private
     */
    ApplicationContainer.prototype.setStatefulType = function (sNewStatefulType) {
        this.setProperty("statefulType", sNewStatefulType);

        const oDomRef = this.getDomRef();
        if (oDomRef) {
            oDomRef.setAttribute("data-sap-ushell-stateful-type", sNewStatefulType);
        }

        return this;
    };

    /**
     * Sets the framework id of the application.
     * @param {string} sFrameworkId The new framework id.
     * @returns {this} <code>this</code> to allow method chaining.
     *
     * @since 1.135.0
     * @private
     */
    ApplicationContainer.prototype.setFrameworkId = function (sFrameworkId) {
        this.setProperty("frameworkId", sFrameworkId);

        const oDomRef = this.getDomRef();
        if (oDomRef) {
            oDomRef.setAttribute("data-sap-ushell-framework-id", sFrameworkId);
        }

        return this;
    };

    /**
     * Method called by the appLifeCycle to post a "before close" message to the app
     * running in the iframe before the iframe its destroyed.
     * The message is sent only if the iframe registered to be informed with this message.
     * This mechanism was added to solve the change made in Chrome to disallow Sync XHR on
     * browser close.
     *
     * @returns {Promise}
     *  A promise object in case a post message is sent, and "undefined" in case no message needs
     *  to be sent. In case of real promise, it will be resolved when the iframe response back that
     *  it processed the message.
     *
     * @private
     */
    ApplicationContainer.prototype.sendBeforeAppCloseEvent = async function () {
        // can be implemented by sub classes
    };

    /**
     * Determine if the source of a received postMessage can be considered as trusted. We consider
     * the content window of the application container's iframe as trusted
     *
     * @param {object} oMessage
     *   the postMessage event object
     * @returns {boolean}
     *   true if source is considered to be trustworthy
     * @private
     * @since 1.24
     */
    ApplicationContainer.prototype.isTrustedPostMessageSource = function (oMessage) {
        // sub classes can override this method to implement their own logic
        return false;
    };

    ApplicationContainer.prototype.getPostMessageTarget = function () {
        // needs to be implemented by sub classes
        throw new Error("getPostMessageTarget is not implemented in ApplicationContainer");
    };

    ApplicationContainer.prototype.getPostMessageTargetOrigin = function () {
        // needs to be implemented by sub classes
        throw new Error("getPostMessageTargetOrigin is not implemented in ApplicationContainer");
    };

    /**
     * Merges the given capabilities into the existing blue box capabilities.
     * Existing capabilities are overwritten.
     * @param {string[]} aNewCapabilities The additional capabilities.
     * @returns {this} this instance for method chaining
     *
     * @since 1.130.0
     * @private
     */
    ApplicationContainer.prototype.addCapabilities = function (aNewCapabilities) {
        const oCapabilities = this.getCapabilities();

        aNewCapabilities.forEach((sCapability) => {
            oCapabilities[`${sCapability}`.toLowerCase()] = true;
        });
        return this;
    };

    /**
     * Removes the given capabilities from the existing blue box capabilities.
     * If no capabilities are provided, all capabilities are removed.
     * @param {string[]} [aCapabilitiesToRemove] The capabilities to remove. If not provided, all capabilities are removed.
     * @returns {this} this instance for method chaining
     *
     * @since 1.130.0
     * @private
     */
    ApplicationContainer.prototype.removeCapabilities = function (aCapabilitiesToRemove) {
        const oCapabilities = this.getCapabilities();

        if (!aCapabilitiesToRemove) {
            this.setProperty("capabilities", {}, true);
            return this;
        }

        aCapabilitiesToRemove.forEach((sCapability) => {
            delete oCapabilities[`${sCapability}`.toLowerCase()];
        });
        return this;
    };

    /**
     * Checks if this application container supports the given capabilities.
     * @param {string[]} aRequiredCapabilities The capabilities to check.
     * @returns {boolean} true if the blue box capabilities contain the given service and action
     *
     * @since 1.130.0
     * @private
     */
    ApplicationContainer.prototype.supportsCapabilities = function (aRequiredCapabilities) {
        const oCapabilities = this.getCapabilities();

        return aRequiredCapabilities.every((sRequiredCapability) => {
            return oCapabilities[`${sRequiredCapability}`.toLowerCase()];
        });
    };

    /**
     * Checks if the iframe is valid and responsive.
     * @returns {boolean} Whether the iframe is valid.
     * @throws {Error} If the iframe is not valid.
     *
     * @since 1.141.0
     * @private
     */
    ApplicationContainer.prototype.isValid = function () {
        return true;
    };

    // helper for tests
    ApplicationContainer._setCachedUI5Version = function (sNewVersion) {
        ApplicationContainer.ui5version = sNewVersion;
        ApplicationContainer.ui5versionPromise = ApplicationContainer.ui5versionPromise.then(() => {
            ApplicationContainer.ui5version = sNewVersion;
        });
    };

    return ApplicationContainer;
});
