/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
"use strict";

sap.ui.define(["sap/ui/core/Element", "../types/CommonTypes"], function (CoreElement, ___types_CommonTypes) {
  "use strict";

  const ColorIndicator = ___types_CommonTypes["ColorIndicator"];
  /**
   *
   * @param sPropertyValue
   * @returns true if the property value is a binding
   */
  function isBinding(sPropertyValue) {
    return sPropertyValue && sPropertyValue.startsWith("{") && sPropertyValue.endsWith("}");
  }

  /**
   * To determine if the given value is a activation `CriticalityValue`.
   *
   * @param {CriticalityValue | string} value - The value to check.
   * @returns {value is CriticalityValue} True if the value is a `CriticalityValue`, false otherwise.
   */
  function isActiveCalculation(value) {
    return value.activeCalculation === true;
  }

  /**
   * Retrieves the color representation for a given criticality value or string.
   *
   * @param {CriticalityValue | string} criticalityValue - The criticality value or string to evaluate.
   * @returns {string | undefined} The formatted string representing the color, or undefined if the input is not valid.
   */
  function getColorForGroup(criticalityValue) {
    if (criticalityValue) {
      if (isActiveCalculation(criticalityValue)) {
        const staticValues = {
          deviationLow: criticalityValue.deviationRangeLowValue,
          deviationHigh: criticalityValue.deviationRangeHighValue,
          toleranceLow: criticalityValue.toleranceRangeLowValue,
          toleranceHigh: criticalityValue.toleranceRangeHighValue,
          sImprovementDirection: criticalityValue.improvementDirection,
          oCriticalityConfigValues: {
            None: "None",
            Negative: "Error",
            Critical: "Warning",
            Positive: "Success"
          }
        };
        return "{= extension.formatters.formatValueColor(${" + criticalityValue.name + "}," + JSON.stringify(staticValues) + ") }";
      } else if (criticalityValue.includes("extension.formatters.formatCriticality")) {
        return criticalityValue;
      } else if (isBinding(criticalityValue)) {
        return "{= extension.formatters.formatCriticality($" + criticalityValue + ", 'state') }";
      }
      return ColorIndicator[criticalityValue];
    }
  }

  /**
   * Checks if the given property type is a supported date type.
   *
   * @param {string} [propertyType] - The property type to check.
   * @returns {boolean} - Returns true if the property type is a supported date type, otherwise false.
   */
  function checkForDateType(propertyType) {
    if (!propertyType) {
      return false;
    }
    const supportedDateTypes = ["Edm.Date", "Edm.DateTimeOffset", "Edm.DateTime"];
    return supportedDateTypes.includes(propertyType);
  }

  /**
   * Retrieves the card generator dialog using the dialog ID.
   *
   * @returns The card generator dialog.
   */
  function getCardGeneratorDialog() {
    const dialogId = "cardGeneratorDialog--cardGeneratorDialog";
    return CoreElement.getElementById(dialogId);
  }

  /**
   * Retrieves the dialog model for the card generator UI / resources / previewOptions.
   *
   * @param modelName
   * @returns The model for the dialog.
   */
  function getDialogModel(modelName) {
    const dialog = getCardGeneratorDialog();
    if (modelName === "i18n") {
      return dialog?.getModel("i18n");
    }
    return modelName ? dialog?.getModel(modelName) : dialog?.getModel();
  }

  /**
   * The function checks if the property value has a boolean binding expression
   *
   * @param propertyValue
   * @returns
   */
  function hasBooleanBindingExpression(propertyValue = "") {
    const normalizedPath = propertyValue.replace(/\s+/g, "");
    return normalizedPath.includes("===true?");
  }

  /**
   * Extracts the path inside a binding expression without the boolean expression.
   *
   * This function takes a string containing a binding expression in the format `{= ${property} === true ? {{Yes}} : {{No}}}`
   * and extracts the content inside the curly braces.
   *
   * @param path - The string containing the binding expression.
   * @returns The extracted path inside the binding expression, or "" if no match is found.
   */
  function extractValueWithoutBooleanExprBinding(path) {
    const regex = /\${([^}]+)}/; // Matches anything inside ${...} until the closing brace
    const match = regex.exec(path);
    return match?.[1] || "";
  }
  var __exports = {
    __esModule: true
  };
  __exports.isBinding = isBinding;
  __exports.getColorForGroup = getColorForGroup;
  __exports.checkForDateType = checkForDateType;
  __exports.getCardGeneratorDialog = getCardGeneratorDialog;
  __exports.getDialogModel = getDialogModel;
  __exports.hasBooleanBindingExpression = hasBooleanBindingExpression;
  __exports.extractValueWithoutBooleanExprBinding = extractValueWithoutBooleanExprBinding;
  return __exports;
});
//# sourceMappingURL=CommonUtils-dbg-dbg.js.map
