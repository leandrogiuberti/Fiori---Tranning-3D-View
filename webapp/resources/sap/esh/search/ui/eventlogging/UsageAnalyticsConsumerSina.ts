/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import Log from "sap/base/Log";
import { Sina } from "../sinaNexTS/sina/Sina";
import EventConsumer from "./EventConsumer";
import { AllUserEvents } from "./UserEvents";
import { AllTechnicalEvents } from "./TechnicalEvents";

/**
 * Sina Usage Analytics Event Consumer.
 * Currently implementations are only available for abap_odata and InAV2 providers.
 * It is up to other sina providers to implement the logUserEvent method.
 */
export default class UsageAnalyticsConsumerSina extends EventConsumer {
    public readonly label = "sina";
    private isLoggingEnabled = false;
    private log = Log.getLogger("sap.esh.search.ui.eventlogging.UsageAnalyticsConsumerSina");

    constructor(private readonly sinaNext: Sina) {
        super();
    }

    async initAsync(): Promise<void> {
        const sinaConfig = await this.sinaNext.getConfigurationAsync();
        if (sinaConfig.personalizedSearch) {
            this.isLoggingEnabled = true;
            this.log.debug("sina usage analytics consumer is enabled");
        } else {
            this.log.debug("sina usage analytics consumer is disabled");
        }
    }

    public logEvent(event: AllUserEvents | AllTechnicalEvents): void {
        if (this.isLoggingEnabled) {
            this.sinaNext.logUserEvent(event);
            this.log.debug(`[${this.label}] Logged event ${event.type}`);
        }
    }

    public logTechnicalEvent(event: AllTechnicalEvents): void {
        this.logEvent(event);
    }
}
