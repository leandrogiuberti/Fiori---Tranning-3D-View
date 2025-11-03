declare module "sap/esh/search/ui/SearchUtil" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    function forwardEllipsis4Whyfound(domref: HTMLElement): void;
    class PeriodicRetry {
        private interval;
        private maxRetries;
        private action;
        private timeout;
        constructor(options: {
            interval: number;
            maxRetries: number;
            action: () => boolean;
        });
        doRun(retries: number): void;
        run(): void;
    }
    class StateWatcher<STATE> {
        compareStates: (s1: STATE, s2: STATE) => boolean;
        getState: () => STATE;
        changed: (state: STATE, oldState: STATE) => void;
        interval: number;
        checkMode: boolean;
        state: STATE;
        checkState: STATE;
        constructor(props: {
            compareStates: (s1: STATE, s2: STATE) => boolean;
            getState: () => STATE;
            changed: (state: STATE, oldState: STATE) => void;
            interval?: number;
        });
        start(): void;
        checkStateChange(): void;
    }
}
//# sourceMappingURL=SearchUtil.d.ts.map