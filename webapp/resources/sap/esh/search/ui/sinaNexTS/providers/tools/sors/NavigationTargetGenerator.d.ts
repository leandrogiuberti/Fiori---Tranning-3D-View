declare module "sap/esh/search/ui/sinaNexTS/providers/tools/sors/NavigationTargetGenerator" {
    import { SinaObject, SinaObjectProperties } from "sap/esh/search/ui/sinaNexTS/sina/SinaObject";
    interface NavigationTargetGeneratorOptions extends SinaObjectProperties {
        getPropertyMetadata: any;
        urlPrefix: string;
    }
    class NavigationTargetGenerator extends SinaObject {
        active: boolean;
        getPropertyMetadata: any;
        urlPrefix: string;
        navigationTargetTemplatesInitialized: boolean;
        navigationTargetTemplatesMap: Record<string, any>;
        objectTypeMap: Record<string, any>;
        ignoredSemanticObjectTypes: {
            LastChangedByUser: boolean;
            CreationDate: boolean;
            CreatedByUser: boolean;
        };
        constructor(properties: NavigationTargetGeneratorOptions);
        checkActive(): boolean;
        cleanup(): void;
        registerObjectType(objectTypeMetadata: any): void;
        filterSemanticObjectType(property: any): void;
        finishRegistration(): void;
        calculateNavigationTargetTemplates(): void;
        createNavTargetTemplatesFromJoinConditions(joinConditionsMap: any): {};
        collectJoinConditions(): {};
        collectJoinConditionsForObjectType(semanticObjectTypeMap: any, objectType: any): {};
        createIndex(): {};
        createIndexForObjectType(semanticObjectTypeMap: any, objectType: any): void;
        formatItem(item: any): {};
        generateNavigationTargetsForItem(item: any): any[];
        generateNavigationTargets(searchResultSet: any): void;
    }
}
//# sourceMappingURL=NavigationTargetGenerator.d.ts.map