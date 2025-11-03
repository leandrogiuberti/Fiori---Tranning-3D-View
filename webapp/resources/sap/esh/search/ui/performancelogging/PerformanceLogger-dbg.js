/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define([], function () {
  "use strict";

  var LogEntryType = /*#__PURE__*/function (LogEntryType) {
    LogEntryType[LogEntryType["enterMethod"] = 0] = "enterMethod";
    LogEntryType[LogEntryType["beforeMethod"] = 1] = "beforeMethod";
    return LogEntryType;
  }(LogEntryType || {});
  class PerformanceLogger {
    /**
     * Performance log data
     */
    performanceLog;

    /**
     * Performance log start date
     */
    performanceLogStartDate;
    constructor() {
      this.performanceLog = [];
      this.performanceLogStartDate = new Date();
    }

    /**
     * Get a unique Id to be used to make 'method name' unique (see enterMethod/leaveMethod)
     * @returns unique ID
     */
    getUniqueId() {
      return new Date().getTime();
    }

    /**
     * start a new step of performance logging
     * @param {*} method name a log step you want to enter
     * @param {*} parameterBag additional properties to log for this step
     */

    enterMethod(method, parameterBag) {
      this.performanceLog.push({
        type: LogEntryType.enterMethod,
        methodName: method.name,
        start: new Date(),
        end: null,
        time: -1,
        children: [],
        stack: new Error().stack.replace("Error: \n", "").trim().replace("at PerformanceLogger.newPerfEntry", "").trim(),
        parameterBag: parameterBag
      });
    }

    /**
     * complete an open step of performance logging
     * @param {*} method name of log step to leave
     */

    leaveMethod(method) {
      for (const logEntry of this.performanceLog) {
        if (logEntry.methodName === method.name) {
          logEntry.end = new Date();
          logEntry.time = logEntry.end.getTime() - logEntry.start.getTime();
        }
      }
    }
    printLogToBrowserConsole() {
      console.table(this.getLogSummary());
    }
    getLogSummary() {
      return this.performanceLog?.map(logEntry => {
        let comments = "-";
        if (logEntry.parameterBag && typeof logEntry.parameterBag === "object" && "comments" in logEntry.parameterBag && logEntry.parameterBag.comments) {
          comments = String(logEntry.parameterBag.comments);
        }
        return {
          step: logEntry.methodName,
          secFromStart: Math.round((logEntry.start.getTime() - this.performanceLogStartDate.getTime()) / 100) / 10,
          msecTotal: logEntry.time,
          comments: comments
        };
      });
    }
    clearPerformanceLog() {
      this.performanceLogStartDate = new Date();
      this.performanceLog = [];
    }
  }
  PerformanceLogger.LogEntryType = LogEntryType;
  return PerformanceLogger;
});
//# sourceMappingURL=PerformanceLogger-dbg.js.map
