declare module "sap/esh/search/ui/sinaNexTS/providers/tools/sors/NavigationTargetTemplate" {
    import { Sina } from "sap/esh/search/ui/sinaNexTS/sina/Sina";
    import { NavigationTargetGenerator } from "sap/esh/search/ui/sinaNexTS/providers/tools/sors/NavigationTargetGenerator";
    class NavigationTargetTemplate {
        sina: Sina;
        navigationTargetGenerator: NavigationTargetGenerator;
        label: string;
        sourceObjectType: unknown;
        targetObjectType: string;
        conditions: any;
        _condition: any;
        constructor(properties: any);
        generate(data: any): import("sap/esh/search/ui/sinaNexTS/sina/NavigationTarget").NavigationTarget;
    }
}
//# sourceMappingURL=NavigationTargetTemplate.d.ts.map