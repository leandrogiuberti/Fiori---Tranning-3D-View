declare module "sap/esh/search/ui/eventlogging/UsageAnalyticsConsumerSina" {
    import { Sina } from "sap/esh/search/ui/sinaNexTS/sina/Sina";
    import EventConsumer from "sap/esh/search/ui/eventlogging/EventConsumer";
    import { AllUserEvents } from "sap/esh/search/ui/eventlogging/UserEvents";
    import { AllTechnicalEvents } from "sap/esh/search/ui/eventlogging/TechnicalEvents";
    /**
     * Sina Usage Analytics Event Consumer.
     * Currently implementations are only available for abap_odata and InAV2 providers.
     * It is up to other sina providers to implement the logUserEvent method.
     */
    export default class UsageAnalyticsConsumerSina extends EventConsumer {
        private readonly sinaNext;
        readonly label = "sina";
        private isLoggingEnabled;
        private log;
        constructor(sinaNext: Sina);
        initAsync(): Promise<void>;
        logEvent(event: AllUserEvents | AllTechnicalEvents): void;
        logTechnicalEvent(event: AllTechnicalEvents): void;
    }
}
//# sourceMappingURL=UsageAnalyticsConsumerSina.d.ts.map