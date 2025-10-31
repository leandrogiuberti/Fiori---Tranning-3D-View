/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
// =======================================================================
// decorator for sequentialized execution
// =======================================================================
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function sequentializedExecution(originalFunction: Function) {
    let chainedPromise;
    return function (...args) {
        if (!chainedPromise) {
            chainedPromise = originalFunction.apply(this, args);
        } else {
            chainedPromise = chainedPromise.then(
                () => {
                    return originalFunction.apply(this, args);
                },
                () => {
                    return originalFunction.apply(this, args);
                }
            );
        }
        const promise = chainedPromise;
        promise
            .finally(() => {
                if (promise === chainedPromise) {
                    chainedPromise = null;
                }
            })
            .catch(() => {
                //dummy
            });
        return chainedPromise;
    };
}
