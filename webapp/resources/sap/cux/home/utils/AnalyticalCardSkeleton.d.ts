declare module "sap/cux/home/utils/AnalyticalCardSkeleton" {
    /*!
     * SAP UI development toolkit for HTML5 (SAPUI5)
     *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
     */
    const AnalyticalCardSkeleton: {
        _version: string;
        "sap.app": {
            id: string;
            type: string;
            title: string;
            subTitle: string;
            applicationVersion: {
                version: string;
            };
            shortTitle: string;
            info: string;
            description: string;
            tags: {
                keywords: string[];
            };
        };
        "sap.card": {
            type: string;
            header: {
                title: string;
                subTitle: string;
            };
            content: {
                data: {
                    request: {
                        url: string;
                        method: string;
                        parameters: {
                            $format: string;
                        };
                    };
                    path: string;
                };
                item: {
                    title: string;
                    description: string;
                    attributesOrientationType: string;
                    attributes: {
                        value: string;
                    }[];
                };
                maxItems: number;
            };
        };
    };
}
//# sourceMappingURL=AnalyticalCardSkeleton.d.ts.map