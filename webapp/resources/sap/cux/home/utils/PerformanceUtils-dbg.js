/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ushell/Container", "sap/ushell/EventHub", "sap/ushell/utils"], function (Container, EventHub, utils) {
  "use strict";

  /**
   * Sets up performance tracking for the given layout.
   *
   * @param {Layout} layout - The layout object containing the UI elements.
   */
  const setupPerformanceTracking = function (layout) {
    try {
      if (!layout || setupTracking) return Promise.resolve();
      const containers = layout.getItems();
      containers.forEach(container => {
        container.getContent().forEach(panel => {
          panel.attachEventOnce("loaded", function () {
            try {
              const containerName = container.getMetadata().getName();
              const heroElement = availableElements.filter(availableElement => availableElement.control?.getVisible())[0].name;

              // If the hero element is loaded, mark the end of the homepage load
              const _temp2 = function () {
                if (containerName === heroElement) {
                  return Promise.resolve(markHomePageEnd()).then(function () {});
                }
              }();
              return Promise.resolve(_temp2 && _temp2.then ? _temp2.then(function () {}) : void 0);
            } catch (e) {
              return Promise.reject(e);
            }
          });
        });
      });
      const visibleElements = availableElements.filter(availableElement => {
        availableElement.control = availableElement.name === layoutElement ? layout : containers.find(container => container.getMetadata().getName() === availableElement.name);
        return availableElement.control?.getVisible();
      });

      // record homepage start
      setupTracking = true;
      return Promise.resolve(markHomePageStart()).then(function () {
        const _temp = function () {
          if (visibleElements.length === 1) {
            return Promise.resolve(markHomePageEnd()).then(function () {});
          }
        }();
        if (_temp && _temp.then) return _temp.then(function () {});
      }); // record homepage end in case of no visible elements except layout
    } catch (e) {
      return Promise.reject(e);
    }
  };
  /**
   * Records the start of the element load.
   *
   * @param {keyof typeof UIElements} containerName - The name of the container.
   * @param {string} [customMarkName] - The custom mark name.
   */
  /**
   * Records the end of the homepage load.
   *
   * @returns {Promise<void>} - A promise that resolves when the end of the homepage load is recorded.
   */
  const markHomePageEnd = function () {
    return Promise.resolve(isHomeApp()).then(function (_isHomeApp2) {
      if (_isHomeApp2) {
        recordElementLoadEnd(layoutElement, homePageLoadEndMarker);
        EventHub.emit("CustomHomeRendered");
      }
    });
  };
  /**
   * Finds the UI element information by container name.
   *
   * @param {keyof typeof UIElements} containerName - The name of the container.
   * @returns {ElementInfo | undefined} - The element information if found, otherwise undefined.
   */
  /**
   * Records the start of the homepage load.
   *
   * @returns {Promise<void>} - A promise that resolves when the start of the homepage load is recorded.
   */
  const markHomePageStart = function () {
    return Promise.resolve(isHomeApp()).then(function (_isHomeApp) {
      if (_isHomeApp) {
        recordElementLoadStart(layoutElement, homePageLoadStartMarker);
      }
    });
  };
  /**
   * Checks if the current application is the home app.
   *
   * @returns {Promise<boolean>} - A promise that resolves to true if the current application is the home app, otherwise false.
   */
  const isHomeApp = function () {
    try {
      return Promise.resolve(Container.getServiceAsync("AppLifeCycle")).then(function (container) {
        return container.getCurrentApplication()?.homePage;
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };
  const layoutElement = "sap.cux.home.Layout";
  const homePageLoadStartMarker = "FLP-TTI-Homepage-Custom-Start";
  const homePageLoadEndMarker = "FLP-TTI-Homepage-Custom";
  let setupTracking = false;

  /**
   * An object representing the UI elements and their corresponding marker names.
   *
   */
  const UIElements = {
    "sap.cux.home.AppsContainer": "Apps",
    "sap.cux.home.InsightsContainer": "Insights",
    "sap.cux.home.NewsAndPagesContainer": "News",
    "sap.cux.home.ToDosContainer": "ToDos",
    [layoutElement]: "Layout"
  };
  let availableElements = Object.keys(UIElements).map(elementName => ({
    name: elementName,
    startMarked: false,
    endMarked: false
  }));
  function findUIElement(containerName) {
    return availableElements.find(heroElement => heroElement.name === containerName);
  }

  /**
   * Sets a performance mark with the given name.
   *
   * @param {string} markName - The name of the performance mark.
   */
  function setPerformanceMark(markName) {
    utils.setPerformanceMark(markName, {
      bUseUniqueMark: true,
      bUseLastMark: true
    });
  }

  /**
   * Records the load of an element.
   *
   * @param {keyof typeof UIElements} containerName - The name of the container.
   * @param {string} [customMarkName] - The custom mark name.
   * @param {boolean} [isStartMaker] - Indicates if it is a start marker.
   */
  function recordElementLoad(containerName, customMarkName, isStartMaker) {
    const element = findUIElement(containerName);
    const marker = isStartMaker ? "Start" : "End";
    const controlFlag = isStartMaker ? "startMarked" : "endMarked";
    if (element && !element[controlFlag] && element.control?.getVisible()) {
      element[controlFlag] = true;
      setPerformanceMark(customMarkName || `FLP-Homepage-Section-${marker}[${UIElements[containerName]}]`);
    }
  }
  function recordElementLoadStart(containerName, customMarkName) {
    recordElementLoad(containerName, customMarkName, true);
  }

  /**
   * Records the end of the element load.
   *
   * @param {keyof typeof UIElements} containerName - The name of the container.
   * @param {string} [customMarkName] - The custom mark name.
   */
  function recordElementLoadEnd(containerName, customMarkName) {
    recordElementLoad(containerName, customMarkName, false);
  }
  var __exports = {
    __esModule: true
  };
  __exports.UIElements = UIElements;
  __exports.setupPerformanceTracking = setupPerformanceTracking;
  __exports.recordElementLoadStart = recordElementLoadStart;
  __exports.recordElementLoadEnd = recordElementLoadEnd;
  return __exports;
});
//# sourceMappingURL=PerformanceUtils-dbg.js.map
