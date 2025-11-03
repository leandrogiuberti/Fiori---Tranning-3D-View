// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview provides a sticky EventHub implementation to be used internally by the shell.
 * @private
 */

sap.ui.define([
    "sap/base/Log"
    /* Be careful by adding dependencies: Module is used in uhsell's boottask! */
], (Log) => {
    "use strict";

    function createEmptyStore () {
        return {
            nextKey: 0,
            objectToKey: new window.WeakMap(),
            keyToObject: {}
        };
    }

    const _oHub = {
        pendingEvents: { /* sEventName -> vData */ },
        subscribers: { /* sEventName -> fnCallback */ },
        dispatchOperations: { /* sEventName -> oDispatchOperation */ },
        store: createEmptyStore()
    };

    function log (sErrorMessage, oError, fnCausedBy) {
        Log.error(sErrorMessage, oError, "sap.ushell.EventHub");
        return;
    }

    function logCallbackError (oError) {
        const sMessage = `An exception was raised while executing a registered callback on event '${oError.eventName}'`;
        let sDetails = `Data passed to the event were: '${oError.eventData}'`;
        if (oError.error.stack) {
            sDetails += ` Error details: ${oError.error.stack}`;
        }

        log(sMessage, sDetails, oError.fnCausedBy);
    }

    function safeCall (sEvent, fnCallback, vData) {
        let vResult;
        try {
            vResult = fnCallback(vData);
        } catch (oError) {
            logCallbackError({
                eventName: sEvent,
                eventData: vData,
                fnCausedBy: fnCallback,
                error: oError
            });
        }

        return vResult;
    }

    function storeSave (oHub, vObject) {
        if (oHub.store.objectToKey.has(vObject)) {
            return oHub.store.objectToKey.get(vObject);
        }

        oHub.store.nextKey++;
        const sKey = `<${typeof vObject}>#${oHub.store.nextKey}`;
        oHub.store.keyToObject[sKey] = vObject;
        oHub.store.objectToKey.set(vObject, sKey);

        return sKey;
    }

    function JSONReplacer (oHub /* sKey, vPropertyValue */) {
        if (typeof arguments[2] === "function") {
            return storeSave(oHub, arguments[2]);
        }
        return arguments[2];
    }

    function storeLoad (oHub, sKey) {
        return oHub.store.keyToObject[sKey];
    }

    function JSONReviver (oHub /* sKey, vPropertyValue */) {
        if (typeof arguments[2] === "string" && arguments[2].indexOf("<function") === 0) {
            return storeLoad(oHub, arguments[2]);
        }
        return arguments[2];
    }

    function serialize (oHub, vData, /* optional */ bPretty) {
        if (typeof vData === "object" || typeof vData === "function") {
            try {
                const aStringifyArgs = [vData, JSONReplacer.bind(null, oHub)];
                if (bPretty) {
                    aStringifyArgs.push(3);
                }
                return JSON.stringify.apply(JSON, aStringifyArgs);
            } catch (oError) {
                log("serialize failed:", oError, serialize);
            }
        }
        return vData;
    }

    function deserialize (oHub, sData) {
        try {
            return JSON.parse(sData, JSONReviver.bind(null, oHub));
        } catch (oError) {
            return sData;
        }
    }

    /*
     * Subscribe a group of subscribers.
     */
    function subscribe (oHub, sEvent, aSubscriberGroup) {
        if (!oHub.subscribers[sEvent]) {
            oHub.subscribers[sEvent] = [];
        }
        oHub.subscribers[sEvent].push(aSubscriberGroup);
    }

    /*
     * Find and unsubscribe a subscriber from the hub using its event handler for searching.
     */
    function unsubscribe (oHub, sEvent, fnHandler) {
        oHub.subscribers[sEvent] = (oHub.subscribers[sEvent] || [])
            .map((aSubscriberGroup) => {
                return aSubscriberGroup.filter((oListener) => {
                    return oListener.fn !== fnHandler;
                });
            })
            .filter((aGroup) => {
                return aGroup.length > 0;
            });
    }

    function createDispatchOperation () {
        let fnDispatchComplete;
        const oDispatchPromise = new Promise((fnResolve) => {
            fnDispatchComplete = fnResolve;
        });
        const oDispatchOperation = {
            dispatching: oDispatchPromise,
            cancelled: false,
            cancel: function () {
                oDispatchOperation.cancelled = true;
            },
            complete: function () {
                fnDispatchComplete();
            }
        };

        return oDispatchOperation;
    }

    function notifySubscriber (oHub, sEvent, oSubscriber, aSubscriberGroup) {
        const vDeserializedValue = deserialize(oHub, oHub.pendingEvents[sEvent]);
        return Promise.resolve().then(() => {
            if (oSubscriber.called && aSubscriberGroup.offed) {
                return false;
            }
            oSubscriber.called = true;

            // check handler was offed as late as possible to allow off before the call
            const bOffBeforeCall = aSubscriberGroup.offed;
            safeCall(sEvent, oSubscriber.fn, vDeserializedValue);
            const bOffAfterCall = aSubscriberGroup.offed;

            // -- unsubscribe offed subscriber after the call as it was already called and offed
            if (bOffAfterCall) {
                unsubscribe(oHub, sEvent, oSubscriber.fn);
            }

            return !bOffBeforeCall && bOffAfterCall;
        });
    }

    function dispatchEventToGroup (oHub, sEvent, aSubscriberGroup, oDispatchOperation, iStartFrom) {
        const iOriginalGroupSize = aSubscriberGroup.length;
        const aSubscriberGroupSlice = aSubscriberGroup.slice(iStartFrom);

        return aSubscriberGroupSlice.reduce(
            (oPreviousHandlerCalledPromise, oSubscriber) => {
                return oPreviousHandlerCalledPromise.then((bOffCalledFromHandler) => {
                    if (oDispatchOperation.cancelled) {
                        if (bOffCalledFromHandler) {
                            unsubscribe(oHub, sEvent, oSubscriber.fn); // don't notify next listener in the group
                        }
                        return bOffCalledFromHandler;
                    }
                    return notifySubscriber(oHub, sEvent, oSubscriber, aSubscriberGroup)
                        .then((bSubscriberCallbackCalledOff) => {
                            // -- off call detected
                            if (bSubscriberCallbackCalledOff) {
                                oDispatchOperation.cancelled = true;
                            }
                            return bSubscriberCallbackCalledOff;
                        });
                });
            },
            Promise.resolve(false /* Off called from handler */)
        ).then((bHandlerCalledOff) => {
            // if listeners called do inside a do, the group size increases
            if (!bHandlerCalledOff && iOriginalGroupSize < aSubscriberGroup.length) {
                // dispatch to remaining
                return dispatchEventToGroup(oHub, sEvent, aSubscriberGroup, oDispatchOperation, iOriginalGroupSize);
            }
            return bHandlerCalledOff;
        });
    }

    function dispatchEvent (oHub, sEvent) {
        if (!oHub.subscribers.hasOwnProperty(sEvent)) {
            return null; // no interested parties
        }

        const oDispatchOperation = createDispatchOperation();
        // -- dispatch
        const aSubscriberGroups = oHub.subscribers[sEvent];
        const aGroupsDispatchedPromise = aSubscriberGroups.map((aSubscriberGroup) => {
            return dispatchEventToGroup(oHub, sEvent, aSubscriberGroup, oDispatchOperation, 0);
        });

        Promise.all(aGroupsDispatchedPromise)
            .finally(oDispatchOperation.complete);

        return oDispatchOperation;
    }

    function createFnOff (oHub, sEvent, aSubscriberGroup) {
        // When off is called, it immediately removes any subscribed listener that was already called.
        return function () {
            aSubscriberGroup.forEach((oListener) => {
                unsubscribe(oHub, sEvent, oListener.fn);
            });

            // note: offs any current and future listener
            aSubscriberGroup.offed = true;

            return { off: createFnOff(oHub, sEvent, []) };
        };
    }

    function createFnDo (oHub, sEvent, aSubscriberGroup) {
        // Create a new subscriber and add it to the given subscriber group.
        return function (fnCallback) {
            const oSubscriber = {
                fn: fnCallback,
                called: false
            };

            // The dispatching process picks up and calls this listener if dispatching is ongoing.
            aSubscriberGroup.push(oSubscriber);

            if (oHub.pendingEvents.hasOwnProperty(sEvent)) {
                // check if event is being dispatched already
                const oDispatchOperation = oHub.dispatchOperations[sEvent];
                if (!oDispatchOperation) {
                    notifySubscriber(oHub, sEvent, oSubscriber, aSubscriberGroup);
                } else {
                    /*
                     * This subscriber is not called if during dispatching if it was added to another subscriber group.
                     * This is the case in situations like:
                     *
                     *   EventHub.on("Event")  [ group A ]
                     *        .do( ... )
                     *        .do( ... )
                     *        ...
                     *
                     *   EventHub.on("Event")  [ group B ]
                     *        .do( ... )
                     *        ...
                     *
                     * Expectation is that sequence is kept during dispatching.
                     * So we wait on the ongoing dispatching operation and continue afterwards.
                     */
                    oDispatchOperation.dispatching.then(() => {
                        if (!oSubscriber.called) {
                            notifySubscriber(oHub, sEvent, oSubscriber, aSubscriberGroup);
                        }
                    });
                }
            }

            return {
                do: createFnDo(oHub, sEvent, aSubscriberGroup),
                off: createFnOff(oHub, sEvent, aSubscriberGroup)
            };
        };
    }

    /* --- API --- */

    /**
     * Subscribes any future subscriber to a certain event.
     *
     * Internally, pushes a group of subscribers onto the 'subscribers' queue.
     * This group is associated to the "on" call. The group has the following properties:
     *
     * - "off": indicates that #off was called on behalf of the whole group.
     *   Indicating that if a handler was already called it shouldn't be called ever again.
     *
     * @param {object} oHub the hub.
     * @param {string} sEvent the event name.
     * @returns {object} a Doable
     */
    function on (oHub, sEvent) {
        const aSubscriberGroup = [];
        subscribe(oHub, sEvent, aSubscriberGroup);

        return {
            do: createFnDo(oHub, sEvent, aSubscriberGroup),
            off: createFnOff(oHub, sEvent, aSubscriberGroup)
        };
    }

    function once (oHub, sEvent) {
        const oDoable = on(oHub, sEvent);
        oDoable.off();
        return oDoable;
    }

    /**
     * Emit an event - it really does only if data have changed.
     *
     * Event data are updated immediately.
     * When new data enter, any pending dispatching is interrupted and a new (asynchronous) dispatching takes place.
     * @param {object} oHub the hub.
     * @param {string} sEvent the event name.
     * @param {object} oData the event data.
     * @param {boolean} bForce whether the notification is forced.
     * @returns {this} Reference to <code>this</code> for method chaining.
     */
    function emit (oHub, sEvent, oData, bForce) {
        const sSerializedData = serialize(oHub, oData);

        if (!bForce && oHub.pendingEvents.hasOwnProperty(sEvent)
            && oHub.pendingEvents[sEvent] === sSerializedData) {
            return this; // same data -> no need to emit again
        }
        oHub.pendingEvents[sEvent] = sSerializedData;

        const oDispatchOperation = oHub.dispatchOperations[sEvent];
        if (oDispatchOperation) {
            oDispatchOperation.cancel();
        }

        const oNewDispatchOperation = dispatchEvent(oHub, sEvent);
        oHub.dispatchOperations[sEvent] = oNewDispatchOperation;

        return this;
    }

    function last (oHub, sEvent) {
        return deserialize(oHub, oHub.pendingEvents[sEvent]);
    }

    function join (/* oHub, args */) {
        const aArgDoables = Array.prototype.slice.call(arguments);
        aArgDoables.shift(); // oHub

        let iCount = 0;
        const aOneTimeCounts = new Array(aArgDoables.length)
            .join(",")
            .split(",")
            .map(() => {
                return 1;
            });
        const aEventValues = [];
        const oDoable = {
            do: function (fnCallback) {
                aArgDoables.forEach((oArgDoable, iIdx) => {
                    oArgDoable.do(((iIdx, vValue) => {
                        aEventValues[iIdx] = vValue;

                        iCount += aOneTimeCounts[iIdx];
                        aOneTimeCounts[iIdx] = 0; // never add again

                        if (iCount === aArgDoables.length) {
                            fnCallback.apply(null, aEventValues);
                        }
                    }).bind(null, iIdx));
                });

                return { off: oDoable.off }; // don't allow chaining
            },
            off: function () {
                const fnOff = aArgDoables.reduce((fnOff, oArgDoable) => {
                    return oArgDoable.off();
                }, () => { });

                return { off: fnOff };
            }
        };

        return oDoable; // allow to call do after join
    }

    function wait (oHub, sEvent) {
        const oDispatchOperation = oHub.dispatchOperations[sEvent];

        return oDispatchOperation
            ? oDispatchOperation.dispatching
            : Promise.resolve();
    }

    function createEventHub (oHub) {
        const oEventHub = {};

        oEventHub.emit = emit.bind(oEventHub, oHub);
        oEventHub.on = on.bind(null, oHub);
        oEventHub.once = once.bind(null, oHub);
        oEventHub.last = last.bind(null, oHub);
        oEventHub.join = join.bind(null, oHub);
        oEventHub.wait = wait.bind(null, oHub);

        // for testing only
        oEventHub._reset = function (oHub) {
            oHub.pendingEvents = {};
            oHub.subscribers = {};
            oHub.dispatchOperations = {};
            oHub.store = createEmptyStore();
        }.bind(null, oHub);

        return oEventHub;
    }

    function createChannel (oContract) {
        const oEventHubData = {
            pendingEvents: {},
            subscribers: {},
            dispatchOperations: {},
            store: createEmptyStore()
        };
        const oEventHub = createEventHub(oEventHubData);
        const oContractClone = deserialize(oEventHubData, serialize(oEventHubData, oContract));

        function parsePath (sPath) {
            const sSeparator = sPath.charAt(0);
            if (sSeparator.match(/[a-zA-Z0-9]/)) {
                throw new Error(`Invalid path separator '${sSeparator}'. Please ensure path starts with a non alphanumeric character`);
            }

            const aPath = sPath.split(sSeparator);
            aPath.shift(); // initial separator character
            return aPath;
        }

        function serializePath (vPrefixOrPath, aMaybePath) {
            let aPath = vPrefixOrPath;
            let sPrefix = "";
            if (arguments.length === 2) {
                aPath = aMaybePath;
                sPrefix = vPrefixOrPath;
            }
            return `${sPrefix}/${aPath.join("/")}`;
        }

        function isArray (v) {
            return Object.prototype.toString.apply(v) === "[object Array]";
        }

        function isPrimitive (v) {
            return Object(v) !== v;
        }

        function isEmpty (v) {
            return (isArray(v) ? v.length : Object.keys(v).length) === 0;
        }

        function setObjectValue (oDef, vObject, aPath, vValue) {
            let sPathSoFar = "";
            let oDefSoFar = oDef;
            const aPathsWritten = [];

            aPath.reduce((oCurrentObject, sKey, iIdx) => {
                sPathSoFar = serializePath(sPathSoFar, [sKey]);
                oDefSoFar = oDefSoFar[sKey];

                if (iIdx === aPath.length - 1) {
                    if (!isPrimitive(vValue) && !isPrimitive(oDefSoFar) && Object.keys(oDefSoFar).length > 0) {
                        // Before writing, we need to check that the structure of the value we want to override allows it.
                        let sExampleValue;
                        const oRemainingPaths = Object.keys(oDefSoFar).reduce((o, sKey) => {
                            o[sKey] = true;
                            return o;
                        }, {});
                        const bKeysNotInContractOrNonEmpty = Object.keys(vValue).some((sKey) => {
                            sExampleValue = sKey;

                            const bFoundInDef = oRemainingPaths.hasOwnProperty(sKey);
                            delete oRemainingPaths[sKey];

                            const bNonEmptyComplexType = !isPrimitive(oDefSoFar[sKey]) && Object.keys(oDefSoFar[sKey]).length > 0;

                            return !bFoundInDef || bNonEmptyComplexType;
                        });
                        const bMissingKeys = (Object.keys(oRemainingPaths).length > 0);
                        const bIsOverrideForbidden = (bKeysNotInContractOrNonEmpty || bMissingKeys);
                        if (bIsOverrideForbidden) {
                            const sReason = bKeysNotInContractOrNonEmpty
                                ? `One or more values are not defined in the channel contract or are defined as a non-empty object/array, for example, check '${sExampleValue}'.`
                                : `Some keys are missing in the event data: ${Object.keys(oRemainingPaths).join(", ")}.`;

                            throw new Error(`Cannot write value '${serialize(oEventHubData, vValue, true /* bPretty */)}' to path '${sPathSoFar}'. ${
                                sReason
                            } All childrens in the value must appear in the channel contract and must have a simple value or should be defined as an empty complex value`);
                        }

                        const aAllPathsForValue = Object.keys(vValue).map((sKey) => {
                            return {
                                serializedPath: serializePath(sPathSoFar, [sKey]),
                                value: vValue[sKey]
                            };
                        });

                        Array.prototype.push.apply(aPathsWritten, aAllPathsForValue);
                    }

                    // Checks passed.
                    oCurrentObject[sKey] = vValue;
                } else if (!oCurrentObject.hasOwnProperty(sKey)) {
                    // we must create based on definition
                    oCurrentObject[sKey] = isArray(oDefSoFar) ? [] : {};
                }

                aPathsWritten.push({
                    serializedPath: sPathSoFar,
                    value: oCurrentObject[sKey]
                });

                return oCurrentObject[sKey];
            }, vObject);

            return aPathsWritten;
        }

        function getObjectValue (oObjectOrArray, aPath) {
            let sPathSoFar = "";
            const oLastItem = aPath.reduce((oCurrentObject, sKey) => {
                sPathSoFar += `/${sKey}`;

                if (isArray(oCurrentObject) && !sKey.match(/^[0-9]+$/)) {
                    throw new Error(`Invalid array index '${sKey}' provided in path '${sPathSoFar}'`);
                }

                if (!oCurrentObject.hasOwnProperty(sKey)) {
                    throw new Error(`The item '${sKey}' from path ${sPathSoFar} cannot be accessed in the object: ${serialize(oEventHubData, oCurrentObject)}`);
                }

                return oCurrentObject[sKey];
            }, oObjectOrArray);
            return oLastItem;
        }

        function getObjectValueOrDefault (oObjectOrArray, aPath, vDefault) {
            return aPath.reduce((oCurrentObject, sKey, iIdx) => {
                const bLast = iIdx === (aPath.length - 1);
                if (oCurrentObject.hasOwnProperty(sKey)) {
                    return oCurrentObject[sKey];
                }
                return bLast ? vDefault : {};
            }, oObjectOrArray);
        }

        function getParentValues (oObject, aPath) {
            aPath.pop(); // we want to return only the *parent* paths.

            let oValueSoFar = oObject;
            const aPathSoFar = [];

            return aPath.reduce((aParentValues, sPathSegment) => {
                oValueSoFar = oValueSoFar[sPathSegment];
                aPathSoFar.push(sPathSegment);
                aParentValues.push({
                    serializedPath: serializePath(aPathSoFar),
                    value: oValueSoFar
                });
                return aParentValues;
            }, []);
        }

        function findEmittableParentEvents (aAllWrittenValues) {
            return aAllWrittenValues
                .map((oParentValue) => {
                    const sSerializedPath = oParentValue.serializedPath;

                    if (!oEventHubData.subscribers.hasOwnProperty(sSerializedPath)
                        || oEventHubData.subscribers[sSerializedPath].length === 0) {
                        return null;
                    }

                    return {
                        path: sSerializedPath,
                        value: oParentValue.value
                    };
                })
                .filter((oEvents) => {
                    return !!oEvents;
                });
        }

        function channelEmit (sPath, vData) {
            const aPath = parsePath(sPath);

            // check if path is valid
            getObjectValue(oContract, aPath); // throws if path is invalid

            // write in the clone
            const aAllPathsAndValuesWritten = setObjectValue(oContract, oContractClone, aPath, vData);

            // Emit in the channel for interested subscribers
            aAllPathsAndValuesWritten.forEach((oParentEventInfo) => {
                oEventHub.emit(oParentEventInfo.serializedPath, oParentEventInfo.value);
            });
        }

        function channelLast (sPath) {
            const aPath = parsePath(sPath);
            const vValueFromOriginalObject = getObjectValue(oContract, aPath); // throws if path is invalid

            return getObjectValueOrDefault(oContractClone, aPath, vValueFromOriginalObject);
        }

        function channelOn (sPath) {
            // publish event if we did not publish it before and there is a value in the object.
            const aPath = parsePath(sPath);
            const sSerializedPath = serializePath(aPath);
            // ensure on is called on an existing path
            let vLastChangedValue = oEventHub.last(sSerializedPath);
            const bValueWasChanged = oEventHubData.pendingEvents.hasOwnProperty(sSerializedPath);
            if (bValueWasChanged) {
                return oEventHub.on(sSerializedPath);
            }

            // emit the value from the original object
            vLastChangedValue = getObjectValue(oContract, aPath);
            if (typeof vLastChangedValue !== "undefined"
                && (isPrimitive(vLastChangedValue)
                    || !isEmpty(deserialize(oEventHub, serialize(oEventHub, vLastChangedValue))))
            ) {
                oEventHub.emit(sSerializedPath, vLastChangedValue);
            }

            return oEventHub.on(sSerializedPath);
        }

        function channelOnce (sPath) {
            const oDoable = channelOn(sPath);
            oDoable.off();
            return oDoable;
        }

        function channelWait (sPath) {
            const aPath = parsePath(sPath);
            const aParentValues = getParentValues(oContractClone, aPath);
            const aWaitPromises = findEmittableParentEvents(aParentValues).map((oParentEventInfo) => {
                return oEventHub.wait(oParentEventInfo.path, oParentEventInfo.value);
            });
            return Promise.all(aWaitPromises.concat(oEventHub.wait(sPath)));
        }

        return {
            emit: channelEmit,
            on: channelOn,
            once: channelOnce,
            last: channelLast,
            wait: channelWait,
            join: join.bind(null, oEventHub)
        };
    }

    const oExport = createEventHub(_oHub);
    oExport.createChannel = createChannel.bind(null);

    return oExport;
});
