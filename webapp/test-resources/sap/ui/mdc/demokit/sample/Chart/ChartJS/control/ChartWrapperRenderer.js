
/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([],
	() => {
		"use strict";
		/**
		 * ChatWrapper renderer.
		 * @namespace
		 */
		const ChartWrapperRenderer = {
			apiVersion: 2
		};
		ChartWrapperRenderer.render = function(oRm, oControl) {
			const w = oControl.getWidth();
			oRm.openStart("div", oControl);
			oRm.style("width", w);
			oRm.style("height", "100%");
			oRm.style("overflow", "hidden");
			oRm.style("position", "relative");
			oRm.openEnd();
			oRm.openStart("canvas", oControl.getId() + "--canvas");
			oRm.openEnd();
			oRm.close("canvas");
			oRm.close("div");
		};
		return ChartWrapperRenderer;
	},
	true);
