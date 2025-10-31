// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/base/Log",
    "sap/base/util/Deferred",
    "sap/ushell/utils"
], (
    Log,
    Deferred,
    ushellUtils
) => {
    "use strict";

    /**
     * @alias sap.ushell.utils.CallbackQueue
     * @class
     * @classdesc A queue for managing promises in a sequential manner.
     * It ensures that async processes are strictly executed after each other.
     * This is useful when the effects on the callbacks might interfere with each other.
     * In case a promise is failed the error handler is called and execution continues.
     *
     * @since 1.141.0
     * @private
     */
    class CallbackQueue {
        #pLastPromise = Promise.resolve();
        #iIndex = 1;

        /**
         * Adds a callback on top of the queue.
         * @param {function ():Promise} fnCallback
         * A callback which is called when all previous callbacks in the queue have settled.
         * @param {function ():Promise} fnErrorCallback
         * A callback function to handle errors. It is called in case the main callback fails
         * @returns {Promise}
         * Resolves when this step is done with the result of fnCallback.
         * If fnCallback failed it rejects with the error.
         *
         * Unless fnErrorCallback is provided.
         * Then it resolves or rejects with the result or error of the fnErrorCallback.
         *
         * @since 1.141.0
         * @private
         */
        async push (fnCallback, fnErrorCallback) {
            // Save current state of promise chain
            const pLastPromise = this.#pLastPromise;

            // Create Deferred for async resolve
            const oNextPromiseDeferred = new Deferred();

            // Update promise with deferred
            this.#pLastPromise = pLastPromise.then(() => oNextPromiseDeferred.promise);
            this.#pLastPromise.index = this.#iIndex++; // add index for easier debugging

            // Await current state of promise chain
            await pLastPromise;

            let bFailed = false;
            let vResult;
            try {
                // Now execute target callback
                vResult = await ushellUtils.promisify(fnCallback());
            } catch (oError) {
                Log.error("Error occurred in CallbackQueue:", oError);

                bFailed = true;
                vResult = oError;

                if (fnErrorCallback) {
                    try {
                        vResult = await ushellUtils.promisify(fnErrorCallback(oError));
                        bFailed = false;
                    } catch (oNestedError) {
                        Log.error("Error occurred in CallbackQueue:", oNestedError);

                        bFailed = true;
                        vResult = oNestedError;
                    }
                }

                // Continue with next promise
            }

            // Finally resolve deferred to execute next step
            oNextPromiseDeferred.resolve();

            if (bFailed) {
                throw vResult;
            }
            return vResult;
        }

        /**
         * Waits for all promises in the queue to settle.
         * When more callbacks are added to the queue, this method will ensure that they are also awaited.
         * @returns {Promise} A promise that resolves when all queued promises have settled.
         *
         * @since 1.141.0
         * @private
         */
        async waitAllSettled () {
            const pLastPromise = this.#pLastPromise;

            await pLastPromise;

            if (pLastPromise !== this.#pLastPromise) {
                // new promise was added
                return this.waitAllSettled();
            }
        }
    }

    return CallbackQueue;
});
