declare module "sap/cux/home/library" {
    import "sap/ui/core/library";
    import "sap/ui/integration/library";
    /**
     * Root namespace for all the libraries related to Common User Experience.
     *
     * @namespace
     * @private
     * @ui5-restricted ux.eng.s4producthomes1
     * @since 1.121
     */
    export const cuxNamespace = "sap.cux";
    /**
     * This is an SAPUI5 library with controls specialized for common user experience.
     *
     * @namespace
     * @private
     * @ui5-restricted ux.eng.s4producthomes1
     * @since 1.121
     */
    export const cuxHomeNamespace = "sap.cux.home";
    const thisLib: {
        [key: string]: unknown;
    };
    /**
     * Supported layout types for {@link sap.cux.home.BaseContainer}.
     *
     * @enum {string}
     * @private
     * @since 1.121
     */
    export enum OrientationType {
        /**
         * Panels are rendered side by side, for example To-Dos and Situaions, and Favorites, Recently Used and Frequently Used apps
         *
         * @public
         */
        SideBySide = "SideBySide",
        /**
         * Panels are rendered vertically, for example Insights Tiles and Insights Cards
         *
         * @public
         */
        Vertical = "Vertical",
        /**
         * Panels are rendered horizontally, for example Pages and News
         *
         * @public
         */
        Horizontal = "Horizontal"
    }
    /**
     * Supported News Types for {@link sap.cux.home.NewsPanel}.
     *
     * @enum {string}
     * @private
     * @ui5-restricted ux.eng.s4producthomes1
     * @since 1.121
     */
    export enum NewsType {
        /**
         * News is of type Url
         * @private
         * @ui5-restricted ux.eng.s4producthomes1
         */
        NewsUrl = "newsUrl",
        /**
         * News is of type custom news feed
         *
         * @private
         * @ui5-restricted ux.eng.s4producthomes1
         */
        Custom = "customFeed",
        /**
         * News is of type default news feed
         *
         * @private
         * @ui5-restricted ux.eng.s4producthomes1
         */
        Default = "default",
        /**
         * News is of type None
         *
         * @private
         * @ui5-restricted ux.eng.s4producthomes1
         */
        None = ""
    }
    export default thisLib;
}
//# sourceMappingURL=library.d.ts.map