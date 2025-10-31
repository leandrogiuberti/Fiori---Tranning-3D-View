declare module "sap/esh/search/ui/sinaNexTS/sina/NavigationTarget" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { SinaObject, SinaObjectProperties } from "sap/esh/search/ui/sinaNexTS/sina/SinaObject";
    import { SearchResultSetItem } from "sap/esh/search/ui/sinaNexTS/sina/SearchResultSetItem";
    import { SearchResultSet } from "sap/esh/search/ui/sinaNexTS/sina/SearchResultSet";
    import { SearchResultSetItemAttribute } from "sap/esh/search/ui/sinaNexTS/sina/SearchResultSetItemAttribute";
    import { ObjectSuggestion } from "sap/esh/search/ui/sinaNexTS/sina/ObjectSuggestion";
    interface NavigationTargetJson {
        targetUrl: string;
        text: string;
        icon: string;
        tooltip: string;
        target: string;
    }
    type NavigationTracker = (navigationTarget: NavigationTarget) => void;
    interface NavigationTargetOptions extends SinaObjectProperties {
        targetUrl?: string;
        targetFunction?: (context?: unknown) => void;
        targetFunctionCustomData?: unknown;
        customWindowOpenFunction?: () => void;
        text?: string;
        icon?: string;
        tooltip?: string;
        target?: string;
    }
    class NavigationTarget extends SinaObject {
        targetUrl?: string;
        targetFunction?: (context?: unknown) => void;
        targetFunctionCustomData?: unknown;
        customWindowOpenFunction?: () => void;
        text?: string;
        icon?: string;
        tooltip?: string;
        target?: string;
        parent?: SearchResultSetItemAttribute | SearchResultSetItem | SearchResultSet | ObjectSuggestion;
        constructor(properties: NavigationTargetOptions);
        trackNavigation(): void;
        performNavigation(params?: {
            trackingOnly?: boolean;
            event?: unknown;
        }): void;
        isEqualTo(otherNavigationObject: NavigationTarget): boolean;
        toJson(): NavigationTargetJson;
    }
}
//# sourceMappingURL=NavigationTarget.d.ts.map