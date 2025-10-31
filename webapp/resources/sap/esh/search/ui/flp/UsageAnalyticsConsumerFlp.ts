/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { AllUserEvents, UserEventType } from "../eventlogging/UserEvents";
import EventConsumer from "../eventlogging/EventConsumer";
import SuggestionType from "../suggestions/SuggestionType";
import Log from "sap/base/Log";
import Container from "sap/ushell/Container";
import { AllTechnicalEvents, TechnicalEventType } from "../eventlogging/TechnicalEvents";

/**
 * Usage Analytics Event Consumer for Fiori Launchpad
 */
export default class UsageAnalyticsConsumerFlp extends EventConsumer {
    private log = Log.getLogger("sap.esh.search.ui.eventlogging.UsageAnalyticsConsumerFlp");
    private analytics: {
        logCustomEvent: (what: string, where: string, eventDetails: Array<string>) => void;
    };
    private readonly actionPrefix = "FLP: ";
    public readonly label = "FLP";

    public async initAsync(): Promise<void> {
        if (Container) {
            this.analytics = await Container.getServiceAsync("UsageAnalytics");
        }
    }

    public logEvent(event: AllUserEvents | AllTechnicalEvents): void {
        if (!this.analytics) {
            return;
        }
        switch (event.type) {
            case UserEventType.RESULT_LIST_ITEM_NAVIGATE:
                this.analytics.logCustomEvent(`${this.actionPrefix}Search`, "Launch Object", [
                    event.targetUrl,
                ]);
                break;
            case UserEventType.RESULT_LIST_ITEM_ATTRIBUTE_NAVIGATE:
                this.analytics.logCustomEvent(`${this.actionPrefix}Search`, "Launch Object", [
                    event.targetUrl,
                ]);
                break;
            case UserEventType.SUGGESTION_SELECT:
                switch (event.suggestionType) {
                    case SuggestionType.App:
                        this.analytics.logCustomEvent(`${this.actionPrefix}Search`, "Suggestion Select App", [
                            event.suggestionTitle,
                            event.targetUrl,
                            event.searchTerm,
                        ]);
                        this.analytics.logCustomEvent(
                            `${this.actionPrefix}Application Launch point`,
                            "Search Suggestions",
                            [event.suggestionTitle, event.targetUrl, event.searchTerm]
                        );
                        break;
                    case SuggestionType.DataSource:
                        this.analytics.logCustomEvent(
                            `${this.actionPrefix}Search`,
                            "Suggestion Select Datasource",
                            [event.dataSourceKey, event.searchTerm]
                        );
                        break;
                    case SuggestionType.Object:
                        this.analytics.logCustomEvent(
                            `${this.actionPrefix}Search`,
                            "Suggestion Select Object Data",
                            [event.suggestionTerm, event.dataSourceKey, event.searchTerm]
                        );
                        break;
                    case SuggestionType.Search:
                        this.analytics.logCustomEvent(
                            `${this.actionPrefix}Search`,
                            "Suggestion Select Search",
                            [event.suggestionTitle]
                        );
                        break;
                }
                break;
            case TechnicalEventType.SEARCH_REQUEST:
                this.analytics.logCustomEvent(`${this.actionPrefix}Search`, "Search", [
                    event.searchTerm,
                    event.dataSourceKey,
                ]);
                break;
            case UserEventType.RESULT_LIST_ITEM_NAVIGATE_CONTEXT:
                this.analytics.logCustomEvent(`${this.actionPrefix}Search`, "Launch Related Object", [
                    event.targetUrl,
                ]);
                break;
            case UserEventType.SUGGESTION_REQUEST:
                this.analytics.logCustomEvent(`${this.actionPrefix}Search`, "Suggestion", [
                    event.suggestionTerm,
                    event.dataSourceKey,
                ]);
                break;
            case UserEventType.TILE_NAVIGATE:
                this.analytics.logCustomEvent(`${this.actionPrefix}Search`, "Launch App", [
                    event.tileTitle,
                    event.targetUrl,
                ]);
                this.analytics.logCustomEvent(
                    `${this.actionPrefix}Application Launch point`,
                    "Search Results",
                    [event.tileTitle, event.targetUrl]
                );
                break;
        }

        this.log.debug(`[${this.label}] Logged user event ${event.type}`);
    }

    public logTechnicalEvent(event: AllTechnicalEvents): void {
        this.logEvent(event);
    }
}
