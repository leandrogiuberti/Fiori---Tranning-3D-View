declare module "sap/esh/search/ui/sinaNexTS/sina/HierarchyNode" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { SinaObject, SinaObjectProperties } from "sap/esh/search/ui/sinaNexTS/sina/SinaObject";
    interface HierarchyNodeProperties extends SinaObjectProperties {
        id: string;
        label?: string;
        count?: number;
        hasChildren?: boolean;
        icon?: string;
        isFirst?: boolean;
        isLast?: boolean;
    }
    class HierarchyNode extends SinaObject {
        id: string;
        label: string;
        count: number;
        hasChildren: boolean;
        icon?: string;
        isFirst?: boolean;
        isLast?: boolean;
        parentNode: HierarchyNode;
        childNodes: HierarchyNode[];
        childNodeMap: {
            [id: string]: HierarchyNode;
        };
        constructor(properties: HierarchyNodeProperties);
        equals(other: HierarchyNode): boolean;
        addChildNode(child: HierarchyNode): void;
    }
}
//# sourceMappingURL=HierarchyNode.d.ts.map