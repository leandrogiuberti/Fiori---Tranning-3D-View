/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
"use strict";

sap.ui.define([], function () {
  "use strict";

  /**
   *  Resolves i18n text for a given key.
   *
   *  @param {string} i18nKey  having unresolved i18n keys
   *  @param {ResourceBundle} resourceBundle - The resource bundle containing i18n values.
   *  @return {string} - The resolved i18n text.
   */
  const resolvei18nText = function (i18nKey, resourceBundle) {
    if (i18nKey.startsWith("{{") && i18nKey.endsWith("}}")) {
      const key = i18nKey.slice(2, -2); // Remove the leading "{{" and trailing "}}"
      return resourceBundle.getText(key) || key;
    }
    return i18nKey;
  };

  /**
   * Updates groups with resolved i18n texts.
   *
   * @param {Array<Group>} groups - The groups to update.
   * @param {ResourceBundle} resourceBundle - The resource bundle containing i18n values.
   */
  const updateGroups = function (groups, resourceBundle) {
    groups.forEach(function (group) {
      const {
        title
      } = group;
      group.title = resolvei18nText(title, resourceBundle);
      group.items.forEach(function (item) {
        const {
          label,
          value
        } = item;
        item.label = resolvei18nText(label, resourceBundle);
        item.value = resolvei18nText(value, resourceBundle);
      });
    });
  };

  /**
   * Resolves i18n texts for card actions in a sap.card object using the provided resource bundle.
   *
   * @param {CardManifest["sap.card"]} sapCard - The sap.card object containing the card configuration.
   * @param {ResourceBundle} resourceBundle - The resource bundle used to resolve i18n texts.
   */
  const resolvei18nTextsForCardAction = function (sapCard, resourceBundle) {
    const actionsStrip = sapCard?.footer?.actionsStrip;
    if (actionsStrip?.length) {
      actionsStrip.forEach(function (actionStrip) {
        actionStrip.text = resolvei18nText(actionStrip.text, resourceBundle);
      });
    }
    const adaptiveCardActions = sapCard?.configuration?.parameters?._adaptiveFooterActionParameters;
    if (!adaptiveCardActions) {
      return;
    }
    const actionKeys = Object.keys(adaptiveCardActions);
    for (const actionKey of actionKeys) {
      const adaptiveCardAction = adaptiveCardActions[actionKey];
      adaptiveCardAction.label = resolvei18nText(adaptiveCardAction.label, resourceBundle);
      if (adaptiveCardAction?.triggerActionText) {
        adaptiveCardAction.triggerActionText = resolvei18nText(adaptiveCardAction.triggerActionText, resourceBundle);
      }
      if (adaptiveCardAction?.actionParameters?.length) {
        adaptiveCardAction.actionParameters.forEach(function (actionParameter) {
          actionParameter.label = resolvei18nText(actionParameter.label, resourceBundle);
          if (actionParameter.placeholder) {
            actionParameter.placeholder = resolvei18nText(actionParameter.placeholder, resourceBundle);
          }
          if (actionParameter.errorMessage) {
            actionParameter.errorMessage = resolvei18nText(actionParameter.errorMessage, resourceBundle);
          }
        });
      }
    }
  };

  /**
   * Resolves i18n texts for an integration card manifest.
   *
   * @param {CardManifest} cardManifest - The manifest with unresolved i18n keys.
   * @param {ResourceBundle} resourceBundle - The resource bundle containing i18n values.
   * @return {CardManifest} - The updated manifest with resolved i18n keys.
   */
  const resolvei18nTextsForIntegrationCard = function (cardManifest, resourceBundle) {
    const {
      "sap.app": sapApp,
      "sap.card": sapCard
    } = cardManifest;
    const {
      title: appTitle,
      subTitle: appSubTitle
    } = sapApp;
    const {
      header
    } = sapCard;
    const {
      title: headerTitle,
      subTitle: headerSubTitle,
      mainIndicator
    } = header;
    const groups = sapCard.content.groups;
    resolvei18nTextsForParameters(sapCard.configuration?.parameters, ["_yesText", "_noText"], resourceBundle);
    sapApp.title = resolvei18nText(appTitle, resourceBundle);
    sapApp.subTitle = appSubTitle.includes(" | ") ? appSubTitle.split(" | ").map((part, index) => index === 0 ? resolvei18nText(part, resourceBundle) : part).join(" | ") : resolvei18nText(appSubTitle, resourceBundle);
    header.title = resolvei18nText(headerTitle, resourceBundle);
    header.subTitle = resolvei18nText(headerSubTitle, resourceBundle);
    if (mainIndicator) {
      const {
        unit,
        number
      } = mainIndicator;
      if (unit) {
        mainIndicator.unit = resolvei18nText(unit, resourceBundle);
      }
      if (number) {
        mainIndicator.number = resolvei18nText(number, resourceBundle);
      }
    }
    updateGroups(groups, resourceBundle);
    resolvei18nTextsForCardAction(sapCard, resourceBundle);
    return cardManifest;
  };

  /**
   * Resolves internationalized (i18n) text values for the specified parameters.
   *
   * @param {CardConfigParameters} - An object containing configuration parameters where each parameter
   * may have a `value` property that could be an i18n key.
   * @param {string[]} - An array of keys corresponding to the properties of the `parameters` object
   * that need their `value` properties resolved.
   * @param {ResourceBundle} - The resource bundle used to resolve i18n text values.
   */
  const resolvei18nTextsForParameters = function (parameters, keys, resourceBundle) {
    keys.forEach(key => {
      const configParam = parameters?.[key];
      if (configParam?.value) {
        configParam.value = resolvei18nText(configParam.value, resourceBundle);
      }
    });
  };
  var __exports = {
    __esModule: true
  };
  __exports.resolvei18nTextsForIntegrationCard = resolvei18nTextsForIntegrationCard;
  return __exports;
});
//# sourceMappingURL=I18nHelper-dbg-dbg.js.map
