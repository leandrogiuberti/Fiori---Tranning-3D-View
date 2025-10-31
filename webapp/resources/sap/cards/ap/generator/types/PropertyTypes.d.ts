/// <reference types="openui5" />
declare module "sap/cards/ap/generator/types/PropertyTypes" {
    /*!
     * SAP UI development toolkit for HTML5 (SAPUI5)
     *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
     */
    import { ValueState } from "sap/ui/core/library";
    type Property = {
        label?: string;
        type: string;
        name: string;
        labelWithValue?: string;
        "sap:label"?: string;
        propertyKeyForId?: string;
    };
    type NavigationParameter = {
        name: string;
        value?: string[];
        properties?: Property[];
    };
    type NavigationalData = {
        name: string;
        value: Property[];
    };
    type NavigationParameters = {
        parameters: NavigationParameter[];
    };
    type ObjectCardGroups = {
        title: string;
        items: Array<GroupItem>;
    };
    type GroupItem = {
        label: string;
        value: string;
        isEnabled: boolean;
        name: string;
        navigationProperty?: string;
        isNavigationEnabled?: boolean;
        navigationalProperties?: Property[];
    };
    type UnitOfMeasures = {
        propertyKeyForDescription: string;
        name: string;
        propertyKeyForId: string;
        value: string;
        valueState: ValueState;
        valueStateText: string;
        isNavigationForId?: boolean;
        navigationKeyForId?: string;
        isNavigationForDescription?: boolean;
        navigationKeyForDescription?: string;
        navigationalPropertiesForId?: Property[];
        navigationValueState?: ValueState;
        navigationalValueStateText?: string;
    };
    type NavigationProperty = {
        name: string;
        value: Property[];
    };
}
//# sourceMappingURL=PropertyTypes.d.ts.map