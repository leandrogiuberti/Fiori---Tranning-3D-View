declare module "sap/esh/search/ui/controls/resultview/CustomSearchResultListItemContent" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import ManagedObject from "sap/ui/base/ManagedObject";
    import Control from "sap/ui/core/Control";
    export default class CustomSearchResultListItemContent extends ManagedObject {
        static metadata: {
            properties: {
                title: string;
                titleUrl: string;
                type: string;
                imageUrl: string;
                attributes: {
                    type: string;
                    multiple: boolean;
                };
                intents: {
                    type: string;
                    multiple: boolean;
                };
            };
        };
        getContent(): Control[] | Control;
        getTitleVisibility(): boolean;
    }
}
//# sourceMappingURL=CustomSearchResultListItemContent.d.ts.map