declare module "sap/esh/search/ui/sinaNexTS/providers/abap_odata/MetadataParser" {
    import { SinaObject } from "sap/esh/search/ui/sinaNexTS/sina/SinaObject";
    import { Provider } from "sap/esh/search/ui/sinaNexTS/providers/abap_odata/Provider";
    import { MatchingStrategy } from "sap/esh/search/ui/sinaNexTS/sina/MatchingStrategy";
    import { AttributeType } from "sap/esh/search/ui/sinaNexTS/sina/AttributeType";
    import { AttributeFormatType } from "sap/esh/search/ui/sinaNexTS/sina/AttributeFormatType";
    import { DataSource } from "sap/esh/search/ui/sinaNexTS/sina/DataSource";
    import { AttributeMetadata } from "sap/esh/search/ui/sinaNexTS/sina/AttributeMetadata";
    import { AttributeUsageType } from "sap/esh/search/ui/sinaNexTS/sina/AttributeUsageType";
    import { HANAOdataMetadataResponse } from "sap/esh/search/ui/sinaNexTS/providers/hana_odata/Provider";
    class MetadataParser extends SinaObject {
        private _provider;
        private _sina;
        private _labelCalculator;
        private _appSearchDataSource?;
        private log;
        constructor(provider: Provider);
        getAppSearchDataSource(): DataSource;
        parseDataSourceData(dataSourcesData: any, sorsNavigationTargetGenerator: any): void;
        _fillMetadataBufferForDataSource(dataSource: DataSource, attributes: any): void;
        _fillMetadataBufferForAttribute(dataSource: DataSource, attributeMetadata: HANAOdataMetadataResponse): AttributeMetadata;
        _parseSemanticsAnnotation(rawAttributeMetadata: any, attributeAnnotations: any): void;
        _sortAttributesOfNonCDSBasedDataSource(dataSource: any, titleAttributes: any, detailAttributes: any, detailAttributesPrio1: any, detailAttributesPrio2: any): void;
        _arrayIncludesEntry(array: any, entry: any, compareFunction: any): boolean;
        _parseAnnotationsIntoJsonStructure(annotations: any): {};
        _createSortFunction(usagePropery: any): (a1: any, a2: any) => 0 | 1 | -1;
        _parseMatchingStrategy(attributeMetadata: any): MatchingStrategy;
        _parseAttributeTypeAndFormat(attributeMetadata: any): {
            type: AttributeType;
            format?: undefined;
        } | {
            type: AttributeType;
            format: AttributeFormatType;
        };
        _parseUsage(attributeMetadata: any, displayOrderIndex: any): AttributeUsageType;
        parseDynamicMetadata(searchResult: any): void;
        parseDynamicAtributeMetadata(dataSource: DataSource, dynamicAttributeMetadata: any): void;
    }
}
//# sourceMappingURL=MetadataParser.d.ts.map