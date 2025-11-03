/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/ui/base/Object", "./Constants"], function (Log, BaseObject, ___Constants) {
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
  const REPO_BASE_URL = ___Constants["REPO_BASE_URL"];
  /**
   *
   * @class Provides the HttpHelper Class used for Get and Post Calls.
   *
   * @extends sap.ui.BaseObject
   *
   * @author SAP SE
   * @version 0.0.1
   * @since 1.121.0
   * @private
   *
   * @alias sap.cux.home.utils.HttpHelper
   */
  class HttpHelper extends BaseObject {
    constructor() {
      super();
    }

    /**
     * Fetches the CSRF Token
     * @returns {Promise<string | void>} Promise that resolves with the CSRF Token
     */
    static fetchCSRFToken() {
      return fetch(REPO_BASE_URL, {
        method: "HEAD",
        headers: {
          "X-CSRF-Token": "Fetch"
        }
      }).then(response => {
        const token = response.headers.get("X-CSRF-Token");
        if (response.ok && token) {
          return token;
        }
        throw new Error("Cannot fetch X-CSRF-Token.");
      }).catch(error => {
        Log.error(error.message);
      });
    }

    /**
     * Post Method
     * @param {string} url - The URL to post to
     * @param {object} payload - The payload to post
     * @returns {Promise<unknown>} Promise that resolves with the response
     */
    static Post(url, payload) {
      return HttpHelper.fetchCSRFToken().then(csrfToken => {
        return fetch(url, {
          method: "POST",
          headers: {
            "X-CSRF-Token": csrfToken,
            "content-type": "application/json"
          },
          body: JSON.stringify(payload)
        });
      }).then(response => {
        return response.json();
      }).catch(error => {
        Log.error(error.message);
      });
    }

    /**
     * Get Method for JSON Data
     * @param {string} url - The URL to get from
     * @returns {Promise<unknown>} Promise that resolves with the JSON data response
     */
    static GetJSON(url) {
      return fetch(url).then(response => {
        return response.json();
      }).catch(error => {
        Log.error(error.message);
      });
    }
    /**
     * Get Method for Multiple Requests
     *
     * @param {string[]} urls - An array of URLs to get from
     * @returns {Promise<(string | object)[]>} Promise that resolves with the responses from the URLs
     */
    static GetMultipleRequests(urls = []) {
      try {
        return Promise.resolve(_catch(function () {
          return Promise.resolve(Promise.all(urls.map(function (url) {
            try {
              return Promise.resolve(fetch(url)).then(function (response) {
                if (response.headers.get("Content-Type")?.includes("application/json")) {
                  return Promise.resolve(response.json()).then(function (_response$json) {
                    return _response$json;
                  });
                } else {
                  return Promise.resolve(response.text());
                }
              });
            } catch (e) {
              return Promise.reject(e);
            }
          })));
        }, function (error) {
          Log.error(error?.message);
          return [];
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }
  return HttpHelper;
});
//# sourceMappingURL=HttpHelper-dbg.js.map
