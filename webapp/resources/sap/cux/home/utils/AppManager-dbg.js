/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/i18n/ResourceBundle", "sap/ui/VersionInfo", "sap/ui/base/Object", "sap/ui/model/odata/v2/ODataModel", "sap/ushell/Config", "sap/ushell/Container", "./AnalyticalCardSkeleton", "./Constants", "./DataFormatUtils", "./HttpHelper", "./RecommendedCardUtil"], function (Log, ResourceBundle, VersionInfo, BaseObject, ODataModelV2, Config, Container, ___AnalyticalCardSkeleton, ___Constants, ___DataFormatUtils, __HttpHelper, __RecommendedCardUtil) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
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
  const AnalyticalCardSkeleton = ___AnalyticalCardSkeleton["AnalyticalCardSkeleton"];
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
  const COLUMN_LENGTH = ___Constants["COLUMN_LENGTH"];
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
  const DEFAULT_BG_COLOR = ___Constants["DEFAULT_BG_COLOR"];
  const FALLBACK_ICON = ___Constants["FALLBACK_ICON"];
  const MYHOME_PAGE_ID = ___Constants["MYHOME_PAGE_ID"];
  const MYHOME_SPACE_ID = ___Constants["MYHOME_SPACE_ID"];
  const MYINSIGHT_SECTION_ID = ___Constants["MYINSIGHT_SECTION_ID"];
  const RECOMMENDATION_SRVC_URL = ___Constants["RECOMMENDATION_SRVC_URL"];
  const RECOMMENDED_CARD_LIMIT = ___Constants["RECOMMENDED_CARD_LIMIT"];
  const createBookMarkData = ___DataFormatUtils["createBookMarkData"];
  const getLeanURL = ___DataFormatUtils["getLeanURL"];
  const HttpHelper = _interopRequireDefault(__HttpHelper);
  const RecommendedCardUtil = _interopRequireDefault(__RecommendedCardUtil);
  const CONSTANTS = {
    MUST_INCLUDE_RECOMMEDED_APPS: ["F0862", "F1823"] //My Inbox and Manage Timesheet apps
  };
  const _parseSBParameters = oParam => {
    let oParsedParams = {};
    if (oParam) {
      if (typeof oParam === "object") {
        oParsedParams = oParam;
      } else {
        try {
          oParsedParams = JSON.parse(oParam);
        } catch (oError) {
          Log.error(oError instanceof Error ? oError.message : String(oError));
          oParsedParams = undefined;
        }
      }
    }
    return oParsedParams;
  };
  const _getTileProperties = vizConfigFLP => {
    let oTileProperties = {};
    if (vizConfigFLP?._instantiationData?.chip?.configuration) {
      const oConfig = _parseSBParameters(vizConfigFLP._instantiationData.chip.configuration);
      if (oConfig?.tileConfiguration) {
        const oTileConfig = _parseSBParameters(oConfig.tileConfiguration);
        if (oTileConfig) {
          oTileProperties = _parseSBParameters(oTileConfig.TILE_PROPERTIES);
        }
      }
    }
    return oTileProperties;
  };
  const _getAppId = vizConfigFLP => {
    let sAppId = "";
    let oTileProperties = {};
    if (vizConfigFLP?.target?.semanticObject && vizConfigFLP?.target?.action) {
      sAppId = `#${vizConfigFLP.target.semanticObject}-${vizConfigFLP.target.action}`;
    } else if (vizConfigFLP?._instantiationData?.chip?.configuration) {
      oTileProperties = _getTileProperties(vizConfigFLP);
      if (oTileProperties?.semanticObject && oTileProperties?.semanticAction) {
        sAppId = `#${oTileProperties?.semanticObject}-${oTileProperties?.semanticAction}`;
      }
    }
    return sAppId;
  };
  const _getTargetUrl = vizConfigFLP => {
    let sTargetURL = _getAppId(vizConfigFLP) || "";
    const oTileProperties = _getTileProperties(vizConfigFLP);
    if (oTileProperties?.evaluationId) {
      sTargetURL += "?EvaluationId=" + oTileProperties.evaluationId;
    }
    return sTargetURL;
  };
  const _isSmartBusinessTile = oVisualization => {
    return oVisualization.vizType?.startsWith("X-SAP-UI2-CHIP:SSB");
  };

  // get App Title in case of value not present at root level
  const _getAppTitleSubTitle = (oApp, vizConfigFLP) => {
    const oAppTileInfo = vizConfigFLP?._instantiationData?.chip?.bags?.sb_tileProperties?.texts;
    return {
      title: oApp.title ? oApp.title : oAppTileInfo?.title || "",
      subtitle: oApp.subtitle ? oApp.subtitle : oAppTileInfo?.description || ""
    };
  };

  /**
   * Link Duplicate Visualizations to a single visualization
   *
   * @param {object[]} aVizs - array of visualizations
   * @returns {object[]} arry of visualizations after linking duplicate visualizations
   * @private
   */
  const _linkDuplicateVizs = aVizs => {
    aVizs.forEach(oDuplicateViz => {
      aVizs.filter(oViz => oViz.appId === oDuplicateViz.appId && oViz?.visualization?.id !== oDuplicateViz?.visualization?.id && oViz.persConfig?.sectionIndex === oDuplicateViz.persConfig?.sectionIndex).forEach(oViz => {
        oViz?.persConfig?.duplicateApps?.push(oDuplicateViz);
      });
    });
    return aVizs;
  };
  const _isGUIVisualization = visualization => {
    return visualization?.target?.parameters?.["sap-ui-tech-hint"]?.value?.value === "GUI";
  };
  const _isMustIncludeRecommendation = recViz => {
    return recViz.fioriId && CONSTANTS.MUST_INCLUDE_RECOMMEDED_APPS.includes(recViz.fioriId);
  };
  const _isVisualizationAlreadyAdded = (visualization, favoriteVisualizations) => {
    return !favoriteVisualizations.some(favViz => favViz.visualization?.target?.semanticObject === visualization.visualization?.target?.semanticObject && favViz.visualization?.target?.action === visualization.visualization?.target?.action);
  };

  /**
   *
   * @class Provides the AppManager Class used for fetch and process user apps.
   *
   * @extends sap.ui.BaseObject
   *
   * @author SAP SE
   * @version 0.0.1
   * @since 1.121.0
   * @private
   *
   * @alias sap.cux.home.util.AppManager
   */

  class AppManager extends BaseObject {
    aRequestQueue = [];
    bInsightsSectionPresent = false;
    vizDataModified = false;
    _oVizCacheData = {};
    _favPageVisualizations = [];
    componentData = {};
    fioriAppData = {};
    constructor() {
      super();
      this.recommendedUtilInstance = RecommendedCardUtil.getInstance();
    }
    static getInstance() {
      if (!AppManager.Instance) {
        AppManager.Instance = new AppManager();
      }
      return AppManager.Instance;
    }
    /**
     * Returns page load promise from the request queue if it exists, adds it to the queue if it doesn't
     *
     * @param {string} sPageId - page id
     * @param {boolean} bForceRefresh - force reload of data if true
     * @returns {Promise} - returns a promise which resolves with the requested page data
     * @private
     */
    _fetchRequestFromQueue(bForceRefresh, pageId = MYHOME_PAGE_ID) {
      try {
        const _this = this;
        return Promise.resolve(Container.getServiceAsync("SpaceContent")).then(function (oSpaceContentService) {
          let oPageLoadPromise;
          _this.aRequestQueue = _this.aRequestQueue || [];

          //Check if request already exists in the queue, if not add it
          const oRequestedPage = _this.aRequestQueue.find(oRequest => oRequest.pageId === pageId);
          if (!oRequestedPage || bForceRefresh === true || _this.vizDataModified === true) {
            _this.vizDataModified = false;
            oPageLoadPromise = oSpaceContentService.getPage(pageId);
            if (oRequestedPage) {
              oRequestedPage.pageLoadPromise = oPageLoadPromise;
            } else {
              _this.aRequestQueue.push({
                pageId: pageId,
                pageLoadPromise: oPageLoadPromise
              });
            }
          } else {
            oPageLoadPromise = oRequestedPage.pageLoadPromise;
          }
          return oPageLoadPromise;
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Returns all dynamic visualizations present in MyHome page
     *
     * @param {boolean} bForceRefresh - force reload of visualizations data
     * @returns {Promise} - resolves to array of all dynamic visualizations in MyHome page
     * @private
     */
    _fetchDynamicVizs(bForceRefresh) {
      return this.fetchFavVizs(bForceRefresh, true).then(aFavApps => aFavApps.filter(oDynApp => oDynApp.isCount || oDynApp.isSmartBusinessTile));
    }
    /**
     * Returns all the sections that are available in the MyHome page
     *
     * @param {boolean} bForceRefresh - force reload of visualizations data
     * @returns {Promise} - resolves to array of all sections available in MyHome page
     * @private
     */
    _getSections(bForceRefresh = false, pageId = MYHOME_PAGE_ID) {
      try {
        const _this2 = this;
        return Promise.resolve(_this2._fetchRequestFromQueue(bForceRefresh, pageId)).then(function (oPage) {
          const aSections = oPage && oPage.sections || [],
            iRecentAppSectionIndex = aSections.findIndex(oSection => oSection.default);
          if (iRecentAppSectionIndex > 0) {
            function _temp2() {
              return _this2._getSections(true);
            }
            const _temp = function () {
              if (_this2._oMoveAppsPromise === undefined) {
                _this2._oMoveAppsPromise = _this2.moveSection(iRecentAppSectionIndex, 0);
                return Promise.resolve(_this2._oMoveAppsPromise).then(function () {});
              }
            }();
            return _temp && _temp.then ? _temp.then(_temp2) : _temp2(_temp);
          } else {
            return aSections;
          }
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Models and returns all visualizations available in MyHome page
     *
     * @param {bool} bForceRefresh - force reload of visualizations data
     * @returns {Promise} - resolves to array of all apps available in MyHome page
     * @private
     */
    _fetchPageVizs(bForceRefresh, pageId = MYHOME_PAGE_ID) {
      try {
        const _this3 = this;
        const aVizs = [];
        _this3._oVizCacheData = _this3._oVizCacheData || {};
        return Promise.resolve(_this3._getSections(bForceRefresh, pageId)).then(function (aSections) {
          return Promise.resolve(Container.getServiceAsync("VisualizationInstantiation")).then(function (oVizInstantiationService) {
            aSections.forEach((oSection, iSectionIndex) => {
              oSection?.visualizations?.forEach((oVisualization, iVisualizationIndex) => {
                const vizConfig = oVisualization.vizConfig,
                  oVizInfo = vizConfig?.["sap.app"] || {
                    title: "?"
                  },
                  oViz = {};
                oViz.oldAppId = _getAppId(vizConfig?.["sap.flp"]);
                oViz.appId = oVisualization?.targetURL; // Using targetURL as unique identifier as in certian scenario vizConfig can be empty.
                oViz.url = oVisualization?.targetURL;
                if (!oViz.url && _isSmartBusinessTile(oVisualization)) {
                  oViz.url = _getTargetUrl(vizConfig?.["sap.flp"]);
                }
                oViz.leanURL = getLeanURL(oViz.url);
                oViz.title = oVisualization?.title || _getAppTitleSubTitle(oVizInfo, oVisualization)?.title;
                oViz.subtitle = oVisualization.subtitle || _getAppTitleSubTitle(oVizInfo, oVisualization).subtitle;
                oViz.BGColor = DEFAULT_BG_COLOR().key;
                oViz.isFav = true;
                oViz.isSection = false;
                oViz.pageId = pageId;
                oViz.icon = vizConfig?.["sap.ui"]?.icons?.icon || FALLBACK_ICON;
                if (oVisualization?.indicatorDataSource) {
                  oViz.isCount = true;
                  oViz.indicatorDataSource = oVisualization.indicatorDataSource.path;
                  oViz.contentProviderId = oVisualization.contentProviderId;
                }
                oViz.isSmartBusinessTile = _isSmartBusinessTile(oVisualization);
                if (oViz.isSmartBusinessTile) {
                  if (!_this3._oVizCacheData[oViz.appId]) {
                    _this3._oVizCacheData[oViz.appId] = oVizInstantiationService.instantiateVisualization(oVisualization);
                    _this3._oVizCacheData[oViz.appId].setActive(true);
                  }
                  oViz.vizInstance = _this3._oVizCacheData[oViz.appId];
                }
                // Add FLP Personalization Config
                oViz.persConfig = {
                  pageId: MYHOME_PAGE_ID,
                  sectionTitle: oSection.title,
                  sectionId: oSection.id,
                  sectionIndex: iSectionIndex,
                  visualizationIndex: iVisualizationIndex,
                  isDefaultSection: oSection.default,
                  isPresetSection: oSection.preset,
                  duplicateApps: []
                };
                oViz.visualization = oVisualization;
                // Title and Subtitle in visualization are required in Insights Dialog.
                oViz.visualization.title = oViz.title;
                oViz.visualization.subtitle = oViz.subtitle;
                aVizs.push(oViz);
              });
            });
            return aVizs;
          });
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Copies all Dynamic visualizations to Insights section
     *
     * @returns {Promise} - resolves to void and copy all the visualizations
     * @private
     */
    _copyDynamicVizs() {
      try {
        const _this4 = this;
        return Promise.resolve(_this4._fetchDynamicVizs(true)).then(function (aDynamicVizs) {
          return Promise.all(aDynamicVizs.map(oDynViz => {
            return _this4.addVisualization(oDynViz.visualization.vizId, MYINSIGHT_SECTION_ID);
          }));
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Returns a list of all favorite vizualizations in MyHome page
     *
     * @param {boolean} bForceRefresh - force reload of vizualizations data
     * @param {boolean} bPreventGrouping - prevent vizualizations grouping
     * @returns {Promise} - resolves to array of favourite vizualizations in MyHome page
     * @private
     */
    fetchFavVizs(bForceRefresh, bPreventGrouping, pageId = MYHOME_PAGE_ID) {
      try {
        const _this5 = this;
        return Promise.resolve(_this5._fetchPageVizs(bForceRefresh, pageId)).then(function (aMyHomeVizs) {
          const aVisibleFavVizs = aMyHomeVizs.filter(oViz => oViz.persConfig && oViz.persConfig.sectionId !== MYINSIGHT_SECTION_ID && oViz.url && oViz.title);
          if (bPreventGrouping) {
            return _this5._filterDuplicateVizs(_linkDuplicateVizs(aVisibleFavVizs), false);
          } else {
            return _this5._addGroupInformation(aVisibleFavVizs);
          }
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Returns all vizualizations present in the Insights Section
     *
     * @param {boolean} bForceRefresh - force reload insights vizualizations data
     * @param {string} sSectionTitle - optional, title of insights section to be used while creating insights section
     * @returns {Promise} - resolves to an array with all vizualizations in Insights section
     */
    fetchInsightApps(bForceRefresh, sSectionTitle) {
      try {
        const _this6 = this;
        function _temp5() {
          return Promise.resolve(fnFetchInsightsApps());
        }
        const fnFetchInsightsApps = function () {
          try {
            return Promise.resolve(_this6._fetchPageVizs(bForceRefresh)).then(function (aVizs) {
              return aVizs.filter(oViz => oViz.persConfig?.sectionId === MYINSIGHT_SECTION_ID && oViz.url && oViz.title);
            });
          } catch (e) {
            return Promise.reject(e);
          }
        };
        const _temp4 = function () {
          if (!_this6.bInsightsSectionPresent) {
            return Promise.resolve(_this6._getSections(bForceRefresh)).then(function (aSections) {
              _this6.insightsSectionIndex = aSections.findIndex(function (oSection) {
                return oSection.id === MYINSIGHT_SECTION_ID;
              });
              const _temp3 = function () {
                if (_this6.insightsSectionIndex === -1 && (Config.last("/core/shell/enablePersonalization") || Config.last("/core/catalog/enabled")) && _this6.bInsightsSectionPresent === false) {
                  _this6.bInsightsSectionPresent = true;
                  return Promise.resolve(_this6.addSection({
                    sectionIndex: aSections?.length,
                    sectionProperties: {
                      id: MYINSIGHT_SECTION_ID,
                      title: sSectionTitle
                    }
                  })).then(function () {
                    return Promise.resolve(_this6._copyDynamicVizs()).then(function () {});
                  });
                } else {
                  _this6.bInsightsSectionPresent = true;
                }
              }();
              if (_temp3 && _temp3.then) return _temp3.then(function () {});
            });
          }
        }();
        return Promise.resolve(_temp4 && _temp4.then ? _temp4.then(_temp5) : _temp5(_temp4));
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Add visualization to a particular section
     *
     * @param {string} visualizationId - The id of the visualization to add.
     * @param {string} sectionId - The id of the section the visualization should be added to (optional parameter)
     * @returns {Promise} resolves to void after adding app to a section
     * @private
     */
    addVisualization(visualizationId, sectionId = undefined) {
      try {
        return Promise.resolve(Container.getServiceAsync("SpaceContent")).then(function (spaceContentService) {
          return Promise.resolve(spaceContentService.addVisualization(MYHOME_PAGE_ID, sectionId, visualizationId)).then(function () {});
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * @param {object} mProperties - map of properties
     * @param {string} mProperties.sectionId - section id from which visualizations should be removed
     * @param {object[]} mProperties.appIds - array of url of visualizations that has to be deleted
     * @param {boolean} mProperties.ignoreDuplicateApps - if true doesn't remove the duplicate apps, else removes the duplicate apps as well
     * @private
     * @returns {Promise} resolves after all visualizations are deleted
     */
    removeVisualizations({
      sectionId,
      vizIds
    }) {
      try {
        const _this7 = this;
        return Promise.resolve(Container.getServiceAsync("SpaceContent")).then(function (spaceContentService) {
          const _temp7 = _forOf(vizIds, function (vizId) {
            return Promise.resolve(_this7._getSections(true)).then(function (sections) {
              const sectionIndex = sections.findIndex(oSection => oSection.id === sectionId);
              const targetSection = sectionIndex > -1 ? sections[sectionIndex] : null;
              const visualizationIndex = targetSection?.visualizations?.findIndex(oVisualization => oVisualization.id === vizId) ?? -1;
              const _temp6 = function () {
                if (visualizationIndex > -1) {
                  return Promise.resolve(spaceContentService.deleteVisualization(MYHOME_PAGE_ID, sectionIndex, visualizationIndex)).then(function () {});
                }
              }();
              if (_temp6 && _temp6.then) return _temp6.then(function () {});
            });
          });
          if (_temp7 && _temp7.then) return _temp7.then(function () {});
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * @param {object} mProperties - map of properties
     * @param {string} mProperties.pageId - page id from which visualizations should be updated
     * @param {object[]} mProperties.sourceSectionIndex - section index in which visualization that has to be updated
     * @param {boolean} mProperties.sourceVisualizationIndex - visualization index in the which should be updated
     * @param {boolean} mProperties.oVisualizationData - visualization data which will be updated for the vizualisation
     * @private
     * @returns {Promise} resolves to void
     */
    updateVisualizations({
      pageId,
      sourceSectionIndex,
      sourceVisualizationIndex,
      oVisualizationData
    }) {
      try {
        return Promise.resolve(Container.getServiceAsync("SpaceContent")).then(function (spaceContentService) {
          return spaceContentService.updateVisualization(pageId, sourceSectionIndex, sourceVisualizationIndex, oVisualizationData);
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Create Insight Section if not already present
     *
     * @param {string} sSectionTitle - optional, section title
     * @returns {Promise} - resolves to insight section created
     */
    createInsightSection(sSectionTitle) {
      try {
        let _exit = false;
        const _this8 = this;
        function _temp9(_result) {
          return _exit ? _result : Promise.resolve();
        }
        const _temp8 = function () {
          if (!_this8.bInsightsSectionPresent) {
            return Promise.resolve(_this8._getSections()).then(function (aSections) {
              const iMyInsightSectionIndex = aSections.findIndex(function (oSection) {
                return oSection.id === MYINSIGHT_SECTION_ID;
              });

              //check if myinsight section exists, if not create one
              if (iMyInsightSectionIndex === -1 && (Config.last("/core/shell/enablePersonalization") || Config.last("/core/catalog/enabled"))) {
                const _this8$addSection = _this8.addSection({
                  sectionIndex: aSections.length,
                  sectionProperties: {
                    id: MYINSIGHT_SECTION_ID,
                    title: sSectionTitle,
                    visible: true
                  }
                });
                _exit = true;
                return _this8$addSection;
              }
            });
          }
        }();
        return Promise.resolve(_temp8 && _temp8.then ? _temp8.then(_temp9) : _temp9(_temp8));
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Adds a section
     *
     * @param {object} mProperties - map of properties
     * @param {string} mProperties.sectionIndex - section index
     * @param {object} mProperties.sectionProperties - section properties
     * @returns {Promise} resolves to void and creates the section
     * @private
     */
    addSection(mProperties) {
      try {
        const {
          sectionIndex,
          sectionProperties
        } = mProperties;
        return Promise.resolve(Container.getServiceAsync("SpaceContent")).then(function (oSpaceContentService) {
          return Promise.resolve(oSpaceContentService.addSection(MYHOME_PAGE_ID, sectionIndex, {
            ...sectionProperties,
            visible: true
          })).then(function () {});
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Returns visualizations for a given section
     * @param {string} sectionId - section id
     * @param {boolean} [forceRefresh=false] - force reload of data if true
     * @returns {Promise} resolves to array of visualizations
     * @private
     */
    getSectionVisualizations(sectionId, forceRefresh = false, pageId = MYHOME_PAGE_ID) {
      try {
        const _this9 = this;
        return Promise.resolve(_this9.fetchFavVizs(forceRefresh, false, pageId)).then(function (aApps) {
          if (sectionId) {
            return aApps.find(oViz => oViz.isSection && oViz.id === sectionId)?.apps || [];
          } else {
            return aApps.filter(oViz => !oViz.isSection); //return recently added apps
          }
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Adds a bookmark.
     * @private
     * @param {Object} bookmark - The bookmark data object.
     * @returns {Promise<void>} - A Promise that resolves once the bookmark is added.
     */
    addBookMark(bookmark, moveConfig) {
      try {
        const _this0 = this;
        return Promise.resolve(Container.getServiceAsync("BookmarkV2")).then(function (oBookmarkService) {
          return Promise.resolve(oBookmarkService.getContentNodes()).then(function (aContentNodes) {
            const oMyHomeSpace = aContentNodes.find(contentNode => contentNode.id === MYHOME_SPACE_ID);
            const contentNode = oMyHomeSpace?.children?.find(contentNode => contentNode.id === MYHOME_PAGE_ID);
            return Promise.resolve(oBookmarkService.addBookmark(createBookMarkData(bookmark), contentNode)).then(function () {
              return moveConfig ? _this0.moveVisualization(moveConfig) : Promise.resolve();
            });
          });
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Retrieves the visualization with the specified appId within the specified section.
     * @param {string} appId - appId of the visualization for.
     * @param {string} sectionId - The ID of the section containing the visualization.
     * @param {boolean} [forceRefresh=false] - Whether to force a refresh of the section's cache.
     * @returns {Promise<object|null>} A promise that resolves with the visualization object if found, or null if not found.
     * @private
     */
    getVisualization(appId, sectionId, forceRefresh = false) {
      try {
        const _this1 = this;
        return Promise.resolve(_this1.getSectionVisualizations(sectionId, forceRefresh)).then(function (sectionVisualizations) {
          return sectionVisualizations.find(sectionVisualization => sectionVisualization.appId === appId);
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Moves a visualization from source section to target section.
     * @param {object} moveConfig - Configuration object containing details for moving the visualization.
     * @param {number} moveConfig.sourceSectionIndex - Index of the source section.
     * @param {number} moveConfig.sourceVisualizationIndex - Index of the visualization within the source section.
     * @param {number} moveConfig.targetSectionIndex - Index of the target section.
     * @param {number} moveConfig.targetVisualizationIndex - Index at which the visualization will be placed within the target section.
     * @returns {Promise<void>} A promise that resolves to void after the move operation.
     * @private
     */
    moveVisualization(moveConfig) {
      try {
        const _this10 = this;
        return Promise.resolve(Container.getServiceAsync("SpaceContent")).then(function (spaceContentService) {
          _this10.vizDataModified = true;
          return spaceContentService.moveVisualization(MYHOME_PAGE_ID, moveConfig.sourceSectionIndex, moveConfig.sourceVisualizationIndex, moveConfig.targetSectionIndex, moveConfig.targetVisualizationIndex);
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Filters out duplicate visualizations from a list of all visualizations
     *
     * @param {object[]} aVisibleFavoriteVizs - array containing list of all visualizations
     * @param {boolean} bReturnDuplicateVizs - flag when set to true, returns only the duplicate apps
     * @returns {object[]} filtered array of vizualisations
     * @private
     */
    _filterDuplicateVizs(aVisibleFavoriteVizs, bReturnDuplicateVizs) {
      return aVisibleFavoriteVizs.filter((oViz, iVizIndex, aVizs) => {
        const iFirstIndex = aVizs.findIndex(oTempApp => oTempApp.appId === oViz.appId);
        return bReturnDuplicateVizs ? iFirstIndex !== iVizIndex : iFirstIndex === iVizIndex;
      });
    }

    /**
     * Add Grouping Information to visualizations list, and return concatenated list.
     *
     * @param {object[]} aFavoriteVizs - list of all favorite visualizations
     * @returns {object[]} - concatenated list contaning grouping information as well
     * @private
     */
    _addGroupInformation(aFavoriteVizs) {
      const aRecentVizs = [],
        aSections = [];
      let oExistingSection;
      _linkDuplicateVizs(aFavoriteVizs).forEach(oViz => {
        if (oViz.persConfig?.isDefaultSection) {
          aRecentVizs.push(oViz);
        } else {
          oExistingSection = aSections.find(oSection => oSection.isSection && oSection.id === oViz.persConfig?.sectionId);
          if (!oExistingSection) {
            aSections.push({
              id: oViz.persConfig?.sectionId,
              index: oViz.persConfig?.sectionIndex,
              title: oViz.persConfig?.sectionTitle || "",
              badge: "1",
              BGColor: DEFAULT_BG_COLOR().key,
              icon: "sap-icon://folder-full",
              isSection: true,
              pageId: oViz.pageId,
              isPresetSection: oViz.persConfig?.isPresetSection,
              apps: [oViz]
            });
          } else {
            oExistingSection.apps?.push(oViz);
            oExistingSection.badge = oExistingSection.apps?.length.toString();
          }
        }
      });

      //filter out duplicate apps only from recent apps list
      return [...aSections, ...this._filterDuplicateVizs(aRecentVizs, false)];
    }

    /**
     * Move a section within a page
     *
     * @param {number} sourceSectionIndex - source index (previous index of the section in the page before move)
     * @param {number} targetSectionIndex - target index (desired index of the section in the page after move)
     * @returns {Promise} resolves to void  and moves the section to desired index within the page
     * @private
     */
    moveSection(sourceSectionIndex, targetSectionIndex) {
      try {
        return Promise.resolve(Container.getServiceAsync("Pages").then(function (oPagesService) {
          const iPageIndex = oPagesService.getPageIndex(MYHOME_PAGE_ID);
          return oPagesService.moveSection(iPageIndex, sourceSectionIndex, targetSectionIndex);
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Checks if a specific URL parameter is enabled (set to "true").
     *
     * @param {string} param - The name of the URL parameter to check.
     * @returns {boolean} `true` if the URL parameter exists and is set to "true" (case-insensitive), otherwise `false`.
     */
    isURLParamEnabled(param) {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams?.get(param)?.toLowerCase() === "true" || false;
    }

    /**
     * Fetch Recommended Fiori IDs
     *
     * @returns {Promise} resolves to array of recommended fiori ids
     * @private
     */
    _getRecommenedFioriIds(bForceRefresh = false) {
      try {
        let _exit2 = false;
        const _this11 = this;
        function _temp1(_result3) {
          return _exit2 ? _result3 : _this11.recommendedFioriIds;
        }
        const _temp0 = function () {
          if (!_this11.recommendedFioriIds || bForceRefresh) {
            return _catch(function () {
              return Promise.resolve(HttpHelper.GetJSON(RECOMMENDATION_SRVC_URL)).then(function (_HttpHelper$GetJSON) {
                const response = _HttpHelper$GetJSON;
                _this11.recommendedFioriIds = response?.value?.map(oApp => {
                  return oApp.app_id;
                }) || [];
              });
            }, function (error) {
              Log.error("Unable to load recommendations: " + error.message);
              const _Promise$resolve = Promise.resolve([]);
              _exit2 = true;
              return _Promise$resolve;
            });
          }
        }();
        return Promise.resolve(_temp0 && _temp0.then ? _temp0.then(_temp1) : _temp1(_temp0));
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Fetch Catalog Apps
     *
     * @returns {Promise} resolves to array of Catalog Apps
     * @private
     */
    _getCatalogApps() {
      try {
        let _exit3 = false;
        const _this12 = this;
        function _temp12(_result4) {
          return _exit3 ? _result4 : Promise.resolve(_this12.catalogAppData);
        }
        const _temp11 = function () {
          if (!_this12.catalogAppData) {
            return _catch(function () {
              return Promise.resolve(Container.getServiceAsync("SearchableContent")).then(function (SearchableContent) {
                _this12.catalogAppData = SearchableContent.getApps({
                  includeAppsWithoutVisualizations: false
                });
                const _this12$catalogAppDat = _this12.catalogAppData;
                _exit3 = true;
                return _this12$catalogAppDat;
              });
            }, function (error) {
              _this12.catalogAppData = undefined;
              Log.error(error instanceof Error ? "Error while fetching catalog apps:" + error.message : String(error));
              const _temp10 = [];
              _exit3 = true;
              return _temp10;
            });
          }
        }();
        return Promise.resolve(_temp11 && _temp11.then ? _temp11.then(_temp12) : _temp12(_temp11));
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Checks whether page settings contains addCardtoInsightsHidden
     * @param {object} page - page object
     * @returns {boolean} returns boolean
     * @private
     */
    isAddCardToInsightsHidden(page) {
      return page?.component?.settings?.tableSettings?.addCardtoInsightsHidden;
    }

    /**
     * check Valid Manifests
     *
     * @returns {boolean} returns boolean
     * @private
     */

    _checkValidManifests(manifest) {
      const dataSources = manifest["sap.app"]?.dataSources;

      // Ensure dataSources has the correct structure for `mainService`
      const hasRequiredDataSource = manifest["sap.ui.generic.app"] && dataSources?.mainService;
      if (!hasRequiredDataSource) {
        return false;
      }
      const pages = manifest["sap.ui.generic.app"]?.pages;
      // if its not list report component or if listreport page settings has
      // isAddCardToInsightsHidden as true, then do not recommend the card
      if (Array.isArray(pages)) {
        return this.recommendedUtilInstance._isListReport(pages[0]) && !this.isAddCardToInsightsHidden(pages[0]);
      }
      const pageValues = Object.values(pages);
      if (pageValues.length > 0) {
        return pageValues.some(page => {
          return typeof page === "object" && this.recommendedUtilInstance._isListReport(page) && !this.isAddCardToInsightsHidden(page);
        });
      }
      return false;
    }

    /**
     * Get OData Model
     *
     * @param {object} manifest - manifest object
     * @returns {ODataModelV2} returns OData Model
     * @private
     */
    _getOdataModel(oManifest) {
      return new Promise(function (resolve) {
        const datasource = oManifest?.["sap.app"]?.dataSources;
        const mainService = datasource?.mainService;
        let annotationUrls = (mainService?.settings?.annotations || []).map(name => datasource?.[name]?.uri || "").filter(Boolean);
        const oDataModel = new ODataModelV2(mainService?.uri, {
          annotationURI: annotationUrls,
          loadAnnotationsJoined: true
        });
        oDataModel.attachMetadataLoaded(() => {
          resolve(oDataModel);
        });
        oDataModel.attachMetadataFailed(() => {
          resolve(oDataModel);
        });
      });
    }

    /**
     * Get Entity Set
     *
     * @param {object} manifest - manifest object
     * @returns {string} returns entity set
     * @private
     */
    _getEntitySet(manifest) {
      const pages = manifest["sap.ui.generic.app"]?.pages;
      if (Array.isArray(pages)) {
        return pages[0].entitySet;
      } else if (pages) {
        for (const key in pages) {
          const oApp = pages[key];
          if (this.recommendedUtilInstance._isListReport(oApp)) {
            return oApp.entitySet;
          }
        }
      }
      return undefined;
    }

    /**
     * Load I18n
     *
     * @param {object} manifest - manifest object
     * @param {string} manifestUrl - manifest url
     * @returns {object} returns resource bundle
     * @private
     */
    loadI18n(manifest, manifestUrl) {
      try {
        const _this13 = this;
        function _temp14() {
          return _this13._RBManifestMap[absoluteUrl];
        }
        // construct abslute url for properties file relative to manifest url
        const i18nBundleUrl = manifest?.["sap.app"]?.["i18n"]?.["bundleUrl"];
        const absoluteUrl = new URL(i18nBundleUrl, manifestUrl).href;
        _this13._RBManifestMap = _this13._RBManifestMap || {};
        const _temp13 = function () {
          if (!_this13._RBManifestMap[absoluteUrl]) {
            return Promise.resolve(ResourceBundle.create({
              // specify url of the base .properties file
              bundleUrl: absoluteUrl,
              async: true,
              terminologies: manifest["sap.app"]?.["i18n"]?.["terminologies"]
            })).then(function (oResourceBundle) {
              _this13._RBManifestMap[absoluteUrl] = oResourceBundle;
            });
          }
        }();
        return Promise.resolve(_temp13 && _temp13.then ? _temp13.then(_temp14) : _temp14(_temp13));
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Get I18n Value Or Default String
     *
     * @param {string} sValue - value
     * @param {object} oResourceBundle - resource bundle object
     * @returns {string} returns string
     * @private
     */
    getI18nValueOrDefaultString(sValue, oRB) {
      let sPath = "";
      if (sValue && sValue.startsWith("{{")) {
        sPath = sValue.substring(2, sValue.length - 2);
      } else if (sValue && sValue.startsWith("{")) {
        sPath = sValue.substring(1, sValue.length - 1);
      }
      return sPath ? oRB.getText(sPath) : sValue;
    }

    /**
     * Retrieves a copy of the analytical card manifest.
     *
     *
     * @private
     * @returns {ICardManifest} A copy of the analytical card manifest.
     */
    _getAnalyticalCardManifest() {
      return JSON.parse(JSON.stringify(AnalyticalCardSkeleton));
    }

    /**
     * Processes the app manifest and generates a recommended card manifest if the app meets the required conditions.
     *
     * @param {ODataMetaModel} metaModel - The OData meta model containing metadata about entities and properties.
     * @param {IValidManifest} manifestObj - An object containing the app manifest and its URL.
     * @param {AppInfoData | undefined} parentApp - The parent app information, if available.
     * @param {IVersionInfo} versionInfo - The version and build timestamp of the app.
     * @returns {Promise<ICardManifest | undefined>} A promise that resolves to the generated card manifest if the app is eligible,
     * or `undefined` if the app does not meet the required conditions.
     * @private
     */
    getProcessedManifest(metaModel, manifestObj, parentApp, versionInfo) {
      try {
        const _this14 = this;
        return Promise.resolve(_catch(function () {
          function _temp17() {
            return _this14.recommendedUtilInstance._createCardManifest(cardInput, versionInfo, manifest, suppressRowNavigation);
          }
          const manifest = manifestObj.manifest;
          const mainEntitySetName = _this14._getEntitySet(manifest);
          if (!mainEntitySetName) {
            return undefined;
          }
          const mainEntitySet = metaModel.getODataEntitySet(mainEntitySetName);
          const lineItemDetails = _this14.recommendedUtilInstance.getLineItemDetails(metaModel, manifest, mainEntitySetName);
          if (!lineItemDetails?.lineItem) {
            return undefined;
          }
          const entitySetName = lineItemDetails.entitySet || mainEntitySetName;
          const entitySet = entitySetName === mainEntitySetName ? mainEntitySet : metaModel.getODataEntitySet(entitySetName);
          const entityType = metaModel.getODataEntityType(entitySet.entityType);
          const suppressRowNavigation = lineItemDetails?.lrSettings?.["bSupressCardRowNavigation"];

          // Check for mandatory properties
          if (_this14.recommendedUtilInstance.hasMandatoryProperties(entitySet, entityType?.property)) {
            return undefined;
          }

          // Check for parameterized entity sets
          const parameterDetails = _this14.recommendedUtilInstance._getParametersisedEntitySetParams(metaModel, entitySetName, true);
          if (parameterDetails?.entitySetName && parameterDetails?.parameters?.length) {
            const paramEntitySet = metaModel.getODataEntitySet(parameterDetails.entitySetName);
            if (_this14.recommendedUtilInstance.hasMandatoryProperties(paramEntitySet, parameterDetails.parameters)) {
              return undefined;
            }
          }
          const cardInput = _this14.recommendedUtilInstance._getManifestCardData(manifest, lineItemDetails, parentApp, metaModel);

          // Ensure the card has at least 3 columns
          if (cardInput.columns.length < COLUMN_LENGTH) {
            return undefined;
          }

          // Resolve card title
          const headerInfo = lineItemDetails?.headerInfo;
          const cardTitle = headerInfo.TypeNamePlural?.String || "";
          cardInput.cardTitle = cardTitle || cardInput.cardTitle;

          // Resolve i18n title if necessary
          const _temp16 = function () {
            if (!cardTitle && manifest["sap.app"]?.i18n) {
              const i18nBundleUrl = manifest["sap.app"].i18n.bundleUrl;
              const appTitle = manifest["sap.app"].title;
              const _temp15 = function () {
                if (i18nBundleUrl && (appTitle.startsWith("i18n>") || appTitle.startsWith("{"))) {
                  return Promise.resolve(_this14.loadI18n(manifest, manifestObj.url)).then(function (i18nResourceBundle) {
                    cardInput.cardTitle = _this14.getI18nValueOrDefaultString(cardInput.cardTitle, i18nResourceBundle);
                  });
                }
              }();
              if (_temp15 && _temp15.then) return _temp15.then(function () {});
            }
          }();
          return _temp16 && _temp16.then ? _temp16.then(_temp17) : _temp17(_temp16);
        }, function (oError) {
          Log.error("Error while processing manifest", oError instanceof Error ? oError.message : String(oError));
          return undefined;
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Fetches the OData meta models for a given list of valid manifests.
     * @param {IValidManifest[]} validManifests - An array of valid manifest objects
     * @returns {Promise<(ODataMetaModel | undefined)[]>} A promise that resolves to an array of OData meta models.
     * Each element corresponds to a manifest in the input array, and may be `undefined` if the meta model could not be fetched.
     * @private
     */
    fetchMetaModels(validManifests) {
      try {
        const _this15 = this;
        const odataPromises = validManifests.map(function (manifestObj) {
          try {
            return Promise.resolve(_catch(function () {
              return Promise.resolve(_this15._getOdataModel(manifestObj.manifest)).then(function (_this15$_getOdataMode) {
                return _this15$_getOdataMode?.getMetaModel();
              });
            }, function (oError) {
              Log.error("Error while fetching metamodel", oError instanceof Error ? oError.message : String(oError));
              return undefined;
            }));
          } catch (e) {
            return Promise.reject(e);
          }
        });
        return Promise.resolve(Promise.all(odataPromises));
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Combines the valid manifests with their corresponding OData meta models.
     * @param {IValidManifest[]} validManifests - An array of valid manifest objects
     * @param {ODataMetaModel[]} aMetaModel - An array of OData meta models
     * @returns {ICombinedManifestDetails[]} An array of objects containing the manifest and the corresponding meta model.
     * @private
     */
    combineManifestsAndMetaModels(validManifests, aMetaModel) {
      return validManifests.reduce((combined, manifestObj, index) => {
        const metaModel = aMetaModel[index];
        if (metaModel) {
          combined.push({
            manifest: manifestObj,
            metaModel
          });
        }
        return combined;
      }, []);
    }

    /**
     * Process the manifest and meta model to get the card manifest
     * @param {ICombinedManifestDetails[]} combinedDetails - An array of objects containing the manifest and the corresponding meta model.
     * @param {IAppInfoData[]} aCSTR - An array of app info data
     * @returns {Promise<(ICardManifest | undefined)[]>} A promise that resolves to an array of recommended card manifests.
     * @private
     */
    processManifests(combinedDetails, aCSTR) {
      try {
        const _this16 = this;
        return Promise.all(combinedDetails.map(item => {
          const parentApp = aCSTR.find(oApp => oApp.resolutionResult?.ui5ComponentName === item.manifest.manifest?.["sap.app"]?.id);
          return _this16.getProcessedManifest(item.metaModel, item.manifest, parentApp, _this16.versionInfo);
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Processes the app list to generate a list of Fiori IDs.
     *
     * If `aList` is not provided, it uses `aAppComponentIds` and `aComponent` to generate the list of Fiori IDs.
     * It matches the `semanticObject` and `action` of each component in `aAppComponentIds` with the entries in `aComponent`.
     * If a match is found, the corresponding `fioriId` is added to the list.
     *
     * @param {string[]} [aList] - An optional array of Fiori IDs to return directly.
     * @param {ICardDetails[]} [aAppComponentIds] - An array of app component details to process.
     * @param {IAppInfo} [aComponent] - A mapping of component IDs to their corresponding data entries.
     * @returns {string[]} - A list of Fiori IDs.
     */
    processAppList(aList, aAppComponentIds, aComponent) {
      if (!aList && aAppComponentIds && aAppComponentIds.length) {
        return aAppComponentIds.reduce((list, oComponent) => {
          const oData = aComponent?.[oComponent.id] || [];
          const matchingData = oData.find(entry => entry.semanticObject === oComponent.target?.semanticObject && entry.action === oComponent.target?.action);
          return matchingData ? [...list, matchingData.fioriId] : list;
        }, []);
      }
      return aList || [];
    }

    /**
     * Fetch Card Mainfest
     *
     * @param {string[]} aAppIds - array of app ids
     * @returns {Promise} resolves to array of card manifest
     * @private
     */
    _getCardManifest(aList, aAppComponentIds) {
      try {
        const _this17 = this;
        return Promise.resolve(_catch(function () {
          return Promise.resolve(Promise.all([_this17._getCatalogApps(), _this17.getFioriAppData()])).then(function ([aCatalog, aFioriData]) {
            return Promise.resolve(VersionInfo.load()).then(function (_VersionInfo$load) {
              _this17.versionInfo = _VersionInfo$load;
              const aCSTR = Object.values(aFioriData).flat();
              const aComponent = _this17.componentData;
              // in case of replacing old recommended cards fioriIds are not available hence make use of componnetname
              // and semanticobject and action to find fioriId, and populate aList to recreate recommended card again
              const processedList = _this17.processAppList(aList, aAppComponentIds, aComponent);
              return Promise.resolve(_this17.fetchManifests(processedList, aFioriData, aCatalog)).then(function (manifests) {
                const validManifests = manifests.filter(manifestObj => _this17._checkValidManifests(manifestObj.manifest));
                return Promise.resolve(_this17.fetchMetaModels(validManifests)).then(function (aMetaModel) {
                  const combinedDetails = _this17.combineManifestsAndMetaModels(validManifests, aMetaModel);
                  return Promise.resolve(_this17.processManifests(combinedDetails, aCSTR)).then(function (cards) {
                    return cards.filter(card => card !== undefined);
                  });
                });
              });
            });
          });
        }, function (oError) {
          Log.error("Error while fetching card manifest", oError instanceof Error ? oError.message : String(oError));
          return [];
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Fetch the app manifest for the given app ids
     * @param {string[]} appIdList - array of app ids
     * @param {AppInfo} fioriData - fiori data
     * @param {AppData[]} catalogData - catalog data
     * @returns {Promise} resolves to array of manifests
     * @private
     */
    fetchManifests(appIdList, fioriData, catalogData) {
      try {
        return Promise.resolve(_catch(function () {
          const appPromises = appIdList.map(function (appId) {
            try {
              let _exit4 = false;
              const aApp = fioriData[appId] || [];
              const _temp18 = _forOf(aApp, function (oApp) {
                const oViz = catalogData.find(catalog => oApp.semanticObject === catalog.target?.semanticObject && oApp.action === catalog.target?.action);
                const manifestUrl = oApp?.resolutionResult?.applicationDependencies?.manifest;
                return function () {
                  if (oViz && manifestUrl) {
                    return _catch(function () {
                      return Promise.resolve(fetch(manifestUrl)).then(function (response) {
                        return Promise.resolve(response.json()).then(function (_response$json) {
                          const manifest = _response$json;
                          const _url$manifest = {
                            url: response.url,
                            manifest
                          };
                          _exit4 = true;
                          return _url$manifest;
                        });
                      });
                    }, function (error) {
                      Log.error("Error while fetching manifest", error instanceof Error ? error.message : String(error));
                      _exit4 = true;
                      return undefined;
                    });
                  }
                }();
              }, function () {
                return _exit4;
              });
              return Promise.resolve(_temp18 && _temp18.then ? _temp18.then(function (_result6) {
                return _exit4 ? _result6 : undefined;
              }) : _exit4 ? _temp18 : undefined); // No valid manifest found in this appId's entries
            } catch (e) {
              return Promise.reject(e);
            }
          });
          return Promise.resolve(Promise.all(appPromises)).then(function (results) {
            return results.filter(manifest => manifest !== undefined);
          });
        }, function (oError) {
          Log.error("Error while processing manifests", oError instanceof Error ? oError.message : String(oError));
          return [];
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Remove Duplicate Cards
     *
     * @param {object[]} aCards - array of cards
     * @returns {object[]} returns array of cards
     * @private
     */
    _removeDuplicateCards(aCards) {
      const oCardDict = {};
      const aResult = [];
      aCards.forEach(oCard => {
        const sCardTitle = oCard?.descriptorContent?.["sap.card"]?.header?.title || "";
        if (!oCardDict[sCardTitle]) {
          aResult.push(oCard);
          oCardDict[sCardTitle] = true;
        }
      });
      return aResult;
    }

    /**
     * Fetch Recommended Cards
     *
     * @returns {Promise<ICard[] | []> } resolves to array of recommended cards
     * @private
     */
    getRecommenedCards() {
      try {
        const _this18 = this;
        return Promise.resolve(_catch(function () {
          return Promise.resolve(_this18._getRecommenedFioriIds()).then(function (aAppIds) {
            return Promise.resolve(_this18._getCardManifest(aAppIds)).then(function (aManifests) {
              const aRecManifests = aManifests?.slice(0, RECOMMENDED_CARD_LIMIT);
              const aRecommendedCards = aRecManifests?.map(manifest => {
                let id;
                if (manifest?.["sap.card"]) {
                  manifest["sap.card"].rec = true;
                  id = manifest["sap.app"]?.id;
                }
                return {
                  id,
                  descriptorContent: manifest
                };
              });
              return _this18._removeDuplicateCards(aRecommendedCards);
            });
          });
        }, function (error) {
          Log.error("Error while fetching recommended cards:", error instanceof Error ? error.message : String(error));
          return [];
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Retrieves a list of recommended visualizations for the user.
     *
     * The final list is composed of up to 10 recommendations, with must-include visualizations prioritized.
     * If no recommended visualizations are available or if an error occurs, it returns an empty array.
     *
     * @private
     * @async
     * @param {boolean} [forceRefresh=false] - If `true`, forces a refresh of the recommended visualizations
     *                                         regardless of whether they are cached.
     * @returns {Promise<ICustomVisualization[]>} A promise that resolves to an array of recommended visualizations.
     *                                            The array is limited to 10 visualizations, including must-include recommendations.
     */
    getRecommendedVisualizations(forceRefresh = false) {
      try {
        const _this19 = this;
        function _temp21() {
          return _this19._recommendedVisualizations;
        }
        const _temp20 = function () {
          if (!_this19._recommendedVisualizations || forceRefresh) {
            return Promise.resolve(_this19._getRecommenedFioriIds(forceRefresh)).then(function (recommendedFioriIds) {
              const _temp19 = function () {
                if (recommendedFioriIds.length) {
                  let finalRecommendations = [];
                  let mustIncludeRecommendations = [];
                  return Promise.resolve(Promise.all([_this19._getVisualizationsByFioriIds(recommendedFioriIds), _this19._fetchPageVizs(forceRefresh)])).then(function ([recommendedVisualizations, favoriteVisualizations]) {
                    //filter out recommendations that are already added
                    recommendedVisualizations = recommendedVisualizations.filter(recViz => _isVisualizationAlreadyAdded(recViz, favoriteVisualizations));
                    recommendedVisualizations.forEach(recViz => {
                      if (_isMustIncludeRecommendation(recViz)) {
                        mustIncludeRecommendations.push(recViz);
                      } else {
                        finalRecommendations.push(recViz);
                      }
                    });
                    //return only 10 recommended apps along with 'MyInbox' and 'Manage My Timesheet' if user has access to these apps.
                    _this19._recommendedVisualizations = finalRecommendations.slice(0, 10 - mustIncludeRecommendations.length).concat(mustIncludeRecommendations);
                  });
                } else {
                  _this19._recommendedVisualizations = [];
                }
              }();
              if (_temp19 && _temp19.then) return _temp19.then(function () {});
            });
          }
        }();
        return Promise.resolve(_temp20 && _temp20.then ? _temp20.then(_temp21) : _temp21(_temp20));
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Asynchronously retrieves the list of inbound applications from the SAP Fiori client-side target resolution service.
     *
     * @private
     * @async
     * @returns {Promise<Array>} A promise that resolves to an array of inbound applications.
     *                            If an error occurs or the inbound applications are not available, it resolves to an empty array.
     */
    _getInboundApps() {
      try {
        return Promise.resolve(_catch(function () {
          return Promise.resolve(Container.getServiceAsync("ClientSideTargetResolution")).then(function (service) {
            return service?._oAdapter?._aInbounds || [];
          });
        }, function (error) {
          Log.error("Error while fetching inbound apps: " + error.message);
          return [];
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Retrieves Fiori app data and stores it in the `fioriAppData` and `componentData` properties.
     *
     * This method fetches inbound applications using the `_getInboundApps` method and processes them to extract
     * Fiori app IDs (`sap-fiori-id`) and their associated semantic data. It also maps UI5 component names to their
     * corresponding Fiori app IDs for later use.
     *
     * @returns {Promise<IAppInfo>} A promise that resolves to an object containing Fiori app data
     * @private
     */
    getFioriAppData() {
      try {
        const _this20 = this;
        return Promise.resolve(_catch(function () {
          function _temp23() {
            return _this20.fioriAppData;
          }
          const _temp22 = function () {
            if (!Object.keys(_this20.componentData).length) {
              _this20.componentData = {};
              _this20.fioriAppData = {};
              return Promise.resolve(_this20._getInboundApps()).then(function (inbounds) {
                inbounds.forEach(oItem => {
                  const fioriId = oItem?.signature?.parameters?.["sap-fiori-id"]?.defaultValue?.value;
                  const componentId = oItem?.resolutionResult?.ui5ComponentName;
                  if (fioriId) {
                    const semanticData = {
                      action: oItem.action,
                      semanticObject: oItem.semanticObject,
                      resolutionResult: oItem.resolutionResult
                    };
                    _this20.fioriAppData[fioriId] = _this20.fioriAppData[fioriId] || [];
                    _this20.fioriAppData[fioriId].push(semanticData);

                    // store data along with fioriId in componentData, this can be used later to find the
                    // fioriId for those apps when only ui5ComponentName is known
                    if (componentId) {
                      const combinedData = {
                        ...semanticData,
                        fioriId
                      };
                      _this20.componentData[componentId] = _this20.componentData[componentId] || [];
                      _this20.componentData[componentId].push(combinedData);
                    }
                  }
                });
              });
            }
          }();
          return _temp22 && _temp22.then ? _temp22.then(_temp23) : _temp23(_temp22);
        }, function (oError) {
          Log.error(oError instanceof Error ? oError.message : String(oError));
          return {};
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Retrieves visualizations based on a list of Fiori IDs.
     *
     * This function processes the given Fiori IDs to find associated visualizations. It does so by fetching
     * inbound applications and catalog apps, then matching the Fiori IDs to filter out and gather relevant visualizations.
     * The function distinguishes between GUI and non-GUI visualizations, prioritizing non-GUI visualizations if both types are found.
     * It also ensures that each visualization is unique based on its URL and title, avoiding duplicates.
     *
     * @private
     * @async
     * @param {string[]} fioriIds - An array of Fiori IDs to search for visualizations.
     * @returns {Promise<ICustomVisualization[]>} A promise that resolves to an array of unique visualizations associated with the provided Fiori IDs.
     */
    _getVisualizationsByFioriIds(fioriIds) {
      try {
        const _this21 = this;
        const visualizations = [];
        const visitedVisualizations = new Map();
        return Promise.resolve(Promise.all([_this21._getInboundApps(), _this21._getCatalogApps()])).then(function ([inbounds, catalogApps]) {
          fioriIds.forEach(fioriId => {
            // get all inbounds with the fiori id
            const authorizedApps = inbounds.filter(function (inbound) {
              return inbound?.signature.parameters["sap-fiori-id"]?.defaultValue?.value === fioriId;
            });
            authorizedApps.forEach(app => {
              //filter apps that matched semantic object action
              let matchingVizualizations = catalogApps.filter(catalogApp => {
                return catalogApp?.target?.semanticObject === app.semanticObject && catalogApp.target.action === app.action;
              });
              const guiVisualizations = matchingVizualizations.filter(matchingVizualization => _isGUIVisualization(matchingVizualization));
              const nonGuiVisualizations = matchingVizualizations.filter(matchingVizualization => !_isGUIVisualization(matchingVizualization));
              //if both gui and non-gui visualizations exists, then consider only non-gui visualizations for recommendation.
              if (guiVisualizations.length > 0 && nonGuiVisualizations.length > 0) {
                matchingVizualizations = [...nonGuiVisualizations];
              }
              matchingVizualizations.forEach(matchingVizualization => {
                let visualization = matchingVizualization.visualizations[0];
                let recommendedVisualization = {
                  title: visualization.title,
                  subtitle: visualization.subtitle,
                  icon: visualization.icon,
                  url: visualization.targetURL,
                  vizId: visualization.vizId,
                  fioriId: fioriId,
                  visualization: visualization
                };
                //if app with same url or title already recommended, then don't consider it.
                if (!visitedVisualizations.has(recommendedVisualization.url) || !visitedVisualizations.has(recommendedVisualization.title)) {
                  visitedVisualizations.set(recommendedVisualization.url, true);
                  visitedVisualizations.set(recommendedVisualization.title, true);
                  visualizations.push(recommendedVisualization);
                }
              });
            });
          });
          return visualizations;
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Retrieves visualizations for all favorite pages based on the provided parameters.
     * @param {Array} pages - An array of favorite pages.
     * @param {boolean} shouldReload - A flag indicating whether to reload page visualizations.
     * @returns {Promise<ICustomVisualization[]>} A promise that resolves with an array of favorite page visualizations.
     * @private
     */
    _getAllFavPageApps(pages, shouldReload) {
      try {
        let _exit5 = false;
        const _this22 = this;
        return Promise.resolve(_catch(function () {
          function _temp25(_result7) {
            return _exit5 ? _result7 : [];
          }
          const _temp24 = function () {
            if (pages) {
              _this22._favPageVisualizations = _this22._favPageVisualizations || [];
              //Check to ensure that missing visualization data is loaded, if any
              const loadedPages = _this22._favPageVisualizations.reduce((pageIDs, visualization) => {
                if (visualization.pageId && !pageIDs.includes(visualization.pageId)) {
                  pageIDs.push(visualization.pageId);
                }
                return pageIDs;
              }, []);
              const pageIds = pages.map(page => page.pageId);
              const shouldLoadMissingApps = loadedPages.length === 0 || !loadedPages.every(pageId => pageIds.includes(pageId));
              if (!shouldReload && !shouldLoadMissingApps) {
                const _this22$_favPageVisua = _this22._favPageVisualizations;
                _exit5 = true;
                return _this22$_favPageVisua;
              } else {
                return Promise.resolve(_this22._loadAllPageVisualizations(pages, shouldReload)).then(function (_this22$_loadAllPageV) {
                  _this22._favPageVisualizations = _this22$_loadAllPageV;
                  const _this22$_favPageVisua2 = _this22._favPageVisualizations;
                  _exit5 = true;
                  return _this22$_favPageVisua2;
                });
              }
            }
          }();
          return _temp24 && _temp24.then ? _temp24.then(_temp25) : _temp25(_temp24);
        }, function (error) {
          Log.error(error);
          return [];
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Loads visualizations for all specified pages.
     * @param {Array} pages - An array of pages.
     * @param {boolean} [shouldFetchDistinctApps=false] - A flag indicating whether to fetch distinct pages.
     * @returns {Promise<ICustomVisualization[]>} A promise that resolves with an array of page visualizations.
     * @private
     */
    _loadAllPageVisualizations(pages, forceRefresh = false, shouldFetchDistinctApps = false) {
      try {
        const _this23 = this;
        const getBgColor = pageId => {
          return pages.find(page => page.pageId === pageId)?.BGColor ?? DEFAULT_BG_COLOR().key;
        };
        return Promise.resolve(_catch(function () {
          const favPageVisualizations = [];
          return Promise.resolve(_this23.loadPages(pages, forceRefresh)).then(function (aPages) {
            for (const page of aPages) {
              const sections = page?.sections || [];
              for (const section of sections) {
                const visualizations = section.visualizations || [];
                for (const visualization of visualizations) {
                  const app = {
                    appId: visualization.targetURL,
                    vizId: visualization.vizId,
                    icon: visualization.icon,
                    BGColor: getBgColor(page.id),
                    pageId: page.id
                  };
                  if (!shouldFetchDistinctApps || !favPageVisualizations.some(oVizApp => oVizApp.appId === app.appId)) {
                    favPageVisualizations.push(app);
                  }
                }
              }
            }
            return favPageVisualizations;
          });
        }, function (error) {
          Log.error(error);
          return [];
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Fetches page data for the specified pages.
     * @param {Array} pages - An array of pages.
     * @param {boolean} forceRefresh - If true, forces a refresh of the page data.
     * @returns {Promise<IPage>} A promise that resolves to the fetched page data.
     * @private
     */
    loadPages(pages, forceRefresh = false) {
      try {
        const _this24 = this;
        return Promise.resolve(Promise.all(pages.map(page => _this24._fetchRequestFromQueue(forceRefresh, page.pageId))));
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }
  return AppManager;
});
//# sourceMappingURL=AppManager-dbg.js.map
