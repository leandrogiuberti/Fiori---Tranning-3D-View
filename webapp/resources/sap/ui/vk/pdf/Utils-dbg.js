/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
	"../helpers/WorkerScriptLoader"
], (
	WorkerScriptLoader
) => {
	"use strict";

	class Utils {
		static #pdfjsLib;

		static async loadPdfjsLib() {
			let pdfjsLib = Utils.#pdfjsLib;

			if (pdfjsLib == null) {
				const pdfjsLibUrl = WorkerScriptLoader.absoluteUri("sap/ui/vk/thirdparty/pdf.js").toString();
				const pdfjsLibWorkerUrl = WorkerScriptLoader.absoluteUri("sap/ui/vk/thirdparty/pdf.worker.js").toString();

				this.#pdfjsLib = pdfjsLib = await import(pdfjsLibUrl);

				pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsLibWorkerUrl;
			}

			return pdfjsLib;
		}

		static getPdfjsLib() {
			return Utils.#pdfjsLib;
		}

		static clearCanvas(canvas) {
			const { width, height } = canvas;
			const context = canvas.getContext("2d", { alpha: false });
			context.fillStyle = "white";
			context.fillRect(0, 0, width, height);
		}
	}

	return Utils;
});
