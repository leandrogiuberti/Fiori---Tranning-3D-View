declare module "sap/esh/search/ui/sinaNexTS/providers/sample/ITemplate" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { AttributeMetadata } from "sap/esh/search/ui/sinaNexTS/sina/AttributeMetadata";
    import { SearchResultSetItem } from "sap/esh/search/ui/sinaNexTS/sina/SearchResultSetItem";
    interface ITemplate {
        metadata: Array<AttributeMetadata>;
        metadata2: Array<AttributeMetadata>;
        metadata3?: Array<AttributeMetadata>;
        searchResultSetItemArray: Array<SearchResultSetItem>;
        searchResultSetItemArray2: Array<SearchResultSetItem>;
        searchResultSetItemArray3?: Array<SearchResultSetItem>;
        chartResultSetArray: [];
        getMetadataById: (list: Array<AttributeMetadata>, id: string) => AttributeMetadata;
        _init: (metadataRoot: ITemplate) => void;
    }
}
//# sourceMappingURL=ITemplate.d.ts.map