/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
	"sap/ui/base/DataType"
], function(
	DataType
) {
	"use strict";

	/**
	 * Button identifiers for {@link sap.ui.vk.DrawerToolbar}.
	 * @enum {string}
	 * @readonly
	 * @alias sap.ui.vk.DrawerToolbarButton
	 * @public
	 */
	var DrawerToolbarButton = {
		CrossSection: "VIT-Cross-Section",
		CrossSectionSeparator: "VIT-Cross-Section-Separator",
		Turntable: "VIT-Turntable",
		Orbit: "VIT-Orbit",
		Pan: "VIT-Pan",
		Zoom: "VIT-Zoom",
		GestureButtonsSeparator: "VIT-Gesture-Buttons-Separator",
		Show: "VIT-Show",
		Hide: "VIT-Hide",
		ShowHideSeparator: "VIT-Show-Hide-Separator",
		FitToView: "VIT-Fit-To-View",
		FitToViewSeparator: "VIT-Fit-To-View-Separator",
		RectangularSelection: "VIT-Rectangular-Selection",
		RectangularSelectionSeparator: "VIT-Rectangular-Selection-Separator",
		PredefinedViews: "VIT-Predefined-Views",
		PredefinedViewsSeparator: "VIT-Predefined-Views-Separator",
		FullScreen: "VIT-Fullscreen",
		Measurements: "VIT-Measurements",
		MeasurementsSeparator: "VIT-Measurements-Separator",
		PMI: "VIT-PMI",
		PMISeparator: "VIT-PMI-Separator",
		ZoomIn: "VIT-Zoom-In",
		ZoomOut: "VIT-Zoom-Out",
		FitToPage: "VIT-Fit-To-Page",
		FitToWidth: "VIT-Fit-To-Width",
		PageNavigationSeparator: "VIT-Page-Navigation-Separator",
		PageNavigation: "VIT-Page-Navigation",
		RotateCW: "VIT-Rotate-CW",
		RotateCCW: "VIT-Rotate-CCW",
		Flip: "VIT-Flip",
		EcadSeparator: "VIT-ECAD-Separator"
	};

	DataType.registerEnum("sap.ui.vk.DrawerToolbarButton", DrawerToolbarButton);

	return DrawerToolbarButton;
});
