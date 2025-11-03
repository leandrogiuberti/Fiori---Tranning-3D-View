declare module "sap/cux/home/App" {
    import { GenericTile$PressEvent } from "sap/m/GenericTile";
    import type { MetadataOptions } from "sap/ui/core/Element";
    import { $AppSettings } from "sap/cux/home/App";
    import BaseApp from "sap/cux/home/BaseApp";
    /**
     *
     * App class for managing and storing Apps.
     *
     * @extends sap.cux.home.BaseApp
     *
     * @author SAP SE
     * @version 0.0.1
     * @since 1.121.0
     *
     * @private
     * @ui5-restricted ux.eng.s4producthomes1
     *
     * @alias sap.cux.home.App
     */
    export default class App extends BaseApp {
        constructor(idOrSettings?: string | $AppSettings);
        constructor(id?: string, settings?: $AppSettings);
        private appManagerInstance;
        static readonly metadata: MetadataOptions;
        private _getSSBRootControl;
        private _getInnerGenericTile;
        /**
         * Navigates to the clicked app
         * @private
         */
        private _launchApp;
        /**
         * App Press Handler
         * @private
         */
        _handlePress(event: GenericTile$PressEvent): Promise<void>;
    }
}
//# sourceMappingURL=App.d.ts.map