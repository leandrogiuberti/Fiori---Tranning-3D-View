/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["sap/m/Image"], function (Image) {
  "use strict";

  /**
   * @namespace sap.esh.search.ui.controls
   */
  const SearchObjectSuggestionImage = Image.extend("sap.esh.search.ui.controls.SearchObjectSuggestionImage", {
    renderer: {
      apiVersion: 2
    },
    metadata: {
      properties: {
        isCircular: {
          type: "boolean",
          multiple: false
        }
      }
    },
    constructor: function _constructor(sId, options) {
      Image.prototype.constructor.call(this, sId, options);
      this.attachLoad(() => this.wrapImage);
      this.attachError(() => this.wrapImage(true));
      this.addStyleClass("sapUshellSearchObjectSuggestionImage-Initial");
    },
    wrapImage: function _wrapImage(isError) {
      const imageNode = this.getDomRef();
      if (!imageNode) return;
      const parent = imageNode.parentNode;
      if (parent?.classList.contains("sapUshellSearchObjectSuggestionImage-Wrapper-Portrait") || parent?.classList.contains("sapUshellSearchObjectSuggestionImage-Wrapper-Landscape")) {
        this.adaptContainer(isError);
        // adapt necessary because UI5 tries to load image with correct content density (see @2 in url)
        // if desired content density is not available the fallback "normal" image is loaded
        // -> wrap image triggered twice
      } else {
        this.createContainer(isError);
      }
    },
    createContainer: function _createContainer(isError) {
      const imageNode = this.getDomRef();
      if (!imageNode) return;

      // assemble image wrapper container node
      const containerNode = document.createElement("div");
      containerNode.classList.add("sapUshellSearchObjectSuggestionImage-Wrapper");
      if (imageNode.offsetHeight > imageNode.offsetWidth) {
        containerNode.classList.add("sapUshellSearchObjectSuggestionImage-Wrapper-Portrait");
      } else {
        containerNode.classList.add("sapUshellSearchObjectSuggestionImage-Wrapper-Landscape");
      }

      // make circular
      if (this.getProperty("isCircular")) {
        containerNode.style.borderRadius = "50%";
      }

      // put image into container
      const parent = imageNode.parentNode;
      if (parent) {
        parent.insertBefore(containerNode, imageNode);
        parent.removeChild(imageNode);
        containerNode.appendChild(imageNode);
        imageNode.classList.remove("sapUshellSearchObjectSuggestionImage-Initial");
      }

      // add error marker
      if (isError) {
        containerNode.classList.add("sapUshellSearchObjectSuggestionImage-Wrapper-Error");
      }
    },
    adaptContainer: function _adaptContainer(isError) {
      const imageNode = this.getDomRef();
      if (!imageNode) return;
      const containerNode = imageNode.parentNode;
      if (!containerNode) return;
      if (imageNode.offsetHeight > imageNode.offsetWidth) {
        containerNode.classList.add("sapUshellSearchObjectSuggestionImage-Wrapper-Portrait");
        containerNode.classList.remove("sapUshellSearchObjectSuggestionImage-Wrapper-Landscape");
      } else {
        containerNode.classList.add("sapUshellSearchObjectSuggestionImage-Wrapper-Landscape");
        containerNode.classList.remove("sapUshellSearchObjectSuggestionImage-Wrapper-Portrait");
      }
      if (isError) {
        containerNode.classList.add("sapUshellSearchObjectSuggestionImage-Wrapper-Error");
      } else {
        containerNode.classList.remove("sapUshellSearchObjectSuggestionImage-Wrapper-Error");
      }
    }
  });
  return SearchObjectSuggestionImage;
});
//# sourceMappingURL=SearchObjectSuggestionImage-dbg.js.map
