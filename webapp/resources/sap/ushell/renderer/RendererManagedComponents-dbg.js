// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
/**
 * @fileOverview
 * This module contains the list of renderer managed components for the SAP Fiori renderer.
 */

sap.ui.define([
    "sap/ushell/Config"
], (
    Config
) => {
    "use strict";

    /**
     * A type definition for the renderer managed components.
     * @typedef {object} sap.ushell.renderer.RendererManagedComponents
     * @property {string} id The unique identifier of the renderer managed component.
     * @property {string} [componentName] The name of the component managed by the renderer.
     * @property {string} [componentInstanceId] The instance id of the component managed by the renderer.
     * @property {sap.ushell.renderer.RendererManagedComponents.ComponentCategory} [category] The category of the component managed by the renderer.
     * @since 1.139.0
     *
     */

    /**
     * @alias sap.ushell.renderer.RendererManagedComponents.ComponentCategory
     * @enum {string}
     *
     * @since 1.141.0
     * @private
     */
    const ComponentCategory = {
        /**
         * Category for components that are part of the home page.
         */
        Home: "Home",

        /**
         * Category for components that are part of the app discovery (app finder or content finder).
         */
        AppDiscovery: "AppDiscovery"
    };

    /**
     * @class
     * @classdesc Class for renderer managed components.
     * This class provides methods to manage the array of renderer managed components
     * It will provide the default values for the component names, instance ids, and ids.
     *
     * @since 1.139.0
     * @private
     */
    class RendererManagedComponents {
        /**
         * The list of renderer managed components
         * It will be completed with default values.
         * @type {sap.ushell.renderer.RendererManagedComponents[]}
         * @private
         * @since 1.139.0
         */
        #aRendererManagedComponents;

        constructor () {
            this.#init();
        }

        #init () {
            this.#aRendererManagedComponents = [
                {
                    id: "home",
                    componentName: "sap.ushell.components.homepage",
                    componentInstanceId: "Shell-home-component",
                    category: ComponentCategory.Home
                },
                {
                    id: "pages",
                    componentName: "sap.ushell.components.pages",
                    componentInstanceId: "pages-component",
                    category: ComponentCategory.Home
                },
                {
                    id: "workPageRuntime",
                    componentName: "sap.ushell.components.workPageRuntime",
                    componentInstanceId: "workPageRuntime-component",
                    category: ComponentCategory.Home
                },
                {
                    id: "appFinder",
                    componentName: "sap.ushell.components.appfinder",
                    componentInstanceId: "Shell-appfinder-component",
                    category: ComponentCategory.AppDiscovery
                },
                {
                    id: "contentFinder",
                    componentName: "sap.ushell.components.contentFinderStandalone",
                    componentInstanceId: "Shell-appfinder-component",
                    category: ComponentCategory.AppDiscovery
                },
                {
                    // e.g. the error view, "regular" home apps are always wrapped,
                    // but still should evaluate to true
                    id: "homeApp",
                    componentName: Config.last("/core/homeApp/component")?.name,
                    componentInstanceId: "homeApp-component", // error is prefixed with renderer id but home apps are not
                    category: ComponentCategory.Home
                },
                {
                    id: "runtimeSwitcher",
                    componentName: "sap.ushell.components.runtimeSwitcher",
                    componentInstanceId: "runtimeSwitcher-component",
                    category: ComponentCategory.Home
                },
                {
                    id: "homeAppComponentWrapper",
                    componentName: "sap.ushell.renderer.rendererTargetWrapper",
                    componentInstanceId: "homeApp-component-wrapper",
                    category: ComponentCategory.Home
                },
                {
                    id: "ShellBar",
                    componentName: "sap.ushell.components.shell.ShellBar",
                    componentInstanceId: null, // id is unstable, as it is not created by the renderer
                    category: null // ShellBar is not managed by the Renderer explicitly it is only created as a side effect
                }
            ];
        }

        // Expose enum
        ComponentCategory = ComponentCategory;

        /**
         * Returns true if the component name is managed by the renderer.
         * @param {string|null} [sComponentName] The component name to check.
         *
         * @returns {boolean} True if the FLP name is managed by the renderer, false otherwise.
         *
         * @private
         * @since 1.139.0
         */
        isManagedComponentName (sComponentName) {
            if (!sComponentName) {
                return false;
            }

            return this.#aRendererManagedComponents.some((oComponent) => oComponent.componentName === sComponentName);
        }

        /**
         * Returns true is component instance id is managed by the renderer.
         * @param {sap.ui.core.Component|sap.ui.core.ComponentContainer} vComponentOrContainer The component or component container to check.
         * @param {string[]} [aCategory] Optional array of category to filter the managed components. By default no filtering is applied.
         *
         * @returns {boolean} True if the component instance id is managed by the renderer, false otherwise.
         *
         * @private
         * @since 1.139.0
         */
        isManagedComponentInstance (vComponentOrContainer, aCategory = []) {
            let oComponentInstance;
            if (vComponentOrContainer.isA("sap.ui.core.ComponentContainer")) {
                oComponentInstance = vComponentOrContainer.getComponentInstance();
            } else if (vComponentOrContainer.isA("sap.ui.core.Component")) {
                oComponentInstance = vComponentOrContainer;
            }

            if (!oComponentInstance) {
                return false;
            }

            return this.#aRendererManagedComponents
                .filter((oComponentData) => {
                    if (!aCategory.length) {
                        return true; // no category filtering
                    }
                    return aCategory.includes(oComponentData.category);
                })
                .some((oComponentData) => {
                    return oComponentInstance.getId().endsWith(oComponentData.componentInstanceId);
                });
        }

        /**
         * Only for testing.
         *
         * @since 1.141.0
         * @private
         */
        reset () {
            this.#init();
        }
    }

    return new RendererManagedComponents();
});
