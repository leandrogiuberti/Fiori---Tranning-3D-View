/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import i18n from "../i18n";
import HorizontalLayout, { $HorizontalLayoutSettings } from "sap/ui/layout/HorizontalLayout";
import Button from "sap/m/Button";
import { ButtonType } from "sap/m/library";
import Input from "sap/m/Input";
import Select from "sap/m/Select";
import CheckBox from "sap/m/CheckBox";
import DateRangeSelection from "sap/m/DateRangeSelection";
import InvisibleText from "sap/ui/core/InvisibleText";
import Control from "sap/ui/core/Control";
import Item from "sap/ui/core/Item";
import Label from "sap/m/Label";
import SearchFacetDialogHelper from "../SearchFacetDialogHelper";
import Event from "sap/ui/base/Event";
import Element from "sap/ui/core/Element";

interface $SearchAdvancedConditionSettings extends $HorizontalLayoutSettings {
    type: string;
    allowWrapping: boolean;
}

/**
 * @namespace sap.esh.search.ui.controls
 */
export default class SearchAdvancedCondition extends HorizontalLayout {
    static readonly metadata = {
        properties: {
            type: {
                type: "string",
            },
        },
    };

    public static searchFacetDialogHelper: SearchFacetDialogHelper;

    constructor(sId?: string, settings?: Partial<$SearchAdvancedConditionSettings>) {
        super(sId, settings);

        this.setAllowWrapping(settings?.allowWrapping);
        this.addStyleClass("sapUshellSearchFacetDialogDetailPageCondition");
        if (settings?.type) {
            const content = this.contentFactory(settings);
            for (const contentItem of content) {
                this.addContent(contentItem);
            }
        }
    }

    contentFactory(options: Partial<$SearchAdvancedConditionSettings>): Array<Control> {
        const oAdvancedCheckBox = new CheckBox("", {
            select: (oEvent: Event) => {
                SearchFacetDialogHelper.updateCountInfo(this.getDetailPage(oEvent.getSource() as Control));
            },
        }).addStyleClass("sapUshellSearchFacetDialogDetailPageConditionCheckBox");
        let oAdvancedCheckBoxLabel = Element.getElementById("advancedCheckBoxLabel");
        if (!oAdvancedCheckBoxLabel) {
            oAdvancedCheckBoxLabel = new InvisibleText("advancedCheckBoxLabel", {
                text: i18n.getText("checkBox"),
            });
        }
        oAdvancedCheckBox.addAriaLabelledBy("advancedCheckBoxLabel");
        let oOperatorLabel = Element.getElementById("operatorLabel");
        if (!oOperatorLabel) {
            oOperatorLabel = new InvisibleText("operatorLabel", {
                text: i18n.getText("operator"),
            });
        }
        let oInputArea, oDeleteButton, oInputsingle, oSelect;
        switch (options.type) {
            case "timestamp":
            case "date":
                oInputArea = new DateRangeSelection({
                    width: "86%",
                    change: (oEvent) => {
                        this.onDateRangeSelectionChange(oEvent);
                    },
                }).addStyleClass("sapUshellSearchFacetDialogDetailPageConditionInput");
                oInputArea.onAfterRendering = function () {
                    const domRef = this.getDomRef();
                    if (domRef) {
                        const inputEls = domRef.querySelectorAll("input");
                        inputEls.forEach((input) => {
                            input.setAttribute("readonly", "readonly");
                        });
                    }
                };
                break;
            case "string":
                oAdvancedCheckBox.setVisible(false);
                oInputsingle = new Input({
                    width: "56%",
                    placeholder: i18n.getText("filterCondition"),
                    liveChange: (oEvent) => {
                        this.onAdvancedInputChange(oEvent);
                    },
                }).addStyleClass("sapUshellSearchFacetDialogDetailPageConditionInput");
                oSelect = new Select({
                    width: "40%",
                    tooltip: i18n.getText("operator"),
                    items: [
                        new Item({
                            text: i18n.getText("equals"),
                            key: "eq",
                        }),
                        new Item({
                            text: i18n.getText("beginsWith"),
                            key: "bw",
                        }),
                        new Item({
                            text: i18n.getText("endsWith"),
                            key: "ew",
                        }),
                        new Item({
                            text: i18n.getText("contains"),
                            key: "co",
                        }),
                    ],
                }).addStyleClass("sapUshellSearchFacetDialogDetailPageConditionSelect");
                oSelect.addAriaLabelledBy("operatorLabel");
                oInputArea = new HorizontalLayout({
                    allowWrapping: true,
                    content: [oSelect, oInputsingle],
                });
                oDeleteButton = new Button({
                    icon: "sap-icon://sys-cancel",
                    type: ButtonType.Transparent,
                    tooltip: i18n.getText("removeButton"),
                    press: (/*oEvent: Event*/) => {
                        this.onDeleteButtonPress(/*oEvent*/);
                    },
                });
                break;
            case "text":
                oAdvancedCheckBox.setVisible(false);
                oInputsingle = new Input({
                    width: "56%",
                    placeholder: i18n.getText("filterCondition"),
                    liveChange: (oEvent) => {
                        this.onAdvancedInputChange(oEvent);
                    },
                }).addStyleClass("sapUshellSearchFacetDialogDetailPageConditionInput");
                oSelect = new Select({
                    width: "40%",
                    tooltip: i18n.getText("operator"),
                    items: [
                        new Item({
                            text: i18n.getText("containsWords"),
                            key: "co",
                        }),
                    ],
                }).addStyleClass("sapUshellSearchFacetDialogDetailPageConditionSelect");
                oSelect.addAriaLabelledBy("operatorLabel");
                oInputArea = new HorizontalLayout({
                    allowWrapping: true,
                    content: [oSelect, oInputsingle],
                });
                oDeleteButton = new Button({
                    icon: "sap-icon://sys-cancel",
                    type: ButtonType.Transparent,
                    tooltip: i18n.getText("removeButton"),
                    press: (/*oEvent: Event*/) => {
                        this.onDeleteButtonPress(/*oEvent*/);
                    },
                });
                break;
            case "integer":
            case "number": {
                const oInputRangeFrom = new Input("", {
                    width: "46.5%",
                    placeholder: i18n.getText("fromPlaceholder"),
                    liveChange: (oEvent) => {
                        this.onAdvancedNumberInputChange(oEvent);
                    },
                }).addStyleClass("sapUshellSearchFacetDialogDetailPageConditionInput");
                const oInputRangeTo = new Input("", {
                    width: "46.5%",
                    placeholder: i18n.getText("toPlaceholder"),
                    liveChange: (oEvent) => {
                        this.onAdvancedNumberInputChange(oEvent);
                    },
                }).addStyleClass("sapUshellSearchFacetDialogDetailPageConditionInput");
                const oLabelSeparator = new Label("", {
                    text: i18n.getText("threeDots"),
                }).addStyleClass("sapUshellSearchFacetDialogDetailPageConditionLabel");
                oInputArea = new HorizontalLayout("", {
                    allowWrapping: true,
                    content: [oInputRangeFrom, oLabelSeparator, oInputRangeTo],
                });
                oInputArea.addEventDelegate({
                    // workaround to set focus at right end position
                    onAfterRendering: (oEvent) => {
                        const length = oEvent.srcControl.getParent().getParent().getContent().length;
                        const index = oEvent.srcControl
                            .getParent()
                            .getParent()
                            .indexOfAggregation("content", oEvent.srcControl.getParent());
                        if (index === length - 2) {
                            const value = oEvent.srcControl.getContent()[2].getValue();
                            oEvent.srcControl.getContent()[2].setValue();
                            oEvent.srcControl.getContent()[2].setValue(value);
                        }
                    },
                });
                break;
            }
            default:
                break;
        }
        return [oAdvancedCheckBox, oInputArea, oDeleteButton];
    }

    getDetailPage(oControl: Control): Control {
        if (
            oControl.hasStyleClass &&
            (oControl.hasStyleClass("sapUshellSearchFacetDialogDetailPageString") ||
                oControl.hasStyleClass("sapUshellSearchFacetDialogDetailPage"))
        ) {
            return oControl;
        } else {
            return this.getDetailPage((oControl as any).getParent()); // ToDo
        }
    }

    // event: date range selection box changed
    onDateRangeSelectionChange(oEvent: Event): void {
        const oDateRangeSelection: any = oEvent.getSource(); // ToDo
        const oAdvancedCondition = oDateRangeSelection.getParent();
        const oAdvancedConditionCheckBox = oAdvancedCondition.getContent()[0];
        if (oDateRangeSelection.getDateValue() && oDateRangeSelection.getSecondDateValue()) {
            oAdvancedConditionCheckBox.setSelected(true);
            SearchFacetDialogHelper.insertNewAdvancedCondition(oAdvancedCondition, "date");
            SearchFacetDialogHelper.updateCountInfo(oAdvancedCondition.getParent().getParent());
        } else {
            oAdvancedConditionCheckBox.setSelected(false);
        }
    }

    // event: advanced string input box changed
    onAdvancedInputChange(oEvent: Event): void {
        const oInput = oEvent.getSource() as Input;
        const oAdvancedCondition: any = oInput.getParent().getParent(); // ToDo
        const oAdvancedConditionCheckBox = oAdvancedCondition.getContent()[0];
        if (oInput.getValue()) {
            oAdvancedConditionCheckBox.setSelected(true);
            SearchFacetDialogHelper.updateCountInfo(this.getDetailPage(oAdvancedConditionCheckBox));
        } else {
            oAdvancedConditionCheckBox.setSelected(false);
        }
    }

    // event: advanced condition delete button pressed
    onDeleteButtonPress(/* oEvent: Event */): void {
        SearchFacetDialogHelper.deleteAdvancedCondition(this);
    }

    // event: advanced number input box changed
    onAdvancedNumberInputChange(oEvent: Event): void {
        const oInput = oEvent.getSource() as Input;
        const oAdvancedCondition: any = oInput.getParent().getParent();
        const oAdvancedConditionCheckBox = oAdvancedCondition.getContent()[0] as CheckBox;
        const oAdvancedConditionRange = oInput.getParent() as HorizontalLayout;
        const oAdvancedRangeFrom = oAdvancedConditionRange.getContent()[0] as Input;
        const oAdvancedRangeTo = oAdvancedConditionRange.getContent()[2] as Input;
        if (oAdvancedRangeFrom.getValue() && oAdvancedRangeTo.getValue()) {
            oAdvancedConditionCheckBox.setSelected(true);
            SearchFacetDialogHelper.insertNewAdvancedCondition(oAdvancedCondition, "number");
            SearchFacetDialogHelper.updateCountInfo(oAdvancedCondition.getParent().getParent());
        } else {
            oAdvancedConditionCheckBox.setSelected(false);
        }
    }

    public static injectSearchFacetDialogHelper(_SearchFacetDialogHelper: SearchFacetDialogHelper): void {
        SearchAdvancedCondition.searchFacetDialogHelper = _SearchFacetDialogHelper;
    }

    static renderer = {
        apiVersion: 2,
    };
}
