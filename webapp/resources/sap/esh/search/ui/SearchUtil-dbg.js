/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define([], function () {
  "use strict";

  // =======================================================================
  // emphasize whyfound in case of ellipsis
  // =======================================================================
  // this function is obsolete and should only kept for backward compatibility in 1.139
  // TODO: remove after 1.139
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function forwardEllipsis4Whyfound(domref) {
    return null;
  }
  class PeriodicRetry {
    interval;
    maxRetries;
    action;
    timeout = undefined;
    constructor(options) {
      this.interval = options.interval;
      this.maxRetries = options.maxRetries;
      this.action = options.action;
    }
    doRun(retries) {
      const success = this.action();
      if (success) {
        return;
      }
      if (retries <= 1) {
        return;
      }
      this.timeout = window.setTimeout(() => {
        this.timeout = undefined;
        this.doRun(retries - 1);
      }, this.interval);
    }
    run() {
      if (this.timeout) {
        return; // already running
      }
      this.doRun(this.maxRetries);
    }
  }
  class StateWatcher {
    // service functions passed from outside
    compareStates;
    getState;
    changed;
    // check interval
    interval;
    // internal
    checkMode = false;
    state;
    checkState;
    constructor(props) {
      this.compareStates = props.compareStates;
      this.getState = props.getState;
      this.changed = props.changed;
      this.interval = props.interval ?? 100;
    }
    start() {
      setInterval(this.checkStateChange.bind(this), this.interval);
    }
    checkStateChange() {
      const currentState = this.getState();
      if (!this.checkMode) {
        if (!this.state || !this.compareStates(currentState, this.state)) {
          // in case the state differs, we enter a special check mode and notify the subscriber only in case the new state is stable
          this.checkMode = true;
          this.checkState = currentState;
        }
      } else {
        if (this.compareStates(currentState, this.checkState)) {
          this.changed(currentState, this.state);
          this.state = currentState;
        }
        this.checkMode = false;
      }
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.forwardEllipsis4Whyfound = forwardEllipsis4Whyfound;
  __exports.PeriodicRetry = PeriodicRetry;
  __exports.StateWatcher = StateWatcher;
  return __exports;
});
//# sourceMappingURL=SearchUtil-dbg.js.map
