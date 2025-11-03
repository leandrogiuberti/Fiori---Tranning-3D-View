declare module "sap/esh/search/ui/sinaNexTS/providers/hana_odata/MetadataParser" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { Log } from "sap/esh/search/ui/sinaNexTS/core/Log";
    import { AjaxClient as Client } from "sap/esh/search/ui/sinaNexTS/core/AjaxClient";
    import { HANAOdataMetadataResponse, Provider } from "sap/esh/search/ui/sinaNexTS/providers/hana_odata/Provider";
    import { Sina } from "sap/esh/search/ui/sinaNexTS/sina/Sina";
    import { DataSource } from "sap/esh/search/ui/sinaNexTS/sina/DataSource";
    import { HANAOdataSearchResponseResult } from "sap/esh/search/ui/sinaNexTS/providers/hana_odata/Provider";
    import { HierarchyDefinition } from "sap/esh/search/ui/sinaNexTS/providers/hana_odata/HierarchyMetadataParser";
    enum AccessUsageConversionMap {
        "AUTO_FACET",
        "SUGGESTION"
    }
    enum PresentationUsageConversionMap {
        "TITLE",
        "SUMMARY",
        "DETAIL",
        "IMAGE",
        "THUMBNAIL",
        "HIDDEN"
    }
    interface Attribute {
        isFilteringAttribute: boolean;
        labelRaw: string;
        label: string;
        type: string;
        presentationUsage: string[];
        isFacet: boolean;
        facetPosition: number;
        facetIconUrlAttributeName: string;
        isSortable: boolean;
        supportsTextSearch: boolean;
        displayOrder: number;
        annotationsAttr: any;
        unknownAnnotation: unknown[];
        hierarchyDefinition: Map<string, HierarchyDefinition>;
        isKey: boolean;
    }
    interface EntitySet {
        schema: string;
        keys: string[];
        attributeMap: Map<string, Attribute>;
        resourceBundle?: string;
        labelResourceBundle?: string;
        label: string;
        labelPlural: string;
        annotations: Record<string, object>;
        hierarchyDefinitionsMap: object;
        icon: string;
        name: string;
        dataSource: DataSource;
    }
    interface ServerMetadataMap {
        businessObjectMap: Map<string, unknown>;
        businessObjectList: unknown[];
        dataSourceMap: Map<string, DataSource>;
        dataSourcesList: DataSource[];
    }
    abstract class MetadataParser {
        log: Log;
        provider: Provider;
        presentationUsageConversionMap: PresentationUsageConversionMap;
        accessUsageConversionMap: AccessUsageConversionMap;
        sina: Sina;
        constructor(provider: Provider);
        abstract fireRequest(client: Client, url: string): Promise<unknown>;
        abstract parseResponse(metaXML: unknown): Promise<ServerMetadataMap>;
        protected _setAnnotationValue(annotations: object, annotationName: string, value: any): void;
        fillMetadataBuffer(dataSource: DataSource, attributes: EntitySet): void;
        fillPublicMetadataBuffer(dataSource: DataSource, attributeMetadata: HANAOdataMetadataResponse, cdsAnnotations: any): void;
        private _parseMatchingStrategy;
        private _parseAttributeTypeAndFormat;
        private _parseUsage;
        parseDynamicMetadata(searchResult: HANAOdataSearchResponseResult): void;
        parseDynamicAttributeMetadata(dataSource: DataSource, attributeId: string, dynamicAttributeMetadata: any): void;
        getUniqueDataSourceFromSearchResult(searchResult: any): DataSource;
    }
}
//# sourceMappingURL=MetadataParser.d.ts.map