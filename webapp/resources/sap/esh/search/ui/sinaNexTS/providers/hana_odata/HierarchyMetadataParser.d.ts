declare module "sap/esh/search/ui/sinaNexTS/providers/hana_odata/HierarchyMetadataParser" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { HierarchyDisplayType } from "sap/esh/search/ui/sinaNexTS/sina/HierarchyDisplayType";
    interface HierarchyDefinition {
        name: string;
        attributeName: string;
        displayType?: HierarchyDisplayType;
        isHierarchyDefinition: boolean;
        parentAttributeName: string;
        childAttributeName: string;
    }
    class HierarchyMetadataParser {
        jQuery: JQueryStatic;
        constructor(jQuery: JQueryStatic);
        parse(entityTypeName: string, hierarchAnnotationNode: Element): {
            [name: string]: HierarchyDefinition;
        };
        parseRecord(entityTypeName: string, recordNode: Element): HierarchyDefinition;
        calculateIsHierarchyDefinition(entityTypeName: string, name: string): boolean;
        parseRecurse(recurseNode: Element): {
            parentAttributeName: string;
            childAttributeName: string;
        };
        parseCollection(collectionNode: Element): string;
    }
}
//# sourceMappingURL=HierarchyMetadataParser.d.ts.map