// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ushell/Container"
], (Controller, Container) => {
    "use strict";

    return Controller.extend("sap.ushell.demo.AppRuntimeRendererSample.App", {

        oShellHeadItem: undefined,
        oRenderer: Container.getRendererInternal("fiori2"),

        onCreateBtn: function () {
            const that = this;
            this.oRenderer.addHeaderItem(
                "sap.ushell.ui.shell.ShellHeadItem",
                {
                    id: "idButtonAdd",
                    icon: "sap-icon://flight",
                    tooltip: "add 2 numbers",
                    click: function () {
                        const oView = that.getView();
                        oView.byId("idResult").setValue(Number(oView.byId("idNumber1").getValue()) + Number(oView.byId("idNumber2").getValue()));
                    }
                },
                true,
                true,
                ["app"]);
        },

        onCreateEndBtn: function () {
            const that = this;
            this.oRenderer.addHeaderEndItem(
                "sap.ushell.ui.shell.ShellHeadItem",
                {
                    id: "idButtonSub",
                    icon: "sap-icon://flight",
                    tooltip: "subtrut 2 numbers",
                    click: function () {
                        const oView = that.getView();
                        oView.byId("idResult").setValue(Number(oView.byId("idNumber1").getValue()) - Number(oView.byId("idNumber2").getValue()));
                    }
                },
                true,
                true,
                ["app"]);
        },

        onRemoveBtn: function () {
            this.oRenderer.hideHeaderItem(
                ["idButtonAdd"],
                false
            );
        },

        onRemoveEndBtn: function () {
            this.oRenderer.hideHeaderEndItem(
                ["idButtonSub"],
                true
            );
        },

        onShowBtn: function () {
            this.oRenderer.showHeaderItem(
                ["idButtonAdd"],
                true
            );
        },

        onShowEndBtn: function () {
            this.oRenderer.showHeaderEndItem(
                ["idButtonSub"],
                true
            );
        },

        onSetHeaderTitle: function () {
            this.oRenderer.setHeaderTitle(
                this.getView().byId("idTitle").getValue()
            );
        },

        onHideHeader: function () {
            this.oRenderer.setHeaderVisibility(
                false,
                true
            );
        },

        onShowHeader: function () {
            this.oRenderer.setHeaderVisibility(
                true,
                true
            );
        },

        onCreateShellItem: function () {
            const that = this;
            if (!this.oShellHeadItem) {
                sap.ui.require(["sap/ushell/ui/shell/ShellHeadItem"], (ShellHeadItem) => {
                    this.oShellHeadItem = new ShellHeadItem({
                        id: "idAlon",
                        icon: "sap-icon://account",
                        tooltip: "this is ShellHeadItem",
                        press: function () {
                            const oView = that.getView();
                            oView.byId("idResult").setValue(Number(oView.byId("idNumber1").getValue()) * Number(oView.byId("idNumber2").getValue()));
                        }
                    });
                });
            }
        },

        onShowShellItem: function () {
            if (this.oShellHeadItem) {
                this.oRenderer.showHeaderItem(
                    this.oShellHeadItem.id,
                    true
                );
            }
        },

        onHideShellItem: function () {
            if (this.oShellHeadItem) {
                this.oRenderer.hideHeaderItem(
                    this.oShellHeadItem.id,
                    true
                );
            }
        },

        onShowShellItemEnd: function () {
            if (this.oShellHeadItem) {
                this.oRenderer.showHeaderEndItem(
                    this.oShellHeadItem.id,
                    true
                );
            }
        },

        onAddUserAction: function () {
            const that = this;

            this.oRenderer.addUserAction({
                controlType: "sap.m.Button",
                oControlProperties: {
                    id: "idUserAction",
                    text: "User Action Button",
                    icon: "sap-icon://refresh",
                    press: function () {
                        const oView = that.getView();
                        oView.byId("idResult").setValue(Number(oView.byId("idNumber1").getValue()) / Number(oView.byId("idNumber2").getValue()));
                    }
                },
                bIsVisible: true,
                bCurrentState: true
            });
        },

        onHideActionButton: function () {
            this.oRenderer.hideActionButton(
                "idUserAction",
                true
            );
        },

        onShowActionButton: function () {
            this.oRenderer.showActionButton(
                "idUserAction",
                true
            );
        }
    });
});
