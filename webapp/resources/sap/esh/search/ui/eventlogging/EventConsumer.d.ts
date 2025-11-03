declare module "sap/esh/search/ui/eventlogging/EventConsumer" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { AllUserEvents } from "sap/esh/search/ui/eventlogging/UserEvents";
    import { AllTechnicalEvents } from "sap/esh/search/ui/eventlogging/TechnicalEvents";
    /**
     * Abstract base class for all event consumers
     */
    export default abstract class EventConsumer {
        abstract readonly label: string;
        abstract logEvent(event: AllUserEvents): void;
        abstract logTechnicalEvent(event: AllTechnicalEvents): void;
    }
}
//# sourceMappingURL=EventConsumer.d.ts.map