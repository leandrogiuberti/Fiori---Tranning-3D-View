/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import i18n from "../i18n";
import Text from "sap/m/Text";
import Toolbar from "sap/m/Toolbar";
import { ToolbarDesign } from "sap/m/library";

/**
 * @namespace sap.esh.search.ui.controls
 */
export default class SearchSelectionBar extends Toolbar {
    private selectionText: Text;

    constructor(sId?: string) {
        super(sId);

        this.setProperty("design", ToolbarDesign.Info);

        this.addStyleClass("sapElisaSearchSelectionBar");

        this.selectionText = new Text(this.getId() + "-selectionText", {
            text: {
                parts: [{ path: "/multiSelectionObjects" }, { path: "/count" }],
                formatter: this.textFormatter.bind(this),
            },
        }).addStyleClass("sapElisaSearchSelectionText");

        this.bindProperty("visible", {
            parts: [{ path: "/multiSelectionObjects" }, { path: "/config" }],
            formatter: this.visibleFormatter.bind(this),
        }); // hide the toolbar if no selection

        this.addContent(this.selectionText);
    }

    textFormatter(selectedObjects, count: int): string {
        // if (selectedObjects.length === 0) {
        //     return "";
        // }
        const selectedCount = selectedObjects.filter((result) => result.selected).length;
        return i18n.getText("selectionText", [selectedCount, count]);
    }

    visibleFormatter(selectedObjects, config): boolean {
        return selectedObjects.length >= config.enableSearchSelectionBarStartingWith;
    }

    static renderer = {
        apiVersion: 2,
    };
}
