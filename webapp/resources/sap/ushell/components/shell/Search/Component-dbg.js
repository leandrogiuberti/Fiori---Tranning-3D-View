// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/m/Input",
    "sap/ui/core/Element",
    "sap/ui/core/EventBus",
    "sap/ushell/components/shell/Search/ESearch",
    "sap/ui/core/UIComponent",
    "sap/ui/core/Component",
    "sap/ushell/Config",
    "sap/ushell/utils",
    "sap/base/util/ObjectPath",
    "sap/ushell/Container"
], (Input, Element, EventBus, ESearch, UIComponent, Component, Config, Utils, ObjectPath, Container) => {
    "use strict";

    return UIComponent.extend("sap.ushell.components.shell.Search.Component", {
        metadata: {
            manifest: "json",
            library: "sap.ushell"
        },

        createContent: function () {
            const that = this;
            const bIsSearchCEPEnabled = ObjectPath.get("sap-ushell-config.services.SearchCEP") !== undefined;
            // check that search is enabled
            const oShellCtrl = Container.getRendererInternal("fiori2").getShellController();
            const oShellView = oShellCtrl.getView();
            const oShellConfig = (oShellView.getViewData() ? oShellView.getViewData().config : {}) || {};
            const bSearchEnable = (oShellConfig.enableSearch !== false);
            if (!bSearchEnable) {
                EventBus.getInstance().publish("shell", "searchCompLoaded", { delay: 0 });
                return;
            }

            Container.getFLPPlatform().then((sPlatform) => {
                if (sPlatform === "MYHOME" || (sPlatform === "cFLP" && bIsSearchCEPEnabled === true)) {
                    if (Config.last("/core/shellBar/enabled") && Config.last("/core/searchCEPNew/enabled")) {
                        Component.create({
                            id: "searchCEPNew",
                            name: "sap.ushell.components.shell.SearchCEPNew"
                        });
                    } else {
                        Component.create({
                            manifest: false,
                            name: "sap.ushell.components.shell.SearchCEP"
                        });
                    }
                } else {
                    ESearch.createContent(that);
                    EventBus.getInstance().publish("shell", "searchCompLoaded", { delay: 0 });
                }
                Utils.setPerformanceMark("FLP -- search component is loaded");
            });
        },

        exit: function () {
            ESearch.exit();
        }
    });
});
