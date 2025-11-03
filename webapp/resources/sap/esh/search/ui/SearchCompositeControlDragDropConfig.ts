/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import DragDropBase from "sap/ui/core/dnd/DragDropBase";
import SearchCompositeControl from "./SearchCompositeControl";
import Control from "sap/ui/core/Control";

export interface $SearchCompositeControlDragDropConfigSettings {
    eshComp: SearchCompositeControl;
}

/**
 * @namespace sap.esh.search.ui
 */

export default class SearchCompositeControlDragDropConfig {
    public eshComp: SearchCompositeControl;
    private dragDropConfig: Array<DragDropBase>;

    constructor(settings: $SearchCompositeControlDragDropConfigSettings) {
        this.eshComp = settings.eshComp;
    }

    assignDragDropConfig(): void {
        let dragDropConfig = this.getDragDropConfig();
        if (dragDropConfig.length === 0) {
            dragDropConfig = this.dragDropConfig || [];
        }
        if (dragDropConfig.length > 0) {
            let controlToAssignDragDropConfig;
            switch (this.eshComp.getResultViewType()) {
                case "appSearchResult":
                    // no drag&drop support
                    break;
                case "searchResultList":
                    if (this.eshComp.searchResultList) {
                        controlToAssignDragDropConfig = this.eshComp.searchResultList;
                    }
                    break;
                case "searchResultTable":
                    if (this.eshComp.searchResultTable) {
                        controlToAssignDragDropConfig = this.eshComp.searchResultTable;
                    }
                    break;
                case "searchResultGrid":
                    if (this.eshComp.searchResultGrid) {
                        controlToAssignDragDropConfig = this.eshComp.searchResultGrid;
                    }
                    break;
                // for other cases do nothing (empty or not table/list/grid)
            }
            // re-assign D&D config
            if (controlToAssignDragDropConfig) {
                for (const dragDropConfigItem of dragDropConfig) {
                    controlToAssignDragDropConfig.addDragDropConfig(dragDropConfigItem);
                }
            }
        }
    }

    addDragDropConfig(oDragDropConfig: DragDropBase): any {
        // oDragDropConfig cannot be assigned to multiple controls in parallel.
        // -> we need to (re-)assign it to the active result view
        switch (this.eshComp.getResultViewType()) {
            case "appSearchResult":
                // no drag&drop support
                break;
            case "searchResultList":
                if (this.eshComp.searchResultList) {
                    this.eshComp.searchResultList.addDragDropConfig(oDragDropConfig);
                    this.dragDropConfig = this.getDragDropConfig();
                    return this.eshComp.searchResultList;
                }
                break;
            case "searchResultTable":
                if (this.eshComp.searchResultTable) {
                    this.eshComp.searchResultTable.addDragDropConfig(oDragDropConfig);
                    this.dragDropConfig = this.getDragDropConfig();
                    return this.eshComp.searchResultTable;
                }
                break;
            case "searchResultGrid":
                if (this.eshComp.searchResultGrid) {
                    this.eshComp.searchResultGrid.addDragDropConfig(oDragDropConfig);
                    this.dragDropConfig = this.getDragDropConfig();
                    return this.eshComp.searchResultGrid;
                }
                break;
            case "":
                this.dragDropConfig = [oDragDropConfig];
        }
        return this;
    }

    insertDragDropConfig(oDragDropConfig: DragDropBase, iIndex: number): any {
        switch (this.eshComp.getResultViewType()) {
            case "appSearchResult":
                // no drag&drop support
                break;
            case "searchResultList":
                if (this.eshComp.searchResultList) {
                    this.eshComp.searchResultList.insertDragDropConfig(oDragDropConfig, iIndex);
                    this.dragDropConfig = this.getDragDropConfig();
                    return this.eshComp.searchResultList;
                }
                break;
            case "searchResultTable":
                if (this.eshComp.searchResultTable) {
                    this.eshComp.searchResultTable.insertDragDropConfig(oDragDropConfig, iIndex);
                    this.dragDropConfig = this.getDragDropConfig();
                    return this.eshComp.searchResultTable;
                }
                break;
            case "searchResultGrid":
                if (this.eshComp.searchResultGrid) {
                    this.eshComp.searchResultGrid.insertDragDropConfig(oDragDropConfig, iIndex);
                    this.dragDropConfig = this.getDragDropConfig();
                    return this.eshComp.searchResultGrid;
                }
                break;
            case "":
                setTimeout(() => this.insertDragDropConfig(oDragDropConfig, iIndex), 500); // ToDo: Try to prevent setTimeout
        }
        return this;
    }

    indexOfDragDropConfig(oDragDropConfig: DragDropBase): number {
        if (
            this.eshComp.searchResultList?.getDragDropConfig() &&
            this.eshComp.searchResultList?.getDragDropConfig().length > 0
        ) {
            return this.eshComp.searchResultList.indexOfDragDropConfig(oDragDropConfig);
        } else if (
            this.eshComp.searchResultTable?.getDragDropConfig() &&
            this.eshComp.searchResultTable?.getDragDropConfig().length > 0
        ) {
            return this.eshComp.searchResultTable.indexOfDragDropConfig(oDragDropConfig);
        } else if (
            this.eshComp.searchResultGrid?.getDragDropConfig() &&
            this.eshComp.searchResultGrid?.getDragDropConfig().length > 0
        ) {
            return this.eshComp.searchResultGrid.indexOfDragDropConfig(oDragDropConfig);
        } else {
            return -1;
        }
    }

    getDragDropConfig(): Array<DragDropBase> {
        if (
            this.eshComp.searchResultList?.getDragDropConfig() &&
            this.eshComp.searchResultList?.getDragDropConfig().length > 0
        ) {
            return this.eshComp.searchResultList.getDragDropConfig();
        } else if (
            this.eshComp.searchResultTable?.getDragDropConfig() &&
            this.eshComp.searchResultTable?.getDragDropConfig().length > 0
        ) {
            return this.eshComp.searchResultTable.getDragDropConfig();
        } else if (
            this.eshComp.searchResultGrid?.getDragDropConfig() &&
            this.eshComp.searchResultGrid?.getDragDropConfig().length > 0
        ) {
            return this.eshComp.searchResultGrid.getDragDropConfig();
        } else {
            return [];
        }
    }

    removeDragDropConfig(vDragDropConfig: DragDropBase | string | int): DragDropBase {
        let dragDropBase: DragDropBase = null;
        if (
            this.eshComp.searchResultList?.getDragDropConfig() &&
            this.eshComp.searchResultList?.getDragDropConfig().length > 0
        ) {
            dragDropBase = this.eshComp.searchResultList.removeDragDropConfig(vDragDropConfig);
            this.dragDropConfig = this.getDragDropConfig();
        } else if (
            this.eshComp.searchResultTable?.getDragDropConfig() &&
            this.eshComp.searchResultTable?.getDragDropConfig().length > 0
        ) {
            dragDropBase = this.eshComp.searchResultTable.removeDragDropConfig(vDragDropConfig);
            this.dragDropConfig = this.getDragDropConfig();
        } else if (
            this.eshComp.searchResultGrid?.getDragDropConfig() &&
            this.eshComp.searchResultGrid?.getDragDropConfig().length > 0
        ) {
            dragDropBase = this.eshComp.searchResultGrid.removeDragDropConfig(vDragDropConfig);
            this.dragDropConfig = this.getDragDropConfig();
        } else {
            // do nothing
        }
        return dragDropBase;
    }

    removeAllDragDropConfig(): Array<DragDropBase> {
        let removedDragDropConfig: Array<DragDropBase> = [];
        if (
            this.eshComp.searchResultList?.getDragDropConfig() &&
            this.eshComp.searchResultList?.getDragDropConfig().length > 0
        ) {
            removedDragDropConfig = this.eshComp.searchResultList.removeAllDragDropConfig();
            this.dragDropConfig = this.getDragDropConfig();
        } else if (
            this.eshComp.searchResultTable?.getDragDropConfig() &&
            this.eshComp.searchResultTable?.getDragDropConfig().length > 0
        ) {
            removedDragDropConfig = this.eshComp.searchResultTable.removeAllDragDropConfig();
            this.dragDropConfig = this.getDragDropConfig();
        } else if (
            this.eshComp.searchResultGrid?.getDragDropConfig() &&
            this.eshComp.searchResultGrid?.getDragDropConfig().length > 0
        ) {
            removedDragDropConfig = this.eshComp.searchResultGrid.removeAllDragDropConfig();
            this.dragDropConfig = this.getDragDropConfig();
        } else {
            // do nothing;
        }
        return removedDragDropConfig;
    }

    destroyDragDropConfig(): any {
        let control: Control = this.eshComp;
        if (
            this.eshComp.searchResultList?.getDragDropConfig() &&
            this.eshComp.searchResultList?.getDragDropConfig().length > 0
        ) {
            control = this.eshComp.searchResultList.destroyDragDropConfig();
        } else if (
            this.eshComp.searchResultTable?.getDragDropConfig() &&
            this.eshComp.searchResultTable?.getDragDropConfig().length > 0
        ) {
            control = this.eshComp.searchResultTable.destroyDragDropConfig();
        } else if (
            this.eshComp.searchResultGrid?.getDragDropConfig() &&
            this.eshComp.searchResultGrid?.getDragDropConfig().length > 0
        ) {
            control = this.eshComp.searchResultGrid.destroyDragDropConfig();
        } else {
            // do nothing
        }
        this.dragDropConfig = [];
        return control;
    }
}
