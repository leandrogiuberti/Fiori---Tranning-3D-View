/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import SearchFacetTabBarBase, { $SearchFacetTabBarBaseSettings } from "./SearchFacetTabBarBase";
import IconTabFilter from "sap/m/IconTabFilter";
import { FacetTypeUI } from "../../FacetTypeUI";
import SearchFacetSimpleList from "./SearchFacetSimpleList";
import Control from "sap/ui/core/Control";

/**
 * Attribute facet (list, pie chart, bar chart) - tab bar
 */

/**
 * @namespace sap.esh.search.ui.controls
 */
export default class SearchFacetTabBar extends SearchFacetTabBarBase {
    constructor(sId?: string, settings?: Partial<$SearchFacetTabBarBaseSettings>) {
        super(sId, settings);
    }

    switchFacetType(facetType: FacetTypeUI): void {
        const aIconTabFilter = this.getAggregation("items") as Array<IconTabFilter>;
        for (const iconTabFilter of aIconTabFilter) {
            const facet = iconTabFilter.getContent()[0];
            if (facet instanceof SearchFacetSimpleList) {
                facet.switchFacetType(facetType);
            }
        }
    }
    getFacetType(): FacetTypeUI {
        const tabBarItems = this.getAggregation("items");
        const tabBarItem = tabBarItems[0];
        const facet = tabBarItem.getContent()[0] as Control;
        return facet.getProperty("facetType");
    }
    attachSelectionChange(): any {
        //
    }
    static renderer: any = {
        apiVersion: 2,
    };
}
