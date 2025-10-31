/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.SceneTree.
sap.ui.define([
	"./library",
	"sap/ui/core/Control",
	"sap/ui/core/Element",
	"sap/ui/table/TreeTable",
	"sap/ui/table/rowmodes/Auto",
	"sap/ui/table/Column",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Core",
	"sap/ui/core/ResizeHandler",
	"sap/m/Label",
	"sap/m/Title",
	"sap/m/SearchField",
	"sap/m/Toolbar",
	"sap/m/ToolbarLayoutData",
	"sap/m/ToolbarSpacer",
	"sap/m/Text",
	"sap/ui/core/Icon",
	"./Core",
	"./ViewStateManager",
	"./SceneTreeRenderer",
	"./getResourceBundle",
	"sap/ui/core/library",
	"sap/m/library"
], function(
	vkLibrary,
	Control,
	Element,
	TreeTable,
	RowModeAuto,
	Column,
	JSONModel,
	core,
	ResizeHandler,
	Label,
	Title,
	SearchField,
	Toolbar,
	ToolbarLayoutData,
	ToolbarSpacer,
	Text,
	Icon,
	vkCore,
	ViewStateManager,
	SceneTreeRenderer,
	getResourceBundle,
	coreLibrary,
	MLibrary
) {
	"use strict";

	/**
	 * Constructor for a new SceneTree.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class Provides a hierarchical view of all the nodes in a given scene in table format.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version 1.141.0
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.vk.SceneTree
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 * @since 1.32.0
	 */
	var SceneTree = Control.extend("sap.ui.vk.SceneTree", /** @lends sap.ui.vk.SceneTree.prototype */ {
		metadata: {
			library: "sap.ui.vk",
			properties: {
				/**
				 * Text to be displayed in title bar of scene tree
				 */
				title: {
					type: "string",
					defaultValue: getResourceBundle().getText("SCENETREE_TITLE")
				},
				/**
				 * If set to <code>False</code> then title text will not bbe displayed
				 */
				showTitle: {
					type: "boolean",
					defaultValue: true
				},
				/**
				 * Show or hide search field
				 */
				showSearchField: {
					type: "boolean",
					defaultValue: true
				},
				/**
				 * In legacy visibility mode all changes in node visibility also apply to all descendent nodes
				 */
				legacyVisibilityMode: {
					type: "boolean",
					defaultValue: false
				}
			},
			aggregations: {
				treeTable: {
					type: "sap.ui.table.TreeTable",
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
				 * This event will be fired when a scene tree content is replaced.
				 */
				contentChanged: {
					enableEventBubbling: true
				}
			}
		},

		constructor: function(sId, mSettings) {
			Control.apply(this, arguments);
			vkCore.observeAssociations(this);
		}
	});

	var iconShow = "sap-icon://show",
		iconHide = "sap-icon://hide";

	var tooltipVisible = getResourceBundle().getText("SCENETREE_VISIBILITYSTATEVISIBLE"),
		tooltipHidden = getResourceBundle().getText("SCENETREE_VISIBILITYSTATEHIDDEN");

	SceneTree.prototype._createNodeForSceneTree = function(nodeName, nodeRef, viewStateManager) {
		var nodeVisibility = viewStateManager.getVisibilityState(nodeRef);
		return {
			name: nodeName,
			id: nodeRef,
			visible: nodeVisibility
		};
	};

	// This methods is kept here for backward compatibility.
	SceneTree.prototype.setScene = function(scene, viewStateManager) {
		this.setViewStateManager(viewStateManager);
		this._setScene(scene);
	};

	SceneTree.prototype._setScene = function(scene) {
		this._scene = scene;
		this.refresh();
	};

	SceneTree.prototype.init = function() {
		if (Control.prototype.init) {
			Control.prototype.init.apply(this);
		}

		var that = this;

		this._title = new Title({
			width: "100%",
			textAlign: coreLibrary.TextAlign.Center,
			text: this.getTitle()
		});

		this._searchField = new SearchField({
			layoutData: new ToolbarLayoutData({
				shrinkable: true,
				maxWidth: "400px"
			}),
			search: function(event) {
				var query = event.getParameter("query"),
					nodeHierarchy = that._scene.getDefaultNodeHierarchy(),
					vsm = that._viewStateManager;
				if (nodeHierarchy && vsm) {
					var selected = !query ? [] : nodeHierarchy.findNodesByName({
						value: query,
						predicate: "contains"
					});
					var newSelection = new Set(selected);
					var unselected = [];
					vsm.enumerateSelection(function(nodeRef) {
						if (!newSelection.has(nodeRef)) {
							unselected.push(nodeRef);
						}
					});
					vsm.setSelectionStates(selected, unselected, false);
					that._treeItemCountText.setText(getResourceBundle().getText("SCENETREE_SELECTED_SCENE_TREE_ITEM_INFO", [selected.length]));
				}
			}
		});

		this._toolbar = new Toolbar({
			content: [
				this._title,
				new ToolbarSpacer(),
				this._searchField
			]
		});

		var visibilityColumnHeader = new Icon({
			src: iconShow,
			tooltip: tooltipVisible,
			press: function(event) {
				var visible = this.getSrc() !== iconShow;
				this.setSrc(visible ? iconShow : iconHide);
				this.setTooltip(visible ? getResourceBundle().getText("SCENETREE_VISIBILITYSTATEVISIBLEALL") : getResourceBundle().getText("SCENETREE_VISIBILITYSTATEHIDDENALL"));
				that._toggleVisibilityForAllChildren(that._model.getData(), visible);
			}
		});

		this._tree = new TreeTable({
			extension: this._toolbar,
			columnHeaderHeight: 32,
			columns: [
				new Column({
					label: new Label({
						text: getResourceBundle().getText("SCENETREE_NAME")
					}),
					tooltip: getResourceBundle().getText("SCENETREE_NAME"),
					template: new Text({
						text: "{name}",
						maxLines: 1,
						tooltip: "{name}"
					}),
					resizable: false
				}),
				new Column(this.getId() + "-visibilityColumn", {
					label: visibilityColumnHeader,
					template: new Icon({
						src: {
							path: "",
							formatter: function(object) {
								if (!object) {
									return null;
								}
								return object.visible ? iconShow : iconHide;
							}
						},
						tooltip: {
							path: "",
							formatter: function(object) {
								if (!object) {
									return null;
								}
								return object.visible ? tooltipVisible : tooltipHidden;
							}
						},
						press: function(event) {
							var context = that._tree.getContextByIndex(this.getParent().getIndex());
							var object = context ? context.getObject() : null;
							if (object) {
								that._viewStateManager.setVisibilityState(object.id, !object.visible, that.getLegacyVisibilityMode(), that.getLegacyVisibilityMode());
							}
						}
					}),
					width: "2.25em",
					resizable: false,
					hAlign: "Center"
				})
			],
			enableSelectAll: false,
			selectionMode: "MultiToggle",
			selectionBehavior: "RowSelector",
			rowMode: new RowModeAuto()
		});

		this.setAggregation("treeTable", this._tree);
		this._treeItemCountText = new Text({
			text: getResourceBundle().getText("SCENETREE_SELECTED_SCENE_TREE_ITEM_INFO", [this._tree.getSelectedIndices().length])
		}).addStyleClass("sapUiTinyMargin");
		const infoBar = new Toolbar({
			design: MLibrary.ToolbarDesign.Info,
			content: [
				this._treeItemCountText
			]
		});

		this._tree.addExtension(infoBar);

		this.attachContentChanged(function(event) {
			visibilityColumnHeader.setSrc(iconShow);
			visibilityColumnHeader.setTooltip(tooltipVisible);
		});

		this._scene = null;
		this._syncing = false;
		this._updateSelectionTimer = 0;
		this._updateVisibilityTimer = 0;

		this._model = new JSONModel();
		this._tree.setModel(this._model);
		this._tree.bindRows({
			path: "/"
		});
		this._tree.attachRowSelectionChange(this._handleRowSelectionChange.bind(this));
		this._tree.attachFirstVisibleRowChanged(this._updateSelection.bind(this));
		this._tree.getBinding("rows").attachChange(this._dataChange.bind(this));
	};

	SceneTree.prototype.setTitle = function(value) {
		this.setProperty("title", value, true);
		this._title.setText(value);
		return this;
	};

	SceneTree.prototype.setShowTitle = function(value) {
		this.setProperty("showTitle", value, true);
		this._title.setVisible(value);
		this._updateTitleBar();
		return this;
	};

	SceneTree.prototype.setShowSearchField = function(value) {
		this.setProperty("showSearchField", value, true);
		this._searchField.setVisible(value);
		this._updateTitleBar();
		return this;
	};

	SceneTree.prototype._updateTitleBar = function() {
		this._tree.removeExtension(this._toolbar);
		if (this.getShowTitle() || this.getShowSearchField()) {
			this._tree.addExtension(this._toolbar);
		}
		this._handleResize();
	};

	SceneTree.prototype.onBeforeRendering = function() {
		this._tree.setVisible(true);
		if (!this._resizeListenerId) {
			this._resizeListenerId = ResizeHandler.register(this, this._handleResize.bind(this));
		}
	};

	SceneTree.prototype._handleRowSelectionChange = function(event) {
		if (this._syncing ||
			this._tree.getBinding("rows")._aSelectedContexts != undefined /* if we hit this, it means TreeTable is trying to restore selection, ignore it */) {
			return;
		}

		var selected = [];
		var deselected = [];
		var rowIndices = event.getParameter("rowIndices");
		for (var i in rowIndices) {
			var index = rowIndices[i];
			var context = this._tree.getContextByIndex(index);
			var nodeRef = context ? context.getObject().id : null;
			if (nodeRef) {
				(this._tree.isIndexSelected(index) ? selected : deselected).push(nodeRef);
			}
		}

		this._viewStateManager.setSelectionStates(selected, deselected);
		const selectedItems = this._tree.getBinding("rows").getSelectedContexts();
		this._treeItemCountText.setText(getResourceBundle().getText("SCENETREE_SELECTED_SCENE_TREE_ITEM_INFO", [selectedItems.length]));
	};

	SceneTree.prototype._onSelectionChanged = function(event) {
		if (this._syncing) {
			return;
		}

		function isTreeNodeVisible(tree, nodeRef) {
			var rows = tree.getBinding("rows");
			if (rows) {
				for (var i = tree.getFirstVisibleRow(), l = Math.min(i + tree.getRowMode().getComputedRowCounts().count, rows.getLength()); i < l; i++) {
					var context = rows.getContextByIndex(i);
					if (context && context.getObject().id === nodeRef) {
						return true;
					}
				}
			}
			return false;
		}

		var selected = event.getParameter("selected");
		this._treeItemCountText.setText(getResourceBundle().getText("SCENETREE_SELECTED_SCENE_TREE_ITEM_INFO", [selected.length]));
		if (selected.length === 1 && !isTreeNodeVisible(this._tree, selected[0])) {
			if (this._updateSelectionTimer > 0) {
				clearTimeout(this._updateSelectionTimer);
				this._updateSelectionTimer = 0;
			}
			this._expandToNode(selected[0], this._updateSelection.bind(this));
		} else if (this._updateSelectionTimer === 0) {
			this._updateSelectionTimer = setTimeout(this._updateSelection.bind(this), 0);
		}
	};

	// Updates TreeTable visible rows selection
	SceneTree.prototype._updateSelection = function() {
		this._updateSelectionTimer = 0;

		if (this._syncing) {
			return;
		}

		this._syncing = true;

		var vsm = this._viewStateManager,
			tree = this._tree,
			rows = tree.getBinding("rows");
		if (vsm && rows) {
			for (var i = tree.getFirstVisibleRow(), l = Math.min(i + tree.getRowMode().getComputedRowCounts().count, rows.getLength()); i < l; i++) {
				var context = rows.getContextByIndex(i);
				if (context) {
					var nodeRef = context.getObject().id;
					if (nodeRef) {
						var selected = vsm.getSelectionState(nodeRef);
						if (selected != tree.isIndexSelected(i)) {
							tree[selected ? "addSelectionInterval" : "removeSelectionInterval"](i, i);
						}
					}
				}
			}
		}

		this._syncing = false;
	};

	SceneTree.prototype._expandToNode = function(nodeRef, callback) {
		var context = {
			tree: this._tree,
			rows: this._tree.getBinding("rows"),
			index: 0,
			nodeRef: nodeRef,
			ancestors: new Set(this._scene.getDefaultNodeHierarchy().getAncestors(nodeRef)),
			callback: callback
		};

		function scrollToRow(tree, index, totalRowCount) {
			var firstRow = tree.getFirstVisibleRow(),
				rowCount = tree.getRowMode().getComputedRowCounts().count;
			if ((index < firstRow) || (index >= (firstRow + rowCount))) {
				firstRow = Math.min(Math.max(index - (rowCount >> 1), 0), totalRowCount - rowCount);
				tree.setFirstVisibleRow(firstRow);
			}
		}

		function expandRows(context, event) {
			if (event && event.getParameter("reason") !== "expand") {
				return;
			}

			var totalRowCount = context.rows.getLength();
			while (context.index < totalRowCount) {
				var rowContext = context.rows.getContextByIndex(context.index);
				if (!rowContext) {
					break;
				}

				var nodeRef = rowContext.getObject().id;
				if (nodeRef === context.nodeRef) {
					scrollToRow(context.tree, context.index, totalRowCount);
					break;
				}

				if (context.ancestors.has(nodeRef) && !context.tree.isExpanded(context.index)) {
					context.tree.expand(context.index++);
					return;
				}

				context.index++;
			}

			context.rows.detachChange(context.expandHandlerProxy);
			context.callback();
		}

		context.expandHandlerProxy = expandRows.bind(this, context);
		context.rows.attachChange(context.expandHandlerProxy);
		expandRows(context);
	};

	SceneTree.prototype._dataChange = function(event) {
		var reason = event.getParameter("reason");
		if ((reason === "expand" || reason === "collapse") && this._updateSelectionTimer === 0) {
			this._updateSelectionTimer = setTimeout(this._updateSelection.bind(this), 0);
		}
	};

	SceneTree.prototype._toggleVisibilityForAllChildren = function(node, isVisible) {
		var children = node.hasOwnProperty("children") ? node.children : node;
		for (var i = 0; children[i] != null; i++) {
			this._viewStateManager.setVisibilityState(children[i].id, isVisible, true);
		}
	};

	SceneTree.prototype._onVisibilityChanged = function(event) {
		if (this._updateVisibilityTimer === 0) {
			this._updateVisibilityTimer = setTimeout(this._updateVisibility.bind(this), 0);
		}
	};

	SceneTree.prototype._updateVisibility = function() {
		this._updateVisibilityTimer = 0;
		this._getNodeVisibilityRecursive(this._model.getData());
		this._tree.getModel().refresh(true);
	};

	SceneTree.prototype._getNodeVisibilityRecursive = function(node) {
		if (node.id != null) {
			node.visible = this._viewStateManager.getVisibilityState(node.id);
		}

		var children = node.hasOwnProperty("children") ? node.children : node;
		for (var i = 0; children[i] != null; i++) {
			this._getNodeVisibilityRecursive(children[i]);
		}
	};

	SceneTree.prototype._handleResize = function(event) {
		this._updateSelection();
	};

	SceneTree.prototype.refresh = function() {
		const nodeHierarchy = this._scene?.getDefaultNodeHierarchy?.();
		if (!nodeHierarchy || !this._viewStateManager?.getNodeHierarchy()) {
			this._model.setData([]);
			return;
		}

		// building the tree model which is going to be passed to the TreeTable control.
		var tree = [];
		var getChildrenRecursively = function(tree, nodeRefs) {
			nodeRefs.forEach(function(nodeRef) {
				if (nodeRef.userData && nodeRef.userData.skipIt) {
					getChildrenRecursively(tree, nodeHierarchy.getChildren(nodeRef));
				} else {
					var node = nodeHierarchy.createNodeProxy(nodeRef);
					var treeNode = this._createNodeForSceneTree(node.getName(), node.getNodeRef(), this._viewStateManager);
					tree.push(treeNode);
					nodeHierarchy.destroyNodeProxy(node);
					treeNode.children = [];
					getChildrenRecursively(treeNode.children, nodeHierarchy.getChildren(nodeRef));
				}
			}.bind(this));
		}.bind(this);
		getChildrenRecursively(tree, nodeHierarchy.getChildren());

		// set the object that we've just built as data model for the TreeTable control
		this._model.setData(tree);
		this._tree.setModel(this._model);
		this._tree.bindRows({
			path: "/",
			parameters: {
				arrayNames: ["children"]
			}
		});
		this._tree.getBinding("rows").attachChange(this._dataChange.bind(this));

		this.fireContentChanged();
	};

	////////////////////////////////////////////////////////////////////////
	// Content connector and view state manager handling begins.

	SceneTree.prototype.onSetViewStateManager = function(viewStateManager) {
		this._viewStateManager = viewStateManager;
		viewStateManager.attachNodeHierarchyReplaced(this._onNodeHierarchyReplaced, this);
		viewStateManager.attachSelectionChanged(this._onSelectionChanged, this);
		viewStateManager.attachVisibilityChanged(this._onVisibilityChanged, this);
		this.refresh();
	};

	SceneTree.prototype.onUnsetViewStateManager = function(viewStateManager) {
		this._viewStateManager = null;
		viewStateManager.detachVisibilityChanged(this._onVisibilityChanged, this);
		viewStateManager.detachSelectionChanged(this._onSelectionChanged, this);
		viewStateManager.detachNodeHierarchyReplaced(this._onNodeHierarchyReplaced, this);
		this.refresh();
	};

	SceneTree.prototype._onNodeHierarchyReplaced = function(event) {
		this.refresh();
	};

	// Content connector and view state manager handling ends.
	////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////
	// Scene handling begins.

	SceneTree.prototype._setContent = function(content) {
		// If there is no explicitly assigned view state manager then use the content connector's default one.
		if (content && !this.getViewStateManager()) {
			var contentConnector = Element.getElementById(this.getContentConnector());
			if (contentConnector) {
				var defaultViewStateManager = contentConnector.getDefaultViewStateManager();
				if (defaultViewStateManager) {
					this.setViewStateManager(defaultViewStateManager);
				}
			}
		}

		this._setScene(content);

		return this;
	};

	SceneTree.prototype.onSetContentConnector = function(contentConnector) {
		contentConnector.attachContentReplaced(this._onContentReplaced, this);
		contentConnector.attachContentChangesFinished(this._onContentChangesFinished, this);
		this._setContent(contentConnector.getContent());
	};

	SceneTree.prototype.onUnsetContentConnector = function(contentConnector) {
		this._setContent(null);
		contentConnector.detachContentChangesFinished(this._onContentChangesFinished, this);
		contentConnector.detachContentReplaced(this._onContentReplaced, this);
	};

	SceneTree.prototype._onContentReplaced = function(event) {
		this._setContent(event.getParameter("newContent"));
	};

	SceneTree.prototype._onContentChangesFinished = function(event) {
		this.refresh();
	};

	// Scene handling ends.
	////////////////////////////////////////////////////////////////////////

	return SceneTree;
});
