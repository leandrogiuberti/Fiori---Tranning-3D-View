// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/m/ActionSheet",
    "sap/m/Bar",
    "sap/m/Button",
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ushell/ui/footerbar/AddBookmarkButton",
    "sap/ushell/ui/footerbar/JamDiscussButton",
    "sap/ushell/ui/footerbar/JamShareButton",
    "sap/m/library"
], (ActionSheet, Bar, Button, Controller, UIComponent, AddBookmarkButton, JamDiscussButton, JamShareButton, mLibrary) => {
    "use strict";

    // shortcut for sap.m.PlacementType
    const PlacementType = mLibrary.PlacementType;

    return Controller.extend("sap.ushell.demo.AppNavSample2.view.List", {
        oApplication: null,
        /**
         * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
         * @memberof view.List
         */
        onInit: function () {
            const oPage = this.oView.getContent()[0];

            oPage.setShowFooter(true);
            const oActionSheet = new ActionSheet({ placement: PlacementType.Top });
            oActionSheet.addButton(new JamDiscussButton());
            oActionSheet.addButton(new JamShareButton());
            oActionSheet.addButton(new AddBookmarkButton());
            const oActionsButton = new Button({
                press: function () {
                    oActionSheet.openBy(this);
                },
                icon: "sap-icon://action"
            });

            oPage.setFooter(new Bar({
                contentRight: oActionsButton
            }));
        },

        getRouter: function () {
            return UIComponent.getRouterFor(this);
        },

        handleDefaultDetailPress: function () {
            this.getRouter().navTo("toDetail");
        },

        handleBtn1Press: function () {
            this.getRouter().navTo("toView1");
        },

        handleBtn2Press: function () {
            this.getRouter().navTo("toView2");
        }
    });
});
