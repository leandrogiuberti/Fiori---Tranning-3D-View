declare module "sap/esh/search/ui/sinaNexTS/sina/formatters/Formatter" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { ChartResultSet } from "sap/esh/search/ui/sinaNexTS/sina/ChartResultSet";
    import { DataSource } from "sap/esh/search/ui/sinaNexTS/sina/DataSource";
    import { ResultSet } from "sap/esh/search/ui/sinaNexTS/sina/ResultSet";
    /**
     * A Formatter allows as sina developer to format a resultset (searchresultset, suggestionresultset) or
     * to format datasource metadata through a special object which has a format()/formatAsync() method.
     * This allows to change visible result data before it is displayed in the search UI.
     */
    abstract class Formatter {
        constructor();
        abstract initAsync(): Promise<void>;
        /**
         *
         * @deprecated use formatAsync() instead
         */
        abstract format(obj: {
            dataSources: DataSource[];
        } | ResultSet): DataSource[] | ResultSet;
        abstract formatAsync(obj: {
            dataSources: DataSource[];
        } | ResultSet): Promise<DataSource[] | ResultSet>;
    }
    abstract class ChartResultSetFormatter extends Formatter {
        abstract formatAsync(chartResultSet: ChartResultSet): Promise<ChartResultSet>;
    }
}
//# sourceMappingURL=Formatter.d.ts.map