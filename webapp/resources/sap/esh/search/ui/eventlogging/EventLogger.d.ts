declare module "sap/esh/search/ui/eventlogging/EventLogger" {
    import { Sina } from "sap/esh/search/ui/sinaNexTS/sina/Sina";
    import { AllUserEvents } from "sap/esh/search/ui/eventlogging/UserEvents";
    import EventConsumer from "sap/esh/search/ui/eventlogging/EventConsumer";
    import SearchModel from "sap/esh/search/ui/SearchModel";
    import { AllTechnicalEvents } from "sap/esh/search/ui/eventlogging/TechnicalEvents";
    /**
     * EventLogger is responsible for logging user and technical events.
     * It manages a list of event consumers that handle the actual logging.
     * It also provides methods to log user and technical events.
     */
    export default class EventLogger {
        consumers: EventConsumer[];
        private searchModel;
        private sinaNext;
        private log;
        private static userEventNumber;
        private static technicalEventNumber;
        private static sessionId;
        constructor(properties: {
            searchModel: SearchModel;
            sinaNext: Sina;
            eventConsumers: Array<EventConsumer>;
        });
        /**
         * Async initialization of "internal" event consumers sina and flp
         */
        initAsync(): Promise<void>;
        addConsumer(consumer: EventConsumer): void;
        setConsumers(consumers: EventConsumer[]): void;
        /**
         * Logs an event triggered by a real user.
         * @param event - the user event to log
         */
        logEvent(event: AllUserEvents): void;
        /**
         * Logs a technical event which are rather technical in nature and not directly triggered by a user.
         * @param event - the technical event to log
         */
        logTechnicalEvent(event: AllTechnicalEvents): void;
    }
}
//# sourceMappingURL=EventLogger.d.ts.map