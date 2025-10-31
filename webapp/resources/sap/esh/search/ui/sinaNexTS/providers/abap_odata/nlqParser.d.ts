declare module "sap/esh/search/ui/sinaNexTS/providers/abap_odata/nlqParser" {
    import { NlqResult } from "sap/esh/search/ui/sinaNexTS/sina/NlqResult";
    import { Sina } from "sap/esh/search/ui/sinaNexTS/sina/Sina";
    import { ABAPOdataSearchResponseDataSourceNlqInfo } from "sap/esh/search/ui/sinaNexTS/providers/abap_odata/Provider";
    function parseNlqInfo(sina: Sina, nlqInfos: Array<ABAPOdataSearchResponseDataSourceNlqInfo>): NlqResult;
}
//# sourceMappingURL=nlqParser.d.ts.map