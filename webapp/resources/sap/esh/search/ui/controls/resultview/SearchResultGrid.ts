/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import * as SearchHelper from "sap/esh/search/ui/SearchHelper";
import GridContainer, { $GridContainerSettings } from "sap/f/GridContainer";
import ImageContent from "sap/m/ImageContent";
import GenericTile from "sap/m/GenericTile";
import TileContent from "sap/m/TileContent";
import CheckBox from "sap/m/CheckBox";
import HBox from "sap/m/HBox";
import VBox from "sap/m/VBox";
import { ResultSetItem, ResultSetItemAttribute } from "../../ResultSetApi";
import { NavigationTarget } from "../../sinaNexTS/sina/NavigationTarget";
import Toolbar from "sap/m/Toolbar";
import SearchText from "./SearchText";
import SearchLink from "../SearchLink";
import ManagedObject from "sap/ui/base/ManagedObject";
import { SelectionMode } from "../../SelectionMode";
import { AttributeFormatType } from "../../sinaNexTS/sina/AttributeFormatType";

/**
 * @namespace sap.esh.search.ui.controls
 */
export default class SearchResultGrid extends GridContainer {
    private ignoreNextTilePress;

    constructor(sId?: string, options?: $GridContainerSettings) {
        super(sId, options);

        this.bindAggregation("items", {
            path: "publicSearchModel>/results/items",
            factory: (id, context): GenericTile => {
                const item = context.getObject() as ResultSetItem;
                let checkboxContent;
                let headerToolbar: Toolbar;
                let imageContent: ImageContent;
                let tileContainer;
                let oTitle;
                let titleDescription;
                const contentItems = [];
                if (item.data.attributes) {
                    headerToolbar = new Toolbar({ design: "Transparent", content: [] }).addStyleClass(
                        "sapUiTinyMarginBottom"
                    );
                    contentItems.push(headerToolbar);
                    const imageUrls: Array<ResultSetItemAttribute> = item.data.attributes.filter((attr) => {
                        return attr?.metadata?.type === "ImageUrl"; // ToDo -> attribute 'HASHIERARCHYNODECHILD' has no property 'metadata'
                    });
                    checkboxContent = new CheckBox(`${id}--tileCheckBox`, {
                        selected: { path: "publicSearchModel>selected" },
                        select: () => {
                            // console.log("SELECTION: tile checkbox, select event");
                            this.ignoreNextTilePress = true; // prevent navigation when selecting checkbox
                            this.getItems().forEach((item) => {
                                this._syncSelectionCssClass(item);
                            });
                        },
                        enabled: {
                            parts: [{ path: "publicSearchModel>selectionEnabled" }],
                        },
                        visible: {
                            parts: [
                                { path: "publicSearchModel>/resultviewSelectionVisibility" },
                                { path: "publicSearchModel>/config/resultviewSelectionMode" },
                            ],
                            formatter: (resultviewSelectionVisibility, resultviewSelectionMode) => {
                                return (
                                    resultviewSelectionVisibility &&
                                    resultviewSelectionMode !== SelectionMode.OneItem
                                );
                            },
                        },
                    });
                    headerToolbar.addContent(checkboxContent);
                    if (imageUrls.length > 0 && typeof imageUrls[0].value === "string") {
                        imageContent = new ImageContent(`${id}-Image`, {
                            src: ManagedObject.escapeSettingsValue(imageUrls[0].value as string),
                        }).addStyleClass("sapUiMediumMarginBegin");
                        const imageFormat = imageUrls[0].metadata.format;
                        if (imageFormat === AttributeFormatType.Round) {
                            imageContent.addStyleClass("sapUshellResultListGrid-ImageContainerRound");
                        }
                    }
                    // title link
                    let titleText;
                    if (item.data?.defaultNavigationTarget) {
                        if (item.data.titleAttributes.length > 0) {
                            oTitle = new SearchLink(`${id}-Title`, {
                                text: ManagedObject.escapeSettingsValue(item.title),
                                navigationTarget: item.data.defaultNavigationTarget,
                            });
                            contentItems.push(oTitle);
                        } else {
                            oTitle = new SearchText("", {
                                text: ManagedObject.escapeSettingsValue(
                                    item.data.defaultNavigationTarget.text ||
                                        "No Title (def. nav. target w/o text)"
                                ),
                            });
                            contentItems.push(oTitle);
                        }
                    } else if (item.data.titleAttributes.length > 0) {
                        oTitle = new SearchText("", {
                            text: ManagedObject.escapeSettingsValue(item.title),
                        });
                        contentItems.push(oTitle);
                    } else if (item.data.detailAttributes.length > 0) {
                        titleText = item.data.detailAttributes[0].valueFormatted;
                        oTitle = new SearchText("", {
                            text: ManagedObject.escapeSettingsValue(titleText),
                        });
                        contentItems.push(oTitle);
                    }
                    if (imageContent) {
                        contentItems.push(imageContent);
                    }
                    tileContainer = new VBox({
                        items: [headerToolbar, new VBox({ items: contentItems })],
                    });
                } else {
                    // robustness for app search tiles (grid not rendered but updated based on search results!!!)
                    if (item.data["title"]) {
                        oTitle = item.data["title"];
                        titleDescription = item.data["subtitle"];
                    }
                    contentItems.push(new VBox({ items: [oTitle, titleDescription] }));
                    tileContainer = new HBox({ items: contentItems });
                }
                const oTile: GenericTile = new GenericTile(`${id}-resultItemTile`, {
                    tileContent: new TileContent(`${id}-resultItemTileContent`, {
                        content: tileContainer,
                    }),
                    press: (oEvent) => {
                        if (this.ignoreNextTilePress) {
                            this.ignoreNextTilePress = false;
                            return;
                        }
                        const publicModel = this.getModel("publicSearchModel");
                        const data = publicModel.getProperty(
                            oEvent.getSource().getBindingContext("publicSearchModel").getPath()
                        ).data;
                        if (
                            publicModel.getProperty("/config/resultviewSelectionMode") ===
                            SelectionMode.OneItem
                        ) {
                            const publicModelItem = oEvent
                                .getSource()
                                .getTileContent()[0]
                                .getBindingContext("publicSearchModel")
                                .getObject() as ResultSetItem;
                            publicModelItem.setSelected(!publicModelItem.selected);
                        } else {
                            const defaultNavigationTarget = data.defaultNavigationTarget;
                            if (typeof defaultNavigationTarget?.performNavigation === "function") {
                                defaultNavigationTarget.performNavigation({ event: oEvent });
                            }
                            const titleNavigation: NavigationTarget = data.titleNavigation;
                            if (typeof titleNavigation?.performNavigation === "function") {
                                titleNavigation.performNavigation({ event: oEvent });
                            }
                        }
                        this.getItems().forEach((item) => {
                            this._syncSelectionCssClass(item);
                        });
                    },
                }).addStyleClass("sapElisaGridTile");
                return oTile;
            },
        });
        this.addStyleClass("sapUshellResultListGrid");
    }

    onAfterRendering(oEvent): void {
        super.onAfterRendering(oEvent);
        // unescape bold tags
        SearchHelper.boldTagUnescaper(this.getDomRef() as HTMLElement);
        // apply custom style class to all result items based on property 'customItemStyleClass'
        SearchHelper.resultItemCustomStyleClassSetter(this);
        // sync background selection style
        this.getItems().forEach((item) => {
            this._syncSelectionCssClass(item);
        });
    }

    // sync the CSS class for selection state
    private _syncSelectionCssClass(item): void {
        const selected = item.getBindingContext("publicSearchModel").getProperty("selected");
        if (selected) {
            item.addStyleClass("sapUshellSearchResultGridTile-Selected");
        } else {
            item.removeStyleClass("sapUshellSearchResultGridTile-Selected");
        }
    }

    static renderer = {
        apiVersion: 2,
    };
}
