declare module "sap/cux/home/SpaceInsightsPanel" {
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
import Event from "sap/ui/base/Event";
import { PropertyBindingInfo } from "sap/ui/base/ManagedObject";
import { $BasePanelSettings } from "sap/cux/home/BasePanel";

    /**
     * Interface defining the settings object used in constructor calls
     */
    interface $SpaceInsightsPanelSettings extends $BasePanelSettings {

        /**
         * Specifies the space whose apps should be loaded.
         */
        spaceId?: string | PropertyBindingInfo;

        /**
         * Title for the tiles panel
         */
        title?: string | PropertyBindingInfo;
        handleHidePanel?: (event: SpaceInsightsPanel$HandleHidePanelEvent) => void;
        handleUnhidePanel?: (event: SpaceInsightsPanel$HandleUnhidePanelEvent) => void;
    }

    export default interface SpaceInsightsPanel {

        // property: spaceId

        /**
         * Gets current value of property "spaceId".
         *
         * Specifies the space whose apps should be loaded.
         *
         * Default value is: ""
         * @returns Value of property "spaceId"
         */
        getSpaceId(): string;

        /**
         * Sets a new value for property "spaceId".
         *
         * Specifies the space whose apps should be loaded.
         *
         * When called with a value of "null" or "undefined", the default value of the property will be restored.
         *
         * Default value is: ""
         * @param [spaceId=""] New value for property "spaceId"
         * @returns Reference to "this" in order to allow method chaining
         */
        setSpaceId(spaceId: string): this;

        // property: title

        /**
         * Gets current value of property "title".
         *
         * Title for the tiles panel
         *
         * Default value is: ""
         * @returns Value of property "title"
         */
        getTitle(): string;

        /**
         * Sets a new value for property "title".
         *
         * Title for the tiles panel
         *
         * When called with a value of "null" or "undefined", the default value of the property will be restored.
         *
         * Default value is: ""
         * @param [title=""] New value for property "title"
         * @returns Reference to "this" in order to allow method chaining
         */
        setTitle(title: string): this;

        // event: handleHidePanel

        /**
         * Attaches event handler "fn" to the "handleHidePanel" event of this "SpaceInsightsPanel".
         *
         * When called, the context of the event handler (its "this") will be bound to "oListener" if specified,
         * otherwise it will be bound to this "SpaceInsightsPanel" itself.
         *
         * @param fn The function to be called when the event occurs
         * @param listener Context object to call the event handler with. Defaults to this "SpaceInsightsPanel" itself
         *
         * @returns Reference to "this" in order to allow method chaining
         */
        attachHandleHidePanel(fn: (event: SpaceInsightsPanel$HandleHidePanelEvent) => void, listener?: object): this;

        /**
         * Attaches event handler "fn" to the "handleHidePanel" event of this "SpaceInsightsPanel".
         *
         * When called, the context of the event handler (its "this") will be bound to "oListener" if specified,
         * otherwise it will be bound to this "SpaceInsightsPanel" itself.
         *
         * @param data An application-specific payload object that will be passed to the event handler along with the event object when firing the event
         * @param fn The function to be called when the event occurs
         * @param listener Context object to call the event handler with. Defaults to this "SpaceInsightsPanel" itself
         *
         * @returns Reference to "this" in order to allow method chaining
         */
        attachHandleHidePanel<CustomDataType extends object>(data: CustomDataType, fn: (event: SpaceInsightsPanel$HandleHidePanelEvent, data: CustomDataType) => void, listener?: object): this;

        /**
         * Detaches event handler "fn" from the "handleHidePanel" event of this "SpaceInsightsPanel".
         *
         * The passed function and listener object must match the ones used for event registration.
         *
         * @param fn The function to be called, when the event occurs
         * @param listener Context object on which the given function had to be called
         * @returns Reference to "this" in order to allow method chaining
         */
        detachHandleHidePanel(fn: (event: SpaceInsightsPanel$HandleHidePanelEvent) => void, listener?: object): this;

        /**
         * Fires event "handleHidePanel" to attached listeners.
         *
         * @param parameters Parameters to pass along with the event
         * @returns Reference to "this" in order to allow method chaining
         */
        fireHandleHidePanel(parameters?: SpaceInsightsPanel$HandleHidePanelEventParameters): this;

        // event: handleUnhidePanel

        /**
         * Attaches event handler "fn" to the "handleUnhidePanel" event of this "SpaceInsightsPanel".
         *
         * When called, the context of the event handler (its "this") will be bound to "oListener" if specified,
         * otherwise it will be bound to this "SpaceInsightsPanel" itself.
         *
         * @param fn The function to be called when the event occurs
         * @param listener Context object to call the event handler with. Defaults to this "SpaceInsightsPanel" itself
         *
         * @returns Reference to "this" in order to allow method chaining
         */
        attachHandleUnhidePanel(fn: (event: SpaceInsightsPanel$HandleUnhidePanelEvent) => void, listener?: object): this;

        /**
         * Attaches event handler "fn" to the "handleUnhidePanel" event of this "SpaceInsightsPanel".
         *
         * When called, the context of the event handler (its "this") will be bound to "oListener" if specified,
         * otherwise it will be bound to this "SpaceInsightsPanel" itself.
         *
         * @param data An application-specific payload object that will be passed to the event handler along with the event object when firing the event
         * @param fn The function to be called when the event occurs
         * @param listener Context object to call the event handler with. Defaults to this "SpaceInsightsPanel" itself
         *
         * @returns Reference to "this" in order to allow method chaining
         */
        attachHandleUnhidePanel<CustomDataType extends object>(data: CustomDataType, fn: (event: SpaceInsightsPanel$HandleUnhidePanelEvent, data: CustomDataType) => void, listener?: object): this;

        /**
         * Detaches event handler "fn" from the "handleUnhidePanel" event of this "SpaceInsightsPanel".
         *
         * The passed function and listener object must match the ones used for event registration.
         *
         * @param fn The function to be called, when the event occurs
         * @param listener Context object on which the given function had to be called
         * @returns Reference to "this" in order to allow method chaining
         */
        detachHandleUnhidePanel(fn: (event: SpaceInsightsPanel$HandleUnhidePanelEvent) => void, listener?: object): this;

        /**
         * Fires event "handleUnhidePanel" to attached listeners.
         *
         * @param parameters Parameters to pass along with the event
         * @returns Reference to "this" in order to allow method chaining
         */
        fireHandleUnhidePanel(parameters?: SpaceInsightsPanel$HandleUnhidePanelEventParameters): this;
    }

    /**
     * Interface describing the parameters of SpaceInsightsPanel's 'handleHidePanel' event.
     */
    // eslint-disable-next-line
    export interface SpaceInsightsPanel$HandleHidePanelEventParameters {
    }

    /**
     * Interface describing the parameters of SpaceInsightsPanel's 'handleUnhidePanel' event.
     */
    // eslint-disable-next-line
    export interface SpaceInsightsPanel$HandleUnhidePanelEventParameters {
    }

    /**
     * Type describing the SpaceInsightsPanel's 'handleHidePanel' event.
     */
    export type SpaceInsightsPanel$HandleHidePanelEvent = Event<SpaceInsightsPanel$HandleHidePanelEventParameters>;

    /**
     * Type describing the SpaceInsightsPanel's 'handleUnhidePanel' event.
     */
    export type SpaceInsightsPanel$HandleUnhidePanelEvent = Event<SpaceInsightsPanel$HandleUnhidePanelEventParameters>;
}
