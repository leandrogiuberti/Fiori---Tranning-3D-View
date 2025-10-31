/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
type ConstructorFunction = new (...args: unknown[]) => unknown;

export interface CloneClassConfig {
    class: ConstructorFunction;
    properties?: Array<string>;
    useOriginalObject?: boolean; // use original instance (do not clone)
    cloneFunction?: (obj: unknown) => unknown; // custom function to implement cloning an object (needed to clone functions which internally need non-cloned properties)
}
export interface CloneConfig {
    classes: Array<CloneClassConfig>;
}

enum Type {
    Primitive = "Primitive",
    List = "List",
    Object = "Object",
}

interface CloneBufferEntry {
    object: unknown;
    clonedObject: unknown;
}

class CloneBuffer {
    cloneBuffer: Array<CloneBufferEntry>;
    constructor() {
        this.cloneBuffer = [];
    }
    put(object: unknown, clonedObject: unknown) {
        this.cloneBuffer.push({ object: object, clonedObject: clonedObject });
    }
    get(object: unknown) {
        const cloneBufferEntry = this.cloneBuffer.find((bufferEntry) => bufferEntry.object === object);
        if (!cloneBufferEntry) {
            return undefined;
        }
        return cloneBufferEntry.clonedObject;
    }
}

export class CloneService {
    config: CloneConfig;
    classConfigCache: CloneClassConfig;
    buffer: CloneBuffer;
    constructor(config?: CloneConfig) {
        this.config = config ?? { classes: [] };
    }
    getType(obj: unknown): Type {
        if (
            typeof obj === "string" ||
            typeof obj === "number" ||
            typeof obj === "boolean" ||
            typeof obj === "function" ||
            typeof obj === "undefined"
        ) {
            return Type.Primitive;
        }
        if (typeof obj == "object") {
            if (Array.isArray(obj)) {
                return Type.List;
            } else {
                return Type.Object;
            }
        }
        throw `Program error: Clone utitliy does not support type ${typeof obj}`;
    }
    clone(obj: unknown) {
        this.buffer = new CloneBuffer();
        return this.internalClone(obj);
    }
    internalClone(obj: unknown) {
        switch (this.getType(obj)) {
            case Type.List:
                return this.cloneList(obj as Array<unknown>);
            case Type.Object:
                return this.cloneObject(obj as { [key: string]: unknown });
            case Type.Primitive:
                return this.clonePrimitive(obj);
        }
    }
    cloneList(obj: Array<unknown>): Array<unknown> {
        // check buffer for list
        let clonedList = this.buffer.get(obj) as Array<unknown>;
        if (clonedList) {
            return clonedList;
        }
        // create new list
        clonedList = [];
        this.buffer.put(obj, clonedList);
        // clone list entries
        for (const element of obj) {
            if (!this.isCloneableObject(element)) {
                continue;
            }
            clonedList.push(this.internalClone(element));
        }
        return clonedList;
    }
    cloneObject(obj: { [key: string]: unknown }): unknown {
        // check buffer for object
        let clonedObj = this.buffer.get(obj);
        if (clonedObj) {
            return clonedObj;
        }
        const classConfig = this.getClassConfig(obj);
        // use custome clone function
        if (classConfig?.cloneFunction) {
            return classConfig.cloneFunction(obj);
        }
        // use original object (do not clone, use object as it is)
        if (classConfig?.useOriginalObject) {
            return obj;
        }

        // create new object
        clonedObj = {};
        this.buffer.put(obj, clonedObj);
        // clone object properties
        for (const property in obj) {
            if (!this.isCloneableProperty(obj, property)) {
                continue;
            }
            clonedObj[property] = this.internalClone(obj[property]);
        }
        return clonedObj;
    }
    clonePrimitive(obj: unknown): unknown {
        return obj;
    }
    getClassConfig(obj: unknown): CloneClassConfig {
        if (this.classConfigCache && obj instanceof this.classConfigCache.class) {
            return this.classConfigCache;
        }
        this.classConfigCache = this.config.classes.find((classConfig) => obj instanceof classConfig.class);
        return this.classConfigCache;
    }
    isCloneableObject(obj: unknown): boolean {
        if (obj?.constructor === Object) {
            return true; // plain objects
        }
        const classConfig = this.getClassConfig(obj);
        if (!classConfig) {
            return false;
        }
        return true;
    }
    isCloneableProperty(obj: unknown, property: string): boolean {
        if (obj?.constructor === Object) {
            return true; // plain objects
        }
        const classConfig = this.getClassConfig(obj);
        if (!classConfig) {
            return false;
        }
        return classConfig.properties.indexOf(property) >= 0;
    }
}
