declare module "sap/esh/search/ui/sinaNexTS/providers/tools/util" {
    import { ResultSet } from "sap/esh/search/ui/sinaNexTS/sina/ResultSet";
    type Fetcher<ResponseType> = () => Promise<ResponseType>;
    type Parser<ResultSetType extends ResultSet, ResponseType> = (response: ResponseType) => Promise<ResultSetType>;
    function handleError<ResultSetType extends ResultSet, ResponseDataType>(fetcher: Fetcher<ResponseDataType>, parser: Parser<ResultSetType, ResponseDataType>): Promise<ResultSetType>;
}
//# sourceMappingURL=util.d.ts.map