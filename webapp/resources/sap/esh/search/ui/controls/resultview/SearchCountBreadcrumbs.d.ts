declare module "sap/esh/search/ui/controls/resultview/SearchCountBreadcrumbs" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import Control, { $ControlSettings } from "sap/ui/core/Control";
    import Icon from "sap/ui/core/Icon";
    import Label from "sap/m/Label";
    import Breadcrumbs from "sap/m/Breadcrumbs";
    import RenderManager from "sap/ui/core/RenderManager";
    import SearchModel from "sap/esh/search/ui/SearchModel";
    import Event from "sap/ui/base/Event";
    import HBox from "sap/m/HBox";
    import VBox from "sap/m/VBox";
    interface $SearchCountBreadcrumbs extends $ControlSettings {
        containerHbox: HBox;
        folderModeLabel: Label;
        icon: Icon;
        label: Label;
        breadcrumbsContainerVbox: VBox;
        breadcrumbs: Breadcrumbs;
    }
    /**
     * @namespace sap.esh.search.ui.controls
     */
    export default class SearchCountBreadcrumbs extends Control {
        static readonly metadata: {
            aggregations: {
                containerHbox: {
                    type: string;
                    multiple: boolean;
                };
                folderModeLabel: {
                    type: string;
                    multiple: boolean;
                };
                icon: {
                    type: string;
                    multiple: boolean;
                };
                label: {
                    type: string;
                    multiple: boolean;
                };
                breadcrumbsContainerVbox: {
                    type: string;
                    multiple: boolean;
                };
                breadcrumbs: {
                    type: string;
                    multiple: boolean;
                };
            };
        };
        constructor(sId: string, settings?: Partial<$SearchCountBreadcrumbs>);
        initContainerHbox(): void;
        initFolderModeLabel(): void;
        initIcon(): void;
        initLabel(): void;
        initBreadcrumbsContainerVbox(): void;
        initBreadCrumbs(): void;
        handleBreadcrumbLinkPress(oEvent: Event): void;
        setModel(model: SearchModel): this;
        static renderer: {
            apiVersion: number;
            render(oRm: RenderManager, oControl: SearchCountBreadcrumbs): void;
        };
    }
}
//# sourceMappingURL=SearchCountBreadcrumbs.d.ts.map