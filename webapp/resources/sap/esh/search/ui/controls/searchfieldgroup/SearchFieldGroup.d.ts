declare module "sap/esh/search/ui/controls/searchfieldgroup/SearchFieldGroup" {
    import Button from "sap/m/Button";
    import Menu from "sap/m/Menu";
    import SearchInput from "sap/esh/search/ui/controls/searchfieldgroup/SearchInput";
    import Control, { $ControlSettings } from "sap/ui/core/Control";
    import RenderManager from "sap/ui/core/RenderManager";
    import SearchSelect from "sap/esh/search/ui/controls/searchfieldgroup/SearchSelect";
    import SearchSelectQuickSelectDataSource from "sap/esh/search/ui/controls/searchfieldgroup/SearchSelectQuickSelectDataSource";
    import Popover from "sap/m/Popover";
    import { PropertyBindingInfo } from "sap/ui/base/ManagedObject";
    import Model from "sap/ui/model/Model";
    interface $SearchFieldGroupControlSettings extends $ControlSettings {
        nlqExplainButtonActive?: boolean | PropertyBindingInfo | `{${string}}`;
    }
    /**
     * @namespace sap.esh.search.ui.controls
     */
    export default class SearchFieldGroup extends Control {
        static readonly metadata: {
            properties: {
                selectActive: {
                    defaultValue: boolean;
                    type: string;
                };
                selectQsDsActive: {
                    defaultValue: boolean;
                    type: string;
                };
                inputActive: {
                    defaultValue: boolean;
                    type: string;
                };
                buttonActive: {
                    defaultValue: boolean;
                    type: string;
                };
                nlqExplainButtonActive: {
                    defaultValue: boolean;
                    type: string;
                };
                cancelButtonActive: {
                    defaultValue: boolean;
                    type: string;
                };
                actionsMenuButtonActive: {
                    defaultValue: boolean;
                    type: string;
                };
            };
            aggregations: {
                _topFlexBox: {
                    type: string;
                    multiple: boolean;
                    visibility: string;
                };
                _flexBox: {
                    type: string;
                    multiple: boolean;
                    visibility: string;
                };
                _buttonAriaText: {
                    type: string;
                    multiple: boolean;
                    visibility: string;
                };
            };
        };
        select: SearchSelect;
        selectQsDs: SearchSelectQuickSelectDataSource;
        input: SearchInput;
        button: Button;
        cancelButton: Button;
        nlqExplainButton: Button;
        actionsMenu: Menu;
        actionsMenuButton: Button;
        private nlqExplainPopover;
        constructor(sId?: string, options?: $SearchFieldGroupControlSettings);
        setCancelButtonActive(active: boolean): void;
        setNlqExplainButtonActive(active: boolean): void;
        setActionsMenuButtonActive(active: boolean): void;
        setSelectActive(active: boolean): void;
        setSelectQsDsActive(active: boolean): void;
        initFlexBox(): void;
        initSelect(): void;
        initSelectQsDs(): void;
        initInput(): void;
        initButton(): void;
        initNlqExplainButton(): void;
        assembleNlqPopover(): Popover;
        initCancelButton(): void;
        initActionsMenuButton(): void;
        setModel(oModel: Model, sName?: string): this;
        destroy(): void;
        static renderer: {
            apiVersion: number;
            render(oRm: RenderManager, oControl: SearchFieldGroup): void;
        };
    }
}
//# sourceMappingURL=SearchFieldGroup.d.ts.map