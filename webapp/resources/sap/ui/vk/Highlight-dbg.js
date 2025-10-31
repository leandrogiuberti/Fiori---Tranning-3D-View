/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
	"sap/ui/base/Object"
], function(
	BaseObject
) {
	"use strict";

	/**
	 * Constructor for an animated highlight.
	 *
	 * @class Provides the interface for an animated highlight. The objects of this class should not be created directly.
	 * @param {string} sId Highlight ID
	 * @param {any} parameters Highlight parameters
	 * @param {string} parameters.name highlight name
	 * @param {float} parameters.duration highlight duration - 0 means static highlight
	 * @param {int} parameters.cycles highlight cycles - 0 with duration > o means infinite highlight
	 * @param {float[]} [parameters.opacities] highlight opacities - optional, can be empty
	 * @param {array[]} [parameters.colours] highlight colours - optional, in form of [[r1, g1, b1, a1], [r2, g2, b2, a2], ...]
	 *
	 * @private
	 * @author SAP SE
	 * @version 1.141.0
	 * @extends sap.ui.base.Object
	 * @alias sap.ui.vk.Highlight
	 * @since 1.73.0
	 */
	var Highlight = BaseObject.extend("sap.ui.vk.Highlight", /** @lends sap.ui.vk.Highlight.prototype */ {

		constructor: function(sId, parameters) {
			this._id = sId;

			this._name = parameters && parameters.name ? parameters.name : "";
			this._duration = parameters && parameters.duration ? parameters.duration : 0.0;
			this._cycles = parameters && parameters.cycles ? parameters.cycles : 0;
			this._colours = parameters?.colours ?? []; // [mid-cycle color, start color]
			this._opacities = parameters?.opacities ?? []; // [mid-cycle opacity, start opacity]
			this._type = parameters?.type;
		}
	});

	function timeToBlendFactor(time, duration) {
		const f = (time % duration) / duration;
		return f < 0.5 ? f * 2 : 2 - f * 2;
	}

	Highlight.prototype.evaluate = function(time) {
		const res = { isCompleted: true };

		let f = 1;
		if (this._duration > 0) {
			if (this._cycles > 0 && time >= this._duration * this._cycles) {
				f = timeToBlendFactor(this._duration * this._cycles, this._duration);
			} else {
				f = timeToBlendFactor(time, this._duration);
				res.isCompleted = false;
			}
		}

		if (this._opacities?.length > 0) {
			if (f >= 1 || this._opacities.length < 2) {
				res.opacity = this._opacities[0];
			} else if (f <= 0) {
				res.opacity = this._opacities[1];
			} else {
				res.opacity = this._opacities[0] * f + this._opacities[1] * (1 - f);
			}
		}

		if (this._colours?.length > 0) {
			if (f >= 1 || this._colours.length < 2) {
				res.color = this._colours[0];
			} else if (f <= 0) {
				res.color = this._colours[1];
			} else {
				res.color = [
					this._colours[0][0] * f + this._colours[1][0] * (1 - f),
					this._colours[0][1] * f + this._colours[1][1] * (1 - f),
					this._colours[0][2] * f + this._colours[1][2] * (1 - f),
					this._colours[0][3] * f + this._colours[1][3] * (1 - f)
				];
			}
		}

		return res;
	};

	/**
	 * Gets if the highlighted nodes are fading in or fading out.
	 * @returns {boolean} true if the highlighted nodes fade in or fade out at the end
	 * @public
	 */
	Highlight.prototype.isFadeInOut = function() {
		return this._type?.startsWith("Fade") === true;
	};

	/**
	 * Gets if the highlighted nodes are fading out.
	 * @returns {boolean} true if the highlighted nodes fade out at the end
	 * @public
	 */
	Highlight.prototype.isFadeOut = function() {
		return this._type === "FadeOut";
	};

	return Highlight;
});
