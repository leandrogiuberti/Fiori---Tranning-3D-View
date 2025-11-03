// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/m/GenericTile",
    "sap/m/ImageContent",
    "sap/m/TileContent",
    "sap/f/GridContainerItemLayoutData",
    "sap/m/library",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/resources",
    "sap/ushell/playground/controller/BaseController"
], (
    GenericTile,
    ImageContent,
    TileContent,
    GridContainerItemLayoutData,
    mobileLibrary,
    JSONModel,
    resources,
    BaseController
) => {
    "use strict";

    let oUshellPage;
    let oModel;
    let iCounter = 0;

    const FrameType = mobileLibrary.FrameType;

    return BaseController.extend("sap.ushell.playground.controller.Page", {
        onInit: function () {
            this.getView().setModel(resources.i18nModel, "i18n");

            oUshellPage = this.getView().byId("playgroundUshellPage");

            oModel = new JSONModel({
                sections: [],
                edit: true,
                enableSectionReordering: true,
                noSectionsText: "",
                showNoSectionsText: true,
                showTitle: true,
                title: "Page Title"
            });
            this.getView().setModel(oModel);
        },

        _visualizationsFactory: function (sId, oContext) {
            const oTileData = oContext.getObject();
            const oTile = new GenericTile({
                mode: "{mode}",
                header: "{header}",
                subheader: "{subheader}",
                frameType: "{frameType}",
                scope: "{= ${/edit} ? 'Actions' : 'Display'}",
                tileContent: [new TileContent({
                    footer: "{info}",
                    content: [new ImageContent({ // Static Tile
                        src: "{icon}"
                    })]
                })],
                sizeBehavior: "Responsive",
                press: function (oEvent) {
                    if (oEvent.getParameter("action") === "Remove") {
                        const oViz = oEvent.getSource();
                        const aParts = oViz.getBindingContext().getPath().split("/");
                        const iSectionIndex = aParts[2];
                        const iVizIndex = aParts[4];
                        const sPath = `/sections/${iSectionIndex}/visualizations`;
                        const aViz = oModel.getProperty(sPath);
                        const oSection = oUshellPage.getSections()[iSectionIndex];
                        const oPosition = oSection.getItemPosition(oViz);

                        aViz.splice(iVizIndex, 1);
                        oModel.setProperty(sPath, aViz);
                        oSection.focusVisualization(oPosition);
                    }
                }
            });
            if (oTileData.rows) {
                oTile.setLayoutData(new GridContainerItemLayoutData({ rows: oTileData.rows, columns: oTileData.columns }));
            }
            return oTile;
        },

        genericTilePress: function (oEvent) {
            if (oEvent.getParameter("action") === "Remove") {
                oEvent.getSource().destroy();
            }
        },

        addVisualization: function (oEvent) {
            const oSection = oEvent.getSource();
            const sPath = `${oSection.getBindingContext().getPath()}/visualizations`;
            const aViz = oModel.getProperty(sPath);
            const oTileData = this.createTileData();
            aViz.push(oTileData);
            oModel.setProperty(sPath, aViz);
        },

        createTileData: function () {
            iCounter++;
            return {
                header: `Sales Fulfillment ${iCounter}`,
                subheader: "abc",
                info: "some text",
                mode: "ContentMode",
                frameType: FrameType.OneByOne,
                icon: "sap-icon://activities",
                displayFormatHint: "standard"
            };
        },

        addSection: function (oEvent) {
            const aSections = oModel.getProperty("/sections");
            const iSectionIndex = oEvent.getParameter("index");
            const oSectionData = {
                visualizations: [this.createTileData(), this.createTileData()]
            };
            aSections.splice(iSectionIndex, 0, oSectionData);
            oModel.setProperty("/sections", aSections);
        },

        resetSection: function (oEvent) {
            const oSection = oEvent.getSource();
            const sPath = oSection.getBindingContext().getPath();
            const oSectionData = {
                visualizations: [this.createTileData(), this.createTileData()]
            };
            oModel.setProperty(sPath, oSectionData);
        },

        onSectionDrop: function (oInfo) {
            const oDragged = oInfo.getParameter("draggedControl");
            const oDropped = oInfo.getParameter("droppedControl");
            const sInsertPosition = oInfo.getParameter("dropPosition");
            const iDragPosition = oUshellPage.indexOfSection(oDragged);
            let iDropPosition = oUshellPage.indexOfSection(oDropped);

            if (sInsertPosition === "After") {
                if (iDropPosition < iDragPosition) {
                    iDropPosition++;
                }
            } else if (iDropPosition > iDragPosition) {
                iDropPosition--;
            }

            const aSections = oModel.getProperty("/sections");
            const oSectionToBeMoved = aSections.splice(iDragPosition, 1)[0];

            aSections.splice(iDropPosition, 0, oSectionToBeMoved);
            oModel.setProperty("/sections", aSections);
        },

        onVisualizationDrop: function (oInfo) {
            const oDragged = oInfo.getParameter("draggedControl");
            const oDropped = oInfo.getParameter("droppedControl");
            const sInsertPosition = oInfo.getParameter("dropPosition");
            const oOldSection = oDragged.getParent().getParent().getParent();
            const oNewSection = oDropped.getParent().getParent().getParent();
            const iDragPosition = oOldSection.indexOfVisualization(oDragged);
            let iDropPosition = oNewSection.indexOfVisualization(oDropped);
            const iDragSectionPosition = oUshellPage.indexOfSection(oOldSection);
            const iDropSectionPosition = oUshellPage.indexOfSection(oNewSection);
            const aSectionData = oModel.getProperty("/sections");
            const oTileData = oDragged.getBindingContext().getObject();

            if (iDragSectionPosition === iDropSectionPosition) {
                if (iDragPosition < iDropPosition && sInsertPosition === "Before") {
                    iDropPosition--;
                }
            } else if (sInsertPosition === "After") {
                iDropPosition++;
            }

            aSectionData[iDragSectionPosition].visualizations.splice(iDragPosition, 1);
            aSectionData[iDropSectionPosition].visualizations.splice(iDropPosition, 0, oTileData);
            oModel.setProperty("/sections", aSectionData);
        },

        deleteSection: function (oEvent) {
            const oSection = oEvent.getSource();
            const iSectionIndex = oUshellPage.indexOfSection(oSection);

            const aSections = oModel.getProperty("/sections");
            aSections.splice(iSectionIndex, 1);
            oModel.setProperty("/sections", aSections);
        }
    });
});
