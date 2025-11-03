/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import i18n from "./i18n";
import MessageBox from "sap/m/MessageBox";
import SearchModel from "./SearchModel";
import { TextDirection } from "sap/ui/core/library";
import { Filter } from "./sinaNexTS/sina/Filter";
import SearchHierarchyDynamicFacet from "./hierarchydynamic/SearchHierarchyDynamicFacet";
import { SimpleCondition } from "./sinaNexTS/sina/SimpleCondition";
import { createFilterFacetItemForDynamicHierarchy } from "./SearchFacetDialogHelperDynamicHierarchy";
import FacetItem from "./FacetItem";
import { ChartQuery } from "./sinaNexTS/sina/ChartQuery";
import { ChartResultSet } from "./sinaNexTS/sina/ChartResultSet";
import Facet from "./Facet";
import { ComplexCondition } from "./sinaNexTS/sina/ComplexCondition";

export interface $SearchFacetDialogModelSettings {
    searchModel: SearchModel;
}

export default class SearchFacetDialogModel extends SearchModel {
    aFilters: Array<FacetItem>;
    chartQuery: ChartQuery;
    searchModel: SearchModel;

    constructor(settings: $SearchFacetDialogModelSettings) {
        super({
            searchModel: settings.searchModel,
            configuration: settings.searchModel.config,
        });
        this.searchModel = settings.searchModel;
        this.aFilters = [];
    }

    prepareFacetList(): void {
        const metaData = this.getDataSource();
        this.setProperty("/facetDialog", this.oFacetFormatter.getDialogFacetsFromMetaData(metaData, this));
        this.initialFillFiltersForDynamicHierarchyFacets();
    }

    initialFillFiltersForDynamicHierarchyFacets() {
        const filter = this.getProperty("/uiFilter") as Filter;
        const facets = this.getProperty("/facetDialog");
        for (const facet of facets) {
            if (!(facet instanceof SearchHierarchyDynamicFacet)) {
                continue;
            }
            const conditions = (filter.rootCondition as ComplexCondition).getAttributeConditions(
                facet.attributeId
            );
            for (const condition of conditions) {
                const simpleCondition = condition as SimpleCondition;
                const facetItem = createFilterFacetItemForDynamicHierarchy(facet, simpleCondition);
                this.aFilters.push(facetItem);
            }
        }
    }

    // properties: sAttribute, sBindingPath
    facetDialogSingleCall(properties: {
        sAttribute: string;
        sAttributeLimit: number;
        sBindingPath: string;
        bInitialFilters?: boolean;
    }): Promise<void> {
        this.chartQuery.dimension = properties.sAttribute;
        this.chartQuery.top = properties.sAttributeLimit;
        this.chartQuery.setNlq(this.searchModel.isNlqActive());

        return this.chartQuery.getResultSetAsync().then(
            (resultSet: ChartResultSet) => {
                let oFacet: Facet;
                if (properties.bInitialFilters) {
                    oFacet = this.oFacetFormatter.getDialogFacetsFromChartQuery(
                        resultSet,
                        this,
                        this.chartQuery.dimension
                    );
                } else {
                    oFacet = this.oFacetFormatter.getDialogFacetsFromChartQuery(
                        resultSet,
                        this,
                        this.chartQuery.dimension,
                        this.aFilters
                    );
                }
                this.setProperty(properties.sBindingPath + "/items", oFacet.items);
                this.setProperty(properties.sBindingPath + "/items", oFacet.items);
                if (typeof resultSet?.facetTotalCount === "number") {
                    this.setProperty(properties.sBindingPath + "/facetTotalCount", resultSet.facetTotalCount);
                }
            },
            (error: Error) => {
                const errorTitle = i18n.getText("searchError");
                const errorText = error.message;
                MessageBox.error(errorText, {
                    title: errorTitle,
                    actions: MessageBox.Action.OK,
                    onClose: null,
                    styleClass: "sapUshellSearchMessageBox", // selector for closePopovers
                    initialFocus: null,
                    textDirection: TextDirection.Inherit,
                });
            }
        );
    }

    resetChartQueryFilterConditions(): void {
        if (this.chartQuery) {
            this.chartQuery.resetConditions();
        }
        // add static hierachy facets
        const nonFilterByConditions = this.getStaticHierarchyFilterConditions();
        if (nonFilterByConditions.length > 0) {
            for (const nonFilterByCondition of nonFilterByConditions) {
                this.chartQuery.autoInsertCondition(nonFilterByCondition);
            }
        }
    }

    hasFilterCondition(filterCondition): boolean {
        for (let i = 0; i < this.aFilters.length; i++) {
            if (
                this.aFilters[i].filterCondition.equals &&
                this.aFilters[i].filterCondition.equals(filterCondition)
            ) {
                return true;
            }
        }
        return false;
    }

    hasFilter(item): boolean {
        const filterCondition = item.filterCondition;
        return this.hasFilterCondition(filterCondition);
    }

    addFilter(item: FacetItem): void {
        if (!this.hasFilter(item)) {
            this.aFilters.push(item);
        }
    }

    removeFilter(item: FacetItem): void {
        const filterCondition = item.filterCondition;
        for (let i = 0; i < this.aFilters.length; i++) {
            if (
                this.aFilters[i].filterCondition.equals &&
                this.aFilters[i].filterCondition.equals(filterCondition)
            ) {
                this.aFilters.splice(i, 1);
                return;
            }
        }
    }

    changeFilterAdvaced(item, bAdvanced: boolean): void {
        const filterCondition = item.filterCondition;
        for (let i = 0; i < this.aFilters.length; i++) {
            if (
                this.aFilters[i].filterCondition.equals &&
                this.aFilters[i].filterCondition.equals(filterCondition)
            ) {
                this.aFilters[i].advanced = bAdvanced;
                return;
            }
        }
    }

    addFilterCondition(filterCondition): void {
        this.chartQuery.filter.autoInsertCondition(filterCondition);
    }

    // determinate the attribute list data type
    getAttributeDataType(facet): string {
        switch (facet.dataType) {
            case "Integer":
                return "integer";
            case "Double":
                return "number";
            case "Timestamp":
                return "timestamp";
            case "Date":
                return "date";
            case "String":
                if (facet.matchingStrategy === this.sinaNext.MatchingStrategy.Text) {
                    return "text";
                }
                return "string";
            default:
                return "string";
        }
    }

    destroy(): void {
        super.destroy();
        this.oFacetFormatter.destroy();
    }
}
