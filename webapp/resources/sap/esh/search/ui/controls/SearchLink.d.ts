declare module "sap/esh/search/ui/controls/SearchLink" {
    import Icon from "sap/ui/core/Icon";
    import { URI as sapURI } from "sap/ui/core/library";
    import Link from "sap/m/Link";
    import { NavigationTarget } from "sap/esh/search/ui/sinaNexTS/sina/NavigationTarget";
    import { MetadataOptions, PropertyBindingInfo } from "sap/ui/base/ManagedObject";
    import { $ControlSettings } from "sap/ui/core/Control";
    import { NavigationTarget as NavigationTargetApi } from "sap/esh/search/ui/ResultSetApi";
    interface $SearchLinkSettings extends $ControlSettings {
        navigationTarget: NavigationTarget | PropertyBindingInfo | NavigationTargetApi;
        icon?: Icon;
        href?: string;
        enabled?: boolean;
        target?: string;
        text?: string | PropertyBindingInfo;
        wrapping?: boolean;
    }
    /**
     * @namespace sap.esh.search.ui.controls
     */
    export default class SearchLink extends Link {
        static readonly metadata: MetadataOptions;
        private _pressHandlerAttached;
        constructor(sId?: string, settings?: any);
        pressHandlerSearchLink(oEvent: any): void;
        setNavigationTarget(navigationTarget: NavigationTarget): this;
        setText(sText?: string): this;
        getNavigationTarget(): NavigationTarget;
        setEnabled(bEnabled?: boolean): this;
        setIcon(sIcon?: sapURI): this;
        onAfterRendering(oEvent: any): void;
        _handlePress(oEvent: any): void;
        onsapenter(oEvent: any): void;
        onclick(oEvent: any): void;
        static renderer: {
            apiVersion: number;
        };
    }
}
//# sourceMappingURL=SearchLink.d.ts.map