/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.Viewer.
sap.ui.define([
	"./library",
	"sap/ui/core/Core",
	"sap/ui/core/Control",
	"sap/ui/model/json/JSONModel",
	"./Scene",
	"./ContentResource",
	"./ContentConnector",
	"./dvl/ContentManager",
	"./FlexibleControl",
	"sap/m/VBox",
	"sap/m/FlexItemData",
	"sap/ui/layout/Splitter",
	"sap/ui/layout/SplitterLayoutData",
	"./DvlException",
	"./Messages",
	"sap/m/ProgressIndicator",
	"./Notifications",
	"./ViewStateManager",
	"./Toolbar",
	"./SceneTree",
	"./StepNavigation",
	"./ViewGallery",
	"./ViewManager",
	"./AnimationPlayer",
	"./Viewport",
	"./NativeViewport",
	"./RedlineDesign",
	"./SelectionMode",
	"./DrawerToolbar",
	"./pdf/PageGallery",
	"./ecad/LayersPanel",
	"./ecad/ElementsPanel",
	"./getResourceBundle",
	"./cssColorToColor",
	"./colorToCSSColor",
	"./abgrToColor",
	"./colorToABGR",
	"sap/base/Log",
	"sap/base/i18n/Localization",
	"sap/ui/core/StaticArea"
], function(
	vkLibrary,
	core,
	Control,
	JSONModel,
	Scene,
	ContentResource,
	ContentConnector,
	DvlContentManager,
	FlexibleControl,
	VBox,
	FlexItemData,
	Splitter,
	SplitterLayoutData,
	DvlException,
	Messages,
	ProgressIndicator,
	Notifications,
	ViewStateManager,
	Toolbar,
	SceneTree,
	StepNavigation,
	ViewGallery,
	ViewManager,
	AnimationPlayer,
	Viewport,
	NativeViewport,
	RedlineDesign,
	SelectionMode,
	DrawerToolbar,
	PageGallery,
	LayersPanel,
	ElementsPanel,
	getResourceBundle,
	cssColorToColor,
	colorToCSSColor,
	abgrToColor,
	colorToABGR,
	Log,
	Localization,
	StaticArea
) {
	"use strict";

	/**
	 * Constructor for a new Viewer.
	 *
	 * @class Provides simple 3D visualization capability by connecting, configuring and presenting
	 * the essential Visualization Toolkit controls a single composite control.
	 *
	 * <b>NOTE:</b> To use this control the application developer should add dependencies to the
	 * following libraries on application level to ensure that the libraries are loaded before the
	 * module dependencies will be required:
	 * <ul>
	 *   <li>sap.f</li>
	 *   <li>sap.ui.comp</li>
	 * </ul>
	 *
	 * @param {string} [sId] ID for the new Viewer control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new Viewer control
	 * @public
	 * @author SAP SE
	 * @version 1.141.0
	 * @since 1.32.0
	 * @extends sap.ui.core.Control
	 * @alias sap.ui.vk.Viewer
	 */
	var Viewer = Control.extend("sap.ui.vk.Viewer", /** @lends sap.ui.vk.Viewer.prototype */ {
		metadata: {
			library: "sap.ui.vk",

			properties: {
				/**
				 * Disables the scene tree control Button on the menu
				 */
				enableSceneTree: {
					type: "boolean",
					defaultValue: true
				},
				/**
				 * Shows or hides the scene tree control
				 */
				showSceneTree: {
					type: "boolean",
					defaultValue: true
				},
				/**
				 * Disables the Step Navigation Control Button on the menu
				 */
				enableStepNavigation: {
					type: "boolean",
					defaultValue: true
				},
				/**
				 * Disables the Message Popover Control
				 */
				enableNotifications: {
					type: "boolean",
					defaultValue: true
				},
				/**
				 * Shows or hides the Step Navigation Control
				 */
				showStepNavigation: {
					type: "boolean",
					defaultValue: false
				},
				/**
				 * Shows or hides the Step Navigation thumbnails
				 */
				showStepNavigationThumbnails: {
					type: "boolean",
					defaultValue: true
				},
				/**
				 * If enabled the Step Navigation will be overlayed on top of the viewport. Only set this during initialization. Will not work when set at runtime.
				 */
				overlayStepNavigation: {
					type: "boolean",
					defaultValue: false
				},
				/**
				 * Disables the ECAD layers panel control
				 */
				enableLayersPanel: {
					type: "boolean",
					defaultValue: true
				},
				/**
				 * Shows or hides the ECAD layers panel control
				 * */
				showLayersPanel: {
					type: "boolean",
					defaultValue: true
				},
				/**
				 * Disables the ECAD elements panel control
				 */
				enableElementsPanel: {
					type: "boolean",
					defaultValue: true
				},
				/**
				 * Shows or hides the ECAD elements panel control
				 */
				showElementsPanel: {
					type: "boolean",
					defaultValue: true
				},
				/**
				 * Disables the page gallery control
				 */
				enablePageGallery: {
					type: "boolean",
					defaultValue: true
				},
				/**
				 * Shows or hides the page gallery control
				 */
				showPageGallery: {
					type: "boolean",
					defaultValue: true
				},
				/**
				 * Shows or hides Toolbar control
				 */
				enableToolbar: {
					type: "boolean",
					defaultValue: true
				},
				/**
				 * Enable / disable progress indicator for downloading and rendering VDS files
				 */
				enableProgressIndicator: {
					type: "boolean",
					defaultValue: true
				},
				/**
				 * Shows or hides the drawer toolbar
				 */
				showDrawerToolbar: {
					type: "boolean",
					defaultValue: true
				},
				/**
				 * Disables the mini map control
				 */
				enableMiniMap: {
					type: "boolean",
					defaultValue: true
				},
				/**
				 * Shows or hides the mini map control
				 */
				showMiniMap: {
					type: "boolean",
					defaultValue: false
				},
				/**
				 * Width of the Viewer control
				 */
				width: {
					type: "sap.ui.core.CSSSize",
					defaultValue: null
				},
				/**
				 * Height of the Viewer control
				 */
				height: {
					type: "sap.ui.core.CSSSize",
					defaultValue: null
				},
				/**
				 * The toolbar title
				 */
				toolbarTitle: {
					type: "string",
					defaultValue: ""
				},
				/**
				 * Whether or not we want ViewStateManager to keep track of visibility changes.
				 */
				shouldTrackVisibilityChanges: {
					type: "boolean",
					defaultValue: false
				},
				/**
				 * Whether or not we want ViewStateManager to have recursive selection.
				 */
				recursiveSelection: {
					type: "boolean",
					defaultValue: false
				},
				/**
				 * Optional Emscripten runtime module settings. A JSON object with the following properties:
				 * <ul>
				 * <li>totalMemory {int} size of Emscripten module memory in bytes, default value: 512 MB.</li>
				 * <li>logElementId {string} ID of a textarea DOM element to write the log to.</li>
				 * <li>statusElementId {string} ID of a DOM element to write the status messages to.</li>
				 * </ul>
				 * Emscripten runtime module settings cannot be changed after the control is fully initialized.
				 */
				runtimeSettings: {
					type: "object",
					defaultValue: {}
				},
				/**
				 * Optional WebGL context attributes. A JSON object with the following boolean properties:
				 * <ul>
				 * <li>antialias {boolean} default value <code>true</code>. If set to <code>true</code>, the context will attempt to perform
				 * antialiased rendering if possible.</li>
				 * <li>alpha {boolean} default value <code>true</code>. If set to <code>true</code>, the context will have an alpha
				 * (transparency) channel.</li>
				 * <li>premultipliedAlpha {boolean} default value <code>false</code>. If set to <code>true</code>, the color channels in the
				 * framebuffer will be stored premultiplied by the alpha channel to improve performance.</li>
				 * </ul>
				 * Other {@link https://www.khronos.org/registry/webgl/specs/latest/1.0/#5.2 WebGL context attributes} are also supported. WebGL
				 * context attributes cannot be changed after the control is fully initialized.
				 */
				webGLContextAttributes: {
					type: "object",
					defaultValue: {
						antialias: true,
						alpha: true,
						premultipliedAlpha: false
					}
				},
				/**
				 * Shows or hides showing of all hotspots toggle button
				 */
				hotspotsEnabled: {
					type: "boolean",
					defaultValue: true
				},
				/**
				 * Enables or disables showing of all hotspots
				 */
				showAllHotspots: {
					type: "boolean",
					defaultValue: false
				},
				/**
				 * Color used for highlighting Smart2D hotspots in the ABGR format.
				 */
				hotspotColorABGR: {
					type: "int",
					defaultValue: 0x590000BB
				},
				/**
				 * Color used for highlighting Smart2D hotspots in the CSS Color format.
				 */
				hotspotColor: {
					type: "sap.ui.core.CSSColor",
					defaultValue: "rgba(89, 0, 0, 0.73)"
				}
			},

			aggregations: {
				/**
				 * Content resources to load and display in the Viewer control.
				 */
				contentResources: {
					type: "sap.ui.vk.ContentResource",
					forwarding: {
						getter: "_getContentConnector",
						aggregation: "contentResources"
					}
				},

				progressIndicator: {
					type: "sap.m.ProgressIndicator",
					multiple: false,
					visibility: "hidden"
				},

				layout: {
					type: "sap.m.VBox",
					multiple: false,
					visibility: "hidden"
				},

				contentConnector: {
					type: "sap.ui.vk.ContentConnector",
					multiple: false,
					visibility: "hidden"
				},

				viewStateManager: {
					type: "sap.ui.vk.ViewStateManager",
					multiple: false,
					visibility: "hidden"
				}
			},

			defaultAggregation: "contentResources",

			events: {
				/**
				 * This event will be fired when any content resource or the contentResources aggregation has been changed and processed.
				 */
				contentResourceChangesProcessed: {},

				/**
				 * This event will be fired when a scene / image has been loaded into the Viewer.
				 */
				sceneLoadingSucceeded: {
					parameters: {
						/**
						 * Returns a reference to the loaded Scene.
						 */
						scene: {
							type: "sap.ui.vk.Scene"
						}
					}
				},

				/**
				 * This event will be fired when a critical error occurs during scene / image loading.
				 */
				sceneLoadingFailed: {
					parameters: {
						/**
						 * Returns an optional object describing the reason of the failure.
						 */
						reason: {
							type: "object"
						}
					}
				},

				/**
				 * This event will be fired when scene / image loaded in Viewer is about to be destroyed.
				 */
				sceneDestroying: {
					parameters: {
						/**
						 * Returns a reference to the scene to be destroyed.
						 */
						scene: {
							type: "sap.ui.vk.Scene"
						},

						/**
						 * Returns a <code>function(prevent: boolean)</code> with one boolean parameter.
						 * To prevent garbage collection after the scene is destroyed call this function
						 * passing <code>true</code> as a parameter.
						 */
						preventGarbageCollection: {
							type: "function"
						}
					}
				},

				/**
				 * This event is fired when the nodes are selected/unselected.
				 */
				selectionChanged: {
					parameters: {
						/**
						 * Node references to the newly selected nodes.
						 */
						selected: {
							type: "any[]"
						},
						/**
						 * Node references to the newly unselected nodes.
						 */
						unselected: {
							type: "any[]"
						}
					}
				},

				/**
				 * This event is fired when viewer enters/exits full screen mode.
				 */
				fullScreen: {
					parameters: {
						/**
						 * true: entered full screen; false: exited full screen.
						 */
						isFullScreen: {
							type: "boolean"
						}
					}
				},

				/**
				 * This event will be fired when a URL in a note is clicked.
				 */
				urlClicked: {
					parameters: {
						/**
						 * Returns a node reference of the note that contains the URL.
						 */
						nodeRef: "any",
						/**
						 * Returns a URL that was clicked.
						 */
						url: "string"
					}
				},

				/**
				 * This event will be fired when a node is clicked.
				 */
				nodeClicked: {
					parameters: {
						/**
						 * Returns a node reference.
						 */
						nodeRef: "any",
						x: "int",
						y: "int"
					}
				}
			}
		},

		renderer: {
			apiVersion: 2,

			render: function(rm, control) {
				rm.openStart("div", control);
				rm.class("sapVizKitViewer");
				if (control.getWidth()) {
					rm.style("width", control.getWidth());
				}
				if (control.getHeight()) {
					rm.style("height", control.getHeight());
				}
				rm.openEnd();
				rm.renderControl(control._layout);
				rm.renderControl(control._progressIndicator);
				rm.close("div");
			}
		},

		constructor: function(id, settings) {
			Control.apply(this, arguments);

			Object.assign(this._data, {
				sceneTree: {
					supported: false,
					enabled: this.getEnableSceneTree(),
					visible: this.getShowSceneTree()
				},
				stepNavigation: {
					supported: false,
					enabled: this.getEnableStepNavigation(),
					visible: this.getShowStepNavigation()
				},
				layersPanel: {
					supported: false,
					enabled: this.getEnableLayersPanel(),
					visible: this.getShowLayersPanel()
				},
				elementsPanel: {
					supported: false,
					enabled: this.getEnableElementsPanel(),
					visible: this.getShowElementsPanel()
				},
				pageGallery: {
					supported: false,
					enabled: this.getEnablePageGallery(),
					visible: this.getShowPageGallery(),
					currentPageIndex: 0
				},
				miniMap: {
					supported: false,
					enabled: this.getEnableMiniMap(),
					visible: this.getShowMiniMap()
				},
				toolbar: {
					title: this.getToolbarTitle(),
					enabled: this.getEnableToolbar()
				},
				drawerToolbar: {
					visible: this.getShowDrawerToolbar()
				},
				hotspots: {
					supported: false,
					enabled: this.getHotspotsEnabled(),
					showAll: this.getShowAllHotspots(),
					colorABGR: this.getHotspotColorABGR(),
					color: this.getHotspotColor()
				},
				shouldTrackVisibilityChanges: this.getShouldTrackVisibilityChanges(),
				recursiveSelection: this.getRecursiveSelection()
			});
		}
	});

	Viewer.prototype.applySettings = function(settings) {
		this._inApplySettings = true;
		Control.prototype.applySettings.apply(this, arguments);
		delete this._inApplySettings;
	};

	Viewer.prototype.init = function() {
		if (Control.prototype.init) {
			Control.prototype.init.apply(this);
		}

		this._contentConnector = new ContentConnector(this.getId() + "-contentconnector");
		this.setAggregation("contentConnector", this._contentConnector);
		this._contentConnector.attachContentReplaced(this._handleContentReplaced, this);
		this._contentConnector.attachContentChangesStarted(this._handleContentChangesStarted, this);
		this._contentConnector.attachContentChangesFinished(this._handleContentChangesFinished, this);
		this._contentConnector.attachContentChangesProgress(this._handleContentChangesProgress, this);

		this._data = {
			sceneTree: {},
			stepNavigation: {},
			layersPanel: {},
			elementsPanel: {},
			pageGallery: {},
			miniMap: {},
			toolbar: {},
			drawerToolbar: {},
			hotspots: {}
		};
		this._model = new JSONModel(this._data);
		this._model.attachPropertyChange(function(event) {
			const value = event.getParameter("value");
			switch (event.getParameter("path")) {
				case "/sceneTree/visible": this.setShowSceneTree(value); break;
				case "/stepNavigation/visible": this.setShowStepNavigation(value); break;
				case "/layersPanel/visible": this.setShowLayersPanel(value); break;
				case "/elementsPanel/visible": this.setShowElementsPanel(value); break;
				case "/pageGallery/visible": this.setShowPageGallery(value); break;
				case "/miniMap/visible": this.setShowMiniMap(value); break;
				case "/hotspots/showAll": this.setShowAllHotspots(value); break;
				case "/hotspots/colorABGR": this.setHotspotColorABGR(value); break;
				case "/hotspots/color": this.setHotspotColor(value); break;
				default: break;
			}
		}, this);
		this.setModel(this._model, "_internal");

		this._viewStateManager = new ViewStateManager(this.getId() + "-viewstatemanager", {
			shouldTrackVisibilityChanges: "{_internal>/shouldTrackVisibilityChanges}",
			recursiveSelection: "{_internal>/recursiveSelection}",
			contentConnector: this._contentConnector
		});
		this.setAggregation("viewStateManager", this._viewStateManager);

		Log.debug("sap.ui.vk.Viewer.init() called.");

		this._animationPlayer = new AnimationPlayer({
			viewStateManager: this._viewStateManager
		});

		this._viewManager = new ViewManager({
			contentConnector: this._contentConnector,
			animationPlayer: this._animationPlayer
		});

		this._viewStateManager.setViewManager(this._viewManager);

		this._mainScene = null;
		this._busyIndicatorCounter = 0;
		this._viewport = null;
		this._nativeViewport = null; // only used to display "Error Loading File" svg image
		this._redlineDesign = null;
		this._stepNavigation = null;
		this._sceneTree = null;
		this._drawerToolbar = null;
		this._pageGallery = null;
		this._layersPanel = null;
		this._elementsPanel = null;

		this._staticAreaParent = null;
		this._staticAreaNextSibling = null;

		this.attachBrowserEvent("fullscreenchange", this._handleFullscreenChange, this);

		this._toolbar = new Toolbar({
			title: "{_internal>/toolbar/title}",
			visible: "{_internal>/toolbar/enabled}",
			viewer: this
		});

		this._stackedViewport = new FlexibleControl(this.getId() + "-stackedViewport", {
			width: "100%",
			height: "100%",
			layout: "Stacked",
			layoutData: new SplitterLayoutData({
				size: "auto",
				minSize: 200
			})
		});

		this._splitter = new Splitter(this.getId() + "-splitter", {
			layoutData: new FlexItemData({
				growFactor: 1,
				minHeight: "200px"
			}),
			contentAreas: [this._stackedViewport]
		}).addStyleClass("sapUiVizKitSplitter");

		this._messagePopover = new Notifications(`${this.getId()}-notifications`, { visible: true });
		this._messagePopover.attachAllMessagesCleared(this._updateLayout, this);
		this._messagePopover.attachMessageAdded(this._updateLayout, this);

		this._layout = new VBox(this.getId() + "-vbox", {
			height: "100%",
			items: [
				this._toolbar,
				this._splitter,
				this._messagePopover
			]
		}).addStyleClass("sapUiVizKitLayout");
		this.setAggregation("layout", this._layout);

		this.setTooltip(getResourceBundle().getText("VIEWER_TITLE"));

		if (this.getEnableProgressIndicator()) {
			this._progressIndicator = new ProgressIndicator({
				displayAnimation: false,
				displayOnly: true,
				visible: false
			}).addStyleClass("sapUiVizKitProgressIndicator");
			this.setAggregation("progressIndicator", this._progressIndicator);
		}

		Localization.attachChange(this._onLocalizationChanged);
	};

	/**
	 * Destroys the Viewer control. All scenes will be destroyed and all Viewports will be unregistered by the Graphics Core.
	 *
	 * @private
	 */
	Viewer.prototype.exit = function() {
		Log.debug("sap.ui.vk.Viewer.exit() called.");

		Localization.detachChange(this._onLocalizationChanged);

		this._viewport?.destroy();
		this._viewport = null;

		this._nativeViewport?.destroy();
		this._nativeViewport = null;

		// All scenes will be destroyed and all viewports will be unregistered by GraphicsCore.destroy.
		this._setMainScene(null);
		this._toolbar = null;
		this._messagePopover = null;
		this._sceneTree = null;
		this._stepNavigation = null;
		this._drawerToolbar = null;
		this._componentsState = null;
		this._viewStateManager = null;
		this._contentConnector = null;
		this._viewManager = null;
		this._model = null;

		this._staticAreaParent = null;
		this._staticAreaNextSibling = null;

		this.detachBrowserEvent("fullscreenchange", this._handleFullscreenChange, this);

		if (Control.prototype.exit) {
			Control.prototype.exit.apply(this);
		}
	};

	Viewer.prototype._handleFullscreenChange = function(event) {
		const viewerDomRef = this.getDomRef();

		// We can get to this event handler in two cases:
		//
		// 1. When the viewer itself enters or exits fullscreen mode.
		// 2. When a child control of the viewer enters or exits fullscreen mode and the event is
		//    propagated from the child.
		//
		// NOTE 1: this._staticAreaParent != null only when the viewer is in fullscreen mode.
		//
		// NOTE 2: The event is propagated from the child control only when the user presses the
		// "Esc" key to exit fullscreen mode and document.fullscreenElement == null.
		//
		// When NOTE 1 and NOTE 2 are true, we need to restore the static area to its original
		// position in the DOM tree.

		if (event.target === this.getDomRef() || this._staticAreaParent != null) {
			const staticArea = StaticArea.getDomRef();
			if (staticArea == null) {
				return;
			}
			if (document.fullscreenElement === this.getDomRef()) {
				// Entering fullscreen
				this._staticAreaParent = staticArea.parentElement;
				this._staticAreaNextSibling = staticArea.nextSibling;
				viewerDomRef.insertBefore(staticArea, viewerDomRef.firstChild);
				this._toolbar._enterFullScreenButton.setTooltip(getResourceBundle().getText("EXIT_FULLSCREEN"));

				// See NOTE 1 in ViewportBase#_handleFullscreenChange.
				event.stopImmediatePropagation();
			} else if (this._staticAreaParent != null) {
				// Exiting fullscreen
				this._staticAreaParent.insertBefore(staticArea, this._staticAreaNextSibling);
				this._staticAreaParent = this._staticAreaNextSibling = null;
				this._toolbar._enterFullScreenButton.setTooltip(getResourceBundle().getText("ENTER_FULLSCREEN"));

				// See NOTE 2 in ViewportBase#_handleFullscreenChange.
				if (document.fullscreenElement != null) {
					event.stopImmediatePropagation();
				}
			}
		}
	};

	Viewer.prototype._setMainScene = function(scene) {
		this._sceneTree?.destroy();
		this._sceneTree = null;
		if (this._stepNavigation) {
			this._layout.removeItem(this._stepNavigation);
			this._viewport?.removeContent(this._stepNavigation);
			this._stepNavigation.destroy();
			this._stepNavigation = null;
		}
		this._layersPanel?.destroy();
		this._layersPanel = null;
		this._elementsPanel?.destroy();
		this._elementsPanel = null;
		this._pageGallery?.destroy();
		this._pageGallery = null;
		this._mainScene = scene instanceof Scene ? scene : null;

		const isSVG = scene?.getMetadata?.().getName() === "sap.ui.vk.svg.Scene";
		const isECAD = isSVG && scene.isECADScene();
		const isPDF = scene?.isA?.("sap.ui.vk.pdf.Document");
		const data = this._data;
		data.sceneTree.supported = data.stepNavigation.supported = (scene instanceof Scene) && !isECAD;
		data.layersPanel.supported = data.elementsPanel.supported = isECAD;
		data.hotspots.supported = isSVG && !isECAD;
		data.miniMap.supported = isSVG;
		data.pageGallery.supported = isPDF;
		this._model?.updateBindings();

		if (this._mainScene) {
			// Set the scene tree & step navigation state based on default settings and last user interaction (if any).
			if (data.sceneTree.supported && data.sceneTree.enabled) {
				this._sceneTree = new SceneTree({
					layoutData: new SplitterLayoutData({
						size: "320px",
						minSize: 200
					}),
					viewStateManager: this._viewStateManager,
					contentConnector: this._contentConnector
				});
			}

			if (data.stepNavigation.supported && data.stepNavigation.enabled) {
				this._instantiateStepNavigation();
			}

			if (data.layersPanel.supported && data.layersPanel.enabled) {
				this._layersPanel = new LayersPanel({
					layoutData: new SplitterLayoutData({
						size: "320px",
						minSize: 200
					}),
					contentConnector: this._contentConnector,
					viewStateManager: this._viewStateManager
				});
			}

			if (data.elementsPanel.supported && data.elementsPanel.enabled) {
				this._elementsPanel = new ElementsPanel({
					contentConnector: this._contentConnector,
					viewStateManager: this._viewStateManager,
					layoutData: new SplitterLayoutData({
						size: "320px",
						minSize: 200
					})
				});
			}
		}

		if (data.pageGallery.supported) {
			data.pageGallery.currentPageIndex = 0;
			this._pageGallery = new PageGallery({
				layoutData: new SplitterLayoutData({
					size: "320px",
					minSize: 200
				}),
				contentConnector: this._contentConnector,
				currentPageIndex: "{_internal>/pageGallery/currentPageIndex}"
			});
		}

		return this;
	};

	/**
	 * Gets the GraphicsCore object if the currently loaded content is a 3D model.
	 *
	 * @returns {sap.ui.vk.dvl.GraphicsCore} The GraphicsCore object. If there is no 3D scene loaded then <code>null</code> is returned.
	 * @public
	 * @deprecated Since version 1.50.0. DVL namespace wil be removed in future and <code>GraphicsCore</code> does not have direct replacement. Use {@link sap.ui.vk.ContentConnector} for scene loading events.
	 */
	Viewer.prototype.getGraphicsCore = function() {
		return this._mainScene instanceof vkLibrary.dvl.Scene ? this._mainScene.getGraphicsCore() : null;
	};

	/**
	 * Gets the Scene currently loaded in the Viewer control.
	 *
	 * @returns {sap.ui.vk.Scene} The scene loaded in the control.
	 * @public
	 */
	Viewer.prototype.getScene = function() {
		return this._mainScene;
	};

	/**
	 * Gets the view state manager object used for handling visibility and selection of nodes.
	 *
	 * @returns {sap.ui.vk.ViewStateManager} The view state manager object.
	 * @public
	 */
	Viewer.prototype.getViewStateManager = function() {
		return this._viewStateManager;
	};

	/**
	 * Gets the 3D viewport.
	 *
	 * @returns {sap.ui.vk.Viewport} The 3D viewport.
	 * @public
	 */
	Viewer.prototype.getViewport = function() {
		if (!this._viewport) {
			this._viewport = new Viewport(this.getId() + "-viewport", {
				viewStateManager: this._viewStateManager,
				selectionMode: SelectionMode.Exclusive,
				contentConnector: this._contentConnector, // content connector must be the last parameter in the list!
				showAllHotspots: "{_internal>/hotspots/showAll}",
				hotspotColorABGR: "{_internal>/hotspots/colorABGR}",
				hotspotColor: "{_internal>/hotspots/color}"
			});

			this._drawerToolbar = new DrawerToolbar({
				visible: "{_internal>/drawerToolbar/visible}",
				expanded: true,
				viewport: this._viewport
			});
			this._viewport.addContent(this._drawerToolbar);
		}
		return this._viewport;
	};

	/**
	 * Gets the 2D viewport used for displaying format natively supported by the browser - 2D images etc.
	 *
	 * @returns {sap.ui.vk.NativeViewport} The 2D viewport.
	 * @public
	 * @deprecated Since version 1.96.0. Use {@link sap.ui.vk.Viewport#getViewport} instead.
	 */
	Viewer.prototype.getNativeViewport = function() {
		if (this._nativeViewport) {
			return this._nativeViewport; // only used to display "Error Loading File" svg image
		}
		var vp = this.getViewport().getImplementation();
		return vp instanceof vkLibrary.NativeViewport ? vp : null;
	};

	/**
	 * Gets the toolbar control to customize it - add or remove buttons
	 *
	 * @returns {sap.ui.vk.Toolbar} The toolbar control.
	 * @public
	 */
	Viewer.prototype.getToolbar = function() {
		return this._toolbar;
	};

	/**
	 * Gets the scene tree control to customize it.
	 * @returns {sap.ui.vk.SceneTree} The scene tree control.
	 * @public
	 */
	Viewer.prototype.getSceneTree = function() {
		return this._sceneTree;
	};

	/**
	 * Gets the RedlineDesign instance used for creating redlining shapes.
	 *
	 * @returns {sap.ui.vk.RedlineDesign} The RedlineDesign instance.
	 * @deprecated Since version 1.77.0. Use {@link sap.ui.vk.tools.RedlineTool} instead
	 * @public
	 */
	Viewer.prototype.getRedlineDesign = function() {
		return this._redlineDesign;
	};

	Viewer.prototype.setEnableSceneTree = function(value) {
		this.setProperty("enableSceneTree", value, true);
		this._data.sceneTree.enabled = value;
		this._model.updateBindings();
		return this;
	};

	Viewer.prototype.setShowSceneTree = function(value) {
		this.setProperty("showSceneTree", value, true);
		this._data.sceneTree.visible = value;
		this._model.updateBindings();
		this._updateLayout();
		return this;
	};

	Viewer.prototype.setEnableStepNavigation = function(value) {
		this.setProperty("enableStepNavigation", value, true);
		this._data.stepNavigation.enabled = value;
		this._model.updateBindings();
		return this;
	};

	Viewer.prototype.setShowStepNavigation = function(value) {
		this.setProperty("showStepNavigation", value, true);
		this._data.stepNavigation.visible = value;
		this._model.updateBindings();
		return this;
	};

	Viewer.prototype.setEnableLayersPanel = function(value) {
		this.setProperty("enableLayersPanel", value, true);
		this._data.layersPanel.enabled = value;
		this._model.updateBindings();
		return this;
	};

	Viewer.prototype.setShowLayersPanel = function(value) {
		this.setProperty("showLayersPanel", value, true);
		this._data.layersPanel.visible = value;
		this._model.updateBindings();
		this._updateLayout();
		return this;
	};

	Viewer.prototype.setEnableElementsPanel = function(value) {
		this.setProperty("enableElementsPanel", value, true);
		this._data.elementsPanel.enabled = value;
		this._model.updateBindings();
		return this;
	};

	Viewer.prototype.setShowElementsPanel = function(value) {
		this.setProperty("showElementsPanel", value, true);
		this._data.elementsPanel.visible = value;
		this._model.updateBindings();
		this._updateLayout();
		return this;
	};

	Viewer.prototype.setEnablePageGallery = function(value) {
		this.setProperty("enablePageGallery", value, true);
		this._data.pageGallery.enabled = value;
		this._model.updateBindings();
		return this;
	};

	Viewer.prototype.setShowPageGallery = function(value) {
		this.setProperty("showPageGallery", value, true);
		this._data.pageGallery.visible = value;
		this._model.updateBindings();
		this._updateLayout();
		return this;
	};

	Viewer.prototype.setEnableMiniMap = function(value) {
		this.setProperty("enableMiniMap", value, true);
		this._data.miniMap.enabled = value;
		this._model.updateBindings();
		this._updateLayout();
		return this;
	};

	Viewer.prototype.setShowMiniMap = function(value) {
		this.setProperty("showMiniMap", value, true);
		this._data.miniMap.visible = value;
		this._model.updateBindings();
		this._updateLayout();
		return this;
	};

	Viewer.prototype.setToolbarTitle = function(value) {
		this.setProperty("toolbarTitle", value, true);
		this._data.toolbar.title = value;
		this._model.updateBindings();
		return this;
	};

	Viewer.prototype.setEnableToolbar = function(value) {
		this.setProperty("enableToolbar", value, true);
		this._data.toolbar.enabled = value;
		this._model.updateBindings();
		return this;
	};

	Viewer.prototype.setShowDrawerToolbar = function(value) {
		this.setProperty("showDrawerToolbar", value, true);
		this._data.drawerToolbar.visible = value;
		this._model.updateBindings();
		return this;
	};

	Viewer.prototype.setHotspotsEnabled = function(value) {
		this.setProperty("hotspotsEnabled", value, true);
		this._data.hotspots.enabled = value;
		this._model.updateBindings();
		return this;
	};

	Viewer.prototype.setShowAllHotspots = function(value) {
		this.setProperty("showAllHotspots", value, true);
		this._data.hotspots.showAll = value;
		this._model.updateBindings();
		return this;
	};

	Viewer.prototype._setHotspotColor = function(colorABGR, colorCSS) {
		this.setProperty("hotspotColorABGR", colorABGR, true);
		this.setProperty("hotspotColor", colorCSS, true);
		this._data.hotspots.colorABGR = colorABGR;
		this._data.hotspots.color = colorCSS;
		this._model.updateBindings();
		return this;
	};

	Viewer.prototype.setHotspotColorABGR = function(colorABGR) {
		return this._setHotspotColor(colorABGR, colorToCSSColor(abgrToColor(colorABGR)));
	};

	Viewer.prototype.setHotspotColor = function(colorCSS) {
		return this._setHotspotColor(colorToABGR(cssColorToColor(colorCSS)), colorCSS);
	};

	Viewer.prototype.setShouldTrackVisibilityChanges = function(value) {
		this.setProperty("shouldTrackVisibilityChanges", value, true);
		this._data.shouldTrackVisibilityChanges = value;
		this._model.updateBindings();
		return this;
	};

	Viewer.prototype.setRecursiveSelection = function(value) {
		this.setProperty("recursiveSelection", value, true);
		this._data.recursiveSelection = value;
		this._model.updateBindings();
		return this;
	};

	Viewer.prototype.setEnableNotifications = function(oProperty) {
		this.setProperty("enableNotifications", oProperty, true);
		this._messagePopover.setVisible(false);
		this._updateLayout();
		return this;
	};

	/**
	 * It activates or deactivates full screen mode.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	Viewer.prototype.activateFullScreenMode = function() {
		const viewerDomRef = this.getDomRef();
		if (document.fullscreenElement === viewerDomRef) {
			document.exitFullscreen();
		} else {
			viewerDomRef.requestFullscreen();
		}

		return this;
	};

	Viewer.prototype.setRuntimeSettings = function(settings) {
		if (this._inApplySettings) {
			this.setProperty("runtimeSettings", settings, true);
			/**
			 * @private
			 * @deprecated As of 1.119.0
			 */
			DvlContentManager.setRuntimeSettings(settings);
		} else {
			// runtimeSettings property should not be changeable in other cases than the constructor
			Log.error(getResourceBundle().getText(Messages.VIT29.summary), Messages.VIT29.code, "sap.ui.vk.Viewer");
		}
		return this;
	};

	Viewer.prototype.setWebGLContextAttributes = function(attributes) {
		if (this._inApplySettings) {
			this.setProperty("webGLContextAttributes", attributes, true);
			/**
			 * @private
			 * @deprecated As of 1.119.0
			 */
			DvlContentManager.setWebGLContextAttributes(attributes);
		} else {
			// webGLContextAttributes property should not be changeable in other cases than the constructor
			Log.error(getResourceBundle().getText(Messages.VIT30.summary), Messages.VIT30.code, "sap.ui.vk.Viewer");
		}
		return this;
	};

	////////////////////////////////////////////////////////////////////////////
	// BEGIN: forward access to the contentResources aggregation to the content connector.

	Viewer.prototype.invalidate = function(origin) {
		if (origin instanceof ContentResource) {
			this._contentConnector.invalidate(origin);
			return;
		}
		Control.prototype.invalidate.apply(this, arguments);
	};

	Viewer.prototype._getContentConnector = function() {
		return this._contentConnector;
	};

	// END: forward access to the contentResources aggregation to the content connector.
	////////////////////////////////////////////////////////////////////////////

	Viewer.prototype.isTreeBinding = function(name) {
		return name === "contentResources";
	};

	Viewer.prototype.setBusy = function(busy) {
		if (busy) {
			if (this._busyIndicatorCounter === 0) {
				this.setBusyIndicatorDelay(0);
				Control.prototype.setBusy.call(this, true);
			}
			this._busyIndicatorCounter += 1;
		} else {
			this._busyIndicatorCounter -= 1;
			if (this._busyIndicatorCounter == 0) {
				Control.prototype.setBusy.call(this, false);
			}
		}
	};

	Viewer.prototype._setSplitterContent = function(control, visible, rightSide) {
		if (control) {
			control.setVisible(visible);
			if (visible) {
				if (this._splitter.indexOfContentArea(control) < 0) {
					this._splitter.insertContentArea(control, rightSide ? this._splitter.getContentAreas().length : 0);
				}
			} else if (this._splitter.indexOfContentArea(control) >= 0) {
				this._splitter.removeContentArea(control);
			}
		}
	};

	Viewer.prototype._updateLayout = function() {
		const data = this._data;
		this._setSplitterContent(this._sceneTree, data.sceneTree.visible && data.sceneTree.enabled);
		this._setSplitterContent(this._layersPanel, data.layersPanel.visible && data.layersPanel.enabled);
		this._setSplitterContent(this._elementsPanel, data.elementsPanel.visible && data.elementsPanel.enabled, true);
		this._setSplitterContent(this._pageGallery, data.pageGallery.visible && data.pageGallery.enabled);

		this._messagePopover?.setVisible(this.getEnableNotifications() && this._messagePopover.getAggregation("_messagePopover").getItems().length > 0);

		if (data.miniMap.supported && this._viewport?.getImplementation()?.getMetadata().getName() === "sap.ui.vk.svg.Viewport") {
			this._viewport.getImplementation().getMiniMap()[data.miniMap.visible && data.miniMap.enabled ? "open" : "close"]();
		}
	};

	Viewer.prototype._instantiateStepNavigation = function() {
		var className = this._mainScene.getMetadata().getName();

		/**
		 * @private
		 * @deprecated As of version 1.119.0
		 */
		if (className === "sap.ui.vk.dvl.Scene") {
			this._stepNavigation = new StepNavigation({
				visible: "{_internal>/stepNavigation/visible}",
				showThumbnails: this.getShowStepNavigationThumbnails(),
				contentConnector: this._contentConnector
			});
			this._layout.insertItem(this._stepNavigation, 3);
		}

		if (this._stepNavigation == null && (className === "sap.ui.vk.threejs.Scene" || className === "sap.ui.vk.svg.Scene")) {
			this._stepNavigation = new ViewGallery({
				visible: "{_internal>/stepNavigation/visible}",
				host: this.getViewport(),
				contentConnector: this._contentConnector,
				viewManager: this._viewManager,
				animationPlayer: this._animationPlayer
			});
			if (!this.getOverlayStepNavigation()) {
				this._layout.insertItem(this._stepNavigation, 3);
			} else {
				this._stepNavigation.addStyleClass("sapVizKitViewGallery");
				this._viewport.addContent(this._stepNavigation);
			}
		}

		return this;
	};

	Viewer.prototype._showViewport = function() {
		const viewport = this.getViewport();
		this._nativeViewport?.setVisible(false);
		this._stackedViewport.removeAllContent();
		this._stackedViewport.addContent(viewport);
		viewport.setVisible(true);

		return this;
	};

	Viewer.prototype._showNativeViewport = function() {
		if (!this._nativeViewport) {
			this._nativeViewport = new NativeViewport(this.getId() + "-nativeViewport", {
				limitZoomOut: true,
				contentConnector: this._contentConnector
			});
		}

		this._viewport?.setVisible(false);
		this._stackedViewport.removeAllContent();
		this._stackedViewport.addContent(this._nativeViewport);
		this._nativeViewport.setVisible(true);

		return this;
	};

	/**
	 * Sets an object that decrypts content of encrypted models.
	 *
	 * @param {sap.ui.vk.DecryptionHandler} handler An object that decrypts content of encrypted models.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	Viewer.prototype.setDecryptionHandler = function(handler) {
		this._contentConnector.setDecryptionHandler(handler);
		return this;
	};

	/**
	 * Sets an callback function used to authorize user and provide authorization token.
	 *
	 * @param {sap.ui.vk.AuthorizationHandler} handler An callback function.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	Viewer.prototype.setAuthorizationHandler = function(handler) {
		this._contentConnector.setAuthorizationHandler(handler);
		return this;
	};

	/**
	 * Set the consumption scenario (used in SAP/partner applications).
	 *
	 * @param {string} consumptionScenario The consumption scenario.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	Viewer.prototype.setConsumptionScenario = function(consumptionScenario) {
		this._contentConnector.setConsumptionScenario(consumptionScenario);
		return this;
	};

	/*
	 * It creates a new instance of {sap.ui.vk.RedlineDesign}.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @private
	 */
	Viewer.prototype._instantiateRedlineDesign = function(redlineElements) {

		// if either Viewport/NativeViewport exist and are visible, we instantiate RedlineDesign
		var vp = this.getViewport().getImplementation();
		if (vp && vp.getVisible()) {
			var activeViewport = vp && vp.getVisible() ? vp : null;
			var virtualViewportSize = activeViewport.getOutputSize();

			this._redlineDesign = new RedlineDesign({
				visible: false,
				virtualTop: virtualViewportSize.top,
				virtualLeft: virtualViewportSize.left,
				virtualSideLength: virtualViewportSize.sideLength,
				redlineElements: redlineElements
			});

			this._redlineDesign._setTargetViewport(activeViewport);
		}
		return this;
	};

	/**
	 * Activates the redline design control.
	 * @param {sap.ui.vk.RedlineElement | sap.ui.vk.RedlineElement[]} redlineElements The redline element/elements which will be rendered
	 * as soon as the redline design control is activated.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @deprecated Since version 1.77.0. Use {@link sap.ui.vk.tools.RedlineTool} instead
	 * @public
	 */
	Viewer.prototype.activateRedlineDesign = function(redlineElements) {
		var vp = this.getViewport().getImplementation();
		if (vp._activateRedline) {
			vp._activateRedline();
		} else if (vp instanceof vkLibrary.threejs.Viewport) {
			vp._viewportGestureHandler._activateRedline();
		}
		redlineElements = redlineElements || [];
		this._instantiateRedlineDesign(redlineElements);
		// placing the RedlineDesign inside the _stackedViewport
		this.getRedlineDesign().placeAt(this._stackedViewport);
		this.getRedlineDesign().setVisible(true);

		var onRedlineDesignPanViewport = function(event) {
			var deltaX = event.getParameter("deltaX"),
				deltaY = event.getParameter("deltaY");

			vp.queueCommand(function() {
				vp.pan(deltaX, deltaY);
				vp.endGesture();
			});
		};

		var onRedlineDesignZoomViewport = function(event) {
			var originX = event.getParameter("originX"),
				originY = event.getParameter("originY"),
				zoomFactor = event.getParameter("zoomFactor");

			vp.queueCommand(function() {
				vp.beginGesture(originX, originY);
				vp.zoom(zoomFactor);
				vp.endGesture();
			});
		};

		var onRedlineDesignPanThreejsViewport = function(event) {
			var deltaX = event.getParameter("deltaX"),
				deltaY = event.getParameter("deltaY");

			vp.queueCommand(function() {
				vp._viewportGestureHandler._cameraController.beginGesture(deltaX, deltaY);
				vp._viewportGestureHandler._cameraController.pan(deltaX, deltaY);
				vp._viewportGestureHandler._cameraController.endGesture();
			});
		};

		var onRedlineDesignZoomThreejsViewport = function(event) {
			var originX = event.getParameter("originX"),
				originY = event.getParameter("originY"),
				zoomFactor = event.getParameter("zoomFactor");

			vp.queueCommand(function() {
				vp._viewportGestureHandler._cameraController.beginGesture(originX, originY);
				vp._viewportGestureHandler._cameraController.zoom(zoomFactor);
				vp._viewportGestureHandler._cameraController.endGesture();
			});
		};

		// Subscribing to the events fired by the RedlineDesign.
		// Every time the RedlineDesign moves, we receive the new coordinates/zoom level
		// and we use them to update the Viewport/NativeViewport
		if ((vp instanceof vkLibrary.NativeViewport || vp instanceof vkLibrary.dvl.Viewport) && vp.getVisible()) {
			this.getRedlineDesign().attachEvent("pan", onRedlineDesignPanViewport.bind(this));
			this.getRedlineDesign().attachEvent("zoom", onRedlineDesignZoomViewport.bind(this));
		} else if (vp instanceof vkLibrary.threejs.Viewport && vp.getVisible()) {
			this.getRedlineDesign().attachEvent("pan", onRedlineDesignPanThreejsViewport.bind(this));
			this.getRedlineDesign().attachEvent("zoom", onRedlineDesignZoomThreejsViewport.bind(this));
		} else {
			Log.error("Error: Viewport not supported");
		}

		return this;
	};

	/**
	 * It destroys the current instance of {sap.ui.vk.RedlineDesign}.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @deprecated Since version 1.77.0. Use {@link sap.ui.vk.tools.RedlineTool} instead
	 * @public
	 */
	Viewer.prototype.destroyRedlineDesign = function() {
		if (this.getRedlineDesign()) {
			var vp = this.getViewport().getImplementation();
			if (vp._deactivateRedline) {
				vp._deactivateRedline();
			} else if (vp instanceof vkLibrary.threejs.Viewport) {
				vp._viewportGestureHandler._deactivateRedline();
			}
			this.getRedlineDesign().destroy();
			this._redlineDesign = null;
		}
		return this;
	};

	Viewer.prototype._removeProgressIndicator = function() {
		this._progressIndicator.setVisible(false);
		this._progressIndicator.setDisplayValue("");
		this._progressIndicator.setPercentValue(0);
		this._progressIndicator.rerender();
	};

	Viewer.prototype._handleContentReplaced = function(event) {
		var content = event.getParameter("newContent");

		if (content instanceof Scene || content instanceof HTMLImageElement || content instanceof HTMLObjectElement || content?.isA?.("sap.ui.vk.pdf.Document")) {
			this._showViewport();

			// each time we load a 3D mode, we have to update the panning ratio of the redline control
			if (this.getRedlineDesign()) {
				this.getRedlineDesign().updatePanningRatio();
			}

			this._setMainScene(content);
		} else {
			this._setMainScene(null);
			if (this._viewport) {
				this._viewport.setVisible(false);
			}
			if (this._nativeViewport) {
				this._nativeViewport.setVisible(false);
			}
			this._stackedViewport.removeAllContent();
		}
	};

	Viewer.prototype._handleContentChangesStarted = function(event) {
		this.setBusy(true);
		if (this.getEnableProgressIndicator()) {
			this._progressIndicator.setPercentValue(0.0);
			this._progressIndicator.setVisible(true);
			this._progressIndicator.rerender();
		}
	};

	Viewer.prototype._handleContentChangesFinished = function(event) {
		Log.info("Finished");
		this.setBusy(false);
		var content = event.getParameter("content");
		if (content) {
			if (this._pageGallery) {
				const viewportImplementation = this._viewport.getImplementation();
				if (viewportImplementation?.getMetadata().getName() === "sap.ui.vk.pdf.Viewport") {
					viewportImplementation.bindProperty("currentPageIndex", "_internal>/pageGallery/currentPageIndex");
				}
			}

			this.fireSceneLoadingSucceeded({
				scene: content
			});
		}
		var failureReason = event.getParameter("failureReason");
		if (failureReason) {
			this.fireSceneLoadingFailed({
				reason: failureReason
			});

			this._showNativeViewport();
			// Content Connector throws this error if resource type is not supported.
			var errorUnknownType = getResourceBundle().getText("VIEWER_UNKNOWN_CONTENT_RESOURCE_TYPE_CAUSE");
			if (failureReason.errorMessage === errorUnknownType) {
				// We call NV loadFiled method without parameter so that we use unsupported file text in method already.
				this._nativeViewport.loadFailed();
			} else {
				// If resource has supported type but other issues exist we throw Error loading image.
				// Translated text from Message library
				var errorLoadingFile = getResourceBundle().getText("VIEWPORT_MESSAGEERRORLOADINGFILE");
				// LoadFailed passes parameter as text to present.
				this._nativeViewport.loadFailed(errorLoadingFile);
			}

			(Array.isArray(failureReason) ? failureReason : [failureReason]).forEach(function(reason) {
				Log.error(getResourceBundle().getText(Messages.VIT13.summary), reason.errorMessage, "sap.ui.vk.Viewer");
			});
		}

		// If we are in error or progress bar percentage is not modified then hide the progress bar.
		// If it's value is modified then leave it visible - assumption is that it's percentage will be set to 100% some time later.
		if (failureReason || this._progressIndicator.getPercentValue() === 0) {
			this._removeProgressIndicator();
		}
		this.fireContentResourceChangesProcessed();
		this._updateLayout();
	};

	var progressIndicatorText = getResourceBundle().getText("PROGRESS_INDICATOR_TOTAL_PERCENT_DONE");

	Viewer.prototype._handleContentChangesProgress = function(event) {
		if (!this._progressIndicator.getVisible()) {
			return;
		}

		var percentage = event.getParameter("percentage");
		var phase = event.getParameter("phase");

		this._progressIndicator.setPercentValue(percentage);
		// TODO: we should not use string concatenation, instead we should use a string with placeholders.
		this._progressIndicator.setDisplayValue(phase + " / " + progressIndicatorText + ": " + (percentage ? Math.floor(percentage) + "%" : ""));
		if (percentage >= 100) {
			this._removeProgressIndicator();
		} else {
			// NB: we use a deprecated non-recommended method because we want to force the progress bar
			// rendering. We cannot rely on the asynchronous rendering as it happens too late and the
			// progress bar does move as often as we want.
			this._progressIndicator.rerender();
		}
	};

	Viewer.prototype._handleContentDestroying = function(event) {
		this.fireSceneDestroying({
			scene: event.getParameter("content").scene,
			preventGarbageCollection: event.getParameter("preventGarbageCollection")
		});
	};

	Viewer.prototype._onLocalizationChanged = function(event) {
		progressIndicatorText = getResourceBundle().getText("PROGRESS_INDICATOR_TOTAL_PERCENT_DONE");
	};

	return Viewer;
});
