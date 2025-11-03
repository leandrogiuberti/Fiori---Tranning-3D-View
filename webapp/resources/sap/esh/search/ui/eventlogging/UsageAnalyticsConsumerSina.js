/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["sap/base/Log","./EventConsumer"],function(e,s){"use strict";function n(e){return e&&e.__esModule&&typeof e.default!=="undefined"?e.default:e}const i=n(s);class t extends i{label="sina";isLoggingEnabled=false;log=e.getLogger("sap.esh.search.ui.eventlogging.UsageAnalyticsConsumerSina");constructor(e){super();this.sinaNext=e}async initAsync(){const e=await this.sinaNext.getConfigurationAsync();if(e.personalizedSearch){this.isLoggingEnabled=true;this.log.debug("sina usage analytics consumer is enabled")}else{this.log.debug("sina usage analytics consumer is disabled")}}logEvent(e){if(this.isLoggingEnabled){this.sinaNext.logUserEvent(e);this.log.debug(`[${this.label}] Logged event ${e.type}`)}}logTechnicalEvent(e){this.logEvent(e)}}return t});
//# sourceMappingURL=UsageAnalyticsConsumerSina.js.map