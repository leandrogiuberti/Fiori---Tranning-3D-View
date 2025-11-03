/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define([
], function () {
	'use strict';
	/**
	 * Creates and initializes a new class for DiscontinuousProvider.
	 * Enables the user to define custom discontinuous provider.
	 *
	 * @author SAP SE
	 * @version 1.141.0
	 * @since 1.126
	 *
	 * @constructor
	 * @public
	 * @alias sap.gantt.skipTime.DiscontinuousProvider
	 */
	function DiscontinuousProvider () {}

	/**
	 * Returns whether the discontinuous provider is to be used or not. This method can be overriden to define custom conditions.
	 * @returns {boolean} Returns whether the discontinuous provider is to be used or not.
	 * @public
	 */
	DiscontinuousProvider.prototype.useDiscontinuousScale = function(){
		return true;
	};

	/**
	 * If the given date falls within a discontinuity (i.e. an excluded domain range), it must be moved forward to the discontinuity boundary. Otherwise, it should be returned unchanged.
	 * @param {object} oDate Date object to be clamped up.
	 * @returns {object} Returns the clamped up date object.
	 * @public
	 */
	DiscontinuousProvider.prototype.clampUp = function (oDate) {
		return oDate;
	};

	/**
	 * If the given date falls within a discontinuity (i.e. an excluded domain range), it must be shifted backwards to the discontinuity boundary. Otherwise, it should be returned unchanged.
	 * @param {object} oDate Date object to be clamped down.
	 * @returns {object} Returns the clamped down date object.
	 * @public
	 */
	DiscontinuousProvider.prototype.clampDown = function (oDate) {
		return oDate;
	};

	/**
	 * Returns the number of milliseconds between the start and the end dates after removing the discontinuities in between.
	 * @param {object} start Start date object.
	 * @param {object} end End date object.
	 * @returns {number} Returns the number of milliseconds between the start and the end dates after removing the discontinuities in between.
	 * @public
	 */
	DiscontinuousProvider.prototype.distance = function (start, end) {
		return end - start;
	};

	/**
	 * When given a date and an offset in milliseconds, the date must be advanced by the offset value, skipping any discontinuities, to return the final value.
	 * @param {object} oDate Date object.
	 * @param {number} offset Milliseconds to be added to the date.
	 * @returns {object} Returns date object representing the original date advanced by the given offset.
	 * @public
	 */
	DiscontinuousProvider.prototype.offset = function (oDate, offset) {
		return new Date(oDate.getTime() + offset);
	};

	/**
	 * Returns a filtered set of ticks, which are the dates that are not in the discontinuous ranges.
	 * @param {array} aTicks Array of ticks to be filtered.
	 * @returns {array} Returns filtered set of ticks.
	 * @private
	 */
	DiscontinuousProvider.prototype.tickFilter = function (aTicks) {
		var filteredSet = aTicks.reduce(function (ticks, tick) {
			var up = this.clampUp(tick).getTime();
			var down = this.clampDown(tick).getTime();
			if (up !== down) {
				ticks.add(up);
			} else {
				ticks.add(tick.getTime());
			}
			return ticks;
		}.bind(this), new Set());
		var aFilteredTicks = Array.from(filteredSet).map(function (value) {
			return new Date(value);
		});
		return aFilteredTicks;
	};

	return DiscontinuousProvider;
});
