declare module "sap/cards/ap/generator/types/ActionTypes" {
    /*!
     * SAP UI development toolkit for HTML5 (SAPUI5)
     *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
     */
    type ControlProperties = {
        title: string;
        titleKey: string;
        style?: string;
        enablePathKey?: string;
        isStyleControlEnabled?: boolean;
        isConfirmationRequired?: boolean;
        triggerActionText?: string;
    };
    type AnnotationAction = {
        label: string;
        action: string;
        enablePath: string;
        isConfirmationRequired: boolean;
    };
    type ActionStyles = {
        name: string;
        label: string;
        labelWithValue: string;
    };
    type EnableProperty = {
        label: string;
        value: string;
        name?: string;
        labelWithValue?: string;
    };
    type CriticalAction = {
        Bool: string;
    };
    type ActionAnnotation = {
        "@com.sap.vocabularies.UI.v1.Critical": CriticalAction;
        "@Org.OData.Core.V1.OperationAvailable": {
            $Path: string;
            Bool: string;
        };
    };
    interface ValueListParameter {
        LocalDataProperty: {
            $PropertyPath: string;
        };
        ValueListProperty: {
            String: string;
        };
        RecordType: string;
    }
    type FunctionImportParameter = {
        "com.sap.vocabularies.Common.v1.FieldControl"?: {
            EnumMember: string;
        };
        "sap:label"?: string;
        "sap:value-list"?: string;
        nullable?: string;
        name: string;
        mode: string;
        "com.sap.vocabularies.Common.v1.Label"?: string;
        "com.sap.vocabularies.Common.v1.ValueList"?: {
            Parameters: Array<ValueListParameter>;
            CollectionPath?: {
                String?: string;
            };
        };
        "com.sap.vocabularies.UI.v1.TextArrangement"?: {
            EnumMember: string;
        };
    };
    type FunctionImport = {
        parameter: Array<FunctionImportParameter>;
        "sap:applicable-path"?: string;
        "com.sap.vocabularies.Common.v1.IsActionCritical"?: CriticalAction;
        "sap:action-for"?: string;
        "sap:label"?: string;
    };
    type Property = {
        "com.sap.vocabularies.Common.v1.Label"?: string;
        name: string;
    };
    type ParametersInfoV2 = {
        parameterData: {
            [key: string]: Array<object>;
        };
        additionalParameters: Array<FunctionImportParameter>;
    };
}
//# sourceMappingURL=ActionTypes.d.ts.map