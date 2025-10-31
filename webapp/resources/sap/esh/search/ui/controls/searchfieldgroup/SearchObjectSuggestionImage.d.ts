declare module "sap/esh/search/ui/controls/searchfieldgroup/SearchObjectSuggestionImage" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import Image, { $ImageSettings } from "sap/m/Image";
    import { PropertyBindingInfo } from "sap/ui/base/ManagedObject";
    interface $SearchObjectSuggestionImageOptions extends $ImageSettings {
        isCircular?: boolean | PropertyBindingInfo;
    }
    /**
     * @namespace sap.esh.search.ui.controls
     */
    export default class SearchObjectSuggestionImage extends Image {
        static readonly metadata: {
            properties: {
                isCircular: {
                    type: string;
                    multiple: boolean;
                };
            };
        };
        constructor(sId?: string, options?: Partial<$SearchObjectSuggestionImageOptions>);
        wrapImage(isError: boolean): void;
        createContainer(isError: boolean): void;
        adaptContainer(isError: boolean): void;
        static renderer: {
            apiVersion: number;
        };
    }
}
//# sourceMappingURL=SearchObjectSuggestionImage.d.ts.map