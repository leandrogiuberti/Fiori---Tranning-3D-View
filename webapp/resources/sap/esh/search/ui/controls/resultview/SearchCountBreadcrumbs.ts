/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import Control, { $ControlSettings } from "sap/ui/core/Control";
import { LabelDesign } from "sap/m/library";
import Icon from "sap/ui/core/Icon";
import Label from "sap/m/Label";
import Breadcrumbs, { $BreadcrumbsSettings } from "sap/m/Breadcrumbs";
import SearchLink from "sap/esh/search/ui/controls/SearchLink";
import RenderManager from "sap/ui/core/RenderManager";
import SearchModel from "sap/esh/search/ui/SearchModel";
import Link from "sap/m/Link";
import Event from "sap/ui/base/Event";
import formatMessage from "sap/base/strings/formatMessage";
import { BreadcrumbsSeparatorStyle } from "sap/m/library";
import HBox from "sap/m/HBox";
import i18n from "../../i18n";
import VBox from "sap/m/VBox";
import { NavigationTarget } from "../../sinaNexTS/sina/NavigationTarget";
import { FlexAlignItems } from "sap/m/library";

export interface $SearchCountBreadcrumbs extends $ControlSettings {
    containerHbox: HBox;
    folderModeLabel: Label;
    icon: Icon;
    label: Label;
    breadcrumbsContainerVbox: VBox;
    breadcrumbs: Breadcrumbs;
}

/**
 * @namespace sap.esh.search.ui.controls
 */
export default class SearchCountBreadcrumbs extends Control {
    static readonly metadata = {
        aggregations: {
            containerHbox: {
                type: "sap.m.HBox",
                multiple: false,
            },
            folderModeLabel: {
                type: "sap.m.Label",
                multiple: false,
            },
            icon: {
                type: "sap.ui.core.Icon",
                multiple: false,
            },
            label: {
                type: "sap.m.Label",
                multiple: false,
            },
            breadcrumbsContainerVbox: {
                type: "sap.m.VBox",
                multiple: false,
            },
            breadcrumbs: {
                type: "sap.m.Breadcrumbs",
                multiple: false,
            },
        },
    };

    constructor(sId: string, settings?: Partial<$SearchCountBreadcrumbs>) {
        super(sId, settings);
        this.initContainerHbox();
        this.initFolderModeLabel();
        this.initIcon();
        this.initLabel();
        this.initBreadcrumbsContainerVbox();
        this.initBreadCrumbs();
    }
    initContainerHbox(): void {
        const hBox = new HBox(this.getId() + "-ContainerHbox", {
            alignItems: FlexAlignItems.Baseline,
        });
        hBox.addStyleClass("sapUiNoMargin");
        this.setAggregation("containerHbox", hBox);
    }
    initFolderModeLabel(): void {
        const label = new Label(this.getId() + "-FolderModeLabel", {
            design: LabelDesign.Bold,
            text: {
                parts: [
                    {
                        path: "/isFolderMode",
                    },
                ],
                formatter: (isFolderMode: boolean): string => {
                    if (isFolderMode === true) {
                        return i18n.getText("result_list_folder_mode");
                    }
                    return i18n.getText("result_list_search_mode");
                },
            },
        });
        label.addStyleClass("sapUshellSearchTotalCountSelenium");
        label.addStyleClass("sapUiTinyMarginEnd");
        label.addStyleClass("sapElisaFolderModeLabel");
        this.setAggregation("folderModeLabel", label);
    }

    initIcon(): void {
        const icon = new Icon(this.getId() + "-Icon", {
            visible: {
                parts: [
                    {
                        path: "/count",
                    },
                    {
                        path: "/breadcrumbsHierarchyNodePaths",
                    },
                ],
                formatter: (count: number, breadcrumbs: string): boolean => {
                    if (breadcrumbs && Array.isArray(breadcrumbs) && breadcrumbs.length > 0) {
                        return false;
                    }
                    return true;
                },
            },
            src: { path: "/searchInIcon" },
        });
        icon.addStyleClass("sapUiTinyMarginEnd");
        icon.addStyleClass("sapUshellSearchTotalCountBreadcrumbsIcon");
        this.setAggregation("icon", icon);
    }

    initLabel(): void {
        const label = new Label(this.getId() + "-Label", {
            visible: {
                parts: [
                    {
                        path: "/count",
                    },
                    {
                        path: "/breadcrumbsHierarchyNodePaths",
                    },
                ],
                formatter: (count: number, breadcrumbs: string): boolean => {
                    if (breadcrumbs && Array.isArray(breadcrumbs) && breadcrumbs.length > 0) {
                        return false;
                    }
                    return true;
                },
            },
            design: LabelDesign.Bold,
            text: { path: "/countText" },
        });
        label.addStyleClass("sapUshellSearchTotalCountSelenium");
        label.addStyleClass("sapUshellSearchTotalCountStandalone");
        this.setAggregation("label", label);
    }
    initBreadcrumbsContainerVbox(): void {
        const vBox = new VBox(this.getId() + "-BreadcrumbsContainerVbox", {});
        vBox.addStyleClass("sapElisaBreadcrumbsFolderContainerVbox");
        vBox.addStyleClass("sapUiNoMargin");
        this.setAggregation("breadcrumbsContainerVbox", vBox);
    }

    initBreadCrumbs(): void {
        const links = {
            path: "/breadcrumbsHierarchyNodePaths",
            factory: (sId: string): SearchLink => {
                return new SearchLink(`${sId}--searchLink`, {
                    navigationTarget: {
                        parts: [
                            {
                                path: "id",
                            },
                            {
                                path: "label",
                            },
                        ],
                        formatter: (_id: string, _label: string): NavigationTarget => {
                            const searchModel = this.getModel() as SearchModel;
                            const sina = searchModel.sinaNext;
                            const dataSource = searchModel.getDataSource();
                            const attrName = searchModel.getProperty("/breadcrumbsHierarchyAttribute");
                            const navTarget = sina.createStaticHierarchySearchNavigationTarget(
                                _id,
                                _label,
                                dataSource,
                                "",
                                attrName
                            );
                            return navTarget;
                        },
                    },
                    text: { path: "label" },
                    icon: { path: "icon" },
                    visible: true,
                }).addStyleClass("sapUshellSearchTotalCountBreadcrumbsLinks");
            },
            templateShareable: false,
        };
        const breadCrumbsSettings: $BreadcrumbsSettings = {
            visible: {
                parts: [
                    {
                        path: "/breadcrumbsHierarchyNodePaths",
                    },
                ],
                formatter: (path: string): boolean => {
                    if (path && Array.isArray(path) && path.length > 0) {
                        return true;
                    }
                    return false;
                },
            },
            currentLocationText: {
                parts: [{ path: "i18n>countnumber" }, { path: "/count" }],
                formatter: formatMessage,
            },
            separatorStyle: BreadcrumbsSeparatorStyle.GreaterThan,
            links: links,
        };
        const breadCrumbs = new Breadcrumbs(this.getId() + "-Breadcrumbs", breadCrumbsSettings).addStyleClass(
            "sapElisaBreadcrumbs sapUiNoMarginBottom"
        );
        this.setAggregation("breadcrumbs", breadCrumbs);
    }

    handleBreadcrumbLinkPress(oEvent: Event): void {
        const oSrc = oEvent.getSource() as Link;
        const valueRaw = oSrc.data().containerId;
        const valueLabel = oSrc.data().containerName;
        const searchModel = oSrc.getModel() as SearchModel;
        const sina = searchModel.sinaNext;
        const dataSource = searchModel.getDataSource();
        const attrName = searchModel.getProperty("/breadcrumbsHierarchyAttribute");
        const navTarget = sina.createStaticHierarchySearchNavigationTarget(
            valueRaw,
            valueLabel,
            dataSource,
            "",
            attrName
        );
        navTarget.performNavigation();
    }

    setModel(model: SearchModel): this {
        (this.getAggregation("folderModeLabel") as Label).setModel(model);
        (this.getAggregation("icon") as Icon).setModel(model);
        (this.getAggregation("label") as Label).setModel(model);
        (this.getAggregation("breadcrumbs") as Breadcrumbs).setModel(model);
        return this;
    }

    static renderer = {
        apiVersion: 2,
        render(oRm: RenderManager, oControl: SearchCountBreadcrumbs): void {
            oRm.openStart("div", oControl);
            oRm.class("sapUshellSearchTotalCountBreadcrumbs");
            oRm.openEnd();

            const searchModel = oControl.getModel() as SearchModel;

            // in case of folder mode/search mode, display additional folderModeLabel
            if (searchModel.config.folderMode === true && searchModel.config.optimizeForValueHelp !== true) {
                const hBox = oControl.getAggregation("containerHbox") as HBox;
                hBox.addItem(oControl.getAggregation("folderModeLabel") as Label);
                hBox.addItem(oControl.getAggregation("icon") as Icon);
                hBox.addItem(oControl.getAggregation("label") as Label);

                if (searchModel.config.FF_hierarchyBreadcrumbs === true) {
                    // for sake of responsiveness, additional container is needed
                    const vBox = oControl.getAggregation("breadcrumbsContainerVbox") as VBox;
                    vBox?.addItem(oControl.getAggregation("breadcrumbs") as Breadcrumbs);
                    hBox.addItem(vBox);
                    oRm.renderControl(hBox);
                }
            } else {
                oRm.renderControl(oControl.getAggregation("icon") as Icon);
                oRm.renderControl(oControl.getAggregation("label") as Label);

                if (searchModel.config.FF_hierarchyBreadcrumbs === true) {
                    oRm.renderControl(oControl.getAggregation("breadcrumbs") as Breadcrumbs);
                }
            }

            oRm.close("div");
        },
    };
}
