declare module "sap/esh/search/ui/sinaNexTS/providers/inav2/MetadataParser" {
    import { AttributeFormatType } from "sap/esh/search/ui/sinaNexTS/sina/AttributeFormatType";
    import { AttributeType } from "sap/esh/search/ui/sinaNexTS/sina/AttributeType";
    import { AttributeUsageType } from "sap/esh/search/ui/sinaNexTS/sina/AttributeUsageType";
    import { DataSource } from "sap/esh/search/ui/sinaNexTS/sina/DataSource";
    import { MatchingStrategy } from "sap/esh/search/ui/sinaNexTS/sina/MatchingStrategy";
    import { Sina } from "sap/esh/search/ui/sinaNexTS/sina/Sina";
    import { Provider } from "sap/esh/search/ui/sinaNexTS/providers/inav2/Provider";
    class MetadataParser {
        provider: Provider;
        sina: Sina;
        constructor(provider: any);
        normalizeAttributeMetadata(attributeMetadata: any): void;
        parseRequestAttributes(dataSource: any, data: any): void;
        parseResponseAttributes(dataSource: any, data: any): void;
        parseMetadataRequestMetadata(dataSource: any, data: any): void;
        parseSearchRequestMetadata(itemData: any): void;
        fillPublicMetadataBuffer(dataSource: DataSource): void;
        calculateAttributeDisplayOrder(dataSource: any, itemData: any): void;
        _parseIsSortable(attributeMetadata: any): any;
        _parseMatchingStrategy(attributeMetadata: any): MatchingStrategy;
        _parseUsage(attributeMetadata: any): AttributeUsageType;
        _parseAttributeTypeAndFormat(attributeMetadata: any): {
            type: AttributeType;
            format?: undefined;
        } | {
            type: AttributeType;
            format: AttributeFormatType;
        };
    }
}
//# sourceMappingURL=MetadataParser.d.ts.map