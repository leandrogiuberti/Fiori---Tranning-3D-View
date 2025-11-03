/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define([], function () {
  "use strict";

  let tmpDataId = 0;
  const registry = {};
  function createTmpData() {
    const tmpData = {};
    tmpData.tmpDataId = "" + ++tmpDataId;
    registry[tmpData.tmpDataId] = tmpData;
    return tmpData;
  }
  function getTmpData(tmpDataId) {
    const tmpData = registry[tmpDataId];
    if (!tmpData) {
      throw "no tmp data";
    }
    return tmpData;
  }
  function deleteTmpData(tmpDataId) {
    delete registry[tmpDataId];
  }
  function getCountTmpData() {
    return Object.keys(registry).length;
  }
  function isEmptyTmpData() {
    return Object.keys(registry).length === 0;
  }
  var __exports = {
    __esModule: true
  };
  __exports.createTmpData = createTmpData;
  __exports.getTmpData = getTmpData;
  __exports.deleteTmpData = deleteTmpData;
  __exports.getCountTmpData = getCountTmpData;
  __exports.isEmptyTmpData = isEmptyTmpData;
  return __exports;
});
//# sourceMappingURL=tmpData-dbg.js.map
