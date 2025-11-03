// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/Element",
    "sap/ui/core/Lib",
    "sap/ushell/resources",
    "sap/ui/core/IconPool",
    "sap/ui/core/routing/HashChanger",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/renderer/search/util",
    "sap/ushell/Container",
    "sap/ushell/Config"
], (Element,
    Library,
    resources,
    IconPool,
    HashChanger,
    jQuery,
    util,
    Container,
    Config) => {
    "use strict";

    let bDoExit = false;

    function loadSearchShellHelper (oComponent) {
        if (!oComponent._searchShellHelperPromise) {
            oComponent._searchShellHelperPromise = new Promise((resolve) => {
                Library.load("sap.esh.search.ui").then(() => {
                    sap.ui.require([
                        "sap/esh/search/ui/SearchShellHelperAndModuleLoader",
                        "sap/esh/search/ui/SearchShellHelper"
                    ], (SearchShellHelperAndModuleLoader, searchShellHelper) => {
                        searchShellHelper.init();
                        resolve(searchShellHelper);
                    });
                });
            });
        }
        return oComponent._searchShellHelperPromise;
    }

    function createContent (oComponent) {
        bDoExit = true;

        // loads the searchShellHelper when the search button in the new ShellBar web-component is clicked
        if (Config.last("/core/shellBar/enabled")) {
            Element.getElementById("shell-header").attachSearchButtonPress((event) => {
                loadSearchShellHelper(oComponent).then((searchShellHelper) => {
                    searchShellHelper.onShellSearchButtonPressed(event);
                });
            });
        }

        // create search Icon
        const oSearchConfig = {
            id: "sf",
            tooltip: "{i18n>openSearchBtn}",
            text: "{i18n>searchBtn}",
            ariaLabel: "{i18n>openSearchBtn}",
            icon: IconPool.getIconURI("search"),
            visible: true,
            press: function (event) {
                loadSearchShellHelper(oComponent).then((searchShellHelper) => {
                    searchShellHelper.onShellSearchButtonPressed(event);
                });
            }
        };
        const oShellSearchBtn = Container.getRendererInternal("fiori2")
            .addHeaderEndItem("sap.ushell.ui.shell.ShellHeadItem", oSearchConfig, true, false);
        oShellSearchBtn.data("help-id", "shellHeader-search", true);
        if (util.isSearchFieldExpandedByDefault()) {
            oShellSearchBtn.setVisible(false);
        }
        oShellSearchBtn.setModel(resources.i18nModel, "i18n");

        // auto expand search field
        if (util.isSearchFieldExpandedByDefault()) {
            loadSearchShellHelper(oComponent).then((searchShellHelper) => {
                if (searchShellHelper.expandSearch) {
                    // auto expand
                    searchShellHelper.expandSearch();
                } else {
                    // outdated elisa version -> just make button visible for manual expansion
                    oShellSearchBtn.setVisible(true);
                }
            });
        }

        // register hash change handler for tracking navigation
        oComponent.oHashChanger = HashChanger.getInstance();
        oComponent.oHashChanger.attachEvent("shellHashChanged", (sShellHash) => {
            const hashChangeInfo = sShellHash.mParameters;
            setTimeout(() => {
                Library.load("sap.esh.search.ui").then(() => {
                    sap.ui.require([
                        "sap/esh/search/ui/HashChangeHandler"
                    ], (HashChangeHandler) => {
                        HashChangeHandler.handle(hashChangeInfo);
                    });
                });
            }, 6000);
        });

        // accessibility
        oShellSearchBtn.addEventDelegate({
            onAfterRendering: function () {
                jQuery("#sf").attr("aria-pressed", false);
            }
        });
    }

    function exit () {
        if (bDoExit) {
            Container.getRendererInternal("fiori2").hideHeaderEndItem("sf");
            const oSearchButton = Element.getElementById("sf");
            if (oSearchButton) {
                oSearchButton.destroy();
            }
        }
    }

    return {
        createContent: createContent,
        exit: exit
    };
});
