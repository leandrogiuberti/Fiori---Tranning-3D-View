declare module "sap/esh/search/ui/controls/OpenShowMoreDialog" {
    import type SearchModel from "sap/esh/search/ui/SearchModel";
    import Control from "sap/ui/core/Control";
    import IconTabFilter from "sap/m/IconTabFilter";
    interface ShowMoreDialogOptions {
        searchModel: SearchModel;
        dimension: string;
        selectedTabBarIndex: number;
        tabBarItems: Array<IconTabFilter>;
        sourceControl: Control;
    }
    function openShowMoreDialog(options: ShowMoreDialogOptions): Promise<void>;
}
//# sourceMappingURL=OpenShowMoreDialog.d.ts.map