/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["sap/base/Log", "sap/esh/search/ui/eventlogging/UsageAnalyticsConsumerSina", "sap/esh/search/ui/flp/UsageAnalyticsConsumerFlp"], function (Log, UsageAnalyticsConsumerSina, UsageAnalyticsConsumerFlp) {
  "use strict";

  /**
   * EventLogger is responsible for logging user and technical events.
   * It manages a list of event consumers that handle the actual logging.
   * It also provides methods to log user and technical events.
   */
  class EventLogger {
    consumers = [];
    searchModel;
    sinaNext;
    log = Log.getLogger("sap.esh.search.ui.eventlogging.EventLogger");
    static userEventNumber = 0;
    static technicalEventNumber = 0;
    static sessionId = new Date().getTime().toString();
    constructor(properties) {
      this.searchModel = properties.searchModel;
      this.sinaNext = properties.sinaNext;
      for (const consumer of properties.eventConsumers) {
        this.addConsumer(consumer);
      }
    }

    /**
     * Async initialization of "internal" event consumers sina and flp
     */
    async initAsync() {
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
    addConsumer(consumer) {
      this.consumers.push(consumer);
      this.log.debug(`[${consumer.label}] Event consumer added`);
    }
    setConsumers(consumers) {
      for (const consumer of consumers) {
        this.addConsumer(consumer);
      }
    }

    /**
     * Logs an event triggered by a real user.
     * @param event - the user event to log
     */
    logEvent(event) {
      event.sessionId = EventLogger.sessionId;
      event.timeStamp = event.timeStamp ?? new Date().getTime().toString();
      event.eventNumber = EventLogger.userEventNumber++;
      for (let i = 0; i < this.consumers.length; ++i) {
        const consumer = this.consumers[i];
        try {
          consumer.logEvent(event);
          this.log.debug(`[${event.eventNumber}|${event.sessionId}|${consumer.label}] Logged user event ${event.type} - payload ${JSON.stringify(event, null, 2)}`);
        } catch (err) {
          this.log.debug(`[${consumer.label}] Error while logging user event ${event.type}`, err.stack || err);
        }
      }
    }

    /**
     * Logs a technical event which are rather technical in nature and not directly triggered by a user.
     * @param event - the technical event to log
     */
    logTechnicalEvent(event) {
      event.sessionId = EventLogger.sessionId;
      event.timeStamp = event.timeStamp ?? new Date().getTime().toString();
      event.eventNumber = EventLogger.technicalEventNumber++;
      for (let i = 0; i < this.consumers.length; ++i) {
        const consumer = this.consumers[i];
        try {
          if (typeof consumer.logTechnicalEvent === "function") {
            consumer.logTechnicalEvent(event);
            this.log.debug(`[${event.eventNumber}|${event.sessionId}|${consumer.label}] Logged technical event ${event.type} - payload ${JSON.stringify(event, null, 2)}`);
          } else {
            // Fallback to logEvent() for backward compatibility
            // This will be removed in the future, so consumers should implement logTechnicalEvent()
            // to continue receiving technical events
            consumer.logEvent(event);
            this.log.debug(`[${event.eventNumber}|${event.sessionId}|${consumer.label}] WARNING: event ${event.type} will soon be removed from logEvent() callback, implement logTechnicalEvent() callback in your event consumer to continue receiving this event`);
          }
        } catch (err) {
          this.log.debug(`[${consumer.label}] Error while logging technical event ${event.type}`, err.stack || err);
        }
      }
    }
  }
  return EventLogger;
});
//# sourceMappingURL=EventLogger-dbg.js.map
