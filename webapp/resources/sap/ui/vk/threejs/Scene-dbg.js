/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides the Scene class.
sap.ui.define([
	"sap/base/Log",
	"../Scene",
	"./NodeHierarchy",
	"../RenderMode",
	"../thirdparty/three",
	"./PolylineGeometry",
	"./PolylineMaterial",
	"./PolylineMesh",
	"./ThreeUtils",
	"../totara/TotaraUtils",
	"sap/base/util/uid"
], function(
	Log,
	SceneBase,
	NodeHierarchy,
	RenderMode,
	THREE,
	PolylineGeometry,
	PolylineMaterial,
	PolylineMesh,
	ThreeUtils,
	TotaraUtils,
	uid
) {
	"use strict";

	/**
	 * Constructor for a new Scene.
	 *
	 * @class Provides the interface for the 3D model.
	 *
	 * The objects of this class should not be created directly.
	 *
	 * @param {THREE.Scene} scene The three.js scene object.
	 * @public
	 * @author SAP SE
	 * @version 1.141.0
	 * @extends sap.ui.vk.Scene
	 * @alias sap.ui.vk.threejs.Scene
	 */
	var Scene = SceneBase.extend("sap.ui.vk.threejs.Scene", /** @lends sap.ui.vk.threejs.Scene.prototype */ {
		metadata: {
			library: "sap.ui.vk"
		},

		/**
		 * Coordinate spaces for Pois
		 * @enum {number}
		 */
		PoiCoordinateSpaces: {
			WorldSpace: 0,
			ReferenceNodeSpace: 1
		},
		constructor: function(scene) {
			SceneBase.call(this);

			this._id = uid();
			this._scene = scene;
			this._sceneBuilder = null;
			this._defaultNodeHierarchy = null;
			this._currentViewStateManager = null;
			this._animationSequenceMap = new Map();
			this._initialView = null;
			this._materialMap = new Map();

			this._outlineGeometryToNodes = new Map(); // array of mesh nodes that have this geometry

			// A storage (map) with all loaded annotations.
			//
			// annotationId -> { annotationInfo, node, attachment, targetNodes[] }
			//
			// *Annotation* is a one of *content* types. In the data model, for each annotationId
			// there is a corresponding contentId with the same ID.
			//
			// One annotation *node* (sid) can have different contents (annotations) in different
			// views, e.g. when it has different texts in different views. So, one node can be
			// associated with many annotationIds. As a result it may happen that the same node
			// exists in different entries (in the value field) in _annotationMap.
			//
			// The data model also allows to have many nodes sharing the same annotation, but this
			// is not supported in the authoring application, so the current implementation in VIT
			// does not support that either. This may change in future.
			//
			// When a viewport creates visual representations for annotations (sap.ui.vk.Annotation
			// controls) it finds nodes with the ANNOTATION type in the view definition (the
			// View#getNodeInfos() array) and uses their annotationId property to find the
			// corresponding entry in _annotationMap.
			this._annotationMap = new Map();
		}
	});

	Scene.prototype.init = function() {

		this._outlineColor = new THREE.Vector4(0, 0, 0, 1);

		// Standard polyline render is used if line thickness <= 0.0, or else thick lines are emulated with triangles and is slower to render.
		// We are not setting "resolution" on each frame update of PolylineMesh in case of thick lines,
		// so "line width" is in NDC coordinates (approx 2 pixel if screen size is 640x480)
		this._illustrationLineWidth = 1.0 / 640.0;

		this._outlineThickMaterial = new PolylineMaterial({
			color: 0xFFFFFF,
			lineColor: new THREE.Color(this._outlineColor.x, this._outlineColor.y, this._outlineColor.z),
			linewidth: this._illustrationLineWidth,
			illustration: true,
			// note: must not have USE_DASH or TRIM_STYLE in shader as they require computeLineDistances()

			depthWrite: false,
			depthFunc: THREE.LessEqualDepth,
			polygonOffset: true,
			polygonOffsetFactor: -4,
			blending: THREE.NormalBlending,
			clipping: true
		});

		this._outlineMaterial = new THREE.ShaderMaterial({
			uniforms: {
				color: {
					value: this._outlineColor
				}
			},

			vertexShader: [
				"attribute vec3 normal1;",
				"attribute vec3 normal2;",
				"#include <clipping_planes_pars_vertex>",
				"uniform vec4 color;",
				"varying vec4 vColor;",
				"void main() {",
				"	#include <begin_vertex>",
				"	#include <project_vertex>",
				"	#include <clipping_planes_vertex>",
				"	vec3 eyeDirection = mvPosition.xyz;",
				"	vec3 n1 = normalMatrix * normal1;",
				"	vec3 n2 = normalMatrix * normal2;",
				"	vColor = color;",
				"	vColor.a *= dot(normal1, normal2) <= 0.5 ? 1.0 : step(dot(eyeDirection, n1) * dot(eyeDirection, n2), 0.0);",
				"}"
			].join("\n"),

			fragmentShader: [
				"#include <clipping_planes_pars_fragment>",
				"varying vec4 vColor;",
				"void main() {",
				"	#include <clipping_planes_fragment>",
				"	if (vColor.a < 0.01) discard;",
				"	gl_FragColor = vColor;",
				"}"
			].join("\n"),

			depthWrite: false,
			depthFunc: THREE.LessEqualDepth,
			polygonOffset: true,
			polygonOffsetFactor: -4,
			blending: THREE.NormalBlending,
			clipping: true
		});

		this._solidWhiteMaterial = new THREE.MeshBasicMaterial({
			color: 0xFFFFFF
		});
	};

	Scene.prototype.clearThreeScene = function() {
		if (!this._scene) {
			return;
		}

		var all3DNodes = [];
		var allGroupNodes = [];

		ThreeUtils.getAllTHREENodes([this._scene], all3DNodes, allGroupNodes);
		var sceneUD = this._scene.userData;
		if (sceneUD.geometryClusters) {
			all3DNodes = all3DNodes.concat(sceneUD.geometryClusters);
			delete sceneUD.geometryClusters;
		}
		if (sceneUD.currentClusters) {
			sceneUD.currentClusters.clear();
		}
		sceneUD.instanceDataTexture?.dispose();
		sceneUD.instanceDataTexture = null;
		sceneUD.currentInstanceIndex = 0;

		var disposedBufferGeometries = new Map();
		var disposedMaterials = new Map();

		all3DNodes.forEach(function(n3d) {
			if (n3d instanceof THREE.Mesh) {
				if (!disposedBufferGeometries.has(n3d.geometry.uuid)) {
					ThreeUtils.disposeGeometry(n3d);
					disposedBufferGeometries.set(n3d.geometry.uuid, true);
				}

				if (n3d.material) {
					if (!disposedMaterials.has(n3d.material.uuid)) {
						ThreeUtils.disposeMaterial(n3d.material);
						disposedMaterials.set(n3d.material.uuid, true);
					}
				}

				if (n3d.userData &&
					n3d.userData.originalMaterial &&
					n3d.userData.originalMaterial.uuid !== n3d.material.uuid &&
					!disposedMaterials.has(n3d.userData.originalMaterial.uuid)) {
					ThreeUtils.disposeMaterial(n3d.userData.originalMaterial);
					disposedMaterials.set(n3d.userData.originalMaterial.uuid, true);
				}
			}
			if (n3d.parent) {
				// geometry clusters don't have parents
				n3d.parent.remove(n3d);
			}
		});

		allGroupNodes.forEach(function(gn) {
			gn.parent.remove(gn);
		});

		disposedBufferGeometries.clear();
		disposedMaterials.clear();
	};

	Scene.prototype.destroy = function() {
		this._outlineGeometryToNodes.clear();
		this.clearThreeScene();
		// if (this._sceneBuilder) {
		// 	this._sceneBuilder.cleanup();
		// }

		if (this._defaultNodeHierarchy) {
			this._defaultNodeHierarchy.destroy();
			this._defaultNodeHierarchy = null;
		}

		ThreeUtils.disposeMaterial(this._solidWhiteMaterial);
		ThreeUtils.disposeMaterial(this._outlineMaterial);
		ThreeUtils.disposeMaterial(this._outlineThickMaterial);

		this._sceneBuilder = null;
		this._scene = null;
		this._currentViewStateManager = null;

		this._animationSequenceMap.clear();
		this._materialMap.clear();

		SceneBase.prototype.destroy.call(this);
	};

	Scene.prototype.setDoubleSided = function(value) {
		this.setProperty("doubleSided", value, true);

		this._scene.traverse(function(node) {
			if (node.material !== undefined) {
				var userData = node.userData;
				var originalMaterialSide = THREE.FrontSide;
				var materialUserData;
				if (userData.originalMaterial) {
					materialUserData = userData.originalMaterial.userData;
					if (materialUserData.originalMaterialSide === undefined) {
						materialUserData.originalMaterialSide = userData.originalMaterial.side;
					}
					originalMaterialSide = materialUserData.originalMaterialSide;
				} else {
					materialUserData = node.material.userData;
					if (materialUserData.originalMaterialSide === undefined) {
						materialUserData.originalMaterialSide = node.material.side;
					}
					originalMaterialSide = materialUserData.originalMaterialSide;
				}
				node.material.side = value ? THREE.DoubleSide : originalMaterialSide;
			}
		});

		return this;
	};

	Scene.prototype.setViewStateManager = function(value) {
		this._currentViewStateManager = value;
		return this;
	};

	Scene.prototype.getViewStateManager = function() {
		return this._currentViewStateManager;
	};

	/**
	 * Gets the unique ID of the Scene object.
	 * @returns {string} The unique ID of the Scene object.
	 * @public
	 */
	Scene.prototype.getId = function() {
		return this._id;
	};

	/**
	 * Gets the default node hierarchy in the Scene object.
	 * @returns {sap.ui.vk.NodeHierarchy} The default node hierarchy in the Scene object.
	 * @public
	 */
	Scene.prototype.getDefaultNodeHierarchy = function() {
		if (!this._defaultNodeHierarchy) {
			this._defaultNodeHierarchy = new NodeHierarchy(this);
		}
		return this._defaultNodeHierarchy;
	};

	Scene.prototype._computeBoundingBox = function(visibleOnly, ignoreDynamicObjects, ignore2DObjects, dontUseClusters) {
		var boundingBox = new THREE.Box3();
		if (this._scene) {
			var sceneUD = this._scene.userData;
			var clusters = sceneUD.geometryClusters;
			if (visibleOnly && clusters && clusters.length > 100 && !dontUseClusters) {
				// this is a very large scene and computation will probably take long time...
				// and also, if we miss a few nodes, the bbox will probably be good enough on a large scene.
				// note: this is not accurate, as non-clustered objects are not accounted for
				var clusterBox;
				for (var iCluster = 0, lCluster = clusters.length; iCluster < lCluster; ++iCluster) {
					clusterBox = clusters[iCluster].geometry.boundingBox;
					if (clusterBox) {
						boundingBox.union(clusterBox);
					}
				}
			} else {
				this._scene._expandBoundingBox(boundingBox, visibleOnly, ignoreDynamicObjects, ignore2DObjects);
			}
		}
		return boundingBox;
	};

	/**
	 * Gets the scene reference for the Scene object.
	 * @returns {THREE.Scene} The three.js scene.
	 * @public
	 */
	Scene.prototype.getSceneRef = function() {
		return this._scene;
	};

	Scene.prototype.setSceneBuilder = function(sceneBuilder) {
		this._sceneBuilder = sceneBuilder;
	};

	Scene.prototype.getSceneBuilder = function() {
		return this._sceneBuilder;
	};

	/**
	 * Gets the persistent ID from node reference.
	 *
	 * @param {THREE.Object3D|THREE.Object3D[]} nodeRefs The reference to the node or the array of references to the nodes.
	 * @returns {string|string[]} The persistent ID or the array of the persistent IDs.
	 * @public
	 */
	Scene.prototype.nodeRefToPersistentId = function(nodeRefs) {
		return Array.isArray(nodeRefs) ?
			nodeRefs.map(function(nodeRef) { return nodeRef._vkPersistentId(); }) :
			nodeRefs._vkPersistentId();
	};

	/**
	 * Gets the node reference from persistent ID.
	 *
	 * @param {string|string[]} pIDs The persistent ID or the array of the persistent IDs.
	 * @returns {THREE.Object3D|THREE.Object3D[]} The reference to the node or the array of references to the nodes.
	 * @public
	 */
	Scene.prototype.persistentIdToNodeRef = function(pIDs) {
		var sceneBuilder = this._sceneBuilder;

		if (Array.isArray(pIDs)) {
			return pIDs.map(function(pID) { return sceneBuilder ? sceneBuilder.getNode(pID) : null; });
		} else {
			return sceneBuilder ? sceneBuilder.getNode(pIDs) : null;
		}
	};

	/**
	 * Assign persistent id to node
	 *
	 * @param {THREE.Object3D} nodeRef the reference to the node
	 * @param {string} sid The persistent id
	 * @param {string} sceneId scene id
	 * @returns {boolean} true if assignment is successful, false if persistent id cannot be assigned
	 * @private
	 */
	Scene.prototype.setNodePersistentId = function(nodeRef, sid, sceneId) {
		return this._sceneBuilder ? this._sceneBuilder.setNodePersistentId(nodeRef, sid, sceneId) : false;
	};

	Scene.prototype._addAnnotation = function(annotationId, annotationInfo) {
		this._annotationMap.set(annotationId, annotationInfo);
	};

	Scene.prototype._hasAnnotation = function(annotationId) {
		return this._annotationMap.has(annotationId);
	};

	Scene.prototype._getAnnotations = function() {
		return this._annotationMap;
	};

	Scene.prototype._removeAnnotationsForNode = function(nodeRef) {
		this._annotationMap.forEach(function(annotationInfo) {
			if (annotationInfo.node === nodeRef) {
				this._annotationMap.delete(annotationInfo.annotation.id);
			}
		}, this);
	};

	/**
	 * Assign persistent id to annotation
	 *
	 * @param {any} annotation the reference to the annotation
	 * @param {string} sid The persistent id
	 * @param {string} sceneId scene id
	 * @returns {boolean} true if assignment is successful, false if persistent id cannot be assigned
	 * @private
	 */
	Scene.prototype.setAnnotationPersistentId = function(annotation, sid, sceneId) {
		var annotationInfo = this._annotationMap.get(annotation.id);
		if (annotationInfo) {
			this._annotationMap.delete(annotation.id);
			annotationInfo.annotation.id = sid;
			this._annotationMap.set(sid, annotationInfo);
			return true;
		}
		return false;
	};

	/**
	 * Gets a point cloud groups map
	 *
	 * @returns {Map} Point cloud groups map
	 * @private
	 */
	Scene.prototype.getPointCloudGroups = function() {
		this._pointCloudGroups ??= new Map(); // node -> [ PointCloudGroup ]
		return this._pointCloudGroups;
	};

	/**
	 * Gets all materials defined in scene nodes
	 *
	 * @returns {sap.ui.vk.Material[]} the array of materials.
	 * @public
	 */
	Scene.prototype.enumerateMaterials = function() {
		if (!this._defaultNodeHierarchy) {
			return [];
		}

		var topNode = this._defaultNodeHierarchy.createNodeProxy(this._scene);
		if (topNode) {
			return topNode.enumerateMaterials(true);
		} else {
			return [];
		}
	};

	var distEpsilon = 0;

	function compare(a, b) {
		var dx = a.x - b.x;
		if (dx < -distEpsilon) {
			return true;
		}
		if (dx > distEpsilon) {
			return false;
		}

		var dy = a.y - b.y;
		if (dy < -distEpsilon) {
			return true;
		}
		if (dy > distEpsilon) {
			return false;
		}

		return a.z - b.z < -distEpsilon;
	}

	function quickSort(array, beginIndex, endIndex) {
		if (beginIndex < endIndex) {
			var partitionIndex = partition(array, beginIndex, endIndex);
			quickSort(array, beginIndex, partitionIndex - 1);
			quickSort(array, partitionIndex + 1, endIndex);
		}
		return array;
	}

	function partition(array, beginIndex, endIndex) {
		var pivotValue = array[endIndex],
			partitionIndex = beginIndex;

		for (var i = beginIndex; i < endIndex; i++) {
			if (compare(array[i], pivotValue)) {
				swap(array, i, partitionIndex);
				partitionIndex++;
			}
		}
		swap(array, endIndex, partitionIndex);
		return partitionIndex;
	}

	function swap(array, i, j) {
		if (i != j) {
			var temp = array[i];
			array[i] = array[j];
			array[j] = temp;
		}
	}

	function OutlineGeometry(geometry, thresholdAngle) {
		var _this = new THREE.BufferGeometry();

		Object.setPrototypeOf(_this, OutlineGeometry.prototype);

		_this.type = "OutlineGeometry";

		var positionAttribute = geometry && geometry.isBufferGeometry && geometry.getAttribute("position");
		if (!positionAttribute || !geometry.index) {
			return;
		}

		geometry.computeBoundingBox();
		var size = new THREE.Vector3();
		geometry.boundingBox.getSize(size);
		distEpsilon = Math.max(size.x, size.y, size.z) * 1e-4;

		var vertexCount = positionAttribute.count;
		var indices = geometry.index.array;
		var indexCount = indices.length;
		if (vertexCount === 0 || indexCount < 3) {
			return;
		}

		var i, j, ei, fi;
		var vertices = new Array(vertexCount);
		for (i = 0; i < vertexCount; i++) {
			vertices[i] = new THREE.Vector3().fromArray(positionAttribute.array, i * positionAttribute.itemSize);
			vertices[i].index = i;
		}

		quickSort(vertices, 0, vertices.length - 1);

		var uniqueVertices = [], changes = [];
		uniqueVertices.push(vertices[0]);
		changes[vertices[0].index] = uniqueVertices.length - 1;
		for (i = 1; i < vertexCount; i++) {
			if (compare(uniqueVertices[uniqueVertices.length - 1], vertices[i])) {
				uniqueVertices.push(vertices[i]);
			}
			changes[vertices[i].index] = uniqueVertices.length - 1;
		}

		var newIndices = [];
		for (ei = 0; ei < indexCount; ei += 3) {
			var a = changes[indices[ei]];
			var b = changes[indices[ei + 1]];
			var c = changes[indices[ei + 2]];

			if (a !== b && b !== c && c !== a) {
				newIndices.push(a, b, c);
			}
		}

		indices = newIndices;
		vertices = uniqueVertices;
		indexCount = indices.length;
		// vertexCount = vertices.length;

		var edges = {}, key;
		var v = new THREE.Vector3(), dir1 = new THREE.Vector3(), dir2 = new THREE.Vector3();
		var faceNormals = new Array(indexCount / 3);

		// now create a data structure where each entry represents an edge with its adjoining faces
		for (ei = 0, fi = 0; ei < indexCount; ei += 3, fi++) {
			dir1.copy(vertices[indices[ei + 1]]).sub(vertices[indices[ei]]);
			dir2.copy(vertices[indices[ei + 2]]).sub(vertices[indices[ei]]);
			faceNormals[fi] = new THREE.Vector3().crossVectors(dir1, dir2).normalize();

			for (i = 0, j = 2; i < 3; j = i++) {
				var edge1 = indices[ei + j];
				var edge2 = indices[ei + i];
				key = Math.min(edge1, edge2) + "," + Math.max(edge1, edge2);

				if (edges[key] === undefined) {
					edges[key] = {
						index1: edge1,
						index2: edge2,
						face1: fi,
						face2: undefined
					};
				} else {
					edges[key].face2 = fi;
				}
			}
		}

		// generate outline vertices
		var thresholdDot = Math.cos(THREE.MathUtils.DEG2RAD * ((thresholdAngle !== undefined) ? thresholdAngle : 1));
		var positions = [];
		var normals1 = [];
		var normals2 = [];
		for (key in edges) {
			var e = edges[key];

			// an edge is only rendered if the angle (in degrees) between the face normals of the adjoining faces exceeds this value. default = 1 degree.
			if (e.face2 === undefined || (faceNormals[e.face1].dot(faceNormals[e.face2]) <= thresholdDot &&
				v.copy(vertices[e.index2]).sub(vertices[e.index1]).cross(faceNormals[e.face1]).dot(faceNormals[e.face2]) > 0)) {

				var vertex = vertices[e.index1];
				positions.push(vertex.x, vertex.y, vertex.z);

				vertex = vertices[e.index2];
				positions.push(vertex.x, vertex.y, vertex.z);

				var normal1 = faceNormals[e.face1];
				normals1.push(normal1.x, normal1.y, normal1.z);
				normals1.push(normal1.x, normal1.y, normal1.z);

				if (e.face2 !== undefined) {
					var normal2 = faceNormals[e.face2];
					normals2.push(normal2.x, normal2.y, normal2.z);
					normals2.push(normal2.x, normal2.y, normal2.z);
				} else {
					normals2.push(0, 0, 0);
					normals2.push(0, 0, 0);
				}
			}
		}

		// build geometry
		_this.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
		_this.setAttribute("normal1", new THREE.Float32BufferAttribute(normals1, 3));
		_this.setAttribute("normal2", new THREE.Float32BufferAttribute(normals2, 3));

		return _this; // eslint-disable-line consistent-return
	}

	OutlineGeometry.prototype = Object.create(THREE.BufferGeometry.prototype);
	OutlineGeometry.prototype.constructor = OutlineGeometry;

	function nodeBoxIsNull(node) {
		const rgb = node.userData.renderGroup?.boundingBox;
		if (rgb) {
			return (rgb[0] >= rgb[3] && rgb[1] >= rgb[4] && rgb[2] >= rgb[5]);
		}

		const box = node.geometry.boundingBox;
		// callouts and billboards have empty bounding box, we need to ignore them
		return (box === null) || (box.min.x >= box.max.x && box.min.y >= box.max.y && box.min.z >= box.max.z);
	}

	function countMeshVerticesIndices(node, isChild) {
		const geometry = node.isMesh && (!!node.userData.skipIt === isChild) && !nodeBoxIsNull(node) && node.geometry;
		const positionAttribute = geometry && geometry.isBufferGeometry && geometry.getAttribute("position");
		if (!positionAttribute) {
			return [0, 0];
		}

		const rg = node.userData.renderGroup;
		return rg ? [rg.lastVertex - rg.firstVertex, rg.count] : [positionAttribute.count, geometry.index ? geometry.index.array.length : positionAttribute.count];
	}

	function addMeshVerticesIndices(resultVertices, resultIndices, resultCounts, node, isChild, geometryToNodesMap) {
		const geometry = node.isMesh && (!!node.userData.skipIt === isChild) && !nodeBoxIsNull(node) && node.geometry;
		const positionAttribute = geometry && geometry.isBufferGeometry && geometry.getAttribute("position");
		if (!positionAttribute) {
			return;
		}

		let tm = null;
		if (isChild) {
			node.updateMatrix();
			tm = node.matrix;
		}

		if (geometryToNodesMap) {
			TotaraUtils.pushElementIntoMapArray(geometryToNodesMap, node.userData.geometryId, isChild ? node.parent : node);
		}

		const rg = node.userData.renderGroup;
		const vertexStart = rg ? rg.firstVertex : 0;
		const vertexCount = rg ? (rg.lastVertex - vertexStart) : positionAttribute.count;

		const vertices = positionAttribute.array;
		const sourceVertexOffset = vertexStart * 3;
		const destinationVertexFirstIndex = resultCounts[0];
		const destinationVertexOffset = destinationVertexFirstIndex * 3;
		const pos = new THREE.Vector3();
		for (let i = 0, l = vertexCount * 3; i < l; i += 3) {
			pos.set(vertices[sourceVertexOffset + i], vertices[sourceVertexOffset + i + 1], vertices[sourceVertexOffset + i + 2]);
			if (tm) {
				pos.applyMatrix4(tm);
			}

			resultVertices[destinationVertexOffset + i] = pos.x;
			resultVertices[destinationVertexOffset + i + 1] = pos.y;
			resultVertices[destinationVertexOffset + i + 2] = pos.z;
		}

		const destinationIndexOffset = resultCounts[1];
		const indices = geometry?.index?.array;
		const indexStart = rg ? rg.start : 0;
		let indexCount;
		if (indices) {
			indexCount = rg ? rg.count : indices.count;
			const indexAdjustment = vertexStart - destinationVertexFirstIndex;
			for (let i = 0; i < indexCount; ++i) {
				resultIndices[destinationIndexOffset + i] = indices[indexStart + i] - indexAdjustment;
			}
		} else {
			// generate index if it doesn't exist
			indexCount = vertexCount;
			for (let i = 0; i < indexCount; ++i) {
				resultIndices[destinationIndexOffset + i] = destinationVertexFirstIndex + i;
			}
		}

		resultCounts[0] += vertexCount;
		resultCounts[1] += indexCount;
	}

	function _addOutlineGeometry(node, isPolylineMesh, outlineMaterial, geometryToNodesMap) {
		try {
			// create merged geometry first
			let i, childCount = node.children.length;
			let [vertexCount, indexCount] = countMeshVerticesIndices(node, false);
			for (i = 0; i < childCount; ++i) {
				const [childVertexCount, childIndexCount] = countMeshVerticesIndices(node.children[i], true);
				vertexCount += childVertexCount;
				indexCount += childIndexCount;
			}

			if (!vertexCount) {
				return;
			}

			const vertices = new Float32Array(vertexCount * 3);
			const indices = new Uint32Array(indexCount);
			let counts = [0, 0]; // [0] - vertex, [1] - index

			addMeshVerticesIndices(vertices, indices, counts, node, false, geometryToNodesMap);
			for (i = 0; i < childCount; ++i) {
				addMeshVerticesIndices(vertices, indices, counts, node.children[i], true, geometryToNodesMap);
			}

			const geometry = new THREE.BufferGeometry();
			geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
			geometry.setIndex(new THREE.BufferAttribute(indices, 1));

			// now create the outline geometry from it
			const outlineGeometry = new OutlineGeometry(geometry);
			const positionAttribute = outlineGeometry.getAttribute("position");
			if (positionAttribute && positionAttribute.count > 0) {
				let line;
				if (isPolylineMesh) {
					const polylineGeometry = new PolylineGeometry(outlineGeometry);
					polylineGeometry.boundingBox = new THREE.Box3(); // set empty bounding box, disable hit testing
					line = new PolylineMesh(polylineGeometry, outlineMaterial);
				} else {
					outlineGeometry.boundingBox = new THREE.Box3(); // set empty bounding box, disable hit testing
					line = new THREE.LineSegments(outlineGeometry, outlineMaterial);
				}

				line.isOutline = true;
				line.userData.skipIt = true;
				line.renderOrder = node.renderOrder + 0.5;
				line.matrixWorldNeedsUpdate = true;
				node.add(line);
				node.hasOutline = true;
			}
		} catch (err) {
			Log.error("Unable to create outline geometry for node " + node.name, err);
		}
	}

	function setMeshMaterial(node, newMaterial) {
		var userData = node.userData;
		if (userData.defaultMaterial === undefined) {// save default material
			userData.defaultMaterial = userData.originalMaterial || node.material;
		}
		node.material = newMaterial;

		// apply highlighting on the updated material
		userData.originalMaterial = null;
	}

	function restoreMeshMaterial(node) {
		var userData = node.userData;
		if (userData.defaultMaterial) {
			node.material = userData.defaultMaterial;
			delete userData.defaultMaterial;

			// apply highlighting on the updated material
			userData.originalMaterial = null;
		}
	}

	Scene.prototype._createOutlineGeometry = function(renderMode) {
		if (this._scene) {
			this._scene._vkTraverseMeshNodes(function(node) {
				if (node.isOutline) {
					node.visible = true;
				} else {
					if (!node.hasOutline) {// create outline
						const isThickLines = this._illustrationLineWidth > 0.0;
						_addOutlineGeometry(node, isThickLines, isThickLines ? this._outlineThickMaterial : this._outlineMaterial, this._outlineGeometryToNodes);
					}
					if (node.isMesh && node.material && !node.material.isLineBasicMaterial && !node.material.isLineMaterial) {// update material
						switch (renderMode) {
							case RenderMode.LineIllustration:
								setMeshMaterial(node, this._solidWhiteMaterial);
								break;
							case RenderMode.ShadedIllustration:
								// create whited material
								var material = (node.userData.defaultMaterial || node.userData.originalMaterial || node.material).clone();
								if (material.emissive) {
									material.color.multiplyScalar(0.5);
									material.emissive.multiplyScalar(0.5).addScalar(0.5);
								} else {
									material.color.multiplyScalar(0.5).addScalar(0.5);
								}
								setMeshMaterial(node, material);
								break;
							default:
								restoreMeshMaterial(node);
								break;
						}
					}
				}
			}.bind(this));
		}
	};

	Scene.prototype._hideOutlineGeometry = function() {
		if (this._scene) {
			this._scene._vkTraverseMeshNodes(function(node) {
				if (node.isOutline) {
					node.visible = false;
				}

				if (node.isMesh) {
					restoreMeshMaterial(node);
				}
			});
		}
	};

	Scene.prototype.onGeometryUpdated = function(geometryId) {
		const nodes = this._outlineGeometryToNodes.get(geometryId);
		if (nodes) {
			for (let ni = 0; ni < nodes.length; ++ni) {
				const node = nodes[ni];
				const ch = node.children;
				for (let i = ch.length - 1; i >= 0; --i) {
					const outlineNode = ch[i];
					if (outlineNode.isOutline) {
						const isPolylineMesh = outlineNode.isPolylineMesh;
						const outlineMaterial = outlineNode.material;
						node.remove(outlineNode);

						// must rebuild the outline mesh used in illustration rendering as it was built off a proxy mesh
						_addOutlineGeometry(node, isPolylineMesh, outlineMaterial, null);
						break;
					}
				}
			}
		}
	};

	/**
	 * Get initial view
	 *
	 * @returns {sap.ui.vk.View} initial view
	 * @public
	 */
	Scene.prototype.getInitialView = function() {
		return this._initialView;
	};

	/**
	 * Set initial view
	 *
	 * @param {sap.ui.vk.View} view Initial view
	 *
	 * @public
	 */
	Scene.prototype.setInitialView = function(view) {
		this._initialView = view;
	};

	/**
	 * Get material
	 *
	 * @param {string} materialId material id
	 *
	 * @returns {sap.ui.vk.threejs.Material} material
	 *
	 * @private
	 */
	Scene.prototype.getMaterial = function(materialId) {
		return this._materialMap.get(materialId);
	};

	/**
	 * Set material
	 *
	 * @param {string} materialId material id
	 * @param {sap.ui.vk.threejs.Material} material to be stored
	 *
	 * @private
	 */
	Scene.prototype.setMaterial = function(materialId, material) {
		this._materialMap.set(materialId, material);
	};

	/**
	 * Clear unused materials
	 *
	 * @private
	 */
	Scene.prototype.clearUnusedMaterials = function() {
		const existingMaterials = new Set();
		this._scene?.traverse((node) => {
			if (node.material) {
				existingMaterials.add(node.material);
				if (node.userData.originalMaterial) {
					existingMaterials.add(node.userData.originalMaterial);
				}
			}
		});

		const entries = [];
		this._materialMap.forEach(function(value, key) {
			if (existingMaterials.has(value.getMaterialRef())) {
				entries.push([key, value]);
			} else {
				value.destroy();
			}
		});
		this._materialMap = new Map(entries);
	};

	Scene.prototype._getNativeMaterial = function(materialId) {
		var material = materialId ? this._materialMap.get(materialId) : null;
		return material ? material.getMaterialRef() : null;
	};

	Scene.prototype._setNodeMaterial = function(node, materialId) {
		var material = this._getNativeMaterial(materialId);
		node.children.forEach(function(child) {
			if (child.material) {
				if (material) {// replace submesh material
					if (child.userData.materialId !== materialId) {
						this._sceneBuilder._setSubmeshMaterial(child, material, materialId);
					}
				} else {// restore submesh initial material
					var initialMaterialId = child.userData.initialMaterialId;
					if (initialMaterialId && child.userData.materialId !== initialMaterialId) {
						var initialMaterial = this._getNativeMaterial(initialMaterialId);
						if (initialMaterial) {
							this._sceneBuilder._setSubmeshMaterial(child, initialMaterial, initialMaterialId);
						}
					}
				}
			}
		}.bind(this));
	};

	/**
	 * Add marker to node associations
	 * @param {string} referenceNodeId 	Marker's reference node id
	 * @param {string} markerNodeId 	Marker's node id
	 * @public
	 */

	Scene.prototype.bindMarkerNodeTransformationToReferenceNode = function(referenceNodeId, markNodeId) {
		if (this._sceneBuilder) {
			this._sceneBuilder.bindMarkerNodeTransformationToReferenceNode(referenceNodeId, markNodeId, this.PoiCoordinateSpaces.ReferenceNodeSpace);
		}
	};

	/**
	 * Remove marker from node associations
	 * @param {string} referenceNodeId 	Marker's reference node id
	 * @param {string} markerNodeId 	Marker's node id
	 * @public
	 */

	Scene.prototype.unbindMarkerNodeTransformationFromReferenceNode = function(referenceNodeId, markNodeId) {
		if (this._sceneBuilder) {
			this._sceneBuilder.unbindMarkerNodeTransformationFromReferenceNode(referenceNodeId, markNodeId);
		}
	};

	/**
	 *
	 * Get reference node for a given marker node sid
	 * @param {string} markNodeId 	Marker's sid
	 * @public
	 * @returns {sap.ui.vk.threejs.Node} reference node of given marker
	 */
	Scene.prototype.getReferenceNodeFromMarkerNodeId = function(markNodeId) {
		if (this._sceneBuilder) {
			return this._sceneBuilder.getReferenceNodeFromMarkerNodeId(markNodeId);
		}
		return null;
	};

	Scene.prototype.updateMarkerCoordinateSpace = function(previousMarkerNodeId, referenceNodeId, newMarkerNodeId) {
		if (!previousMarkerNodeId || !referenceNodeId || !newMarkerNodeId) {
			return;
		}
		if (this._sceneBuilder) {
			this._sceneBuilder.updateMarkerCoordinateSpace(previousMarkerNodeId, referenceNodeId, newMarkerNodeId);
		}
	};

	return Scene;
});
