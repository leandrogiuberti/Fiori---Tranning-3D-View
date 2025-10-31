declare module "sap/esh/search/ui/sinaNexTS/sina/formatters/NavtargetsInResultSetFormatter" {
    import { ResultSet } from "sap/esh/search/ui/sinaNexTS/sina/ResultSet";
    import { SearchResultSet } from "sap/esh/search/ui/sinaNexTS/sina/SearchResultSet";
    import { Formatter } from "sap/esh/search/ui/sinaNexTS/sina/formatters/Formatter";
    class NavtargetsInResultSetFormatter extends Formatter {
        initAsync(): Promise<void>;
        format(resultSet: ResultSet): ResultSet;
        formatAsync(resultSet: SearchResultSet): Promise<SearchResultSet>;
    }
}
//# sourceMappingURL=NavtargetsInResultSetFormatter.d.ts.map