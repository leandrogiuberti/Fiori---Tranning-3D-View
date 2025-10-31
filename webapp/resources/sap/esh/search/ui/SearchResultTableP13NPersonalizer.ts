/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import i18n from "./i18n";
import SearchModel from "sap/esh/search/ui/SearchModel";
import SearchResultTable from "sap/esh/search/ui/controls/resultview/SearchResultTable";
import P13NPopup from "sap/m/p13n/Popup";
import P13NPanel from "sap/m/p13n/SelectionPanel";
import Button from "sap/m/Button";
import Core from "sap/ui/core/Core";
// import { TableColumnType } from "./SearchResultTableColumnType";
import { Column as TableColumn } from "./SearchResultTableFormatter";
import ErrorHandler from "./error/ErrorHandler";
// import merge from "sap/base/util/merge";

export interface PersoState {
    aColumns: Array<TableColumn>;
    _persoSchemaVersion: "p13n";
}

// reference:
// interface P13NColumn {
//     name: string; // === TableColumn's p13NColumnName
//     label: string;
//     visible: boolean;
// }

export default class SearchResultTablePersonalizer {
    model: SearchModel;
    table: SearchResultTable;
    p13nPanel: P13NPanel;
    p13nPopup: P13NPopup;
    private resetPerformed: boolean = false;

    constructor(searchModel: SearchModel) {
        this.model = searchModel;
    }

    initialize(table: SearchResultTable): void {
        try {
            this.table = table;
            if (!this.p13nPopup) {
                this.createPopup();
            }
            this.p13nPanel.attachChange(() => {
                this.resetPerformed = false;
                this.updateOkButtonState();
            });
        } catch (error) {
            const errorHandler = ErrorHandler.getInstance();
            errorHandler.onError(error);
        }
    }

    // update table columns by p13n popup columns (ordering and visibility)
    private updateTableColumns(isReset: boolean): void {
        if (isReset) {
            this.model.setTableColumns(this.model.getTableInitialColumns(), true);
        } else {
            const p13NColumns = this.p13nPanel.getP13nData(false);
            const oldColumns = this.model.getTableColumns(false);
            const newColumns = [];
            // loop p13NColumns, then loop oldColumns. Make sure the ordering is correct.
            for (const p13NColumn of p13NColumns) {
                for (const oldColumn of oldColumns) {
                    if (oldColumn.p13NColumnName === p13NColumn.name) {
                        oldColumn.visible = p13NColumn.visible;
                        newColumns.push(oldColumn);
                        break;
                    }
                }
            }
            this.model.setTableColumns(newColumns, true);
        }
    }

    // update p13n popup columns by personalize state columns or initial columns (ordering and visibility)
    private updateP13NColumns(isInitial: boolean): void {
        const columns = isInitial ? this.model.getTableInitialColumns() : this.model.getTableColumns(false);

        const p13NColumns = columns.map((column) => ({
            name: column.p13NColumnName,
            label: column.name,
            visible: column.visible,
        }));

        this.p13nPanel.setP13nData(p13NColumns);
    }

    private createPopup(): void {
        this.p13nPanel = new P13NPanel({ showHeader: false });

        this.p13nPopup = new P13NPopup(this.table.getId() + "-personalizer", {
            title: i18n.getText("personalizeTable"),
            panels: [this.p13nPanel],
            warningText: i18n.getText("resetColumns"),
            reset: () => {
                this.updateP13NColumns(true);
                this.updateOkButtonState();
                this.resetPerformed = true;
            },
            close: (event) => {
                if (event.getParameter("reason") === "Ok") {
                    this.updateTableColumns(this.resetPerformed);
                    this.table.update();
                }
                this.resetPerformed = false;
            },
        });

        this.p13nPopup.addStyleClass("sapUshellSearchResultTablePersonalizationDialog");
    }

    private updateOkButtonState(): void {
        const p13NColumns = this.p13nPanel.getP13nData(false);
        const selectedCount = p13NColumns.filter((col) => col.visible).length;

        const okButtonId = this.table.getId() + "-personalizer-confirmBtn";
        const okButton = Core.byId(okButtonId) as Button;
        if (okButton) {
            const isEnabled = selectedCount > 0;
            okButton.setEnabled(isEnabled);
            okButton.setTooltip(
                isEnabled
                    ? "" // No tooltip needed when enabled
                    : i18n.getText("noColumnsSelectedTooltip") // Tooltip when disabled
            );
        }
    }

    public openDialog(): void {
        this.updateP13NColumns(false);
        this.p13nPopup.open(null);
        // update the ok button immediately after opening
        this.updateOkButtonState();
    }

    public destroyControllerAndDialog(): void {
        this.p13nPopup.destroyPanels();
        this.p13nPopup.destroy();
    }
}
