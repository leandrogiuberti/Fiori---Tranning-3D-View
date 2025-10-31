/// <reference types="openui5" />
declare module "sap/cards/ap/generator/utils/CommonUtils" {
    /*!
     * SAP UI development toolkit for HTML5 (SAPUI5)
     *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
     */
    import CoreElement from "sap/ui/core/Element";
    import type JSONModel from "sap/ui/model/json/JSONModel";
    import type ResourceModel from "sap/ui/model/resource/ResourceModel";
    import { CriticalityValue } from "sap/cards/ap/generator/types/CommonTypes";
    /**
     *
     * @param sPropertyValue
     * @returns true if the property value is a binding
     */
    function isBinding(sPropertyValue: string): boolean;
    /**
     * To determine if the given value is a activation `CriticalityValue`.
     *
     * @param {CriticalityValue | string} value - The value to check.
     * @returns {value is CriticalityValue} True if the value is a `CriticalityValue`, false otherwise.
     */
    function isActiveCalculation(value: CriticalityValue | string): value is CriticalityValue;
    /**
     * Retrieves the color representation for a given criticality value or string.
     *
     * @param {CriticalityValue | string} criticalityValue - The criticality value or string to evaluate.
     * @returns {string | undefined} The formatted string representing the color, or undefined if the input is not valid.
     */
    function getColorForGroup(criticalityValue: CriticalityValue | string): string | undefined;
    /**
     * Checks if the given property type is a supported date type.
     *
     * @param {string} [propertyType] - The property type to check.
     * @returns {boolean} - Returns true if the property type is a supported date type, otherwise false.
     */
    function checkForDateType(propertyType?: string): boolean;
    /**
     * Retrieves the card generator dialog using the dialog ID.
     *
     * @returns The card generator dialog.
     */
    function getCardGeneratorDialog(): CoreElement;
    /**
     * Retrieves the dialog model for the card generator UI / resources / previewOptions.
     *
     * @param modelName
     * @returns The model for the dialog.
     */
    function getDialogModel(modelName?: string): ResourceModel | JSONModel;
    /**
     * The function checks if the property value has a boolean binding expression
     *
     * @param propertyValue
     * @returns
     */
    function hasBooleanBindingExpression(propertyValue?: string): boolean;
    /**
     * Extracts the path inside a binding expression without the boolean expression.
     *
     * This function takes a string containing a binding expression in the format `{= ${property} === true ? {{Yes}} : {{No}}}`
     * and extracts the content inside the curly braces.
     *
     * @param path - The string containing the binding expression.
     * @returns The extracted path inside the binding expression, or "" if no match is found.
     */
    function extractValueWithoutBooleanExprBinding(path: string): string;
}
//# sourceMappingURL=CommonUtils.d.ts.map