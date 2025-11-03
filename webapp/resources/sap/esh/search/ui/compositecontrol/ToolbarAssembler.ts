/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import SearchModel from "../SearchModel";
import IconPool from "sap/ui/core/IconPool";
import i18n from "../i18n";
import Device from "sap/ui/Device";
import OverflowToolbarLayoutData from "sap/m/OverflowToolbarLayoutData";
import { ButtonType, OverflowToolbarPriority, PlacementType, URLHelper } from "sap/m/library";
import SearchCompositeControl from "../SearchCompositeControl";
import OverflowToolbar from "sap/m/OverflowToolbar";
import OverflowToolbarButton from "sap/m/OverflowToolbarButton";
import SearchSpreadsheet from "../controls/SearchSpreadsheet";
import { ResultViewSwitchEvent, TableConfigOpenEvent, UserEventType } from "../eventlogging/UserEvents";
import Control from "sap/ui/core/Control";
import ToolbarSpacer from "sap/m/ToolbarSpacer";
import ToolbarSeparator from "sap/m/ToolbarSeparator";
import errors from "../error/errors";
import Button from "sap/m/Button";
import ActionSheet from "sap/m/ActionSheet";
import IconTabBar from "sap/m/IconTabBar";
import { DataSource } from "../sinaNexTS/sina/DataSource";
import IconTabFilter from "sap/m/IconTabFilter";
import SegmentedButton, { SegmentedButton$SelectionChangeEvent } from "sap/m/SegmentedButton";
import SegmentedButtonItem from "sap/m/SegmentedButtonItem";
import BindingMode from "sap/ui/model/BindingMode";
import ViewSettingsDialog, { ViewSettingsDialog$ConfirmEvent } from "sap/m/ViewSettingsDialog";
import Element from "sap/ui/core/Element";
import { SortAttribute } from "../SearchResultBaseFormatter";
import OverflowToolbarToggleButton from "sap/m/OverflowToolbarToggleButton";
import { ToggleButton$PressEvent } from "sap/m/ToggleButton";

export default class ToolbarAssembler {
    compositeControl: SearchCompositeControl;

    constructor(compositeControl: SearchCompositeControl) {
        this.compositeControl = compositeControl;
    }

    assembleFilterButton(): OverflowToolbarToggleButton {
        const oModel = this.compositeControl.getModelInternal() as SearchModel;
        const filterBtn = new OverflowToolbarToggleButton(
            this.compositeControl.getId() + "-searchBarFilterButton",
            {
                icon: IconPool.getIconURI("filter"),
                tooltip: {
                    parts: [{ path: "/facetVisibility" }],
                    formatter: (facetVisibility: boolean): string => {
                        return facetVisibility
                            ? i18n.getText("hideFacetBtn_tooltip")
                            : i18n.getText("showFacetBtn_tooltip");
                    },
                },
                pressed: { path: "/facetVisibility" },
                press: (oEvent: ToggleButton$PressEvent): void => {
                    // open/close facet panel
                    this.compositeControl.searchContainer.setProperty("animateFacetTransition", true);
                    const isVisible: boolean = oEvent.getParameter("pressed");
                    oModel.setFacetVisibility(isVisible);
                    oModel.eventLogger.logEvent(
                        isVisible
                            ? {
                                  type: UserEventType.FACETS_SHOW,
                                  dataSourceKey: oModel.getDataSource().id,
                              }
                            : {
                                  type: UserEventType.FACETS_HIDE,
                                  dataSourceKey: oModel.getDataSource().id,
                              }
                    );
                    this.compositeControl.searchContainer.setProperty("animateFacetTransition", false);
                    setTimeout(() => this.compositeControl.adjustSearchbarCustomGenericButtonWidth(), 100); // see this._resizeHandler();
                },
                visible: {
                    path: "/businessObjSearchEnabled",
                    formatter: (businessObjSearchEnabled: boolean): boolean => {
                        // do not show button on phones
                        // do not show in value-help mode
                        // only show if business object search is active
                        return (
                            !Device.system.phone &&
                            !oModel.config.optimizeForValueHelp &&
                            oModel.config.facets &&
                            businessObjSearchEnabled
                        );
                    },
                },
            }
        );
        filterBtn.addStyleClass("searchBarFilterButton");
        filterBtn.setLayoutData(
            new OverflowToolbarLayoutData({ priority: OverflowToolbarPriority.NeverOverflow })
        );
        return filterBtn;
    }

    assembleResultviewSelectionButton(): OverflowToolbarToggleButton {
        const oModel = this.compositeControl.getModelInternal() as SearchModel;
        const selectionBtn = new OverflowToolbarToggleButton(
            this.compositeControl.getId() + "-searchBarResultviewSelectionButton",
            {
                icon: IconPool.getIconURI("multi-select"),
                tooltip: {
                    parts: [{ path: "/resultviewSelectionVisibility" }],
                    formatter: (resultviewSelectionVisibility: boolean): string => {
                        return resultviewSelectionVisibility
                            ? i18n.getText("hideSelectionBtn_tooltip")
                            : i18n.getText("showSelectionBtn_tooltip");
                    },
                },
                pressed: { path: "/resultviewSelectionVisibility" },
                press: (oEvent: ToggleButton$PressEvent): void => {
                    // enable/disable selection of result view items (checkboxes)
                    const isVisible: boolean = oEvent.getParameter("pressed");
                    oModel.setResultviewSelectionVisibility(isVisible);
                    if (isVisible === false) {
                        // reset selection when hiding checkboxes
                        for (const item of this.compositeControl.getSearchResultSet().items) {
                            item.setSelected(false);
                        }
                    }
                },
                visible: {
                    path: "/businessObjSearchEnabled",
                    formatter: (businessObjSearchEnabled: boolean): boolean => {
                        // do not show button on phones
                        // do not show in value-help mode
                        // only show if business object search is active
                        return (
                            !Device.system.phone &&
                            !oModel.config.optimizeForValueHelp &&
                            oModel.config.showSelectionToggleButton &&
                            oModel.config.facets &&
                            businessObjSearchEnabled
                        );
                    },
                },
            }
        );
        selectionBtn.addStyleClass("searchBarResultviewSelectionButton");
        selectionBtn.setLayoutData(
            new OverflowToolbarLayoutData({ priority: OverflowToolbarPriority.NeverOverflow })
        );
        return selectionBtn;
    }

    assembleGenericButtonsToolbar(): { toolbar: OverflowToolbar; hasCustomButtons: boolean } {
        const oModel = this.compositeControl.getModelInternal() as SearchModel;

        // table data export button
        const dataExportButton = this.assembleExportButton();
        dataExportButton.setLayoutData(
            new OverflowToolbarLayoutData({ priority: OverflowToolbarPriority.High }) // 'high': Custom buttons can choose 'Low' or 'NeverOverflow' to make their button more/less important than ours
        );

        // display-switch tab strips
        this.assembleResultViewSwitch();

        // sort button
        const sortButton = new OverflowToolbarButton(
            (this.compositeControl.getId() ? this.compositeControl.getId() + "-" : "") + "tableSortButton",
            {
                icon: "sap-icon://sort",
                text: "{i18n>sortTable}",
                tooltip: "{i18n>sortTable}",
                visible: {
                    parts: [{ path: "/count" }, { path: "/sortableAttributes" }],
                    formatter: (count, sortAttributes) => {
                        const oModel = this.compositeControl.getModelInternal() as SearchModel;
                        if (oModel && oModel.isHomogenousResult() && count > 0 && sortAttributes.length > 0) {
                            return true;
                        } else {
                            return false;
                        }
                    },
                },
                type: {
                    parts: [{ path: "/orderBy" }],
                    formatter: (orderBy) => {
                        if (orderBy && orderBy.sortOrder) {
                            return ButtonType.Emphasized;
                        } else {
                            return ButtonType.Transparent;
                        }
                    },
                },
                press: () => {
                    this.compositeControl.openSortDialog();
                },
            }
        );
        sortButton.addStyleClass("sapUshellSearchTableSortButton");
        sortButton.setLayoutData(
            new OverflowToolbarLayoutData({ priority: OverflowToolbarPriority.High }) // 'high': Custom buttons can choose 'Low' or 'NeverOverflow' to make their button more/less important than ours
        );

        // sort dialog
        this.compositeControl.sortDialog = this.assembleSearchResultSortDialog();

        // table personalize button
        let tablePersonalizeButton = undefined;
        if (oModel?.config?.searchResultTablePersonalization !== false) {
            tablePersonalizeButton = new OverflowToolbarButton(
                (this.compositeControl.getId() ? this.compositeControl.getId() + "-" : "") +
                    "tablePersonalizeButton",
                {
                    icon: "sap-icon://action-settings",
                    text: "{i18n>personalizeTable}",
                    tooltip: "{i18n>personalizeTable}",
                    type: ButtonType.Transparent,
                    enabled: {
                        parts: [{ path: "/resultViewType" }],
                        formatter: (resultViewType): boolean => resultViewType === "searchResultTable",
                    },
                    visible: {
                        parts: [{ path: "/count" }, { path: "/tableColumns" }],
                        formatter: (count, columns) => {
                            const oModel = this.compositeControl.getModelInternal() as SearchModel;
                            if (oModel && oModel.isHomogenousResult() && count > 0 && columns.length > 0) {
                                return true;
                            } else {
                                return false;
                            }
                        },
                    },
                    press: () => {
                        this.compositeControl.searchResultTable?.tablePersonalizer?.openDialog();
                        const oModel = this.compositeControl.getModelInternal() as SearchModel;
                        const userEventTableConfigOpen: TableConfigOpenEvent = {
                            type: UserEventType.TABLE_CONFIG_OPEN,
                            dataSourceKey: oModel.getDataSource().id,
                        };
                        oModel.eventLogger.logEvent(userEventTableConfigOpen);
                    },
                }
            );
            tablePersonalizeButton.addStyleClass("sapUshellSearchTablePersonalizeButton");
            tablePersonalizeButton.setLayoutData(
                new OverflowToolbarLayoutData({ priority: OverflowToolbarPriority.High }) // 'high': Custom buttons can choose 'Low' or 'NeverOverflow' to make their button more/less important than ours
            );
        }

        let toolbarContent: Array<Control> = [];
        // standard buttons (export, sort, table personalization)
        toolbarContent.push(dataExportButton);
        toolbarContent.push(sortButton);
        if (oModel?.config?.searchResultTablePersonalization !== false && tablePersonalizeButton) {
            toolbarContent.push(tablePersonalizeButton);
        }
        // share button
        const bWithShareButton = oModel?.config?.isUshell;
        if (bWithShareButton) {
            const shareButton = this.assembleShareButton();
            shareButton.setLayoutData(
                new OverflowToolbarLayoutData({ priority: OverflowToolbarPriority.High }) // 'high': Custom buttons can choose 'Low' or 'NeverOverflow' to make their button more/less important than ours
            );
            toolbarContent.push(shareButton);
        }
        toolbarContent.push(this.compositeControl.resultViewSwitch);

        let hasCustomButtons = false;
        try {
            let customToolbar: Array<Control> = [new ToolbarSpacer()];
            const customToolbarContent = oModel?.config?.getCustomToolbar() as Array<Control>;
            if (customToolbarContent?.length > 0) {
                hasCustomButtons = true;
                customToolbarContent.push(
                    new ToolbarSeparator("", {
                        visible: {
                            parts: [{ path: "/resultViewSwitchVisibility" }, { path: "/count" }],
                            formatter: (resultViewSwitchVisibility, count) => {
                                return resultViewSwitchVisibility && count !== 0;
                            },
                        },
                    })
                );
            }
            if (oModel?.config?.searchInputLocation === "Searchbar") {
                customToolbar = customToolbar.concat(this.compositeControl.oSearchFieldGroup);
            }
            customToolbar = customToolbar.concat(customToolbarContent);
            toolbarContent = customToolbar.concat(toolbarContent);
        } catch (err) {
            const oError = new errors.ConfigurationExitError(
                "getCustomToolbar",
                oModel.config.applicationComponent,
                err
            );
            this.compositeControl.errorHandler.onError(oError);
            // do not throw oError, just do not any custom buttons to 'toolbar'
        }
        // put toobar buttons in a separate overflow toolbar to control its width independently of datasource tab strip
        const toolbar = new OverflowToolbar(
            this.compositeControl.getId() + "-searchBar--genericButtonsToolbar",
            {
                content: toolbarContent,
            }
        );
        toolbar.addStyleClass("sapElisaSearchGenericButtonsToolbar");
        return { toolbar: toolbar, hasCustomButtons: hasCustomButtons };
    }

    assembleSearchResultSortDialog(): ViewSettingsDialog {
        const sortDialogId = this.compositeControl.getId() + "-sortDialog";

        // destroy old sort dialog
        const oldSortDialog = Element.getElementById(sortDialogId);
        if (oldSortDialog) {
            oldSortDialog.destroy();
        }

        const sortDialog = new ViewSettingsDialog(sortDialogId, {
            sortDescending: {
                parts: [{ path: "/orderBy" }],
                formatter: (orderBy): boolean => {
                    return Object.keys(orderBy).length === 0 || orderBy.sortOrder === "DESC";
                },
            },
            confirm: (oEvent: ViewSettingsDialog$ConfirmEvent) => {
                const paramsSortItem = oEvent.getParameter("sortItem");
                const paramsSortDescending = oEvent.getParameter("sortDescending");
                const oModel = this.compositeControl.getModelInternal() as SearchModel;
                const attributeId = (paramsSortItem.getBindingContext().getObject() as SortAttribute)
                    .attributeId;
                if (typeof paramsSortItem === "undefined" || attributeId === "DEFAULT_SORT_ATTRIBUTE") {
                    sortDialog.setSortDescending(true);
                    oModel.resetOrderBy(true);
                } else {
                    oModel.setOrderBy(
                        {
                            orderBy: attributeId,
                            sortOrder: paramsSortDescending === true ? "DESC" : "ASC",
                        },
                        true
                    );
                }
                // sortDialog.unbindAggregation("sortItems", true);
            },
            cancel: () => {
                // sortDialog.unbindAggregation("sortItems", true);
            },
            resetFilters: () => {
                // issue: default sort item can't be set, multiple reset selection in UI5
                // workaround: set sort item after time delay
                setTimeout(() => {
                    sortDialog.setSortDescending(true);
                    sortDialog.setSelectedSortItem("searchSortAttributeKeyDefault");
                }, 500);
            },
        });

        sortDialog.addStyleClass("sapUshellSearchResultSortDialog"); // obsolete
        sortDialog.addStyleClass("sapElisaSearchResultSortDialog");
        this.compositeControl.addDependent(sortDialog);
        return sortDialog;
    }

    assembleExportButton(): OverflowToolbarButton {
        return new OverflowToolbarButton(
            (this.compositeControl.getId() ? this.compositeControl.getId() + "-" : "") +
                "ushell-search-result-dataExportButton",
            {
                icon: "sap-icon://download",
                text: "{i18n>exportData}",
                tooltip: "{i18n>exportData}",
                type: ButtonType.Transparent,
                visible: {
                    parts: [{ path: "/count" }, { path: "/tableColumns" }],
                    formatter: (count, columns) => {
                        const oModel = this.compositeControl.getModelInternal() as SearchModel;
                        if (oModel && oModel.isHomogenousResult() && count > 0 && columns.length > 0) {
                            return true;
                        } else {
                            return false;
                        }
                    },
                },
                press: () => {
                    if (this.compositeControl.searchSpreadsheet === undefined) {
                        this.compositeControl.searchSpreadsheet = new SearchSpreadsheet(
                            "ushell-search-spreadsheet"
                        );
                    }
                    const oModel = this.compositeControl.getModelInternal() as SearchModel;
                    this.compositeControl.searchSpreadsheet.onExport(oModel);
                },
            }
        ).addStyleClass("sapUshellSearchTableDataExportButton");
    }

    assembleShareButton(): OverflowToolbarButton {
        // create action sheet
        const oActionSheet = new ActionSheet(
            (this.compositeControl.getId() ? this.compositeControl.getId() + "-" : "") + "shareActionSheet",
            {
                placement: PlacementType.Bottom,
                buttons: [],
            }
        );
        oActionSheet.addStyleClass("sapUshellSearchResultShareActionSheet");
        this.compositeControl.addDependent(oActionSheet); // -> destroys action sheet if SearchCompositeControl gets destroyed

        // fill action sheet async with buttons
        const oModel = this.compositeControl.getModelInternal() as SearchModel;
        sap.ui.require(["sap/ushell/ui/footerbar/AddBookmarkButton"], (AddBookmarkButton) => {
            // 1) bookmark button (entry in action sheet)
            const oBookmarkButton = new AddBookmarkButton(
                (this.compositeControl.getId() ? this.compositeControl.getId() + "-" : "") + "bookmarkButton",
                {
                    width: "auto",
                    beforePressHandler: () => {
                        const oAppData = {
                            url: document.URL,
                            title: oModel.getDocumentTitle(),
                            icon: IconPool.getIconURI("search"),
                        };
                        oBookmarkButton.setAppData(oAppData);
                    },
                }
            );
            oActionSheet.addButton(oBookmarkButton);
            // 2) email button
            const oEmailButton = new Button(
                (this.compositeControl.getId() ? this.compositeControl.getId() + "-" : "") + "emailButton",
                {
                    icon: "sap-icon://email",
                    text: i18n.getText("eMailFld"),
                    width: "auto",
                    press: () => {
                        URLHelper.triggerEmail(null, oModel.getDocumentTitle(), document.URL);
                    },
                }
            );
            oActionSheet.addButton(oEmailButton);
        });

        // share button which opens the action sheet
        const oShareButton = new OverflowToolbarButton(
            (this.compositeControl.getId() ? this.compositeControl.getId() + "-" : "") + "shareButton",
            {
                icon: "sap-icon://action",
                text: i18n.getText("shareBtn"),
                tooltip: i18n.getText("shareBtn"),
                type: ButtonType.Transparent,
                press: () => {
                    oActionSheet.openBy(oShareButton);
                },
            }
        );
        return oShareButton;
    }

    assembleDataSourceTabBar(): IconTabBar {
        const dataSourceTabBar = new IconTabBar(`${this.compositeControl.getId()}-dataSourceTabBar`, {
            // tabDensityMode: "Compact", // not working, we have IconTabBar in left container of another bar -> see search.less
            // headerMode: "Inline",   // do not use, confuses css when used on sap.m.Bar
            expandable: false,
            stretchContentHeight: false,
            // selectedKey: "{/tabStrips/strips/selected/id}", // id of selected data source -> does not work, special logic see below, addEventDelegate -> onBeforeRendering
            // backgroundDesign: BackgroundDesign.Transparent  // not relevant, content container is not in use
            // content: -> not needed, we only need the 'switcher' for data source change (triggers new search to update search container)
            visible: {
                parts: [
                    { path: "/facetVisibility" },
                    { path: "/count" },
                    { path: "/businessObjSearchEnabled" },
                ],
                formatter: (facetVisibility, count, bussinesObjSearchEnabled) => {
                    const oModel = this.compositeControl.getModelInternal() as SearchModel;
                    if (oModel.config.exclusiveDataSource) {
                        return false;
                    }
                    return !facetVisibility && count > 0 && bussinesObjSearchEnabled;
                },
            },
            selectedKey: {
                path: "/tabStrips/selected/id",
                mode: BindingMode.OneWay,
            },
            select: (oEvent) => {
                const oModel = this.compositeControl.getModelInternal() as SearchModel;
                if (oModel.config.searchScopeWithoutAll) {
                    return;
                }
                if (oModel.getDataSource() !== oEvent.getParameter("item").getBindingContext().getObject()) {
                    // selection has changed
                    oModel.setDataSource(
                        oEvent.getParameter("item").getBindingContext().getObject() as DataSource
                    );
                }
            },
        });
        // define group for F6 handling
        dataSourceTabBar.data("sap-ui-fastnavgroup", "false", true /* write into DOM */);

        dataSourceTabBar.addStyleClass("searchDataSourceTabStripBar");
        dataSourceTabBar.addStyleClass("sapUiSmallMarginBegin");

        dataSourceTabBar.setAriaTexts({
            headerLabel: i18n.getText("dataSources"),
            headerDescription: i18n.getText("dataSources"),
        });

        dataSourceTabBar.bindAggregation("items", {
            path: "/tabStrips/strips",
            template: new IconTabFilter("", {
                key: "{id}", // data source id, only needed for indicator (bottom). We use bindingContext().getObject to switch search container content
                text: "{labelPlural}",
                visible: {
                    path: "",
                    formatter: (dataSource) => {
                        const oModel = this.compositeControl.getModelInternal() as SearchModel;
                        if (oModel.config.searchScopeWithoutAll && dataSource === oModel.allDataSource) {
                            return false;
                        }
                    },
                },
            }),
        });
        return dataSourceTabBar;
    }

    assembleResultViewSwitch(): void {
        if (this.compositeControl.resultViewSwitch !== undefined) {
            return;
        }
        this.compositeControl.resultViewSwitch = new SegmentedButton(
            this.compositeControl.getId() + "-ResultViewType",
            {
                selectedKey: "{/resultViewType}",
                visible: {
                    parts: [{ path: "/resultViewSwitchVisibility" }, { path: "/count" }],
                    formatter: (resultViewSwitchVisibility: boolean, count: number) => {
                        return resultViewSwitchVisibility && count !== 0;
                    },
                },
                selectionChange: (oEvent: SegmentedButton$SelectionChangeEvent) => {
                    const resultViewType = oEvent.getParameter("item").getKey();
                    this.compositeControl.setResultViewType(resultViewType);
                    this.compositeControl.assignDragDropConfig();
                    const oModel = this.compositeControl.getModelInternal() as SearchModel;
                    const userEventResultViewSwitch: ResultViewSwitchEvent = {
                        type: UserEventType.RESULT_VIEW_SWITCH,
                        resultViewType: resultViewType,
                    };
                    oModel.eventLogger.logEvent(userEventResultViewSwitch);
                },
            }
        );

        this.compositeControl.resultViewSwitch.bindAggregation("items", {
            path: "/resultViewTypes",
            factory: (id, context) => {
                const oButton = new SegmentedButtonItem("", { visible: true });
                switch (
                    context.getObject() as unknown as
                        | "searchResultList"
                        | "searchResultTable"
                        | "searchResultGrid"
                ) {
                    case "searchResultList":
                        oButton.setIcon("sap-icon://list");
                        oButton.setTooltip(i18n.getText("displayList"));
                        oButton.setKey("searchResultList");
                        break;
                    case "searchResultTable":
                        oButton.setIcon("sap-icon://table-view");
                        oButton.setTooltip(i18n.getText("displayTable"));
                        oButton.setKey("searchResultTable");
                        break;
                    case "searchResultGrid":
                        oButton.setIcon("sap-icon://grid");
                        oButton.setTooltip(i18n.getText("displayGrid"));
                        oButton.setKey("searchResultGrid");
                        break;
                    default:
                        oButton.setVisible(false);
                }
                return oButton;
            },
        });
        this.compositeControl.resultViewSwitch.addStyleClass("sapUshellSearchResultViewSwitch");
        this.compositeControl.resultViewSwitch.setLayoutData(
            new OverflowToolbarLayoutData({ priority: OverflowToolbarPriority.High }) // 'high': Custom buttons can choose 'Low' or 'NeverOverflow' to make their button more/less important than ours
        );
    }
}
