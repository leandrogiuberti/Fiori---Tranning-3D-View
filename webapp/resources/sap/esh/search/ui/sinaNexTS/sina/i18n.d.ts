declare module "sap/esh/search/ui/sinaNexTS/sina/i18n" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    type GetTextFunction = (key: string, args?: Array<string>) => string;
    let globalGetTextFunction: GetTextFunction;
    function injectGetText(getTextFunction: GetTextFunction): void;
    function getText(key: string, args?: Array<string>): string;
}
//# sourceMappingURL=i18n.d.ts.map