// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

// This control replaces the Fiori2 ViewPortContainer for the no-viewports scenario.
sap.ui.define([
    "sap/base/Log",
    "sap/ui/core/Control",
    "sap/ui/core/Element",
    "sap/ui/core/RenderManager",
    "sap/ui/Device",
    "sap/ushell/Container",
    "sap/ushell/renderer/NavContainerRenderer",
    "sap/ushell/utils"
], (
    Log,
    Control,
    Element,
    RenderManager,
    Device,
    Container,
    NavContainerRenderer,
    ushellUtils
) => {
    "use strict";

    /**
     * @alias sap.ushell.renderer.NavContainer
     * @class
     * @classdesc Application container.
     *
     * @param {string} [sId] id for the new control, generated automatically if no id is given
     * @param {object} [mSettings] initial settings for the new control
     *
     * @extends sap.ui.core.Control
     * @since 1.135.0
     * @private
     */
    const NavContainer = Control.extend("sap.ushell.renderer.NavContainer", /** @lends sap.ushell.renderer.NavContainer.prototype */ {
        metadata: {
            library: "sap.ushell",
            properties: {
                visible: { type: "boolean", group: "Appearance", defaultValue: true },
                currentPageId: { type: "string", defaultValue: "", visibility: "hidden" }
            },
            aggregations: {
                pages: { type: "sap.ui.core.Control", multiple: true, singularName: "page" }
            },
            events: {
                beforeNavigate: {
                    parameters: {
                        fromId: { type: "string" },
                        from: { type: "sap.ui.core.Control" },
                        toId: { type: "string" },
                        to: { type: "sap.ui.core.Control" }
                    }
                },
                afterNavigate: {
                    parameters: {
                        fromId: { type: "string" },
                        from: { type: "sap.ui.core.Control" },
                        toId: { type: "string" },
                        to: { type: "sap.ui.core.Control" }
                    }
                }
            }
        },

        renderer: NavContainerRenderer
    });

    NavContainer.prototype.init = function () {
        Control.prototype.init.apply(this, arguments);
        this.setBusyIndicatorDelay(4000);
    };

    /**
     * Overrides the default implementation of the addAggregation method.
     * Adds a page to the NavContainer. The page is initially hidden.
     * Any re-rendering is suppressed.
     * @param {sap.ui.core.Control} oPage The page to add.
     * @returns {this} this to allow method chaining
     *
     * @since 1.135.0
     * @private
     */
    NavContainer.prototype.addPage = function (oPage) {
        if (this.getPages().indexOf(oPage) > -1) {
            return this; // the control is already added
        }

        // always hide the page initially
        this._setPageVisibility(oPage, false);
        this.addAggregation("pages", oPage, true);

        const oDomRef = this.getDomRef();
        if (oDomRef) {
            const oRendererManager = new RenderManager().getInterface();
            oRendererManager.render(oPage, oDomRef);
            oRendererManager.destroy();
        }

        return this;
    };

    /**
     * Removes a page from the NavContainer. The current page is set to an empty
     * string if the removed page is the current page.
     * @param {string} sId The ID of the page to remove
     * @returns {this} this to allow method chaining
     *
     * @since 1.135.0
     * @private
     */
    NavContainer.prototype.removePage = function (sId) {
        this.removeAggregation("pages", sId, true); // never re-render the AppContainer

        const sCurrentPageId = this.getProperty("currentPageId");
        if (sCurrentPageId === sId) {
            this.setProperty("currentPageId", "", true);
        }

        return this;
    };

    /**
     * Returns the page with the given ID.
     * @param {string} sPageId The ID of the page
     * @returns {sap.ui.core.Control} The page with the given ID
     *
     * @since 1.135.0
     * @private
     */
    NavContainer.prototype.getPageById = function (sPageId) {
        return this.getPages().reduce((oPage, oCurrentPage) => {
            if (oCurrentPage.getId() === sPageId) {
                return oCurrentPage;
            }
            return oPage;
        }, null);
    };

    /**
     * Sets the visibility of a page.
     * @param {sap.ui.core.Control} oPage The page
     * @param {boolean} bVisible Whether the page should be visible
     *
     * @since 1.135.0
     * @private
     */
    NavContainer.prototype._setPageVisibility = function (oPage, bVisible) {
        if (oPage.isA("sap.ushell.renderer.INavContainerPage")) {
            oPage.setVisibility(bVisible);
            return;
        }

        if (bVisible) {
            oPage.removeStyleClass("sapUShellNavContainerPageHidden");
        } else {
            oPage.addStyleClass("sapUShellNavContainerPageHidden");
        }
    };

    /**
     * Navigate to a given page.
     * @param {string} sPageId The ID of the page to navigate.
     *
     * @since 1.135.0
     * @private
     */
    NavContainer.prototype.navTo = function (sPageId) {
        const oTargetPage = this.getPageById(sPageId);
        const sCurrentPageId = this.getProperty("currentPageId");
        const oCurrentPage = this.getPageById(sCurrentPageId);

        if (!oTargetPage) {
            Log.error("NavContainer: invalid navigation target");
            return;
        }

        /**
         * TBD: _storeFocus and _restoreFocus should be moved to the dashboard container
         * @deprecated since 1.120. Only relevant for classic homepage.
         */
        this._storeFocus();

        this.fireBeforeNavigate({
            toId: sPageId,
            to: oTargetPage,
            fromId: sCurrentPageId,
            from: oCurrentPage
        });

        this.setBusy(false);
        this.getPages().forEach((oPage) => {
            this._setPageVisibility(oPage, oPage.getId() === sPageId);
        });

        this.setProperty("currentPageId", sPageId, true);

        /**
         * TBD: _storeFocus and _restoreFocus should be moved to the dashboard container
         * @deprecated since 1.120. Only relevant for classic homepage.
         */
        this._restoreFocus(oTargetPage.getId());

        this.fireAfterNavigate({
            toId: sPageId,
            to: oTargetPage,
            fromId: sCurrentPageId,
            from: oCurrentPage
        });
    };

    /**
     * Stores the last focused element.
     *
     * @private
     * @deprecated since 1.120. Only relevant for classic homepage.
     */
    NavContainer.prototype._storeFocus = async function () {
        const oClassicHomepageContainer = Container.getRendererInternal("fiori2").byId("Shell-home-component-container");
        const sClassicHomepageContainerId = oClassicHomepageContainer && oClassicHomepageContainer.getId();
        const sCurrentPageId = this.getProperty("currentPageId");
        const bNavFromClassicHomepage = sCurrentPageId && (sClassicHomepageContainerId === sCurrentPageId);
        const bShouldStoreFocus = Device.system.desktop && bNavFromClassicHomepage;

        if (!bShouldStoreFocus) {
            return;
        }

        const [AccessKeysHandler] = await ushellUtils.requireAsync(["sap/ushell/renderer/AccessKeysHandler"]);

        const oActiveControl = Element.closestTo(document.activeElement);
        this._sLastFocusId = oActiveControl ? oActiveControl.getId() : null;
        this._fnLastAppKeyHandler = AccessKeysHandler.getAppKeysHandler();
    };

    /**
     * Restores the last focused element.
     *
     * @private
     * @param {string} sPageId The ID of the page to restore focus for.
     * @deprecated since 1.120. Only relevant for classic homepage.
     */
    NavContainer.prototype._restoreFocus = async function (sPageId) {
        const oClassicHomepageContainer = Container.getRendererInternal("fiori2").byId("Shell-home-component-container");
        const sClassicHomepageContainerId = oClassicHomepageContainer && oClassicHomepageContainer.getId();
        const bNavToClassicHomepage = sClassicHomepageContainerId === sPageId;
        const bShouldRestoreFocus = Device.system.desktop && bNavToClassicHomepage;

        if (!bShouldRestoreFocus) {
            return;
        }

        const [AccessKeysHandler] = await ushellUtils.requireAsync(["sap/ushell/renderer/AccessKeysHandler"]);

        // Note: as in Fiori2, register key handler only if the last focused element exists. See ViewPortContainer
        if (this._sLastFocusId) {
            AccessKeysHandler.registerAppKeysHandler(this._fnLastAppKeyHandler);
            const oControl = Element.getElementById(this._sLastFocusId);
            if (oControl) {
                oControl.focus();
            }
        }
    };

    return NavContainer;
});
