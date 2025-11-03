// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/Log",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/appRuntime/ui5/AppCommunicationMgr",
    "sap/ushell/Config",
    "sap/ushell/Container"
], (
    Log,
    Controller,
    JSONModel,
    AppCommunicationMgr,
    Config,
    Container
) => {
    "use strict";

    return Controller.extend("sap.ushell.demo.AppNavSample.view.Detail", {
        oApplication: null,

        onCreateEndBtn: function () {
            Container.getRendererInternal().addHeaderEndItem(
                "sap.ushell.ui.shell.ShellHeadItem",
                {
                    id: "idButtonSub",
                    icon: "sap-icon://flight",
                    tooltip: "subtrut 2 numbers",
                    click: function () {
                        // alert("header button was clicked. This alert is executed inside the iframe");
                        const oView = this.getView();
                        oView.byId("idResult").setValue(Number(oView.byId("idNumber1").getValue()) - Number(oView.byId("idNumber2").getValue()));
                    }.bind(this)
                }, true, true);
        },
        onInit: function () {
            this.oModel = new JSONModel();
            this.contextualDisplayCoord = this.displayCoordinats.bind(this);
            // set the current user in the model (testing UserInfo service)
            Promise.all([
                Container.getServiceAsync("CrossApplicationNavigation"),
                Container.getServiceAsync("UserInfo")
            ]).then((aResults) => {
                const oCANService = aResults[0];
                const oUserInfoService = aResults[1];
                const bIsInitialNavigation = oCANService.isInitialNavigation();

                // create the setup
                AppCommunicationMgr.sendMessageToOuterShell("sap.ushell.registry.addHeaderBtn", {}).done((oRetObj) => {
                    Log.debug(oRetObj);
                    this.addHeaderBtn = oRetObj.addHeaderEndBtn;
                });

                this.oModel.setData({
                    coordinates: 12,
                    userId: oUserInfoService.getId(),
                    isInitialNavigation: bIsInitialNavigation ? "yes" : "no",
                    isInitialNavigationColor: bIsInitialNavigation ? "green" : "red"
                });
                this.getView().setModel(this.oModel, "detailView");
                this.getView().getModel("detailView").setProperty("/coordinates", 99);
            });

            this.getOwnerComponent().getService("Configuration").then((oService) => {
                this.oEventRegistry = oService.attachSizeBehaviorUpdate(this._sizeBehaviorUpdate.bind(this));
            });
        },

        _sizeBehaviorUpdate: function (sSizeBehavior) {
            this.oModel.setProperty("/sizeBehavior", sSizeBehavior);
        },

        detachSizeBehavior: function () {
            this.oEventRegistry.detach();
        },
        attachSizeBehavior: function () {
            this.getOwnerComponent().getService("Configuration").then((oService) => {
                this.oEventRegistry = oService.attachSizeBehaviorUpdate(this._sizeBehaviorUpdate.bind(this));
            });
        },

        toggleSizeBehavior: function () {
            const oModel = this.getView().getModel("detailView");
            const sSizeBehavior = oModel.getProperty("/sizeBehavior");
            const sNewSizeBehavior = (sSizeBehavior === "Responsive" ? "Small" : "Responsive");
            Config.emit("/core/home/sizeBehavior", sNewSizeBehavior);
        },

        generateLinks: function () {
            this.getOwnerComponent().getRootControl().getController().generateLinks();
            this.byId("xapplist").setVisible(true);
        },
        onFlipPropertyClicked: function (oEvent) {
            const sConfig = oEvent.getSource().data().config;
            const bCurrent = Config.last(sConfig);
            Config.emit(sConfig, !bCurrent);
        },
        displayCoordinats: function (oEvent) {
            this.getView().getModel("detailView").setProperty("/coordinates", {
                screenX: oEvent.screenX,
                screenY: oEvent.screenY
            });
        },
        onAddEventListener: function (oEvent) {
            document.addEventListener("mousemove", this.contextualDisplayCoord);
        },
        onRemoveEventLister: function (oEvent) {
            document.removeEventListener("mousemove", this.contextualDisplayCoord);
        },

        onAddClickLister: function (oEvent) {
            document.addEventListener("click", this.contextualDisplayCoord);
        },

        onRemoveClickLister: function (oEvent) {
            document.removeEventListener("keypress", this.contextualDisplayCoord);
        },

        onCallTunnelFunction: function (oEvent) {
            this.addHeaderBtn("sap.ushell.ui.shell.ShellHeadItem", {
                id: "idButtonSub",
                icon: "sap-icon://flight",
                tooltip: "subtrut 2 numbers",
                press: function (oParam) {
                    Log.debug(oParam);
                    alert("Button pressed!");
                    // var oView = that.getView();
                    // oView.byId("idResult").setValue(Number(oView.byId("idNumber1").getValue()) - Number(oView.byId("idNumber2").getValue()));
                }
            }, true, true);
        }
    });
});
