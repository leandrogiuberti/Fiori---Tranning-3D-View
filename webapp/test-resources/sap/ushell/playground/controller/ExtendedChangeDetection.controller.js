// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/m/GenericTile",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/playground/controller/BaseController",
    "sap/ushell/library",
    "sap/m/library"
], (
    GenericTile,
    JSONModel,
    BaseController,
    ushellLibrary,
    mLibrary
) => {
    "use strict";

    const GenericTileMode = mLibrary.GenericTileMode;
    const DisplayFormat = ushellLibrary.DisplayFormat;

    return BaseController.extend("sap.ushell.playground.controller.ExtendedChangeDetection", {
        onInit: function () {
            this.oModel = new JSONModel({
                visualizations: [{
                    id: "tile1",
                    title: "Tile No. 1",
                    subtitle: "sub1sub",
                    displayFormatHint: DisplayFormat.Standard
                }, {
                    id: "tile2",
                    title: "Tile No. 2",
                    subtitle: "sub2sub",
                    displayFormatHint: DisplayFormat.Standard
                }, {
                    id: "tile3",
                    title: "Tile No. 3",
                    subtitle: "sub3sub",
                    displayFormatHint: DisplayFormat.Compact
                }, {
                    id: "tile4",
                    title: "Tile No. 4",
                    subtitle: "sub4sub",
                    displayFormatHint: DisplayFormat.Compact
                }, {
                    id: "tile5",
                    title: "Tile No. 5",
                    subtitle: "sub5sub",
                    displayFormatHint: DisplayFormat.Standard
                }]
            });

            this.oModel.setDefaultBindingMode("OneWay");

            this.oSection = this.getView().byId("playgroundSection");
            this.getView().setModel(this.oModel);
        },

        _visualizationsFactory: function (sId, oContext) {
            return new GenericTile({
                header: "{title}",
                subheader: {
                    parts: ["title", "subtitle", "displayFormat"],
                    formatter: function () {
                        return this.getId();
                    }
                },
                mode: `{= \${displayFormatHint} === '${DisplayFormat.Standard}' ? '${GenericTileMode.ContentMode}' : '${GenericTileMode.LineMode}'}`
            });
        },

        reorderVisualizations: function (oEvent) {
            const oDragged = oEvent.getParameter("draggedControl");
            const oDropped = oEvent.getParameter("droppedControl");
            const sInsertPosition = oEvent.getParameter("dropPosition");
            const iDragPosition = this.oSection.indexOfVisualization(oDragged);
            let iDropPosition = this.oSection.indexOfVisualization(oDropped);
            const oDropPosition = this.oSection.getItemPosition(oDropped);

            if (sInsertPosition === "After") {
                if (iDropPosition < iDragPosition) {
                    iDropPosition++;
                    oDropPosition.index++;
                }
            } else if (iDropPosition > iDragPosition) {
                iDropPosition--;
                oDropPosition.index--;
            }

            const aVisualizations = this.oModel.getProperty("/visualizations");
            const oVisualization = aVisualizations.splice(iDragPosition, 1)[0];

            aVisualizations.splice(iDropPosition, 0, oVisualization);
            this.oModel.setProperty("/visualizations", aVisualizations);
        }
    });
});
