// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/Log",
    "sap/ui/base/EventProvider",
    "sap/ushell/EventHub",
    "sap/ushell/state/ShellModel"
], (
    Log,
    EventProvider,
    EventHub,
    ShellModel
) => {
    "use strict";

    /**
     * @alias sap.ushell.renderer.ShellLayout.ShellArea
     * @enum {string}
     * Enumeration of shell areas. Used to access the DOM elements of the shell layout.
     *
     * @example
     *   const ShellArea = ShellLayout.ShellArea;
     *   const oShellHeader = document.getElementById(ShellArea.ShellHeader);
     *
     * @private
     */
    const ShellArea = {
        /**
         * Root node of the shell layout.
         *
         * @private
         */
        RootDomRef: "shellLayout",

        /**
         * The Shell header node.
         *
         * @private
         */
        ShellHeader: "header-shellArea",

        /**
         * The Renderer root view node containing the runtime and applications.
         * The actual id might be changed dynamically once the layout is applied.
         *
         * @private
         */
        RendererRootView: "canvas", // default

        /**
         * The side navigation node.
         *
         * @since 1.131.0
         * @private
         */
        SideNavigation: "sideNavigation-shellArea",

        /**
         * The side pane node. {@link sap.ushell.services.FrameBoundExtension.SidePane} is rendered here.
         *
         * @private
         */
        SidePane: "sidePane-shellArea",

        /**
         * The footer node. {@link sap.ushell.services.FrameBoundExtension.Footer} is rendered here.
         *
         * @private
         */
        Footer: "footer-shellArea",

        /**
         * The tool area node. {@link sap.ushell.services.FrameBoundExtension.ToolArea} is rendered here.
         *
         * @private
         */
        ToolArea: "toolArea-shellArea",

        /**
         * The sub header node. Items created via {@link sap.ushell.services.FrameBoundExtension#createSubHeader} are rendered here.
         *
         * @private
         */
        SubHeader: "subHeader-shellArea",

        /**
         * The navigation bar node.
         *
         * @private
         */
        NavigationBar: "navigationBar-shellArea",

        /**
         * The floating actions node. Used by deprecated Renderer API {@link sap.ushell.renderers.fiori2.Renderer#addFloatingButton}.
         *
         * @private
         */
        FloatingActions: "floatingActions-shellArea",

        /**
         * The Floating Container node. It contains the component wrapping the floating container.
         * This node is moved in and out of the docking areas.
         *
         * @private
         */
        FloatingContainer: "floatingContainer-shellArea",

        /**
         * The node used to dock the floating container at the start of the shell area.
         *
         * @private
         */
        FloatingContainerDockStart: "floatingContainerDockStart-shellArea",

        /**
         * The node used to dock the floating container at the end of the shell area.
         *
         * @private
         */
        FloatingContainerDockEnd: "floatingContainerDockEnd-shellArea",

        /**
         * The right floating container node. It is used to render the notifications.
         *
         * @private
         */
        RightFloatingContainer: "rightFloatingContainer-shellArea",

        /**
         * The background image node. It is used to render the background images.
         *
         * @private
         */
        BackgroundImage: "backgroundImage-shellArea",

        /**
         * The help content node. It used by the WebAssistant and SAP Companion.
         *
         * @private
         */
        HelpContent: "helpContent-shellArea",

        /**
         * The web components content node. It used to place web components that open a popover or dialog in the DOM.
         *
         * @private
         */
        WebComponents: "WebComponents-shellArea"
    };

    /**
     * @alias sap.ushell.renderer.ShellLayout
     * @namespace
     * @description The ShellLayout is responsible for creating the shell layout.
     *
     * @since 1.137.0
     * @private
     * @ui5-restricted DWS
     */
    class ShellLayout {
        #sSideNavigationMode = null;
        #bHasAdjacentContentBefore = false;
        #oEventProvider = new EventProvider();
        #aBindings = [];
        #aDoables = [];
        #ShellModel = null;

        // Expose Enums
        ShellArea = ShellArea;

        constructor () {
            this.#init();
        }

        #init () {
            this.#ShellModel = ShellModel.getModel();

            [
                this.#ShellModel.bindProperty("/sideNavigation/visible"),
                this.#ShellModel.bindProperty("/sidePane/visible"),
                this.#ShellModel.bindProperty("/toolArea/visible")
            ].forEach((oBinding) => {
                oBinding.attachChange(() => {
                    this.#handleAdjacentSideContentBeforeMainChanged();
                });
                this.#aBindings.push(oBinding);
            });

            // fired when SideNavigation render mode changes on init and screen resize
            this.#aDoables.push(EventHub.on("sideNavigationModeChanged").do((sSideNavigationMode) => {
                this.#sSideNavigationMode = sSideNavigationMode;
                this.#handleAdjacentSideContentBeforeMainChanged();
            }));

            this.#bHasAdjacentContentBefore = this.hasAdjacentSideContentBeforeMain();
        }

        applyLayout (sRendererPlaceAtElementId) {
            const oRendererPlaceAtElement = document.getElementById(sRendererPlaceAtElementId);
            ShellArea.RendererRootView = sRendererPlaceAtElementId;

            // data-sap-ui-root-content
            // Controls like sap/m/App change the element styles of all parents
            // This attribute is a marker to stop changing more parents

            /* eslint-disable max-len */
            const sHTMLTemplate = [
                `<div id='${ShellArea.RootDomRef}' class='sapUshellFlexRow'>`,
                `    <div id='${ShellArea.BackgroundImage}' data-sap-ui-root-content=true></div>`,
                `    <div id='${ShellArea.WebComponents}' data-sap-ui-root-content=true></div>`,
                // the area "sapUshellPopupWithinArea" helps the WebAssistant colleagues to prevent popup overlaps (see sap.ui.core.Popup.setWithinArea)
                "    <div id='sapUshellPopupWithinArea' class='sapUshellFlexGrowShrink sapUshellFlexRow'>",
                `        <div id='${ShellArea.FloatingContainerDockStart}' class='sapUshellFloatingContainerDock' data-sap-ui-root-content=true></div>`,
                "        <div class='sapUshellFlexGrowShrink sapUshellFlexColumn'>",
                `            <div id='${ShellArea.ShellHeader}' data-sap-ui-root-content=true></div>`,
                "            <div class='sapUshellFlexGrowShrink sapUshellFlexRow'>",
                `                <div id='${ShellArea.SideNavigation}' data-sap-ui-root-content=true></div>`,
                "                <div class='sapUshellFlexGrowShrink sapUshellFlexColumn'>",
                `                    <div id='${ShellArea.SubHeader}' data-sap-ui-root-content=true></div>`,
                "                    <div class='sapUshellFlexGrowShrink sapUshellFlexRow'>",
                `                        <div id='${ShellArea.ToolArea}' class='sapUshellPositionRelative' data-sap-ui-root-content=true></div>`,
                `                        <div id='${ShellArea.SidePane}' data-sap-ui-root-content=true></div>`,
                "                        <div class='sapUshellFlexGrowShrink sapUshellFlexColumn'>",
                `                            <div id='${ShellArea.NavigationBar}' data-sap-ui-root-content=true></div>`,
                "                            <div class='sapUshellFlexGrowShrink sapUshellPositionRelative sapUshellOverflowHidden sapUshellFlexColumn'>",
                `                                <div id='${ShellArea.RendererRootView}' class='sapUshellFlexGrowShrink sapUshellPositionRelative sapUshellShell' data-sap-ui-root-content=true></div>`,
                `                                <div id='${ShellArea.FloatingActions}' data-sap-ui-root-content=true></div>`, // deprecated Renderer API
                `                                <div id='${ShellArea.RightFloatingContainer}' data-sap-ui-root-content=true></div>`,
                "                            </div>",
                "                        </div>",
                "                    </div>",
                "                </div>",
                "            </div>",
                `            <footer id='${ShellArea.Footer}' class='sapUshellPositionStatic sapMPageFooter' data-sap-ui-root-content=true></footer>`,
                "        </div>",
                `        <div id='${ShellArea.FloatingContainerDockEnd}' class='sapUshellFloatingContainerDock' data-sap-ui-root-content=true></div>`,
                `        <div id='${ShellArea.FloatingContainer}' data-sap-ui-root-content=true></div>`,
                "    </div>",
                `    <div id='${ShellArea.HelpContent}' data-sap-ui-root-content=true></div>`,
                "</div>"
            ].join("\n");
            /* eslint-enable max-len */

            const bLayoutAlreadyApplied = Object.keys(ShellArea).some((sShellArea) => {
                if (sShellArea === "RendererRootView") { // canvas might be present already
                    return false;
                }
                const sShellAreaDomRef = ShellArea[sShellArea];
                return !!document.getElementById(sShellAreaDomRef);
            });

            if (bLayoutAlreadyApplied) {
                Log.warning("Found a ShellArea element. Did not apply the layout", "sap.ushell.renderer.ShellLayout");
                return;
            }

            document.body.insertAdjacentHTML("afterbegin", `<div id='tmp'>${sHTMLTemplate}</div>`);
            const oTmpNode = document.getElementById("tmp");
            oRendererPlaceAtElement.replaceWith.apply(oRendererPlaceAtElement, Array.from(oTmpNode.childNodes));
            oTmpNode.remove();
        }

        destroyLayout () {
            const oRootDomRef = document.getElementById(ShellArea.RootDomRef);
            if (oRootDomRef) {
                document.getElementById(ShellArea.RootDomRef).remove();
            }
        }

        /**
         * @returns {boolean} whether the main content has adjacent content before it
         *
         * @since 1.137.0
         * @private
         * @experimental
         * @ui5-restricted DWS
         */
        hasAdjacentSideContentBeforeMain () {
            const bSideNavigationVisible = this.#ShellModel.getProperty("/sideNavigation/visible");
            const bSidePaneVisible = this.#ShellModel.getProperty("/sidePane/visible");
            const bToolAreaVisible = this.#ShellModel.getProperty("/toolArea/visible");

            if (bSidePaneVisible || bToolAreaVisible) {
                return true;
            }

            if (bSideNavigationVisible && this.#sSideNavigationMode === "Docked") {
                return true;
            }

            return false;
        }

        #handleAdjacentSideContentBeforeMainChanged () {
            if (this.#bHasAdjacentContentBefore !== this.hasAdjacentSideContentBeforeMain()) {
                this.#bHasAdjacentContentBefore = !this.#bHasAdjacentContentBefore;
                this.#oEventProvider.fireEvent("adjacentSideContentBeforeMainChanged", {
                    hasAdjacentContentBefore: this.#bHasAdjacentContentBefore
                });
            }
        }

        /**
         * Registers a handler for the "adjacentSideContentBeforeMainChanged" event.
         *
         * @since 1.137.0
         * @private
         * @experimental
         * @ui5-restricted DWS
         */
        attachAdjacentSideContentBeforeMainChanged (...args) {
            this.#oEventProvider.attachEvent("adjacentSideContentBeforeMainChanged", ...args);
        }

        /**
         * Registers a handler for the "adjacentSideContentBeforeMainChanged" event.
         *
         * @since 1.137.0
         * @private
         * @experimental
         * @ui5-restricted DWS
         */
        detachAdjacentSideContentBeforeMainChanged (...args) {
            this.#oEventProvider.detachEvent("adjacentSideContentBeforeMainChanged", ...args);
        }

        /**
         * Only for testing!
         * @private
         */
        reset () {
            this.#aBindings.forEach((oBinding) => {
                oBinding.destroy();
            });
            this.#aBindings = [];
            this.#aDoables.forEach((oDoable) => {
                oDoable.off();
            });
            this.#aDoables = [];
            this.#init();
        }
    }

    return new ShellLayout();
});
