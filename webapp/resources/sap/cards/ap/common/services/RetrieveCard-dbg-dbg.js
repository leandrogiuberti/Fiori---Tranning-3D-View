/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
"use strict";

sap.ui.define(["sap/cards/ap/transpiler/cardTranspiler/Transpile", "sap/fe/navigation/SelectionVariant", "../helpers/ApplicationInfo", "../helpers/I18nHelper", "../odata/ODataUtils", "../semanticCard/CardFactory"], function (sap_cards_ap_transpiler_cardTranspiler_Transpile, SelectionVariant, ___helpers_ApplicationInfo, ___helpers_I18nHelper, ___odata_ODataUtils, ___semanticCard_CardFactory) {
  "use strict";

  function _catch(body, recover) {
    try {
      var result = body();
    } catch (e) {
      return recover(e);
    }
    if (result && result.then) {
      return result.then(void 0, recover);
    }
    return result;
  }
  const convertIntegrationCardToAdaptive = sap_cards_ap_transpiler_cardTranspiler_Transpile["convertIntegrationCardToAdaptive"];
  const AppType = ___helpers_ApplicationInfo["AppType"];
  const ApplicationInfo = ___helpers_ApplicationInfo["ApplicationInfo"];
  const ODataModelVersion = ___helpers_ApplicationInfo["ODataModelVersion"];
  const resolvei18nTextsForIntegrationCard = ___helpers_I18nHelper["resolvei18nTextsForIntegrationCard"];
  const fetchFileContent = ___odata_ODataUtils["fetchFileContent"];
  const GenerateSemanticCard = ___semanticCard_CardFactory["GenerateSemanticCard"];
  const createSemanticCardFactory = ___semanticCard_CardFactory["createSemanticCardFactory"];
  /**
   * The card types
   *
   * @alias sap.cards.ap.common.services.RetrieveCard.CardTypes
   * @private
   * @restricted sap.fe, sap.ui.generic.app
   */
  var CardTypes = /*#__PURE__*/function (CardTypes) {
    /**
     * Integration card
     * @restricted sap.fe, sap.ui.generic.app
     */
    CardTypes["INTEGRATION"] = "integration";
    /**
     * Adaptive card
     * @restricted sap.fe, sap.ui.generic.app
     */
    CardTypes["ADAPTIVE"] = "adaptive";
    return CardTypes;
  }(CardTypes || {});
  /**
   * The options for fetching the card manifest
   *
   * @alias sap.cards.ap.common.services.RetrieveCard.CardManifestFetchOptions
   * @private
   * @restricted sap.fe, sap.ui.generic.app
   */
  /**
   * Fetches the card path from the application manifest
   *
   * @param {CardType} type - The type of card
   * @param {string} entitySet - The entity set
   * @param {AppManifest} applicationManifest - The application manifest
   * @returns The card path
   */
  const getCardPath = (type, entitySet, applicationManifest) => {
    const manifest = type === CardTypes.INTEGRATION ? "manifest.json" : "adaptive-manifest.json";
    const sapCardsAP = applicationManifest["sap.cards.ap"];
    if (sapCardsAP === undefined || Object.keys(sapCardsAP).length === 0) {
      return "";
    }
    const cardsConfig = sapCardsAP["embeds"]["ObjectPage"];
    if (cardsConfig === undefined || Object.keys(cardsConfig["manifests"]).length === 0) {
      return "";
    }
    const defaultCard = cardsConfig["manifests"][entitySet || cardsConfig.default][0];
    const localUri = defaultCard.localUri.endsWith("/") ? defaultCard.localUri : defaultCard.localUri + "/";
    return "/" + localUri + manifest;
  };

  /**
   * clean up the unnecessary variant information
   *
   * @param selectionVariant
   * @returns
   */
  const cleanupVariantInformation = selectionVariant => {
    if (selectionVariant.hasOwnProperty("SelectionVariantID")) {
      delete selectionVariant.SelectionVariantID;
    } else if (selectionVariant.hasOwnProperty("PresentationVariantID")) {
      delete selectionVariant.PresentationVariantID;
    }
    delete selectionVariant.Text;
    delete selectionVariant.ODataFilterExpression;
    delete selectionVariant.Version;
    delete selectionVariant.FilterContextUrl;
    delete selectionVariant.ParameterContextUrl;
    return selectionVariant;
  };

  /**
   * Fetches the manifest from the given url
   *
   * @param {string} url - The url of the manifest
   * @returns The manifest
   */
  const fetchManifest = function (url) {
    return Promise.resolve(_catch(function () {
      return Promise.resolve(fetchFileContent(url, "json"));
    }, function () {
      return null;
    }));
  };

  /**
   * Constructs the card URL based on the application URL and card path.
   *
   * @param {string} applicationUrlOnAbap - The base application URL.
   * @param {string} cardsPath - The path to the card.
   * @param {boolean} isDesignMode - Whether the application is in design mode.
   * @returns {string} - The constructed card URL.
   */
  function constructCardUrl(applicationUrlOnAbap, cardsPath, isDesignMode) {
    if (isDesignMode) {
      return cardsPath;
    }
    return applicationUrlOnAbap.endsWith("/") ? `${applicationUrlOnAbap.slice(0, -1)}${cardsPath}` : `${applicationUrlOnAbap}${cardsPath}`;
  }

  /**
   * Fetches the card manifest for the object page
   *
   * @param {Component} appComponent
   * @param {CardHostParam} hostOptions
   * @param {Boolean} isDesignMode
   * @returns The card manifest
   * @private
   */
  const _getObjectPageCardManifest = function (appComponent, hostOptions, isDesignMode = false) {
    try {
      function _temp2() {
        const cardsPath = getCardPath(cardType || CardTypes.INTEGRATION, entitySet, applicationManifest);
        if (cardsPath.length === 0) {
          return Promise.reject("No cards available for this application");
        }
        const cardUrl = constructCardUrl(applicationUrlOnAbap, cardsPath, isDesignMode);
        return fetchManifest(cardUrl);
      }
      const {
        entitySet,
        cardType
      } = hostOptions;
      let applicationManifest = appComponent.getManifest();
      const sapPlatformAbap = applicationManifest["sap.platform.abap"];
      const applicationUrlOnAbap = sapPlatformAbap?.uri ?? "";
      const _temp = function () {
        if (isDesignMode) {
          return Promise.resolve(fetchManifest("/manifest.json")).then(function (_fetchManifest) {
            applicationManifest = _fetchManifest;
          });
        }
      }();
      return Promise.resolve(_temp && _temp.then ? _temp.then(_temp2) : _temp2(_temp));
    } catch (e) {
      return Promise.reject(e);
    }
  };

  /**
   * Add actions to the card header
   *  - ibnTarget contains the semantic object and action
   *  - ibnParams contains the context parameters and sap-xapp-state-data - which is the stringified selection variant of the context parameters
   *
   * @param cardManifest
   * @param applicationInfo
   */
  const addActionsToCardHeader = function (cardManifest, applicationInfo) {
    try {
      const {
        semanticObject,
        action,
        variantParameter,
        contextParametersKeyValue
      } = applicationInfo;
      const header = cardManifest["sap.card"]["header"];
      const ibnParams = {};
      const selectionVariant = new SelectionVariant();
      contextParametersKeyValue.forEach(({
        key,
        value
      }) => {
        ibnParams[key] = value;
        selectionVariant.addSelectOption(key, "I", "EQ", value);
      });
      if (variantParameter) {
        ibnParams["sap-appvar-id"] = variantParameter;
      }
      ibnParams["sap-xapp-state-data"] = JSON.stringify({
        selectionVariant: cleanupVariantInformation(selectionVariant.toJSONObject())
      });
      header.actions = [{
        type: "Navigation",
        parameters: {
          ibnTarget: {
            semanticObject,
            action
          },
          ibnParams
        }
      }];
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  };
  /**
   * Checks if the leanDT card exists in the application at runtime or not
   *
   * @param appComponent
   * @param isDesignMode
   * @returns boolean
   */
  const checkIfLeanDTCardExists = (appComponent, isDesignMode = false) => {
    const mApplicationManifest = appComponent.getManifest();
    return !(!mApplicationManifest["sap.cards.ap"] && !isDesignMode);
  };

  /**
   * Determines whether semantic card generation should be enabled based on the URL parameter 'generateSemanticCard'
   * and the existence of a leanDT card in the application.
   *
   * - If 'generateSemanticCard' is 'always', semantic card generation is enabled.
   * - If 'generateSemanticCard' is 'lean', semantic card generation is enabled only if the leanDT card does not exist.
   * - Otherwise, semantic card generation is not enabled.
   *
   * @param {Component} appComponent - The application component instance.
   * @returns {boolean} true if semantic card generation should be enabled, false otherwise.
   */
  function isSemanticCardGeneration(appComponent) {
    const searchParams = window.location?.search;
    if (!searchParams) {
      return false;
    }
    const urlParams = new URLSearchParams(searchParams);
    const generateSemanticCardParam = urlParams.get("generateSemanticCard");
    if (generateSemanticCardParam === GenerateSemanticCard.Always) {
      return true;
    }
    if (generateSemanticCardParam === GenerateSemanticCard.Lean) {
      return !checkIfLeanDTCardExists(appComponent);
    }
    return false;
  }

  /**
   * Fetches key parameters for the given application component.
   *
   * @param {Component} appComponent - The application component.
   * @param {FreeStyleFetchOptions} fetchOptions - The Options isDesignMode and for FreeStyle application sharing entitySet and keyParameters.
   * @returns {Promise<KeyParameter[]>} - A promise that resolves to an array of key parameters.
   */
  const getKeyParameters = function (appComponent, fetchOptions = {
    isDesignMode: false,
    entitySet: "",
    keyParameters: {}
  }) {
    try {
      return Promise.resolve(ApplicationInfo.getInstance(appComponent).fetchDetails(fetchOptions)).then(function (applicationInfo) {
        const {
          entitySetWithObjectContext,
          appType,
          contextParameters
        } = applicationInfo;
        return appType === AppType.FreeStyle && !entitySetWithObjectContext ? [] : contextParameters.split(",").map(parameter => {
          const [key, value] = parameter.split("=");
          const formattedValue = value.replace(/guid|datetimeoffset|datetime|'*/g, "");
          return {
            key,
            formattedValue
          };
        });
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  /**
   * Function to handle the hide actions for the card
   *
   * @param appComponent
   * @param mManifest
   */
  const handleHideActions = function (appComponent, mManifest) {
    const appManifest = appComponent.getManifest();
    const cardsConfig = appManifest["sap.cards.ap"]?.embeds.ObjectPage;
    if (cardsConfig && Object.keys(cardsConfig["manifests"]).length > 0) {
      const defaultEntitySet = cardsConfig?.["default"];
      const hideActions = defaultEntitySet && cardsConfig["manifests"][defaultEntitySet]?.[0]?.hideActions || false;
      const mParameters = mManifest?.["sap.card"]?.configuration?.parameters;
      if (hideActions && mParameters?._adaptiveFooterActionParameters) {
        delete mParameters["_adaptiveFooterActionParameters"];
      }
      if (hideActions && mParameters?.footerActionParameters) {
        delete mParameters["footerActionParameters"];
      }
      if (hideActions && mManifest?.["sap.card"]?.footer) {
        delete mManifest["sap.card"]["footer"];
      }
    }
  };

  /**
   * Updates the data path of the card header in the provided card manifest by reference.
   *
   * @param {CardManifest} cardManifest - The card manifest object that contains the header data.
   */
  function updateHeaderDataPath(cardManifest, isODataV4) {
    const headerData = cardManifest["sap.card"].header.data;
    const dataPathHeader = isODataV4 ? "/header/" : "/header/d/";
    if (headerData?.path) {
      headerData.path = dataPathHeader;
    }
  }

  /**
   * Fetches the card manifest for the preview
   *
   * @param {Component} appComponent The root component of the application
   * @param {FreeStyleCardManifestFetchOptions} fetchOptions The Fetch options for FreeStyle Cards
   * @returns {Promise<any>} The card manifest
   * @public
   * @since 1.141.0
   */
  const getCardManifestForPreview = function (appComponent, fetchOptions) {
    try {
      if (!fetchOptions.entitySet || !fetchOptions.keyParameters || Object.keys(fetchOptions.keyParameters).length === 0) {
        return Promise.reject("Failed to share the card : Missing required parameters either entitySet or keyParameters");
      }
      return Promise.resolve(getObjectPageCardManifestForPreview(appComponent, fetchOptions));
    } catch (e) {
      return Promise.reject(e);
    }
  };

  /**
   * Fetches the card manifest for the object page
   *
   * @param {Component} appComponent The root component of the application
   * @param {CardManifestFetchOptions} fetchOptions The options
   * @returns {Promise<any>} The card manifest
   * @private
   * @since 1.124.0
   * @restricted sap.fe, sap.ui.generic.app
   */
  const getObjectPageCardManifestForPreview = function (appComponent, fetchOptions) {
    try {
      let _exit = false;
      function _temp6(_result) {
        if (_exit) return _result;
        const isDesignMode = fetchOptions?.isDesignMode ?? false;
        const freeStyleFetchOptions = {
          isDesignMode: isDesignMode,
          entitySet: fetchOptions.entitySet ?? "",
          keyParameters: fetchOptions.keyParameters ?? {}
        };
        return Promise.resolve(ApplicationInfo.getInstance(appComponent).fetchDetails(freeStyleFetchOptions)).then(function (applicationInfo) {
          const {
            componentName,
            entitySet,
            context,
            resourceBundle,
            semanticObject,
            action,
            odataModel,
            variantParameter,
            navigationURI
          } = applicationInfo;
          const hostOptions = {
            cardType: CardTypes.INTEGRATION,
            componentName: componentName,
            entitySet: entitySet,
            context
          };
          return Promise.resolve(_getObjectPageCardManifest(appComponent, hostOptions, isDesignMode)).then(function (cardManifest) {
            return !cardManifest || Object.keys(cardManifest).length === 0 ? Promise.reject("No cards available for this application") : Promise.resolve(getKeyParameters(appComponent, freeStyleFetchOptions)).then(function (keyParameters) {
              if (fetchOptions?.hideActions ?? true) {
                handleHideActions(appComponent, cardManifest);
              }
              const cardType = fetchOptions?.cardType || CardTypes.INTEGRATION;
              if (cardType === CardTypes.INTEGRATION) {
                function _temp4() {
                  const isODataV4 = odataModel === ODataModelVersion.V4;
                  updateHeaderDataPath(cardManifest, isODataV4);
                  return resolvei18nTextsForIntegrationCard(cardManifest, resourceBundle);
                }
                cardManifest["sap.card"]["data"]["request"]["headers"]["Accept-Language"] ??= "{{parameters.LOCALE}}";
                const parameters = cardManifest["sap.card"].configuration.parameters;
                const data = cardManifest["sap.card"]["data"];
                const contentUrl = data["request"]["batch"]["content"]["url"];
                if (contentUrl.includes("{{parameters.contextParameters}}")) {
                  /**
                   * Replace the contextParameters with the object context
                   * This is required for the integration card to fetch the data until all the manifests are regenerated.
                   */
                  cardManifest["sap.card"]["configuration"]["parameters"]["contextParameters"] = {
                    type: "string",
                    value: hostOptions.context
                  };
                }
                keyParameters.forEach(parameter => {
                  if (parameters[parameter.key] !== undefined) {
                    parameters[parameter.key]["value"] = parameter.formattedValue;
                  }
                });
                const _temp3 = function () {
                  if (fetchOptions?.includeActions ?? true) {
                    return Promise.resolve(addActionsToCardHeader(cardManifest, applicationInfo)).then(function () {});
                  }
                }();
                return _temp3 && _temp3.then ? _temp3.then(_temp4) : _temp4(_temp3);
              } else {
                const cardManifestWithResolvedI18nTexts = resolvei18nTextsForIntegrationCard(cardManifest, resourceBundle);
                const appIntent = variantParameter ? `${semanticObject}-${action}?sap-appvar-id=${variantParameter}` : `${semanticObject}-${action}`;
                return convertIntegrationCardToAdaptive(cardManifestWithResolvedI18nTexts, appIntent, keyParameters, navigationURI);
              }
            });
          });
        });
      }
      const _temp5 = function () {
        if (isSemanticCardGeneration(appComponent)) {
          const semanticCardInstance = createSemanticCardFactory(appComponent, {
            cardType: fetchOptions?.cardType
          });
          return Promise.resolve(semanticCardInstance.generateObjectCard()).then(function (semanticObjectCard) {
            _exit = true;
            return semanticObjectCard;
          });
        }
      }();
      return Promise.resolve(_temp5 && _temp5.then ? _temp5.then(_temp6) : _temp6(_temp5));
    } catch (e) {
      return Promise.reject(e);
    }
  };
  var __exports = {
    __esModule: true
  };
  __exports.CardTypes = CardTypes;
  __exports.getCardPath = getCardPath;
  __exports.fetchManifest = fetchManifest;
  __exports._getObjectPageCardManifest = _getObjectPageCardManifest;
  __exports.addActionsToCardHeader = addActionsToCardHeader;
  __exports.isSemanticCardGeneration = isSemanticCardGeneration;
  __exports.getKeyParameters = getKeyParameters;
  __exports.updateHeaderDataPath = updateHeaderDataPath;
  __exports.getCardManifestForPreview = getCardManifestForPreview;
  __exports.getObjectPageCardManifestForPreview = getObjectPageCardManifestForPreview;
  return __exports;
});
//# sourceMappingURL=RetrieveCard-dbg-dbg.js.map
