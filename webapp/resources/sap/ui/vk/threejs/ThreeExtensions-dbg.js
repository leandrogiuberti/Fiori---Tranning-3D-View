/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
	"../abgrToColor",
	"../ObjectType",
	"../thirdparty/three",
	"../NodeContentType",
	"./ThreeUtils"
], function(
	abgrToColor,
	ObjectType,
	THREE,
	NodeContentType,
	ThreeUtils
) {
	"use strict";

	// TODO(VSM): REMOVE
	THREE.Object3D.prototype._vkCalculateObjectOrientedBoundingBox = function() {
		ThreeUtils.computeObjectOrientedBoundingBox(this, this.userData.boundingBox = new THREE.Box3());
	};

	THREE.Object3D.prototype._vkTraverseNodeGeometry = function(callback) {
		callback(this);
		for (var i = 0, l = this.children.length; i < l; i++) {
			var child = this.children[i];
			if (child.geometry !== undefined && child.userData.skipIt) { // consider as a node geometry
				if (child.children) {
					child._vkTraverseNodeGeometry(callback);
				} else {
					callback(child);
				}
			} else if (child.children) {
				child._vkTraverseNodeGeometry(callback);
			}
		}
	};

	THREE.Object3D.prototype._vkSetOpacityRecursive = function(opacity) { // used only to change the opacity of Symbols depending on the camera direction
		this.traverseVisible(function(child) {
			if (child.material) {
				child.material.opacity = opacity;
				child.material.transparent = opacity < 1.0;
			}
		});
	};

	THREE.Object3D.prototype._vkGetTotalOpacity = function(joints, vsm) {
		var nodeJointMap;
		if (joints) {
			nodeJointMap = new Map();
			joints.forEach(function(joint) {
				if (!joint.node || !joint.parent) {
					return;
				}
				nodeJointMap.set(joint.node, joint);
			});
		}

		var opacity = 1.0;

		/* eslint-disable consistent-this */
		var obj3D = this;
		do {

			var currentOpacity = null, joint = null;
			if (nodeJointMap) {
				joint = nodeJointMap.get(obj3D);
			}

			if (joint && joint.opacity != null) {
				currentOpacity = joint.opacity;
			} else if (vsm) {
				currentOpacity = vsm._getOpacity(obj3D);
			} else if (obj3D.userData && obj3D.userData.opacity !== undefined) {
				currentOpacity = obj3D.userData.opacity;
			}

			var offsetOpacity = 1;
			if (joint && joint.opacity != null && obj3D.userData && obj3D.userData.offsetOpacity != null) {
				offsetOpacity = obj3D.userData.offsetOpacity;
			}

			if (currentOpacity != null) {
				opacity *= currentOpacity;
				opacity *= offsetOpacity;
			}

			if (joint && joint.parent) {
				obj3D = joint.parent;
				continue;
			}

			obj3D = obj3D.parent;
		} while (obj3D);
		/* eslint-enable consistent-this */

		return opacity;
	};

	THREE.Object3D.prototype._vkTraverseMeshNodes = function(callback) {
		if (this._vkUpdate !== undefined || this.isDetailView || this.userData.nodeContentType === NodeContentType.PMI) {
			return;
		}

		callback(this);
		var children = this.children;
		for (var i = 0, l = children.length; i < l; i++) {
			children[i]._vkTraverseMeshNodes(callback);
		}
	};

	THREE.Object3D.prototype._vkTraverseNodes = function(callback, nodeJointMap, parentJointsMap) {
		callback(this);
		var childJoints;
		if (parentJointsMap) {
			childJoints = parentJointsMap.get(this);
		}

		var j;
		if (childJoints) {
			for (j = 0; j < childJoints.length; j++) {
				childJoints[j].node._vkTraverseNodes(callback, nodeJointMap, parentJointsMap);
			}
		}

		var children = this.children;
		if (children) {
			for (j = 0; j < children.length; j++) {
				var child = children[j];
				if (nodeJointMap) {
					var joint = nodeJointMap.get(child);
					if (joint) {
						continue;
					}
				}
				child._vkTraverseNodes(callback, nodeJointMap, parentJointsMap);
			}
		}
	};

	// THREE.Box3().applyMatrix4() analogue, but 10x faster and suitable for non-perspective transformation matrices. The original implementation is dumb.
	function box3ApplyMatrix4(boundingBox, matrix) {
		var min = boundingBox.min,
			max = boundingBox.max,
			m = matrix.elements,
			cx = (min.x + max.x) * 0.5,
			cy = (min.y + max.y) * 0.5,
			cz = (min.z + max.z) * 0.5,
			ex = max.x - cx,
			ey = max.y - cy,
			ez = max.z - cz;

		var tcx = m[0] * cx + m[4] * cy + m[8] * cz + m[12];
		var tcy = m[1] * cx + m[5] * cy + m[9] * cz + m[13];
		var tcz = m[2] * cx + m[6] * cy + m[10] * cz + m[14];

		var tex = Math.abs(m[0] * ex) + Math.abs(m[4] * ey) + Math.abs(m[8] * ez);
		var tey = Math.abs(m[1] * ex) + Math.abs(m[5] * ey) + Math.abs(m[9] * ez);
		var tez = Math.abs(m[2] * ex) + Math.abs(m[6] * ey) + Math.abs(m[10] * ez);

		min.set(tcx - tex, tcy - tey, tcz - tez);
		max.set(tcx + tex, tcy + tey, tcz + tez);
	}

	THREE.Object3D.prototype._expandBoundingBox = function(boundingBox, visibleOnly, ignoreDynamicObjects, ignore2DObjects) {
		var nodeBoundingBox = new THREE.Box3();

		function expandBoundingBox(node) {
			const userData = node.userData;
			var geometry = node.geometry;
			if (geometry !== undefined) {
				const rg = userData.renderGroup;
				if (rg?.boundingBox) {
					nodeBoundingBox.setFromPackedArray(rg.boundingBox);
				} else {
					if (!geometry.boundingBox) {
						geometry.computeBoundingBox();
					}

					nodeBoundingBox.copy(geometry.boundingBox);
				}

				if (!nodeBoundingBox.isEmpty()) {
					box3ApplyMatrix4(nodeBoundingBox, node.matrixWorld);
					if (isFinite(nodeBoundingBox.min.x) && isFinite(nodeBoundingBox.min.y) && isFinite(nodeBoundingBox.min.z) &&
						isFinite(nodeBoundingBox.max.x) && isFinite(nodeBoundingBox.max.y) && isFinite(nodeBoundingBox.max.z)) {
						boundingBox.union(nodeBoundingBox);
					}
				}
			} else if (userData.pcgBoundingBox?.isEmpty() === false) { // if point cloud group boundingBox exists and is not empty
				nodeBoundingBox.copy(userData.pcgBoundingBox);
				box3ApplyMatrix4(nodeBoundingBox, node.matrixWorld);
				boundingBox.union(nodeBoundingBox);
			}

			const selectionBoundingBox = userData.boundingBox;
			if (selectionBoundingBox !== undefined && selectionBoundingBox.min && selectionBoundingBox.max
				&& !selectionBoundingBox.isEmpty() && !visibleOnly) {
				nodeBoundingBox.copy(selectionBoundingBox);
				box3ApplyMatrix4(nodeBoundingBox, node.matrixWorld);
				boundingBox.union(nodeBoundingBox);
			}
		}

		function traverse(node) {
			if (node._vkUpdate !== undefined &&
				(ignoreDynamicObjects || (ignore2DObjects && node.userData.is2D))) {
				return; // ignore dynamic objects (billboards, callouts, etc)
			}

			if (!visibleOnly || node.visible) {// test visibility
				expandBoundingBox(node);
				var children = node.children;
				for (var i = 0, l = children.length; i < l; i++) {
					traverse(children[i]);
				}
			}
		}

		// this.updateMatrixWorld();
		traverse(this);

		return boundingBox;
	};

	THREE.Object3D.prototype._vkPersistentId = function() {
		/* eslint-disable consistent-this */
		var obj3D = this;
		do {
			if (obj3D.userData.treeNode && obj3D.userData.treeNode.sid) {
				return obj3D.userData.treeNode.sid;
			}
			obj3D = obj3D.parent;
		} while (obj3D);
		/* eslint-enable consistent-this */
		return null;
	};

	THREE.Object3D.prototype._vkSetNodeContentType = function(nodeContentType) {
		this.userData.nodeContentType = nodeContentType;
		if (nodeContentType === NodeContentType.Reference) {
			this.visible = false; // not render reference node
			this.userData.skipIt = true; // not display in scene tree
		} else if (nodeContentType === NodeContentType.Background) {
			this.userData.renderStage = -1; // underlay
		} else if (nodeContentType === NodeContentType.Symbol) {
			this.userData.symbolContent = true;
			this.userData.renderStage = 1; // overlay
			this.updateMatrix();
			this.updateMatrixWorld(true);
			this.userData.direction = new THREE.Vector3().setFromMatrixColumn(this.matrixWorld, 2).normalize();
		}
	};

	THREE.Object3D.prototype._vkGetNodeContentType = function() {
		return this.userData.nodeContentType;
	};

	THREE.Camera.prototype._vkZoomTo = function(boundingBox, margin) {
		margin = margin || 0;

		var size = new THREE.Vector3();
		boundingBox.getSize(size);
		if (size.lengthSq() === 0) {
			return this; // no zooming if bounding box is empty
		}

		var min = boundingBox.min, max = boundingBox.max;
		var boxVertices = [
			new THREE.Vector3(min.x, min.y, min.z),
			new THREE.Vector3(max.x, max.y, max.z),
			new THREE.Vector3(min.x, min.y, max.z),
			new THREE.Vector3(min.x, max.y, max.z),
			new THREE.Vector3(max.x, min.y, max.z),
			new THREE.Vector3(max.x, max.y, min.z),
			new THREE.Vector3(min.x, max.y, min.z),
			new THREE.Vector3(max.x, min.y, min.z)
		];

		var matViewProj = new THREE.Matrix4(),
			projectVector = new THREE.Vector3(),
			projectBox = new THREE.Box2();

		function calcBoxProjection(camera) {
			boxVertices.forEach(function(vertex) {
				projectVector = vertex.project(camera);
				projectBox.expandByPoint(new THREE.Vector2(projectVector.x, projectVector.y));
			});
		}

		var view = this.view;
		if (view && view.enabled) {
			calcBoxProjection(this);

			var cx = view.offsetX + view.width * (0.5 + 0.25 * (projectBox.min.x + projectBox.max.x));
			var cy = view.offsetY + view.height * (0.5 - 0.25 * (projectBox.min.y + projectBox.max.y));
			var zoomScale = Math.max(projectBox.max.x - projectBox.min.x, projectBox.max.y - projectBox.min.y) * 0.5 * (1 + margin);
			view.width *= zoomScale;
			view.height *= zoomScale;
			view.offsetX = cx - view.width * 0.5;
			view.offsetY = cy - view.height * 0.5;

			return this;
		}

		function insideFrustum(camera) {
			matViewProj.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
			for (var i in boxVertices) {
				projectVector.copy(boxVertices[i]).applyMatrix4(matViewProj);
				if (projectVector.x < -1.0 || projectVector.x > 1.0 || projectVector.y < -1.0 || projectVector.y > 1.0) {
					return false;
				}
			}
			return true;
		}

		var target = new THREE.Vector3();
		boundingBox.getCenter(target);

		var dir = new THREE.Vector3();
		this.getWorldDirection(dir);
		dir.multiplyScalar(size.length());

		this.position.copy(target).sub(dir);
		this.updateMatrixWorld(true);

		if (this.isPerspectiveCamera) {
			// adjust origin to make the object inside frustum
			while (!insideFrustum(this)) {
				this.position.sub(dir);
				this.updateMatrixWorld(true);
			}

			// fine tuning the origin position
			var step = 10;
			var vPos1 = this.position.clone();
			var vPos2 = target.clone();
			for (var nj = 0; nj < step; nj++) {
				this.position.copy(vPos1).add(vPos2).multiplyScalar(0.5);
				this.updateMatrixWorld(true);
				if (insideFrustum(this)) {
					vPos1.copy(this.position);
				} else {
					vPos2.copy(this.position);
				}
			}
			this.position.copy(vPos1).sub(target).multiplyScalar(margin).add(vPos1);
			this.updateMatrixWorld(true);
		} else if (this.isOrthographicCamera) {
			calcBoxProjection(this);

			this.zoom /= Math.max(projectBox.max.x - projectBox.min.x, projectBox.max.y - projectBox.min.y) * 0.5 * (1 + margin);
			this.updateProjectionMatrix();
		}

		return this;
	};

	THREE.Mesh.prototype._vkClone = function() {
		var clonedMesh = new THREE.Mesh();
		ThreeUtils.disposeMaterial(clonedMesh.material);
		clonedMesh.copy(this);
		return clonedMesh;
	};
});
