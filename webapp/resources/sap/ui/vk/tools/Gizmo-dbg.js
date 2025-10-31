/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides base for all gizmo controls sap.ui.vk.tools namespace.
sap.ui.define([
	"../library",
	"sap/m/library",
	"sap/m/Input",
	"sap/m/Label",
	"sap/m/HBox",
	"sap/ui/core/library",
	"sap/ui/core/Control",
	"./CoordinateSystem",
	"./AxisColours",
	"./ToolNodeSet",
	"../thirdparty/three",
	"../thirdparty/three-mesh-bvh",
	"./GizmoPlacementMode",
	"../AnimationTrackType"
], function(
	vkLibrary,
	mLibrary,
	Input,
	Label,
	HBox,
	coreLibrary,
	Control,
	CoordinateSystem,
	AxisColours,
	ToolNodeSet,
	THREE,
	MeshBVHLib,
	GizmoPlacementMode,
	AnimationTrackType
) {
	"use strict";

	// shortcut for sap.m.InputType
	var InputType = mLibrary.InputType;

	/**
	 * Constructor for base of all Gizmo Controls.
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
	 * @alias sap.ui.vk.tools.Gizmo
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Gizmo = Control.extend("sap.ui.vk.tools.Gizmo", /** @lends sap.ui.vk.tools.Gizmo.prototype */ {
		metadata: {
			library: "sap.ui.vk"
		},
		renderer: null
	});

	Gizmo.prototype.hasDomElement = function() {
		return true;
	};

	Gizmo.prototype._drawText = function(canvas, text, fontSize, drawBorder) {
		var pixelRatio = window.devicePixelRatio;
		var w = canvas.width;
		var h = canvas.height;
		var halfWidth = w * 0.5;
		var halfHeight = h * 0.5;
		var ctx = canvas.getContext("2d");
		ctx.clearRect(0, 0, w, h);
		ctx.font = "Bold " + fontSize * pixelRatio + "px Arial";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		// draw shadow
		ctx.fillStyle = "#000";
		ctx.globalAlpha = 0.5;
		ctx.filter = "blur(3px)";
		ctx.fillText(text, halfWidth + 1, halfHeight + 1);
		// draw text
		ctx.fillStyle = "#fff";
		ctx.globalAlpha = 1;
		ctx.filter = "blur(0px)";
		ctx.fillText(text, halfWidth, halfHeight);

		if (drawBorder) {// draw circle border
			ctx.beginPath();
			ctx.arc(halfWidth, halfHeight, halfWidth - pixelRatio, 0, 2 * Math.PI, false);
			ctx.closePath();
			ctx.lineWidth = pixelRatio * 2;
			ctx.strokeStyle = "#fff";
			ctx.stroke();
		}
	};

	Gizmo.prototype._createTextMesh = function(text, width, height, fontSize, color, drawBorder) {
		var pixelRatio = window.devicePixelRatio;
		var canvas = document.createElement("canvas");
		canvas.width = width * pixelRatio;
		canvas.height = height * pixelRatio;

		this._drawText(canvas, text, fontSize, drawBorder);

		var texture = new THREE.Texture(canvas);
		texture.needsUpdate = true;

		var material = new THREE.MeshBasicMaterial({
			map: texture,
			color: color,
			transparent: true,
			alphaTest: 0.05,
			premultipliedAlpha: true,
			side: THREE.DoubleSide
		});

		var mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
		mesh.userData.color = color;
		return mesh;
	};

	Gizmo.prototype._createAxisTitles = function(size, fontSize, drawCircle, addNegativeAxes) {
		size = size || 32;
		fontSize = fontSize || 20;

		var group = new THREE.Group();
		group.add(this._createTextMesh("X", size, size, fontSize, AxisColours.x, drawCircle));
		group.add(this._createTextMesh("Y", size, size, fontSize, AxisColours.y, drawCircle));
		group.add(this._createTextMesh("Z", size, size, fontSize, AxisColours.z, drawCircle));
		if (addNegativeAxes) {
			group.add(this._createTextMesh("-X", size, size, fontSize, AxisColours.x, drawCircle));
			group.add(this._createTextMesh("-Y", size, size, fontSize, AxisColours.y, drawCircle));
			group.add(this._createTextMesh("-Z", size, size, fontSize, AxisColours.z, drawCircle));
		}
		return group;
	};

	Gizmo.prototype._extractBasis = function(matrix) {
		var basis = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
		matrix.extractBasis(basis[0], basis[1], basis[2]);
		basis[0].normalize(); basis[1].normalize(); basis[2].normalize();
		return basis;
	};

	Gizmo.prototype._updateAxisTitles = function(obj, gizmo, camera, distance, scale) {
		var basis = this._extractBasis(gizmo.matrixWorld);

		obj.children.forEach(function(child, i) {
			var offset = distance.constructor === THREE.Vector3 ? distance.getComponent(i % 3) : distance;
			child.position.copy(basis[i % 3]).multiplyScalar(offset * (i < 3 ? 1 : -1));
			child.quaternion.copy(camera.quaternion);
		});

		obj.position.copy(gizmo.position);
		obj.scale.setScalar(scale);
	};

	Gizmo.prototype._updateSelection = function(viewStateManager) {
		if (viewStateManager == null) {
			return false;
		}
		var nodes = [];
		if (this._tool) {
			if (this._tool.getNodeSet() === ToolNodeSet.Highlight) {
				viewStateManager.enumerateSelection(function(nodeRef) {
					nodes.push({ node: nodeRef });
				});
			} else {
				viewStateManager.enumerateOutlinedNodes(function(nodeRef) {
					nodes.push({ node: nodeRef });
				});
			}
		}
		if (this._nodes.length === nodes.length && this._nodes.every(function(v, i) { return nodes[i].node === v.node; })) {
			return false;
		}

		this._cleanTempData();
		this._nodes = nodes;

		nodes.forEach(function(nodeInfo) {
			nodeInfo.ignore = false; // multiple transformation fix (parent transformation + child transformation)
			var parent = nodeInfo.node.parent;
			while (parent && !nodeInfo.ignore) {
				for (var i = 0, l = nodes.length; i < l; i++) {
					if (nodes[i].node === parent) {
						nodeInfo.ignore = true;
						break;
					}
				}
				parent = parent.parent;
			}
			this._getOffsetForRestTransformation(nodeInfo.node);
		}, this);

		return true;
	};

	function extractGeometry(indices, vertices, geometry, renderGroup, matrixWorld) {
		const position = geometry.attributes.position;
		let vertexOffset = vertices.length / 3;
		const firstVertex = renderGroup?.firstVertex ?? 0;
		const vertexCount = renderGroup ? (renderGroup.lastVertex - firstVertex) : position.count;
		const firstIndex = renderGroup?.start ?? 0;
		const indexCount = renderGroup?.count ?? geometry.index?.count ?? vertexCount;

		if (geometry.index != null) {
			vertexOffset -= firstVertex;
			const srcIndices = geometry.index.array;
			// for (let i = firstIndex, end = firstIndex + indexCount; i < end; i++) {
			// 	indices.push(srcIndices[i] + vertexOffset);
			// }
			const v0 = new THREE.Vector3(), v1 = new THREE.Vector3(), v2 = new THREE.Vector3();
			for (let i = firstIndex, end = firstIndex + indexCount; i < end; i += 3) {
				const i0 = srcIndices[i], i1 = srcIndices[i + 1], i2 = srcIndices[i + 2];
				v0.set(position.getX(i0), position.getY(i0), position.getZ(i0));
				v1.set(position.getX(i1), position.getY(i1), position.getZ(i1)).sub(v0);
				v2.set(position.getX(i2), position.getY(i2), position.getZ(i2)).sub(v0);
				if (v1.cross(v2).lengthSq() > 0.0001) { // skip degenerate triangles, MeshBVHLib doesn't like them
					indices.push(i0 + vertexOffset);
					indices.push(i1 + vertexOffset);
					indices.push(i2 + vertexOffset);
				}
			}
		} else {
			for (let i = 0; i < indexCount; i++) {
				indices.push(i + vertexOffset);
			}
		}

		const pos = new THREE.Vector3();
		for (let i = firstVertex, end = firstVertex + vertexCount; i < end; i++) {
			pos.set(position.getX(i), position.getY(i), position.getZ(i));
			if (matrixWorld != null) {
				pos.applyMatrix4(matrixWorld);
			}
			vertices.push(pos.x);
			vertices.push(pos.y);
			vertices.push(pos.z);
		}
	}

	Gizmo.prototype._createBVHGeometry = function(vertices, indices) {
		const geometry = new THREE.BufferGeometry();
		geometry.setIndex(indices);
		geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
		geometry.boundsTree = new MeshBVHLib.MeshBVH(geometry);
		return geometry;
	};

	Gizmo.prototype._computeBoundsTree = function() {
		if (this._nodes.length === 0) {
			this._disposeBoundsTree();
			return;
		}

		const selectedNodes = new Set(this._nodes.map((nodeInfo) => nodeInfo.node));
		const vsm = this._viewport?._getViewStateManagerThreeJS();
		vsm?.getJoints()?.forEach((joint) => {
			if (selectedNodes.has(joint.parent)) {
				selectedNodes.add(joint.node);
			}
		});
		this._selectedMeshes = [];

		const staticGeometryIndices = [];
		const staticGeometryVertices = [];

		const traverse = (node, selected) => {
			if (!(vsm?.getVisibilityState(node) ?? node.visible) || // skip invisible nodes
				node._vkUpdate || // skip dynamic nodes
				node.userData.renderStage > 0 || // skip overlay nodes
				node.userData.renderStage < 0) { // skip underlay nodes
				return;
			}

			selected ||= selectedNodes.has(node);
			if (node.geometry instanceof THREE.BufferGeometry && !node.geometry.userData.isPointCloud) {
				const userData = node.userData;
				if (selected) {
					if (!userData.bvhGeometry) {
						const indices = [];
						const vertices = [];
						extractGeometry(indices, vertices, node.geometry, userData.renderGroup, null);
						userData.bvhGeometry = this._createBVHGeometry(vertices, indices);
					}
					this._selectedMeshes.push(node);
				} else {
					extractGeometry(staticGeometryIndices, staticGeometryVertices, node.geometry, userData.renderGroup, node.matrixWorld);
				}
			}

			node.children.forEach((child) => traverse(child, selected));
		};
		traverse(this._viewport._getNativeScene(), false);

		this._staticGeometry = this._createBVHGeometry(staticGeometryVertices, staticGeometryIndices);
	};

	Gizmo.prototype._disposeBoundsTree = function() {
		this._selectedMeshes = [];
		this._staticGeometry = null;
	};

	Gizmo.prototype._checkSceneSelectionIntersection = function() {
		this._viewport?._getViewStateManagerThreeJS()?._setJointNodeMatrix(); // update joint node transformations before intersection checking
		return this._selectedMeshes.some((mesh) => this._staticGeometry.boundsTree.intersectsGeometry(mesh.userData.bvhGeometry, mesh.matrixWorld));
	};

	Gizmo.prototype.setPlacementMode = function(placementMode) {
		this._placementMode = placementMode;
	};

	Gizmo.prototype._getAnchorPoint = function() {
		return this._viewport ? this._viewport._anchorPoint : null;
	};

	Gizmo.prototype._getGizmoScale = function(position) {
		var renderer = this._viewport.getRenderer();
		var camera = this._viewport.getCamera().getCameraRef();
		var pos4 = new THREE.Vector4();
		pos4.copy(position).applyMatrix4(this._matViewProj);
		return pos4.w * 2 / (renderer.getSize(new THREE.Vector2()).x * camera.projectionMatrix.elements[0]);
	};

	Gizmo.prototype._getEffectiveParent = function(node) {
		if (this._viewport._viewStateManager) {
			var joints = this._viewport._viewStateManager.getJoints();
			if (joints) {
				for (var n = 0; n < joints.length; n++) {
					var joint = joints[n];
					if (!joint.node || !joint.parent) {
						continue;
					}
					if (joint.node === node) {
						return joint.parent;
					}
				}
			}
		}
		return node.parent;
	};

	Gizmo.prototype._cleanTempData = function() {
		this._nodes.forEach(function(nodeInfo) {
			delete nodeInfo.node.userData.skipUpdateJointNode;
		});
		this._nodeUserDataMap?.clear();
		this._sequence = null;
	};

	Gizmo.prototype._prepareForCreatingKey = function(playback) {
		this._playback = playback;
	};

	// when a node is moved/scaled/rotated, if the node initial position is in the middle of animation
	// we calculate new restTransformation based on current node transformation and animated transformation
	Gizmo.prototype._getOffsetForRestTransformation = function(node) {
		if (this._viewport._viewStateManager) {
			if (!this._nodeUserDataMap) {
				this._nodeUserDataMap = new Map();
			}
			var userData = this._nodeUserDataMap.get(node);
			if (!userData) {
				userData = {};
				this._nodeUserDataMap.set(node, userData);
			}
			var trans = this._viewport._viewStateManager.getTransformation(node);
			var restTrans = this._viewport._viewStateManager.getRestTransformation(node);
			if (!restTrans) {
				return;
			}

			var pos = new THREE.Vector3(restTrans.translation[0], restTrans.translation[1], restTrans.translation[2]);
			var sc = new THREE.Vector3(restTrans.scale[0], restTrans.scale[1], restTrans.scale[2]);
			userData.quatRest = new THREE.Quaternion(restTrans.quaternion[0], restTrans.quaternion[1], restTrans.quaternion[2], restTrans.quaternion[3]);
			userData.matRest = new THREE.Matrix4().compose(pos, userData.quatRest, sc);
			userData.matRestInv = new THREE.Matrix4().copy(userData.matRest).invert();

			userData.initialTranslation = trans.translation.slice();
			userData.initialScale = trans.scale.slice();
			userData.initialQuaternion = new THREE.Quaternion(trans.quaternion[0], trans.quaternion[1], trans.quaternion[2], trans.quaternion[3]);
			userData.matInitial = node.matrix.clone();
			userData.matInitialInv = new THREE.Matrix4().copy(node.matrix).invert();
			userData.quatInitialDiff = userData.initialQuaternion.clone().multiply(userData.quatRest.clone().invert());
			userData.quatInitialDiffInv = userData.quatInitialDiff.clone().invert();

			userData.matInitialDiff = node.matrix.clone().multiply(userData.matRestInv);

			var euler = [0, 0, 0];
			var animationPlayer = this._viewport._viewStateManager.getAnimationPlayer();
			if (animationPlayer) {
				var data = animationPlayer.getAnimatedProperty(node, AnimationTrackType.Rotate);
				if (data.offsetToPrevious) {
					euler = data.offsetToPrevious;
				}
			}
			userData.euler = new THREE.Euler(0, 0, 0);
			userData.startEuler = new THREE.Euler(0, 0, 0);
			userData.eulerInParentCoors = new THREE.Euler(euler[0], euler[1], euler[2]);
			userData.startEulerInParentCoors = new THREE.Euler(euler[0], euler[1], euler[2]);
		}
	};

	Gizmo.prototype._updateGizmoObjectTransformation = function(obj, i) {
		const anchorPoint = this._getAnchorPoint();

		// set gizmo position (depends on placement mode)
		obj.position.setScalar(0);
		switch (this._placementMode) {
			default:
			case GizmoPlacementMode.Default:
				if (this._nodes.length > 0) {
					if (this._coordinateSystem === CoordinateSystem.Local || this._coordinateSystem === CoordinateSystem.Parent) {
						obj.position.setFromMatrixPosition(this._nodes[i].node.matrixWorld);
					} else {
						const center = new THREE.Vector3();
						this._nodes.forEach(function(nodeInfo) {
							center.setFromMatrixPosition(nodeInfo.node.matrixWorld);
							obj.position.add(center);
						});
						obj.position.multiplyScalar(1 / this._nodes.length);
					}
				}
				break;
			case GizmoPlacementMode.ObjectCenter:
				const boundingBox = new THREE.Box3();
				if (this._coordinateSystem === CoordinateSystem.Local || this._coordinateSystem === CoordinateSystem.Parent) {
					this._nodes[i].node._expandBoundingBox(boundingBox, true, true, true);
				} else {
					this._nodes.forEach(function(nodeInfo) {
						nodeInfo.node._expandBoundingBox(boundingBox, true, true, true);
					});
				}
				boundingBox.getCenter(obj.position);
				break;
			case GizmoPlacementMode.Custom:
				if (anchorPoint) {
					obj.position.copy(anchorPoint.position);
				}
				break;
		}

		// set gizmo scale (depends on distance to camera)
		const scale = this._getGizmoScale(obj.position);
		obj.scale.setScalar(this._gizmoSize * scale);

		// set gizmo rotation (depends on coordinate system)
		obj.matrixAutoUpdate = true;
		obj.quaternion.set(0, 0, 0, 1);
		switch (this._coordinateSystem) {
			case CoordinateSystem.Local:
			case CoordinateSystem.Parent:
				if (i >= 0 && i < this._nodes.length) {
					const node = this._nodes[i].node;
					const parentWorldMatrix = this._coordinateSystem === CoordinateSystem.Parent ? this._getEffectiveParent(node)?.matrixWorld : null;
					const basis = this._extractBasis(parentWorldMatrix ?? node.matrixWorld);
					obj.matrix.makeBasis(basis[0], basis[1], basis[2]);
					obj.quaternion.setFromRotationMatrix(obj.matrix);
					obj.matrix.scale(obj.scale);
					obj.matrix.setPosition(obj.position);
					obj.matrixAutoUpdate = false;
				}
				break;
			case CoordinateSystem.Screen:
				const camera = this._viewport.getCamera().getCameraRef();
				obj.quaternion.copy(camera.quaternion);
				break;
			case CoordinateSystem.Custom:
				if (anchorPoint) {
					obj.quaternion.copy(anchorPoint.quaternion);
				}
				break;
			default: break; // CoordinateSystem.World, obj.quaternion = (0, 0, 0, 1)
		}

		obj.updateMatrixWorld(true);
		return scale;
	};

	Gizmo.prototype._expandBoundingBox = function(boundingBox, camera, visibleOnly) {
		var gizmoCount = this.getGizmoCount();
		if (gizmoCount > 0) {
			this._matViewProj.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse); // used in _updateGizmoTransformation()
			for (var i = 0; i < gizmoCount; i++) {
				this._updateGizmoTransformation(i, camera);
				this._sceneGizmo._expandBoundingBox(boundingBox, visibleOnly, false);
			}
		}
	};

	Gizmo.prototype._createEditingForm = function(units, width) {
		this._label = new Label({}).addStyleClass("sapUiVkTransformationToolEditLabel");
		this._units = new Label({ text: units }).addStyleClass("sapUiVkTransformationToolEditUnits");

		this._input = new Input({
			width: width + "px",
			type: InputType.Number,
			maxLength: 10,
			textAlign: coreLibrary.TextAlign.Right,
			change: (event) => {
				this.setValue(event.getParameter("value"));
			}
		});

		this._editingForm = new HBox({
			items: [
				this._label,
				this._input,
				this._units
			]
		}).addStyleClass("sapUiSizeCompact");

		this._editingForm.onkeydown = this._editingForm.ontap = this._editingForm.ontouchstart = function(event) {
			event.setMarked(); // disable the viewport events under the editing form
		};
	};

	Gizmo.prototype._getValueLocaleOptions = function() {
		return { useGrouping: false };
	};

	Gizmo.prototype._updateEditingForm = function(active, axisIndex, label) {
		var domRef = this.getDomRef();
		if (domRef) {
			if (active && this._tool && this._tool.getShowEditingUI()) {
				this._label.setText(label || ["X", "Y", "Z"][axisIndex]);
				this._label.rerender();
				var labelDomRef = this._label.getDomRef();
				if (labelDomRef) {
					labelDomRef.style.color = new THREE.Color(AxisColours[["x", "y", "z"][axisIndex]]).getStyle();
				}

				this._input.setValue(this.getValue().toLocaleString("fullwide", this._getValueLocaleOptions()));

				var position = this._getEditingFormPosition();
				var gizmoPosition = this._gizmo.position.clone().applyMatrix4(this._matViewProj).sub(position);
				var viewportRect = this._viewport.getDomRef().getBoundingClientRect();
				var formRect = domRef.getBoundingClientRect();

				var alignRight = gizmoPosition.x > -0.0001;
				var dx = alignRight ? formRect.width : -formRect.width;
				var dy = formRect.height * 0.5;
				var x = THREE.MathUtils.clamp(viewportRect.width * (position.x * 0.5 + 0.5) + (alignRight ? -20 : 20), Math.max(dx, 0), viewportRect.width + Math.min(dx, 0));
				var y = THREE.MathUtils.clamp(viewportRect.height * (position.y * -0.5 + 0.5), dy, viewportRect.height - dy);

				domRef.style.left = Math.round(x) + "px";
				domRef.style.top = Math.round(y) + "px";
				domRef.style.transform = "translate(" + (alignRight ? "-100%" : "0%") + ", -50%)";

				domRef.style.display = "block";
			} else {
				domRef.style.display = "none";
			}
		}
	};

	Gizmo.prototype._attachVisibilityChanged = function() {
		this._viewport?._getViewStateManagerThreeJS()?.attachVisibilityChanged(this._onVisibilityChanged, this);
	};

	Gizmo.prototype._detachVisibilityChanged = function() {
		this._viewport?._getViewStateManagerThreeJS()?.detachVisibilityChanged(this._onVisibilityChanged, this);
	};

	return Gizmo;
});
