// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/m/MenuButton",
    "sap/m/Menu",
    "sap/m/MenuItem",
    "sap/m/GenericTile",
    "sap/m/ImageContent",
    "sap/m/library",
    "sap/m/MessageToast",
    "sap/m/TileContent",
    "sap/f/GridContainerItemLayoutData",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/library",
    "sap/ushell/resources",
    "sap/ushell/playground/controller/BaseController"
], (
    MenuButton,
    Menu,
    MenuItem,
    GenericTile,
    ImageContent,
    mobileLibrary,
    MessageToast,
    TileContent,
    GridContainerItemLayoutData,
    JSONModel,
    ushellLibrary,
    resources,
    BaseController
) => {
    "use strict";

    const FrameType = mobileLibrary.FrameType;

    // shortcut for sap.m.TileSizeBehavior
    const TileSizeBehavior = mobileLibrary.TileSizeBehavior;

    // shortcut for sap.ushell.DisplayFormat
    const DisplayFormat = ushellLibrary.DisplayFormat;

    let oModel;
    let oSection;
    let iCounter = 1;
    let iFlatCounter = 1;
    let iLinkCounter = 1;

    return BaseController.extend("sap.ushell.playground.controller.Section", {
        onInit: function () {
            oModel = new JSONModel({
                editable: false,
                enableAddButton: true,
                enableDeleteButton: true,
                enableGridBreakpoints: false,
                enableResetButton: true,
                enableShowHideButton: true,
                enableVisualizationReordering: false,
                noVisualizationsText: resources.i18n.getText("Section.NoVisualizationsText"),
                title: "",
                showNoVisualizationsText: false,
                showSection: true,
                visible: true,
                sizeBehavior: TileSizeBehavior.Small,
                visualizations: []
            });

            oSection = this.getView().byId("playgroundSection");

            // Add the Add.. button
            const oMenu = new Menu({
                items: [
                    new MenuItem({ text: "Link" }),
                    new MenuItem({ text: "Flat Tile" }),
                    new MenuItem({ text: "Wide Tile" })
                ],
                itemSelected: this.addLinkOrTile
            });
            const oAddButton = new MenuButton({
                text: "Add",
                menu: oMenu
            });
            oSection.getAggregation("_header").insertContent(oAddButton, 4);

            this.getView().setModel(oModel);
        },

        addVisualization: function () {
            MessageToast.show("Add Visualization Button pressed");
            const aVisualizations = oModel.getProperty("/visualizations");

            aVisualizations.push({
                header: `Sales Fulfillment ${iCounter}`,
                subheader: "abc",
                info: "some text",
                mode: "ContentMode",
                frameType: FrameType.OneByOne,
                icon: "sap-icon://activities",
                displayFormatHint: "standard"
            });

            iCounter++;

            oModel.setProperty("/visualizations", aVisualizations);
        },

        addLinkOrTile: function (oEvent) {
            const oItem = oEvent.getParameter("item");
            const itemIndex = oEvent.getSource().indexOfItem(oItem);
            let oViz;

            switch (itemIndex) {
                case 0:
                    oViz = {
                        header: `Compact Visualization ${iLinkCounter}`,
                        subheader: "link",
                        info: "some text",
                        mode: "LineMode",
                        frameType: FrameType.OneByOne,
                        icon: "sap-icon://activities",
                        displayFormatHint: DisplayFormat.Compact
                    };
                    iLinkCounter++;
                    break;
                case 1:
                    oViz = {
                        header: `Flat Visualization ${iFlatCounter}`,
                        subheader: "flat tile",
                        info: "some text",
                        mode: "ContentMode",
                        frameType: FrameType.OneByHalf,
                        rows: 1,
                        columns: 2,
                        icon: "sap-icon://activities",
                        displayFormatHint: DisplayFormat.Flat
                    };
                    iFlatCounter++;
                    break;
                case 2:
                    oViz = {
                        header: `Wide Flat Visualization ${iFlatCounter}`,
                        subheader: "wide flat tile",
                        info: "some text",
                        mode: "ContentMode",
                        frameType: FrameType.TwoByHalf,
                        rows: 1,
                        columns: 4,
                        icon: "sap-icon://activities",
                        displayFormatHint: DisplayFormat.FlatWide
                    };
                    iFlatCounter++;
                    break;
                default:
                    break;
            }

            MessageToast.show("Add Button pressed");
            const aVisualizations = oModel.getProperty("/visualizations");
            aVisualizations.push(oViz);
            oModel.setProperty("/visualizations", aVisualizations);
        },

        resetVisualizations: function () {
            MessageToast.show("Reset Button pressed");
            iCounter = 1;
            oModel.setProperty("/visualizations", []);
        },

        titleChange: function () {
            MessageToast.show("Title was changed");
        },

        _generateVisualizations: function (sId, oContext) {
            const oTileData = oContext.getObject();
            const oTile = new GenericTile({
                mode: "{mode}",
                header: "{header}",
                subheader: "{subheader}",
                frameType: "{frameType}",
                scope: "{= ${/editable} ? 'Actions' : 'Display'}",
                tileContent: [new TileContent({
                    footer: "{info}",
                    content: [new ImageContent({ // Static Tile
                        src: "{icon}"
                    })]
                })],
                sizeBehavior: "{/sizeBehavior}",
                press: function (oEvent) {
                    if (oEvent.getParameter("action") === "Remove") {
                        const aVisualizations = oModel.getProperty("/visualizations");
                        const oViz = oEvent.getSource();
                        const index = oSection.indexOfVisualization(oViz);
                        const oPosition = oSection.getItemPosition(oViz);
                        aVisualizations.splice(index, 1);

                        oModel.setProperty("/visualizations", aVisualizations);
                        oSection.focusVisualization(oPosition);
                    }
                }
            });
            if (oTileData.rows) {
                oTile.setLayoutData(new GridContainerItemLayoutData({ rows: oTileData.rows, columns: oTileData.columns }));
            }
            return oTile;
        },

        setSizeBehavior: function (oEvent) {
            const sSetting = oEvent.getParameter("selectedItem").getText();
            oModel.setProperty("/sizeBehavior", TileSizeBehavior[sSetting]);
        },

        deleteSection: function () {
            MessageToast.show("Delete Button pressed");
        },

        reorderVisualizations: function (oEvent) {
            const oDragged = oEvent.getParameter("draggedControl");
            const oDropped = oEvent.getParameter("droppedControl");
            const sInsertPosition = oEvent.getParameter("dropPosition");
            const iDragPosition = oSection.indexOfVisualization(oDragged);
            let iDropPosition = oSection.indexOfVisualization(oDropped);
            const oDragPosition = oSection.getItemPosition(oDragged);
            const oDropPosition = oSection.getItemPosition(oDropped);

            // TBD: DnD inside of the compact area
            if (oDragPosition.area !== oDropPosition.area) {
                return; // No DnD between areas currently
            }

            if (sInsertPosition === "After") {
                if (iDropPosition < iDragPosition) {
                    iDropPosition++;
                    oDropPosition.index++;
                }
            } else if (iDropPosition > iDragPosition) {
                iDropPosition--;
                oDropPosition.index--;
            }

            const aVisualizations = oModel.getProperty("/visualizations");
            const oVisualizationModelEntity = aVisualizations.splice(iDragPosition, 1)[0];

            aVisualizations.splice(iDropPosition, 0, oVisualizationModelEntity);
            oModel.setProperty("/visualizations", aVisualizations);
            oSection.focusVisualization(oDropPosition);
        }
    });
});
