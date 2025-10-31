declare module "sap/cux/home/BaseContainerRenderer" {
    import RenderManager from "sap/ui/core/RenderManager";
    import BaseContainer from "sap/cux/home/BaseContainer";
    import BasePanel from "sap/cux/home/BasePanel";
    const renderPanel: (rm: RenderManager, control: BaseContainer, panel: BasePanel) => void;
    /**
     * Renders custom loader based on container type.
     */
    const renderCustomPlaceholder: (rm: RenderManager, control: BaseContainer) => void;
    const _default: {
        apiVersion: number;
        /**
         * Renders the control.
         *
         * @public
         * @override
         * @param {RenderManager} rm - The RenderManager object.
         * @param {BaseContainer} control - The BaseContainer control to be rendered.
         */
        render: (rm: RenderManager, control: BaseContainer) => void;
        /**
         * Renders the content of the control.
         *
         * @private
         * @param {RenderManager} rm - The RenderManager object.
         * @param {BaseContainer} control - The BaseContainer control.
         */
        renderContent: (rm: RenderManager, control: BaseContainer) => void;
    };
    export default _default;
}
//# sourceMappingURL=BaseContainerRenderer.d.ts.map