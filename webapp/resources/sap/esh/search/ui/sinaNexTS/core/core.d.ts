declare module "sap/esh/search/ui/sinaNexTS/core/core" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    function object(prototype: any): any;
    function extend(o1: any, o2: any): any;
    function firstCharToUpper(text: string, removeUnderscore: boolean): string;
    function isList(obj: any): boolean;
    function isObject(obj: any): boolean;
    function isEmptyObject(obj: any): boolean;
    function isFunction(obj: any): boolean;
    function isString(obj: any): boolean;
    function isSimple(obj: any): boolean;
    function equals(o1: any, o2: any, ordered?: boolean): boolean;
    function _equalsList(l1: any, l2: any, ordered?: boolean): boolean;
    function _equalsObject(o1: any, o2: any, ordered: boolean): boolean;
    function clone<T>(obj: T): T;
    function _cloneList<E>(list: Array<E>): Array<E>;
    function _cloneObject<T>(obj: T): T;
    let maxId: number;
    function generateId(): string;
    function generateGuid(): string;
    function executeSequentialAsync(tasks: Array<unknown>, caller?: (any: any) => Promise<unknown>): Promise<void>;
    function getProperty(obj: any, path: (string | number)[]): any;
    function isBrowserEnv(): boolean;
}
//# sourceMappingURL=core.d.ts.map