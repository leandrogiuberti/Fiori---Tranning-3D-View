/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import i18n from "../i18n";
import Text from "sap/m/Text";
import Toolbar, { $ToolbarSettings } from "sap/m/Toolbar";
import ToolbarSpacer from "sap/m/ToolbarSpacer";
import { ToolbarDesign } from "sap/m/library";
import Icon from "sap/ui/core/Icon";
import SearchModel from "sap/esh/search/ui/SearchModel";
import { ComplexCondition } from "../sinaNexTS/sina/ComplexCondition";
import { ComparisonOperator } from "../sinaNexTS/sina/ComparisonOperator";
import { UserEventType } from "../eventlogging/UserEvents";
import { HierarchyDisplayType } from "../sinaNexTS/sina/HierarchyDisplayType";
import errors from "../error/errors";
import { FacetTypeUI } from "./facets/FacetTypeUI";
import Facet from "../Facet";
import { SimpleCondition } from "../sinaNexTS/sina/SimpleCondition";

interface $SearchFilterBarSettings extends $ToolbarSettings {
    filterText: string;
}
/**
 * @namespace sap.esh.search.ui.controls
 */
export default class SearchFilterBar extends Toolbar {
    private filterText: Text;
    private resetButton: Icon;

    constructor(sId?: string, settings?: $SearchFilterBarSettings) {
        super(sId, settings);

        // blue bar
        this.setProperty("design", ToolbarDesign.Info);

        this.addStyleClass("sapUshellSearchFilterContextualBar");

        // bind file formatter
        this.filterFormatter = this.filterFormatter.bind(this);

        // filter text string
        this.filterText = new Text(this.getId() + "-resetFilterText", {
            text: {
                parts: [{ path: "/uiFilter/rootCondition" }, { path: "/facets" }],
                formatter: this.filterFormatter,
            },
            tooltip: {
                parts: [{ path: "/uiFilter/rootCondition" }, { path: "/facets" }],
                formatter: this.filterFormatter,
            },
        }).addStyleClass("sapUshellSearchFilterText");
        this.filterText.setMaxLines(1);
        this.addContent(this.filterText);

        // filter middle space
        this.addContent(new ToolbarSpacer());

        // filter reset button
        this.resetButton = new Icon(this.getId() + "-resetFilterButton", {
            src: "sap-icon://clear-filter",
            tooltip: i18n.getText("resetFilterButton_tooltip"),
        }).addStyleClass("sapUshellSearchFilterResetButton");
        this.addContent(this.resetButton);
    }

    filterFormatter(rootCondition: ComplexCondition, facets: Array<Facet>): string {
        if (!rootCondition || !rootCondition.hasFilters()) {
            return "";
        }
        const model = this.getModel() as SearchModel;
        if (model.config.formatFilterBarText) {
            // 1) exit
            try {
                return model.config.formatFilterBarText(this._assembleFilterLabels(rootCondition, facets));
            } catch (error) {
                const oError = new errors.ConfigurationExitError(
                    "formatFilterBarText",
                    model.config.applicationComponent,
                    error
                );
                const searchCompositeControl = model.getSearchCompositeControlInstanceByChildControl(this);
                searchCompositeControl?.errorHandler.onError(oError);
                return this._formatFilterText(rootCondition, facets); // fallback default formatter
            }
        } else {
            // 2) default formatter
            return this._formatFilterText(rootCondition, facets);
        }
    }

    _assembleFilterLabels(
        rootCondition: ComplexCondition,
        facets: Array<Facet>
    ): Array<{ attributeName: string; attributeLabel: string; attributeFilterValueLabels: Array<string> }> {
        const attributeFilters = [];
        // sort filter values, use same order as in facets
        rootCondition = this.sortConditions(rootCondition, facets);
        // collect all filter values
        for (let i = 0; i < rootCondition.conditions.length; ++i) {
            const complexCondition = rootCondition.conditions[i] as ComplexCondition;
            const model = this.getModel() as SearchModel;
            const attribute = complexCondition.getFirstAttribute();
            const attributeMetadata =
                model.getProperty("/uiFilter")?.dataSource.attributeMetadataMap[attribute];
            if (
                attributeMetadata &&
                attributeMetadata.isHierarchy === true &&
                attributeMetadata.hierarchyDisplayType === HierarchyDisplayType.StaticHierarchyFacet
            ) {
                continue;
            }
            const attributeFilter = {
                attributeName: attributeMetadata?.id || attribute,
                attributeLabel: "",
                attributeFilterValueLabels: [],
            };
            attributeFilters.push(attributeFilter);
            for (let j = 0; j < complexCondition.conditions.length; ++j) {
                const filterCondition = complexCondition.conditions[j];
                if (j === 0) {
                    attributeFilter.attributeLabel = filterCondition.attributeLabel;
                }
                let label;
                if (filterCondition instanceof SimpleCondition) {
                    label = this._formatLabel(filterCondition.valueLabel, filterCondition.operator);
                } else if (filterCondition instanceof ComplexCondition) {
                    label = this._formatLabel(filterCondition.valueLabel);
                }
                attributeFilter.attributeFilterValueLabels.push(label);
            }
        }
        return attributeFilters;
    }

    _formatFilterText(rootCondition: ComplexCondition, facets: Array<Facet>): string {
        const attributeFilters = this._assembleFilterLabels(rootCondition, facets);
        const result = attributeFilters.map(
            (attributeFilter) =>
                attributeFilter.attributeLabel +
                " (" +
                attributeFilter.attributeFilterValueLabels.join(", ") +
                ")"
        );
        return i18n.getText("filtered_by", [result.join(", ")]);
    }

    _formatLabel(label: string, operator?: ComparisonOperator): string {
        let labelFormatted;
        switch (operator) {
            case ComparisonOperator.Bw: // "Bw"
                labelFormatted = label + "*";
                break;
            case ComparisonOperator.Ew: // "Ew"
                labelFormatted = "*" + label;
                break;
            case ComparisonOperator.Co: // "Co"
                labelFormatted = "*" + label + "*";
                break;
            default:
                labelFormatted = label;
                break;
        }
        return labelFormatted;
    }

    sortConditions(rootCondition: ComplexCondition, facets: Array<Facet>): ComplexCondition {
        // cannot sort without facets
        if (facets.length === 0) {
            return rootCondition;
        }
        // helper: get attribute from a complex condition
        const getAttribute = function (complexCondition) {
            const firstFilter = complexCondition.conditions[0];
            if (firstFilter.attribute) {
                return firstFilter.attribute;
            }
            return firstFilter.conditions[0].attribute;
        };
        // helper get list index
        const getIndex = function (list, attribute, value) {
            for (let i = 0; i < list.length; ++i) {
                const element = list[i];
                if (element[attribute] === value) {
                    return i;
                }
            }
        };
        // clone: we don't want to modify the original filter
        rootCondition = rootCondition.clone();
        // 1) sort complexConditons (each complexCondition holds the filters for a certain attribute)
        rootCondition.conditions.sort(function (complexCondition1, complexCondition2) {
            const attribute1 = getAttribute(complexCondition1);
            const index1 = getIndex(facets, "dimension", attribute1);
            const attribute2 = getAttribute(complexCondition2);
            const index2 = getIndex(facets, "dimension", attribute2);
            return index1 - index2;
        });
        // 2) sort filters within a complexConditon
        const sortValues = function (complexCondition) {
            const attribute = getAttribute(complexCondition);
            const index = getIndex(facets, "dimension", attribute);
            if (!index) {
                return;
            }
            const facet = facets[index];
            if (facet.facetType === FacetTypeUI.Hierarchy) {
                return; // no sort for hierarchy
            }
            const valueSortFunction = function (filter1, filter2) {
                return (
                    getIndex(facet.items, "label", filter1.valueLabel) -
                    getIndex(facet.items, "label", filter2.valueLabel)
                );
            };
            complexCondition.conditions.sort(valueSortFunction);
        };
        for (let i = 0; i < rootCondition.conditions.length; ++i) {
            const complexCondition = rootCondition.conditions[i];
            sortValues(complexCondition);
        }
        return rootCondition;
    }

    onAfterRendering(oEvent): void {
        super.onAfterRendering(oEvent);

        // don't have model until after rendering
        // attach press action
        this.resetButton.attachPress(() => {
            const model = this.getModel() as SearchModel;
            model.eventLogger.logEvent({
                type: UserEventType.CLEAR_ALL_FILTERS,
                dataSourceKey: model.getDataSource().id,
            });
            model.resetFilterByFilterConditions(true);
        });

        // add aria label
        const filterText = document.querySelector(".sapUshellSearchFilterText");
        if (filterText) {
            filterText.setAttribute("aria-label", i18n.getText("filtered_by_aria_label"));
        }
    }

    static renderer = {
        apiVersion: 2,
    };
}
