/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import SearchModel from "../SearchModel";
import i18n from "../i18n";
import { HierarchyNode } from "../sinaNexTS/sina/HierarchyNode";
import SuggestionType, { SearchSuggestion, Type } from "./SuggestionType";

function assembleLabel(searchModel: SearchModel): string {
    // if the model has has a selected hierarchy node (folder), use that:
    const hierarchyNodePathLength = searchModel.getProperty("/breadcrumbsHierarchyNodePaths").length;
    if (hierarchyNodePathLength > 0) {
        let breadCrumb = "";
        let pathSep = " > ";
        let hierarchyNodes = (
            searchModel.getProperty("/breadcrumbsHierarchyNodePaths") as HierarchyNode[]
        ).slice();
        if (document.documentElement.getAttribute("dir") === "rtl") {
            pathSep = " < ";
            hierarchyNodes = hierarchyNodes.reverse();
        }
        hierarchyNodes.forEach((hierarchyNode, index) => {
            breadCrumb += hierarchyNode.label;
            if (++index < hierarchyNodePathLength) {
                breadCrumb += pathSep;
            }
        });
        return i18n.getText("resultsIn", ["<span>" + searchModel.getSearchBoxTerm() + "</span>", breadCrumb]);
    }
    // if the model has more than one data source, add the data source to the label:
    if (searchModel.getProperty("/dataSources").length > 1) {
        return i18n.getText("resultsIn", [
            "<span>" + searchModel.getSearchBoxTerm() + "</span>",
            searchModel.getDataSource().labelPlural,
        ]);
    }
    // fallback just use searchterm
    return searchModel.getSearchBoxTerm();
}

function hasFilter(searchModel: SearchModel): boolean {
    const filter = searchModel.getProperty("/uiFilter");
    const dataSource = filter.dataSource;
    const staticHierarchyAttributeId = dataSource.getStaticHierarchyAttributeMetadata()?.id;
    const filterAttributes = filter.rootCondition.getAttributes().filter((attributeId) => {
        // ignore static hierarchy filter conditions
        if (staticHierarchyAttributeId && staticHierarchyAttributeId === attributeId) {
            return false;
        }
        return true;
    });
    return filterAttributes.length > 0;
}

export function createSearchSuggestionForCurrentSearch(searchModel: SearchModel): SearchSuggestion {
    const searchTerm = searchModel.getSearchBoxTerm();

    if (!searchTerm || searchTerm === "*" || searchTerm === "") return;

    return {
        label: assembleLabel(searchModel),
        icon: "sap-icon://search",
        titleNavigation: searchModel.createSearchNavigationTargetCurrentState(),
        uiSuggestionType: Type.Search,
        position: SuggestionType.properties.Search.position,
        filterIcon: hasFilter(searchModel) ? "sap-icon://filter" : "",
    };
}
