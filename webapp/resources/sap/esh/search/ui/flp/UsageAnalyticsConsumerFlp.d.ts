declare module "sap/esh/search/ui/flp/UsageAnalyticsConsumerFlp" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { AllUserEvents } from "sap/esh/search/ui/eventlogging/UserEvents";
    import EventConsumer from "sap/esh/search/ui/eventlogging/EventConsumer";
    import { AllTechnicalEvents } from "sap/esh/search/ui/eventlogging/TechnicalEvents";
    /**
     * Usage Analytics Event Consumer for Fiori Launchpad
     */
    export default class UsageAnalyticsConsumerFlp extends EventConsumer {
        private log;
        private analytics;
        private readonly actionPrefix;
        readonly label = "FLP";
        initAsync(): Promise<void>;
        logEvent(event: AllUserEvents | AllTechnicalEvents): void;
        logTechnicalEvent(event: AllTechnicalEvents): void;
    }
}
//# sourceMappingURL=UsageAnalyticsConsumerFlp.d.ts.map