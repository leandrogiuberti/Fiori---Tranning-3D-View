declare module "sap/cux/home/CardsPanel" {
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
import Card from "sap/ui/integration/widgets/Card";
import Event from "sap/ui/base/Event";
import { $BasePanelSettings } from "sap/cux/home/BasePanel";

    /**
     * Interface defining the settings object used in constructor calls
     */
    interface $CardsPanelSettings extends $BasePanelSettings {
        handleHidePanel?: (event: CardsPanel$HandleHidePanelEvent) => void;
        handleUnhidePanel?: (event: CardsPanel$HandleUnhidePanelEvent) => void;

        /**
         * Event is fired when cards in viewport are updated.
         */
        visibleCardsUpdated?: (event: CardsPanel$VisibleCardsUpdatedEvent) => void;
    }

    export default interface CardsPanel {

        // event: handleHidePanel

        /**
         * Attaches event handler "fn" to the "handleHidePanel" event of this "CardsPanel".
         *
         * When called, the context of the event handler (its "this") will be bound to "oListener" if specified,
         * otherwise it will be bound to this "CardsPanel" itself.
         *
         * @param fn The function to be called when the event occurs
         * @param listener Context object to call the event handler with. Defaults to this "CardsPanel" itself
         *
         * @returns Reference to "this" in order to allow method chaining
         */
        attachHandleHidePanel(fn: (event: CardsPanel$HandleHidePanelEvent) => void, listener?: object): this;

        /**
         * Attaches event handler "fn" to the "handleHidePanel" event of this "CardsPanel".
         *
         * When called, the context of the event handler (its "this") will be bound to "oListener" if specified,
         * otherwise it will be bound to this "CardsPanel" itself.
         *
         * @param data An application-specific payload object that will be passed to the event handler along with the event object when firing the event
         * @param fn The function to be called when the event occurs
         * @param listener Context object to call the event handler with. Defaults to this "CardsPanel" itself
         *
         * @returns Reference to "this" in order to allow method chaining
         */
        attachHandleHidePanel<CustomDataType extends object>(data: CustomDataType, fn: (event: CardsPanel$HandleHidePanelEvent, data: CustomDataType) => void, listener?: object): this;

        /**
         * Detaches event handler "fn" from the "handleHidePanel" event of this "CardsPanel".
         *
         * The passed function and listener object must match the ones used for event registration.
         *
         * @param fn The function to be called, when the event occurs
         * @param listener Context object on which the given function had to be called
         * @returns Reference to "this" in order to allow method chaining
         */
        detachHandleHidePanel(fn: (event: CardsPanel$HandleHidePanelEvent) => void, listener?: object): this;

        /**
         * Fires event "handleHidePanel" to attached listeners.
         *
         * @param parameters Parameters to pass along with the event
         * @returns Reference to "this" in order to allow method chaining
         */
        fireHandleHidePanel(parameters?: CardsPanel$HandleHidePanelEventParameters): this;

        // event: handleUnhidePanel

        /**
         * Attaches event handler "fn" to the "handleUnhidePanel" event of this "CardsPanel".
         *
         * When called, the context of the event handler (its "this") will be bound to "oListener" if specified,
         * otherwise it will be bound to this "CardsPanel" itself.
         *
         * @param fn The function to be called when the event occurs
         * @param listener Context object to call the event handler with. Defaults to this "CardsPanel" itself
         *
         * @returns Reference to "this" in order to allow method chaining
         */
        attachHandleUnhidePanel(fn: (event: CardsPanel$HandleUnhidePanelEvent) => void, listener?: object): this;

        /**
         * Attaches event handler "fn" to the "handleUnhidePanel" event of this "CardsPanel".
         *
         * When called, the context of the event handler (its "this") will be bound to "oListener" if specified,
         * otherwise it will be bound to this "CardsPanel" itself.
         *
         * @param data An application-specific payload object that will be passed to the event handler along with the event object when firing the event
         * @param fn The function to be called when the event occurs
         * @param listener Context object to call the event handler with. Defaults to this "CardsPanel" itself
         *
         * @returns Reference to "this" in order to allow method chaining
         */
        attachHandleUnhidePanel<CustomDataType extends object>(data: CustomDataType, fn: (event: CardsPanel$HandleUnhidePanelEvent, data: CustomDataType) => void, listener?: object): this;

        /**
         * Detaches event handler "fn" from the "handleUnhidePanel" event of this "CardsPanel".
         *
         * The passed function and listener object must match the ones used for event registration.
         *
         * @param fn The function to be called, when the event occurs
         * @param listener Context object on which the given function had to be called
         * @returns Reference to "this" in order to allow method chaining
         */
        detachHandleUnhidePanel(fn: (event: CardsPanel$HandleUnhidePanelEvent) => void, listener?: object): this;

        /**
         * Fires event "handleUnhidePanel" to attached listeners.
         *
         * @param parameters Parameters to pass along with the event
         * @returns Reference to "this" in order to allow method chaining
         */
        fireHandleUnhidePanel(parameters?: CardsPanel$HandleUnhidePanelEventParameters): this;

        // event: visibleCardsUpdated

        /**
         * Attaches event handler "fn" to the "visibleCardsUpdated" event of this "CardsPanel".
         *
         * Event is fired when cards in viewport are updated.
         *
         * When called, the context of the event handler (its "this") will be bound to "oListener" if specified,
         * otherwise it will be bound to this "CardsPanel" itself.
         *
         * @param fn The function to be called when the event occurs
         * @param listener Context object to call the event handler with. Defaults to this "CardsPanel" itself
         *
         * @returns Reference to "this" in order to allow method chaining
         */
        attachVisibleCardsUpdated(fn: (event: CardsPanel$VisibleCardsUpdatedEvent) => void, listener?: object): this;

        /**
         * Attaches event handler "fn" to the "visibleCardsUpdated" event of this "CardsPanel".
         *
         * Event is fired when cards in viewport are updated.
         *
         * When called, the context of the event handler (its "this") will be bound to "oListener" if specified,
         * otherwise it will be bound to this "CardsPanel" itself.
         *
         * @param data An application-specific payload object that will be passed to the event handler along with the event object when firing the event
         * @param fn The function to be called when the event occurs
         * @param listener Context object to call the event handler with. Defaults to this "CardsPanel" itself
         *
         * @returns Reference to "this" in order to allow method chaining
         */
        attachVisibleCardsUpdated<CustomDataType extends object>(data: CustomDataType, fn: (event: CardsPanel$VisibleCardsUpdatedEvent, data: CustomDataType) => void, listener?: object): this;

        /**
         * Detaches event handler "fn" from the "visibleCardsUpdated" event of this "CardsPanel".
         *
         * Event is fired when cards in viewport are updated.
         *
         * The passed function and listener object must match the ones used for event registration.
         *
         * @param fn The function to be called, when the event occurs
         * @param listener Context object on which the given function had to be called
         * @returns Reference to "this" in order to allow method chaining
         */
        detachVisibleCardsUpdated(fn: (event: CardsPanel$VisibleCardsUpdatedEvent) => void, listener?: object): this;

        /**
         * Fires event "visibleCardsUpdated" to attached listeners.
         *
         * Event is fired when cards in viewport are updated.
         *
         * @param parameters Parameters to pass along with the event
         * @param [mParameters.cards] Event is fired when cards in viewport are updated.
         *
         * @returns Reference to "this" in order to allow method chaining
         */
        fireVisibleCardsUpdated(parameters?: CardsPanel$VisibleCardsUpdatedEventParameters): this;
    }

    /**
     * Interface describing the parameters of CardsPanel's 'handleHidePanel' event.
     */
    // eslint-disable-next-line
    export interface CardsPanel$HandleHidePanelEventParameters {
    }

    /**
     * Interface describing the parameters of CardsPanel's 'handleUnhidePanel' event.
     */
    // eslint-disable-next-line
    export interface CardsPanel$HandleUnhidePanelEventParameters {
    }

    /**
     * Interface describing the parameters of CardsPanel's 'visibleCardsUpdated' event.
     * Event is fired when cards in viewport are updated.
     */
    export interface CardsPanel$VisibleCardsUpdatedEventParameters {
        cards?: Card[];
    }

    /**
     * Type describing the CardsPanel's 'handleHidePanel' event.
     */
    export type CardsPanel$HandleHidePanelEvent = Event<CardsPanel$HandleHidePanelEventParameters>;

    /**
     * Type describing the CardsPanel's 'handleUnhidePanel' event.
     */
    export type CardsPanel$HandleUnhidePanelEvent = Event<CardsPanel$HandleUnhidePanelEventParameters>;

    /**
     * Type describing the CardsPanel's 'visibleCardsUpdated' event.
     * Event is fired when cards in viewport are updated.
     */
    export type CardsPanel$VisibleCardsUpdatedEvent = Event<CardsPanel$VisibleCardsUpdatedEventParameters>;
}
