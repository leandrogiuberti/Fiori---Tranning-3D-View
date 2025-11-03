// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/m/ActionSheet",
    "sap/m/Bar",
    "sap/m/Button",
    "sap/m/library",
    "sap/ui/core/mvc/Controller",
    "sap/ushell/ui/footerbar/AddBookmarkButton",
    "sap/ushell/ui/footerbar/JamDiscussButton",
    "sap/ushell/ui/footerbar/JamShareButton"
], (
    ActionSheet,
    Bar,
    Button,
    mobileLibrary,
    Controller,
    AddBookmarkButton,
    JamDiscussButton,
    JamShareButton
) => {
    "use strict";

    // shortcut for sap.m.PlacementType
    const PlacementType = mobileLibrary.PlacementType;

    return Controller.extend("sap.ushell.demo.UserDefaults.view.List", {
        oApplication: null,
        /**
         * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
         * @memberof view.List
         */
        onInit: function () {
            const page = this.oView.getContent()[0];
            page.setShowFooter(true);
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

            page.setFooter(new Bar({
                contentRight: oActionsButton
            }));
        },

        getRouter: function () {
            return this.getOwnerComponent().getRouter();
        },

        /**
         * handles changing of the view
         * @param {sap.ui.base.Event} oEvent - the event object
         */
        onViewSelectionChange: function (oEvent) {
            const oItemParam = oEvent.getParameter("listItem");
            const oItem = (oItemParam) || oEvent.getSource();

            if (/editor/.test(oItem.getId())) {
                this.getRouter().navTo("toEditor");
                return;
            }
            if (/usedParams/.test(oItem.getId())) {
                this.getRouter().navTo("toUsedParams");
                return;
            }
            if (/showEvents/.test(oItem.getId())) {
                this.getRouter().navTo("toShowEvents");
                return;
            }
        }
    });
});
