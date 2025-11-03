declare module "sap/esh/search/ui/sinaNexTS/providers/tools/cds/CDSAnnotationsParser" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { SinaObject, SinaObjectProperties } from "sap/esh/search/ui/sinaNexTS/sina/SinaObject";
    import { DataSource } from "sap/esh/search/ui/sinaNexTS/sina/DataSource";
    import { AttributeGroupTextArrangement } from "sap/esh/search/ui/sinaNexTS/sina/AttributeGroupTextArrangement";
    import { AttributeGroupMetadata } from "sap/esh/search/ui/sinaNexTS/sina/AttributeGroupMetadata";
    interface CDSAnnotations {
        dataSourceAnnotations: {
            UI?: {
                TEXTARRANGEMENT?: string;
                HEADERINFO?: {
                    TITLE?: {
                        TYPE?: string;
                        VALUE?: string;
                        VALUEQUALIFIER?: string;
                        URL?: string;
                    };
                    DESCRIPTION?: {
                        TYPE?: string;
                        VALUE?: string;
                        VALUEQUALIFIER?: string;
                    };
                    IMAGEURL?: string;
                };
            };
        };
        attributeAnnotations: Record<string, {
            UI?: {
                IDENTIFICATION?: {
                    TYPE?: string;
                    POSITION?: number;
                    ICONURL?: string;
                };
                CONNECTEDFIELDS?: {
                    QUALIFIER?: string;
                    GROUPLABEL?: string;
                    TEMPLATE?: string;
                    NAME?: string;
                };
                MULTILINETEXT?: string;
            };
            SEMANTICS?: {
                CONTACT?: {
                    PHOTO?: string;
                };
                IMAGEURL?: string;
                NAME?: {
                    GIVENNAME?: string;
                    FAMILYNAME?: string;
                };
                EMAIL?: {
                    ADDRESS?: string;
                };
                TELEPHONE?: {
                    TYPE?: string;
                };
                URL?: string;
                CURRENCYCODE?: string;
                UNITOFMEASURE?: string;
                QUANTITY?: {
                    UNITOFMEASURE?: string;
                };
                AMOUNT?: {
                    CURRENCYCODE?: string;
                };
            };
            OBJECTMODEL?: {
                TEXT?: {
                    ELEMENT?: string;
                };
            };
        }>;
    }
    interface CDSAnnotationsParserOptions extends SinaObjectProperties {
        dataSource: DataSource;
        cdsAnnotations: CDSAnnotations;
    }
    class CDSAnnotationsParser extends SinaObject {
        private _datasource;
        private _cdsAnnotations;
        private _parsedAttributes;
        private _knownAttributeGroups;
        private _knownAttributeGroupsArray;
        private _attributeGroupReplacements;
        private _AttributeUsagePrio;
        private _detailUsageStubsMap;
        private _detailUsageStubsPrioHigh;
        private _detailUsageStubsPrioMedium;
        private _detailUsageStubsPrioNone;
        private _defaultTextArrangement;
        private _parsingResult;
        private log;
        constructor(properties: CDSAnnotationsParserOptions);
        parseCDSAnnotationsForDataSource(): {
            dataSourceIsCdsBased: boolean;
            detailAttributesAreSorted: boolean;
            titleAttributesAreSorted: boolean;
        };
        _addDetailUsageStub(attribute: any, displayOrder: any, prio: any): void;
        _getDetailUsageStub(attribute: any): any;
        _setParsedAttribute(attributeName: any, attribute: any): void;
        _getParsedAttribute(attributeName: any): any;
        _setknownAttributeGroup(qualifier: any, attributeGroup: any): void;
        _getknownAttributeGroup(qualifier: any): any;
        _parseDefaultTextArrangement(): void;
        _parseDataSourceAnnotations(): void;
        _parseAttributeAnnotations(): void;
        _parseSingleAttribute(attributeId: any): any;
        _parseConnectedFields(attribute: any, connectedFields: any): void;
        _createAttributeGroup(qualifier: any, label: any, template: any, attributesMap: any, displayAttributes?: any): AttributeGroupMetadata;
        _parseIdentification(attribute: any, identification: any): void;
        _parseIconUrlAttributeName(attribute: any, identification: any): void;
        _parseAttributePositions(attribute: any, identification: any): void;
        _parseURLsForDocumentResultItemThumbnail(attribute: any, identification: any, semantics: any): void;
        _parseSemantics(attribute: any, semantics: any): void;
        _parseDescriptionAttribute(attribute: any, objectModel: any, ui: any): void;
        _deriveTextArrangementFromCdsAnnotation(cdsTextArrangement: any): AttributeGroupTextArrangement;
        _createAttributeGroupForParentChildAttributes(parentAttribute: any, childAttribute: any, qualifierSuffix: any, template: any, displayAttributes?: any): AttributeGroupMetadata;
        _replaceAttributeWithGroup(attribute: any, attributeGroupReplacement: any): void;
        _sortAttributes(): void;
        _parseSingleAnnotationOrArray(attribute: any, annotation: any, parseFunction: any): void;
        _parsePosition(position: any): any;
        _getPropertyFromObject(object: any, propertyName: any): any;
    }
}
//# sourceMappingURL=CDSAnnotationsParser.d.ts.map