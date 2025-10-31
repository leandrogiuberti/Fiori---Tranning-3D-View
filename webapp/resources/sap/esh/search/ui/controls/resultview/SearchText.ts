/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import Text from "sap/m/Text";
import Icon from "sap/ui/core/Icon";
import * as SearchHelper from "sap/esh/search/ui/SearchHelper";
import { $TextSettings } from "sap/m/Text";
import Control from "sap/ui/core/Control";
import { MetadataOptions } from "sap/ui/base/ManagedObject";
import RenderManager from "sap/ui/core/RenderManager";
import TooltipBase from "sap/ui/core/TooltipBase";

export interface SearchTextSettings extends $TextSettings {
    icon?: Icon;
}

/**
 * @namespace sap.esh.search.ui.controls
 */
export default class SearchText extends Text {
    static readonly metadata: MetadataOptions = {
        properties: {
            maxLines: {
                type: "int",
            },
            text: {
                type: "string",
                defaultValue: "",
            },
            wrapping: {
                type: "boolean",
                defaultValue: true,
            },
        },
        aggregations: {
            _text: {
                type: "sap.m.Text",
                multiple: false,
            },
            icon: {
                type: "sap.ui.core.Icon",
                multiple: false,
            },
        },
    };

    constructor(sId?: string, settings?: SearchTextSettings) {
        super(sId, settings);
    }

    init(): void {
        this.setAggregation(
            "_text",
            new Text(this.getId() + "-Text", {
                text: this.getProperty("text"),
                maxLines: this.getProperty("maxLines"),
                wrapping: this.getProperty("wrapping"),
            }).addStyleClass("sapUshellSearchTextText")
        );
    }

    /**
     * Assigns the given css class to the inner text control, because that's the way
     * it worked before the control was refactored to be a composite control. Now
     * an additional span element is added around the text control, see renderer method.
     * @param sStyleClass name of the css class to be added
     * @returns SearchText
     */
    addStyleClass(sStyleClass: string): this {
        (this.getAggregation("_text") as Text).addStyleClass(sStyleClass);
        return this;
    }

    setText(sText: string): this {
        this.setProperty("text", sText);
        (this.getAggregation("_text") as Text).setText(sText);
        return this;
    }

    setMaxLines(iMaxLines: int): this {
        this.setProperty("maxLines", iMaxLines);
        (this.getAggregation("_text") as Text).setMaxLines(iMaxLines);
        return this;
    }

    setWrapping(bWrapping: boolean): this {
        this.setProperty("wrapping", bWrapping);
        (this.getAggregation("_text") as Text).setWrapping(bWrapping);
        return this;
    }

    setIcon(icon: Icon): SearchText {
        if (icon instanceof Icon) {
            icon.addStyleClass("sapUshellSearchTextIcon");
            this.setAggregation("icon", icon);
        }
        return this;
    }

    setTooltip(sTooltip?: string | TooltipBase): this {
        (this.getAggregation("_text") as Text).setTooltip(sTooltip);
        return this;
    }

    onAfterRendering(oEvent): void {
        super.onAfterRendering(oEvent);

        if (this.isDestroyed()) {
            return;
        }

        // move icon to the front of the text
        const iconDomRef = (this.getAggregation("icon") as Icon)?.getDomRef();
        const textDomRef = (this.getAggregation("_text") as Text)?.getDomRef() as HTMLElement;
        if (iconDomRef) {
            textDomRef.insertBefore(iconDomRef, textDomRef.firstChild);
        }

        // recover bold tag with the help of text() in a safe way
        SearchHelper.boldTagUnescaper(textDomRef);

        SearchHelper.calculateTooltipForwordEllipsis(textDomRef);
    }

    static renderer = {
        apiVersion: 2,
        render: (rm: RenderManager, control: SearchText) => {
            rm.openStart("span", control.getId());
            rm.class("sapUshellSearchText");
            if (!control.getWrapping()) {
                rm.class("sapUshellSearchText-nowrap");
            }
            const tooltip = control.getTooltip_AsString();
            if (tooltip) {
                rm.attr("title", tooltip);
            }
            rm.openEnd();
            const icon = control.getAggregation("icon") as Icon;
            if (icon) {
                rm.renderControl(icon as Icon);
            }
            rm.renderControl(<Control>control.getAggregation("_text"));
            rm.close("span");
        },
    };
}
