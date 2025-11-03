declare module "sap/esh/search/ui/controls/resultview/SearchRelatedObjectsToolbar" {
    import Control, { $ControlSettings } from "sap/ui/core/Control";
    import RenderManager from "sap/ui/core/RenderManager";
    import { NavigationTarget } from "sap/esh/search/ui/sinaNexTS/sina/NavigationTarget";
    interface $SearchRelatedObjectsToolbarSettings extends $ControlSettings {
        itemId: string;
        navigationObjects: Array<NavigationTarget>;
        positionInList: number;
    }
    /**
     * @namespace sap.esh.search.ui.controls
     */
    export default class SearchRelatedObjectsToolbar extends Control {
        private _theItemNavigation;
        private _overFlowButton;
        private _overFlowActionSheet;
        toolbarWidth: number;
        static readonly metadata: {
            properties: {
                itemId: string;
                navigationObjects: {
                    type: string;
                    multiple: boolean;
                };
                positionInList: string;
            };
            aggregations: {
                _relatedObjectActionsToolbar: {
                    type: string;
                    multiple: boolean;
                    visibility: string;
                };
                _ariaDescriptionForLinks: {
                    type: string;
                    multiple: boolean;
                    visibility: string;
                };
            };
        };
        constructor(sId?: string, settings?: $SearchRelatedObjectsToolbarSettings);
        exit(...args: Array<any>): void;
        static renderer: {
            apiVersion: number;
            render(oRm: RenderManager, oControl: SearchRelatedObjectsToolbar): void;
        };
        private _renderToolbar;
        onAfterRendering(): void;
        /**
         * Layout toolbar elements and move overflowing elements to the action sheet.
         * CAUTION: DO NOT CALL ANY UI5 METHODS HERE OR RERENDERING ENDLESS LOOP WILL HAPPEN!!!
         * @returns void
         */
        layoutToolbarElements(): void;
        private _setupItemNavigation;
        private _addAriaInformation;
    }
}
//# sourceMappingURL=SearchRelatedObjectsToolbar.d.ts.map