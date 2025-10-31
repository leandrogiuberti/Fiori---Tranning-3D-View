/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import SearchFacetSimpleListItem from "./SearchFacetSimpleListItem";
import List, { $ListSettings } from "sap/m/List";
import { ListMode } from "sap/m/library";
import { ListSeparators } from "sap/m/library";
import SearchModel from "sap/esh/search/ui/SearchModel";
import Label from "sap/m/Label";
import { ListBase$ItemPressEvent, ListBase$SelectionChangeEvent } from "sap/m/ListBase";
import { FacetTypeUI } from "../../FacetTypeUI";
import { UserEventType } from "../../../../eventlogging/UserEvents";
import FacetItem from "../../../../FacetItem";
import errors from "../../../../error/errors";
import Element from "sap/ui/core/Element";
import { DataSource } from "../../../../sinaNexTS/sina/DataSource";

export interface $SearchFacetSimpleListSettings extends $ListSettings {
    facetType?: FacetTypeUI;
}

/**
 * Generic facet to be used for 'data sources' or 'attributes' (see property `facetType`)
 */

/**
 * @namespace sap.esh.search.ui.controls
 */
export default class SearchFacetSimpleList extends List {
    static readonly metadata = {
        properties: {
            facetType: {
                type: "string",
                defaultValue: FacetTypeUI.DataSource,
            },
        },
    };

    constructor(sId?: string, settings?: Partial<$SearchFacetSimpleListSettings>) {
        let facetListGenericSettings;
        if (settings?.facetType) {
            facetListGenericSettings = { facetType: settings?.facetType };
            delete settings.facetType;
        }
        super(sId, settings);

        if (facetListGenericSettings?.facetType) {
            this.setProperty("facetType", facetListGenericSettings.facetType);
        }

        this.setMode(ListMode.SingleSelectMaster);
        this.setShowSeparators(ListSeparators.None);
        this.setIncludeItemInSelection(true);
        this.attachSelectionChange((oEvent: ListBase$SelectionChangeEvent) => {
            if (this.getProperty("facetType") === FacetTypeUI.Attribute) {
                this.handleItemPress(oEvent);
            }
        });
        this.attachItemPress((oEvent: ListBase$ItemPressEvent): void => {
            const oModel = this.getModel() as SearchModel;
            const listItem = oEvent.getParameter("listItem");
            const oSelectedItem = listItem.getBindingContext().getObject() as FacetItem;
            if (
                oModel.config.searchScopeWithoutAll &&
                oSelectedItem.filterCondition instanceof DataSource &&
                oSelectedItem.filterCondition === oModel.allDataSource
            ) {
                return;
            }
            if (this.getProperty("facetType") === FacetTypeUI.DataSource) {
                this.handleItemPress(oEvent);
            }
        });
        this.addStyleClass("sapUshellSearchFacet");

        // define group for F6 handling
        this.data("sap-ui-fastnavgroup", "false", true /* write into DOM */);
    }

    handleItemPress(oEvent: ListBase$SelectionChangeEvent): void {
        const listItem = oEvent.getParameter("listItem");
        const oSelectedItem = listItem.getBindingContext().getObject() as FacetItem;
        const oModel = this.getModel() as SearchModel;
        const filterCondition = oSelectedItem.filterCondition;
        if (listItem.getSelected()) {
            // when filter conditions are changed, give a callback to adjust the conditions
            if (typeof oModel.config.adjustFilters === "function") {
                oModel.config.adjustFilters(oModel, filterCondition);
            }
            oModel.addFilterCondition(filterCondition);

            oModel.eventLogger.logEvent({
                type: UserEventType.FACET_FILTER_ADD,
                referencedAttribute: oSelectedItem.facetAttribute,
                clickedValue: oSelectedItem.value,
                clickedLabel: oSelectedItem.label,
                clickedPosition: (listItem as any).getList().getItems().indexOf(listItem),
                dataSourceKey: oModel.getDataSource().id,
            });
        } else {
            oModel.removeFilterCondition(oSelectedItem.filterCondition);
            oModel.eventLogger.logEvent({
                type: UserEventType.FACET_FILTER_DEL,
                referencedAttribute: oSelectedItem.facetAttribute,
                clickedValue: oSelectedItem.value,
                clickedLabel: oSelectedItem.label,
                clickedPosition: (listItem as any).getList().getItems().indexOf(listItem),
                dataSourceKey: oModel.getDataSource().id,
            });
        }
    }

    onAfterRendering(oEvent): void {
        super.onAfterRendering(oEvent);

        // Use native DOM APIs to find the info row
        const domRef = this.getDomRef();
        if (!domRef) return;

        const infoZeile = domRef
            .closest(".sapUshellSearchFacetIconTabBar")
            ?.querySelector(".sapUshellSearchFacetInfoZeile");

        if (infoZeile) {
            const oInfoZeile = Element.getElementById(infoZeile.id) as Label;
            oInfoZeile.setVisible(false);
        }
    }

    switchFacetType(facetType: FacetTypeUI): void {
        const items = {
            path: "items", // children of "/facets" (see SearchModel "/facets/items")
            template: new SearchFacetSimpleListItem("", {
                isDataSource: facetType === FacetTypeUI.DataSource,
            }),
        };
        switch (facetType) {
            // attribute facet
            case FacetTypeUI.Attribute: {
                const oModel = this.getModel() as SearchModel;
                let listMode;
                if (oModel.config && typeof oModel.config.getSearchInFacetListMode === "function") {
                    const currentItemData = oModel.getProperty(this.getBindingContext().getPath());
                    try {
                        listMode = oModel.config.getSearchInFacetListMode(currentItemData);
                    } catch (err) {
                        const oError = new errors.ConfigurationExitError(
                            "getSearchInFacetListMode",
                            oModel.config.applicationComponent,
                            err
                        );
                        throw oError;
                    }
                }
                this.setMode(listMode || ListMode.MultiSelect);
                break;
            }
            // datasource facet
            case FacetTypeUI.DataSource:
                this.setMode(ListMode.SingleSelectMaster);
                break;
            default:
                // unknown facet type
                throw new Error(`unknown facet type ${facetType}.`);
        }
        this.bindItems(items);
        this.setProperty("facetType", facetType, true); // this validates and stores the new value
    }

    static renderer = {
        apiVersion: 2,
    };
}
