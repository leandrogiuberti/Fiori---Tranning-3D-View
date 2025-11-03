/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */
sap.ui.define(
  ["sap/ovp/cards/generic/base/error/BaseError.controller"],
  function (BaseErrorController) {
    "use strict";
    return BaseErrorController.extend("sap.ovp.cards.error.Error", {
      onInit: function () {
        //The base controller lifecycle methods are not called by default, so they have to be called
        //Take reference from function mixinControllerDefinition in sap/ui/core/mvc/Controller.js
        BaseErrorController.prototype.onInit.apply(this, arguments);
      },
      onAfterRendering: function () {
        BaseErrorController.prototype.onAfterRendering.apply(this, arguments);
      }
    });
  }
);
