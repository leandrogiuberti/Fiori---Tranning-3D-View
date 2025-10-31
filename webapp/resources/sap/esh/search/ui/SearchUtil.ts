/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
// =======================================================================
// emphasize whyfound in case of ellipsis
// =======================================================================
// this function is obsolete and should only kept for backward compatibility in 1.139
// TODO: remove after 1.139
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function forwardEllipsis4Whyfound(domref: HTMLElement): void {
    return null;
}

export class PeriodicRetry {
    private interval: number;
    private maxRetries: number;
    private action: () => boolean;

    private timeout: number | undefined = undefined;

    constructor(options: { interval: number; maxRetries: number; action: () => boolean }) {
        this.interval = options.interval;
        this.maxRetries = options.maxRetries;
        this.action = options.action;
    }

    doRun(retries: number): void {
        const success = this.action();
        if (success) {
            return;
        }
        if (retries <= 1) {
            return;
        }
        this.timeout = window.setTimeout(() => {
            this.timeout = undefined;
            this.doRun(retries - 1);
        }, this.interval);
    }

    run(): void {
        if (this.timeout) {
            return; // already running
        }
        this.doRun(this.maxRetries);
    }
}

export class StateWatcher<STATE> {
    // service functions passed from outside
    compareStates: (s1: STATE, s2: STATE) => boolean;
    getState: () => STATE;
    changed: (state: STATE, oldState: STATE) => void;
    // check interval
    interval: number;
    // internal
    checkMode: boolean = false;
    state: STATE;
    checkState: STATE;
    constructor(props: {
        compareStates: (s1: STATE, s2: STATE) => boolean;
        getState: () => STATE;
        changed: (state: STATE, oldState: STATE) => void;
        interval?: number;
    }) {
        this.compareStates = props.compareStates;
        this.getState = props.getState;
        this.changed = props.changed;
        this.interval = props.interval ?? 100;
    }
    start() {
        setInterval(this.checkStateChange.bind(this), this.interval);
    }
    checkStateChange(): void {
        const currentState = this.getState();
        if (!this.checkMode) {
            if (!this.state || !this.compareStates(currentState, this.state)) {
                // in case the state differs, we enter a special check mode and notify the subscriber only in case the new state is stable
                this.checkMode = true;
                this.checkState = currentState;
            }
        } else {
            if (this.compareStates(currentState, this.checkState)) {
                this.changed(currentState, this.state);
                this.state = currentState;
            }
            this.checkMode = false;
        }
    }
}
