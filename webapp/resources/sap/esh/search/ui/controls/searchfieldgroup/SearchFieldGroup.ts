/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import InvisibleText from "sap/ui/core/InvisibleText";
import Button from "sap/m/Button";
import { ButtonType, PlacementType } from "sap/m/library";
import Menu from "sap/m/Menu";
import MenuItem from "sap/m/MenuItem";
import FlexBox from "sap/m/FlexBox";
import FlexItemData from "sap/m/FlexItemData";
import { FlexAlignItems } from "sap/m/library";
import SearchInput from "./SearchInput";
import SearchButton from "./SearchButton";
import Control, { $ControlSettings } from "sap/ui/core/Control";
import RenderManager from "sap/ui/core/RenderManager";
import SearchModel from "sap/esh/search/ui/SearchModel";
import SearchSelect from "./SearchSelect";
import SearchSelectQuickSelectDataSource from "./SearchSelectQuickSelectDataSource";
import i18n from "../../i18n";
import Event from "sap/ui/base/Event";
import { DataSource } from "../../sinaNexTS/sina/DataSource";
import Popover from "sap/m/Popover";
import FormattedText from "sap/m/FormattedText";
import { PropertyBindingInfo } from "sap/ui/base/ManagedObject";
import Model from "sap/ui/model/Model";

export interface $SearchFieldGroupControlSettings extends $ControlSettings {
    nlqExplainButtonActive?: boolean | PropertyBindingInfo | `{${string}}`;
}

/**
 * @namespace sap.esh.search.ui.controls
 */

export default class SearchFieldGroup extends Control {
    static readonly metadata = {
        properties: {
            selectActive: {
                defaultValue: true,
                type: "boolean",
            },
            selectQsDsActive: {
                defaultValue: false,
                type: "boolean",
            },
            inputActive: {
                defaultValue: true,
                type: "boolean",
            },
            buttonActive: {
                defaultValue: true,
                type: "boolean",
            },
            nlqExplainButtonActive: {
                defaultValue: false,
                type: "boolean",
            },
            cancelButtonActive: {
                defaultValue: true,
                type: "boolean",
            },
            actionsMenuButtonActive: {
                defaultValue: false,
                type: "boolean",
            },
        },
        aggregations: {
            _topFlexBox: {
                type: "sap.m.FlexBox",
                multiple: false,
                visibility: "hidden",
            },
            _flexBox: {
                type: "sap.m.FlexBox",
                multiple: false,
                visibility: "hidden",
            },
            _buttonAriaText: {
                type: "sap.ui.core.InvisibleText",
                multiple: false,
                visibility: "hidden",
            },
        },
    };

    public select: SearchSelect;
    public selectQsDs: SearchSelectQuickSelectDataSource; // quick-select data sources
    public input: SearchInput;
    public button: Button;
    public cancelButton: Button;
    public nlqExplainButton: Button;
    public actionsMenu: Menu;
    public actionsMenuButton: Button;

    private nlqExplainPopover: Popover;

    constructor(sId?: string, options?: $SearchFieldGroupControlSettings) {
        options = options || {};
        options.nlqExplainButtonActive = "{/isNlqActive}";
        super(sId, options);
        this.initSelect();
        this.initSelectQsDs();
        this.initInput();
        this.initButton();
        this.initNlqExplainButton();
        this.initCancelButton();
        this.initActionsMenuButton();
        this.initFlexBox();
    }

    setCancelButtonActive(active: boolean): void {
        if (active === this.getProperty("cancelButtonActive")) {
            return;
        }
        this.setProperty("cancelButtonActive", active);
        this.initFlexBox();
    }

    setNlqExplainButtonActive(active: boolean): void {
        if (active === this.getProperty("nlqExplainButtonActive")) {
            return;
        }
        this.setProperty("nlqExplainButtonActive", active);
        this.initFlexBox();
    }

    setActionsMenuButtonActive(active: boolean): void {
        if (active === this.getProperty("actionsMenuButtonActive")) {
            return;
        }
        this.setProperty("actionsMenuButtonActive", active);
        this.initFlexBox();
    }

    setSelectActive(active: boolean): void {
        if (active === this.getProperty("selectActive")) {
            return;
        }
        this.setProperty("selectActive", active);
        this.initFlexBox();
    }

    setSelectQsDsActive(active: boolean): void {
        if (active === this.getProperty("selectQsDsActive")) {
            return;
        }
        this.setProperty("selectQsDsActive", active);
        this.initFlexBox();
    }

    initFlexBox(): void {
        if (!this.select) {
            return;
        }
        if (!this.selectQsDs) {
            return;
        }

        const topItems = [];
        const items = [];

        if (this.getProperty("selectActive")) {
            this.select.setLayoutData(
                new FlexItemData("", {
                    growFactor: 0,
                })
            );
            items.push(this.select);
        }
        if (this.getProperty("selectQsDsActive")) {
            this.selectQsDs.setLayoutData(
                new FlexItemData("", {
                    growFactor: 1,
                })
            );
            topItems.push(this.selectQsDs);
        }
        if (this.getProperty("inputActive")) {
            this.input.setLayoutData(
                new FlexItemData("", {
                    growFactor: 1,
                })
            );
            items.push(this.input);
        }
        if (this.getProperty("buttonActive")) {
            this.button.setLayoutData(
                new FlexItemData("", {
                    growFactor: 0,
                })
            );
            items.push(this.button);
        }
        if (
            this.getProperty("nlqExplainButtonActive") &&
            !(this.getModel() as SearchModel).config.aiNlqExplainBar
        ) {
            this.button.setLayoutData(
                new FlexItemData("", {
                    growFactor: 0,
                })
            );
            items.push(this.nlqExplainButton);
        }
        if (this.getProperty("cancelButtonActive")) {
            this.cancelButton.setLayoutData(
                new FlexItemData("", {
                    growFactor: 0,
                })
            );
            items.push(this.cancelButton);
        }
        if (this.getProperty("actionsMenuButtonActive")) {
            this.actionsMenuButton.setLayoutData(
                new FlexItemData("", {
                    growFactor: 0,
                })
            );
            items.push(this.actionsMenuButton);
        }
        if (this.getProperty("selectQsDsActive")) {
            let topFlexBox = this.getAggregation("_topFlexBox") as FlexBox;
            if (!topFlexBox) {
                topFlexBox = new FlexBox("", {
                    items: topItems,
                });
                this.setAggregation("_topFlexBox", topFlexBox);
            } else {
                topFlexBox.removeAllAggregation("items");
                for (const topItem of topItems) {
                    topFlexBox.addItem(topItem);
                }
            }
        }

        let flexBox = this.getAggregation("_flexBox") as FlexBox;
        if (!flexBox) {
            flexBox = new FlexBox("", {
                alignItems: FlexAlignItems.Start,
                items: items,
            });
            this.setAggregation("_flexBox", flexBox);
        } else {
            flexBox.removeAllAggregation("items");
            for (const item of items) {
                flexBox.addItem(item);
            }
        }
    }

    initSelect(): void {
        this.select = new SearchSelect(this.getId() + "-select", {});
        this.select.attachChange(function () {
            if (this.getAggregation("input")) {
                const input = this.getAggregation("input");
                input.destroySuggestionRows();
            }
        });
    }

    initSelectQsDs(): void {
        this.selectQsDs = new SearchSelectQuickSelectDataSource(this.getId() + "-selectQsDs", {});
        this.selectQsDs.attachChange(function () {
            if (this.getAggregation("input")) {
                const input = this.getAggregation("input");
                input.destroySuggestionRows();
            }
        });
    }

    initInput(): void {
        this.input = new SearchInput(this.getId() + "-input");
    }

    initButton(): void {
        this.button = new SearchButton(this.getId() + "-button", {
            tooltip: {
                parts: [
                    {
                        path: "/searchButtonStatus",
                    },
                ],
                formatter: (searchButtonStatus) => {
                    return i18n.getText("searchButtonStatus_" + searchButtonStatus);
                },
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            press: (event: Event) => {
                // searchterm is empty and datasource==all
                // do not trigger search instead close search field
                const model = this.button.getModel() as SearchModel;
                if (model.config.isUshell) {
                    if (
                        this.input.getValue() === "" &&
                        model.getDataSource() === model.getDefaultDataSource()
                    ) {
                        return;
                    }
                }
                // trigger search
                model.invalidateQuery();
                this.input.destroySuggestionRows();
                this.input.triggerSearch();
            },
        });

        const oInvisibleText = new InvisibleText(this.getId() + "-buttonAriaText", {
            text: {
                parts: [
                    {
                        path: "/searchButtonStatus",
                    },
                ],
                formatter: (searchButtonStatus) => {
                    return i18n.getText("searchButtonStatus_" + searchButtonStatus);
                },
            },
        });

        this.setAggregation("_buttonAriaText", oInvisibleText);
        this.button.addAriaLabelledBy(this.getAggregation("_buttonAriaText") as InvisibleText);
    }

    initNlqExplainButton() {
        this.nlqExplainPopover = this.assembleNlqPopover();
        this.nlqExplainButton = new Button(this.getId() + "-nlqExplainButton", {
            icon: "sap-icon://ai",
            tooltip: "{i18n>nlqExplainButtonTooltip}",
            press: () => {
                this.nlqExplainPopover.setModel(this.getModel());
                this.nlqExplainPopover.setModel(this.getModel("i18n"), "i18n");
                this.nlqExplainPopover.openBy(this.input);
            },
            enabled: {
                parts: [
                    {
                        path: "/nlqResult/success",
                    },
                    {
                        path: "/isBusy",
                    },
                ],
                formatter: (success, isBusy) => {
                    return !!success && !isBusy;
                },
            },
        });
        this.nlqExplainButton.addStyleClass("sapUshellSearchNlqExplainButton");
    }

    assembleNlqPopover(): Popover {
        const filterDescription = new FormattedText({
            htmlText: {
                parts: [{ path: "/nlqResult/filterDescription" }],
                formatter: (filterDescription: string) => {
                    if (!filterDescription) {
                        return i18n.getText("nlqNoFilter");
                    }
                    return filterDescription;
                },
            },
        });
        filterDescription.addStyleClass("sapUiSmallMargin");
        const popover = new Popover({
            title: "{i18n>nlqPopoverTitle}",
            content: [filterDescription],
            placement: PlacementType.Bottom,
        });
        popover.addStyleClass("sapUshellSearchNlqExplainPopover");
        this.input.attachBrowserEvent("focusin", () => {
            popover.close();
            this.input.focus(); // popover close sets focus to ai explain button therefore again set focus to input
        });
        return popover;
    }

    initCancelButton(): void {
        this.cancelButton = new Button(this.getId() + "-buttonCancel", {
            text: "{i18n>cancelBtn}",
        });
        this.cancelButton.addStyleClass("sapUshellSearchCancelButton");
    }

    initActionsMenuButton(): void {
        const searchfieldGroupId = this.getId();
        this.actionsMenuButton = new Button(searchfieldGroupId + "-actionsMenuButton", {
            icon: "sap-icon://overflow",
            type: ButtonType.Emphasized,
            press: () => {
                if (!this.actionsMenu) {
                    const menuItems = [];
                    // sort
                    const menuItemSort = new MenuItem(searchfieldGroupId + "-menuItemSort", {
                        text: "{i18n>actionsMenuSort}",
                        icon: "sap-icon://sort",
                        press: (/* oEvent: Event */): void => {
                            const searchModel = this.getModel() as SearchModel;
                            const searchCompositeControlInstance =
                                searchModel.getSearchCompositeControlInstanceByChildControl(
                                    this.actionsMenuButton
                                );
                            if (searchCompositeControlInstance) {
                                searchCompositeControlInstance.openSortDialog();
                            } else {
                                // not expected / robustness -> do not swhow sort popover
                            }
                        },
                    });
                    menuItems.push(menuItemSort);
                    // filter
                    const menuItemFilter = new MenuItem(
                        (this.getId() ? this.getId() + "-" : "") + "menuItemFilter",
                        {
                            text: "{i18n>actionsMenuFilter}",
                            icon: "sap-icon://filter",
                            press: (/* oEvent: any */): void => {
                                const searchModel = this.getModel() as SearchModel;
                                const searchCompositeControlInstance =
                                    searchModel.getSearchCompositeControlInstanceByChildControl(
                                        this.actionsMenuButton
                                    );
                                if (searchCompositeControlInstance) {
                                    searchCompositeControlInstance.openShowMoreDialog();
                                } else {
                                    // not expected / robustness -> do not swhow sort popover
                                }
                            },
                        }
                    );
                    menuItems.push(menuItemFilter);
                    this.actionsMenu = new Menu({
                        items: menuItems,
                    });
                    this.actionsMenu.setModel(this.getModel("i18n"), "i18n");
                }
                this.actionsMenu.openBy(this.actionsMenuButton, true);
            },
            visible: {
                parts: [{ path: "/uiFilter/dataSource" }],
                formatter: (dataSource: DataSource) => {
                    return dataSource?.type === dataSource?.sina?.DataSourceType.BusinessObject;
                },
            },
        });
        this.actionsMenuButton.addStyleClass("sapUiTinyMarginBegin");
    }

    setModel(oModel: Model, sName?: string): this {
        super.setModel(oModel, sName);
        this.select.setModel(oModel, sName);
        this.input.setModel(oModel, sName);
        this.button.setModel(oModel, sName);
        this.cancelButton.setModel(oModel, sName);
        this.nlqExplainButton.setModel(oModel, sName);
        this.actionsMenuButton.setModel(oModel, sName);
        (this.getAggregation("_buttonAriaText") as InvisibleText).setModel(oModel, sName);
        return this;
    }

    destroy(): void {
        super.destroy();
        if (this.select) {
            this.select.destroy();
        }
        if (this.selectQsDs) {
            this.selectQsDs.destroy();
        }
        if (this.cancelButton) {
            this.cancelButton.destroy();
        }
        if (this.nlqExplainButton) {
            this.nlqExplainButton.destroy();
        }
        if (this.nlqExplainPopover) {
            this.nlqExplainPopover.destroy();
        }
        if (this.actionsMenuButton) {
            this.actionsMenuButton.destroy();
        }
        if (this.actionsMenu) {
            this.actionsMenu.destroy();
        }
    }

    static renderer = {
        apiVersion: 2,
        render(oRm: RenderManager, oControl: SearchFieldGroup): void {
            oRm.openStart("div", oControl);
            oRm.class("SearchFieldGroup");
            oRm.openEnd();
            oRm.renderControl(oControl.getAggregation("_topFlexBox") as FlexBox);
            oRm.renderControl(oControl.getAggregation("_flexBox") as FlexBox);
            oRm.renderControl(oControl.getAggregation("_buttonAriaText") as InvisibleText);
            oRm.close("div");
        },
    };
}
