/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
/**
 * Base interface for all event types in the Event Logging system.
 * This interface defines the common properties that all events will have.
 * It is used as a base for both user and technical events.
 */
export interface Event {
    eventNumber?: number; // counter will be incremented for each event by EventLogger.logEvent()
    sessionId?: string;
    timeStamp?: string; // ina needs 'string'
}
