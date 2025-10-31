/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import i18n from "../../i18n";
import SearchModel from "../../SearchModel";
import SearchResultTableFormatter, {
    Cell,
    Row,
    Column as FormattedColumn,
} from "../../SearchResultTableFormatter";
import SearchResultTableP13NPersonalizer from "../../SearchResultTableP13NPersonalizer";
import Table, { $TableSettings } from "sap/m/Table";
import ColumnResizer from "sap/m/plugins/ColumnResizer";
import Column from "sap/m/Column";
import ColumnListItem from "sap/m/ColumnListItem";
import CustomListItem from "sap/m/CustomListItem";
import { TableColumnType } from "../../SearchResultTableColumnType";
import SearchText from "./SearchText";
import SearchLink from "../SearchLink";
import Element from "sap/ui/core/Element";
import { ListMode, ListType, PlacementType, PopinDisplay, PopinLayout } from "sap/m/library";
import HBox from "sap/m/HBox";
import Button from "sap/m/Button";
import Icon from "sap/ui/core/Icon";
import { NavigationTarget } from "../../sinaNexTS/sina/NavigationTarget";
import ActionSheet from "sap/m/ActionSheet";
import Event from "sap/ui/base/Event";
import ManagedObject from "sap/ui/base/ManagedObject";
import Context from "sap/ui/model/Context";
import merge from "sap/base/util/merge";
import Log from "sap/base/Log";
import ErrorHandler from "../../error/ErrorHandler";
import FlexItemData from "sap/m/FlexItemData";
import UIEvents from "../../UIEvents";
import EventBus from "sap/ui/core/EventBus";
import { SelectionMode } from "../../SelectionMode";
import { ListBase$SelectionChangeEvent } from "sap/m/ListBase";

/**
 * @namespace sap.esh.search.ui.controls
 */

export default class SearchResultTable extends Table {
    tablePersonalizer: SearchResultTableP13NPersonalizer;
    private useStableIds = true;
    private log = Log.getLogger("sap.esh.search.ui.controls.resultview.SearchResultTable");
    private errorHandler = ErrorHandler.getInstance();

    static renderer = {
        apiVersion: 2,
    };

    constructor(sId?: string, options?: $TableSettings) {
        super(sId, options);
    }

    public assembleTable(oModel: SearchModel): void {
        this.bindProperty("mode", {
            parts: [
                { path: "/multiSelectionEnabled" },
                { path: "/config/resultviewSelectionMode" },
                { path: "/resultviewSelectionVisibility" },
            ],
            formatter: (
                multiSelectionEnabled: boolean,
                resultviewSelectionMode: string,
                resultviewSelectionVisibility: boolean
            ): string => {
                if (
                    multiSelectionEnabled === true ||
                    resultviewSelectionMode === SelectionMode.MultipleItems
                ) {
                    if (resultviewSelectionVisibility === true) {
                        return ListMode.MultiSelect;
                    } else {
                        return ListMode.None; // see ColumnListItem, type="Navigation"
                    }
                } else if (resultviewSelectionMode === SelectionMode.OneItem) {
                    if (resultviewSelectionVisibility === true) {
                        return ListMode.SingleSelectMaster;
                    } else {
                        return ListMode.None;
                    }
                } else {
                    return ListMode.None;
                }
            },
        });
        this.setProperty("rememberSelections", false);
        /* this.bindProperty("includeItemInSelection", {
            parts: [{ path: "/config/resultviewSelectionMode" }],
            formatter: (resultviewSelectionMode: SelectionMode): boolean =>
                resultviewSelectionMode === SelectionMode.SingleSelect ||
                    resultviewSelectionMode === SelectionMode.SingleSelectMaster,
        }); */
        this.attachSelectionChange((oEvent: ListBase$SelectionChangeEvent): void => {
            // console.log("SELECTION: table, selectionChange event ");
            // for list mode "SingleSelectMaster" -> select on row click
            // -> thus checkbox change will not be fired, and we need to update selection here
            const listItem = oEvent.getParameter("listItem") as ColumnListItem;
            listItem.setProperty(
                "selected",
                oEvent.getParameter("selected"),
                true // no re-rendering needed, change originates in HTML
            );
            oModel.updateMultiSelectionSelected();
        });
        this.bindProperty("visible", {
            parts: [{ path: "/resultViewType" }, { path: "/count" }],
            formatter: this.formatVisible.bind(this),
        });
        this.setProperty("sticky", ["ColumnHeaders"]);
        this.setNoDataText(i18n.getText("noCloumnsSelected"));

        this.update();

        // this.setFixedLayout(false);
        if (oModel.config?.FF_resizeResultTableColumns === true) {
            this.setupColumnResizable();
            // this.setupColumnsAbsoluteWidth(); -> need table width in run time, call in onAfterRendering
            this.addStyleClass("sapElisa-search-result-table-resizable");
        } else {
            // this.setAutoPopinMode(true); // not working
            // this.setupPopin(); -> need set setMinScreenWidth in run time, call in onAfterRendering
            this.addStyleClass("sapElisa-search-result-table-might-popin");
        }

        this.addStyleClass("sapElisa-search-result-table");
    }

    private formatVisible(resultViewType: string, count: number): boolean {
        const visible = resultViewType === "searchResultTable" && count !== 0;
        if (visible && (this.getModel() as SearchModel)?.config?.searchResultTablePersonalization !== false) {
            if (!this.tablePersonalizer) {
                this.tablePersonalizer = new SearchResultTableP13NPersonalizer(
                    this.getModel() as SearchModel
                );
            }
            this.tablePersonalizer.initialize(this);
        }
        return visible;
    }

    public update() {
        //TODO: remove it and test
        if (!this.getBinding("columns")) {
            this.bindTableColumns();
        }
        //TODO: remove it and test
        if (!this.getBinding("items")) {
            this.bindTableItems();
        }

        if (this.getModel()) {
            (this.getModel() as SearchModel).updateBindings(true);
        }
    }

    private bindTableColumns(): void {
        this.bindAggregation("columns", {
            path: "/tableColumns",
            factory: (sId: string /*, oContext: any*/) => {
                const column = new Column(this.getStableId(sId, "column"), {
                    header: new SearchText(this.getStableId(sId, "headerLabel"), {
                        text: "{name}",
                        wrapping: false,
                    }),
                    visible: "{visible}",
                    width: "{width}",
                });
                column.getHeader().addStyleClass("sapUshellSearchResultListItem-MightOverflow");
                return column;
            },
        });
    }

    private bindTableItems(): void {
        this.bindAggregation("items", {
            path: "/tableRows",
            factory: (id: string, bData: Context) => {
                return this.assembleTableItems(id, bData);
            },
        });
    }

    assembleTableItems(id: string, bData): ColumnListItem | CustomListItem {
        // footer item
        if (bData.getObject().type === "footer") {
            return new CustomListItem(this.getStableId(id, "item-footer"), {
                visible: false,
            });
        }
        // body item
        this.sortCellsInRows(bData.getPath()); // sort cells of current row ONLY
        return this.assembleTableMainItem(id, bData);
    }

    assembleTableMainItem(id: string, bData): ColumnListItem {
        const oModel = this.getModel() as SearchModel;
        const columnListItem = new ColumnListItem(this.getStableId(id, "item"), {
            selected: { path: "selected" },
        }).addStyleClass("sapUshellSearchTable");
        columnListItem.bindProperty("type", {
            parts: [
                { path: "/config/resultviewMasterDetailMode" },
                { path: "/config/resultviewSelectionMode" },
            ],
            formatter: (resultviewMasterDetailMode: string, resultviewSelectionMode: SelectionMode) => {
                let newType;
                const pressFunction = (oEvent): void => {
                    // notify subscribers
                    oModel.notifySubscribers(UIEvents.ESHShowResultDetail);
                    EventBus.getInstance().publish(UIEvents.ESHShowResultDetail, oEvent);
                };
                if (resultviewMasterDetailMode) {
                    newType = ListType.Navigation;
                    columnListItem.attachPress(pressFunction.bind(this));
                } else if (resultviewSelectionMode === SelectionMode.OneItem) {
                    newType = ListType.Active;
                    columnListItem.detachPress(pressFunction);
                } else {
                    newType = ListType.Inactive;
                    columnListItem.detachPress(pressFunction);
                }
                return newType;
            },
        });

        if (bData.getObject().customItemStyleClass) {
            columnListItem.addStyleClass(bData.getObject().customItemStyleClass);
        }
        columnListItem.bindAggregation("cells", {
            path: "cells",
            factory: (subPath: string, bData) => {
                const searchResultTableCell = bData.getObject() as Cell;
                if (searchResultTableCell.type === TableColumnType.TITLE) {
                    // build title cell
                    let titleUrl = "";
                    let hasTargetFunction = false;
                    let enabled = true;
                    const titleNavigation: NavigationTarget = searchResultTableCell.titleNavigation;
                    if (titleNavigation instanceof NavigationTarget) {
                        hasTargetFunction = typeof titleNavigation.targetFunction === "function";
                        titleUrl = titleNavigation.targetUrl;
                    }
                    if (
                        (typeof titleUrl !== "string" || titleUrl.length === 0) &&
                        hasTargetFunction === false
                    ) {
                        enabled = false;
                    }
                    let titleLink;
                    const titleIconUrl = searchResultTableCell.titleIconUrl;
                    if (titleNavigation) {
                        titleLink = new SearchLink(this.getStableId(subPath, "link"), {
                            navigationTarget: titleNavigation,
                            text: { path: "value" },
                            wrapping: false,
                        });
                        titleLink.setIcon(searchResultTableCell.titleIconUrl);
                    } else {
                        titleLink = new SearchText(this.getStableId(subPath, "link"), {
                            text: { path: "value" },
                            wrapping: false,
                        });
                        if (titleIconUrl && !((titleLink.getAggregation("icon") as Icon) instanceof Icon)) {
                            const oIcon = new Icon(this.getStableId(subPath, "icon"), {
                                src: ManagedObject.escapeSettingsValue(titleIconUrl),
                            });
                            titleLink.setIcon(oIcon);
                        }
                    }
                    titleLink.addStyleClass("sapUshellSearchResultListItem-MightOverflow");
                    titleLink.addStyleClass("sapUshellSearchTableTitleLink");
                    if (searchResultTableCell.isHighlighted) {
                        titleLink.addStyleClass("sapUshellSearchResultItem-AttributeValueHighlighted");
                    }
                    let returnObject: SearchLink | SearchText | HBox = titleLink;
                    const titleInfoIconUrl = searchResultTableCell.titleInfoIconUrl;
                    const dynamicTooltip =
                        searchResultTableCell.titleInfoIconTooltip &&
                        searchResultTableCell.titleInfoIconTooltip.length
                            ? searchResultTableCell.titleInfoIconTooltip
                            : i18n.getText("collectionShared"); // fallback to shared tooltip
                    if (titleInfoIconUrl) {
                        const titleInfoIcon = new Icon(this.getStableId(subPath, "infoIcon"), {
                            src: ManagedObject.escapeSettingsValue(titleInfoIconUrl),
                            tooltip: dynamicTooltip,
                        }).addStyleClass("sapUshellSearchTableTitleInfoIcon");
                        if (!enabled) {
                            titleInfoIcon.addStyleClass("sapUshellSearchTableTitleInfoIconDisabled");
                        }

                        // titleInfoIcon is aligned to the right of the HBox
                        titleLink.setLayoutData(new FlexItemData({ growFactor: 1, minWidth: "0px" }));
                        titleInfoIcon.setLayoutData(new FlexItemData({ growFactor: 0, minWidth: "0px" }));
                        returnObject = new HBox(this.getStableId(subPath, "titleContainer"), {
                            items: [
                                titleLink,
                                new HBox({
                                    items: [titleInfoIcon],
                                    layoutData: new FlexItemData({ growFactor: 1 }), // Spacer to push titleInfoIcon to the right
                                    justifyContent: "End", // Align titleInfoIcon to the right within the spacer
                                }),
                            ],
                            fitContainer: true,
                            width: "100%",
                            justifyContent: "Start", // Align titleLink to the start of the HBox
                        });

                        // titleInfoIcon follows titleLink directly
                        // titleLink.setLayoutData(new FlexItemData({ growFactor: 0, minWidth: "0px" }));
                        // titleInfoIcon.setLayoutData(new FlexItemData({ growFactor: 1, minWidth: "0px" }));

                        // returnObject = new HBox(this.getStableId(subPath, "titleContainer"), {
                        //     items: [titleLink, titleInfoIcon],
                        //     fitContainer: true,
                        //     width: "100%",
                        //     justifyContent: "Start",
                        // });
                    }
                    return returnObject;
                }

                // build related objects:
                // 1. button to open action sheet: relAppsButton
                // 2. action sheet: relAppsActionSheet
                // 3. navigation buttons in action sheet: navigationButton
                if (searchResultTableCell.type === TableColumnType.RELATED_APPS) {
                    const relatedAppsButton = new Button(this.getStableId(subPath, "relAppsButton"), {
                        icon: "sap-icon://action",
                        tooltip: i18n.getText("intents"),
                        press: () => {
                            // destroy old action sheet
                            const oldActionSheet = Element.getElementById(
                                this.getStableId(relatedAppsButton.getId(), "relAppsActionSheet")
                            ) as ActionSheet;
                            if (oldActionSheet) {
                                oldActionSheet.destroy();
                                return;
                            }

                            // related app navigation buttons
                            const navigationObjects: Array<NavigationTarget> =
                                searchResultTableCell.navigationObjects;
                            const navigationButtons = [];
                            let navigationButton;
                            const pressButton = (event: Event, navigationObject: NavigationTarget) => {
                                if (navigationObject instanceof NavigationTarget) {
                                    navigationObject.performNavigation({ event: event });
                                }
                            };
                            for (let i = 0; i < navigationObjects.length; i++) {
                                const navigationObject: NavigationTarget = navigationObjects[i];
                                this.destroyControl(this.getStableId(subPath, `navButton${i}`)); // find a better solution
                                navigationButton = new Button(this.getStableId(subPath, `navButton${i}`), {
                                    text: ManagedObject.escapeSettingsValue(navigationObject?.text),
                                    tooltip: ManagedObject.escapeSettingsValue(navigationObject?.text),
                                });
                                navigationButton.attachPress(navigationObject, pressButton);
                                navigationButtons.push(navigationButton);
                            }

                            // related app pop over
                            const actionSheet = new ActionSheet(
                                this.getStableId(relatedAppsButton.getId(), "relAppsActionSheet"),
                                {
                                    buttons: navigationButtons,
                                    placement: PlacementType.Auto,
                                }
                            );
                            actionSheet.attachAfterClose(() => {
                                actionSheet.destroy();
                            });
                            actionSheet.openBy(relatedAppsButton);
                        },
                    });
                    relatedAppsButton.addStyleClass("sapElisaSearchTableRelatedAppsButton"); // for test purposes
                    return relatedAppsButton;
                }

                // build cell with default navigation
                const navigationTarget = searchResultTableCell.defaultNavigationTarget;
                if (navigationTarget instanceof NavigationTarget) {
                    const attributeLink = new SearchLink(this.getStableId(subPath, "attrLink"), {
                        navigationTarget: null,
                        wrapping: false,
                        tooltip: ManagedObject.escapeSettingsValue(searchResultTableCell.tooltip || ""), // preserve SearchResultFormatter defined tooltip (hierarchical attribute of DSP)
                    });
                    // lazy loading because of potential {} in the href will be interpreted as binding path by UI5
                    attributeLink.setNavigationTarget(navigationTarget);
                    attributeLink.setText(searchResultTableCell.value);
                    attributeLink.addStyleClass("sapUshellSearchResultListItem-MightOverflow");
                    attributeLink.setIcon(searchResultTableCell.icon);
                    return attributeLink;
                }

                if (searchResultTableCell.type === TableColumnType.EXTEND) {
                    // 'extendTableColumn' deprecated as of version 1.141
                    try {
                        return oModel.config.extendTableColumn.bindingFunction(searchResultTableCell); // ToDo
                    } catch (e) {
                        this.errorHandler.onError(e);
                    }
                }

                // build other cells:
                // TableColumnType.TITLE_DESCRIPTION
                // TableColumnType.DETAIL
                const cell = new SearchText(this.getStableId(subPath, "searchText"), {
                    text: { path: "value" },
                    wrapping: false,
                }).addStyleClass("sapUshellSearchResultListItem-MightOverflow");

                if (searchResultTableCell.icon) {
                    const cellIcon = new Icon(this.getStableId(subPath, "cellIcon"), {
                        src: ManagedObject.escapeSettingsValue(searchResultTableCell.icon),
                    });
                    cell.setIcon(cellIcon);
                }

                if (searchResultTableCell.isHighlighted) {
                    cell.addStyleClass("sapUshellSearchResultItem-AttributeValueHighlighted");
                }
                return cell;
            },
        });

        return columnListItem;
    }

    private sortCellsInRows(rowPath?: string): void {
        const oModel = this.getModel() as SearchModel;
        let rows;
        if (rowPath) {
            const row = [oModel.getProperty(rowPath)][0] as Row;
            row.cells = this.getSortedCells(row.cells);
            oModel.setProperty(rowPath, row);
        } else {
            rows = oModel.getProperty("/tableRows");
            for (const row of rows) {
                row.cells = this.getSortedCells(row.cells);
            }
            oModel.setProperty("/tableRows", rows);
        }
    }

    private getSortedCells(cells: Array<Cell>): Array<Cell> {
        const sortedCells = [] as Array<Cell>;
        const columns = (this.getModel() as SearchModel).getTableColumns(false);
        for (const column of columns) {
            for (const cell of cells) {
                if (column.p13NColumnName === cell.p13NColumnName) {
                    sortedCells.push(cell);
                    break;
                }
            }
        }
        return sortedCells;
    }

    private setupColumnResizable(): void {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this;
        // that.setFixedLayout(false);
        const columnResizer = new ColumnResizer();
        columnResizer.attachColumnResize(() => {
            /*  Bug: 
                    step 1. table has 2 columns, 2nd column has 100% width.
                    step 2. resize 2nd column from right side (search UI right side boundary), set column width to 20 pixcel.
                    step 3. reload UI, 2nd column has old 100% width, 20 pixcel width expected.
                    Reason: ColumnResize event is triggered before new width set to column. New width is not saved. 
                    workaround: delay saving width.
                */
            setTimeout(function () {
                (that.getModel() as SearchModel).saveTableColumns(
                    (that.getModel() as SearchModel).getTableColumns(false)
                );
            }, 500);
        });
        that.addDependent(columnResizer);
    }

    private setupPopin(): void {
        const oModel = this.getModel() as SearchModel;
        // check !oModel.config?.FF_resizeResultTableColumns before calling this function
        if (!oModel) {
            return;
        }

        this.setPopinLayout(PopinLayout.Block);

        let visibleCloumns = 0;
        // const uiColumnsOrdered = this.getColumns().sort(this._byOrder); // sort columns by perso order, necessary for setMinScreenWidth()
        this.getColumns().forEach(function (column) {
            column.setDemandPopin(true);
            column.setPopinDisplay(PopinDisplay.Inline);
            if (column.getVisible()) {
                visibleCloumns++;
                column.setMinScreenWidth(12 * visibleCloumns + "rem");
            }
        });

        // if (visibleCloumns <= 3) {
        //     this.setFixedLayout(false);
        // } else {
        //     this.setFixedLayout(true);
        // }
    }

    // private _byOrder(columnA, columnB): number {
    //     if (columnA.getOrder() < columnB.getOrder()) {
    //         return -1;
    //     }
    //     if (columnA.getOrder() > columnB.getOrder()) {
    //         return 1;
    //     }
    //     return 0;
    // }

    private setupColumnsAbsoluteWidth(): void {
        const oModel = this.getModel() as SearchModel;
        // check oModel.config?.FF_resizeResultTableColumns before calling this function
        if (!oModel) {
            return;
        }

        const domRef = this.getDomRef() as HTMLElement;
        const table = domRef ? (domRef.querySelector("table") as HTMLElement) : null;
        const tableWidth = table ? table.offsetWidth : undefined;
        if (typeof tableWidth !== "number") {
            return;
        }

        let selectBoxWidth = 0;
        if (table) {
            const selCol = table.querySelector("th.sapMListTblSelCol");
            if (selCol) {
                selectBoxWidth = (selCol as HTMLElement).offsetWidth;
            }
        }

        const columns = merge([], oModel.getTableColumns(false)) as Array<FormattedColumn>;
        const searchResultTableFormatter = new SearchResultTableFormatter(oModel);
        let absoluteColumnWidthSum = 0;
        let visibleColumnsWithRelativeWidth = 0;

        // Step 1: sum up absolute width, and count relative and visible columns
        columns.forEach((column) => {
            const widthInPixel = searchResultTableFormatter.getColumnWidthInPixel(column.width);
            if (widthInPixel) {
                // column of absolute width (end with px)
                absoluteColumnWidthSum += widthInPixel;
            } else {
                // column of relative width (end with %, or undefined, ...)
                column.width = searchResultTableFormatter.defaultColumnWidth; // overwrite (stored) different formatted width to default width, i.e. undefined
                if (column.visible) {
                    visibleColumnsWithRelativeWidth++;
                }
            }
        });

        // Step 2: average rest absulte width to relative columns (visible or invisible, 100% or 30% etc.)
        if (visibleColumnsWithRelativeWidth === 0) {
            return;
        }
        const borderWidth = 2; // avoid x-scroll bar in table after reset columns
        const singleWidth =
            Math.trunc(
                (tableWidth - selectBoxWidth - absoluteColumnWidthSum) / visibleColumnsWithRelativeWidth -
                    borderWidth
            ) + "px";
        columns.forEach((column) => {
            const widthInPixel = searchResultTableFormatter.getColumnWidthInPixel(column.width);
            if (!widthInPixel) {
                // column of relative width (end with %, or undefined)
                // column visible and invisible
                column.width = singleWidth;
            }
        });

        // Step 3: set width in search model
        oModel.setTableColumns(columns, true);
    }

    private getStableId(parentId: string, postfixId: string, separator = "-"): string {
        if (this.useStableIds) {
            return `${parentId}${separator}${postfixId}`;
        } else {
            return "";
        }
    }

    private destroyControl(id: string) {
        const control = Element.getElementById(id);
        if (control) {
            control.destroy();
        }
    }

    onBeforeRendering(): void {
        // set popin for columns
        // const oModel = this.getModel() as SearchModel;
        // if (oModel.config?.FF_resizeResultTableColumns !== true) {
        //     this.setupPopin();
        // }
    }

    onAfterRendering(): void {
        const oModel = this.getModel() as SearchModel;
        // colspan for no data cell
        const domRef = this.getDomRef() as HTMLElement;
        const noDataCell = domRef?.querySelector("table > tbody > tr > td.sapMListTblCellNoData:first-child");
        if (noDataCell) {
            noDataCell.setAttribute("colspan", "3");
        }

        // aria-labelledby for table title row
        const tableTitleRow = domRef?.querySelector("table > thead > tr:first-child");
        if (tableTitleRow) {
            tableTitleRow.setAttribute(
                "aria-labelledby",
                oModel
                    ?.getSearchCompositeControlInstanceByChildControl(this)
                    ?.countBreadcrumbsHiddenElement.getId()
            );
        }

        // absolute width for columns
        if (oModel.config?.FF_resizeResultTableColumns === true) {
            this.setupColumnsAbsoluteWidth();
        }

        // popin for columns
        if (oModel.config?.FF_resizeResultTableColumns !== true) {
            this.setupPopin();
        }
    }
}
