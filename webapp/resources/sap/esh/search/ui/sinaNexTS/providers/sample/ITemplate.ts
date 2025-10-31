/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { AttributeMetadata } from "../../sina/AttributeMetadata";
import { SearchResultSetItem } from "../../sina/SearchResultSetItem";

export interface ITemplate {
    // folklorists
    metadata: Array<AttributeMetadata>;
    // urban legends
    metadata2: Array<AttributeMetadata>;
    // publications
    metadata3?: Array<AttributeMetadata>;
    searchResultSetItemArray: Array<SearchResultSetItem>;
    searchResultSetItemArray2: Array<SearchResultSetItem>;
    searchResultSetItemArray3?: Array<SearchResultSetItem>;
    chartResultSetArray: [];
    getMetadataById: (list: Array<AttributeMetadata>, id: string) => AttributeMetadata;
    _init: (metadataRoot: ITemplate) => void;
}
