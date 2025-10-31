// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/base/Log",
    "sap/ui/core/Element",
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/Config",
    "sap/ushell/resources",
    "sap/ushell/utils/WindowUtils",
    "sap/ushell/ui/shell/ShellHeadItem",
    "sap/ushell/Container",
    "sap/ushell/EventHub"
], (
    Log,
    Element,
    UIComponent,
    Device,
    JSONModel,
    Config,
    resources,
    WindowUtils,
    ShellHeadItem,
    Container,
    EventHub
) => {
    "use strict";

    function getProductSwitchButton () {
        return Element.getElementById("productSwitchBtn");
    }

    function getShellBarProductSwitchButton () {
        return Element.getElementById("shell-header").getProductSwitchDomRef();
    }

    function getProductSwitchPopover () {
        return Element.getElementById("sapUshellProductSwitchPopover");
    }

    return UIComponent.extend("sap.ushell.components.shell.ProductSwitch.Component", {

        metadata: {
            version: "1.141.1",
            library: "sap.ushell.components.shell.ProductSwitch",
            dependencies: {
                libs: {
                    "sap.m": {},
                    "sap.f": {
                        lazy: true
                    }
                }
            }
        },

        createContent: function () {
            this.oModel = this._getModel();
        },

        _getModel: function () {
            const that = this;
            const oModel = new JSONModel();
            oModel.loadData(Config.last("/core/productSwitch/url"))
                .then(() => {
                    const aProducts = oModel.getData();
                    if (aProducts.length === 0) {
                        Log.debug("There are no other profucts configured for your user. ProductSwitch button will be hidden.");
                    } else {
                        that._addProductSwitchButtonToHeader();
                    }
                })
                .catch((oError) => {
                    Log.debug("get ProductSwitch model failed: ", oError);
                });
            return oModel;
        },

        _openProductSwitch: function () {
            let oPopover = getProductSwitchPopover();
            let oLoadPopover = Promise.resolve();

            if (!oPopover) {
                oLoadPopover = new Promise((resolve, reject) => {
                    sap.ui.require(["sap/ui/core/Fragment"], (Fragment) => {
                        Fragment.load({
                            name: "sap.ushell.components.shell.ProductSwitch.ProductSwitch",
                            type: "XML",
                            controller: this
                        }).then(resolve).catch(reject);
                    }, reject);
                }).then((popover) => {
                    oPopover = popover;
                    oPopover.setModel(this.oModel);
                    oPopover.setModel(resources.i18nModel, "i18n");
                    if (Device.system.phone) {
                        oPopover.setShowHeader(true);
                    }
                });
            }

            oLoadPopover.then(() => {
                let oSource;
                if (Config.last("/core/shellBar/enabled")) {
                    oSource = getShellBarProductSwitchButton();
                } else {
                    oSource = getProductSwitchButton();
                    // if the button is hidden in the overflow, use the overflow button itself
                    if (!oSource || !oSource.$().width()) {
                        oSource = Element.getElementById("endItemsOverflowBtn");
                    }
                }
                oPopover.openBy(oSource);
            });

            return oLoadPopover;
        },

        onProductItemPress: function (oEvent) {
            const sTargetUrl = oEvent.getParameter("itemPressed").getTargetSrc();
            getProductSwitchPopover().close();
            WindowUtils.openURL(sTargetUrl, "_blank");
        },

        /**
         * Create and add the product switch button to the header
         */
        _addProductSwitchButtonToHeader: function () {
            const oProductSwitchButton = new ShellHeadItem({
                id: "productSwitchBtn",
                icon: "sap-icon://grid",
                visible: true,
                text: resources.i18n.getText("productSwitch"),
                ariaHaspopup: "dialog",
                press: function () {
                    EventHub.emit("showProducts", Date.now());
                }
            });
            Container.getRendererInternal("fiori2").showHeaderEndItem([oProductSwitchButton.getId()], false);
            EventHub.on("showProducts").do(this._openProductSwitch.bind(this));
        },

        exit: function () {
            const oPopover = getProductSwitchPopover();
            if (!oPopover) {
                oPopover.destroy();
            }
            const oHeaderButton = getProductSwitchButton();
            if (oHeaderButton) {
                oHeaderButton.destroy();
            }
        }
    });
});
