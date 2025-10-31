/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides the HighlightPlayer class.
sap.ui.define([
	"sap/ui/base/Object",
	"../HighlightDisplayState"
], function(
	BaseObject,
	HighlightDisplayState
) {
	"use strict";

	/**
	 * Constructor for a new highlight player.
	 *
	 * @class Provides the player for highlight animations.
	 *
	 * @private
	 * @author SAP SE
	 * @version 1.141.0
	 * @extends sap.ui.base.Object
	 * @alias sap.ui.vk.threejs.HighlightPlayer
	 */
	var HighlightPlayer = BaseObject.extend("sap.ui.vk.threejs.HighlightPlayer", /** @lends sap.ui.vk.three.HighlightPlayer.prototype */ {

		constructor: function() {
			this._state = HighlightDisplayState.stopped;
			this._startTime = 0;
			this._timeElapsed = 0;
			this._highlightsNodesMap = new Map();
		}
	});

	/*
	Reset player with highlights and associated nodes specified in a view
	 */
	HighlightPlayer.prototype.reset = function(view, scene) {
		this.stop();
		this._highlightsNodesMap.clear();
		this._state = HighlightDisplayState.stopped;
		if (view && scene) {
			var highlightIdNodesMap = view.getHighlightIdNodesMap();

			var that = this;
			highlightIdNodesMap.forEach(function(value, key) {
				var highlight = scene.getHighlight(key);
				that.addHighlights(highlight, value);
			});
		}

		return this;
	};

	HighlightPlayer.prototype.setViewStateManager = function(vsm) {
		this._viewStateManager = vsm;
	};

	HighlightPlayer.prototype.addHighlights = function(highlight, nodes) {
		if (highlight && nodes && nodes.length) {
			this._highlightsNodesMap.set(highlight, { nodes: nodes });
		}
	};

	/*
	Start playing highlight
	 */
	HighlightPlayer.prototype.start = function(time) {
		if (this._state === HighlightDisplayState.pausing) {
			this._startTime = time - this._timeElapsed;
		} else {
			this._startTime = time;
			this._timeElapsed = 0;
		}
		this._state = HighlightDisplayState.playing;

		var vsm = this._viewStateManager;
		this._highlightsNodesMap.forEach(function(nodesInfo, highlight) {
			var hiddenNodes = [];
			nodesInfo.nodes.forEach(function(node) {
				while (node) {
					if (!vsm.getVisibilityState(node)) {
						vsm.setVisibilityState(node, true, false);
						hiddenNodes.push(node);
					}
					node = node.parent;
				}
			});
			nodesInfo.hiddenNodes = hiddenNodes.length > 0 ? hiddenNodes : undefined;
		});
	};

	/*
	Play highlight, return true if highlight is not finished
	 */
	HighlightPlayer.prototype.play = function(time) {
		if (this._state !== HighlightDisplayState.playing) {
			return false;
		}
		this._timeElapsed = time - this._startTime;

		var completedHighlights = [];
		this._highlightsNodesMap.forEach(function(nodesInfo, highlight) {
			const res = highlight.evaluate(this._timeElapsed / 1000.0);

			if (res.color != null) {
				this._viewStateManager.setNodesHighlightColor(nodesInfo.nodes, res.isCompleted ? null : res.color);
			}
			if (res.opacity != null) {
				this._viewStateManager.setOpacity(nodesInfo.nodes, res.isCompleted ? null : res.opacity);
			}

			if (res.isCompleted) {
				if (highlight.isFadeOut() && nodesInfo.hiddenNodes !== undefined) {
					this._viewStateManager.setVisibilityState(nodesInfo.hiddenNodes, false, false);
				}
				if (highlight.isFadeInOut()) {
					completedHighlights.push(highlight);
				}
			}
		}, this);

		completedHighlights.forEach(function(highlight) {
			this._highlightsNodesMap.delete(highlight);
		}, this);

		if (this._highlightsNodesMap.size === 0) {
			this._state = HighlightDisplayState.stopped;
			return false;
		}

		return true;
	};

	/*
	Stop highlight
	 */
	HighlightPlayer.prototype.stop = function(time) {
		this._timeElapsed = 0;
		this._startTime = 0;
		var that = this;
		this._highlightsNodesMap.forEach(function(nodesInfo, highlight) {
			that._viewStateManager.setNodesHighlightColor(nodesInfo.nodes, null);
			that._viewStateManager.setOpacity(nodesInfo.nodes, null);

			if (highlight.isFadeOut() && nodesInfo.hiddenNodes != undefined) {
				that._viewStateManager.setVisibilityState(nodesInfo.hiddenNodes, false, false);
			}
		});

		this._state = HighlightDisplayState.stopped;

		return this;
	};

	/*
	Pause highlight
	 */
	HighlightPlayer.prototype.pause = function(time) {
		if (this._state === HighlightDisplayState.stopped) {
			return this;
		}
		this._timeElapsed = time - this._startTime;

		this._state = HighlightDisplayState.pausing;

		return this;
	};

	return HighlightPlayer;
});
