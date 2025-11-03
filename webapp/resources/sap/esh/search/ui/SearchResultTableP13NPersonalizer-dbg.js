/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["./i18n", "sap/m/p13n/Popup", "sap/m/p13n/SelectionPanel", "sap/ui/core/Core", "./error/ErrorHandler"], function (__i18n, P13NPopup, P13NPanel, Core, __ErrorHandler) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const i18n = _interopRequireDefault(__i18n);
  const ErrorHandler = _interopRequireDefault(__ErrorHandler); // import merge from "sap/base/util/merge";
  // reference:
  // interface P13NColumn {
  //     name: string; // === TableColumn's p13NColumnName
  //     label: string;
  //     visible: boolean;
  // }

  class SearchResultTablePersonalizer {
    model;
    table;
    p13nPanel;
    p13nPopup;
    resetPerformed = false;
    constructor(searchModel) {
      this.model = searchModel;
    }
    initialize(table) {
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
    updateTableColumns(isReset) {
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
    updateP13NColumns(isInitial) {
      const columns = isInitial ? this.model.getTableInitialColumns() : this.model.getTableColumns(false);
      const p13NColumns = columns.map(column => ({
        name: column.p13NColumnName,
        label: column.name,
        visible: column.visible
      }));
      this.p13nPanel.setP13nData(p13NColumns);
    }
    createPopup() {
      this.p13nPanel = new P13NPanel({
        showHeader: false
      });
      this.p13nPopup = new P13NPopup(this.table.getId() + "-personalizer", {
        title: i18n.getText("personalizeTable"),
        panels: [this.p13nPanel],
        warningText: i18n.getText("resetColumns"),
        reset: () => {
          this.updateP13NColumns(true);
          this.updateOkButtonState();
          this.resetPerformed = true;
        },
        close: event => {
          if (event.getParameter("reason") === "Ok") {
            this.updateTableColumns(this.resetPerformed);
            this.table.update();
          }
          this.resetPerformed = false;
        }
      });
      this.p13nPopup.addStyleClass("sapUshellSearchResultTablePersonalizationDialog");
    }
    updateOkButtonState() {
      const p13NColumns = this.p13nPanel.getP13nData(false);
      const selectedCount = p13NColumns.filter(col => col.visible).length;
      const okButtonId = this.table.getId() + "-personalizer-confirmBtn";
      const okButton = Core.byId(okButtonId);
      if (okButton) {
        const isEnabled = selectedCount > 0;
        okButton.setEnabled(isEnabled);
        okButton.setTooltip(isEnabled ? "" // No tooltip needed when enabled
        : i18n.getText("noColumnsSelectedTooltip") // Tooltip when disabled
        );
      }
    }
    openDialog() {
      this.updateP13NColumns(false);
      this.p13nPopup.open(null);
      // update the ok button immediately after opening
      this.updateOkButtonState();
    }
    destroyControllerAndDialog() {
      this.p13nPopup.destroyPanels();
      this.p13nPopup.destroy();
    }
  }
  return SearchResultTablePersonalizer;
});
//# sourceMappingURL=SearchResultTableP13NPersonalizer-dbg.js.map
