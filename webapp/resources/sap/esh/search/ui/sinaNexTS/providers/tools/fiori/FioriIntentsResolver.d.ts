declare module "sap/esh/search/ui/sinaNexTS/providers/tools/fiori/FioriIntentsResolver" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { SinaObject, SinaObjectProperties } from "sap/esh/search/ui/sinaNexTS/sina/SinaObject";
    import { NavigationTarget } from "sap/esh/search/ui/sinaNexTS/sina/NavigationTarget";
    type ResolverResult = {
        defaultNavigationTarget?: NavigationTarget;
        navigationTargets?: Array<NavigationTarget>;
    } | undefined;
    type FioriIntentsResolverOptions = SinaObjectProperties;
    class FioriIntentsResolver extends SinaObject {
        private _fioriFrontendSystemInfo;
        private _primaryIntentAction;
        private _suppressInSearchTag;
        private log;
        constructor(properties: SinaObjectProperties);
        resolveIntents(vArgs: any | any[]): Promise<ResolverResult | Array<ResolverResult>>;
        private doResolveIntents;
        private isPrimaryIntentAction;
        private assembleSapSystem;
        private convertSemanticObjectTypeAttrs;
        private getPrimaryIntent;
        private getSecondaryIntents;
        private shallIntentBeSuppressed;
        private getNavigationTargetForIntent;
        private convertAttributeValueToUI5DataTypeFormats;
        private addLeadingZeros;
        private convertJQueryDeferredToPromise;
    }
}
//# sourceMappingURL=FioriIntentsResolver.d.ts.map