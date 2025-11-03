/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
export type TmpData = { [id: string]: any };

let tmpDataId = 0;
const registry: { [tmpDataId: string]: TmpData } = {};

export function createTmpData(): TmpData {
    const tmpData: TmpData = {};
    tmpData.tmpDataId = "" + ++tmpDataId;
    registry[tmpData.tmpDataId] = tmpData;
    return tmpData;
}

export function getTmpData(tmpDataId: string) {
    const tmpData = registry[tmpDataId];
    if (!tmpData) {
        throw "no tmp data";
    }
    return tmpData;
}

export function deleteTmpData(tmpDataId: string) {
    delete registry[tmpDataId];
}

export function getCountTmpData(): number {
    return Object.keys(registry).length;
}

export function isEmptyTmpData(): boolean {
    return Object.keys(registry).length === 0;
}
