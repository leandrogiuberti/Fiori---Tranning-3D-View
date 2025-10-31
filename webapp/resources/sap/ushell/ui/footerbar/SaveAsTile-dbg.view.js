// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileoverview Save As Tile view for the classical home page
 * @deprecated since 1.120
 */
sap.ui.define([
    "sap/m/FlexBox",
    "sap/m/VBox",
    "sap/ui/layout/form/SimpleForm",
    "sap/m/GenericTile",
    "sap/m/ImageContent",
    "sap/m/Input",
    "sap/m/Label",
    "sap/m/library",
    "sap/m/NumericContent",
    "sap/m/Select",
    "sap/m/TileContent",
    "sap/ui/core/ListItem",
    "sap/ui/core/mvc/View",
    "sap/ui/model/BindingMode",
    "sap/ushell/resources",
    "sap/ushell/ui/footerbar/SaveAsTile.controller" // controller must be loaded
], (
    FlexBox,
    VBox,
    SimpleForm,
    GenericTile,
    ImageContent,
    Input,
    Label,
    mobileLibrary,
    NumericContent,
    Select,
    TileContent,
    ListItem,
    View,
    BindingMode,
    resources
    // SaveAsTileController
) => {
    "use strict";

    // shortcut for sap.m.FlexJustifyContent
    const FlexJustifyContent = mobileLibrary.FlexJustifyContent;

    // shortcut for sap.m.FlexAlignItems
    const FlexAlignItems = mobileLibrary.FlexAlignItems;

    return View.extend("sap.ushell.ui.footerbar.SaveAsTile", {
        getControllerName: function () {
            return "sap.ushell.ui.footerbar.SaveAsTile";
        },

        createContent: function () {
            this.oResourceBundle = resources.i18n;
            this.viewData = this.getViewData() || {};
            this.appData = this.viewData.appData || {};
            this.oTitleInput = new Input("bookmarkTitleInput", {
                placeholder: this.oResourceBundle.getText("bookmarkDialogoTitle_tooltip"),
                value: {
                    path: "/title",
                    mode: BindingMode.TwoWay
                }
            });
            this.oSubTitleInput = new Input("bookmarkSubTitleInput", {
                placeholder: this.oResourceBundle.getText("bookmarkDialogoSubTitle_tooltip"),
                value: {
                    path: "/subtitle",
                    mode: BindingMode.TwoWay
                }
            });
            this.oInfoInput = new Input("bookmarkInfoInput", {
                placeholder: this.oResourceBundle.getText("bookmarkDialogoDescription_tooltip"),
                value: {
                    path: "/info",
                    mode: BindingMode.TwoWay
                },
                visible: "{/showInfo}"
            });

            let oTile;
            // If the viewData contains 'serviceUrl', it means we need to instantiate GenericTile as 'dynamic'.
            if (this.viewData.serviceUrl) {
                oTile = new GenericTile({
                    header: "{/title}",
                    subheader: "{/subtitle}",
                    pressEnabled: false,
                    ariaLabel: this.oResourceBundle.getText("previewFld"),
                    tileContent: [new TileContent({
                        footer: "{/info}",
                        unit: "{/numberUnit}",
                        // We'll utilize NumericContent for the "Dynamic" content.
                        content: [new NumericContent({
                            value: "{/numberValue}",
                            truncateValueTo: 5, // Otherwise, The default value is 4.
                            icon: "{/icon}",
                            withMargin: false,
                            width: "100%"
                        })]
                    })]
                }).addStyleClass("sapUiResponsiveMargin");
            } else {
                oTile = new GenericTile({
                    header: "{/title}",
                    subheader: "{/subtitle}",
                    pressEnabled: false,
                    ariaLabel: this.oResourceBundle.getText("previewFld"),
                    tileContent: [new TileContent({
                        footer: "{/info}",
                        content: new ImageContent({
                            src: "{/icon}"
                        })
                    })]
                }).addStyleClass("sapUiResponsiveMargin");
            }

            oTile.addEventDelegate({
                onAfterRendering: function () {
                    oTile.getDomRef().removeAttribute("tabindex");
                }
            });

            this.setTileView(oTile);

            const oFlexBox = new FlexBox("saveAsTileHBox", {
                items: [oTile],
                alignItems: FlexAlignItems.Center,
                justifyContent: FlexJustifyContent.Center,
                visible: "{/showPreview}"
            }).addStyleClass("sapUshellAddBookmarkTileBackground");

            const oPreview = new Label("previewLbl", {
                text: this.oResourceBundle.getText("previewFld"),
                labelFor: oFlexBox,
                visible: "{/showPreview}"
            });

            this.oGroupsSelect = new Select("groupsSelect", {
                items: {
                    path: "/groups",
                    template: new ListItem({ text: "{title}" })
                },
                width: "100%",
                visible: {
                    parts: ["/showGroupSelection", "/groups"],
                    formatter: function (bShowGroupSelection, aGroups) {
                        if (bShowGroupSelection && !(aGroups && aGroups.length)) {
                            this.oController.loadPersonalizedGroups();
                        }
                        return bShowGroupSelection;
                    }.bind(this)
                }
            });

            const oTitle = new Label("titleLbl", {
                showColon: true,
                required: true,
                text: this.oResourceBundle.getText("titleFld"),
                labelFor: this.oTitleInput
            });

            const oSubTitle = new Label("subtitleLbl", {
                showColon: true,
                text: this.oResourceBundle.getText("subtitleFld"),
                labelFor: this.oSubTitleInput
            });

            const oInfo = new Label("infoLbl", {
                text: this.oResourceBundle.getText("tileSettingsDialog_informationField"),
                showColon: true,
                labelFor: this.oInfoInput,
                visible: "{/showInfo}"
            });

            const sTargetsLabelText = this.oResourceBundle.getText("GroupListItem_label");
            const oTargetsLabel = new Label("groupLbl", {
                text: sTargetsLabelText,
                labelFor: this.oGroupsSelect,
                visible: "{/showGroupSelection}"
            });

            return [
                new VBox({
                    items: [
                        oPreview,
                        oFlexBox
                    ]
                }).addStyleClass("sapUiSmallMargin"),
                new SimpleForm({
                    content: [
                        oTitle,
                        this.oTitleInput,
                        oSubTitle,
                        this.oSubTitleInput,
                        oInfo,
                        this.oInfoInput,
                        oTargetsLabel,
                        this.oGroupsSelect
                    ]
                })
            ];
        },

        getTitleInput: function () {
            return this.oTitleInput;
        },

        getTileView: function () {
            return this.tileView;
        },

        setTileView: function (oTileView) {
            this.tileView = oTileView;
        }
    });
});
