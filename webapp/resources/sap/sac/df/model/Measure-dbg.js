/*! SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
   */
/*global sap */
sap.ui.define(
  "sap/sac/df/model/Measure",
  [
    "sap/ui/base/Object"
  ], /*eslint-disable max-params*/
  function (
    BaseObject
  ) {
    "use strict";
    /*eslint-disable max-statements*/
    /**
         *
         * @class
         * Measure
         *
         * @author SAP SE
         * @version 1.141.0
         * @public
         * @hideconstructor
         * @ui5-experimental-since 1.119
         * @alias sap.sac.df.model.Measure
         */

    var Measure = BaseObject.extend("sap.sac.df.model.Measure", /** @lends sap.sac.df.model.Measure.prototype */ {
      constructor: function (oDataProvider, oMeasure, oFFMeasure) {
        Object.assign(this, Object.getPrototypeOf(this));
        /** @private */
        this._DataProvider = oDataProvider;
        /** @private */
        this._FFMeasure = oFFMeasure;
        Object.assign(this, oMeasure);
      }
    });

    /**
         * Get Decimal places of a measure
         * @return {int} decimal places
         * @public
         */
    Measure.prototype.getDecimalPlaces = function () {
      return this._FFMeasure.getNumericScale() && this._FFMeasure.getNumericScale().getInteger();
    };


    /**
         * Sets the scaling factor of a measure
         * @return {int} the current decimal places setting
         * @public
         */
    Measure.prototype.setDecimalPlaces = function (nNumberOfDecimalPlaces) {
      var that = this;
      this._DataProvider._executeModelOperation(function () {
        return that._FFMeasure.setNumericScale(nNumberOfDecimalPlaces);
      });
    };

    /**
         * Get scaling factor of a measure
         * @return {int} scaling factor
         * @public
         */
    Measure.prototype.getScalingFactor = function () {
      return this._FFMeasure.getNumericShift() ? -1 * this._FFMeasure.getNumericShift().getInteger() : 0;
    };


    /**
         * Sets the scaling factor of a measure
         * @return {int} the current scaling factor setting
         * @public
         */
    Measure.prototype.setScalingFactor = function (nScalingFactor) {
      var that = this;
      this._DataProvider._executeModelOperation(function () {
        return that._FFMeasure.setNumericShift(-1 * nScalingFactor);
      });
    };

    return Measure;
  }
);
