declare module "sap/esh/search/ui/tree/tmpData" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    type TmpData = {
        [id: string]: any;
    };
    let tmpDataId: number;
    const registry: {
        [tmpDataId: string]: TmpData;
    };
    function createTmpData(): TmpData;
    function getTmpData(tmpDataId: string): TmpData;
    function deleteTmpData(tmpDataId: string): void;
    function getCountTmpData(): number;
    function isEmptyTmpData(): boolean;
}
//# sourceMappingURL=tmpData.d.ts.map