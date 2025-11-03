declare module "sap/esh/search/ui/sinaNexTS/core/clone" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    type ConstructorFunction = new (...args: unknown[]) => unknown;
    interface CloneClassConfig {
        class: ConstructorFunction;
        properties?: Array<string>;
        useOriginalObject?: boolean;
        cloneFunction?: (obj: unknown) => unknown;
    }
    interface CloneConfig {
        classes: Array<CloneClassConfig>;
    }
    enum Type {
        Primitive = "Primitive",
        List = "List",
        Object = "Object"
    }
    interface CloneBufferEntry {
        object: unknown;
        clonedObject: unknown;
    }
    class CloneBuffer {
        cloneBuffer: Array<CloneBufferEntry>;
        constructor();
        put(object: unknown, clonedObject: unknown): void;
        get(object: unknown): unknown;
    }
    class CloneService {
        config: CloneConfig;
        classConfigCache: CloneClassConfig;
        buffer: CloneBuffer;
        constructor(config?: CloneConfig);
        getType(obj: unknown): Type;
        clone(obj: unknown): unknown;
        internalClone(obj: unknown): unknown;
        cloneList(obj: Array<unknown>): Array<unknown>;
        cloneObject(obj: {
            [key: string]: unknown;
        }): unknown;
        clonePrimitive(obj: unknown): unknown;
        getClassConfig(obj: unknown): CloneClassConfig;
        isCloneableObject(obj: unknown): boolean;
        isCloneableProperty(obj: unknown, property: string): boolean;
    }
}
//# sourceMappingURL=clone.d.ts.map