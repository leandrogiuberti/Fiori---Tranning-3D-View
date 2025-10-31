declare module "sap/cards/ap/generator/config/PreviewOptions" {
    /*!
     * SAP UI development toolkit for HTML5 (SAPUI5)
     *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
     */
    interface Host {
        key: string;
        text: string;
        type: "integration" | "adaptive" | "custom";
        height?: string;
        width?: string;
        hostConfig?: string;
    }
    const PREVIEW_OPTIONS: {
        hosts: ({
            key: string;
            text: string;
            height: string;
            width: string;
            type: string;
            hostConfig?: undefined;
        } | {
            key: string;
            text: string;
            type: string;
            hostConfig: string;
            height?: undefined;
            width?: undefined;
        })[];
    };
}
//# sourceMappingURL=PreviewOptions.d.ts.map