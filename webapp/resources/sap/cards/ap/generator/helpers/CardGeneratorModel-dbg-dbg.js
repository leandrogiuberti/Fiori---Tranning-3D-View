/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
"use strict";

sap.ui.define(["sap/cards/ap/common/services/RetrieveCard", "sap/ui/core/Lib", "sap/ui/core/library", "sap/ui/model/json/JSONModel", "../helpers/Batch", "../odata/ODataUtils", "../pages/Application", "./FooterActions", "./Formatter", "./IntegrationCardHelper", "./NavigationProperty"], function (sap_cards_ap_common_services_RetrieveCard, CoreLib, sap_ui_core_library, JSONModel, ___helpers_Batch, ___odata_ODataUtils, ___pages_Application, ___FooterActions, ___Formatter, ___IntegrationCardHelper, ___NavigationProperty) {
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
   * Retrieves the advanced formatting options for the card generator.
   *
   * @param {UnitOfMeasures[]} unitOfMeasures - The array of unit of measures.
   * @param {FormatterConfigurationMap} propertyValueFormatters - The map of property value formatters.
   * @param {ParsedManifest} [parsedManifest] - The parsed manifest object (optional).
   * @returns {Promise<AdvancedFormattingOptions>} A promise that resolves to the advanced formatting options.
   */
  const getAdvancedFormattingOptions = function (unitOfMeasures, propertyValueFormatters, parsedManifest, path = "") {
    try {
      const formatterConfigsWithUnit = parsedManifest?.formatterConfigurationFromCardManifest.filter(formatterConfig => formatterConfig.formatterName === "format.unit") || [];
      const mainIndicatorOptions = parsedManifest?.mainIndicatorOptions;
      let mainIndicatorCriticalityOptions = mainIndicatorOptions?.criticalityOptions || [];
      return Promise.resolve(updateCriticalityForNavProperty(mainIndicatorCriticalityOptions, path)).then(function (_updateCriticalityFor) {
        function _temp12(_getUpdatedUnitOfMeas) {
          return {
            unitOfMeasures: _getUpdatedUnitOfMeas,
            textArrangements: parsedManifest?.textArrangementsFromCardManifest || [],
            propertyValueFormatters: propertyValueFormatters,
            sourceCriticalityProperty: [],
            targetFormatterProperty: "",
            sourceUoMProperty: mainIndicatorStatusKey,
            selectedKeyCriticality: selectedKeyCriticality,
            textArrangementSourceProperty: mainIndicatorStatusKey
          };
        }
        mainIndicatorCriticalityOptions = _updateCriticalityFor;
        const selectedKeyCriticality = mainIndicatorCriticalityOptions.length ? mainIndicatorCriticalityOptions[0]?.criticality : "";
        const mainIndicatorStatusKey = mainIndicatorOptions?.mainIndicatorStatusKey || "";
        const _temp11 = formatterConfigsWithUnit.length > 0;
        return _temp11 ? Promise.resolve(getUpdatedUnitOfMeasures(unitOfMeasures, formatterConfigsWithUnit, path)).then(_temp12) : _temp12(unitOfMeasures);
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };
  /**
   * Retrieves the label with value for the main indicator's selected navigation property.
   *
   *
   * @param {Record<string, any>} selectedNavigationPropertyHeader - The selected navigation property header containing the properties.
   * @param {string} mainIndicatorNavigationSelectedKey - The key of the main indicator's selected navigation property.
   * @returns {string} The label with value of the selected navigation property, or an empty string if not found.
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
  /**
   *
   * Process the parsed manifest to get the navigation property information.
   *
   * @param {ParsedManifest} parsedManifest The parsed card manifest
   * @param {NavigationParameter} navigationProperty
   * @param {string} path
   * @param {Record<string, PropertyValue>} mData
   * @param {CardManifest} mCardManifest
   */
  const processParsedManifest = function (parsedManifest, navigationProperty, path, mData, mCardManifest) {
    try {
      function _temp10() {
        return _forOf(parsedManifest.groups, function (group) {
          const _temp0 = _forOf(group.items, function (item) {
            return Promise.resolve(getNavigationPropertyInfoGroups(item, navigationProperty, path, mCardManifest)).then(function (navigationPropertyInfoGroups) {
              if (navigationPropertyInfoGroups) {
                const {
                  navigationEntitySet,
                  navigationPropertyData
                } = navigationPropertyInfoGroups;
                if (mData[navigationEntitySet] === null || mData[navigationEntitySet] === undefined) {
                  mData[navigationEntitySet] = navigationPropertyData[navigationEntitySet];
                }
              }
            });
          });
          if (_temp0 && _temp0.then) return _temp0.then(function () {});
        });
      }
      const _temp1 = _forOf(parsedManifest.textArrangementsFromCardManifest, function (textArrangement) {
        return Promise.resolve(getNavigationPropertyInfo(textArrangement, navigationProperty, path)).then(function (navigationPropInfo) {
          if (navigationPropInfo) {
            for (const navProperty of navigationPropInfo) {
              const {
                navigationEntitySet,
                navigationPropertyData
              } = navProperty;
              if (mData[navigationEntitySet] === null || mData[navigationEntitySet] === undefined) {
                mData[navigationEntitySet] = navigationPropertyData[navigationEntitySet];
              }
            }
          }
        });
      });
      return Promise.resolve(_temp1 && _temp1.then ? _temp1.then(_temp10) : _temp10(_temp1));
    } catch (e) {
      return Promise.reject(e);
    }
  };
  const getKeyParameters = sap_cards_ap_common_services_RetrieveCard["getKeyParameters"];
  const ValueState = sap_ui_core_library["ValueState"];
  const createURLParams = ___helpers_Batch["createURLParams"];
  const createPathWithEntityContext = ___odata_ODataUtils["createPathWithEntityContext"];
  const fetchDataAsync = ___odata_ODataUtils["fetchDataAsync"];
  const getLabelForEntitySet = ___odata_ODataUtils["getLabelForEntitySet"];
  const getNavigationPropertyInfoFromEntity = ___odata_ODataUtils["getNavigationPropertyInfoFromEntity"];
  const getPropertyInfoFromEntity = ___odata_ODataUtils["getPropertyInfoFromEntity"];
  const Application = ___pages_Application["Application"];
  const ODataModelVersion = ___pages_Application["ODataModelVersion"];
  const getCardActionInfo = ___FooterActions["getCardActionInfo"];
  const formatPropertyDropdownValues = ___Formatter["formatPropertyDropdownValues"];
  const getDefaultPropertyFormatterConfig = ___Formatter["getDefaultPropertyFormatterConfig"];
  const getDefaultPropertyFormatterConfigForNavProperties = ___Formatter["getDefaultPropertyFormatterConfigForNavProperties"];
  const getUpdatedUnitOfMeasures = ___IntegrationCardHelper["getUpdatedUnitOfMeasures"];
  const parseCard = ___IntegrationCardHelper["parseCard"];
  const updateCriticalityForNavProperty = ___IntegrationCardHelper["updateCriticalityForNavProperty"];
  const getNavigationPropertiesWithLabel = ___NavigationProperty["getNavigationPropertiesWithLabel"];
  const getNavigationPropertyInfo = ___NavigationProperty["getNavigationPropertyInfo"];
  const getNavigationPropertyInfoGroups = ___NavigationProperty["getNavigationPropertyInfoGroups"];
  const updateNavigationPropertiesWithLabel = ___NavigationProperty["updateNavigationPropertiesWithLabel"];
  /**
   * Description for the interface CardGeneratorDialogConfiguration
   * @interface CardGeneratorDialogConfiguration
   * @property {string} title The title of the card
   * @property {string} subtitle The subtitle of the card
   * @property {string} headerUOM The header unit of measure
   * @property {MainIndicatorOptions} mainIndicatorOptions The main indicator options
   * @property {string} mainIndicatorStatusKey The main indicator status key
   * @property {string} navigationValue The navigation value
   * @property {string} mainIndicatorStatusUnit The main indicator status unit
   * @property {NavigationProperty[]} selectedNavigationalProperties The selected navigational properties
   * @property {string} mainIndicatorNavigationSelectedValue The main indicator navigation selected value
   * @property {string} mainIndicatorNavigationSelectedKey The main indicator navigation selected key
   * @property {string} entitySet The entity set
   * @property {PropertyInfoMap} propertiesWithNavigation The properties with navigation
   * @property {Array<ObjectCardGroups>} groups The groups of the card displayed on content
   * @property {Array<object>} properties The properties
   * @property {AdvancedFormattingOptions} advancedFormattingOptions The advanced formatting options
   * @property {Array<object>} selectedTrendOptions The selected trend options
   * @property {Array<object>} selectedIndicatorOptions The selected indicator options
   * @property {Array<object>} navigationProperty The navigation property
   * @property {Array<NavigationParameter>} selectedContentNavigation The selected content navigation
   * @property {Array<NavigationParameter>} selectedHeaderNavigation The selected header navigation
   * @property {NavigationProperty} selectedNavigationPropertyHeader The selected navigation property header
   * @property {TrendOptions} trendOptions The trend options
   * @property {SideIndicatorOptions} indicatorsValue The indicators value
   * @property {boolean} oDataV4 Flag to check if the OData version is V4
   * @property {string} serviceUrl The service URL
   * @property {object} $data Data used for adaptive card preview
   * @property {object} targetUnit The target unit
   * @property {object} deviationUnit The deviation unit
   * @property {Array<object>} errorControls The error controls
   * @property {CardActions} actions The card actions
   * @property {boolean} groupLimitReached Flag maintained to check if the group limit is reached
   * @property {Array<KeyParameter>} keyParameters The key parameters
   * @property {string} appIntent The app intent
   */
  const UnitCollection = [{
    Name: "K",
    Value: "K"
  }, {
    Name: "%",
    Value: "%"
  }];

  /**
   * Merges the default property formatters with the user provided property formatters
   *
   * @param {FormatterConfigurationMap} defaultPropertyFormatters The default property formatters
   * @param {FormatterConfigurationMap} userProvidedPropertyFormatters The user provided property formatters
   * @returns {FormatterConfigurationMap} The merged property formatters
   * @private
   *
   */
  function _mergePropertyFormatters(defaultPropertyFormatters = [], userProvidedPropertyFormatters = []) {
    const mergedFormatters = [...userProvidedPropertyFormatters];
    for (const propertyFormatter of defaultPropertyFormatters) {
      if (!mergedFormatters.find(formatter => formatter.property === propertyFormatter.property)) {
        mergedFormatters.push({
          ...propertyFormatter
        });
      }
    }
    return mergedFormatters;
  }

  /**
   * Generates the card generator dialog model.
   *
   * @param {Component} appComponent - The root component of the application.
   * @param {CardManifest} [mCardManifest] - The card manifest object (optional).
   * @returns {Promise<JSONModel>} A promise that resolves to the card generator dialog model.
   */
  const getCardGeneratorDialogModel = function (appComponent, mCardManifest) {
    try {
      const applicationInstance = Application.getInstance();
      const applicationDetails = applicationInstance.fetchDetails();
      const resourceBundle = CoreLib.getResourceBundleFor("sap.cards.ap.generator.i18n");
      const sapApp = appComponent.getManifestEntry("sap.app");
      const appModel = appComponent.getModel();
      const cardTitle = sapApp.title;
      const cardSubtitle = sapApp.description;
      const {
        entitySetWithObjectContext,
        serviceUrl,
        semanticObject,
        action,
        odataModel
      } = applicationDetails;
      const entitySetName = applicationDetails.entitySet;
      const bODataV4 = odataModel === ODataModelVersion.V4;
      const entitySet = getLabelForEntitySet(bODataV4 ? appModel : appModel, entitySetName);
      const properties = getPropertyInfoFromEntity(bODataV4 ? appModel : appModel, entitySetName, false);
      const propertiesWithNavigation = getPropertyInfoFromEntity(bODataV4 ? appModel : appModel, entitySetName, true, resourceBundle);
      const navigationProperty = getNavigationPropertyInfoFromEntity(bODataV4 ? appModel : appModel, entitySetName);
      const urlParameters = createURLParams(properties);
      return Promise.resolve(createPathWithEntityContext(entitySetWithObjectContext, bODataV4 ? appModel : appModel, bODataV4)).then(function (path) {
        return Promise.resolve(fetchDataAsync(serviceUrl, path, bODataV4, urlParameters)).then(function (data) {
          function _temp9() {
            propertyValueFormatters = _mergePropertyFormatters(propertyValueFormatters, parsedManifest?.formatterConfigurationFromCardManifest);
            addLabelsForProperties(propertiesWithNavigation, data, mData, unitOfMeasures);
            const parseManifestMainIndicatorOptions = parsedManifest?.mainIndicatorOptions;
            const mainIndicatorStatusKey = parseManifestMainIndicatorOptions?.mainIndicatorStatusKey || "";
            const trends = parseManifestMainIndicatorOptions?.trendOptions;
            const sideIndicators = parsedManifest?.sideIndicatorOptions;
            const mainIndicatorNavigationSelectedKey = parseManifestMainIndicatorOptions?.mainIndicatorNavigationSelectedKey || "";
            const selectedNavigationalProperties = [];
            return Promise.resolve(getNavigationPropertiesWithLabel(appComponent, mainIndicatorStatusKey, path)).then(function ({
              propertiesWithLabel,
              navigationPropertyData
            }) {
              const selectedNavigationPropertyHeader = {
                name: mainIndicatorStatusKey,
                value: propertiesWithLabel
              };
              if (selectedNavigationPropertyHeader?.value) {
                updateNavigationPropertiesWithLabel(navigationProperty, mainIndicatorStatusKey, selectedNavigationPropertyHeader.value);
              }
              if (mainIndicatorStatusKey.length > 0 && (mData[mainIndicatorStatusKey] === null || mData[mainIndicatorStatusKey] === undefined)) {
                mData[mainIndicatorStatusKey] = navigationPropertyData[mainIndicatorStatusKey];
              }
              if (selectedNavigationPropertyHeader.name) {
                selectedNavigationalProperties.push(selectedNavigationPropertyHeader);
              }
              const mainIndicatorNavigationSelectedValue = getMainIndicatorSelectedNavigationProperty(selectedNavigationPropertyHeader, mainIndicatorNavigationSelectedKey);
              return Promise.resolve(getAdvancedFormattingOptions(unitOfMeasures, propertyValueFormatters, parsedManifest, path)).then(function (advancedFormattingOptions) {
                const mainIndicatorStatusUnit = getMainIndicatorStatusUnit(mainIndicatorStatusKey, propertiesWithNavigation);
                const _temp7 = `${entitySet}`,
                  _temp6 = parsedManifest?.groups || [{
                    title: resourceBundle?.getText("GENERATOR_DEFAULT_GROUP_NAME", [1]),
                    items: [{
                      label: "",
                      value: "",
                      isEnabled: false,
                      name: "",
                      navigationProperty: "",
                      isNavigationEnabled: false
                    }]
                  }],
                  _temp5 = parseManifestMainIndicatorOptions?.navigationValue || "",
                  _temp4 = trends,
                  _criticality = {
                    criticality: parseManifestMainIndicatorOptions?.criticalityOptions || []
                  },
                  _temp3 = parsedManifest?.headerUOM || "",
                  _temp2 = parsedManifest?.subtitle || cardSubtitle,
                  _temp = parsedManifest?.title || cardTitle;
                return Promise.resolve(getCardActionInfo(mData, appComponent.getModel("i18n"), mCardManifest)).then(function (_getCardActionInfo) {
                  return Promise.resolve(getKeyParameters(appComponent)).then(function (_getKeyParameters) {
                    const dialogModelData = {
                      title: _temp7,
                      configuration: {
                        title: _temp,
                        subtitle: _temp2,
                        headerUOM: _temp3,
                        mainIndicatorOptions: _criticality,
                        advancedFormattingOptions: advancedFormattingOptions,
                        trendOptions: _temp4,
                        indicatorsValue: sideIndicators,
                        selectedTrendOptions: trends ? [trends] : [],
                        selectedIndicatorOptions: sideIndicators ? [sideIndicators] : [],
                        selectedNavigationPropertyHeader,
                        selectedContentNavigation: [],
                        selectedHeaderNavigation: [],
                        navigationProperty,
                        mainIndicatorNavigationSelectedValue,
                        mainIndicatorStatusKey,
                        navigationValue: _temp5,
                        mainIndicatorNavigationSelectedKey,
                        mainIndicatorStatusUnit,
                        selectedNavigationalProperties,
                        entitySet: entitySetName,
                        oDataV4: bODataV4,
                        serviceUrl: serviceUrl,
                        properties: properties,
                        propertiesWithNavigation: propertiesWithNavigation,
                        groups: _temp6,
                        $data: mData,
                        targetUnit: UnitCollection,
                        deviationUnit: UnitCollection,
                        errorControls: [],
                        actions: _getCardActionInfo,
                        groupLimitReached: false,
                        keyParameters: _getKeyParameters,
                        appIntent: `${semanticObject}-${action}`,
                        isEdited: false
                      }
                    };
                    return new JSONModel(dialogModelData).attachPropertyChange(function () {
                      dialogModelData.configuration.isEdited = true;
                    });
                  });
                });
              });
            });
          }
          const unitOfMeasures = [];
          const mData = {};
          // We are adding labels and values for properties
          addLabelsForProperties(properties, data, mData, unitOfMeasures);
          let propertyValueFormatters = getPropertyFormatters(resourceBundle, properties, navigationProperty);
          let parsedManifest;
          const _temp8 = function () {
            if (mCardManifest) {
              parsedManifest = parseCard(mCardManifest, appComponent.getModel("i18n"), properties);
              return Promise.resolve(processParsedManifest(parsedManifest, navigationProperty, path, mData, mCardManifest)).then(function () {});
            }
          }();
          return _temp8 && _temp8.then ? _temp8.then(_temp9) : _temp9(_temp8);
        });
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  /**
   * Adds labels for properties and updates the unit of measures array.
   *
   * @param {PropertyInfoMap} properties - The map of properties to be updated with labels.
   * @param {Record<string, unknown>} data - The data record containing property values.
   * @param {Record<string, PropertyValue>} mData - The map to store updated property values.
   * @param {Array<object>} unitOfMeasures - The array of unit of measures to be updated.
   */
  function addLabelsForProperties(properties, data, mData, unitOfMeasures) {
    const unitOfMeasuresMap = new Map(unitOfMeasures.map(uom => [uom.name, uom]));
    properties.forEach(property => {
      const propertyName = property.name;
      const propertyValue = data[propertyName];
      const propertyUOM = property.UOM;
      if (propertyName && propertyValue !== undefined && propertyValue !== null) {
        const value = formatPropertyDropdownValues(property, propertyValue);
        property.value = propertyValue;
        property.labelWithValue = value;
        if (propertyUOM && !unitOfMeasuresMap.has(propertyName)) {
          unitOfMeasures.push({
            propertyKeyForDescription: propertyUOM,
            name: propertyName,
            propertyKeyForId: propertyName,
            value: propertyUOM,
            valueState: ValueState.None,
            valueStateText: ""
          });
        }
        mData[propertyName] = propertyValue;
      } else {
        property.labelWithValue = property.category ? `${property.label}` : `${property.label} (<empty>)`;
      }
    });
  }

  /**
   * Gets the property formatters for the card generator dialog.
   * The property formatters are merged from the default property formatters and the navigational property formatters.
   *
   * @param {ResourceBundle} resourceBundle The resource bundle
   * @param {PropertyInfoMap} properties The properties
   * @param {NavigationParameter} navigationProperty The navigation property
   * @returns
   */
  function getPropertyFormatters(resourceBundle, properties, navigationProperty) {
    const propertyValueFormatters = getDefaultPropertyFormatterConfig(resourceBundle, properties);
    const propertyValueFormattersForNavigationalProperties = getDefaultPropertyFormatterConfigForNavProperties(resourceBundle, navigationProperty);
    return _mergePropertyFormatters(propertyValueFormatters, propertyValueFormattersForNavigationalProperties);
  }
  function getMainIndicatorSelectedNavigationProperty(selectedNavigationPropertyHeader, mainIndicatorNavigationSelectedKey) {
    return selectedNavigationPropertyHeader.value.find(value => value.name === mainIndicatorNavigationSelectedKey)?.labelWithValue || "";
  }

  /**
   * Retrieves the label with value for the main indicator's status unit.
   *
   * @param {string} mainIndicatorStatusKey - The key of the main indicator's status property.
   * @param {PropertyInfoMap} propertiesWithNavigation - The map of properties with navigation.
   * @returns {string} The label with value of the main indicator's status unit, or an empty string if not found.
   */
  function getMainIndicatorStatusUnit(mainIndicatorStatusKey, propertiesWithNavigation) {
    return mainIndicatorStatusKey && propertiesWithNavigation.find(property => property.name === mainIndicatorStatusKey)?.labelWithValue || "";
  }
  var __exports = {
    __esModule: true
  };
  __exports._mergePropertyFormatters = _mergePropertyFormatters;
  __exports.getCardGeneratorDialogModel = getCardGeneratorDialogModel;
  __exports.addLabelsForProperties = addLabelsForProperties;
  return __exports;
});
//# sourceMappingURL=CardGeneratorModel-dbg-dbg.js.map
