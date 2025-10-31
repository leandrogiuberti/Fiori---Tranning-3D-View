/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
export default class TimeMerger {
    static counter = 0;
    private aborted = false;
    private pending: number;
    private returned: Array<unknown> = [];
    private counter: number;
    private processorCallback?: (result: Array<unknown>) => void;
    private processorNotificationSchedule?: number;

    constructor(
        readonly promiseList: Array<Promise<unknown>> = [],
        readonly timeDelay = 1000
    ) {
        this.pending = this.promiseList.length;
        this.counter = ++TimeMerger.counter;
    }

    abort(): void {
        this.aborted = true;
    }

    process(processorCallback: (result: Array<unknown>) => void): TimeMerger {
        this.processorCallback = processorCallback;
        this.start();
        return this;
    }

    start(): void {
        // register done callback for all promises
        for (let i = 0; i < this.promiseList.length; ++i) {
            const promise = this.promiseList[i];
            promise.then(this.assembleDoneCallback(), this.assembleErrorCallback());
        }
        // schedule time delayed merging of promise results
        this.scheduleProcessorNotification();
    }

    scheduleProcessorNotification(): void {
        if (this.processorNotificationSchedule) {
            window.clearTimeout(this.processorNotificationSchedule);
            this.processorNotificationSchedule = null;
        }
        this.processorNotificationSchedule = window.setTimeout(() => {
            this.notifyProcessor();
        }, this.timeDelay);
    }

    notifyProcessor(): void {
        //console.log('--notify');
        // check for abortion
        if (this.aborted) {
            return;
        }
        // notify callback if promises have returned
        if (this.returned.length > 0) {
            this.processorCallback(this.returned);
            this.returned = [];
        }
        // check if we need to schedule a new merge
        if (this.pending > 0) {
            this.scheduleProcessorNotification();
        }
    }

    assembleDoneCallback(): (result: unknown) => void {
        return (result) => {
            this.pending--;
            this.returned.push(result);
            if (this.pending === 0) {
                if (this.processorNotificationSchedule) {
                    window.clearTimeout(this.processorNotificationSchedule);
                    this.processorNotificationSchedule = null;
                }
                this.notifyProcessor();
            }
        };
    }

    assembleErrorCallback(): (error: unknown) => void {
        return (error) => {
            this.pending--;
            this.returned.push(error);
            if (this.pending === 0) {
                if (this.processorNotificationSchedule) {
                    window.clearTimeout(this.processorNotificationSchedule);
                    this.processorNotificationSchedule = null;
                }
                this.notifyProcessor();
            }
        };
    }
}
