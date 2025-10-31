// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/Control",
    "sap/ushell/library", // css style dependency
    "sap/ushell/resources",
    "./ShellFloatingAction"
], (
    Control,
    ushellLibrary,
    resources,
    ShellFloatingAction
) => {
    "use strict";

    const ShellFloatingActions = Control.extend("sap.ushell.ui.shell.ShellFloatingActions", {
        metadata: {
            library: "sap.ushell",
            properties: {
                isFooterVisible: { type: "boolean", defaultValue: false }
            },
            aggregations: {
                floatingActions: { type: "sap.ushell.ui.shell.ShellFloatingAction", multiple: true, singularName: "floatingAction" }
            }
        },

        renderer: {
            apiVersion: 2,

            /**
             * Renders the HTML for the ShellFloatingActions, using the provided {@link sap.ui.core.RenderManager}.
             *
             * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the render output buffer
             * @param {sap.ui.core.Control} shellFloatingActions ShellFloatingActions to be rendered
             */
            render: function (rm, shellFloatingActions) {
                const aFloatingActions = shellFloatingActions.getFloatingActions();

                rm.openStart("div", shellFloatingActions);
                rm.class("sapUshellShellFloatingActions");
                rm.openEnd();
                if (aFloatingActions.length) {
                    let oFloatingAction;

                    if (aFloatingActions.length === 1) {
                        oFloatingAction = aFloatingActions[0];
                    } else {
                        oFloatingAction = shellFloatingActions._createMultipleFloatingActionsButton(aFloatingActions);
                        aFloatingActions.forEach((oFA) => {
                            oFA.setVisible(false);
                            rm.renderControl(oFA);
                        });
                    }
                    rm.renderControl(oFloatingAction);
                }
                rm.close("div");
            }
        }
    });

    ShellFloatingActions.prototype._createMultipleFloatingActionsButton = function (aFloatingActions) {
        if (this._oButton) {
            this._oButton.destroy();
            this._oButton = null;
        }
        let iFloatingActionHeight;
        const that = this;
        this._oButton = new ShellFloatingAction({
            id: `${this.getId()}-multipleFloatingActions`,
            icon: "sap-icon://add",
            visible: true,
            press: function () {
                if (!this.hasStyleClass("sapUshellShellFloatingActionRotate")) {
                    this.addStyleClass("sapUshellShellFloatingActionRotate");
                    if (!iFloatingActionHeight) {
                        iFloatingActionHeight = parseInt(this.$().outerHeight(), 10) + parseInt(that.$().css("bottom"), 10);
                    }

                    aFloatingActions.forEach((oFloatingButton) => {
                        oFloatingButton.setVisible(true);
                    });

                    setTimeout(() => {
                        aFloatingActions.forEach((oFloatingButton, iIndex) => {
                            const itemY = iFloatingActionHeight * (iIndex + 1);
                            oFloatingButton.$().css("transform", `translateY(-${itemY}px)`);
                            oFloatingButton.data("transformY", `-${itemY}px`);
                        });
                    }, 0);
                } else {
                    this.removeStyleClass("sapUshellShellFloatingActionRotate");

                    aFloatingActions.forEach((oFloatingButton) => {
                        oFloatingButton.$().css("transform", "translateY(0)");
                    });

                    setTimeout(() => {
                        aFloatingActions.forEach((oFloatingButton) => {
                            oFloatingButton.setVisible(false);
                            oFloatingButton.data("transformY", undefined);
                        });
                    }, 150);
                }
            },
            tooltip: resources.i18n.getText("XXX")
        });

        return this._oButton;
    };

    return ShellFloatingActions;
});
