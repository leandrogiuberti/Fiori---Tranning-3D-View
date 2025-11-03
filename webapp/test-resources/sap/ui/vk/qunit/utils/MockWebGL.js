sap.ui.define([
	"sap/ui/vk/threejs/ThreeUtils"
], function(
	ThreeUtils
) {
	"use strict";

	function testWebGL2() {
		try {
			const canvas = document.createElement('canvas');
			// Attempt to get a WebGL2 context
			const gl = canvas.getContext('webgl2');
			return !!gl && typeof gl.getParameter === 'function';
		} catch (e) {
			return false;
		}
	}

	if (!testWebGL2()) {
		let noOp = () => { };
		ThreeUtils.IsUsingMock = true;
		ThreeUtils.createWebGLRenderer = () => {
			let canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
			canvas.width = 360;
			canvas.height = 360;
			return {
				domElement: canvas,
				info: { render: { calls: 0, triangles: 10, lines: 10, points: 10, vramAllocated: 10, vramUpdated: 10 } },
				setViewport: noOp,
				render: noOp,
				clearDepth: noOp,
				setSize(width, height) { this._width = width; this._height = height; },
				getSize(target) { return target.set(this._width, this._height); },
				renderLists: { dispose: noOp },
				dispose: noOp,
				getContextRedBits: noOp,
				getContextGreenBits: noOp,
				getContextBlueBits: noOp,
				getClearColor: noOp,
				getClearAlpha: noOp,
				setRenderTarget: noOp,
				setClearColor: noOp,
				clear: noOp,
				readRenderTargetPixels: noOp
			}
		};

		ThreeUtils.createWebGLImageRenderer = (imageCanvas, width, height) => {
			let canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
			canvas.style.display = 'block';
			canvas.width = width;
			canvas.height = height;
			return {
				domElement: canvas,
				render: noOp,
				setSize(width, height) { this.domElement.width = width; this.domElement.height = height },
				getSize(target) { return target.set(this.domElement.width, this.domElement.height) },
				getContext() {
					return { canvas: this.domElement }
				},
				setClearColor: noOp,
				dispose: noOp
			}
		}
	}
});
