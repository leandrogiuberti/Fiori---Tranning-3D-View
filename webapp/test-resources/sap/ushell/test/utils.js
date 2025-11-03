// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview This file contains miscellaneous test utility functions.
 */
sap.ui.define([
    "sap/base/Log",
    "sap/base/util/deepExtend",
    "sap/base/util/extend",
    "sap/ui/thirdparty/URI",
    "sap/ushell/utils",
    "sap/ushell/EventHub"
], (
    Log,
    deepExtend,
    extend,
    URI,
    ushellUtils,
    EventHub
) => {
    "use strict";

    /* global QUnit, ok, deepEqual, strictEqual, start, sinon */

    const fnErrorConstructor = ushellUtils.Error;

    // window.onerror no longer necessary with QUnit

    function assertOk (/* arguments */) {
        // QUnit 2.x
        if (QUnit) {
            return QUnit.assert.ok(QUnit.assert, arguments);
        }

        // QUnit 1.x
        return ok.apply(null, arguments);
    }

    /*
     * The standard error handler for test cases. Reports the error message.
     */
    function onError (sError) {
        start();
        assertOk(false, typeof sError === "object" ? JSON.stringify(sError) : sError);
    }

    /*
     * Modifies the constructor of oUtils.Error so that the component is mandatory.
     */
    ushellUtils.Error = function (sMessage, sComponent) {
        if (!sComponent || typeof sComponent !== "string") {
            throw new Error("Missing component");
        }
        return fnErrorConstructor.apply(this, arguments);
    };
    ushellUtils.Error.prototype = fnErrorConstructor.prototype;

    /*
     * Creates a mock object for tracing and assigns it to Log.
     * Return an object to control the mock.
     */
    function createLogMock () {
        const aExpectedCalls = [];
        const oOriginalLog = Log;
        const oOriginalSapBaseLog = Log;
        let sWatchedComponent;
        let bSloppy = false;

        /**
         * Checks whether one log call argument matches
         * @param {string} sActual
         *   the actual value
         * @param {string|RegExp} vExpected
         *   the expected value (either as string or as regular expression)
         * @returns {boolean}
         *   <code>true</code> if the actual value matches the expected value
         */
        function argumentMatches (sActual, vExpected) {
            return vExpected instanceof RegExp ? vExpected.test(sActual) : sActual === vExpected;
        }

        /**
         * Checks whether the actual log call arguments match the expected ones
         *
         * @param {array} aActual
         *   the arguments list of a log call
         * @param {string[]|RegExp[]} aExpected
         *   the array of expected arguments
         * @returns {boolean}
         *   <code>true</code> if the actual values matches the expected values
         */
        function argumentsMatch (aActual, aExpected) {
            let i;

            if (aActual.length !== aExpected.length) {
                return false;
            }
            for (i = 0; i < aActual.length; i += 1) {
                if (!argumentMatches(aActual[i], aExpected[i])) {
                    return false;
                }
            }
            return true;
        }

        function record (sMethodName, aArguments) {
            aExpectedCalls.push({
                name: sMethodName,
                args: aArguments
            });
        }

        function replay (sMethodName, aArguments) {
            const oExpectedCall = aExpectedCalls.shift();

            if (oExpectedCall && sMethodName === oExpectedCall.name && argumentsMatch(aArguments, oExpectedCall.args)) {
                return;
            }
            if (bSloppy || (sWatchedComponent && sWatchedComponent !== aArguments[2])) {
                if (oExpectedCall) {
                    aExpectedCalls.unshift(oExpectedCall);
                }
                return;
            }
            if (!oExpectedCall) {
                assertOk(false, `Unexpected call to method ${sMethodName} with arguments ${Array.prototype.join.call(aArguments)}`);
                return;
            }

            strictEqual(sMethodName, oExpectedCall.name, "Method name");
            deepEqual(aArguments, oExpectedCall.args, `Call to method ${sMethodName}`);
        }

        const oMethods = {
            trace: function () {
                replay("trace", arguments);
            },

            debug: function () {
                replay("debug", arguments);
            },

            error: function () {
                replay("error", arguments);
            },

            info: function () {
                replay("info", arguments);
            },

            // cf. sinon
            restore: function () {
                Log = oOriginalLog;
                Log = oOriginalSapBaseLog;
            },

            warning: function () {
                replay("warning", arguments);
            },

            fatal: function () {
                replay("fatal", arguments);
            }
        };

        Log = Object.keys(oOriginalLog).reduce((oFinalLogMock, sNextProperty) => {
            oFinalLogMock[sNextProperty] = oOriginalLog[sNextProperty];
            return oFinalLogMock;
        }, {});

        Log = Object.keys(oOriginalSapBaseLog).reduce((oFinalLogMock, sNextProperty) => {
            oFinalLogMock[sNextProperty] = oOriginalSapBaseLog[sNextProperty];
            return oFinalLogMock;
        }, {});

        Object.keys(oMethods).forEach((sMethod) => {
            Log[sMethod] = oMethods[sMethod];
        });

        return {
            trace: function () {
                record("trace", arguments);
                return this;
            },

            debug: function () {
                record("debug", arguments);
                return this;
            },

            info: function () {
                record("info", arguments);
                return this;
            },

            error: function () {
                record("error", arguments);
                return this;
            },

            warning: function () {
                record("warning", arguments);
                return this;
            },

            fatal: function () {
                record("fatal", arguments);
                return this;
            },

            /**
             * Activates a filter for the given component. Only logs for that component are observed.
             *
             * @param {string} sComponentName
             *   the name of the component, <code>null</code> to switch the filter off (which is default)
             * @returns {object}
             *   this
             */
            filterComponent: function (sComponentName) {
                sWatchedComponent = sComponentName;
                return this;
            },

            /**
             * Turns the "sloppy" mode on as indicated. In "sloppy" mode, additional
             * calls to the mock are tolerated.
             *
             * @param {boolean} bNewSloppy
             *   new "sloppy" mode (default: true)
             * @returns {object}
             *   this
             */
            sloppy: function (bNewSloppy) {
                bSloppy = arguments.length > 0 ? bNewSloppy : true;
                return this;
            },

            verify: function () {
                if (Log.restore) { // sometimes verify() is called twice...
                    Log.restore();
                }
                if (aExpectedCalls.length === 0) {
                    assertOk(true, "Tracing is complete");
                } else {
                    aExpectedCalls.forEach((oExpectedCall) => {
                        function format (oCall) {
                            const aParts = [oCall.name, "("];
                            let i;
                            let sSep = "";
                            for (i = 0; i < oCall.args.length; i += 1) {
                                aParts.push(sSep, oCall.args[i]);
                                sSep = ", ";
                            }
                            aParts.push(")");
                            return aParts.join("");
                        }
                        assertOk(false, `Missing trace call: ${format(oExpectedCall)}`);
                    });
                }
            }
        };
    }

    /**
     * Restores all potential Sinon spies that are passed as arguments to the function. Additionally
     * restores the spies created via {@link sap.ushell.test.createLogMock()}.
     * @param {...function} [fnPotentialSpy] A potential spy to restore; nothing happens if the function is not spied upon
     */
    function restoreSpies () {
        function restoreSpy (fnPotentialSpy) {
            if (fnPotentialSpy && fnPotentialSpy.restore) {
                fnPotentialSpy.restore();
            }
        }

        for (let i = 0; i < arguments.length; i += 1) {
            restoreSpy(arguments[i]);
        }
        restoreSpy(Log); // see sap.ushell.test.createLogMock
    }

    /*
     * Returns the directory path of a resource file in which the function is called.
     * The function should not be called inside the elementary unit tests because this could lead to errors.
     * It should be called on the top.
     *
     * Remember: Defining a relative path inside a JavaScript file (myFile) is dangerous.
     * It then tries to load the desired resource relative to the html file which is embedding myFile in a script tag.
     */
    function getOwnScriptDirectory () {
        // get the URL of our own script; if included by ui2 qunitrunner, a global variable is filled
        let sOwnScriptUrl = window["sap-ushell-qunitrunner-currentTestScriptUrl"];

        if (!sOwnScriptUrl) {
            // no qunitrunner - expect direct embedding into HTML
            const aScriptElements = window.document.getElementsByTagName("script");
            const oOwnScriptElement = aScriptElements[aScriptElements.length - 1];
            sOwnScriptUrl = oOwnScriptElement.src;
        }

        return `${new URI(sOwnScriptUrl).directory()}/`;
    }

    /**
     * Will do an deep equal of two object representing key-object maps
     *
     * @param {object} assert
     *   QUnit assert object
     * @param {string} [sPrefix]
     *   Prefix for the test description
     * @param {object} oActual
     *   actual object
     * @param {object} oExpected
     *   expected Common Data Model Site
     * @param {string} sTestDescription
     *  test description
     */
    function prettyDeepEqualOfObjectMaps (assert, sPrefix, oActual, oExpected, sTestDescription) {
        const aActualKeys = Object.keys(oActual);
        const aExpectedKeys = Object.keys(oExpected);

        sPrefix = sPrefix || "";

        assert.strictEqual(
            aActualKeys.length,
            aExpectedKeys.length,
            `${sPrefix + sTestDescription} same number of items: ${aActualKeys.length}`
        );
        assert.deepEqual(
            aActualKeys,
            aExpectedKeys,
            `${sPrefix + sTestDescription} same list of keys`
        );

        // compare the map content
        aExpectedKeys.forEach((sKey) => {
            assert.deepEqual(
                oActual[sKey],
                oExpected[sKey],
                `${sPrefix + sTestDescription} item with key '${sKey}'`
            );
        });
    }

    /**
     * Will do an deep equal of the given path of both sites
     *
     * @param {object} assert
     *   QUnit assert object
     * @param {string} [sPrefix]
     *   Prefix for the test description
     * @param {object} oActualSite
     *   actual Common Data Model Site
     * @param {object} oExpectedSite
     *   expected Common Data Model Site
     * @param {string} sPath
     *   e.g.: "site.payload.config"
     */
    function deepEqualByNamespace (assert, sPrefix, oActualSite, oExpectedSite, sPath) {
        sPrefix = sPrefix || "";

        assert.deepEqual(
            ushellUtils.getMember(oActualSite, sPath),
            ushellUtils.getMember(oExpectedSite, sPath),
            sPrefix + sPath
        );
    }

    /**
     * Compares two CDM sites a in parts one by one. This is beneficial if you compare two large sites which
     * are not equal. The classic Qunit assert will output a huge diff which is hard to read:
     * you have to scroll for ages or if the order is wrong it will be hard to detect.
     *
     * The function will do a classic assert.deepEqual(oActualSite, oExpectedSite) at the end
     * to detect issues with the custom compare logic
     *
     * @param {object} assert
     *   QUnit assert object
     * @param {object} oActualSite
     *   actual Common Data Model Site
     * @param {object} oExpectedSite
     *   expected Common Data Model Site
     * @param {string} sTestDescription
     *   A short description of the test.
     */
    function prettyCdmSiteDeepEqual (assert, oActualSite, oExpectedSite, sTestDescription) {
        const sMethodPrefix = "[sap.ushell.test.utils#prettyCdmSiteDeepEqual] ";
        const sTestDescriptionPrefix = `${sMethodPrefix + sTestDescription}: `;
        const oSiteCloneA = extend({}, oActualSite);
        const oSiteCloneE = extend({}, oExpectedSite);

        // function shortcuts
        const fnDeepEqualSitesPart = deepEqualByNamespace.bind(this, assert, sTestDescriptionPrefix,
            oSiteCloneA, oSiteCloneE);
        const fnPrettyDeepEqualOfObjectMaps = prettyDeepEqualOfObjectMaps.bind(this, assert, sTestDescriptionPrefix);

        fnDeepEqualSitesPart("_version");

        // compare site
        fnDeepEqualSitesPart("site.identification");
        fnDeepEqualSitesPart("site.payload.homeApp");
        fnDeepEqualSitesPart("site.payload.config");
        fnDeepEqualSitesPart("site.payload.groupsOrder");

        // compare catalogs
        fnPrettyDeepEqualOfObjectMaps(
            oSiteCloneA.catalogs,
            oSiteCloneE.catalogs,
            "catalogs"
        );

        // compare applications
        fnPrettyDeepEqualOfObjectMaps(
            oSiteCloneA.applications,
            oSiteCloneE.applications,
            "applications"
        );

        // compare systemAliases
        fnPrettyDeepEqualOfObjectMaps(
            oSiteCloneA.systemAliases,
            oSiteCloneE.systemAliases,
            "systemAliases"
        );

        // compare groups
        fnPrettyDeepEqualOfObjectMaps(
            oSiteCloneA.groups,
            oSiteCloneE.groups,
            "groups"
        );

        // do classic deepEqual as well to detect issues with testUtils.prettyCdmSiteDeepEqual
        assert.deepEqual(oActualSite, oExpectedSite,
            `${sMethodPrefix}SELF-CHECK (this should not be the only red assertion -> prettyCdmSiteDeepEqual bug)`);
    }

    /**
     * Allows to set a value for a nested member of a plain object or array.
     *
     * Example (object):
     * <pre>
     *    var oMyObject = { a: { b: "c" } };
     *    setObjectValue(oMyObject, "/a/b/d", "hello");
     *
     *    // oMyObject becomes: { a: { b: "c", d: "hello" } }
     * </pre>
     *
     * Example (array):
     * <pre>
     *    var aMyArray = [1, { b: "hi" }, 3];
     *    setObjectValue(aMyArray, "/1/b", "hello");
     *
     *    // aMyArray becomes: [1, {b: "hello"}, 3]
     * </pre>
     *
     * @param {object|array} oObjectOrArray
     *   An object that can be modified.
     *
     * @param {string} sPath
     *   The path to an object member starting from the root. For example,
     *   like: <code>/path/to/deeply/nested/member</code>. Note that the path
     *   is created if it does not exist.
     *
     * @param {variant} vValue
     *   The value to assign to the object identified by the given path
     *
     * @throws {Error} When the given path does not start with the root '/', or
     *   when a non-numeric index is found in the path for an array.
     */
    function setObjectValue (oObjectOrArray, sPath, vValue) {
        if (sPath.indexOf("/") !== 0) {
            throw new Error("Invalid path. Please ensure path starts with '/'");
        }

        const aPath = sPath.split("/");
        aPath.shift(); // initial '/'
        const sLastKey = aPath.pop();

        const oLastItem = aPath.reduce((oCurrentObject, sKey) => {
            if (ushellUtils.isArray(oCurrentObject) && isNaN(parseInt(sKey, 10))) {
                throw new Error(`Invalid array index '${sKey}' provided in path '${sPath}'`);
            }

            if (!ushellUtils.isPlainObject(oCurrentObject[sKey]) && !ushellUtils.isArray(oCurrentObject[sKey])) {
                oCurrentObject[sKey] = {}; // overrides in case a non-object is set!
            }

            return oCurrentObject[sKey];
        }, oObjectOrArray);

        if (ushellUtils.isArray(oLastItem) && isNaN(parseInt(sLastKey, 10))) {
            throw new Error(`Invalid array index '${sLastKey}' provided in path '${sPath}'`);
        }

        oLastItem[sLastKey] = vValue;
    }

    /**
     * Overrides (nested) properties of an object, without changing the
     * original object.
     *
     * Example:
     * <pre>
     *   var oObject = { a: { b: "c" } };
     *   var oObjectEnhanced = overrideObject(oObject, {
     *      "/a/b" : "foo",
     *      "/a/d/c": "fie"
     *   });
     *   // oObjectEnhanced is: { a: { b: "foo", d: { c: "fie" } } }
     * </pre>
     *
     * @param {object} oObject
     *   The object to override.
     *
     * @param {object} oProperties
     *   The path to properties to override and the corresponding value.
     *
     * @returns {object}
     *   A new object like the original object, with the specified values
     *   assigned.
     *
     * @throws {Error} When the given path does not start with the root '/', or
     *   when a non-numeric index is found in the path for an array.
     */
    function overrideObject (oObject, oProperties) {
        const oObjectClone = deepExtend({}, oObject);

        Object.keys(oProperties).sort((sA, sB) => {
            if (sA.indexOf(sB) >= 0) { return 1; }
            if (sB.indexOf(sA) >= 0) { return -1; }

            return 0;
        }).forEach((sPath) => {
            const sTargetValue = oProperties[sPath];
            setObjectValue(oObjectClone, sPath, sTargetValue);
        });

        return oObjectClone;
    }

    function resetConfigChannel (oUshellConfig) {
        return new Promise((resolve, reject) => {
            // require here, not in define due to sandbox case
            sap.ui.require([
                "sap/ushell/bootstrap/common/common.create.configcontract.core",
                "sap/ushell/Config"
            ], (CommonCreateConfigcontract, Config) => {
                const oContract = CommonCreateConfigcontract.createConfigContract(oUshellConfig);

                Config._reset();
                Config.registerConfiguration("core", oContract);
                resolve();
            });
        });
    }

    function registerFakesForRequire (oFakes) {
        /*
         * oFakes = {
         *   "my/module": fnFactory,
         *   "my/other/module": fnOtherFactory
         * }
         *
         *
         */

        const fnOriginalRequire = sap.ui.require;
        const fnOriginalRequireSync = sap.ui.requireSync;
        const fnOriginalDefine = sap.ui.define;

        const oRequireStub = sinon.stub(sap.ui, "require").callsFake(function (vPath, fnCallback) {
            // Probing
            if (typeof vPath === "string") {
                if (oFakes[vPath]) {
                    return oFakes[vPath];
                }
                return fnOriginalRequire(vPath, fnCallback);
            }

            // "Real" require
            const aResults = [];
            for (let i = 0; i < vPath.length; i++) {
                const sPath = vPath[i];
                if (oFakes[sPath]) {
                    aResults.push(oFakes[sPath]);
                } else {
                    aResults.push(fnOriginalRequireSync(sPath));
                }
            }
            if (typeof fnCallback === "function") {
                return fnCallback.apply(this, aResults);
            }

            return undefined;
        });

        // sap.ui.define
        const oDefineStub = sinon.stub(sap.ui, "define").callsFake(function (aDefineInput, fnDefineCallback) {
            const iOriginalLength = aDefineInput.length;
            const aForwardedInput = [];
            const oStubbedInput = {};
            const aMergedCallbacks = [];

            // Removed items that are stubbed
            for (let i = 0; i < iOriginalLength; i++) {
                if (oFakes[aDefineInput[i]] !== undefined) {
                    oStubbedInput[i] = oFakes[aDefineInput[i]];
                } else {
                    aForwardedInput.push(aDefineInput[i]);
                }
            }

            if (Object.keys(oStubbedInput).length === 0) {
                fnOriginalDefine.apply(this, arguments);
            }

            fnOriginalDefine.call(this, aForwardedInput, function () {
                let aForwardedResult = Array.from(arguments);
                for (let count = 0; count < iOriginalLength; count++) {
                    if (oStubbedInput[count] !== undefined) {
                        aMergedCallbacks.push(oStubbedInput[count]);
                    } else {
                        aMergedCallbacks.push(aForwardedResult[0]);
                        aForwardedResult = aForwardedResult.slice(1);
                    }
                }

                return fnDefineCallback.apply(this, aMergedCallbacks);
            });
        });

        return {
            restore: function () {
                oRequireStub.restore();
                oDefineStub.restore();
            }
        };
    }

    /**
     * Attaches to the EventHub.
     * Resolves once the event was published.
     * @param {string} sEvent The event to attach
     * @returns {Promise} Resolves once event was published.
     */
    function waitForEventHubEvent (sEvent) {
        return new Promise((resolve) => {
            EventHub.once(sEvent).do(resolve);
        });
    }

    /**
     * Attaches to the EventHub and joins multiple events.
     * Resolves once the joined event was published.
     * @param {string[]} aEvents The events to attach
     * @returns {Promise} Resolves once event was published.
     *
     * @private
     * @since 1.127.0
     */
    function waitForEventHubEvents (aEvents) {
        return new Promise((resolve) => {
            EventHub.join(
                ...aEvents.map((sEvent) => EventHub.once(sEvent))
            ).do(resolve);
        });
    }

    function clearLocalStorage () {
        Object.keys(localStorage).forEach((sKey) => {
            if (sKey.startsWith("com.sap.ushell.")) {
                localStorage.removeItem(sKey);
            }
        });
    }

    /**
     * Waits for a promise to resolve or rejects with a timeout error after a specified time.
     * @param {Promise} pPromise The promise to wait for.
     * @param {int} [iTimeoutMs=100] The timeout in milliseconds to wait for the promise to resolve.
     * @returns {Promise} A promise that resolves with the result of the input promise or rejects with a timeout error.
     *
     * @since 1.139.0
     * @private
     */
    async function awaitPromiseOrTimeout (pPromise, iTimeoutMs = 100) {
        const { promise: pTimeoutPromise, reject } = Promise.withResolvers();

        const iTimeout = setTimeout(() => {
            Log.error("Timeout while waiting for promise");
            reject(new Error("Timeout while waiting for promise"));
        }, iTimeoutMs);

        return Promise.race([
            pPromise.then((vResult) => {
                clearTimeout(iTimeout);

                return vResult;
            }),
            pTimeoutPromise
        ]);
    }

    return {
        promisify: ushellUtils.promisify,
        waitForEventHubEvent,
        waitForEventHubEvents,
        onError,
        createLogMock,
        restoreSpies,
        getOwnScriptDirectory,
        prettyCdmSiteDeepEqual,
        setObjectValue,
        overrideObject,
        resetConfigChannel,
        registerFakesForRequire,
        clearLocalStorage,
        awaitPromiseOrTimeout
    };
});
