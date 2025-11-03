// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/View",
    "sap/ui/core/mvc/ViewType"
], (
    View, ViewType
) => {
    "use strict";

    return View.extend("shells.demo.apps.jsViewApp.AppLaunch", {
        /**
         * Note: There is no controller for this view!
         *  @returns {sap.ui.core.mvc.View} The view instance
         */
        createContent: function () {
            return View.create({
                id: "letterBoxing",
                type: ViewType.XML,
                viewName: "shells.demo.apps.jsViewApp.App"
            });
        }
    });
});
