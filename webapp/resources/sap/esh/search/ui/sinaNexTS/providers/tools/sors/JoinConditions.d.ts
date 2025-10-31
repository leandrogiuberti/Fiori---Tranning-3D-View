declare module "sap/esh/search/ui/sinaNexTS/providers/tools/sors/JoinConditions" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { NavigationTargetTemplate } from "sap/esh/search/ui/sinaNexTS/providers/tools/sors/NavigationTargetTemplate";
    import { SinaObject } from "sap/esh/search/ui/sinaNexTS/sina/SinaObject";
    import { NavigationTargetGenerator } from "sap/esh/search/ui/sinaNexTS/providers/tools/sors/NavigationTargetGenerator";
    class JoinConditions extends SinaObject {
        navigationTargetGenerator: NavigationTargetGenerator;
        sourceObjectType: string;
        targetObjectType: string;
        conditions: any[];
        constructor(properties: any);
        add(condition: any): void;
        hasDuplicateSemanticObject(): boolean;
        hasDistinctValue(semanticObjectType: any, property: any): boolean;
        generateNavigationTargetTemplates(): any[];
        createSingleConditionsTemplates(): any[];
        createMultipleConditionsTemplates(): NavigationTargetTemplate[];
        assembleSingleConditionTemplateLabels(navigationTargets: any): void;
    }
}
//# sourceMappingURL=JoinConditions.d.ts.map