declare module "sap/cux/home/utils/Accessibility" {
    /*!
     * SAP UI development toolkit for HTML5 (SAPUI5)
     *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
     */
    import InvisibleText from "sap/ui/core/InvisibleText";
    import BaseContainer from "sap/cux/home/BaseContainer";
    import BaseLayout from "sap/cux/home/BaseLayout";
    import BasePanel from "sap/cux/home/BasePanel";
    /**
     * Creates an instance of `InvisibleText` with the given ID and text.
     *
     * @param {string} id - The unique id for the `InvisibleText` instance.
     * @param {string} [text=""] - The text content for the `InvisibleText` instance. Defaults to an empty string.
     * @returns {InvisibleText} A new `InvisibleText` instance.
     * @throws {Error} If the `id` is not provided.
     */
    function getInvisibleText(id: string, text?: string): InvisibleText;
    /**
     * Checks whether a specific panel type exists within a given container in the layout.
     *
     * @param {BaseContainer} parentContainer - The parent container from where the from which the function is called.
     * @param {string} containerTypeName - The name of the container to look for.
     * @param {string} panelTypeName - The name of the panel to verify inside the container.
     * @returns {boolean} - Returns `true` if the specified panel exists, otherwise `false`.
     */
    function checkPanelExists(parentContainer: BaseContainer | BasePanel | BaseLayout, containerTypeName: string, panelTypeName: string): boolean;
}
//# sourceMappingURL=Accessibility.d.ts.map