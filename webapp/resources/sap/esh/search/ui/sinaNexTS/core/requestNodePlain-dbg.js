/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["./ajaxUtil"], function (___ajaxUtil) {
  "use strict";

  function __ui5_require_async(path) {
    return new Promise(function (resolve, reject) {
      sap.ui.require([path], function (module) {
        if (!(module && module.__esModule)) {
          module = module === null || !(typeof module === "object" && path.endsWith("/library")) ? {
            default: module
          } : module;
          Object.defineProperty(module, "__esModule", {
            value: true
          });
        }
        resolve(module);
      }, function (err) {
        reject(err);
      });
    });
  }
  const addEncodedUrlParameters = ___ajaxUtil["addEncodedUrlParameters"];
  async function requestNodePlain(properties) {
    const https = properties.url.startsWith("https") ? await __ui5_require_async("node:https") : await __ui5_require_async("node:http");
    const {
      Buffer
    } = await __ui5_require_async("node:buffer");
    return new Promise(resolve => {
      const url = addEncodedUrlParameters(properties.url, properties.parameters);
      const urlObj = new URL(url);
      const options = {
        rejectUnauthorized: false,
        //requestCert: true,
        //agent: false,
        hostname: urlObj.hostname,
        path: urlObj.pathname + urlObj.search,
        port: urlObj.port,
        method: properties.method,
        headers: properties.headers
      };
      if (properties.data) {
        options.headers["Content-Length"] = "" + Buffer.byteLength(properties.data);
      }
      const req = https.request(options, res => {
        let responseData = "";
        res.on("data", chunk => {
          responseData += chunk;
        });
        res.on("end", () => {
          resolve({
            status: res.statusCode,
            statusText: res.statusMessage,
            data: responseData,
            headers: res.headers
          });
        });
      });
      req.on("error", error => {
        resolve({
          status: 0,
          statusText: "" + error,
          data: "",
          headers: {}
        });
      });
      if (properties.data) {
        req.write(properties.data);
      }
      req.end();
    });
  }
  var __exports = {
    __esModule: true
  };
  __exports.requestNodePlain = requestNodePlain;
  return __exports;
});
//# sourceMappingURL=requestNodePlain-dbg.js.map
