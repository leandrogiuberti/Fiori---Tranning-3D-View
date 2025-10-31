declare module "sap/esh/search/ui/sinaNexTS/providers/tools/fiori/NavigationServiceFactory" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    interface NavigationService {
        getPrimaryIntent: (a: unknown, b: unknown) => unknown;
        getLinks: (a: unknown) => unknown;
        hrefForExternalAsync: (a: unknown) => unknown;
        trackNavigation: (a: unknown) => unknown;
        toExternal: (a: unknown) => unknown;
    }
    let navigationServicePromise: Promise<NavigationService>;
    function getNavigationService(): Promise<NavigationService>;
}
//# sourceMappingURL=NavigationServiceFactory.d.ts.map