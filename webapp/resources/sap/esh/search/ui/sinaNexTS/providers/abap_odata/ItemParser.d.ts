declare module "sap/esh/search/ui/sinaNexTS/providers/abap_odata/ItemParser" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { SinaObject } from "sap/esh/search/ui/sinaNexTS/sina/SinaObject";
    import { SuvNavTargetResolver } from "sap/esh/search/ui/sinaNexTS/providers/tools/fiori/SuvNavTargetResolver";
    import { Provider, OdataEDMType } from "sap/esh/search/ui/sinaNexTS/providers/abap_odata/Provider";
    import { SearchQuery } from "sap/esh/search/ui/sinaNexTS/sina/SearchQuery";
    import { SearchResultSetItem } from "sap/esh/search/ui/sinaNexTS/sina/SearchResultSetItem";
    interface ABAPOdataSearchResponse {
        DataSourceId: string;
        Attributes: {
            results: Array<AttributesResult>;
        };
        HitAttributes: {
            results: Array<HitAttributesResult>;
        };
        Score: string;
    }
    interface AttributesResult {
        Boosted: boolean;
        Id: string;
        Name: string;
        Snippet: string;
        Value: string;
        ValueFormatted: string;
    }
    interface HitAttributesResult {
        EDMType: OdataEDMType | "";
        Id: string;
        Name: string;
        Snippet: string;
    }
    class ItemParser extends SinaObject {
        provider: Provider;
        suvNavTargetResolver: SuvNavTargetResolver;
        constructor(provider: Provider);
        parse(searchQuery: SearchQuery, data: any): Promise<Array<SearchResultSetItem>>;
        parseItems(itemsData: Array<ABAPOdataSearchResponse>): Promise<Array<SearchResultSetItem>>;
        parseItem(itemData: ABAPOdataSearchResponse): Promise<SearchResultSetItem>;
        _isVisible(metadata: any): boolean;
        _isInTamplate(id: any, group: any): boolean;
        _getNameInGroup(id: string, attributesInGroup: any): string | undefined;
        private _pushAdditionalWhyFounds;
        _isUngrouppedDetailAttribute(id: string, ungrouppedDetailAttributes: Array<any>): boolean;
    }
}
//# sourceMappingURL=ItemParser.d.ts.map