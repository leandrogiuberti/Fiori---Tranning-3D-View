/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["module", "../../sina/AttributeType", "../../sina/ComparisonOperator"], function (module, ____sina_AttributeType, ____sina_ComparisonOperator) {
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
  const AttributeType = ____sina_AttributeType["AttributeType"];
  const ComparisonOperator = ____sina_ComparisonOperator["ComparisonOperator"];
  async function readFile(path) {
    try {
      if (typeof window === "undefined") {
        // Node.js environment
        const fs = await __ui5_require_async("node:fs");
        const url = await __ui5_require_async("node:url");
        const pathLib = await __ui5_require_async("node:path");
        const __filename = url.fileURLToPath(module.url);
        const __dirname = pathLib.dirname(__filename);
        const elisaPath = pathLib.join(__dirname, "../../../../../../../..");
        //path = path.replace("/$elisa$", elisaPath);
        path = elisaPath + "/dist/" + path;
        const data = fs.readFileSync(path, {
          encoding: "utf-8"
        }).toString();
        return data;
      } else {
        // browser environment
        const response = await fetch(path);
        if (!response.ok) {
          throw new Error(`Failed to fetch file: ${response.statusText}`);
        }
        return await response.text();
      }
    } catch (error) {
      console.error(`Error reading file at ${path}:`, error);
      throw error;
    }
  }
  function isValuePairMatched(value1, value2, operator, caseSensitive) {
    if (typeof value1 !== typeof value2) {
      return false;
    }
    const type = typeof value1;
    if (type === "number" || value1 instanceof Date && value2 instanceof Date) {
      switch (operator) {
        case ComparisonOperator.Eq:
          return value1 === value2;
        case ComparisonOperator.Ne:
          return value1 !== value2;
        case ComparisonOperator.Ge:
          return value1 >= value2;
        case ComparisonOperator.Le:
          return value1 <= value2;
        case ComparisonOperator.Gt:
          return value1 > value2;
        case ComparisonOperator.Lt:
          return value1 < value2;
      }
    }
    if (type === "string") {
      return createRegExp(value2, operator, caseSensitive).test(value1);
    }
  }
  function createRegExp(value, operator, caseSensitive) {
    const pattern = value.replace(/[.+?^${}()|[\]\\]/g, "\\$&") // escape everything except *
    .replace(/\*/g, ".*"); // replace * with .*
    const cs = caseSensitive !== true ? "i" : "";
    switch (operator) {
      case ComparisonOperator.Eq:
        return new RegExp(`^${pattern}$`, cs);
      case ComparisonOperator.Ne:
        return new RegExp(`^(?!${pattern}$).*`, cs);
      case ComparisonOperator.Co:
        return new RegExp(pattern, cs);
      case ComparisonOperator.Bw:
        return new RegExp(`^${pattern}`, cs);
      case ComparisonOperator.Ew:
        return new RegExp(`${pattern}$`, cs);
      default:
        return new RegExp(`^${pattern}`, cs);
    }
  }
  function getMatchedStringValues(stringValues, searchTerm, caseSensitive) {
    if (isStarString(searchTerm)) {
      return stringValues;
    }
    if (isEmptyString(searchTerm)) {
      return stringValues;
    }
    return stringValues.filter(sValue => isValuePairMatched(sValue, searchTerm, ComparisonOperator.Co, caseSensitive));
  }
  function formatRawValue(stringValue, type) {
    switch (type) {
      case AttributeType.Double:
        return parseFloat(stringValue) || 0;
      case AttributeType.Integer:
        return parseInt(stringValue, 10) || 0;
      case AttributeType.String:
        return stringValue;
      case AttributeType.ImageUrl:
        return stringValue;
      case AttributeType.ImageBlob:
        return stringValue;
      case AttributeType.GeoJson:
        return stringValue;
      case AttributeType.Date:
        {
          const date = isNaN(new Date(stringValue).getTime()) ? new Date(0) : new Date(stringValue);
          return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
        }
      case AttributeType.Time:
        return stringValue;
      case AttributeType.Timestamp:
        {
          const date = isNaN(new Date(stringValue).getTime()) ? new Date(0) : new Date(stringValue);
          return date;
        }
      case AttributeType.Group:
        return stringValue;
      default:
        return stringValue;
    }
  }
  function formatHighlightedValue(stringValue, searchTerm) {
    if (isStarString(searchTerm)) {
      return stringValue;
    }
    if (isEmptyString(searchTerm)) {
      return stringValue;
    }
    const regex = new RegExp(`(${searchTerm})`, "gi");
    return stringValue.replace(regex, "<b>$1</b>");
  }
  function format10Power(value, isCeil) {
    // isCeil NOT true: find biggest 10 power number, smaller than value
    // isCeil true: find smallest 10 power number, bigger than value
    const digits = isCeil ? Math.trunc(value).toString().split("").map(Number).length : Math.trunc(value).toString().split("").map(Number).length - 1;
    if (isCeil) {
      return Math.pow(10, digits);
    } else {
      return digits === 0 ? 0 : Math.pow(10, digits);
    }
  }
  function isStarString(value) {
    return value === "*";
  }
  function isEmptyString(value) {
    return typeof value === "string" && value === "";
  }
  var __exports = {
    __esModule: true
  };
  __exports.readFile = readFile;
  __exports.isValuePairMatched = isValuePairMatched;
  __exports.getMatchedStringValues = getMatchedStringValues;
  __exports.formatRawValue = formatRawValue;
  __exports.formatHighlightedValue = formatHighlightedValue;
  __exports.format10Power = format10Power;
  __exports.isStarString = isStarString;
  __exports.isEmptyString = isEmptyString;
  return __exports;
});
//# sourceMappingURL=Util-dbg.js.map
