/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import SearchFacetDialogModel from "../SearchFacetDialogModel";
import SearchFacetDialog, { $SearchFacetDialogSettings } from "./facets/SearchFacetDialog";
import { UserEventType } from "../eventlogging/UserEvents";
import type SearchModel from "../SearchModel";
import Control from "sap/ui/core/Control";
import IconTabFilter from "sap/m/IconTabFilter";

export interface ShowMoreDialogOptions {
    searchModel: SearchModel;
    dimension: string;
    selectedTabBarIndex: number;
    tabBarItems: Array<IconTabFilter>;
    sourceControl: Control;
}

export async function openShowMoreDialog(options: ShowMoreDialogOptions): Promise<void> {
    const oSearchFacetDialogModel = new SearchFacetDialogModel({ searchModel: options.searchModel });
    await oSearchFacetDialogModel.initAsync();
    oSearchFacetDialogModel.setData(options.searchModel.getData());
    oSearchFacetDialogModel.config = options.searchModel.config;
    oSearchFacetDialogModel.sinaNext = options.searchModel.sinaNext;
    oSearchFacetDialogModel.prepareFacetList();
    const searchFacetDialogSettings: Partial<$SearchFacetDialogSettings> = {
        selectedAttribute: options.dimension,
        selectedTabBarIndex: options.selectedTabBarIndex,
        tabBarItems: options.tabBarItems,
    };

    const oDialog = new SearchFacetDialog(
        `${options.searchModel.config.id}-SearchFacetDialog`,
        searchFacetDialogSettings
    );
    oDialog.setModel(oSearchFacetDialogModel);
    oDialog.setModel(options.searchModel, "searchModel");
    // reference to page, so dialog can be destroy in onExit()
    const compositeControl = options.searchModel.getSearchCompositeControlInstanceByChildControl(
        options.sourceControl
    );
    if (compositeControl) {
        compositeControl["oFacetDialog"] = oDialog;
    }
    oDialog.open();
    options.searchModel.eventLogger.logEvent({
        type: UserEventType.FACET_SHOW_MORE,
        referencedAttribute: options.dimension,
        dataSourceKey: options.searchModel.getDataSource().id,
    });
}
