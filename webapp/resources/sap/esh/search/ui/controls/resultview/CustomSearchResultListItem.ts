/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import SearchResultListItem, { $SearchResultListItemSettings } from "./SearchResultListItem";
import CustomSearchResultListItemContent from "./CustomSearchResultListItemContent";

export interface $CustomSearchResultListItemSettings extends $SearchResultListItemSettings {
    content: CustomSearchResultListItemContent;
}

/**
 * @namespace sap.esh.search.ui.controls
 */
export default class CustomSearchResultListItem extends SearchResultListItem {
    public readonly metadata = {
        properties: {
            content: {
                type: "sap.esh.search.ui.controls.CustomSearchResultListItemContent",
            },
        },
    };

    static renderer = {
        apiVersion: 2,
    };

    constructor(sId?: string, settings?: Partial<$CustomSearchResultListItemSettings>) {
        super(sId, settings);
    }

    setupCustomContentControl() {
        const content = this.getProperty("content");
        content.setTitle(this.getProperty("title"));
        content.setTitleUrl(this.getProperty("titleUrl"));
        content.setType(this.getProperty("type"));
        content.setImageUrl(this.getProperty("imageUrl"));
        content.setAttributes(this.getProperty("attributes"));
        // content.setIntents(this.getIntents());
    }

    renderer(oRm, oControl) {
        oControl.setupCustomContentControl();
        // eslint-disable-next-line prefer-rest-params
        (super.getRenderer() as any).render(arguments);
    }

    // after rendering
    onAfterRendering(): void {
        super.onAfterRendering();

        this.getProperty("content").getTitleVisibility();
    }
}
