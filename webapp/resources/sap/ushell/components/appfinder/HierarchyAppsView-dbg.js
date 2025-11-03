// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/library",
    "sap/ui/core/mvc/View",
    "sap/ushell/ui/appfinder/AppBoxInternal",
    "sap/ushell/ui/appfinder/PinButton",
    "sap/ushell/resources",
    "sap/ushell/ui/launchpad/AccessibilityCustomData",
    "sap/m/FlexBox",
    "sap/m/library",
    "sap/m/Page",
    "sap/m/PageAccessibleLandmarkInfo",
    "sap/m/IllustratedMessage",
    "sap/ui/model/json/JSONModel",
    "sap/m/Link",
    "sap/m/Breadcrumbs",
    "sap/m/Text",
    "sap/m/Title",
    "sap/m/Button",
    "sap/ushell/components/appfinder/VisualizationOrganizerHelper"
], (
    coreLibrary,
    View,
    AppBoxInternal,
    PinButton,
    resources,
    AccessibilityCustomData,
    FlexBox,
    mobileLibrary,
    Page,
    PageAccessibleLandmarkInfo,
    IllustratedMessage,
    JSONModel,
    Link,
    Breadcrumbs,
    Text,
    Title,
    Button,
    VisualizationOrganizerHelper
) => {
    "use strict";

    // shortcut for sap.m.ButtonType
    const ButtonType = mobileLibrary.ButtonType;

    // shortcut for sap.m.FlexWrap
    const FlexWrap = mobileLibrary.FlexWrap;

    const TitleLevel = coreLibrary.TitleLevel;
    const AccessibleLandmarkRole = coreLibrary.AccessibleLandmarkRole;

    return View.extend("sap.ushell.components.appfinder.HierarchyAppsView", {
        oVisualizationOrganizerHelper: VisualizationOrganizerHelper.getInstance(),

        createContent: function (oController) {
            this.oController = oController;

            const oPinButton = new PinButton({
                icon: { path: "easyAccess>bookmarkCount", formatter: this.oVisualizationOrganizerHelper.formatBookmarkPinButtonIcon },
                type: { path: "easyAccess>bookmarkCount", formatter: this.oVisualizationOrganizerHelper.formatBookmarkPinButtonType },
                selected: {
                    path: "easyAccess>bookmarkCount",
                    formatter: this.oVisualizationOrganizerHelper.formatBookmarkPinButtonSelectState.bind(this)
                },
                tooltip: {
                    parts: ["associatedGroups", "easyAccess>bookmarkCount", "/groupContext/path", "/groupContext/id", "/groupContext/title"],
                    formatter: this.oVisualizationOrganizerHelper.formatBookmarkPinButtonTooltip.bind(this)
                },
                press: oController.showSaveAppPopover.bind(oController)
            });
            oPinButton.addCustomData(new AccessibilityCustomData({
                key: "tabindex",
                value: "-1",
                writeToDom: true
            }));
            oPinButton.addStyleClass("sapUshellPinButton");

            this.oItemTemplate = new AppBoxInternal({
                title: "{easyAccess>text}",
                subtitle: "{easyAccess>subtitle}",
                url: "{easyAccess>url}",
                icon: "{easyAccess>icon}",
                pinButton: oPinButton,
                press: [oController.onAppBoxPressed, oController]
            });
            this.oItemTemplate.addCustomData(new AccessibilityCustomData({
                key: "tabindex",
                value: "-1",
                writeToDom: true
            }));

            this.layout = new FlexBox(`${this.getId()}_hierarchyAppsLayout`, {
                items: {
                    path: "easyAccess>/apps",
                    template: this.oItemTemplate
                },
                wrap: FlexWrap.Wrap
            });

            this.layout.addDelegate({
                onAfterRendering: function () {
                    const items = this.getItems();
                    function updateTabindex (customData) {
                        if (customData.getKey() === "tabindex") {
                            customData.setValue("0");
                        }
                    }
                    if (items.length) {
                        items[0].getCustomData().forEach(updateTabindex);
                        items[0].getPinButton().getCustomData().forEach(updateTabindex);
                    }
                }.bind(this.layout)
            });

            // create message-page as invisible by default
            this.oMessagePage = new IllustratedMessage({
                visible: false,
                title: resources.i18n.getText("EasyAccessMenu_NoAppsToDisplayMessagePage_Text"),
                description: ""
            });

            const oViewData = this.getViewData();
            const sMenuNameI18nKey = oViewData.menuName === "USER_MENU" ? "appFinderUserMenuTitle" : "appFinderSapMenuTitle";

            const oPage = new Page({
                showHeader: false,
                landmarkInfo: new PageAccessibleLandmarkInfo({
                    contentLabel: resources.i18n.getText(sMenuNameI18nKey),
                    contentRole: AccessibleLandmarkRole.Region
                })
            }).addStyleClass("sapUshellAppsView sapUiContentPadding");

            // if it is not a search result view - e.g. this is a regular hierarchy Apps content view
            if (oViewData && oViewData.navigateHierarchy) {
                this.crumbsModel = new JSONModel({ crumbs: [] });

                this.linkTemplate = new Link({
                    text: "{crumbs>text}",
                    press: function (oEvent) {
                        const crumbData = oEvent.oSource.getBinding("text").getContext().getObject();
                        oViewData.navigateHierarchy(crumbData.path, false);
                    }
                });

                this.breadcrumbs = new Breadcrumbs({
                    links: {
                        path: "crumbs>/crumbs",
                        template: this.linkTemplate
                    },
                    currentLocationText: "{/text}"
                });

                this.breadcrumbs.setModel(this.crumbsModel, "crumbs");
                oPage.addContent(this.breadcrumbs);
            } else {
                // else we are in search results content view
                this.resultText = new Title({
                    text: {
                        parts: [
                            { path: "easyAccessSystemsModel>/systemSelected" },
                            { path: "easyAccess>/total" }
                        ],
                        formatter: oController.resultTextFormatter.bind(oController)
                    },
                    level: TitleLevel.H3
                }).addStyleClass("sapUiTinyMarginTop sapUiSmallMarginBottom sapUshellEasyAccessSearchResultText");

                oPage.addContent(this.resultText);

                this.showMoreResultsLink = new Button({
                    text: {
                        parts: [
                            { path: "easyAccess>/apps" },
                            { path: "easyAccess>/total" }
                        ],
                        formatter: oController.showMoreResultsTextFormatter.bind(oController)
                    },
                    press: oViewData.getMoreSearchResults,
                    visible: {
                        parts: [
                            { path: "easyAccess>/apps" },
                            { path: "easyAccess>/total" }
                        ],
                        formatter: oController.showMoreResultsVisibilityFormatter.bind(oController)
                    },
                    type: ButtonType.Transparent
                });
            }

            oPage.addContent(this.oMessagePage);
            oPage.addContent(this.layout);

            if (this.showMoreResultsLink) {
                oPage.addContent(this.showMoreResultsLink);
            }

            return oPage;
        },

        formatPinButtonTooltip: function (aGroupsIDs, bookmarkCount, sGroupContextModelPath, sGroupContextId, sGroupContextTitle) {
            const oResourceBundle = resources.i18n;
            let sTooltip;

            if (sGroupContextModelPath) {
                const iCatalogTileInGroup = aGroupsIDs ? Array.prototype.indexOf.call(aGroupsIDs, sGroupContextId) : -1;

                const sTooltipKey = iCatalogTileInGroup !== -1
                    ? "removeAssociatedTileFromContextGroup"
                    : "addAssociatedTileToContextGroup";

                sTooltip = oResourceBundle.getText(sTooltipKey, [sGroupContextTitle]);
            } else {
                sTooltip = bookmarkCount
                    ? oResourceBundle.getText("EasyAccessMenu_PinButton_Toggled_Tooltip")
                    : oResourceBundle.getText("EasyAccessMenu_PinButton_UnToggled_Tooltip");
            }
            return sTooltip;
        },

        /**
         * updates the text-field OR the messagePage according to.
         * @param {boolean} bItemsExist if items exist we update the text-field, otherwise show message page.
         * @param {boolean} bIsSearchResults if we use different text then if is not. (e.g. standard empty folder navigation)
         */
        updateResultSetMessage: function (bItemsExist, bIsSearchResults) {
            let sEmptyContentMessageKey;
            if (bIsSearchResults) {
                sEmptyContentMessageKey = "noFilteredItems";
            } else {
                sEmptyContentMessageKey = "EasyAccessMenu_NoAppsToDisplayMessagePage_Text";
            }

            // if there are items in the results
            if (bItemsExist) {
                // if this is search results --> update the result-text which we display at the top of page when there are results
                if (bIsSearchResults) {
                    this.resultText.updateProperty("text");
                    this.resultText.setVisible(true);
                }

                // set layout visible, hide the message page
                this.layout.setVisible(true);
                this.oMessagePage.setVisible(false);
            } else {
                // in case this is search results --> hide the result-text which we display at the top of page as there are no results.
                // we will display the message page instaed
                if (bIsSearchResults) {
                    this.resultText.setVisible(false);
                }

                this.layout.setVisible(false);
                this.oMessagePage.setVisible(true);

                const sEmptyContentMessageText = resources.i18n.getText(sEmptyContentMessageKey);
                this.oMessagePage.setTitle(sEmptyContentMessageText);
            }
        },

        setShowMoreResultsBusy: function (bBusy) {
            if (this.showMoreResultsLink) {
                this.showMoreResultsLink.setBusy(bBusy);
            }
        },

        getControllerName: function () {
            return "sap.ushell.components.appfinder.HierarchyApps";
        }
    });
}, /* bExport= */ true);
