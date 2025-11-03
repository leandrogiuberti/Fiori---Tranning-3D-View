/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import Log from "sap/base/Log";
import UsageAnalyticsConsumerSina from "sap/esh/search/ui/eventlogging/UsageAnalyticsConsumerSina";
import UsageAnalyticsConsumerFlp from "sap/esh/search/ui/flp/UsageAnalyticsConsumerFlp";
import { Sina } from "../sinaNexTS/sina/Sina";
import { AllUserEvents } from "./UserEvents";
import EventConsumer from "./EventConsumer";
import SearchModel from "../SearchModel";
import { AllTechnicalEvents } from "./TechnicalEvents";
/**
 * EventLogger is responsible for logging user and technical events.
 * It manages a list of event consumers that handle the actual logging.
 * It also provides methods to log user and technical events.
 */
export default class EventLogger {
    public consumers: EventConsumer[] = [];
    private searchModel: SearchModel;
    private sinaNext: Sina;
    private log = Log.getLogger("sap.esh.search.ui.eventlogging.EventLogger");
    private static userEventNumber = 0;
    private static technicalEventNumber = 0;
    private static sessionId: string = new Date().getTime().toString();

    constructor(properties: {
        searchModel: SearchModel;
        sinaNext: Sina;
        eventConsumers: Array<EventConsumer>;
    }) {
        this.searchModel = properties.searchModel;
        this.sinaNext = properties.sinaNext;
        for (const consumer of properties.eventConsumers) {
            this.addConsumer(consumer);
        }
    }

    /**
     * Async initialization of "internal" event consumers sina and flp
     */
    public async initAsync(): Promise<void> {
        try {
            if (this.searchModel.config.isUshell) {
                const consumerFlp = new UsageAnalyticsConsumerFlp();
                await consumerFlp.initAsync();
                this.addConsumer(consumerFlp);
            }
        } catch (e) {
            this.log.debug("Couldn't initialize flp user event consumer", e);
        }
        try {
            const sinaConsumer = new UsageAnalyticsConsumerSina(this.sinaNext);
            await sinaConsumer.initAsync();
            this.addConsumer(sinaConsumer);
        } catch (e) {
            this.log.debug("Couldn't initialize sina user event consumer", e);
        }
    }

    public addConsumer(consumer: EventConsumer): void {
        this.consumers.push(consumer);
        this.log.debug(`[${consumer.label}] Event consumer added`);
    }

    public setConsumers(consumers: EventConsumer[]): void {
        for (const consumer of consumers) {
            this.addConsumer(consumer);
        }
    }

    /**
     * Logs an event triggered by a real user.
     * @param event - the user event to log
     */
    public logEvent(event: AllUserEvents): void {
        event.sessionId = EventLogger.sessionId;
        event.timeStamp = event.timeStamp ?? new Date().getTime().toString();
        event.eventNumber = EventLogger.userEventNumber++;
        for (let i = 0; i < this.consumers.length; ++i) {
            const consumer = this.consumers[i];
            try {
                consumer.logEvent(event);
                this.log.debug(
                    `[${event.eventNumber}|${event.sessionId}|${consumer.label}] Logged user event ${event.type} - payload ${JSON.stringify(
                        event,
                        null,
                        2
                    )}`
                );
            } catch (err) {
                this.log.debug(
                    `[${consumer.label}] Error while logging user event ${event.type}`,
                    err.stack || err
                );
            }
        }
    }

    /**
     * Logs a technical event which are rather technical in nature and not directly triggered by a user.
     * @param event - the technical event to log
     */
    public logTechnicalEvent(event: AllTechnicalEvents): void {
        event.sessionId = EventLogger.sessionId;
        event.timeStamp = event.timeStamp ?? new Date().getTime().toString();
        event.eventNumber = EventLogger.technicalEventNumber++;
        for (let i = 0; i < this.consumers.length; ++i) {
            const consumer = this.consumers[i];
            try {
                if (typeof consumer.logTechnicalEvent === "function") {
                    consumer.logTechnicalEvent(event);
                    this.log.debug(
                        `[${event.eventNumber}|${event.sessionId}|${consumer.label}] Logged technical event ${event.type} - payload ${JSON.stringify(
                            event,
                            null,
                            2
                        )}`
                    );
                } else {
                    // Fallback to logEvent() for backward compatibility
                    // This will be removed in the future, so consumers should implement logTechnicalEvent()
                    // to continue receiving technical events
                    consumer.logEvent(event as unknown as AllUserEvents);
                    this.log.debug(
                        `[${event.eventNumber}|${event.sessionId}|${consumer.label}] WARNING: event ${event.type} will soon be removed from logEvent() callback, implement logTechnicalEvent() callback in your event consumer to continue receiving this event`
                    );
                }
            } catch (err) {
                this.log.debug(
                    `[${consumer.label}] Error while logging technical event ${event.type}`,
                    err.stack || err
                );
            }
        }
    }
}
