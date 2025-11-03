declare module "sap/esh/search/ui/sinaNexTS/sina/HierarchyNodePath" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { HierarchyNode } from "sap/esh/search/ui/sinaNexTS/sina/HierarchyNode";
    import { SinaObject, SinaObjectProperties } from "sap/esh/search/ui/sinaNexTS/sina/SinaObject";
    interface HierarchyNodePathProperties extends SinaObjectProperties {
        name: string;
        path: Array<HierarchyNode>;
    }
    class HierarchyNodePath extends SinaObject {
        name: string;
        path: Array<HierarchyNode>;
        constructor(properties: HierarchyNodePathProperties);
    }
}
//# sourceMappingURL=HierarchyNodePath.d.ts.map