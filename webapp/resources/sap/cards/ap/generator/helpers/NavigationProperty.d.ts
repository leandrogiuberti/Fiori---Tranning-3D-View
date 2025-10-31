/// <reference types="openui5" />
declare module "sap/cards/ap/generator/helpers/NavigationProperty" {
    /*!
     * SAP UI development toolkit for HTML5 (SAPUI5)
     *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
     */
    import Component from "sap/ui/core/Component";
    import V2ODataModel from "sap/ui/model/odata/v2/ODataModel";
    import V4ODataModel from "sap/ui/model/odata/v4/ODataModel";
    import type { ArrangementOptions } from "sap/cards/ap/generator/app/controls/ArrangementsEditor";
    import type { GroupItem, NavigationParameter, Property } from "sap/cards/ap/generator/types/PropertyTypes";
    type Model = V2ODataModel | V4ODataModel;
    /**
     * Fetches the navigation properties with label for a single Navigation property
     * @param rootComponent
     * @param navigationProperty - Name of the navigation property
     * @param path
     */
    function getNavigationPropertiesWithLabel(rootComponent: Component, navigationProperty: string, path: string): Promise<{
        propertiesWithLabel: Property[];
        navigationPropertyData: any;
    }>;
    /**
     * Updates the navigation properties with the provided labels.
     *
     * @param {NavigationParameter[]} navigationProperties - The array of navigation parameters to be updated.
     * @param {string} navigationEntityName - The name of the navigation entity to be updated.
     * @param {Property[]} propertiesWithLabel - The array of properties with labels to update the navigation entity with.
     */
    function updateNavigationPropertiesWithLabel(navigationProperties: NavigationParameter[], navigationEntityName: string, propertiesWithLabel: Property[]): void;
    const getNavigationPropertyInfo: (textArrangement: ArrangementOptions, navigationProperty: NavigationParameter[], path: string) => Promise<any[]>;
    const getNavigationPropertyInfoGroups: (item: GroupItem, navigationProperty: NavigationParameter[], path: string, cardManifest: Record<string, unknown>) => Promise<{
        navigationEntitySet: string;
        navigationPropertyData: any;
    }>;
}
//# sourceMappingURL=NavigationProperty.d.ts.map