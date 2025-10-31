/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import Image, { $ImageSettings } from "sap/m/Image";
import { PropertyBindingInfo } from "sap/ui/base/ManagedObject";

export interface $SearchObjectSuggestionImageOptions extends $ImageSettings {
    isCircular?: boolean | PropertyBindingInfo;
}

/**
 * @namespace sap.esh.search.ui.controls
 */
export default class SearchObjectSuggestionImage extends Image {
    static readonly metadata = {
        properties: {
            isCircular: {
                type: "boolean",
                multiple: false,
            },
        },
    };

    constructor(sId?: string, options?: Partial<$SearchObjectSuggestionImageOptions>) {
        super(sId, options);

        this.attachLoad(() => this.wrapImage);
        this.attachError(() => this.wrapImage(true));

        this.addStyleClass("sapUshellSearchObjectSuggestionImage-Initial");
    }

    wrapImage(isError: boolean): void {
        const imageNode = this.getDomRef();
        if (!imageNode) return;

        const parent = imageNode.parentNode as HTMLElement;
        if (
            parent?.classList.contains("sapUshellSearchObjectSuggestionImage-Wrapper-Portrait") ||
            parent?.classList.contains("sapUshellSearchObjectSuggestionImage-Wrapper-Landscape")
        ) {
            this.adaptContainer(isError);
            // adapt necessary because UI5 tries to load image with correct content density (see @2 in url)
            // if desired content density is not available the fallback "normal" image is loaded
            // -> wrap image triggered twice
        } else {
            this.createContainer(isError);
        }
    }

    createContainer(isError: boolean): void {
        const imageNode = this.getDomRef() as HTMLElement;
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
    }

    adaptContainer(isError: boolean): void {
        const imageNode = this.getDomRef() as HTMLElement;
        if (!imageNode) return;

        const containerNode = imageNode.parentNode as HTMLElement;
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

    static renderer = {
        apiVersion: 2,
    };
}
