/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
"use strict";

sap.ui.define(["sap/base/Log", "sap/ui/core/Lib", "sap/ui/model/resource/ResourceModel", "sap/ui/thirdparty/jquery", "../utils/CommonUtils"], function (Log, CoreLib, ResourceModel, jQuery, ___utils_CommonUtils) {
  "use strict";

  const hasBooleanBindingExpression = ___utils_CommonUtils["hasBooleanBindingExpression"];
  let i18nMap = {};
  let i18nPayload = [];
  const I18nClassificationsMap = {
    Title: "XTIT:",
    Label: "XFLD:",
    Button: "XBUT:",
    "Group header": "XGRP:"
  };

  /**
   * This function checks if the property value has a binding
   *
   * @param {string} propertyValue
   * @returns {boolean}
   */
  function hasBinding(propertyValue) {
    return propertyValue && propertyValue.startsWith("{");
  }

  /**
   * Function to check if the given data is of type JSON or not
   *
   * @param value
   * @returns
   */
  function isJSONData(value) {
    try {
      return JSON.parse(value) ? true : false;
    } catch (Error) {
      return false;
    }
  }

  /**
   * This function gets the property value from the card manifest/sub-manifest
   * - In case if the property value is an object then return the object
   * - In case if the property value is not an object then return the object and key
   * - Added handling for keys with multiple dots should be passsed as "parameters.[com/sap/property].name"
   *
   * @param {object} obj The  object
   * @param {string} key
   * @returns {object}
   */
  function getPropertyValue(partialManifest, key) {
    if (isJSONData(key)) {
      const updatedKey = JSON.parse(key.replaceAll(/\//g, "."))?.[0];
      key = updatedKey ? updatedKey : key;
    }
    if (key && typeof partialManifest[key] === "object" && key != "mainIndicator") {
      return partialManifest[key];
    }
    return {
      partialManifest,
      key
    };
  }

  /**
   * This function sets i18n values to a map
   *  - In case if it is a new key create a key in map.
   *  - In case if it is an existsinig one update it.
   *
   * @param {string} key
   * @param {string} value
   * @param {string} text
   */
  function seti18nValueToMap(key, value, text) {
    if (!text?.trim().length) {
      delete i18nMap[key];
      return;
    }
    i18nMap[key] = "{{CardGenerator" + value + "}}";
  }

  /**
   * This function updates i18n keys to card manifest
   *
   * @param {object} integrationCardManifest The manifest object
   */
  function inserti18nKeysManifest(integrationCardManifest) {
    for (const i18nKey in i18nMap) {
      const {
        partialManifest,
        key
      } = i18nKey.split(".").reduce(getPropertyValue, integrationCardManifest["sap.card"]);
      if (partialManifest[key]?.number && i18nMap[i18nKey]) {
        partialManifest[key].number = i18nMap[i18nKey];
      } else if (partialManifest?.[key]?.trim().length > 0) {
        partialManifest[key] = i18nMap[i18nKey];
      }
    }
  }

  /**
   * Gets the text classification for given i18n key and value
   *
   * @param {string} keyType Type of key
   * @param {string} comment The comments which needs to be added
   * @returns {string} The text classification string
   */
  function textClassification(keyType, comment) {
    const key = I18nClassificationsMap[keyType] || "";
    return key + " " + comment;
  }

  /**
   * This function sets i18n payload to an array
   *
   * @param {string} text
   * @param {string} key
   * @param {string} type
   * @param {string} description
   * @param {string} groupPath
   */
  function inserti18nPayLoad(text, key, type, description, groupPath) {
    if (text.trim().length === 0) {
      return;
    }
    const payload = {
      comment: textClassification(type, description),
      key: "CardGenerator" + (groupPath ? key + groupPath : key),
      value: text
    };
    i18nPayload.push(payload);
  }

  /**
   * This function will create an ajax call to save i18n payload
   */
  function writei18nPayload() {
    if (i18nPayload.length === 0) {
      return;
    }
    jQuery.ajax({
      type: "POST",
      url: "/editor/i18n",
      headers: {
        "Content-Type": "application/json"
      },
      data: JSON.stringify(i18nPayload),
      success: function () {
        Log.info("i18n was successfully saved.");
      },
      error: function () {
        Log.error("i18n could not be saved.");
      }
    });
  }

  /**
   * This function resets i18nPayload and i18nMap
   *
   */
  function reseti18nProperties() {
    i18nPayload = [];
    i18nMap = {};
  }

  /**
   *
   * Creates i18n keys for the action parameters of an adaptive card action.
   *
   * For each action parameter the label value will be different so i18n key will be created for each action parameter label.
   *
   * @param {number} index - The index of the current action in the adaptive card actions array.
   * @param {string} actionPath - The path to the current action in the configuration parameters.
   * @param {AdaptiveCardAction} [adaptiveCardAction] - The adaptive card action object containing action parameters.
   */
  function createi18nKeysForActionParameters(index, actionPath, adaptiveCardAction) {
    const adaptiveCardActionParameters = adaptiveCardAction?.actionParameters;
    if (adaptiveCardActionParameters?.length) {
      adaptiveCardActionParameters.forEach((actionParameter, idx) => {
        const actionParameterLabel = actionParameter?.label;
        const actionParameterErrorMsg = actionParameter?.errorMessage;
        const actionParameterPlaceholder = actionParameter?.placeholder;
        if (actionParameterLabel) {
          const i18nKeyActionParamLabel = `_AdaptiveCardAction_${index}_ActionParameterLabel_${idx}`;
          const actionParameterDescription = `Label for Action Parameter ${actionParameterLabel} - Created by Card Generator`;
          const actionParameterLabelPath = `configuration.parameters._adaptiveFooterActionParameters.["${actionPath}"].actionParameters.${idx}.label`;
          seti18nValueToMap(actionParameterLabelPath, i18nKeyActionParamLabel, actionParameterLabel);
          inserti18nPayLoad(actionParameterLabel, i18nKeyActionParamLabel, "Label", actionParameterDescription);
        }
        if (actionParameterErrorMsg) {
          const i18nKeyActionParamErrorMsg = `_AdaptiveCardAction_${index}_ActionParameterErrorMsg_${idx}`;
          const actionParameterErrorMsgDescription = `Error message for Action Parameter ${actionParameterLabel} - Created by Card Generator`;
          const actionParameterErrorMsgPath = `configuration.parameters._adaptiveFooterActionParameters.["${actionPath}"].actionParameters.${idx}.errorMessage`;
          seti18nValueToMap(actionParameterErrorMsgPath, i18nKeyActionParamErrorMsg, actionParameterErrorMsg);
          inserti18nPayLoad(actionParameterErrorMsg, i18nKeyActionParamErrorMsg, "Label", actionParameterErrorMsgDescription);
        }
        if (actionParameterPlaceholder) {
          const i18nKeyActionParamPlaceholder = `_AdaptiveCardAction_${index}_ActionParameterPlaceholder_${idx}`;
          const actionParameterPlaceholderDescription = `Placeholder for Action Parameter ${actionParameterLabel} - Created by Card Generator`;
          const actionParameterPlaceholderPath = `configuration.parameters._adaptiveFooterActionParameters.["${actionPath}"].actionParameters.${idx}.placeholder`;
          seti18nValueToMap(actionParameterPlaceholderPath, i18nKeyActionParamPlaceholder, actionParameterPlaceholder);
          inserti18nPayLoad(actionParameterPlaceholder, i18nKeyActionParamPlaceholder, "Label", actionParameterPlaceholderDescription);
        }
      });
    }
  }

  /**
   *
   * Creates i18n keys for card actions based on the card manifest.
   *
   * Takes care of creating i18n key for the action label and the OK button text which will be used when action type is Submit.
   * The action text for Integration card is also replaced with same i18n key that is created for the adaptive card action.
   *
   * @param {CardManifest} cardManifest - The card manifest.
   */
  function createI18nKeysForCardActions(cardManifest) {
    const actionsStrip = cardManifest["sap.card"]?.footer?.actionsStrip;
    const actionPathPrefix = "{{parameters.footerActionParameters.";
    actionsStrip?.forEach((action, index) => {
      let actionPath = action?.actions[0]?.parameters?.replace(actionPathPrefix, "").replace("}}", "") ?? "";
      const adaptiveCardAction = cardManifest["sap.card"]?.configuration?.parameters?._adaptiveFooterActionParameters?.[actionPath];
      if (adaptiveCardAction?.label) {
        actionPath = actionPath.replaceAll(/\./g, "/");
        const adaptiveCardActionDescription = `Label for Action ${adaptiveCardAction?.label} - Created by Card Generator`;
        const i18nKeyCardAction = `_AdaptiveCardActions_${index}_Label`;
        const AdaptiveCardActionTextpath = `configuration.parameters._adaptiveFooterActionParameters.["${actionPath}"].label`;
        action.text = "{{CardGenerator" + i18nKeyCardAction + "}}";
        seti18nValueToMap(AdaptiveCardActionTextpath, i18nKeyCardAction, adaptiveCardAction?.label);
        inserti18nPayLoad(adaptiveCardAction?.label, i18nKeyCardAction, "Label", adaptiveCardActionDescription);
        const i18nKeyOkButton = "_AdaptiveCardActions_OkButton";
        const okButtonDescription = "Label for OK Button - Created by Card Generator";
        const okButtonPath = `configuration.parameters._adaptiveFooterActionParameters.["${actionPath}"].triggerActionText`;
        seti18nValueToMap(okButtonPath, i18nKeyOkButton, adaptiveCardAction?.triggerActionText);
        if (index === 0) {
          inserti18nPayLoad(adaptiveCardAction?.triggerActionText, i18nKeyOkButton, "Button", okButtonDescription);
        }
      }
      createi18nKeysForActionParameters(index, actionPath, adaptiveCardAction);
    });
  }

  /**
   * This function creates i18n keys from modal data
   *  - In case if text does not start with "{" create a key and set key and value to i18n map, also upload the i18n payload to the array.
   *  - In case if it is already a key then no need to create a new key.
   *
   * @param {CardManifest} cardManifest
   */
  function createKeysFromManifestData(cardManifest) {
    const manifestHeader = cardManifest["sap.card"].header;
    const manifestGroup = cardManifest["sap.card"].content.groups;
    const manifestHeaderKeys = Object.keys(manifestHeader);
    manifestHeaderKeys.forEach(propertyType => {
      const propertyTypes = ["title", "subTitle", "unitOfMeasurement", "mainIndicator"];
      if (propertyTypes.includes(propertyType)) {
        const property = propertyType === "mainIndicator" ? manifestHeader[propertyType]?.number : manifestHeader[propertyType];
        if (!hasBinding(property)) {
          const key = `header.${propertyType}`;
          const value = `Header${propertyType[0].toUpperCase() + propertyType.slice(1)}`;
          const description = `${value} for ${property} - Created by Card Generator`;
          seti18nValueToMap(key, value, property);
          inserti18nPayLoad(property, value, "Title", description);
        }
        const i18nPayloadHasYesAndNoText = i18nPayload.some(({
          value
        }) => value === "Yes");
        if (hasBooleanBindingExpression(property) && !i18nPayloadHasYesAndNoText) {
          createKeysForYesOrNoText();
        }
      }
    });
    manifestGroup.forEach((configuration, index) => {
      configuration.items.forEach((configurationItem, idx) => {
        createKeysFromGroup(configurationItem.label, idx, index, "label");
        if (!hasBinding(configurationItem.value)) {
          createKeysFromGroup(configurationItem.value, idx, index, "value");
        }
        const i18nPayloadHasYesAndNoText = i18nPayload.some(({
          value
        }) => value === "Yes");
        if (hasBooleanBindingExpression(configurationItem.value) && !i18nPayloadHasYesAndNoText) {
          createKeysForYesOrNoText();
        }
      });
      const key = "GroupHeader";
      const description = `${key} for ${configuration.title} - Created by Card Generator`;
      const path = `_Groups_${index}`;
      const groupLabelPath = `content.groups.${index}.title`;
      seti18nValueToMap(groupLabelPath, key + path, configuration.title);
      inserti18nPayLoad(configuration.title, key, "Group header", description, path);
    });
    createI18nKeysForCardActions(cardManifest);
  }

  /**
   * This function creates i18n keys from manifest group data
   *  - In case if text does not start with "{" create a key and set key and value to i18n map, also upload the i18n payload to the array.
   *  - In case if it is already a key then no need to create a new key.
   *
   * @param {string} configurationItem
   * @param {number} itemIndex
   * @param {number} groupIndex
   * @param {string} type
   */
  function createKeysFromGroup(configurationItem, itemIndex, groupIndex, type) {
    const groupType = "Label";
    const key = `GroupProperty${groupType}`;
    const description = `${key} for ${configurationItem} - Created by Card Generator`;
    const path = `_Groups_${groupIndex}_Items_${itemIndex}`;
    const itemsPath = `content.groups.${groupIndex}.items.${itemIndex}.${type}`;
    seti18nValueToMap(itemsPath, key + path, configurationItem);
    inserti18nPayLoad(configurationItem, key, groupType, description, path);
  }

  /**
   * Creates i18n keys and payloads for "Yes" and "No" text values.
   *
   * The function ensures that these keys and labels are properly added to the
   * i18n map and payload for further use in the application.
   */
  function createKeysForYesOrNoText() {
    const valueYes = "Value_Yes";
    const valueNo = "Value_No";
    const descriptionYes = "Text for boolean property true - Created by Card Generator";
    const descriptionNo = "Text for boolean property false - Created by Card Generator";
    seti18nValueToMap("yes", valueYes, "Yes");
    inserti18nPayLoad("Yes", valueYes, "Label", descriptionYes);
    seti18nValueToMap("no", valueNo, "No");
    inserti18nPayLoad("No", valueNo, "Label", descriptionNo);
  }
  function updateManifestAppProperties(manifest) {
    const app = manifest["sap.app"];
    const headerInfo = manifest["sap.card"].header;
    if (app.title !== headerInfo.title && headerInfo.title?.startsWith("{{")) {
      app.title = headerInfo.title;
    }
    if (app.subTitle !== headerInfo.subTitle && headerInfo.subTitle?.startsWith("{{")) {
      const UOMExists = headerInfo.unitOfMeasurement ? true : false;
      app.subTitle = UOMExists ? headerInfo.subTitle + " | " + headerInfo.unitOfMeasurement : headerInfo.subTitle;
    }
  }

  /**
   * This function resolves i18n text from resource model
   * - In case if key exists in resource model then return the object from resource model
   * - In case if key does not exist in resource model then return the key
   * @param key
   */
  function resolveI18nTextFromResourceModel(key, resourceModel) {
    if (key.startsWith("{{") && key.endsWith("}}")) {
      return resourceModel.getObject(key.replace("{{", "").replace("}}", ""));
    }
    return key;
  }

  /**
   * Retrieves the localized text values for "Yes" and "No" from the resource bundle.
   *
   * @returns {YesAndNoText} An object containing the localized text values:
   * - `yes`: The localized text for "Yes".
   * - `no`: The localized text for "No".
   */
  function getYesAndNoTextValues() {
    const resourceBundle = CoreLib.getResourceBundleFor("sap.cards.ap.generator.i18n");
    const i18nModel = new ResourceModel({
      bundleUrl: resourceBundle.oUrlInfo.url,
      bundle: resourceBundle
    });
    const yesText = i18nModel.getObject("VALUE_YES");
    const noText = i18nModel.getObject("VALUE_NO");
    return {
      yesText: yesText,
      noText: noText
    };
  }

  /**
   * This function creates i18n keys from card manifest data and stores it in i18n map and i18n payload
   * - Further it will update manifest with i18n keys
   * - and create an ajax call to save i18n payload
   * @param cardManifest
   */
  function createAndStoreGeneratedi18nKeys(cardManifest) {
    createKeysFromManifestData(cardManifest);
    inserti18nKeysManifest(cardManifest);
    updateManifestAppProperties(cardManifest);
    writei18nPayload();
    reseti18nProperties();
  }
  var __exports = {
    __esModule: true
  };
  __exports.resolveI18nTextFromResourceModel = resolveI18nTextFromResourceModel;
  __exports.getYesAndNoTextValues = getYesAndNoTextValues;
  __exports.createAndStoreGeneratedi18nKeys = createAndStoreGeneratedi18nKeys;
  return __exports;
});
//# sourceMappingURL=I18nHelper-dbg-dbg.js.map
