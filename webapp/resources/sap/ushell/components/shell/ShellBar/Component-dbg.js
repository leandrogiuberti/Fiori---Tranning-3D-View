// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/Element",
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/Container",
    "sap/ushell/EventHub",
    "sap/ushell/renderer/ShellLayout",
    "sap/ushell/utils"
], (
    Element,
    UIComponent,
    Device,
    JSONModel,
    Container,
    EventHub,
    ShellLayout,
    ushellUtils
) => {
    "use strict";

    const sSearchOverlayCSS = "sapUshellShellShowSearchOverlay";

    let _iSearchWidth = 0;

    const SearchState = {
        COL: "COL",
        EXP: "EXP",
        EXP_S: "EXP_S"
    };

    return UIComponent.extend("sap.ushell.components.shell.ShellBar.Component", {
        metadata: {
            manifest: "json",
            interfaces: ["sap.ui.core.IAsyncContentCreation"],
            properties: {
                searchState: { type: "string", defaultValue: "COL" }
            },
            events: {
                searchSizeChanged: {},
                searchButtonPress: {}
            },
            associations: {
                appTitle: { type: "sap.ui.core.Control" }
            }
        },

        init: function () {
            // Call the init function of the parent
            UIComponent.prototype.init.apply(this, arguments);
            const oModel = new JSONModel({
                logo: {},
                searchField: {
                    show: false
                }
            });

            this.setModel(oModel);
            this.FLPRangeSet = {
                name: "Ushell",
                rangeBorders: [600, 1024, 1440, 1920],
                rangeNames: ["Phone", "Tablet", "Desktop", "LargeDesktop", "ExtraLargeDesktop"]
            };
            Device.media.initRangeSet(
                this.FLPRangeSet.name,
                this.FLPRangeSet.rangeBorders,
                "px",
                this.FLPRangeSet.rangeNames
            );

            // handle initial state of the side content
            const bInitialValue = ShellLayout.hasAdjacentSideContentBeforeMain();
            ushellUtils.applySideContent.call(this, bInitialValue);

            // attach event handler for side content changes
            ShellLayout.attachAdjacentSideContentBeforeMainChanged(ushellUtils.handleSideContent.bind(this), this);
        },

        /**
         * Sets the search control in the shell bar. Used by both the Enterprise Search and the CEP Search.
         * @param {object} oSearchField The search field to be set in the shell bar's search Field slot.
         * @private
         */
        setSearch: function (oSearchField) {
            this.rootControlLoaded().then((oView) => {
                // removes the dummy input in the searchField slot for ESearch case when the search is being init by the SearchShellHelper
                const oShellBar = oView.byId("shellBar");
                oShellBar.destroySearchField();
                oShellBar.addSearchField(oSearchField);
            });
        },

        /**
         * Sets the search state of the shell bar.
         * @param {string} sStateName The name of the search state to set.
         * Valid values are "COL" (collapsed), "EXP" (expanded), and "EXP_S" (expanded with search field).
         * @param {int} iMaxRemSize The maximum size in rem for the search field when expanded.
         * @param {boolean} bWithOverlay If true, the search overlay will be shown when the search state is set to expanded.
         * @private
         */
        setSearchState: function (sStateName, iMaxRemSize, bWithOverlay) {
            if (SearchState[sStateName] && this.getSearchState() !== sStateName) {
                if (typeof iMaxRemSize === "boolean") {
                    bWithOverlay = iMaxRemSize;
                    iMaxRemSize = undefined;
                }

                this.setProperty("searchState", sStateName, false);

                const bShow = (sStateName !== "COL");
                this.getModel().setProperty("/searchField/show", bShow);
                document.body.classList.toggle(sSearchOverlayCSS, bShow && bWithOverlay);

                // save for animation after rendering
                _iSearchWidth = bShow ? iMaxRemSize || 35 : 0;
            }
        },

        /**
         * Sets the focus on the Logo for AccessKeyHandling
         */
        setFocusToLogo: function () {
            this.rootControlLoaded().then((oView) => {
                oView.byId("shellBar").getBranding()[0]?.focus();
            });
        },

        /**
         * Sets the focus on the App Finder Button for AccessKeyHandling
         */
        setFocusToAppFinderButton: function () {
            this.rootControlLoaded().then((oView) => {
                const oConfig = Container.getRendererInternal("fiori2").getShellConfig();
                if (oConfig.moveAppFinderActionToShellHeader) {
                    Element.getElementById("openCatalogBtn")?.focus();
                } else {
                    EventHub.emit("showUserActionsMenu", Date.now());
                    window.setTimeout(() => {
                        const aMenuItems = Element.getElementById("sapUshellUserActionsMenuPopover").getMenuItems();
                        aMenuItems.forEach((item) => {
                            if (item.getId().includes("openCatalogBtn")) {
                                item.focus();
                            }
                        });
                    }, 300);
                }
            });
        },

        isPhoneState: function () {
            const deviceType = Device.media.getCurrentRange(Device.media.RANGESETS.SAP_STANDARD).name;
            const bEnoughSpaceForSearch = this.getDomRef().getBoundingClientRect().width > this.getSearchWidth();
            return (Device.system.phone || deviceType === "Phone" || !bEnoughSpaceForSearch);
        },

        getSearchWidth: function () {
            return _iSearchWidth;
        },

        isLargeState: function () {
            return Device.media.getCurrentRange(this.FLPRangeSet.name).from === this.FLPRangeSet.rangeBorders[2];
        },

        isExtraLargeState: function () {
            return Device.media.getCurrentRange(this.FLPRangeSet.name).from === this.FLPRangeSet.rangeBorders[3];
        },

        getNotificationsBtnDomRef: function () {
            return this.getRootControl().byId("shellBar").getNotificationsDomRef();
        },

        getProductSwitchDomRef: function () {
            return this.getRootControl().byId("shellBar").getProductSwitchDomRef();
        },

        enhanceComponentContainerAPI: function (oComponentContainer) {
            oComponentContainer.setSearch = this.setSearch.bind(this);
            oComponentContainer.setSearchState = this.setSearchState.bind(this);
            oComponentContainer.getSearchState = this.getSearchState.bind(this);
            oComponentContainer.isPhoneState = this.isPhoneState.bind(this);
            oComponentContainer.getSearchWidth = this.getSearchWidth.bind(this);
            oComponentContainer.attachSearchSizeChanged = this.attachSearchSizeChanged.bind(this);
            oComponentContainer.attachSearchButtonPress = this.attachSearchButtonPress.bind(this);
            oComponentContainer.setAppTitle = this.setAppTitle.bind(this);
            oComponentContainer.getAppTitle = this.getAppTitle.bind(this);
            oComponentContainer.isLargeState = this.isLargeState.bind(this);
            oComponentContainer.isExtraLargeState = this.isExtraLargeState.bind(this);
            oComponentContainer.getNotificationsBtnDomRef = this.getNotificationsBtnDomRef.bind(this);
            oComponentContainer.getProductSwitchDomRef = this.getProductSwitchDomRef.bind(this);
            oComponentContainer.setFocusToLogo = this.setFocusToLogo.bind(this);
            oComponentContainer.setFocusToAppFinderButton = this.setFocusToAppFinderButton.bind(this);
        },

        exit: function () {
            ShellLayout.detachAdjacentSideContentBeforeMainChanged(ushellUtils.handleSideContent.bind(this), this);
        }
    });
});
