declare module "sap/esh/search/ui/controls/SearchFilterBar" {
    import Toolbar, { $ToolbarSettings } from "sap/m/Toolbar";
    import { ComplexCondition } from "sap/esh/search/ui/sinaNexTS/sina/ComplexCondition";
    import { ComparisonOperator } from "sap/esh/search/ui/sinaNexTS/sina/ComparisonOperator";
    import Facet from "sap/esh/search/ui/Facet";
    interface $SearchFilterBarSettings extends $ToolbarSettings {
        filterText: string;
    }
    /**
     * @namespace sap.esh.search.ui.controls
     */
    export default class SearchFilterBar extends Toolbar {
        private filterText;
        private resetButton;
        constructor(sId?: string, settings?: $SearchFilterBarSettings);
        filterFormatter(rootCondition: ComplexCondition, facets: Array<Facet>): string;
        _assembleFilterLabels(rootCondition: ComplexCondition, facets: Array<Facet>): Array<{
            attributeName: string;
            attributeLabel: string;
            attributeFilterValueLabels: Array<string>;
        }>;
        _formatFilterText(rootCondition: ComplexCondition, facets: Array<Facet>): string;
        _formatLabel(label: string, operator?: ComparisonOperator): string;
        sortConditions(rootCondition: ComplexCondition, facets: Array<Facet>): ComplexCondition;
        onAfterRendering(oEvent: any): void;
        static renderer: {
            apiVersion: number;
        };
    }
}
//# sourceMappingURL=SearchFilterBar.d.ts.map