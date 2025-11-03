declare module "sap/esh/search/ui/SearchCompositeControlDragDropConfig" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import DragDropBase from "sap/ui/core/dnd/DragDropBase";
    import SearchCompositeControl from "sap/esh/search/ui/SearchCompositeControl";
    interface $SearchCompositeControlDragDropConfigSettings {
        eshComp: SearchCompositeControl;
    }
    /**
     * @namespace sap.esh.search.ui
     */
    export default class SearchCompositeControlDragDropConfig {
        eshComp: SearchCompositeControl;
        private dragDropConfig;
        constructor(settings: $SearchCompositeControlDragDropConfigSettings);
        assignDragDropConfig(): void;
        addDragDropConfig(oDragDropConfig: DragDropBase): any;
        insertDragDropConfig(oDragDropConfig: DragDropBase, iIndex: number): any;
        indexOfDragDropConfig(oDragDropConfig: DragDropBase): number;
        getDragDropConfig(): Array<DragDropBase>;
        removeDragDropConfig(vDragDropConfig: DragDropBase | string | int): DragDropBase;
        removeAllDragDropConfig(): Array<DragDropBase>;
        destroyDragDropConfig(): any;
    }
}
//# sourceMappingURL=SearchCompositeControlDragDropConfig.d.ts.map