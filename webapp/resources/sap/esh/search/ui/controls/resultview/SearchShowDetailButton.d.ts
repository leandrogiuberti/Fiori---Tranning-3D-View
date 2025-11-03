declare module "sap/esh/search/ui/controls/resultview/SearchShowDetailButton" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import Button, { Button$PressEvent } from "sap/m/Button";
    import { $ButtonSettings } from "sap/m/Button";
    import { MetadataOptions } from "sap/ui/base/ManagedObject";
    interface SearchShowDetailButtonSettings extends $ButtonSettings {
        arrowType?: string;
    }
    /**
     * @namespace sap.esh.search.ui.controls
     */
    export default class SearchShowDetailButton extends Button {
        static readonly metadata: MetadataOptions;
        constructor(sId?: string, settings?: SearchShowDetailButtonSettings);
        setVisualisation(sVisualisation: string): this;
        press(oEvent: Button$PressEvent): void;
    }
}
//# sourceMappingURL=SearchShowDetailButton.d.ts.map