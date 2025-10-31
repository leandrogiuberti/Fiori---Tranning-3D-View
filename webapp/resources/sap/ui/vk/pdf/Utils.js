/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["../helpers/WorkerScriptLoader"],t=>{"use strict";class i{static#t;static async loadPdfjsLib(){let s=i.#t;if(s==null){const i=t.absoluteUri("sap/ui/vk/thirdparty/pdf.js").toString();const r=t.absoluteUri("sap/ui/vk/thirdparty/pdf.worker.js").toString();this.#t=s=await import(i);s.GlobalWorkerOptions.workerSrc=r}return s}static getPdfjsLib(){return i.#t}static clearCanvas(t){const{width:i,height:s}=t;const r=t.getContext("2d",{alpha:false});r.fillStyle="white";r.fillRect(0,0,i,s)}}return i});
//# sourceMappingURL=Utils.js.map