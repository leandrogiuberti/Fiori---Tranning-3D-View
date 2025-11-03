/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import Control, { $ControlSettings } from "sap/ui/core/Control";
import RenderManager from "sap/ui/core/RenderManager";
import { typesafeRender } from "./TypeGuardForControls";
import Tree, { $TreeSettings } from "sap/m/Tree";
import StandardTreeItem from "sap/m/StandardTreeItem";
import { PropertyBindingInfo } from "sap/ui/base/ManagedObject";
import JSONModel from "sap/ui/model/json/JSONModel";
import CodeEditor, { $CodeEditorSettings } from "sap/ui/codeeditor/CodeEditor";
import VerticalLayout from "sap/ui/layout/VerticalLayout";
import Label from "sap/m/Label";
import Input from "sap/m/Input";
import i18n from "../i18n";
import SimpleForm, { $SimpleFormSettings } from "sap/ui/layout/form/SimpleForm";
import Title from "sap/m/Title";
import Bar from "sap/m/Bar";
import ToggleButton from "sap/m/ToggleButton";

export interface SearchQueryExplanationSettings extends $ControlSettings {
    data?: string | PropertyBindingInfo;
}

/**
 * @namespace sap.esh.search.ui.controls
 */
export default class SearchQueryExplanation extends Control {
    static readonly metadata = {
        properties: {
            data: {
                type: "object",
            },
        },
        aggregations: {
            mainView: {
                type: "sap.ui.layout.VerticalLayout",
                multiple: false,
                visibility: "hidden",
            },
            toolbar: {
                type: "sap.m.Bar",
                multiple: false,
                visibility: "hidden",
            },
            form: {
                type: "sap.ui.layout.form.SimpleForm",
                multiple: false,
                visibility: "hidden",
            },
            conditionEditor: {
                type: "sap.ui.codeeditor.CodeEditor",
                multiple: false,
                visibility: "hidden",
            },
            conditionTree: {
                type: "sap.m.Tree",
                multiple: false,
                visibility: "hidden",
            },
        },
    };

    constructor(sId?: string, settings?: Partial<SearchQueryExplanationSettings>) {
        super(sId, settings);

        const mainView = new VerticalLayout(`${this.getId()}-container`, { width: "100%" });
        // toolbar
        const toolbar = new Bar(`${this.getId()}-toolbar`);
        mainView.addContent(toolbar);
        // form
        const formSettings: $SimpleFormSettings = {
            editable: false,
            layout: "ResponsiveGridLayout", // ToDo: SimpleFormLayout.ResponsiveGridLayout,
            singleContainerFullSize: true,
        };
        const form = new SimpleForm(`${this.getId()}-form`, formSettings);
        // data source
        form.addContent(new Label(`${this.getId()}-dsLabel`, { text: i18n.getText("dataSource") }));
        form.addContent(
            new Input(`${this.getId()}-dsValue`, {
                value: "{nlqData>/dataSource}",
                editable: false,
            })
        );
        // search term
        form.addContent(new Label(`${this.getId()}-searchTermLabel`, { text: i18n.getText("searchTerm") }));
        form.addContent(
            new Input(`${this.getId()}-searchTermValue`, {
                value: "{nlqData>/searchTerm}",
                editable: false,
            })
        );
        this.setAggregation("toolbar", toolbar);
        this.setAggregation("form", form);
        this.setAggregation("mainView", mainView);
    }

    static convertFilterForTree(filterSubTree: any): Array<any> {
        const items = [];
        if (filterSubTree?.length > 0) {
            // child node
            for (const conditionItem of filterSubTree) {
                if (conditionItem?.OperatorType) {
                    items.push({
                        text: conditionItem.OperatorType,
                        nodes: SearchQueryExplanation.convertFilterForTree(conditionItem?.SubFilters),
                    });
                } else {
                    const text = `${conditionItem.ConditionAttribute} ${conditionItem.ConditionOperator} ${conditionItem.ConditionValue}`;
                    items.push({ text: text, nodes: [] });
                }
            }
        } else if (filterSubTree?.OperatorType) {
            // composite node (AND/OR)
            items.push({
                text: filterSubTree.OperatorType,
                nodes: SearchQueryExplanation.convertFilterForTree(filterSubTree?.SubFilters),
            });
        } else if (filterSubTree?.ConditionOperator) {
            const text = `${filterSubTree.ConditionAttribute} ${filterSubTree.ConditionOperator} ${filterSubTree.ConditionValue}`;
            items.push({ text: text, nodes: [] });
        } else {
            items.push({ text: i18n.getText("noFilterConditions"), nodes: [] });
        }
        return items;
    }

    static renderer = {
        apiVersion: 2,
        render(oRm: RenderManager, oControl: SearchQueryExplanation): void {
            const conditionBuilderId = `${oControl.getId()}-filterConditions`;
            const oData = oControl.getProperty("data");
            const mainView = oControl.getAggregation("mainView") as VerticalLayout;
            // toolbar
            // =======
            const toolbar = oControl.getAggregation("toolbar") as Bar;
            // NLQ raw response data
            const nlqRawDataButton = new ToggleButton(`${oControl.getId()}-nlqRawDataToggleButton`, {
                text: i18n.getText("showNlqRawData"),
                press: () => {
                    const showRawData = nlqRawDataButton.getPressed();
                    conditionEditor.setVisible(showRawData);
                    nlqRawDataTitle.setVisible(showRawData);
                    if (showRawData) {
                        nlqRawDataButton.setText(i18n.getText("hideNlqRawData"));
                        conditionTree.collapseAll();
                    } else {
                        nlqRawDataButton.setText(i18n.getText("showNlqRawData"));
                        conditionTree.expandToLevel(1);
                    }
                },
            }).addStyleClass("sapUiLargeMarginBegin");
            toolbar.addContentRight(nlqRawDataButton);

            const oNlqDataModel = new JSONModel({
                dataSource: oData.scope,
                searchTerm: oData.query,
                query: JSON.stringify(oControl.getProperty("data")),
            });

            const nlqRawDataTitle = new Title(`${oControl.getId()}-nlqRawDataTitle`, {
                text: i18n.getText("nlqRawData"),
                visible: false,
            })
                .addStyleClass("sapUiSmallMarginBegin")
                .addStyleClass("sapUiSmallMarginTop");

            // filter conditions
            // =================
            const filterConditionsTitle = new Title(`${oControl.getId()}-filterConditionsTitle`, {
                text: i18n.getText("filterConditions"),
            }).addStyleClass("sapUiSmallMarginBegin");

            // tree
            const oItems = {
                dataSource: oData.scope,
                searchTerm: oData.query,
                items: SearchQueryExplanation.convertFilterForTree(oData?.filter),
            };
            oNlqDataModel.setProperty("/items", oItems);
            let treeItemCounter = 0;
            const treeSettings: $TreeSettings = {
                items: {
                    path: "nlqData>/items",
                    template: new StandardTreeItem(`${conditionBuilderId}-${treeItemCounter++}`, {
                        title: "{nlqData>text}",
                        // icon: "{nlqData>icon}",
                    }),
                },
            };
            const conditionTree = new Tree(`${conditionBuilderId}-tree`, treeSettings);
            setTimeout(() => {
                conditionTree.expandToLevel(1);
            }, 0);
            oControl.setAggregation("conditionTree", conditionTree);
            // editor
            const editorType = "text";
            const codeEditorSettings: $CodeEditorSettings = {
                type: editorType,
                value: "{nlqData>/query}",
                height: "100rem",
                visible: false,
            };
            const conditionEditor = new CodeEditor(
                `${conditionBuilderId}-editor`,
                codeEditorSettings
            ).addStyleClass("sapUiSmallMarginBegin");
            oControl.setAggregation("conditionEditor", conditionEditor);

            // form
            const form = oControl.getAggregation("form") as SimpleForm;
            mainView.addContent(form);

            // if (oData?.filter) {
            mainView.addContent(filterConditionsTitle);
            mainView.addContent(conditionTree);
            mainView.addContent(nlqRawDataTitle);
            mainView.addContent(conditionEditor);
            // }

            oControl.setModel(oNlqDataModel, "nlqData");

            // render control
            // ==============
            // - toolbar
            typesafeRender(oControl.getAggregation("toolbar"), oRm);
            // - form and filter conditions
            typesafeRender(mainView, oRm);
        },
    };
}
