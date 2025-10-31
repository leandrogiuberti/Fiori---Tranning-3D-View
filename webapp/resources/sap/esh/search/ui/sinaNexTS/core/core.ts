/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
// =========================================================================
// create object with prototype
// =========================================================================
export function object(prototype) {
    const TmpFunction = function () {};
    TmpFunction.prototype = prototype;
    return new TmpFunction();
}

// =========================================================================
// extend object
// =========================================================================
export function extend(o1, o2) {
    for (const key in o2) {
        o1[key] = o2[key];
    }
    return o1;
}

// =========================================================================
// first character to upper
// =========================================================================
export function firstCharToUpper(text: string, removeUnderscore: boolean): string {
    if (removeUnderscore) {
        if (text[0] === "_") {
            text = text.slice(1);
        }
    }
    return text[0].toUpperCase() + text.slice(1);
}

// =========================================================================
// is list
// =========================================================================
export function isList(obj): boolean {
    if (Object.prototype.toString.call(obj) === "[object Array]") {
        return true;
    }
    return false;
}

// =========================================================================
// is object (array!=object)
// =========================================================================
export function isObject(obj): boolean {
    if (isList(obj)) {
        return false;
    }
    return typeof obj === "object";
}

// =========================================================================
// is empty object
// =========================================================================
export function isEmptyObject(obj): boolean {
    for (const prop in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, prop)) {
            return false;
        }
    }
    return JSON.stringify(obj) === JSON.stringify({});
}

// =========================================================================
// is function
// =========================================================================
export function isFunction(obj): boolean {
    return typeof obj === "function";
}

// =========================================================================
// is string
// =========================================================================
export function isString(obj): boolean {
    return typeof obj === "string";
}

// =========================================================================
// is simple (= string, number  but not list, object, function)
// =========================================================================
export function isSimple(obj): boolean {
    return typeof obj !== "object" && typeof obj !== "function";
}

// =========================================================================
// generic equals
// =========================================================================
export function equals(o1, o2, ordered?: boolean): boolean {
    if (isList(o1)) {
        return _equalsList(o1, o2, ordered);
    }
    if (isObject(o1)) {
        return _equalsObject(o1, o2, ordered);
    }
    return o1 === o2;
}

export function _equalsList(l1, l2, ordered?: boolean): boolean {
    if (ordered === undefined) {
        ordered = true;
    }
    if (l1.length !== l2.length) {
        return false;
    }
    if (ordered) {
        // 1) consider order
        for (let i = 0; i < l1.length; ++i) {
            if (!equals(l1[i], l2[i], ordered)) {
                return false;
            }
        }
        return true;
    }
    // 2) do not consider order
    const matched = {};
    for (let j = 0; j < l1.length; ++j) {
        const element1 = l1[j];
        let match = false;
        for (let k = 0; k < l2.length; ++k) {
            const element2 = l2[k];
            if (matched[k]) {
                continue;
            }
            if (equals(element1, element2, ordered)) {
                match = true;
                matched[k] = true;
                break;
            }
        }
        if (!match) {
            return false;
        }
    }
    return true;
}

export function _equalsObject(o1, o2, ordered: boolean): boolean {
    if (o1.equals) {
        return o1.equals(o2);
    }
    if (!isObject(o2)) {
        return false;
    }
    for (const property in o1) {
        const propertyValue1 = o1[property];
        const propertyValue2 = o2[property];
        if (!equals(propertyValue1, propertyValue2, ordered)) {
            return false;
        }
    }
    return true;
}

// =========================================================================
// generic clone
// =========================================================================
export function clone<T>(obj: T): T {
    if (isList(obj)) {
        return _cloneList(obj as Array<unknown>) as T;
    }
    if (isObject(obj)) {
        return _cloneObject(obj);
    }
    return obj;
}

export function _cloneList<E>(list: Array<E>): Array<E> {
    const cloned = [];
    for (let i = 0; i < list.length; ++i) {
        const element = list[i];
        cloned.push(clone(element));
    }
    return cloned;
}

export function _cloneObject<T>(obj: T): T {
    if ((obj as { clone: () => T }).clone) {
        return (obj as { clone: () => T }).clone();
    }
    const cloned = {} as Record<string, unknown>;
    for (const property in obj) {
        const value = obj[property];
        cloned[property] = clone(value);
    }
    return cloned as T;
}

// =========================================================================
// generate id
// =========================================================================
let maxId = 0;
export function generateId(): string {
    return "#" + ++maxId;
}

// =========================================================================
// generate guid
// =========================================================================
export function generateGuid(): string {
    return "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0,
            v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16).toUpperCase();
    });
}

// =========================================================================
// executeSequentialAsync
// =========================================================================
export async function executeSequentialAsync(
    tasks: Array<unknown>,
    caller?: (any) => Promise<unknown>
): Promise<void> {
    if (!tasks) {
        return Promise.resolve();
    }
    const execute = function (index) {
        if (index >= tasks.length) {
            return undefined;
        }
        const task = tasks[index];
        return Promise.resolve()
            .then(function () {
                if (caller) {
                    return caller(task);
                }
                return (task as () => Promise<unknown>)();
            })
            .then(function () {
                return execute(index + 1);
            });
    };
    return execute(0);
}

// =========================================================================
// access deep property in object
// =========================================================================
export function getProperty(obj, path: (string | number)[]) {
    let result = obj;
    for (const pathPart of path) {
        result = result[pathPart];
        if (typeof result === "undefined") {
            return undefined;
        }
    }
    return result;
}

export function isBrowserEnv(): boolean {
    return typeof window !== "undefined";
}
