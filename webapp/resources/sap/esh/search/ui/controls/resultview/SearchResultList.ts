/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import List, { $ListSettings } from "sap/m/List";
import SearchModel from "../../SearchModel";
import ResizeHandler from "sap/ui/core/ResizeHandler";
import { ListMode } from "sap/m/library";
import { SelectionMode } from "../../SelectionMode";
import ListItemBase from "sap/m/ListItemBase";

/**
 * @namespace sap.esh.search.ui.controls
 */
export default class SearchResultList extends List {
    private _resizeHandler: (forceResize?: boolean) => void;

    constructor(sId?: string, options?: $ListSettings) {
        super(sId, options);
        this.addStyleClass("searchResultList");
        this.attachSelectionChange((oEvent): void => {
            // console.log("SELECTION: table, selectionChange event ");
            // for list mode "SingleSelectMaster" -> select on row click
            // -> thus checkbox change will not be fired, and we need to update selection here
            const oModel = this.getModel() as SearchModel;
            const listItem = oEvent.getParameter("listItem") as ListItemBase;
            oModel.setProperty(
                `${listItem.getBindingContext().getPath()}/selected`,
                oEvent.getParameter("selected")
            );
            oModel.updateMultiSelectionSelected();
        });
        this.bindProperty("mode", {
            parts: [
                { path: "/multiSelectionEnabled" },
                { path: "/resultviewSelectionVisibility" },
                { path: "/config/resultviewSelectionMode" },
            ],
            formatter: (
                multiSelectionEnabled: boolean,
                resultviewSelectionVisibility: boolean,
                resultviewSelectionMode: SelectionMode
            ): string => {
                if (
                    resultviewSelectionMode === SelectionMode.MultipleItems &&
                    multiSelectionEnabled === true
                ) {
                    if (resultviewSelectionVisibility === true) {
                        return ListMode.None; // result list item comes with its own checkbox
                    } else {
                        return ListMode.None; // see ColumnListItem, type="Navigation"
                    }
                } else if (resultviewSelectionMode === SelectionMode.OneItem) {
                    return ListMode.SingleSelectMaster;
                } else {
                    return ListMode.None;
                }
            },
        });
    }

    onAfterRendering(...args: Array<any>): void {
        // first let the original sap.m.List do its work
        List.prototype.onAfterRendering.apply(this, args);

        const model = this.getModel() as SearchModel;
        const multiSelectionEnabled = model.getProperty("/multiSelectionEnabled");
        if (multiSelectionEnabled) {
            this.enableSelectionMode();
        }

        this._prepareResizeHandler();
    }

    private _prepareResizeHandler(): void {
        const resizeThresholds = [768, 1151];
        const windowWidthIndex = () => {
            const windowWidth = window.innerWidth;

            if (windowWidth < resizeThresholds[0]) {
                return 0;
            }

            for (let i = 0; i < resizeThresholds.length - 1; i++) {
                if (windowWidth >= resizeThresholds[i] && windowWidth < resizeThresholds[i + 1]) {
                    return i + 1;
                }
            }

            return resizeThresholds.length;
        };

        let lastWindowWidthIndex = windowWidthIndex();
        this._resizeHandler = (forceResize: boolean): void => {
            const currentWindowWidthIndex = windowWidthIndex();
            if (currentWindowWidthIndex != lastWindowWidthIndex || forceResize) {
                lastWindowWidthIndex = currentWindowWidthIndex;
                const aMyListItems = this.getItems();
                for (const listItem of aMyListItems) {
                    const listItemContent = (listItem as any).getContent() as any;
                    if (listItemContent?.length > 0) {
                        if (typeof listItemContent[0]?.resizeEventHappened === "function") {
                            listItemContent[0]?.resizeEventHappened();
                        }
                    }
                }
            }
        };

        ResizeHandler.register(this, () => {
            this._resizeHandler();
        });
    }

    public resize() {
        if (typeof this._resizeHandler !== "undefined") {
            this._resizeHandler(true /* forceResize */);
        }
    }

    public enableSelectionMode(): void {
        const domRef = this.getDomRef();
        if (domRef && domRef.classList) {
            domRef.classList.add("sapUshellSearchResultList-ShowMultiSelection");
        }
    }

    static renderer = {
        apiVersion: 2,
    };
}
