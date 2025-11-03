declare module "sap/esh/search/ui/suggestions/TimeMerger" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    export default class TimeMerger {
        readonly promiseList: Array<Promise<unknown>>;
        readonly timeDelay: number;
        static counter: number;
        private aborted;
        private pending;
        private returned;
        private counter;
        private processorCallback?;
        private processorNotificationSchedule?;
        constructor(promiseList?: Array<Promise<unknown>>, timeDelay?: number);
        abort(): void;
        process(processorCallback: (result: Array<unknown>) => void): TimeMerger;
        start(): void;
        scheduleProcessorNotification(): void;
        notifyProcessor(): void;
        assembleDoneCallback(): (result: unknown) => void;
        assembleErrorCallback(): (error: unknown) => void;
    }
}
//# sourceMappingURL=TimeMerger.d.ts.map