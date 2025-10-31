/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.Toolbar.
sap.ui.define([
	"./library",
	"./getResourceBundle",
	"sap/ui/core/Control",
	"sap/m/library",
	"sap/m/Title",
	"sap/m/Button",
	"sap/m/ToggleButton",
	"sap/m/ToolbarSpacer",
	"sap/m/ToolbarSeparator",
	"sap/m/Toolbar",
	"sap/ui/core/Element"
], function(
	vkLibrary,
	getResourceBundle,
	Control,
	mobileLibrary,
	Title,
	Button,
	ToggleButton,
	ToolbarSpacer,
	ToolbarSeparator,
	SapMToolbar,
	Element
) {
	"use strict";

	var ToolbarDesign = mobileLibrary.ToolbarDesign;
	var ButtonType = mobileLibrary.ButtonType;

	/**
	 * Constructor for a new Toolbar.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Provides buttons to hide or show certain sap.ui.vk controls.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version 1.141.0
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.vk.Toolbar
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 * @since 1.32.0
	 */
	var Toolbar = Control.extend("sap.ui.vk.Toolbar", /** @lends sap.ui.vk.Toolbar.prototype */ {
		metadata: {
			library: "sap.ui.vk",
			properties: {
				/**
				 * Used to set the title of the Toolbar
				 * @private
				 */
				title: {
					type: "string",
					group: "Appearance",
					defaultValue: ""
				}
			},
			events: {},
			associations: {
				/**
				 * A toolbar instance is associated with an instance of the Viewer
				 *
				 * @private
				 */
				viewer: {
					type: "sap.ui.vk.Viewer",
					multiple: false
				}
			},
			aggregations: {
				/**
				 * Toolbar content, this can be used to add/remove buttons and other SAP UI5 controls to the toolbar
				 */
				content: {
					type: "sap.ui.core.Control",
					multiple: true,
					forwarding: {
						getter: "_getToolbar",
						aggregation: "content",
						forwardBinding: true
					}
				},
				_toolbar: {
					type: "sap.m.Toolbar",
					multiple: false,
					visibility: "hidden"
				}
			}
		},

		constructor: function(id, settings) {
			Control.apply(this, arguments);

			this._getViewer()?.attachFullScreen(this._fullScreenHandler, this);
		},

		renderer: {
			apiVersion: 2,

			render: function(rm, control) {
				rm.openStart("div", control);
				rm.class("sapVizKitToolbar");
				rm.openEnd();
				rm.renderControl(control.getAggregation("_toolbar"));
				rm.close("div");
			}
		}
	});

	Toolbar.prototype._getToolbar = function() {
		return this._toolbar;
	};

	Toolbar.prototype._getViewer = function() {
		return Element.getElementById(this.getViewer());
	};

	Toolbar.prototype._onFullScreen = function() {
		this._getViewer()?.activateFullScreenMode();
	};

	Toolbar.prototype._fullScreenHandler = function(event) {
		var bFull = event.mParameters.isFullScreen;
		this._enterFullScreenButton.setPressed(bFull);

		if (bFull) {
			this._enterFullScreenButton.setIcon("sap-icon://exit-full-screen");
		} else {
			this._enterFullScreenButton.setIcon("sap-icon://full-screen");
		}
	};

	Toolbar.prototype.init = function() {
		if (Control.prototype.init) {
			Control.prototype.init.apply(this);
		}

		this._stepNavigationButton = new ToggleButton({
			icon: "sap-icon://step",
			type: ButtonType.Transparent,
			tooltip: getResourceBundle().getText("STEP_NAV_MENUBUTTONTOOLTIP"),
			visible: "{= ${_internal>/stepNavigation/enabled} === true && ${_internal>/stepNavigation/supported} === true }",
			pressed: "{_internal>/stepNavigation/visible}"
		}).data("help-id", "sapUiVkStepNavigationBtn", true);

		this._sceneTreeButton = new ToggleButton({
			icon: "sap-icon://tree",
			type: ButtonType.Transparent,
			tooltip: getResourceBundle().getText("SCENETREE_MENUBUTTONTOOLTIP"),
			visible: "{= ${_internal>/sceneTree/enabled} === true && ${_internal>/sceneTree/supported} === true }",
			pressed: "{_internal>/sceneTree/visible}"
		}).data("help-id", "sapUiVkSceneTreeBtn", true);

		this._layersPanelButton = new ToggleButton({
			icon: "sap-icon://dimension",
			type: ButtonType.Transparent,
			tooltip: getResourceBundle().getText("LAYERS_BUTTONTOOLTIP"),
			visible: "{= ${_internal>/layersPanel/enabled} === true && ${_internal>/layersPanel/supported} === true }",
			pressed: "{_internal>/layersPanel/visible}"
		}).data("help-id", "sapUiVkLayersBtn", true);

		this._elementsPanelButton = new ToggleButton({
			icon: "sap-icon://group-2",
			type: ButtonType.Transparent,
			tooltip: getResourceBundle().getText("ELEMENTS_BUTTONTOOLTIP"),
			visible: "{= ${_internal>/elementsPanel/enabled} === true && ${_internal>/elementsPanel/supported} === true }",
			pressed: "{_internal>/elementsPanel/visible}"
		}).data("help-id", "sapUiVkElementsBtn", true);

		this._pageGalleryButton = new ToggleButton({
			icon: "sap-icon://documents",
			type: ButtonType.Transparent,
			tooltip: getResourceBundle().getText("PAGE_GALLERY_BUTTONTOOLTIP"),
			visible: "{= ${_internal>/pageGallery/enabled} === true && ${_internal>/pageGallery/supported} === true }",
			pressed: "{_internal>/pageGallery/visible}"
		}).data("help-id", "sapUiVkPageGalleryBtn", true);

		this._miniMapButton = new ToggleButton({
			icon: "sap-icon://map-3",
			type: ButtonType.Transparent,
			tooltip: getResourceBundle().getText("MINIMAP_BUTTONTOOLTIP"),
			visible: "{= ${_internal>/miniMap/enabled} === true && ${_internal>/miniMap/supported} === true }",
			pressed: "{_internal>/miniMap/visible}"
		}).data("help-id", "sapUiVkMiniMapBtn", true);

		this._toggleHotspotsButton = new ToggleButton({
			icon: "sap-icon://example",
			type: ButtonType.Transparent,
			tooltip: getResourceBundle().getText("TOGGLE_HOTSPOTS_BUTTONTOOLTIP"),
			visible: "{= ${_internal>/hotspots/supported} === true && ${_internal>/hotspots/enabled} === true }",
			pressed: "{_internal>/hotspots/showAll}"
		}).data("help-id", "sapUiVkToolgeHotspotsBtn", true);

		this._toolbarTitle = new Title();

		this._enterFullScreenButton = new Button({
			icon: "sap-icon://full-screen",
			type: ButtonType.Transparent,
			press: this._onFullScreen.bind(this),
			tooltip: getResourceBundle().getText("ENTER_FULLSCREEN")
		}).data("help-id", "sapUiVkEnterFullScreenBtn", true).addStyleClass("sapUiVkFullScreenToolbarButton");

		var toolbarContent = [
			new ToolbarSpacer(),
			this._toolbarTitle,
			new ToolbarSpacer(),
			this._sceneTreeButton,
			this._stepNavigationButton,
			this._layersPanelButton,
			this._elementsPanelButton,
			this._pageGalleryButton,
			this._toggleHotspotsButton,
			this._miniMapButton,
			new ToolbarSeparator(),
			this._enterFullScreenButton
		];

		this._toolbar = new SapMToolbar({
			design: ToolbarDesign.Solid,
			content: toolbarContent
		}).data("help-id", "sapUiVkViewerToolbar", true);
		this.setAggregation("_toolbar", this._toolbar, true);
	};

	Toolbar.prototype.exit = function() {
		this._getViewer()?.detachFullScreen(this._fullScreenHandler, this);
	};

	Toolbar.prototype.onBeforeRendering = function() {
		this._toolbar.setVisible(true);
		this._toolbarTitle.setText(this.getTitle());
	};

	return Toolbar;

});
