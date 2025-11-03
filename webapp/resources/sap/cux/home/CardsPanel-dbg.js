/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/f/GridContainer", "sap/f/GridContainerSettings", "sap/fe/navigation/SelectionVariant", "sap/insights/CardHelper", "sap/insights/base/InMemoryCachingHost", "sap/m/HBox", "sap/m/HeaderContainer", "sap/m/VBox", "sap/ui/core/EventBus", "sap/ui/integration/widgets/Card", "sap/ui/model/json/JSONModel", "sap/ushell/Container", "sap/ushell/api/S4MyHome", "./BasePanel", "./MenuItem", "./utils/AppManager", "./utils/CommonUtils", "./utils/Constants", "./utils/DataFormatUtils", "./utils/Device", "./utils/DragDropUtils", "./utils/FESRUtil", "./utils/InsightsUtils", "./utils/PersonalisationUtils", "./utils/UshellPersonalizer"], function (Log, GridContainer, GridContainerSettings, SelectionVariant, CardHelper, InsightsInMemoryCachingHost, HBox, HeaderContainer, VBox, EventBus, Card, JSONModel, Container, S4MyHome, __BasePanel, __MenuItem, __AppManager, ___utils_CommonUtils, ___utils_Constants, ___utils_DataFormatUtils, ___utils_Device, ___utils_DragDropUtils, ___utils_FESRUtil, ___utils_InsightsUtils, __PersonalisationUtils, __UShellPersonalizer) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
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
  const BasePanel = _interopRequireDefault(__BasePanel);
  function _finallyRethrows(body, finalizer) {
    try {
      var result = body();
    } catch (e) {
      return finalizer(true, e);
    }
    if (result && result.then) {
      return result.then(finalizer.bind(null, false), finalizer.bind(null, true));
    }
    return finalizer(false, result);
  }
  const MenuItem = _interopRequireDefault(__MenuItem);
  const AppManager = _interopRequireDefault(__AppManager);
  const getPageManagerInstance = ___utils_CommonUtils["getPageManagerInstance"];
  const PREFERED_CARDS = ___utils_Constants["PREFERED_CARDS"];
  const SETTINGS_PANELS_KEYS = ___utils_Constants["SETTINGS_PANELS_KEYS"];
  const recycleId = ___utils_DataFormatUtils["recycleId"];
  const calculateCardWidth = ___utils_Device["calculateCardWidth"];
  const DeviceType = ___utils_Device["DeviceType"];
  const fetchElementProperties = ___utils_Device["fetchElementProperties"];
  const focusDraggedItem = ___utils_DragDropUtils["focusDraggedItem"];
  const addFESRId = ___utils_FESRUtil["addFESRId"];
  const createShowMoreActionButton = ___utils_InsightsUtils["createShowMoreActionButton"];
  const createShowMoreMenuItem = ___utils_InsightsUtils["createShowMoreMenuItem"];
  const getAssociatedFullScreenMenuItem = ___utils_InsightsUtils["getAssociatedFullScreenMenuItem"];
  const sortMenuItems = ___utils_InsightsUtils["sortMenuItems"];
  const targetsAreEqual = ___utils_InsightsUtils["targetsAreEqual"];
  const PersonalisationUtils = _interopRequireDefault(__PersonalisationUtils);
  const UShellPersonalizer = _interopRequireDefault(__UShellPersonalizer);
  var cardsMenuItems = /*#__PURE__*/function (cardsMenuItems) {
    cardsMenuItems["REFRESH"] = "cards-refresh";
    cardsMenuItems["EDIT_CARDS"] = "cards-editCards";
    cardsMenuItems["AI_INSIGHT_CARD"] = "cards-addAIInsightCard";
    return cardsMenuItems;
  }(cardsMenuItems || {});
  var cardsContainerMenuItems = /*#__PURE__*/function (cardsContainerMenuItems) {
    cardsContainerMenuItems["REFRESH"] = "container-cards-refresh";
    cardsContainerMenuItems["EDIT_CARDS"] = "container-cards-editCards";
    cardsContainerMenuItems["SHOW_MORE"] = "cardsContainerFullScreenMenuItem";
    cardsContainerMenuItems["AI_INSIGHT_CARD"] = "container-cards-addAIInsightCard";
    return cardsContainerMenuItems;
  }(cardsContainerMenuItems || {});
  var cardsContainerActionButtons = /*#__PURE__*/function (cardsContainerActionButtons) {
    cardsContainerActionButtons["SHOW_MORE"] = "cardsContanerFullScreenActionButton";
    return cardsContainerActionButtons;
  }(cardsContainerActionButtons || {});
  const sortedMenuItems = [cardsMenuItems.REFRESH, cardsMenuItems.EDIT_CARDS, cardsMenuItems.AI_INSIGHT_CARD, "showMore", "settings"];
  const Constants = {
    PLACEHOLDER_CARD_COUNT: 10,
    CARDS_GAP: 16
  };
  const RECOMMENDATION_PATH = "showRecommendation";
  let runtimeHostCreated = false;

  /**
   *
   * Panel class for managing and storing Insights Cards.
   *
   * @extends sap.cux.home.BasePanel
   *
   * @author SAP SE
   * @version 0.0.1
   * @since 1.122.0
   *
   * @private
   * @ui5-restricted ux.eng.s4producthomes1
   *
   * @alias sap.cux.home.CardsPanel
   */
  const CardsPanel = BasePanel.extend("sap.cux.home.CardsPanel", {
    metadata: {
      library: "sap.cux.home",
      properties: {
        title: {
          type: "string",
          group: "Misc",
          defaultValue: "",
          visibility: "hidden"
        },
        key: {
          type: "string",
          group: "Misc",
          defaultValue: "",
          visibility: "hidden"
        },
        fullScreenName: {
          type: "string",
          group: "Misc",
          defaultValue: "SI2",
          visibility: "hidden"
        }
      },
      defaultAggregation: "cards",
      aggregations: {
        /**
         * Specifies the content aggregation of the panel.
         */
        content: {
          multiple: true,
          singularName: "content",
          visibility: "hidden"
        },
        /**
         * Aggregation of cards available within the cards panel
         */
        cards: {
          type: "sap.ui.integration.widgets.Card",
          multiple: true,
          singularName: "card",
          visibility: "hidden"
        },
        /**
         * Aggregation of the integration host used by the cards panel.
         */
        host: {
          type: "sap.ui.integration.Host",
          multiple: false,
          singularName: "host",
          visibility: "hidden"
        }
      },
      events: {
        handleHidePanel: {
          parameters: {}
        },
        handleUnhidePanel: {
          parameters: {}
        },
        /**
         * Event is fired when cards in viewport are updated.
         */
        visibleCardsUpdated: {
          parameters: {
            cards: {
              type: "sap.ui.integration.widgets.Card[]"
            }
          }
        }
      }
    },
    /**
     * Constructor for a new card panel.
     *
     * @param {string} [id] ID for the new control, generated automatically if an ID is not provided
     * @param {object} [settings] Initial settings for the new control
     */
    constructor: function _constructor(id, settings) {
      BasePanel.prototype.constructor.call(this, id, settings);
      this.aVisibleCardInstances = [];
      this.cardsInViewport = [];
      this._appSwitched = false;
      this._headerVisible = false;
    },
    /**
     * Initializes the Cards Panel.
     *
     * @private
     * @override
     */
    init: function _init() {
      const _this = this;
      BasePanel.prototype.init.call(this);
      this.setProperty("key", "cards");
      this.setProperty("enableFullScreen", true);
      this.cardWidth = "19rem";
      this.cardHeight = this.getDeviceType() === DeviceType.Mobile ? "25.5rem" : "33rem";

      //Initialize Tiles Model
      this._oData = {
        userVisibleCards: [],
        userAllCards: [],
        isPhone: this.getDeviceType() === DeviceType.Mobile
      };
      this._controlModel = new JSONModel(this._oData);
      this.appManagerInstance = AppManager.getInstance();
      this._controlMap = new Map();
      // Setup Menu Items
      const refreshMenuItem = this._createRefreshMenuItem(cardsMenuItems.REFRESH, "cardsRefresh");
      const editCardsMenuItem = this._createEditCardsMenuItem(cardsMenuItems.EDIT_CARDS, "manageCards");
      const menuItems = [refreshMenuItem, editCardsMenuItem];
      menuItems.forEach(menuItem => this.addAggregation("menuItems", menuItem));
      this._sortMenuItems(sortedMenuItems);
      this.oEventBus = EventBus.getInstance();
      // Subscribe to the event
      this.oEventBus.subscribe("importChannel", "cardsImport", function (sChannelId, sEventId, oData) {
        try {
          return Promise.resolve(_this._createCards(oData)).then(function () {
            return Promise.resolve(_this.rerenderCards()).then(function () {
              _this._importdone();
            });
          });
        } catch (e) {
          return Promise.reject(e);
        }
      }, this);

      // Setup Wrapper for Cards
      this._setupWrapper();

      // Toggles the activity of cards
      this._toggleCardActivity();
    },
    /**
     * Toggles the activity of cards on route change.
     *
     * @private
     * @returns {void}
     */
    _toggleCardActivity: function _toggleCardActivity() {
      const _this2 = this;
      const toggleUserActions = function (event) {
        try {
          const show = event.getParameter("isMyHomeRoute");
          const _temp2 = function () {
            if (show) {
              const _temp = function () {
                if (_this2._appSwitched) {
                  return Promise.resolve(_this2.rerenderCards()).then(function () {
                    _this2._appSwitched = false;
                  });
                }
              }();
              if (_temp && _temp.then) return _temp.then(function () {});
            } else {
              _this2._appSwitched = true;
            }
          }();
          return Promise.resolve(_temp2 && _temp2.then ? _temp2.then(function () {}) : void 0);
        } catch (e) {
          return Promise.reject(e);
        }
      };
      try {
        S4MyHome.attachRouteMatched({}, toggleUserActions, this);
      } catch (error) {
        Log.warning(error instanceof Error ? error.message : String(error));
      }
    },
    /**
     * Create imported cards
     * @param {ICardManifest[]} aCards - array of card manifests
     * @returns {any}
     */
    _createCards: function _createCards(aCards) {
      try {
        const _this3 = this;
        return Promise.resolve(_this3.cardHelperInstance?._createCards(aCards)).then(function () {
          return _this3.rerenderCards();
        });
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Retrieves a manifest entry from a card.
     * If the manifest entry is not immediately available, it waits for the manifest to be ready.
     *
     * @param {object} oCard - The card object from which to retrieve the manifest entry.
     * @param {string} sEntry - The manifest entry key to retrieve.
     * @returns {Promise<ICardManifest | undefined>} A promise that resolves with the manifest entry value.
     */
    _getManifestEntryFromCard: function _getManifestEntryFromCard(oCard, sEntry) {
      const cardWithManifestPromise = oCard;
      const manifestEntry = oCard.getManifestEntry(sEntry);
      if (manifestEntry) {
        return Promise.resolve(manifestEntry);
      } else {
        if (!cardWithManifestPromise._pManifestReady) {
          cardWithManifestPromise._pManifestReady = new Promise(resolve => {
            oCard.attachManifestReady(() => {
              resolve(oCard.getManifestEntry(sEntry));
            });
          });
        }
        return cardWithManifestPromise._pManifestReady;
      }
    },
    /**
     * Adds a runtime host for the cards panel.
     *
     * @private
     */
    _addRuntimeHost: function _addRuntimeHost() {
      const _this4 = this,
        _this5 = this,
        _this6 = this,
        _this7 = this,
        _this8 = this;
      const host = this.getAggregation("host") || new InsightsInMemoryCachingHost("runtimeHost");
      const action = function (oEvent) {
        try {
          const sType = oEvent.getParameter("type");
          let oParameters = oEvent.getParameter("parameters") || {};
          const _temp3 = function () {
            if (sType === "Navigation" && oParameters.ibnTarget) {
              oEvent.preventDefault();
              const oCard = oEvent.getParameter("card") || {},
                oIntegrationCardManifest = oCard?.getManifestEntry("sap.card") || {},
                aHeaderActions = oIntegrationCardManifest?.header?.actions || [];

              //processing semantic date as param for navigation
              //check to verify if _semanticDateRangeSetting property is present in manifest
              let oCheckSemanticProperty;
              if (oIntegrationCardManifest?.configuration?.parameters?._semanticDateRangeSetting?.value) {
                oCheckSemanticProperty = JSON.parse(oIntegrationCardManifest.configuration.parameters._semanticDateRangeSetting.value);
              }
              if (oCheckSemanticProperty && Object.keys(oCheckSemanticProperty).length) {
                oParameters = _this4.cardHelperInstance.processSemanticDate(oParameters, oIntegrationCardManifest);
              }
              let aContentActions = _this4.getContentActions(oIntegrationCardManifest);
              const oHeaderAction = aHeaderActions[0] || {},
                oContentAction = aContentActions[0] || {};
              const bOldCardExtension = !!(oHeaderAction?.parameters && typeof oHeaderAction.parameters === "string" && oHeaderAction.parameters.indexOf("{= extension.formatters.addPropertyValueToAppState") > -1 || oContentAction?.parameters && typeof oContentAction.parameters === "string" && oContentAction.parameters.indexOf("{= extension.formatters.addPropertyValueToAppState") > -1);
              _this4._manageOldCardExtension(bOldCardExtension, oEvent, oParameters);
              return Promise.resolve(Container.getServiceAsync("Navigation")).then(function (navigationService) {
                return Promise.resolve(navigationService.navigate({
                  target: oParameters.ibnTarget,
                  params: oParameters.ibnParams
                })).then(function () {});
              });
            }
          }();
          return Promise.resolve(_temp3 && _temp3.then ? _temp3.then(function () {}) : void 0);
        } catch (e) {
          return Promise.reject(e);
        }
      };
      const actions = [{
        type: "Custom",
        text: this._i18nBundle?.getText("refresh"),
        icon: "sap-icon://refresh",
        action: oCard => {
          this._refreshCardData(oCard);
        },
        visible: function (oCard) {
          try {
            return Promise.resolve(_this5._getManifestEntryFromCard(oCard, "sap.insights")).then(function (oEntry) {
              return oEntry && !oEntry.cacheType;
            });
          } catch (e) {
            return Promise.reject(e);
          }
        }
      }, {
        type: "Custom",
        text: this._i18nBundle?.getText("viewFilteredBy"),
        icon: "sap-icon://filter",
        action: oCard => {
          const cardId = oCard.getManifestEntry("sap.app").id;
          this.getParent()?._getLayout().openSettingsDialog(SETTINGS_PANELS_KEYS.INSIGHTS_CARDS, {
            cardId
          });
        },
        visible: function (oCard) {
          try {
            return Promise.resolve(_this6._getManifestEntryFromCard(oCard, "sap.insights")).then(function (oEntry) {
              if (oEntry) {
                const oCardParams = oCard.getManifestEntry("sap.card")?.configuration?.parameters;
                const aRelevantFilters = oCardParams?._relevantODataFilters?.value || [];
                const bRelevantFilters = aRelevantFilters?.length;
                const aRelevantParams = oCardParams?._relevantODataParameters?.value || [];
                const bRelevantParams = aRelevantParams?.length;
                const oCardDataSource = oCard.getManifestEntry("sap.app").dataSources;
                const oFilterService = oCardDataSource?.filterService;
                const oDataSourceSettings = oFilterService?.settings;
                // show ViewFilteredBy Option only if relevantFilters or relevantParameters are there and is OdataV2 version
                return !!((bRelevantFilters || bRelevantParams) && oDataSourceSettings && oDataSourceSettings.odataVersion === "2.0");
              } else {
                return false;
              }
            });
          } catch (e) {
            return Promise.reject(e);
          }
        }
      }, {
        type: "Custom",
        text: this._i18nBundle?.getText("navigateToParent"),
        icon: "sap-icon://display-more",
        visible: function (oCard) {
          try {
            return Promise.resolve(_this7._getManifestEntryFromCard(oCard, "sap.insights").then(function (oEntry) {
              try {
                if (oEntry) {
                  return Promise.resolve(_this7.cardHelperInstance.getParentAppDetails({
                    descriptorContent: oCard.getManifestEntry("/")
                  })).then(function (parentApp) {
                    if (parentApp.semanticObject && parentApp.action) {
                      return Promise.resolve(Container.getServiceAsync("Navigation")).then(function (navigationService) {
                        const intents = [{
                          target: {
                            semanticObject: parentApp.semanticObject,
                            action: parentApp.action
                          }
                        }];
                        return Promise.resolve(navigationService.isNavigationSupported(intents)).then(function (_navigationService$is) {
                          const aResponses = _navigationService$is;
                          return aResponses[0].supported || false;
                        });
                      });
                    } else {
                      return true;
                    }
                  });
                } else {
                  return Promise.resolve(false);
                }
              } catch (e) {
                return Promise.reject(e);
              }
            }));
          } catch (e) {
            return Promise.reject(e);
          }
        },
        action: function (oCard) {
          try {
            return Promise.resolve(_this8.cardHelperInstance.getParentAppDetails({
              descriptorContent: oCard.getManifestEntry("/")
            })).then(function (parentApp) {
              const sShellHash = parentApp.semanticURL || parentApp.semanticObject;
              return Promise.resolve(Container.getServiceAsync("Navigation")).then(function (navigationService) {
                return Promise.resolve(navigationService.navigate({
                  target: {
                    shellHash: sShellHash
                  }
                })).then(function () {});
              });
            });
          } catch (e) {
            return Promise.reject(e);
          }
        }
      }];
      host.attachAction(action);
      host.setProperty("actions", actions);
      this.setAggregation("host", host);
    },
    /**
     * Updates parameters for an old card extension
     * @private
     * @param {boolean} bOldCardExtension - Determines whether the card is using an old card extension.
     * @param {IcardActionEvent} oEvent - An event object
     * @param {ICardActionParameters} oParameters - Parameter object
     */
    _manageOldCardExtension: function _manageOldCardExtension(bOldCardExtension, oEvent, oParameters) {
      if (bOldCardExtension) {
        const oCardSV = new SelectionVariant();
        const oCardParams = oEvent.getParameter("card").getCombinedParameters();
        (oCardParams?._relevantODataParameters).forEach(sParamName => {
          if (oParameters.ibnParams) {
            oParameters.ibnParams[sParamName] = oCardParams[sParamName];
          }
        });
        (oCardParams?._relevantODataFilters).forEach(sFilterName => {
          const oCardParamsFilterName = JSON.parse(oCardParams[sFilterName]);
          const aSelectOptions = oCardParamsFilterName.SelectOptions[0];
          const aRanges = aSelectOptions.Ranges;
          if (aRanges?.length === 1 && aRanges[0].Sign === "I" && aRanges[0].Option === "EQ") {
            if (oParameters.ibnParams) {
              oParameters.ibnParams[sFilterName] = aRanges[0].Low;
            }
          } else if (aRanges?.length > 0) {
            oCardSV.massAddSelectOption(sFilterName, aRanges);
          }
        });
        const oTempParam = JSON.parse(oParameters?.ibnParams?.["sap-xapp-state-data"]);
        oTempParam.selectionVariant = oCardSV.toJSONObject();
        if (oParameters.ibnParams) {
          oParameters.ibnParams["sap-xapp-state-data"] = JSON.stringify(oTempParam);
        }
      }
    },
    /**
     * Retrieves actions for a card based on its content type.
     *
     * @private
     * @param {ISapCard} manifest - The manifest object.
     * @returns {Array} The content actions.
     */
    getContentActions: function _getContentActions(manifest) {
      let actions;
      if (manifest.type === "List") {
        actions = manifest?.content?.item?.actions;
      } else if (manifest.type === "Table") {
        actions = manifest?.content?.row?.actions;
      } else {
        actions = manifest?.content?.actions;
      }
      return actions || [];
    },
    /**
     * Handles the completion of the import process.
     *
     * @private
     */
    _importdone: function _importdone() {
      const stateData = {
        status: true
      };
      this.oEventBus.publish("importChannel", "cardsImported", stateData);
    },
    /**
     * Refreshes the data for a given card.
     *
     * @private
     * @param {Card} oCard - The card to refresh.
     */
    _refreshCardData: function _refreshCardData(oCard) {
      sap.ui.require(["sap/insights/base/CacheData"], InsightsCacheData => {
        const sCardId = oCard.getManifestEntry("sap.app")?.id;
        const cacheDataInstance = InsightsCacheData.getInstance();
        cacheDataInstance.clearCache(sCardId);
        oCard.refreshData();
      });
    },
    /**
     * Triggers a full refresh of the Insights Cards's data and UI.
     *
     * Reloads all the user cards within the Insights Cards section by reinitializing relevant services
     * and re-rendering the panel.
     *
     * @public
     * @returns {Promise<void>} A promise that resolves once the Insights Cards section has been refreshed.
     */
    refreshData: function _refreshData() {
      try {
        const _this9 = this;
        const _temp4 = _catch(function () {
          return Promise.resolve(CardHelper.getServiceAsync()).then(function (_getServiceAsync) {
            _this9.cardHelperInstance = _getServiceAsync;
            return Promise.resolve(_this9.cardHelperInstance._refreshUserCards(false)).then(function () {
              return Promise.resolve(_this9.renderPanel()).then(function () {});
            });
          });
        }, function (error) {
          Log.error("Failed to refresh cards: ", error instanceof Error ? error.message : error);
        });
        return Promise.resolve(_temp4 && _temp4.then ? _temp4.then(function () {}) : void 0);
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Renders the panel.
     *
     * @private
     * @returns {Promise<void>} A promise that resolves when the panel is rendered.
     */
    renderPanel: function _renderPanel() {
      try {
        const _this0 = this;
        function _temp6() {
          return Promise.resolve(_this0.rerenderCards()).then(function () {
            _this0.fireEvent("loaded");
          });
        }
        const _temp5 = function () {
          if (!_this0.cardHelperInstance) {
            _this0.pageManagerInstance = _this0.pageManagerInstance || getPageManagerInstance(_this0);
            return Promise.resolve(Promise.all([CardHelper.getServiceAsync(), _this0.pageManagerInstance.hasCustomSpace()])).then(function ([cardHelperInstance, hasCustomSpace]) {
              _this0.cardHelperInstance = cardHelperInstance;
              _this0.hasCustomSpace = hasCustomSpace;
            });
          }
        }();
        return Promise.resolve(_temp5 && _temp5.then ? _temp5.then(_temp6) : _temp6(_temp5));
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Rerenders the cards.
     *
     * @private
     * @returns {Promise<void>} A promise that resolves when the cards are rerendered.
     */
    rerenderCards: function _rerenderCards(skipRecommendation = false) {
      try {
        const _this1 = this;
        if (!_this1._cardsRendered) {
          _this1._cardsRendered = new Promise((resolve, reject) => {
            void function () {
              try {
                const _temp10 = _catch(function () {
                  // Enable placeholders after updating/rerendering cards
                  const sDefaultAggreName = _this1._getCardContainer().getMetadata().getDefaultAggregationName();
                  _this1._getCardContainer().removeAllAggregation(sDefaultAggreName);
                  _this1._showPlaceHolders();
                  // Fetch Cards from insights service
                  const preferedCardIDs = _this1.hasCustomSpace ? PREFERED_CARDS : [];
                  return Promise.resolve(_this1.cardHelperInstance?._getUserVisibleCardModel(preferedCardIDs)).then(function (userVisibleCardModel) {
                    const aCards = userVisibleCardModel.getProperty("/cards");
                    const listBinding = userVisibleCardModel?.bindList("/cards");
                    if (!listBinding.hasListeners("change")) {
                      listBinding?.enableExtendedChangeDetection(true, "/cards", {});
                      listBinding?.attachChange(function () {
                        try {
                          return Promise.resolve(_this1._cardsRendered ?? Promise.resolve()).then(function () {
                            const visibleCards = userVisibleCardModel.getProperty("/cards");
                            if (visibleCards.length !== _this1.aVisibleCardInstances.length && visibleCards.length > 0) {
                              _this1._showCards(visibleCards);
                            } else if (!visibleCards.length) {
                              _this1.fireHandleHidePanel();
                            }
                          });
                        } catch (e) {
                          return Promise.reject(e);
                        }
                      });
                    }
                    _this1._controlModel.setProperty("/userVisibleCards", aCards);
                    return Promise.resolve(_this1.getPersonalisationProperty(RECOMMENDATION_PATH)).then(function (showRecommendation) {
                      function _temp1() {
                        _this1._cardsRendered = undefined;
                        resolve();
                      }
                      const _temp0 = function () {
                        if (aCards.length === 0 && showRecommendation === undefined && !skipRecommendation) {
                          return Promise.resolve(_this1._getRecommendationCards()).then(function () {});
                        } else {
                          const _temp9 = function () {
                            if (aCards.length) {
                              function _temp8() {
                                // from available cards, check for old recommended cards and update it if present,
                                // else show available visible cards
                                return Promise.resolve(_this1.checkForRecommendedCards(aCards)).then(function () {});
                              }
                              const _temp7 = function () {
                                if (showRecommendation === undefined) {
                                  return Promise.resolve(_this1._updateRecommendationStatus()).then(function () {});
                                }
                              }();
                              return _temp7 && _temp7.then ? _temp7.then(_temp8) : _temp8(_temp7);
                            } else {
                              _this1.fireHandleHidePanel();
                            }
                          }();
                          if (_temp9 && _temp9.then) return _temp9.then(function () {});
                        }
                      }();
                      return _temp0 && _temp0.then ? _temp0.then(_temp1) : _temp1(_temp0);
                    });
                  });
                }, function (error) {
                  _this1.fireHandleHidePanel();
                  _this1._cardsRendered = undefined;
                  if (error instanceof Error) {
                    Log.error(error.message);
                    reject(error);
                  }
                });
                return Promise.resolve(_temp10 && _temp10.then ? _temp10.then(function () {}) : void 0);
              } catch (e) {
                return Promise.reject(e);
              }
            }();
          });
        }
        return Promise.resolve(_this1._cardsRendered);
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Sets the new visible cards in the model and updates the UI.
     * @private
     */
    setNewVisibleCards: function _setNewVisibleCards() {
      try {
        const _this10 = this;
        const preferedCardIDs = _this10.hasCustomSpace ? PREFERED_CARDS : [];
        return Promise.resolve(_this10.cardHelperInstance._getUserVisibleCardModel(preferedCardIDs)).then(function (visibleCardModel) {
          const aNewCards = visibleCardModel.getProperty("/cards");
          _this10._controlModel.setProperty("/userVisibleCards", aNewCards);
          _this10._showCards(aNewCards);
        });
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Checks for recommended cards and updates their manifests if necessary.
     *
     * This method iterates through the provided cards to identify recommended cards that need to be updated.
     * It regenerates the manifests for these cards, updates the model with the regenerated cards, and displays
     * the updated cards. If no recommended cards are found, it displays the original cards.
     *
     * @param {ICard[]} aCards - An array of card objects to check for recommendations.
     * Each card contains a `descriptorContent` property with metadata about the card.
     * @returns {Promise<void>} A promise that resolves when the check and updates are complete.
     * @private
     */
    checkForRecommendedCards: function _checkForRecommendedCards(aCards) {
      try {
        const _this11 = this;
        let manifestIds = [];
        aCards.forEach((oVisCard, idx) => {
          let oCard = oVisCard.descriptorContent;
          if (oCard["sap.card"]?.rec === true && (!oCard["sap.card"]["configuration"] || !oCard["sap.card"]["configuration"]["csrfTokens"])) {
            manifestIds.push({
              cardId: oCard?.["sap.app"]?.id,
              rank: oCard?.["sap.insights"]?.ranking || oVisCard?.rank,
              id: oCard?.["sap.insights"]?.["parentAppId"] || "",
              target: oCard?.["sap.card"]?.["header"]?.["actions"]?.length ? oCard["sap.card"]["header"]["actions"][0]?.["parameters"]?.ibnTarget : undefined,
              index: idx
            });
          }
        });
        return Promise.resolve(function () {
          if (manifestIds.length) {
            const uniqueManifestDetails = _this11.getUniqueManifestDetails(manifestIds);
            return Promise.resolve(_this11.regenerateCards(uniqueManifestDetails, manifestIds)).then(function (aUpdatedCards) {
              let _exit2 = false;
              function _temp12(_result2) {
                return _exit2 ? _result2 : Promise.resolve(_this11.setNewVisibleCards()).then(function () {});
              }
              const _temp11 = function () {
                if (aUpdatedCards?.length) {
                  // Update the model with updated cards
                  return Promise.resolve(_this11.cardHelperInstance._updateCards(aUpdatedCards.map(oCard => oCard?.newManifest?.descriptorContent))).then(function () {});
                } else {
                  _exit2 = true;
                }
              }();
              return _temp11 && _temp11.then ? _temp11.then(_temp12) : _temp12(_temp11);
            });
          } else {
            _this11._showCards(aCards);
          }
        }());
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Filters and returns a list of unique manifest IDs.
     *
     * This method iterates through the provided list of manifest IDs and ensures that only unique entries
     * are included in the returned list. Uniqueness is determined based on the `id` and `target` properties.
     *
     * @param {ICardDetails[]} manifestIds - An array of manifest ID objects to filter for uniqueness.
     * Each object contains properties such as `id` and `target`.
     * @returns {ICardDetails[]} An array of unique manifest ID objects.
     * @private
     */
    getUniqueManifestDetails: function _getUniqueManifestDetails(manifestIds) {
      const uniqueManifestDetails = [];
      manifestIds.forEach(item => {
        const exists = uniqueManifestDetails.some(existingItem => existingItem.id === item.id && targetsAreEqual(existingItem.target, item.target));
        if (!exists) {
          uniqueManifestDetails.push(JSON.parse(JSON.stringify(item)));
        }
      });
      return uniqueManifestDetails;
    },
    /**
     * Retrieves and processes card manifests based on the provided manifest IDs.
     *
     * This method fetches card manifests using the `AppManager` instance,
     * and removes duplicate regenerated cards to ensure uniqueness.
     *
     * @param {ICardDetails[]} manifestIds - An array of manifest ID objects to fetch and process.
     * Each object contains details such as `id`, `target`, and other card-specific properties.
     * @returns {Promise<ICardDetails[]>} A promise that resolves to an array of processed and unique card manifest details.
     * @private
     */
    _getManifests: function _getManifests(manifestIds) {
      try {
        const _this12 = this;
        // from the provided manifestIds which are unique generate new recommended card manifests
        return Promise.resolve(_this12.appManagerInstance._getCardManifest(undefined, manifestIds)).then(function (aManifests) {
          if (aManifests?.length) {
            let aRegeneratedCards = aManifests.map(function (oCard) {
              if (oCard?.["sap.card"]) {
                oCard["sap.card"].rec = true;
              }
              return {
                id: oCard["sap.app"]?.id,
                descriptorContent: oCard
              };
            });
            // sometimes same card is recommended more than once, hence remove such duplicates
            let mappedResults = _this12._removeDuplicateRegeneratedCards(aRegeneratedCards, manifestIds);
            return mappedResults;
          } else {
            return [];
          }
        });
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Regenerates card manifests and updates the original manifest list with the regenerated data.
     *
     * This method fetches updated card manifests, maps them to their corresponding original cards,
     * and updates the `newManifest` property of the original cards. It ensures that the regenerated
     * cards are correctly associated with their original counterparts based on a unique key.
     *
     * @param {ICardDetails[]} manifestIds - An array of manifest ID objects to regenerate.
     * Each object contains details such as `id`, `target`, and other card-specific properties.
     * @param {ICardDetails[]} allManifestIds - An array of all manifest ID objects, including those
     * that need to be updated with regenerated manifests.
     * @returns {Promise<ICardDetails[] | undefined>} A promise that resolves to an array of updated card details,
     * or `undefined` if an error occurs.
     * @private
     */
    regenerateCards: function _regenerateCards(manifestIds, allManifestIds) {
      try {
        const _this13 = this;
        return Promise.resolve(_catch(function () {
          return Promise.resolve(_this13._getManifests(manifestIds)).then(function (aMappedManifest) {
            // create unique identifier for each card based on its id and target properties.
            const createUniqueKey = item => {
              if (item?.target?.semanticObject && item?.target?.action) {
                return item.id + "|" + item.target.semanticObject + "|" + item.target.action;
              }
              return item.id; // Return just the id if the target is invalid
            };
            let uniqueMap = {};
            // Create a map of unique keys to newManifest data
            // Iterate through the aMappedManifest array and populate the uniqueMap with unique keys and their corresponding newManifest data
            // This ensures that each unique key maps to its respective newManifest data, allowing for easy retrieval later.
            // This is done to avoid duplicates and ensure that each card is only represented once in the final output.
            aMappedManifest.forEach(function (item) {
              let uniqueKey = createUniqueKey(item);
              if (item.newManifest) {
                uniqueMap[uniqueKey] = item.newManifest;
              }
            });
            let aUpdatedCards = [];
            if (aMappedManifest.length) {
              // Map newManifest data back into allManifestIds based on the uniquekey
              allManifestIds.forEach(function (oCard) {
                let uniqueKey = createUniqueKey(oCard);
                // Check if the uniqueKey exists in the uniqueMap, if present, assign the corresponding newManifest data to the oCard object
                // This effectively updates the oCard object with the newManifest data, allowing for further processing or rendering.
                // This is done to ensure that the original card objects are updated with the newManifest data, allowing for further processing or rendering.
                if (uniqueMap[uniqueKey]) {
                  oCard.newManifest = uniqueMap[uniqueKey];
                }
                const newManifest = oCard["newManifest"];
                const descriptorContent = newManifest?.descriptorContent;
                if (descriptorContent) {
                  descriptorContent["sap.insights"] = {
                    ...descriptorContent["sap.insights"],
                    ranking: oCard.rank
                  };
                  if (descriptorContent["sap.app"]) {
                    descriptorContent["sap.app"].id = oCard.cardId;
                  }
                  newManifest.id = oCard.cardId;
                  aUpdatedCards.push(JSON.parse(JSON.stringify(oCard)));
                }
              });
            }
            return aUpdatedCards;
          });
        }, function (oError) {
          Log.error(oError instanceof Error ? oError.message : String(oError));
          return undefined;
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Removes duplicate regenerated cards and maps them to their corresponding original cards.
     *
     * This method processes a list of regenerated cards and maps them to their corresponding original cards
     * based on their `id`. If a regenerated card matches an original card, it is added as the `newManifest`
     * property of the original card. The method ensures that each original card is updated with its corresponding
     * regenerated card, if available.
     *
     * @param {IRegeneratedCard[]} aCards - An array of regenerated cards. Each card contains a `descriptorContent` property
     * that includes metadata about the card.
     * @param {ICardDetails[]} aOriginalList - An array of original card details. Each card contains an `id` property
     * that is used to match it with regenerated cards.
     * @returns {ICardDetails[]} An array of original card details, with the `newManifest` property updated for cards
     * that have matching regenerated cards.
     * @private
     */
    _removeDuplicateRegeneratedCards: function _removeDuplicateRegeneratedCards(aCards, aOriginalList) {
      // Create a mapping from aOriginalList for easy access (grouping by id)
      const originalMap = {};
      aOriginalList.forEach(originalItem => {
        if (originalItem.id) {
          originalMap[originalItem.id] = JSON.parse(JSON.stringify(originalItem));
        }
      });

      // Process each card in aCards
      aCards.forEach(function (oCard) {
        const sCardId = oCard?.descriptorContent?.["sap.insights"]?.parentAppId;
        // Check if we have a matching original list item
        if (sCardId && originalMap[sCardId]) {
          const originalItem = originalMap[sCardId];
          // Check if updatedManifest already added
          if (!originalItem["newManifest"]) {
            // Map newManifest to the original item
            originalItem["newManifest"] = oCard;
          }
        }
      });
      return Object.values(originalMap);
    },
    /**
     * Retrieves personalization data from the personalization service.
     *
     * This method ensures that the personalization service (`oPersonalizer`) is initialized
     * and fetches the latest personalization data. If no data is found, it returns an empty object.
     *
     * @private
     * @returns {Promise<IPersonalizationData>} A promise that resolves to the personalization data.
     * If no data is available, an empty object is returned.
     */
    _getPersonalizationData: function _getPersonalizationData() {
      try {
        const _this14 = this;
        function _temp14() {
          return Promise.resolve(_this14.oPersonalizer.read()).then(function (oPersData) {
            return oPersData || {};
          });
        }
        const _temp13 = function () {
          if (!_this14.oPersonalizer) {
            return Promise.resolve(_this14._getPersonalization()).then(function (_this14$_getPersonali) {
              _this14.oPersonalizer = _this14$_getPersonali;
            });
          }
        }();
        return Promise.resolve(_temp13 && _temp13.then ? _temp13.then(_temp14) : _temp14(_temp13));
      } catch (e) {
        return Promise.reject(e);
      }
    },
    // Fetch personalization data property value
    getPersonalisationProperty: function _getPersonalisationProperty(propertyKey) {
      try {
        const _this15 = this;
        return Promise.resolve(_this15._getPersonalizationData()).then(function (oPersData) {
          return oPersData?.[propertyKey];
        });
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Checks for recommendation cards.
     *
     * @private
     * @returns {Promise<void>} A promise that resolves when the check is complete.
     */
    _getRecommendationCards: function _getRecommendationCards() {
      try {
        const _this16 = this;
        return Promise.resolve(_this16.appManagerInstance.getRecommenedCards()).then(function (aRecommendedCards) {
          if (aRecommendedCards?.length) {
            return _this16._handleRecommendationCards(aRecommendedCards);
          }
          _this16.fireHandleHidePanel();
        });
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Handle Recommendation Cards
     * @param aRecommendedCards
     * @private
     */
    _handleRecommendationCards: function _handleRecommendationCards(aRecommendedCards) {
      try {
        const _this17 = this;
        const cardManifests = aRecommendedCards.map(oCard => oCard.descriptorContent);
        return Promise.resolve(_this17.cardHelperInstance?._createCards(cardManifests)).then(function () {
          return Promise.resolve(_this17._updateRecommendationStatus()).then(function () {
            return _this17.setNewVisibleCards();
          });
        });
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Sets up the wrapper for the cards.
     *
     * @private
     */
    _setupWrapper: function _setupWrapper() {
      if (!this._cardsFlexWrapper) {
        this._cardsFlexWrapper = new VBox(`${this.getId()}-cardsFlexWrapper`, {
          renderType: "Bare",
          width: "100%",
          items: [this._createCardContainer(), this._createMobileCardContainer()]
        });
        this._cardsFlexWrapper.setModel(this._controlModel);
        this.addContent(this._cardsFlexWrapper);
      }
    },
    /**
     * Creates the card container.
     *
     * @private
     * @returns {GridContainer} The card container.
     */
    _createCardContainer: function _createCardContainer() {
      this.cardsContainerSettings = new GridContainerSettings(`${this.getId()}-insightsCardsContainerSettings`, {
        columnSize: this.cardWidth,
        rowSize: this.cardHeight,
        gap: "1rem"
      });
      this.cardsContainer = new GridContainer(`${this.getId()}-insightsCardsFlexBox`, {
        visible: "{= !${/isPhone}}"
      }).addStyleClass("sapUiSmallMarginTop").setLayout(this.cardsContainerSettings);
      this.cardsContainer.setModel(this._controlModel);
      this.addDragDropConfigTo(this.cardsContainer, oEvent => this._handleCardsDnd(oEvent));
      return this.cardsContainer;
    },
    /**
     * Creates the mobile card container.
     *
     * @private
     * @returns {HeaderContainer} The mobile card container.
     */
    _createMobileCardContainer: function _createMobileCardContainer() {
      this.cardsMobileContainer = new HeaderContainer(`${this.getId()}-insightsCardsMobileFlexBox`, {
        scrollStep: 0,
        scrollStepByItem: 1,
        gridLayout: true,
        scrollTime: 1000,
        showDividers: false,
        visible: "{/isPhone}"
      });
      this.cardsMobileContainer.setModel(this._controlModel);
      this.addDragDropConfigTo(this.cardsMobileContainer, oEvent => this._handleCardsDnd(oEvent));
      return this.cardsMobileContainer;
    },
    /**
     * Displays placeholder cards while loading.
     *
     * @private
     * @returns {void}
     */
    _showPlaceHolders: function _showPlaceHolders() {
      const cardManifest = this.appManagerInstance._getAnalyticalCardManifest();
      const placeholderArray = new Array(this._calculatePlaceholderCardCount()).fill(null);
      const aInsightsCards = placeholderArray.map((_, index) => {
        const card = new Card(recycleId(`${this.getId()}--placeHolderCard--${index}`), {
          width: this.cardWidth,
          height: this.cardHeight,
          previewMode: "Abstract",
          manifest: cardManifest,
          host: this.getAggregation("host")
        }).addStyleClass("sapUiSmallMarginEnd");
        return card;
      });
      // Create Wrapper HBox for Card
      const oPreviewHBox = new HBox(recycleId(`${this.getId()}--wrapperBox`), {
        justifyContent: "SpaceBetween",
        items: aInsightsCards
      });

      // add HBox as item to GridList
      const sDefaultAggreName = this._getCardContainer().getMetadata().getDefaultAggregationName();
      if (sDefaultAggreName) {
        this._getCardContainer().addAggregation(sDefaultAggreName, oPreviewHBox);
      }
    },
    /**
     * Calculates the number of placeholder cards that can fit within the available container width.
     *
     * @private
     * @returns {number} The number of placeholder cards that should be displayed. Defaults to 1 if no valid count is determined.
     */
    _calculatePlaceholderCardCount: function _calculatePlaceholderCardCount() {
      const layoutDomRef = this._getInsightsContainer()?._getLayout()?.getDomRef();
      let count = 0;
      if (layoutDomRef) {
        const sectionDomRef = layoutDomRef.childNodes[0];
        const domProperties = fetchElementProperties(sectionDomRef, ["width", "padding-left", "padding-right"]);
        let availableWidth = domProperties.width - domProperties["padding-left"] - domProperties["padding-right"];
        const cardLayoutConfig = {
          containerWidth: availableWidth,
          totalCards: Constants.PLACEHOLDER_CARD_COUNT,
          minWidth: 304,
          maxWidth: 583,
          gap: 16
        };
        const cardWidth = this.getDeviceType() === DeviceType.Mobile ? 19 : calculateCardWidth(cardLayoutConfig);

        // Calculate and log the number of cards that can fit
        count = this.getDeviceType() === DeviceType.Mobile ? this.aVisibleCardInstances.length : Math.floor(availableWidth / (cardWidth + Constants.CARDS_GAP));
        this.cardWidth = `${cardWidth / 16}rem`;
      }
      return count || 1;
    },
    /**
     * Displays the cards.
     *
     * @private
     * @param {ICard[]} aCards - The cards to display.
     */
    _showCards: function _showCards(aCards) {
      const panelName = this.getMetadata().getName();
      this.fireHandleUnhidePanel();
      this._getInsightsContainer()?.updatePanelsItemCount(aCards.length, panelName);
      if (this._headerVisible) {
        this.setProperty("title", `${this._i18nBundle?.getText("insightsCards")} (${aCards.length})`);
      }
      const sDefaultAggreName = this._getCardContainer().getMetadata().getDefaultAggregationName();
      this._getCardContainer().removeAllAggregation(sDefaultAggreName);
      this.aVisibleCardInstances = [];
      this.cardsInViewport = [];

      // Setup Host For Cards
      if (!runtimeHostCreated) {
        this._addRuntimeHost();
        runtimeHostCreated = true;
      }
      aCards.forEach((oCard, index) => {
        const manifest = oCard.descriptorContent;
        // Create Card Instance
        const oUserCard = new Card(recycleId(`${this.getId()}--userCard--${index}`), {
          width: this.cardWidth,
          height: this.cardHeight,
          manifest,
          host: this.getAggregation("host")
        });
        this.aVisibleCardInstances.push(oUserCard);
        this.addAggregation("cards", oUserCard, true);
        const items = [oUserCard];

        // Add overlay in case of List and Table Card
        const sType = manifest["sap.card"]?.type;
        if (sType === "Table" || sType === "List") {
          const overlay = new HBox(recycleId(`${this.getId()}--overlay--${index}`), {
            width: this.cardWidth,
            height: "2rem"
          }).addStyleClass("insightsCardOverflowTop");
          const overlayHBoxWrapper = new HBox(recycleId(`${this.getId()}--overlayHBoxId--${index}`), {
            height: "0"
          }).addStyleClass("sapMFlexBoxJustifyCenter");
          overlayHBoxWrapper.addItem(overlay);
          items.push(overlayHBoxWrapper);
        }

        // Create Wrapper VBox for Card
        const oPreviewVBox = new VBox(recycleId(`${this.getId()}--previewBoxId--${index}`), {
          direction: "Column",
          justifyContent: "Center",
          items: items
        });

        // add VBox as item to GridList
        const sDefaultAggreName = this._getCardContainer().getMetadata().getDefaultAggregationName();
        this._getCardContainer().addAggregation(sDefaultAggreName, oPreviewVBox);
      });
    },
    /**
     * Handles the edit cards event.
     *
     * @private
     * @param {Event} event - The event object.
     */
    _handleEditCards: function _handleEditCards(event) {
      /* If called from Panel Header event.source() will return TilesPanel, if called from Insights Container event.source() will return InsightsContainer.
      _getLayout is available at Container Level*/
      let parent = event.getSource().getParent() || this;
      if (parent instanceof CardsPanel) {
        parent = parent.getParent();
      }
      parent?._getLayout().openSettingsDialog(SETTINGS_PANELS_KEYS.INSIGHTS_CARDS);
    },
    /**
     * Hides the header of the cards panel.
     *
     * @private
     */
    handleHideHeader: function _handleHideHeader() {
      this._headerVisible = false;
      this.setProperty("title", "");
      this._toggleHeaderActions(false);
    },
    /**
     * Adds the header to the cards panel.
     *
     * @private
     */
    handleAddHeader: function _handleAddHeader() {
      this._headerVisible = true;
      this.setProperty("title", `${this._i18nBundle?.getText("insightsCards")} (${this._controlModel.getProperty("/userVisibleCards")?.length})`);
      this._toggleHeaderActions(true);
    },
    /**
     * Refreshes the cards.
     *
     * @private
     */
    refreshCards: function _refreshCards() {
      // This should be done via Host once implemented
      this.aVisibleCardInstances.forEach(card => this._refreshCardData(card));
    },
    /**
     * Handles the drag and drop of cards.
     *
     * @private
     * @param {Event<DropInfo$DropEventParameters>} oEvent - The drop event parameters.
     */
    _handleCardsDnd: function _handleCardsDnd(oEvent) {
      try {
        const _this18 = this;
        const sInsertPosition = oEvent.getParameter("dropPosition"),
          oDragItem = oEvent.getParameter("draggedControl"),
          iDragItemIndex = oDragItem.getParent()?.indexOfItem(oDragItem),
          oDropItem = oEvent.getParameter("droppedControl"),
          iDropItemIndex = oDragItem.getParent().indexOfItem(oDropItem);
        _this18._cardsFlexWrapper?.setBusy(true);
        // take the moved item from dragIndex and add to dropindex
        const _temp17 = _finallyRethrows(function () {
          return _catch(function () {
            function _temp16() {
              setTimeout(() => {
                focusDraggedItem(_this18._getCardContainer(), iDropItemIndex);
              }, 0);
            }
            const _temp15 = function () {
              if (!_this18._controlModel.getProperty("/userAllCards").length) {
                return Promise.resolve(_this18.cardHelperInstance._getUserAllCardModel()).then(function (userAllCardsModel) {
                  _this18._controlModel.setProperty("/userAllCards", userAllCardsModel.getProperty("/cards"));
                  return Promise.resolve(_this18.updateCardList(sInsertPosition, iDropItemIndex, iDragItemIndex)).then(function () {});
                });
              } else {
                return Promise.resolve(_this18.updateCardList(sInsertPosition, iDropItemIndex, iDragItemIndex)).then(function () {});
              }
            }();
            return _temp15 && _temp15.then ? _temp15.then(_temp16) : _temp16(_temp15);
          }, function (error) {
            if (error instanceof Error) {
              Log.error(error.message);
            }
          });
        }, function (_wasThrown, _result3) {
          _this18._cardsFlexWrapper?.setBusy(false);
          if (_wasThrown) throw _result3;
          return _result3;
        });
        return Promise.resolve(_temp17 && _temp17.then ? _temp17.then(function () {}) : void 0);
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Updates the card list based on the drag and drop operation.
     *
     * @private
     * @param {string} sInsertPosition - The position to insert the item.
     * @param {number} iDropItemIndex - The index of the dropped item.
     * @param {number} iDragItemIndex - The index of the dragged item.
     * @returns {Promise<void>} A promise that resolves when the card list is updated.
     */
    updateCardList: function _updateCardList(sInsertPosition, iDropItemIndex, iDragItemIndex) {
      try {
        const _this19 = this;
        const aUserVisibleCards = _this19._controlModel.getProperty("/userVisibleCards"),
          aUserAllCards = _this19._controlModel.getProperty("/userAllCards"),
          sDragedPositionRank = aUserVisibleCards[iDragItemIndex]?.rank,
          sDropedPositionRank = aUserVisibleCards[iDropItemIndex]?.rank;
        let iUpdatedDragItemIndex = aUserAllCards.findIndex(oCard => oCard.rank === sDragedPositionRank),
          iUpdatedDropItemIndex = aUserAllCards.findIndex(oCard => oCard.rank === sDropedPositionRank);
        if (sInsertPosition === "Before" && iDragItemIndex === iDropItemIndex - 1 || sInsertPosition === "After" && iDragItemIndex === iDropItemIndex + 1 || iDragItemIndex === iDropItemIndex) {
          return Promise.resolve();
        }
        if (sInsertPosition === "Before" && iUpdatedDragItemIndex < iUpdatedDropItemIndex) {
          iUpdatedDropItemIndex--;
        } else if (sInsertPosition === "After" && iUpdatedDragItemIndex > iUpdatedDropItemIndex) {
          iUpdatedDropItemIndex++;
        }
        const _temp18 = function () {
          if (iUpdatedDragItemIndex !== iUpdatedDropItemIndex) {
            const aUpdatedCards = _this19.cardHelperInstance.handleDndCardsRanking(iUpdatedDragItemIndex, iUpdatedDropItemIndex, aUserAllCards);
            return Promise.resolve(_this19.cardHelperInstance._updateMultipleCards(aUpdatedCards, "PUT")).then(function () {
              _this19._sortCardsOnRank(aUserAllCards);
              _this19._controlModel.setProperty("/userAllCards", aUserAllCards);
              _this19._controlModel.setProperty("/userVisibleCards", aUserAllCards.filter(oCard => oCard.visibility));
              return Promise.resolve(_this19.rerenderCards()).then(function () {});
            });
          }
        }();
        return Promise.resolve(_temp18 && _temp18.then ? _temp18.then(function () {}) : void 0);
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Sorts the cards based on their rank property.
     *
     * @private
     * @param {ICard[]} aCards - The array of cards to sort.
     */
    _sortCardsOnRank: function _sortCardsOnRank(aCards) {
      // Sort Cards based on it rank property where rank is a alphanumeric string
      aCards.sort((a, b) => {
        if (a.rank && b.rank) {
          if (a.rank < b.rank) {
            return -1;
          } else if (a.rank > b.rank) {
            return 1;
          }
        }
        return 0;
      });
    },
    /**
     * Retrieves the personalization instance.
     *
     * @private
     * @returns {UShellPersonalizer} The personalization instance.
     */
    _getPersonalization: function _getPersonalization() {
      const persContainerId = PersonalisationUtils.getPersContainerId(this);
      const ownerComponent = PersonalisationUtils.getOwnerComponent(this);
      return UShellPersonalizer.getInstance(persContainerId, ownerComponent);
    },
    /**
     * Updates the recommendation status based on the feature toggle.
     * @returns {Promise} A promise that resolves when the recommendation status is updated.
     */
    _updateRecommendationStatus: function _updateRecommendationStatus() {
      try {
        const _this20 = this;
        return Promise.resolve(_this20._getPersonalizationData()).then(function (oPersData) {
          oPersData[RECOMMENDATION_PATH] = true;
          return _this20.oPersonalizer.write(oPersData);
        });
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Calculates the number of visible cards that can fit within the available width of the parent container.
     *
     * @private
     * @returns {number} - The number of visible cards.
     */
    _calculateVisibleCardCount: function _calculateVisibleCardCount() {
      const layout = this._getInsightsContainer()._getLayout();
      const pageDomRef = layout.getDomRef();
      const deviceType = this.getDeviceType();
      let count = 1;
      if (pageDomRef) {
        const isHeaderVisible = layout.getProperty("showHeader");
        const sectionNodeIndex = isHeaderVisible ? 1 : 0;
        const sectionDomRef = pageDomRef.childNodes[sectionNodeIndex];
        const domProperties = fetchElementProperties(sectionDomRef, ["width", "padding-left", "padding-right"]);
        const iAvailableWidth = domProperties.width - domProperties["padding-left"] - domProperties["padding-right"];
        const totalCards = this.aVisibleCardInstances.length;
        const cardLayoutConfig = {
          containerWidth: iAvailableWidth,
          totalCards: totalCards,
          minWidth: 304,
          maxWidth: 583,
          gap: 16
        };
        const cardWidth = calculateCardWidth(cardLayoutConfig);
        this.cardWidth = `${cardWidth / 16}rem`;
        if (deviceType === DeviceType.Mobile) {
          count = totalCards;
        } else {
          // Multiply by 16 because `cardWidth` is in rems
          count = Math.max(Math.floor(iAvailableWidth / cardWidth), 1);
        }
      }
      return count;
    },
    /**
     * Adjusts the layout of the cards panel based on the current layout and device type.
     *
     * @private
     * @override
     */
    _adjustLayout: function _adjustLayout() {
      const layout = this._getInsightsContainer()?._getLayout();
      let cardWidth = this.cardWidth;
      const isMobileDevice = this.getDeviceType() === DeviceType.Mobile;
      if (layout && this.aVisibleCardInstances?.length > 0) {
        const isElementExpanded = layout._getCurrentExpandedElementName() === this.getProperty("fullScreenName");

        //_calculateVisibleCardCount needs to be called in all scenarios to get the correct card width according to device width.
        //if expanded, again the card count is reset to available cards count
        let cardCount = this._calculateVisibleCardCount();
        if (isElementExpanded) {
          cardCount = this.aVisibleCardInstances.length;
        }
        this._controlModel.setProperty("/isPhone", isMobileDevice);

        // update cards in viewport
        if (cardCount !== this.cardsInViewport.length) {
          this.cardsInViewport = this.aVisibleCardInstances.slice(0, cardCount);
          const sDefaultAggreName = this._getCardContainer().getMetadata().getDefaultAggregationName();
          this._getCardContainer().removeAllAggregation(sDefaultAggreName);
          this.cardsInViewport.forEach(card => {
            const manifest = card.getManifest();
            const sType = manifest["sap.card"]?.type;
            let overlayHBoxWrapper;
            if (sType === "Table" || sType === "List") {
              const overlay = new HBox({
                width: this.cardWidth,
                height: "2rem"
              }).addStyleClass("insightsCardOverflowLayer insightsCardOverflowTop");
              overlayHBoxWrapper = new HBox({
                height: "0"
              }).addStyleClass("sapMFlexBoxJustifyCenter");
              overlayHBoxWrapper.addItem(overlay);
            }
            const cardWrapper = new VBox({
              direction: "Column",
              justifyContent: "Center",
              items: [card]
            });
            if (overlayHBoxWrapper) {
              cardWrapper.addItem(overlayHBoxWrapper);
            }
            const sDefaultAggreName = this._getCardContainer().getMetadata().getDefaultAggregationName();
            this._getCardContainer().addAggregation(sDefaultAggreName, cardWrapper);
          });
          this.shareCardsInViewport();
        }

        // show/hide Full Screen Button if available
        const showFullScreenButton = isElementExpanded || this.aVisibleCardInstances.length > cardCount;
        if (this._headerVisible) {
          this._getInsightsContainer()?.toggleFullScreenElements(this, showFullScreenButton);
        } else {
          const fullScreenButton = getAssociatedFullScreenMenuItem(this);
          const fullScreenText = fullScreenButton?.getTitle();
          this._getInsightsContainer()?.updateMenuItem(this._controlMap.get(`${this.getId()}-${cardsContainerMenuItems.SHOW_MORE}`), showFullScreenButton, fullScreenText);
          this._getInsightsContainer()?.updateActionButton(this._controlMap.get(`${this.getId()}-${cardsContainerActionButtons.SHOW_MORE}`), showFullScreenButton, fullScreenText);
        }
      } else {
        this.cardWidth = this.getDeviceType() === DeviceType.Mobile ? "19rem" : "22rem";
      }

      // update width of cards on resize
      if (cardWidth !== this.cardWidth) {
        this.aVisibleCardInstances.forEach(card => card.setWidth(this.cardWidth));
        this.cardsContainerSettings?.setColumnSize(this.cardWidth);
      }
    },
    /**
     * Retrieves the menu items for the container.
     *
     * @private
     * @returns {MenuItem[]} An array of MenuItem instances.
     */
    getContainerMenuItems: function _getContainerMenuItems() {
      if (!this._containerMenuItems) {
        const containerRefreshMenuItem = this._createRefreshMenuItem(cardsContainerMenuItems.REFRESH, "containerCardsRefresh");
        const containerEditCardsMenuItem = this._createEditCardsMenuItem(cardsContainerMenuItems.EDIT_CARDS, "containerManageCards");
        const containerShowMoreMenuItem = createShowMoreMenuItem(this, cardsContainerMenuItems.SHOW_MORE, "containerCardsShowMore");
        this._controlMap.set(`${this.getId()}-${cardsContainerMenuItems.SHOW_MORE}`, containerShowMoreMenuItem);
        this._containerMenuItems = [containerRefreshMenuItem, containerEditCardsMenuItem, containerShowMoreMenuItem];
      }
      return this._containerMenuItems;
    },
    /**
     * Retrieves the action buttons for the container.
     *
     * @private
     * @returns {Button[]} An array of Button instances.
     */
    getContainerActionButtons: function _getContainerActionButtons() {
      if (!this._containerActionButtons) {
        this._containerActionButtons = [];
        const actionButton = createShowMoreActionButton(this, cardsContainerActionButtons.SHOW_MORE, "containerCardsShowMore");
        if (actionButton) {
          this._controlMap.set(`${this.getId()}-${cardsContainerActionButtons.SHOW_MORE}`, actionButton);
          this._containerActionButtons.push(actionButton);
        }
      }
      return this._containerActionButtons;
    },
    /**
     * Retrieves the insights container.
     *
     * @private
     * @returns {InsightsContainer} - The insights container.
     */
    _getInsightsContainer: function _getInsightsContainer() {
      if (!this.insightsContainer) {
        this.insightsContainer = this.getParent();
      }
      return this.insightsContainer;
    },
    /**
     * Creates the refresh menu item.
     *
     * @param {string} id - The ID of the menu item.
     * @param {string} fesrId - The FESR ID of the menu item.
     * @returns {MenuItem} - The created menu item.
     * @private
     */
    _createRefreshMenuItem: function _createRefreshMenuItem(id, fesrId) {
      const menuItem = new MenuItem(`${this.getId()}-${id}`, {
        title: this._i18nBundle.getText("refresh"),
        icon: "sap-icon://refresh",
        visible: false,
        press: () => this.refreshCards()
      });
      this._controlMap.set(`${this.getId()}-${id}`, menuItem);
      if (fesrId) {
        addFESRId(menuItem, fesrId);
      }
      return menuItem;
    },
    /**
     * Creates the edit cards menu item.
     *
     * @param {string} id - The ID of the menu item.
     * @param {string} fesrId - The FESR ID of the menu item.
     * @returns {MenuItem} - The created menu item.
     * @private
     */
    _createEditCardsMenuItem: function _createEditCardsMenuItem(id, fesrId) {
      const menuItem = new MenuItem(`${this.getId()}-${id}`, {
        title: this._i18nBundle.getText("manageCards"),
        icon: "sap-icon://edit",
        visible: false,
        press: event => this._handleEditCards(event)
      });
      this._controlMap.set(`${this.getId()}-${id}`, menuItem);
      if (fesrId) {
        addFESRId(menuItem, fesrId);
      }
      return menuItem;
    },
    /**
     * Toggles the visibility of the header actions.
     *
     * @param {boolean} bShow - Whether to show or hide the header actions.
     * @private
     */
    _toggleHeaderActions: function _toggleHeaderActions(bShow) {
      this.getAggregation("menuItems")?.forEach(menuItem => {
        this._getInsightsContainer()?.toggleMenuListItem(menuItem, bShow);
      });
      this.getAggregation("actionButtons")?.forEach(actionButton => this._getInsightsContainer()?.toggleActionButton(actionButton, bShow));
    },
    /**
     * Retrieves the card container based on the device type.
     *
     * @private
     * @returns {GridContainer | HeaderContainer} - The card container.
     *
     */
    _getCardContainer: function _getCardContainer() {
      if (this.getDeviceType() === DeviceType.Mobile) {
        return this.cardsMobileContainer;
      }
      return this.cardsContainer;
    },
    /**
     * Sorts the menu items based on the provided order.
     *
     * @private
     * @param {string[]} menuItems - The order of the menu items.
     */
    _sortMenuItems: function _sortMenuItems(menuItems) {
      const panelMenuItems = this.getAggregation("menuItems");
      let sortedMenuItems = sortMenuItems(menuItems, panelMenuItems);
      this.removeAllAggregation("menuItems");
      sortedMenuItems?.forEach(menuItem => this.addAggregation("menuItems", menuItem));
    },
    /**
     * Shares the cards that are currently in the viewport by firing the "visibleCardsUpdated" event.
     *
     * @private
     */
    shareCardsInViewport: function _shareCardsInViewport() {
      const cardCount = this._calculateVisibleCardCount();
      const visibleCards = this._controlModel.getProperty("/userVisibleCards");
      const cardsInViewport = visibleCards?.slice(0, cardCount);
      if (cardsInViewport?.length) {
        this.fireEvent("visibleCardsUpdated", {
          cards: cardsInViewport
        });
      }
    },
    /**
     * Exit lifecycle method.
     *
     * @private
     * @override
     */
    exit: function _exit() {
      runtimeHostCreated = false;
      this.getAggregation("host")?.destroy();
    }
  });
  CardsPanel.cardsMenuItems = cardsMenuItems;
  CardsPanel.cardsContainerMenuItems = cardsContainerMenuItems;
  CardsPanel.cardsContainerActionButtons = cardsContainerActionButtons;
  return CardsPanel;
});
//# sourceMappingURL=CardsPanel-dbg.js.map
