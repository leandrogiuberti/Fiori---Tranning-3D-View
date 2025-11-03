/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { SinaObject, SinaObjectProperties } from "./SinaObject";
import { Log } from "../core/Log";
import * as core from "../core/core";
import { Query } from "./Query";
import { ResultSetItem } from "./ResultSetItem";

export interface ResultSetOptions extends SinaObjectProperties {
    id?: string;
    title: string;
    items?: Array<ResultSetItem>;
    query: Query;
    log?: Log;
}
export class ResultSet extends SinaObject {
    // _meta: {
    //     properties: {
    //         id: {
    //             required: false,
    //             default: function () {
    //                 return core.generateId();
    //             }
    //         },
    //         title: {
    //             required: true
    //         },
    //         items: {
    //             required: false,
    //             default: function () {
    //                 return [];
    //             },
    //             aggregation: true
    //         },
    //         query: {
    //             required: true
    //         },
    //         log: {
    //             required: false,
    //             default: function () {
    //                 return new Log();
    //             }
    //         }
    //     }
    // },

    id: string = core.generateId();
    title: string;
    items: Array<ResultSetItem> = [];
    query: Query;
    log: Log = new Log();
    errors: Array<Error> = [];

    constructor(properties: ResultSetOptions) {
        super(properties);
        this.id = properties.id ?? this.id;
        this.title = properties.title ?? this.title;
        this.setItems(properties.items || []);
        this.query = properties.query ?? this.query;
        this.log = properties.log ?? this.log;
    }

    setItems(items: Array<ResultSetItem>): ResultSet {
        if (!Array.isArray(items) || items.length < 1) {
            return this;
        }
        this.items = [];
        for (let i = 0; i < items?.length; i++) {
            const item = items[i] as ResultSetItem;
            item.parent = this;
            this.items.push(item);
        }
        return this;
    }

    toString(): string {
        const result = [];
        for (let i = 0; i < this.items.length; ++i) {
            const item = this.items[i];
            result.push(i + ". " + item.toString());
        }
        if (this.items.length === 0) {
            result.push("No results found");
        }
        return result.join("\n");
    }

    public hasErrors(): boolean {
        return this.errors.length > 0;
    }

    public getErrors(): Array<Error> {
        return this.errors;
    }

    public addError(error: Error) {
        this.errors.push(error);
    }

    public addErrors(errors: Array<Error>) {
        this.errors.push(...errors);
    }
}
