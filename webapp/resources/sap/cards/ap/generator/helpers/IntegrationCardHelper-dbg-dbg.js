/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
"use strict";

sap.ui.define(["sap/cards/ap/common/odata/ODataUtils", "sap/cards/ap/generator/helpers/NavigationProperty", "sap/cards/ap/generator/odata/v2/MetadataAnalyzer", "sap/cards/ap/generator/odata/v4/MetadataAnalyzer", "sap/ui/VersionInfo", "sap/ui/core/Element", "sap/ui/model/odata/ODataUtils", "sap/ui/model/odata/v4/ODataUtils", "../odata/ODataUtils", "../pages/Application", "../types/CommonTypes", "../utils/CommonUtils", "./Batch", "./I18nHelper", "./PropertyExpression"], function (sap_cards_ap_common_odata_ODataUtils, sap_cards_ap_generator_helpers_NavigationProperty, sap_cards_ap_generator_odata_v2_MetadataAnalyzer, sap_cards_ap_generator_odata_v4_MetadataAnalyzer, VersionInfo, CoreElement, V2OdataUtils, V4ODataUtils, ___odata_ODataUtils, ___pages_Application, ___types_CommonTypes, ___utils_CommonUtils, ___Batch, ___I18nHelper, ___PropertyExpression) {
  "use strict";

  const _iteratorSymbol = /*#__PURE__*/typeof Symbol !== "undefined" ? Symbol.iterator || (Symbol.iterator = Symbol("Symbol.iterator")) : "@@iterator";
  function _settle(pact, state, value) {
    if (!pact.s) {
      if (value instanceof _Pact) {
        if (value.s) {
          if (state & 1) {
            state = value.s;
          }
          value = value.v;
        } else {
          value.o = _settle.bind(null, pact, state);
          return;
        }
      }
      if (value && value.then) {
        value.then(_settle.bind(null, pact, state), _settle.bind(null, pact, 2));
        return;
      }
      pact.s = state;
      pact.v = value;
      const observer = pact.o;
      if (observer) {
        observer(pact);
      }
    }
  }
  const _Pact = /*#__PURE__*/function () {
    function _Pact() {}
    _Pact.prototype.then = function (onFulfilled, onRejected) {
      const result = new _Pact();
      const state = this.s;
      if (state) {
        const callback = state & 1 ? onFulfilled : onRejected;
        if (callback) {
          try {
            _settle(result, 1, callback(this.v));
          } catch (e) {
            _settle(result, 2, e);
          }
          return result;
        } else {
          return this;
        }
      }
      this.o = function (_this) {
        try {
          const value = _this.v;
          if (_this.s & 1) {
            _settle(result, 1, onFulfilled ? onFulfilled(value) : value);
          } else if (onRejected) {
            _settle(result, 1, onRejected(value));
          } else {
            _settle(result, 2, value);
          }
        } catch (e) {
          _settle(result, 2, e);
        }
      };
      return result;
    };
    return _Pact;
  }();
  function _isSettledPact(thenable) {
    return thenable instanceof _Pact && thenable.s & 1;
  }
  function _forTo(array, body, check) {
    var i = -1,
      pact,
      reject;
    function _cycle(result) {
      try {
        while (++i < array.length && (!check || !check())) {
          result = body(i);
          if (result && result.then) {
            if (_isSettledPact(result)) {
              result = result.v;
            } else {
              result.then(_cycle, reject || (reject = _settle.bind(null, pact = new _Pact(), 2)));
              return;
            }
          }
        }
        if (pact) {
          _settle(pact, 1, result);
        } else {
          pact = result;
        }
      } catch (e) {
        _settle(pact || (pact = new _Pact()), 2, e);
      }
    }
    _cycle();
    return pact;
  }
  /**
   * This is a fix for cards which are generated without "sap.insights" manifest property or with cardType as "DT".
   *  - When the card is regenerated "sap.insight" property will be set/updated existing in the manifest.
   *
   * @param mCardManifest
   * @param rootComponent
   * @returns
   */
  const enhanceManifestWithInsights = function (mCardManifest, rootComponent) {
    try {
      if (!mCardManifest) {
        return Promise.resolve();
      }
      const sapAppId = rootComponent.getManifestEntry("sap.app").id;
      return Promise.resolve(VersionInfo.load({
        library: "sap.ui.core"
      })).then(function (_VersionInfo$load) {
        const sapCoreVersionInfo = _VersionInfo$load;
        mCardManifest["sap.insights"] = {
          templateName: "ObjectPage",
          parentAppId: sapAppId,
          cardType: "LEAN_DT",
          versions: {
            ui5: sapCoreVersionInfo.version + "-" + sapCoreVersionInfo.buildTimestamp
          }
        };
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };
  /**
   * Enhance the card manifest configuration parameters with property formatting configuration
   * 	- add text arrangements properties
   *  - Updates the card manifest configuration parameters by adding "_yesText" and "_noText" parameters
   *    with predefined string values referencing i18n keys.
   *
   * @param {CardManifest} The card manifest object to be updated. It is expected to have
   *    "sap.card" property with a configuration containing parameters.
   * @param {JSONModel}
   */
  function _forOf(target, body, check) {
    if (typeof target[_iteratorSymbol] === "function") {
      var iterator = target[_iteratorSymbol](),
        step,
        pact,
        reject;
      function _cycle(result) {
        try {
          while (!(step = iterator.next()).done && (!check || !check())) {
            result = body(step.value);
            if (result && result.then) {
              if (_isSettledPact(result)) {
                result = result.v;
              } else {
                result.then(_cycle, reject || (reject = _settle.bind(null, pact = new _Pact(), 2)));
                return;
              }
            }
          }
          if (pact) {
            _settle(pact, 1, result);
          } else {
            pact = result;
          }
        } catch (e) {
          _settle(pact || (pact = new _Pact()), 2, e);
        }
      }
      _cycle();
      if (iterator.return) {
        var _fixup = function (value) {
          try {
            if (!step.done) {
              iterator.return();
            }
          } catch (e) {}
          return value;
        };
        if (pact && pact.then) {
          return pact.then(_fixup, function (e) {
            throw _fixup(e);
          });
        }
        _fixup();
      }
      return pact;
    }
    // No support for Symbol.iterator
    if (!("length" in target)) {
      throw new TypeError("Object is not iterable");
    }
    // Handle live collections properly
    var values = [];
    for (var i = 0; i < target.length; i++) {
      values.push(target[i]);
    }
    return _forTo(values, function (i) {
      return body(values[i]);
    }, check);
  }
  const handleSingleProperty = sap_cards_ap_common_odata_ODataUtils["handleSingleProperty"];
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
  const isSingleKeyWithoutAssignment = sap_cards_ap_common_odata_ODataUtils["isSingleKeyWithoutAssignment"];
  const getNavigationPropertiesWithLabel = sap_cards_ap_generator_helpers_NavigationProperty["getNavigationPropertiesWithLabel"];
  const getPropertyReference = sap_cards_ap_generator_odata_v2_MetadataAnalyzer["getPropertyReference"];
  const getPropertyReferenceKey = sap_cards_ap_generator_odata_v4_MetadataAnalyzer["getPropertyReferenceKey"];
  const getDataType = ___odata_ODataUtils["getDataType"];
  const isODataV4Model = ___odata_ODataUtils["isODataV4Model"];
  const Application = ___pages_Application["Application"];
  const ODataModelVersion = ___pages_Application["ODataModelVersion"];
  const ColorIndicator = ___types_CommonTypes["ColorIndicator"];
  const extractValueWithoutBooleanExprBinding = ___utils_CommonUtils["extractValueWithoutBooleanExprBinding"];
  const getColorForGroup = ___utils_CommonUtils["getColorForGroup"];
  const hasBooleanBindingExpression = ___utils_CommonUtils["hasBooleanBindingExpression"];
  const updateManifestWithExpandQueryParams = ___Batch["updateManifestWithExpandQueryParams"];
  const updateManifestWithSelectQueryParams = ___Batch["updateManifestWithSelectQueryParams"];
  const getYesAndNoTextValues = ___I18nHelper["getYesAndNoTextValues"];
  const resolveI18nTextFromResourceModel = ___I18nHelper["resolveI18nTextFromResourceModel"];
  const extractPathExpressionWithoutUOM = ___PropertyExpression["extractPathExpressionWithoutUOM"];
  const extractPathWithoutUOM = ___PropertyExpression["extractPathWithoutUOM"];
  const extractPropertyConfigurationWithoutTextArrangement = ___PropertyExpression["extractPropertyConfigurationWithoutTextArrangement"];
  const getTextArrangementFromCardManifest = ___PropertyExpression["getTextArrangementFromCardManifest"];
  const hasFormatter = ___PropertyExpression["hasFormatter"];
  const isExpression = ___PropertyExpression["isExpression"];
  const isI18nExpression = ___PropertyExpression["isI18nExpression"];
  const updateAndGetSelectedFormatters = ___PropertyExpression["updateAndGetSelectedFormatters"];
  let manifest;
  const formatterConfigurationFromCardManifest = [];
  function createInitialManifest(props) {
    const {
      title,
      subTitle,
      description,
      service,
      serviceModel,
      sapAppId,
      sapCoreVersionInfo,
      entitySetName,
      entitySetWithObjectContext,
      data
    } = props;
    const bODataV4 = isODataV4Model(serviceModel);
    if (!bODataV4) {
      formatDataForV2(entitySetWithObjectContext, data);
    }
    const dataPath = bODataV4 ? "/content/" : "/content/d/";
    const dataPathHeader = bODataV4 ? "/header/" : "/header/d/";
    const propertyReferenceKeys = bODataV4 ? getPropertyReferenceKey(serviceModel, entitySetName) : getPropertyReference(serviceModel, entitySetName);
    const entityKeyPropertiesParameters = {};
    const {
      yesText,
      noText
    } = getYesAndNoTextValues();
    propertyReferenceKeys.forEach(keyProp => {
      if (keyProp.type === "Edm.Boolean" && typeof data[keyProp.name] === "string") {
        data[keyProp.name] = data[keyProp.name] === yesText;
      }
      entityKeyPropertiesParameters[keyProp.name] = {
        type: getDataType(keyProp.type),
        value: data[keyProp.name]
      };
    });
    const entityKeyProperties = propertyReferenceKeys.map(keyProp => keyProp.name);
    manifest = {
      _version: "1.15.0",
      "sap.app": {
        id: `${sapAppId}.cards.op.${entitySetName}`,
        type: "card",
        i18n: "../../../i18n/i18n.properties",
        title: title,
        subTitle: subTitle,
        description: description,
        applicationVersion: {
          version: "1.0.0"
        }
      },
      "sap.ui": {
        technology: "UI5",
        icons: {
          icon: "sap-icon://switch-classes"
        }
      },
      "sap.card": {
        extension: "module:sap/cards/ap/common/extensions/BaseIntegrationCardExtension",
        type: "Object",
        configuration: {
          parameters: {
            ...entityKeyPropertiesParameters,
            _contentSelectQuery: {
              value: entityKeyProperties?.length ? `$select=${entityKeyProperties.join(",")}` : ""
            },
            _headerSelectQuery: {
              value: entityKeyProperties?.length ? `$select=${entityKeyProperties.join(",")}` : ""
            },
            _contentExpandQuery: {
              value: ""
            },
            _headerExpandQuery: {
              value: ""
            },
            _entitySet: {
              type: "string",
              value: entitySetName
            },
            _yesText: {
              type: "string",
              value: yesText
            },
            _noText: {
              type: "string",
              value: noText
            }
          },
          destinations: {
            service: {
              name: "(default)",
              defaultUrl: "/"
            }
          },
          csrfTokens: {
            token1: {
              data: {
                request: {
                  url: `{{destinations.service}}${service}`,
                  method: "HEAD",
                  headers: {
                    "X-CSRF-Token": "Fetch"
                  }
                }
              }
            }
          }
        },
        data: {
          request: {
            url: `{{destinations.service}}${service}/$batch`,
            method: "POST",
            headers: {
              "X-CSRF-Token": "{{csrfTokens.token1}}",
              "Accept-Language": "{{parameters.LOCALE}}"
            },
            batch: {
              header: {
                method: "GET",
                url: getHeaderBatchUrl(),
                headers: {
                  Accept: "application/json",
                  "Accept-Language": "{{parameters.LOCALE}}"
                },
                retryAfter: 30
              },
              content: {
                method: "GET",
                url: getContentBatchUrl(),
                headers: {
                  Accept: "application/json",
                  "Accept-Language": "{{parameters.LOCALE}}"
                }
              }
            }
          }
        },
        header: {
          data: {
            path: dataPathHeader
          },
          type: "Numeric",
          title: title,
          subTitle: subTitle,
          unitOfMeasurement: "",
          mainIndicator: {
            number: "",
            unit: ""
          }
        },
        content: {
          data: {
            path: dataPath
          },
          groups: []
        }
      },
      "sap.ui5": {
        _version: "1.1.0",
        contentDensities: {
          compact: true,
          cozy: true
        },
        dependencies: {
          libs: {
            "sap.insights": {
              lazy: false
            }
          }
        }
      },
      "sap.insights": {
        templateName: "ObjectPage",
        parentAppId: sapAppId,
        cardType: "LEAN_DT",
        versions: {
          ui5: sapCoreVersionInfo.version + "-" + sapCoreVersionInfo.buildTimestamp
        }
      }
    };
    return manifest;
  }
  function getObjectPageContext() {
    const {
      rootComponent,
      entitySet
    } = Application.getInstance().fetchDetails();
    const appModel = rootComponent.getModel();
    const contextParameters = [];
    const bODataV4 = isODataV4Model(appModel);
    if (bODataV4) {
      const keyProperties = getPropertyReferenceKey(appModel, entitySet);
      keyProperties.forEach(property => {
        const parameter = V4ODataUtils.formatLiteral(`{{parameters.${property.name}}}`, property.type);
        contextParameters.push(`${property.name}=${parameter}`);
      });
    } else {
      const keyProperties = getPropertyReference(appModel, entitySet);
      keyProperties.forEach(property => {
        let parameter = "";
        if (property.type === "Edm.DateTimeOffset" || property.type === "Edm.DateTime") {
          const propertyType = property.type === "Edm.DateTimeOffset" ? "datetimeoffset" : "datetime";
          parameter = propertyType + `'{{parameters.${property.name}}}'`;
        } else {
          parameter = V2OdataUtils.formatValue(`{{parameters.${property.name}}}`, property.type, true);
        }
        contextParameters.push(`${property.name}=${parameter}`);
      });
    }
    return contextParameters.join(",");
  }
  function getHeaderBatchUrl() {
    return `{{parameters._entitySet}}(${getObjectPageContext()})?{{parameters._headerSelectQuery}}{{parameters._headerExpandQuery}}`;
  }
  function getContentBatchUrl() {
    return `{{parameters._entitySet}}(${getObjectPageContext()})?{{parameters._contentSelectQuery}}{{parameters._contentExpandQuery}}`;
  }
  function getCurrentCardManifest() {
    return manifest || {};
  }

  /**
   * Render integration card preview
   *
   * @param {CardManifest} newManifest
   */
  function renderCardPreview(newManifest, oModel) {
    manifest = {
      ...newManifest
    };
    updateManifestWithSelectQueryParams(manifest);
    oModel && updateManifestWithExpandQueryParams(manifest);
    const oCard = CoreElement.getElementById("cardGeneratorDialog--cardPreview");
    if (oCard) {
      oCard.setBaseUrl("./");
      oCard.setManifest(manifest);
      oCard.refresh();
    }
  }
  function updateCardGroups(oModel) {
    const configurationGroups = oModel.getProperty("/configuration/groups");
    const advancedPanelCriticallity = oModel?.getProperty("/configuration/mainIndicatorOptions/criticality");
    const groups = configurationGroups.map(function (configuration) {
      const items = configuration?.items?.filter(function (configurationItem) {
        return configurationItem.name;
      }).map(configurationItem => {
        const matchedCriticallity = advancedPanelCriticallity?.filter(columnItem => {
          if (configurationItem?.navigationProperty) {
            return `${columnItem.name}/${columnItem?.propertyKeyForId}` === `${configurationItem.name}/${configurationItem.navigationProperty}`;
          }
          return columnItem.name === configurationItem.name;
        });
        let updatedColorState;
        if (matchedCriticallity?.[0]?.criticality) {
          const criticalityValue = matchedCriticallity[0]?.activeCalculation ? matchedCriticallity[0] : matchedCriticallity[0]?.criticality;
          updatedColorState = getColorForGroup(criticalityValue);
        }
        const item = {
          label: configurationItem.label,
          value: configurationItem.value,
          name: configurationItem.name
        };
        if (updatedColorState) {
          item.state = updatedColorState;
          item.type = "Status";
          item.showStateIcon = true;
        }
        if (configurationItem.hasActions) {
          item["actions"] = configurationItem.actions;
          item["hasActions"] = configurationItem.hasActions;
          item["actionType"] = configurationItem.actionType;
        }
        return item;
      });
      return {
        title: configuration.title,
        items: items ? items : []
      };
    });
    manifest["sap.card"].content.groups = groups;
    renderCardPreview(manifest, oModel);
  }

  /**
   *  Resolves the card header properties from stored manifest
   *  - If path is a string, return the resolved i18n text
   * 	- If path is an expression, resolve the expression then return the labelWithValue of the property
   *  - If path is an expression with formatter, update the formatter configuration and return the labelWithValue of the property
   * @param path
   * @param resourceModel
   * @param properties
   * @returns
   */
  function resolvePropertyLabelFromExpression(path, resourceModel, properties) {
    if (isI18nExpression(path)) {
      return resolveI18nTextFromResourceModel(path, resourceModel);
    }
    if (isExpression(path) && !hasFormatter(path)) {
      let propertyPath = "";
      if (hasBooleanBindingExpression(path)) {
        propertyPath = extractValueWithoutBooleanExprBinding(path);
      } else {
        propertyPath = extractPathWithoutUOM(path);
      }
      return properties.find(property => property.name === propertyPath)?.labelWithValue ?? "";
    }
    if (isExpression(path) && hasFormatter(path)) {
      const formatterExpression = extractPathExpressionWithoutUOM(path);
      const selectedFormatter = updateAndGetSelectedFormatters(formatterExpression);
      handleFormatter(selectedFormatter);
      return properties.find(property => property.name === selectedFormatter.property)?.labelWithValue ?? "";
    }
    return path;
  }

  /**
   * The function formats the data for OData V2 applications containing the key parameters of type datetimeoffset and guid.
   * @param entitySetWithObjectContext
   * @param data
   */
  function formatDataForV2(entitySetWithObjectContext, data) {
    const extractKeyValue = keyValueStr => {
      const [rawKey, rawValue] = keyValueStr.split("=");
      if (rawValue === "true" || rawValue === "false") {
        return [rawKey, rawValue === "true"];
      }
      const cleanedValue = rawValue.replace(/guid|datetimeoffset|datetime|'*/g, "");
      return [rawKey, cleanedValue];
    };
    const updateDataWithProperties = properties => {
      for (const prop of properties) {
        const [key, value] = extractKeyValue(prop);
        data[key] = value;
      }
    };
    const startIndex = entitySetWithObjectContext.indexOf("(");
    const endIndex = entitySetWithObjectContext.indexOf(")");
    const keySegment = entitySetWithObjectContext.slice(startIndex + 1, endIndex);
    const keyProperties = keySegment.split(",");
    if (isSingleKeyWithoutAssignment(keyProperties)) {
      const entitySetName = entitySetWithObjectContext.split("(")[0];
      const appModel = Application.getInstance().getRootComponent().getModel();
      const keyReference = getPropertyReference(appModel, entitySetName);
      const resolvedKey = handleSingleProperty(keyReference, keyProperties).join(",");
      const [key, value] = extractKeyValue(resolvedKey);
      data[key] = value;
    } else {
      updateDataWithProperties(keyProperties);
    }
  }
  function getMainIndicator(mManifest) {
    const mainIndicator = mManifest["sap.card"].header.mainIndicator;
    let mainIndicatorKey = "";
    let trendOptions = {
      referenceValue: "",
      downDifference: "",
      upDifference: ""
    };
    const criticalityOptions = [];
    const groups = mManifest["sap.card"].content.groups;
    if (groups.length > 0) {
      updateCriticalityBasedOnGroups(mManifest, criticalityOptions);
    }
    if (!mainIndicator || !mainIndicator.number) {
      return {
        mainIndicatorStatusKey: "",
        mainIndicatorNavigationSelectedKey: "",
        criticalityOptions,
        navigationValue: "",
        trendOptions
      };
    }
    const {
      propertyPath,
      formatterExpression
    } = extractPropertyConfigurationWithoutTextArrangement(mainIndicator.number, mManifest);
    const state = mainIndicator.state;
    if (formatterExpression.length) {
      const formatterExpressions = formatterExpression.map(updateAndGetSelectedFormatters);
      formatterExpressions.forEach(handleFormatter);
    }
    if (isExpression(propertyPath) && !hasFormatter(propertyPath)) {
      if (hasBooleanBindingExpression(propertyPath)) {
        mainIndicatorKey = extractValueWithoutBooleanExprBinding(propertyPath);
      } else {
        mainIndicatorKey = extractPathWithoutUOM(propertyPath);
      }
    }
    if (mainIndicator.trend && mainIndicator.trend !== "None") {
      const trendValue = mainIndicator.trend;
      const regex = /"referenceValue":(\d+),"downDifference":(\d+),"upDifference":(\d+)/;
      const match = trendValue.match(regex);
      if (match) {
        trendOptions = {
          referenceValue: match[1] || "",
          downDifference: match[2] || "",
          upDifference: match[3] || ""
        };
      }
    }
    if (isExpression(propertyPath) && hasFormatter(propertyPath)) {
      const formatterExpression = extractPathExpressionWithoutUOM(propertyPath);
      const selectedFormatter = updateAndGetSelectedFormatters(formatterExpression);
      handleFormatter(selectedFormatter);
      mainIndicatorKey = selectedFormatter.property || "";
    }
    let criticalityConfig = {
      criticality: "",
      name: "",
      activeCalculation: false
    };
    if (state && hasFormatter(state)) {
      const formatterExpression = extractPathExpressionWithoutUOM(state);
      const selectedFormatter = updateAndGetSelectedFormatters(formatterExpression);
      handleFormatter(selectedFormatter);
      criticalityConfig = {
        criticality: "{" + selectedFormatter.property + "}",
        name: mainIndicatorKey,
        activeCalculation: false
      };
    } else if (state && state !== "None") {
      criticalityConfig = {
        criticality: state,
        name: mainIndicatorKey,
        activeCalculation: false
      };
    }
    if (criticalityConfig.name.length) {
      updateCriticalityOptions(criticalityOptions, criticalityConfig);
    }
    let mainIndicatorNavigationSelectedKey = "";
    let mainIndicatorStatusKey = mainIndicatorKey;
    if (mainIndicatorKey.includes("/")) {
      mainIndicatorStatusKey = mainIndicatorKey.split("/")[0];
      mainIndicatorNavigationSelectedKey = mainIndicatorKey.split("/")[1];
    }
    return {
      mainIndicatorStatusKey,
      mainIndicatorNavigationSelectedKey,
      criticalityOptions,
      navigationValue: mainIndicatorKey,
      trendOptions
    };
  }
  /**
   * Updates the criticality options based on the groups in the provided CardManifest.
   * @param {CardManifest} mManifest - The card manifest containing the groups and their items.
   * @param {CriticalityOptions[]} criticalityOptions - An array of criticality options to be updated.
   */

  function updateCriticalityBasedOnGroups(mManifest, criticalityOptions) {
    const groups = mManifest["sap.card"].content.groups;
    groups.forEach(group => {
      group.items.forEach(item => {
        if (item.state) {
          const criticallityState = getCriticallityStateForGroup(item.state);
          const regex = /\/([^,}]+)/;
          const match = item.value.match(regex);
          let navProp;
          if (match) {
            navProp = match[1];
          }
          const criticalityConfig = {
            criticality: criticallityState,
            name: navProp ? `${item.name}/${navProp}` : item.name,
            activeCalculation: false
          };
          updateCriticalityOptions(criticalityOptions, criticalityConfig);
        }
      });
    });
  }

  /**
   * Update the criticality options
   * @param criticalityOptions
   * @param criticalityConfig
   */
  function updateCriticalityOptions(criticalityOptions, criticalityConfig) {
    const itemExists = criticalityOptions.some(option => option.name === criticalityConfig.name);
    if (!itemExists) {
      criticalityOptions.push(criticalityConfig);
    }
  }

  /**
   * Gets the criticality state for a group based on the provided state string.
   *
   * This function checks if the state has a formatter associated with it.
   * If so, it processes the formatter and returns its property in a specific format.
   * If the state corresponds to a known criticality state, it returns the corresponding
   * color indicator. If the state is not recognized, it defaults to the 'None' indicator.
   *
   * @param {string} state - The state string to evaluate for criticality.
   * @returns {string} - The criticality state as a string based on the ColorIndicator enum.
   *                    Possible return values include:
   *                    - ColorIndicator.Error
   *                    - ColorIndicator.Success
   *                    - ColorIndicator.None
   *                    - ColorIndicator.Warning
   */
  function getCriticallityStateForGroup(state) {
    if (state && hasFormatter(state)) {
      const formatterExpression = extractPathExpressionWithoutUOM(state);
      const selectedFormatter = updateAndGetSelectedFormatters(formatterExpression);
      handleFormatter(selectedFormatter);
      return "{" + selectedFormatter.property + "}";
    }
    if (state && state in ColorIndicator) {
      return ColorIndicator[state];
    }
    return ColorIndicator.None;
  }
  function getSideIndicators(mManifest) {
    const sideIndicators = mManifest["sap.card"].header.sideIndicators || [];
    if (sideIndicators.length === 0 || !sideIndicators[0].number) {
      return {
        targetValue: "",
        targetUnit: "",
        deviationValue: "",
        deviationUnit: ""
      };
    }
    const [targetIndicator = {}, deviationIndicator = {}] = sideIndicators;
    const {
      number: targetValue = "",
      unit: targetUnit = ""
    } = targetIndicator;
    const {
      number: deviationValue = "",
      unit: deviationUnit = ""
    } = deviationIndicator;
    return {
      targetValue,
      targetUnit,
      deviationValue,
      deviationUnit
    };
  }
  function handleFormatter(formatter) {
    if (formatterConfigurationFromCardManifest.length === 0 || !formatterConfigurationFromCardManifest.find(f => f.property === formatter.property)) {
      formatterConfigurationFromCardManifest.push({
        ...formatter
      });
    }
  }
  function getGroupItemValue(value, mManifest) {
    const {
      formatterExpression
    } = extractPropertyConfigurationWithoutTextArrangement(value, mManifest);
    if (formatterExpression.length) {
      const formatterExpressions = formatterExpression.map(updateAndGetSelectedFormatters);
      formatterExpressions.forEach(handleFormatter);
    }
    return value;
  }
  function getCardGroups(mManifest, resourceModel) {
    const groups = mManifest["sap.card"].content.groups;
    if (groups.length === 0) {
      return [];
    }
    return groups.map(group => {
      return {
        title: resolveI18nTextFromResourceModel(group.title, resourceModel),
        items: group.items.map(item => {
          const groupItem = {
            label: resolveI18nTextFromResourceModel(item.label, resourceModel),
            value: getGroupItemValue(item.value, mManifest),
            name: item.name,
            isEnabled: true,
            isNavigationEnabled: false
          };
          if (item.hasActions) {
            groupItem.actions = item.actions;
            groupItem.hasActions = item.hasActions;
            groupItem.actionType = item.actionType;
          }
          if (item.state) {
            groupItem.type = "Status";
            groupItem.state = item.state;
          }
          return groupItem;
        })
      };
    });
  }
  function enhanceManifestWithConfigurationParameters(mCardManifest, oDialogModel) {
    const sapCard = mCardManifest["sap.card"];
    const applicationInstance = Application.getInstance();
    const rootComponent = applicationInstance.getRootComponent();
    const appModel = rootComponent.getModel();
    const {
      odataModel,
      entitySet
    } = applicationInstance.fetchDetails();
    const keyProperties = [];
    if (odataModel === ODataModelVersion.V4) {
      getPropertyReferenceKey(appModel, entitySet).forEach(property => keyProperties.push(property.name));
    } else {
      getPropertyReference(appModel, entitySet).forEach(property => keyProperties.push(property.name));
    }
    if (!sapCard.configuration) {
      sapCard.configuration = {
        parameters: {}
      };
    }
    if (!sapCard.configuration?.parameters) {
      sapCard.configuration.parameters = {};
    }
    const configurationParameters = sapCard.configuration?.parameters;
    configurationParameters["_propertyFormatting"] = {};
    const textArrangements = oDialogModel.getProperty("/configuration/advancedFormattingOptions/textArrangements");
    const previewItems = getPreviewItems(oDialogModel);
    const propertyFormatting = {};
    textArrangements.forEach(({
      name,
      arrangementType,
      value
    }) => {
      if (name && previewItems.includes(name) && arrangementType && value) {
        propertyFormatting[name] = {
          arrangements: {
            text: {
              [arrangementType]: true,
              path: value
            }
          }
        };
      }
    });
    if (Object.keys(propertyFormatting).length > 0) {
      configurationParameters["_propertyFormatting"] = propertyFormatting;
    }
    configurationParameters["_mandatoryODataParameters"] = {
      value: keyProperties
    };
    configurationParameters["_entitySet"] = {
      value: entitySet,
      type: "string"
    };
    keyProperties.forEach(keyProp => {
      configurationParameters[keyProp] = {
        type: getDataType(keyProp),
        value: ""
      };
    });
    configurationParameters["_yesText"] = {
      type: "string",
      value: "{{CardGeneratorValue_Yes}}"
    };
    configurationParameters["_noText"] = {
      type: "string",
      value: "{{CardGeneratorValue_No}}"
    };
  }

  /**
   * Adds query parameters to the URLs in the manifest's batch request.
   *
   * @param {CardManifest} cardManifest - The card manifest.
   * @returns {CardManifest} A copy of the original card manifest with query parameters added to the URLs.
   */

  const addQueryParametersToManifest = cardManifest => {
    const cardManifestCopy = JSON.parse(JSON.stringify(cardManifest));
    const batchRequest = cardManifestCopy["sap.card"].data?.request?.batch;
    const selectQueryHeader = "?{{parameters._headerSelectQuery}}";
    const selectQueryContent = "?{{parameters._contentSelectQuery}}";
    const expandQueryHeader = "{{parameters._headerExpandQuery}}";
    const expandQueryContent = "{{parameters._contentExpandQuery}}";
    const headerUrl = batchRequest?.header?.url;
    const contentUrl = batchRequest?.content?.url;
    if (headerUrl?.indexOf(selectQueryHeader) === -1) {
      batchRequest.header.url = `${batchRequest.header.url}${selectQueryHeader}${expandQueryHeader}`;
    } else if (headerUrl?.indexOf(expandQueryHeader) === -1) {
      batchRequest.header.url = `${batchRequest.header.url}${expandQueryHeader}`;
    }
    if (contentUrl?.indexOf(selectQueryContent) === -1) {
      batchRequest.content.url = `${batchRequest.content.url}${selectQueryContent}${expandQueryContent}`;
    } else if (contentUrl?.indexOf(expandQueryContent) === -1) {
      batchRequest.content.url = `${batchRequest.content.url}${expandQueryContent}`;
    }
    const configParameters = cardManifestCopy["sap.card"].configuration?.parameters;
    configParameters._contentSelectQuery = configParameters?._contentSelectQuery ?? {
      value: ""
    };
    configParameters._headerSelectQuery = configParameters?._headerSelectQuery ?? {
      value: ""
    };
    configParameters._contentExpandQuery = configParameters?._contentExpandQuery ?? {
      value: ""
    };
    configParameters._headerExpandQuery = configParameters?._headerExpandQuery ?? {
      value: ""
    };
    return cardManifestCopy;
  };
  const updateConfigurationParametersWithKeyProperties = (cardManifest, data) => {
    const applicationInstance = Application.getInstance();
    const rootComponent = applicationInstance.getRootComponent();
    const appModel = rootComponent.getModel();
    const {
      odataModel,
      entitySet,
      entitySetWithObjectContext
    } = applicationInstance.fetchDetails();
    const bODataV4 = isODataV4Model(appModel);
    if (!bODataV4) {
      formatDataForV2(entitySetWithObjectContext, data);
    }
    const propertyReferenceKeys = odataModel === ODataModelVersion.V4 ? getPropertyReferenceKey(appModel, entitySet) : getPropertyReference(appModel, entitySet);
    const sapCard = cardManifest["sap.card"];
    if (!sapCard.configuration) {
      sapCard.configuration = {
        parameters: {}
      };
    }
    if (!sapCard.configuration?.parameters) {
      sapCard.configuration.parameters = {};
    }
    const configurationParameters = sapCard.configuration?.parameters;
    configurationParameters["_entitySet"] = {
      value: entitySet,
      type: "string"
    };
    const {
      yesText,
      noText
    } = getYesAndNoTextValues();
    configurationParameters["_yesText"] = {
      type: "string",
      value: yesText
    };
    configurationParameters["_noText"] = {
      type: "string",
      value: noText
    };
    propertyReferenceKeys.forEach(keyProp => {
      if (keyProp.type === "Edm.Boolean" && typeof data[keyProp.name] === "string") {
        data[keyProp.name] = data[keyProp.name] === yesText;
      }
      configurationParameters[keyProp.name] = {
        type: getDataType(keyProp.type),
        value: data[keyProp.name]
      };
    });
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
   * This method is used to perform updates on existing integration card manifest.
   * Updates will include adding,
   * 	- Query parameters to the URLs in the target manifest's batch request.
   * 	- sap.app.id to the manifest.
   * @param cardManifest
   */
  const updateExistingCardManifest = (data, cardManifest) => {
    if (!cardManifest) {
      return cardManifest;
    }
    cardManifest = addQueryParametersToManifest(cardManifest);
    const batch = cardManifest["sap.card"].data.request?.batch;
    if (batch !== undefined) {
      batch.header.url = getHeaderBatchUrl();
      batch.content.url = getContentBatchUrl();
    }
    const {
      componentName,
      odataModel,
      entitySet
    } = Application.getInstance().fetchDetails();
    cardManifest["sap.app"].id = `${componentName}.cards.op.${entitySet}`;
    cardManifest["sap.app"].i18n = cardManifest["sap.app"].i18n || "../../../i18n/i18n.properties";
    updateConfigurationParametersWithKeyProperties(cardManifest, data);
    const isODataV4 = odataModel === ODataModelVersion.V4;
    updateHeaderDataPath(cardManifest, isODataV4);
    return cardManifest;
  };

  /**
   * Parses the integration card manifest and extracts relevant information.
   *
   * @param {CardManifest} integrationCardManifest - The manifest of the integration card to be parsed.
   * @param {ResourceModel} resourceModel - The resource model used for localization.
   * @param {PropertyInfoMap} properties - The map of properties to resolve labels from expressions.
   * @returns {ParsedManifest} The parsed manifest containing title, subtitle, header unit of measurement, main indicator options, side indicator options, groups, formatter configuration, and text arrangements.
   */
  function parseCard(integrationCardManifest, resourceModel, properties) {
    const title = integrationCardManifest["sap.card"].header.title ?? "";
    const subtitle = integrationCardManifest["sap.card"].header.subTitle ?? "";
    const uom = integrationCardManifest["sap.card"].header.unitOfMeasurement ?? "";
    formatterConfigurationFromCardManifest.splice(0, formatterConfigurationFromCardManifest.length);
    const textArrangementsFromCardManifest = getTextArrangementFromCardManifest(integrationCardManifest);
    return {
      title: resolvePropertyLabelFromExpression(title, resourceModel, properties),
      subtitle: resolvePropertyLabelFromExpression(subtitle, resourceModel, properties),
      headerUOM: resolvePropertyLabelFromExpression(uom, resourceModel, properties),
      mainIndicatorOptions: getMainIndicator(integrationCardManifest),
      sideIndicatorOptions: getSideIndicators(integrationCardManifest),
      groups: getCardGroups(integrationCardManifest, resourceModel),
      formatterConfigurationFromCardManifest,
      textArrangementsFromCardManifest
    };
  }

  /**
   * Updates the unit of measures array with formatter configurations.
   *
   * @param {Array<UnitOfMeasures>} unitOfMeasures - The array of unit of measures to be updated.
   * @param {FormatterConfigurationMap} formatterConfigsWithUnit - The formatter configurations containing unit information.
   * @returns Promise {Array<UnitOfMeasures>} The updated array of unit of measures.
   */
  const getUpdatedUnitOfMeasures = function (unitOfMeasures, formatterConfigsWithUnit, path) {
    try {
      const updatedUnitOfMeasures = [...unitOfMeasures];
      const _temp3 = _forOf(formatterConfigsWithUnit, function (formatter) {
        const matchingProperty = updatedUnitOfMeasures.find(unitConfig => unitConfig.name === formatter.property);
        const formatterParameterValue = formatter.parameters?.[0].value;
        let value;
        if (hasBooleanBindingExpression(formatterParameterValue)) {
          value = extractValueWithoutBooleanExprBinding(formatterParameterValue);
        } else {
          value = formatterParameterValue?.replace(/\$\{/g, "");
          value = value?.replace(/\}/g, "");
        }
        const formatterProperty = formatter.property;
        const _temp2 = function () {
          if (matchingProperty && value) {
            const updatedProperty = {
              ...matchingProperty,
              propertyKeyForDescription: value,
              value: value
            };
            const index = updatedUnitOfMeasures.indexOf(matchingProperty);
            updatedUnitOfMeasures[index] = updatedProperty;
          } else {
            const _temp = function () {
              if (value && formatterProperty) {
                return Promise.resolve(handleFormatterWithoutMatchingProperty(formatterProperty, value, updatedUnitOfMeasures, path)).then(function () {});
              }
            }();
            if (_temp && _temp.then) return _temp.then(function () {});
          }
        }();
        if (_temp2 && _temp2.then) return _temp2.then(function () {});
      });
      return Promise.resolve(_temp3 && _temp3.then ? _temp3.then(function () {
        return updatedUnitOfMeasures;
      }) : updatedUnitOfMeasures);
    } catch (e) {
      return Promise.reject(e);
    }
  };

  /**
   * Updates the criticality options for navigation properties in the main indicator criticality options.
   *
   * @param {Array<CriticalityOptions>} mainIndicatorCriticalityOptions - The array of main indicator criticality options to be updated.
   * @param {string} path - The path used to fetch navigation properties with labels.
   * @returns {Promise<Array<CriticalityOptions>>} A promise that resolves to the updated array of main indicator criticality options.
   */
  const updateCriticalityForNavProperty = function (mainIndicatorCriticalityOptions, path) {
    try {
      const _temp6 = _forOf(mainIndicatorCriticalityOptions, function (criticality) {
        const _temp5 = function () {
          if (criticality.name.includes("/")) {
            const [criticalityName, navProp] = criticality.name.split("/");
            const _temp4 = _catch(function () {
              return Promise.resolve(getNavigationPropertiesWithLabel(Application.getInstance().fetchDetails().rootComponent, criticalityName, path)).then(function ({
                propertiesWithLabel
              }) {
                criticality.navigationKeyForId = navProp;
                criticality.navigationKeyForDescription = "";
                criticality.propertyKeyForId = navProp;
                criticality.isNavigationForId = true;
                criticality.isNavigationForDescription = false;
                criticality.name = criticalityName;
                criticality.navigationalPropertiesForId = propertiesWithLabel;
              });
            }, function (error) {
              Error("Error fetching navigation properties:" + error);
            });
            if (_temp4 && _temp4.then) return _temp4.then(function () {});
          }
        }();
        if (_temp5 && _temp5.then) return _temp5.then(function () {});
      });
      return Promise.resolve(_temp6 && _temp6.then ? _temp6.then(function () {
        return mainIndicatorCriticalityOptions;
      }) : mainIndicatorCriticalityOptions);
    } catch (e) {
      return Promise.reject(e);
    }
  };
  /**
   * Handles the formatter property when there is no matching property.
   * Updates the `updatedUnitOfMeasures` array with the appropriate data based on the formatter property.
   *
   * @param {string} formatterProperty - The formatter property to process.
   * @param {string} value - The value associated with the formatter property.
   * @param {Array<UnitOfMeasures>} updatedUnitOfMeasures - The array to update with unit of measure data.
   * @param {string} path - The path used to fetch navigation properties.
   * @returns {Promise<Array<UnitOfMeasures>>} A promise that resolves to the updated array of unit of measures.
   */
  const handleFormatterWithoutMatchingProperty = function (formatterProperty, value, updatedUnitOfMeasures, path) {
    try {
      if (!formatterProperty) {
        return Promise.resolve();
      }
      const _temp8 = function () {
        if (formatterProperty.includes("/")) {
          const [sourceProperty, navigationKeyForId] = formatterProperty.split("/");
          const _temp7 = _catch(function () {
            return Promise.resolve(getNavigationPropertiesWithLabel(Application.getInstance().fetchDetails().rootComponent, sourceProperty, path)).then(function ({
              propertiesWithLabel
            }) {
              updatedUnitOfMeasures.push({
                propertyKeyForDescription: value,
                name: formatterProperty,
                propertyKeyForId: sourceProperty,
                value: value,
                isNavigationForId: true,
                navigationKeyForId: navigationKeyForId,
                isNavigationForDescription: false,
                navigationKeyForDescription: "",
                navigationalPropertiesForId: propertiesWithLabel
              });
            });
          }, function (error) {
            Error("Error fetching navigation properties:" + error);
          });
          if (_temp7 && _temp7.then) return _temp7.then(function () {});
        } else {
          updatedUnitOfMeasures.push({
            propertyKeyForDescription: value,
            name: formatterProperty,
            propertyKeyForId: formatterProperty,
            value: value
          });
        }
      }();
      return Promise.resolve(_temp8 && _temp8.then ? _temp8.then(function () {}) : void 0);
    } catch (e) {
      return Promise.reject(e);
    }
  };
  /**
   * Creates or updates the card manifest for the card generator.
   * Fetches application details, constructs the entity context path, and generates the card manifest.
   *
   * @param {Component} appComponent - The root component of the application.
   * @param {CardManifest} cardManifest - The initial card manifest.
   * @param {JSONModel} dialogModel - The dialog model containing configuration data.
   * @returns {Promise<CardManifest>} - A promise that resolves to the created or updated card manifest.
   * @throws {Error} - Throws an error if no model is found in the view.
   */
  const createCardManifest = function (appComponent, cardManifest, dialogModel) {
    try {
      const sapApp = appComponent.getManifestEntry("sap.app");
      const {
        title,
        description: cardSubtitle,
        id
      } = sapApp;
      const oAppModel = appComponent.getModel();
      if (!oAppModel) {
        throw new Error("No model found in the view");
      }
      const applicationInstance = Application.getInstance();
      return Promise.resolve(VersionInfo.load({
        library: "sap.ui.core"
      })).then(function (sapCoreVersionInfo) {
        const {
          serviceUrl,
          entitySet,
          entitySetWithObjectContext
        } = applicationInstance.fetchDetails();
        const entitySetName = entitySet;
        const integrationCardManifest = updateExistingCardManifest(dialogModel.getProperty("/configuration/$data"), cardManifest) || createInitialManifest({
          title: title,
          subTitle: cardSubtitle,
          service: serviceUrl,
          serviceModel: oAppModel,
          sapAppId: id,
          sapCoreVersionInfo,
          entitySetName,
          entitySetWithObjectContext,
          data: dialogModel.getProperty("/configuration/$data")
        });
        return integrationCardManifest;
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  /**
   * This function checkks if a given property is a navigational property in the model.
   * @param {string} propertyName - Name of the property to check.
   * @param {JSONModel} model - The JSON model containing the card configuration.
   * @returns {boolean} - Returns true if the property is a navigational property, otherwise false.
   */
  const isNavigationalProperty = function (propertyName, model) {
    const navigationalProperties = model.getProperty("/configuration/navigationProperty") ?? [];
    for (const navigationalProperty of navigationalProperties) {
      if (navigationalProperty.name === propertyName) {
        return true;
      }
    }
    return false;
  };

  /**
   * This function returns the list of properties that are present in the card preview.
   * @param {JSONModel} model - The JSON model containing the card configuration.
   * @returns {string[]} - Array of property names present in the card preview.
   */
  const getPreviewItems = function (model) {
    const title = model.getProperty("/configuration/title");
    const subtitle = model.getProperty("/configuration/subtitle");
    const headerUOM = model.getProperty("/configuration/headerUOM");
    const properties = model.getProperty("/configuration/properties") ?? [];
    const mainIndicatorProperty = model.getProperty("/configuration/mainIndicatorStatusKey");
    const groups = model.getProperty("/configuration/groups") || [];
    const previewItems = groups.flatMap(group => group.items.map(item => item.isNavigationEnabled && item.navigationProperty ? `${item.name}/${item.navigationProperty}` : item.name));
    if (mainIndicatorProperty) {
      if (!mainIndicatorProperty.includes("/") && isNavigationalProperty(mainIndicatorProperty, model)) {
        const mainIndicatorNavigationSelectedKey = model.getProperty("/configuration/mainIndicatorNavigationSelectedKey");
        previewItems.push(`${mainIndicatorProperty}/${mainIndicatorNavigationSelectedKey}`);
      } else {
        previewItems.push(mainIndicatorProperty);
      }
    }
    [title, subtitle, headerUOM].forEach(item => {
      properties.forEach(property => {
        if (property.labelWithValue === item) {
          previewItems.push(property.name);
        }
      });
    });
    return previewItems;
  };
  var __exports = {
    __esModule: true
  };
  __exports.createInitialManifest = createInitialManifest;
  __exports.getCurrentCardManifest = getCurrentCardManifest;
  __exports.renderCardPreview = renderCardPreview;
  __exports.updateCardGroups = updateCardGroups;
  __exports.resolvePropertyLabelFromExpression = resolvePropertyLabelFromExpression;
  __exports.formatDataForV2 = formatDataForV2;
  __exports.getCriticallityStateForGroup = getCriticallityStateForGroup;
  __exports.enhanceManifestWithInsights = enhanceManifestWithInsights;
  __exports.enhanceManifestWithConfigurationParameters = enhanceManifestWithConfigurationParameters;
  __exports.addQueryParametersToManifest = addQueryParametersToManifest;
  __exports.updateExistingCardManifest = updateExistingCardManifest;
  __exports.parseCard = parseCard;
  __exports.getUpdatedUnitOfMeasures = getUpdatedUnitOfMeasures;
  __exports.updateCriticalityForNavProperty = updateCriticalityForNavProperty;
  __exports.handleFormatterWithoutMatchingProperty = handleFormatterWithoutMatchingProperty;
  __exports.createCardManifest = createCardManifest;
  __exports.getPreviewItems = getPreviewItems;
  return __exports;
});
//# sourceMappingURL=IntegrationCardHelper-dbg-dbg.js.map
