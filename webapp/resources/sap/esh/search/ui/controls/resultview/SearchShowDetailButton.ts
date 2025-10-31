/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import Button, { Button$PressEvent } from "sap/m/Button";
import { $ButtonSettings } from "sap/m/Button";
import { MetadataOptions } from "sap/ui/base/ManagedObject";
import SearchModel from "../../SearchModel";
import UIEvents from "../../UIEvents";
import EventBus from "sap/ui/core/EventBus";

export interface SearchShowDetailButtonSettings extends $ButtonSettings {
    arrowType?: string;
}

/**
 * @namespace sap.esh.search.ui.controls
 */
export default class SearchShowDetailButton extends Button {
    static readonly metadata: MetadataOptions = {
        properties: {
            visualisation: {
                type: "string",
                defaultValue: "arrow", // "Button", "Arrow", "Hyperlink"
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

    constructor(sId?: string, settings?: SearchShowDetailButtonSettings) {
        super(sId, settings);
    }

    setVisualisation(sVisualisation: string): this {
        this.setProperty("visualisation", sVisualisation);
        return this;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    press(oEvent: Button$PressEvent): void {
        const model = this.getModel() as SearchModel;
        // notify subscribers
        model.notifySubscribers(UIEvents.ESHShowResultDetail);
        EventBus.getInstance().publish(UIEvents.ESHShowResultDetail, this);
    }
}
