/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["./sinaNexTS/sina/ComplexCondition", "./sinaNexTS/sina/SimpleCondition", "./SearchHelper"], function (___sinaNexTS_sina_ComplexCondition, ___sinaNexTS_sina_SimpleCondition, ___SearchHelper) {
  "use strict";

  const ComplexCondition = ___sinaNexTS_sina_ComplexCondition["ComplexCondition"];
  const SimpleCondition = ___sinaNexTS_sina_SimpleCondition["SimpleCondition"];
  const privateBoldTagUnescaper = ___SearchHelper["boldTagUnescaper"];
  function createSimpleCondition(props) {
    return new SimpleCondition(props);
  }
  function createComplexCondition() {
    return new ComplexCondition({});
  }
  function boldTagUnescaper(domref, highlightStyle) {
    return privateBoldTagUnescaper(domref, highlightStyle);
  }
  var __exports = {
    __esModule: true
  };
  __exports.createSimpleCondition = createSimpleCondition;
  __exports.createComplexCondition = createComplexCondition;
  __exports.boldTagUnescaper = boldTagUnescaper;
  return __exports;
});
//# sourceMappingURL=PublicSearchUtil-dbg.js.map
