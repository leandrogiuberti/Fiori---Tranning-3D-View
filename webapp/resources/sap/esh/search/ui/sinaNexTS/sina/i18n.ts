/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
// text resources for sina
// all sina instances share the same resource bundle!

type GetTextFunction = (key: string, args?: Array<string>) => string;

let globalGetTextFunction: GetTextFunction;

export function injectGetText(getTextFunction: GetTextFunction) {
    globalGetTextFunction = getTextFunction;
}

// use this function for accesing text resources in sina
export function getText(key: string, args?: Array<string>) {
    if (globalGetTextFunction) {
        return globalGetTextFunction(key, args);
    } else {
        args = args || [];
        return "no texts available " + key + " " + args.map((arg) => "" + arg).join(":");
    }
}
