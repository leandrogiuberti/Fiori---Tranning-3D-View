/*
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
sap.ui.define("sap/sac/df/filter/PropertyHelper",["sap/ui/mdc/util/PropertyHelper"],t=>{"use strict";const e=t.extend("sap.sac.df.filter.PropertyHelper",{constructor:function(e,r){t.call(this,e,r)}});e.prototype.validateProperty=function(){t.prototype.validateProperty.apply(this,arguments)};e.prototype.prepareProperty=function(){t.prototype.prepareProperty.apply(this,arguments)};e.prototype.getProperty=function(t){return this.getParent().getControlDelegate().getProperty(this.getParent(),t)};return e});
//# sourceMappingURL=PropertyHelper.js.map