declare module "sap/esh/search/ui/controls/SearchQueryExplanation" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import Control, { $ControlSettings } from "sap/ui/core/Control";
    import RenderManager from "sap/ui/core/RenderManager";
    import { PropertyBindingInfo } from "sap/ui/base/ManagedObject";
    interface SearchQueryExplanationSettings extends $ControlSettings {
        data?: string | PropertyBindingInfo;
    }
    /**
     * @namespace sap.esh.search.ui.controls
     */
    export default class SearchQueryExplanation extends Control {
        static readonly metadata: {
            properties: {
                data: {
                    type: string;
                };
            };
            aggregations: {
                mainView: {
                    type: string;
                    multiple: boolean;
                    visibility: string;
                };
                toolbar: {
                    type: string;
                    multiple: boolean;
                    visibility: string;
                };
                form: {
                    type: string;
                    multiple: boolean;
                    visibility: string;
                };
                conditionEditor: {
                    type: string;
                    multiple: boolean;
                    visibility: string;
                };
                conditionTree: {
                    type: string;
                    multiple: boolean;
                    visibility: string;
                };
            };
        };
        constructor(sId?: string, settings?: Partial<SearchQueryExplanationSettings>);
        static convertFilterForTree(filterSubTree: any): Array<any>;
        static renderer: {
            apiVersion: number;
            render(oRm: RenderManager, oControl: SearchQueryExplanation): void;
        };
    }
}
//# sourceMappingURL=SearchQueryExplanation.d.ts.map