declare module "sap/esh/search/ui/controls/SearchNlqExplainBar" {
    import Toolbar, { $ToolbarSettings } from "sap/m/Toolbar";
    export default class SearchNlqExplainBar extends Toolbar {
        private _aiPopover;
        private _nlqViewAllPopover;
        private _nlqExplainText;
        constructor(sId?: string, settings?: $ToolbarSettings);
        private assembleNlqViewAllPopover;
        private assembleAiPopover;
        private assembleNlqFilterCopyButton;
        static renderer: {
            apiVersion: number;
        };
    }
}
//# sourceMappingURL=SearchNlqExplainBar.d.ts.map