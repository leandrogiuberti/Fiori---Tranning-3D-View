declare module "sap/esh/search/ui/sinaNexTS/providers/hana_odata/MetadataParserXML" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { AjaxClient as Client } from "sap/esh/search/ui/sinaNexTS/core/AjaxClient";
    import { EntitySet, ServerMetadataMap, MetadataParser } from "sap/esh/search/ui/sinaNexTS/providers/hana_odata/MetadataParser";
    import { Provider } from "sap/esh/search/ui/sinaNexTS/providers/hana_odata/Provider";
    import { type DOMWindow } from "jsdom";
    global {
        interface Window {
            $: JQueryStatic;
        }
    }
    interface JSDOMWindowWithJQuery extends DOMWindow {
        $: JQueryStatic;
    }
    interface HelperMap {
        [key: string]: EntitySet;
    }
    /**
     * MetadataParser for XML odata metadata of HANAs esh_search() procedure
     * See https://pages.github.tools.sap/hana-enterprise-search/hana-search-documentation/2024_QRC1/esh/metadata_call/
     */
    class MetadataParserXML extends MetadataParser {
        private jsDOMWindow;
        constructor(provider: Provider);
        private _getWindow;
        fireRequest(client: Client, url: string): Promise<string>;
        parseResponse(metaXML: string): Promise<ServerMetadataMap>;
        private _parseEntityType;
        private _getValueFromElement;
        private _parseEntityContainer;
    }
}
//# sourceMappingURL=MetadataParserXML.d.ts.map