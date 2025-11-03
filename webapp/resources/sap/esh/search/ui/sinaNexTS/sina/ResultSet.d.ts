declare module "sap/esh/search/ui/sinaNexTS/sina/ResultSet" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { SinaObject, SinaObjectProperties } from "sap/esh/search/ui/sinaNexTS/sina/SinaObject";
    import { Log } from "sap/esh/search/ui/sinaNexTS/core/Log";
    import { Query } from "sap/esh/search/ui/sinaNexTS/sina/Query";
    import { ResultSetItem } from "sap/esh/search/ui/sinaNexTS/sina/ResultSetItem";
    interface ResultSetOptions extends SinaObjectProperties {
        id?: string;
        title: string;
        items?: Array<ResultSetItem>;
        query: Query;
        log?: Log;
    }
    class ResultSet extends SinaObject {
        id: string;
        title: string;
        items: Array<ResultSetItem>;
        query: Query;
        log: Log;
        errors: Array<Error>;
        constructor(properties: ResultSetOptions);
        setItems(items: Array<ResultSetItem>): ResultSet;
        toString(): string;
        hasErrors(): boolean;
        getErrors(): Array<Error>;
        addError(error: Error): void;
        addErrors(errors: Array<Error>): void;
    }
}
//# sourceMappingURL=ResultSet.d.ts.map