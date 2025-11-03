/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define([],function(){"use strict";function t(){}t.prototype.useDiscontinuousScale=function(){return true};t.prototype.clampUp=function(t){return t};t.prototype.clampDown=function(t){return t};t.prototype.distance=function(t,e){return e-t};t.prototype.offset=function(t,e){return new Date(t.getTime()+e)};t.prototype.tickFilter=function(t){var e=t.reduce(function(t,e){var n=this.clampUp(e).getTime();var r=this.clampDown(e).getTime();if(n!==r){t.add(n)}else{t.add(e.getTime())}return t}.bind(this),new Set);var n=Array.from(e).map(function(t){return new Date(t)});return n};return t});
//# sourceMappingURL=DiscontinuousProvider.js.map