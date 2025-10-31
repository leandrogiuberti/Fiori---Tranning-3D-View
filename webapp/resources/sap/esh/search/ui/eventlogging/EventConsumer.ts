/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { AllUserEvents } from "./UserEvents";
import { AllTechnicalEvents } from "./TechnicalEvents";

/**
 * Abstract base class for all event consumers
 */
export default abstract class EventConsumer {
    abstract readonly label: string;
    abstract logEvent(event: AllUserEvents): void;
    abstract logTechnicalEvent(event: AllTechnicalEvents): void;
}
