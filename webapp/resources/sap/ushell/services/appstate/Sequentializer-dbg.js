// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ui/thirdparty/jquery"
], (jQuery) => {
    "use strict";

    /**
     * The Sequentializer assures requests are executed in sequence,
     * subsequent requests issued with addToQueue are only executed if
     * all prior statements have been executed
     * @private
     */
    function Sequentializer () {
        this.oLastPromise = new jQuery.Deferred();
        this.oLastPromise.resolve();
    }

    /**
     * Given a function object without parameters which must return a promise, add it to the
     * execution queue,
     * functions will be invoked sequentially, only after a prior function promise is
     * done or failed, the next function will be invoked.
     *
     * (note you may use obj.function.bind(obj, arg1, ...,  argN) to obtain a parameterless function)
     *
     * @param {function} fFn function to add to queue
     * @returns {jQuery.Promise} Resolves the next promise.
     * @private
     */
    Sequentializer.prototype.addToQueue = function (fFn) {
        // given  a function object which returns a promise
        // assure queue this function
        const oNextPromise = new jQuery.Deferred();
        this.oLastPromise.always(() => {
            const res = fFn();
            res.done(function () {
                oNextPromise.resolve.apply(oNextPromise, arguments);
            }).fail(function () {
                oNextPromise.reject.apply(oNextPromise, arguments);
            });
        });
        this.oLastPromise = oNextPromise;
        return oNextPromise.promise();
    };

    return Sequentializer;
});
