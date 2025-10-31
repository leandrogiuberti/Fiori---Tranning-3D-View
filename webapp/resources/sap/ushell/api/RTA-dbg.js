// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
/**
 * @fileOverview Utility functions for RTA.
 */
sap.ui.define([
    "sap/ushell/Config",
    "sap/ushell/Container",
    "sap/ushell/EventHub",
    "sap/ushell/state/ShellModel"
], (
    Config,
    Container,
    EventHub,
    ShellModel
) => {
    "use strict";

    /**
     * @alias sap.ushell.api.RTA
     * @namespace
     *
     * @since 1.120.0
     * @private
     * @ui5-restricted sap.ui.fl, sap.ui.rta
     */
    const RtaUtils = {};

    /**
     * RTA uses getLogo() to find the current logo URL.
     * If the logo is hidden, it will return undefined.
     *
     * @since 1.136.1
     * @returns {string|undefined} Logo URL
     * @private
     * @ui5-restricted sap.ui.rta
     */
    RtaUtils.getLogo = function () {
        return ShellModel.getModel().getProperty("/header/logo/src");
    };

    /**
     * Returns the dom ref of the logo.
     * The logo dom ref is used to determine the current size of the logo in order to
     * replicate the logo in the RTA header.
     * @returns {Node} The logo dom ref.
     *
     * @since 1.138.0
     * @private
     * @ui5-restricted sap.ui.fl, sap.ui.rta
     */
    RtaUtils.getLogoDomRef = function () {
        const sLogoPath = this.getLogo();
        const oRenderer = Container.getRendererInternal();
        const oShellHeaderDomRef = oRenderer.getRootControl().getShellHeader()?.getDomRef();

        if (!oShellHeaderDomRef) {
            return;
        }

        const aHeaderImages = oShellHeaderDomRef.querySelectorAll("img");
        // check if one of the images is the logo
        const oLogo = Array.from(aHeaderImages).find((oImage) => oImage.src.includes(sLogoPath));

        return oLogo;
    };

    /**
     * Sets the visibility of the shell header.
     * @param {boolean} visible Whether the shell header should be visible in all states.
     *
     * @since 1.120.0
     * @private
     * @ui5-restricted sap.ui.fl, sap.ui.rta
     */
    RtaUtils.setShellHeaderVisibility = function (visible) {
        const oRenderer = Container.getRendererInternal();
        oRenderer.setHeaderVisibility(visible, false);
    };

    /**
     * Adds a placeholder for the shell header within the iframe.
     *
     * @since 1.121.0
     * @private
     * @ui5-restricted sap.ui.fl, sap.ui.rta
     */
    RtaUtils.addTopHeaderPlaceHolder = function () {
        const oRenderer = Container.getRendererInternal();
        oRenderer.addTopHeaderPlaceHolder();
    };

    /**
     * Removes the placeholder for the shell header within the iframe.
     *
     * @since 1.121.0
     * @private
     * @ui5-restricted sap.ui.fl, sap.ui.rta
     */
    RtaUtils.removeTopHeaderPlaceHolder = function () {
        const oRenderer = Container.getRendererInternal();
        oRenderer.removeTopHeaderPlaceHolder();
    };

    /**
     * Sets the property enabled of the navigation bar.
     * @param {boolean} bEnable Whether the navigation bar should be enabled or not.
     * @since 1.126.0
     * @private
     * @ui5-restricted sap.ui.fl, sap.ui.rta
     */
    RtaUtils.setNavigationBarEnabled = function (bEnable) {
        EventHub.emit("enableMenuBarNavigation", bEnable);
    };
    return RtaUtils;
});
