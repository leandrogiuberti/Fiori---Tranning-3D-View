/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
export interface AttributeUsageType {
    AdvancedSearch?: AttributeUsageTypeProperties;
    Facet?: AttributeUsageTypeProperties;
    Title?: AttributeUsageTypeProperties;
    TitleDescription?: AttributeUsageTypeProperties;
    Detail?: AttributeUsageTypeProperties;
    Navigation?: {
        mainNavigation: boolean;
    };
}

export interface AttributeUsageTypeProperties {
    displayOrder?: number;
    iconUrlAttributeName?: string;
}
