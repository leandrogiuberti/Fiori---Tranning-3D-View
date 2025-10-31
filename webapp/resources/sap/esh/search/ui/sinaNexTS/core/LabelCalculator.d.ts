declare module "sap/esh/search/ui/sinaNexTS/core/LabelCalculator" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { SinaError } from "sap/esh/search/ui/sinaNexTS/core/errors";
    class DuplicateException extends SinaError {
        node: Node;
        constructor(properties: {
            message?: string;
            node: Node;
        });
    }
    /**
     * Creates unique labels for system data sources.
     *
     * examples:
     * datasource     system client    --> calculated label
     * Purchase Order CER    002           Purchase Order
     * Sales Order    CER    002           Sales Order
    
     * datasource     system client    --> calculated label         include system to make label unique
     * Purchase Order CER    002           Purchase Order CER
     * Purchase Order CES    003           Purchase Order CES
    
     * datasource     system client    --> calculated label        include system and client to make label unique
     * Purchase Order CES    002           Purchase Order CES 002
     * Purchase Order CES    003           Purchase Order CES 003
    
     * datasource     system client    --> calculated label
     * Purchase Order CER    002           Purchase Order duplicate ...
     * Purchase Order CER    002           Purchase Order duplicate ...
     */
    class Node {
        data: {
            label: string;
            labelPlural: string;
        };
        obj: unknown;
        parent: Node;
        nodeId: string;
        labelCalculator: LabelCalculator;
        childMap: {
            [key: string]: Node;
        };
        children: Array<Node>;
        constructor(parent: Node, nodeId: string, labelCalculator: LabelCalculator);
        insert(keyPath: Array<string>, obj: unknown): void;
        recalculateLabels(): void;
        collectLeafs(leafs: any): void;
        isLeaf(): boolean;
        hasSibling(): boolean;
        isChildOfRoot(): boolean;
        collectPath(keyPath: Array<string>, force?: boolean): void;
        calculateLabel(): void;
    }
    class LabelCalculator {
        options: {
            data: (objToBeLabeled: unknown) => {
                label: string;
                labelPlural: string;
            };
            key: (objToBeLabeled: unknown) => Array<string>;
            setFallbackLabel: (objToBeLabeled: any, data: any) => void;
            setLabel: (objToBeLabeled: any, keyPath: any, data: any) => void;
        };
        rootNode: Node;
        constructor(options: any);
        calculateLabel(obj: unknown): void;
    }
}
//# sourceMappingURL=LabelCalculator.d.ts.map