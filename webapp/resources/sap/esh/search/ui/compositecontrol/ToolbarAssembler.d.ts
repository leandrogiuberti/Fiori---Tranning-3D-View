declare module "sap/esh/search/ui/compositecontrol/ToolbarAssembler" {
    import SearchCompositeControl from "sap/esh/search/ui/SearchCompositeControl";
    import OverflowToolbar from "sap/m/OverflowToolbar";
    import OverflowToolbarButton from "sap/m/OverflowToolbarButton";
    import IconTabBar from "sap/m/IconTabBar";
    import ViewSettingsDialog from "sap/m/ViewSettingsDialog";
    import OverflowToolbarToggleButton from "sap/m/OverflowToolbarToggleButton";
    export default class ToolbarAssembler {
        compositeControl: SearchCompositeControl;
        constructor(compositeControl: SearchCompositeControl);
        assembleFilterButton(): OverflowToolbarToggleButton;
        assembleResultviewSelectionButton(): OverflowToolbarToggleButton;
        assembleGenericButtonsToolbar(): {
            toolbar: OverflowToolbar;
            hasCustomButtons: boolean;
        };
        assembleSearchResultSortDialog(): ViewSettingsDialog;
        assembleExportButton(): OverflowToolbarButton;
        assembleShareButton(): OverflowToolbarButton;
        assembleDataSourceTabBar(): IconTabBar;
        assembleResultViewSwitch(): void;
    }
}
//# sourceMappingURL=ToolbarAssembler.d.ts.map