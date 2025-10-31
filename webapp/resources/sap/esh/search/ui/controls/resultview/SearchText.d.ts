declare module "sap/esh/search/ui/controls/resultview/SearchText" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import Text from "sap/m/Text";
    import Icon from "sap/ui/core/Icon";
    import { $TextSettings } from "sap/m/Text";
    import { MetadataOptions } from "sap/ui/base/ManagedObject";
    import RenderManager from "sap/ui/core/RenderManager";
    import TooltipBase from "sap/ui/core/TooltipBase";
    interface SearchTextSettings extends $TextSettings {
        icon?: Icon;
    }
    /**
     * @namespace sap.esh.search.ui.controls
     */
    export default class SearchText extends Text {
        static readonly metadata: MetadataOptions;
        constructor(sId?: string, settings?: SearchTextSettings);
        init(): void;
        /**
         * Assigns the given css class to the inner text control, because that's the way
         * it worked before the control was refactored to be a composite control. Now
         * an additional span element is added around the text control, see renderer method.
         * @param sStyleClass name of the css class to be added
         * @returns SearchText
         */
        addStyleClass(sStyleClass: string): this;
        setText(sText: string): this;
        setMaxLines(iMaxLines: int): this;
        setWrapping(bWrapping: boolean): this;
        setIcon(icon: Icon): SearchText;
        setTooltip(sTooltip?: string | TooltipBase): this;
        onAfterRendering(oEvent: any): void;
        static renderer: {
            apiVersion: number;
            render: (rm: RenderManager, control: SearchText) => void;
        };
    }
}
//# sourceMappingURL=SearchText.d.ts.map