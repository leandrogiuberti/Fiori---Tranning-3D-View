/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
export interface MeasuredMethodId {
    name: string;
}

export interface PerformanceLogSummary {
    step: string;
    secFromStart: number;
    msecTotal: number;
    comments: string;
}

export interface PerformanceLogEntry {
    type: LogEntryType;
    methodName: string;
    start: Date;
    end: Date | null;
    time: number;
    children: PerformanceLogEntry[];
    stack: string;
    parameterBag?: ParameterBag;
}

export interface ParameterBag {
    [name: string]: string | number | boolean | null;
}

export enum LogEntryType {
    enterMethod,
    beforeMethod,
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

    constructor() {
        this.performanceLog = [];
        this.performanceLogStartDate = new Date();
    }

    /**
     * Get a unique Id to be used to make 'method name' unique (see enterMethod/leaveMethod)
     * @returns unique ID
     */
    getUniqueId(): number {
        return new Date().getTime();
    }

    /**
     * start a new step of performance logging
     * @param {*} method name a log step you want to enter
     * @param {*} parameterBag additional properties to log for this step
     */

    enterMethod(method: MeasuredMethodId, parameterBag: { comments?: string; isSearch?: boolean }): void {
        this.performanceLog.push({
            type: LogEntryType.enterMethod,
            methodName: method.name,
            start: new Date(),
            end: null,
            time: -1,
            children: [],
            stack: new Error().stack
                .replace("Error: \n", "")
                .trim()
                .replace("at PerformanceLogger.newPerfEntry", "")
                .trim(),
            parameterBag: parameterBag,
        });
    }

    /**
     * complete an open step of performance logging
     * @param {*} method name of log step to leave
     */

    leaveMethod(method: MeasuredMethodId): void {
        for (const logEntry of this.performanceLog) {
            if (logEntry.methodName === method.name) {
                logEntry.end = new Date();
                logEntry.time = logEntry.end.getTime() - logEntry.start.getTime();
            }
        }
    }

    printLogToBrowserConsole(): void {
        console.table(this.getLogSummary());
    }

    getLogSummary(): PerformanceLogSummary[] {
        return this.performanceLog?.map((logEntry) => {
            let comments: string = "-";
            if (
                logEntry.parameterBag &&
                typeof logEntry.parameterBag === "object" &&
                "comments" in logEntry.parameterBag &&
                logEntry.parameterBag.comments
            ) {
                comments = String(logEntry.parameterBag.comments);
            }
            return {
                step: logEntry.methodName,
                secFromStart:
                    Math.round((logEntry.start.getTime() - this.performanceLogStartDate.getTime()) / 100) /
                    10,
                msecTotal: logEntry.time,
                comments: comments,
            };
        });
    }

    clearPerformanceLog(): void {
        this.performanceLogStartDate = new Date();
        this.performanceLog = [];
    }
}
