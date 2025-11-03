/// <reference types="openui5" />
declare module "sap/cards/ap/generator/app/handlers/FreeStyle" {
    import type Event from "sap/ui/base/Event";
    /**
     * Handles the service change event.
     *
     * @param {Event} event - The event object triggered by the service change.
     */
    function onServiceChange(event: Event): void;
    /**
     * Handles the entity set path change event.
     *
     * @param event
     */
    function onEntitySetPathChange(event: Event): Promise<void>;
    /**
     * Handles the context path change event.
     *
     * @param event
     */
    function onContextPathChange(event: Event): Promise<void>;
    /**
     * Applies the service details.
     */
    function applyServiceDetails(): Promise<void>;
    function onBackButtonPress(): void;
    export { applyServiceDetails, onBackButtonPress, onContextPathChange, onEntitySetPathChange, onServiceChange };
}
//# sourceMappingURL=FreeStyle.d.ts.map