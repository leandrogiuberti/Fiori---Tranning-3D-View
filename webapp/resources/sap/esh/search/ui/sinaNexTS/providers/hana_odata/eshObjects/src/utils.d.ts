declare module "sap/esh/search/ui/sinaNexTS/providers/hana_odata/eshObjects/src/utils" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    /** Copyright 2019 SAP SE or an SAP affiliate company. All rights reserved. */
    import { Expression, IESSearchOptions, IEsearchRequestInterface } from "sap/esh/search/ui/sinaNexTS/providers/hana_odata/eshObjects/src/definitions";
    enum States {
        Term,
        Phrase
    }
    const createEshSearchQuery: (options?: IESSearchOptions) => IEsearchRequestInterface;
    const getEshSearchQuery: (options?: IESSearchOptions) => string;
    const parseFreeStyleText: (freeStyleText: string) => Expression;
}
//# sourceMappingURL=utils.d.ts.map