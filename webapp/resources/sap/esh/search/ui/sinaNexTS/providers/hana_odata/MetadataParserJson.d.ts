declare module "sap/esh/search/ui/sinaNexTS/providers/hana_odata/MetadataParserJson" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { AjaxClient as Client } from "sap/esh/search/ui/sinaNexTS/core/AjaxClient";
    import { ServerMetadataMap, MetadataParser } from "sap/esh/search/ui/sinaNexTS/providers/hana_odata/MetadataParser";
    class MetadataParserJson extends MetadataParser {
        constructor(provider: any);
        fireRequest(client: Client, url: string): Promise<any>;
        parseResponse(metaJson: any): Promise<ServerMetadataMap>;
        _parseEntityType(schemaNameSpace: string, schemaObject: any, entityContainerName: any, entityContainerObject: any): {};
        private _parseEntityTypeAnnotations;
        private _parseAttribute;
        private _parseAttributeAnnotations;
        private _normalizeAnnotationValueOfArrayOrObject;
        private _normalizeAnnotationValueOfObject;
        private _getValueFromArrayWithSingleEntry;
        _parseEntityContainer(entityContainerObject: any, helperMap: any, allInOneMap: any): void;
    }
}
//# sourceMappingURL=MetadataParserJson.d.ts.map