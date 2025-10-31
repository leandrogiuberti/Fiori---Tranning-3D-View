/*!
* SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
*/

// Provides the ViewStateManager class.
sap.ui.define([
	"sap/base/assert",
	"../Core",
	"../ViewStateManagerBase",
	"../thirdparty/three",
	"../cssColorToColor",
	"../colorToCSSColor",
	"../abgrToColor",
	"../colorToABGR",
	"./Scene",
	"../ObjectType",
	"../RotationType",
	"./HighlightPlayer",
	"../HighlightDisplayState",
	"../Highlight",
	"../AnimationTrackType",
	"../AnimationTrackValueType",
	"../AnimationMath",
	"../NodeContentType",
	"./ThreeUtils",
	"sap/ui/base/DataType",
	"../TransformationMatrix",
	"sap/ui/core/Element"
], function(
	assert,
	vkCore,
	ViewStateManagerBase,
	THREE,
	cssColorToColor,
	colorToCSSColor,
	abgrToColor,
	colorToABGR,
	Scene,
	ObjectType,
	RotationType,
	HighlightPlayer,
	HighlightDisplayState,
	Highlight,
	AnimationTrackType,
	AnimationTrackValueType,
	AnimationMath,
	NodeContentType,
	ThreeUtils,
	DataType,
	TransformationMatrix,
	Element
) {
	"use strict";

	var VisibilityTracker;

	class MaterialCache {
		cloneMaterial(material, nodeState) {
			// TODO: a proper implementation required.
			const materialClone = material.clone();
			materialClone.userData.prototypeMaterial = material;
			return materialClone;
		}

		releaseMaterial(material) {
			// TODO: a proper implementation required.
			ThreeUtils.disposeMaterial(material);
			return this;
		}
	}

	/**
	 * Constructor for a new ViewStateManager.
	 *
	 * @class
	 * Manages the visibility, selection, opacity and tint color states of nodes in the scene.
	 *
	 * @param {string} [sId] ID for the new ViewStateManager object. Generated automatically if no ID is given.
	 * @param {object} [mSettings] Initial settings for the new ViewStateManager object.
	 * @public
	 * @author SAP SE
	 * @version 1.141.0
	 * @extends sap.ui.vk.ViewStateManagerBase
	 * @alias sap.ui.vk.threejs.ViewStateManager
	 * @since 1.32.0
	 */
	var ViewStateManager = ViewStateManagerBase.extend("sap.ui.vk.threejs.ViewStateManager", /** @lends sap.ui.vk.threejs.ViewStateManager.prototype */ {
		metadata: {
			library: "sap.ui.vk"
		}
	});

	var basePrototype = ViewStateManager.getMetadata().getParent().getClass().prototype;

	ViewStateManager.prototype.init = function() {
		basePrototype.init?.call(this);

		this._nodeHierarchy = null;

		// A map where `key` is `nodeRef` and `value` is a structure:
		//
		// type NodeState {
		//   visible?: bool
		//   selected: bool
		//   ancestorSelected: bool
		//   opacity?: number                       // floating number in range [0, 1]
		//   ancestorOverridesOpacity: bool
		//   tintColor?: int                        // tint color in ABGR format
		//   ancestorTintColor?: int                // tint color of ancestor in ABGR format
		//   highlightColor?: float[]               // highlight color in [r, g, b, a] format (this is an animated highlight, do not confuse it with selection highlight)
		//   ancestorHighlightColor?: float[]       // highlight color of ancestor in [r, g, b, a] format
		//   boundingBoxNode?: THREE.Box3Helper     // assigned if selected; ancestorSelected does not affect this property
		//   material?: THREE.MeshPhongMaterial     // if selected or ancestorSelected or opacity != null or
		//                                          // tintColor != null or ancestorTintColor != null or
		//                                          // highlightColor != null or ancestorHighlightColor != null
		//   material2?: THREE.MeshPhongMaterial    // if opacity != null or tintColor != null or ancestorTintColor != null or
		//                                          // highlightColor != null or ancestorHighlightColor != null
		// }
		//
		// If a NodeState property is `null`, `undefined` or missing then the property original
		// value is taken from the node itself.
		//
		// The `selected` cannot have value `null` as it is a non-persistent runtime property.
		this._nodeStates = new Map();

		// A collection of selected nodes for quick access, usually there are not many selected objects, so it is OK to
		// store them in a collection.
		this._selectedNodes = new Set();

		// A set of nodes which needs to update material
		this._needsMaterialUpdate = new Set();

		// usually there are not many selected objects,
		// so it is OK to store them in a collection.
		this._outlinedNodes = new Set();
		this.setOutlineColor("rgba(255, 0, 255, 1.0)");
		this.setOutlineWidth(1.0);

		this._materialCache = new MaterialCache();

		this._showSelectionBoundingBox = true;

		this._visibilityTracker = new VisibilityTracker();

		// This scene owns and renders boxHelper objects for selected objects. Though the scene owns
		// boxHelpers, the `parent` properties of the boxHelpers are set to the corresponding nodes
		// rather than to this scene as those nodes are used to calculate the world matrices of theOpa
		// boxHelpers.
		this._boundingBoxesScene = new THREE.Scene();
		this._selectedNodesBoundingBox = new THREE.Box3();
		this._boundingBoxColor = new THREE.Color(0xC0C000);

		this.setHighlightColor("rgba(255, 0, 0, 1.0)");

		this._joints = [];

		this._highlightPlayer = new HighlightPlayer();
		this._highlightPlayer.setViewStateManager(this);
		this._transitionPlayer = new HighlightPlayer();
		this._transitionPlayer.setViewStateManager(this);

		vkCore.getEventBus().subscribe("sap.ui.vk", "activateView", this._onActivateView, this);
	};

	ViewStateManager.prototype._clearBoundingBoxScene = function() {
		var all3DNodes = [];
		var allGroupNodes = [];

		ThreeUtils.getAllTHREENodes([this._boundingBoxesScene], all3DNodes, allGroupNodes);
		all3DNodes.forEach(function(n3d) {
			ThreeUtils.disposeObject(n3d);
			// TODO: does not seem to be necessary as bounding boxes are owned by
			// `_boundingBoxesScene` and they are not in `n3d.parent.children` arrays.
			n3d.parent.remove(n3d);
		});

		allGroupNodes.forEach(function(g3d) {
			// TODO: see the comment above.
			g3d.parent.remove(g3d);
		});
	};

	ViewStateManager.prototype._clearNodeStates = function() {
		var nodeStates = this._nodeStates;

		nodeStates.forEach(function(state, nodeRef) {
			if (state.material != null) {
				ThreeUtils.disposeMaterial(state.material);
			}

			if (state.material2 != null) {
				ThreeUtils.disposeMaterial(state.material2);
			}

			if (state.boundingBoxNode) {
				ThreeUtils.disposeObject(state.boundingBoxNode);
			}
		}, this);

		nodeStates.clear();
	};

	ViewStateManager.prototype.exit = function() {
		vkCore.getEventBus().unsubscribe("sap.ui.vk", "activateView", this._onActivateView, this);

		this._clearNodeStates();
		this._selectedNodes.clear();

		this._outlinedNodes.clear();

		if (this._boundingBoxesScene) {
			this._clearBoundingBoxScene();
			this._boundingBoxesScene = null;
		}

		this._nodeHierarchy = null;

		basePrototype.exit?.call(this);
	};

	////////////////////////////////////////////////////////////////////////
	// Content connector handling begins.

	// Overridden sap.ui.vk.ViewStateManagerBase#_setContent.
	ViewStateManager.prototype._setContent = function(content) {
		if (content === this._scene) {
			return this;
		}

		var scene = null;
		if (content && content instanceof Scene) {
			scene = content;
		}
		this._setScene(scene);

		if (scene) {
			var initialView = scene.getInitialView();
			if (initialView) {
				this._currentView = initialView;
				this._resetNodesMaterialAndOpacityByCurrentView(this._currentView);
			}
		}

		return this;
	};

	// Content connector handling ends.
	////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////
	// Node hierarchy handling begins.

	ViewStateManager.prototype._setScene = function(scene) {
		this._clearNodeStates();

		// TODO(VSM): Move this to _clearNodeStates.
		if (this._boundingBoxesScene) {
			this._clearBoundingBoxScene();
		}
		// TODO(VSM): Move this to _setNodeHierarchy?
		this._boundingBoxesScene = new THREE.Scene();
		this._setNodeHierarchy(scene ? scene.getDefaultNodeHierarchy() : null);

		// TODO(VSM): WTF?! Remove this!
		if (scene) {
			scene.setViewStateManager(this);
		}
		this._scene = scene;

		if (this._scene) {
			var initialView = this._scene.getInitialView();
			if (initialView) {
				this.activateView(initialView);
			}
		}
		return this;
	};

	// TODO(VSM): Move the body to _setScene?
	ViewStateManager.prototype._setNodeHierarchy = function(nodeHierarchy) {
		var oldNodeHierarchy = this._nodeHierarchy;

		if (this._nodeHierarchy) {
			this._nodeHierarchy.detachNodeReplaced(this._handleNodeReplaced, this);
			this._nodeHierarchy.detachNodeUpdated(this._handleNodeUpdated, this);
			this._nodeHierarchy.detachNodeRemoving(this._handleNodeRemoving, this);
			this._nodeHierarchy = null;
			this._clearNodeStates();
			this._selectedNodes.clear();
			this._outlinedNodes.clear();
			this._visibilityTracker.clear();
		}

		if (nodeHierarchy) {
			this._nodeHierarchy = nodeHierarchy;

			this._nodeHierarchy.attachNodeReplaced(this._handleNodeReplaced, this);
			this._nodeHierarchy.attachNodeUpdated(this._handleNodeUpdated, this);
			this._nodeHierarchy.attachNodeRemoving(this._handleNodeRemoving, this);

			const visible = [];
			const hidden = [];
			nodeHierarchy.getSceneRef().traverse(function(nodeRef) {
				(nodeRef.visible ? visible : hidden).push(nodeRef);
			});

			this.fireVisibilityChanged({
				visible: visible,
				hidden: hidden
			});
		}

		if (nodeHierarchy !== oldNodeHierarchy) {
			this.fireNodeHierarchyReplaced({
				oldNodeHierarchy: oldNodeHierarchy,
				newNodeHierarchy: nodeHierarchy
			});
		}

		return this;
	};

	ViewStateManager.prototype._getJointByChildNode = function(nodeRef) {
		var joint;
		if (this._jointCollection) {
			for (var i = 0; i < this._jointCollection.length; i++) {
				if (this._jointCollection[i].node === nodeRef) {
					joint = this._jointCollection[i];
					break;
				}
			}
		}
		return joint;
	};

	ViewStateManager.prototype._handleNodeReplaced = function(event) {
		var replacedNodeRef = event.getParameter("ReplacedNodeRef");
		var replacementNodeRef = event.getParameter("ReplacementNodeRef");

		if (this.getSelectionState(replacedNodeRef)) {
			this.setSelectionStates(replacementNodeRef, replacedNodeRef);
		}
	};

	ViewStateManager.prototype._handleNodeUpdated = function(event) {
		var nodeRef = event.getParameter("nodeRef");

		if (this.getSelectionState(nodeRef)) {
			// Just refresh selection by deselecting and selecting the same node again
			this.setSelectionStates([], nodeRef);
			this.setSelectionStates(nodeRef, []);
		}
	};

	ViewStateManager.prototype._handleNodeRemoving = function(event) {
		var nodeRef = event.getParameter("nodeRef");

		if (this._jointCollection) {
			for (var i = 0; i < this._jointCollection.length; i++) {
				if (this._jointCollection[i].node === nodeRef) {
					this._jointCollection[i].node = null;
					break;
				}

				if (this._jointCollection[i].parent === nodeRef) {
					this._jointCollection[i].parent = null;
					break;
				}
			}
		}
		// Node is removed from node hierarchy, remove it from list of selected nodes
		if (this.getSelectionState(nodeRef)) {
			// Since this node is already removed from the scene don't send notification
			this.setSelectionStates([], nodeRef, true, true);
		}
	};

	// Node hierarchy handling ends.
	////////////////////////////////////////////////////////////////////////

	/**
	 * Gets the NodeHierarchy object associated with this ViewStateManager object.
	 * @returns {sap.ui.vk.NodeHierarchy} The node hierarchy associated with this ViewStateManager object.
	 * @public
	 */
	ViewStateManager.prototype.getNodeHierarchy = function() {
		return this._nodeHierarchy;
	};

	/**
	 * Gets the visibility changes in the current ViewStateManager object.
	 * @returns {string[]} The visibility changes are in the form of an array. The array is a list of node VE ids which suffered a visibility changed relative to the default state.
	 * @public
	 */
	ViewStateManager.prototype.getVisibilityChanges = function() {
		return this.getShouldTrackVisibilityChanges() ? this._visibilityTracker.getInfo(this.getNodeHierarchy()) : null;
	};

	ViewStateManager.prototype.getCurrentView = function() {
		var viewManager = Element.getElementById(this.getViewManager());
		if (!viewManager) {
			return null;
		}

		var currentView = viewManager.getActiveView();
		return currentView;
	};

	/**
	 * Reset node property to the value defined by current view..
	 *
	 * @param {object} nodeRef reference to node.
	 * @param {string} property node property
	 * @public
	 */
	ViewStateManager.prototype.resetNodeProperty = function(nodeRef, property) {
		const nodeInfo = this.getCurrentView()?.getNodeInfos();

		if (nodeInfo) {

			var nodes = [];
			nodes.push(nodeRef);
			if (this._jointCollection && this._jointCollection.length > 0) {

				for (var ji = 0; ji < this._jointCollection.length; ji++) {
					var joint = this._jointCollection[ji];
					if (!joint.node || !joint.parent) {
						continue;
					}
					var parent = joint.parent;
					if (parent !== nodeRef) {
						break;
					}
					nodes.push(joint.node);
				}
			}

			nodeInfo.forEach(function(node) {

				if (!nodes.includes(node.target)) {
					return;
				}

				if (!property || property !== AnimationTrackType.Opacity) {

					var transforms = {
						nodeRefs: [],
						positions: []
					};

					var newPosition;
					var newRotation;
					var newScale;

					if (node.transform) {
						var position = new THREE.Vector3();
						var rotation = new THREE.Quaternion();
						var scale = new THREE.Vector3();
						var newMatrix = arrayToMatrixThree(node.transform);
						newMatrix.decompose(position, rotation, scale);
						newPosition = position.toArray();
						newRotation = rotation.toArray();
						newScale = scale.toArray();
					} else if (node[AnimationTrackType.Scale] && node[AnimationTrackType.Rotate] && node[AnimationTrackType.Translate]) {
						newPosition = node[AnimationTrackType.Translate].slice();
						newRotation = node[AnimationTrackType.Rotate].slice();
						newScale = node[AnimationTrackType.Scale].slice();
					}

					if (newPosition) {
						transforms.nodeRefs.push(node.target);
						transforms.positions.push({
							translation: newPosition,
							quaternion: newRotation,
							scale: newScale
						});

						this.setTransformation(transforms.nodeRefs, transforms.positions);
					}
				} else {
					this.setOpacity(nodeRef, node.opacity);
					var eventParameters = {
						changed: nodeRef,
						opacity: nodeInfo.opacity
					};

					this.fireOpacityChanged(eventParameters);
				}
			}, this);
		}
	};

	ViewStateManager.prototype.getVisibilityComplete = function() {
		var nodeHierarchy = this.getNodeHierarchy(),
			allNodeRefs = nodeHierarchy.findNodesByName(),
			visible = [],
			hidden = [];

		allNodeRefs.forEach(function(nodeRef) {
			// create node proxy based on dynamic node reference
			var nodeProxy = nodeHierarchy.createNodeProxy(nodeRef);
			var veId = nodeProxy.getVeId();
			// destroy the node proxy
			nodeHierarchy.destroyNodeProxy(nodeProxy);
			if (veId) {
				// push the ve id to either visible/hidden array
				if (this.getVisibilityState(nodeRef)) {
					visible.push(veId);
				} else {
					hidden.push(veId);
				}
			}
		}, this);

		return { visible, hidden };
	};

	ViewStateManager.prototype.resetVisibility = function() {
		const toShow = [];
		const toHide = [];
		this._nodeStates.forEach(function(state, nodeRef) {
			const visible = state.visible;
			if (visible === true) {
				toHide.push(nodeRef);
			} else if (visible === false) {
				toShow.push(nodeRef);
			}
			state.visible = null;
		});
		this._deleteUnusedNodeStates();

		this._visibilityTracker.clear();
		this.fireVisibilityChanged({
			visible: toShow,
			hidden: toHide
		});
		return this;
	};

	/**
	 * Gets the visibility state of nodes.
	 *
	 * If a single node is passed to the method then a single visibility state is returned.<br/>
	 * If an array of nodes is passed to the method then an array of visibility states is returned.
	 *
	 * @param {any|any[]} nodeRefs The node reference or the array of node references.
	 * @returns {boolean|boolean[]} A single value or an array of values where the value is <code>true</code> if the node is visible, <code>false</code> otherwise.
	 * @public
	 */
	ViewStateManager.prototype.getVisibilityState = function(nodeRefs) {
		if (Array.isArray(nodeRefs)) {
			return nodeRefs.map(nodeRef => effectiveVisibility(nodeRef, this._nodeStates.get(nodeRef)));
		} else {
			return effectiveVisibility(nodeRefs, this._nodeStates.get(nodeRefs));
		}
	};

	/**
	 * Sets the visibility state of the nodes.
	 * @param {any|any[]}         nodeRefs  The node reference or the array of node references.
	 * @param {boolean|boolean[]} visible   The new visibility state or array of states of the nodes.
	 * @param {boolean}           recursive The flags indicates if the change needs to propagate recursively to child nodes.
	 * @param {boolean}           force     If a node is made visible but its parent is hidden then it will still be
	 *                                      hidden in Viewport. This flag will force node to be visible regardless of
	 *                                      parent's state.
	 * @returns {this} Returns <code>this</code> to allow method chaining
	 * @public
	 */
	ViewStateManager.prototype.setVisibilityState = function(nodeRefs, visible, recursive, force) {
		// normalize parameters to have array of nodeRefs and array of visibility values
		if (!Array.isArray(nodeRefs)) {
			nodeRefs = [nodeRefs];
		}
		// console.log("setVisibilityState", nodeRefs.map(n => n.id + ":" + (n.name || ("<" + n.parent?.name))), visible, recursive, force);

		// check if we have got an array of booleans as visibility change
		var isBulkChange = Array.isArray(visible);

		var recursiveVisibilities = [];
		var allNodeRefs = nodeRefs;

		if (recursive) {
			allNodeRefs = [];
			nodeRefs.forEach(function(nodeRef, index) {
				var collected = this._collectNodesRecursively(nodeRef);
				allNodeRefs = allNodeRefs.concat(collected);

				var length = recursiveVisibilities.length;
				recursiveVisibilities.length += collected.length;
				recursiveVisibilities.fill(isBulkChange ? visible[index] : visible, length);
			}, this);
		} else if (!isBulkChange) {
			// not recursive, visible is a scalar
			recursiveVisibilities.length = allNodeRefs.length;
			recursiveVisibilities.fill(visible);
		} else {
			// not recursive, visible is an array
			recursiveVisibilities = visible;
		}

		if (force) {
			// We use `force` when we un-hide the parents of the un-hidden node recursively up the tree. Extend the
			// array of changed nodes with these ancestors. If they are already visible or there are duplicates they
			// will be filtered out below.
			var additionalNodeRefs = [];
			allNodeRefs.forEach(function(nodeRef, index) {
				var newVisibility = recursiveVisibilities[index];
				if (newVisibility) {
					for (var node = nodeRef; node && !node.isScene; node = node.parent) {
						additionalNodeRefs.push(node);
					}
				}
			});
			allNodeRefs = allNodeRefs.concat(additionalNodeRefs);
			var length = recursiveVisibilities.length;
			recursiveVisibilities.length += additionalNodeRefs.length;
			recursiveVisibilities.fill(true, length);
		}

		// filter out unchanged visibility and duplicate nodes
		var changedVisibility = [];
		var usedNodeRefs = new Set();
		var changedNodeRefs = allNodeRefs.filter(function(nodeRef, index) {
			if (nodeRef == null || nodeRef.userData.skipIt || usedNodeRefs.has(nodeRef)) {
				return false;
			}

			usedNodeRefs.add(nodeRef);

			const state = this._nodeStates.get(nodeRef);
			var oldVisibility = effectiveVisibility(nodeRef, state);
			var newVisibility = recursiveVisibilities[index];

			var changed = oldVisibility !== newVisibility;
			if (changed) {
				changedVisibility.push(newVisibility);
			}

			return changed;
		}, this);

		if (changedNodeRefs.length > 0) {
			this._applyVisibilityNodeState(changedNodeRefs, changedVisibility);
			this._deleteUnusedNodeStates();

			var eventParameters = {
				visible: [],
				hidden: []
			};

			changedNodeRefs.forEach(function(nodeRef, index) {
				eventParameters[changedVisibility[index] ? "visible" : "hidden"].push(nodeRef);
			});

			if (this.getShouldTrackVisibilityChanges()) {
				changedNodeRefs.forEach(this._visibilityTracker.trackNodeRef, this._visibilityTracker);
			}

			this.fireVisibilityChanged(eventParameters);
		}
		return this;
	};

	/**
	 * Enumerates IDs of the selected nodes.
	 *
	 * @param {function} callback A function to call when the selected nodes are enumerated. The function takes one parameter of type <code>string</code>.
	 * @returns {this} Returns <code>this</code> to allow method chaining
	 * @public
	 */
	ViewStateManager.prototype.enumerateSelection = function(callback) {
		this._selectedNodes.forEach(callback);
		return this;
	};

	/**
	 * Enumerates IDs of the outlined nodes.
	 *
	 * @param {function} callback A function to call when the outlined nodes are enumerated. The function takes one parameter of type <code>string</code>.
	 * @returns {this} Returns <code>this</code> to allow method chaining
	 * @public
	 */
	ViewStateManager.prototype.enumerateOutlinedNodes = function(callback) {
		this._outlinedNodes.forEach(callback);
		return this;
	};

	/**
	 * Gets the selection state of the node.
	 *
	 * If a single node reference is passed to the method then a single selection state is returned.<br/>
	 * If an array of node references is passed to the method then an array of selection states is returned.
	 *
	 * @param {any|any[]} nodeRefs The node reference or the array of node references.
	 * @returns {boolean|boolean[]} A single value or an array of values where the value is <code>true</code> if the node is selected, <code>false</code> otherwise.
	 * @public
	 */
	ViewStateManager.prototype.getSelectionState = function(nodeRefs) {
		const selected = this._selectedNodes.has.bind(this._selectedNodes);

		return Array.isArray(nodeRefs) ? nodeRefs.map(selected) : selected(nodeRefs); // NB: The nodeRefs argument is a single nodeRef.
	};

	ViewStateManager.prototype._getSelectionComplete = function() {
		var nodeHierarchy = this.getNodeHierarchy(),
			selected = [],
			outlined = [];

		function getVeId(nodeRef) {
			var nodeProxy = nodeHierarchy.createNodeProxy(nodeRef); // create node proxy based on dynamic node reference
			var veId = nodeProxy.getVeId();
			nodeHierarchy.destroyNodeProxy(nodeProxy); // destroy the node proxy
			return veId;
		}

		this._selectedNodes.forEach(function(nodeRef) {
			var veId = getVeId(nodeRef);
			if (veId) {
				selected.push(veId);
			}
		});

		this._outlinedNodes.forEach(function(nodeRef) {
			var veId = getVeId(nodeRef);
			if (veId) {
				outlined.push(veId);
			}
		});

		return {
			selected: selected,
			outlined: outlined
		};
	};

	ViewStateManager.prototype._addBoundingBox = function(nodeRef) {
		nodeRef._vkCalculateObjectOrientedBoundingBox();
	};

	ViewStateManager.prototype._removeBoundingBox = function(nodeRef) {
		delete nodeRef.userData.boundingBox;
	};

	ViewStateManager.prototype._expandBoundingBoxWithSelected = function(boundingBox) {
		if (!this._selectedNodesBoundingBox.isEmpty()) {
			boundingBox.union(this._selectedNodesBoundingBox);
		}
	};

	ViewStateManager.prototype._updateBoundingBoxes = function() {
		var bbox;
		var pos = new THREE.Vector3();
		var scl = new THREE.Vector3();
		var identityQuat = new THREE.Quaternion();
		var matrix = new THREE.Matrix4();
		var i, elements;

		this._selectedNodesBoundingBox.makeEmpty();

		// build arrays of per-selection bbox data
		var matrices = null;
		var count = this._selectedNodes.size;
		if (count > 0) {
			matrices = new Float32Array(count * 16);
			count = 0;

			this._selectedNodes.forEach(function(nodeRef) {
				nodeRef._vkCalculateObjectOrientedBoundingBox();
				bbox = nodeRef.userData.boundingBox;
				if (bbox && !bbox.isEmpty()) {
					bbox.getCenter(pos);
					bbox.getSize(scl);
					scl.multiplyScalar(0.5);
					matrix.compose(pos, identityQuat, scl);
					matrix.premultiply(nodeRef.matrixWorld);
					elements = matrix.elements;
					for (i = 0; i < 16; ++i) {
						matrices[count++] = elements[i];
					}

					// compute the combined bounding box of all selected nodes
					for (i = 0; i < 8; ++i) {
						pos.x = (i & 1) > 0 ? 1 : -1;
						pos.y = (i & 2) > 0 ? 1 : -1;
						pos.z = (i & 4) > 0 ? 1 : -1;
						pos.applyMatrix4(matrix);
						this._selectedNodesBoundingBox.expandByPoint(pos);
					}
				}
			}, this);

			if (count !== matrices.length) {
				// looks like some bboxes were empty in the loop above
				matrices = matrices.slice(0, count);
			}
		}

		var object = (this._boundingBoxesScene.children.length > 0) ? this._boundingBoxesScene.children[0] : null;
		var deleteObject = false;
		var createObject = false;

		if (count > 0) {
			if (!object) {
				createObject = true;
			} else {
				var itm = object.geometry.attributes.itm;
				if (count === itm.array.length) {
					// same size - perhaps no update is required?
					elements = itm.array;
					for (i = 0; i < count; ++i) {
						if (matrices[i] !== elements[i]) {
							itm.set(matrices);
							itm.version++;
							break;
						}
					}
				} else {
					deleteObject = true;
					createObject = true;
				}
			}
		} else if (object) {
			deleteObject = true;
		}

		var mtl = null;
		if (deleteObject) {
			if (createObject) {
				// no need to delete and then re-create the material again
				mtl = object.material;
			}

			this._boundingBoxesScene.remove(object);
			ThreeUtils.disposeObject(object);
			object = null;
		}

		if (createObject) {
			if (!mtl) {
				mtl = new THREE.LineBasicMaterial({
					color: this._boundingBoxColor,
					onBeforeCompile: function(shader) {
						shader.vertexShader = ("attribute mat4 itm;\n" + shader.vertexShader).replace(
							"#include <begin_vertex>",
							"#include <begin_vertex>\ntransformed = (itm * vec4(transformed, 1.0)).xyz;\n");
					}
				});
			}

			var geom = new THREE.InstancedBufferGeometry();
			geom.setIndex(new THREE.BufferAttribute(new Uint16Array([0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7]), 1));
			geom.setAttribute("position", new THREE.Float32BufferAttribute([1, 1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1, 1, 1, -1, -1, 1, -1, -1, -1, -1, 1, -1, -1], 3));
			geom.setAttribute("itm", new THREE.InstancedBufferAttribute(matrices, 16));

			object = new THREE.LineSegments(geom, mtl);
			object.frustumCulled = false;
			this._boundingBoxesScene.add(object);
		}
	};

	/**
	 * Sets if showing the bounding box when nodes are selected
	 *
	 * @param {boolean} val <code>true</code> if bounding boxes of selected nodes are shown, <code>false</code> otherwise.
	 * @public
	 */
	ViewStateManager.prototype.setShowSelectionBoundingBox = function(val) {
		this._showSelectionBoundingBox = val;
		this._selectedNodes.forEach(val ? this._addBoundingBox : this._removeBoundingBox, this);
	};

	/**
	 * Gets if showing the bounding box when nodes are selected
	 *
	 * @returns {boolean} <code>true</code> if bounding boxes of selected nodes are shown, <code>false</code> otherwise.
	 * @public
	 */
	ViewStateManager.prototype.getShowSelectionBoundingBox = function() {
		return this._showSelectionBoundingBox;
	};

	/**
	 * Sets the selection state of the nodes.
	 * @param {any|any[]} nodeRefs The node reference or the array of node references.
	 * @param {boolean} selected The new selection state of the nodes.
	 * @param {boolean} recursive The flags indicates if the change needs to propagate recursively to child nodes.
	 * @param {boolean} blockNotification The flag to suppress selectionChanged event.
	 * @returns {this} Returns <code>this</code> to allow method chaining
	 * @deprecated Since version 1.56.3. Use {@link sap.ui.vk.threejs.ViewStateManager#setSelectionStates} instead.
	 * @public
	 */
	ViewStateManager.prototype.setSelectionState = function(nodeRefs, selected, recursive, blockNotification) {
		if (!Array.isArray(nodeRefs)) {
			nodeRefs = [nodeRefs];
		}

		// First, extend `nodeRefs` with descendant nodes based on parameter `recursive` or property `recursiveSelection`.
		nodeRefs = (recursive || this.getRecursiveSelection() ? this._collectNodesRecursively(nodeRefs) : nodeRefs)
			.filter(function(value, index, array) {
				return array.indexOf(value) === index;
			});

		// Then, extend `nodeRefs` with ancestors of nodes being unselected if the
		// `recursiveSelection` property (but not necessarily the `recursive` parameter) is `true`.
		if (this.getRecursiveSelection() && !selected) {
			// E.g. if we deselect node D1 while the `recursiveSelection` property is `true` we
			// deselect its ancestors C and B recursively. Nodes E and F are unselected previously,
			// see the code above.
			//
			// The siblings stay as is.
			//
			// [ ] A                  [ ] A
			//    [x] B                  [ ] B
			//       [X] C         ->       [ ] C
			//          [X] *D1*               [ ] *D1*
			//             [X] E                 [ ] E
			//               [X] F                 [ ] F
			//          [X] D2                 [X] D2
			//          [X] D3                 [X] D3
			nodeRefs = this._nodeHierarchy._appendAncestors(nodeRefs);
		}

		const selectedNodes = this._selectedNodes;

		// These are the nodes whose selection state changed.
		const changed = nodeRefs.filter(nodeRef => selectedNodes.has(nodeRef) !== selected);

		if (changed.length > 0) {
			this._applySelectionNodeState(changed, selected);

			if (!selected) {
				this._deleteUnusedNodeStates();
			}

			if (!blockNotification) {
				this.fireSelectionChanged({
					selected: selected ? changed : [],
					unselected: selected ? [] : changed
				});
			}
		}

		return this;
	};

	/**
	 * Sets or resets the selection state of the nodes.
	 * @param {any|any[]} selectedNodeRefs The node reference or the array of node references of selected nodes.
	 * @param {any|any[]} unselectedNodeRefs The node reference or the array of node references of unselected nodes.
	 * @param {boolean} recursive The flags indicates if the change needs to propagate recursively to child nodes.
	 * @param {boolean} blockNotification The flag to suppress selectionChanged event.
	 * @returns {this} Returns <code>this</code> to allow method chaining
	 * @public
	 */
	ViewStateManager.prototype.setSelectionStates = function(selectedNodeRefs, unselectedNodeRefs, recursive, blockNotification) {
		if (!Array.isArray(selectedNodeRefs)) {
			selectedNodeRefs = [selectedNodeRefs];
		}

		if (!Array.isArray(unselectedNodeRefs)) {
			unselectedNodeRefs = [unselectedNodeRefs];
		}

		selectedNodeRefs = (recursive || this.getRecursiveSelection() ? this._collectNodesRecursively(selectedNodeRefs) : selectedNodeRefs);
		unselectedNodeRefs = (recursive || this.getRecursiveSelection() ? this._collectNodesRecursively(unselectedNodeRefs) : unselectedNodeRefs);

		if (this.getRecursiveSelection()) {
			unselectedNodeRefs = this._nodeHierarchy._appendAncestors(unselectedNodeRefs, selectedNodeRefs);
		}

		var selected = selectedNodeRefs.filter(function(nodeRef) {
			return this._selectedNodes.has(nodeRef) === false;
		}, this);

		var unselected = unselectedNodeRefs.filter(function(nodeRef) {
			return this._selectedNodes.has(nodeRef) === true;
		}, this);

		if (selected.length > 0 || unselected.length > 0) {
			this._applySelectionNodeState(selected, true);
			this._applySelectionNodeState(unselected, false);

			if (unselected.length > 0) {
				this._deleteUnusedNodeStates();
			}

			if (!blockNotification) {
				this.fireSelectionChanged({
					selected: selected,
					unselected: unselected
				});
			}
		}

		return this;
	};

	/**
	 * Sets the outline color
	 * @param {sap.ui.core.CSSColor|string|int} color The new outline color. The value can be defined as a string
	 *                                                in the CSS color format or as an integer in the ABGR format. If <code>null</code>
	 *                                                is passed then the tint color is reset and the node's own tint color should be used.
	 * @returns {this} Returns <code>this</code> to allow method chaining
	 * @public
	 */
	ViewStateManager.prototype.setOutlineColor = function(color) {
		switch (typeof color) {
			case "number":
				this._outlineColorABGR = color;
				break;
			case "string":
				const CSSColor = DataType.getType("sap.ui.core.CSSColor");
				if (CSSColor.isValid(color)) {
					this._outlineColorABGR = colorToABGR(cssColorToColor(color));
				}
				break;
			default:
				return this;
		}

		this.fireOutlineColorChanged({
			outlineColor: colorToCSSColor(abgrToColor(this._outlineColorABGR)),
			outlineColorABGR: this._outlineColorABGR
		});

		return this;
	};

	/**
	 * Gets the outline color
	 *
	 * @param {boolean}         [inABGRFormat=false] This flag indicates to return the outline color in the ABGR format,
	 *                                               if it equals <code>false</code> then the color is returned in the CSS color format.
	 * @returns {sap.ui.core.CSSColor|string|int}
	 *                                               A single value or an array of values. Value <code>null</code> means that
	 *                                               the node's own tint color should be used.
	 * @public
	 */
	ViewStateManager.prototype.getOutlineColor = function(inABGRFormat) {
		return inABGRFormat ? this._outlineColorABGR : colorToCSSColor(abgrToColor(this._outlineColorABGR));
	};

	/**
	 * Gets the outlining state of the node.
	 *
	 * If a single node reference is passed to the method then a single outlining state is returned.<br/>
	 * If an array of node references is passed to the method then an array of outlining states is returned.
	 *
	 * @param {any|any[]} nodeRefs The node reference or the array of node references.
	 * @returns {boolean|boolean[]} A single value or an array of values where the value is <code>true</code> if the node is selected, <code>false</code> otherwise.
	 * @public
	 */
	ViewStateManager.prototype.getOutliningState = function(nodeRefs) {
		var outliningSet = this._outlinedNodes;
		function isOutlined(nodeRef) {
			return outliningSet.has(nodeRef);
		}

		return Array.isArray(nodeRefs) ?
			nodeRefs.map(isOutlined) : isOutlined(nodeRefs); // NB: The nodeRefs argument is a single no
	};

	/**
	 * Sets or resets the outlining state of the nodes.
	 * @param {any|any[]} outlinedNodeRefs The node reference or the array of node references of outlined nodes.
	 * @param {any|any[]} unoutlinedNodeRefs The node reference or the array of node references of un-outlined nodes.
	 * @param {boolean} recursive The flags indicates if the change needs to propagate recursively to child nodes.
	 * @param {boolean} blockNotification The flag to suppress outlineChanged event.
	 * @returns {this} Returns <code>this</code> to allow method chaining
	 * @public
	 */
	ViewStateManager.prototype.setOutliningStates = function(outlinedNodeRefs, unoutlinedNodeRefs, recursive, blockNotification) {
		if (!Array.isArray(outlinedNodeRefs)) {
			outlinedNodeRefs = [outlinedNodeRefs];
		}

		if (!Array.isArray(unoutlinedNodeRefs)) {
			unoutlinedNodeRefs = [unoutlinedNodeRefs];
		}

		outlinedNodeRefs = (recursive || this.getRecursiveOutlining() ? this._collectNodesRecursively(outlinedNodeRefs) : outlinedNodeRefs);
		unoutlinedNodeRefs = (recursive || this.getRecursiveOutlining() ? this._collectNodesRecursively(unoutlinedNodeRefs) : unoutlinedNodeRefs);

		if (this.getRecursiveOutlining()) {
			unoutlinedNodeRefs = this._nodeHierarchy._appendAncestors(unoutlinedNodeRefs, outlinedNodeRefs);
		}

		var outlined = outlinedNodeRefs.filter(function(nodeRef) {
			return this._outlinedNodes.has(nodeRef) === false;
		}, this);

		var unoutlined = unoutlinedNodeRefs.filter(function(nodeRef) {
			return this._outlinedNodes.has(nodeRef) === true;
		}, this);

		if (outlined.length > 0 || unoutlined.length > 0) {
			outlined.forEach(function(nodeRef) {
				this._outlinedNodes.add(nodeRef);
			}, this);

			unoutlined.forEach(function(nodeRef) {
				this._outlinedNodes.delete(nodeRef);
			}, this);

			if (!blockNotification) {
				this.fireOutliningChanged({
					outlined: outlined,
					unoutlined: unoutlined
				});
			}
		}

		return this;
	};

	/**
	 * Sets the outline width
	 * @param {float} width           			width of outline
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	ViewStateManager.prototype.setOutlineWidth = function(width) {
		this._outlineWidth = width;
		this.fireOutlineWidthChanged({
			width: width
		});
		return this;
	};

	/**
	 * Gets the outline width
	 * @returns {float} width of outline
	 * @public
	 */
	ViewStateManager.prototype.getOutlineWidth = function() {
		return this._outlineWidth;
	};

	ViewStateManager.prototype._collectNodesRecursively = function(nodeRefs) {
		var result = [];
		var nodeHierarchy = this._nodeHierarchy;

		(Array.isArray(nodeRefs) ? nodeRefs : [nodeRefs]).forEach(function collectChildNodes(nodeRef) {
			result.push(nodeRef);
			nodeHierarchy.enumerateChildren(nodeRef, collectChildNodes, false, true);
		});
		return result;
	};

	/**
	 * Gets the opacity of the node.
	 *
	 * A helper method to ensure the returned value is either <code>float</code> or <code>null</code>.
	 *
	 * @param {any} nodeRef The node reference.
	 * @returns {float|null} The opacity or <code>null</code> if no opacity set.
	 * @private
	 */
	ViewStateManager.prototype._getOpacity = function(nodeRef) {
		const state = this._nodeStates.get(nodeRef);
		return state?.opacity ?? null;
	};

	/**
	 * Gets the opacity of the node.
	 *
	 * If a single node is passed to the method then a single value is returned.<br/>
	 * If an array of nodes is passed to the method then an array of values is returned.
	 *
	 * @param {any|any[]} nodeRefs The node reference or the array of node references.
	 * @returns {float|float[]|null|null[]} A single value or an array of values. Value <code>null</code> means that the node's own opacity should be used.
	 * @public
	 */
	ViewStateManager.prototype.getOpacity = function(nodeRefs) {
		if (Array.isArray(nodeRefs)) {
			return nodeRefs.map(this._getOpacity, this);
		} else {
			return this._getOpacity(nodeRefs); // NB: The nodeRefs argument is a single nodeRef.
		}
	};

	/**
	 * Sets the opacity of the nodes.
	 *
	 * @param {any|any[]}               nodeRefs          The node reference or the array of node references.
	 * @param {float|float[]|null}      opacity           The new opacity of the nodes. If <code>null</code> is passed then the opacity is reset
	 *                                                    and the node's own opacity should be used.
	 * @param {boolean}         [recursive=false] This flag is not used, as opacity is always recursively applied to the offspring nodes by multiplication
	 * @returns {this} Returns <code>this</code> to allow method chaining
	 * @public
	 */
	ViewStateManager.prototype.setOpacity = function(nodeRefs, opacity, recursive) {
		// normalize parameters to have array of nodeRefs and array of visibility values
		if (!Array.isArray(nodeRefs)) {
			nodeRefs = [nodeRefs];
		}

		// check if we got an array as opacity
		var isBulkChange = Array.isArray(opacity);

		var recursiveOpacities = [];
		var allNodeRefs = nodeRefs;

		if (recursive) {
			allNodeRefs = [];
			nodeRefs.forEach(function(nodeRef, index) {
				var collected = this._collectNodesRecursively(nodeRef);
				allNodeRefs = allNodeRefs.concat(collected);

				var length = recursiveOpacities.length;
				recursiveOpacities.length += collected.length;
				recursiveOpacities.fill(isBulkChange ? opacity[index] : opacity, length);
			}, this);
		} else if (!isBulkChange) {
			// not recursive, opacity is a scalar
			recursiveOpacities.length = allNodeRefs.length;
			recursiveOpacities.fill(opacity);
		} else {
			// not recursive, opacity is an array
			recursiveOpacities = opacity;
		}

		// filter out unchanged opacity and duplicate nodes
		var changedOpacities = [];
		var usedNodeRefs = new Set();
		var changedNodeRefs = allNodeRefs.filter(function(nodeRef, index) {
			if (usedNodeRefs.has(nodeRef)) {
				return false;
			}

			usedNodeRefs.add(nodeRef);

			const state = this._nodeStates.get(nodeRef);
			var opacity = recursiveOpacities[index];
			var changed = state == null && opacity != null || state != null && state.opacity !== opacity;
			if (changed) {
				changedOpacities.push(opacity);
			}

			return changed;
		}, this);

		if (changedNodeRefs.length > 0) {
			this._applyOpacityNodeState(changedNodeRefs, changedOpacities);
			this._deleteUnusedNodeStates();

			var eventParameters = {
				changed: changedNodeRefs,
				opacity: isBulkChange ? changedOpacities : changedOpacities[0]
			};

			this.fireOpacityChanged(eventParameters);
		}

		return this;
	};

	/**
	 * Gets the tint color of the node in the ABGR format.
	 *
	 * A helper method to ensure that the returned value is either <code>int</code> or <code>null</code>.
	 *
	 * @param {any} nodeRef The node reference.
	 * @returns {int|null} The color in the ABGR format or <code>null</code> if no tint color is set.
	 * @private
	 */
	ViewStateManager.prototype._getTintColorABGR = function(nodeRef) {
		const state = this._nodeStates.get(nodeRef);
		return state?.tintColor;
	};

	/**
	 * Gets the tint color in the CSS color format.
	 *
	 * A helper method to ensure that the returned value is either {@link sap.ui.core.CSSColor} or <code>null</code>.
	 *
	 * @param {any} nodeRef The node reference.
	 * @returns {sap.ui.core.CSSColor|null} The color in the CSS color format or <code>null</code> if no tint color is set.
	 * @private
	 */
	ViewStateManager.prototype._getTintColor = function(nodeRef) {
		const tintColorABGR = this._getTintColorABGR(nodeRef);
		return tintColorABGR != null ? colorToCSSColor(abgrToColor(tintColorABGR)) : null;
	};

	/**
	 * Gets the tint color of the node.
	 *
	 * If a single node reference is passed to the method then a single value is returned.<br/>
	 * If an array of node references is passed to the method then an array of values is returned.
	 *
	 * @param {any|any[]}       nodeRefs             The node reference or the array of node references.
	 * @param {boolean}         [inABGRFormat=false] This flag indicates to return the tint color in the ABGR format,
	 *                                               if it equals <code>false</code> then the color is returned in the CSS color format.
	 * @returns {sap.ui.core.CSSColor|sap.ui.core.CSSColor[]|int|int[]}
	 *                                               A single value or an array of values. Value <code>null</code> means that
	 *                                               the node's own tint color should be used.
	 * @public
	 */
	ViewStateManager.prototype.getTintColor = function(nodeRefs, inABGRFormat) {
		var getTintColorMethod = inABGRFormat ? this._getTintColorABGR : this._getTintColor;
		if (Array.isArray(nodeRefs)) {
			return nodeRefs.map(getTintColorMethod, this);
		} else {
			return getTintColorMethod.call(this, nodeRefs); // NB: The nodeRefs argument is a single nodeRef.
		}
	};

	function toABGR(color) {
		switch (typeof color) {
			case "number":
				return color;
			case "string":
				const CSSColor = DataType.getType("sap.ui.core.CSSColor");
				return CSSColor.isValid(color) ? colorToABGR(cssColorToColor(color)) : null;
			default:
				return null; // The color is invalid, reset it to null.
		}
	}

	/**
	 * Sets the tint color of the nodes.
	 * @param {any|any[]}                   nodeRefs          The node reference or the array of node references.
	 * @param {sap.ui.core.CSSColor|int|sap.ui.core.CSSColor[]|int[]|null} tintColor The new tint color of the nodes. The
	 *                                                        value can be defined as a string in the CSS color format
	 *                                                        or as an integer in the ABGR format or it could be an
	 *                                                        array of these values. If <code>null</code> is passed then
	 *                                                        the tint color is reset and the node's own tint color
	 *                                                        should be used.
	 * @param {boolean}                     [recursive=false] This flag indicates if the change needs to propagate
	 *                                                        recursively to child nodes.
	 * @returns {this} Returns <code>this</code> to allow method chaining
	 * @public
	 */
	ViewStateManager.prototype.setTintColor = function(nodeRefs, tintColor, recursive) {
		if (!Array.isArray(nodeRefs)) {
			nodeRefs = [nodeRefs];
		}

		// check if we got an array as tint color
		var isBulkChange = Array.isArray(tintColor);

		var recursiveColors = [];
		var allNodeRefs = nodeRefs;

		if (recursive) {
			allNodeRefs = [];
			nodeRefs.forEach(function(nodeRef, index) {
				var collected = this._collectNodesRecursively(nodeRef);
				allNodeRefs = allNodeRefs.concat(collected);

				var length = recursiveColors.length;
				recursiveColors.length += collected.length;
				recursiveColors.fill(isBulkChange ? tintColor[index] : tintColor, length);
			}, this);
		} else if (!isBulkChange) {
			// not recursive, tintColor is a scalar
			recursiveColors.length = allNodeRefs.length;
			recursiveColors.fill(tintColor);
		} else {
			// not recursive, tintColor is an array
			recursiveColors = tintColor;
		}

		// filter out unchanged tintColor and duplicate nodes
		var changedColors = [];
		var changedColorsABGR = [];
		var usedNodeRefs = new Set();
		var changedNodeRefs = allNodeRefs.filter(function(nodeRef, index) {
			if (usedNodeRefs.has(nodeRef)) {
				return false;
			}

			usedNodeRefs.add(nodeRef);

			const state = this._nodeStates.get(nodeRef);
			var tintColor = recursiveColors[index];
			var tintColorABGR = toABGR(recursiveColors[index]);
			var changed = state == null && tintColor != null || state != null && state.tintColor !== tintColorABGR;
			if (changed) {
				changedColors.push(tintColor);
				changedColorsABGR.push(tintColorABGR);
			}

			return changed;
		}, this);

		if (changedNodeRefs.length > 0) {
			this._applyTintColorNodeState(changedNodeRefs, changedColorsABGR);
			this._deleteUnusedNodeStates();

			var eventParameters = {
				changed: changedNodeRefs,
				tintColor: isBulkChange ? changedColors : changedColors[0],
				tintColorABGR: isBulkChange ? changedColorsABGR : changedColorsABGR[0]
			};

			this.fireTintColorChanged(eventParameters);
		}

		return this;
	};

	/**
	 * Sets the highlight color of the nodes.
	 * @param {any|any[]}                   nodeRefs          The node reference or the array of node references.
	 * @param {float[]|null} highlightColor                   The new highlight color of the nodes. The
	 *                                                        value should be defined as an array of floats in the RGBA format.
	 *                                                        If <code>null</code> is passed then the highlight color is reset
	 *                                                        and the node's own highlight color should be used.
	 * @param {boolean}                     [recursive=false] This flag indicates if the change needs to propagate
	 *                                                        recursively to child nodes.
	 * @returns {this} Returns <code>this</code> to allow method chaining
	 * @public
	 */
	ViewStateManager.prototype.setNodesHighlightColor = function(nodeRefs, highlightColor, recursive) {
		if (!Array.isArray(nodeRefs)) {
			nodeRefs = [nodeRefs];
		}

		const allNodeRefs = recursive ? this._collectNodesRecursively(nodeRefs) : nodeRefs;
		const changedNodeRefs = Array.from(new Set(allNodeRefs)); // filter out duplicate nodes

		if (changedNodeRefs.length > 0) {
			changedNodeRefs.forEach(function(nodeRef) {
				const state = this._getNodeState(nodeRef, highlightColor != null);
				if (state != null) {
					state.highlightColor = highlightColor;
					this._setNeedsMaterialUpdate(nodeRef);
					nodeRef.children.forEach(this._setAncestorHighlightColorRecursively.bind(this,
						highlightColor != null ? highlightColor : state.ancestorHighlightColor), this);
				}
			}, this);
			this._deleteUnusedNodeStates();
		}

		return this;
	};

	/**
	 * Sets the default selection color
	 * @param {sap.ui.core.CSSColor|string|int} color The new selection color. The value can be defined as a string in
	 *                                                the CSS color format or as an integer in the ABGR format. If
	 *                                                <code>null</code> is passed then the tint color is reset and the
	 *                                                node's own tint color should be used.
	 * @returns {this} Returns <code>this</code> to allow method chaining
	 * @public
	 */
	ViewStateManager.prototype.setHighlightColor = function(color) {

		switch (typeof color) {
			case "number":
				this._highlightColorABGR = color;
				break;
			case "string":
				const CSSColor = DataType.getType("sap.ui.core.CSSColor");
				if (CSSColor.isValid(color)) {
					this._highlightColorABGR = colorToABGR(cssColorToColor(color));
				}
				break;
			default:
				return this;
		}

		if (this._selectedNodes.size > 0) {
			// NB: above we check if there are any nodes selected and below we traverse `_nodeStates` because unselected
			// descendants of selected nodes are not in `_selectedNodes` and we need to update both classes of nodes.
			this._nodeStates.forEach(function(state, nodeRef) {
				if (state.selected || state.ancestorSelected) {
					this._setNeedsMaterialUpdate(nodeRef);
				}
			}, this);
		}

		this.fireHighlightColorChanged({
			highlightColor: colorToCSSColor(abgrToColor(this._highlightColorABGR)),
			highlightColorABGR: this._highlightColorABGR
		});

		return this;
	};

	/**
	 * Gets the default highlighting color
	 *
	 * @param {boolean}         [inABGRFormat=false] This flag indicates to return the highlighting color in the ABGR format,
	 *                                               if it equals <code>false</code> then the color is returned in the CSS color format.
	 * @returns {sap.ui.core.CSSColor|string|int}
	 *                                               A single value or an array of values. Value <code>null</code> means that
	 *                                               the node's own tint color should be used.
	 * @public
	 */
	ViewStateManager.prototype.getHighlightColor = function(inABGRFormat) {
		return inABGRFormat ? this._highlightColorABGR : colorToCSSColor(abgrToColor(this._highlightColorABGR));
	};

	/**
	 * Gets the decomposed node rest transformation matrix if node is not linked to a joint, otherwise return decomposed joint transformation
	 *
	 * @param {any} nodeRef The node reference
	 * @returns {any} object that contains <code>translation</code>, <code>scale</code> and <code>quaternion</code> components.
	 * @private
	 */
	ViewStateManager.prototype.getRestTransformationUsingJoint = function(nodeRef) {
		var joint = this._getJointByChildNode(nodeRef);
		if (joint && joint.translation && joint.scale && joint.quaternion) {
			return joint;
		} else {
			return this.getRestTransformation(nodeRef);
		}
	};

	/**
	 * Gets the decomposed node local transformation matrix relative to node rest position
	 *
	 * @param {any|any[]} nodeRefs The node reference or array of nodes.
	 * @returns {any|any[]} object that contains <code>translation</code>, <code>scale</code> and <code>quaternion</code> components.
	 * @private
	 */
	ViewStateManager.prototype.getRelativeTransformation = function(nodeRefs) {
		var getData = function(node) {
			var restPosition = this.getRestTransformation(node);

			var rTranslation = [node.position.x - restPosition.translation[0],
			node.position.y - restPosition.translation[1],
			node.position.z - restPosition.translation[2]];

			var rQuaternion = new THREE.Quaternion().fromArray(restPosition.quaternion).invert().premultiply(node.quaternion).toArray();

			var rScale = [node.scale.x / restPosition.scale[0],
			node.scale.y / restPosition.scale[1],
			node.scale.z / restPosition.scale[2]];

			return { translation: rTranslation, quaternion: rQuaternion, scale: rScale };
		}.bind(this);

		if (!Array.isArray(nodeRefs)) {
			return getData(nodeRefs);
		}

		var result = [];
		nodeRefs.forEach(function(node) {
			result.push(getData(node));
		});

		return result;
	};

	/**
	 * Gets the decomposed node transformation matrix under world coordinates.
	 *
	 * @param {any|any[]} nodeRef The node reference or array of nodes.
	 * @returns {any|any[]} object that contains <code>translation</code>, <code>scale</code> and <code>quaternion</code> components.
	 * @private
	 */
	ViewStateManager.prototype.getTransformationWorld = function(nodeRef) {
		var getData = function(node) {

			var position = new THREE.Vector3();
			var scale = new THREE.Vector3();
			var quaternion = new THREE.Quaternion();
			node.updateMatrixWorld();
			node.matrixWorld.decompose(position, quaternion, scale);
			return {
				translation: position.toArray(),
				quaternion: quaternion.toArray(),
				scale: scale.toArray()
			};
		};

		if (!Array.isArray(nodeRef)) {
			return getData(nodeRef);
		}

		var result = [];
		nodeRef.forEach(function(node) {
			result.push(getData(node));
		});

		return result;
	};

	/**
	 * Gets the decomposed node local transformation matrix.
	 *
	 * @param {any|any[]} nodeRef The node reference or array of nodes.
	 * @returns {any|any[]} object that contains <code>translation</code>, <code>scale</code> and <code>quaternion</code> components.
	 * @private
	 */
	ViewStateManager.prototype.getTransformation = function(nodeRef) {
		var getData = function(node) {


			return {
				translation: this.getTranslation(node),
				quaternion: this.getRotation(node, RotationType.Quaternion),
				scale: this.getScale(node)
			};
		}.bind(this);

		if (!Array.isArray(nodeRef)) {
			return getData(nodeRef);
		}

		var result = [];
		nodeRef.forEach(function(node) {
			result.push(getData(node));
		});

		return result;
	};

	/**
	 * Gets the node transformation translation component.
	 *
	 * @param {any|any[]} nodeRef The node reference or array of nodes.
	 * @returns {float[]|Array<Array<float>>} A translation component of node's transformation matrix or array of components.
	 * @private
	 */
	ViewStateManager.prototype.getTranslation = function(nodeRef) {
		var getComponent = function(node) {
			// return !node.userData.position ? node.position.toArray() : node.userData.position.toArray();
			return node.position.toArray();
		};

		if (!Array.isArray(nodeRef)) {
			return getComponent(nodeRef);
		}

		var result = [];
		nodeRef.forEach(function(node) {
			result.push(getComponent(node));
		});

		return result;
	};

	/**
	 * Gets the node transformation scale component.
	 *
	 * @param {any|any[]} nodeRef The node reference or array of nodes.
	 * @returns {float[]|Array<Array<float>>} A scale component of node's transformation matrix or array of components.
	 * @private
	 */
	ViewStateManager.prototype.getScale = function(nodeRef) {
		var getComponent = function(node) {
			// return !node.userData.scale ? node.scale.toArray() : node.userData.scale.toArray();
			return node.scale.toArray();
		};

		if (!Array.isArray(nodeRef)) {
			return getComponent(nodeRef);
		}

		var result = [];
		nodeRef.forEach(function(node) {
			result.push(getComponent(node));
		});

		return result;
	};


	ViewStateManager.prototype._convertQuaternionToAngleAxis = function(quaternion) {
		if (quaternion.w > 1) {
			quaternion.normalize();
		}

		if (quaternion.w > 0.9999 && quaternion.x < 0.0001 && quaternion.y < 0.0001 && quaternion.z < 0.0001) {
			quaternion.w = 1;
			quaternion.x = 0;
			quaternion.y = 0;
			quaternion.z = 0;
		}

		var angle = 2 * Math.acos(quaternion.w);
		var x;
		var y;
		var z;
		var s = Math.sqrt(1 - quaternion.w * quaternion.w); // assuming quaternion normalized then w is less than 1, so term always positive.
		if (s < 0.0001) { // test to avoid divide by zero, s is always positive due to sqrt
			// if s close to zero then direction of axis not important
			x = 1;
			y = 0;
			z = 0;
		} else {
			x = quaternion.x / s; // normalize axis
			y = quaternion.y / s;
			z = quaternion.z / s;
		}

		return [x, y, z, angle];
	};

	/**
	 * Gets the node transformation rotation component.
	 *
	 * @param {any|any[]} nodeRef The node reference or array of nodes.
	 * @param {sap.ui.vk.RotationType} rotationType Rotation representation type.
	 * @returns {float[]|Array<Array<float>>} A rotation component of node's transformation matrix or array of components in specified format.
	 * @private
	 */
	ViewStateManager.prototype.getRotation = function(nodeRef, rotationType) {
		var getComponent = function(node) {
			// var quaternion = !node.userData.quaternion ? node.quaternion : node.userData.quaternion;
			var quaternion = node.quaternion;
			var result;
			switch (rotationType) {
				case RotationType.AngleAxis:
					result = this._convertQuaternionToAngleAxis(quaternion);
					break;
				case RotationType.Euler:
					var euler = new THREE.Euler();
					euler.setFromQuaternion(quaternion);

					result = euler.toArray();
					break;
				default:
					result = quaternion.toArray();
			}
			return result;
		};

		if (!Array.isArray(nodeRef)) {
			return getComponent(nodeRef);
		}

		var result = [];
		nodeRef.forEach(function(node) {
			result.push(getComponent(node));
		});

		return result;

	};

	/**
	 * Sets the node transformation components.
	 *
	 * @param {any|any[]} nodeRefs The node reference or array of node references.
	 * @param {any|any[]} transformations Node's transformation matrix or it components or array of such.
	 * 									  Each object should contain one transform matrix or exactly one of angleAxis, euler or quaternion components.
	 * @param {float[]} [transformation.transform] 12-element array representing 4 x 3 transformation matrix stored row-wise, or
	 * @param {float[]} transformation.translation translation component.
	 * @param {float[]} transformation.scale scale component.
	 * @param {float[]} [transformation.angleAxis] rotation component as angle-axis, or
	 * @param {float[]} [transformation.euler] rotation component as Euler angles, or
	 * @param {float[]} [transformation.quaternion] rotation component as quaternion.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @private
	 */
	ViewStateManager.prototype.setTransformation = function(nodeRefs, transformations) {
		var isBulkChange = Array.isArray(nodeRefs);

		if (!Array.isArray(nodeRefs)) {
			nodeRefs = [nodeRefs];
		}

		var eventParameters = {
			changed: [],
			transformation: []
		};

		var getTransformParametersForEvent = function(node) {
			return {
				position: node.position.toArray(),
				quaternion: node.quaternion.toArray(),
				scale: node.scale.toArray()
			};
		};

		if (!transformations) {

			nodeRefs.forEach(function(nodeRef) {
				if (nodeRef.userData.position && nodeRef.userData.quaternion && nodeRef.userData.scale) {
					nodeRef.position = nodeRef.userData.position;
					nodeRef.quaternion = nodeRef.userData.quaternion;
					nodeRef.scale = nodeRef.userData.scale;
					nodeRef.updateMatrix();

					delete nodeRef.userData.position;
					delete nodeRef.userData.quaternion;
					delete nodeRef.userData.scale;
				}

				eventParameters.changed.push(nodeRef);
				eventParameters.transformation.push(getTransformParametersForEvent(nodeRef));
			}, this);

		} else {

			if (!Array.isArray(transformations)) {
				transformations = [transformations];
			}

			nodeRefs.forEach(function(nodeRef, idx) {
				var userData = nodeRef.userData;

				if (!userData) {
					return;
				}

				if (!userData.position) {
					userData.position = nodeRef.position.clone();
				}

				if (!userData.quaternion) {
					userData.quaternion = nodeRef.quaternion.clone();
				}

				if (!userData.scale) {
					userData.scale = nodeRef.scale.clone();
				}

				var transformation = transformations[idx];

				if (transformation.transform) {
					var newMatrix = arrayToMatrixThree(transformation.transform);
					newMatrix.decompose(nodeRef.position, nodeRef.quaternion, nodeRef.scale);
				} else {
					nodeRef.position.fromArray(transformation.translation);

					nodeRef.scale.fromArray(transformation.scale);

					if (transformation.quaternion) {
						nodeRef.quaternion.fromArray(transformation.quaternion);
					} else if (transformation.angleAxis) {
						var axis = new THREE.Vector3(transformation.angleAxis[0], transformation.angleAxis[1], transformation.angleAxis[2]);
						nodeRef.quaternion.setFromAxisAngle(axis, transformation.angleAxis[3]);
					} else if (transformation.euler) {
						var euler = new THREE.Euler();
						euler.fromArray(transformation.euler[0], transformation.euler[1], transformation.euler[2], transformation.euler[3]);
						nodeRef.quaternion.setFromEuler(euler);
					}
				}

				nodeRef.updateMatrix();

				eventParameters.changed.push(nodeRef);
				eventParameters.transformation.push(getTransformParametersForEvent(nodeRef));
			}, this);
		}

		if (!isBulkChange) {
			eventParameters.changed = eventParameters.changed[0];
			eventParameters.transformation = eventParameters.transformation[0];
		}

		this.fireTransformationChanged(eventParameters);

		return this;
	};

	ViewStateManager.prototype.getJoints = function() {
		return this._jointCollection;
	};

	ViewStateManager.prototype.setJoints = function(joints, playback) {
		this._jointCollection = [];
		this._playbackAssociatedWithJoints = null;

		if (!joints) {
			return this;
		}

		var jointSet = new Set();
		var jointMap = new Map();
		joints.forEach(function(joint) {
			if (!joint.node || !joint.parent) {
				return;
			}
			jointSet.add(joint.node);
			jointMap.set(joint.node, joint);
		});

		while (jointSet.size > 0) {
			var node = jointSet.values().next().value;
			jointSet.delete(node);
			var joint = jointMap.get(node);
			var jointSequence = [joint];

			var intermediateNodes = [];
			var ancestor = joint.parent;
			while (ancestor) {
				joint = jointMap.get(ancestor);
				if (joint !== undefined) {
					if (jointSet.delete(ancestor)) {
						jointSequence.push(joint);
					}

					if (intermediateNodes.length > 0) {
						joint.nodesToUpdate = joint.nodesToUpdate || [];
						while (intermediateNodes.length > 0) {
							var imNode = intermediateNodes.pop();
							if (joint.nodesToUpdate.indexOf(imNode) >= 0) {
								break;
							}
							joint.nodesToUpdate.push(imNode); // add intermediate node
						}
					}

					intermediateNodes.length = 0;
					ancestor = joint.parent;
				} else {
					intermediateNodes.push(ancestor);
					ancestor = ancestor.parent;
				}
			}

			while (jointSequence.length > 0) {
				this._jointCollection.push(jointSequence.pop());
			}
		}

		if (this._jointCollection && this._jointCollection.length > 0) {
			this._playbackAssociatedWithJoints = playback;
			this._jointCollection.forEach(function(joint) {
				if (!joint.node || !joint.parent) {
					return;
				}
				joint.translation = null;
				joint.scale = null;
				joint.quaternion = null;
				joint.opacity = null;
				if (joint.node.userData) {
					joint.node.userData.offsetTranslation = null;
					joint.node.userData.offsetQuaternion = null;
					joint.node.userData.offsetScale = null;
					joint.node.userData.originalRotationType = null;
					joint.node.userData.offsetOpacity = null;
				}
			});

			this._jointCollection.forEach(function(joint) {
				this._updateJointNode(joint, this._playbackAssociatedWithJoints);
			}.bind(this));
		}

		return this;
	};

	ViewStateManager.prototype._updateJointNode = function(joint, playback) {
		if (!joint.node || !joint.parent) {
			return;
		}

		if (joint.translation && joint.quaternion && joint.scale && joint.opacity) {
			return;
		}

		var jointMap = new Map();
		if (this._jointCollection && this._jointCollection.length > 0) {
			this._jointCollection.forEach(function(joint) {
				if (!joint.node || !joint.parent) {
					return;
				}
				jointMap.set(joint.node, joint);
			});
		}

		var position, scale, quaternion, nodeMatrix, restTransformation, restOpacity;

		var node = joint.node;
		var worldMatrix = new THREE.Matrix4();
		var opacity, totalOpacity = 1;
		while (node) {
			restOpacity = this.getRestOpacity(node);
			restTransformation = this.getRestTransformation(node);
			if (!restTransformation) {
				node = node.parent;
				continue;
			}

			position = new THREE.Vector3(restTransformation.translation[0],
				restTransformation.translation[1],
				restTransformation.translation[2]);
			scale = new THREE.Vector3(restTransformation.scale[0],
				restTransformation.scale[1],
				restTransformation.scale[2]);
			quaternion = new THREE.Quaternion(restTransformation.quaternion[0],
				restTransformation.quaternion[1],
				restTransformation.quaternion[2],
				restTransformation.quaternion[3]);

			opacity = restOpacity;

			if (playback) {
				var offsetTrans = this._getEndPropertyInPreviousPlayback(node, AnimationTrackType.Translate, playback, true);
				if (offsetTrans) {
					position.x += offsetTrans[0];
					position.y += offsetTrans[1];
					position.z += offsetTrans[2];
				}

				var offsetScale = this._getEndPropertyInPreviousPlayback(node, AnimationTrackType.Scale, playback, true);
				if (offsetScale) {
					scale.x *= offsetScale[0];
					scale.y *= offsetScale[1];
					scale.z *= offsetScale[2];
				}

				var offsetRotate = this._getEndPropertyInPreviousPlayback(node, AnimationTrackType.Rotate, playback, true);
				if (offsetRotate) {
					var offsetQ = new THREE.Quaternion(offsetRotate[0], offsetRotate[1], offsetRotate[2], offsetRotate[3]);
					quaternion = offsetQ.multiply(quaternion);
				}

				var offsetOpacity = this._getEndPropertyInPreviousPlayback(node, AnimationTrackType.Opacity, playback, true);
				if (offsetOpacity != null) {
					opacity *= offsetOpacity;
				}
			}
			nodeMatrix = new THREE.Matrix4().compose(position, quaternion, scale);
			worldMatrix.premultiply(nodeMatrix);

			totalOpacity *= opacity;

			node = node.parent;
		}

		var parent = joint.parent;
		var jParentWorldMatrix = new THREE.Matrix4();
		var jParentOpacity = 1;

		while (parent) {
			var parentJoint = jointMap.get(parent);
			if (parentJoint) {
				if (!parentJoint.translation) {
					this._updateJointNode(parentJoint);
				}

				position = new THREE.Vector3(parentJoint.translation[0],
					parentJoint.translation[1],
					parentJoint.translation[2]);
				scale = new THREE.Vector3(parentJoint.scale[0],
					parentJoint.scale[1],
					parentJoint.scale[2]);
				quaternion = new THREE.Quaternion(parentJoint.quaternion[0],
					parentJoint.quaternion[1],
					parentJoint.quaternion[2],
					parentJoint.quaternion[3]);

				opacity = parentJoint.opacity;

				parent = parentJoint.parent;
			} else {
				restOpacity = this.getRestOpacity(parent);
				restTransformation = this.getRestTransformation(parent);
				if (!restTransformation) {
					parent = parent.parent;
					continue;
				}

				position = new THREE.Vector3(restTransformation.translation[0],
					restTransformation.translation[1],
					restTransformation.translation[2]);
				scale = new THREE.Vector3(restTransformation.scale[0],
					restTransformation.scale[1],
					restTransformation.scale[2]);
				quaternion = new THREE.Quaternion(restTransformation.quaternion[0],
					restTransformation.quaternion[1],
					restTransformation.quaternion[2],
					restTransformation.quaternion[3]);
				opacity = restOpacity;

				if (playback) {
					var poffsetTrans = this._getEndPropertyInPreviousPlayback(parent, AnimationTrackType.Translate, playback, true);
					if (poffsetTrans) {
						position.x += poffsetTrans[0];
						position.y += poffsetTrans[1];
						position.z += poffsetTrans[2];
					}

					var poffsetScale = this._getEndPropertyInPreviousPlayback(parent, AnimationTrackType.Scale, playback, true);
					if (poffsetScale) {
						scale.x *= poffsetScale[0];
						scale.y *= poffsetScale[1];
						scale.z *= poffsetScale[2];
					}

					var poffsetRotate = this._getEndPropertyInPreviousPlayback(parent, AnimationTrackType.Rotate, playback, true);
					if (poffsetRotate) {
						var poffsetQ = new THREE.Quaternion(poffsetRotate[0], poffsetRotate[1], poffsetRotate[2], poffsetRotate[3]);
						quaternion = poffsetQ.multiply(quaternion);
					}

					var poffsetOpacity = this._getEndPropertyInPreviousPlayback(parent, AnimationTrackType.Opacity, playback, true);
					if (poffsetOpacity != null) {
						opacity *= poffsetOpacity;
					}
				}
				parent = parent.parent;
			}

			nodeMatrix = new THREE.Matrix4().compose(position, quaternion, scale);
			jParentWorldMatrix.premultiply(nodeMatrix);
			jParentOpacity *= opacity;
		}

		var jointMatrix = jParentWorldMatrix.copy(jParentWorldMatrix).invert().multiply(worldMatrix);
		jointMatrix.decompose(position, quaternion, scale);

		joint.translation = position.toArray();
		joint.quaternion = quaternion.toArray();
		joint.scale = scale.toArray();

		var calcJointOpacity = function(treeOpacity, jointParentOpacity) {
			if (treeOpacity === jointParentOpacity) {
				return 1;
			} else if (Math.abs(jointParentOpacity) < 0.0001) {
				return 1;
			}

			return treeOpacity / jointParentOpacity;
		};

		joint.opacity = calcJointOpacity(totalOpacity, jParentOpacity);
	};

	ViewStateManager.prototype._propagateOpacityToJointChildren = function(nodeRefs, opacities) {
		if (!nodeRefs || !opacities || nodeRefs.length !== opacities.length) {
			return this;
		}

		if (!this._jointCollection || !this._jointCollection.length) {
			return this;
		}

		var jointParentMap = new Map();
		this._jointCollection.forEach(function(joint) {
			var joints = jointParentMap.get(joint.parent);
			if (!joints) {
				joints = [];
				jointParentMap.set(joint.parent, joints);
			}
			joints.push(joint);
		});

		const that = this;
		var applyOpacity = function(joint, opacity) {
			if (joint.opacity != null && joint.node) {
				let nodeOpacity = joint.opacity * opacity;
				if (joint.node.userData.offsetOpacity != null) {
					nodeOpacity *= joint.node.userData.offsetOpacity;
				}
				that.setOpacity(joint.node, nodeOpacity);
			}
		};

		nodeRefs.forEach(function(nodeRef, index) {
			var joints = jointParentMap.get(nodeRef);
			if (joints) {
				joints.forEach(function(joint) {
					applyOpacity(joint, opacities[index]);
				});
			}
		});

		return this;
	};

	/**
	 * Get the Symbol node from nodeId,
	 * if nodeId is not set, returns a collection of all Symbol nodes
	 *
	 * @param {string} nodeId node Id string, optional
	 * @returns {any[]} An array of nodes
	 * @public
	 * @since 1.82.0
	 */
	ViewStateManager.prototype.getSymbolNodes = function(nodeId) {
		var view = this.getCurrentView() || this._scene.getViews()[0];
		var symbolNodes = view ? view.getNodeInfos().reduce(function(nodeInfos, currNode) {
			if (currNode.target._vkGetNodeContentType() === NodeContentType.Symbol && currNode.target.parent) {
				if (!nodeId || nodeId === currNode.target.userData.treeNode.sid) {
					nodeInfos.push(currNode.target);
				}
			}
			return nodeInfos;
		}, []) : [];
		return symbolNodes;
	};

	var backgroundNodeNameImageType = {
		"sphere": "360Image",
		"plane": "2DImage"
	};

	ViewStateManager.prototype._getBackgroundNodeInfos = function() {
		var currBackgroundNode = null, backgroundNodes = [];

		const traverse = (nodeRef) => {
			if (this.getVisibilityState(nodeRef)) {
				if (nodeRef._vkGetNodeContentType() === NodeContentType.Background && backgroundNodeNameImageType[nodeRef.name]) {
					currBackgroundNode = nodeRef;
					return;
				}

				var children = nodeRef.children;
				for (var i = 0, l = children.length; i < l && currBackgroundNode === null; i++) {
					traverse(children[i]);
				}
			}
		};

		traverse(this._scene.getSceneRef());

		if (currBackgroundNode) {
			backgroundNodes = currBackgroundNode.parent.children.filter(function(child) {
				return child._vkGetNodeContentType() === NodeContentType.Background;
			});
		}

		return { current: currBackgroundNode, all: backgroundNodes };
	};

	/**
	 * Get the background image type
	 *
	 * @returns {?string} Image type string, or null
	 * @private
	 */
	ViewStateManager.prototype.getBackgroundImageType = function() {
		// currently can only use background node name to determine the image type
		var currBackgroundNode = this._getBackgroundNodeInfos().current;
		return currBackgroundNode ? backgroundNodeNameImageType[currBackgroundNode.name] : null;
	};

	/**
	 * Set the background image type
	 *
	 * @param {string} imageType Image type string
	 * @returns {object} Background node object
	 * @private
	 */
	ViewStateManager.prototype.setBackgroundImageType = function(imageType) {
		var backgroundNodes = this._getBackgroundNodeInfos();
		var targetBackgroundNode = backgroundNodes.all.find(function(nodeRef) {
			return imageType === backgroundNodeNameImageType[nodeRef.name];
		});
		if (targetBackgroundNode && !this.getVisibilityState(targetBackgroundNode)) {
			if (backgroundNodes.current) {
				this.setVisibilityState(backgroundNodes.current, false, false);
			}
			this.setVisibilityState(backgroundNodes.all, false, false);
			this.setVisibilityState(targetBackgroundNode, true, false);
		}
		return targetBackgroundNode;
	};

	function arrayToMatrixThree(array) {
		var matrix = new THREE.Matrix4();
		if (array.length === 3) {
			// position only matrix
			matrix.setPosition(new THREE.Vector3().fromArray(array));
		} else if (array.length === 12) {
			// 4x3 matrix
			matrix.fromArray(TransformationMatrix.convertTo4x4(array));
		} else if (array.length === 16) {
			// 4x4 matrix
			matrix.fromArray(array.slice());
		} else {
			throw "Invalid matrix format";
		}
		return matrix;
	}

	ViewStateManager.prototype._resetNodesStatusByCurrentView = function(view, setVisibility) {

		var nodeHierarchy = this.getNodeHierarchy();
		if (nodeHierarchy) {
			var nodeInfos = view.getNodeInfos();

			if (nodeInfos) {  // for totaraLoader
				var transforms = {
					nodeRefs: [],
					positions: []
				};
				var newPosition = new THREE.Vector3();
				var newRotation = new THREE.Quaternion();
				var newScale = new THREE.Vector3();

				for (const node of nodeInfos) {
					if (node.target === null) {
						return;
					}

					if (node.transform) {
						var newMatrix = arrayToMatrixThree(node.transform);
						if (!AnimationMath.equalMatrices(newMatrix, node.target.matrix, 1e-6)) {
							newMatrix.decompose(newPosition, newRotation, newScale);
							transforms.nodeRefs.push(node.target);
							transforms.positions.push({
								translation: newPosition.toArray(),
								quaternion: newRotation.toArray(),
								scale: newScale.toArray()
							});
						}
					} else if (node[AnimationTrackType.Scale] && node[AnimationTrackType.Rotate] && node[AnimationTrackType.Translate]) {
						transforms.nodeRefs.push(node.target);
						transforms.positions.push({
							translation: node[AnimationTrackType.Translate].slice(),
							quaternion: node[AnimationTrackType.Rotate].slice(),
							scale: node[AnimationTrackType.Scale].slice()
						});
					}
				}

				if (view.userData && view.userData.nodeStartDataByAnimation) {
					view.userData.nodeStartDataByAnimation.forEach(function(data, nodeRef) {
						if (data[AnimationTrackType.Translate] && data[AnimationTrackType.Rotate] && data[AnimationTrackType.Scale]) {
							transforms.nodeRefs.push(nodeRef);
							transforms.positions.push({
								translation: data[AnimationTrackType.Translate].slice(),
								quaternion: data[AnimationTrackType.Rotate].slice(),
								scale: data[AnimationTrackType.Scale].slice()
							});
						}
					}, this);
				}

				if (transforms.nodeRefs.length) {
					this.setTransformation(transforms.nodeRefs, transforms.positions);
				}

				if (setVisibility) {
					// Apply nodes visibility for the current view
					var nodeVisible = [];
					var nodeInvisible = [];
					nodeInfos.forEach(function(info) {
						if (!info.target.userData.skipIt) {
							(info.visible ? nodeVisible : nodeInvisible).push(info.target);
						}
					});

					// Hide all root nodes. The roots that have visible nodes will be made visible when these nodes visibility changes.
					this.setVisibilityState(nodeHierarchy.getChildren()[0].children, false, true);
					if (this.getSymbolNodes().length) {
						this.getSymbolNodes().forEach(function(symbolNode) {
							symbolNode.traverse(function(node) { node.visible = true; });
						});
					}
					this.setVisibilityState(nodeVisible, true, false);
					this.setVisibilityState(nodeInvisible, false, false);
				}
			}
		}
	};

	ViewStateManager.prototype._resetNodesMaterialAndOpacityByCurrentView = function(view) {
		view?.getNodeInfos()?.forEach(function(node) {
			if (node.target) {
				this.setOpacity(node.target, node.opacity);
			}
		}, this);
	};

	ViewStateManager.prototype._onActivateView = function(channel, eventId, event) {
		var viewManager = this.getViewManager();
		if (!viewManager || event.source.getId() !== viewManager) {
			return;
		}
		this.activateView(event.view, false, event.playViewGroup, event.skipCameraTransitionAnimation);
	};

	/**
	 * Activate specified view
	 *
	 * @param {sap.ui.vk.View} view view object definition
	 * @param {boolean} ignoreAnimationPosition when set to true, initial animation state is not applied to the view
	 * @param {boolean} playViewGroup true if view activation is part of playing view group
	 * @param {boolean} skipCameraTransitionAnimation do not animate the change of camera
	 * @returns {sap.ui.vk.ViewStateManager} return this
	 * @private
	 */
	ViewStateManager.prototype.activateView = function(view, ignoreAnimationPosition, playViewGroup, skipCameraTransitionAnimation) {
		this.fireViewStateApplying({
			view: view
		});

		// remove joints
		this.setJoints(undefined);

		this._resetNodesMaterialAndOpacityByCurrentView(view);
		this._prepareTransition(view);
		this._resetNodesStatusByCurrentView(view, true);
		this._highlightPlayer.reset(view, this._scene);

		this.fireViewStateApplied({
			view: view,
			ignoreAnimationPosition: ignoreAnimationPosition,
			skipCameraTransitionAnimation: skipCameraTransitionAnimation,
			playViewGroup: playViewGroup
		});

		vkCore.getEventBus().publish("sap.ui.vk", "viewStateApplied", {
			source: this,
			view: view,
			ignoreAnimationPosition: ignoreAnimationPosition,
			skipCameraTransitionAnimation: skipCameraTransitionAnimation,
			playViewGroup: playViewGroup
		});

		return this;
	};

	/**
	 * Set highlight display state.
	 *
	 * @param {sap.ui.vk.HighlightDisplayState} state for playing highlight - playing, pausing, and stopped
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	ViewStateManager.prototype.setHighlightDisplayState = function(state) {

		if (state === HighlightDisplayState.playing) {
			this._highlightPlayer.start(Date.now());
		} else if (state === HighlightDisplayState.stopped) {
			this._highlightPlayer.stop();
		} else if (state === HighlightDisplayState.pausing) {
			this._highlightPlayer.pause(Date.now());
		}

		this.fireHighlightColorChanged({
			highlightColor: colorToCSSColor(abgrToColor(this._highlightColorABGR)),
			highlightColorABGR: this._highlightColorABGR
		});
		return this;
	};

	ViewStateManager.prototype._startHighlight = function() {

		this._highlightPlayer.start(Date.now());
		return this;
	};

	ViewStateManager.prototype._playHighlight = function() {

		return this._highlightPlayer.play(Date.now());
	};

	ViewStateManager.prototype._prepareTransition = function(view) {
		this._transitionPlayer.reset();
		this._transitionPlayer.fadeInNodes = [];
		this._transitionPlayer.fadeOutNodes = [];
		this._fadeInBackground = null;
		this._fadeOutBackground = null;

		var nodeInfos = view.getNodeInfos();
		if (!nodeInfos) {
			return;
		}

		var visibleNodes = new Set();
		var hiddenNodes = new Set();
		nodeInfos.forEach(function(info) {
			(info.visible ? visibleNodes : hiddenNodes).add(info.target);
		});

		var fadeInNodes = this._transitionPlayer.fadeInNodes;
		var fadeOutNodes = this._transitionPlayer.fadeOutNodes;
		var nodeHierarchy = this._nodeHierarchy;

		var collectTransitionMeshes = function(nodeRef, newVisible, oldVisible) {
			if (!nodeRef.userData.skipIt) {
				newVisible = newVisible && visibleNodes.has(nodeRef);
				oldVisible = oldVisible && this.getVisibilityState(nodeRef);
			}

			if (nodeRef.geometry && newVisible !== oldVisible) {
				if (nodeRef.parent && nodeRef.parent.userData.symbolContent) {
					nodeRef.renderOrder = 2;  // background nodes should be rendered before POIs
				}
				(newVisible ? fadeInNodes : fadeOutNodes).push(nodeRef);
			}

			if (nodeRef._vkGetNodeContentType() === NodeContentType.Background) {
				if (newVisible) {
					this._fadeInBackground = nodeRef;
					// return; // skip fade-in animation for the new background
				} else if (oldVisible) {
					this._fadeOutBackground = nodeRef;
				}
			}

			nodeRef.children.forEach(function(child) {
				collectTransitionMeshes(child, newVisible, oldVisible);
			});
		}.bind(this);

		nodeHierarchy.getChildren()[0].children.forEach(function(child) {
			collectTransitionMeshes(child, true, true);
		});

		if (this._fadeInBackground) {
			this._fadeInBackground.traverse(function(child) {
				if (child.material) {
					child.renderOrder = -2; // transparent fade-in background should be rendered before POIs
				}
			});
		}

		if (this._fadeOutBackground) {
			this._fadeOutBackground.traverse(function(child) {
				if (child.material) {
					child.renderOrder = 1; // fix geometry interpenetration during fade-out sphere background, JIRA: EPDVISUALIZATION-1327
				}
			});
		}

		// console.log("+", Array.from(visibleNodes).map(n => n.name), fadeInNodes.map(n => n.name || ("<" + n.parent?.name)));
		// console.log("-", Array.from(hiddenNodes).map(n => n.name), fadeOutNodes.map(n => n.name || ("<" + n.parent?.name)));
		// console.log(this._fadeOutBackground, "->", this._fadeInBackground);
	};

	ViewStateManager.prototype._startTransition = function(timeInterval) {
		var fadeInNodes = this._transitionPlayer.fadeInNodes;
		var fadeOutNodes = this._transitionPlayer.fadeOutNodes;

		if (fadeInNodes && fadeInNodes.length) {
			var fadeInHighlight = new Highlight("FadeIn", {
				duration: timeInterval / 500.0,
				opacities: [1.0, 0.0],
				cycles: 0.5,
				type: "FadeIn"
			});
			this._transitionPlayer.addHighlights(fadeInHighlight, fadeInNodes);
		}

		if (fadeOutNodes && fadeOutNodes.length) {
			var fadeOutHighlight = new Highlight("FadeOut", {
				duration: timeInterval / 500.0,
				opacities: [0.0, 1.0],
				cycles: 0.5,
				type: "FadeOut"
			});
			this._transitionPlayer.addHighlights(fadeOutHighlight, fadeOutNodes);
		}

		if ((fadeInNodes && fadeInNodes.length) || (fadeOutNodes && fadeOutNodes.length)) {
			this._transitionPlayer.start(Date.now());
			this._transitionPlayer.play(Date.now());
			return timeInterval;
		}

		return 0;
	};

	ViewStateManager.prototype._playTransition = function() {
		return this._transitionPlayer.play(Date.now());
	};

	/**
	 * Copy nodes' current transformation into their rest transformation stored in active view.
	 *
	 * @param {any[]} nodeRefs Array of node references.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	ViewStateManager.prototype.updateNodesRestTransformation = function(nodeRefs) {
		for (var i = 0; i < nodeRefs.length; i++) {
			this.updateRestTransformation(nodeRefs[i], true);
			// only fire the sequence changed event at last to avoid unintentionally changing
			// the joint nodes whose rest transformations have not been updated in the event handler.
			if (this._playbackAssociatedWithJoints && i === nodeRefs.length - 1) {
				var sequence = this._playbackAssociatedWithJoints.getSequence();
				if (sequence) {
					sequence._fireSequenceChanged();
				}
			}
		}
		return this;
	};

	/**
	 * Copy node's current transformation into its rest transformation stored in active view.
	 *
	 * @param {any} nodeRef The node reference.
	 * @param {boolean} DoNotFireSequenceChanged Do not fire sequence changed event if true
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	ViewStateManager.prototype.updateRestTransformation = function(nodeRef, DoNotFireSequenceChanged) {
		var currentView = this.getCurrentView();
		if (!currentView) {
			return this;
		}

		currentView.getNodeInfos()?.forEach(function(nodeInfo) {
			if (nodeInfo.target === nodeRef) {
				nodeRef.updateMatrix();
				nodeInfo.transform = nodeRef.matrix.elements.slice();
			}
		});

		if (this._jointCollection && this._jointCollection.length > 0) {
			this._jointCollection.forEach(function(joint) {
				if (!joint.node || !joint.parent) {
					return;
				}

				if (joint.parent === nodeRef || joint.node === nodeRef) {
					joint.translation = null;
					joint.scale = null;
					joint.quaternion = null;

					if (joint.node.userData) {
						joint.node.userData.offsetTranslation = null;
						joint.node.userData.offsetQuaternion = null;
						joint.node.userData.offsetScale = null;
						joint.node.userData.originalRotationType = null;
					}
				}
			});

			this._jointCollection.forEach(function(joint) {
				if (!joint.node || !joint.parent) {
					return;
				}
				if (joint.parent === nodeRef) {
					this._updateJointNode(joint, this._playbackAssociatedWithJoints);
					this.restoreRestTransformation(joint.node);
				}
			}.bind(this));

			this._jointCollection.forEach(function(joint) {
				if (!joint.node || !joint.parent) {
					return;
				}
				if (joint.node === nodeRef) {
					this._updateJointNode(joint, this._playbackAssociatedWithJoints);
					// this.restoreRestTransformation(joint.node);
				}
			}, this);

			if (this._playbackAssociatedWithJoints && !DoNotFireSequenceChanged) {
				var sequence = this._playbackAssociatedWithJoints.getSequence();
				if (sequence) {
					sequence._fireSequenceChanged();
				}
			}
		}

		return this;
	};

	/**
	 * Replace node's current transformation with its rest transformation stored in active view..
	 *
	 * @param {any} nodeRef The node reference.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	ViewStateManager.prototype.restoreRestTransformation = function(nodeRef) {
		var currentView = this.getCurrentView();
		if (!currentView) {
			return this;
		}

		var nodeInfo = currentView.getNodeInfos();
		if (nodeInfo) {
			nodeInfo.forEach(function(node) {

				if (node.target !== nodeRef) {
					return;
				}

				if (node.transform) {
					var newMatrix = arrayToMatrixThree(node.transform);
					newMatrix.decompose(nodeRef.position, nodeRef.quaternion, nodeRef.scale);
				} else if (node[AnimationTrackType.Scale] && node[AnimationTrackType.Rotate] && node[AnimationTrackType.Translate]) {
					nodeRef.position.set(node[AnimationTrackType.Translate][0],
						node[AnimationTrackType.Translate][1],
						node[AnimationTrackType.Translate][2]);

					nodeRef.quaternion.set(node[AnimationTrackType.Rotate][0],
						node[AnimationTrackType.Rotate][1],
						node[AnimationTrackType.Rotate][2],
						node[AnimationTrackType.Rotate][3]);

					nodeRef.scale.set(node[AnimationTrackType.Scale][0],
						node[AnimationTrackType.Scale][1],
						node[AnimationTrackType.Scale][2]);
				}

				nodeRef.updateMatrix();
			});
		}

		var eventParameters = {
			changed: [nodeRef],
			transformation: [{
				position: nodeRef.position.toArray(),
				quaternion: nodeRef.quaternion.toArray(),
				scale: nodeRef.scale.toArray()
			}]
		};

		this.fireTransformationChanged(eventParameters);
		return this;
	};


	/**
	 * Set node's rest transformation stored in active view.
	 *
	 * @param {any} nodeRef The node reference.
	 * @param {float[]} translation vector for position, array of size 3, if null current rest translation is used
	 * @param {float[]} quaternion quaternion for rotation, array of size 4, if null current rest quaternion is used
	 * @param {float[]} scale vector for scaling, array of size 3, if null current rest scale is used
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @private
	 */
	ViewStateManager.prototype.setRestTransformation = function(nodeRef, translation, quaternion, scale) {
		var currentView = this.getCurrentView();
		if (!currentView) {
			return this;
		}

		var nodeInfo = currentView.getNodeInfos();
		if (nodeInfo) {
			nodeInfo.forEach(function(node) {

				if (node.target !== nodeRef) {
					return;
				}

				if (!translation || !quaternion || !scale) {
					if (node.transform) {
						var po = new THREE.Vector3();
						var ro = new THREE.Quaternion();
						var sc = new THREE.Vector3();
						var mat = arrayToMatrixThree(node.transform);
						mat.decompose(po, ro, sc);
						if (!translation) {
							translation = [po.x, po.y, po.z];
						}

						if (!scale) {
							scale = [sc.x, sc.y, sc.z];
						}

						if (!quaternion) {
							quaternion = [ro.x, ro.y, ro.z, ro.w];
						}
					} else if (node[AnimationTrackType.Scale] && node[AnimationTrackType.Rotate] && node[AnimationTrackType.Translate]) {
						if (!translation) {
							translation = node[AnimationTrackType.Translate].slice();
						}

						if (!scale) {
							scale = node[AnimationTrackType.Scale].slice();
						}

						if (!quaternion) {
							quaternion = node[AnimationTrackType.Rotate].slice();
						}
					}
				}

				var positionThree = new THREE.Vector3(translation[0], translation[1], translation[2]);
				var quaternionThree = new THREE.Quaternion(quaternion[0], quaternion[1], quaternion[2], quaternion[3]);
				var scaleThree = new THREE.Vector3(scale[0], scale[1], scale[2]);

				var newMatrix = new THREE.Matrix4();
				newMatrix.compose(positionThree, quaternionThree, scaleThree);

				node.transform = newMatrix.elements.slice();
			});
		}

		if (this._jointCollection && this._jointCollection.length > 0) {
			this._jointCollection.forEach(function(joint) {
				if (!joint.node || !joint.parent) {
					return;
				}

				if (joint.parent === nodeRef || joint.node === nodeRef) {
					joint.translation = null;
					joint.scale = null;
					joint.quaternion = null;

					if (joint.node.userData) {
						joint.node.userData.offsetTranslation = null;
						joint.node.userData.offsetQuaternion = null;
						joint.node.userData.offsetScale = null;
						joint.node.userData.originalRotationType = null;
					}
				}
			});

			this._jointCollection.forEach(function(joint) {
				if (!joint.node || !joint.parent) {
					return;
				}
				if (joint.parent === nodeRef) {
					this._updateJointNode(joint, this._playbackAssociatedWithJoints);
					this.restoreRestTransformation(joint.node);
				}
			}, this);

			this._jointCollection.forEach(function(joint) {
				if (!joint.node || !joint.parent) {
					return;
				}
				if (joint.node === nodeRef) {
					this._updateJointNode(joint, this._playbackAssociatedWithJoints);
					// this.restoreRestTransformation(joint.node);
				}
			}, this);

			if (this._playbackAssociatedWithJoints) {
				var sequence = this._playbackAssociatedWithJoints.getSequence();
				if (sequence) {
					sequence._fireSequenceChanged();
				}
			}
		}

		return this;
	};

	/**
	 * Get node's opacity stored in active view.
	 *
	 * @param {any} nodeRef The node reference.
	 * @returns {float} node opacity
	 * @private
	 */
	ViewStateManager.prototype.getRestOpacity = function(nodeRef) {
		const nodeInfo = this.getCurrentView()?.getNodeInfos();
		var result = 1;

		if (nodeInfo?.length) {
			for (var i = 0; i < nodeInfo.length; i++) {
				var node = nodeInfo[i];
				if (node.target !== nodeRef) {
					continue;
				}

				if (node.opacity !== undefined && node.opacity !== null) {
					result = node.opacity;
				}
				break;
			}
		}

		return result;
	};

	/**
	 * Set node's opacity stored in active view.
	 *
	 * @param {any} nodeRef The node reference.
	 * @param {float} opacity The node opacity
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @private
	 */
	ViewStateManager.prototype.setRestOpacity = function(nodeRef, opacity) {
		const nodeInfos = this.getCurrentView()?.getNodeInfos();
		nodeInfos?.forEach(function(node) {
			if (node.target !== nodeRef) {
				return;
			}
			node.opacity = opacity;
		});

		return this;
	};

	/**
	 * Replace node's current opacity with its rest opacity stored in active view..
	 *
	 * @param {any} nodeRef The node reference.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @private
	 */
	ViewStateManager.prototype.restoreRestOpacity = function(nodeRef) {
		const nodeInfo = this.getCurrentView()?.getNodeInfos();
		if (nodeInfo) {
			nodeInfo.forEach(function(node) {

				if (node.target !== nodeRef) {
					return;
				}

				var opacity = 1;
				if (node.opacity !== undefined) {
					opacity = node.opacity;
				}
				this.setOpacity(nodeRef, opacity);

			}.bind(this));
		}

		if (this._jointCollection && this._jointCollection.length > 0) {
			this._jointCollection.forEach(function(joint) {
				if (!joint.node || !joint.parent) {
					return;
				}

				if (joint.parent === nodeRef || joint.node === nodeRef) {
					joint.opacity = null;

					if (joint.node.userData) {
						joint.node.userData.offsetOpacity = null;
					}
				}
			});

			this._jointCollection.forEach(function(joint) {
				if (!joint.node || !joint.parent) {
					return;
				}
				if (joint.parent === nodeRef) {
					this._updateJointNode(joint, this._playbackAssociatedWithJoints);
					this.restoreRestOpacity(joint.node);
				}
			}, this);

			this._jointCollection.forEach(function(joint) {
				if (!joint.node || !joint.parent) {
					return;
				}
				if (joint.node === nodeRef) {
					this._updateJointNode(joint, this._playbackAssociatedWithJoints);
				}
			}, this);

			if (this._playbackAssociatedWithJoints) {
				var sequence = this._playbackAssociatedWithJoints.getSequence();
				if (sequence) {
					sequence._fireSequenceChanged();
				}
			}
		}

		return this;
	};

	/**
	 * Copy node's current opacity into its rest opacity stored in active view.
	 *
	 * @param {any} nodeRef The node reference.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @private
	 */
	ViewStateManager.prototype.updateRestOpacity = function(nodeRef) {
		const currentView = this.getCurrentView();
		if (!currentView) {
			return this;
		}

		currentView.getNodeInfos()?.forEach(function(nodeInfo) {
			if (nodeInfo.target === nodeRef) {
				const opacity = this._getOpacity(nodeRef);
				if (opacity != null) {
					nodeInfo.opacity = opacity;
				} else {
					delete nodeInfo.opacity;
				}
			}
		}, this);

		if (this._jointCollection?.length > 0) {
			this._jointCollection.forEach(function(joint) {
				if (!joint.node || !joint.parent) {
					return;
				}

				if (joint.parent === nodeRef || joint.node === nodeRef) {
					joint.opacity = null;

					if (joint.node.userData) {
						joint.node.userData.offsetOpacity = null;
					}
				}
			});

			this._jointCollection.forEach(function(joint) {
				if (!joint.node || !joint.parent) {
					return;
				}
				if (joint.node === nodeRef) {
					this._updateJointNode(joint, this._playbackAssociatedWithJoints);
				}
			}, this);

			if (this._playbackAssociatedWithJoints) {
				var sequence = this._playbackAssociatedWithJoints.getSequence();
				if (sequence) {
					sequence._fireSequenceChanged();
				}
			}
		}

		return this;
	};

	/**
	 * Get node's rest transformation in world coordinates stored in active view.
	 *
	 * @param {any} nodeRef The node reference.
	 * @returns {any} object that contains <code>translation</code>, <code>scale</code>, <code>quaternion</code> components.
	 * @private
	 */
	ViewStateManager.prototype.getRestTransformationWorld = function(nodeRef) {
		const nodeInfo = this.getCurrentView()?.getNodeInfos();

		var result;
		if (nodeInfo) {
			var wMat = new THREE.Matrix4();
			while (nodeRef) {
				for (var i = 0; i < nodeInfo.length; i++) {
					var node = nodeInfo[i];

					if (node.target !== nodeRef) {
						continue;
					}

					var newMatrix;
					if (node.transform) {
						newMatrix = arrayToMatrixThree(node.transform);
					} else if (node[AnimationTrackType.Scale] && node[AnimationTrackType.Rotate] && node[AnimationTrackType.Translate]) {
						var position = new THREE.Vector3(node[AnimationTrackType.Translate][0],
							node[AnimationTrackType.Translate][1],
							node[AnimationTrackType.Translate][2]);

						var rotation = new THREE.Quaternion(node[AnimationTrackType.Rotate][0],
							node[AnimationTrackType.Rotate][1],
							node[AnimationTrackType.Rotate][2],
							node[AnimationTrackType.Rotate][3]);

						var scale = new THREE.Vector3(node[AnimationTrackType.Scale][0],
							node[AnimationTrackType.Scale][1],
							node[AnimationTrackType.Scale][2]);

						newMatrix = new THREE.Matrix4().compose(position, rotation, scale);
					}

					if (newMatrix) {
						wMat.premultiply(newMatrix);
					}

					break;
				}
				nodeRef = nodeRef.parent;
			}
			var po = new THREE.Vector3();
			var ro = new THREE.Quaternion();
			var sc = new THREE.Vector3();
			wMat.decompose(po, ro, sc);
			result = {};
			result.translation = po.toArray();
			result.quaternion = ro.toArray();
			result.scale = sc.toArray();
		}

		if (!result) {
			result = this.getTransformationWorld(nodeRef);
		}
		return result;
	};


	/**
	 * Get node's rest transformation stored in active view.
	 *
	 * @param {any} nodeRef The node reference.
	 * @returns {any} object that contains <code>translation</code>, <code>scale</code>, <code>quaternion</code> components.
	 * @private
	 */
	ViewStateManager.prototype.getRestTransformation = function(nodeRef) {
		const nodeInfo = this.getCurrentView()?.getNodeInfos();

		var result;
		if (nodeInfo) {

			nodeInfo.forEach(function(node) {

				if (node.target !== nodeRef) {
					return;
				}

				if (node.transform) {
					var position = new THREE.Vector3();
					var rotation = new THREE.Quaternion();
					var scale = new THREE.Vector3();
					var newMatrix = arrayToMatrixThree(node.transform);
					newMatrix.decompose(position, rotation, scale);

					result = {};
					result.translation = position.toArray();
					result.quaternion = rotation.toArray();
					result.scale = scale.toArray();
				} else if (node[AnimationTrackType.Scale] && node[AnimationTrackType.Rotate] && node[AnimationTrackType.Translate]) {
					result = {};
					result.translation = node[AnimationTrackType.Translate].slice();
					result.quaternion = node[AnimationTrackType.Rotate].slice();
					result.scale = node[AnimationTrackType.Scale].slice();
				}
			});
		}

		if (!result && nodeRef) {
			result = {};
			result.translation = nodeRef.userData.position ? nodeRef.userData.position.toArray() : nodeRef.position.toArray();
			result.quaternion = nodeRef.userData.quaternion ? nodeRef.userData.quaternion.toArray() : nodeRef.quaternion.toArray();
			result.scale = nodeRef.userData.scale ? nodeRef.userData.scale.toArray() : nodeRef.scale.toArray();
			result.matrix = nodeRef.matrix.clone();
		}
		return result;
	};

	ViewStateManager.prototype._addToTransformation = function(position, translation, quaternion, scale, originalRotationType, euler) {

		var result = {};

		var i;
		if (translation) {
			result.translation = [];
			for (i = 0; i < 3; i++) {
				result.translation.push(translation[i] + position.translation[i]);
			}
		} else {
			result.translation = position.translation;
		}

		if (scale) {
			result.scale = [];
			for (i = 0; i < 3; i++) {
				result.scale.push(scale[i] * position.scale[i]);
			}
		} else {
			result.scale = position.scale;
		}

		if (quaternion) {
			var quat = new THREE.Quaternion(position.quaternion[0], position.quaternion[1], position.quaternion[2], position.quaternion[3]);
			var quata = new THREE.Quaternion(quaternion[0], quaternion[1], quaternion[2], quaternion[3]);
			if (originalRotationType === RotationType.Euler) { // Euler just does addition of X, Y, Z rotation components
				var order = euler ? euler[3] : 6;
				var eul = AnimationMath.threeQuatToNeutralEuler(quat, order);
				var nr = euler ? euler : AnimationMath.threeQuatToNeutralEuler(quata, order);
				eul[0] += nr[0];
				eul[1] += nr[1];
				eul[2] += nr[2];
				result.quaternion = AnimationMath.glMatrixQuatToNeutral(AnimationMath.neutralEulerToGlMatrixQuat(eul));
			} else { // Quaternion and angle-axis rotation are computed with quaternion maths
				var matrix = new THREE.Matrix4().makeRotationFromQuaternion(quat);
				var matrixa = new THREE.Matrix4().makeRotationFromQuaternion(quata);
				matrix.premultiply(matrixa);
				quat.setFromRotationMatrix(matrix);
				result.quaternion = [quat.x, quat.y, quat.z, quat.w];
			}
		} else {
			result.quaternion = position.quaternion;
		}

		return result;
	};

	/**
	 * Set translation/scale/rotation/opacity values came from animation interpolation to a node.
	 * These values are used by various tools and for effective opacity calculations.
	 *
	 * @param {any} nodeRef The node reference.
	 * @param {object} value - Structure containing the transformation components and opacity
	 * @param {float[]} value.rtranslate vector for additional position, array of size 3, optional
	 * @param {float[]} value.rrotate quaternion for additional rotation, array of size 4, optional
	 * @param {float[]} value.rscale vector for additional scaling, array of size 3, optional
	 * @param {float[]} value.Euler vector for Euler rotation, array of size 4, used if value.originalRotationType === Euler
	 * @param {sap.ui.vk.AnimationTrackValueType} value.originalRotationType AngleAxis, Euler, Quaternion
	 * @param {float} value.ropacity value for additional opacity, optional
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @private
	 */
	ViewStateManager.prototype.setInterpolatedRelativeValues = function(nodeRef, value) {

		if (value.rtranslate) {
			nodeRef.userData.offsetTranslation = value.rtranslate;
		} else {
			nodeRef.userData.offsetTranslation = null;
		}

		if (value.rscale) {
			nodeRef.userData.offsetScale = value.rscale;
		} else {
			nodeRef.userData.offsetScale = null;
		}

		if (value.rrotate) {
			nodeRef.userData.offsetQuaternion = value.rrotate;
			nodeRef.userData.originalRotationType = value.originalRotationType;
		} else {
			nodeRef.userData.offsetQuaternion = null;
			nodeRef.userData.originalRotationType = null;
		}

		if (value.Euler) {
			nodeRef.userData.Euler = value.Euler;
		} else {
			nodeRef.userData.Euler = null;
		}

		if (value.ropacity != null) {
			nodeRef.userData.offsetOpacity = value.ropacity;
		} else {
			nodeRef.userData.offsetOpacity = null;
		}

		return this;
	};

	ViewStateManager.prototype._setJointNodeMatrix = function() {
		if (this._jointCollection && this._jointCollection.length > 0) {
			this._jointCollection.forEach(function(joint) {
				if (!joint.node || !joint.parent) {
					return;
				}

				var node = joint.node;

				if (node.userData.skipUpdateJointNode) {
					return;
				}

				var position = {};
				position.translation = joint.translation.slice();
				position.scale = joint.scale.slice();
				position.quaternion = joint.quaternion.slice();
				var newTransformation = this._addToTransformation(position, node.userData.offsetTranslation,
					node.userData.offsetQuaternion,
					node.userData.offsetScale,
					node.userData.originalRotationType,
					node.userData.Euler);

				node.position.fromArray(newTransformation.translation);
				node.scale.fromArray(newTransformation.scale);
				node.quaternion.fromArray(newTransformation.quaternion);
				node.updateMatrix();

				var jointQuaternion = node.quaternion.clone();

				var jointParentMatrix = new THREE.Matrix4();
				if (joint.parent) {
					joint.parent.updateMatrixWorld();
					jointParentMatrix = joint.parent.matrixWorld.clone();
					node.matrixWorld.multiplyMatrices(joint.parent.matrixWorld, node.matrix);
				} else {
					node.matrixWorld.copy(node.matrix);
				}

				var nodeParentMatrix = new THREE.Matrix4();
				if (node.parent) {
					node.parent.updateWorldMatrix(true, false); // update ancestor world matrices
					nodeParentMatrix.copy(node.parent.matrixWorld);
					node.matrix.copy(node.parent.matrixWorld).invert().multiply(node.matrixWorld);
				} else {
					node.matrix.copy(node.matrixWorld);
				}

				node.matrix.decompose(node.position, node.quaternion, node.scale);
				// node.matrixWorldNeedsUpdate = false;

				var scale = [node.scale.x, node.scale.y, node.scale.z];
				this._adjustQuaternionAndScale(jointParentMatrix, nodeParentMatrix, jointQuaternion, node.quaternion, newTransformation.scale, scale);
				node.scale.x = scale[0];
				node.scale.y = scale[1];
				node.scale.z = scale[2];

				node.children.forEach(function(child) { child.updateMatrixWorld(true); });

				if (joint.nodesToUpdate) {// update dependent intermediate nodes
					joint.nodesToUpdate.forEach(function(subnode) {
						if (subnode.matrixAutoUpdate) { subnode.updateMatrix(); }
						subnode.matrixWorld.multiplyMatrices(subnode.parent.matrixWorld, subnode.matrix);
						// subnode.matrixWorldNeedsUpdate = false;
					});
				}
			}, this);
		}
	};

	/**
	 * Get node property relative to rest position, defined by the last key in last playback.
	 *
	 * @param {any} nodeRef node reference
	 * @param {sap.ui.vk.AnimationTrackType} property translate/rotate/scale/opacity
	 * @returns {float[] | float} translate/rotate/scale/opacity
	 * @private
	 */
	ViewStateManager.prototype._getEndPropertyInLastPlayback = function(nodeRef, property) {

		var propertyValue;

		var currentView = this.getCurrentView();
		if (!currentView) {
			return propertyValue;
		}

		var playbacks = currentView.getPlaybacks();
		if (!playbacks || !playbacks.length) {
			return propertyValue;
		}

		for (var k = playbacks.length - 1; k >= 0; k--) {
			var lastPlayback = playbacks[k];
			var lastSequence = lastPlayback.getSequence();
			if (lastSequence._convertedFromAbsolute) { // old sequence
				return propertyValue;
			}
			propertyValue = lastPlayback.getNodeBoundaryProperty(nodeRef, property, true);
			if (propertyValue) {
				break;
			}
		}

		return propertyValue;
	};

	/**
	 * Get node property relative to rest position, defined by the last key of previous playback.
	 *
	 * @param {any} nodeRef node reference
	 * @param {sap.ui.vk.AnimationTrackType} property translate/rotate/scale/opacity
	 * @param {sap.ui.vk.AnimationPlayback} playback current playback
	 * @param {boolean} includeJointNode default false as end properties are already used for joint calculation
	 * @returns {float[] | float} translate/rotate/scale/opacity
	 * @private
	 */
	ViewStateManager.prototype._getEndPropertyInPreviousPlayback = function(nodeRef, property, playback, includeJointNode) {

		var propertyValue;
		var joint = this._getJointByChildNode(nodeRef);
		if (joint && !includeJointNode) {
			return propertyValue;
		}

		var sequence = playback.getSequence();
		if (sequence && sequence._convertedFromAbsolute) {
			return propertyValue;
		}

		var currentView = this.getCurrentView();
		if (!currentView) {
			return propertyValue;
		}

		var playbacks = currentView.getPlaybacks();
		for (var i = 1; i < playbacks.length; i++) {
			var pb = playbacks[i];
			if (pb !== playback) {
				continue;
			}

			for (var j = i - 1; j >= 0; j--) {
				var previousPlayback = playbacks[j];
				propertyValue = previousPlayback.getNodeBoundaryProperty(nodeRef, property, true);
				if (propertyValue) {
					break;
				}
			}
		}

		return propertyValue;
	};


	/**
	 * Convert translate, rotate, and scale tracks in absolute values to the values relative to the rest position defined with active view.
	 *
	 * @param {sap.ui.vk.AnimationSequence} sequence animation sequence
	 * @param {boolean} reversedPlayback true if sequence is in reversed playback
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @private
	 */
	ViewStateManager.prototype._convertTracksToRelative = function(sequence, reversedPlayback) {

		if ((reversedPlayback && sequence._conversionDoneForReversed) || (!reversedPlayback && sequence._conversionDone)) {
			return this;
		}

		sequence._convertedFromAbsolute = false;

		var currentView = this.getCurrentView();
		if (!currentView) {
			return this;
		}

		var nodesAnimation = sequence.getNodeAnimation();
		if (!nodesAnimation || !nodesAnimation.length) {
			return this;
		}

		var nodeInfo = currentView.getNodeInfos();

		if (nodeInfo) {

			nodeInfo.forEach(function(node) {

				var nodeAnimation;
				for (var i = 0; i < nodesAnimation.length; i++) {
					if (node.target === nodesAnimation[i].nodeRef) {
						nodeAnimation = nodesAnimation[i];
						break;
					}
				}

				if (!nodeAnimation) {
					return;
				}

				var startT = [0, 0, 0];
				var startS = [1, 1, 1];
				var startQ = new THREE.Quaternion();
				var position = new THREE.Vector3();
				var scale = new THREE.Vector3();

				if (node.transform) {
					var newMatrix = arrayToMatrixThree(node.transform);
					newMatrix.decompose(position, startQ, scale);
					startT = position.toArray();
					startS = scale.toArray();
				} else if (node[AnimationTrackType.Scale] && node[AnimationTrackType.Rotate] && node[AnimationTrackType.Translate]) {
					startT = node[AnimationTrackType.Translate].slice();
					startQ = new THREE.Quaternion(node[AnimationTrackType.Rotate][0], node[AnimationTrackType.Rotate][1],
						node[AnimationTrackType.Rotate][2], node[AnimationTrackType.Rotate][3]);
					startS = node[AnimationTrackType.Scale].slice();
				} else {
					node.target.matrix.decompose(position, startQ, scale);
					startT = position.toArray();
					startS = scale.toArray();
				}

				var j, count, key, value;
				var translateTrack = nodeAnimation[AnimationTrackType.Translate];
				if (translateTrack && translateTrack.getIsAbsoluteValue()) {
					count = translateTrack.getKeysCount();
					for (j = 0; j < count; j++) {
						key = translateTrack.getKey(j);
						value = [key.value[0] - startT[0], key.value[1] - startT[1], key.value[2] - startT[2]];
						translateTrack.updateKey(j, value, true);
					}
					translateTrack.setIsAbsoluteValue(false);
					sequence._convertedFromAbsolute = true;
				}

				var scaleTrack = nodeAnimation[AnimationTrackType.Scale];
				if (scaleTrack && scaleTrack.getIsAbsoluteValue()) {
					count = scaleTrack.getKeysCount();
					for (j = 0; j < count; j++) {
						key = scaleTrack.getKey(j);
						value = [key.value[0] / startS[0], key.value[1] / startS[1], key.value[2] / startS[2]];
						scaleTrack.updateKey(j, value, true);
					}
					scaleTrack.setIsAbsoluteValue(false);
					sequence._convertedFromAbsolute = true;
				}

				var opacityTrack = nodeAnimation[AnimationTrackType.Opacity];
				if (opacityTrack && opacityTrack.getIsAbsoluteValue()) {
					var restOpacity = this.getRestOpacity(node.target);
					// assuming rest opacity as 1, rely on opacity track at time 0 for correct opacity in rest position
					if (!restOpacity) {
						restOpacity = 1.0;
					}

					count = opacityTrack.getKeysCount();
					for (j = 0; j < count; j++) {
						key = opacityTrack.getKey(j);
						value = key.value / restOpacity;
						opacityTrack.updateKey(j, value, true);
					}
					opacityTrack.setIsAbsoluteValue(false);
					sequence._convertedFromAbsolute = true;
				}

				var rotateTrack = nodeAnimation[AnimationTrackType.Rotate];
				if (rotateTrack && rotateTrack.getIsAbsoluteValue()) {

					var quaternion;
					var startRMatrix = new THREE.Matrix4().makeRotationFromQuaternion(startQ);
					var invStartRMatrix = new THREE.Matrix4().copy(startRMatrix).invert();
					var aMatrix = new THREE.Matrix4();
					var rMatrix = new THREE.Matrix4();
					count = rotateTrack.getKeysCount();
					var valueType = rotateTrack.getKeysType();

					for (j = 0; j < count; j++) {
						key = rotateTrack.getKey(j);
						if (valueType === AnimationTrackValueType.Quaternion) {

							quaternion = new THREE.Quaternion(key.value[0], key.value[1], key.value[2], key.value[3]);
							aMatrix.makeRotationFromQuaternion(quaternion);
							rMatrix.multiplyMatrices(aMatrix, invStartRMatrix);
							quaternion.setFromRotationMatrix(rMatrix);
							value = quaternion.toArray();
							rotateTrack.updateKey(j, value, true);

						} else if (valueType === AnimationTrackValueType.Euler) {

							var k = key.value;
							var e0 = AnimationMath.threeQuatToNeutralEuler(startQ, k[3]);
							value = [k[0] - e0[0] + AnimationMath.getModulatedAngularValue(k[0]),
							k[1] - e0[1] + AnimationMath.getModulatedAngularValue(k[1]),
							k[2] - e0[2] + AnimationMath.getModulatedAngularValue(k[2]),
							k[3]];
							rotateTrack.updateKey(j, value, true);

						} else if (j === 0) { // only change first key of angular axis

							var axis = new THREE.Vector3(key.value[0], key.value[1], key.value[2]);
							aMatrix.makeRotationAxis(axis, key.value[3]);
							rMatrix.multiplyMatrices(aMatrix, invStartRMatrix);
							quaternion = new THREE.Quaternion().setFromRotationMatrix(rMatrix);
							value = this._convertQuaternionToAngleAxis(quaternion);
							rotateTrack.updateKey(j, value, true);
							break;
						}
					}
					rotateTrack.setIsAbsoluteValue(false);
					sequence._convertedFromAbsolute = true;
				}
			}.bind(this));
		}

		if (!reversedPlayback) {
			sequence._conversionDone = true;
			sequence._conversionDoneForReversed = false;
		} else {
			sequence._conversionDone = false;
			sequence._conversionDoneForReversed = true;
		}

		return this;
	};

	ViewStateManager.prototype._getTrackKeys = function(track) {
		var keys = [];
		var count = track.getKeysCount();

		for (var j = 0; j < count; j++) {
			var key = track.getKey(j);
			var value;
			if (Array.isArray(key.value)) {
				value = key.value.slice();
			} else {
				value = key.value;
			}

			keys.push({
				time: key.time,
				value: value
			});

		}

		return keys;
	};

	/**
	 * Reset joint node offsets, which are scale/translation/quaternion relative to rest position in animation track.
	 * Called by scale/move/rotate tools to evaluate offset values under joint, as tools only make changes under scene tree
	 *
	 * @param {any} nodeRef node reference
	 * @param {sap.ui.vk.AnimationTrackType} trackType animation track type
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @private
	 */
	ViewStateManager.prototype._setJointNodeOffsets = function(nodeRef, trackType) {
		var joint = this._getJointByChildNode(nodeRef);
		if (joint) {
			var nodeParentMatrix = new THREE.Matrix4();
			if (nodeRef.parent) {
				nodeParentMatrix = nodeRef.parent.matrixWorld.clone();
			}

			var nodeMatrix = new THREE.Matrix4();
			nodeRef.updateMatrixWorld();
			var jointParentMatrix = new THREE.Matrix4();
			if (joint.parent) {
				joint.parent.updateMatrixWorld();
				jointParentMatrix = joint.parent.matrixWorld.clone();
				nodeMatrix.copy(joint.parent.matrixWorld).invert().multiply(nodeRef.matrixWorld);
			} else {
				nodeMatrix.copy(nodeRef.matrixWorld);
			}

			var position = new THREE.Vector3();
			var scale = new THREE.Vector3();
			var quaternion = new THREE.Quaternion();
			nodeMatrix.decompose(position, quaternion, scale);

			if (trackType === AnimationTrackType.Translate) {
				var currentTranslation = position.toArray();
				nodeRef.userData.offsetTranslation = [currentTranslation[0] - joint.translation[0],
				currentTranslation[1] - joint.translation[1],
				currentTranslation[2] - joint.translation[2]];
			} else if (trackType === AnimationTrackType.Scale) {

				var currentScale = scale.toArray();

				this._adjustQuaternionAndScale(nodeParentMatrix, jointParentMatrix, nodeRef.quaternion, quaternion, nodeRef.scale.toArray(), currentScale);

				nodeRef.userData.offsetScale = [currentScale[0] / joint.scale[0],
				currentScale[1] / joint.scale[1],
				currentScale[2] / joint.scale[2]];

			} else {
				this._adjustQuaternionAndScale(nodeParentMatrix, jointParentMatrix, nodeRef.quaternion, quaternion, nodeRef.scale.toArray(), scale.toArray());

				var startQ = new THREE.Quaternion(joint.quaternion[0], joint.quaternion[1], joint.quaternion[2], joint.quaternion[3]);
				var startRMatrix = new THREE.Matrix4().makeRotationFromQuaternion(startQ);
				var invStartRMatrix = new THREE.Matrix4().copy(startRMatrix).invert();
				var aMatrix = new THREE.Matrix4().makeRotationFromQuaternion(quaternion);
				var rMatrix = new THREE.Matrix4().multiplyMatrices(aMatrix, invStartRMatrix);
				var offsetQ = new THREE.Quaternion().setFromRotationMatrix(rMatrix);
				nodeRef.userData.offsetQuaternion = offsetQ.toArray();
			}
		}

		return this;
	};

	/**
	 * Add key to a translation track according to the current node position
	 *
	 * @param {any} nodeRef The node reference of the translation track
	 * @param {float} time The time for the key
	 * @param {sap.ui.vk.AnimationPlayback} playback The animation playback containing the sequence which in turn contains the translation track
	 * @param {boolean} blockTrackChangedEvent  block event for track changed, optional, if creating keys in batch, for each playback,
	 * 											only set to false at last, set to true for other operations, so event is only fired once
	 * @returns {any} object contains the follow fields
	 * 			{float[]} <code>keyValue</code> translation relative to end position of previous sequence
	 * 			{float[]} <code>offset</code> translation of end position of previous sequence relative to rest position
	 *   		{float[]} <code>absoluteValue</code> node translation
	 * 			{any} <code>PreviousTrack</code> array of keys (time and value)
	 * 			{any} <code>CurrentTrack</code> array of keys (time and value)
	 * @private
	 */
	ViewStateManager.prototype.setTranslationKey = function(nodeRef, time, playback, blockTrackChangedEvent) {
		var sequence = playback.getSequence();
		if (!sequence) {
			return null;
		}

		var restTranslation;

		var position = new THREE.Vector3();
		nodeRef.matrix.decompose(position, new THREE.Quaternion(), new THREE.Vector3());

		var joint = this._getJointByChildNode(nodeRef);
		if (joint) {
			restTranslation = joint.translation.slice();
			nodeRef.updateMatrixWorld();
			var nodeMat = new THREE.Matrix4();
			if (joint.parent) {
				joint.parent.updateMatrixWorld();
				nodeMat.copy(joint.parent.matrixWorld).invert().multiply(nodeRef.matrixWorld);
			} else {
				nodeMat.matrix.copy(nodeRef.matrixWorld);
			}
			nodeMat.decompose(position, new THREE.Quaternion(), new THREE.Vector3());

		} else {
			var restTrans = this.getRestTransformation(nodeRef);
			restTranslation = restTrans.translation;
		}

		var currentTranslation = position.toArray();
		var value = [currentTranslation[0] - restTranslation[0],
		currentTranslation[1] - restTranslation[1],
		currentTranslation[2] - restTranslation[2]];


		var offset = this._getEndPropertyInPreviousPlayback(nodeRef, AnimationTrackType.Translate, playback);
		if (offset) {
			value[0] -= offset[0];
			value[1] -= offset[1];
			value[2] -= offset[2];
		}

		var track = sequence.getNodeAnimation(nodeRef, AnimationTrackType.Translate);

		var oldTrack;
		if (!track) {
			track = this._scene.createTrack(null, {
				trackValueType: AnimationTrackValueType.Vector3,
				isAbsoluteValue: false
			});
			sequence.setNodeAnimation(nodeRef, AnimationTrackType.Translate, track, true);
		} else {
			oldTrack = this._getTrackKeys(track);
		}

		track.insertKey(time, value, blockTrackChangedEvent);
		var newTrack = this._getTrackKeys(track);

		return { KeyValue: value, absoluteValue: currentTranslation, offset: offset, PreviousTrack: oldTrack, CurrentTrack: newTrack };
	};

	// For maintaining the signs of scale components when converting between scale under joint parent and under scene parent
	// To overcome the problem caused by threejs decompose function, which always puts negative sign in x scale.
	ViewStateManager.prototype._adjustQuaternionAndScale = function(parentMatrix1, parentMatrix2, quaternion1, quaternion2, scale1, scale2) {
		function getClosestAligned(v, v1, v2, v3) {
			var d1 = Math.abs(v.dot(v1));
			var d2 = Math.abs(v.dot(v2));
			var d3 = Math.abs(v.dot(v3));

			if (d1 >= d2 && d1 >= d3) {
				return 0;
			} else if (d2 >= d1 && d2 >= d3) {
				return 1;
			} else {
				return 2;
			}
		}

		if (scale1[0] > 0 && scale1[1] > 0 && scale1[2] > 0) {
			return;
		}
		var mat1 = parentMatrix1.clone().multiply(new THREE.Matrix4().makeRotationFromQuaternion(quaternion1));
		var rotMat2 = new THREE.Matrix4().makeRotationFromQuaternion(quaternion2);
		var mat2 = parentMatrix2.clone().multiply(rotMat2);

		var vx1 = new THREE.Vector3();
		var vy1 = new THREE.Vector3();
		var vz1 = new THREE.Vector3();
		mat1.extractBasis(vx1, vy1, vz1);
		var basis1 = [vx1, vy1, vz1];

		var vx2 = new THREE.Vector3();
		var vy2 = new THREE.Vector3();
		var vz2 = new THREE.Vector3();
		mat2.extractBasis(vx2, vy2, vz2);

		var scale = [1, 1, 1];
		for (var i = 0; i < 3; i++) {
			var index = getClosestAligned(basis1[i], vx2, vy2, vz2);
			if (scale1[i] * scale2[index] < 0) {
				scale[index] = -1;
				scale2[index] = -scale2[index];
			}
		}

		rotMat2.scale(new THREE.Vector3(scale[0], scale[1], scale[2]));

		var quat2 = new THREE.Quaternion().setFromRotationMatrix(rotMat2);
		quaternion2.x = quat2.x;
		quaternion2.y = quat2.y;
		quaternion2.z = quat2.z;
		quaternion2.w = quat2.w;
	};

	/**
	 * Add key to a scale track according to the current node scale
	 *
	 * @param {any} nodeRef The node reference of the scale track
	 * @param {float} time The time for the key
	 * @param {sap.ui.vk.AnimationPlayback} playback The animation playback containing the sequence which in turn contains the scale track
	 * @param {boolean} blockTrackChangedEvent  block event for track changed, optional, if creating keys in batch, for each playback,
	 * 											only set to false at last, set to true for other operations, so event is only fired once
	 * @returns {any} object contains the follow fields
	 * 			{float[]} <code>keyValue</code> scale relative to end position of previous sequence
	 * 			{float[]} <code>offset</code> scale of end position of previous sequence relative to rest position
	 *   		{float[]} <code>absoluteValue</code> scale
	 * 			{any} <code>PreviousTrack</code> array of keys (time and value)
	 * 			{any} <code>CurrentTrack</code> array of keys (time and value)
	 * @private
	 */
	ViewStateManager.prototype.setScaleKey = function(nodeRef, time, playback, blockTrackChangedEvent) {
		var sequence = playback.getSequence();
		if (!sequence) {
			return null;
		}

		var restScale;

		var currentScale = nodeRef.scale.toArray();
		var nodeQuaternion = nodeRef.quaternion.clone();
		// nodeRef.matrix.decompose(new THREE.Vector3(), quaternion, scale);

		var joint = this._getJointByChildNode(nodeRef);
		if (joint) {
			var nodeParentMatrix = new THREE.Matrix4();
			if (nodeRef.parent) {
				nodeParentMatrix = nodeRef.parent.matrixWorld.clone();
			}

			restScale = joint.scale.slice();

			nodeRef.updateMatrixWorld();
			var nodeMat = new THREE.Matrix4();

			var jointParentMatrix = new THREE.Matrix4();
			if (joint.parent) {
				joint.parent.updateMatrixWorld();
				jointParentMatrix = joint.parent.matrixWorld.clone();
				nodeMat.copy(joint.parent.matrixWorld).invert().multiply(nodeRef.matrixWorld);
			} else {
				nodeMat.copy(nodeRef.matrixWorld);
			}

			var quaternion = new THREE.Quaternion();
			var scale = new THREE.Vector3();
			nodeMat.decompose(new THREE.Vector3(), quaternion, scale);

			var qScaleArray = scale.toArray();
			this._adjustQuaternionAndScale(nodeParentMatrix,
				jointParentMatrix,
				nodeQuaternion,
				quaternion,
				currentScale,
				qScaleArray);
			currentScale = qScaleArray;

		} else {
			var restTrans = this.getRestTransformation(nodeRef);
			restScale = restTrans.scale;
		}

		var value = [currentScale[0] / restScale[0],
		currentScale[1] / restScale[1],
		currentScale[2] / restScale[2]];

		var offset = this._getEndPropertyInPreviousPlayback(nodeRef, AnimationTrackType.Scale, playback);
		if (offset) {
			value[0] /= offset[0];
			value[1] /= offset[1];
			value[2] /= offset[2];
		}

		var track = sequence.getNodeAnimation(nodeRef, AnimationTrackType.Scale);

		var oldTrack;
		if (!track) {
			track = this._scene.createTrack(null, {
				trackValueType: AnimationTrackValueType.Vector3,
				isAbsoluteValue: false
			});
			sequence.setNodeAnimation(nodeRef, AnimationTrackType.Scale, track, true);
		} else {
			oldTrack = this._getTrackKeys(track);
		}

		track.insertKey(time, value, blockTrackChangedEvent);
		var newTrack = this._getTrackKeys(track);

		return { KeyValue: value, absoluteValue: currentScale, offset: offset, PreviousTrack: oldTrack, CurrentTrack: newTrack };
	};

	/**
	 * Add key to a rotation track
	 *
	 * @param {any} nodeRef The node reference of the scale track
	 * @param {float} time The time for the key
	 * @param {float[]} euler The euler rotation relative to the end position of previous sequence or rest position for the first sequence
	 * @param {sap.ui.vk.AnimationPlayback} playback The animation playback containing the sequence which in turn contains the rotation track
	 * @param {boolean} blockTrackChangedEvent  block event for track changed, optional, if creating keys in batch, for each playback,
	 * 											only set to false at last, set to true for other operations, so event is only fired once
	 * @returns {any} null if existing track is not euler, if no existing track or existing track is euler, object contains the follow fields
	 * 			{float[]} <code>keyValue</code> euler rotation relative to end position of previous sequence
	 * 			{float[]} <code>offset</code> quaternion of end position of previous sequence relative to rest position
	 *   		{float[]} <code>absoluteValue</code> quaternion rotation
	 * 			{any} <code>PreviousTrack</code> array of keys (time and value)
	 * 			{any} <code>CurrentTrack</code> array of keys (time and value)
	 *
	 * @private
	 */
	ViewStateManager.prototype.setRotationKey = function(nodeRef, time, euler, playback, blockTrackChangedEvent) {
		var sequence = playback.getSequence();
		if (!sequence) {
			return null;
		}
		var order = 36; // "XYZ"
		var value = [euler[0], euler[1], euler[2], order];


		var track = sequence.getNodeAnimation(nodeRef, AnimationTrackType.Rotate);

		if (track && track.getKeysType() !== AnimationTrackValueType.Euler) {
			return null;
		}

		var oldTrack;
		if (!track) {
			track = this._scene.createTrack(null, {
				trackValueType: AnimationTrackValueType.Euler,
				isAbsoluteValue: false
			});
			sequence.setNodeAnimation(nodeRef, AnimationTrackType.Rotate, track, true);
		} else {
			oldTrack = this._getTrackKeys(track);
		}

		track.insertKey(time, value, blockTrackChangedEvent);
		var newTrack = this._getTrackKeys(track);

		var quat = new THREE.Quaternion();
		var eulerRotation = new THREE.Euler(euler[0], euler[1], euler[2]);
		quat.setFromEuler(eulerRotation);

		var offset = this._getEndPropertyInPreviousPlayback(nodeRef, AnimationTrackType.Rotate, playback);
		if (offset) {
			var offsetQuat = new THREE.Quaternion(offset[0], offset[1], offset[2], offset[3]);
			quat.multiply(offsetQuat);
		}

		var joint = this._getJointByChildNode(nodeRef);
		var restQuat = new THREE.Quaternion();
		if (joint) {
			restQuat.fromArray(joint.quaternion);
		} else {
			var restTrans = this.getRestTransformation(nodeRef);
			restQuat.fromArray(restTrans.quaternion);
		}

		quat.multiply(restQuat);

		return { KeyValue: value, absoluteValue: quat.toArray(), offset: offset, PreviousTrack: oldTrack, CurrentTrack: newTrack };
	};

	/**
	 * Add an axis-angle key to the animation track.
	 *
	 * @param {any} nodeRef A node reference to add the key for.
	 * @param {float} time A time of the key.
	 * @param {float[]} axisAngle An axis-angle rotation value.
	 * @param {sap.ui.vk.AnimationPlayback} playback A playback containing a sequence owning the track.
	 * @param {*} blockTrackChangedEvent A flag to indicate whether to block firing events.
	 * @returns {object|null} An object with the following properties:
	 *   <ul>
	 *     <li><code>KeyValue: float[]</code> - an axis-angle value of the key</li>
	 *     <li><code>PreviousTrack - object[]</code> - the track's old keys.</li>
	 *     <li><code>CurrentTrack: object[]</code> - the track's new keys.</li>
	 *   </ul>
	 * @private
	 */
	ViewStateManager.prototype.setAxisAngleRotationKey = function(nodeRef, time, axisAngle, playback, blockTrackChangedEvent) {
		var sequence = playback.getSequence();
		if (!sequence) {
			return null;
		}

		var track = sequence.getNodeAnimation(nodeRef, AnimationTrackType.Rotate);
		if (track && track.getKeysType() !== AnimationTrackValueType.AngleAxis) {
			if (!track.setKeysType(AnimationTrackValueType.AngleAxis)) {
				// Log.error()
				return null;
			}
		}

		var value = [axisAngle[0], axisAngle[1], axisAngle[2], axisAngle[3]];

		var oldTrack;
		if (!track) {
			track = this._scene.createTrack(null, {
				trackValueType: AnimationTrackValueType.AngleAxis,
				isAbsoluteValue: false
			});
			sequence.setNodeAnimation(nodeRef, AnimationTrackType.Rotate, track, true);
		} else {
			oldTrack = this._getTrackKeys(track);
		}

		track.insertKey(time, value, blockTrackChangedEvent);
		var newTrack = this._getTrackKeys(track);

		return { KeyValue: value, PreviousTrack: oldTrack, CurrentTrack: newTrack };
	};

	/**
	 * Get total opacity - product of all the ancestors' opacities and its own opacity
	 *
	 * @param {any} nodeRef The node reference of the opacity track
	 * @returns {float} total opacity
	 * @private
	 */
	ViewStateManager.prototype.getTotalOpacity = function(nodeRef) {
		return nodeRef._vkGetTotalOpacity(this._jointCollection, this);
	};

	/**
	 * Set total opacity using current opacity - product of all the ancestors' opacities and its own opacity
	 * The node's opacity is re-calculated based on the total opacity
	 * if the parent's total opacity is zero, the node's total opacity is zero, the node's opacity is not changed
	 *
	 * @param {any} nodeRef The node reference of the opacity track
	 * @param {float} totalOpacity product of all the ancestors' opacities and its own opacity
	 * @returns {any} object contains <code>opacity</code> and <code>totalOpacity</code>
	 * @private
	 */
	ViewStateManager.prototype.setTotalOpacity = function(nodeRef, totalOpacity) {

		var parentTotal = 1;
		var joint = this._getJointByChildNode(nodeRef);
		if (joint && joint.parent) {
			parentTotal = joint.parent._vkGetTotalOpacity(this._jointCollection, this);
		} else if (nodeRef.parent) {
			parentTotal = nodeRef.parent._vkGetTotalOpacity(this._jointCollection, this);
		}

		let opacity = this._getOpacity(nodeRef);

		if (parentTotal !== 0.0) {
			opacity = totalOpacity / parentTotal;
		} else {
			totalOpacity = 0.0;
		}

		this.setOpacity(nodeRef, opacity);

		var eventParameters = {
			changed: nodeRef,
			opacity
		};

		this.fireOpacityChanged(eventParameters);

		return { opacity, totalOpacity };
	};

	/**
	 * Add key to a opacity track according to the opacity of current node
	 *
	 * @param {any} nodeRef The node reference of the opacity track
	 * @param {float} time The time for the key
	 * @param {sap.ui.vk.AnimationPlayback} playback The animation playback containing the sequence which in turn contains the opacity track
	 * @param {boolean} blockTrackChangedEvent  block event for track changed, optional, if creating keys in batch, for each playback,
	 * 											only set to false at last, set to true for other operations, so event is only fired once
	 * @returns {any} null if existing track is not euler, if no existing track or existing track is euler, object contains the follow fields
	 * 			{float} <code>keyValue</code> scale relative to rest position
	 *   		{float} <code>totalOpacity</code> scale
	 * 			{any} <code>PreviousTrack</code> array of keys (time and value)
	 * 			{any} <code>CurrentTrack</code> array of keys (time and value)
	 * @private
	 */
	ViewStateManager.prototype.setOpacityKey = function(nodeRef, time, playback, blockTrackChangedEvent) {
		var sequence = playback.getSequence();
		if (!sequence) {
			return null;
		}

		let value = this.getOpacity(nodeRef) ?? 1;

		var restOpacity = this.getRestOpacity(nodeRef);
		// for converted absolute track, 0 rest opacity is assumed to be 1 when being converted to relative track
		if (!restOpacity && sequence._convertedFromAbsolute) {
			restOpacity = 1;
		}
		value /= restOpacity;

		var offsetOpacity = this._getEndPropertyInPreviousPlayback(nodeRef, AnimationTrackType.Opacity, playback);
		if (offsetOpacity) {
			value /= offsetOpacity;
		}

		var track = sequence.getNodeAnimation(nodeRef, AnimationTrackType.Opacity);

		var oldTrack;
		if (!track) {
			track = this._scene.createTrack(null, {
				trackValueType: AnimationTrackValueType.Opacity
			});
			sequence.setNodeAnimation(nodeRef, AnimationTrackType.Opacity, track, true);
		} else {
			oldTrack = this._getTrackKeys(track);
		}

		track.insertKey(time, value, blockTrackChangedEvent);
		var newTrack = this._getTrackKeys(track);

		return { KeyValue: value, totalOpacity: this.getTotalOpacity(nodeRef), PreviousTrack: oldTrack, CurrentTrack: newTrack };
	};

	////////////////////////////////////////////////////////////////////////////
	// BEGIN: VisibilityTracker

	// Visibility Tracker is an object which keeps track of visibility changes.
	// These changes will be used in Viewport getViewInfo/setViewInfo
	VisibilityTracker = function() {
		// all visibility changes are saved in a Set. When a node changes visibility,
		// we add that id to the Set. When the visibility is changed back, we remove
		// the node reference from the set.
		this._visibilityChanges = new Set();
	};

	// It returns an object with all the relevant information about the node visibility
	// changes. In this case, we need to retrieve a list of all nodes that suffered changes
	// and an overall state against which the node visibility changes is applied.
	// For example: The overall visibility state is ALL VISIBLE and these 2 nodes changed state.
	VisibilityTracker.prototype.getInfo = function(nodeHierarchy) {
		// converting the collection of changed node references to ve ids
		var changedNodes = [];
		this._visibilityChanges.forEach(function(nodeRef) {
			// create node proxy based on dynamic node reference
			var nodeProxy = nodeHierarchy.createNodeProxy(nodeRef);
			var veId = nodeProxy.getVeId();
			// destroy the node proxy
			nodeHierarchy.destroyNodeProxy(nodeProxy);
			if (veId) {
				changedNodes.push(veId);
			} else {
				changedNodes.push(nodeHierarchy.getScene().nodeRefToPersistentId(nodeRef));
			}
		});

		return changedNodes;
	};

	// It clears all the node references from the _visibilityChanges set.
	// This action can be performed for example, when a step is activated or
	// when the nodes are either all visible or all not visible.
	VisibilityTracker.prototype.clear = function() {
		this._visibilityChanges.clear();
	};

	// If a node suffers a visibility change, we check if that node is already tracked.
	// If it is, we remove it from the list of changed nodes. If it isn't, we add it.
	VisibilityTracker.prototype.trackNodeRef = function(nodeRef) {
		if (this._visibilityChanges.has(nodeRef)) {
			this._visibilityChanges.delete(nodeRef);
		} else {
			this._visibilityChanges.add(nodeRef);
		}
	};

	// END: VisibilityTracker
	////////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////////
	// BEGIN: `selectable` property
	//
	// In this implementation we prefer to optimize the `setSelectable` method and make the
	// `getSelectable` method non-optimized as the `selectable` property is going to be used rarely
	// and for specific use cases to mark some nodes as unselectable in the viewport.
	//
	// We assign values to the `selectable` property only for nodes that are passed to method
	// `setSelectable` and do not propagate it *explicitly* to the descendants because the
	// descendants will be filtered out implicitly the same way as the `hidden` nodes based on the
	// `visible` property during the HitTester.hitTest scene traversal.

	function getSelectable(nodeRef) {
		// This implementation is not optimal but very simple. We expect that the `getSelectable`
		// method will not be called often. And the `HitTester.hitTest` method will check the
		// `userData.selectable` property directly.
		//
		// If the `selectable` property is assigned on the the node itself we return it otherwise we
		// find the closest ancestor with the `selectable` property assigned a non-null value.
		while (!nodeRef.isScene) {
			var value = nodeRef.userData.selectable;
			if (value != null) {
				return value;
			}
			nodeRef = nodeRef.parent;
		}

		// By default the node is *selectable*.
		return true;
	}

	ViewStateManager.prototype.getSelectable = function(nodeRefs) {
		if (Array.isArray(nodeRefs)) {
			return nodeRefs.map(getSelectable);
		} else {
			return getSelectable(nodeRefs);
		}
	};

	ViewStateManager.prototype.setSelectable = function(nodeRefs, selectable) {
		if (!Array.isArray(nodeRefs)) {
			nodeRefs = [nodeRefs];
		}

		nodeRefs.forEach(function(nodeRef) {
			nodeRef.userData.selectable = selectable;
		});

		return this;
	};

	// END: `selectable` property
	////////////////////////////////////////////////////////////////////////////

	ViewStateManager.prototype.updateAssociatedMarkerMatrix = function() {
		var sceneBuilder = this._scene ? this._scene.getSceneBuilder() : null;
		if (sceneBuilder) {
			let markerAssociations = sceneBuilder.getAllNodesWithBoundMarkers();
			if (markerAssociations) {
				markerAssociations.forEach((markerNodeIds, nodeId) => {
					const nodeRef = this._scene.persistentIdToNodeRef(nodeId);
					if (nodeRef) {
						var worldMatrix = nodeRef.matrixWorld;
						markerNodeIds.forEach((marker, key) => {
							if (marker.coordinateSpace !== this._scene.PoiCoordinateSpaces.ReferenceNodeSpace) {
								return;
							}
							const markerNode = this._scene.persistentIdToNodeRef(key);
							if (markerNode?.visible) {
								const transform = markerNode.userData.treeNode?.transform;
								if (transform) {
									let matrix = arrayToMatrixThree(transform);
									matrix.premultiply(worldMatrix);
									matrix.decompose(markerNode.position, markerNode.quaternion, markerNode.scale);
									markerNode.updateMatrix();
								}
							}
						});
					}
				});
			}
		}
	};

	ViewStateManager.prototype._getNodeState = function(nodeRef, createIfNotExists) {
		const nodeStates = this._nodeStates;
		let state = nodeStates.get(nodeRef);
		if (state == null && createIfNotExists) {
			state = {
				visible: null,
				originalVisible: null,
				selected: false,
				ancestorSelected: false,
				tintColor: null,
				ancestorTintColor: null,
				highlightColor: null,
				ancestorHighlightColor: null,
				opacity: null,
				ancestorOverridesOpacity: false,
				boundingBoxNode: null,
				material: null,
				material2: null,
				originalMaterial: null
			};
			nodeStates.set(nodeRef, state);
		}
		return state;
	};

	ViewStateManager.prototype._deleteUnusedNodeStates = function() {
		const materialCache = this._materialCache;
		this._nodeStates.forEach(function(state, nodeRef, nodeStates) {
			if (state.visible == null
				&& !state.selected
				&& !state.ancestorSelected
				&& state.tintColor == null
				&& state.ancestorTintColor == null
				&& state.highlightColor == null
				&& state.ancestorHighlightColor == null
				&& state.opacity == null
				&& !state.ancestorOverridesOpacity
			) {
				nodeStates.delete(nodeRef);
				if (state.material != null) {
					materialCache.releaseMaterial(state.material);
				}
				if (state.material2 != null) {
					materialCache.releaseMaterial(state.material2);
				}
			}
		});

		return this;
	};

	ViewStateManager.prototype._applyVisibilityNodeState = function(nodeRefs, visibilities) {
		nodeRefs.forEach(function(nodeRef, index) {
			const newVisibility = visibilities[index];
			const ownVisibility = nodeRef.visible;
			const newVisibilityIsDifferentFromOwn = newVisibility !== ownVisibility;
			const state = this._getNodeState(nodeRef, newVisibilityIsDifferentFromOwn);
			if (state) {
				if (newVisibilityIsDifferentFromOwn) {
					state.visible = newVisibility;
				} else {
					// When we assign `null` the state is marked for deletion as it might be identical to the unmodified
					// original state.
					state.visible = null;
				}
			}
		}, this);
	};

	ViewStateManager.prototype._applySelectionNodeState = function(nodeRefs, selected) {
		if (selected) {
			nodeRefs.forEach(function(nodeRef) {
				this._selectedNodes.add(nodeRef);
				if (this._showSelectionBoundingBox) {
					this._addBoundingBox(nodeRef);
				}
				const state = this._getNodeState(nodeRef, true);
				const nodeWasSelected = nodeIsSelected(state);
				state.selected = true;
				if (nodeIsSelected(state) !== nodeWasSelected) {
					this._setNeedsMaterialUpdate(nodeRef);
				}
				// If state.ancestorSelected === true then descendants have already been processed.
				if (!state.ancestorSelected) {
					nodeRef.children.forEach(this._setAncestorSelectedRecursively.bind(this, true), this);
				}
			}, this);
		} else {
			nodeRefs.forEach(function(nodeRef) {
				this._selectedNodes.delete(nodeRef);
				if (this._showSelectionBoundingBox) {
					this._removeBoundingBox(nodeRef);
				}
				const state = this._nodeStates.get(nodeRef);
				if (state != null) {
					const nodeWasSelected = nodeIsSelected(state);
					state.selected = false;
					if (nodeIsSelected(state) !== nodeWasSelected) {
						this._setNeedsMaterialUpdate(nodeRef);
					}
					// If state.ancestorSelected === true then the descendants also are highlighted and we should not
					// unset the state, they inherit it from the node's ancestor.
					if (!state.ancestorSelected) {
						nodeRef.children.forEach(this._setAncestorSelectedRecursively.bind(this, false), this);
					}
				}
			}, this);
		}

		return this;
	};

	ViewStateManager.prototype._setAncestorSelectedRecursively = function(ancestorSelected, nodeRef) {
		const state = this._getNodeState(nodeRef, ancestorSelected);
		if (state != null && state.ancestorSelected !== ancestorSelected) {
			const nodeWasSelected = nodeIsSelected(state);
			state.ancestorSelected = ancestorSelected;
			if (nodeIsSelected(state) !== nodeWasSelected) {
				this._setNeedsMaterialUpdate(nodeRef);
			}
			// If state.selected === true then its descendants have already been processed.
			if (!state.selected) {
				nodeRef.children.forEach(this._setAncestorSelectedRecursively.bind(this, ancestorSelected), this);
			}
		}

		return this;
	};

	ViewStateManager.prototype._applyTintColorNodeState = function(nodeRefs, colors) {
		nodeRefs.forEach(function(nodeRef, index) {
			const tintColor = colors[index];
			const state = this._getNodeState(nodeRef, tintColor != null);
			if (state != null) {
				state.tintColor = tintColor;
				this._setNeedsMaterialUpdate(nodeRef);
				nodeRef.children.forEach(this._setAncestorTintColorRecursively.bind(this,
					tintColor != null ? tintColor : state.ancestorTintColor), this);
			}
		}, this);

		return this;
	};

	ViewStateManager.prototype._setAncestorTintColorRecursively = function(ancestorTintColor, nodeRef) {
		const state = this._getNodeState(nodeRef, ancestorTintColor != null);
		if (state != null && state.ancestorTintColor !== ancestorTintColor) {
			const previousEffectiveTintColor = effectiveTintColor(state);
			state.ancestorTintColor = ancestorTintColor;
			if (effectiveTintColor(state) !== previousEffectiveTintColor) {
				this._setNeedsMaterialUpdate(nodeRef);
			}
			// If this node has its own tint color then this tint color is already propagated to its descendants and we
			// don't need to do anything. But if we remove tint color from this node then we need to propagate its
			// ancestor's tint color (or its absence) to this node's descendants.
			if (state.tintColor == null) {
				nodeRef.children.forEach(this._setAncestorTintColorRecursively.bind(this, ancestorTintColor), this);
			}
		}

		return this;
	};

	ViewStateManager.prototype._setAncestorHighlightColorRecursively = function(ancestorHighlightColor, nodeRef) {
		const state = this._getNodeState(nodeRef, ancestorHighlightColor != null);
		if (state != null && state.ancestorHighlightColor !== ancestorHighlightColor) {
			const previousEffectiveHighlightColor = effectiveHighlightColor(state);
			state.ancestorHighlightColor = ancestorHighlightColor;
			if (effectiveHighlightColor(state) !== previousEffectiveHighlightColor) {
				this._setNeedsMaterialUpdate(nodeRef);
			}
			// If this node has its own highlight color then this highlight color is already propagated to its descendants and we
			// don't need to do anything. But if we remove highlight color from this node then we need to propagate its
			// ancestor's highlight color (or its absence) to this node's descendants.
			if (state.highlightColor == null) {
				nodeRef.children.forEach(this._setAncestorHighlightColorRecursively.bind(this, ancestorHighlightColor), this);
			}
		}

		return this;
	};

	ViewStateManager.prototype._applyOpacityNodeState = function(nodeRefs, opacities) {
		nodeRefs.forEach(function(nodeRef, index) {
			const opacity = opacities[index];
			const state = this._getNodeState(nodeRef, opacity != null);
			if (state != null) {
				state.opacity = opacity;
				// We do not compare whether the effective (world) opacity has changed, as this is a relatively
				// expensive computation, and if the opacity is assigned, we expect it to be assigned a new value, so
				// the effective opacity has surely changed.
				this._setNeedsMaterialUpdate(nodeRef);

				nodeRef.children.forEach(this._setAncestorOverridesOpacityRecursively.bind(this, opacity != null), this);
			}
		}, this);

		return this;
	};

	ViewStateManager.prototype._setAncestorOverridesOpacityRecursively = function(ancestorOverridesOpacity, nodeRef) {
		const state = this._getNodeState(nodeRef, ancestorOverridesOpacity);
		if (state != null) {
			state.ancestorOverridesOpacity = ancestorOverridesOpacity;
			this._setNeedsMaterialUpdate(nodeRef);

			nodeRef.children.forEach(this._setAncestorOverridesOpacityRecursively.bind(this, state.opacity != null || ancestorOverridesOpacity), this);
		}

		return this;
	};

	ViewStateManager.prototype._computeWorldOpacity = function(nodeRef, state) {
		state ??= this._nodeStates.get(nodeRef);
		const localOpacity = state?.opacity ?? nodeRef.userData.opacity ?? 1; // Default opacity value is 1
		return nodeRef.parent ? localOpacity * this._computeWorldOpacity(nodeRef.parent) : localOpacity;
	};

	ViewStateManager.prototype._setNeedsMaterialUpdate = function(nodeRef) {
		if (nodeRef.material != null) {
			this._needsMaterialUpdate.add(nodeRef);
		}
	};

	function customizeMaterial(material, originalMaterial, color, opacity) {
		material.color.copy(originalMaterial.color);
		material.emissive?.copy(originalMaterial.emissive);
		material.specular?.copy(originalMaterial.specular);

		material.userData.customColor = color.w > 0;
		if (material.userData.customColor) {
			const blendColor = new THREE.Color(color.x, color.y, color.z);
			material.color.lerp(blendColor, color.w);
			material.emissive?.lerp(blendColor, color.w * 0.5);
			material.specular?.multiplyScalar(1 - 0.5 * color.w); // reduce specular as it may overexpose the highlighting
		}

		const wasTransparent = material.transparent;
		material.opacity = opacity;
		material.transparent = opacity < 1;
		material.needsUpdate = material.transparent !== wasTransparent; // need to update the material if "transparent" state has changed
	}

	ViewStateManager.prototype._updateNodeStateMaterials = function() {
		if (this._needsMaterialUpdate.size === 0) {
			return this; // nothing to do
		}

		const materialCache = this._materialCache;
		const selectionColor = abgrToColor(this._highlightColorABGR);
		const selectionColorV4 = new THREE.Vector4(selectionColor.red / 255.0, selectionColor.green / 255.0, selectionColor.blue / 255.0, 1);

		this._needsMaterialUpdate.forEach(function(nodeRef) {
			assert(nodeRef.material != null, "Node should have a material to update its state");
			const state = this._nodeStates.get(nodeRef);
			if (state == null) {
				return; // no state for this node, nothing to do
			}

			const worldOpacity = this._computeWorldOpacity(nodeRef, state);
			const color = new THREE.Vector4(0, 0, 0, 0);

			const highlightColor = effectiveHighlightColor(state);
			if (highlightColor != null) { // view highlighting animation (HighlightPlayer)
				color.fromArray(highlightColor);
			}

			const tintColor = effectiveTintColor(state);
			if (tintColor != null) { // tinting
				const c = abgrToColor(tintColor);
				color.lerp(new THREE.Vector4(c.red / 255.0, c.green / 255.0, c.blue / 255.0, 1), c.alpha);
			}

			if (state.selected || state.ancestorSelected) { // selection
				state.material2 ??= materialCache.cloneMaterial(nodeRef.material);
				customizeMaterial(state.material2, nodeRef.material, color, worldOpacity); // material2 is used to render the outline selection

				color.lerp(selectionColorV4, selectionColor.alpha);
			}

			state.material ??= materialCache.cloneMaterial(nodeRef.material);
			customizeMaterial(state.material, nodeRef.material, color, worldOpacity);

			state.customMaterial = color.w > 0 || worldOpacity < 1;
		}, this);

		this._needsMaterialUpdate.clear();

		return this;
	};

	ViewStateManager.prototype.applyNodeStates = function(ignoreSelection) {
		this._updateNodeStateMaterials();

		this._nodeStates.forEach(function(state, nodeRef) {
			if (state.material != null && state.customMaterial) {
				state.originalMaterial = nodeRef.material;
				nodeRef.material = ignoreSelection && (state.selected || state.ancestorSelected) ? (state.material2 ?? state.material) : state.material;
				nodeRef.userData.customMaterial = true; // mark the node as having a custom material
			}
			if (state.visible != null) {
				state.originalVisible = nodeRef.visible;
				nodeRef.visible = state.visible;
			}
		});
	};

	ViewStateManager.prototype.revertNodeStates = function() {
		this._nodeStates.forEach(function(state, nodeRef) {
			if (state.originalMaterial) {
				nodeRef.material = state.originalMaterial;
				state.originalMaterial = null;
				nodeRef.userData.customMaterial = false; // mark the node as not having a custom material
			}
			if (state.originalVisible != null) {
				nodeRef.visible = state.originalVisible;
				state.originalVisible = null;
			}
		});
	};

	function nodeIsSelected(state) {
		assert(state != null, "Node state should not be null");
		return state.selected || state.ancestorSelected;
	}

	function effectiveVisibility(nodeRef, state) {
		return state?.visible ?? nodeRef?.visible ?? false;
	}

	function effectiveTintColor(state) {
		return state.tintColor || state.ancestorTintColor;
	}

	function effectiveHighlightColor(state) {
		return state.highlightColor || state.ancestorHighlightColor;
	}

	return ViewStateManager;
});
