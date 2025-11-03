/*
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define("sap/sac/df/filter/PropertyHelper", [
  "sap/ui/mdc/util/PropertyHelper"
], (
  PropertyHelperBase
) => {
  "use strict";

  /**
     * Constructor for a new {@link sap.sac.df.FilterBar FilterBar} control property helper.
     * @private
     * @ui5-experimental-since 1.136
     * @alias sap.sac.df.filter.PropertyHelper
     */
  const PropertyHelper = PropertyHelperBase.extend("sap.sac.df.filter.PropertyHelper", {
    constructor: function (aProperties, oParent) {
      PropertyHelperBase.call(this, aProperties, oParent);
    }
  });


  /**
     * @inheritDoc
     */
  PropertyHelper.prototype.validateProperty = function () {
    PropertyHelperBase.prototype.validateProperty.apply(this, arguments);
  };

  /**
     * @inheritDoc
     */
  PropertyHelper.prototype.prepareProperty = function () {
    PropertyHelperBase.prototype.prepareProperty.apply(this, arguments);
  };


  /**
     * @inheritDoc
     */
  PropertyHelper.prototype.getProperty = function (sProperty) {
    return this.getParent().getControlDelegate().getProperty(this.getParent(), sProperty);
  };

  return PropertyHelper;
});