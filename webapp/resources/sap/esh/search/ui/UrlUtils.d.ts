declare module "sap/esh/search/ui/UrlUtils" {
    import SearchModel from "sap/esh/search/ui/SearchModel";
    import { OrderBy } from "sap/esh/search/ui/SearchModelTypes";
    import { Filter } from "sap/esh/search/ui/sinaNexTS/sina/Filter";
    function renderUrlFromParameters(model: SearchModel, top: number, filter: Filter, encodeFilter: boolean, orderBy?: OrderBy): string;
}
//# sourceMappingURL=UrlUtils.d.ts.map