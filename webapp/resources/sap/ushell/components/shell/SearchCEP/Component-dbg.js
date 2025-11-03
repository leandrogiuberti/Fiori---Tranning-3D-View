// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/Log",
    "sap/m/SearchField",
    "sap/ui/Device",
    "sap/ui/core/Element",
    "sap/ui/core/EventBus",
    "sap/ui/core/IconPool",
    "sap/ui/core/UIComponent",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/Config",
    "sap/ushell/Container",
    "sap/ushell/components/shell/SearchCEP/SearchCEP.controller",
    "sap/ushell/resources",
    "sap/ushell/utils/UrlParsing"
], (
    Log,
    SearchField,
    Device,
    Element,
    EventBus,
    IconPool,
    UIComponent,
    jQuery,
    Config,
    Container,
    SearchCEPController,
    resources,
    UrlParsing
) => {
    "use strict";

    return UIComponent.extend("sap.ushell.components.shell.SearchCEP.Component", {
        metadata: {
            version: "1.141.0",
            library: ["sap.ushell", "sap.ushell.components.shell"],
            dependencies: {
                libs: ["sap.m"]
            }
        },

        createContent: function () {
            try {
                this.oRenderer = Container.getRendererInternal("fiori2");
                this.oShellHeader = Element.getElementById("shell-header");

                // needed to listen for the searchButtonPress event only for the ShellBar
                // in case the ShellHeader is used it will cause the CEP Search not to be rendered
                // because no such event exist in the ShellHeader control
                if (Config.last("/core/shellBar/enabled")) {
                    this.oShellHeader.attachSearchButtonPress(this.onShellSearchButtonPressed.bind(this));
                }

                // create search Icon
                this.oRenderer.addHeaderEndItem({
                    id: "sf",
                    tooltip: "{i18n>openSearchBtn}",
                    text: "{i18n>search}",
                    ariaLabel: "{i18n>openSearchBtn}",
                    icon: IconPool.getIconURI("search"),
                    visible: true,
                    press: this.onShellSearchButtonPressed.bind(this)
                }, true, false);
                this.oShellSearchBtn = Element.getElementById("sf");
                this.oShellSearchBtn.data("help-id", "shellHeader-search", true);
                this.oShellSearchBtn.addEventDelegate({
                    onkeydown: this._keyDownSearchBtn.bind(this)
                });
                // create search field on shell header
                const oSearchConfig = {
                    width: "90%",
                    placeholder: resources.i18n.getText("search"),
                    tooltip: resources.i18n.getText("search"),
                    enableSuggestions: true,
                    suggest: this.onSuggest.bind(this),
                    search: this.onSearch.bind(this)
                };
                this.oSF = new SearchField("PlaceHolderSearchField", oSearchConfig);
                this.oSF.addStyleClass("sapUshellCEPSearchCenter");

                const sScreenSize = this.getScreenSize();
                if (sScreenSize === "S") {
                    this.initSearchSSize();
                } else if (sScreenSize === "M" || sScreenSize === "L") {
                    this.initSearchMLSizes();
                } else if (sScreenSize === "XL") {
                    this.initSearchXLSize();
                }

                this.oShellHeader.setSearch(this.oSF);
                this.oSearchCEPController = new SearchCEPController();

                this.oSF.addEventDelegate({
                    onfocusin: this._onfocusin.bind(this),
                    onAfterRendering: this._onAfterRendering.bind(this)
                });
                this.oSearchCEPController.getHomePageApps();
            } catch (oError) {
                Log.info("Failed to create CEP search field content", oError);
            }
            EventBus.getInstance().publish("shell", "searchCompLoaded", { delay: 0 });
        },

        initSearchSSize: function () {
            this.oSF.setWidth("60%");
            this.oShellHeader.setSearchState("COL", 35, false);
        },

        initSearchMLSizes: function () {
            this.oShellHeader.setSearchState("COL", 35, false);
        },

        initSearchXLSize: function () {
            this.oShellSearchBtn.setVisible(false);
            this.oShellHeader.setSearchState("EXP", 35, false);
        },

        _onAfterRendering: function (event) {
            // align search field vertically
            const oShellHeaderSearch = jQuery(this.oShellHeader.getDomRef()).find("#shell-header-hdr-search");
            oShellHeaderSearch.addClass("CEPShellHeaderPadding");

            // add tooltip to Search Placeholder icon
            jQuery(this.oSF.getDomRef()).find("#PlaceHolderSearchField-search").attr("title", resources.i18n.getText("search"));

            const sUrl = Container.getFLPUrl(true);
            const sHash = UrlParsing.getHash(sUrl);
            const sIntent = sHash.split("&/")[0];

            if (this.oSF.getValue()) {
                // prevent opening popover after navigation to Results page
                if (sIntent === "Action-search" || sIntent === "WorkZoneSearchResult-display") {
                    jQuery(this.oSF.getDomRef()).blur();
                }
            }
        },

        _onfocusin: function (event) {
            if (this.oSF.getEnableSuggestions() && Device.system.phone) {
                // eslint-disable-next-line no-undef
                jQuery(this.oSF.getDomRef()).find("input").attr("inputmode", "search");
            }
        },

        onSuggest: function (event) {
            if (this.oSF.getEnableSuggestions() && Device.system.phone) {
                // eslint-disable-next-line no-undef
                jQuery(this.oSF.getDomRef()).find("input").attr("inputmode", "search");
            }
            if (Element.getElementById("CEPSearchField")) {
                this.oSearchCEPController.onSuggest(event);
            } else {
                this.oSearchCEPController.onInit();
            }
        },

        onSearch: function (event) {
            if (Element.getElementById("CEPSearchField")) {
                this.oSearchCEPController.onSearch(event);
            }
        },

        exit: function () {
            this.oSearchCEPController.onExit();
        },

        expandSearch: function () {
            this.oShellHeader.setSearchState("EXP_S", 35, false);
            this.oSF.focus();
        },

        onShellSearchButtonPressed: function () {
            this.oShellSearchBtn.setVisible(false);
            this.expandSearch();
        },

        collapseSearch: function () {
            this.oShellHeader.setSearchState("COL", 35, false);
            this.oShellSearchBtn.setVisible(true);
        },

        getScreenSize: function () {
            const oScreenSize = Device.media.getCurrentRange(Device.media.RANGESETS.SAP_STANDARD_EXTENDED);
            if (oScreenSize.from >= 1440) {
                return "XL";
            } else if (oScreenSize.from >= 1024) {
                return "L";
            } else if (oScreenSize.from >= 600) {
                return "M";
            } else if (oScreenSize.from >= 0) {
                return "S";
            }
        },

        _keyDownSearchBtn: function (event) {
            if (event.code === 13 || event.code === "Enter") {
                setTimeout(() => {
                    this.oSF.focus();
                }, 500);
            }
        }
    });
});
