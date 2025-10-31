/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
// import UsageAnalyticsConsumer from "sap/esh/search/ui/eventlogging/UsageAnalyticsConsumer";

// export default class UsageAnalyticsConsumerDwc extends UsageAnalyticsConsumer {
//     // =======================================================================
//     //  Usage Analytics Event Consumer --- DSP
//     // =======================================================================

//     analytics: any; // dummy

//     public init(properties: any): void {
//         if (typeof properties.usageCollectionService === "object") {
//             // see DSP, ShellUsageCollectionService.ts / ShellContainer.SERVICES.usageCollection
//             const analyticsService = {
//                 logCustomEvent: function (what, where, eventList) {
//                     properties.usageCollectionService?.recordAction({
//                         action: `${what} --- ${where}`,
//                         feature: "repositoryexplorer", // see DWCFeature
//                         eventtype: "click", // see EventType
//                         options: [
//                             {
//                                 param: "eventList",
//                                 value: eventList.toString(),
//                             },
//                         ],
//                     });
//                 },
//             };
//             this.analytics = analyticsService;
//             this.actionPrefix = "Search UI: ";
//         }
//     }
// }
//# sourceMappingURL=UsageAnalyticsConsumerDwc-dbg.js.map
