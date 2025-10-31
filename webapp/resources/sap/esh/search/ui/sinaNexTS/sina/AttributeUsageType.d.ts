declare module "sap/esh/search/ui/sinaNexTS/sina/AttributeUsageType" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    interface AttributeUsageType {
        AdvancedSearch?: AttributeUsageTypeProperties;
        Facet?: AttributeUsageTypeProperties;
        Title?: AttributeUsageTypeProperties;
        TitleDescription?: AttributeUsageTypeProperties;
        Detail?: AttributeUsageTypeProperties;
        Navigation?: {
            mainNavigation: boolean;
        };
    }
    interface AttributeUsageTypeProperties {
        displayOrder?: number;
        iconUrlAttributeName?: string;
    }
}
//# sourceMappingURL=AttributeUsageType.d.ts.map