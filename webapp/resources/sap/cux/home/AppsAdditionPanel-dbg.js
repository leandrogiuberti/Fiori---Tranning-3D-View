/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/m/Button", "sap/m/CustomListItem", "sap/m/ExpandableText", "sap/m/FlexBox", "sap/m/GenericTile", "sap/m/HBox", "sap/m/Label", "sap/m/library", "sap/m/MessageToast", "sap/m/Text", "sap/m/VBox", "sap/ui/core/Fragment", "sap/ui/core/library", "sap/ui/model/ChangeReason", "sap/ui/model/json/JSONModel", "sap/ui/model/resource/ResourceModel", "sap/ui/model/Sorter", "sap/ushell/Container", "./AppsContainer", "./BaseSettingsPanel", "./FavAppPanel", "./InsightsContainer", "./utils/AppManager", "./utils/Constants", "./utils/DataFormatUtils", "./utils/FeatureUtils", "./utils/FESRUtil"], function (Log, Button, CustomListItem, ExpandableText, FlexBox, GenericTile, HBox, Label, sap_m_library, MessageToast, Text, VBox, Fragment, sap_ui_core_library, ChangeReason, JSONModel, ResourceModel, Sorter, Container, __AppsContainer, __BaseSettingsPanel, __FavAppPanel, __InsightsContainer, __AppManager, ___utils_Constants, ___utils_DataFormatUtils, ___utils_FeatureUtils, ___utils_FESRUtil) {
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
  const ButtonType = sap_m_library["ButtonType"];
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
  const URLHelper = sap_m_library["URLHelper"];
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
  const ValueState = sap_ui_core_library["ValueState"];
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
  const AppsContainer = _interopRequireDefault(__AppsContainer);
  const BaseSettingsPanel = _interopRequireDefault(__BaseSettingsPanel);
  const FavAppPanel = _interopRequireDefault(__FavAppPanel);
  const InsightsContainer = _interopRequireDefault(__InsightsContainer);
  const AppManager = _interopRequireDefault(__AppManager);
  const AI_APP_FINDER_API = ___utils_Constants["AI_APP_FINDER_API"];
  const AI_APP_FINDER_BASE_URL = ___utils_Constants["AI_APP_FINDER_BASE_URL"];
  const CONTENT_ADDITION_PANEL_TYPES = ___utils_Constants["CONTENT_ADDITION_PANEL_TYPES"];
  const DEFAULT_APP_ICON = ___utils_Constants["DEFAULT_APP_ICON"];
  const FEATURE_TOGGLES = ___utils_Constants["FEATURE_TOGGLES"];
  const FESR_IDS = ___utils_Constants["FESR_IDS"];
  const MYINSIGHT_SECTION_ID = ___utils_Constants["MYINSIGHT_SECTION_ID"];
  const recycleId = ___utils_DataFormatUtils["recycleId"];
  const isNavigationSupportedForFeature = ___utils_FeatureUtils["isNavigationSupportedForFeature"];
  const addFESRSemanticStepName = ___utils_FESRUtil["addFESRSemanticStepName"];
  const FESR_EVENTS = ___utils_FESRUtil["FESR_EVENTS"];
  const Constants = {
    DeprecatedInfoText: "deprecated",
    MinQueryLength: 2,
    MaxDescriptionLength: 500
  };
  var SearchStatus = /*#__PURE__*/function (SearchStatus) {
    SearchStatus["Idle"] = "idle";
    SearchStatus["Searching"] = "searching";
    SearchStatus["Complete"] = "complete";
    return SearchStatus;
  }(SearchStatus || {});
  var ErrorType = /*#__PURE__*/function (ErrorType) {
    ErrorType["NoResultsFound"] = "noResultsFound";
    ErrorType["ServiceError"] = "serviceError";
    return ErrorType;
  }(ErrorType || {});
  var TileType = /*#__PURE__*/function (TileType) {
    TileType["Static"] = "STATIC";
    return TileType;
  }(TileType || {});
  /**
   *
   * Class for Apps Addition Panel in MyHome.
   *
   * @extends BaseSettingsPanel
   *
   * @author SAP SE
   * @version 0.0.1
   * @since 1.136
   *
   * @private
   *
   * @alias sap.cux.home.AppsAdditionPanel
   */
  const AppsAdditionPanel = BaseSettingsPanel.extend("sap.cux.home.AppsAdditionPanel", {
    constructor: function constructor() {
      BaseSettingsPanel.prototype.constructor.apply(this, arguments);
      this.appManagerInstance = AppManager.getInstance();
      /**
       * Resets the search state in the Apps Addition Panel.
       *
       * @private
       */
      this.resetSearch = () => {
        this.userSelectedApps.clear();
        this.model.setProperty("/hasError", false);
        this.model.setProperty("/suggestedApps", []);
        this.model.setProperty("/suggestedAppsCount", 0);
        this.model.setProperty("/searchStatus", SearchStatus.Searching);
        this.model.setProperty("/userSelectedApps", []);
        this.appSuggestionList.removeSelections(true);
        this.resetFeedback();
      };
    },
    /**
     * Init lifecycle method
     *
     * @public
     * @override
     */
    init: function _init() {
      BaseSettingsPanel.prototype.init.call(this);
      this.userSelectedApps = new Set();

      //setup panel
      this.setProperty("key", CONTENT_ADDITION_PANEL_TYPES.AI_APP_FINDER);
      this.setProperty("title", this._i18nBundle.getText("addAppsAndTile"));

      //setup actions
      this._setupActions();

      //setup content
      void this._setupContent();

      //setup events
      this.attachEvent("onDialogClose", () => {
        if (!this._isDialogPersisted(this.getParent())) {
          this.resetPanel();
        }
      });
    },
    /**
     * Sets up the actions for the Apps Addition Panel.
     *
     * @private
     */
    _setupActions: function _setupActions() {
      this.addAppsButton = new Button(recycleId(`${this.getId()}-add-app-btn`), {
        text: this._i18nBundle.getText("addFromInsightsDialogBtn"),
        type: ButtonType.Emphasized,
        press: () => {
          void this.onPressAddApps();
        }
      });
      this.addAppsButton.bindProperty("enabled", {
        parts: ["/hasError", "/searchStatus", "/userSelectedApps"],
        formatter: (hasError, searchStatus, userSelectedApps) => {
          return !hasError && searchStatus === SearchStatus.Complete && userSelectedApps.length > 0;
        }
      });
      addFESRSemanticStepName(this.addAppsButton, FESR_EVENTS.PRESS, FESR_IDS.ADD_AI_APP);
      this.addActionButton(this.addAppsButton);
    },
    /**
     * Sets up the content for the Apps Addition Panel.
     *
     * @private
     * @async
     */
    _setupContent: function _setupContent() {
      try {
        const _this = this;
        return Promise.resolve(Container.getServiceAsync("VisualizationInstantiation")).then(function (_Container$getService) {
          _this.vizInstantiationService = _Container$getService;
          //load ui fragment
          return Promise.resolve(Fragment.load({
            id: `${_this.getId()}-content`,
            name: "sap.cux.home.utils.fragment.appsAdditionContent",
            controller: _this
          })).then(function (_Fragment$load) {
            const panelContent = _Fragment$load;
            _this.addAggregation("content", panelContent);

            //initialize ui model
            //bind suggested apps list
            //focus on the first item when the list is updated
            //bind search field
            _this.model = new JSONModel({
              query: "",
              hasError: false,
              errorType: ErrorType.NoResultsFound,
              errorDescription: "",
              searchStatus: SearchStatus.Idle,
              loadingAnimations: _this._generateSearchingAnimations(),
              suggestedAppsCount: 0,
              userSelectedApps: [],
              suggestedApps: [],
              aiPolicyText: _this._generateAIPolicyText(),
              invalidQuery: true,
              feedback: {
                thumbsUp: false,
                thumbsDown: false
              },
              sampleQueries: [{
                index: 1,
                query: _this._i18nBundle.getText("sampleQuery_1")
              }, {
                index: 2,
                query: _this._i18nBundle.getText("sampleQuery_2")
              }, {
                index: 3,
                query: _this._i18nBundle.getText("sampleQuery_3")
              }]
            });
            panelContent.setModel(_this.model);
            panelContent.setModel(new ResourceModel({
              bundleName: "sap.cux.home.i18n.messagebundle"
            }), "i18n");
            _this.addAppsButton.setModel(_this.model);
            _this.appSuggestionList = Fragment.byId(`${_this.getId()}-content`, "appsList");
            _this.appSuggestionList.bindAggregation("items", {
              path: "/suggestedApps",
              factory: _this._generateListItem.bind(_this),
              sorter: new Sorter({
                path: "status",
                comparator: (firstApp, secondApp) => {
                  const getPriority = statusArray => {
                    if (statusArray.length === 0) return 0; // Empty array has highest priority

                    const hasAlreadyAdded = statusArray.includes(_this._i18nBundle.getText("alreadyAddedApp"));
                    const hasDeprecated = statusArray.includes(_this._i18nBundle.getText("deprecatedApp"));
                    if (hasAlreadyAdded && hasDeprecated) return 3; // Both statuses - lowest priority
                    if (hasAlreadyAdded) return 1; // Only "Already Added"
                    if (hasDeprecated) return 2; // Only "Deprecated"

                    return 4; // Any other combination (fallback)
                  };
                  const firstPriority = getPriority(firstApp);
                  const secondPriority = getPriority(secondApp);
                  return firstPriority - secondPriority;
                }
              })
            });
            _this.appSuggestionList.attachUpdateFinished(() => {
              if (_this.model.getProperty("/suggestedAppsCount") > 0 && _this.model.getProperty("/searchStatus") === SearchStatus.Complete) {
                _this.appSuggestionList.getItems()?.[0]?.focus();
              }
            });
            const searchTextArea = Fragment.byId(`${_this.getId()}-content`, "searchTextArea");
            searchTextArea.onsapenter = _this.onPressGo.bind(_this);
          });
        });
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Generates a list item for the Apps Addition Panel.
     *
     * @private
     * @param {string} id - The unique ID for the list item.
     * @param {Context} context - The binding context for the list item.
     * @returns {CustomListItem} The generated list item control.
     */
    _generateListItem: function _generateListItem(id, context) {
      const listItem = new CustomListItem(id, {
        selected: context.getProperty("addedToHomePage"),
        content: [new FlexBox(recycleId(`${id}-result-container`), {
          renderType: "Bare",
          direction: context.getProperty("isStaticApp") ? "Column" : "Row",
          alignItems: context.getProperty("isStaticApp") ? "Start" : "Center",
          items: [this._getAppPreviewContainer(id, context), this._getAppDetailsContainer(id, context)]
        }).addStyleClass("sapUiSmallMargin")]
      });

      //bind associated checkbox to disable it when the app is already added to home page
      listItem.getMultiSelectControl(true).setEnabled(!context.getProperty("addedToHomePage"));
      return listItem;
    },
    /**
     * Creates a preview container for the suggested app.
     *
     * @private
     * @param {string} id - The unique ID for the container.
     * @param {Context} context - The binding context for the app.
     * @returns {HBox} The app preview container.
     */
    _getAppPreviewContainer: function _getAppPreviewContainer(id, context) {
      const container = new HBox(recycleId(`${id}-suggestedAppContainer`), {
        renderType: "Bare"
      });
      if (context.getProperty("isStaticApp")) {
        // create generic tile for static app
        container.addItem(new GenericTile(recycleId(`${id}-staticApp`), {
          mode: "IconMode",
          frameType: "TwoByHalf",
          width: "19rem",
          header: context.getProperty("title"),
          subheader: context.getProperty("subTitle"),
          tileIcon: context.getProperty("icon") || DEFAULT_APP_ICON,
          visible: context.getProperty("isStaticApp"),
          url: context.getProperty("url"),
          press: event => {
            this._persistDialog(this.getParent());
            URLHelper.redirect(event.getSource()?.getUrl(), false);
          }
        }).addStyleClass("suggestedTile"));
      } else {
        // create custom visualization for other apps
        const vizData = context.getProperty("vizData");
        const instance = this.vizInstantiationService.instantiateVisualization(vizData);
        instance?.setActive(true);
        instance?.attachPress(() => this._persistDialog(this.getParent()));
        container.addItem(instance);
      }
      return container;
    },
    /**
     * Creates a details container for the suggested app.
     *
     * @private
     * @param {string} id - The unique ID for the container.
     * @param {Context} context - The binding context for the app.
     * @returns {VBox} The app details container.
     */
    _getAppDetailsContainer: function _getAppDetailsContainer(id, context) {
      return new VBox(recycleId(`${id}-app-details-container`), {
        renderType: "Bare",
        gap: "0.5rem",
        items: [new ExpandableText(recycleId(`${id}-description`), {
          text: context.getProperty("description"),
          maxCharacters: Constants.MaxDescriptionLength
        }), new HBox(recycleId(`${id}-app-status-container`), {
          renderType: "Bare",
          visible: context.getProperty("status").length > 0,
          items: [new Label(recycleId(`${id}-appStatusLabel`), {
            text: this._i18nBundle.getText("appStatus"),
            showColon: true
          }), new HBox(recycleId(`${id}-app-status-texts`), {
            renderType: "Bare",
            items: this._generateStatusTexts(id, context.getProperty("status"))
          }).addStyleClass("sapUiTinyMarginBegin statusTextsContainer")]
        })]
      }).addStyleClass(context.getProperty("isStaticApp") ? "sapUiSmallMarginTop" : "sapUiSmallMarginBegin");
    },
    /**
     * Checks if the Apps Addition Panel is supported. Internally, it checks if the
     * AI Smart App Finder feature toggle is enabled and if the associated application
     * is accessible for the user.
     *
     * @public
     * @override
     * @async
     * @returns {Promise<boolean>} A promise that resolves to a boolean indicating support.
     */
    isSupported: function _isSupported() {
      try {
        const _this2 = this;
        function _temp3() {
          //remove panel if it's not supported
          if (!_this2.isPanelSupported) {
            _this2.removeActionButton(_this2.addAppsButton);
            const contentAdditionDialog = _this2.getParent();
            contentAdditionDialog.removePanel(_this2);
            contentAdditionDialog.updateActionButtons();
          }
          return _this2.isPanelSupported;
        }
        const appsIntent = {
          target: {
            semanticObject: "IntelligentPrompt",
            action: "propose"
          }
        };
        const _temp2 = function () {
          if (_this2.isPanelSupported === undefined) {
            _this2.isPanelSupported = false;
            const _temp = function () {
              if (_this2.getFavAppPanel()) {
                return Promise.resolve(isNavigationSupportedForFeature(FEATURE_TOGGLES.AI_SMART_APPFINDER, appsIntent)).then(function (_isNavigationSupporte) {
                  _this2.isPanelSupported = _isNavigationSupporte;
                });
              }
            }();
            if (_temp && _temp.then) return _temp.then(function () {});
          }
        }();
        return Promise.resolve(_temp2 && _temp2.then ? _temp2.then(_temp3) : _temp3(_temp2));
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Generates the searching animation SVG as a string.
     *
     * @private
     * @returns {string} The SVG string for the loading animation.
     */
    _generateSearchingAnimations: function _generateSearchingAnimations() {
      const loadingShimmer = `<defs>
			<linearGradient id="loadingShimmer" x1="0" y1="0" x2="1" y2="0">
				<stop offset="0%" stop-color="var(--sapContent_Placeholderloading_Background)" />
				<stop offset="20%" stop-color="var(--sapContent_Placeholderloading_Background)" />
				<stop offset="50%" stop-color="var(--sapContent_Placeholderloading_Background_Dark)" />
				<stop offset="80%" stop-color="var(--sapContent_Placeholderloading_Background)" />
				<stop offset="100%" stop-color="var(--sapContent_Placeholderloading_Background)" />

				<animate
					attributeName="x1"
					values="-0.6;0.6"
					dur="2.5s"
					repeatCount="indefinite" />
				<animate
					attributeName="x2"
					values="0.4;1.6"
					dur="2.5s"
					repeatCount="indefinite" />
			</linearGradient>
		</defs>`;
      return [`<svg height="167" fill="none">
				${loadingShimmer}
				<rect x="16" y="75" width="16" height="16" rx="4" fill="var(--sapContent_Placeholderloading_Background)"/>
				<rect x="48" y="16" width="37%" height="70" rx="16" fill="url(#loadingShimmer)"/>
				<rect x="48" y="102" width="93%" height="48" rx="4" fill="url(#loadingShimmer)"/>
			</svg>`, `<svg height="180" fill="none">
				${loadingShimmer}
				<rect x="16" y="82" width="16" height="16" rx="4" fill="var(--sapContent_Placeholderloading_Background)"/>
				<rect x="48" y="16" width="148" height="148" rx="16" fill="url(#loadingShimmer)"/>
				<rect x="212" y="54" width="75%" height="48" rx="4" fill="url(#loadingShimmer)"/>
				<rect x="212" y="110" width="13%" height="16" rx="4" fill="url(#loadingShimmer)"/>
			</svg>`];
    },
    /**
     * Resets the panel to its default state.
     *
     * @private
     */
    resetPanel: function _resetPanel() {
      const defaultModelProperties = {
        query: "",
        hasError: false,
        searchStatus: SearchStatus.Idle,
        suggestedAppsCount: 0,
        userSelectedApps: [],
        suggestedApps: [],
        feedback: {
          thumbsUp: false,
          thumbsDown: false
        },
        invalidQuery: true
      };
      this.model?.setData({
        ...this.model.getData(),
        ...defaultModelProperties
      });
      this.userSelectedApps?.clear();
    },
    /**
     * Handles the "Go" button press event for searching suggested apps.
     *
     * @private
     * @async
     */
    onPressGo: function _onPressGo() {
      try {
        const _this3 = this;
        // validate query
        const query = _this3.model.getProperty("/query");
        if (!_this3.isValidQuery(query)) return Promise.resolve();
        const _temp5 = _finallyRethrows(function () {
          return _catch(function () {
            // initiate search
            _this3.resetSearch();
            return Promise.resolve(_this3.fetchAppsFromSearch(query)).then(function (rawApps) {
              const _temp4 = function () {
                if (_this3.model.getProperty("/searchStatus") === SearchStatus.Searching) {
                  return Promise.resolve(_this3.fetchAllAvailableVisualizations()).then(function (allVisualizations) {
                    return Promise.resolve(_this3.appManagerInstance.fetchFavVizs(true, true)).then(function (favoriteApps) {
                      return Promise.resolve(_this3.appManagerInstance.fetchInsightApps(true, _this3._i18nBundle.getText("insights"))).then(function (insightsApps) {
                        // generate suggested apps
                        const apps = _this3._generateApps(rawApps, allVisualizations, [...favoriteApps, ...insightsApps]);
                        return Promise.resolve(_this3._filterUnsupportedApps(apps)).then(function (suggestedApps) {
                          if (suggestedApps.length === 0 && !_this3.model.getProperty("/hasError")) {
                            _this3._handleError("", suggestedApps.length);
                          } else {
                            // update model with filtered apps
                            _this3.model.setProperty("/suggestedApps", suggestedApps);
                            _this3.model.setProperty("/suggestedAppsCount", suggestedApps.length);
                            _this3.appSuggestionList.updateAggregation("items", ChangeReason.Refresh, {
                              detailedReason: ChangeReason.Refresh
                            });
                          }
                        });
                      });
                    });
                  });
                }
              }();
              if (_temp4 && _temp4.then) return _temp4.then(function () {});
            }); // suggest apps if there are results and search is not cancelled
          }, function (err) {
            Log.error(err.message);
            _this3._handleError();
          });
        }, function (_wasThrown, _result) {
          // update search status only if search is not cancelled
          if (_this3.model.getProperty("/searchStatus") === SearchStatus.Searching) {
            _this3.model.setProperty("/searchStatus", SearchStatus.Complete);
          }
          if (_wasThrown) throw _result;
          return _result;
        });
        return Promise.resolve(_temp5 && _temp5.then ? _temp5.then(function () {}) : void 0);
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Filters out unsupported apps based on accessibility.
     *
     * @private
     * @param {SuggestedApp[]} apps - The list of suggested apps to filter.
     * @returns {Promise<SuggestedApp[]>} A promise that resolves to the filtered list of supported apps.
     */
    _filterUnsupportedApps: function _filterUnsupportedApps(apps) {
      try {
        const updatedApps = apps.filter(app => app.isStaticApp ? true : app.vizData ?? false);
        const intents = updatedApps.map(app => app.vizData?.target) || [];
        return Promise.resolve(Container.getServiceAsync("Navigation")).then(function (navigationService) {
          return Promise.resolve(navigationService.isNavigationSupported(intents)).then(function (supportedAppIndices) {
            return updatedApps.filter((_, index) => supportedAppIndices[index]);
          });
        });
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Generates suggested apps from raw app data and visualizations.
     *
     * @private
     * @param {RawAppData[]} rawApps - The raw app data to process.
     * @param {IVisualization[]} allVisualizations - All available visualizations.
     * @param {ICustomVisualization[]} homePageVisualizations - Visualizations available in homepage.
     * @returns {SuggestedApp[]} The list of suggested apps.
     */
    _generateApps: function _generateApps(rawApps, allVisualizations, homePageVisualizations) {
      return rawApps.map(app => {
        const vizData = allVisualizations.find(viz => viz.vizId === app.chipID);
        const addedToHomePage = homePageVisualizations.some(viz => viz.visualization?.vizId === app.chipID);
        return {
          title: app.title,
          chipID: app.chipID,
          subTitle: app.subTitle,
          description: app.appDescription,
          icon: app.iconUrl,
          vizData,
          addedToHomePage,
          isStaticApp: app.tileType === TileType.Static,
          status: this.getAppStatusTexts(app.configuration, addedToHomePage),
          url: vizData?.targetURL || ""
        };
      });
    },
    /**
     * Validates the query string based on minimum length.
     *
     * @private
     * @param {string} query - The query string to validate.
     * @returns {boolean} True if the query is valid, otherwise false.
     */
    isValidQuery: function _isValidQuery(query = "") {
      query = query?.trim();
      return query.length >= Constants.MinQueryLength && query.length <= Constants.MaxDescriptionLength;
    },
    /**
     * Fetches all available visualizations for the user.
     *
     * @private
     * @async
     * @returns {Promise<IVisualization[]>} A promise that resolves to the list of visualizations.
     */
    fetchAllAvailableVisualizations: function _fetchAllAvailableVisualizations() {
      try {
        const _this4 = this;
        function _temp7() {
          return _this4.allAvailableVisualizations;
        }
        const _temp6 = function () {
          if (!_this4.allAvailableVisualizations) {
            return Promise.resolve(Container.getServiceAsync("SearchableContent")).then(function (searchableContentService) {
              return Promise.resolve(searchableContentService.getApps({
                enableVisualizationPreview: false
              })).then(function (allAvailableApps) {
                _this4.allAvailableVisualizations = allAvailableApps.reduce((visualizations, currentApp) => {
                  return visualizations.concat(currentApp.visualizations);
                }, []);
              });
            });
          }
        }();
        return Promise.resolve(_temp6 && _temp6.then ? _temp6.then(_temp7) : _temp7(_temp6));
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Fetches a CSRF token for secure API requests.
     *
     * @private
     * @async
     * @returns {Promise<string | null>} A promise that resolves to the CSRF token or null if fetching fails.
     */
    _fetchCSRFToken: function _fetchCSRFToken() {
      try {
        return Promise.resolve(_catch(function () {
          return Promise.resolve(fetch(AI_APP_FINDER_BASE_URL, {
            method: "GET",
            headers: {
              "X-CSRF-Token": "Fetch"
            }
          })).then(function (response) {
            return response.headers.get("X-CSRF-Token");
          });
        }, function (error) {
          Log.error("Failed to fetch CSRF token", error);
          return null;
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Fetches apps from the search API based on the query.
     *
     * @private
     * @async
     * @param {string} query - The search query string.
     * @returns {Promise<RawAppData[]>} A promise that resolves to the list of raw app data.
     */
    fetchAppsFromSearch: function _fetchAppsFromSearch(query) {
      try {
        const _this5 = this;
        return Promise.resolve(_catch(function () {
          return Promise.resolve(_this5._fetchCSRFToken()).then(function (token) {
            const headers = {
              "Content-Type": "application/json",
              ...(token && {
                "X-CSRF-Token": token
              })
            };
            return Promise.resolve(fetch(AI_APP_FINDER_API, {
              method: "POST",
              headers,
              body: JSON.stringify({
                UserInput: query
              })
            })).then(function (response) {
              let _exit = false;
              function _temp0(_result2) {
                return _exit ? _result2 : Promise.resolve(response.json()).then(function (_response$json2) {
                  const queryResult = _response$json2;
                  return queryResult.value || [];
                });
              }
              const _temp9 = function () {
                if (!response.ok) {
                  return Promise.resolve(response.json()).then(function (_response$json) {
                    const errorResponse = _response$json;
                    _this5._handleError(errorResponse.error?.message || "");
                    const _temp8 = [];
                    _exit = true;
                    return _temp8;
                  });
                }
              }();
              // handle error responses
              return _temp9 && _temp9.then ? _temp9.then(_temp0) : _temp0(_temp9);
            });
          });
        }, function (error) {
          Log.error(error.message);
          _this5._handleError();
          return [];
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Retrieves status texts for an app based on its configuration and homepage status.
     *
     * @private
     * @param {string} configuration - The app's configuration string.
     * @param {boolean} addedToHomePage - Indicates if the app is already added to the homepage.
     * @returns {string[]} An array of status texts for the app.
     */
    getAppStatusTexts: function _getAppStatusTexts(configuration, addedToHomePage) {
      let statusTexts = [];
      if (configuration) {
        try {
          const parsedConfig = JSON.parse(configuration);
          const tileConfig = JSON.parse(parsedConfig?.tileConfiguration);
          const infoText = (tileConfig?.display_info_text || "").toLowerCase();
          if (infoText === Constants.DeprecatedInfoText) {
            statusTexts.push(this._i18nBundle.getText("deprecatedApp"));
          }
        } catch (error) {
          Log.warning(error.message);
        }
      }
      if (addedToHomePage) {
        statusTexts.push(this._i18nBundle.getText("alreadyAddedApp"));
      }
      return statusTexts;
    },
    /**
     * Generates status text controls for the provided status texts.
     *
     * @private
     * @param {string} id - The id of the list item.
     * @param {string[]} stausTexts - The list of status texts.
     * @returns {Text[]} An array of Text controls with applied styles.
     */
    _generateStatusTexts: function _generateStatusTexts(id, stausTexts) {
      return stausTexts.map((status, index) => {
        return new Text(recycleId(`${id}-statusText-${index}`), {
          text: status
        }).addStyleClass(this.applyStatusClass(status));
      });
    },
    /**
     * Applies a CSS class to the status text based on its type.
     *
     * @private
     * @param {string} status - The status text to classify.
     * @returns {string} The CSS class for the status text.
     */
    applyStatusClass: function _applyStatusClass(status) {
      if (status === this._i18nBundle.getText("alreadyAddedApp")) {
        return "addedAppStatusText";
      } else if (status === this._i18nBundle.getText("deprecatedApp")) {
        return "deprecatedAppStatusText";
      } else {
        return "";
      }
    },
    /**
     * Handles the "Add Apps" button press event to add selected apps to favorites.
     *
     * @private
     * @async
     */
    onPressAddApps: function _onPressAddApps() {
      try {
        const _this6 = this;
        function _temp14() {
          function _temp12() {
            function _temp10() {
              _this6.getParent()?.close();
              if (userSelectedApps.length > 1) {
                MessageToast.show(_this6._i18nBundle.getText("contentAddedToMyhome"));
              } else {
                const selectedItem = userSelectedApps?.[0];
                const selectedAppTitle = selectedItem?.getBindingContext?.()?.getProperty?.("title") ?? "";
                const messageKey = staticAppsPresent ? "appAddedToFavorites" : "tileAddedToInsights";
                MessageToast.show(_this6._i18nBundle.getText(messageKey, [selectedAppTitle]));
              }
              _this6.resetPanel();
            }
            const _temp1 = function () {
              if (dynamicAppsPresent) {
                return Promise.resolve(_this6.refreshInsightsApps()).then(function () {});
              }
            }();
            return _temp1 && _temp1.then ? _temp1.then(_temp10) : _temp10(_temp1);
          }
          const _temp11 = function () {
            if (staticAppsPresent) {
              return Promise.resolve(_this6.refreshFavoriteApps()).then(function () {});
            }
          }();
          return _temp11 && _temp11.then ? _temp11.then(_temp12) : _temp12(_temp11);
        }
        const userSelectedApps = _this6.model.getProperty("/userSelectedApps");
        let staticAppsPresent = false;
        let dynamicAppsPresent = false;
        const _temp13 = _forOf(userSelectedApps, function (app) {
          const isStaticApp = app.getBindingContext()?.getProperty("isStaticApp");
          if (isStaticApp) staticAppsPresent = true;else dynamicAppsPresent = true;
          const vizId = app.getBindingContext()?.getProperty("chipID");
          return Promise.resolve(_this6.appManagerInstance.addVisualization(vizId, isStaticApp ? undefined : MYINSIGHT_SECTION_ID)).then(function () {});
        });
        return Promise.resolve(_temp13 && _temp13.then ? _temp13.then(_temp14) : _temp14(_temp13));
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Retrieves the parent BaseLayout instance for this panel.
     *
     * @private
     * @returns {BaseLayout} The parent BaseLayout instance.
     */
    getLayout: function _getLayout() {
      return this.getParent()?.getParent();
    },
    /**
     * Retrieves the AppsContainer instance from the parent layout.
     *
     * @private
     * @returns {AppsContainer | undefined} The AppsContainer instance or undefined if not found.
     */
    getAppsContainer: function _getAppsContainer() {
      return this.getLayout()?.getItems().find(container => container instanceof AppsContainer);
    },
    /**
     * Retrieves the favorite apps panel from the AppsContainer.
     *
     * @private
     * @returns {FavAppPanel | undefined} The favorite apps panel or undefined if not found.
     */
    getFavAppPanel: function _getFavAppPanel() {
      return this.getAppsContainer()?.getContent().find(panel => panel instanceof FavAppPanel);
    },
    /**
     * Refreshes the favorite apps panel in the AppsContainer.
     *
     * @private
     * @async
     */
    refreshFavoriteApps: function _refreshFavoriteApps() {
      try {
        const _this7 = this;
        return Promise.resolve(_this7.getAppsContainer()?.refreshPanel(_this7.getFavAppPanel())).then(function () {});
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Retrieves the InsightsContainer instance from the parent layout.
     *
     * @private
     * @returns {InsightsContainer | undefined} The AppsContainer instance or undefined if not found.
     */
    getInsightsContainer: function _getInsightsContainer() {
      return this.getLayout()?.getItems().find(container => container instanceof InsightsContainer);
    },
    /**
     * Refreshes the Insights tiles panel in the InsightsContainer.
     *
     * @private
     * @async
     */
    refreshInsightsApps: function _refreshInsightsApps() {
      try {
        const _this8 = this;
        return Promise.resolve(_this8.getInsightsContainer()?.refreshData("tiles")).then(function () {});
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Handles the selection change event for the suggested apps list.
     *
     * @public
     * @param {ListBase$SelectionChangeEvent} event - The selection change event.
     */
    onListSelectionChange: function _onListSelectionChange(event) {
      const listItem = event.getParameter("listItem");
      const selected = event.getParameter("selected");
      if (!selected) this.userSelectedApps.delete(listItem);else {
        const context = listItem.getBindingContext();
        const addedToHomePage = context?.getProperty("addedToHomePage");
        if (!addedToHomePage) this.userSelectedApps.add(listItem);
      }
      this.model.setProperty("/userSelectedApps", Array.from(this.userSelectedApps));
    },
    /**
     * Handles errors by updating the model with error details.
     *
     * @private
     * @param {string} [message=""] - The error message to process.
     */
    _handleError: function _handleError(message = "", suggestedResponseCount) {
      const [, errorCode] = message.match(/\((\d{2})\d*\)\s*(.*)/) || [];
      if (suggestedResponseCount === 0 || message.length === 0) {
        message = this._i18nBundle.getText("NoResultErrorDescription") || "";
      }
      this.model.setProperty("/hasError", true);
      this.model.setProperty("/errorType", this._getErrorType(errorCode));
      this.model.setProperty("/errorDescription", message);
    },
    /**
     * Determines the error type based on the provided error code.
     *
     * @private
     * @param {string} [errorCode=""] - The error code to evaluate.
     * @returns {ErrorType} The corresponding error type.
     */
    _getErrorType: function _getErrorType(errorCode = "") {
      if (errorCode === "10") {
        return ErrorType.ServiceError;
      } else {
        return ErrorType.NoResultsFound;
      }
    },
    /**
     * Handles live change event for the search text area, updating value state and messages.
     *
     * @private
     * @param {TextArea$LiveChangeEvent} event - The live change event from the text area.
     */
    onSearchTextAreaLiveChange: function _onSearchTextAreaLiveChange(event) {
      const textArea = event.getSource();
      const query = textArea.getValue().trim();
      if (query.length !== 0 && query.length < Constants.MinQueryLength) {
        textArea.setValueState(ValueState.Information);
        textArea.setValueStateText(this._i18nBundle.getText("minLengthRequired"));
      } else if (query.length > Constants.MaxDescriptionLength) {
        textArea.setValueState(ValueState.Warning);
        textArea.setValueStateText(this._i18nBundle.getText("maxLengthExceeded"));
      } else {
        textArea.setValueState(ValueState.None);
        textArea.setValueStateText("");
      }
      this.model.setProperty("/invalidQuery", query.length === 0 || textArea.getValueState() !== ValueState.None);
    },
    /**
     * Generates the AI policy text with a link for display in the footer.
     *
     * @private
     * @returns {string} The formatted AI policy text.
     */
    _generateAIPolicyText: function _generateAIPolicyText() {
      const linkText = this._i18nBundle.getText("createdWithAI");
      return this._i18nBundle.getText("aiPolicyText", [linkText]);
    },
    /**
     * Resets the feedback state.
     *
     * @private
     */
    resetFeedback: function _resetFeedback() {
      this.model.setProperty("/feedback", {
        thumbsUp: false,
        thumbsDown: false
      });
    },
    /**
     * Marks feedback as provided and shows a confirmation message toast.
     *
     * @private
     */
    sendFeedback: function _sendFeedback(feedbackType) {
      this.resetFeedback();
      this.model.setProperty(`/feedback/${feedbackType}`, true);
      MessageToast.show(this._i18nBundle.getText("feedBackSent"), {
        width: "20em"
      });
    }
  });
  return AppsAdditionPanel;
});
//# sourceMappingURL=AppsAdditionPanel-dbg.js.map
