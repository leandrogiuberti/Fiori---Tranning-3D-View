declare module "sap/esh/search/ui/performancelogging/PerformanceLogger" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    interface MeasuredMethodId {
        name: string;
    }
    interface PerformanceLogSummary {
        step: string;
        secFromStart: number;
        msecTotal: number;
        comments: string;
    }
    interface PerformanceLogEntry {
        type: LogEntryType;
        methodName: string;
        start: Date;
        end: Date | null;
        time: number;
        children: PerformanceLogEntry[];
        stack: string;
        parameterBag?: ParameterBag;
    }
    interface ParameterBag {
        [name: string]: string | number | boolean | null;
    }
    enum LogEntryType {
        enterMethod,
        beforeMethod
    }
    export default class PerformanceLogger {
        /**
         * Performance log data
         */
        performanceLog: Array<PerformanceLogEntry>;
        /**
         * Performance log start date
         */
        performanceLogStartDate: Date;
        constructor();
        /**
         * Get a unique Id to be used to make 'method name' unique (see enterMethod/leaveMethod)
         * @returns unique ID
         */
        getUniqueId(): number;
        /**
         * start a new step of performance logging
         * @param {*} method name a log step you want to enter
         * @param {*} parameterBag additional properties to log for this step
         */
        enterMethod(method: MeasuredMethodId, parameterBag: {
            comments?: string;
            isSearch?: boolean;
        }): void;
        /**
         * complete an open step of performance logging
         * @param {*} method name of log step to leave
         */
        leaveMethod(method: MeasuredMethodId): void;
        printLogToBrowserConsole(): void;
        getLogSummary(): PerformanceLogSummary[];
        clearPerformanceLog(): void;
    }
}
//# sourceMappingURL=PerformanceLogger.d.ts.map