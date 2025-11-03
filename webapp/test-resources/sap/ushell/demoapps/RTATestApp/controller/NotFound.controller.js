// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/demo/RTATestApp/controller/BaseController"
], (
    BaseController
) => {
    "use strict";

    return BaseController.extend("sap.ushell.demo.RTATestApp.controller.NotFound", {
        /**
         * Navigates to the worklist when the link is pressed
         * @public
         */
        onLinkPressed: function () {
            this.getRouter().navTo("worklist");
        }
    });
});
