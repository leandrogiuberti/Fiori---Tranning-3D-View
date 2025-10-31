declare module "sap/esh/search/ui/sinaNexTS/sina/formatters/SuggestionResultValueFormatter" {
    import { Sina } from "sap/esh/search/ui/sinaNexTS/sina/Sina";
    import { SuggestionResultSet } from "sap/esh/search/ui/sinaNexTS/sina/SuggestionResultSet";
    import { Formatter } from "sap/esh/search/ui/sinaNexTS/sina/formatters/Formatter";
    import { DateFormat, NumberFormat, ResultValueFormatter } from "sap/esh/search/ui/sinaNexTS/sina/formatters/ResultValueFormatter";
    class SuggestionResultValueFormatter extends Formatter {
        sina: Sina;
        resultValueFormatter: ResultValueFormatter;
        initAsync(): Promise<void>;
        constructor(properties: {
            ui5NumberFormat?: NumberFormat;
            ui5DateFormat?: DateFormat;
        });
        format(resultSet: SuggestionResultSet): SuggestionResultSet;
        formatAsync(resultSet: SuggestionResultSet): Promise<SuggestionResultSet>;
    }
}
//# sourceMappingURL=SuggestionResultValueFormatter.d.ts.map