/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
"use strict";

sap.ui.define(["./AdaptiveCard", "./UI5Card"], function (___AdaptiveCard, ___UI5Card) {
  "use strict";

  const AdaptiveCard = ___AdaptiveCard["AdaptiveCard"];
  const UI5Card = ___UI5Card["UI5Card"];
  var GenerateSemanticCard = /*#__PURE__*/function (GenerateSemanticCard) {
    GenerateSemanticCard["Always"] = "always";
    GenerateSemanticCard["Lean"] = "lean";
    return GenerateSemanticCard;
  }(GenerateSemanticCard || {});
  /**
   * Factory function to create appropriate semantic card instances.
   *
   * @param appComponent - The SAP UI5 application component
   * @param fetchOptions - Configuration options for card generation
   * @returns A BaseCard instance configured for the specified card type
   * @throws Error if appComponent is not provided or invalid cardType is specified
   *
   */
  const createSemanticCardFactory = function (appComponent, fetchOptions = {}) {
    const {
      cardType = "integration"
    } = fetchOptions;
    switch (cardType) {
      case "integration":
        return new UI5Card(appComponent);
      case "adaptive":
        return new AdaptiveCard(appComponent);
      default:
        throw new Error(`Unsupported card type: ${String(cardType)}. Supported types: "integration", "adaptive"`);
    }
  };
  var __exports = {
    __esModule: true
  };
  __exports.GenerateSemanticCard = GenerateSemanticCard;
  __exports.createSemanticCardFactory = createSemanticCardFactory;
  return __exports;
});
//# sourceMappingURL=CardFactory-dbg-dbg.js.map
