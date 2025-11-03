declare module "sap/cux/home/NoDataContainer" {
    import { MetadataOptions } from "sap/ui/core/Element";
    import type { $BaseContainerSettings } from "sap/cux/home/BaseContainer";
    import BaseContainer from "sap/cux/home/BaseContainer";
    import BasePanel from "sap/cux/home/BasePanel";
    /**
     *
     * Panel class to show no data content.
     *
     */
    class NoDataContentPanel extends BasePanel {
        /**
         * Init lifecycle method
         *
         */
        init(): void;
    }
    /**
     *
     * Container class to show no data content.
     *
     * @extends BaseContainer
     *
     * @author SAP SE
     * @version 0.0.1
     * @since 1.121
     *
     * @private
     * @ui5-restricted ux.eng.s4producthomes1
     *
     * @alias sap.cux.home.NoDataContainer
     */
    export default class NoDataContainer extends BaseContainer {
        static readonly metadata: MetadataOptions;
        static renderer: {
            apiVersion: number;
            render: (rm: import("sap/ui/core/RenderManager").default, control: BaseContainer) => void;
            renderContent: (rm: import("sap/ui/core/RenderManager").default, control: BaseContainer) => void;
        };
        constructor(id?: string | $BaseContainerSettings);
        constructor(id?: string, settings?: $BaseContainerSettings);
        /**
         * Init lifecycle method
         *
         * @private
         */
        init(): void;
        /**
         * onBeforeRendering lifecycle method
         *
         * @private
         */
        onBeforeRendering(): void;
        /**
         * Set up default no-data content for the container.
         *
         * @private
         */
        private _setupDefaultContent;
    }
}
//# sourceMappingURL=NoDataContainer.d.ts.map