/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define([
	"../DefBase"
], function (DefBase) {
	"use strict";

	/**
	 * Creates and initializes a linear gradient defined for later reuse.
	 *
	 * @param {string} [sId] ID of the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Linear gradient defined by SVG tag 'linearGradient'.
	 *
	 * <p>
	 * <svg width="8cm" height="4cm" viewBox="0 0 800 400" version="1.1" xmlns="http://www.w3.org/2000/svg">
	 * <g><defs><linearGradient id="MyGradient"><stop offset="5%" stop-color="@sapChart_Sequence_Critical_Plus1" /><stop offset="95%" stop-color="@sapContent_Illustrative_Color1" /></linearGradient></defs>
	 * <rect fill="none" stroke="@sapChart_Sequence_1_Plus1" x="1" y="1" width="798" height="398"/>
	 * <rect fill="url(#MyGradient)" stroke="@sapChart_LineColor_3" stroke-width="5" x="100" y="100" width="600" height="200"/></g>
	 * </svg>
	 * </p>
	 *
	 * @extends sap.gantt.def.DefBase
	 *
	 * @author SAP SE
	 * @version 1.141.0
	 *
	 * @constructor
	 * @public
	 * @alias sap.gantt.def.gradient.LinearGradient
	 */
	var LinearGradient = DefBase.extend("sap.gantt.def.gradient.LinearGradient", /** @lends sap.gantt.def.gradient.LinearGradient.prototype */ {
		metadata : {
			library: "sap.gantt",
			properties: {

				/**
				 * Attribute 'x1' of SVG tag 'linearGradient'.
				 */
				x1: {type: "string", defaultValue: "0"},

				/**
				 * Attribute 'y1' of SVG tag 'linearGradient'.
				 */
				y1: {type: "string", defaultValue: "0"},

				/**
				 * Attribute 'x2' of SVG tag 'linearGradient'.
				 */
				x2: {type: "string", defaultValue: "100"},

				/**
				 * Attribute 'y2' of SVG tag 'linearGradient'.
				 */
				y2: {type: "string", defaultValue: "15"}
			},
			aggregations:{

				/**
				 * 'stop' elements in the 'linearGradient' element.
				 */
				stops: {type: "sap.gantt.def.gradient.Stop", multiple: true, singularName: "stop"}
			}
		}
	});

	LinearGradient.prototype.getDefString = function () {
		var sId = this.getId();
		var x1 =  this.getX1().indexOf("%") >= 0  ? this.getX1().slice(0,-1) / 100 : this.getX1();
		var x2 =  this.getX2().indexOf("%") >= 0  ? this.getX2().slice(0,-1) / 100 : this.getX2();
		var y1 =  this.getY1().indexOf("%") >= 0  ? this.getY1().slice(0,-1) / 100 : this.getY1();
		var y2 =  this.getY2().indexOf("%") >= 0  ? this.getY2().slice(0,-1) / 100 : this.getY2();
		var sRetVal = "<linearGradient id='" + sId +
			"' x1='" + x1 + "' y1='" + y1 + "' x2='" + x2 +
			"' y2='" + y2 +
			"'>";
		var aStops = this.getStops();
		var j = 0;

        while (j < aStops.length && Number.parseFloat(aStops[j].getOffSet()) === 0) {
            j++;
        }
        for (var i = Math.max(0, j - 1); i < aStops.length; i++) {
            sRetVal = sRetVal.concat(aStops[i].getDefString());
        }
		sRetVal = sRetVal.concat("</linearGradient>");
		return sRetVal;
	};

	return LinearGradient;
}, true);
