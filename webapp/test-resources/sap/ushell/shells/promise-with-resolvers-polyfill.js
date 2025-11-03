// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

// Temporary workaround until we upgrade docker images for selenium to not use chrome 94

if (typeof Promise.withResolvers === "undefined") {
    Promise.withResolvers = function () {
        "use strict";
        let resolve;
        let reject;
        const promise = new Promise((res, rej) => {
            resolve = res;
            reject = rej;
        });

        return {
            promise,
            resolve,
            reject
        };
    };
}
