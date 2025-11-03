/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define([], function () {
  "use strict";

  // =======================================================================
  // decorator for sequentialized execution
  // =======================================================================
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  function sequentializedExecution(originalFunction) {
    let chainedPromise;
    return function (...args) {
      if (!chainedPromise) {
        chainedPromise = originalFunction.apply(this, args);
      } else {
        chainedPromise = chainedPromise.then(() => {
          return originalFunction.apply(this, args);
        }, () => {
          return originalFunction.apply(this, args);
        });
      }
      const promise = chainedPromise;
      promise.finally(() => {
        if (promise === chainedPromise) {
          chainedPromise = null;
        }
      }).catch(() => {
        //dummy
      });
      return chainedPromise;
    };
  }
  var __exports = {
    __esModule: true
  };
  __exports.sequentializedExecution = sequentializedExecution;
  return __exports;
});
//# sourceMappingURL=SearchHelperSequentializeDecorator-dbg.js.map
