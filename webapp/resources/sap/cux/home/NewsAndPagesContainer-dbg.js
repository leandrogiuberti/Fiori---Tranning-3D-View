/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["./BaseContainer", "./utils/placeholder/NewsAndPagesPlaceholder", "./library", "./utils/Device"], function (__BaseContainer, ___utils_placeholder_NewsAndPagesPlaceholder, ___library, ___utils_Device) {
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
  const BaseContainer = _interopRequireDefault(__BaseContainer);
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
  const getNewsPagesPlaceholder = ___utils_placeholder_NewsAndPagesPlaceholder["getNewsPagesPlaceholder"];
  const NewsType = ___library["NewsType"];
  const OrientationType = ___library["OrientationType"];
  const DeviceType = ___utils_Device["DeviceType"];
  /**
   *
   * Container class for managing and storing News and Pages.
   *
   * @extends BaseContainer
   *
   * @author SAP SE
   * @version 0.0.1
   * @since 1.121
   *
   * @private
   * @ui5-restricted ux.eng.s4producthomes1
   *
   * @alias sap.cux.home.NewsAndPagesContainer
   */
  const NewsAndPagesContainer = BaseContainer.extend("sap.cux.home.NewsAndPagesContainer", {
    metadata: {
      properties: {
        /**
         * Color Personalizations for Spaces & Pages
         */
        colorPersonalizations: {
          type: "array",
          group: "Misc",
          defaultValue: [],
          visibility: "hidden"
        },
        /**
         * Icon Personalizations for Spaces & Pages
         */
        iconPersonalizations: {
          type: "array",
          group: "Misc",
          defaultValue: [],
          visibility: "hidden"
        },
        /**
         * News feed visibility flag
         */
        newsFeedVisibility: {
          type: "boolean",
          group: "Misc",
          defaultValue: true,
          visibility: "hidden"
        }
      }
    },
    renderer: {
      ...BaseContainer.renderer,
      apiVersion: 2
    },
    /**
     * Constructor for the new News and Pages container.
     *
     * @param {string} [id] ID for the new control, generated automatically if an ID is not provided
     * @param {object} [settings] Initial settings for the new control
     */
    constructor: function _constructor(id, settings) {
      BaseContainer.prototype.constructor.call(this, id, settings);
      this.panelLoaded = {};
      this.keyUserChange = false;
      this.isEndUserChange = {
        isEndUser: false,
        newsType: NewsType.None
      };
    },
    /**
     * Init lifecycle method
     *
     * @private
     * @override
     */
    init: function _init() {
      BaseContainer.prototype.init.call(this);
      this.panelLoaded = {};
      this.setProperty("orientation", this.getDeviceType() === DeviceType.Desktop || this.getDeviceType() === DeviceType.LargeDesktop || this.getDeviceType() === DeviceType.XLargeDesktop ? OrientationType.Horizontal : OrientationType.Vertical);
      this.addCustomSetting("title", this._i18nBundle.getText("myInterestMsg"));
      this.addStyleClass("sapCuxNewsAndPagesContainer");
    },
    /**
     * Loads the News and Pages section.
     * Overrides the load method of the BaseContainer.
     *
     * @private
     * @override
     */
    load: function _load() {
      try {
        const _this = this;
        const aContent = _this.getContent();
        const _temp = _forOf(aContent, function (oContent) {
          if (!_this.keyUserChange) {
            _this.checkEndUserChanges(oContent);
          }
          return Promise.resolve(oContent.getData()).then(function () {
            // If the newsVisibilityChangeHandler is invoked before the data is loaded,
            // it may result in the news panel being incorrectly displayed if it was already set hidden by the handler.
            // newsFeedVisibility is set as false, then hide the news panel
            const newsFeedVisibility = _this.getProperty("newsFeedVisibility");
            // if newsFeedVisibility is false, hide the news panel
            if (oContent && oContent.getMetadata().getName() === "sap.cux.home.NewsPanel" && !newsFeedVisibility) {
              oContent.setVisible(false);
            }
          });
        });
        return Promise.resolve(_temp && _temp.then ? _temp.then(function () {}) : void 0);
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Sets property value for colorPersonalization.
     * Overridden to update cached personalizations.
     *
     * @private
     * @override
     * @returns {NewsAndPagesContainer} the container for chaining
     */
    setColorPersonalizations: function _setColorPersonalizations(personalizations) {
      const existingPers = this.getProperty("colorPersonalizations") || [];
      const updatedPers = existingPers.concat(personalizations);
      this.setProperty("colorPersonalizations", updatedPers);
      this.getContent().forEach(oContent => {
        if (oContent.getMetadata().getName() === "sap.cux.home.PagePanel") {
          oContent.applyColorPersonalizations(updatedPers);
        }
      });
      return this;
    },
    /**
     * Sets property value for iconPersonalization.
     * Overridden to update cached personalizations.
     *
     * @private
     * @override
     * @returns {NewsAndPagesContainer} the container for chaining
     */
    setIconPersonalizations: function _setIconPersonalizations(personalizations) {
      const existingPers = this.getProperty("iconPersonalizations") || [];
      const updatedPers = existingPers.concat(personalizations);
      this.setProperty("iconPersonalizations", updatedPers);
      this.getContent().forEach(oContent => {
        if (oContent.getMetadata().getName() === "sap.cux.home.PagePanel") {
          oContent.applyIconPersonalizations(updatedPers);
        }
      });
      return this;
    },
    /**
     * Marks the change as an end-user change if the content is a NewsPanel with a URL and no key user changes exist.
     *
     * @private
     * @param {BasePanel} oContent - The content panel to evaluate, typically of type `sap.cux.home.NewsPanel`.
     */
    checkEndUserChanges: function _checkEndUserChanges(oContent) {
      if (oContent.getMetadata().getName() === "sap.cux.home.NewsPanel" && oContent.getProperty("url") && !this.keyUserChange) {
        this.isEndUserChange.isEndUser = true;
      }
    },
    /**
     * Returns the current end-user change status.
     *
     * @private
     * @returns {EndUserChangeStatus} An object containing the end-user change flag and the news type.
     */
    getIsEndUserChange: function _getIsEndUserChange() {
      return this.isEndUserChange;
    },
    newsVisibilityChangeHandler: function _newsVisibilityChangeHandler(personalization) {
      const aContent = this.getContent();
      aContent.forEach(oContent => {
        if (oContent.getMetadata().getName() === "sap.cux.home.NewsPanel") {
          let newsPanel = oContent;
          if (personalization.isNewsFeedVisible) {
            this.setProperty("newsFeedVisibility", true);
            newsPanel.setVisible(true);
          } else {
            this.setProperty("newsFeedVisibility", false);
            newsPanel.setVisible(false);
          }
        }
      });
    },
    newsPersonalization: function _newsPersonalization(personalizations) {
      const aContent = this.getContent();
      let type;
      aContent.forEach(oContent => {
        this.checkEndUserChanges(oContent);
        if (oContent.getMetadata().getName() === "sap.cux.home.NewsPanel" && !this.isEndUserChange.isEndUser) {
          let newsPanel = oContent;
          const newsFeedVisibility = Boolean(this.getProperty("newsFeedVisibility"));
          this.keyUserChange = true;
          if (personalizations.showCustomNewsFeed) {
            type = NewsType.Custom;
          } else if (personalizations.showRssNewsFeed) {
            type = NewsType.NewsUrl;
          } else {
            type = NewsType.Default;
          }
          newsPanel.setProperty("type", type);
          newsPanel.setProperty("url", personalizations.newsFeedURL);
          newsPanel.setProperty("customFeedKey", personalizations.customNewsFeedKey);
          newsPanel.setProperty("customFileName", personalizations.customNewsFeedFileName);
          if (newsFeedVisibility) {
            const url = personalizations.newsFeedURL;
            newsPanel.setVisible(true);
            const customFeedKey = String(newsPanel.getProperty("customFeedKey"));
            if (personalizations.showCustomNewsFeed && customFeedKey) {
              newsPanel.setProperty("newsAvailable", true);
              void newsPanel.setCustomNewsFeed(customFeedKey);
            } else if (personalizations.showDefaultNewsFeed) {
              void newsPanel.setDefaultNews();
            } else if (personalizations.showRssNewsFeed && url) {
              void newsPanel.setURL(url);
            } else {
              newsPanel.setVisible(false);
              this.setProperty("newsFeedVisibility", false);
            }
          }
        }
      });
    },
    panelLoadedFn: function _panelLoadedFn(sPanelType, oVal) {
      // same issue of panelwrapper not available at this time
      const aContent = this.getContent();
      aContent.forEach(oContent => {
        if (oContent.getMetadata().getName() === "sap.cux.home.PagePanel") {
          this.pagePanel = oContent;
        } else if (oContent.getMetadata().getName() === "sap.cux.home.NewsPanel") {
          this.newsPanel = oContent;
        }
      });
      this.panelLoaded[sPanelType] = oVal;
      this.adjustLayout();
    },
    adjustStyleLayout: function _adjustStyleLayout(bIsNewsTileVisible) {
      const sDeviceType = this.getDeviceType();
      const newsContentWrapper = this.newsPanel ? this.newsPanel.getContent()?.[0] : undefined;
      const pagesContentWrapper = this.pagePanel ? this.pagePanel.getContent()?.[0] : undefined;
      if (bIsNewsTileVisible) {
        this.newsPanel.adjustLayout();
      }
      if (sDeviceType === DeviceType.Desktop || sDeviceType === DeviceType.LargeDesktop || sDeviceType === DeviceType.XLargeDesktop) {
        if (bIsNewsTileVisible) {
          pagesContentWrapper?.setWidth("100%");
        }
        this.setOrientation(OrientationType.Horizontal);
        newsContentWrapper?.setWidth("100%");
        newsContentWrapper?.addStyleClass("newsTileMaxWidth");
      } else if (sDeviceType === DeviceType.Tablet) {
        this.setOrientation(OrientationType.Vertical);
        pagesContentWrapper?.setWidth("100%");
        pagesContentWrapper?.setJustifyContent("Start");
        newsContentWrapper?.setWidth("calc(100vw - 64px)");
        newsContentWrapper?.removeStyleClass("newsTileMaxWidth");
      } else {
        this.setOrientation(OrientationType.Vertical);
        newsContentWrapper?.setWidth("calc(100vw - 16px)");
      }
      if (pagesContentWrapper) {
        setTimeout(this.pagePanel.attachResizeHandler.bind(this.pagePanel, bIsNewsTileVisible, this.getDomRef()?.clientWidth || 0, pagesContentWrapper));
      }
    },
    /**
     * Adjusts the layout of the all panels in the container.
     *
     * @private
     * @override
     */
    adjustLayout: function _adjustLayout() {
      if (this.pagePanel && this.newsPanel && this.newsPanel.getVisible()) {
        let bIsNewsTileVisible = true;
        if (this.panelLoaded["Page"]?.loaded || this.panelLoaded["News"]?.loaded) {
          // In case News Panel fails to load remove the panel and apply styles for page to take full width
          if (this.panelLoaded["News"]?.loaded === false) {
            bIsNewsTileVisible = false;
            this.removeContent(this.newsPanel);
          } else if (this.panelLoaded["Page"]?.loaded === false) {
            this.removeContent(this.pagePanel);
          }
          this.adjustStyleLayout(bIsNewsTileVisible);
        }
      } else if (this.pagePanel && this.panelLoaded["Page"]?.loaded) {
        // If News Panel is not present apply styles for page to take full width
        this.adjustStyleLayout(false);
      }
    },
    /**
     * Retrieves the generic placeholder content for the News and Pages container.
     *
     * @returns {string} The HTML string representing the News and Pages container's placeholder content.
     */
    getGenericPlaceholderContent: function _getGenericPlaceholderContent() {
      return getNewsPagesPlaceholder();
    }
  });
  return NewsAndPagesContainer;
});
//# sourceMappingURL=NewsAndPagesContainer-dbg.js.map
