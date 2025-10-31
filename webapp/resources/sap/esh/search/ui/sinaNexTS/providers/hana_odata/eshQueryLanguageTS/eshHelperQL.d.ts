declare module "sap/esh/search/ui/sinaNexTS/providers/hana_odata/eshQueryLanguageTS/eshHelperQL" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { IESSearchOptions } from "../eshObjects/src/index";
    interface ParametersType {
        $apply?: string;
        $orderby?: string;
        [key: string]: string;
    }
    function createEshSearchQueryUrl(options?: IESSearchOptions): string;
}
//# sourceMappingURL=eshHelperQL.d.ts.map