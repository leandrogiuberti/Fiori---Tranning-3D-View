declare module "sap/esh/search/ui/sinaNexTS/sina/formatters/ResultValueFormatter" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { Formatter } from "sap/esh/search/ui/sinaNexTS/sina/formatters/Formatter";
    import { Sina } from "sap/esh/search/ui/sinaNexTS/sina/Sina";
    import { ResultSet } from "sap/esh/search/ui/sinaNexTS/sina/ResultSet";
    import { SearchResultSet } from "sap/esh/search/ui/sinaNexTS/sina/SearchResultSet";
    import { SearchResultSetItem } from "sap/esh/search/ui/sinaNexTS/sina/SearchResultSetItem";
    interface NumberFormat {
        getIntegerInstance(): IntergerInstance;
        getFloatInstance(): FloatInstance;
    }
    interface IntergerInstance {
        format(number: any): string;
    }
    interface FloatInstance {
        format(number: any): string;
    }
    interface DateFormat {
        getDateTimeInstance(): DateTimeInstance;
        getDateInstance(object: any): DateInstance;
        getTimeInstance(object: any): TimeInstance;
    }
    interface DateTimeInstance {
        format(Date: any): string;
    }
    interface DateInstance {
        format(Date: any): string;
    }
    interface TimeInstance {
        format(Date: any): string;
    }
    class ResultValueFormatter extends Formatter {
        sina: Sina;
        ui5NumberFormat?: NumberFormat;
        ui5DateFormat?: DateFormat;
        private log;
        constructor(properties?: {
            ui5NumberFormat?: NumberFormat;
            ui5DateFormat?: DateFormat;
        });
        initAsync(): Promise<void>;
        format(resultSet: SearchResultSet): SearchResultSet;
        formatAsync(resultSet: SearchResultSet): Promise<ResultSet>;
        private _formatItemsInUI5Form;
        _formatItemInUI5Form(item: SearchResultSetItem): void;
        private formatAttribute;
        private formatSingleAttribute;
        private formatValue;
        private formatValueByUI5;
        private formatValueByPlainJS;
    }
}
//# sourceMappingURL=ResultValueFormatter.d.ts.map