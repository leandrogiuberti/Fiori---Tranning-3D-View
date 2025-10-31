declare module "sap/esh/search/ui/sinaNexTS/providers/tools/fiori/SuvNavTargetResolver" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { SinaObject, SinaObjectProperties } from "sap/esh/search/ui/sinaNexTS/sina/SinaObject";
    const getTheme: () => any;
    const addThemeToURL: (url: any) => any;
    interface SuvAttribute {
        suvTargetUrlAttribute: any;
        suvTargetMimeTypeAttribute: any;
        suvThumbnailAttribute: any;
    }
    type SuvNavTargetResolverOptions = SinaObjectProperties;
    class SuvNavTargetResolver extends SinaObject {
        suvMimeType: string;
        suvViewerBasePath: string;
        constructor(properties: SuvNavTargetResolverOptions);
        addHighlightTermsToUrl(url: string, highlightTerms?: any): string;
        resolveSuvNavTargets(dataSource: any, suvAttributes: {
            [key: string]: SuvAttribute;
        }, suvHighlightTerms: any): void;
    }
}
//# sourceMappingURL=SuvNavTargetResolver.d.ts.map