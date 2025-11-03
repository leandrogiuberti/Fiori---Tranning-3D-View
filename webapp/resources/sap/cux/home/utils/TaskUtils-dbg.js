/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/i18n/Formatting", "sap/m/library", "sap/ui/core/Locale", "sap/ui/core/format/DateFormat"], function (Log, Formatting, sap_m_library, Locale, DateFormat) {
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
  /**
   * Fetches user information for a specific user.
   *
   * @private
   * @param {string} originId - The origin ID.
   * @param {string} userId - The user ID.
   * @returns {Promise<UserInfo>} - A promise that resolves to the user information.
   */
  const _fetchUserInfo = function (originId, userId) {
    try {
      return Promise.resolve(_catch(function () {
        return Promise.resolve(fetch(`/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/UserInfoCollection(SAP__Origin='${originId}',UniqueName='${userId}')?$format=json`)).then(function (response) {
          if (!response.ok) {
            throw new Error(`Failed to Fetch User Info for: ${userId}`);
          }
          return Promise.resolve(response.json()).then(function (_response$json) {
            const {
              d: data
            } = _response$json;
            userInfo[userId] = data;
            return userInfo[userId];
          });
        });
      }, function (error) {
        Log.error(error instanceof Error ? error.message : String(error));
        return {};
      }));
    } catch (e) {
      return Promise.reject(e);
    }
  };
  /**
   * Check whether given dateString is of format YYYYMMDD and is a valid value for Date object.
   *
   * @param {string} dateString - The datestring to be checked for validity
   * @returns {Date} if its a valid date return the date else false
   * @private
   */
  const Priority = sap_m_library["Priority"];
  var TaskPriority = /*#__PURE__*/function (TaskPriority) {
    TaskPriority["VERY_HIGH"] = "VERY_HIGH";
    TaskPriority["HIGH"] = "HIGH";
    TaskPriority["MEDIUM"] = "MEDIUM";
    TaskPriority["LOW"] = "LOW";
    return TaskPriority;
  }(TaskPriority || {});
  const userInfo = {};

  /**
   * Get the task URL for a given task.
   *
   * @private
   * @param {string} originId - The origin ID of the task.
   * @param {string} instanceId - The instance ID of the task.
   * @returns {string} The task URL.
   */
  function getTaskUrl(originId, instanceId, targetAppUrl) {
    const taskInstanceURL = `?showAdditionalAttributes=true&/detail/${originId}/${instanceId}/TaskCollection(SAP__Origin='${originId}',InstanceID='${instanceId}')`;
    return targetAppUrl + taskInstanceURL;
  }

  /**
   * Fetches user details if required.
   *
   * @private
   * @param {string} originId - The origin ID.
   * @param {string} userId - The user ID.
   * @returns {Promise<UserInfo>} - A promise that resolves to the user information.
   */
  function fetchUserDetails(originId, userId) {
    if (Object.keys(userInfo).includes(userId)) {
      return Promise.resolve(userInfo[userId]);
    } else {
      return _fetchUserInfo(originId, userId);
    }
  }
  function _isValidDate(dateString) {
    // Check if the input has the correct length
    if (dateString.length !== 8) {
      return false;
    }

    // Parse the date components
    const year = parseInt(dateString.slice(0, 4), 10);
    const month = parseInt(dateString.slice(4, 6), 10) - 1;
    const day = parseInt(dateString.slice(6), 10);

    // Create a Date object with the parsed components
    const date = new Date(year, month, day);

    // Check if the parsed date is valid
    return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day;
  }

  /**
   * Parses different time formats supplied from the back-ends. It returns UNIX time stamp in milliseconds.
   * If Time Format contains unexpected symbols or Format is not recognized NaN is returned.
   * Referenced from: cross.fnd.fiori.inbox.CustomAttributeComparator
   *
   * @param {string | number} time date format to be parsed. If int UNIX time stamp in milliseconds is assumed.
   * @returns {number} UNIX time stamp in milliseconds. (milliseconds that have elapsed since 00:00:00 UTC, Thursday, 1 January 1970)
   * @private
   */
  function _getParsedTime(time) {
    if (time == null || time === "00000000") {
      return NaN;
    }
    if (typeof time === "number") {
      return time;
    }

    // Check for various time formats
    const dateRegex = /\/(Date)\((\d+)\)\//;
    const yyyymmddRegex = /^\d{8}$/;
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|([+-])(\d{2}):(\d{2}))?$/;
    const dateMatch = time.match(dateRegex);
    if (dateMatch) {
      // Time Format "/Date(869080830000)/"
      return parseInt(dateMatch[2], 10);
    }
    if (yyyymmddRegex.test(time) && _isValidDate(time)) {
      // Time Format "YYYYMMDD" (Old TGW format)
      const parsedDate = DateFormat.getDateInstance().parse(time);
      return parsedDate instanceof Date ? parsedDate.getTime() : NaN;
    }
    const isoMatch = time.match(isoRegex);
    if (isoMatch) {
      // Time Format "2018-01-05T00:00:00" (BPM and TGW-cloud format, UTC)
      return new Date(time).getTime();
    }
    return NaN;
  }

  /**
   * Format a date string to a custom date and time format.
   *
   * @private
   * @param {string} dateStr - The date string to format.
   * @param {string} pattern - The pattern to be used for formatting the date.
   * @returns {string} The formatted date string.
   */
  function formatDate(dateStr, pattern = Formatting.getDatePattern("short") || "dd/MM/yyyy") {
    const locale = new Locale(Formatting.getLanguageTag().language);
    const dateFormat = DateFormat.getDateTimeInstance({
      pattern
    }, locale);
    const value = _getParsedTime(dateStr);
    let formattedDate = "";
    if (!isNaN(value)) {
      formattedDate = dateFormat.format(new Date(value));
    }
    return formattedDate;
  }

  /**
   * Convert a priority string to a corresponding priority value.
   *
   * @private
   * @param {TaskPriority} priority - The task priority string.
   * @returns {string} The corresponding priority value.
   */
  function getPriority(priority) {
    if (priority === TaskPriority.VERY_HIGH) {
      return Priority.VeryHigh ? Priority.VeryHigh : Priority.None;
    } else if (priority === TaskPriority.HIGH) {
      return Priority.High;
    } else if (priority === TaskPriority.MEDIUM) {
      return Priority.Medium;
    } else if (priority === TaskPriority.LOW) {
      return Priority.Low;
    } else {
      return Priority.None;
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.TaskPriority = TaskPriority;
  __exports.getTaskUrl = getTaskUrl;
  __exports.fetchUserDetails = fetchUserDetails;
  __exports.formatDate = formatDate;
  __exports.getPriority = getPriority;
  return __exports;
});
//# sourceMappingURL=TaskUtils-dbg.js.map
