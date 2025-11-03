/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.ecad.LayerPanel
sap.ui.define([
	"sap/m/VBox",
	"sap/m/Button",
	"sap/m/SearchField",
	"sap/m/OverflowToolbar",
	"sap/m/ToolbarLayoutData",
	"sap/m/ToolbarSpacer",
	"sap/m/Label",
	"sap/m/Table",
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/m/IllustratedMessage",
	"sap/m/IllustratedMessageType",
	"sap/m/plugins/ColumnResizer",
	"sap/ui/core/Control",
	"sap/ui/core/Element",
	"sap/ui/core/Icon",
	"sap/ui/core/library",
	"sap/ui/model/json/JSONModel",
	"../Core",
	"./VisibilityType",
	"../getResourceBundle",
	"sap/m/library"
], function(
	VBox,
	Button,
	SearchField,
	OverflowToolbar,
	ToolbarLayoutData,
	ToolbarSpacer,
	Label,
	Table,
	Column,
	ColumnListItem,
	IllustratedMessage,
	IllustratedMessageType,
	ColumnResizer,
	Control,
	Element,
	Icon,
	Library,
	JSONModel,
	vkCore,
	VisibilityType,
	getResourceBundle,
	SapMLibrary
) {
	"use strict";

	const Sticky = SapMLibrary.Sticky;
	const FlexRendertype = SapMLibrary.FlexRendertype;

	function extractLayersIndex(scene) {
		const index = new Map();
		const metadata = scene.getSceneMetadata();
		const layers = metadata.find((el) => el.category === "ecad" && el.tag === "Layers");

		if (layers) {
			const list = layers.value.split("|");
			list.forEach(function(name) {
				const idx = metadata.find((el) => el.category === name && el.tag === "Index");
				if (idx) {
					index.set(name, idx.value);
				}
			});
		}
		return index;
	}

	function getVisibility(layer) {
		if (layer.hiddenElements.size === 0) {
			return VisibilityType.Visible;
		} else if (layer.hiddenElements.size < layer.elements.size) {
			return VisibilityType.Partial;
		}
		return VisibilityType.Hidden;
	}

	function extractMetadata(nodeRef) {
		const metadata = nodeRef?.userData?.metadata ?? {};
		if (metadata.length) {
			const map = new Map();
			metadata.forEach(function(entry) {
				if (entry.category === "ecad") {
					map.set(entry.tag, entry.value);
				}
			});
			return map;
		}
		return null;
	}

	/**
	 * Constructor for a new LayersPanel.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class Provides a flat list view of all the ECAD layers in a given scene in table format.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version 1.141.0
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.vk.ecad.LayersPanel
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 * @since 1.136.0
	 */
	var LayersPanel = Control.extend("sap.ui.vk.ecad.LayersPanel", /** @lends sap.ui.vk.ecad.LayersPanel.prototype */ {
		metadata: {
			library: "sap.ui.vk",
			properties: {
				width: {
					type: "sap.ui.core.CSSSize",
					defaultValue: "auto"
				},
				height: {
					type: "sap.ui.core.CSSSize",
					defaultValue: "100%"
				}
			},
			aggregations: {
				content: {
					type: "sap.ui.core.Control",
					multiple: false
				}
			},
			associations: {
				/**
				 * An association to the <code>ContentConnector</code> instance that manages content resources.
				 */
				contentConnector: {
					type: "sap.ui.vk.ContentConnector",
					multiple: false
				},

				/**
				 * An association to the <code>ViewStateManager</code> instance.
				 */
				viewStateManager: {
					type: "sap.ui.vk.ViewStateManagerBase",
					multiple: false
				}
			},
			events: {
				/**
				 * This event will be fired when content is replaced.
				 */
				contentChanged: {
					enableEventBubbling: true
				}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function(oRm, oControl) {
				oRm.openStart("div", oControl);
				oRm.class("sapUiSizeCompact");
				const width = oControl.getWidth();
				if (width != null) {
					oRm.style("width", width);
				}
				const height = oControl.getHeight();
				if (height != null) {
					oRm.style("height", height);
				}
				oRm.openEnd();
				oRm.renderControl(oControl.getAggregation("content"));
				oRm.close("div");
			}
		},
		constructor: function(sId, mSettings) {
			Control.apply(this, arguments);
			vkCore.observeAssociations(this);
		}
	});

	const IconType = {
		Hidden: "sap-icon://status-inactive",
		Partial: "sap-icon://vk-icons/partially-visible-layer",
		Visible: "sap-icon://rhombus-milestone-2"
	};

	const ElementType = {
		Component: "2",
		Net: "4"
	};
	LayersPanel.prototype.onSetViewStateManager = function(manager) {
		this._manager = manager;
		manager.attachVisibilityChanged(this._onVisibilityChanged, this);
		this._refresh();
	};

	LayersPanel.prototype.onUnsetViewStateManager = function(manager) {
		this._manager = null;
		manager.detachVisibilityChanged(this._onVisibilityChanged, this);
		this._refresh();
	};

	LayersPanel.prototype.onSetContentConnector = function(connector) {
		connector.attachContentReplaced(this._onContentReplaced, this);
		this._setContent(connector.getContent());
	};

	LayersPanel.prototype.onUnsetContentConnector = function(connector) {
		this._setContent(null);
		connector.detachContentReplaced(this._onContentReplaced, this);
	};

	LayersPanel.prototype.init = function() {
		if (Control.prototype.init) {
			Control.prototype.init.apply(this);
		}
		const that = this;

		this._searchField = new SearchField({
			layoutData: new ToolbarLayoutData({
				shrinkable: true,
				maxWidth: "400px"
			}),
			search: function(event) {
				that._onSearch.call(that, event.getParameter("query"));
			}
		});

		this._showButton = new Button({
			enabled: false,
			icon: IconType.Visible,
			text: getResourceBundle().getText("LAYERS_PANEL_SHOW_BUTTON"),
			tooltip: getResourceBundle().getText("LAYERS_PANEL_SHOW_BUTTON_TOOLTIP"),
			press: this._onShowLayers.bind(this)
		});

		this._hideButton = new Button({
			enabled: false,
			icon: IconType.Hidden,
			text: getResourceBundle().getText("LAYERS_PANEL_HIDE_BUTTON"),
			tooltip: getResourceBundle().getText("LAYERS_PANEL_HIDE_BUTTON_TOOLTIP"),
			press: this._onHideLayers.bind(this)
		});

		this._table = new Table({
			visible: false,
			mode: "MultiSelect",
			includeItemInSelection: true,
			sticky: [Sticky.HeaderToolbar, Sticky.ColumnHeaders],
			selectionChange: this._updateButtons.bind(this),
			headerToolbar: new OverflowToolbar({
				content: [
					this._searchField,
					new ToolbarSpacer(),
					this._showButton,
					this._hideButton
				]
			}),
			dependents: [
				new ColumnResizer()
			],
			columns: [
				new Column({
					minScreenWidth: "10rem",
					hAlign: Library.TextAlign.Begin,
					header: new Label({ text: getResourceBundle().getText("LAYERS_PANEL_NAME_COLUMN") })

				}),
				new Column({
					minScreenWidth: "6rem",
					hAlign: Library.TextAlign.Center,
					header: new Label({ text: getResourceBundle().getText("LAYERS_PANEL_VISIBLE_COLUMN") })
				})
			],
			items: {
				path: "/",
				template: new ColumnListItem({
					vAlign: "Middle",
					cells: [
						new Label({
							text: "{name}"
						}),
						new Icon({
							src: {
								path: "",
								formatter: function(layer) {
									switch (getVisibility(layer)) {
										case VisibilityType.Hidden:
											return IconType.Hidden;
										case VisibilityType.Partial:
											return IconType.Partial;
										default:
											return IconType.Visible;
									}
								}
							},
							tooltip: {
								path: "",
								formatter: function(layer) {
									switch (getVisibility(layer)) {
										case VisibilityType.Hidden:
											return getResourceBundle().getText("LAYERS_PANEL_VISIBLE_COLUMN_HIDDEN_TOOLTIP");
										case VisibilityType.Partial:
											return getResourceBundle().getText("LAYERS_PANEL_VISIBLE_COLUMN_PARTIAL_TOOLTIP");
										default:
											return getResourceBundle().getText("LAYERS_PANEL_VISIBLE_COLUMN_VISIBLE_TOOLTIP");
									}
								}
							}
						})
					]
				})
			}
		});

		this._message = new IllustratedMessage({
			illustrationType: IllustratedMessageType.NoData,
			enableVerticalResponsiveness: true
		});

		const content = new VBox({
			height: "100%",
			renderType: FlexRendertype.Bare,
			items: [
				this._table,
				this._message
			]
		});

		this.setAggregation("content", content);

		this._scene = null;
		this._model = new JSONModel();
		this._table.setModel(this._model);
		this._skipEvent = false;
	};

	LayersPanel.prototype.exit = function() {
		this._model.destroy();
		this._model = null;

		Control.prototype.exit?.apply(this);
	};

	LayersPanel.prototype.getControl = function() {
		return this._table;
	};

	LayersPanel.prototype._refresh = function() {
		if (!this._scene || !this._manager) {
			// This method may be called indirectly from the exit method after _model is destroyed
			this._model?.setData([]);
			this._updateMessage();
			return;
		}
		// scan the tree and collect layers info
		this._initialLayerIndex = 1;
		const layers = new Map();
		this._scanTree(layers, this._scene.getRootElement());

		// get layer index info from scene metadata
		const indices = extractLayersIndex(this._scene);

		indices.forEach(function(index, name) {
			const layer = layers.get(name);
			if (layer) {
				layer.index = +index;
			}
		}, this);

		const data = layers.values().toArray();
		data.sort((a, b) => a.index - b.index);
		this._model.setSizeLimit(data.length);
		this._model.setData(data);
		this._table.setModel(this._model);

		this._updateMessage();
		this.fireContentChanged();
	};

	LayersPanel.prototype._setScene = function(scene) {
		this._scene = scene?.isECADScene() ? scene : null;
		this._refresh();
	};

	LayersPanel.prototype._addToLayer = function(layers, layerName, nodeRef) {
		let layer = layers.get(layerName);
		if (!layer) {
			layer = {
				name: layerName,
				index: this._initialLayerIndex++,
				elements: new Map(),
				hiddenElements: new Set()
			};
			layers.set(layerName, layer);
		}
		if (this._manager.getVisibilityState(nodeRef) === false) {
			layer.hiddenElements.add(nodeRef.uid);
		}
		layer.elements.set(nodeRef.uid, nodeRef);
	};

	LayersPanel.prototype._scanTree = function(layers, nodeRef) {
		const metadata = extractMetadata(nodeRef);
		if (metadata) {
			const layer = metadata.get("layer");
			if (layer) {
				this._addToLayer(layers, layer, nodeRef);
				return; // don't go further down the hierarchy
			}
		}
		nodeRef.children.forEach((child) => this._scanTree(layers, child));
	};

	LayersPanel.prototype._setContent = function(content) {
		// If there is no explicitly assigned view state manager then use the content connector's default one.
		if (content && !this.getViewStateManager()) {
			const connector = Element.getElementById(this.getContentConnector());
			if (connector) {
				const defaultManager = connector.getDefaultViewStateManager();
				if (defaultManager) {
					this.setViewStateManager(defaultManager);
				}
			}
		}
		this._setScene(content);
		return this;
	};

	LayersPanel.prototype._onContentReplaced = function(event) {
		this._setContent(event.getParameter("newContent"));
	};

	LayersPanel.prototype._updateButtons = function() {
		let canHide = false;
		let canShow = false;
		const selected = this._table.getSelectedItems();

		selected.forEach(function(item) {
			const layer = item.getBindingContext().getObject();
			const visibility = getVisibility(layer);

			if (visibility === VisibilityType.Visible) {
				canHide = true;
			} else if (visibility === VisibilityType.Hidden) {
				canShow = true;
			} else {
				canHide = canShow = true;
			}

		}, this);

		this._showButton.setEnabled(canShow);
		this._hideButton.setEnabled(canHide);
	};

	LayersPanel.prototype._onShowLayers = function() {
		const toShow = [];
		const selected = this._table.getSelectedItems();

		selected.forEach(function(item) {
			const layer = item.getBindingContext().getObject();
			if (layer.hiddenElements.size > 0) {
				layer.hiddenElements.clear();
				layer.elements.forEach(function(nodeRef) {
					toShow.push(nodeRef);
				}, this);
			}
		}, this);

		this._skipEvent = true;
		this._manager.setVisibilityState(toShow, true, true, true);
		this._model.updateBindings(true);
		this._updateButtons();
	};

	LayersPanel.prototype._onHideLayers = function() {
		const toHide = [];
		const selected = this._table.getSelectedItems();

		selected.forEach(function(item) {
			const layer = item.getBindingContext().getObject();
			if (layer.hiddenElements.size !== layer.elements.size) {
				layer.hiddenElements.clear();
				layer.elements.forEach(function(nodeRef) {
					layer.hiddenElements.add(nodeRef.uid);
					toHide.push(nodeRef);
				}, this);
			}
		}, this);
		this._skipEvent = true;
		this._manager.setVisibilityState(toHide, false, true, true);
		this._model.updateBindings(true);
		this._updateButtons();
	};

	LayersPanel.prototype._onSearch = function(query) {
		if (query !== "") {
			const selected = [];
			this._table.getItems().forEach(function(item) {
				if (item.getBindingContext().getObject().name.lastIndexOf(query) !== -1) {
					selected.push(item);
				}
			}, this);
			if (selected.length > 0) {
				this._table.removeSelections(true, false);
				selected.forEach(function(item) {
					this._table.setSelectedItem(item);
				}, this);
				this._table.fireSelectionChange({ listItems: selected });
			}
		}
	};

	LayersPanel.prototype._onVisibilityChanged = function(event) {
		if (this._skipEvent) {
			this._skipEvent = false;
			return;
		}
		const layers = this._model.getData();
		const hidden = event.getParameter("hidden");
		const visible = event.getParameter("visible");

		const process = (list, show) => {
			list.forEach(function(item) {
				const metadata = extractMetadata(item);
				const layer = metadata?.get("layer");
				if (layer) {
					const type = metadata?.get("type");
					const input = type === ElementType.Component ? [item] : [item].concat(item.children);
					input.forEach(function(ref) {
						for (let i = 0; i < layers.length; ++i) {
							if (layers[i].elements.has(ref.uid)) {
								if (show) {
									layers[i].hiddenElements.delete(ref.uid);
								} else {
									layers[i].hiddenElements.add(ref.uid);
								}
								break;
							}
						}
					});
				}
			}, this);
		};

		process(hidden, false);
		process(visible, true);

		this._model.updateBindings(true);
		this._updateButtons();
	};

	LayersPanel.prototype._updateMessage = function() {
		const hasData = this._table.getItems().length > 0;

		this._table.setVisible(hasData);
		this._message.setVisible(!hasData);
	};

	return LayersPanel;
});
