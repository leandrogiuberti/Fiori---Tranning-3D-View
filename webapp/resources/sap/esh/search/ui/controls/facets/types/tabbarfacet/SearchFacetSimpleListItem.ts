/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import * as SearchHelper from "sap/esh/search/ui/SearchHelper";
import CustomData from "sap/ui/core/CustomData";
import { ListType } from "sap/m/library";
import StandardListItem, { $StandardListItemSettings } from "sap/m/StandardListItem";
import FacetItem from "../../../../FacetItem";

interface $SearchFacetSimpleListItemSettings extends $StandardListItemSettings {
    isDataSource: boolean;
}
/**
 * @namespace sap.esh.search.ui.controls
 */
export default class SearchFacetSimpleListItem extends StandardListItem {
    static readonly metadata = {
        properties: {
            isDataSource: {
                type: "boolean",
                defaultValue: false,
            },
        },
    };
    constructor(sId?: string, settings?: $SearchFacetSimpleListItemSettings) {
        super(sId, settings);

        this.setType(ListType.Active);
        this.bindProperty("title", { path: "label" });
        this.bindProperty("tooltip", {
            parts: [{ path: "label" }, { path: "valueLabel" }],
            formatter: (label, valueLabel) => (valueLabel ? `${label}: ${valueLabel}` : ""),
        });
        if (!settings.isDataSource) {
            this.bindProperty("icon", { path: "icon" });
        }

        this.bindProperty("info", {
            parts: [{ path: "value" }, { path: "valueLabel" }],
            formatter: function (value, valueLabel) {
                if (typeof value === "number") {
                    return SearchHelper.formatInteger(value);
                } else if (typeof value === "string") {
                    return value;
                } else if (typeof valueLabel !== "undefined" && valueLabel !== "") {
                    return valueLabel;
                } else {
                    return "";
                }
            },
        });
        this.bindProperty("selected", { path: "selected" });
        this.insertCustomData(
            new CustomData({
                key: "test-id-facet-dimension-value",
                value: {
                    parts: [{ path: "facetTitle" }, { path: "label" }],
                    formatter: (facetTitle, label) => `${facetTitle}-${label}`,
                },
                writeToDom: true,
            }),
            0
        );
        this.addStyleClass("sapUshellSearchFacetGenericItem");
        this.addStyleClass("sapUshellSearchFacetItem"); // deprecated
        this.addEventDelegate({
            onAfterRendering: (): void => {
                const bindingContext = this?.getBindingContext();
                const bindingObject = bindingContext?.getObject();
                if (!bindingObject) return;

                const level = (bindingObject as FacetItem).level;
                const isRTL = document.documentElement.getAttribute("dir") === "rtl";
                const domRef = this.getDomRef();
                if (!domRef) return;

                const contentElement = domRef.querySelector(".sapMLIBContent") as HTMLElement;
                if (!contentElement) return;

                const paddingValue = level + "rem";
                if (isRTL) {
                    contentElement.style.paddingRight = paddingValue;
                } else {
                    contentElement.style.paddingLeft = paddingValue;
                }
            },
        });
    }

    static renderer = {
        apiVersion: 2,
    };
}
