declare module "sap/esh/search/ui/controls/facets/types/tabbarfacet/SearchFacetTabBarBase" {
    import Button, { Button$PressEvent } from "sap/m/Button";
    import ActionSheet from "sap/m/ActionSheet";
    import IconTabFilter from "sap/m/IconTabFilter";
    import RenderManager from "sap/ui/core/RenderManager";
    import Control, { $ControlSettings } from "sap/ui/core/Control";
    import { FacetTypeUI } from "sap/esh/search/ui/controls/facets/FacetTypeUI";
    interface $SearchFacetTabBarBaseSettings extends $ControlSettings {
        facetType: FacetTypeUI;
        headerText: string;
        selectedButtonParameters: any;
        items: Array<IconTabFilter>;
    }
    /**
     * @namespace sap.esh.search.ui.controls
     */
    export default class SearchFacetTabBarBase extends Control {
        static readonly metadata: {
            properties: {
                facetType: string;
                headerText: string;
                selectedButtonParameters: {
                    type: string;
                    defaultValue: any;
                };
            };
            aggregations: {
                items: {
                    type: string;
                    multiple: boolean;
                };
            };
        };
        constructor(sId?: string, settings?: Partial<$SearchFacetTabBarBaseSettings>);
        getSearchFacetTabBarAndDimensionById(buttonId: string): {
            index?: number;
            control?: Control;
            view?: any;
            buttonIndex?: string;
            dimension?: any;
        };
        storeClickedTabInformation(oEvent: Button$PressEvent): void;
        createOpenFacetDialogFn(iSelectedTabBarIndex: number, aTabBarItems: Array<IconTabFilter>): () => Promise<void>;
        assembleChartSwitchButtons(tabBarItems: Array<IconTabFilter>, dimension: string): Array<Button>;
        assembleChartSwitchActionSheet(tabBarItems: Array<IconTabFilter>, dimension: string): ActionSheet;
        assembleChartSwitchButton(tabBarItems: Array<IconTabFilter>, selectedButtonIndex: number, dimension: string, enableCharts: boolean): Button;
        getContentFacets(tabBarItems: Array<IconTabFilter>): Array<Control>;
        static renderer: {
            apiVersion: number;
            render(oRm: RenderManager, oControl: SearchFacetTabBarBase): void;
        };
    }
}
//# sourceMappingURL=SearchFacetTabBarBase.d.ts.map