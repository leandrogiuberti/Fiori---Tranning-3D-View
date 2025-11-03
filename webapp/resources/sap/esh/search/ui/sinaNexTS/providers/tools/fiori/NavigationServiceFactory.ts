/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
export interface NavigationService {
    getPrimaryIntent: (a: unknown, b: unknown) => unknown;
    getLinks: (a: unknown) => unknown;
    hrefForExternalAsync: (a: unknown) => unknown;
    trackNavigation: (a: unknown) => unknown;
    toExternal: (a: unknown) => unknown;
}

let navigationServicePromise: Promise<NavigationService>;

export function getNavigationService(): Promise<NavigationService> {
    if (navigationServicePromise) {
        return navigationServicePromise;
    }
    const getServiceAsync =
        typeof window !== "undefined" ? window?.sap?.ushell?.["Container"]?.["getServiceAsync"] : null; // not available for sina on node.js
    if (getServiceAsync) {
        navigationServicePromise = getServiceAsync("CrossApplicationNavigation");
    } else {
        navigationServicePromise = Promise.resolve(undefined);
    }
    return navigationServicePromise;
}
