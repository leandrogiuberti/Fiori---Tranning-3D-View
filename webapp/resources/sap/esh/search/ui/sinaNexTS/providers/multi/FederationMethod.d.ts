declare module "sap/esh/search/ui/sinaNexTS/providers/multi/FederationMethod" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { SearchResultSetItem } from "sap/esh/search/ui/sinaNexTS/sina/SearchResultSetItem";
    interface IFederationMethod {
        sort: (resultSetItemList: Array<SearchResultSetItem>) => Array<SearchResultSetItem>;
    }
    class Ranking implements IFederationMethod {
        sort(resultSetItemList: any): any[];
    }
    class RoundRobin implements IFederationMethod {
        sort(resultSetItemList: any): any[];
        mergeMultiResults(firstResults: any, secondResults: any, mergeIndex: any): any;
    }
    class AdvancedRoundRobin implements IFederationMethod {
        sort(resultSetItemList: any): any[];
    }
}
//# sourceMappingURL=FederationMethod.d.ts.map