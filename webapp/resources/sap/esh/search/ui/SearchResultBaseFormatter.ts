/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import ErrorHandler from "./error/ErrorHandler";
import i18n from "./i18n";
import SearchModel from "sap/esh/search/ui/SearchModel";
import { AttributeMetadata } from "./sinaNexTS/sina/AttributeMetadata";

export interface SortAttribute {
    attributeId: string; // ID of unformatted attribute, for dialog-attribute mapping
    name: string; // UI5 sort dialog item label
    key: string; // UI5 sort dialog item key
    selected: boolean;
}

export default abstract class SearchResultBaseFormatter {
    model: SearchModel;
    protected errorHandler: ErrorHandler;

    constructor(model: SearchModel) {
        this.model = model;
        this.errorHandler = ErrorHandler.getInstance();
    }

    /*
     * ===================================
     * format attributes for search result sort dialog
     * ===================================
     */
    formatSortAttributes(): Array<SortAttribute> {
        const sortAttributes = [];
        const sina = this.model.sinaNext;
        const datasource = this.model.getDataSource();
        const attributesMetadata = sina.dataSourceMap[datasource.id].attributesMetadata;

        if (!Array.isArray(attributesMetadata) || attributesMetadata.length === 0) {
            return [];
        }

        // sortable attributes
        for (let i = 0; i < attributesMetadata.length; i++) {
            const attribute = attributesMetadata[i] as AttributeMetadata;
            if (attribute.isSortable) {
                sortAttributes.push({
                    name: attribute.label,
                    key: "searchSortAttributeKey" + i,
                    attributeId: attribute.id,
                });
            }
        }

        const compareAttributes = (a, b) => {
            if (a.name < b.name) {
                return -1;
            }
            if (a.name > b.name) {
                return 1;
            }
            return 0;
        };

        sortAttributes.sort(compareAttributes);

        // default sort attribute, server ranking
        sortAttributes.unshift({
            name: i18n.getText("defaultRank"),
            key: "searchSortAttributeKeyDefault",
            attributeId: "DEFAULT_SORT_ATTRIBUTE",
        });

        // set selected
        let orderBy = this.model.getOrderBy().orderBy;
        if (typeof orderBy === "undefined") {
            orderBy = "DEFAULT_SORT_ATTRIBUTE";
        }
        for (let i = 0; i < sortAttributes.length; i++) {
            if (sortAttributes[i].attributeId === orderBy) {
                sortAttributes[i].selected = true;
            } else {
                sortAttributes[i].selected = false;
            }
        }

        return sortAttributes;
    }
}
