/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["sap/base/Log", "./EventConsumer"], function (Log, __EventConsumer) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const EventConsumer = _interopRequireDefault(__EventConsumer);
  /**
   * Sina Usage Analytics Event Consumer.
   * Currently implementations are only available for abap_odata and InAV2 providers.
   * It is up to other sina providers to implement the logUserEvent method.
   */
  class UsageAnalyticsConsumerSina extends EventConsumer {
    label = "sina";
    isLoggingEnabled = false;
    log = Log.getLogger("sap.esh.search.ui.eventlogging.UsageAnalyticsConsumerSina");
    constructor(sinaNext) {
      super();
      this.sinaNext = sinaNext;
    }
    async initAsync() {
      const sinaConfig = await this.sinaNext.getConfigurationAsync();
      if (sinaConfig.personalizedSearch) {
        this.isLoggingEnabled = true;
        this.log.debug("sina usage analytics consumer is enabled");
      } else {
        this.log.debug("sina usage analytics consumer is disabled");
      }
    }
    logEvent(event) {
      if (this.isLoggingEnabled) {
        this.sinaNext.logUserEvent(event);
        this.log.debug(`[${this.label}] Logged event ${event.type}`);
      }
    }
    logTechnicalEvent(event) {
      this.logEvent(event);
    }
  }
  return UsageAnalyticsConsumerSina;
});
//# sourceMappingURL=UsageAnalyticsConsumerSina-dbg.js.map
