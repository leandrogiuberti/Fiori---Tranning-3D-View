/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides object sap.ui.vk.threejs.HitTester
sap.ui.define([
	"sap/base/Log",
	"../thirdparty/three"
], function(
	Log,
	THREE
) {
	"use strict";

	const RENDER_TARGET_WIDTH = 31; // must be an odd number to avoid calculation errors
	const RENDER_TARGET_HEIGHT = 31; // must be an odd number to avoid calculation errors

	var HitTester = function() {
		this._maskMaterial = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, fog: false });
		this._depthMaterial = new THREE.ShaderMaterial({
			vertexShader: [
				"#include <clipping_planes_pars_vertex>",
				"void main() {",
				"	#include <data_texture_explicit>",
				"	#include <begin_vertex>",
				"	#include <project_vertex>",
				"	#include <clipping_planes_vertex>",
				"}"
			].join("\n"),

			fragmentShader: [
				"#include <clipping_planes_pars_fragment>",
				"void main() {",
				"	#include <clipping_planes_fragment>",
				"	highp vec4 value = vec4(fract(vec4(1.0, 255.0, 65025.0, 16581375.0) * gl_FragCoord.z));",
				"	value.xyz -= value.yzw * (1.0 / 255.0);",
				"	gl_FragColor = value;",
				"}"
			].join("\n"),

			side: THREE.DoubleSide,
			clipping: true
		});

		this._renderTarget = new THREE.WebGLRenderTarget(RENDER_TARGET_WIDTH, RENDER_TARGET_HEIGHT, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
		this._renderTarget.texture.generateMipmaps = false;
		this._renderTarget.depthBuffer = true;
	};

	// var USE_RENDER_BUFFER_DIRECT = false; // use WebGLRenderer.renderBufferDirect()

	var testCamera;
	var matViewProj = new THREE.Matrix4();
	var frustum = new THREE.Frustum();
	var inverseMatrix = new THREE.Matrix4();
	var screenPos = new THREE.Vector2();
	var raycaster = new THREE.Raycaster();
	var ray = new THREE.Ray();
	var sphere = new THREE.Sphere();
	var objects = [];
	var data = new Uint8Array(4);
	var point = new THREE.Vector3();

	function getMeshNode(object) {
		// search for the first closed parent node
		var parent = object.parent;
		while (parent) {
			if (parent.userData.closed) {
				object = parent;
			}
			parent = parent.parent;
		}

		// skip "skipIt" and unnamed nodes
		while (object.parent && object.userData.skipIt) {
			object = object.parent;
		}

		return object;
	}

	HitTester.prototype.hitTest = function(x, y, width, height, renderer, scene, camera, clippingPlanes, options) {
		if (testCamera?.constructor !== camera.constructor) {
			testCamera = new camera.constructor();
		}
		testCamera.copy(camera);

		// BEGIN full size rendering
		// const vx = x;
		// const vy = height - y - 1;
		// const cameraX = (vx / width) * 2 - 1;
		// const cameraY = (vy / height) * 2 - 1;
		// this._renderTarget.setSize(width, height);
		// END full size rendering
		// todo: if enabling scissor test, then readRenderTargetPixels() always returns 0,0,0. renderer.setScissor(vx + 1, vy, 1, 1); renderer.setScissorTest(true);

		// BEGIN cropped rendering
		const vx = RENDER_TARGET_WIDTH >> 1;
		const vy = RENDER_TARGET_HEIGHT >> 1;
		const cameraX = 0;
		const cameraY = 0;
		var view = camera.view;
		if (view) {
			const w = view.width / width;
			const h = view.height / height;
			testCamera.setViewOffset(view.fullWidth, view.fullHeight, view.offsetX + (x - 0.5 * RENDER_TARGET_WIDTH) * w, view.offsetY + (y - 0.5 * RENDER_TARGET_WIDTH) * h, w * RENDER_TARGET_WIDTH, h * RENDER_TARGET_WIDTH);
		} else {
			testCamera.setViewOffset(width, height, x - RENDER_TARGET_WIDTH * 0.5, y - RENDER_TARGET_HEIGHT * 0.5, RENDER_TARGET_WIDTH, RENDER_TARGET_HEIGHT);
		}
		// END cropped rendering

		testCamera.updateMatrixWorld();
		testCamera.updateProjectionMatrix();
		matViewProj.multiplyMatrices(testCamera.projectionMatrix, testCamera.matrixWorldInverse);
		frustum.setFromProjectionMatrix(matViewProj);
		raycaster.setFromCamera(screenPos.set(cameraX, cameraY), testCamera);

		const rBits = renderer.getContextRedBits();
		const gBits = renderer.getContextGreenBits();
		const bBits = renderer.getContextBlueBits();
		const rgBits = rBits + gBits;
		const rMask = (1 << rBits) - 1;
		const gMask = (1 << gBits) - 1;
		const bMask = (1 << bBits) - 1;
		const rMaskInv = 1 / rMask;
		const gMaskInv = 1 / gMask;
		const bMaskInv = 1 / bMask;
		const maskMaterial = this._maskMaterial;

		var oldClearColor = new THREE.Color();
		renderer.getClearColor(oldClearColor);
		var oldClearAlpha = renderer.getClearAlpha();
		var oldAutoClear = renderer.autoClear;
		renderer.setRenderTarget(this._renderTarget);
		renderer.clippingPlanes = clippingPlanes || [];
		renderer.autoClear = false;
		renderer.setClearColor(0x000000, 0);
		renderer.clear(true, true, false);

		// var materialShader;
		// if (USE_RENDER_BUFFER_DIRECT) {
		// 	renderer.compile(scene, camera); // not needed, but sets currentRenderState (the WebGLRenderer local scope variable) that is used in WebGLRenderer.renderBufferDirect()
		// 	maskMaterial.isShaderMaterial = true; // this is necessary to update the diffuse uniform
		// }

		var color = maskMaterial.color;
		var index = 0;
		objects.length = 0;

		var underlayObjects = options && options.ignoreUnderlay ? null : [];
		var regularObjects = [];
		var overlayObjects = options && options.ignoreOverlay ? null : [];

		function addObject(node, renderStage) {
			if (!renderStage) {
				regularObjects.push(node);
			} else if (renderStage < 0) {
				if (underlayObjects) {
					underlayObjects.push(node);
				}
			} else if (overlayObjects) {
				overlayObjects.push(node);
			}
		}

		function traverseVisible(node, renderStage) {
			// NB: we use the strict comparison for `node.userData.selectable` as value `null` means
			// *use the default value* which is `true` by design.
			if (!node.visible || node.userData.selectable === false) {
				return;
			}

			renderStage = renderStage || node.userData.renderStage;

			var geometry = node.geometry;
			if (geometry && node.material) {
				if (geometry.userData.isPointCloud) { // ignore boundings testing
					addObject(node, renderStage);
				} else if (frustum.intersectsObject(node)) {
					const matrixWorld = node.matrixWorld;
					const rg = node.userData.renderGroup;
					if (rg?.boundingSphere) {
						sphere.setFromPackedArray(rg.boundingSphere);
					} else {
						if (geometry.boundingSphere == null) {
							geometry.computeBoundingSphere();
						}

						sphere.copy(geometry.boundingSphere);
					}

					sphere.applyMatrix4(matrixWorld);

					if (raycaster.ray.intersectsSphere(sphere)) {
						inverseMatrix.copy(matrixWorld).invert();
						ray.copy(raycaster.ray).applyMatrix4(inverseMatrix);

						const bbox = rg?.boundingBox ? THREE.Box3.newFromPackedArray(rg.boundingBox) : geometry.boundingBox;
						if (bbox == null || ray.intersectsBox(bbox)) {
							addObject(node, renderStage);
						}
					}
				}
			}

			var children = node.children;
			for (var i = 0, l = children.length; i < l; i++) {
				traverseVisible(children[i], renderStage);
			}
		}

		traverseVisible(scene);

		function renderNode(node, material) {
			const nodeMaterial = node.material;
			node.material = material;
			if (node.geometry.userData.isPointCloud) {
				material.specularMap = nodeMaterial.specularMap; // copy cluster instance data map
			}
			// node.frustumCulled = false;

			renderer.render(node, testCamera);

			// node.frustumCulled = true;
			node.material = nodeMaterial;

		}

		function renderObject(node) {
			index += 1;
			objects.push(node);
			color.setRGB((index & rMask) * rMaskInv, ((index >> rBits) & gMask) * gMaskInv, ((index >> rgBits) & bMask) * bMaskInv);
			// console.log(index, node.name, color.getHexString());

			renderNode(node, maskMaterial);
		}

		if (underlayObjects != null && underlayObjects.length > 0) {
			underlayObjects.forEach(renderObject);
			renderer.clearDepth();
		}

		regularObjects.forEach(renderObject);

		if (overlayObjects != null && overlayObjects.length > 0) {
			renderer.clearDepth();
			overlayObjects.forEach(renderObject);
		}

		renderer.readRenderTargetPixels(this._renderTarget, vx, vy, 1, 1, data);
		index = (data[0] >> (8 - rBits)) + ((data[1] >> (8 - gBits)) << rBits) + ((data[2] >> (8 - bBits)) << rgBits);
		let object = index > 0 ? objects[index - 1] : null;
		// console.log("hitTest", index, object);

		// BEGIN DebugHittestFrameBuffer (only makes sense with full size framebuffer, not the 1x1 pixel variant)
		// if (!this.debugImage) {
		// 	this.debugImage = new Image();
		// 	this.debugImage.style = `transform: scaleY(-1); width: ${RENDER_TARGET_WIDTH}px; z-index: 100; position: absolute; pointer-events: none`;
		// 	document.body.appendChild(this.debugImage);
		// }

		// const gl = renderer.getContext();
		// const texture = renderer.properties.get(this._renderTarget.texture).__webglTexture;
		// const framebuffer = gl.createFramebuffer();
		// gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
		// gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
		// const pixelData = new Uint8Array(RENDER_TARGET_WIDTH * RENDER_TARGET_HEIGHT * 4);
		// gl.readPixels(0, 0, RENDER_TARGET_WIDTH, RENDER_TARGET_HEIGHT, gl.RGBA, gl.UNSIGNED_BYTE, pixelData);
		// gl.deleteFramebuffer(framebuffer);

		// const canvas = document.createElement("canvas");
		// canvas.width = RENDER_TARGET_WIDTH;
		// canvas.height = RENDER_TARGET_HEIGHT;
		// const context = canvas.getContext("2d");

		// const imageData = context.createImageData(RENDER_TARGET_WIDTH, RENDER_TARGET_HEIGHT);
		// imageData.data.set(pixelData);
		// context.putImageData(imageData, 0, 0);

		// this.debugImage.src = canvas.toDataURL();
		// END DebugHittestFrameBuffer

		if (object) {
			renderer.clear(true, true, false);
			renderNode(object, this._depthMaterial);

			renderer.readRenderTargetPixels(this._renderTarget, vx, vy, 1, 1, data);
			const z = ((data[0] + (data[1] + (data[2] + data[3] / 255) / 255) / 255) / 255) * 2 - 1;
			point.set(cameraX, cameraY, z).unproject(testCamera);

			if (object.geometry.userData.isPointCloud && scene.userData._instanceIndexToNodeMap instanceof Map) { // get point instanceIndex
				this._clusterIndexMaterial ??= new THREE.ShaderMaterial({
					vertexShader: [
						"#include <clipping_planes_pars_vertex>",
						"varying lowp vec3 clusterColor;",
						"void main() {",
						"	#include <data_texture_explicit>",
						"	#include <begin_vertex>",
						"	#include <project_vertex>",
						"	#include <clipping_planes_vertex>",
						"	highp int index = int(clusterInstance);",
						`	clusterColor.x = float(index & ${rMask}) * ${rMaskInv};`,
						`	clusterColor.y = float((index >> ${rBits}) & ${gMask}) * ${gMaskInv};`,
						`	clusterColor.z = float((index >> ${rgBits}) & ${bMask}) * ${bMaskInv};`,
						"}"
					].join("\n"),

					fragmentShader: [
						"#include <clipping_planes_pars_fragment>",
						"varying lowp vec3 clusterColor;",
						"void main() {",
						"	#include <clipping_planes_fragment>",
						"	gl_FragColor = vec4(clusterColor, 1.0);",
						"}"
					].join("\n"),

					side: THREE.DoubleSide,
					clipping: true
				});

				renderer.clear(true, true, false);
				renderNode(object, this._clusterIndexMaterial);

				renderer.readRenderTargetPixels(this._renderTarget, vx, vy, 1, 1, data);
				const instanceIndex = (data[0] >> (8 - rBits)) + ((data[1] >> (8 - gBits)) << rBits) + ((data[2] >> (8 - bBits)) << rgBits);
				if (instanceIndex > 0) {
					object = scene.userData._instanceIndexToNodeMap.get(instanceIndex) ?? object;
				}
			}
		}

		renderer.setRenderTarget(null);
		renderer.clippingPlanes = [];
		renderer.setClearColor(oldClearColor, oldClearAlpha);
		renderer.autoClear = oldAutoClear;

		return object ? { distance: raycaster.ray.origin.distanceTo(point), point: point, object: getMeshNode(object) } : null;
	};

	HitTester.prototype.hitTestPrecise = function(x, y, width, height, scene, camera, clippingPlanes) {
		raycaster.setFromCamera(screenPos.set((x / width) * 2 - 1, (y / height) * -2 + 1), camera);

		if (clippingPlanes && clippingPlanes.length > 0) {
			for (var pi in clippingPlanes) {
				var plane = clippingPlanes[pi];
				var dist = plane.distanceToPoint(raycaster.ray.origin),
					t = -dist / plane.normal.dot(raycaster.ray.direction);
				if (t > 0) {
					if (dist < 0) {
						raycaster.near = Math.max(raycaster.near, t);
					} else {
						raycaster.far = Math.min(raycaster.far, t);
					}
				} else if (dist < 0) {
					return null;
				}
			}
		}

		var intersects = raycaster.intersectObjects(scene.children, true);

		if (clippingPlanes && clippingPlanes.length > 0) {// restore raycaster default near and far values
			raycaster.near = 0;
			raycaster.far = Infinity;
		}

		if (intersects) {
			for (var i in intersects) {
				var result = intersects[i];
				var object = getMeshNode(result.object);

				if (object.visible && !object.isBillboard && !object.isDetailView) {
					result.object = object;
					return result;
				}
			}
		}

		return null;
	};

	HitTester.prototype.hitTestPoint = function(x, y, width, height, scene, camera, clippingPlanes) {
		raycaster.setFromCamera(screenPos.set((x / width) * 2 - 1, (y / height) * -2 + 1), camera);

		if (clippingPlanes && clippingPlanes.length > 0) {
			for (var pi in clippingPlanes) {
				var plane = clippingPlanes[pi];
				var dist = plane.distanceToPoint(raycaster.ray.origin),
					t = -dist / plane.normal.dot(raycaster.ray.direction);
				if (t > 0) {
					if (dist < 0) {
						raycaster.near = Math.max(raycaster.near, t);
					} else {
						raycaster.far = Math.min(raycaster.far, t);
					}
				} else if (dist < 0) {
					return null;
				}
			}
		}

		var intersects = raycaster.intersectObjects(scene.children, true);

		if (clippingPlanes && clippingPlanes.length > 0) {// restore raycaster default near and far values
			raycaster.near = 0;
			raycaster.far = Infinity;
		}
		// for panoramic scene POI placement: return point when only hit one point
		return intersects.length === 1 ? intersects[0].point : null;
	};

	return HitTester;
});
