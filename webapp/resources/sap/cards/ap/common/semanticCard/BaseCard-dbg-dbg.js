/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
"use strict";

sap.ui.define(["../odata/ODataUtils"], function (___odata_ODataUtils) {
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
  const fetchFileContent = ___odata_ODataUtils["fetchFileContent"];
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
  const isODataV4Model = ___odata_ODataUtils["isODataV4Model"];
  /**
   * Base class for semantic card generation providing common functionality
   * for accessing application metadata, annotations, and OData service information.
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
  class BaseCard {
    constructor(appComponent) {
      this.appComponent = appComponent;
    }

    /**
     * Abstract method to generate the semantic card object.
     * Must be implemented by concrete card types.
     */

    /**
     * Retrieves the application manifest with validation.
     * @returns The application manifest
     * @throws Error if manifest is not available
     */
    getApplicationManifest() {
      return this.appComponent.getManifest();
    }

    /**
     * Retrieves OData service metadata as XML string.
     * @returns Promise resolving to metadata XML string
     * @throws Error if model is not available or metadata fetch fails
     */
    getMetadata() {
      try {
        const _this = this;
        const appModel = _this.appComponent.getModel();
        if (!appModel) {
          throw new Error("OData model is not available.");
        }
        const bODataV4 = isODataV4Model(appModel);
        const serviceUrl = bODataV4 ? appModel.getServiceUrl() : appModel.sServiceUrl;
        if (!serviceUrl) {
          throw new Error("Service URL is not available from the model.");
        }
        return Promise.resolve(_catch(function () {
          const metadataUrl = serviceUrl?.endsWith("/") ? `${serviceUrl}$metadata` : `${serviceUrl}/$metadata`;
          return Promise.resolve(fetchFileContent(metadataUrl));
        }, function (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          throw new Error(`Failed to fetch OData metadata: ${errorMessage}`);
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Retrieves annotation files from the OData model.
     * @returns Promise resolving to array of annotation XML strings
     * @throws Error if model is not available or annotation fetch fails
     */
    getAnnotations() {
      try {
        let _exit = false;
        const _this2 = this;
        const appModel = _this2.appComponent.getModel();
        if (!appModel) {
          throw new Error("OData model is not available.");
        }
        const bODataV4 = isODataV4Model(appModel);
        const annotations = [];
        const annotationURIs = (bODataV4 ? appModel.getMetaModel()?.aAnnotationUris : appModel?.aAnnotationURIs) ?? [];
        const _temp = _forOf(annotationURIs, function (uri) {
          if (!uri || uri.trim().length === 0) {
            return;
          }
          return _catch(function () {
            return Promise.resolve(fetchFileContent(uri)).then(function (annotation) {
              annotations.push(annotation);
            });
          }, function (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            throw new Error(`Failed to fetch annotation from ${uri}: ${errorMessage}`);
          });
        }, function () {
          return _exit;
        });
        return Promise.resolve(_temp && _temp.then ? _temp.then(function (_result2) {
          return _exit ? _result2 : annotations;
        }) : _exit ? _temp : annotations);
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.BaseCard = BaseCard;
  return __exports;
});
//# sourceMappingURL=BaseCard-dbg-dbg.js.map
