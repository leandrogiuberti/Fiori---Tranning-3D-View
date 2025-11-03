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
	 * Defines the type of content in a scene.
	 *
	 * See VisualContentType in IPD Visualization API.
	 *
	 * @enum {string}
	 * @alias sap.ui.vk.ContentType
	 * @private
	 * @since 1.139.0
	 */
	const ContentType = {
		MODEL3D: "3DModel",
		IMAGE2D: "2DImage",
		IMAGE360: "360Image",
		DRAWING2D: "2DDrawing",
		NAVIGATION: "Navigation",
		FOLDER: "Folder",
		SYMBOL: "Symbol",
		MATERIAL: "Material",
		PDF: "PDF",
		ECAD: "ECAD"
	};

	DataType.registerEnum("sap.ui.vk.ContentType", ContentType);

	return ContentType;
});
